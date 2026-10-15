import React, { useEffect, useState } from "react";
import { Megaphone, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { safeFetchJson } from "../App";

interface AccountCandidate {
  id: string;
  name: string;
  loginCustomerId: string | null;
  brandGuess: "Livotec" | "Karofi" | null;
}

// Google Ads OAuth connect — log in once with the Google account that has
// access to the Ads accounts / MCC, then tick which accounts to import and
// which brand each belongs to (same flow as FacebookConnectAdmin and
// TiktokAdsConnectAdmin). Replaces the old form that made the admin type each
// Customer ID, Manager ID and name by hand before the OAuth redirect. See
// GET /api/google-ads/oauth/start|callback and POST
// /api/google-ads/oauth/pending/:id/complete in src/server/app.ts.
const formatCustomerId = (id: string) => (id.length === 10 ? `${id.slice(0, 3)}-${id.slice(3, 6)}-${id.slice(6)}` : id);

export default function GoogleAdsConnectAdmin({ onImported }: { onImported: () => void }) {
  const [configured, setConfigured] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountCandidate[]>([]);
  const [selected, setSelected] = useState<Record<string, { checked: boolean; brand: string }>>({});
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await safeFetchJson("/api/google-ads/accounts");
        if (result.success) setConfigured(result.googleAdsConfigured !== false);
      } catch {
        // Non-fatal — see FacebookConnectAdmin's identical comment.
      }
    })();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("gAdsPendingId");
    if (id) {
      setPendingId(id);
      params.delete("gAdsPendingId");
      window.history.replaceState({}, "", window.location.pathname + (params.toString() ? `?${params.toString()}` : ""));
    }
  }, []);

  useEffect(() => {
    if (!pendingId) return;
    (async () => {
      setIsLoadingPending(true);
      setMessage(null);
      try {
        const result = await safeFetchJson(`/api/oauth-pending/${encodeURIComponent(pendingId)}`);
        if (result.success && result.platform === "google_ads") {
          const candidates: AccountCandidate[] = result.candidates.accounts || [];
          setAccounts(candidates);
          setSelected(Object.fromEntries(candidates.map((a) => [a.id, { checked: true, brand: a.brandGuess || "" }])));
        } else {
          setMessage({ type: "error", text: result.error || "Liên kết đã hết hạn — vui lòng kết nối lại." });
          setPendingId(null);
        }
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Không tải được danh sách Account." });
        setPendingId(null);
      } finally {
        setIsLoadingPending(false);
      }
    })();
  }, [pendingId]);

  async function handleConnect() {
    setIsConnecting(true);
    setMessage(null);
    try {
      const result = await safeFetchJson("/api/google-ads/oauth/start");
      if (result.success && result.authorizeUrl) {
        window.location.href = result.authorizeUrl;
      } else {
        setMessage({ type: "error", text: result.error || "Không tạo được liên kết kết nối Google Ads." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tạo được liên kết kết nối Google Ads." });
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleImport() {
    if (!pendingId) return;
    setIsImporting(true);
    setMessage(null);
    try {
      const result = await safeFetchJson(`/api/google-ads/oauth/pending/${encodeURIComponent(pendingId)}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accounts: (Object.entries(selected) as [string, { checked: boolean; brand: string }][]).filter(([, v]) => v.checked).map(([id, v]) => ({ id, brand: v.brand || null })),
        }),
      });
      if (result.success) {
        setMessage({ type: "success", text: `Đã nhập ${result.accountsImported} Account.` });
        setPendingId(null);
        setAccounts([]);
        onImported();
      } else {
        setMessage({ type: "error", text: result.error || "Nhập kết nối thất bại." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Nhập kết nối thất bại." });
    } finally {
      setIsImporting(false);
    }
  }

  async function handleDismiss() {
    if (pendingId) await safeFetchJson(`/api/oauth-pending/${encodeURIComponent(pendingId)}`, { method: "DELETE" }).catch(() => {});
    setPendingId(null);
    setAccounts([]);
  }

  return (
    <div className="w-full animate-fade-in space-y-4 rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Megaphone className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Kết Nối Google Ads (API)</h3>
          <p className="text-[11px] text-slate-500">
            Đăng nhập Google một lần để lấy danh sách tài khoản Google Ads (kể cả các tài khoản con dưới MCC) — tick tài khoản cần nhập
            và gán thương hiệu, không cần tự gõ Customer ID hay Manager ID nữa.
          </p>
        </div>
      </div>

      {!configured && (
        <div className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
          <p className="font-semibold">Chưa cấu hình đầy đủ.</p>
          <p>
            Cần khai báo <code className="rounded bg-amber-100 px-1">GOOGLE_ADS_CLIENT_ID</code>,{" "}
            <code className="rounded bg-amber-100 px-1">GOOGLE_ADS_CLIENT_SECRET</code>,{" "}
            <code className="rounded bg-amber-100 px-1">GOOGLE_ADS_REDIRECT_URI</code> và{" "}
            <code className="rounded bg-amber-100 px-1">GOOGLE_ADS_DEVELOPER_TOKEN</code> — xem hướng dẫn trong .env.example.
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

      {!pendingId ? (
        <button
          type="button"
          onClick={handleConnect}
          disabled={isConnecting || !configured}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {isConnecting ? "Đang tạo liên kết..." : "Kết nối Google Ads"}
        </button>
      ) : isLoadingPending ? (
        <p className="text-xs text-slate-400">Đang tải danh sách Account...</p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="pb-1.5 text-xs font-bold text-slate-700">Account ({accounts.length})</p>
            <div className="space-y-1.5">
              {accounts.length === 0 && <p className="text-xs text-slate-400">Đăng nhập này không truy cập được tài khoản Google Ads đang hoạt động nào.</p>}
              {accounts.map((a) => (
                <label key={a.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={selected[a.id]?.checked ?? false}
                    onChange={(e) => setSelected((prev) => ({ ...prev, [a.id]: { ...prev[a.id], checked: e.target.checked } }))}
                  />
                  <span className="flex-1 font-medium text-slate-700">
                    {a.name} <span className="text-slate-400">({formatCustomerId(a.id)}{a.loginCustomerId ? ` · MCC ${formatCustomerId(a.loginCustomerId)}` : ""})</span>
                  </span>
                  <select
                    value={selected[a.id]?.brand || ""}
                    onChange={(e) => setSelected((prev) => ({ ...prev, [a.id]: { ...prev[a.id], brand: e.target.value } }))}
                    className={`rounded-lg border px-2 py-1 text-xs font-semibold ${selected[a.id]?.brand ? "border-slate-200 bg-slate-100" : "border-amber-300 bg-amber-50 text-amber-700"}`}
                  >
                    <option value="">Chưa xác định</option>
                    <option value="Livotec">Livotec</option>
                    <option value="Karofi">Karofi</option>
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {isImporting ? "Đang nhập..." : "Xác nhận & Nhập"}
            </button>
            <button type="button" onClick={handleDismiss} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
