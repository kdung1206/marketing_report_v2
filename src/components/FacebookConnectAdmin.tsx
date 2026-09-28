import React, { useEffect, useState } from "react";
import { Facebook, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
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

// One Facebook Login covers both fb_pages and fb_ad_accounts — the admin
// authorizes once here, then checks which Pages/Ad Accounts to import into
// the tables below (FacebookPagesAdmin/FbAdAccountsAdmin). Replaces the old
// "paste a Page/Marketing API Access Token you fished out by hand" setup —
// see GET /api/facebook/oauth/start|callback and POST
// /api/facebook/oauth/pending/:id/complete in src/server/app.ts.
export default function FacebookConnectAdmin({ onImported }: { onImported: () => void }) {
  const [configured, setConfigured] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pages, setPages] = useState<PageCandidate[]>([]);
  const [adAccounts, setAdAccounts] = useState<AdAccountCandidate[]>([]);
  const [selectedPages, setSelectedPages] = useState<Record<string, { checked: boolean; brand: string }>>({});
  const [selectedAdAccounts, setSelectedAdAccounts] = useState<Record<string, { checked: boolean; brand: string }>>({});
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Only used to render the "chưa cấu hình" notice — the actual configured
  // flag comes from GET /api/fb/pages (loaded by the sibling
  // FacebookPagesAdmin component); fetched here too so this card can show
  // its own warning even before that component's first load resolves.
  useEffect(() => {
    (async () => {
      try {
        const result = await safeFetchJson("/api/fb/pages");
        if (result.success) setConfigured(result.facebookOAuthConfigured !== false);
      } catch {
        // Non-fatal — worst case the button is enabled and the start route
        // itself reports "chưa cấu hình" when clicked.
      }
    })();

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
    setIsConnecting(true);
    setMessage(null);
    try {
      const result = await safeFetchJson("/api/facebook/oauth/start");
      if (result.success && result.authorizeUrl) {
        window.location.href = result.authorizeUrl;
      } else {
        setMessage({ type: "error", text: result.error || "Không tạo được liên kết kết nối Facebook." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tạo được liên kết kết nối Facebook." });
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
            Đăng nhập Facebook một lần để lấy danh sách Page và Ad Account bạn quản lý — chọn cái nào cần nhập vào Page Insights /
            Ads bên dưới, không cần tự dán Access Token nữa.
          </p>
        </div>
      </div>

      {!configured && (
        <div className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
          <p className="font-semibold">Chưa cấu hình đầy đủ.</p>
          <p>
            Cần khai báo <code className="rounded bg-amber-100 px-1">FB_APP_ID</code>, <code className="rounded bg-amber-100 px-1">FB_APP_SECRET</code>,{" "}
            <code className="rounded bg-amber-100 px-1">FACEBOOK_REDIRECT_URI</code> — xem hướng dẫn tạo Facebook App trong .env.example.
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
          {isConnecting ? "Đang tạo liên kết..." : "Kết nối Facebook"}
        </button>
      ) : isLoadingPending ? (
        <p className="text-xs text-slate-400">Đang tải danh sách Page/Ad Account...</p>
      ) : (
        <div className="space-y-4">
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
