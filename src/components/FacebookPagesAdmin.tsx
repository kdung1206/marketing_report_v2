import React, { useEffect, useState } from "react";
import { Facebook, Trash2, RefreshCw, CheckCircle2, AlertCircle, PlusCircle } from "lucide-react";
import { safeFetchJson } from "../App";

interface FbPageRow {
  page_id: string;
  page_name: string;
  brand: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  last_sync_error: string | null;
  token_expired: boolean;
  token_expires_at: string | null;
  token_data_access_expires_at: string | null;
  token_checked_at: string | null;
}

// Warn this far ahead of a token dying. Facebook gives no grace period once a
// deadline passes — the sync just starts failing — so this needs to be long
// enough for an Admin to notice and re-issue the token without the report
// going stale in between.
const WARN_WITHIN_DAYS = 7;

// A Page connection dies at whichever of the two deadlines lands first: the
// token's own expiry, or Meta's ~90-day cutoff of the app's access to the
// granting user's data (see facebookStore.ts's FbPageConfig). null means no
// deadline of that kind — a Page token from a long-lived User Token normally
// has none at all, which is the "không có hạn" case below.
function tokenDeadline(p: FbPageRow): { date: Date; days: number } | null {
  const times = [p.token_expires_at, p.token_data_access_expires_at]
    .filter((v): v is string => !!v)
    .map((v) => new Date(v).getTime())
    .filter((t) => !Number.isNaN(t));
  if (times.length === 0) return null;
  const date = new Date(Math.min(...times));
  return { date, days: Math.ceil((date.getTime() - Date.now()) / 86400000) };
}

function TokenExpiryNote({ page }: { page: FbPageRow }) {
  if (!page.token_checked_at) {
    return <div className="mt-0.5 text-slate-400">Hạn token: chưa kiểm tra được</div>;
  }
  const deadline = tokenDeadline(page);
  if (!deadline) {
    return <div className="mt-0.5 text-slate-400">Token không có hạn — Facebook không đặt ngày hết hạn</div>;
  }
  const dateText = deadline.date.toLocaleDateString("vi-VN");
  if (deadline.days <= WARN_WITHIN_DAYS) {
    return (
      <div className="mt-0.5 font-semibold text-amber-600">
        🟠 Token sắp hết hạn: còn {Math.max(deadline.days, 0)} ngày ({dateText}) — cần cấp token mới
      </div>
    );
  }
  return (
    <div className="mt-0.5 text-slate-400">
      Hạn token: {dateText} (còn {deadline.days} ngày)
    </div>
  );
}

interface SyncResult {
  page_id: string;
  page_name: string;
  ok: boolean;
  error?: string;
}

// Admin-only Control Panel section for managing which Facebook Pages the
// "Facebook Insights" dashboard tab (src/components/FacebookInsights.tsx)
// syncs from. Kept as its own component (rather than more useState hooks in
// the already very large App.tsx) since it's a self-contained CRUD form,
// same reasoning as splitting out FacebookInsights.tsx.
export default function FacebookPagesAdmin() {
  const [pages, setPages] = useState<FbPageRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageId, setPageId] = useState("");
  const [pageName, setPageName] = useState("");
  const [brand, setBrand] = useState<"Livotec" | "Karofi">("Livotec");
  const [accessToken, setAccessToken] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadPages() {
    setIsLoading(true);
    try {
      const result = await safeFetchJson("/api/fb/pages");
      if (result.success) setPages(result.pages || []);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tải được danh sách Page." });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPages();
  }, []);

  async function handleAddPage(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const result = await safeFetchJson("/api/fb/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_id: pageId.trim(), page_name: pageName.trim(), brand, access_token: accessToken.trim() }),
      });
      if (result.success) {
        setMessage({ type: "success", text: "Đã lưu Page." });
        setPageId("");
        setPageName("");
        setAccessToken("");
        await loadPages();
      } else {
        setMessage({ type: "error", text: result.error || "Lưu Page thất bại." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lưu Page thất bại." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePage(id: string) {
    if (!window.confirm(`Xóa cấu hình Page "${id}"? Dữ liệu insights/bài đăng đã đồng bộ của page này cũng sẽ bị xóa.`)) return;
    try {
      const result = await safeFetchJson(`/api/fb/pages/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (result.success) await loadPages();
      else setMessage({ type: "error", text: result.error || "Xóa Page thất bại." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Xóa Page thất bại." });
    }
  }

  async function handleSyncNow() {
    setIsSyncing(true);
    setSyncResults(null);
    setMessage(null);
    try {
      const result = await safeFetchJson("/api/fb/sync-now", { method: "POST" });
      if (result.success) {
        setSyncResults(result.results || []);
        await loadPages();
      } else {
        setMessage({ type: "error", text: result.error || "Đồng bộ thất bại." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Đồng bộ thất bại." });
    } finally {
      setIsSyncing(false);
    }
  }

  // Surfaced as a banner as well as per-row: the point of the warning is that
  // someone acts on it before the token dies, and the status column is easy to
  // scroll past.
  const expiringSoon = pages.filter((p) => {
    if (p.token_expired || !p.token_checked_at) return false;
    const deadline = tokenDeadline(p);
    return deadline !== null && deadline.days <= WARN_WITHIN_DAYS;
  });

  return (
    <div className="w-full animate-fade-in space-y-4 rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Facebook className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Kết Nối Facebook Page</h3>
          <p className="text-[11px] text-slate-500">
            Đồng bộ Page/Post Insights mỗi ngày (Vercel Cron 01:00) cho tab "Facebook Insights". Access Token được mã hóa trước khi lưu. Kết nối được giữ nguyên vô thời hạn — chỉ mất khi bạn bấm "Xóa" hoặc khi Facebook tự xác nhận token đã hết hạn (🔴 dưới đây); lỗi tạm thời (⚠️) sẽ tự đồng bộ lại ở lần sau, không cần làm gì.
          </p>
        </div>
      </div>

      <div className="space-y-1.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
        <p className="font-semibold">
          Lưu ý: phải dán <u>Page Access Token</u>, không phải User Access Token — dán nhầm sẽ báo lỗi "Invalid OAuth
          2.0 Access Token" khi đồng bộ.
        </p>
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            Vào{" "}
            <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="font-semibold underline">
              Graph API Explorer
            </a>{" "}
            → chọn App của bạn → "Add Permissions" → tick đủ{" "}
            <code className="rounded bg-amber-100 px-1">pages_show_list</code>,{" "}
            <code className="rounded bg-amber-100 px-1">pages_read_engagement</code>,{" "}
            <code className="rounded bg-amber-100 px-1">pages_read_user_content</code>,{" "}
            <code className="rounded bg-amber-100 px-1">read_insights</code> → Generate Access Token (đây vẫn là User Token, sống ngắn).
          </li>
          <li>
            Dán User Token đó vào <em>Access Token Debugger</em> → "Extend Access Token" → lấy User Token dài hạn (60 ngày).
          </li>
          <li>
            Dùng chính User Token dài hạn đó mở URL{" "}
            <code className="rounded bg-amber-100 px-1">https://graph.facebook.com/me/accounts?access_token=&lt;user_token_dài_hạn&gt;</code>{" "}
            — mỗi Page trong kết quả JSON có field <code className="rounded bg-amber-100 px-1">access_token</code> riêng, đó mới là{" "}
            <strong>Page Access Token</strong> cần dán vào ô "Access Token" bên dưới (kế thừa quyền + thời hạn từ User Token gốc, không cần extend riêng).
          </li>
        </ol>
      </div>

      {expiringSoon.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-800">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <strong>Token sắp hết hạn</strong> — cấp Page Access Token mới theo hướng dẫn phía trên rồi lưu lại, trước
            khi dữ liệu ngừng cập nhật:{" "}
            {expiringSoon
              .map((p) => {
                const deadline = tokenDeadline(p);
                return `${p.page_name} (còn ${Math.max(deadline?.days ?? 0, 0)} ngày)`;
              })
              .join(", ")}
          </div>
        </div>
      )}

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

      <form onSubmit={handleAddPage} className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Page ID</label>
          <input
            type="text"
            required
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            placeholder="1234567890"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Tên Page</label>
          <input
            type="text"
            required
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            placeholder="Karofi Việt Nam"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Thương hiệu</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value as "Livotec" | "Karofi")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
          >
            <option value="Livotec">Livotec</option>
            <option value="Karofi">Karofi</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Access Token</label>
          <input
            type="password"
            required
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="EAAG..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
          />
        </div>
        <div className="sm:col-span-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            {isSaving ? "Đang lưu..." : "Thêm / Cập nhật Page"}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Page</th>
              <th className="px-3 py-2 text-left">Thương hiệu</th>
              <th className="px-3 py-2 text-left">Đồng bộ gần nhất</th>
              <th className="px-3 py-2 text-left">Trạng thái</th>
              <th className="px-3 py-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                  Đang tải...
                </td>
              </tr>
            ) : pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                  Chưa có Page nào được cấu hình.
                </td>
              </tr>
            ) : (
              pages.map((p) => (
                <tr key={p.page_id}>
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-700">{p.page_name}</div>
                    <div className="text-slate-400">{p.page_id}</div>
                  </td>
                  <td className="px-3 py-2">
                    {p.brand ? (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">{p.brand}</span>
                    ) : (
                      <span className="text-amber-600">Chưa gán</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {p.last_synced_at ? new Date(p.last_synced_at).toLocaleString("vi-VN") : "Chưa đồng bộ"}
                  </td>
                  <td className="px-3 py-2">
                    {p.token_expired ? (
                      <span className="font-semibold text-rose-600" title={p.last_sync_error || ""}>
                        🔴 Token hết hạn — cần kết nối lại
                      </span>
                    ) : p.last_sync_error ? (
                      <span className="text-amber-600" title={p.last_sync_error}>
                        ⚠️ Lỗi tạm thời (sẽ tự thử lại): {p.last_sync_error.slice(0, 50)}
                        {p.last_sync_error.length > 50 ? "…" : ""}
                      </span>
                    ) : (
                      <span className="text-emerald-600">OK — đang kết nối</span>
                    )}
                    {!p.token_expired && <TokenExpiryNote page={p} />}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleDeletePage(p.page_id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3 w-3" /> Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleSyncNow}
          disabled={isSyncing || pages.length === 0}
          className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
        </button>
      </div>

      {syncResults && (
        <div className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
          {syncResults.map((r) => (
            <div key={r.page_id} className={`flex items-center gap-1.5 ${r.ok ? "text-emerald-700" : "text-rose-700"}`}>
              {r.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              <strong>{r.page_name}</strong>: {r.ok ? "Đồng bộ thành công" : r.error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
