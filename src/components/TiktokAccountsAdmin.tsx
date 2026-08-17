import React, { useEffect, useState } from "react";
import { Music2, Trash2, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { safeFetchJson } from "../App";

interface TiktokAccountRow {
  open_id: string;
  username: string | null;
  display_name: string | null;
  brand: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  last_sync_error: string | null;
  token_expired: boolean;
  access_token_expires_at: string | null;
  refresh_token_expires_at: string | null;
}

// Warn this far ahead of the refresh token dying. Longer than the Facebook
// equivalent (7 days) on purpose: re-issuing a Facebook Page token is an
// Admin-only desk job, whereas reviving a TikTok connection needs the brand's
// own TikTok account owner to sit down and click through the consent screen —
// which has to be scheduled with someone outside this tool.
const WARN_WITHIN_DAYS = 30;

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / 86400000);
}

// TikTok hands out two tokens with very different lifetimes: the access token
// (24h) is refreshed automatically on every sync, so it's never something to
// act on; the refresh token (365 days, and its deadline does NOT roll forward
// when refreshed — confirmed against production data) is the one that ends the
// connection for good. Only the latter is worth a warning.
function TiktokTokenExpiryNote({ account }: { account: TiktokAccountRow }) {
  const days = daysUntil(account.refresh_token_expires_at);
  if (days === null) {
    return <div className="mt-0.5 text-slate-400">Hạn đăng nhập: chưa xác định</div>;
  }
  const dateText = new Date(account.refresh_token_expires_at as string).toLocaleDateString("vi-VN");
  if (days <= WARN_WITHIN_DAYS) {
    return (
      <div className="mt-0.5 font-semibold text-amber-600">
        🟠 Sắp phải đăng nhập lại: còn {Math.max(days, 0)} ngày ({dateText})
      </div>
    );
  }
  return (
    <div className="mt-0.5 text-slate-400">
      Hạn đăng nhập lại: {dateText} (còn {days} ngày)
    </div>
  );
}

interface SyncResult {
  open_id: string;
  username: string | null;
  ok: boolean;
  videos_synced?: number;
  error?: string;
}

// Admin-only Control Panel section for the "Social Report" tab's TikTok half
// (organic follower/video insights — separate from the TikTok Ads upload
// under Digital Ads Report, which is paid campaign data). Structurally
// mirrors FbAdAccountsAdmin.tsx, but the connection step itself can't: this
// is a real OAuth redirect (TikTok Login Kit), not a pasted token — there's
// no "Access Token" field here, just a "Kết nối TikTok" button that sends
// the browser to TikTok's consent screen. See GET /api/tiktok/oauth/start
// and /callback in src/server/app.ts.
export default function TiktokAccountsAdmin() {
  const [accounts, setAccounts] = useState<TiktokAccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tiktokConfigured, setTiktokConfigured] = useState(true);
  const [connectBrand, setConnectBrand] = useState<"Livotec" | "Karofi">("Livotec");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadAccounts() {
    setIsLoading(true);
    try {
      const result = await safeFetchJson("/api/tiktok/accounts");
      if (result.success) {
        setAccounts(result.accounts || []);
        setTiktokConfigured(result.tiktokConfigured !== false);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tải được danh sách tài khoản TikTok." });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
    // TikTok redirects the browser back to "/?tiktokConnected=1" after a
    // successful OAuth consent — surface that as a one-time success message
    // and clean the query string so a refresh doesn't re-show it.
    const params = new URLSearchParams(window.location.search);
    if (params.get("tiktokConnected") === "1") {
      setMessage({ type: "success", text: "Đã kết nối tài khoản TikTok thành công." });
      params.delete("tiktokConnected");
      const next = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (next ? `?${next}` : ""));
    }
  }, []);

  async function handleConnect() {
    setIsConnecting(true);
    setMessage(null);
    try {
      const result = await safeFetchJson(`/api/tiktok/oauth/start?brand=${encodeURIComponent(connectBrand)}`);
      if (result.success && result.authorizeUrl) {
        window.location.href = result.authorizeUrl;
      } else {
        setMessage({ type: "error", text: result.error || "Không tạo được liên kết kết nối TikTok." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tạo được liên kết kết nối TikTok." });
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleDeleteAccount(openId: string) {
    if (!window.confirm(`Xóa kết nối tài khoản TikTok "${openId}"? Số liệu insights/video đã đồng bộ của tài khoản này cũng sẽ bị xóa.`)) return;
    try {
      const result = await safeFetchJson(`/api/tiktok/accounts/${encodeURIComponent(openId)}`, { method: "DELETE" });
      if (result.success) await loadAccounts();
      else setMessage({ type: "error", text: result.error || "Xóa tài khoản thất bại." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Xóa tài khoản thất bại." });
    }
  }

  async function handleSyncNow() {
    setIsSyncing(true);
    setSyncResults(null);
    setMessage(null);
    try {
      const result = await safeFetchJson("/api/tiktok/sync-now", { method: "POST" });
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

  // Same reasoning as the Facebook admin's banner: the status column is easy
  // to scroll past, and this warning is only useful if someone acts on it.
  const expiringSoon = accounts.filter((a) => {
    if (a.token_expired) return false;
    const days = daysUntil(a.refresh_token_expires_at);
    return days !== null && days <= WARN_WITHIN_DAYS;
  });

  return (
    <div className="w-full animate-fade-in space-y-4 rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Music2 className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Kết Nối TikTok (Insights)</h3>
          <p className="text-[11px] text-slate-500">
            Đồng bộ follower/video insights mỗi ngày cho tab "Social Report". Kết nối bằng đăng nhập TikTok thật (OAuth) — không dán token tay như Facebook.
            Access token tự làm mới mỗi ngày, nhưng cần đăng nhập lại sau khoảng 365 ngày khi phiên đăng nhập TikTok hết hạn.
          </p>
        </div>
      </div>

      {!tiktokConfigured && (
        <div className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
          <p className="font-semibold">Chưa cấu hình TikTok Developer App.</p>
          <p>
            Cần khai báo 3 biến môi trường <code className="rounded bg-amber-100 px-1">TIKTOK_CLIENT_KEY</code>,{" "}
            <code className="rounded bg-amber-100 px-1">TIKTOK_CLIENT_SECRET</code>,{" "}
            <code className="rounded bg-amber-100 px-1">TIKTOK_REDIRECT_URI</code> (xem README) trước khi nút "Kết nối TikTok" hoạt động được.
          </p>
        </div>
      )}

      {expiringSoon.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-800">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <strong>Sắp phải đăng nhập lại TikTok</strong> — nhờ chủ tài khoản bấm "Kết nối TikTok" và duyệt lại quyền
            trước hạn, nếu không dữ liệu sẽ ngừng cập nhật:{" "}
            {expiringSoon
              .map((a) => `${a.display_name || a.username || a.open_id} (còn ${Math.max(daysUntil(a.refresh_token_expires_at) ?? 0, 0)} ngày)`)
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
          disabled={isConnecting || !tiktokConfigured}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
        >
          <ExternalLink className={`h-3.5 w-3.5 ${isConnecting ? "animate-pulse" : ""}`} />
          {isConnecting ? "Đang chuyển đến TikTok..." : "Kết nối TikTok"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Tài khoản</th>
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
                  Chưa có tài khoản TikTok nào được kết nối.
                </td>
              </tr>
            ) : (
              accounts.map((a) => (
                <tr key={a.open_id}>
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-700">{a.display_name || a.username || "(chưa có tên)"}</div>
                    <div className="text-slate-400">{a.username ? `@${a.username}` : a.open_id}</div>
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
                        🔴 Cần đăng nhập lại (đã hết hạn phiên TikTok)
                      </span>
                    ) : a.last_sync_error ? (
                      <span className="text-amber-600" title={a.last_sync_error}>
                        ⚠️ Lỗi tạm thời (sẽ tự thử lại): {a.last_sync_error.slice(0, 50)}
                        {a.last_sync_error.length > 50 ? "…" : ""}
                      </span>
                    ) : (
                      <span className="text-emerald-600">OK — đang kết nối</span>
                    )}
                    {!a.token_expired && <TiktokTokenExpiryNote account={a} />}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleDeleteAccount(a.open_id)}
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
            <div key={r.open_id} className={`flex items-center gap-1.5 ${r.ok ? "text-emerald-700" : "text-rose-700"}`}>
              {r.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              <strong>{r.username || r.open_id}</strong>: {r.ok ? `Đồng bộ thành công (${r.videos_synced ?? 0} video)` : r.error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
