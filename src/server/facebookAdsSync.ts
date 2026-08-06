// ---------------------------------------------------------------------------
// Pulls paid-ads campaign performance from the Facebook Marketing API for
// every active row in fb_ad_accounts and upserts the results into
// ads_performance (see adsPerformanceStore.ts). Called from
// POST /api/fb-ads/sync-now (manual, Admin) and GET /api/cron/facebook-ads-sync
// (daily, Vercel Cron) in app.ts.
//
// This is a DIFFERENT Graph API surface than facebookSync.ts's Page Insights
// pull: it queries an ad account (act_<id>) with a Marketing API token
// (ads_read permission), not a Page with a Page token — the two tokens are
// not interchangeable, which is why fb_ad_accounts is a separate config table
// from fb_pages. The error-handling conventions (GraphApiError, code-190 =
// dead token, per-page-of-results resilience) are shared with facebookSync.ts
// on purpose — same API, same failure modes.
// ---------------------------------------------------------------------------
import { decrypt } from "./crypto";
import { graphGet, isTokenInvalidError, toDateStr, GraphApiError, TokenStatus } from "./facebookSync";
import {
  getFbAdAccounts,
  upsertAdsPerformance,
  setFbAdAccountSyncStatus,
  AdsPerformanceRow,
} from "./adsPerformanceStore";

// Ads insights (unlike Page Insights) don't get revised as aggressively after
// the fact, but Meta still attributes some conversions/actions with a delay —
// re-pulling a rolling window keeps those numbers current without tracking a
// per-account sync cursor, same reasoning as facebookSync.ts's
// INSIGHTS_BACKFILL_DAYS. This is the default for the unattended daily cron
// only — a manual run (POST /api/fb-ads/sync-now) can override {since, until}
// for one-off historical backfills (e.g. "from Jan 1st"), see
// runFacebookAdsSync's overrides param.
const ADS_BACKFILL_DAYS = 30;

// Facebook's own guidance for level=ad + time_increment=1 (per-day breakdown)
// is to keep each request's range modest — a full year in one call risks a
// timeout or an oversized response for an account with many ads. Long manual
// backfills are therefore split into 90-day chunks and fetched/upserted one
// chunk at a time (each chunk still paginates internally via paging.next) —
// slower, but every chunk that succeeds is saved even if a later one fails.
const MAX_CHUNK_DAYS = 90;

function dateRangeChunks(since: string, until: string): { since: string; until: string }[] {
  const chunks: { since: string; until: string }[] = [];
  let chunkStart = new Date(`${since}T00:00:00Z`);
  const end = new Date(`${until}T00:00:00Z`);
  while (chunkStart <= end) {
    const chunkEnd = new Date(chunkStart.getTime() + (MAX_CHUNK_DAYS - 1) * 24 * 60 * 60 * 1000);
    if (chunkEnd > end) chunkEnd.setTime(end.getTime());
    chunks.push({ since: toDateStr(chunkStart), until: toDateStr(chunkEnd) });
    chunkStart = new Date(chunkEnd.getTime() + 24 * 60 * 60 * 1000);
  }
  return chunks;
}

const INSIGHTS_FIELDS = [
  "campaign_name",
  "adset_name",
  "ad_name",
  "spend",
  "impressions",
  "reach",
  "frequency",
  "clicks",
  "actions",
  "video_play_actions",
].join(",");

// Action types (from the `actions` breakdown) that count as a "conversion"
// for this report — matches the "Leads" KPI used elsewhere (Facebook tab).
// Summed rather than picking one, since an ad can report both depending on
// how its lead objective/pixel is configured.
const CONVERSION_ACTION_TYPES = new Set(["lead", "onsite_conversion.lead_grouped"]);

function sumActionValues(actions: Array<{ action_type: string; value: string }> | undefined, types: Set<string>): number {
  if (!Array.isArray(actions)) return 0;
  return actions
    .filter((a) => types.has(a.action_type))
    .reduce((sum, a) => sum + (Number(a.value) || 0), 0);
}

function sumAllActionValues(actions: Array<{ value: string }> | undefined): number {
  if (!Array.isArray(actions)) return 0;
  return actions.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
}

async function fetchAdAccountInsights(
  adAccountId: string,
  accessToken: string,
  since: string,
  until: string,
  brand: string | null,
  tokenStatus: TokenStatus
): Promise<AdsPerformanceRow[]> {
  const rows: AdsPerformanceRow[] = [];
  const timeRange = encodeURIComponent(JSON.stringify({ since, until }));

  let body: any;
  try {
    body = await graphGet(
      `/${adAccountId}/insights?level=ad&time_increment=1&time_range=${timeRange}&fields=${INSIGHTS_FIELDS}&limit=500`,
      accessToken
    );
  } catch (err: any) {
    if (isTokenInvalidError(err)) tokenStatus.invalid = true;
    throw err;
  }

  // Graph API insights paginate via a fully-formed `paging.next` URL (access
  // token already embedded) — fetched directly rather than through graphGet,
  // which always appends its own access_token param.
  while (body) {
    for (const item of body.data || []) {
      if (!item.date_start || !item.campaign_name) continue;
      rows.push({
        channel: "facebook",
        brand,
        campaign_name: item.campaign_name,
        ad_group_name: item.adset_name || "",
        ad_name: item.ad_name || "",
        date: String(item.date_start).slice(0, 10),
        spend: item.spend != null ? Number(item.spend) : null,
        impressions: item.impressions != null ? Number(item.impressions) : null,
        clicks: item.clicks != null ? Number(item.clicks) : null,
        reach: item.reach != null ? Number(item.reach) : null,
        frequency: item.frequency != null ? Number(item.frequency) : null,
        video_views: item.video_play_actions ? sumAllActionValues(item.video_play_actions) : null,
        conversions: sumActionValues(item.actions, CONVERSION_ACTION_TYPES),
        extra: {},
      });
    }

    const nextUrl = body.paging?.next;
    if (!nextUrl) break;
    try {
      const res = await fetch(nextUrl);
      body = await res.json();
      if (!res.ok || body?.error) {
        throw new GraphApiError(
          body?.error?.message || `Graph API trả về lỗi HTTP ${res.status}`,
          body?.error?.code,
          body?.error?.error_subcode
        );
      }
    } catch (err: any) {
      if (isTokenInvalidError(err)) tokenStatus.invalid = true;
      console.error(`Facebook Ads insights (paging, ${adAccountId}) lỗi:`, err.message || err);
      break; // partial data already collected is still worth keeping
    }
  }

  return rows;
}

export interface FacebookAdsSyncResult {
  ad_account_id: string;
  account_name: string;
  ok: boolean;
  rows_synced?: number;
  error?: string;
}

export async function runFacebookAdsSync(overrides?: { since?: string; until?: string }): Promise<FacebookAdsSyncResult[]> {
  const accounts = (await getFbAdAccounts()).filter((a) => a.is_active);
  const results: FacebookAdsSyncResult[] = [];

  const now = new Date();
  const until = overrides?.until || toDateStr(now);
  const since = overrides?.since || toDateStr(new Date(now.getTime() - ADS_BACKFILL_DAYS * 24 * 60 * 60 * 1000));
  const chunks = dateRangeChunks(since, until);

  for (const account of accounts) {
    const tokenStatus: TokenStatus = { invalid: false };
    let rowsSynced = 0;
    try {
      const accessToken = decrypt(account.access_token_encrypted);
      if (!accessToken) throw new Error("Access token trống hoặc giải mã thất bại.");

      // Each chunk is saved as soon as it's fetched — a failure on a later
      // chunk (rate limit, transient API error) still keeps everything
      // fetched so far instead of losing the whole backfill.
      for (const chunk of chunks) {
        const rows = await fetchAdAccountInsights(
          account.ad_account_id,
          accessToken,
          chunk.since,
          chunk.until,
          account.brand,
          tokenStatus
        );
        if (rows.length > 0) await upsertAdsPerformance(rows);
        rowsSynced += rows.length;
      }

      await setFbAdAccountSyncStatus(account.ad_account_id, {
        last_synced_at: new Date().toISOString(),
        last_sync_error: null,
        token_expired: tokenStatus.invalid,
      });
      results.push({ ad_account_id: account.ad_account_id, account_name: account.account_name, ok: true, rows_synced: rowsSynced });
    } catch (err: any) {
      const message = err?.message || String(err);
      console.error(`Đồng bộ Facebook Ads thất bại cho ${account.ad_account_id}:`, message);
      await setFbAdAccountSyncStatus(account.ad_account_id, { last_sync_error: message, token_expired: tokenStatus.invalid }).catch(() => {});
      results.push({ ad_account_id: account.ad_account_id, account_name: account.account_name, ok: false, rows_synced: rowsSynced, error: message });
    }
  }

  return results;
}
