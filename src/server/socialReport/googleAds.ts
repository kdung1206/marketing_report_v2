// ---------------------------------------------------------------------------
// Google Ads API — spend/impressions for whatever video ads ran against a
// given set of YouTube video IDs over a date range. Unlike the organic side,
// Ads reporting is naturally period-scoped (no cumulative-vs-delta math
// needed here): a query for "last 7 days" already IS that week's spend.
//
// Uses the documented `FROM video` resource, which segments ad metrics
// directly by YouTube video ID (video.id) — no separate asset-to-video
// resolution step required. Video Action Campaigns (legacy) vs Demand Gen
// campaigns were flagged by earlier research as having uneven per-video cost
// attribution — if a sync's Ads account uses only legacy VAC campaigns this
// query may come back thin or empty for some videos; that's a real Google
// Ads platform limitation, not a bug here. Every call is wrapped by the
// caller (syncEngine) so an Ads-side failure never blocks organic data.
// ---------------------------------------------------------------------------
import { GoogleAdsApi } from "google-ads-api";
import type { PaidSpendRow } from "./types";

export function isGoogleAdsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
    process.env.GOOGLE_ADS_CUSTOMER_ID
  );
}

function toGaqlDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Escapes single quotes so a video ID/title can never break out of the GAQL
// string literal it's interpolated into (defense in depth — video IDs are
// alphanumeric by construction, but this costs nothing).
function gaqlEscape(value: string): string {
  return value.replace(/'/g, "\\'");
}

export async function fetchVideoAdSpend(
  refreshToken: string,
  videoIds: string[],
  rangeStart: Date,
  rangeEnd: Date
): Promise<PaidSpendRow[]> {
  if (videoIds.length === 0) return [];

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID || "";
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || undefined;

  const client = new GoogleAdsApi({ client_id: clientId, client_secret: clientSecret, developer_token: developerToken });
  const customer = client.Customer({ customer_id: customerId, login_customer_id: loginCustomerId, refresh_token: refreshToken });

  const idList = videoIds.map((id) => `'${gaqlEscape(id)}'`).join(",");
  const query = `
    SELECT video.id, metrics.impressions, metrics.cost_micros, segments.date, customer.currency_code
    FROM video
    WHERE video.id IN (${idList})
      AND segments.date BETWEEN '${toGaqlDate(rangeStart)}' AND '${toGaqlDate(rangeEnd)}'
  `;

  const rows = await customer.query(query);

  // Google Ads returns one row per (video, date) — collapse to one row per
  // video for the whole [rangeStart, rangeEnd] window, matching how the week
  // is tracked everywhere else in this module (weekEnding = rangeEnd).
  const weekEnding = toGaqlDate(rangeEnd);
  const byVideo = new Map<string, PaidSpendRow>();
  for (const row of rows as any[]) {
    const videoId: string | undefined = row.video?.id;
    if (!videoId) continue;
    const costMicros = Number(row.metrics?.cost_micros || 0);
    const impressions = Number(row.metrics?.impressions || 0);
    const currency = row.customer?.currency_code || "VND";
    const existing = byVideo.get(videoId);
    if (existing) {
      existing.spend += costMicros / 1_000_000;
      existing.impressions += impressions;
    } else {
      byVideo.set(videoId, {
        platform: "youtube",
        videoId,
        weekEnding,
        spend: costMicros / 1_000_000,
        currency,
        impressions,
      });
    }
  }

  return Array.from(byVideo.values());
}
