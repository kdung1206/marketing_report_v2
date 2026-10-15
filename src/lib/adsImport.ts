/**
 * Shared client-side types for the Digital Ads Report. (This file used to hold
 * the Google/TikTok/Facebook Excel-upload parsers; the manual upload feature
 * was removed — every channel is synced from its API now.)
 *
 * Local type copies rather than importing from src/server/adsPerformanceStore
 * — this file ends up in the client bundle, and the rest of the codebase
 * (see FacebookInsights.tsx) already keeps frontend-side mirrors of
 * server-side row shapes instead of importing across the client/server
 * boundary.
 */

export type AdsChannel = "facebook" | "google" | "tiktok";

export interface AdsPerformanceRow {
  channel: AdsChannel;
  brand: string | null;
  campaign_name: string;
  ad_group_name: string;
  ad_name: string;
  date: string; // YYYY-MM-DD
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  reach: number | null;
  frequency: number | null;
  video_views: number | null;
  conversions: number | null;
  // Set only for Facebook ads that boost an existing Page post (creative's
  // effective_object_story_id) — same "{page_id}_{post_id}" format as
  // fb_posts.post_id, so the two can be joined to combine organic + paid
  // performance for that one post. null for everything else: dedicated-
  // creative ads, and all Google/TikTok rows (Excel upload has no such
  // concept). See facebookAdsSync.ts's fetchAdPostMap.
  post_id?: string | null;
  extra: Record<string, unknown>;
}
