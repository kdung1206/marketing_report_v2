// ---------------------------------------------------------------------------
// Shared shapes for the Social Report module. Everything here lives inside
// the single app_state blob (store.social_report), same pattern as
// mail_config/comments/active_state in app.ts — no separate Supabase table.
// ---------------------------------------------------------------------------

export type SocialPlatform = "youtube"; // more platforms (tiktok/facebook/instagram) can join this union later

// One row per (videoId, snapshotDate). Cumulative-since-published numbers, as
// YouTube Analytics itself reports them — NOT a weekly figure. The weekly
// delta is computed on read (see syncEngine.computeWeeklyReport), never
// stored, so there is exactly one source of truth per snapshot.
//
// Deliberately no "reach" field: YouTube Analytics' unique-viewer metrics are
// only reliable over rolling ~28-day windows, not an arbitrary
// since-published range, so a lifetime cumulative "reach" isn't something the
// API can honestly give us per video. Views + impressions are what's tracked.
export interface OrganicSnapshot {
  platform: SocialPlatform;
  videoId: string;
  title: string;
  videoUrl: string;
  publishedAt: string; // ISO date
  snapshotDate: string; // ISO date (yyyy-mm-dd) — the day this pull ran
  viewsCumulative: number; // total views, all traffic sources
  organicViewsCumulative: number; // views where insightTrafficSourceType != ADVERTISING
  impressionsCumulative: number; // thumbnail impressions (video dimension only, not split by traffic source)
}

// One row per (videoId, weekEnding) — a genuinely periodic figure pulled
// straight from the Google Ads API for that date range, not a cumulative
// value needing a delta (Ads reporting is already period-scoped).
export interface PaidSpendRow {
  platform: SocialPlatform;
  videoId: string;
  weekEnding: string; // ISO date — end of the 7-day window this spend covers
  spend: number; // currency units (micros already divided down)
  currency: string;
  impressions: number;
}

export interface GoogleOAuthTokenRecord {
  refreshTokenEnc: string;
  scope: string;
  connectedAt: string;
  connectedBy: string; // username of the Admin who completed the OAuth flow
}

export interface SocialReportState {
  oauth?: {
    google?: GoogleOAuthTokenRecord;
  };
  snapshots: OrganicSnapshot[];
  paidSpend: PaidSpendRow[];
  lastSyncedAt: string | null;
  lastSyncLog: string[];
}

export function emptySocialReportState(): SocialReportState {
  return { snapshots: [], paidSpend: [], lastSyncedAt: null, lastSyncLog: [] };
}

// Computed row returned to the frontend by GET /api/social-report/data —
// each OrganicSnapshot enriched with its weekly delta and matched spend.
export interface WeeklyReportRow extends OrganicSnapshot {
  weeklyViews: number;
  weeklyOrganicViews: number;
  weeklyImpressions: number;
  weekSpend: number;
  spendYtd: number;
  hasAds: boolean;
}
