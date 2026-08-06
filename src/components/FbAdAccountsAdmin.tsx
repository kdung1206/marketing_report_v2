import React, { useEffect, useState } from "react";
import { Megaphone, Trash2, RefreshCw, CheckCircle2, AlertCircle, PlusCircle } from "lucide-react";
import { safeFetchJson } from "../App";

interface FbAdAccountRow {
  ad_account_id: string;
  account_name: string;
  brand: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  last_sync_error: string | null;
  token_expired: boolean;
}

interface SyncResult {
  ad_account_id: string;
  account_name: string;
  ok: boolean;
  rows_synced?: number;
  error?: string;
}

// Admin-only Control Panel section for the Digital Ads Report's Facebook tab
// (src/components/DigitalAdsReport.tsx) — configures which Ad Account(s) get
// synced via the Marketing API. Deliberately separate from
// FacebookPagesAdmin.tsx even though the shape is nearly identical: a
// Marketing API token (ads_read, scoped to an ad account) is a different
// credential than a Page Insights token, so it's stored in its own
// fb_ad_accounts table (see supabase/schema.sql) rather than reusing fb_pages.
export default function FbAdAccountsAdmin() {
  const [accounts, setAccounts] = useState<FbAdAccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adAccountId, setAdAccountId] = useState("");
  const [accountName, setAccountName] = useState("");
  const [brand, setBrand] = useState<"Livotec" | "Karofi">("Livotec");
  const [accessToken, setAccessToken] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [backfillSince, setBackfillSince] = useState("");
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadAccounts() {
    setIsLoading(true);
    try {
      const result = await safeFetchJson("/api/fb-ads/accounts");
      if (result.success) setAccounts(result.accounts || []);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tải được danh sách Ad Account." });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function handleAddAccount(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const result = await safeFetchJson("/api/fb-ads/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad_account_id: adAccountId.trim(),
          account_name: accountName.trim(),
          brand,
          access_token: accessToken.trim(),
        }),
      });
      if (result.success) {
        setMessage({ type: "success", text: "Đã lưu Ad Account." });
        setAdAccountId("");
        setAccountName("");
        setAccessToken("");
        await loadAccounts();
      } else {
        setMessage({ type: "error", text: result.error || "Lưu Ad Account thất bại." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lưu Ad Account thất bại." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAccount(id: string) {
    if (!window.confirm(`Xóa cấu hình Ad Account "${id}"? Số liệu quảng cáo Facebook đã đồng bộ từ trước sẽ được giữ nguyên.`)) return;
    try {
      const result = await safeFetchJson(`/api/fb-ads/accounts/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (result.success) await loadAccounts();
      else setMessage({ type: "error", text: result.error || "Xóa Ad Account thất bại." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Xóa Ad Account thất bại." });
    }
  }

  async function handleSyncNow() {
    setIsSyncing(true);
    setSyncResults(null);
    setMessage(null);
    try {
      const result = await safeFetchJson("/api/fb-ads/sync-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backfillSince ? { since: backfillSince } : {}),
      });
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
          <Megaphone className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Kết Nối Facebook Ads (Marketing API)</h3>
          <p className="text-[11px] text-slate-500">
            Đồng bộ hiệu suất quảng cáo (spend/impressions/clicks/leads...) mỗi ngày cho tab "Facebook" trong Digital Ads Report. Đây là token khác với Facebook Page Insights ở trên — Access Token được mã hóa trước khi lưu.
          </p>
        </div>
      </div>

      <div className="space-y-1.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
        <p className="font-semibold">Lưu ý: cần Marketing API Access Token có quyền "ads_read", không phải Page Token.</p>
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            Vào{" "}
            <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="font-semibold underline">
              Graph API Explorer
            </a>{" "}
            → chọn App → "Add Permissions" → tick <code className="rounded bg-amber-100 px-1">ads_read</code> → Generate Access Token.
          </li>
          <li>Dùng Access Token Debugger để "Extend Access Token" lấy token dài hạn (khuyến nghị dùng System User token cho kết nối lâu dài).</li>
          <li>
            Ad Account ID lấy tại Ads Manager (dạng <code className="rounded bg-amber-100 px-1">act_1234567890</code>), nhập kèm tiền tố <code className="rounded bg-amber-100 px-1">act_</code>.
          </li>
        </ol>
      </div>

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

      <form onSubmit={handleAddAccount} className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Ad Account ID</label>
          <input
            type="text"
            required
            value={adAccountId}
            onChange={(e) => setAdAccountId(e.target.value)}
            placeholder="act_1234567890"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Tên Account</label>
          <input
            type="text"
            required
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Karofi - MKT"
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
            {isSaving ? "Đang lưu..." : "Thêm / Cập nhật Ad Account"}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Ad Account</th>
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
                  Chưa có Ad Account nào được cấu hình.
                </td>
              </tr>
            ) : (
              accounts.map((a) => (
                <tr key={a.ad_account_id}>
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-700">{a.account_name}</div>
                    <div className="text-slate-400">{a.ad_account_id}</div>
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
                        🔴 Token hết hạn — cần kết nối lại
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
                      onClick={() => handleDeleteAccount(a.ad_account_id)}
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
          {isSyncing ? "Đang đồng bộ..." : backfillSince ? `Đồng bộ lại từ ${backfillSince}` : "Đồng bộ ngay"}
        </button>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Đồng bộ lại toàn bộ từ ngày</span>
          <input
            type="date"
            value={backfillSince}
            onChange={(e) => setBackfillSince(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
          />
          <span>(để trống = 30 ngày gần nhất, mặc định hàng ngày)</span>
        </div>
      </div>
      {backfillSince && (
        <p className="text-[11px] text-amber-600">
          Khoảng thời gian dài sẽ được tự động chia nhỏ theo từng 90 ngày và có thể mất vài phút — đừng tắt trang trong lúc đồng bộ.
        </p>
      )}

      {syncResults && (
        <div className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
          {syncResults.map((r) => (
            <div key={r.ad_account_id} className={`flex items-center gap-1.5 ${r.ok ? "text-emerald-700" : "text-rose-700"}`}>
              {r.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              <strong>{r.account_name}</strong>: {r.ok ? `Đồng bộ thành công (${r.rows_synced ?? 0} dòng)` : r.error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
