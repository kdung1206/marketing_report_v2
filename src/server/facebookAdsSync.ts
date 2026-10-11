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
  upsertAdCreatives,
  setFbAdAccountSyncStatus,
  AdsPerformanceRow,
  AdCreativeRow,
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
  "ad_id",
  "campaign_id",
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

function sumActionValues(actions: Array<{ action_type: string; value: string }> | undefined, types: Set<string>): number {
  if (!Array.isArray(actions)) return 0;
  return actions
    .filter((a) => types.has(a.action_type))
    .reduce((sum, a) => sum + (Number(a.value) || 0), 0);
}

// Meta reports the SAME lead twice in `actions`: `lead` (the total) and
// `onsite_conversion.lead_grouped` (a grouped view of the on-platform ones).
// This used to SUM them, doubling every lead — confirmed on production data:
// all 149 Facebook rows with leads > 0 held an even number (0 odd), which
// can't happen by chance. Take the larger of the two instead: `lead` when
// present, `lead_grouped` alone only for ads that report just that one.
function leadCount(actions: Array<{ action_type: string; value: string }> | undefined): { leads: number; lead: number; lead_grouped: number } {
  const lead = sumActionValues(actions, new Set(["lead"]));
  const lead_grouped = sumActionValues(actions, new Set(["onsite_conversion.lead_grouped"]));
  return { leads: Math.max(lead, lead_grouped), lead, lead_grouped };
}

function sumAllActionValues(actions: Array<{ value: string }> | undefined): number {
  if (!Array.isArray(actions)) return 0;
  return actions.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
}

// Maps ad_id -> the underlying Page post ID ("{page_id}_{post_id}", same
// format facebookSync.ts's fetchRecentPosts stores in fb_posts.post_id) for
// every ad in the account whose creative is a "boosted" existing post
// (object_story_id/effective_object_story_id set). Ads built from a
// dedicated creative — not tied to any organic post — simply have no entry
// here, which is correct: there's nothing organic to combine them with.
// Fetched once per account per sync (not per date-chunk) since it barely
// changes day to day and every chunk would otherwise refetch it.
async function fetchAdPostMap(adAccountId: string, accessToken: string, tokenStatus: TokenStatus): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let body: any;
  try {
    body = await graphGet(`/${adAccountId}/ads?fields=id,creative{effective_object_story_id}&limit=500`, accessToken);
  } catch (err: any) {
    if (isTokenInvalidError(err)) tokenStatus.invalid = true;
    console.error(`Facebook Ads → post map (${adAccountId}) lỗi:`, err.message || err);
    return map; // non-fatal — sync continues, rows just won't have post_id
  }

  while (body) {
    for (const item of body.data || []) {
      const postId = item.creative?.effective_object_story_id;
      if (item.id && postId) map.set(item.id, postId);
    }
    const nextUrl = body.paging?.next;
    if (!nextUrl) break;
    try {
      const res = await fetch(nextUrl);
      body = await res.json();
      if (!res.ok || body?.error) break;
    } catch {
      break;
    }
  }
  return map;
}

// Maps ad_id -> a creative image URL, for the Digital Ads Report's Top Ads
// cards (previously always a placeholder: nothing in this sync ever asked
// Meta for the creative image). `thumbnail_url` works for image AND video ads
// but Meta serves it at 64x64 unless asked for a size, hence the first attempt
// requests 640x640 via the field-expansion size modifiers (confirmed accepted
// by Meta on production: stored URLs carry `p480x480`/sized crops). It is
// preferred over `image_url`, which is the original upload — up to ~1.6MB per
// card, 8 cards per gallery. If Meta rejects the modifiers the second attempt
// asks for the plain fields, so a wrong guess costs resolution, never the whole
// map. Deliberately a SEPARATE request from
// fetchAdPostMap: a failure here must never lose the post_id mapping.
// Signed CDN URLs do expire eventually; the daily cron re-pulls them for the
// rolling window, and the UI falls back to the placeholder on a dead image.
async function fetchAdThumbnailMap(adAccountId: string, accessToken: string, tokenStatus: TokenStatus): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const attempts = [
    `/${adAccountId}/ads?fields=id,creative.thumbnail_width(640).thumbnail_height(640){image_url,thumbnail_url}&limit=500`,
    `/${adAccountId}/ads?fields=id,creative{image_url,thumbnail_url}&limit=500`,
  ];

  for (const path of attempts) {
    let body: any;
    try {
      body = await graphGet(path, accessToken);
    } catch (err: any) {
      if (isTokenInvalidError(err)) {
        tokenStatus.invalid = true;
        return map;
      }
      console.error(`Facebook Ads → thumbnail map (${adAccountId}) lỗi:`, err.message || err);
      continue; // try the simpler field list
    }

    while (body) {
      for (const item of body.data || []) {
        const url = item.creative?.thumbnail_url || item.creative?.image_url;
        if (item.id && url) map.set(item.id, url);
      }
      const nextUrl = body.paging?.next;
      if (!nextUrl) break;
      try {
        const res = await fetch(nextUrl);
        body = await res.json();
        if (!res.ok || body?.error) break;
      } catch {
        break;
      }
    }
    return map;
  }
  return map;
}

async function fetchAdAccountInsights(
  adAccountId: string,
  accessToken: string,
  since: string,
  until: string,
  brand: string | null,
  tokenStatus: TokenStatus,
  adPostMap: Map<string, string>,
  adThumbnailMap: Map<string, string>,
  savePage: (rows: AdsPerformanceRow[], creatives: AdCreativeRow[]) => Promise<void>
): Promise<number> {
  let total = 0;
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
    const rows: AdsPerformanceRow[] = [];
    // One image per ad (not per daily row) — see ad_creatives in schema.sql.
    const creatives = new Map<string, AdCreativeRow>();
    for (const item of body.data || []) {
      if (!item.date_start || !item.campaign_name) continue;
      const leads = leadCount(item.actions);
      const thumbnail = item.ad_id ? adThumbnailMap.get(item.ad_id) : undefined;
      if (item.ad_id && thumbnail) creatives.set(item.ad_id, { ad_id: item.ad_id, thumbnail_url: thumbnail });
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
        conversions: leads.leads,
        // Only set when this ad boosts an existing Page post — see
        // fetchAdPostMap above. Lets the same post's paid spend/reach be
        // joined against its organic row in fb_posts (post_id there is the
        // same "{page_id}_{post_id}" string).
        post_id: item.ad_id ? adPostMap.get(item.ad_id) || null : null,
        // ad_id/campaign_id are exactly what this account's ads put in their
        // UTM tags ({{ad.id}} → GA4 sessionManualAdContent, {{campaign.id}} →
        // sessionCampaignName — confirmed against live GA4 data), so keeping
        // them is what lets web time-on-page be matched back to each ad.
        // lead_actions keeps Meta's raw lead/lead_grouped values for auditing
        // the Leads definition (see leadCount).
        extra: {
          ad_id: item.ad_id || null,
          campaign_id: item.campaign_id || null,
          lead_actions: { lead: leads.lead, lead_grouped: leads.lead_grouped },
        },
      });
    }

    // Saved page by page, not after the whole account has been downloaded: the
    // request runs under a hard function time limit, and a big account that got
    // cut off mid-download used to save NOTHING (no rows, no error) — that is
    // what left "Livotec - Ngành 1" stale for days. Partial progress now sticks.
    if (rows.length > 0) await savePage(rows, Array.from(creatives.values()));
    total += rows.length;

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
      break; // pages already saved above are still worth keeping
    }
  }

  return total;
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

  const now = new Date();
  const until = overrides?.until || toDateStr(now);
  const since = overrides?.since || toDateStr(new Date(now.getTime() - ADS_BACKFILL_DAYS * 24 * 60 * 60 * 1000));
  const chunks = dateRangeChunks(since, until);

  // Accounts are independent (own token, own rows, own sync-status row) —
  // run them concurrently rather than one at a time, same reasoning as
  // facebookSync.ts's runFacebookSync (sequential-per-item was what produced
  // the 504s on POST /api/fb/sync-now with just 2 pages configured).
  return Promise.all(
    accounts.map(async (account): Promise<FacebookAdsSyncResult> => {
      const tokenStatus: TokenStatus = { invalid: false };
      let rowsSynced = 0;
      try {
        const accessToken = decrypt(account.access_token_encrypted);
        if (!accessToken) throw new Error("Access token trống hoặc giải mã thất bại.");

        // Fetched once per account, reused across every date-chunk below —
        // barely changes day to day, no reason to re-fetch it per chunk.
        // Independent requests — run together to save wall-clock time.
        const [adPostMap, adThumbnailMap] = await Promise.all([
          fetchAdPostMap(account.ad_account_id, accessToken, tokenStatus),
          fetchAdThumbnailMap(account.ad_account_id, accessToken, tokenStatus),
        ]);

        // Chunks for one account stay sequential — each is saved as soon as
        // it's fetched, so a failure on a later chunk (rate limit, transient
        // API error) still keeps everything fetched so far instead of losing
        // the whole backfill.
        for (const chunk of chunks) {
          rowsSynced += await fetchAdAccountInsights(
            account.ad_account_id,
            accessToken,
            chunk.since,
            chunk.until,
            account.brand,
            tokenStatus,
            adPostMap,
            adThumbnailMap,
            async (rows, creatives) => {
              await upsertAdsPerformance(rows);
              await upsertAdCreatives(creatives);
            }
          );
        }

        await setFbAdAccountSyncStatus(account.ad_account_id, {
          last_synced_at: new Date().toISOString(),
          last_sync_error: null,
          token_expired: tokenStatus.invalid,
        });
        return { ad_account_id: account.ad_account_id, account_name: account.account_name, ok: true, rows_synced: rowsSynced };
      } catch (err: any) {
        const message = err?.message || String(err);
        console.error(`Đồng bộ Facebook Ads thất bại cho ${account.ad_account_id}:`, message);
        await setFbAdAccountSyncStatus(account.ad_account_id, { last_sync_error: message, token_expired: tokenStatus.invalid }).catch(() => {});
        return { ad_account_id: account.ad_account_id, account_name: account.account_name, ok: false, rows_synced: rowsSynced, error: message };
      }
    })
  );
}
