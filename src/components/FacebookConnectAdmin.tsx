import React, { useEffect, useState } from "react";
import { Facebook, KeyRound, CheckCircle2, AlertCircle, X } from "lucide-react";
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

type Selection = Record<string, { checked: boolean; brand: string }>;

// Connect via a System User Access Token (Business Settings → System Users →
// Generate token, expiry "Never"). The admin card only shows a button; the
// token is typed into a two-step dialog (1. token → 2. pick Pages / Ad
// Accounts and set the brand for each) and is never rendered again or kept in
// component state after the server has it. Server side: POST
// /api/facebook/token/connect then POST /api/facebook/oauth/pending/:id/complete
// in src/server/app.ts (the token is stored AES-encrypted, like every other
// platform token). No Facebook Login / App Domains / Redirect URI needed.
export default function FacebookConnectAdmin({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenInfo, setTokenInfo] = useState<{ name: string | null; neverExpires: boolean; expires_at: string | null } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pages, setPages] = useState<PageCandidate[]>([]);
  const [adAccounts, setAdAccounts] = useState<AdAccountCandidate[]>([]);
  const [selectedPages, setSelectedPages] = useState<Selection>({});
  const [selectedAdAccounts, setSelectedAdAccounts] = useState<Selection>({});
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Legacy: the old OAuth callback redirected back with ?fbPendingId=… — still
  // honored so an in-flight OAuth connection isn't dropped by this redesign.
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

  function resetDialog() {
    setPendingId(null);
    setTokenInfo(null);
    setTokenInput("");
    setWarnings([]);
    setPages([]);
    setAdAccounts([]);
    setMessage(null);
    setOpen(false);
  }

  async function handleConnect() {
    const token = tokenInput.trim();
    if (!token) {
      setMessage({ type: "error", text: "Vui lòng nhập Access Token." });
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
        setTokenInput(""); // the server holds it (encrypted) from here on
        setTokenInfo(result.token || null);
        setWarnings(result.warnings || []);
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
          pages: (Object.entries(selectedPages) as [string, Selection[string]][]).filter(([, v]) => v.checked).map(([id, v]) => ({ id, brand: v.brand || null })),
          adAccounts: (Object.entries(selectedAdAccounts) as [string, Selection[string]][]).filter(([, v]) => v.checked).map(([id, v]) => ({ id, brand: v.brand || null })),
        }),
      });
      if (result.success) {
        resetDialog();
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
    resetDialog();
  }

  const modalOpen = open || Boolean(pendingId);
  const step: 1 | 2 = pendingId ? 2 : 1;

  function renderRows(items: { id: string; name: string }[], selected: Selection, setSelected: React.Dispatch<React.SetStateAction<Selection>>, showId: boolean) {
    return items.map((it) => (
      <label key={it.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs">
        <input type="checkbox" checked={selected[it.id]?.checked ?? false} onChange={(e) => setSelected((prev) => ({ ...prev, [it.id]: { ...prev[it.id], checked: e.target.checked } }))} />
        <span className="flex-1 font-medium text-slate-700">
          {it.name} {showId && <span className="text-slate-400">({it.id})</span>}
        </span>
        <select
          value={selected[it.id]?.brand || ""}
          onChange={(e) => setSelected((prev) => ({ ...prev, [it.id]: { ...prev[it.id], brand: e.target.value } }))}
          className={`rounded-lg border px-2 py-1 text-xs font-semibold ${selected[it.id]?.brand ? "border-slate-200 bg-slate-100" : "border-amber-300 bg-amber-50 text-amber-700"}`}
        >
          <option value="">Chưa xác định</option>
          <option value="Livotec">Livotec</option>
          <option value="Karofi">Karofi</option>
        </select>
      </label>
    ));
  }

  return (
    <div className="w-full animate-fade-in rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Facebook className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Kết Nối Facebook</h3>
            <p className="text-[11px] text-slate-500">Nhập System User Token → chọn Page / Ad Account → gán brand.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setOpen(true);
          }}
          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Kết nối Facebook
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Kết nối Facebook</h4>
                <p className="text-[11px] text-slate-500">
                  Bước {step}/2 — {step === 1 ? "Nhập Access Token" : "Chọn tài khoản & gán brand"}
                </p>
              </div>
              <button type="button" onClick={handleDismiss} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Đóng">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {message && (
                <div
                  className={`flex items-start gap-2 rounded-lg border p-2.5 text-xs ${
                    message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {message.type === "success" ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                  <span>{message.text}</span>
                </div>
              )}

              {step === 1 ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">System User Access Token</label>
                  <input
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tokenInput.trim() && !isConnecting) handleConnect();
                    }}
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="EAAB..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs text-slate-700 outline-none focus:border-indigo-400"
                  />
                  <p className="text-[11px] text-slate-400">
                    Business Settings → System Users → Add Assets (gán Page + Ad Account) → Generate New Token, Expiration = Never. Quyền: ads_read,
                    pages_show_list, pages_read_engagement, read_insights.
                  </p>
                </div>
              ) : isLoadingPending ? (
                <p className="text-xs text-slate-400">Đang tải danh sách Page/Ad Account...</p>
              ) : (
                <>
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
                  {warnings.length > 0 && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{warnings.join(" ")}</span>
                    </div>
                  )}
                  <div>
                    <p className="pb-1.5 text-xs font-bold text-slate-700">Page ({pages.length})</p>
                    <div className="space-y-1.5">
                      {pages.length === 0 && <p className="text-xs text-slate-400">Token này không có Page nào được gán.</p>}
                      {renderRows(pages, selectedPages, setSelectedPages, false)}
                    </div>
                  </div>
                  <div>
                    <p className="pb-1.5 text-xs font-bold text-slate-700">Ad Account ({adAccounts.length})</p>
                    <div className="space-y-1.5">
                      {adAccounts.length === 0 && <p className="text-xs text-slate-400">Token này không có Ad Account nào được gán.</p>}
                      {renderRows(adAccounts, selectedAdAccounts, setSelectedAdAccounts, true)}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
              <button type="button" onClick={handleDismiss} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                Hủy
              </button>
              {step === 1 ? (
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isConnecting || !tokenInput.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  {isConnecting ? "Đang tải danh sách..." : "Tải danh sách"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={isImporting || isLoadingPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isImporting ? "Đang nhập..." : "Xác nhận & Nhập"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
