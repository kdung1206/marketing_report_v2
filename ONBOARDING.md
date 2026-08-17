# Handoff — marketing_report_v2 (Livotec & Karofi Marketing Reporting Console)

Repo: `D:\claude-code\marketing_report_v2` — GitHub: `kdung1206/marketing_report_v2` (branch `main`)
Deploy: Vercel + Supabase. Local dev: `npm run dev` → http://localhost:3000

This session built two major features end-to-end: **Digital Ads Report** (paid ads across
Facebook/Google/TikTok) and **Social Report** (organic Facebook Page Insights + TikTok
insights, merged). Everything below is committed and pushed as of commit `3716efc`.

## ⚠️ Read this before touching the repo

**Another Claude Code session may be working in this same repo concurrently.** Throughout
this session, a second session was actively editing `src/server/app.ts` and other files at
the same time — this caused real, reproducible bugs (routes disappearing after a dev-server
restart caught the file mid-edit, HMR "flapping" reload loops). Before you start:
- Run `git log --oneline -5` and `git status` first to see what's actually there right now.
- If a dev server is already running on port 3000 (`netstat -ano | grep 3000`), don't assume
  it has your latest edits — backend route changes (`app.ts`, anything under `src/server/`)
  require a full process restart, not just Vite HMR (HMR only covers frontend `.tsx` files).
- On Windows, `npm run dev` in PowerShell commonly fails with
  `File ... npm.ps1 cannot be loaded because running scripts is disabled` — either run it via
  Git Bash instead, or the user can permanently fix it with (their own machine, one-time):
  `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

## Architecture conventions (already established, keep following them)

- **Dual storage**: every new data domain gets a Supabase relational table (prod,
  `isSupabaseConfigured === true`) AND a plain array inside `src/db_store.json` (local dev,
  via `appStateStore.ts`'s `getDatabaseData`/`saveDatabaseData`). See `facebookStore.ts` as
  the template every later `*Store.ts` file copies.
- **No heavy SDKs.** The previous "Social Report" (YouTube Analytics + Google Ads) was
  ripped out on 2026-08-02 because `googleapis`/`google-ads-api` ballooned the Vercel
  function bundle to ~64MB → intermittent `FUNCTION_INVOCATION_FAILED` in production, not
  caught by local testing. Every integration since (Facebook Graph API, TikTok Ads/Insights)
  uses plain `fetch()` — keep it that way.
- **Vercel Hobby cron jobs fire at most once per day EACH, but a project can have up to 100
  distinct jobs** (verified against https://vercel.com/docs/cron-jobs/usage-and-pricing,
  2026-08-17 — an earlier assumption in this codebase's comments said "2 jobs max", which was
  wrong; fixed in `src/server/app.ts`). Same-cadence syncs still get folded into one route
  (`GET /api/cron/facebook-sync` runs Facebook Page Insights + Facebook Ads + TikTok Insights in
  parallel) purely to avoid near-duplicate entries, not because of a job-count limit. A
  *different*-cadence sync gets its own `vercel.json` entry — see the weekly spreadsheet sync
  (`GET /api/cron/weekly-spreadsheet-sync`, Monday ~12:00 ICT) added 2026-08-17. Hobby also can't
  guarantee exact timing — a cron fires sometime within its scheduled hour, not on the minute.
- **Secrets**: `access_token`/`refresh_token`/etc. are always encrypted with
  `src/server/crypto.ts`'s `encrypt`/`decrypt` (AES-256-CBC, keyed by `ENCRYPTION_KEY`)
  before hitting storage. Never log or return a raw token to the client.
- **Local session token for testing without the login UI**: mint one with
  `node -e "require('dotenv').config({path:'.env.local'}); const c=require('crypto'); const p={username:'admin',name:'Quản trị hệ thống',role:'Admin',exp:Math.floor(Date.now()/1000)+43200,sid:c.randomBytes(12).toString('hex')}; const d=Buffer.from(JSON.stringify(p)).toString('base64url'); console.log(d+'.'+c.createHmac('sha256',process.env.SESSION_SECRET).update(d).digest('base64url'))"`
  then in the browser console: `localStorage.setItem('marketing_auth_token', '<token>'); localStorage.setItem('marketing_current_user', JSON.stringify({username:'admin',name:'Quản trị hệ thống',role:'Admin'})); location.reload()`

## What shipped this session

### 1. Digital Ads Report (paid ads — Facebook/Google/TikTok)
- New tables: `ads_performance`, `fb_ad_accounts` (`supabase/schema.sql`)
- `src/server/adsPerformanceStore.ts`, `src/server/facebookAdsSync.ts` (Marketing API sync,
  chunked backfill for long date ranges, manual backfill via `POST /api/fb-ads/sync-now
  {since, until}`)
- `src/lib/adsImport.ts` — client-side parsers for Google Ads Editor `.csv` (UTF-16LE,
  tab-delimited), TikTok Ads Manager `.xlsx`, and Facebook Ads Manager `.csv`/`.xlsx`
  (clicks derived from spend÷CPC since that export has no raw clicks column — flagged in
  `extra.clicks_are_link_clicks_derived_from_cpc`). All three dedupe/merge same-key rows
  before upload (Google Search ads often share a blank ad name — verified this was silently
  losing ~17% of rows before the fix).
- `src/components/DigitalAdsReport.tsx` — 4 tabs (All channel/Facebook/Google/TikTok),
  paginated campaign table (50 rows/page), common-metric scorecard on the All-channel tab.
- `src/components/AdsUploadAdmin.tsx` — parse → preview (row count/campaigns/date range/
  total spend) → explicit "Xác nhận & Lưu" submit, not auto-upload-on-select.
- Control Panel gained a **"Kết nối nền tảng"** section (was "Kết nối Facebook") with
  Facebook/Google/TikTok sub-tabs grouping all connection/upload UI in one place, plus a
  "Quay lại Báo Cáo" back button (there was previously no way back to the report from
  Control Panel).

### 2. Social Report (organic — Facebook Page Insights + TikTok)
- New tables: `tiktok_accounts`, `tiktok_insights_daily`, `tiktok_posts`
- `src/server/tiktokStore.ts`, `src/server/tiktokSync.ts` — TikTok Display API via Login
  Kit OAuth (NOT a pasted token like Facebook — access_token lives 24h and auto-refreshes,
  refresh_token lives 365 days and then needs the account owner to re-authorize).
- `signOAuthState`/`verifyOAuthState` added to `src/server/auth.ts` — stateless, HMAC-signed
  CSRF state for the OAuth redirect (no server-side session needed between the redirect-out
  and redirect-back, which may hit a different serverless instance).
- `src/components/TiktokAccountsAdmin.tsx` — "Kết nối TikTok" button (real OAuth redirect,
  not a form) under Control Panel → Kết nối nền tảng → TikTok.
- `src/components/SocialReport.tsx` — renamed the old "Facebook Insights" nav tab. Reuses
  `FacebookInsights.tsx` as-is under a Facebook sub-tab (didn't touch its internals — no
  reason to risk regressing working code); new TikTok sub-tab; "Tổng hợp" overview showing
  only what's genuinely comparable between the two platforms (current follower count,
  content count, total engagement) — Facebook has no reach/impressions at Page level
  anymore (Meta retired those metrics) and TikTok's public API has no profile-views
  equivalent, so those are intentionally absent from the combined view.

### 3. TikTok Developer App (in progress, blocking TikTok features)
- **Not yet configured.** `TIKTOK_CLIENT_KEY`/`TIKTOK_CLIENT_SECRET`/`TIKTOK_REDIRECT_URI`
  are documented in `.env.example` but empty — the "Kết nối TikTok" button correctly shows
  a "chưa cấu hình" warning until these are set.
- User is mid-submission on TikTok's App Review form (Production tab, app id
  `767102015617406994`). Guidance already given:
  - Products: **Login Kit only** (not Share Kit/Content Posting/Webhooks/Data Portability)
  - Scopes: **user.info.stats + video.list** only (not user.info.profile;
    user.info.basic is automatic)
  - Platforms: **Web** only
  - `public/terms.html` + `public/privacy.html` created and committed for the required
    ToS/Privacy Policy URLs — **still need the real deployed domain** substituted in
    (e.g. `https://<your-domain>/terms.html`) before submitting the form.
  - Demo video (required upload, mp4/mov ≤50MB) is still outstanding — needs the account
    added as a **Sandbox test user** first (tab next to "Production" in the TikTok
    dashboard), then a screen recording of: Control Panel → Kết nối TikTok → TikTok consent
    screen → redirected back connected → Social Report → TikTok tab showing data.
  - TikTok App Review itself can take TikTok some real time to clear — not something this
    session can shortcut.

## ⚠️ 2026-08-07 update — daily auto-sync was silently 401'ing, now fixed

User reported having to manually click "Đồng bộ ngay" every day. Root cause: the
`GET /api/cron/facebook-sync` route (already built, already scheduled via Vercel Cron
`0 1 * * *`, already fanning out to Facebook Page/Ads + TikTok + YouTube) requires
`CRON_SECRET` to match via `isValidCronRequest` — that env var had **never been set on
Vercel**, so every single daily cron invocation got rejected with 401 and silently did
nothing (no error surfaced anywhere the user would see it). Generated a secret, set it on
Vercel (production) + `.env.local` via Composio, redeployed, then verified by calling the
cron endpoint myself with the correct `Authorization: Bearer <secret>` header — confirmed a
real successful run (2 Facebook Pages, several Facebook Ad Accounts, 2 TikTok accounts with
95/64 videos synced). No code changes were needed — the automation already existed
correctly, it just never had credentials to authenticate itself. See `HANDOFF.md` §7.

## ⚠️ 2026-08-07 update — YouTube added to Social Report, needs Google Cloud OAuth Client

Third leg of Social Report (Facebook + TikTok + now YouTube) shipped: subscriber/video
counts plus per-video views split organic vs. advertising (`insightTrafficSourceType`) —
see `src/server/youtubeSync.ts`/`youtubeStore.ts`, mirrors the TikTok integration's shape.
Supabase tables (`youtube_accounts`/`youtube_insights_daily`/`youtube_videos`) already
created on production via Composio, verified present.

**Not yet usable — needs `YOUTUBE_CLIENT_ID`/`SECRET`/`REDIRECT_URI`** (see `.env.example`
for full Google Cloud Console setup steps). Nobody has created the OAuth Client yet. Once
created:
- Set the 3 env vars in both `.env.local` (local dev) and Vercel Environment Variables
  (production) — same "must exist in both places" pattern TikTok hit earlier this session.
- If the Google Cloud project is under Livotec/Karofi's Google Workspace, set the OAuth
  consent screen User Type to **Internal** — skips Google's review entirely for these
  restricted scopes (`youtube.readonly`, `yt-analytics.readonly`) and avoids the 7-day
  refresh_token expiry "Testing" (External) status apps get. Confirmed this session: the
  Google account intended for this (manages both Karofi and Livotec channels) already has
  "Người quản lý" (Manager) role on both — sufficient for the API, no channel-side
  permission work needed.
- Google Ads API Basic Access (separate application, case `5-7008000041887`) is UNRELATED
  to this — YouTube Analytics needs no developer-token approval process at all, just the
  OAuth Client above.

## ⚠️ 2026-08-07 update — two more TikTok OAuth bugs found while testing live

1. TikTok silently re-authorizes using whatever scopes were granted the FIRST time an
   account approved this app, skipping the consent screen on later logins — a scope added
   afterwards (`video.list`, `user.info.stats`) never reaches an already-connected account
   for approval. Fixed by adding `disable_auto_auth: "1"` to the `/v2/auth/authorize/`
   params in `oauth/start` (app.ts) — confirmed via TikTok's own docs
   (developers.tiktok.com/doc/login-kit-web) that this forces the consent screen every time.
   Already-connected test accounts still need the app's access revoked from their TikTok
   account settings once (Cài đặt → Bảo mật và quyền → Ứng dụng đã kết nối) to clear the old
   partial grant — new/never-connected accounts don't need this.
2. `fetchUserInfo`'s field list (`tiktokSync.ts`) asked for `username`, which requires the
   `user.info.profile` scope — never requested by this app. TikTok rejects the WHOLE
   `user/info` call if ANY requested field needs an ungranted scope, so this made every
   account fail with "the user did not authorize the scope required", even ones that granted
   every scope the app actually asked for. Removed `username` from the field list;
   `display_name` (covered by `user.info.basic`) is enough to label the account.

Also fixed: the OAuth callback's redirect landed on the report dashboard instead of back on
Control Panel → Kết nối nền tảng → TikTok, since `activeTab` isn't persisted like
`controlPanelSection` is. App.tsx now reads the existing `tiktokConnected=1` marker on mount
to restore that view.

## ⚠️ 2026-08-07 update — TikTok using SANDBOX credentials, not Production

While testing the OAuth round-trip, TikTok rejected the Production `client_key` with
`error=unauthorized_client&error_type=client_key` — Production and Sandbox app modes have
**separate, non-interchangeable Client Key/Secret pairs** on TikTok's side, and only Sandbox
target users (`livotecvn`, `karofi.official`) can log in before App Review clears.

`TIKTOK_CLIENT_KEY`/`TIKTOK_CLIENT_SECRET` are now temporarily set to the **Sandbox**
values in both `.env.local` and Vercel Production env vars (updated via Composio, comment
left on each Vercel var noting this is temporary). `TIKTOK_REDIRECT_URI` did NOT change —
same value works for both modes.

**Production values to restore once TikTok approves the app** (do not lose these):
- `TIKTOK_CLIENT_KEY=aw5pxzr4w92ou5of`
- `TIKTOK_CLIENT_SECRET=xhkICqxnXbAPvNjV8RVe9AMHThE2LQ2A`

Also fixed same session: `.env.local` had two conflicting `TIKTOK_REDIRECT_URI` lines
(duplicate key, dotenv silently picks one) — trimmed back to the localhost-only line, since
the production value belongs in Vercel env vars, not `.env.local`.

Also same session: `tiktok_accounts`/`tiktok_insights_daily`/`tiktok_posts` did not exist
yet on production Supabase (added when the TikTok feature shipped, but schema.sql was never
re-run there) — this caused `GET /api/tiktok/accounts` to 500. Applied via Composio
(`SUPABASE_APPLY_A_MIGRATION`), verified present. If setting up a **new** Supabase project
from scratch, `supabase/schema.sql` already has these tables — no action needed there.

Also same session: merged in the OAuth PKCE fix (`code_challenge`/`code_verifier`) that was
sitting as an uncommitted local commit from a concurrent session — TikTok's v2 authorize
endpoint now hard-requires PKCE. Verified `tsc --noEmit` + `esbuild` bundle clean before
pushing; merged with `--no-edit` (no conflicts, disjoint files) rather than rebasing, to
avoid rewriting a commit another session might still reference locally.

## Next steps for whoever picks this up

1. Get the real Vercel domain from the user, drop it into the ToS/Privacy URLs on the
   TikTok form.
2. Help record/guide the demo video if asked.
3. Once `TIKTOK_CLIENT_KEY`/`SECRET`/`REDIRECT_URI` exist (sandbox is enough to start
   testing before App Review clears), verify the OAuth round-trip for real — everything up
   to that point was verified via signed-state unit test + route-level curl checks only,
   since no real TikTok app existed yet this session.
4. Same env vars need to go into **Vercel Environment Variables** (not just `.env.local`)
   before production works — `TIKTOK_REDIRECT_URI` on Vercel must be the real domain, not
   `localhost:3000`.
5. Everything else (Digital Ads Report, Control Panel reorg) is fully built, verified
   against real uploaded/synced data, and shipped — no known open items there.
