import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { RefreshCw, Users, Eye, Heart, FileText } from "lucide-react";
import { safeFetchJson } from "../App";

type OutreachPlatform = "Facebook" | "TikTok" | "Instagram" | "YouTube" | "Other";

interface KocKolAccount {
  id: string;
  name: string;
  platform: OutreachPlatform;
}

interface OutreachPost {
  id: string;
  campaign_id: string;
  koc_kol_id: string | null;
  platform: OutreachPlatform;
  published_at: string | null;
}

interface OutreachPostMetric {
  post_id: string;
  recorded_at: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
}

const n = (v: number | null | undefined) => v || 0;
const fmt = (v: number) => new Intl.NumberFormat("vi-VN").format(Math.round(v));
const fmtCompact = (v: number) => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(v);

const PLATFORM_COLORS: Record<string, string> = {
  Facebook: "#1877F2",
  TikTok: "#0f172a",
  Instagram: "#ec4899",
  YouTube: "#ef4444",
  Other: "#94a3b8",
};

// Rollup across EVERY campaign's Social Outreach posts — real aggregated
// numbers computed from outreach_posts/outreach_post_metrics, replacing what
// used to be a manually-typed weekly figure on the main Dashboard's "KOC/KOL
// Air Bài Tuần" scorecard (see phan-tich-social-outreach-campaign.md Q4 —
// the user asked for this to eventually feed that scorecard; kept as its
// own view here first since the Dashboard tile is wired into the much
// larger manual weekly-report/Excel-sync/AI-analysis pipeline in App.tsx,
// and swapping that over is a separate, riskier change to confirm first).
export default function OutreachOverview() {
  const [posts, setPosts] = useState<OutreachPost[]>([]);
  const [roster, setRoster] = useState<KocKolAccount[]>([]);
  const [metrics, setMetrics] = useState<OutreachPostMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const [postsRes, rosterRes, metricsRes] = await Promise.all([
        safeFetchJson("/api/outreach/posts"),
        safeFetchJson("/api/outreach/koc-kol"),
        safeFetchJson("/api/outreach/metrics"),
      ]);
      if (postsRes.success) setPosts(postsRes.posts || []);
      if (rosterRes.success) setRoster(rosterRes.accounts || []);
      if (metricsRes.success) setMetrics(metricsRes.metrics || []);
      setIsLoading(false);
    })();
  }, []);

  const rosterById = useMemo(() => new Map(roster.map((r) => [r.id, r])), [roster]);

  const latestMetricByPost = useMemo(() => {
    const map = new Map<string, OutreachPostMetric>();
    for (const m of metrics) {
      const existing = map.get(m.post_id);
      if (!existing || m.recorded_at > existing.recorded_at) map.set(m.post_id, m);
    }
    return map;
  }, [metrics]);

  const kpi = useMemo(() => {
    let totalViews = 0;
    let totalEngagement = 0;
    posts.forEach((p) => {
      const m = latestMetricByPost.get(p.id);
      if (!m) return;
      totalViews += n(m.views);
      totalEngagement += n(m.likes) + n(m.comments) + n(m.shares);
    });
    const uniqueKoc = new Set(posts.map((p) => p.koc_kol_id).filter(Boolean));
    return { totalPosts: posts.length, totalViews, totalEngagement, uniqueKoc: uniqueKoc.size };
  }, [posts, latestMetricByPost]);

  const byPlatform = useMemo(() => {
    const totals = new Map<OutreachPlatform, { posts: number; views: number; engagement: number }>();
    posts.forEach((p) => {
      const m = latestMetricByPost.get(p.id);
      const entry = totals.get(p.platform) || { posts: 0, views: 0, engagement: 0 };
      entry.posts += 1;
      if (m) {
        entry.views += n(m.views);
        entry.engagement += n(m.likes) + n(m.comments) + n(m.shares);
      }
      totals.set(p.platform, entry);
    });
    return Array.from(totals.entries()).map(([platform, v]) => ({ platform, ...v }));
  }, [posts, latestMetricByPost]);

  const leaderboard = useMemo(() => {
    const totals = new Map<string, { name: string; posts: number; views: number; engagement: number }>();
    posts.forEach((p) => {
      if (!p.koc_kol_id) return;
      const koc = rosterById.get(p.koc_kol_id);
      const m = latestMetricByPost.get(p.id);
      const key = p.koc_kol_id;
      const entry = totals.get(key) || { name: koc?.name || "—", posts: 0, views: 0, engagement: 0 };
      entry.posts += 1;
      if (m) {
        entry.views += n(m.views);
        entry.engagement += n(m.likes) + n(m.comments) + n(m.shares);
      }
      totals.set(key, entry);
    });
    return Array.from(totals.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }, [posts, rosterById, latestMetricByPost]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang tải dữ liệu Social Outreach...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-[11px] text-slate-400">
        Tổng hợp từ toàn bộ bài đăng Outreach đã ghi nhận qua nút "Outreach" trên từng campaign (tab Campaign Calendar) — số liệu nhập tay hàng tuần theo TikTok/Facebook.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile icon={FileText} label="Tổng bài đăng" value={fmt(kpi.totalPosts)} />
        <StatTile icon={Users} label="KOC/KOL đã hợp tác" value={fmt(kpi.uniqueKoc)} />
        <StatTile icon={Eye} label="Tổng views" value={fmtCompact(kpi.totalViews)} />
        <StatTile icon={Heart} label="Tổng engagement" value={fmtCompact(kpi.totalEngagement)} />
      </div>

      <div className="h-72 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <span className="block pb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Views &amp; Engagement theo nền tảng</span>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={byPlatform}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={fmtCompact} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Legend />
            <Bar dataKey="views" name="Views" radius={[4, 4, 0, 0]}>
              {byPlatform.map((row) => (
                <Cell key={row.platform} fill={PLATFORM_COLORS[row.platform] || "#94a3b8"} />
              ))}
            </Bar>
            <Bar dataKey="engagement" name="Engagement" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <span className="block pb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Top 10 KOC/KOL theo views</span>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-400">
              <th className="pb-2 font-medium">KOC/KOL</th>
              <th className="pb-2 font-medium text-right">Số bài</th>
              <th className="pb-2 font-medium text-right">Views</th>
              <th className="pb-2 font-medium text-right">Engagement</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-slate-400">
                  Chưa có bài đăng outreach nào được ghi nhận.
                </td>
              </tr>
            ) : (
              leaderboard.map((row) => (
                <tr key={row.name} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 font-medium text-slate-700">{row.name}</td>
                  <td className="py-2 text-right font-mono">{row.posts}</td>
                  <td className="py-2 text-right font-mono">{fmt(row.views)}</td>
                  <td className="py-2 text-right font-mono">{fmt(row.engagement)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="block text-xs font-medium uppercase tracking-tight text-slate-400">{label}</span>
          <span className="block font-mono text-lg font-bold tracking-tight text-slate-900">{value}</span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
