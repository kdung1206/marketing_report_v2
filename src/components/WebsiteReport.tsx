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
  ResponsiveContainer,
} from "recharts";
import { Globe, Search, Users, MousePointerClick, Eye, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
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

const n = (v: number | null | undefined) => v || 0;
const fmt = (v: number) => new Intl.NumberFormat("vi-VN").format(Math.round(v));
const fmtCompact = (v: number) => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(v);
const fmtPercent = (v: number) => `${(v * 100).toFixed(1)}%`;

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const ga4Scoped = useMemo(() => ga4Daily.filter((r) => accountIds.includes(r.account_id)), [ga4Daily, accountIds]);
  const gscScoped = useMemo(() => gscDaily.filter((r) => accountIds.includes(r.account_id)), [gscDaily, accountIds]);

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

  const sessionsTotal = ga4Scoped.reduce((s, r) => s + n(r.sessions), 0);
  const activeUsersTotal = ga4Scoped.reduce((s, r) => s + n(r.active_users), 0);
  const newUsersTotal = ga4Scoped.reduce((s, r) => s + n(r.new_users), 0);
  const clicksTotal = gscScoped.reduce((s, r) => s + n(r.clicks), 0);
  const impressionsTotal = gscScoped.reduce((s, r) => s + n(r.impressions), 0);
  const avgCtr = gscScoped.length ? gscScoped.reduce((s, r) => s + n(r.ctr), 0) / gscScoped.length : 0;
  const avgPosition = gscScoped.length ? gscScoped.reduce((s, r) => s + n(r.position), 0) / gscScoped.length : 0;

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
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <PlatformStat icon={Users} label="Sessions (GA4)" value={fmtCompact(sessionsTotal)} color="text-indigo-600 bg-indigo-50 border-indigo-200" />
                <PlatformStat icon={TrendingUp} label="Active Users (GA4)" value={fmtCompact(activeUsersTotal)} color="text-indigo-600 bg-indigo-50 border-indigo-200" />
                <PlatformStat icon={MousePointerClick} label="Clicks (Search Console)" value={fmtCompact(clicksTotal)} color="text-sky-600 bg-sky-50 border-sky-200" />
                <PlatformStat icon={Eye} label="Impressions (Search Console)" value={fmtCompact(impressionsTotal)} color="text-sky-600 bg-sky-50 border-sky-200" />
              </div>

              <div className="h-80 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className="block pb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Sessions (GA4) vs Clicks (Search Console) theo ngày</span>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={mergeByDate(ga4ByDate, gscByDate)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={fmtCompact} domain={["auto", "auto"]} />
                    <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                    <Legend />
                    <Line type="monotone" dataKey="sessions" name="Sessions (GA4)" stroke="#6366f1" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="clicks" name="Clicks (Search Console)" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
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
            </div>
          )}
        </>
      )}
    </div>
  );
}

function mergeByDate(
  ga4: { date: string; sessions: number }[],
  gsc: { date: string; clicks: number }[]
): { date: string; sessions: number; clicks: number }[] {
  const byDate = new Map<string, { date: string; sessions: number; clicks: number }>();
  ga4.forEach((r) => {
    const entry = byDate.get(r.date) || { date: r.date, sessions: 0, clicks: 0 };
    entry.sessions = r.sessions;
    byDate.set(r.date, entry);
  });
  gsc.forEach((r) => {
    const entry = byDate.get(r.date) || { date: r.date, sessions: 0, clicks: 0 };
    entry.clicks = r.clicks;
    byDate.set(r.date, entry);
  });
  return Array.from(byDate.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
}

function PlatformStat({ icon: Icon, label, value, color }: { icon: typeof Globe; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="block text-xs font-medium uppercase tracking-tight text-slate-400">{label}</span>
          <span className="block font-mono text-lg font-bold tracking-tight text-slate-900">{value}</span>
        </div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
