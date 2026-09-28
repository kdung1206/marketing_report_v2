import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Globe, Search, Users, MousePointerClick, Eye, TrendingUp, RefreshCw, AlertCircle, Sparkles, Target } from "lucide-react";
import { safeFetchJson } from "../App";

// Local mirrors of the server row shapes (see src/server/googleWebsiteStore.ts)
// — same "don't import across the client/server boundary" convention as
// SocialReport.tsx.
interface GoogleWebsiteAccountMeta {
  id: string;
  brand: string | null;
  ga4_property_name: string | null;
  gsc_site_url: string | null;
  is_active: boolean;
}

interface Ga4InsightsDailyRow {
  account_id: string;
  date: string;
  sessions: number | null;
  active_users: number | null;
  new_users: number | null;
  engaged_sessions: number | null;
  avg_engagement_time_seconds: number | null;
  conversions: number | null;
  bounce_rate: number | null;
}

interface SearchConsoleInsightsDailyRow {
  account_id: string;
  date: string;
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
}

interface Ga4ChannelSessionsDailyRow {
  account_id: string;
  date: string;
  channel: string;
  sessions: number | null;
}

// Named groups the "Tổng hợp" tab's channel chart/table show individually —
// everything else GA4 reports (Paid Social, Display, Email, Affiliates,
// (not set)...) is bucketed into "Khác" (decision from Website Report
// redesign mục A: keep the chart readable rather than one line per GA4
// channel, most of which carry near-zero sessions for these two sites).
const NAMED_CHANNELS = ["Organic Search", "Paid Search", "Direct", "Organic Social", "Referral"] as const;
const CHANNEL_ORDER = [...NAMED_CHANNELS, "Khác"] as const;
const CHANNEL_COLORS: Record<string, string> = {
  "Organic Search": "#059669",
  "Paid Search": "#6366f1",
  Direct: "#0ea5e9",
  "Organic Social": "#ec4899",
  Referral: "#f59e0b",
  Khác: "#94a3b8",
};
function bucketChannel(raw: string): string {
  return (NAMED_CHANNELS as readonly string[]).includes(raw) ? raw : "Khác";
}

interface Ga4PageSummaryRow {
  account_id: string;
  page_path: string;
  screen_page_views: number | null;
  total_users: number | null;
  user_engagement_duration: number | null;
}

interface SearchConsolePageSummaryRow {
  account_id: string;
  page: string;
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
}

interface Ga4GeoSummaryRow {
  account_id: string;
  country: string;
  city: string;
  sessions: number | null;
  active_users: number | null;
}

interface Ga4DeviceSummaryRow {
  account_id: string;
  device_category: string;
  sessions: number | null;
  active_users: number | null;
}

interface SearchConsoleDeviceSummaryRow {
  account_id: string;
  device: string;
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
}

const DEVICE_COLORS: Record<string, string> = {
  MOBILE: "#6366f1",
  DESKTOP: "#0ea5e9",
  TABLET: "#f59e0b",
};

// Page-type classification — CHỐT dựa trên 250 URL thật của karofi.com (xem
// HANDOFF.md mục B). Áp dụng cho cả GA4 pagePath và Search Console page
// (page là URL đầy đủ nên strip origin trước khi phân loại). Nếu Livotec
// dùng nền tảng website khác (cấu trúc URL khác hẳn), quy tắc này CẦN kiểm
// tra lại qua route "Xem URL thật" trước khi tin tưởng — chưa làm riêng cho
// Livotec vì chưa có dữ liệu thật để đối chiếu.
const PAGE_TYPE_ORDER = ["Trang chủ", "Trang tĩnh", "Bài viết", "Sản phẩm", "Danh mục"] as const;
function classifyPageType(rawPath: string): string {
  let path = rawPath;
  try {
    // Search Console's `page` dimension is a full URL; GA4's `pagePath` is
    // already just a path — stripping an origin that isn't there is a no-op.
    path = new URL(rawPath, "https://placeholder.invalid").pathname;
  } catch {
    // Keep rawPath as-is if it isn't a parseable URL/path.
  }
  if (path.startsWith("/en")) path = path.slice(3) || "/";
  if (path === "" || path === "/") return "Trang chủ";
  if (path.startsWith("/trang/")) return "Trang tĩnh";
  if (/-bv\d+\.html$/i.test(path)) return "Bài viết";
  if (path.toLowerCase().endsWith(".html")) return "Sản phẩm";
  return "Danh mục";
}

interface KeywordRow {
  account_id: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

// Brand vs Non-brand — CHỐT: query chứa "karofi"/"livotec" (không phân biệt
// hoa thường) → Brand, còn lại → Non-brand (Website Report redesign mục C).
function isBrandQuery(query: string): boolean {
  const q = query.toLowerCase();
  return q.includes("karofi") || q.includes("livotec");
}

// Position badge color — chỉ mang tính trực quan (xanh: gần top 5, cam:
// 5-10, xám: xa hơn), không phải ngưỡng striking-distance (ngưỡng đó cấu
// hình riêng ở ô nhập bên dưới).
function positionBadgeColor(position: number): string {
  if (position < 5) return "text-emerald-600 bg-emerald-50";
  if (position <= 10) return "text-amber-600 bg-amber-50";
  return "text-slate-500 bg-slate-100";
}

const n = (v: number | null | undefined) => v || 0;
const fmt = (v: number) => new Intl.NumberFormat("vi-VN").format(Math.round(v));
const fmtCompact = (v: number) => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(v);
const fmtPercent = (v: number) => `${(v * 100).toFixed(1)}%`;
const fmtPercent2 = (v: number) => `${(v * 100).toFixed(2)}%`;

function todayStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

interface WebsiteReportProps {
  selectedBrand: "Livotec" | "Karofi";
  setSelectedBrand: (brand: "Livotec" | "Karofi") => void;
}

// GA4 + Search Console organic website insights, kept fully separate from
// the manual "SEO Website" spreadsheet category (data.ts/dashboard) per
// user request — this tab is additive, not a replacement.
export default function WebsiteReport({ selectedBrand, setSelectedBrand }: WebsiteReportProps) {
  const [activeSection, setActiveSection] = useState<"overview" | "ga4" | "search-console">("overview");

  // Search Console's ~2-3 day reporting lag means "today" is always empty —
  // default the window to end a few days back so the first load isn't
  // misleadingly sparse (see googleWebsiteSync.ts's fetchSearchConsoleDailyMetrics).
  const [since, setSince] = useState(todayStr(-33));
  const [until, setUntil] = useState(todayStr(-3));

  const [accounts, setAccounts] = useState<GoogleWebsiteAccountMeta[]>([]);
  const [ga4Daily, setGa4Daily] = useState<Ga4InsightsDailyRow[]>([]);
  const [gscDaily, setGscDaily] = useState<SearchConsoleInsightsDailyRow[]>([]);
  const [ga4ChannelDaily, setGa4ChannelDaily] = useState<Ga4ChannelSessionsDailyRow[]>([]);
  const [ga4Pages, setGa4Pages] = useState<Ga4PageSummaryRow[]>([]);
  const [gscPages, setGscPages] = useState<SearchConsolePageSummaryRow[]>([]);
  const [ga4Geo, setGa4Geo] = useState<Ga4GeoSummaryRow[]>([]);
  const [ga4Device, setGa4Device] = useState<Ga4DeviceSummaryRow[]>([]);
  const [gscDevice, setGscDevice] = useState<SearchConsoleDeviceSummaryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Striking-distance threshold — configurable on the UI, not hardcoded (see
  // Website Report redesign mục C). Filtering happens client-side against
  // `keywords` (already fetched in full), so changing these never re-fetches.
  const [minPosition, setMinPosition] = useState(4);
  const [maxPosition, setMaxPosition] = useState(20);
  const [minImpressions, setMinImpressions] = useState(10);
  const [keywords, setKeywords] = useState<KeywordRow[]>([]);
  const [keywordsLoading, setKeywordsLoading] = useState(true);
  const [keywordsError, setKeywordsError] = useState<string | null>(null);

  const brandAccounts = useMemo(() => accounts.filter((a) => a.brand === selectedBrand), [accounts, selectedBrand]);
  const accountIds = useMemo(() => brandAccounts.map((a) => a.id), [brandAccounts]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ since, until });
        const result = await safeFetchJson(`/api/google-website/insights?${params.toString()}`);
        if (cancelled) return;
        if (result.success) {
          setAccounts(result.accounts || []);
          setGa4Daily(result.ga4Daily || []);
          setGscDaily(result.gscDaily || []);
          setGa4ChannelDaily(result.ga4ChannelDaily || []);
          setGa4Pages(result.ga4Pages || []);
          setGscPages(result.gscPages || []);
          setGa4Geo(result.ga4Geo || []);
          setGa4Device(result.ga4Device || []);
          setGscDevice(result.gscDevice || []);
        } else {
          setError(result.error || "Không tải được dữ liệu Website Report.");
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Không tải được dữ liệu Website Report.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [since, until, selectedBrand]);

  // Separate effect/loading state from the insights fetch above — this one
  // hits the Search Console API live (no daily-sync table backs it, see
  // mục C), so it shouldn't block the rest of the tab from rendering while
  // it's in flight.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setKeywordsLoading(true);
      setKeywordsError(null);
      try {
        const params = new URLSearchParams({ since, until });
        const result = await safeFetchJson(`/api/google-website/keywords?${params.toString()}`);
        if (cancelled) return;
        if (result.success) {
          setKeywords(result.keywords || []);
        } else {
          setKeywordsError(result.error || "Không tải được từ khoá Search Console.");
        }
      } catch (err: any) {
        if (!cancelled) setKeywordsError(err.message || "Không tải được từ khoá Search Console.");
      } finally {
        if (!cancelled) setKeywordsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [since, until]);

  const ga4Scoped = useMemo(() => ga4Daily.filter((r) => accountIds.includes(r.account_id)), [ga4Daily, accountIds]);
  const gscScoped = useMemo(() => gscDaily.filter((r) => accountIds.includes(r.account_id)), [gscDaily, accountIds]);
  const channelScoped = useMemo(() => ga4ChannelDaily.filter((r) => accountIds.includes(r.account_id)), [ga4ChannelDaily, accountIds]);
  const ga4PagesScoped = useMemo(() => ga4Pages.filter((r) => accountIds.includes(r.account_id)), [ga4Pages, accountIds]);
  const gscPagesScoped = useMemo(() => gscPages.filter((r) => accountIds.includes(r.account_id)), [gscPages, accountIds]);
  const ga4GeoScoped = useMemo(() => ga4Geo.filter((r) => accountIds.includes(r.account_id)), [ga4Geo, accountIds]);
  const ga4DeviceScoped = useMemo(() => ga4Device.filter((r) => accountIds.includes(r.account_id)), [ga4Device, accountIds]);
  const gscDeviceScoped = useMemo(() => gscDevice.filter((r) => accountIds.includes(r.account_id)), [gscDevice, accountIds]);
  const keywordsScoped = useMemo(() => keywords.filter((r) => accountIds.includes(r.account_id)), [keywords, accountIds]);

  const ga4ByDate = useMemo(() => {
    const byDate = new Map<string, { date: string; sessions: number; active_users: number; new_users: number; engaged_sessions: number }>();
    ga4Scoped.forEach((r) => {
      const entry = byDate.get(r.date) || { date: r.date, sessions: 0, active_users: 0, new_users: 0, engaged_sessions: 0 };
      entry.sessions += n(r.sessions);
      entry.active_users += n(r.active_users);
      entry.new_users += n(r.new_users);
      entry.engaged_sessions += n(r.engaged_sessions);
      byDate.set(r.date, entry);
    });
    return Array.from(byDate.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [ga4Scoped]);

  const gscByDate = useMemo(() => {
    const byDate = new Map<string, { date: string; clicks: number; impressions: number; ctr: number; position: number; count: number }>();
    gscScoped.forEach((r) => {
      const entry = byDate.get(r.date) || { date: r.date, clicks: 0, impressions: 0, ctr: 0, position: 0, count: 0 };
      entry.clicks += n(r.clicks);
      entry.impressions += n(r.impressions);
      entry.ctr += n(r.ctr);
      entry.position += n(r.position);
      entry.count += 1;
      byDate.set(r.date, entry);
    });
    return Array.from(byDate.values())
      .map((e) => ({ date: e.date, clicks: e.clicks, impressions: e.impressions, ctr: e.count ? e.ctr / e.count : 0, position: e.count ? e.position / e.count : 0 }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [gscScoped]);

  // Per-channel sessions over time, one column per named group + "Khác" — for
  // the "Sessions theo kênh" stacked chart. Channel totals (below) reuse the
  // same rows so the chart and the "Nguồn traffic" table never disagree.
  const channelByDate = useMemo(() => {
    const byDate = new Map<string, Record<string, any>>();
    channelScoped.forEach((r) => {
      const bucket = bucketChannel(r.channel);
      const entry = byDate.get(r.date) || Object.fromEntries([["date", r.date], ...CHANNEL_ORDER.map((c) => [c, 0])]);
      entry[bucket] += n(r.sessions);
      byDate.set(r.date, entry);
    });
    return Array.from(byDate.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [channelScoped]);

  const channelTotals = useMemo(() => {
    const totals = new Map<string, number>(CHANNEL_ORDER.map((c) => [c, 0]));
    channelScoped.forEach((r) => {
      const bucket = bucketChannel(r.channel);
      totals.set(bucket, (totals.get(bucket) || 0) + n(r.sessions));
    });
    const grandTotal = Array.from(totals.values()).reduce((s, v) => s + v, 0);
    return CHANNEL_ORDER.map((channel) => {
      const sessions = totals.get(channel) || 0;
      return { channel, sessions, share: grandTotal ? sessions / grandTotal : 0 };
    });
  }, [channelScoped]);

  const sessionsTotal = ga4Scoped.reduce((s, r) => s + n(r.sessions), 0);
  const organicSessionsTotal = ga4Scoped.reduce((s, r) => s + n(r.organic_sessions), 0);
  const activeUsersTotal = ga4Scoped.reduce((s, r) => s + n(r.active_users), 0);
  const newUsersTotal = ga4Scoped.reduce((s, r) => s + n(r.new_users), 0);
  const clicksTotal = gscScoped.reduce((s, r) => s + n(r.clicks), 0);
  const impressionsTotal = gscScoped.reduce((s, r) => s + n(r.impressions), 0);
  // Overall ratios, not a mean of daily ratios — clicksTotal/impressionsTotal
  // (and position weighted by each day's impressions) is the mathematically
  // correct way to combine per-day CTR/position into one period figure; a
  // plain average of daily percentages skews toward low-traffic days.
  const avgCtr = impressionsTotal ? clicksTotal / impressionsTotal : 0;
  const avgPosition = impressionsTotal ? gscScoped.reduce((s, r) => s + n(r.position) * n(r.impressions), 0) / impressionsTotal : 0;
  const periodWeeks = Math.max(1, Math.round((new Date(until).getTime() - new Date(since).getTime()) / (7 * 24 * 60 * 60 * 1000)));

  // GA4/Search Console pages grouped into the chốt page-type buckets (see
  // classifyPageType) — powers the "Top pages"/"Organic pages" cards. These
  // come from a fixed ~30-day rolling snapshot refreshed on each daily sync
  // (see googleWebsiteSync.ts's fetchGa4PageMetrics/listSearchConsoleTopPages
  // calls), independent of the KPI tiles' custom since/until range above.
  const ga4PagesByType = useMemo(() => {
    const totals = new Map<string, { views: number; users: number; engagement: number }>();
    ga4PagesScoped.forEach((r) => {
      const type = classifyPageType(r.page_path);
      const entry = totals.get(type) || { views: 0, users: 0, engagement: 0 };
      entry.views += n(r.screen_page_views);
      entry.users += n(r.total_users);
      entry.engagement += n(r.user_engagement_duration);
      totals.set(type, entry);
    });
    return PAGE_TYPE_ORDER.map((type) => ({ type, ...(totals.get(type) || { views: 0, users: 0, engagement: 0 }) }));
  }, [ga4PagesScoped]);

  const gscPagesByType = useMemo(() => {
    const totals = new Map<string, { clicks: number; impressions: number }>();
    gscPagesScoped.forEach((r) => {
      const type = classifyPageType(r.page);
      const entry = totals.get(type) || { clicks: 0, impressions: 0 };
      entry.clicks += n(r.clicks);
      entry.impressions += n(r.impressions);
      totals.set(type, entry);
    });
    return PAGE_TYPE_ORDER.map((type) => {
      const t = totals.get(type) || { clicks: 0, impressions: 0 };
      return { type, ...t, ctr: t.impressions ? t.clicks / t.impressions : 0 };
    });
  }, [gscPagesScoped]);

  // Mục D: GA4 Country/City (top 10 by sessions), Device category split, and
  // Search Console's own Device breakdown — all rolling ~30-day snapshots,
  // same independence-from-since/until caveat as ga4Pages/gscPages above.
  const ga4TopGeo = useMemo(() => {
    return [...ga4GeoScoped].sort((a, b) => n(b.sessions) - n(a.sessions)).slice(0, 10);
  }, [ga4GeoScoped]);

  const ga4DeviceBreakdown = useMemo(() => {
    const totals = new Map<string, { sessions: number; active_users: number }>();
    ga4DeviceScoped.forEach((r) => {
      const key = r.device_category || "(not set)";
      const entry = totals.get(key) || { sessions: 0, active_users: 0 };
      entry.sessions += n(r.sessions);
      entry.active_users += n(r.active_users);
      totals.set(key, entry);
    });
    const grandTotal = Array.from(totals.values()).reduce((s, v) => s + v.sessions, 0);
    return Array.from(totals.entries())
      .map(([device_category, v]) => ({ device_category, ...v, share: grandTotal ? v.sessions / grandTotal : 0 }))
      .sort((a, b) => b.sessions - a.sessions);
  }, [ga4DeviceScoped]);

  const gscDeviceBreakdown = useMemo(() => {
    const totals = new Map<string, { clicks: number; impressions: number }>();
    gscDeviceScoped.forEach((r) => {
      const key = r.device || "(not set)";
      const entry = totals.get(key) || { clicks: 0, impressions: 0 };
      entry.clicks += n(r.clicks);
      entry.impressions += n(r.impressions);
      totals.set(key, entry);
    });
    return Array.from(totals.entries())
      .map(([device, v]) => ({ device, ...v, ctr: v.impressions ? v.clicks / v.impressions : 0 }))
      .sort((a, b) => b.clicks - a.clicks);
  }, [gscDeviceScoped]);

  // Per-card "đánh giá nhanh" — one short sentence each, same "derived from
  // data already on screen" convention as mục A's narrative, scoped to just
  // that card instead of the whole tab.
  const ga4PagesInsight = useMemo(() => {
    const totalViews = ga4PagesByType.reduce((s, r) => s + r.views, 0);
    if (!totalViews) return null;
    const top = [...ga4PagesByType].sort((a, b) => b.views - a.views)[0];
    const share = (top.views / totalViews) * 100;
    return `${top.type} chiếm ${share.toFixed(0)}% tổng pageviews (${fmt(top.views)} lượt xem) — nhóm trang đóng góp traffic lớn nhất.`;
  }, [ga4PagesByType]);

  const gscPagesInsight = useMemo(() => {
    const totalClicks = gscPagesByType.reduce((s, r) => s + r.clicks, 0);
    if (!totalClicks) return null;
    const top = [...gscPagesByType].sort((a, b) => b.clicks - a.clicks)[0];
    const share = (top.clicks / totalClicks) * 100;
    return `${top.type} mang lại nhiều organic clicks nhất (${fmt(top.clicks)} clicks, ${share.toFixed(0)}% tổng), CTR ${fmtPercent(top.ctr)}.`;
  }, [gscPagesByType]);

  // Brand vs Non-brand split — over every fetched keyword (not just the
  // striking-distance subset below), so it represents the whole organic
  // query mix (Website Report redesign mục C).
  const brandSplit = useMemo(() => {
    const totals = { brand: { clicks: 0, impressions: 0 }, nonBrand: { clicks: 0, impressions: 0 } };
    keywordsScoped.forEach((r) => {
      const bucket = isBrandQuery(r.query) ? totals.brand : totals.nonBrand;
      bucket.clicks += n(r.clicks);
      bucket.impressions += n(r.impressions);
    });
    const totalImpressions = totals.brand.impressions + totals.nonBrand.impressions;
    return {
      ...totals,
      brandShare: totalImpressions ? totals.brand.impressions / totalImpressions : 0,
      nonBrandShare: totalImpressions ? totals.nonBrand.impressions / totalImpressions : 0,
    };
  }, [keywordsScoped]);

  // Striking-distance keywords — position within [minPosition, maxPosition]
  // and at least minImpressions, both configurable on the UI (mục C: "PHẢI
  // làm dạng cấu hình được", not hardcoded). Sorted by impressions so the
  // biggest opportunities surface first.
  const strikingDistanceKeywords = useMemo(() => {
    return keywordsScoped
      .filter((r) => r.position >= minPosition && r.position <= maxPosition && r.impressions >= minImpressions)
      .sort((a, b) => b.impressions - a.impressions);
  }, [keywordsScoped, minPosition, maxPosition, minImpressions]);

  const keywordsInsight = useMemo(() => {
    if (strikingDistanceKeywords.length === 0) return null;
    const nonBrand = strikingDistanceKeywords.filter((r) => !isBrandQuery(r.query));
    const top = strikingDistanceKeywords[0];
    return `${nonBrand.length}/${strikingDistanceKeywords.length} từ khoá là non-brand — ưu tiên tối ưu on-page cho "${top.query}" trước (${fmt(top.impressions)} impressions, vị trí ${top.position.toFixed(1)}).`;
  }, [strikingDistanceKeywords]);

  // "Nhận định nhanh" narrative — a handful of bullets derived purely from
  // data already on screen (no extra fetch), key numbers bolded — matches
  // the approved demo layout (see Website Report redesign mục A).
  const organicShare = sessionsTotal ? (organicSessionsTotal / sessionsTotal) * 100 : 0;
  const narrative = useMemo((): React.ReactNode[] => {
    const B = (v: React.ReactNode) => <strong className="font-bold text-indigo-600">{v}</strong>;
    const positionNote =
      avgPosition > 20 ? " — còn khá xa trang 1, cần cải thiện SEO on-page/nội dung" : avgPosition > 10 ? " — gần trang 1, còn dư địa cải thiện" : avgPosition > 0 ? " — đã ở nhóm đầu kết quả tìm kiếm" : "";
    const sentences: React.ReactNode[] = [
      <>
        Website nhận {B(`${fmt(sessionsTotal)} sessions`)} trong giai đoạn đã chọn, {B(`${organicShare.toFixed(2)}%`)} đến từ Organic Search.
      </>,
      <>
        Search Console ghi nhận {B(`${fmt(clicksTotal)} clicks`)} tự nhiên trên {B(`${fmt(impressionsTotal)} impressions`)} — CTR trung bình {B(fmtPercent2(avgCtr))}, vị trí trung bình {B(avgPosition.toFixed(1))}
        {positionNote}.
      </>,
    ];
    if (!keywordsLoading && strikingDistanceKeywords.length > 0) {
      const keywordImpressions = strikingDistanceKeywords.reduce((s, r) => s + r.impressions, 0);
      sentences.push(
        <>
          {B(`${strikingDistanceKeywords.length} từ khoá`)} đang ở vị trí {minPosition}–{maxPosition} với tổng {B(`${fmt(keywordImpressions)} impressions`)} — dư địa SEO gần nhất để đẩy lên top.
        </>
      );
    }
    return sentences;
  }, [sessionsTotal, organicShare, clicksTotal, impressionsTotal, avgCtr, avgPosition, keywordsLoading, strikingDistanceKeywords, minPosition, maxPosition]);

  const sections: { id: "overview" | "ga4" | "search-console"; label: string }[] = [
    { id: "overview", label: "Tổng hợp" },
    { id: "ga4", label: "GA4" },
    { id: "search-console", label: "Search Console" },
  ];

  const hasAccounts = brandAccounts.some((a) => a.is_active);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-bold uppercase tracking-wider text-slate-800">Website Report</h1>
          <div className="flex rounded-lg bg-slate-100/80 border border-slate-200/50 p-0.5">
            <button
              onClick={() => setSelectedBrand("Livotec")}
              className={`rounded-md px-4 py-1 text-xs font-bold transition-all ${
                selectedBrand === "Livotec" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              LIVOTEC
            </button>
            <button
              onClick={() => setSelectedBrand("Karofi")}
              className={`rounded-md px-4 py-1 text-xs font-bold transition-all ${
                selectedBrand === "Karofi" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              KAROFI
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={since} onChange={(e) => setSince(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs" />
          <span className="text-xs text-slate-400">→</span>
          <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
              activeSection === s.id ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang tải dữ liệu...
        </div>
      ) : !hasAccounts ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Globe className="mx-auto h-8 w-8 text-slate-300" />
          <h2 className="mt-3 text-sm font-bold text-slate-800">Chưa có kết nối GA4/Search Console nào cho thương hiệu này</h2>
          <p className="mt-1 text-xs text-slate-500">Vào Control Panel → "Kết nối nền tảng" → Google (Admin) để kết nối Website qua OAuth.</p>
        </div>
      ) : (
        <>
          {activeSection === "overview" && (
            <div className="space-y-6">
              {/* 1. KPI tổng quan */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                <PlatformStat icon={Users} label="Sessions" value={fmtCompact(sessionsTotal)} sub={`${periodWeeks} tuần`} color="text-indigo-600 bg-indigo-50 border-indigo-200" />
                <PlatformStat
                  icon={TrendingUp}
                  label="Organic Sessions"
                  value={fmtCompact(organicSessionsTotal)}
                  sub={`${organicShare.toFixed(2)}% tổng sessions`}
                  color="text-indigo-600 bg-indigo-50 border-indigo-200"
                />
                <PlatformStat icon={Eye} label="GSC Impressions" value={fmtCompact(impressionsTotal)} sub="Search Console" color="text-sky-600 bg-sky-50 border-sky-200" />
                <PlatformStat icon={MousePointerClick} label="GSC Clicks" value={fmtCompact(clicksTotal)} sub={`CTR ${fmtPercent2(avgCtr)}`} color="text-sky-600 bg-sky-50 border-sky-200" />
                <PlatformStat icon={Target} label="Avg Position" value={avgPosition ? avgPosition.toFixed(1) : "—"} sub="weighted theo impressions" color="text-sky-600 bg-sky-50 border-sky-200" />
              </div>

              {/* 2. Nhận định nhanh */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                <div className="flex items-center gap-1.5 pb-2 text-xs font-bold uppercase tracking-wide text-indigo-500">
                  <Sparkles className="h-3.5 w-3.5" /> Nhận định nhanh
                </div>
                <ul className="list-disc space-y-1.5 pl-4">
                  {narrative.map((sentence, i) => (
                    <li key={i} className="text-xs leading-relaxed text-slate-700">
                      {sentence}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Sessions theo kênh + Nguồn traffic, cạnh nhau để so sánh trực tiếp */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="h-80 rounded-xl border border-slate-100 bg-white p-4 shadow-sm lg:col-span-3">
                  <span className="block pb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Sessions theo kênh</span>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={channelByDate}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tickFormatter={fmtCompact} />
                      <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                      <Legend />
                      {CHANNEL_ORDER.map((channel) => (
                        <Bar key={channel} dataKey={channel} name={channel} stackId="channel" fill={CHANNEL_COLORS[channel]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm lg:col-span-2">
                  <span className="block pb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Nguồn traffic (giai đoạn đã chọn)</span>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-slate-400">
                        <th className="pb-2 font-medium">Kênh</th>
                        <th className="pb-2 font-medium text-right">Sessions</th>
                        <th className="pb-2 font-medium text-right">Tỉ trọng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channelTotals.map((row) => (
                        <tr key={row.channel} className="border-b border-slate-50 last:border-0">
                          <td className="py-2">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHANNEL_COLORS[row.channel] }} />
                              {row.channel}
                            </span>
                          </td>
                          <td className="py-2 text-right font-mono">{fmt(row.sessions)}</td>
                          <td className="py-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-mono">{fmtPercent2(row.share)}</span>
                              <span className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-100">
                                <span className="block h-full rounded-full" style={{ width: `${(row.share * 100).toFixed(0)}%`, backgroundColor: CHANNEL_COLORS[row.channel] }} />
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Top pages (GA4) & Organic pages (Search Console), nhóm theo loại trang */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">Top pages (GA4)</span>
                  <span className="block pb-3 text-[11px] text-slate-400">Theo loại trang · 30 ngày gần nhất</span>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-slate-400">
                        <th className="pb-2 font-medium">Loại trang</th>
                        <th className="pb-2 font-medium text-right">Pageviews</th>
                        <th className="pb-2 font-medium text-right">Users</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ga4PagesByType.map((row) => (
                        <tr key={row.type} className="border-b border-slate-50 last:border-0">
                          <td className="py-2">{row.type}</td>
                          <td className="py-2 text-right font-mono">{fmt(row.views)}</td>
                          <td className="py-2 text-right font-mono">{fmt(row.users)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {ga4PagesInsight && <p className="pt-3 text-[11px] italic text-slate-400">{ga4PagesInsight}</p>}
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">Organic pages (Search Console)</span>
                  <span className="block pb-3 text-[11px] text-slate-400">Theo loại trang · 30 ngày gần nhất</span>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-slate-400">
                        <th className="pb-2 font-medium">Loại trang</th>
                        <th className="pb-2 font-medium text-right">Clicks</th>
                        <th className="pb-2 font-medium text-right">Impressions</th>
                        <th className="pb-2 font-medium text-right">CTR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gscPagesByType.map((row) => (
                        <tr key={row.type} className="border-b border-slate-50 last:border-0">
                          <td className="py-2">{row.type}</td>
                          <td className="py-2 text-right font-mono">{fmt(row.clicks)}</td>
                          <td className="py-2 text-right font-mono">{fmt(row.impressions)}</td>
                          <td className="py-2 text-right font-mono">{fmtPercent(row.ctr)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {gscPagesInsight && <p className="pt-3 text-[11px] italic text-slate-400">{gscPagesInsight}</p>}
                </div>
              </div>

              {/* 5. Từ khoá tiềm năng SEO (striking-distance) + Brand/Non-brand */}
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Từ khoá tiềm năng SEO (striking-distance keywords)</span>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span>Vị trí</span>
                    <input
                      type="number"
                      value={minPosition}
                      onChange={(e) => setMinPosition(Number(e.target.value) || 0)}
                      className="w-14 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                    />
                    <span>–</span>
                    <input
                      type="number"
                      value={maxPosition}
                      onChange={(e) => setMaxPosition(Number(e.target.value) || 0)}
                      className="w-14 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                    />
                    <span>· Impressions tối thiểu</span>
                    <input
                      type="number"
                      value={minImpressions}
                      onChange={(e) => setMinImpressions(Number(e.target.value) || 0)}
                      className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                    />
                  </div>
                </div>

                <div className="mb-3 flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400">Brand / Non-brand (impressions):</span>
                  <span className="flex h-2 flex-1 max-w-xs overflow-hidden rounded-full bg-slate-100">
                    <span className="block h-full bg-indigo-500" style={{ width: `${(brandSplit.brandShare * 100).toFixed(0)}%` }} />
                    <span className="block h-full bg-sky-400" style={{ width: `${(brandSplit.nonBrandShare * 100).toFixed(0)}%` }} />
                  </span>
                  <span className="font-mono text-indigo-600">{fmtPercent(brandSplit.brandShare)} Brand</span>
                  <span className="font-mono text-sky-600">{fmtPercent(brandSplit.nonBrandShare)} Non-brand</span>
                </div>

                {keywordsError && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-700">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {keywordsError}
                  </div>
                )}
                {keywordsLoading ? (
                  <div className="flex items-center gap-2 py-4 text-xs text-slate-400">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang tải từ khoá Search Console...
                  </div>
                ) : strikingDistanceKeywords.length === 0 ? (
                  <p className="py-4 text-xs text-slate-400">
                    Không có từ khoá nào ở vị trí {minPosition}–{maxPosition} với ≥{minImpressions} impressions trong giai đoạn đã chọn.
                  </p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-slate-400">
                        <th className="pb-2 font-medium">Query</th>
                        <th className="pb-2 font-medium">Loại</th>
                        <th className="pb-2 font-medium text-right">Impressions</th>
                        <th className="pb-2 font-medium text-right">Clicks</th>
                        <th className="pb-2 font-medium text-right">CTR</th>
                        <th className="pb-2 font-medium text-right">Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {strikingDistanceKeywords.slice(0, 50).map((row) => (
                        <tr key={row.query} className="border-b border-slate-50 last:border-0">
                          <td className="py-2 text-indigo-700">{row.query}</td>
                          <td className="py-2 text-slate-400">{isBrandQuery(row.query) ? "Brand" : "Non-brand"}</td>
                          <td className="py-2 text-right font-mono">{fmt(row.impressions)}</td>
                          <td className="py-2 text-right font-mono">{fmt(row.clicks)}</td>
                          <td className="py-2 text-right font-mono">{fmtPercent(row.ctr)}</td>
                          <td className="py-2 text-right">
                            <span className={`rounded-md px-1.5 py-0.5 font-mono font-bold ${positionBadgeColor(row.position)}`}>{row.position.toFixed(1)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {keywordsInsight && <p className="pt-3 text-[11px] italic text-slate-400">{keywordsInsight}</p>}
              </div>
            </div>
          )}

          {activeSection === "ga4" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <PlatformStat icon={Users} label="Sessions" value={fmtCompact(sessionsTotal)} color="text-indigo-600 bg-indigo-50 border-indigo-200" />
                <PlatformStat icon={TrendingUp} label="Active Users" value={fmtCompact(activeUsersTotal)} color="text-indigo-600 bg-indigo-50 border-indigo-200" />
                <PlatformStat icon={Users} label="New Users" value={fmtCompact(newUsersTotal)} color="text-indigo-600 bg-indigo-50 border-indigo-200" />
                <PlatformStat
                  icon={TrendingUp}
                  label="Engaged Sessions"
                  value={fmtCompact(ga4Scoped.reduce((s, r) => s + n(r.engaged_sessions), 0))}
                  color="text-indigo-600 bg-indigo-50 border-indigo-200"
                />
              </div>

              <div className="h-80 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className="block pb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Sessions & Users theo ngày</span>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={ga4ByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={fmtCompact} domain={["auto", "auto"]} />
                    <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                    <Legend />
                    <Line type="monotone" dataKey="sessions" name="Sessions" stroke="#6366f1" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="active_users" name="Active Users" stroke="#a855f7" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="new_users" name="New Users" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Mục D: Country/City + Device category — rolling ~30-day snapshot */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">Quốc gia / Thành phố</span>
                  <span className="block pb-3 text-[11px] text-slate-400">Top 10 theo sessions · 30 ngày gần nhất</span>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-slate-400">
                        <th className="pb-2 font-medium">Quốc gia</th>
                        <th className="pb-2 font-medium">Thành phố</th>
                        <th className="pb-2 font-medium text-right">Sessions</th>
                        <th className="pb-2 font-medium text-right">Users</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ga4TopGeo.map((row, i) => (
                        <tr key={`${row.country}-${row.city}-${i}`} className="border-b border-slate-50 last:border-0">
                          <td className="py-2">{row.country}</td>
                          <td className="py-2 text-slate-500">{row.city}</td>
                          <td className="py-2 text-right font-mono">{fmt(n(row.sessions))}</td>
                          <td className="py-2 text-right font-mono">{fmt(n(row.active_users))}</td>
                        </tr>
                      ))}
                      {ga4TopGeo.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-400">
                            Chưa có dữ liệu.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="h-64 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">Device category</span>
                  <span className="block pb-2 text-[11px] text-slate-400">30 ngày gần nhất</span>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={ga4DeviceBreakdown} layout="vertical" margin={{ left: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tickFormatter={fmtCompact} />
                      <YAxis type="category" dataKey="device_category" tick={{ fontSize: 11 }} width={70} />
                      <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                      <Bar dataKey="sessions" name="Sessions" radius={[0, 4, 4, 0]}>
                        {ga4DeviceBreakdown.map((row) => (
                          <Cell key={row.device_category} fill={DEVICE_COLORS[row.device_category?.toUpperCase()] || "#94a3b8"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeSection === "search-console" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <PlatformStat icon={MousePointerClick} label="Clicks" value={fmtCompact(clicksTotal)} color="text-sky-600 bg-sky-50 border-sky-200" />
                <PlatformStat icon={Eye} label="Impressions" value={fmtCompact(impressionsTotal)} color="text-sky-600 bg-sky-50 border-sky-200" />
                <PlatformStat icon={Search} label="CTR trung bình" value={fmtPercent(avgCtr)} color="text-sky-600 bg-sky-50 border-sky-200" />
                <PlatformStat icon={TrendingUp} label="Vị trí trung bình" value={avgPosition.toFixed(1)} color="text-sky-600 bg-sky-50 border-sky-200" />
              </div>

              <div className="h-80 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className="block pb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Clicks & Impressions theo ngày</span>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={gscByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={fmtCompact} />
                    <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                    <Legend />
                    <Bar dataKey="clicks" name="Clicks" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="impressions" name="Impressions" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-64 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className="block pb-4 text-xs font-bold uppercase tracking-wide text-slate-400">CTR & Vị trí trung bình theo ngày</span>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={gscByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="ctr" tickFormatter={fmtPercent} />
                    <YAxis yAxisId="position" orientation="right" reversed />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                    <Legend />
                    <Line yAxisId="ctr" type="monotone" dataKey="ctr" name="CTR" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                    <Line yAxisId="position" type="monotone" dataKey="position" name="Vị trí trung bình" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Mục D: Search Console's own Device dimension (organic-only, khác GA4 Device) */}
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">Device (Search Console)</span>
                <span className="block pb-3 text-[11px] text-slate-400">30 ngày gần nhất</span>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-slate-400">
                      <th className="pb-2 font-medium">Thiết bị</th>
                      <th className="pb-2 font-medium text-right">Clicks</th>
                      <th className="pb-2 font-medium text-right">Impressions</th>
                      <th className="pb-2 font-medium text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gscDeviceBreakdown.map((row) => (
                      <tr key={row.device} className="border-b border-slate-50 last:border-0">
                        <td className="py-2">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DEVICE_COLORS[row.device?.toUpperCase()] || "#94a3b8" }} />
                            {row.device}
                          </span>
                        </td>
                        <td className="py-2 text-right font-mono">{fmt(row.clicks)}</td>
                        <td className="py-2 text-right font-mono">{fmt(row.impressions)}</td>
                        <td className="py-2 text-right font-mono">{fmtPercent(row.ctr)}</td>
                      </tr>
                    ))}
                    {gscDeviceBreakdown.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400">
                          Chưa có dữ liệu.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PlatformStat({ icon: Icon, label, value, color, sub }: { icon: typeof Globe; label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="block text-xs font-medium uppercase tracking-tight text-slate-400">{label}</span>
          <span className="block font-mono text-lg font-bold tracking-tight text-slate-900">{value}</span>
          {sub && <span className="block text-[11px] text-slate-400">{sub}</span>}
        </div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
