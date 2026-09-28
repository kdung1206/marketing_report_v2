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
import { Search, Link2, TrendingUp, RefreshCw, AlertCircle, CheckCircle2, Trash2, PlusCircle } from "lucide-react";
import { safeFetchJson } from "../App";

interface KeywordRankTarget {
  id: string;
  keyword: string;
  category: string;
  brands: ("Livotec" | "Karofi")[];
  is_active: boolean;
}

interface KeywordRankHistoryRow {
  target_id: string;
  brand: "Livotec" | "Karofi";
  checked_at: string;
  position: number | null;
  ranking_url: string | null;
}

interface SovMentionRow {
  brand_name: string;
  checked_at: string;
  mention_count: number;
}

interface Backlink {
  id: string;
  brand: "Livotec" | "Karofi";
  source_platform: string;
  target_url: string;
  anchor_text: string | null;
  backlink_url: string;
  link_type: "dofollow" | "nofollow" | "unknown";
  status: "Submitted" | "Pending Review" | "Live" | "Removed";
  assignee_username: string | null;
  submitted_at: string | null;
  last_checked_at: string | null;
  last_check_result: "found" | "not_found" | "error" | null;
}

const CATEGORY_SUGGESTIONS = ["Lọc nước", "Lọc tổng", "Điều hòa"];
const SOV_COLORS: Record<string, string> = {
  Karofi: "#059669",
  Livotec: "#6366f1",
  Kangaroo: "#f59e0b",
  Sunhouse: "#0ea5e9",
  "Hòa Phát": "#ec4899",
};

function positionBadgeColor(position: number | null): string {
  if (position == null) return "text-slate-400 bg-slate-100";
  if (position <= 10) return "text-emerald-600 bg-emerald-50";
  if (position <= 30) return "text-amber-600 bg-amber-50";
  return "text-slate-500 bg-slate-100";
}

// Keyword Rank Tracker + Brand SOV (serper.dev, credit-metered — see
// seoToolsSync.ts) + Backlink Tracker (free). Independent of GA4/Search
// Console connection status, so this renders regardless of whether Website
// (GA4/Search Console) is connected for the selected brand — see the
// activeSection === "seo-tools" branch in WebsiteReport.tsx that bypasses
// that gate.
export default function SeoToolsSection({ selectedBrand }: { selectedBrand: "Livotec" | "Karofi" }) {
  const [keywordTargets, setKeywordTargets] = useState<KeywordRankTarget[]>([]);
  const [rankHistory, setRankHistory] = useState<KeywordRankHistoryRow[]>([]);
  const [sovMentions, setSovMentions] = useState<SovMentionRow[]>([]);
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [serperConfigured, setSerperConfigured] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSyncingRank, setIsSyncingRank] = useState(false);
  const [isVerifyingBacklinks, setIsVerifyingBacklinks] = useState(false);

  const [newKeyword, setNewKeyword] = useState({ keyword: "", category: "Lọc nước", brands: [] as ("Livotec" | "Karofi")[] });
  const [newBacklink, setNewBacklink] = useState({ source_platform: "", target_url: "", backlink_url: "", anchor_text: "", link_type: "unknown" as Backlink["link_type"] });

  async function loadAll() {
    setIsLoading(true);
    try {
      const [targetsRes, historyRes, sovRes, backlinksRes] = await Promise.all([
        safeFetchJson("/api/seo-tools/keyword-targets"),
        safeFetchJson("/api/seo-tools/keyword-rank-history"),
        safeFetchJson("/api/seo-tools/sov"),
        safeFetchJson(`/api/backlinks?brand=${encodeURIComponent(selectedBrand)}`),
      ]);
      if (targetsRes.success) {
        setKeywordTargets(targetsRes.targets || []);
        setSerperConfigured(targetsRes.serperConfigured !== false);
      }
      if (historyRes.success) setRankHistory(historyRes.history || []);
      if (sovRes.success) setSovMentions(sovRes.mentions || []);
      if (backlinksRes.success) setBacklinks(backlinksRes.backlinks || []);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tải được dữ liệu SEO Tools." });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand]);

  const brandTargets = useMemo(() => keywordTargets.filter((t) => t.brands.includes(selectedBrand)), [keywordTargets, selectedBrand]);

  // Latest + previous position per target for this brand, to show a simple
  // up/down arrow alongside the current position.
  const rankRows = useMemo(() => {
    return brandTargets.map((t) => {
      const rows = rankHistory
        .filter((h) => h.target_id === t.id && h.brand === selectedBrand)
        .sort((a, b) => (a.checked_at < b.checked_at ? 1 : -1));
      return { target: t, latest: rows[0] || null, previous: rows[1] || null, history: rows };
    });
  }, [brandTargets, rankHistory, selectedBrand]);

  const sovChartData = useMemo(() => {
    const byDate = new Map<string, Record<string, any>>();
    sovMentions.forEach((m) => {
      const entry = byDate.get(m.checked_at) || { date: m.checked_at };
      entry[m.brand_name] = m.mention_count;
      byDate.set(m.checked_at, entry);
    });
    return Array.from(byDate.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [sovMentions]);

  async function handleAddKeyword(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyword.keyword.trim() || newKeyword.brands.length === 0) {
      setMessage({ type: "error", text: "Cần nhập từ khoá và chọn ít nhất 1 brand." });
      return;
    }
    const result = await safeFetchJson("/api/seo-tools/keyword-targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newKeyword),
    });
    if (result.success) {
      setNewKeyword({ keyword: "", category: newKeyword.category, brands: [] });
      await loadAll();
    } else {
      setMessage({ type: "error", text: result.error || "Thêm từ khoá thất bại." });
    }
  }

  async function handleDeleteKeyword(id: string) {
    if (!window.confirm("Xoá từ khoá này khỏi danh sách theo dõi? Lịch sử thứ hạng đã ghi sẽ mất theo.")) return;
    const result = await safeFetchJson(`/api/seo-tools/keyword-targets/${id}`, { method: "DELETE" });
    if (result.success) await loadAll();
    else setMessage({ type: "error", text: result.error || "Xoá thất bại." });
  }

  async function handleSyncRankNow() {
    if (!window.confirm("Đồng bộ ngay sẽ gọi serper.dev cho toàn bộ từ khoá đang theo dõi (tốn credit thật, không phải hành động miễn phí). Tiếp tục?")) return;
    setIsSyncingRank(true);
    setMessage(null);
    try {
      const result = await safeFetchJson("/api/seo-tools/sync-now", { method: "POST" });
      if (result.success) {
        setMessage({ type: "success", text: "Đã đồng bộ Rank Tracker + SOV." });
        await loadAll();
      } else {
        setMessage({ type: "error", text: result.error || "Đồng bộ thất bại." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Đồng bộ thất bại." });
    } finally {
      setIsSyncingRank(false);
    }
  }

  async function handleAddBacklink(e: React.FormEvent) {
    e.preventDefault();
    if (!newBacklink.source_platform.trim() || !newBacklink.target_url.trim() || !newBacklink.backlink_url.trim()) {
      setMessage({ type: "error", text: "Cần nhập đủ nền tảng, trang đích, và URL backlink." });
      return;
    }
    const result = await safeFetchJson("/api/backlinks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newBacklink, brand: selectedBrand }),
    });
    if (result.success) {
      setNewBacklink({ source_platform: "", target_url: "", backlink_url: "", anchor_text: "", link_type: "unknown" });
      await loadAll();
    } else {
      setMessage({ type: "error", text: result.error || "Thêm backlink thất bại." });
    }
  }

  async function handleSetBacklinkStatus(id: string, status: Backlink["status"]) {
    setBacklinks((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    const result = await safeFetchJson(`/api/backlinks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!result.success) {
      setMessage({ type: "error", text: result.error || "Cập nhật trạng thái thất bại." });
      await loadAll();
    }
  }

  async function handleDeleteBacklink(id: string) {
    if (!window.confirm("Xoá backlink này?")) return;
    const result = await safeFetchJson(`/api/backlinks/${id}`, { method: "DELETE" });
    if (result.success) await loadAll();
    else setMessage({ type: "error", text: result.error || "Xoá thất bại." });
  }

  async function handleVerifyBacklinksNow() {
    setIsVerifyingBacklinks(true);
    setMessage(null);
    try {
      const result = await safeFetchJson("/api/backlinks/verify-now", { method: "POST" });
      if (result.success) {
        setMessage({ type: "success", text: `Đã kiểm tra ${result.results?.length ?? 0} backlink.` });
        await loadAll();
      } else {
        setMessage({ type: "error", text: result.error || "Kiểm tra thất bại." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Kiểm tra thất bại." });
    } finally {
      setIsVerifyingBacklinks(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs ${
            message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* 1. Keyword Rank Tracker */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            <Search className="h-3.5 w-3.5" /> Keyword Rank Tracker
          </span>
          <button
            onClick={handleSyncRankNow}
            disabled={isSyncingRank || !serperConfigured}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncingRank ? "animate-spin" : ""}`} /> Đồng bộ ngay (tốn credit)
          </button>
        </div>
        <p className="pb-3 text-[11px] text-slate-400">Vị trí thật trên Google.com.vn (khác vị trí trung bình của Search Console ở tab "Tổng hợp") — cập nhật hàng tuần qua serper.dev.</p>

        {!serperConfigured && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800">
            Chưa cấu hình <code className="rounded bg-amber-100 px-1">SERPER_API_KEY</code> — xem .env.example.
          </div>
        )}

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-400">
              <th className="pb-2 font-medium">Nhóm</th>
              <th className="pb-2 font-medium">Từ khoá</th>
              <th className="pb-2 font-medium text-right">Vị trí</th>
              <th className="pb-2 font-medium text-right">Lần trước</th>
              <th className="pb-2 font-medium">Ngày kiểm tra</th>
              <th className="pb-2 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody>
            {rankRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-slate-400">
                  Chưa có từ khoá nào theo dõi cho {selectedBrand}.
                </td>
              </tr>
            ) : (
              rankRows.map(({ target, latest, previous }) => (
                <tr key={target.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 text-slate-500">{target.category}</td>
                  <td className="py-2 font-medium text-slate-700">{target.keyword}</td>
                  <td className="py-2 text-right">
                    <span className={`rounded-md px-1.5 py-0.5 font-mono font-bold ${positionBadgeColor(latest?.position ?? null)}`}>
                      {latest ? latest.position ?? ">100" : "—"}
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono text-slate-400">{previous ? previous.position ?? ">100" : "—"}</td>
                  <td className="py-2 text-slate-400">{latest?.checked_at || "Chưa kiểm tra"}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => handleDeleteKeyword(target.id)} className="text-rose-500 hover:underline">
                      Xoá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <form onSubmit={handleAddKeyword} className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <input
            type="text"
            value={newKeyword.keyword}
            onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
            placeholder="Từ khoá mới"
            className="min-w-[180px] flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          />
          <input
            list="seo-category-suggestions"
            value={newKeyword.category}
            onChange={(e) => setNewKeyword({ ...newKeyword, category: e.target.value })}
            placeholder="Nhóm (VD: Lọc nước)"
            className="w-36 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          />
          <datalist id="seo-category-suggestions">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {(["Livotec", "Karofi"] as const).map((b) => (
            <label key={b} className="flex items-center gap-1 text-[11px] text-slate-600">
              <input
                type="checkbox"
                checked={newKeyword.brands.includes(b)}
                onChange={(e) =>
                  setNewKeyword({
                    ...newKeyword,
                    brands: e.target.checked ? [...newKeyword.brands, b] : newKeyword.brands.filter((x) => x !== b),
                  })
                }
              />
              {b}
            </label>
          ))}
          <button type="submit" className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-700">
            <PlusCircle className="h-3 w-3" /> Thêm
          </button>
        </form>
      </div>

      {/* 2. Brand SOV (search visibility) */}
      <div className="h-72 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <span className="flex items-center gap-1.5 pb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
          <TrendingUp className="h-3.5 w-3.5" /> SOV tìm kiếm (search visibility)
        </span>
        <p className="pb-2 text-[11px] text-slate-400">
          Số kết quả tin tức gần đây nhắc tới từng brand — chỉ số "độ phủ tìm kiếm", KHÁC số "Thị phần thảo luận" trên Dashboard chính (nguồn dữ liệu khác).
        </p>
        <ResponsiveContainer width="100%" height="75%">
          <BarChart data={sovChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Legend />
            {Object.keys(SOV_COLORS).map((brand) => (
              <Bar key={brand} dataKey={brand} name={brand} fill={SOV_COLORS[brand]} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Backlink Tracker */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            <Link2 className="h-3.5 w-3.5" /> Backlink Tracker
          </span>
          <button
            onClick={handleVerifyBacklinksNow}
            disabled={isVerifyingBacklinks}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isVerifyingBacklinks ? "animate-spin" : ""}`} /> Kiểm tra ngay (miễn phí)
          </button>
        </div>
        <p className="pb-3 text-[11px] text-slate-400">Cron hàng ngày tự kiểm tra backlink còn sống không — không cần bấm tay.</p>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-400">
              <th className="pb-2 font-medium">Nguồn</th>
              <th className="pb-2 font-medium">Trang đích</th>
              <th className="pb-2 font-medium">Loại</th>
              <th className="pb-2 font-medium">Trạng thái</th>
              <th className="pb-2 font-medium">Kiểm tra gần nhất</th>
              <th className="pb-2 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody>
            {backlinks.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-slate-400">
                  Chưa có backlink nào cho {selectedBrand}.
                </td>
              </tr>
            ) : (
              backlinks.map((b) => (
                <tr key={b.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 font-medium text-slate-700">
                    {b.source_platform}
                    <div className="font-normal text-slate-400">
                      <a href={b.backlink_url} target="_blank" rel="noreferrer" className="hover:underline">
                        {b.backlink_url.length > 40 ? `${b.backlink_url.slice(0, 40)}…` : b.backlink_url}
                      </a>
                    </div>
                  </td>
                  <td className="py-2 text-slate-500">{b.target_url}</td>
                  <td className="py-2 text-slate-500">{b.link_type}</td>
                  <td className="py-2">
                    <select
                      value={b.status}
                      onChange={(e) => handleSetBacklinkStatus(b.id, e.target.value as Backlink["status"])}
                      className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                        b.status === "Live" ? "bg-emerald-100 text-emerald-700" : b.status === "Removed" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Live">Live</option>
                      <option value="Removed">Removed</option>
                    </select>
                  </td>
                  <td className="py-2 text-slate-400">{b.last_checked_at ? new Date(b.last_checked_at).toLocaleDateString("vi-VN") : "Chưa kiểm tra"}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => handleDeleteBacklink(b.id)} className="inline-flex items-center gap-1 text-rose-500 hover:underline">
                      <Trash2 className="h-3 w-3" /> Xoá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <form onSubmit={handleAddBacklink} className="mt-3 grid gap-2 border-t border-slate-100 pt-3 sm:grid-cols-5">
          <input
            type="text"
            value={newBacklink.source_platform}
            onChange={(e) => setNewBacklink({ ...newBacklink, source_platform: e.target.value })}
            placeholder="Nền tảng (VD: Reddit)"
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          />
          <input
            type="text"
            value={newBacklink.target_url}
            onChange={(e) => setNewBacklink({ ...newBacklink, target_url: e.target.value })}
            placeholder="Trang đích (karofi.com/...)"
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          />
          <input
            type="text"
            value={newBacklink.backlink_url}
            onChange={(e) => setNewBacklink({ ...newBacklink, backlink_url: e.target.value })}
            placeholder="URL backlink"
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          />
          <input
            type="text"
            value={newBacklink.anchor_text}
            onChange={(e) => setNewBacklink({ ...newBacklink, anchor_text: e.target.value })}
            placeholder="Anchor text (tuỳ chọn)"
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          />
          <div className="flex gap-1">
            <select
              value={newBacklink.link_type}
              onChange={(e) => setNewBacklink({ ...newBacklink, link_type: e.target.value as Backlink["link_type"] })}
              className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
            >
              <option value="unknown">Không rõ</option>
              <option value="dofollow">Dofollow</option>
              <option value="nofollow">Nofollow</option>
            </select>
            <button type="submit" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-700">
              + Thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
