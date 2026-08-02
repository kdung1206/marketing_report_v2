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
