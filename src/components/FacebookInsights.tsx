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
import { Eye, Users, UserCheck, Heart, FileText, RefreshCw, AlertCircle } from "lucide-react";
import { safeFetchJson } from "../App";

// Kept local (not imported from src/server/*) — that module also wires up
// the Supabase service-role client, which must never end up in the browser
// bundle. These mirror the shape GET /api/fb/insights returns.
//
// Note: page-level impressions/reach and delta-based follower metrics
// (page_impressions*, page_fans/_adds/_removes) were retired by Meta —
// Graph API now returns "(#100) The value must be a valid insights metric"
// for all of them (confirmed against a real Page, 2026-08). Only page_views
// and page_post_engagements still work at the page level; follower count is
// now our own daily snapshot of the Page's followers_count field (see
// facebookSync.ts) rather than a metric series from Facebook. The charts
// below use only what's actually available instead of the retired fields.
interface FbPageMeta {
  page_id: string;
  page_name: string;
  brand: string | null;
  is_active: boolean;
}

interface FbInsightsDailyRow {
  page_id: string;
  date: string;
  page_views: number | null;
  fan_count: number | null;
  engaged_users: number | null;
}

interface FbPostRow {
  post_id: string;
  page_id: string;
  created_time: string;
  message: string | null;
  permalink: string | null;
  thumbnail_url: string | null;
  reach: number | null;
  impressions: number | null;
  clicks: number | null;
  likes: number | null;
  loves: number | null;
  wows: number | null;
  hahas: number | null;
  sorrys: number | null;
  angers: number | null;
  comments: number | null;
  shares: number | null;
}

const PAGE_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];
const n = (v: number | null | undefined) => v || 0;
const fmt = (v: number) => new Intl.NumberFormat("vi-VN").format(Math.round(v));
const fmtCompact = (v: number) => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(v);

function todayStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

interface FacebookInsightsProps {
  selectedBrand: "Livotec" | "Karofi";
  setSelectedBrand: (brand: "Livotec" | "Karofi") => void;
}

export default function FacebookInsights({ selectedBrand, setSelectedBrand }: FacebookInsightsProps) {
  const [allPages, setAllPages] = useState<FbPageMeta[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [since, setSince] = useState(todayStr(-30));
  const [until, setUntil] = useState(todayStr());
  const [daily, setDaily] = useState<FbInsightsDailyRow[]>([]);
  const [posts, setPosts] = useState<FbPostRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Same brand split as the weekly report (App.tsx's selectedBrand toggle) —
  // only this brand's configured pages are ever shown/queried.
  const brandPages = useMemo(() => allPages.filter((p) => p.brand === selectedBrand), [allPages, selectedBrand]);

  // Reset the page multi-select whenever the brand changes so a stale
  // selection from the other brand can't silently filter out everything.
  useEffect(() => {
    setSelectedPageIds([]);
  }, [selectedBrand]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const idsForBrand = selectedPageIds.length > 0 ? selectedPageIds : brandPages.map((p) => p.page_id);
        const params = new URLSearchParams({ since, until });
        if (idsForBrand.length > 0) params.set("pages", idsForBrand.join(","));
        const result = await safeFetchJson(`/api/fb/insights?${params.toString()}`);
        if (cancelled) return;
        if (result.success) {
          setAllPages(result.pages || []);
          setDaily(result.daily || []);
          setPosts(result.posts || []);
        } else {
          setError(result.error || "Không tải được dữ liệu Facebook.");
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Không tải được dữ liệu Facebook.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [since, until, selectedPageIds.join(","), selectedBrand]);

  const pageNameById = useMemo(() => {
    const map = new Map<string, string>();
    allPages.forEach((p) => map.set(p.page_id, p.page_name));
    return map;
  }, [allPages]);

  const activePageIds = selectedPageIds.length > 0 ? selectedPageIds : brandPages.map((p) => p.page_id);

  // KPI totals across the selected pages/date range — only fields Facebook
  // actually still returns data for (see file header comment).
  const kpis = useMemo(() => {
    const totals = { pageViews: 0, pageEngagement: 0 };
    daily.forEach((row) => {
      totals.pageViews += n(row.page_views);
      totals.pageEngagement += n(row.engaged_users);
    });

    // Follower mới = tổng chênh lệch (fan_count cuối kỳ - đầu kỳ) của từng
    // page, tính từ chuỗi snapshot hàng ngày do chính app này tự tích lũy
    // (Facebook không còn cấp fan_adds/fan_removes dạng delta).
    let newFollowers = 0;
    const byPage = new Map<string, FbInsightsDailyRow[]>();
    daily.forEach((row) => {
      if (row.fan_count == null) return;
      const list = byPage.get(row.page_id) || [];
      list.push(row);
      byPage.set(row.page_id, list);
    });
    byPage.forEach((rows) => {
      const sorted = [...rows].sort((a, b) => (a.date < b.date ? -1 : 1));
      newFollowers += n(sorted[sorted.length - 1].fan_count) - n(sorted[0].fan_count);
    });

    const postEngagement = posts.reduce(
      (sum, p) =>
        sum + n(p.likes) + n(p.loves) + n(p.wows) + n(p.hahas) + n(p.sorrys) + n(p.angers) + n(p.comments) + n(p.shares),
      0
    );

    return { ...totals, newFollowers, postEngagement, postCount: posts.length };
  }, [daily, posts]);

  // Engagement dynamics: page_post_engagements per day, one series per page —
  // replaces the old "Content Dynamics (Organic vs Paid)" chart, which relied
  // on page_impressions*/_paid metrics that Meta has since retired.
  function pivotByPage(metric: keyof FbInsightsDailyRow) {
    const byDate = new Map<string, any>();
    daily.forEach((row) => {
      const entry = byDate.get(row.date) || { date: row.date };
      entry[row.page_id] = n(row[metric] as number | null);
      byDate.set(row.date, entry);
    });
    return Array.from(byDate.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
  }

  const engagementByPage = useMemo(() => pivotByPage("engaged_users"), [daily]);
  const pageViewsByPage = useMemo(() => pivotByPage("page_views"), [daily]);
  const followersByPage = useMemo(() => pivotByPage("fan_count"), [daily]);

  // Posts per day per page — replaces "Reach Dynamics" (page_impressions_unique
  // is also retired); this is content cadence, derived from data we already
  // fetch (post created_time), so it needs no Insights permission at all.
  const postsPerDay = useMemo(() => {
    const byDate = new Map<string, any>();
    posts.forEach((p) => {
      const date = p.created_time.slice(0, 10);
      const entry = byDate.get(date) || { date };
      entry[p.page_id] = (entry[p.page_id] || 0) + 1;
      byDate.set(date, entry);
    });
    return Array.from(byDate.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [posts]);

  // Per-page totals table (paired with the engagement dynamics chart).
  const perPageTotals = useMemo(() => {
    const byPage = new Map<string, { page_id: string; pageViews: number; engagement: number; days: number }>();
    daily.forEach((row) => {
      const entry = byPage.get(row.page_id) || { page_id: row.page_id, pageViews: 0, engagement: 0, days: 0 };
      entry.pageViews += n(row.page_views);
      entry.engagement += n(row.engaged_users);
      entry.days += 1;
      byPage.set(row.page_id, entry);
    });
    return Array.from(byPage.values()).map((e) => ({
      ...e,
      pageName: pageNameById.get(e.page_id) || e.page_id,
      avgDailyEngagement: e.days > 0 ? e.engagement / e.days : 0,
    }));
  }, [daily, pageNameById]);

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => (a.created_time < b.created_time ? 1 : -1)),
    [posts]
  );

  const postsTotal = useMemo(
    () =>
      sortedPosts.reduce(
        (t, p) => ({
          clicks: t.clicks + n(p.clicks),
          likes: t.likes + n(p.likes),
          loves: t.loves + n(p.loves),
          wows: t.wows + n(p.wows),
          hahas: t.hahas + n(p.hahas),
          sorrys: t.sorrys + n(p.sorrys),
          angers: t.angers + n(p.angers),
          comments: t.comments + n(p.comments),
          shares: t.shares + n(p.shares),
        }),
        { clicks: 0, likes: 0, loves: 0, wows: 0, hahas: 0, sorrys: 0, angers: 0, comments: 0, shares: 0 }
      ),
    [sortedPosts]
  );

  const kpiCards = [
    { title: "Page Views", value: kpis.pageViews, icon: Eye, color: "border-amber-200 bg-amber-50 text-amber-600" },
    { title: "Engagement (Page)", value: kpis.pageEngagement, icon: Users, color: "border-violet-200 bg-violet-50 text-violet-600" },
    { title: "Follower mới", value: kpis.newFollowers, icon: UserCheck, color: "border-emerald-200 bg-emerald-50 text-emerald-600" },
    { title: "Tương tác bài đăng", value: kpis.postEngagement, icon: Heart, color: "border-rose-200 bg-rose-50 text-rose-600" },
    { title: "Tổng bài đăng", value: kpis.postCount, icon: FileText, color: "border-blue-200 bg-blue-50 text-blue-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-bold uppercase tracking-wider text-slate-800">Facebook Page Insights</h1>
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
          {brandPages.length > 1 && (
            <select
              multiple
              value={selectedPageIds}
              onChange={(e) => {
                const options = e.target.options;
                const next: string[] = [];
                for (let i = 0; i < options.length; i++) {
                  if (options[i].selected) next.push(options[i].value);
                }
                setSelectedPageIds(next);
              }}
              className="min-w-[10rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
              size={1}
            >
              {brandPages.map((p) => (
                <option key={p.page_id} value={p.page_id}>
                  {p.page_name}
                </option>
              ))}
            </select>
          )}
          <input type="date" value={since} onChange={(e) => setSince(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs" />
          <span className="text-xs text-slate-400">→</span>
          <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs" />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {!isLoading && !error && brandPages.length === 0 ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-8 w-8 text-slate-300" />
          <h2 className="mt-3 text-sm font-bold text-slate-800">Chưa có Facebook Page nào gán cho {selectedBrand}</h2>
          <p className="mt-1 text-xs text-slate-500">
            Vào Control Panel → "Kết nối Facebook" (Admin) để thêm Page và chọn đúng thương hiệu {selectedBrand}.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang tải dữ liệu...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="block text-xs font-medium uppercase tracking-tight text-slate-400">{card.title}</span>
                      <span className="block font-mono text-xl font-bold tracking-tight text-slate-900">{fmtCompact(card.value)}</span>
                    </div>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${card.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-80 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <span className="block pb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Engagement Dynamics (Page)</span>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={engagementByPage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={fmtCompact} />
                  <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                  <Legend />
                  {activePageIds.map((id, i) => (
                    <Bar key={id} dataKey={id} name={pageNameById.get(id) || id} stackId="eng" fill={PAGE_COLORS[i % PAGE_COLORS.length]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Page</th>
                    <th className="px-3 py-2 text-right">Page Views</th>
                    <th className="px-3 py-2 text-right">Engagement</th>
                    <th className="px-3 py-2 text-right">Avg daily engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {perPageTotals.map((row) => (
                    <tr key={row.page_id}>
                      <td className="px-3 py-2 font-medium text-slate-700">{row.pageName}</td>
                      <td className="px-3 py-2 text-right">{fmt(row.pageViews)}</td>
                      <td className="px-3 py-2 text-right">{fmt(row.engagement)}</td>
                      <td className="px-3 py-2 text-right">{fmt(row.avgDailyEngagement)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-72 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <span className="block pb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Bài Đăng Theo Ngày</span>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={postsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                  <Legend />
                  {activePageIds.map((id, i) => (
                    <Bar key={id} dataKey={id} name={pageNameById.get(id) || id} stackId="posts" fill={PAGE_COLORS[i % PAGE_COLORS.length]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="h-72 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <span className="block pb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Page Views Dynamics</span>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={pageViewsByPage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={fmtCompact} />
                  <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                  <Legend />
                  {activePageIds.map((id, i) => (
                    <Bar key={id} dataKey={id} name={pageNameById.get(id) || id} stackId="pv" fill={PAGE_COLORS[i % PAGE_COLORS.length]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="h-72 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <span className="block pb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Follower Growth</span>
            <p className="pb-2 text-[11px] text-slate-400">
              Facebook không còn cấp lịch sử follower theo ngày — biểu đồ này tích lũy từ snapshot mỗi lần đồng bộ, nên sẽ bắt đầu từ ngày bắt đầu kết nối.
            </p>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={followersByPage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={fmtCompact} domain={["auto", "auto"]} />
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                <Legend />
                {activePageIds.map((id, i) => (
                  <Line key={id} type="monotone" dataKey={id} name={pageNameById.get(id) || id} stroke={PAGE_COLORS[i % PAGE_COLORS.length]} dot={false} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Recent Posts Performance</span>
            <p className="mb-2 text-[11px] text-slate-400">
              Đã bỏ tạm cột Page (đang lọc theo 1 thương hiệu) và cột Reach/Impressions — Facebook đã ngừng cấp 2 chỉ số này ở
              cấp bài đăng (xác nhận bằng token thật: lỗi "#100 not a valid insights metric"), không phải lỗi hiển thị. Đã
              thêm cột Clicks — chỉ số này vẫn còn dữ liệu thật.
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[800px] text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Nội dung</th>
                    <th className="px-3 py-2 text-right">Clicks</th>
                    <th className="px-3 py-2 text-right">Likes</th>
                    <th className="px-3 py-2 text-right">Loves</th>
                    <th className="px-3 py-2 text-right">Wows</th>
                    <th className="px-3 py-2 text-right">Hahas</th>
                    <th className="px-3 py-2 text-right">Sorrys</th>
                    <th className="px-3 py-2 text-right">Angers</th>
                    <th className="px-3 py-2 text-right">Comments</th>
                    <th className="px-3 py-2 text-right">Shares</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedPosts.map((post) => (
                    <tr key={post.post_id}>
                      <td className="max-w-sm truncate px-3 py-2 text-slate-600" title={post.message || ""}>
                        {post.permalink ? (
                          <a href={post.permalink} target="_blank" rel="noreferrer" className="hover:underline">
                            {post.message || "(không có nội dung)"}
                          </a>
                        ) : (
                          post.message || "(không có nội dung)"
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">{fmt(n(post.clicks))}</td>
                      <td className="px-3 py-2 text-right">{fmt(n(post.likes))}</td>
                      <td className="px-3 py-2 text-right">{fmt(n(post.loves))}</td>
                      <td className="px-3 py-2 text-right">{fmt(n(post.wows))}</td>
                      <td className="px-3 py-2 text-right">{fmt(n(post.hahas))}</td>
                      <td className="px-3 py-2 text-right">{fmt(n(post.sorrys))}</td>
                      <td className="px-3 py-2 text-right">{fmt(n(post.angers))}</td>
                      <td className="px-3 py-2 text-right">{fmt(n(post.comments))}</td>
                      <td className="px-3 py-2 text-right">{fmt(n(post.shares))}</td>
                    </tr>
                  ))}
                  {sortedPosts.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-6 text-center text-slate-400">
                        Chưa có bài đăng nào trong khoảng thời gian đã chọn.
                      </td>
                    </tr>
                  )}
                </tbody>
                {sortedPosts.length > 0 && (
                  <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-700">
                    <tr>
                      <td className="px-3 py-2">Grand total</td>
                      <td className="px-3 py-2 text-right">{fmt(postsTotal.clicks)}</td>
                      <td className="px-3 py-2 text-right">{fmt(postsTotal.likes)}</td>
                      <td className="px-3 py-2 text-right">{fmt(postsTotal.loves)}</td>
                      <td className="px-3 py-2 text-right">{fmt(postsTotal.wows)}</td>
                      <td className="px-3 py-2 text-right">{fmt(postsTotal.hahas)}</td>
                      <td className="px-3 py-2 text-right">{fmt(postsTotal.sorrys)}</td>
                      <td className="px-3 py-2 text-right">{fmt(postsTotal.angers)}</td>
                      <td className="px-3 py-2 text-right">{fmt(postsTotal.comments)}</td>
                      <td className="px-3 py-2 text-right">{fmt(postsTotal.shares)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
