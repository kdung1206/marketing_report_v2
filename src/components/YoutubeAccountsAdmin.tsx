import React, { useEffect, useState } from "react";
import { Youtube, Trash2, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { safeFetchJson } from "../App";

interface YoutubeAccountRow {
  channel_id: string;
  channel_title: string | null;
  brand: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  last_sync_error: string | null;
  token_expired: boolean;
}

interface SyncResult {
  channel_id: string;
  channel_title: string | null;
  ok: boolean;
  videos_synced?: number;
  error?: string;
}

// Admin-only Control Panel section for the "Social Report" tab's YouTube
// half (organic subscriber/video insights). Structurally mirrors
// TiktokAccountsAdmin.tsx — a real OAuth redirect (Google, not a pasted
// token), so there's no "Access Token" field, just a "Kết nối YouTube"
// button that sends the browser to Google's consent screen. See GET
// /api/youtube/oauth/start and /callback in src/server/app.ts.
export default function YoutubeAccountsAdmin() {
  const [accounts, setAccounts] = useState<YoutubeAccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [youtubeConfigured, setYoutubeConfigured] = useState(true);
  const [connectBrand, setConnectBrand] = useState<"Livotec" | "Karofi">("Livotec");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadAccounts() {
    setIsLoading(true);
    try {
      const result = await safeFetchJson("/api/youtube/accounts");
      if (result.success) {
        setAccounts(result.accounts || []);
        setYoutubeConfigured(result.youtubeConfigured !== false);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tải được danh sách kênh YouTube." });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
    // Google redirects the browser back to "/?youtubeConnected=1" after a
    // successful OAuth consent — surface that as a one-time success message
    // and clean the query string so a refresh doesn't re-show it.
    const params = new URLSearchParams(window.location.search);
    if (params.get("youtubeConnected") === "1") {
      setMessage({ type: "success", text: "Đã kết nối kênh YouTube thành công." });
      params.delete("youtubeConnected");
      const next = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (next ? `?${next}` : ""));
    }
  }, []);

  async function handleConnect() {
    setIsConnecting(true);
    setMessage(null);
    try {
      const result = await safeFetchJson(`/api/youtube/oauth/start?brand=${encodeURIComponent(connectBrand)}`);
      if (result.success && result.authorizeUrl) {
        window.location.href = result.authorizeUrl;
      } else {
        setMessage({ type: "error", text: result.error || "Không tạo được liên kết kết nối YouTube." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tạo được liên kết kết nối YouTube." });
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleDeleteAccount(channelId: string) {
    if (!window.confirm(`Xóa kết nối kênh YouTube "${channelId}"? Số liệu insights/video đã đồng bộ của kênh này cũng sẽ bị xóa.`)) return;
    try {
      const result = await safeFetchJson(`/api/youtube/accounts/${encodeURIComponent(channelId)}`, { method: "DELETE" });
      if (result.success) await loadAccounts();
      else setMessage({ type: "error", text: result.error || "Xóa kênh thất bại." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Xóa kênh thất bại." });
    }
  }

  async function handleSyncNow() {
    setIsSyncing(true);
    setSyncResults(null);
    setMessage(null);
    try {
      const result = await safeFetchJson("/api/youtube/sync-now", { method: "POST" });
      if (result.success) {
        setSyncResults(result.results || []);
        await loadAccounts();
      } else {
        setMessage({ type: "error", text: result.error || "Đồng bộ thất bại." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Đồng bộ thất bại." });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="w-full animate-fade-in space-y-4 rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Youtube className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Kết Nối YouTube (Analytics)</h3>
          <p className="text-[11px] text-slate-500">
            Đồng bộ subscriber/video insights mỗi ngày cho tab "Social Report" — bao gồm tách views organic vs. views từ quảng cáo (YouTube Ads) theo từng
            video. Kết nối bằng đăng nhập Google thật (OAuth) — không dán token tay. Tài khoản Google dùng để kết nối phải có vai trò "Người quản lý" (Manager)
            trở lên trên kênh đó.
          </p>
        </div>
      </div>

      {!youtubeConfigured && (
        <div className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
          <p className="font-semibold">Chưa cấu hình Google OAuth Client.</p>
          <p>
            Cần khai báo 3 biến môi trường <code className="rounded bg-amber-100 px-1">YOUTUBE_CLIENT_ID</code>,{" "}
            <code className="rounded bg-amber-100 px-1">YOUTUBE_CLIENT_SECRET</code>,{" "}
            <code className="rounded bg-amber-100 px-1">YOUTUBE_REDIRECT_URI</code> (xem README) trước khi nút "Kết nối YouTube" hoạt động được.
          </p>
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

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Gán cho thương hiệu</label>
          <select
            value={connectBrand}
            onChange={(e) => setConnectBrand(e.target.value as "Livotec" | "Karofi")}
            className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
          >
            <option value="Livotec">Livotec</option>
            <option value="Karofi">Karofi</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleConnect}
          disabled={isConnecting || !youtubeConfigured}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
        >
          <ExternalLink className={`h-3.5 w-3.5 ${isConnecting ? "animate-pulse" : ""}`} />
          {isConnecting ? "Đang chuyển đến Google..." : "Kết nối YouTube"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Kênh</th>
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
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                  Chưa có kênh YouTube nào được kết nối.
                </td>
              </tr>
            ) : (
              accounts.map((a) => (
                <tr key={a.channel_id}>
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-700">{a.channel_title || "(chưa có tên)"}</div>
                    <div className="text-slate-400">{a.channel_id}</div>
                  </td>
                  <td className="px-3 py-2">
                    {a.brand ? (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">{a.brand}</span>
                    ) : (
                      <span className="text-amber-600">Chưa gán</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {a.last_synced_at ? new Date(a.last_synced_at).toLocaleString("vi-VN") : "Chưa đồng bộ"}
                  </td>
                  <td className="px-3 py-2">
                    {a.token_expired ? (
                      <span className="font-semibold text-rose-600" title={a.last_sync_error || ""}>
                        🔴 Cần đăng nhập lại (quyền truy cập đã bị thu hồi/hết hạn)
                      </span>
                    ) : a.last_sync_error ? (
                      <span className="text-amber-600" title={a.last_sync_error}>
                        ⚠️ Lỗi tạm thời (sẽ tự thử lại): {a.last_sync_error.slice(0, 50)}
                        {a.last_sync_error.length > 50 ? "…" : ""}
                      </span>
                    ) : (
                      <span className="text-emerald-600">OK — đang kết nối</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleDeleteAccount(a.channel_id)}
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
          disabled={isSyncing || accounts.length === 0}
          className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
        </button>
      </div>

      {syncResults && (
        <div className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
          {syncResults.map((r) => (
            <div key={r.channel_id} className={`flex items-center gap-1.5 ${r.ok ? "text-emerald-700" : "text-rose-700"}`}>
              {r.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              <strong>{r.channel_title || r.channel_id}</strong>: {r.ok ? `Đồng bộ thành công (${r.videos_synced ?? 0} video)` : r.error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
