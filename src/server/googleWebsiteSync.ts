// ---------------------------------------------------------------------------
// Google Analytics 4 (Data + Admin API) + Search Console (Search Analytics
// API) — organic website insights for the "Website Report" tab. Explicitly
// does NOT touch Google Ads (see paidAdsApiSync.ts for that).
//
// Shares its Google Cloud OAuth Client with youtubeSync.ts (same
// YOUTUBE_CLIENT_ID/YOUTUBE_CLIENT_SECRET, decision made 2026-09-06 to avoid
// standing up a second Google Cloud project) — only the redirect URI and
// scopes differ, so this module has its own GOOGLE_WEBSITE_REDIRECT_URI/
// GOOGLE_WEBSITE_SCOPES but reuses the client id/secret constants. Plain
// fetch() only, no googleapis/@googleapis/* SDK — same reasoning as
// youtubeSync.ts (that SDK ballooned the Vercel function bundle to ~64MB).
// ---------------------------------------------------------------------------
import { encrypt, decrypt } from "./crypto";
import { YOUTUBE_CLIENT_ID, YOUTUBE_AUTHORIZE_URL } from "./youtubeSync";
import {
  getGoogleWebsiteAccounts,
  upsertGa4InsightsDaily,
  upsertSearchConsoleInsightsDaily,
  patchGoogleWebsiteAccount,
  GoogleWebsiteAvailableProperty,
  Ga4InsightsDailyRow,
  SearchConsoleInsightsDailyRow,
} from "./googleWebsiteStore";

const GA4_ADMIN_API_BASE = "https://analyticsadmin.googleapis.com/v1beta";
const GA4_DATA_API_BASE = "https://analyticsdata.googleapis.com/v1beta";
const SEARCH_CONSOLE_API_BASE = "https://www.googleapis.com/webmasters/v3";
export const GOOGLE_WEBSITE_AUTHORIZE_URL = YOUTUBE_AUTHORIZE_URL;
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

// Same OAuth Client as youtubeSync.ts (YOUTUBE_CLIENT_ID is exported from
// there; the secret isn't, so it's re-read here under its original env var
// name — this is the same value, not a second client).
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || "";
// Must exactly match a "Authorized redirect URI" registered for the shared
// OAuth Client (the same one used for YOUTUBE_REDIRECT_URI) in Google Cloud
// Console — Google rejects the callback otherwise.
export const GOOGLE_WEBSITE_REDIRECT_URI = process.env.GOOGLE_WEBSITE_REDIRECT_URI || "";
export const isGoogleWebsiteConfigured = Boolean(YOUTUBE_CLIENT_ID && YOUTUBE_CLIENT_SECRET && GOOGLE_WEBSITE_REDIRECT_URI);

// Read-only scopes only — this integration never edits GA4/Search Console
// settings, only reads reports.
export const GOOGLE_WEBSITE_SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
];

class GoogleWebsiteApiError extends Error {
  status?: number;
  reason?: string;
  constructor(message: string, status?: number, reason?: string) {
    super(message);
    this.status = status;
    this.reason = reason;
  }
}

// Same "only a confirmed-dead-token drops the connection" contract as
// youtubeSync.ts's isRefreshTokenInvalidError.
function isRefreshTokenInvalidError(err: unknown): boolean {
  return err instanceof GoogleWebsiteApiError && (err.reason === "invalid_grant" || err.status === 400);
}

interface TokenResponse {
  access_token: string;
  expires_in: number; // seconds
  refresh_token?: string; // only present on the authorization_code grant
  scope: string;
  token_type: string;
  id_token?: string;
}

async function postTokenEndpoint(params: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  const body = await res.json();
  if (!res.ok || body?.error) {
    throw new GoogleWebsiteApiError(body?.error_description || body?.error || `Google token endpoint trả về lỗi HTTP ${res.status}`, res.status, body?.error);
  }
  return body as TokenResponse;
}

// Called once from the OAuth callback route (app.ts) right after the user
// approves the consent screen — exchanges the one-time `code` for the first
// access_token/refresh_token pair.
export async function exchangeGoogleWebsiteCode(code: string, redirectUri: string): Promise<TokenResponse> {
  return postTokenEndpoint({
    client_id: YOUTUBE_CLIENT_ID,
    client_secret: YOUTUBE_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });
}

async function refreshGoogleWebsiteToken(refreshToken: string): Promise<TokenResponse> {
  return postTokenEndpoint({
    client_id: YOUTUBE_CLIENT_ID,
    client_secret: YOUTUBE_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

// Minimal decode of the id_token's payload (no signature verification needed
// — it came directly from Google's own token endpoint over HTTPS, not from
// an untrusted client) just to read `sub`/`email` for a stable account id.
function decodeIdToken(idToken: string): { sub: string; email: string | null } {
  const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64url").toString("utf8"));
  return { sub: payload.sub, email: payload.email || null };
}

// -- Property / site discovery (called once from the OAuth callback) --------

// GA4 Admin API: lists every GA4 property this Google account can access,
// across every GA4 account it's a member of. accountSummaries already
// includes nested propertySummaries, so one call covers everything — no
// need for a separate accounts.list + per-account properties.list pair.
export async function listGa4Properties(accessToken: string): Promise<GoogleWebsiteAvailableProperty[]> {
  const res = await fetch(`${GA4_ADMIN_API_BASE}/accountSummaries?pageSize=200`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await res.json();
  if (!res.ok || body?.error) {
    throw new GoogleWebsiteApiError(body?.error?.message || `GA4 accountSummaries.list trả về lỗi HTTP ${res.status}`, res.status, body?.error?.status);
  }
  const properties: GoogleWebsiteAvailableProperty[] = [];
  for (const account of body?.accountSummaries || []) {
    for (const p of account.propertySummaries || []) {
      properties.push({ id: p.property, name: p.displayName || p.property });
    }
  }
  return properties;
}

// Search Console API: lists every site (domain- or URL-prefix property)
// verified for this Google account.
export async function listSearchConsoleSites(accessToken: string): Promise<string[]> {
  const res = await fetch(`${SEARCH_CONSOLE_API_BASE}/sites`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await res.json();
  if (!res.ok || body?.error) {
    throw new GoogleWebsiteApiError(body?.error?.message || `Search Console sites.list trả về lỗi HTTP ${res.status}`, res.status, body?.error?.status);
  }
  return (body?.siteEntry || []).map((s: any) => s.siteUrl);
}

// -- Daily metrics ------------------------------------------------------------

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function fetchGa4DailyMetrics(accessToken: string, propertyId: string, since: string, until: string): Promise<Ga4InsightsDailyRow[]> {
  const res = await fetch(`${GA4_DATA_API_BASE}/${propertyId}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      dateRanges: [{ startDate: since, endDate: until }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "engagedSessions" },
        { name: "averageSessionDuration" },
        { name: "conversions" },
        { name: "bounceRate" },
      ],
    }),
  });
  const body = await res.json();
  if (!res.ok || body?.error) {
    throw new GoogleWebsiteApiError(body?.error?.message || `GA4 runReport trả về lỗi HTTP ${res.status}`, res.status, body?.error?.status);
  }
  return (body?.rows || []).map((row: any) => {
    // GA4 returns date dimension as "YYYYMMDD", not ISO — reformat to match
    // this codebase's YYYY-MM-DD convention everywhere else.
    const raw = row.dimensionValues?.[0]?.value || "";
    const date = raw.length === 8 ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : raw;
    const [sessions, activeUsers, newUsers, engagedSessions, avgSessionDuration, conversions, bounceRate] = (row.metricValues || []).map(
      (m: any) => Number(m.value)
    );
    return {
      date,
      sessions: sessions ?? null,
      active_users: activeUsers ?? null,
      new_users: newUsers ?? null,
      engaged_sessions: engagedSessions ?? null,
      avg_engagement_time_seconds: avgSessionDuration ?? null,
      conversions: conversions ?? null,
      bounce_rate: bounceRate ?? null,
    } as Omit<Ga4InsightsDailyRow, "account_id">;
  }) as any;
}

// Search Console's data has a ~2-3 day processing lag — querying "today"
// always comes back empty/incomplete, unlike every other platform in this
// codebase. Callers should bias `until` a few days into the past.
async function fetchSearchConsoleDailyMetrics(accessToken: string, siteUrl: string, since: string, until: string): Promise<Omit<SearchConsoleInsightsDailyRow, "account_id">[]> {
  const res = await fetch(`${SEARCH_CONSOLE_API_BASE}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      startDate: since,
      endDate: until,
      dimensions: ["date"],
      rowLimit: 1000,
    }),
  });
  const body = await res.json();
  if (!res.ok || body?.error) {
    throw new GoogleWebsiteApiError(body?.error?.message || `Search Console searchAnalytics.query trả về lỗi HTTP ${res.status}`, res.status, body?.error?.status);
  }
  return (body?.rows || []).map((row: any) => ({
    date: row.keys?.[0],
    clicks: row.clicks ?? null,
    impressions: row.impressions ?? null,
    ctr: row.ctr ?? null,
    position: row.position ?? null,
  }));
}

export interface GoogleWebsiteSyncResult {
  account_id: string;
  brand: string | null;
  ok: boolean;
  ga4_rows_synced?: number;
  gsc_rows_synced?: number;
  error?: string;
}

export async function runGoogleWebsiteSync(): Promise<GoogleWebsiteSyncResult[]> {
  if (!isGoogleWebsiteConfigured) {
    throw new Error("GOOGLE_WEBSITE_REDIRECT_URI (hoặc YOUTUBE_CLIENT_ID/SECRET) chưa được cấu hình đầy đủ.");
  }

  // Pending accounts (is_active: false) are still waiting on the admin to
  // pick a GA4 property / Search Console site in the Control Panel — there
  // is nothing to sync yet.
  const accounts = (await getGoogleWebsiteAccounts()).filter((a) => a.is_active);
  const results: GoogleWebsiteSyncResult[] = [];
  const until = toDateStr(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)); // Search Console lag
  const since = toDateStr(new Date(Date.now() - 33 * 24 * 60 * 60 * 1000)); // 30-day window ending at `until`

  for (const account of accounts) {
    let refreshTokenInvalid = false;
    try {
      let accessToken = decrypt(account.access_token_encrypted);
      if (!accessToken) throw new Error("Access token trống hoặc giải mã thất bại.");

      const accessExpiresAt = new Date(account.access_token_expires_at).getTime();
      if (Date.now() > accessExpiresAt - 5 * 60 * 1000) {
        const refreshToken = decrypt(account.refresh_token_encrypted);
        try {
          const refreshed = await refreshGoogleWebsiteToken(refreshToken);
          accessToken = refreshed.access_token;
          await patchGoogleWebsiteAccount(account.id, {
            access_token_encrypted: encrypt(refreshed.access_token),
            access_token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
          });
        } catch (err: any) {
          if (isRefreshTokenInvalidError(err)) refreshTokenInvalid = true;
          throw err;
        }
      }

      let ga4RowsSynced = 0;
      if (account.ga4_property_id) {
        const ga4Rows = await fetchGa4DailyMetrics(accessToken, account.ga4_property_id, since, until);
        const rows: Ga4InsightsDailyRow[] = ga4Rows.map((r: any) => ({ account_id: account.id, ...r }));
        await upsertGa4InsightsDaily(rows);
        ga4RowsSynced = rows.length;
      }

      let gscRowsSynced = 0;
      if (account.gsc_site_url) {
        const gscRows = await fetchSearchConsoleDailyMetrics(accessToken, account.gsc_site_url, since, until);
        const rows: SearchConsoleInsightsDailyRow[] = gscRows.map((r) => ({ account_id: account.id, ...r }));
        await upsertSearchConsoleInsightsDaily(rows);
        gscRowsSynced = rows.length;
      }

      await patchGoogleWebsiteAccount(account.id, {
        last_synced_at: new Date().toISOString(),
        last_sync_error: null,
        token_expired: false,
      });
      results.push({ account_id: account.id, brand: account.brand, ok: true, ga4_rows_synced: ga4RowsSynced, gsc_rows_synced: gscRowsSynced });
    } catch (err: any) {
      const message = err?.message || String(err);
      console.error(`Đồng bộ Website (GA4/Search Console) thất bại cho ${account.id}:`, message);
      await patchGoogleWebsiteAccount(account.id, { last_sync_error: message, token_expired: refreshTokenInvalid }).catch(() => {});
      results.push({ account_id: account.id, brand: account.brand, ok: false, error: message });
    }
  }

  return results;
}

export { decodeIdToken };
