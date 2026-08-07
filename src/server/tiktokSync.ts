// ---------------------------------------------------------------------------
// TikTok Display API (Login Kit OAuth) — organic account/video insights for
// the "Social Report" tab, alongside Facebook Page Insights (facebookSync.ts).
// Plain fetch() only, no TikTok SDK — the previous "Social Report" attempt
// (YouTube Analytics + Google Ads, removed 2026-08-02) got shelved because
// the official googleapis/google-ads-api Node SDKs ballooned the Vercel
// function bundle to ~64MB and caused intermittent FUNCTION_INVOCATION_FAILED
// in production. TikTok's REST API needs no such SDK, so that failure mode
// doesn't apply here.
//
// Reference: https://developers.tiktok.com/doc/oauth-user-access-token-management
// Token lifetimes (confirmed against TikTok's docs, 2026-08): access_token
// lives 24h and is refreshed automatically by this sync; refresh_token lives
// 365 days and once IT expires, the account owner must click through
// TikTok's consent screen again (GET /api/tiktok/oauth/start) — there is no
// server-side way to extend it silently, unlike Facebook's Page Token.
// ---------------------------------------------------------------------------
import { encrypt, decrypt } from "./crypto";
import {
  getTiktokAccounts,
  upsertTiktokInsightsDaily,
  upsertTiktokPosts,
  setTiktokAccountSyncStatus,
  updateTiktokAccountTokens,
  TiktokInsightsDailyRow,
  TiktokPostRow,
} from "./tiktokStore";

const TIKTOK_API_BASE = "https://open.tiktokapis.com";
export const TIKTOK_AUTHORIZE_URL = "https://www.tiktok.com/v2/auth/authorize/";

export const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || "";
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || "";
// Must exactly match a "Redirect URI" registered for this app's Login Kit
// product in the TikTok Developer Portal — TikTok rejects the callback
// otherwise. Kept as an explicit env var rather than derived from request
// headers, since it's registered as a static string on TikTok's side anyway
// and deriving it from Host/X-Forwarded-Host would just be a spoofing risk
// for no benefit.
export const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || "";
export const isTiktokConfigured = Boolean(TIKTOK_CLIENT_KEY && TIKTOK_CLIENT_SECRET && TIKTOK_REDIRECT_URI);

// Scopes this integration needs. Each must be added to the app on the TikTok
// Developer Portal (and, for anything beyond the sandbox test users, cleared
// through TikTok's App Review) before a real account can grant them.
export const TIKTOK_SCOPES = ["user.info.basic", "user.info.stats", "video.list"];

const USER_INFO_FIELDS = ["open_id", "username", "display_name", "follower_count", "following_count", "likes_count", "video_count"].join(",");
const VIDEO_FIELDS = ["id", "title", "create_time", "cover_image_url", "share_url", "view_count", "like_count", "comment_count", "share_count"].join(",");

class TiktokApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

// TikTok's own error payload uses a string `code` ("ok" on success); the
// specific codes that mean "this refresh_token is dead, re-auth needed" per
// TikTok's docs are access_token_invalid/refresh_token_invalid — anything
// else (rate limiting, a transient 5xx) must NOT be treated as "connection
// lost", same "only a confirmed-dead-token drops the connection" contract as
// facebookSync.ts's isTokenInvalidError.
function isRefreshTokenInvalidError(err: unknown): boolean {
  return err instanceof TiktokApiError && (err.code === "refresh_token_invalid" || err.code === "invalid_grant");
}

interface TokenResponse {
  access_token: string;
  expires_in: number; // seconds
  refresh_token: string;
  refresh_expires_in: number; // seconds
  open_id: string;
  scope: string;
  token_type: string;
}

async function postTokenEndpoint(params: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(`${TIKTOK_API_BASE}/v2/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
    body: new URLSearchParams(params).toString(),
  });
  const body = await res.json();
  if (!res.ok || body?.error) {
    throw new TiktokApiError(body?.error_description || body?.error?.message || `TikTok token endpoint trả về lỗi HTTP ${res.status}`, body?.error);
  }
  return body as TokenResponse;
}

// Called once from the OAuth callback route (app.ts) right after the user
// approves the consent screen — exchanges the one-time `code` for the first
// access_token/refresh_token pair.
export async function exchangeTiktokCode(code: string, redirectUri: string): Promise<TokenResponse> {
  return postTokenEndpoint({
    client_key: TIKTOK_CLIENT_KEY,
    client_secret: TIKTOK_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });
}

async function refreshTiktokToken(refreshToken: string): Promise<TokenResponse> {
  return postTokenEndpoint({
    client_key: TIKTOK_CLIENT_KEY,
    client_secret: TIKTOK_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

// Exported for the OAuth callback route too (app.ts) — same call, used there
// just to label a freshly-connected account with its username/display_name
// rather than for the daily stats snapshot.
export async function fetchUserInfo(accessToken: string): Promise<{
  username?: string;
  display_name?: string;
  follower_count?: number;
  following_count?: number;
  likes_count?: number;
  video_count?: number;
}> {
  const res = await fetch(`${TIKTOK_API_BASE}/v2/user/info/?fields=${USER_INFO_FIELDS}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await res.json();
  if (!res.ok || (body?.error && body.error.code !== "ok")) {
    throw new TiktokApiError(body?.error?.message || `TikTok user/info trả về lỗi HTTP ${res.status}`, body?.error?.code);
  }
  return body?.data?.user || {};
}

interface TiktokVideoApiItem {
  id: string;
  title?: string;
  create_time: number; // unix seconds
  cover_image_url?: string;
  share_url?: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
}

// Paginates through /v2/video/list/ up to a bounded number of pages — this
// is recent-content insights, not a full archive import, so there's no need
// to walk a creator's entire multi-year history every sync run.
const MAX_VIDEO_PAGES = 5;

async function fetchRecentVideos(accessToken: string): Promise<TiktokVideoApiItem[]> {
  const videos: TiktokVideoApiItem[] = [];
  let cursor: number | undefined;

  for (let page = 0; page < MAX_VIDEO_PAGES; page++) {
    const res = await fetch(`${TIKTOK_API_BASE}/v2/video/list/?fields=${VIDEO_FIELDS}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ max_count: 20, ...(cursor ? { cursor } : {}) }),
    });
    const body = await res.json();
    if (!res.ok || (body?.error && body.error.code !== "ok")) {
      throw new TiktokApiError(body?.error?.message || `TikTok video/list trả về lỗi HTTP ${res.status}`, body?.error?.code);
    }
    const pageVideos: TiktokVideoApiItem[] = body?.data?.videos || [];
    videos.push(...pageVideos);
    if (!body?.data?.has_more || pageVideos.length === 0) break;
    cursor = body.data.cursor;
  }

  return videos;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export interface TiktokSyncResult {
  open_id: string;
  username: string | null;
  ok: boolean;
  videos_synced?: number;
  error?: string;
}

export async function runTiktokSync(): Promise<TiktokSyncResult[]> {
  if (!isTiktokConfigured) {
    throw new Error("TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET chưa được cấu hình.");
  }

  const accounts = (await getTiktokAccounts()).filter((a) => a.is_active);
  const results: TiktokSyncResult[] = [];
  const today = toDateStr(new Date());

  for (const account of accounts) {
    let refreshTokenInvalid = false;
    try {
      let accessToken = decrypt(account.access_token_encrypted);
      if (!accessToken) throw new Error("Access token trống hoặc giải mã thất bại.");

      // Refresh proactively if the access_token is at or near expiry —
      // simpler and safer than reacting to a 401 mid-sync, and cheap since
      // this only costs one extra call on days it's actually needed.
      const accessExpiresAt = new Date(account.access_token_expires_at).getTime();
      if (Date.now() > accessExpiresAt - 5 * 60 * 1000) {
        const refreshToken = decrypt(account.refresh_token_encrypted);
        try {
          const refreshed = await refreshTiktokToken(refreshToken);
          accessToken = refreshed.access_token;
          await updateTiktokAccountTokens(account.open_id, {
            access_token_encrypted: encrypt(refreshed.access_token),
            refresh_token_encrypted: encrypt(refreshed.refresh_token),
            access_token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
            refresh_token_expires_at: new Date(Date.now() + refreshed.refresh_expires_in * 1000).toISOString(),
          });
        } catch (err: any) {
          if (isRefreshTokenInvalidError(err)) refreshTokenInvalid = true;
          throw err;
        }
      }

      const userInfo = await fetchUserInfo(accessToken);
      await upsertTiktokInsightsDaily([
        {
          open_id: account.open_id,
          date: today,
          follower_count: userInfo.follower_count ?? null,
          following_count: userInfo.following_count ?? null,
          likes_count: userInfo.likes_count ?? null,
          video_count: userInfo.video_count ?? null,
        } as TiktokInsightsDailyRow,
      ]);

      const videos = await fetchRecentVideos(accessToken);
      const postRows: TiktokPostRow[] = videos.map((v) => ({
        video_id: v.id,
        open_id: account.open_id,
        create_time: new Date(v.create_time * 1000).toISOString(),
        title: v.title || null,
        cover_image_url: v.cover_image_url || null,
        share_url: v.share_url || null,
        view_count: v.view_count ?? null,
        like_count: v.like_count ?? null,
        comment_count: v.comment_count ?? null,
        share_count: v.share_count ?? null,
        synced_at: new Date().toISOString(),
      }));
      if (postRows.length > 0) await upsertTiktokPosts(postRows);

      await setTiktokAccountSyncStatus(account.open_id, {
        last_synced_at: new Date().toISOString(),
        last_sync_error: null,
        token_expired: false,
      });
      results.push({ open_id: account.open_id, username: account.username, ok: true, videos_synced: postRows.length });
    } catch (err: any) {
      const message = err?.message || String(err);
      console.error(`Đồng bộ TikTok thất bại cho ${account.open_id}:`, message);
      await setTiktokAccountSyncStatus(account.open_id, { last_sync_error: message, token_expired: refreshTokenInvalid }).catch(() => {});
      results.push({ open_id: account.open_id, username: account.username, ok: false, error: message });
    }
  }

  return results;
}
