// ---------------------------------------------------------------------------
// Orchestrates one sync run: discover recent uploads → pull YouTube Analytics
// → pull Google Ads spend (best-effort) → append snapshots → compute the
// weekly report for the frontend. This is the same run used by the manual
// "Đồng bộ ngay" button and by the Friday cron.
// ---------------------------------------------------------------------------
import { getAuthorizedClient, getDecryptedRefreshToken } from "./googleAuth";
import { getYoutubeChannelId, listRecentUploads, fetchVideoAnalytics } from "./youtube";
import { fetchVideoAdSpend, isGoogleAdsConfigured } from "./googleAds";
import type { OrganicSnapshot, PaidSpendRow, SocialReportState, WeeklyReportRow } from "./types";

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export interface SyncResult {
  ok: boolean;
  log: string[];
  snapshotsAdded: number;
  paidRowsAdded: number;
}

export async function runSync(state: SocialReportState): Promise<SyncResult> {
  const log: string[] = [];
  const now = new Date();
  const today = toIsoDate(now);

  const auth = getAuthorizedClient(state); // throws a clear VN message if not connected
  const channelId = getYoutubeChannelId(); // throws if YOUTUBE_CHANNEL_ID missing

  log.push(`[${today}] Bắt đầu đồng bộ.`);

  const videos = await listRecentUploads(auth, channelId);
  log.push(`Tìm thấy ${videos.length} video đã đăng trong ~6 tháng gần đây.`);

  if (videos.length === 0) {
    log.push("Không có video nào để đồng bộ — dừng lại.");
    return { ok: true, log, snapshotsAdded: 0, paidRowsAdded: 0 };
  }

  const videoIds = videos.map((v) => v.videoId);
  const analytics = await fetchVideoAnalytics(auth, videoIds);
  const analyticsByVideo = new Map(analytics.map((a) => [a.videoId, a]));

  // Upsert-by-(videoId, snapshotDate): re-running a sync the same day
  // replaces that day's snapshot instead of duplicating it.
  const existingSnapshots = state.snapshots.filter(
    (s) => !(s.snapshotDate === today && videoIds.includes(s.videoId))
  );
  const newSnapshots: OrganicSnapshot[] = videos.map((v) => {
    const a = analyticsByVideo.get(v.videoId);
    return {
      platform: "youtube",
      videoId: v.videoId,
      title: v.title,
      videoUrl: v.videoUrl,
      publishedAt: v.publishedAt,
      snapshotDate: today,
      viewsCumulative: a?.viewsCumulative ?? 0,
      organicViewsCumulative: a?.organicViewsCumulative ?? 0,
      impressionsCumulative: a?.impressionsCumulative ?? 0,
    };
  });
  state.snapshots = [...existingSnapshots, ...newSnapshots];
  log.push(`Đã lưu ${newSnapshots.length} dòng snapshot organic (ngày ${today}).`);

  let paidRowsAdded = 0;
  if (isGoogleAdsConfigured()) {
    try {
      const rangeEnd = now;
      const rangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const refreshToken = getDecryptedRefreshToken(state);
      const spendRows = await fetchVideoAdSpend(refreshToken, videoIds, rangeStart, rangeEnd);

      const weekEnding = toIsoDate(rangeEnd);
      const existingPaid = state.paidSpend.filter(
        (p) => !(p.weekEnding === weekEnding && videoIds.includes(p.videoId))
      );
      state.paidSpend = [...existingPaid, ...spendRows];
      paidRowsAdded = spendRows.length;
      log.push(`Đã lấy chi tiêu Google Ads cho ${spendRows.length}/${videos.length} video (tuần kết thúc ${weekEnding}).`);
    } catch (err: any) {
      // Ads failing must never take down the organic pull that already
      // succeeded above — log it and move on, matching the "graceful
      // degradation" call made when this module was designed.
      log.push(`⚠ Lỗi khi lấy dữ liệu Google Ads: ${err.message || err}. Phần organic vẫn được lưu bình thường.`);
    }
  } else {
    log.push("Google Ads chưa được cấu hình (thiếu GOOGLE_ADS_DEVELOPER_TOKEN/GOOGLE_ADS_CUSTOMER_ID) — bỏ qua phần chi tiêu.");
  }

  state.lastSyncedAt = now.toISOString();
  state.lastSyncLog = log.slice(-50); // bounded — this is a status readout, not an audit log

  return { ok: true, log, snapshotsAdded: newSnapshots.length, paidRowsAdded };
}

// ---------------------------------------------------------------------------
// Weekly delta computation — same algorithm as the Excel template's
// Weekly_Report sheet (this-snapshot minus the immediately-prior snapshot
// for the same videoId), just expressed as plain TypeScript instead of
// MAXIFS/SUMIFS. Computed fresh on every read rather than stored, so
// snapshots/paidSpend stay the single source of truth.
// ---------------------------------------------------------------------------
export function computeWeeklyReport(state: SocialReportState): WeeklyReportRow[] {
  const byVideo = new Map<string, OrganicSnapshot[]>();
  for (const snap of state.snapshots) {
    const list = byVideo.get(snap.videoId) || [];
    list.push(snap);
    byVideo.set(snap.videoId, list);
  }

  const rows: WeeklyReportRow[] = [];
  for (const snaps of byVideo.values()) {
    const sorted = [...snaps].sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate));
    for (let i = 0; i < sorted.length; i++) {
      const cur = sorted[i];
      const prev = i > 0 ? sorted[i - 1] : null;

      const weeklyViews = prev ? cur.viewsCumulative - prev.viewsCumulative : cur.viewsCumulative;
      const weeklyOrganicViews = prev
        ? cur.organicViewsCumulative - prev.organicViewsCumulative
        : cur.organicViewsCumulative;
      const weeklyImpressions = prev
        ? cur.impressionsCumulative - prev.impressionsCumulative
        : cur.impressionsCumulative;

      const weekSpend = sumSpend(state.paidSpend, cur.videoId, (p) => p.weekEnding === cur.snapshotDate);
      const spendYtd = sumSpend(state.paidSpend, cur.videoId, (p) => p.weekEnding <= cur.snapshotDate);

      rows.push({
        ...cur,
        weeklyViews,
        weeklyOrganicViews,
        weeklyImpressions,
        weekSpend,
        spendYtd,
        hasAds: spendYtd > 0,
      });
    }
  }

  return rows.sort((a, b) => b.snapshotDate.localeCompare(a.snapshotDate));
}

function sumSpend(paidSpend: PaidSpendRow[], videoId: string, predicate: (p: PaidSpendRow) => boolean): number {
  return paidSpend
    .filter((p) => p.videoId === videoId && predicate(p))
    .reduce((sum, p) => sum + p.spend, 0);
}
