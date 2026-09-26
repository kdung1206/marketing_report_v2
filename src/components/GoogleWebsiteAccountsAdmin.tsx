import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, Globe, RefreshCw, Trash2 } from "lucide-react";
import { safeFetchJson } from "../App";

interface AvailableProperty {
  id: string;
  name: string;
}

interface AccountRow {
  id: string;
  google_account_email: string | null;
  brand: string | null;
  ga4_property_id: string | null;
  ga4_property_name: string | null;
  ga4_available_properties: AvailableProperty[] | null;
  gsc_site_url: string | null;
  gsc_available_sites: string[] | null;
  is_active: boolean;
  last_synced_at: string | null;
  last_sync_error: string | null;
  token_expired: boolean;
  refresh_token_expires_at: string | null;
}

interface SyncResult {
  account_id: string;
  brand: string | null;
  ok: boolean;
  ga4_rows_synced?: number;
  gsc_rows_synced?: number;
  error?: string;
}

// Kết nối Website (GA4 + Search Console) cho tab "Website Report" — không
// liên quan Google Ads (xem PaidAdsApiAccountsAdmin platform="google" cho
// việc đó). OAuth-first như YoutubeAccountsAdmin: kết nối thẳng qua Google,
// không cần chọn brand hay nhập ID tay — brand được tự nhận diện từ tên GA4
// property / domain Search Console (xem detectBrandFromName trong
// googleWebsiteSync.ts), với ô chọn tay để sửa nếu nhận diện sai/không ra.
// Vì 1 tài khoản Google có thể quản lý nhiều GA4 property/Search Console
// site, sau OAuth có thể cần thêm 1 bước "hoàn tất thiết lập" để chọn đúng
// property/site.
export default function GoogleWebsiteAccountsAdmin() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [configured, setConfigured] = useState(true);
  const [pendingChoice, setPendingChoice] = useState<Record<string, { ga4_property_id: string; gsc_site_url: string }>>({});
  const [pagesPreview, setPagesPreview] = useState<{ accountId: string; site: string; since: string; until: string; pages: { page: string; clicks: number; impressions: number; ctr: number; position: number }[] } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  async function loadAccounts() {
    setIsLoading(true);
    try {
      const result = await safeFetchJson("/api/google-website/accounts");
      if (result.success) {
        setAccounts(result.accounts || []);
        setConfigured(result.googleWebsiteConfigured !== false);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tải được danh sách kết nối Website." });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
    const params = new URLSearchParams(window.location.search);
    if (params.get("googleWebsiteConnected") === "1") {
      setMessage({ type: "success", text: "Đã kết nối Website (GA4/Search Console) thành công." });
      params.delete("googleWebsiteConnected");
      window.history.replaceState({}, "", window.location.pathname + (params.toString() ? `?${params.toString()}` : ""));
    } else if (params.get("googleWebsiteConnected") === "pending") {
      setMessage({ type: "success", text: "Đã kết nối Google — vui lòng chọn GA4 property / Search Console site bên dưới để hoàn tất." });
      params.delete("googleWebsiteConnected");
      window.history.replaceState({}, "", window.location.pathname + (params.toString() ? `?${params.toString()}` : ""));
    }
  }, []);

  async function handleConnect() {
    setIsConnecting(true);
    setMessage(null);
    try {
      // No brand param — auto-detected server-side from the GA4 property
      // name / Search Console site once known (see handleSetBrand for the
      // manual-override fallback when detection is ambiguous or wrong).
      const result = await safeFetchJson("/api/google-website/oauth/start");
      if (result.success && result.authorizeUrl) {
        window.location.href = result.authorizeUrl;
      } else {
        setMessage({ type: "error", text: result.error || "Không tạo được liên kết kết nối Website." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tạo được liên kết kết nối Website." });
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleCompleteSetup(id: string) {
    const choice = pendingChoice[id];
    if (!choice) return;
    setMessage(null);
    try {
      const result = await safeFetchJson(`/api/google-website/accounts/${encodeURIComponent(id)}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(choice),
      });
      if (result.success) {
        setMessage({ type: "success", text: "Đã hoàn tất thiết lập kết nối Website." });
        await loadAccounts();
      } else {
        setMessage({ type: "error", text: result.error || "Hoàn tất thiết lập thất bại." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Hoàn tất thiết lập thất bại." });
    }
  }

  async function handleSetBrand(id: string, brand: "Livotec" | "Karofi") {
    try {
      const result = await safeFetchJson(`/api/google-website/accounts/${encodeURIComponent(id)}/brand`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand }),
      });
      if (result.success) await loadAccounts();
      else setMessage({ type: "error", text: result.error || "Gán thương hiệu thất bại." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gán thương hiệu thất bại." });
    }
  }

  async function handlePreviewPages(id: string) {
    setIsLoadingPreview(true);
    setPagesPreview(null);
    setMessage(null);
    try {
      const result = await safeFetchJson(`/api/google-website/accounts/${encodeURIComponent(id)}/pages-preview`);
      if (result.success) {
        setPagesPreview({ accountId: id, site: result.site, since: result.since, until: result.until, pages: result.pages || [] });
      } else {
        setMessage({ type: "error", text: result.error || "Không lấy được danh sách URL." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không lấy được danh sách URL." });
    } finally {
      setIsLoadingPreview(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Xóa kết nối Website này? Dữ liệu GA4/Search Console đã đồng bộ từ trước sẽ được giữ nguyên.")) return;
    try {
      const result = await safeFetchJson(`/api/google-website/accounts/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (result.success) await loadAccounts();
      else setMessage({ type: "error", text: result.error || "Xóa kết nối thất bại." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Xóa kết nối thất bại." });
    }
  }

  async function handleSyncNow() {
    setIsSyncing(true);
    setSyncResults(null);
    setMessage(null);
    try {
      const result = await safeFetchJson("/api/google-website/sync-now", { method: "POST" });
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
          <Globe className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Kết Nối Website (GA4 + Search Console)</h3>
          <p className="text-[11px] text-slate-500">
            Đồng bộ Sessions/Users (Google Analytics 4) và Clicks/Impressions (Search Console) mỗi ngày cho tab "Website Report". Không liên quan Google Ads.
          </p>
        </div>
      </div>

      {!configured && (
        <div className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
          <p className="font-semibold">Chưa cấu hình đầy đủ.</p>
          <p>
            Cần khai báo <code className="rounded bg-amber-100 px-1">GOOGLE_WEBSITE_REDIRECT_URI</code> (dùng chung{" "}
            <code className="rounded bg-amber-100 px-1">YOUTUBE_CLIENT_ID</code>/<code className="rounded bg-amber-100 px-1">YOUTUBE_CLIENT_SECRET</code>)
            và đăng ký redirect URI + scope <code className="rounded bg-amber-100 px-1">analytics.readonly</code>/
            <code className="rounded bg-amber-100 px-1">webmasters.readonly</code> trên OAuth Client của YouTube trong Google Cloud Console. Xem
            .env.example.
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
        <button
          type="button"
          onClick={handleConnect}
          disabled={isConnecting || !configured}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {isConnecting ? "Đang tạo liên kết..." : "Kết nối Website"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Tài khoản Google</th>
              <th className="px-3 py-2 text-left">Thương hiệu</th>
              <th className="px-3 py-2 text-left">GA4 property</th>
              <th className="px-3 py-2 text-left">Search Console site</th>
              <th className="px-3 py-2 text-left">Đồng bộ gần nhất</th>
              <th className="px-3 py-2 text-left">Trạng thái</th>
              <th className="px-3 py-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-400">Đang tải...</td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-400">Chưa có kết nối Website nào.</td>
              </tr>
            ) : (
              accounts.map((a) => (
                <tr key={a.id}>
                  <td className="px-3 py-2 text-slate-700">{a.google_account_email || a.id}</td>
                  <td className="px-3 py-2">
                    <select
                      value={a.brand || ""}
                      onChange={(e) => handleSetBrand(a.id, e.target.value as "Livotec" | "Karofi")}
                      className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
                        a.brand ? "border-slate-200 bg-slate-100 text-slate-600" : "border-amber-300 bg-amber-50 text-amber-700"
                      }`}
                      title={a.brand ? "Đã tự nhận diện — chọn lại nếu sai" : "Không tự nhận diện được brand từ tên GA4 property / domain Search Console — chọn tay"}
                    >
                      <option value="" disabled>
                        {a.brand ? a.brand : "Chưa xác định — chọn"}
                      </option>
                      <option value="Livotec">Livotec</option>
                      <option value="Karofi">Karofi</option>
                    </select>
                  </td>
                  {!a.is_active && (a.ga4_available_properties?.length || a.gsc_available_sites?.length) ? (
                    <td colSpan={2} className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {a.ga4_available_properties && a.ga4_available_properties.length > 0 && (
                          <select
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                            value={pendingChoice[a.id]?.ga4_property_id || ""}
                            onChange={(e) => setPendingChoice((prev) => ({ ...prev, [a.id]: { ...prev[a.id], ga4_property_id: e.target.value, gsc_site_url: prev[a.id]?.gsc_site_url || "" } }))}
                          >
                            <option value="">-- Chọn GA4 property --</option>
                            {a.ga4_available_properties.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        )}
                        {a.gsc_available_sites && a.gsc_available_sites.length > 0 && (
                          <select
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                            value={pendingChoice[a.id]?.gsc_site_url || ""}
                            onChange={(e) => setPendingChoice((prev) => ({ ...prev, [a.id]: { ...prev[a.id], gsc_site_url: e.target.value, ga4_property_id: prev[a.id]?.ga4_property_id || "" } }))}
                          >
                            <option value="">-- Chọn Search Console site --</option>
                            {a.gsc_available_sites.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        )}
                        <button
                          onClick={() => handleCompleteSetup(a.id)}
                          className="rounded-lg bg-indigo-600 px-2.5 py-1 font-semibold text-white hover:bg-indigo-700"
                        >
                          Xác nhận
                        </button>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-3 py-2 text-slate-600">{a.ga4_property_name || "—"}</td>
                      <td className="px-3 py-2 text-slate-600">{a.gsc_site_url || "—"}</td>
                    </>
                  )}
                  <td className="px-3 py-2 text-slate-500">{a.last_synced_at ? new Date(a.last_synced_at).toLocaleString("vi-VN") : "Chưa đồng bộ"}</td>
                  <td className="px-3 py-2">
                    {!a.is_active ? (
                      <span className="font-semibold text-amber-600">Chờ chọn property/site</span>
                    ) : a.token_expired ? (
                      <span className="font-semibold text-rose-600" title={a.last_sync_error || ""}>Token hết hạn - cần kết nối lại</span>
                    ) : a.last_sync_error ? (
                      <span className="text-amber-600" title={a.last_sync_error}>Lỗi tạm thời: {a.last_sync_error.slice(0, 60)}{a.last_sync_error.length > 60 ? "..." : ""}</span>
                    ) : (
                      <span className="text-emerald-600">OK - đang kết nối</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1.5">
                      {a.is_active && a.gsc_site_url && (
                        <button
                          onClick={() => handlePreviewPages(a.id)}
                          disabled={isLoadingPreview}
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 px-2 py-1 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                        >
                          🔍 Xem URL thật
                        </button>
                      )}
                      <button onClick={() => handleDelete(a.id)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-rose-600 hover:bg-rose-50">
                        <Trash2 className="h-3 w-3" /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isLoadingPreview && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang lấy danh sách URL thật từ Search Console...
        </div>
      )}

      {pagesPreview && (
        <div className="space-y-2 rounded-xl border border-indigo-200 bg-indigo-50/40 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-700">
              {pagesPreview.pages.length} URL thật của {pagesPreview.site} ({pagesPreview.since} → {pagesPreview.until}) — dùng để bạn duyệt quy tắc nhóm "loại trang" trước khi tôi code phân loại, chưa lưu vào đâu.
            </p>
            <button onClick={() => setPagesPreview(null)} className="text-xs font-semibold text-slate-500 hover:text-slate-700">Đóng</button>
          </div>
          <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-1.5 text-left">URL</th>
                  <th className="px-3 py-1.5 text-right">Clicks</th>
                  <th className="px-3 py-1.5 text-right">Impressions</th>
                  <th className="px-3 py-1.5 text-right">CTR</th>
                  <th className="px-3 py-1.5 text-right">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagesPreview.pages.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-4 text-center text-slate-400">Chưa có dữ liệu URL nào trong khoảng thời gian này.</td></tr>
                ) : (
                  pagesPreview.pages.map((p) => (
                    <tr key={p.page}>
                      <td className="max-w-md truncate px-3 py-1.5 text-slate-600" title={p.page}>{p.page}</td>
                      <td className="px-3 py-1.5 text-right">{p.clicks}</td>
                      <td className="px-3 py-1.5 text-right">{p.impressions}</td>
                      <td className="px-3 py-1.5 text-right">{(p.ctr * 100).toFixed(2)}%</td>
                      <td className="px-3 py-1.5 text-right">{p.position.toFixed(1)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
            <div key={r.account_id} className={`flex items-center gap-1.5 ${r.ok ? "text-emerald-700" : "text-rose-700"}`}>
              {r.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              <strong>{r.brand || r.account_id}</strong>: {r.ok ? `Đồng bộ thành công (GA4: ${r.ga4_rows_synced ?? 0}, Search Console: ${r.gsc_rows_synced ?? 0})` : r.error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
