import React, { useEffect, useMemo, useState } from "react";
import { PlusCircle, Trash2, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";
import { safeFetchJson } from "../App";

type OutreachPlatform = "Facebook" | "TikTok" | "Instagram" | "YouTube" | "Other";

interface KocKolAccount {
  id: string;
  name: string;
  platform: OutreachPlatform;
  handle_or_url: string | null;
}

interface OutreachPost {
  id: string;
  campaign_id: string;
  koc_kol_id: string | null;
  platform: OutreachPlatform;
  post_url: string;
  published_at: string | null;
  status: "Scheduled" | "Live" | "Removed";
  can_edit: boolean;
}

interface OutreachPostMetric {
  id: string;
  post_id: string;
  recorded_at: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
}

const n = (v: number | null | undefined) => v || 0;
const fmt = (v: number) => new Intl.NumberFormat("vi-VN").format(Math.round(v));

const PLATFORM_BADGE: Record<OutreachPlatform, string> = {
  Facebook: "bg-blue-50 text-blue-700",
  TikTok: "bg-slate-800 text-white",
  Instagram: "bg-pink-50 text-pink-700",
  YouTube: "bg-red-50 text-red-700",
  Other: "bg-slate-100 text-slate-600",
};

// Per-campaign panel listing its Social Outreach (KOC/KOL) posts + metrics —
// expanded inline under a campaign row in CampaignManagement.tsx's Campaign
// Calendar table. See `task cần làm/campaign task/
// phan-tich-social-outreach-campaign.md` for the full design this was built
// from — priority platforms TikTok/Facebook, manual metric entry (no
// reliable public API for either), roster reused across campaigns.
export default function OutreachPanel({ campaignId, campaignName, canEdit }: { campaignId: string; campaignName: string; canEdit: boolean }) {
  const [posts, setPosts] = useState<OutreachPost[]>([]);
  const [roster, setRoster] = useState<KocKolAccount[]>([]);
  const [metrics, setMetrics] = useState<OutreachPostMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [metricFormPostId, setMetricFormPostId] = useState<string | null>(null);
  const [metricForm, setMetricForm] = useState({ views: "", likes: "", comments: "", shares: "" });

  const [newPost, setNewPost] = useState({ platform: "TikTok" as OutreachPlatform, koc_kol_id: "", post_url: "", published_at: "" });
  const [showRosterQuickAdd, setShowRosterQuickAdd] = useState(false);
  const [newRosterEntry, setNewRosterEntry] = useState({ name: "", platform: "TikTok" as OutreachPlatform, handle_or_url: "" });

  async function loadAll() {
    setIsLoading(true);
    try {
      const [postsRes, rosterRes] = await Promise.all([
        safeFetchJson(`/api/outreach/posts?campaign_id=${encodeURIComponent(campaignId)}`),
        safeFetchJson("/api/outreach/koc-kol"),
      ]);
      const loadedPosts: OutreachPost[] = postsRes.success ? postsRes.posts || [] : [];
      setPosts(loadedPosts);
      if (rosterRes.success) setRoster(rosterRes.accounts || []);
      if (loadedPosts.length > 0) {
        const metricsRes = await safeFetchJson(`/api/outreach/metrics?post_ids=${loadedPosts.map((p) => p.id).join(",")}`);
        if (metricsRes.success) setMetrics(metricsRes.metrics || []);
      } else {
        setMetrics([]);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tải được dữ liệu Outreach." });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const rosterById = useMemo(() => new Map(roster.map((r) => [r.id, r])), [roster]);
  const latestMetricByPost = useMemo(() => {
    const map = new Map<string, OutreachPostMetric>();
    for (const m of metrics) {
      const existing = map.get(m.post_id);
      if (!existing || m.recorded_at > existing.recorded_at) map.set(m.post_id, m);
    }
    return map;
  }, [metrics]);

  const rollup = useMemo(() => {
    let totalViews = 0;
    let totalEngagement = 0;
    posts.forEach((p) => {
      const m = latestMetricByPost.get(p.id);
      if (!m) return;
      totalViews += n(m.views);
      totalEngagement += n(m.likes) + n(m.comments) + n(m.shares);
    });
    return { totalPosts: posts.length, totalViews, totalEngagement };
  }, [posts, latestMetricByPost]);

  async function handleAddRosterEntry() {
    if (!newRosterEntry.name.trim()) return;
    const result = await safeFetchJson("/api/outreach/koc-kol", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRosterEntry),
    });
    if (result.success) {
      setNewPost({ ...newPost, koc_kol_id: result.account.id, platform: result.account.platform });
      setNewRosterEntry({ name: "", platform: "TikTok", handle_or_url: "" });
      setShowRosterQuickAdd(false);
      await loadAll();
    } else {
      setMessage({ type: "error", text: result.error || "Thêm KOC/KOL thất bại." });
    }
  }

  async function handleAddPost(e: React.FormEvent) {
    e.preventDefault();
    if (!newPost.post_url.trim()) {
      setMessage({ type: "error", text: "Cần nhập URL bài đăng." });
      return;
    }
    const result = await safeFetchJson("/api/outreach/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaign_id: campaignId, ...newPost, koc_kol_id: newPost.koc_kol_id || null, published_at: newPost.published_at || null }),
    });
    if (result.success) {
      setNewPost({ platform: newPost.platform, koc_kol_id: newPost.koc_kol_id, post_url: "", published_at: "" });
      await loadAll();
    } else {
      setMessage({ type: "error", text: result.error || "Thêm bài đăng thất bại." });
    }
  }

  async function handleDeletePost(id: string) {
    if (!window.confirm("Xoá bài đăng outreach này? Toàn bộ số liệu đã ghi cũng mất theo.")) return;
    const result = await safeFetchJson(`/api/outreach/posts/${id}`, { method: "DELETE" });
    if (result.success) await loadAll();
    else setMessage({ type: "error", text: result.error || "Xoá thất bại." });
  }

  async function handleSubmitMetric(postId: string) {
    const body = {
      views: metricForm.views ? Number(metricForm.views) : null,
      likes: metricForm.likes ? Number(metricForm.likes) : null,
      comments: metricForm.comments ? Number(metricForm.comments) : null,
      shares: metricForm.shares ? Number(metricForm.shares) : null,
    };
    const result = await safeFetchJson(`/api/outreach/posts/${postId}/metrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (result.success) {
      setMetricFormPostId(null);
      setMetricForm({ views: "", likes: "", comments: "", shares: "" });
      await loadAll();
    } else {
      setMessage({ type: "error", text: result.error || "Cập nhật số liệu thất bại." });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang tải Outreach Posts...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold text-slate-700">Social Outreach — {campaignName}</p>
        <div className="flex gap-3 text-[11px] text-slate-500">
          <span>
            <strong className="text-slate-700">{rollup.totalPosts}</strong> bài
          </span>
          <span>
            <strong className="text-slate-700">{fmt(rollup.totalViews)}</strong> views
          </span>
          <span>
            <strong className="text-slate-700">{fmt(rollup.totalEngagement)}</strong> engagement
          </span>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 rounded-lg border p-2 text-[11px] ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          <AlertCircle className="h-3 w-3 shrink-0" /> {message.text}
        </div>
      )}

      {posts.length === 0 ? (
        <p className="text-[11px] text-slate-400">Chưa có bài đăng outreach nào cho campaign này.</p>
      ) : (
        <div className="space-y-1.5">
          {posts.map((p) => {
            const koc = p.koc_kol_id ? rosterById.get(p.koc_kol_id) : null;
            const latest = latestMetricByPost.get(p.id);
            return (
              <div key={p.id} className="rounded-lg border border-slate-200 bg-white p-2 text-[11px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 font-bold ${PLATFORM_BADGE[p.platform]}`}>{p.platform}</span>
                  <span className="font-medium text-slate-700">{koc?.name || "Chưa gán KOC/KOL"}</span>
                  <a href={p.post_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline">
                    Xem bài <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                  <span className="text-slate-400">{p.published_at || "—"}</span>
                  <span className="ml-auto flex gap-2 font-mono text-slate-600">
                    {latest ? (
                      <>
                        👁 {fmt(n(latest.views))} · 👍 {fmt(n(latest.likes))} · 💬 {fmt(n(latest.comments))} · 🔁 {fmt(n(latest.shares))}
                      </>
                    ) : (
                      <span className="text-slate-400">Chưa có số liệu</span>
                    )}
                  </span>
                  {p.can_edit && (
                    <>
                      <button
                        onClick={() => {
                          setMetricFormPostId((prev) => (prev === p.id ? null : p.id));
                          setMetricForm({ views: "", likes: "", comments: "", shares: "" });
                        }}
                        className="rounded border border-indigo-200 px-1.5 py-0.5 font-semibold text-indigo-600 hover:bg-indigo-50"
                      >
                        Cập nhật số liệu
                      </button>
                      <button onClick={() => handleDeletePost(p.id)} className="text-rose-500 hover:underline">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
                {metricFormPostId === p.id && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-1.5">
                    {(["views", "likes", "comments", "shares"] as const).map((field) => (
                      <input
                        key={field}
                        type="number"
                        min="0"
                        placeholder={field}
                        value={metricForm[field]}
                        onChange={(e) => setMetricForm({ ...metricForm, [field]: e.target.value })}
                        className="w-20 rounded border border-slate-200 px-1.5 py-1 text-[11px]"
                      />
                    ))}
                    <button onClick={() => handleSubmitMetric(p.id)} className="rounded bg-indigo-600 px-2 py-1 font-semibold text-white hover:bg-indigo-700">
                      Lưu
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {canEdit && (
        <form onSubmit={handleAddPost} className="space-y-1.5 rounded-lg border border-dashed border-slate-300 p-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <select
              value={newPost.platform}
              onChange={(e) => setNewPost({ ...newPost, platform: e.target.value as OutreachPlatform })}
              className="rounded border border-slate-200 px-2 py-1 text-[11px]"
            >
              <option value="TikTok">TikTok</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="YouTube">YouTube</option>
              <option value="Other">Khác</option>
            </select>
            <select
              value={newPost.koc_kol_id}
              onChange={(e) => setNewPost({ ...newPost, koc_kol_id: e.target.value })}
              className="rounded border border-slate-200 px-2 py-1 text-[11px]"
            >
              <option value="">-- Chọn KOC/KOL --</option>
              {roster.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.platform})
                </option>
              ))}
            </select>
            <button type="button" onClick={() => setShowRosterQuickAdd((s) => !s)} className="text-[11px] font-semibold text-indigo-600 hover:underline">
              + KOC/KOL mới
            </button>
          </div>
          {showRosterQuickAdd && (
            <div className="flex flex-wrap items-center gap-1.5 rounded bg-slate-50 p-1.5">
              <input
                type="text"
                placeholder="Tên KOC/KOL"
                value={newRosterEntry.name}
                onChange={(e) => setNewRosterEntry({ ...newRosterEntry, name: e.target.value })}
                className="rounded border border-slate-200 px-2 py-1 text-[11px]"
              />
              <select
                value={newRosterEntry.platform}
                onChange={(e) => setNewRosterEntry({ ...newRosterEntry, platform: e.target.value as OutreachPlatform })}
                className="rounded border border-slate-200 px-2 py-1 text-[11px]"
              >
                <option value="TikTok">TikTok</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
                <option value="Other">Khác</option>
              </select>
              <input
                type="text"
                placeholder="Link trang cá nhân (tuỳ chọn)"
                value={newRosterEntry.handle_or_url}
                onChange={(e) => setNewRosterEntry({ ...newRosterEntry, handle_or_url: e.target.value })}
                className="min-w-[160px] flex-1 rounded border border-slate-200 px-2 py-1 text-[11px]"
              />
              <button type="button" onClick={handleAddRosterEntry} className="rounded bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700">
                Lưu roster
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              type="text"
              placeholder="URL bài đăng"
              value={newPost.post_url}
              onChange={(e) => setNewPost({ ...newPost, post_url: e.target.value })}
              className="min-w-[200px] flex-1 rounded border border-slate-200 px-2 py-1 text-[11px]"
            />
            <input
              type="date"
              value={newPost.published_at}
              onChange={(e) => setNewPost({ ...newPost, published_at: e.target.value })}
              className="rounded border border-slate-200 px-2 py-1 text-[11px]"
            />
            <button type="submit" className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700">
              <PlusCircle className="h-3 w-3" /> Thêm bài đăng
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
