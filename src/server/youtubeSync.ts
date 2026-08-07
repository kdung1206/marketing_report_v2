// ---------------------------------------------------------------------------
// YouTube Data API v3 + YouTube Analytics API v2 — organic channel/video
// insights for the "Social Report" tab, alongside Facebook Page Insights
// (facebookSync.ts) and TikTok (tiktokSync.ts). Plain fetch() only, no
// googleapis/@googleapis/* SDK — the previous YouTube Analytics attempt
// (removed 2026-08-02) ballooned the Vercel function bundle to ~64MB using
// those packages and caused intermittent FUNCTION_INVOCATION_FAILED in
// production. These are plain REST/JSON endpoints, so no SDK is needed.
//
// Unlike TikTok, Google does NOT expire the refresh_token on a fixed
// schedule (no equivalent of TikTok's 365-day refresh_token) — it stays
// valid until revoked, unused for 6 months, or (only for OAuth consent
// screens still in "Testing" publishing status) 7 days. `disable_auto_auth`
// has no Google equivalent; the closest is `prompt=consent`, used below so
// a re-connect always returns a fresh refresh_token instead of only the
// first-ever authorization getting one.
// ---------------------------------------------------------------------------
import { encrypt, decrypt } from "./crypto";
import {
  getYoutubeAccounts,
  upsertYoutubeInsightsDaily,
  upsertYoutubeVideos,
  setYoutubeAccountSyncStatus,
  updateYoutubeAccountAccessToken,
  YoutubeInsightsDailyRow,
  YoutubeVideoRow,
} from "./youtubeStore";

const YOUTUBE_DATA_API_BASE = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_ANALYTICS_API_BASE = "https://youtubeanalytics.googleapis.com/v2";
export const YOUTUBE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const YOUTUBE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || "";
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || "";
// Must exactly match a "Authorized redirect URI" registered for this OAuth
// Client ID in Google Cloud Console — Google rejects the callback otherwise.
export const YOUTUBE_REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || "";
export const isYoutubeConfigured = Boolean(YOUTUBE_CLIENT_ID && YOUTUBE_CLIENT_SECRET && YOUTUBE_REDIRECT_URI);

// Read-only scopes only — this integration never posts/edits/deletes
// anything on the connected channel. youtube.readonly lists channel/video
// metadata (Data API v3); yt-analytics.readonly reads the views/traffic-
// source reports (Analytics API v2). Both are Google "restricted" scopes;
// see ONBOARDING.md for the Internal-vs-External OAuth consent screen note.
export const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];

class YoutubeApiError extends Error {
  status?: number;
  reason?: string;
  constructor(message: string, status?: number, reason?: string) {
    super(message);
    this.status = status;
    this.reason = reason;
  }
}

// Google returns 401 invalid_token when the refresh_token itself is dead
// (revoked, or a Testing-status app's 7-day grant expired) — same "only a
// confirmed-dead-token drops the connection" contract as
// facebookSync.ts's isTokenInvalidError / tiktokSync.ts's refresh check.
function isRefreshTokenInvalidError(err: unknown): boolean {
  return err instanceof YoutubeApiError && (err.reason === "invalid_grant" || err.status === 400);
}

interface TokenResponse {
  access_token: string;
  expires_in: number; // seconds
  refresh_token?: string; // only present on the authorization_code grant (or a refresh forced to re-consent) — absent on a plain refresh_token grant
  scope: string;
  token_type: string;
}

async function postTokenEndpoint(params: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(YOUTUBE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  const body = await res.json();
  if (!res.ok || body?.error) {
    throw new YoutubeApiError(body?.error_description || body?.error || `Google token endpoint trả về lỗi HTTP ${res.status}`, res.status, body?.error);
  }
  return body as TokenResponse;
}

// Called once from the OAuth callback route (app.ts) right after the user
// approves the consent screen — exchanges the one-time `code` for the first
// access_token/refresh_token pair.
export async function exchangeYoutubeCode(code: string, redirectUri: string): Promise<TokenResponse> {
  return postTokenEndpoint({
    client_id: YOUTUBE_CLIENT_ID,
    client_secret: YOUTUBE_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });
}

async function refreshYoutubeToken(refreshToken: string): Promise<TokenResponse> {
  return postTokenEndpoint({
    client_id: YOUTUBE_CLIENT_ID,
    client_secret: YOUTUBE_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

interface YoutubeChannelInfo {
  channel_id: string;
  channel_title: string;
  uploads_playlist_id: string;
  subscriber_count: number | null;
  view_count: number | null;
  video_count: number | null;
}

// Exported for the OAuth callback route too — same call, used there just to
// label a freshly-connected channel with its title rather than for the
// daily stats snapshot.
export async function fetchOwnChannel(accessToken: string): Promise<YoutubeChannelInfo> {
  const params = new URLSearchParams({ part: "snippet,contentDetails,statistics", mine: "true" });
  const res = await fetch(`${YOUTUBE_DATA_API_BASE}/channels?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await res.json();
  if (!res.ok || body?.error) {
    throw new YoutubeApiError(body?.error?.message || `YouTube channels.list trả về lỗi HTTP ${res.status}`, res.status, body?.error?.status);
  }
  const channel = body?.items?.[0];
  if (!channel) throw new YoutubeApiError("Không tìm thấy kênh YouTube nào cho tài khoản Google này.");
  return {
    channel_id: channel.id,
    channel_title: channel.snippet?.title || channel.id,
    uploads_playlist_id: channel.contentDetails?.relatedPlaylists?.uploads,
    subscriber_count: channel.statistics?.subscriberCount != null ? Number(channel.statistics.subscriberCount) : null,
    view_count: channel.statistics?.viewCount != null ? Number(channel.statistics.viewCount) : null,
    video_count: channel.statistics?.videoCount != null ? Number(channel.statistics.videoCount) : null,
  };
}

interface YoutubePlaylistVideoItem {
  video_id: string;
  title: string;
  thumbnail_url: string | null;
  published_at: string;
}

// This is recent-content insights, not a full archive import — bounded to
// the uploads playlist's most recent page, same "don't walk a creator's
// entire multi-year history every sync" reasoning as tiktokSync.ts's
// MAX_VIDEO_PAGES. playlistItems.list costs far less API quota than
// search.list for the same "list this channel's videos" result.
const MAX_VIDEOS_PER_SYNC = 20;

async function fetchRecentVideos(accessToken: string, uploadsPlaylistId: string): Promise<YoutubePlaylistVideoItem[]> {
  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    playlistId: uploadsPlaylistId,
    maxResults: String(MAX_VIDEOS_PER_SYNC),
  });
  const res = await fetch(`${YOUTUBE_DATA_API_BASE}/playlistItems?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await res.json();
  if (!res.ok || body?.error) {
    throw new YoutubeApiError(body?.error?.message || `YouTube playlistItems.list trả về lỗi HTTP ${res.status}`, res.status, body?.error?.status);
  }
  const items = body?.items || [];
  return items.map((item: any) => ({
    video_id: item.contentDetails?.videoId,
    title: item.snippet?.title || null,
    thumbnail_url: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || null,
    published_at: item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt,
  }));
}

// Cumulative views-to-date for one video, split by traffic source, via the
// YouTube Analytics API. dimensions=insightTrafficSourceType with
// filters=video==ID and a startDate at/before the video's publish date
// returns the running total since upload — same "cumulative snapshot"
// convention as follower_count elsewhere in this codebase (fb_insights_daily
// fan_count, tiktok_insights_daily follower_count), stored as today's row
// rather than requested as a date-bucketed series.
async function fetchVideoViewsBySource(accessToken: string, videoId: string, publishedAt: string): Promise<{ organic: number; advertising: number }> {
  const startDate = publishedAt.slice(0, 10);
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate,
    endDate: new Date().toISOString().slice(0, 10),
    metrics: "views",
    dimensions: "insightTrafficSourceType",
    filters: `video==${videoId}`,
  });
  const res = await fetch(`${YOUTUBE_ANALYTICS_API_BASE}/reports?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await res.json();
  if (!res.ok || body?.error) {
    throw new YoutubeApiError(body?.error?.message || `YouTube Analytics reports trả về lỗi HTTP ${res.status}`, res.status, body?.error?.status);
  }
  let organic = 0;
  let advertising = 0;
  for (const row of body?.rows || []) {
    const [sourceType, views] = row;
    if (sourceType === "ADVERTISING") advertising += Number(views) || 0;
    else organic += Number(views) || 0;
  }
  return { organic, advertising };
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export interface YoutubeSyncResult {
  channel_id: string;
  channel_title: string | null;
  ok: boolean;
  videos_synced?: number;
  error?: string;
}

export async function runYoutubeSync(): Promise<YoutubeSyncResult[]> {
  if (!isYoutubeConfigured) {
    throw new Error("YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET chưa được cấu hình.");
  }

  const accounts = (await getYoutubeAccounts()).filter((a) => a.is_active);
  const results: YoutubeSyncResult[] = [];
  const today = toDateStr(new Date());

  for (const account of accounts) {
    let refreshTokenInvalid = false;
    try {
      let accessToken = decrypt(account.access_token_encrypted);
      if (!accessToken) throw new Error("Access token trống hoặc giải mã thất bại.");

      const accessExpiresAt = new Date(account.access_token_expires_at).getTime();
      if (Date.now() > accessExpiresAt - 5 * 60 * 1000) {
        const refreshToken = decrypt(account.refresh_token_encrypted);
        try {
          const refreshed = await refreshYoutubeToken(refreshToken);
          accessToken = refreshed.access_token;
          await updateYoutubeAccountAccessToken(account.channel_id, {
            access_token_encrypted: encrypt(refreshed.access_token),
            access_token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
          });
        } catch (err: any) {
          if (isRefreshTokenInvalidError(err)) refreshTokenInvalid = true;
          throw err;
        }
      }

      const channel = await fetchOwnChannel(accessToken);
      await upsertYoutubeInsightsDaily([
        {
          channel_id: account.channel_id,
          date: today,
          subscriber_count: channel.subscriber_count,
          view_count: channel.view_count,
          video_count: channel.video_count,
        } as YoutubeInsightsDailyRow,
      ]);

      const videos = channel.uploads_playlist_id ? await fetchRecentVideos(accessToken, channel.uploads_playlist_id) : [];
      const videoRows: YoutubeVideoRow[] = [];
      for (const v of videos) {
        if (!v.video_id) continue;
        try {
          const { organic, advertising } = await fetchVideoViewsBySource(accessToken, v.video_id, v.published_at);
          videoRows.push({
            video_id: v.video_id,
            channel_id: account.channel_id,
            published_at: v.published_at,
            title: v.title,
            thumbnail_url: v.thumbnail_url,
            views: organic + advertising,
            organic_views: organic,
            advertising_views: advertising,
            synced_at: new Date().toISOString(),
          });
        } catch (err: any) {
          // A single video's Analytics query failing (e.g. too new, no data
          // yet) must not drop the whole account's sync — same "one bad item
          // doesn't fail the batch" principle as facebookAdsSync.ts's
          // per-account error isolation.
          console.error(`YouTube Analytics lỗi cho video ${v.video_id}:`, err.message || err);
        }
      }
      if (videoRows.length > 0) await upsertYoutubeVideos(videoRows);

      await setYoutubeAccountSyncStatus(account.channel_id, {
        last_synced_at: new Date().toISOString(),
        last_sync_error: null,
        token_expired: false,
      });
      results.push({ channel_id: account.channel_id, channel_title: account.channel_title, ok: true, videos_synced: videoRows.length });
    } catch (err: any) {
      const message = err?.message || String(err);
      console.error(`Đồng bộ YouTube thất bại cho ${account.channel_id}:`, message);
      await setYoutubeAccountSyncStatus(account.channel_id, { last_sync_error: message, token_expired: refreshTokenInvalid }).catch(() => {});
      results.push({ channel_id: account.channel_id, channel_title: account.channel_title, ok: false, error: message });
    }
  }

  return results;
}
