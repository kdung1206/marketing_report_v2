import { encrypt, decrypt } from "./crypto";
import {
  AdsPerformanceRow,
  getGoogleAdsAccounts,
  getTiktokAdsAccounts,
  setGoogleAdsAccountSyncStatus,
  setTiktokAdsAccountSyncStatus,
  updateGoogleAdsAccountTokens,
  upsertAdsPerformance,
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

async function postGoogleToken(params: Record<string, string>): Promise<GoogleTokenResponse> {
  const res = await fetch(GOOGLE_ADS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  const body = await res.json();
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
  const body = await res.json();
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
  return rows;
}

function tiktokNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
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
        extra: { advertiser_id: advertiserId },
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
      }
      await setGoogleAdsAccountSyncStatus(account.customer_id, { last_synced_at: new Date().toISOString(), last_sync_error: null, token_expired: false });
      return { account_id: account.customer_id, account_name: account.account_name, ok: true, rows_synced: rowsSynced };
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
    try {
      const accessToken = decrypt(account.access_token_encrypted);
      if (!accessToken) throw new Error("Access token trống hoặc giải mã thất bại.");
      for (const chunk of chunks) {
        const rows = await fetchTiktokAdsRows(account.advertiser_id, accessToken, chunk.since, chunk.until, account.brand);
        if (rows.length > 0) await upsertAdsPerformance(rows);
        rowsSynced += rows.length;
      }
      await setTiktokAdsAccountSyncStatus(account.advertiser_id, { last_synced_at: new Date().toISOString(), last_sync_error: null, token_expired: false });
      return { account_id: account.advertiser_id, account_name: account.account_name, ok: true, rows_synced: rowsSynced };
    } catch (err: any) {
      const message = err?.message || String(err);
      await setTiktokAdsAccountSyncStatus(account.advertiser_id, { last_sync_error: message, token_expired: /access token|invalid token|unauthorized/i.test(message) }).catch(() => {});
      return { account_id: account.advertiser_id, account_name: account.account_name, ok: false, rows_synced: rowsSynced, error: message };
    }
  }));
}
