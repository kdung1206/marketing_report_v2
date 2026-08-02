// ---------------------------------------------------------------------------
// YouTube Data API v3 (auto-discover recent uploads) + YouTube Analytics API
// v2 (per-video cumulative views/impressions, organic vs ad-driven).
//
// No manual "register this video" step anywhere: every sync re-lists the
// channel's uploads playlist and tracks whatever was published within
// RECENCY_WINDOW_DAYS. That window is what makes this "no weekly manual
// work" — a new post just starts appearing on the next sync automatically.
// ---------------------------------------------------------------------------
// Scoped single-API packages (see googleAuth.ts for why — avoids bundling
// the entire `googleapis` umbrella package into the Vercel function).
import { youtube as youtubeClient } from "@googleapis/youtube";
import { youtubeAnalytics as youtubeAnalyticsClient } from "@googleapis/youtubeanalytics";
import type { OAuth2Client } from "./googleAuth";

const RECENCY_WINDOW_DAYS = 180; // track videos published in roughly the last ~6 months

export function getYoutubeChannelId(): string {
  const channelId = process.env.YOUTUBE_CHANNEL_ID || "";
  if (!channelId) {
    throw new Error("YOUTUBE_CHANNEL_ID chưa được cấu hình (đặt trong .env.local hoặc Vercel Environment Variables).");
  }
  return channelId;
}

export interface DiscoveredVideo {
  videoId: string;
  title: string;
  publishedAt: string;
  videoUrl: string;
}

export async function listRecentUploads(auth: OAuth2Client, channelId: string): Promise<DiscoveredVideo[]> {
  const youtube = youtubeClient({ version: "v3", auth });

  const channelRes = await youtube.channels.list({ part: ["contentDetails"], id: [channelId] });
  const uploadsPlaylistId = channelRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    throw new Error(
      `Không tìm thấy playlist "uploads" cho channel ${channelId}. Kiểm tra lại YOUTUBE_CHANNEL_ID.`
    );
  }

  const cutoff = new Date(Date.now() - RECENCY_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const discovered: DiscoveredVideo[] = [];
  let pageToken: string | undefined = undefined;

  // Uploads playlist is newest-first, so we can stop as soon as we cross the
  // recency cutoff instead of paginating the whole channel history.
  for (let page = 0; page < 5; page++) {
    const res = await youtube.playlistItems.list({
      part: ["snippet", "contentDetails"],
      playlistId: uploadsPlaylistId,
      maxResults: 50,
      pageToken,
    });

    let hitCutoff = false;
    for (const item of res.data.items || []) {
      const publishedAt = item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt;
      const videoId = item.contentDetails?.videoId;
      if (!videoId || !publishedAt) continue;
      if (new Date(publishedAt) < cutoff) {
        hitCutoff = true;
        break;
      }
      discovered.push({
        videoId,
        title: item.snippet?.title || videoId,
        publishedAt,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }

    pageToken = res.data.nextPageToken || undefined;
    if (hitCutoff || !pageToken) break;
  }

  return discovered;
}

export interface VideoAnalytics {
  videoId: string;
  viewsCumulative: number;
  organicViewsCumulative: number;
  impressionsCumulative: number;
}

// YouTube's own launch date — a safe "since the beginning" lower bound so
// the views/impressions figures below are genuinely cumulative-since-ever,
// matching the semantics the Excel template documented (Huong_dan §1).
const EPOCH_START_DATE = "2005-02-01";

export async function fetchVideoAnalytics(auth: OAuth2Client, videoIds: string[]): Promise<VideoAnalytics[]> {
  if (videoIds.length === 0) return [];
  const youtubeAnalytics = youtubeAnalyticsClient({ version: "v2", auth });
  const endDate = new Date().toISOString().slice(0, 10);
  const filters = `video==${videoIds.join(",")}`;

  // Query 1: views split by traffic source, so ADVERTISING-driven views can
  // be separated from organic ones within the SAME video's totals — the
  // insightTrafficSourceType dimension is exactly what the earlier platform
  // research identified for this.
  const viewsRes = await youtubeAnalytics.reports.query({
    ids: "channel==MINE",
    startDate: EPOCH_START_DATE,
    endDate,
    metrics: "views",
    dimensions: "video,insightTrafficSourceType",
    filters,
    maxResults: 5000,
  });

  // Query 2: impressions (thumbnail shows). Kept as a separate call rather
  // than combined with insightTrafficSourceType above — impressions and
  // traffic-source-of-the-resulting-view are documented as different report
  // dimension combinations, and mixing them isn't a documented-safe combo.
  const impressionsRes = await youtubeAnalytics.reports.query({
    ids: "channel==MINE",
    startDate: EPOCH_START_DATE,
    endDate,
    metrics: "impressions",
    dimensions: "video",
    filters,
    maxResults: 5000,
  });

  const byVideo = new Map<string, VideoAnalytics>();
  for (const id of videoIds) {
    byVideo.set(id, { videoId: id, viewsCumulative: 0, organicViewsCumulative: 0, impressionsCumulative: 0 });
  }

  for (const row of viewsRes.data.rows || []) {
    const [videoId, trafficSource, viewsStr] = row as [string, string, string];
    const entry = byVideo.get(videoId);
    if (!entry) continue;
    const views = Number(viewsStr) || 0;
    entry.viewsCumulative += views;
    if (trafficSource !== "ADVERTISING") entry.organicViewsCumulative += views;
  }

  for (const row of impressionsRes.data.rows || []) {
    const [videoId, impressionsStr] = row as [string, string];
    const entry = byVideo.get(videoId);
    if (!entry) continue;
    entry.impressionsCumulative = Number(impressionsStr) || 0;
  }

  return Array.from(byVideo.values());
}
