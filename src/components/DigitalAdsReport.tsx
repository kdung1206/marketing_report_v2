import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  Eye,
  MousePointerClick,
  Users,
  Target,
  RefreshCw,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { safeFetchJson } from "../App";
import { AdsPerformanceRow, AdsChannel } from "../lib/adsImport";

// Local mirror of the server row shape (see src/server/adsPerformanceStore.ts)
// — same "don't import across the client/server boundary" convention as
// FacebookInsights.tsx. AdsPerformanceRow/AdsChannel are already defined in
// src/lib/adsImport.ts (shared with the upload parsers), reused here as-is.

const CHANNEL_COLORS: Record<AdsChannel, string> = {
  facebook: "#3b82f6",
  google: "#f59e0b",
  tiktok: "#10b981",
};
const CHANNEL_LABELS: Record<AdsChannel, string> = {
  facebook: "Facebook",
  google: "Google",
  tiktok: "TikTok",
};

const n = (v: number | null | undefined) => v || 0;
const fmt = (v: number) => new Intl.NumberFormat("vi-VN").format(Math.round(v));
const fmtCompact = (v: number) => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(v);
const fmtPct = (v: number) => `${(v * 100).toFixed(2)}%`;

function todayStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function safeDiv(a: number, b: number): number {
  return b > 0 ? a / b : 0;
}

// Sums the metrics that make sense to sum across a set of rows — used both
// for whole-tab KPI totals and for per-campaign/per-date aggregation. Typed
// to only the numeric fields it reads (not the full AdsPerformanceRow) so it
// can also re-sum already-aggregated rows (e.g. AdsDrilldownTable grouping
// per-ad totals back up into ad-set/campaign totals).
function sumRows(rows: Pick<AdsPerformanceRow, "spend" | "impressions" | "clicks" | "reach" | "video_views" | "conversions">[]) {
  return rows.reduce(
    (t, r) => ({
      spend: t.spend + n(r.spend),
      impressions: t.impressions + n(r.impressions),
      clicks: t.clicks + n(r.clicks),
      reach: t.reach + n(r.reach),
      video_views: t.video_views + n(r.video_views),
      conversions: t.conversions + n(r.conversions),
    }),
    { spend: 0, impressions: 0, clicks: 0, reach: 0, video_views: 0, conversions: 0 }
  );
}

function aggregateByCampaign(rows: AdsPerformanceRow[]) {
  const byKey = new Map<string, { channel: AdsChannel; campaign_name: string; ad_group_name: string; ad_name: string } & ReturnType<typeof sumRows>>();
  for (const r of rows) {
    const key = `${r.channel}|${r.campaign_name}|${r.ad_group_name}|${r.ad_name}`;
    const existing = byKey.get(key);
    const totals = sumRows([r]);
    if (existing) {
      existing.spend += totals.spend;
      existing.impressions += totals.impressions;
      existing.clicks += totals.clicks;
      existing.reach += totals.reach;
      existing.video_views += totals.video_views;
      existing.conversions += totals.conversions;
    } else {
      byKey.set(key, { channel: r.channel, campaign_name: r.campaign_name, ad_group_name: r.ad_group_name, ad_name: r.ad_name, ...totals });
    }
  }
  return Array.from(byKey.values()).sort((a, b) => b.spend - a.spend);
}

function aggregateByDate(rows: AdsPerformanceRow[]) {
  const byDate = new Map<string, ReturnType<typeof sumRows> & { date: string }>();
  for (const r of rows) {
    const totals = sumRows([r]);
    const existing = byDate.get(r.date);
    if (existing) {
      existing.spend += totals.spend;
      existing.impressions += totals.impressions;
      existing.clicks += totals.clicks;
      existing.reach += totals.reach;
      existing.video_views += totals.video_views;
      existing.conversions += totals.conversions;
    } else {
      byDate.set(r.date, { date: r.date, ...totals });
    }
  }
  return Array.from(byDate.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
}

interface KpiCard {
  title: string;
  value: string;
  icon: typeof DollarSign;
  color: string;
}

function KpiGrid({ cards }: { cards: KpiCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="block text-xs font-medium uppercase tracking-tight text-slate-400">{card.title}</span>
                <span className="block font-mono text-xl font-bold tracking-tight text-slate-900">{card.value}</span>
              </div>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${card.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChartCard({ title, children, height = "h-80" }: { title: string; children: React.ReactNode; height?: string }) {
  return (
    <div className={`${height} rounded-xl border border-slate-100 bg-white p-4 shadow-sm`}>
      <span className="block pb-4 text-xs font-bold uppercase tracking-wide text-slate-400">{title}</span>
      <ResponsiveContainer width="100%" height="85%">
        {children as any}
      </ResponsiveContainer>
    </div>
  );
}

const ADS_DRILLDOWN_PAGE_SIZE = 30;

type AdsDrilldownRow = ReturnType<typeof aggregateByCampaign>[number];

interface AdGroupNode {
  ad_group_name: string;
  ads: AdsDrilldownRow[];
  totals: ReturnType<typeof sumRows>;
}

interface CampaignNode {
  channel: AdsChannel;
  campaign_name: string;
  adGroups: AdGroupNode[];
  totals: ReturnType<typeof sumRows>;
}

// Groups the already-per-ad-aggregated rows (aggregateByCampaign — one row
// per channel+campaign+ad_group+ad, summed across the selected date range)
// into a 3-level tree: campaign -> ad group -> ad. No new data fetch/shape
// needed — this is purely a client-side regroup of the same rows the old
// flat CampaignTable rendered one-per-ad.
function buildCampaignTree(rows: AdsDrilldownRow[]): CampaignNode[] {
  const byCampaign = new Map<string, { channel: AdsChannel; campaign_name: string; byAdGroup: Map<string, AdsDrilldownRow[]> }>();
  for (const r of rows) {
    const cKey = `${r.channel}|${r.campaign_name}`;
    let c = byCampaign.get(cKey);
    if (!c) {
      c = { channel: r.channel, campaign_name: r.campaign_name, byAdGroup: new Map() };
      byCampaign.set(cKey, c);
    }
    const ads = c.byAdGroup.get(r.ad_group_name) || [];
    ads.push(r);
    c.byAdGroup.set(r.ad_group_name, ads);
  }

  const campaigns: CampaignNode[] = Array.from(byCampaign.values()).map((c) => {
    const adGroups: AdGroupNode[] = Array.from(c.byAdGroup.entries())
      .map(([ad_group_name, ads]) => ({
        ad_group_name,
        ads: ads.slice().sort((a, b) => b.spend - a.spend),
        totals: sumRows(ads),
      }))
      .sort((a, b) => b.totals.spend - a.totals.spend);
    return { channel: c.channel, campaign_name: c.campaign_name, adGroups, totals: sumRows(adGroups.flatMap((ag) => ag.ads)) };
  });

  return campaigns.sort((a, b) => b.totals.spend - a.totals.spend);
}

function metricCells(m: ReturnType<typeof sumRows>, extraColumns?: { label: string; render: (r: ReturnType<typeof sumRows>) => React.ReactNode }[]) {
  return (
    <>
      <td className="px-3 py-2 text-right">{fmt(m.spend)}</td>
      <td className="px-3 py-2 text-right">{fmt(m.impressions)}</td>
      <td className="px-3 py-2 text-right">{fmt(m.clicks)}</td>
      <td className="px-3 py-2 text-right">{fmtPct(safeDiv(m.clicks, m.impressions))}</td>
      {extraColumns?.map((col) => (
        <td key={col.label} className="px-3 py-2 text-right">
          {col.render(m)}
        </td>
      ))}
    </>
  );
}

// Campaign → Ad set → Ad drilldown table — click a Campaign row to expand
// its ad groups, click an ad group to expand its individual ads, so a
// campaign with many ads doesn't force one flat row per ad (the old
// CampaignTable's shape) when most of the time only the campaign-level
// total is needed. See the approved demo artifact for the interaction this
// mirrors.
function AdsDrilldownTable({
  rows,
  showChannel,
  extraColumns,
}: {
  rows: AdsDrilldownRow[];
  showChannel?: boolean;
  extraColumns?: { label: string; render: (r: ReturnType<typeof sumRows>) => React.ReactNode }[];
}) {
  const campaigns = useMemo(() => buildCampaignTree(rows), [rows]);

  const [openCampaigns, setOpenCampaigns] = useState<Set<string>>(new Set());
  const [openAdGroups, setOpenAdGroups] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  // Reset to page 1 whenever the underlying data set changes (new date
  // range/channel/brand) — otherwise a page number from a previous, longer
  // result set could point past the end of a shorter one.
  useEffect(() => setPage(1), [rows]);

  const totalPages = Math.max(1, Math.ceil(campaigns.length / ADS_DRILLDOWN_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * ADS_DRILLDOWN_PAGE_SIZE;
  const pageCampaigns = campaigns.slice(startIdx, startIdx + ADS_DRILLDOWN_PAGE_SIZE);

  function toggle(set: Set<string>, setSet: (s: Set<string>) => void, key: string) {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSet(next);
  }

  const colCount = (showChannel ? 1 : 0) + 5 + (extraColumns?.length || 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[720px] text-xs">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-3 py-2 text-left">Campaign / Ad set / Ad</th>
            {showChannel && <th className="px-3 py-2 text-left">Kênh</th>}
            <th className="px-3 py-2 text-right">Chi phí</th>
            <th className="px-3 py-2 text-right">Impressions</th>
            <th className="px-3 py-2 text-right">Clicks</th>
            <th className="px-3 py-2 text-right">CTR</th>
            {extraColumns?.map((col) => (
              <th key={col.label} className="px-3 py-2 text-right">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {campaigns.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="px-3 py-6 text-center text-slate-400">
                Chưa có dữ liệu trong khoảng thời gian đã chọn.
              </td>
            </tr>
          ) : (
            pageCampaigns.map((c) => {
              const cKey = `${c.channel}|${c.campaign_name}`;
              const cOpen = openCampaigns.has(cKey);
              return (
                <React.Fragment key={cKey}>
                  <tr
                    className="cursor-pointer bg-white hover:bg-slate-50"
                    onClick={() => toggle(openCampaigns, setOpenCampaigns, cKey)}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <ChevronRight className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${cOpen ? "rotate-90" : ""}`} />
                        <span className="max-w-[280px] truncate font-medium text-slate-700" title={c.campaign_name}>
                          {c.campaign_name || "(không có tên)"}
                        </span>
                        <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                          {c.adGroups.length} ad set{c.adGroups.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                    {showChannel && (
                      <td className="px-3 py-2">
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                          style={{ backgroundColor: CHANNEL_COLORS[c.channel] }}
                        >
                          {CHANNEL_LABELS[c.channel]}
                        </span>
                      </td>
                    )}
                    {metricCells(c.totals, extraColumns)}
                  </tr>

                  {cOpen &&
                    c.adGroups.map((ag) => {
                      const agKey = `${cKey}|${ag.ad_group_name}`;
                      const agOpen = openAdGroups.has(agKey);
                      return (
                        <React.Fragment key={agKey}>
                          <tr
                            className="cursor-pointer bg-slate-50/60 hover:bg-slate-100"
                            onClick={() => toggle(openAdGroups, setOpenAdGroups, agKey)}
                          >
                            <td className="py-2 pl-8 pr-3">
                              <div className="flex items-center gap-1.5">
                                <ChevronRight className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${agOpen ? "rotate-90" : ""}`} />
                                <span className="max-w-[240px] truncate text-slate-600" title={ag.ad_group_name}>
                                  {ag.ad_group_name || "—"}
                                </span>
                                <span className="shrink-0 rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                                  {ag.ads.length} ad{ag.ads.length > 1 ? "s" : ""}
                                </span>
                              </div>
                            </td>
                            {showChannel && <td className="px-3 py-2 text-slate-300">—</td>}
                            {metricCells(ag.totals, extraColumns)}
                          </tr>

                          {agOpen &&
                            ag.ads.map((ad, i) => (
                              <tr key={`${agKey}|${i}`} className="bg-white">
                                <td className="py-2 pl-16 pr-3">
                                  <span className="block max-w-[220px] truncate text-slate-600" title={ad.ad_name}>
                                    {ad.ad_name || "(không có tên)"}
                                  </span>
                                </td>
                                {showChannel && <td className="px-3 py-2 text-slate-300">—</td>}
                                {metricCells(ad, extraColumns)}
                              </tr>
                            ))}
                        </React.Fragment>
                      );
                    })}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
      {campaigns.length > ADS_DRILLDOWN_PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-[11px] text-slate-500">
          <span>
            Campaign {startIdx + 1}–{Math.min(startIdx + ADS_DRILLDOWN_PAGE_SIZE, campaigns.length)} / {campaigns.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="rounded-md border border-slate-200 px-2 py-1 font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Trước
            </button>
            <span className="font-semibold text-slate-700">
              Trang {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-md border border-slate-200 px-2 py-1 font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface DigitalAdsReportProps {
  selectedBrand: "Livotec" | "Karofi";
  setSelectedBrand: (brand: "Livotec" | "Karofi") => void;
}

export default function DigitalAdsReport({ selectedBrand, setSelectedBrand }: DigitalAdsReportProps) {
  const [activeChannel, setActiveChannel] = useState<"all" | AdsChannel>("all");
  const [since, setSince] = useState(todayStr(-30));
  const [until, setUntil] = useState(todayStr());
  const [rows, setRows] = useState<AdsPerformanceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ since, until, brand: selectedBrand });
        if (activeChannel !== "all") params.set("channels", activeChannel);
        const result = await safeFetchJson(`/api/ads-performance?${params.toString()}`);
        if (cancelled) return;
        if (result.success) {
          setRows(result.rows || []);
        } else {
          setError(result.error || "Không tải được dữ liệu quảng cáo.");
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Không tải được dữ liệu quảng cáo.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [since, until, selectedBrand, activeChannel]);

  const totals = useMemo(() => sumRows(rows), [rows]);
  const byCampaign = useMemo(() => aggregateByCampaign(rows), [rows]);
  const byDate = useMemo(() => aggregateByDate(rows), [rows]);

  const byChannelTotals = useMemo(() => {
    const map = new Map<AdsChannel, ReturnType<typeof sumRows>>();
    (["facebook", "google", "tiktok"] as AdsChannel[]).forEach((c) => map.set(c, sumRows(rows.filter((r) => r.channel === c))));
    return map;
  }, [rows]);

  const spendByChannelPie = useMemo(
    () =>
      (["facebook", "google", "tiktok"] as AdsChannel[])
        .map((c) => ({ name: CHANNEL_LABELS[c], value: byChannelTotals.get(c)?.spend || 0, channel: c }))
        .filter((d) => d.value > 0),
    [byChannelTotals]
  );

  const channelTabs: { id: "all" | AdsChannel; label: string }[] = [
    { id: "all", label: "Tất cả kênh" },
    { id: "facebook", label: "Facebook" },
    { id: "google", label: "Google" },
    { id: "tiktok", label: "TikTok" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-bold uppercase tracking-wider text-slate-800">Digital Ads Report</h1>
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
        {channelTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveChannel(tab.id)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
              activeChannel === tab.id ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-white"
            }`}
          >
            {tab.label}
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
      ) : activeChannel === "all" ? (
        <AllChannelTab rows={rows} totals={totals} byCampaign={byCampaign} byChannelTotals={byChannelTotals} spendByChannelPie={spendByChannelPie} />
      ) : activeChannel === "facebook" ? (
        <FacebookTab rows={rows} totals={totals} byCampaign={byCampaign} byDate={byDate} />
      ) : activeChannel === "google" ? (
        <GoogleTab rows={rows} totals={totals} byCampaign={byCampaign} byDate={byDate} />
      ) : (
        <TiktokTab rows={rows} totals={totals} byCampaign={byCampaign} byDate={byDate} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// All Channel tab — ref: Coupler.io multi-channel template. KPI tiles limited
// to metrics genuinely common to all 3 channels (Spend/Impressions/Clicks/
// CTR/CPC/CPM); Conversions shown as 3 separate per-channel tiles below since
// FB Leads / TikTok Conversions / Google Conversions aren't comparable
// definitions and summing them would be misleading.
// ---------------------------------------------------------------------------
function AllChannelTab({
  totals,
  byCampaign,
  byChannelTotals,
  spendByChannelPie,
}: {
  rows: AdsPerformanceRow[];
  totals: ReturnType<typeof sumRows>;
  byCampaign: ReturnType<typeof aggregateByCampaign>;
  byChannelTotals: Map<AdsChannel, ReturnType<typeof sumRows>>;
  spendByChannelPie: { name: string; value: number; channel: AdsChannel }[];
}) {
  const cards: KpiCard[] = [
    { title: "Chi phí", value: fmtCompact(totals.spend), icon: DollarSign, color: "border-indigo-200 bg-indigo-50 text-indigo-600" },
    { title: "Impressions", value: fmtCompact(totals.impressions), icon: Eye, color: "border-amber-200 bg-amber-50 text-amber-600" },
    { title: "Clicks", value: fmtCompact(totals.clicks), icon: MousePointerClick, color: "border-emerald-200 bg-emerald-50 text-emerald-600" },
    { title: "CTR", value: fmtPct(safeDiv(totals.clicks, totals.impressions)), icon: Target, color: "border-violet-200 bg-violet-50 text-violet-600" },
    { title: "CPC", value: fmt(safeDiv(totals.spend, totals.clicks)), icon: DollarSign, color: "border-rose-200 bg-rose-50 text-rose-600" },
    { title: "CPM", value: fmt(safeDiv(totals.spend, totals.impressions) * 1000), icon: DollarSign, color: "border-sky-200 bg-sky-50 text-sky-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <KpiGrid cards={cards} />
        <p className="text-[11px] text-slate-400">
          6 chỉ số trên là các chỉ số duy nhất có ở cả 3 nền tảng (Facebook, Google, TikTok) nên dùng làm scorecard chính để so sánh trực tiếp. Reach/Frequency không có trong dữ liệu Google nên chỉ hiển thị ở tab riêng từng kênh; Conversions/Leads tách riêng theo kênh bên dưới vì định nghĩa mỗi nền tảng khác nhau, cộng chung sẽ sai lệch.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(["facebook", "google", "tiktok"] as AdsChannel[]).map((c) => (
          <div key={c} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHANNEL_COLORS[c] }} />
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{CHANNEL_LABELS[c]} — Conversions/Leads</span>
            </div>
            <span className="font-mono text-lg font-bold text-slate-900">{fmt(byChannelTotals.get(c)?.conversions || 0)}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Chi phí theo kênh">
          <PieChart>
            <Pie data={spendByChannelPie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
              {spendByChannelPie.map((d) => (
                <Cell key={d.channel} fill={CHANNEL_COLORS[d.channel]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Legend />
          </PieChart>
        </ChartCard>

        <ChartCard title="Top Campaign theo chi phí">
          <BarChart data={byCampaign.slice(0, 8)} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" tickFormatter={fmtCompact} />
            <YAxis type="category" dataKey="campaign_name" width={140} tick={{ fontSize: 10 }} tickFormatter={(v: string) => (v.length > 22 ? v.slice(0, 22) + "…" : v)} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Bar dataKey="spend" name="Chi phí" radius={[0, 4, 4, 0]}>
              {byCampaign.slice(0, 8).map((d, i) => (
                <Cell key={i} fill={CHANNEL_COLORS[d.channel]} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>
      </div>

      <AdsDrilldownTable rows={byCampaign} showChannel />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Facebook tab — ref: analyticsHelp.io template. Kept: Impressions/Reach/
// Clicks/CPC/Leads/Cost-per-Lead/Spend tiles, spend+leads over time, campaign
// & ad tables. Dropped vs the template: ROAS (no revenue data), Action Types /
// Demographic / Geographic sections (need extra Graph API breakdowns not
// pulled by this sync — see the approved plan for why).
// ---------------------------------------------------------------------------
function FacebookTab({
  totals,
  byCampaign,
  byDate,
}: {
  rows: AdsPerformanceRow[];
  totals: ReturnType<typeof sumRows>;
  byCampaign: ReturnType<typeof aggregateByCampaign>;
  byDate: ReturnType<typeof aggregateByDate>;
}) {
  const cards: KpiCard[] = [
    { title: "Impressions", value: fmtCompact(totals.impressions), icon: Eye, color: "border-amber-200 bg-amber-50 text-amber-600" },
    { title: "Reach", value: fmtCompact(totals.reach), icon: Users, color: "border-sky-200 bg-sky-50 text-sky-600" },
    { title: "Frequency", value: safeDiv(totals.impressions, totals.reach).toFixed(2), icon: Users, color: "border-lime-200 bg-lime-50 text-lime-600" },
    { title: "Link Clicks", value: fmtCompact(totals.clicks), icon: MousePointerClick, color: "border-emerald-200 bg-emerald-50 text-emerald-600" },
    { title: "CPC", value: fmt(safeDiv(totals.spend, totals.clicks)), icon: DollarSign, color: "border-rose-200 bg-rose-50 text-rose-600" },
    { title: "CPM", value: fmt(safeDiv(totals.spend, totals.impressions) * 1000), icon: DollarSign, color: "border-sky-200 bg-sky-50 text-sky-600" },
    { title: "Leads", value: fmtCompact(totals.conversions), icon: Target, color: "border-violet-200 bg-violet-50 text-violet-600" },
    { title: "Cost / Lead", value: fmt(safeDiv(totals.spend, totals.conversions)), icon: DollarSign, color: "border-indigo-200 bg-indigo-50 text-indigo-600" },
    { title: "Chi phí", value: fmtCompact(totals.spend), icon: DollarSign, color: "border-blue-200 bg-blue-50 text-blue-600" },
  ];

  const byDateWithDerived = byDate.map((d) => ({
    ...d,
    cpm: safeDiv(d.spend, d.impressions) * 1000,
    ctr: safeDiv(d.clicks, d.impressions) * 100,
  }));

  return (
    <div className="space-y-6">
      <KpiGrid cards={cards} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Chi phí & CPM theo ngày">
          <BarChart data={byDateWithDerived}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="left" tickFormatter={fmtCompact} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={fmtCompact} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Legend />
            <Bar yAxisId="left" dataKey="spend" name="Chi phí" fill={CHANNEL_COLORS.facebook} radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="cpm" name="CPM" stroke="#ef4444" strokeWidth={2} dot={false} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Clicks & CTR theo ngày">
          <BarChart data={byDateWithDerived}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="left" tickFormatter={fmtCompact} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(v: number) => `${v.toFixed(1)}%`} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Legend />
            <Bar yAxisId="left" dataKey="clicks" name="Clicks" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="ctr" name="CTR (%)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </BarChart>
        </ChartCard>
      </div>

      <div>
        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Campaign Performance</span>
        <AdsDrilldownTable
          rows={byCampaign}
          extraColumns={[
            { label: "Reach", render: (r) => fmt(r.reach) },
            { label: "Frequency", render: (r) => safeDiv(r.impressions, r.reach).toFixed(2) },
            { label: "Leads / Cost per Lead", render: (r) => `${fmt(r.conversions)} · ${fmt(safeDiv(r.spend, r.conversions))}` },
          ]}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Google tab — ref: Hexe template. Kept: Clicks/CTR/Avg.CPC/Cost tiles,
// cost-over-time. Dropped vs template: Conversions/Conversion rate/Cost-per-
// Conv/ROAS tiles (real export has 0 conversions — would be fabricated), and
// the Device breakdown chart (no Device dimension in this export) — replaced
// with a Video-views-by-day chart, since TrueView views IS genuinely present
// and Google-specific.
// ---------------------------------------------------------------------------
function GoogleTab({
  totals,
  byCampaign,
  byDate,
}: {
  rows: AdsPerformanceRow[];
  totals: ReturnType<typeof sumRows>;
  byCampaign: ReturnType<typeof aggregateByCampaign>;
  byDate: ReturnType<typeof aggregateByDate>;
}) {
  const cards: KpiCard[] = [
    { title: "Clicks", value: fmtCompact(totals.clicks), icon: MousePointerClick, color: "border-emerald-200 bg-emerald-50 text-emerald-600" },
    { title: "CTR", value: fmtPct(safeDiv(totals.clicks, totals.impressions)), icon: Target, color: "border-violet-200 bg-violet-50 text-violet-600" },
    { title: "Avg. CPC", value: fmt(safeDiv(totals.spend, totals.clicks)), icon: DollarSign, color: "border-rose-200 bg-rose-50 text-rose-600" },
    { title: "CPM", value: fmt(safeDiv(totals.spend, totals.impressions) * 1000), icon: DollarSign, color: "border-sky-200 bg-sky-50 text-sky-600" },
    { title: "Chi phí", value: fmtCompact(totals.spend), icon: DollarSign, color: "border-amber-200 bg-amber-50 text-amber-600" },
  ];
  if (totals.conversions > 0) {
    cards.push({ title: "Conversions", value: fmt(totals.conversions), icon: Target, color: "border-indigo-200 bg-indigo-50 text-indigo-600" });
  }

  const byDateWithDerived = byDate.map((d) => ({ ...d, ctr: safeDiv(d.clicks, d.impressions) * 100 }));

  return (
    <div className="space-y-6">
      <KpiGrid cards={cards} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Chi phí & Clicks theo ngày">
          <BarChart data={byDate}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="left" tickFormatter={fmtCompact} />
            <YAxis yAxisId="right" orientation="right" allowDecimals={false} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Legend />
            <Bar yAxisId="left" dataKey="spend" name="Chi phí" fill={CHANNEL_COLORS.google} radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="clicks" name="Clicks" stroke="#0ea5e9" strokeWidth={2} dot={false} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Clicks & CTR theo ngày">
          <BarChart data={byDateWithDerived}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="left" tickFormatter={fmtCompact} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(v: number) => `${v.toFixed(1)}%`} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Legend />
            <Bar yAxisId="left" dataKey="clicks" name="Clicks" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="ctr" name="CTR (%)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Video views theo ngày (TrueView)">
          <BarChart data={byDate}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={fmtCompact} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Bar dataKey="video_views" name="Video views" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <div>
        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Campaign Performance</span>
        <AdsDrilldownTable rows={byCampaign} extraColumns={[{ label: "Avg. CPC", render: (r) => fmt(safeDiv(r.spend, r.clicks)) }]} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TikTok tab — ref: TikTok Ads dashboard template. This export is the most
// complete of the three, so almost everything from the template is kept;
// Reach & Frequency tiles added (present in the data, absent from the generic
// template) for consistency with the Facebook tab.
// ---------------------------------------------------------------------------
function TiktokTab({
  totals,
  byCampaign,
  byDate,
}: {
  rows: AdsPerformanceRow[];
  totals: ReturnType<typeof sumRows>;
  byCampaign: ReturnType<typeof aggregateByCampaign>;
  byDate: ReturnType<typeof aggregateByDate>;
}) {
  const cards: KpiCard[] = [
    { title: "Impressions", value: fmtCompact(totals.impressions), icon: Eye, color: "border-amber-200 bg-amber-50 text-amber-600" },
    { title: "Video views", value: fmtCompact(totals.video_views), icon: Eye, color: "border-sky-200 bg-sky-50 text-sky-600" },
    { title: "Clicks", value: fmtCompact(totals.clicks), icon: MousePointerClick, color: "border-emerald-200 bg-emerald-50 text-emerald-600" },
    { title: "Conversions", value: fmt(totals.conversions), icon: Target, color: "border-violet-200 bg-violet-50 text-violet-600" },
    { title: "Chi phí", value: fmtCompact(totals.spend), icon: DollarSign, color: "border-indigo-200 bg-indigo-50 text-indigo-600" },
    { title: "CPM", value: fmt(safeDiv(totals.spend, totals.impressions) * 1000), icon: DollarSign, color: "border-rose-200 bg-rose-50 text-rose-600" },
    { title: "CPC", value: fmt(safeDiv(totals.spend, totals.clicks)), icon: DollarSign, color: "border-blue-200 bg-blue-50 text-blue-600" },
    { title: "CTR", value: fmtPct(safeDiv(totals.clicks, totals.impressions)), icon: Target, color: "border-teal-200 bg-teal-50 text-teal-600" },
    { title: "Reach", value: fmtCompact(totals.reach), icon: Users, color: "border-lime-200 bg-lime-50 text-lime-600" },
    { title: "Frequency", value: safeDiv(totals.impressions, totals.reach).toFixed(2), icon: Users, color: "border-cyan-200 bg-cyan-50 text-cyan-600" },
  ];

  const byDateWithDerived = byDate.map((d) => ({ ...d, ctr: safeDiv(d.clicks, d.impressions) * 100 }));

  return (
    <div className="space-y-6">
      <KpiGrid cards={cards} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Chi phí theo ngày">
          <BarChart data={byDate}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={fmtCompact} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Bar dataKey="spend" name="Chi phí" fill={CHANNEL_COLORS.tiktok} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Impressions & Clicks theo ngày">
          <BarChart data={byDate}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="left" tickFormatter={fmtCompact} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={fmtCompact} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Legend />
            <Bar yAxisId="left" dataKey="impressions" name="Impressions" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="clicks" name="Clicks" stroke="#0ea5e9" strokeWidth={2} dot={false} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Clicks & CTR theo ngày">
          <BarChart data={byDateWithDerived}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="left" tickFormatter={fmtCompact} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(v: number) => `${v.toFixed(1)}%`} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Legend />
            <Bar yAxisId="left" dataKey="clicks" name="Clicks" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="ctr" name="CTR (%)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </BarChart>
        </ChartCard>
      </div>

      <div>
        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Campaign Performance</span>
        <AdsDrilldownTable
          rows={byCampaign}
          extraColumns={[
            { label: "Reach", render: (r) => fmt(r.reach) },
            { label: "Frequency", render: (r) => safeDiv(r.impressions, r.reach).toFixed(2) },
            { label: "Video views", render: (r) => fmt(r.video_views) },
          ]}
        />
      </div>
    </div>
  );
}
