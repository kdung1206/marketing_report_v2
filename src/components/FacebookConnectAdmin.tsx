import React, { useEffect, useState } from "react";
import { Facebook, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { safeFetchJson } from "../App";

interface PageCandidate {
  id: string;
  name: string;
  category: string | null;
  brandGuess: "Livotec" | "Karofi" | null;
}

interface AdAccountCandidate {
  id: string;
  name: string;
  brandGuess: "Livotec" | "Karofi" | null;
}

// Connect by pasting a System User Access Token (Business Settings → System
// Users → Generate token, expiry "Never"): the server validates it, lists the
// Pages and Ad Accounts assigned to that System User, and the admin picks which
// to import and sets the brand for each — see POST /api/facebook/token/connect
// and POST /api/facebook/oauth/pending/:id/complete in src/server/app.ts. No
// Facebook Login / App Domains / Redirect URI setup needed (the old OAuth
// redirect routes still exist server-side but are no longer offered here).
export default function FacebookConnectAdmin({ onImported }: { onImported: () => void }) {
  const [tokenInput, setTokenInput] = useState("");
  const [tokenInfo, setTokenInfo] = useState<{ name: string | null; neverExpires: boolean; expires_at: string | null } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pages, setPages] = useState<PageCandidate[]>([]);
  const [adAccounts, setAdAccounts] = useState<AdAccountCandidate[]>([]);
  const [selectedPages, setSelectedPages] = useState<Record<string, { checked: boolean; brand: string }>>({});
  const [selectedAdAccounts, setSelectedAdAccounts] = useState<Record<string, { checked: boolean; brand: string }>>({});
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("fbPendingId");
    if (id) {
      setPendingId(id);
      params.delete("fbPendingId");
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
        if (result.success && result.platform === "facebook") {
          const candidatePages: PageCandidate[] = result.candidates.pages || [];
          const candidateAdAccounts: AdAccountCandidate[] = result.candidates.adAccounts || [];
          setPages(candidatePages);
          setAdAccounts(candidateAdAccounts);
          setSelectedPages(Object.fromEntries(candidatePages.map((p) => [p.id, { checked: true, brand: p.brandGuess || "" }])));
          setSelectedAdAccounts(Object.fromEntries(candidateAdAccounts.map((a) => [a.id, { checked: true, brand: a.brandGuess || "" }])));
        } else {
          setMessage({ type: "error", text: result.error || "Liên kết đã hết hạn — vui lòng kết nối lại." });
          setPendingId(null);
        }
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Không tải được danh sách Page/Ad Account." });
        setPendingId(null);
      } finally {
        setIsLoadingPending(false);
      }
    })();
  }, [pendingId]);

  async function handleConnect() {
    const token = tokenInput.trim();
    if (!token) {
      setMessage({ type: "error", text: "Vui lòng dán Access Token." });
      return;
    }
    setIsConnecting(true);
    setMessage(null);
    try {
      const result = await safeFetchJson("/api/facebook/token/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: token }),
      });
      if (result.success && result.pendingId) {
        setTokenInput(""); // don't keep the secret in component state once the server has it
        setTokenInfo(result.token || null);
        if (result.warnings?.length) setMessage({ type: "error", text: result.warnings.join(" ") });
        setPendingId(result.pendingId);
      } else {
        setMessage({ type: "error", text: result.error || "Không kết nối được bằng Access Token này." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không kết nối được bằng Access Token này." });
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleImport() {
    if (!pendingId) return;
    setIsImporting(true);
    setMessage(null);
    try {
      const result = await safeFetchJson(`/api/facebook/oauth/pending/${encodeURIComponent(pendingId)}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pages: (Object.entries(selectedPages) as [string, { checked: boolean; brand: string }][]).filter(([, v]) => v.checked).map(([id, v]) => ({ id, brand: v.brand || null })),
          adAccounts: (Object.entries(selectedAdAccounts) as [string, { checked: boolean; brand: string }][]).filter(([, v]) => v.checked).map(([id, v]) => ({ id, brand: v.brand || null })),
        }),
      });
      if (result.success) {
        setMessage({ type: "success", text: `Đã nhập ${result.pagesImported} Page + ${result.adAccountsImported} Ad Account.` });
        setPendingId(null);
        setTokenInfo(null);
        setPages([]);
        setAdAccounts([]);
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
    setTokenInfo(null);
    setPages([]);
    setAdAccounts([]);
  }

  return (
    <div className="w-full animate-fade-in space-y-4 rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Facebook className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Kết Nối Facebook</h3>
          <p className="text-[11px] text-slate-500">
            Dán Access Token của System User (không hết hạn) → hệ thống tải danh sách Page và Ad Account được gán → chọn cái cần nhập
            và gán brand cho từng cái.
          </p>
        </div>
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

      {!pendingId ? (
        <div className="space-y-2">
          <textarea
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            rows={2}
            spellCheck={false}
            autoComplete="off"
            placeholder="Dán System User Access Token (EAAB...)"
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 font-mono text-[11px] text-slate-700 outline-none focus:border-indigo-400"
          />
          <button
            type="button"
            onClick={handleConnect}
            disabled={isConnecting || !tokenInput.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            <KeyRound className="h-3.5 w-3.5" />
            {isConnecting ? "Đang kiểm tra token..." : "Tải danh sách Page & Ad Account"}
          </button>
          <p className="text-[11px] text-slate-400">
            Tạo token: Business Settings → Users → System Users → chọn System User → Add Assets (gán Page + Ad Account) → Generate New
            Token, Token expiration = Never, quyền: ads_read, pages_show_list, pages_read_engagement, read_insights.
          </p>
        </div>
      ) : isLoadingPending ? (
        <p className="text-xs text-slate-400">Đang tải danh sách Page/Ad Account...</p>
      ) : (
        <div className="space-y-4">
          {tokenInfo && (
            <p className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-600">
              Token: <span className="font-semibold">{tokenInfo.name || "System User"}</span> —{" "}
              {tokenInfo.neverExpires ? (
                <span className="font-semibold text-emerald-600">không hết hạn</span>
              ) : (
                <span className="font-semibold text-amber-600">hết hạn {tokenInfo.expires_at ? new Date(tokenInfo.expires_at).toLocaleDateString("vi-VN") : ""}</span>
              )}
            </p>
          )}
          <div>
            <p className="pb-1.5 text-xs font-bold text-slate-700">Page ({pages.length})</p>
            <div className="space-y-1.5">
              {pages.length === 0 && <p className="text-xs text-slate-400">Tài khoản này không quản lý Page nào.</p>}
              {pages.map((p) => (
                <label key={p.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedPages[p.id]?.checked ?? false}
                    onChange={(e) => setSelectedPages((prev) => ({ ...prev, [p.id]: { ...prev[p.id], checked: e.target.checked } }))}
                  />
                  <span className="flex-1 font-medium text-slate-700">{p.name}</span>
                  <select
                    value={selectedPages[p.id]?.brand || ""}
                    onChange={(e) => setSelectedPages((prev) => ({ ...prev, [p.id]: { ...prev[p.id], brand: e.target.value } }))}
                    className={`rounded-lg border px-2 py-1 text-xs font-semibold ${selectedPages[p.id]?.brand ? "border-slate-200 bg-slate-100" : "border-amber-300 bg-amber-50 text-amber-700"}`}
                  >
                    <option value="">Chưa xác định</option>
                    <option value="Livotec">Livotec</option>
                    <option value="Karofi">Karofi</option>
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="pb-1.5 text-xs font-bold text-slate-700">Ad Account ({adAccounts.length})</p>
            <div className="space-y-1.5">
              {adAccounts.length === 0 && <p className="text-xs text-slate-400">Tài khoản này không quản lý Ad Account nào.</p>}
              {adAccounts.map((a) => (
                <label key={a.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedAdAccounts[a.id]?.checked ?? false}
                    onChange={(e) => setSelectedAdAccounts((prev) => ({ ...prev, [a.id]: { ...prev[a.id], checked: e.target.checked } }))}
                  />
                  <span className="flex-1 font-medium text-slate-700">
                    {a.name} <span className="text-slate-400">({a.id})</span>
                  </span>
                  <select
                    value={selectedAdAccounts[a.id]?.brand || ""}
                    onChange={(e) => setSelectedAdAccounts((prev) => ({ ...prev, [a.id]: { ...prev[a.id], brand: e.target.value } }))}
                    className={`rounded-lg border px-2 py-1 text-xs font-semibold ${selectedAdAccounts[a.id]?.brand ? "border-slate-200 bg-slate-100" : "border-amber-300 bg-amber-50 text-amber-700"}`}
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
