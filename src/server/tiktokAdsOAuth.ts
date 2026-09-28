// ---------------------------------------------------------------------------
// OAuth for TikTok's Marketing/Business API (a SEPARATE TikTok Developer app
// from the Login Kit app used by tiktokSync.ts for organic Social Report
// insights — different developer portal (business-api.tiktok.com vs
// developers.tiktok.com), different app id/secret, different authorize
// domain. See .env.example for the exact app-setup steps.
//
// Unlike Facebook, TikTok's own token-exchange response already includes the
// list of advertiser_ids the authorization covers — no separate "list what
// this login can access" call is needed, just one more call to fetch their
// display names for the picker UI.
// ---------------------------------------------------------------------------
const TIKTOK_MARKETING_API_BASE = "https://business-api.tiktok.com/open_api/v1.3";
const TIKTOK_MARKETING_AUTHORIZE_URL = "https://business-api.tiktok.com/portal/auth";

const TIKTOK_MARKETING_APP_ID = process.env.TIKTOK_MARKETING_APP_ID || "";
const TIKTOK_MARKETING_APP_SECRET = process.env.TIKTOK_MARKETING_APP_SECRET || "";
export const TIKTOK_MARKETING_REDIRECT_URI = process.env.TIKTOK_MARKETING_REDIRECT_URI || "";
export const isTiktokAdsOAuthConfigured = Boolean(TIKTOK_MARKETING_APP_ID && TIKTOK_MARKETING_APP_SECRET && TIKTOK_MARKETING_REDIRECT_URI);

class TiktokMarketingApiError extends Error {
  code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
  }
}

export function buildTiktokAdsAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    app_id: TIKTOK_MARKETING_APP_ID,
    state,
    redirect_uri: TIKTOK_MARKETING_REDIRECT_URI,
  });
  return `${TIKTOK_MARKETING_AUTHORIZE_URL}?${params.toString()}`;
}

interface TiktokAdsTokenResponse {
  access_token: string;
  advertiser_ids: string[];
  scope?: number[];
}

// Exchanges the one-time `auth_code` (from oauth/callback) for an access
// token — TikTok Business API tokens don't expire on their own (only a
// manual revoke from the TikTok Business account owner ends the connection),
// so there's no refresh token/expiry to track, unlike every Google/TikTok
// Login Kit flow elsewhere in this app.
export async function exchangeTiktokAdsCode(authCode: string): Promise<TiktokAdsTokenResponse> {
  const res = await fetch(`${TIKTOK_MARKETING_API_BASE}/oauth2/access_token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: TIKTOK_MARKETING_APP_ID, secret: TIKTOK_MARKETING_APP_SECRET, auth_code: authCode }),
  });
  const body = await res.json();
  if (!res.ok || body?.code !== 0) {
    throw new TiktokMarketingApiError(body?.message || `TikTok oauth2/access_token trả về lỗi HTTP ${res.status}`, body?.code);
  }
  return body.data;
}

export interface TiktokAdvertiserCandidate {
  advertiser_id: string;
  name: string;
}

// Fetches display names for the advertiser_ids the token exchange already
// authorized — purely for the picker UI, every id in the input is already
// confirmed accessible by this token regardless of what this call returns.
export async function fetchAdvertiserNames(accessToken: string, advertiserIds: string[]): Promise<TiktokAdvertiserCandidate[]> {
  if (advertiserIds.length === 0) return [];
  const params = new URLSearchParams({ advertiser_ids: JSON.stringify(advertiserIds), fields: JSON.stringify(["advertiser_id", "name"]) });
  const res = await fetch(`${TIKTOK_MARKETING_API_BASE}/advertiser/info/?${params.toString()}`, {
    headers: { "Access-Token": accessToken },
  });
  const body = await res.json();
  if (!res.ok || body?.code !== 0) {
    // Non-fatal — the ids themselves are already authorized; a name lookup
    // failure just means the picker falls back to showing the raw ids.
    console.error("TikTok advertiser/info lỗi (không chặn kết nối):", body?.message || res.status);
    return advertiserIds.map((id) => ({ advertiser_id: id, name: id }));
  }
  const list = body?.data?.list || [];
  return list.map((a: any) => ({ advertiser_id: a.advertiser_id, name: a.name || a.advertiser_id }));
}

// Same case-insensitive substring convention as detectBrandFromFacebookName/
// detectBrandFromName elsewhere — advertiser account names in this app
// consistently contain the brand name.
export function detectBrandFromAdvertiserName(name: string | null | undefined): "Livotec" | "Karofi" | null {
  const haystack = (name || "").toLowerCase();
  const hasLivotec = haystack.includes("livotec");
  const hasKarofi = haystack.includes("karofi");
  if (hasLivotec && !hasKarofi) return "Livotec";
  if (hasKarofi && !hasLivotec) return "Karofi";
  return null;
}
