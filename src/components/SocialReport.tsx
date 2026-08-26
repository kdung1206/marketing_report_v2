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
import { Facebook, Music2, Youtube, Eye, Heart, Users, RefreshCw, AlertCircle } from "lucide-react";
import { safeFetchJson } from "../App";
import FacebookInsights from "./FacebookInsights";

// Local mirrors of the server row shapes (see src/server/tiktokStore.ts) —
// same "don't import across the client/server boundary" convention as
// FacebookInsights.tsx.
interface TiktokAccountMeta {
  open_id: string;
  username: string | null;
  display_name: string | null;
  brand: string | null;
  is_active: boolean;
}

interface TiktokInsightsDailyRow {
  open_id: string;
  date: string;
  follower_count: number | null;
  following_count: number | null;
  likes_count: number | null;
  video_count: number | null;
}

interface TiktokPostRow {
  video_id: string;
  open_id: string;
  create_time: string;
  title: string | null;
  cover_image_url: string | null;
  share_url: string | null;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  share_count: number | null;
}

// Local mirrors of src/server/youtubeStore.ts row shapes.
interface YoutubeAccountMeta {
  channel_id: string;
  channel_title: string | null;
  brand: string | null;
  is_active: boolean;
}

interface YoutubeInsightsDailyRow {
  channel_id: string;
  date: string;
  subscriber_count: number | null;
  view_count: number | null;
  video_count: number | null;
}

interface YoutubeVideoRow {
  video_id: string;
  channel_id: string;
  published_at: string;
  title: string | null;
  thumbnail_url: string | null;
  views: number | null;
  organic_views: number | null;
  advertising_views: number | null;
}

const PLATFORM_COLORS = { facebook: "#3b82f6", tiktok: "#10b981", youtube: "#ef4444" };
const n = (v: number | null | undefined) => v || 0;
const fmt = (v: number) => new Intl.NumberFormat("vi-VN").format(Math.round(v));
const fmtCompact = (v: number) => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(v);

function todayStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

// Latest-per-account snapshot value for a daily-series field — both
// platforms only expose a "current value" API (no historical follower
// series), so "latest row in range" is the correct read for a KPI tile,
// same convention FacebookInsights.tsx already uses for fan_count.
function latestByAccount<T extends { date: string }>(rows: T[], accountKey: string): Map<string, T> {
  const byAccount = new Map<string, T[]>();
  rows.forEach((r) => {
    const key = (r as any)[accountKey];
    const list = byAccount.get(key) || [];
    list.push(r);
    byAccount.set(key, list);
  });
  const latest = new Map<string, T>();
  byAccount.forEach((list, key) => {
    const sorted = [...list].sort((a, b) => (a.date < b.date ? -1 : 1));
    latest.set(key, sorted[sorted.length - 1]);
  });
  return latest;
}

interface SocialReportProps {
  selectedBrand: "Livotec" | "Karofi";
  setSelectedBrand: (brand: "Livotec" | "Karofi") => void;
}

// Merges Facebook Page Insights with TikTok organic insights into one
// "Social Report" tab, per user request. The Facebook half is the existing,
// already-working FacebookInsights.tsx rendered as-is (not rewritten —
// no reason to risk regressing it) under its own sub-tab; the TikTok half
// is new. The "Tổng hợp" (combined) sub-tab only surfaces what's genuinely
// comparable between the two platforms (current follower count, content
// cadence, total engagement) — same "common metrics only" principle as
// Digital Ads Report's All-channel tab, since Facebook and TikTok's organic
// APIs expose different metric sets (see tiktokSync.ts/facebookSync.ts
// comments for exactly what each does and doesn't provide).
export default function SocialReport({ selectedBrand, setSelectedBrand }: SocialReportProps) {
  const [activeSection, setActiveSection] = useState<"overview" | "facebook" | "tiktok" | "youtube">("overview");

  const [since, setSince] = useState(todayStr(-30));
  const [until, setUntil] = useState(todayStr());

  const [tiktokAccounts, setTiktokAccounts] = useState<TiktokAccountMeta[]>([]);
  const [tiktokDaily, setTiktokDaily] = useState<TiktokInsightsDailyRow[]>([]);
  const [tiktokPosts, setTiktokPosts] = useState<TiktokPostRow[]>([]);
  const [youtubeAccounts, setYoutubeAccounts] = useState<YoutubeAccountMeta[]>([]);
  const [youtubeDaily, setYoutubeDaily] = useState<YoutubeInsightsDailyRow[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<YoutubeVideoRow[]>([]);
  const [fbFanCountLatest, setFbFanCountLatest] = useState(0);
  const [fbEngagementTotal, setFbEngagementTotal] = useState(0);
  const [fbPostCount, setFbPostCount] = useState(0);
  const [fbDailyForChart, setFbDailyForChart] = useState<{ date: string; fan_count: number | null }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tiktokBrandAccounts = useMemo(() => tiktokAccounts.filter((a) => a.brand === selectedBrand), [tiktokAccounts, selectedBrand]);
  const tiktokAccountIds = useMemo(() => tiktokBrandAccounts.map((a) => a.open_id), [tiktokBrandAccounts]);
  const youtubeBrandAccounts = useMemo(() => youtubeAccounts.filter((a) => a.brand === selectedBrand), [youtubeAccounts, selectedBrand]);
  const youtubeChannelIds = useMemo(() => youtubeBrandAccounts.map((a) => a.channel_id), [youtubeBrandAccounts]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Facebook data is fetched here too (not just inside the reused
        // <FacebookInsights/> below, which does its own independent fetch)
        // because the "Tổng hợp" tab needs FB numbers merged with TikTok's
        // — two separate, differently-scoped requests for the same data,
        // same as how each Digital Ads Report tab independently re-fetches
        // rather than sharing one giant cross-tab cache.
        const fbParams = new URLSearchParams({ since, until });
        const fbResult = await safeFetchJson(`/api/fb/insights?${fbParams.toString()}`);
        if (cancelled) return;
        if (fbResult.success) {
          const brandPageIds = (fbResult.pages || []).filter((p: any) => p.brand === selectedBrand).map((p: any) => p.page_id);
          const daily = (fbResult.daily || []).filter((r: any) => brandPageIds.includes(r.page_id));
          const posts = (fbResult.posts || []).filter((p: any) => brandPageIds.includes(p.page_id));
          const latestFan = latestByAccount<{ page_id: string; date: string; fan_count: number | null }>(daily, "page_id");
          setFbFanCountLatest(Array.from(latestFan.values()).reduce((s, r) => s + n(r.fan_count), 0));
          setFbEngagementTotal(
            posts.reduce(
              (sum: number, p: any) =>
                sum + n(p.likes) + n(p.loves) + n(p.wows) + n(p.hahas) + n(p.sorrys) + n(p.angers) + n(p.comments) + n(p.shares),
              0
            )
          );
          setFbPostCount(posts.length);
          const byDate = new Map<string, number>();
          daily.forEach((r: any) => byDate.set(r.date, (byDate.get(r.date) || 0) + n(r.fan_count)));
          setFbDailyForChart(Array.from(byDate.entries()).map(([date, fan_count]) => ({ date, fan_count })).sort((a, b) => (a.date < b.date ? -1 : 1)));
        }

        const ttParams = new URLSearchParams({ since, until });
        const ttResult = await safeFetchJson(`/api/tiktok/insights?${ttParams.toString()}`);
        if (cancelled) return;
        if (ttResult.success) {
          setTiktokAccounts(ttResult.accounts || []);
          setTiktokDaily(ttResult.daily || []);
          setTiktokPosts(ttResult.posts || []);
        } else {
          setError(ttResult.error || "Không tải được dữ liệu TikTok.");
        }

        const ytParams = new URLSearchParams({ since, until });
        const ytResult = await safeFetchJson(`/api/youtube/insights?${ytParams.toString()}`);
        if (cancelled) return;
        if (ytResult.success) {
          setYoutubeAccounts(ytResult.accounts || []);
          setYoutubeDaily(ytResult.daily || []);
          setYoutubeVideos(ytResult.videos || []);
        } else {
          setError(ytResult.error || "Không tải được dữ liệu YouTube.");
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Không tải được dữ liệu Social Report.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [since, until, selectedBrand]);

  const tiktokDailyScoped = useMemo(() => tiktokDaily.filter((r) => tiktokAccountIds.includes(r.open_id)), [tiktokDaily, tiktokAccountIds]);
  const tiktokPostsScoped = useMemo(() => tiktokPosts.filter((r) => tiktokAccountIds.includes(r.open_id)), [tiktokPosts, tiktokAccountIds]);

  const tiktokFollowerLatest = useMemo(() => {
    const latest = latestByAccount<TiktokInsightsDailyRow>(tiktokDailyScoped, "open_id");
    return Array.from(latest.values()).reduce((s, r) => s + n(r.follower_count), 0);
  }, [tiktokDailyScoped]);

  const tiktokEngagementTotal = useMemo(
    () => tiktokPostsScoped.reduce((s, p) => s + n(p.like_count) + n(p.comment_count) + n(p.share_count), 0),
    [tiktokPostsScoped]
  );

  const youtubeDailyScoped = useMemo(() => youtubeDaily.filter((r) => youtubeChannelIds.includes(r.channel_id)), [youtubeDaily, youtubeChannelIds]);
  const youtubeVideosScoped = useMemo(() => youtubeVideos.filter((r) => youtubeChannelIds.includes(r.channel_id)), [youtubeVideos, youtubeChannelIds]);

  const youtubeSubscriberLatest = useMemo(() => {
    const latest = latestByAccount<YoutubeInsightsDailyRow>(youtubeDailyScoped, "channel_id");
    return Array.from(latest.values()).reduce((s, r) => s + n(r.subscriber_count), 0);
  }, [youtubeDailyScoped]);

  const youtubeViewsTotal = useMemo(() => youtubeVideosScoped.reduce((s, v) => s + n(v.views), 0), [youtubeVideosScoped]);
  const youtubeOrganicViewsTotal = useMemo(() => youtubeVideosScoped.reduce((s, v) => s + n(v.organic_views), 0), [youtubeVideosScoped]);
  const youtubeAdViewsTotal = useMemo(() => youtubeVideosScoped.reduce((s, v) => s + n(v.advertising_views), 0), [youtubeVideosScoped]);

  const followerTrendChart = useMemo(() => {
    const byDate = new Map<string, { date: string; facebook: number; tiktok: number; youtube: number }>();
    fbDailyForChart.forEach((r) => {
      const entry = byDate.get(r.date) || { date: r.date, facebook: 0, tiktok: 0, youtube: 0 };
      entry.facebook = n(r.fan_count);
      byDate.set(r.date, entry);
    });
    const ttByDate = new Map<string, number>();
    tiktokDailyScoped.forEach((r) => ttByDate.set(r.date, (ttByDate.get(r.date) || 0) + n(r.follower_count)));
    ttByDate.forEach((val, date) => {
      const entry = byDate.get(date) || { date, facebook: 0, tiktok: 0, youtube: 0 };
      entry.tiktok = val;
      byDate.set(date, entry);
    });
    const ytByDate = new Map<string, number>();
    youtubeDailyScoped.forEach((r) => ytByDate.set(r.date, (ytByDate.get(r.date) || 0) + n(r.subscriber_count)));
    ytByDate.forEach((val, date) => {
      const entry = byDate.get(date) || { date, facebook: 0, tiktok: 0, youtube: 0 };
      entry.youtube = val;
      byDate.set(date, entry);
    });
    return Array.from(byDate.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [fbDailyForChart, tiktokDailyScoped, youtubeDailyScoped]);

  const sortedTiktokPosts = useMemo(() => [...tiktokPostsScoped].sort((a, b) => (a.create_time < b.create_time ? 1 : -1)), [tiktokPostsScoped]);
  const sortedYoutubeVideos = useMemo(() => [...youtubeVideosScoped].sort((a, b) => (a.published_at < b.published_at ? 1 : -1)), [youtubeVideosScoped]);

  const sections: { id: "overview" | "facebook" | "tiktok" | "youtube"; label: string }[] = [
    { id: "overview", label: "Tổng hợp" },
    { id: "facebook", label: "Facebook" },
    { id: "tiktok", label: "TikTok" },
    { id: "youtube", label: "YouTube" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-bold uppercase tracking-wider text-slate-800">Social Report</h1>
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
        {activeSection === "overview" && (
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" value={since} onChange={(e) => setSince(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs" />
            <span className="text-xs text-slate-400">→</span>
            <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs" />
          </div>
        )}
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

      {activeSection === "facebook" && <FacebookInsights selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} />}

      {activeSection === "tiktok" && (
        <TiktokSection
          isLoading={isLoading}
          error={error}
          accounts={tiktokBrandAccounts}
          daily={tiktokDailyScoped}
          posts={sortedTiktokPosts}
          followerLatest={tiktokFollowerLatest}
          engagementTotal={tiktokEngagementTotal}
        />
      )}

      {activeSection === "youtube" && (
        <YoutubeSection
          isLoading={isLoading}
          error={error}
          accounts={youtubeBrandAccounts}
          daily={youtubeDailyScoped}
          videos={sortedYoutubeVideos}
          subscriberLatest={youtubeSubscriberLatest}
          viewsTotal={youtubeViewsTotal}
          organicViewsTotal={youtubeOrganicViewsTotal}
          adViewsTotal={youtubeAdViewsTotal}
        />
      )}

      {activeSection === "overview" && (
        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang tải dữ liệu...
            </div>
          ) : (
            <>
              <p className="text-[11px] text-slate-400">
                Chỉ so sánh những gì cả 3 nền tảng cùng cung cấp được: follower/subscriber hiện tại, số bài/video đã đăng, và tổng tương tác nơi có (Facebook/
                TikTok). Facebook không còn cấp reach/impressions cấp Page (Meta đã retire), TikTok public API không cấp profile views, và YouTube Analytics
                không cấp like/comment ở scope hiện tại — nên "Tổng hợp" không có các chỉ số đó; xem chi tiết từng nền tảng ở tab riêng.
              </p>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                <PlatformStat icon={Facebook} label="Follower (Facebook)" value={fmtCompact(fbFanCountLatest)} color="text-blue-600 bg-blue-50 border-blue-200" />
                <PlatformStat icon={Music2} label="Follower (TikTok)" value={fmtCompact(tiktokFollowerLatest)} color="text-emerald-600 bg-emerald-50 border-emerald-200" />
                <PlatformStat icon={Youtube} label="Subscriber (YouTube)" value={fmtCompact(youtubeSubscriberLatest)} color="text-red-600 bg-red-50 border-red-200" />
                <PlatformStat icon={Users} label="Nội dung đã đăng" value={`${fmt(fbPostCount)} bài · ${fmt(sortedTiktokPosts.length)} TikTok · ${fmt(sortedYoutubeVideos.length)} YouTube`} color="text-indigo-600 bg-indigo-50 border-indigo-200" />
                <PlatformStat icon={Heart} label="Tương tác (Facebook)" value={fmtCompact(fbEngagementTotal)} color="text-blue-600 bg-blue-50 border-blue-200" />
                <PlatformStat icon={Heart} label="Tương tác (TikTok)" value={fmtCompact(tiktokEngagementTotal)} color="text-emerald-600 bg-emerald-50 border-emerald-200" />
                <PlatformStat icon={Eye} label="Video views (TikTok)" value={fmtCompact(sortedTiktokPosts.reduce((s, p) => s + n(p.view_count), 0))} color="text-emerald-600 bg-emerald-50 border-emerald-200" />
                <PlatformStat icon={Eye} label="Video views (YouTube)" value={fmtCompact(youtubeViewsTotal)} color="text-red-600 bg-red-50 border-red-200" />
              </div>

              <div className="h-80 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className="block pb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Follower/Subscriber theo ngày — Facebook vs TikTok vs YouTube</span>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={followerTrendChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={fmtCompact} domain={["auto", "auto"]} />
                    <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                    <Legend />
                    <Line type="monotone" dataKey="facebook" name="Facebook" stroke={PLATFORM_COLORS.facebook} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="tiktok" name="TikTok" stroke={PLATFORM_COLORS.tiktok} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="youtube" name="YouTube" stroke={PLATFORM_COLORS.youtube} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PlatformStat({ icon: Icon, label, value, color }: { icon: typeof Facebook; label: string; value: string; color: string }) {
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

function TiktokSection({
  isLoading,
  error,
  accounts,
  daily,
  posts,
  followerLatest,
  engagementTotal,
}: {
  isLoading: boolean;
  error: string | null;
  accounts: TiktokAccountMeta[];
  daily: TiktokInsightsDailyRow[];
  posts: TiktokPostRow[];
  followerLatest: number;
  engagementTotal: number;
}) {
  const followerByDate = useMemo(() => {
    const byDate = new Map<string, number>();
    daily.forEach((r) => byDate.set(r.date, (byDate.get(r.date) || 0) + n(r.follower_count)));
    return Array.from(byDate.entries()).map(([date, follower_count]) => ({ date, follower_count })).sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [daily]);

  const totalViews = posts.reduce((s, p) => s + n(p.view_count), 0);

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
        <AlertCircle className="h-4 w-4 shrink-0" /> {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang tải dữ liệu...
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto h-8 w-8 text-slate-300" />
        <h2 className="mt-3 text-sm font-bold text-slate-800">Chưa có tài khoản TikTok nào gán cho thương hiệu này</h2>
        <p className="mt-1 text-xs text-slate-500">Vào Control Panel → "Kết nối nền tảng" → TikTok (Admin) để kết nối tài khoản TikTok qua OAuth.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <PlatformStat icon={Users} label="Follower" value={fmtCompact(followerLatest)} color="text-emerald-600 bg-emerald-50 border-emerald-200" />
        <PlatformStat icon={Eye} label="Video views" value={fmtCompact(totalViews)} color="text-emerald-600 bg-emerald-50 border-emerald-200" />
        <PlatformStat icon={Heart} label="Tương tác (like+comment+share)" value={fmtCompact(engagementTotal)} color="text-emerald-600 bg-emerald-50 border-emerald-200" />
        <PlatformStat icon={Music2} label="Video đã đồng bộ" value={fmt(posts.length)} color="text-emerald-600 bg-emerald-50 border-emerald-200" />
      </div>

      <div className="h-72 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <span className="block pb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Follower theo ngày</span>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={followerByDate}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={fmtCompact} domain={["auto", "auto"]} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Line type="monotone" dataKey="follower_count" name="Follower" stroke={PLATFORM_COLORS.tiktok} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="h-72 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <span className="block pb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Views & Likes theo video gần nhất</span>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={posts.slice(0, 15).map((p) => ({ ...p, label: (p.title || p.video_id).slice(0, 16) }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis tickFormatter={fmtCompact} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Legend />
            <Bar dataKey="view_count" name="Views" fill={PLATFORM_COLORS.tiktok} radius={[4, 4, 0, 0]} />
            <Bar dataKey="like_count" name="Likes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Video gần đây</span>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Ngày</th>
                <th className="px-3 py-2 text-left">Tiêu đề</th>
                <th className="px-3 py-2 text-right">Views</th>
                <th className="px-3 py-2 text-right">Likes</th>
                <th className="px-3 py-2 text-right">Comments</th>
                <th className="px-3 py-2 text-right">Shares</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                    Chưa có video nào trong khoảng thời gian đã chọn.
                  </td>
                </tr>
              ) : (
                posts.slice(0, 50).map((p) => (
                  <tr key={p.video_id}>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{new Date(p.create_time).toLocaleDateString("vi-VN")}</td>
                    <td className="max-w-xs truncate px-3 py-2 text-slate-700" title={p.title || ""}>
                      {p.share_url ? (
                        <a href={p.share_url} target="_blank" rel="noreferrer" className="hover:underline">
                          {p.title || "(không có tiêu đề)"}
                        </a>
                      ) : (
                        p.title || "(không có tiêu đề)"
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">{fmt(n(p.view_count))}</td>
                    <td className="px-3 py-2 text-right">{fmt(n(p.like_count))}</td>
                    <td className="px-3 py-2 text-right">{fmt(n(p.comment_count))}</td>
                    <td className="px-3 py-2 text-right">{fmt(n(p.share_count))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Organic vs advertising-driven views (insightTrafficSourceType) is the one
// metric neither Facebook nor TikTok's organic APIs expose — the reason this
// integration exists rather than just adding YouTube as a 4th generic
// follower-count platform. Kept as its own chart rather than folded into
// "Tổng hợp" (which only shows what all 3 platforms have in common).
function YoutubeSection({
  isLoading,
  error,
  accounts,
  daily,
  videos,
  subscriberLatest,
  viewsTotal,
  organicViewsTotal,
  adViewsTotal,
}: {
  isLoading: boolean;
  error: string | null;
  accounts: YoutubeAccountMeta[];
  daily: YoutubeInsightsDailyRow[];
  videos: YoutubeVideoRow[];
  subscriberLatest: number;
  viewsTotal: number;
  organicViewsTotal: number;
  adViewsTotal: number;
}) {
  const subscriberByDate = useMemo(() => {
    const byDate = new Map<string, number>();
    daily.forEach((r) => byDate.set(r.date, (byDate.get(r.date) || 0) + n(r.subscriber_count)));
    return Array.from(byDate.entries()).map(([date, subscriber_count]) => ({ date, subscriber_count })).sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [daily]);

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
        <AlertCircle className="h-4 w-4 shrink-0" /> {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang tải dữ liệu...
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto h-8 w-8 text-slate-300" />
        <h2 className="mt-3 text-sm font-bold text-slate-800">Chưa có kênh YouTube nào gán cho thương hiệu này</h2>
        <p className="mt-1 text-xs text-slate-500">Vào Control Panel → "Kết nối nền tảng" → Google (Admin) để kết nối kênh YouTube qua OAuth.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <PlatformStat icon={Users} label="Subscriber" value={fmtCompact(subscriberLatest)} color="text-red-600 bg-red-50 border-red-200" />
        <PlatformStat icon={Eye} label="Tổng views" value={fmtCompact(viewsTotal)} color="text-red-600 bg-red-50 border-red-200" />
        <PlatformStat icon={Eye} label="Views organic" value={fmtCompact(organicViewsTotal)} color="text-red-600 bg-red-50 border-red-200" />
        <PlatformStat icon={Youtube} label="Views từ quảng cáo" value={fmtCompact(adViewsTotal)} color="text-red-600 bg-red-50 border-red-200" />
      </div>

      <div className="h-72 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <span className="block pb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Subscriber theo ngày</span>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={subscriberByDate}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={fmtCompact} domain={["auto", "auto"]} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Line type="monotone" dataKey="subscriber_count" name="Subscriber" stroke={PLATFORM_COLORS.youtube} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="h-72 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <span className="block pb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Views organic vs. quảng cáo theo video gần nhất</span>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={videos.slice(0, 15).map((v) => ({ ...v, label: (v.title || v.video_id).slice(0, 16) }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis tickFormatter={fmtCompact} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Legend />
            <Bar dataKey="organic_views" name="Organic" fill={PLATFORM_COLORS.youtube} radius={[4, 4, 0, 0]} />
            <Bar dataKey="advertising_views" name="Quảng cáo" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Video gần đây</span>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Ngày đăng</th>
                <th className="px-3 py-2 text-left">Tiêu đề</th>
                <th className="px-3 py-2 text-right">Views organic</th>
                <th className="px-3 py-2 text-right">Views quảng cáo</th>
                <th className="px-3 py-2 text-right">Tổng views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                    Chưa có video nào trong khoảng thời gian đã chọn.
                  </td>
                </tr>
              ) : (
                videos.slice(0, 50).map((v) => (
                  <tr key={v.video_id}>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{new Date(v.published_at).toLocaleDateString("vi-VN")}</td>
                    <td className="max-w-xs truncate px-3 py-2 text-slate-700" title={v.title || ""}>
                      <a href={`https://www.youtube.com/watch?v=${v.video_id}`} target="_blank" rel="noreferrer" className="hover:underline">
                        {v.title || "(không có tiêu đề)"}
                      </a>
                    </td>
                    <td className="px-3 py-2 text-right">{fmt(n(v.organic_views))}</td>
                    <td className="px-3 py-2 text-right">{fmt(n(v.advertising_views))}</td>
                    <td className="px-3 py-2 text-right font-semibold">{fmt(n(v.views))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
