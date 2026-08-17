-- Run this once in the Supabase project's SQL Editor (Dashboard > SQL Editor > New query).
-- Creates the single table the app uses as its shared database.
--
-- Storage model: one JSONB blob per "app instance" (id = 'main'), mirroring
-- the old src/db_store.json shape (digital_marketing, kol_koc, btl_trade,
-- monthly_ooh_pr, btl_trade_monthly, comments, active_state, mail_config,
-- users). This keeps the migration a storage-layer swap instead of a full
-- relational redesign; splitting into normalized tables can be a later step
-- if/when query needs grow beyond "read/write the whole document".

create table if not exists app_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- The Express/Vercel API always uses the SERVICE ROLE key (server-side only,
-- never shipped to the browser), which bypasses Row Level Security entirely.
-- RLS is enabled anyway as defense in depth: if the anon/public key ever leaks
-- or gets used by mistake, no client can read or write this table directly.
alter table app_state enable row level security;

-- ---------------------------------------------------------------------------
-- POST /api/login rate limiting. Keyed by "<ip>|<username>" so a distributed
-- attack against one account and a single attacker guessing many accounts are
-- both bounded. Must live in Supabase (not process memory): Vercel serverless
-- functions don't share memory across invocations/instances, so an in-memory
-- counter would silently reset on every cold start and give no real protection.
-- ---------------------------------------------------------------------------
create table if not exists login_attempts (
  key text primary key,
  fail_count int not null default 0,
  window_started_at timestamptz not null default now(),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table login_attempts enable row level security;

-- Atomically bumps the failure counter for `p_key`, starting a fresh
-- p_window_seconds window if the previous one has expired, and sets
-- locked_until once fail_count reaches p_max_attempts. Runs server-side via
-- SECURITY DEFINER + row lock (`for update`) so concurrent requests for the
-- same key (e.g. two serverless instances) can't race past the threshold.
create or replace function record_login_failure(
  p_key text,
  p_window_seconds int,
  p_max_attempts int,
  p_lockout_seconds int
) returns table(fail_count int, locked_until timestamptz)
language plpgsql
security definer
as $$
declare
  row_rec login_attempts%rowtype;
begin
  select * into row_rec from login_attempts where key = p_key for update;

  if not found then
    insert into login_attempts (key, fail_count, window_started_at, updated_at)
    values (p_key, 1, now(), now())
    returning * into row_rec;
  elsif row_rec.window_started_at < now() - make_interval(secs => p_window_seconds) then
    update login_attempts
      set fail_count = 1, window_started_at = now(), locked_until = null, updated_at = now()
      where key = p_key
      returning * into row_rec;
  else
    update login_attempts
      set fail_count = row_rec.fail_count + 1,
          updated_at = now(),
          locked_until = case
            when row_rec.fail_count + 1 >= p_max_attempts then now() + make_interval(secs => p_lockout_seconds)
            else row_rec.locked_until
          end
      where key = p_key
      returning * into row_rec;
  end if;

  return query select row_rec.fail_count, row_rec.locked_until;
end;
$$;

-- Called on a successful login so a legitimate sign-in immediately clears any
-- accumulated failures instead of leaving them to expire with the window.
create or replace function reset_login_attempts(p_key text)
returns void
language sql
security definer
as $$
  delete from login_attempts where key = p_key;
$$;

-- ---------------------------------------------------------------------------
-- Login audit log — every POST /api/login attempt, success or failure.
-- created_at is the single source of truth for "when": stored as timestamptz
-- (always UTC internally in Postgres), and the admin UI renders both the UTC
-- value and the viewing browser's own local time from that same instant —
-- storing a separate "local time" column would be meaningless server-side
-- (local to which timezone? the server's, which isn't anyone's local time in
-- a serverless deployment).
-- ---------------------------------------------------------------------------
create table if not exists login_logs (
  id bigint generated always as identity primary key,
  username text not null,
  status text not null check (status in ('success', 'failure')),
  ip text,
  user_agent text,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists login_logs_created_at_idx on login_logs (created_at desc);
create index if not exists login_logs_username_idx on login_logs (username);

alter table login_logs enable row level security;

-- ---------------------------------------------------------------------------
-- User action log — records mutating requests (save/sync/reset/etc.) so
-- activity can be audited per account. Admin reads all rows; every other
-- role is restricted to its own username — enforced in src/server/app.ts
-- (GET /api/action-logs), not here, since the API always uses the service
-- role key and RLS is defense-in-depth only (see app_state's comment above).
-- ---------------------------------------------------------------------------
create table if not exists action_logs (
  id bigint generated always as identity primary key,
  username text not null,
  role text,
  action text not null,
  details text,
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists action_logs_created_at_idx on action_logs (created_at desc);
create index if not exists action_logs_username_idx on action_logs (username);

alter table action_logs enable row level security;

-- ---------------------------------------------------------------------------
-- Facebook Page Insights module (src/server/facebookSync.ts). Deliberately
-- normal relational tables, not another field in app_state's JSONB blob:
-- this is time-series data that grows daily/per-post forever and needs
-- date-range queries, unlike the report document which is read/written as a
-- whole. access_token_encrypted uses the same AES-256-CBC helper
-- (src/server/crypto.ts) as mail_config.smtp_pass.
-- ---------------------------------------------------------------------------
create table if not exists fb_pages (
  page_id text primary key,
  page_name text not null,
  -- Which weekly-report brand this page belongs to (see the app's
  -- Livotec/Karofi selectedBrand toggle) — lets the Facebook Insights tab
  -- filter to the currently selected brand, same as the main report.
  brand text,
  access_token_encrypted text not null,
  is_active boolean not null default true,
  last_synced_at timestamptz,
  last_sync_error text,
  -- True only once Facebook explicitly confirms the token is dead
  -- (OAuthException code 190) — see facebookSync.ts's isTokenInvalidError.
  -- A transient sync failure (network blip, temporary API error, or the
  -- cron simply not having run yet) never sets this; the page stays
  -- connected and sync keeps retrying with the same token indefinitely.
  token_expired boolean not null default false,
  -- Refreshed from the Graph API's debug_token on every sync (facebookSync.ts's
  -- fetchTokenExpiry) so the Control Panel can warn *before* a token dies,
  -- rather than only after token_expired above flips. Either deadline being
  -- null means "no deadline of that kind" (a Page token derived from a
  -- long-lived User Token normally has neither); token_checked_at null means
  -- the probe hasn't succeeded yet, i.e. the deadlines are simply unknown.
  token_expires_at timestamptz,
  token_data_access_expires_at timestamptz,
  token_checked_at timestamptz,
  created_at timestamptz not null default now()
);

-- Existing projects created before the token-expiry warning shipped.
alter table fb_pages add column if not exists token_expires_at timestamptz;
alter table fb_pages add column if not exists token_data_access_expires_at timestamptz;
alter table fb_pages add column if not exists token_checked_at timestamptz;

alter table fb_pages enable row level security;

-- One row per page per day. Upserted on (page_id, date) so a rolling
-- backfill window (see runFacebookSync) can safely re-write recent days
-- without creating duplicates.
create table if not exists fb_insights_daily (
  page_id text not null references fb_pages(page_id) on delete cascade,
  date date not null,
  impressions int,
  impressions_paid int,
  reach int,
  reach_paid int,
  page_views int,
  fan_count int,
  fan_adds int,
  fan_removes int,
  engaged_users int,
  primary key (page_id, date)
);

alter table fb_insights_daily enable row level security;

create table if not exists fb_posts (
  post_id text primary key,
  page_id text not null references fb_pages(page_id) on delete cascade,
  created_time timestamptz not null,
  message text,
  permalink text,
  thumbnail_url text,
  reach int,
  impressions int,
  engaged_users int,
  clicks int,
  likes int,
  loves int,
  wows int,
  hahas int,
  sorrys int,
  angers int,
  comments int,
  shares int,
  synced_at timestamptz not null default now()
);

create index if not exists fb_posts_page_id_created_time_idx on fb_posts (page_id, created_time desc);

alter table fb_posts enable row level security;

-- ---------------------------------------------------------------------------
-- Digital Ads Report module (src/server/adsPerformanceStore.ts,
-- src/server/facebookAdsSync.ts, src/components/DigitalAdsReport.tsx).
-- Paid-ads campaign performance across Facebook/Google/TikTok — separate from
-- fb_pages/fb_insights_daily above, which is organic Page Insights, not ads.
--
-- fb_ad_accounts is the Marketing-API counterpart of fb_pages: a Facebook
-- Marketing API token (ads_read permission, scoped to an ad account act_<id>)
-- is a DIFFERENT credential than a Page Insights token, so it gets its own
-- config table rather than reusing fb_pages. Same encrypted-token/is_active/
-- last_synced_at/token_expired shape for consistency with that table.
-- ---------------------------------------------------------------------------
create table if not exists fb_ad_accounts (
  ad_account_id text primary key, -- e.g. "act_1234567890"
  account_name text not null,
  brand text,
  access_token_encrypted text not null,
  is_active boolean not null default true,
  last_synced_at timestamptz,
  last_sync_error text,
  token_expired boolean not null default false,
  created_at timestamptz not null default now()
);

alter table fb_ad_accounts enable row level security;

-- One row per channel/campaign/ad group/ad/day. Upserted on the composite key
-- below so a re-upload (Google/TikTok) or a re-sync (Facebook) safely
-- overwrites just the matching rows instead of duplicating or requiring a
-- separate "replace by date range" step.
create table if not exists ads_performance (
  channel text not null check (channel in ('facebook', 'google', 'tiktok')),
  brand text,
  campaign_name text not null,
  ad_group_name text not null default '', -- ad set (FB) / ad group (Google, TikTok)
  ad_name text not null default '',
  date date not null,
  spend numeric,
  impressions bigint,
  clicks bigint,
  reach bigint, -- null for Google (not present in that export)
  frequency numeric, -- null for Google
  video_views bigint, -- TrueView views / video plays at 50% / 6s views — approximate, not identical definitions across channels
  conversions int, -- Leads (FB) / Conversions (TikTok, Google)
  extra jsonb not null default '{}'::jsonb, -- channel-specific leftovers (campaign_type, post_engagements, ...)
  updated_at timestamptz not null default now(),
  primary key (channel, campaign_name, ad_group_name, ad_name, date)
);

create index if not exists ads_performance_channel_date_idx on ads_performance (channel, date);
create index if not exists ads_performance_brand_date_idx on ads_performance (brand, date);

alter table ads_performance enable row level security;

-- ---------------------------------------------------------------------------
-- TikTok organic insights (src/server/tiktokSync.ts) — merges with Facebook
-- Page Insights into the "Social Report" tab (src/components/SocialReport
-- or wherever it lands in App.tsx). Same fb_pages/fb_insights_daily/fb_posts
-- shape as Facebook Page Insights above, with one structural difference:
-- TikTok's Display API is OAuth (Login Kit), not a static pasted token —
-- access_token lives 24h and auto-refreshes, but refresh_token itself
-- expires after 365 days and requires the account owner to click through
-- TikTok's consent screen again (see /api/tiktok/oauth/start in app.ts).
-- token_expired here means that re-auth, specifically — the refresh_token
-- itself no longer works, not just a transient API error.
-- ---------------------------------------------------------------------------
create table if not exists tiktok_accounts (
  open_id text primary key,
  username text,
  display_name text,
  brand text,
  access_token_encrypted text not null,
  refresh_token_encrypted text not null,
  access_token_expires_at timestamptz not null,
  refresh_token_expires_at timestamptz not null,
  is_active boolean not null default true,
  last_synced_at timestamptz,
  last_sync_error text,
  token_expired boolean not null default false,
  created_at timestamptz not null default now()
);

alter table tiktok_accounts enable row level security;

-- TikTok's public API has no historical follower series (unlike video
-- stats) — only a current snapshot via GET user/info. One row per account
-- per day, same "snapshot today's value" convention as fb_insights_daily's
-- fan_count column.
create table if not exists tiktok_insights_daily (
  open_id text not null references tiktok_accounts(open_id) on delete cascade,
  date date not null,
  follower_count int,
  following_count int,
  likes_count int,
  video_count int,
  primary key (open_id, date)
);

alter table tiktok_insights_daily enable row level security;

create table if not exists tiktok_posts (
  video_id text primary key,
  open_id text not null references tiktok_accounts(open_id) on delete cascade,
  create_time timestamptz not null,
  title text,
  cover_image_url text,
  share_url text,
  view_count int,
  like_count int,
  comment_count int,
  share_count int,
  synced_at timestamptz not null default now()
);

create index if not exists tiktok_posts_open_id_create_time_idx on tiktok_posts (open_id, create_time desc);

alter table tiktok_posts enable row level security;

-- ---------------------------------------------------------------------------
-- YouTube organic insights (src/server/youtubeSync.ts) — Data API v3 +
-- Analytics API v2, OAuth (not a static pasted token, same shape as
-- tiktok_accounts above). Unlike TikTok, Google does not expire the
-- refresh_token on a fixed schedule, so there is no refresh_token_expires_at
-- column here — token_expired is set only when a refresh attempt itself
-- fails (revoked/invalid_grant).
-- ---------------------------------------------------------------------------
create table if not exists youtube_accounts (
  channel_id text primary key,
  channel_title text,
  brand text,
  access_token_encrypted text not null,
  refresh_token_encrypted text not null,
  access_token_expires_at timestamptz not null,
  is_active boolean not null default true,
  last_synced_at timestamptz,
  last_sync_error text,
  token_expired boolean not null default false,
  created_at timestamptz not null default now()
);

alter table youtube_accounts enable row level security;

-- One row per channel per day, same "snapshot today's value" convention as
-- tiktok_insights_daily/fb_insights_daily.
create table if not exists youtube_insights_daily (
  channel_id text not null references youtube_accounts(channel_id) on delete cascade,
  date date not null,
  subscriber_count int,
  view_count int,
  video_count int,
  primary key (channel_id, date)
);

alter table youtube_insights_daily enable row level security;

-- Latest cumulative snapshot per video (overwritten every sync, no date
-- dimension) — same convention as tiktok_posts. organic_views/
-- advertising_views split via insightTrafficSourceType; views is their sum.
create table if not exists youtube_videos (
  video_id text primary key,
  channel_id text not null references youtube_accounts(channel_id) on delete cascade,
  published_at timestamptz not null,
  title text,
  thumbnail_url text,
  views int,
  organic_views int,
  advertising_views int,
  synced_at timestamptz not null default now()
);

create index if not exists youtube_videos_channel_id_published_at_idx on youtube_videos (channel_id, published_at desc);

alter table youtube_videos enable row level security;
