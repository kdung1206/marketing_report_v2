import { encrypt, decrypt } from "./crypto";
import {
  AdsPerformanceRow,
  getGoogleAdsAccounts,
  getTiktokAdsAccounts,
  setGoogleAdsAccountSyncStatus,
  setTiktokAdsAccountSyncStatus,
  updateGoogleAdsAccountTokens,
  upsertAdsPerformance,
  upsertAdCreatives,
} from "./adsPerformanceStore";
import { toDateStr } from "./facebookSync";

const ADS_BACKFILL_DAYS = 30;
const GOOGLE_ADS_API_VERSION = "v25";
const GOOGLE_ADS_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_ADS_API_BASE = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;
const TIKTOK_BUSINESS_API_BASE = "https://business-api.tiktok.com/open_api/v1.3";

export const GOOGLE_ADS_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID || "";
const GOOGLE_ADS_CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET || "";
export const GOOGLE_ADS_REDIRECT_URI = process.env.GOOGLE_ADS_REDIRECT_URI || "";
export const GOOGLE_ADS_DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
export const GOOGLE_ADS_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_ADS_SCOPES = ["https://www.googleapis.com/auth/adwords"];
export const isGoogleAdsConfigured = Boolean(
  GOOGLE_ADS_CLIENT_ID && GOOGLE_ADS_CLIENT_SECRET && GOOGLE_ADS_REDIRECT_URI && GOOGLE_ADS_DEVELOPER_TOKEN
);

const MAX_GOOGLE_CHUNK_DAYS = 90;
const MAX_TIKTOK_CHUNK_DAYS = 30;

function stripCustomerId(id: string): string {
  return id.replace(/[^0-9]/g, "");
}

function dateRangeChunks(since: string, until: string, maxDays: number): { since: string; until: string }[] {
  const chunks: { since: string; until: string }[] = [];
  let chunkStart = new Date(`${since}T00:00:00Z`);
  const end = new Date(`${until}T00:00:00Z`);
  while (chunkStart <= end) {
    const chunkEnd = new Date(chunkStart.getTime() + (maxDays - 1) * 24 * 60 * 60 * 1000);
    if (chunkEnd > end) chunkEnd.setTime(end.getTime());
    chunks.push({ since: toDateStr(chunkStart), until: toDateStr(chunkEnd) });
    chunkStart = new Date(chunkEnd.getTime() + 24 * 60 * 60 * 1000);
  }
  return chunks;
}

function extractGoogleAdsApiError(body: any, fallback: string): string {
  const error = Array.isArray(body) ? body.find((item) => item?.error)?.error : body?.error;
  if (!error) return fallback;
  const failure = Array.isArray(error.details)
    ? error.details.find((d: any) => d?.["@type"]?.includes("google.ads.googleads") || d?.["@type"] === "type.googleapis.com/google.rpc.ErrorInfo")
    : null;
  const firstGoogleAdsError = failure?.errors?.[0];
  const code =
    firstGoogleAdsError?.errorCode?.authorizationError ||
    firstGoogleAdsError?.errorCode?.queryError ||
    firstGoogleAdsError?.errorCode?.requestError ||
    failure?.reason ||
    error.status;
  const activationUrl = failure?.metadata?.activationUrl ? ` Enable tại: ${failure.metadata.activationUrl}` : "";
  const requestId = failure?.requestId ? ` Request ID: ${failure.requestId}` : "";
  return `${firstGoogleAdsError?.message || error.message || fallback}${code ? ` (${code})` : ""}${activationUrl}${requestId}`;
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

async function readResponseBody(res: Response): Promise<any> {
  const text = await res.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 500) };
  }
}

async function postGoogleToken(params: Record<string, string>): Promise<GoogleTokenResponse> {
  const res = await fetch(GOOGLE_ADS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  const body = await readResponseBody(res);
  if (!res.ok || body?.error) {
    throw new Error(body?.error_description || body?.error || `Google OAuth trả về lỗi HTTP ${res.status}`);
  }
  return body as GoogleTokenResponse;
}

export async function exchangeGoogleAdsCode(code: string, redirectUri: string): Promise<GoogleTokenResponse> {
  return postGoogleToken({
    client_id: GOOGLE_ADS_CLIENT_ID,
    client_secret: GOOGLE_ADS_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });
}

async function refreshGoogleAdsToken(refreshToken: string): Promise<GoogleTokenResponse> {
  return postGoogleToken({
    client_id: GOOGLE_ADS_CLIENT_ID,
    client_secret: GOOGLE_ADS_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

export interface GoogleAdsCandidate {
  id: string; // 10-digit customer id, no dashes
  name: string;
  loginCustomerId: string | null; // manager (MCC) to send as login-customer-id; null = accessed directly
}

function googleAdsHeaders(accessToken: string, loginCustomerId?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    "developer-token": GOOGLE_ADS_DEVELOPER_TOKEN,
  };
  if (loginCustomerId) headers["login-customer-id"] = stripCustomerId(loginCustomerId);
  return headers;
}

async function googleAdsSearch(accessToken: string, customerId: string, loginCustomerId: string | null, query: string): Promise<any[]> {
  const res = await fetch(`${GOOGLE_ADS_API_BASE}/customers/${stripCustomerId(customerId)}/googleAds:search`, {
    method: "POST",
    headers: googleAdsHeaders(accessToken, loginCustomerId),
    body: JSON.stringify({ query }),
  });
  const body = await readResponseBody(res);
  if (!res.ok || body?.error) {
    throw new Error(extractGoogleAdsApiError(body, `Google Ads API trả về lỗi HTTP ${res.status}`));
  }
  return body?.results || [];
}

// "Which Google Ads accounts can this login pull data from?" — the Google
// counterpart of Facebook's /me/accounts + /me/adaccounts and TikTok's
// advertiser_ids list, so the admin ticks accounts instead of typing
// Customer/Manager IDs by hand.
//   1. customers:listAccessibleCustomers → the accounts this user was invited
//      to directly (usually the MCC manager, sometimes a client account).
//   2. each one's name/manager flag via `customer`; for managers, every
//      enabled client below them via `customer_client`.
// Only non-manager (leaf) accounts are returned: managers hold no ad data
// themselves. A client reached through a manager carries that manager's id as
// loginCustomerId (required by the API for MCC access); one the user can
// access directly needs none.
export async function listGoogleAdsCandidates(accessToken: string): Promise<GoogleAdsCandidate[]> {
  const listRes = await fetch(`${GOOGLE_ADS_API_BASE}/customers:listAccessibleCustomers`, { headers: googleAdsHeaders(accessToken) });
  const listBody = await readResponseBody(listRes);
  if (!listRes.ok || listBody?.error) {
    throw new Error(extractGoogleAdsApiError(listBody, `Google Ads listAccessibleCustomers trả về lỗi HTTP ${listRes.status}`));
  }
  const accessibleIds: string[] = (listBody?.resourceNames || []).map((r: string) => stripCustomerId(r));

  const found = new Map<string, GoogleAdsCandidate>();
  const upsertCandidate = (c: GoogleAdsCandidate) => {
    const existing = found.get(c.id);
    // Direct access (no MCC hop) wins over reaching the same account via a manager.
    if (!existing || (existing.loginCustomerId && !c.loginCustomerId)) found.set(c.id, c);
  };

  await Promise.all(
    accessibleIds.map(async (id) => {
      try {
        const [row] = await googleAdsSearch(accessToken, id, null, "SELECT customer.id, customer.descriptive_name, customer.manager, customer.status FROM customer LIMIT 1");
        const customer = row?.customer;
        if (!customer) return;
        if (!customer.manager) {
          if (customer.status === "ENABLED") upsertCandidate({ id, name: customer.descriptiveName || id, loginCustomerId: null });
          return;
        }
        const clients = await googleAdsSearch(
          accessToken,
          id,
          id,
          "SELECT customer_client.id, customer_client.descriptive_name, customer_client.manager, customer_client.status, customer_client.level FROM customer_client WHERE customer_client.level > 0"
        );
        for (const c of clients) {
          const cc = c.customerClient;
          if (!cc || cc.manager || cc.status !== "ENABLED") continue;
          upsertCandidate({ id: String(cc.id), name: cc.descriptiveName || String(cc.id), loginCustomerId: id });
        }
      } catch (err: any) {
        // One inaccessible/disabled account must not hide the others.
        console.error(`Google Ads: bỏ qua account ${id} khi liệt kê:`, err.message);
      }
    })
  );

  return Array.from(found.values()).sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchGoogleAdsRows(
  customerId: string,
  loginCustomerId: string | null,
  accessToken: string,
  since: string,
  until: string,
  brand: string | null
): Promise<AdsPerformanceRow[]> {
  const cleanCustomerId = stripCustomerId(customerId);
  const query = `
    SELECT
      segments.date,
      campaign.name,
      campaign.advertising_channel_type,
      ad_group.name,
      ad_group_ad.ad.id,
      ad_group_ad.ad.name,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.video_trueview_views
    FROM ad_group_ad
    WHERE segments.date BETWEEN '${since}' AND '${until}'
      AND campaign.status != 'REMOVED'
      AND ad_group.status != 'REMOVED'
      AND ad_group_ad.status != 'REMOVED'
  `;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    "developer-token": GOOGLE_ADS_DEVELOPER_TOKEN,
  };
  if (loginCustomerId) headers["login-customer-id"] = stripCustomerId(loginCustomerId);

  const res = await fetch(`${GOOGLE_ADS_API_BASE}/customers/${cleanCustomerId}/googleAds:searchStream`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  });
  const body = await readResponseBody(res);
  if (!res.ok || body?.error) {
    throw new Error(extractGoogleAdsApiError(body, `Google Ads API trả về lỗi HTTP ${res.status}`));
  }

  const batches = Array.isArray(body) ? body : [];
  const rows: AdsPerformanceRow[] = [];
  for (const batch of batches) {
    for (const result of batch.results || []) {
      const date = result.segments?.date;
      const campaignName = result.campaign?.name;
      if (!date || !campaignName) continue;
      rows.push({
        channel: "google",
        brand,
        campaign_name: campaignName,
        ad_group_name: result.adGroup?.name || "",
        ad_name: result.adGroupAd?.ad?.name || String(result.adGroupAd?.ad?.id || ""),
        date,
        spend: result.metrics?.costMicros != null ? Number(result.metrics.costMicros) / 1_000_000 : null,
        impressions: result.metrics?.impressions != null ? Number(result.metrics.impressions) : null,
        clicks: result.metrics?.clicks != null ? Number(result.metrics.clicks) : null,
        reach: null,
        frequency: null,
        video_views: result.metrics?.videoTrueviewViews != null ? Number(result.metrics.videoTrueviewViews) : null,
        conversions: result.metrics?.conversions != null ? Math.round(Number(result.metrics.conversions)) : null,
        extra: {
          customer_id: customerId,
          campaign_type: result.campaign?.advertisingChannelType || null,
        },
      });
    }
  }

  // Campaign types with no ad_group_ad rows at all (Performance Max, Demand
  // Gen/App campaigns — they run on asset groups, not ads) would otherwise
  // silently report 0 spend however much they actually spent. Pull campaign-
  // level metrics too and add a row for every (campaign, day) the ad-level
  // query did not already cover, so the Digital Ads Report spend matches Google
  // Ads. Ad-level rows win wherever both exist (no double counting).
  const covered = new Set(rows.map((r) => `${r.campaign_name}|${r.date}`));
  const campaignQuery = `
    SELECT
      segments.date,
      campaign.name,
      campaign.advertising_channel_type,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.video_trueview_views
    FROM campaign
    WHERE segments.date BETWEEN '${since}' AND '${until}'
      AND campaign.status != 'REMOVED'
      AND metrics.impressions > 0
  `;
  const campRes = await fetch(`${GOOGLE_ADS_API_BASE}/customers/${cleanCustomerId}/googleAds:searchStream`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query: campaignQuery }),
  });
  const campBody = await readResponseBody(campRes);
  if (!campRes.ok || campBody?.error) {
    // Best-effort: the ad-level rows above already succeeded and are worth keeping.
    console.error("Google Ads campaign-level fallback lỗi:", extractGoogleAdsApiError(campBody, `HTTP ${campRes.status}`));
    return rows;
  }
  for (const batch of Array.isArray(campBody) ? campBody : []) {
    for (const result of batch.results || []) {
      const date = result.segments?.date;
      const campaignName = result.campaign?.name;
      if (!date || !campaignName || covered.has(`${campaignName}|${date}`)) continue;
      rows.push({
        channel: "google",
        brand,
        campaign_name: campaignName,
        ad_group_name: "(cấp chiến dịch)",
        ad_name: "(cấp chiến dịch)",
        date,
        spend: result.metrics?.costMicros != null ? Number(result.metrics.costMicros) / 1_000_000 : null,
        impressions: result.metrics?.impressions != null ? Number(result.metrics.impressions) : null,
        clicks: result.metrics?.clicks != null ? Number(result.metrics.clicks) : null,
        reach: null,
        frequency: null,
        video_views: result.metrics?.videoTrueviewViews != null ? Number(result.metrics.videoTrueviewViews) : null,
        conversions: result.metrics?.conversions != null ? Math.round(Number(result.metrics.conversions)) : null,
        extra: { customer_id: customerId, campaign_type: result.campaign?.advertisingChannelType || null, level: "campaign" },
      });
    }
  }
  return rows;
}

function tiktokNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

// Creative thumbnails for the Digital Ads Report's "Top Ads" cards — TikTok
// counterpart of facebookAdsSync.ts's fetchAdThumbnailMap. Three hops, because
// the report API only knows ad_id:
//   ad/get                  ad_id -> video_id / image_ids
//   file/video/ad/info      video_id -> video_cover_url (the video's cover frame)
//   file/image/ad/info      image_id -> image_url (image ads / carousels)
// Best-effort end to end: a failure just leaves that ad without a picture
// (the card falls back to its placeholder), it never fails the sync.
async function tiktokGet(path: string, accessToken: string, params: Record<string, string>): Promise<any> {
  const res = await fetch(`${TIKTOK_BUSINESS_API_BASE}/${path}?${new URLSearchParams(params).toString()}`, {
    headers: { "Access-Token": accessToken },
  });
  const body = await res.json();
  if (!res.ok || body?.code !== 0) throw new Error(body?.message || `HTTP ${res.status}`);
  return body?.data || {};
}

async function fetchTiktokAdThumbnailMap(advertiserId: string, accessToken: string, adIds: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const adToVideo = new Map<string, string>();
  const adToImage = new Map<string, string>();

  for (let i = 0; i < adIds.length; i += 100) {
    const batch = adIds.slice(i, i + 100);
    try {
      const data = await tiktokGet("ad/get/", accessToken, {
        advertiser_id: advertiserId,
        filtering: JSON.stringify({ ad_ids: batch }),
        fields: JSON.stringify(["ad_id", "video_id", "image_ids"]),
        page_size: "100",
      });
      for (const ad of data.list || []) {
        const adId = String(ad.ad_id);
        if (ad.video_id) adToVideo.set(adId, String(ad.video_id));
        else if (Array.isArray(ad.image_ids) && ad.image_ids[0]) adToImage.set(adId, String(ad.image_ids[0]));
      }
    } catch (err: any) {
      console.error(`TikTok Ads → ad/get (${advertiserId}) lỗi:`, err.message || err);
    }
  }

  const videoCover = new Map<string, string>();
  const videoIds = Array.from(new Set(adToVideo.values()));
  for (let i = 0; i < videoIds.length; i += 60) {
    try {
      const data = await tiktokGet("file/video/ad/info/", accessToken, { advertiser_id: advertiserId, video_ids: JSON.stringify(videoIds.slice(i, i + 60)) });
      for (const v of data.list || []) if (v.video_id && v.video_cover_url) videoCover.set(String(v.video_id), String(v.video_cover_url));
    } catch (err: any) {
      console.error(`TikTok Ads → file/video/ad/info (${advertiserId}) lỗi:`, err.message || err);
    }
  }

  const imageUrl = new Map<string, string>();
  const imageIds = Array.from(new Set(adToImage.values()));
  for (let i = 0; i < imageIds.length; i += 60) {
    try {
      const data = await tiktokGet("file/image/ad/info/", accessToken, { advertiser_id: advertiserId, image_ids: JSON.stringify(imageIds.slice(i, i + 60)) });
      for (const im of data.list || []) if (im.image_id && im.image_url) imageUrl.set(String(im.image_id), String(im.image_url));
    } catch (err: any) {
      console.error(`TikTok Ads → file/image/ad/info (${advertiserId}) lỗi:`, err.message || err);
    }
  }

  for (const [adId, videoId] of adToVideo) {
    const url = videoCover.get(videoId);
    if (url) out.set(adId, url);
  }
  for (const [adId, imageId] of adToImage) {
    const url = imageUrl.get(imageId);
    if (url) out.set(adId, url);
  }
  return out;
}

async function fetchTiktokAdsRows(
  advertiserId: string,
  accessToken: string,
  since: string,
  until: string,
  brand: string | null
): Promise<AdsPerformanceRow[]> {
  const params = new URLSearchParams({
    advertiser_id: advertiserId,
    service_type: "AUCTION",
    report_type: "BASIC",
    data_level: "AUCTION_AD",
    dimensions: JSON.stringify(["ad_id", "stat_time_day"]),
    metrics: JSON.stringify([
      "campaign_name",
      "adgroup_name",
      "ad_name",
      "spend",
      "impressions",
      "clicks",
      "reach",
      "frequency",
      "conversion",
      "video_watched_6s",
    ]),
    start_date: since,
    end_date: until,
    page_size: "1000",
  });

  const rows: AdsPerformanceRow[] = [];
  let page = 1;
  while (true) {
    params.set("page", String(page));
    const res = await fetch(`${TIKTOK_BUSINESS_API_BASE}/report/integrated/get/?${params.toString()}`, {
      headers: { "Access-Token": accessToken },
    });
    const body = await res.json();
    if (!res.ok || body?.code !== 0) {
      throw new Error(body?.message || `TikTok Business API trả về lỗi HTTP ${res.status}`);
    }
    for (const item of body?.data?.list || []) {
      const metrics = item.metrics || {};
      const dimensions = item.dimensions || {};
      const date = String(dimensions.stat_time_day || "").slice(0, 10);
      const campaignName = metrics.campaign_name || dimensions.campaign_id || "(unknown campaign)";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      rows.push({
        channel: "tiktok",
        brand,
        campaign_name: String(campaignName),
        ad_group_name: String(metrics.adgroup_name || dimensions.adgroup_id || ""),
        ad_name: String(metrics.ad_name || dimensions.ad_id || ""),
        date,
        spend: tiktokNumber(metrics.spend),
        impressions: tiktokNumber(metrics.impressions),
        clicks: tiktokNumber(metrics.clicks),
        reach: tiktokNumber(metrics.reach),
        frequency: tiktokNumber(metrics.frequency),
        video_views: tiktokNumber(metrics.video_watched_6s),
        conversions: tiktokNumber(metrics.conversion),
        extra: { advertiser_id: advertiserId, ad_id: dimensions.ad_id ? String(dimensions.ad_id) : null },
      });
    }
    const pageInfo = body?.data?.page_info;
    if (!pageInfo || page >= Number(pageInfo.total_page || 1)) break;
    page += 1;
  }
  return rows;
}

export interface PaidAdsApiSyncResult {
  account_id: string;
  account_name: string;
  ok: boolean;
  rows_synced?: number;
  latest_date?: string | null; // newest day the API returned data for — shows "synced fine but nothing since X"
  error?: string;
}

export async function runGoogleAdsSync(overrides?: { since?: string; until?: string }): Promise<PaidAdsApiSyncResult[]> {
  if (!isGoogleAdsConfigured) {
    throw new Error("GOOGLE_ADS_CLIENT_ID / SECRET / REDIRECT_URI / DEVELOPER_TOKEN chưa được cấu hình.");
  }

  const accounts = (await getGoogleAdsAccounts()).filter((a) => a.is_active);
  const now = new Date();
  const until = overrides?.until || toDateStr(now);
  const since = overrides?.since || toDateStr(new Date(now.getTime() - ADS_BACKFILL_DAYS * 24 * 60 * 60 * 1000));
  const chunks = dateRangeChunks(since, until, MAX_GOOGLE_CHUNK_DAYS);

  return Promise.all(accounts.map(async (account): Promise<PaidAdsApiSyncResult> => {
    let rowsSynced = 0;
    let latestDate: string | null = null;
    try {
      let accessToken = decrypt(account.access_token_encrypted);
      if (!accessToken) throw new Error("Access token trống hoặc giải mã thất bại.");

      const accessExpiresAt = account.access_token_expires_at ? new Date(account.access_token_expires_at).getTime() : 0;
      if (Date.now() > accessExpiresAt - 5 * 60 * 1000) {
        const refreshToken = decrypt(account.refresh_token_encrypted);
        if (!refreshToken) throw new Error("Refresh token trống hoặc giải mã thất bại.");
        const refreshed = await refreshGoogleAdsToken(refreshToken);
        accessToken = refreshed.access_token;
        await updateGoogleAdsAccountTokens(account.customer_id, {
          access_token_encrypted: encrypt(refreshed.access_token),
          refresh_token_encrypted: refreshed.refresh_token ? encrypt(refreshed.refresh_token) : account.refresh_token_encrypted,
          access_token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        });
      }

      for (const chunk of chunks) {
        const rows = await fetchGoogleAdsRows(account.customer_id, account.login_customer_id, accessToken, chunk.since, chunk.until, account.brand);
        if (rows.length > 0) await upsertAdsPerformance(rows);
        rowsSynced += rows.length;
        for (const r of rows) if (!latestDate || r.date > latestDate) latestDate = r.date;
      }
      await setGoogleAdsAccountSyncStatus(account.customer_id, { last_synced_at: new Date().toISOString(), last_sync_error: null, token_expired: false });
      return { account_id: account.customer_id, account_name: account.account_name, ok: true, rows_synced: rowsSynced, latest_date: latestDate };
    } catch (err: any) {
      const message = err?.message || String(err);
      await setGoogleAdsAccountSyncStatus(account.customer_id, { last_sync_error: message, token_expired: /invalid_grant|invalid_token/i.test(message) }).catch(() => {});
      return { account_id: account.customer_id, account_name: account.account_name, ok: false, rows_synced: rowsSynced, error: message };
    }
  }));
}

export async function runTiktokAdsSync(overrides?: { since?: string; until?: string }): Promise<PaidAdsApiSyncResult[]> {
  const accounts = (await getTiktokAdsAccounts()).filter((a) => a.is_active);
  const now = new Date();
  const until = overrides?.until || toDateStr(now);
  const since = overrides?.since || toDateStr(new Date(now.getTime() - ADS_BACKFILL_DAYS * 24 * 60 * 60 * 1000));
  const chunks = dateRangeChunks(since, until, MAX_TIKTOK_CHUNK_DAYS);

  return Promise.all(accounts.map(async (account): Promise<PaidAdsApiSyncResult> => {
    let rowsSynced = 0;
    let latestDate: string | null = null;
    try {
      const accessToken = decrypt(account.access_token_encrypted);
      if (!accessToken) throw new Error("Access token trống hoặc giải mã thất bại.");
      const adIds = new Set<string>();
      for (const chunk of chunks) {
        const rows = await fetchTiktokAdsRows(account.advertiser_id, accessToken, chunk.since, chunk.until, account.brand);
        if (rows.length > 0) await upsertAdsPerformance(rows);
        rowsSynced += rows.length;
        for (const r of rows) if (typeof r.extra?.ad_id === "string") adIds.add(r.extra.ad_id as string);
        for (const r of rows) if (!latestDate || r.date > latestDate) latestDate = r.date;
      }
      // Thumbnails after the numbers are safely stored; never fails the sync.
      try {
        const thumbs = await fetchTiktokAdThumbnailMap(account.advertiser_id, accessToken, Array.from(adIds));
        await upsertAdCreatives(Array.from(thumbs, ([ad_id, thumbnail_url]) => ({ ad_id, thumbnail_url })), "tiktok");
      } catch (err: any) {
        console.error(`TikTok Ads → lưu thumbnail (${account.advertiser_id}) lỗi:`, err.message || err);
      }
      await setTiktokAdsAccountSyncStatus(account.advertiser_id, { last_synced_at: new Date().toISOString(), last_sync_error: null, token_expired: false });
      return { account_id: account.advertiser_id, account_name: account.account_name, ok: true, rows_synced: rowsSynced, latest_date: latestDate };
    } catch (err: any) {
      const message = err?.message || String(err);
      await setTiktokAdsAccountSyncStatus(account.advertiser_id, { last_sync_error: message, token_expired: /access token|invalid token|unauthorized/i.test(message) }).catch(() => {});
      return { account_id: account.advertiser_id, account_name: account.account_name, ok: false, rows_synced: rowsSynced, error: message };
    }
  }));
}
