import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, PlusCircle, RefreshCw, Trash2 } from "lucide-react";
import { safeFetchJson } from "../App";

type PaidAdsPlatform = "google" | "tiktok";

interface AccountRow {
  account_id: string;
  account_name: string;
  brand: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  last_sync_error: string | null;
  token_expired: boolean;
  login_customer_id?: string | null;
}

interface SyncResult {
  account_id: string;
  account_name: string;
  ok: boolean;
  rows_synced?: number;
  error?: string;
}

const PLATFORM_COPY = {
  google: {
    title: "Kết Nối Google Ads (API)",
    description:
      "Đồng bộ spend/impressions/clicks/conversions mỗi ngày cho tab Google trong Digital Ads Report. Kết nối bằng Google OAuth, cần Developer Token trong biến môi trường.",
    idLabel: "Customer ID",
    idPlaceholder: "123-456-7890",
    namePlaceholder: "Karofi - Google Ads",
    tokenLabel: "",
    tokenPlaceholder: "",
    syncPath: "/api/google-ads/sync-now",
    accountsPath: "/api/google-ads/accounts",
  },
  tiktok: {
    title: "Kết Nối TikTok Ads (Business API)",
    description:
      "Đồng bộ dữ liệu quảng cáo TikTok từ Business API vào tab TikTok trong Digital Ads Report. Access Token được mã hóa trước khi lưu.",
    idLabel: "Advertiser ID",
    idPlaceholder: "7490000000000000000",
    namePlaceholder: "Karofi - TikTok Ads",
    tokenLabel: "Access Token",
    tokenPlaceholder: "act.xxx...",
    syncPath: "/api/tiktok-ads/sync-now",
    accountsPath: "/api/tiktok-ads/accounts",
  },
} as const;

export default function PaidAdsApiAccountsAdmin({ platform }: { platform: PaidAdsPlatform }) {
  const copy = PLATFORM_COPY[platform];
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [configured, setConfigured] = useState(true);

  const [accountId, setAccountId] = useState("");
  const [accountName, setAccountName] = useState("");
  const [brand, setBrand] = useState<"Livotec" | "Karofi">("Livotec");
  const [loginCustomerId, setLoginCustomerId] = useState("590-131-4360");
  const [accessToken, setAccessToken] = useState("");
  const [backfillSince, setBackfillSince] = useState("");

  async function loadAccounts() {
    setIsLoading(true);
    try {
      const result = await safeFetchJson(copy.accountsPath);
      if (result.success) {
        setAccounts(result.accounts || []);
        if (platform === "google") setConfigured(result.googleAdsConfigured !== false);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tải được danh sách tài khoản quảng cáo." });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
    const params = new URLSearchParams(window.location.search);
    if (platform === "google" && params.get("googleAdsConnected") === "1") {
      setMessage({ type: "success", text: "Đã kết nối Google Ads thành công." });
      params.delete("googleAdsConnected");
      const next = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (next ? `?${next}` : ""));
    }
  }, [platform]);

  async function handleGoogleConnect(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const cleanCustomerId = accountId.replace(/\D/g, "");
      const cleanLoginCustomerId = loginCustomerId.replace(/\D/g, "");
      if (cleanCustomerId.length !== 10) {
        setMessage({ type: "error", text: "Customer ID Google Ads phải gồm 10 chữ số, ví dụ 504-274-2203." });
        return;
      }
      if (cleanLoginCustomerId && cleanLoginCustomerId.length !== 10) {
        setMessage({ type: "error", text: "Manager ID phải gồm 10 chữ số, ví dụ 590-131-4360." });
        return;
      }
      const params = new URLSearchParams({
        customer_id: cleanCustomerId,
        account_name: accountName.trim(),
        brand,
      });
      if (cleanLoginCustomerId) params.set("login_customer_id", cleanLoginCustomerId);
      const result = await safeFetchJson(`/api/google-ads/oauth/start?${params.toString()}`);
      if (result.success && result.authorizeUrl) {
        window.location.href = result.authorizeUrl;
      } else {
        setMessage({ type: "error", text: result.error || "Không tạo được liên kết Google Ads." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tạo được liên kết Google Ads." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTiktokSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const result = await safeFetchJson(copy.accountsPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiser_id: accountId.trim(),
          account_name: accountName.trim(),
          brand,
          access_token: accessToken.trim(),
        }),
      });
      if (result.success) {
        setMessage({ type: "success", text: "Đã lưu TikTok Ads Account." });
        setAccountId("");
        setAccountName("");
        setAccessToken("");
        await loadAccounts();
      } else {
        setMessage({ type: "error", text: result.error || "Lưu tài khoản thất bại." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lưu tài khoản thất bại." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(`Xóa cấu hình "${id}"? Dữ liệu quảng cáo đã đồng bộ từ trước sẽ được giữ nguyên.`)) return;
    try {
      const result = await safeFetchJson(`${copy.accountsPath}/${encodeURIComponent(id)}`, { method: "DELETE" });
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
      const result = await safeFetchJson(copy.syncPath, {
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

  const onSubmit = platform === "google" ? handleGoogleConnect : handleTiktokSave;

  return (
    <div className="w-full animate-fade-in space-y-4 rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <ExternalLink className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{copy.title}</h3>
          <p className="text-[11px] text-slate-500">{copy.description}</p>
        </div>
      </div>

      {platform === "google" && !configured && (
        <div className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
          <p className="font-semibold">Chưa cấu hình Google Ads API.</p>
          <p>
            Cần khai báo <code className="rounded bg-amber-100 px-1">GOOGLE_ADS_CLIENT_ID</code>,{" "}
            <code className="rounded bg-amber-100 px-1">GOOGLE_ADS_CLIENT_SECRET</code>,{" "}
            <code className="rounded bg-amber-100 px-1">GOOGLE_ADS_REDIRECT_URI</code> và{" "}
            <code className="rounded bg-amber-100 px-1">GOOGLE_ADS_DEVELOPER_TOKEN</code>.
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

      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">{copy.idLabel}</label>
          <input
            type="text"
            required
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder={copy.idPlaceholder}
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
            placeholder={copy.namePlaceholder}
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
        {platform === "google" ? (
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Manager ID</label>
            <input
              type="text"
              value={loginCustomerId}
              onChange={(e) => setLoginCustomerId(e.target.value)}
              placeholder="590-131-4360"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">Bắt buộc khi truy cập client qua MCC.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">{copy.tokenLabel}</label>
            <input
              type="password"
              required
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder={copy.tokenPlaceholder}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
            />
          </div>
        )}
        <div className="sm:col-span-4">
          <button
            type="submit"
            disabled={isSaving || (platform === "google" && !configured)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {platform === "google" ? <ExternalLink className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
            {isSaving ? "Đang lưu..." : platform === "google" ? "Kết nối Google Ads" : "Thêm / Cập nhật TikTok Ads"}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Account</th>
              <th className="px-3 py-2 text-left">Thương hiệu</th>
              <th className="px-3 py-2 text-left">Đồng bộ gần nhất</th>
              <th className="px-3 py-2 text-left">Trạng thái</th>
              <th className="px-3 py-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">Đang tải...</td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">Chưa có tài khoản quảng cáo nào được cấu hình.</td>
              </tr>
            ) : (
              accounts.map((a) => (
                <tr key={a.account_id}>
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-700">{a.account_name}</div>
                    <div className="text-slate-400">{a.account_id}{a.login_customer_id ? ` · MCC ${a.login_customer_id}` : ""}</div>
                  </td>
                  <td className="px-3 py-2">
                    {a.brand ? <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">{a.brand}</span> : <span className="text-amber-600">Chưa gán</span>}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{a.last_synced_at ? new Date(a.last_synced_at).toLocaleString("vi-VN") : "Chưa đồng bộ"}</td>
                  <td className="px-3 py-2">
                    {a.token_expired ? (
                      <span className="font-semibold text-rose-600" title={a.last_sync_error || ""}>Token hết hạn - cần kết nối lại</span>
                    ) : a.last_sync_error ? (
                      <span className="text-amber-600" title={a.last_sync_error}>Lỗi tạm thời: {a.last_sync_error.slice(0, 60)}{a.last_sync_error.length > 60 ? "..." : ""}</span>
                    ) : (
                      <span className="text-emerald-600">OK - đang kết nối</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => handleDelete(a.account_id)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-rose-600 hover:bg-rose-50">
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
          <input type="date" value={backfillSince} onChange={(e) => setBackfillSince(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs" />
          <span>(để trống = 30 ngày gần nhất)</span>
        </div>
      </div>

      {syncResults && (
        <div className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
          {syncResults.map((r) => (
            <div key={r.account_id} className={`flex items-center gap-1.5 ${r.ok ? "text-emerald-700" : "text-rose-700"}`}>
              {r.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              <strong>{r.account_name}</strong>: {r.ok ? `Đồng bộ thành công (${r.rows_synced ?? 0} dòng)` : r.error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
