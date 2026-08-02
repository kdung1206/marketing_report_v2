import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Youtube,
  DollarSign,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Link2,
  Clock,
  Film,
  Megaphone,
} from "lucide-react";
import { socialReportFetch } from "../../lib/socialReportApi";
import type { WeeklyReportRow } from "../../server/socialReport/types";

interface SocialReportPageProps {
  role: "Admin" | "Editor" | "Viewer";
}

interface StatusPayload {
  googleOAuthConfigured: boolean;
  channelIdConfigured: boolean;
  googleAdsConfigured: boolean;
  connected: boolean;
  connectedAt: string | null;
  connectedBy: string | null;
  lastSyncedAt: string | null;
  lastSyncLog: string[];
  videoCount: number;
}

function fmtInt(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n || 0));
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return fmtInt(n);
}

function fmtMoney(n: number, currency: string): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "tr " + currency;
  return fmtInt(n) + " " + currency;
}

export default function SocialReportPage({ role }: SocialReportPageProps) {
  const [rows, setRows] = useState<WeeklyReportRow[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthNotice, setOauthNotice] = useState<{ type: "success" | "error"; message?: string } | null>(null);

  const isAdmin = role === "Admin";

  async function loadData() {
    try {
      const dataRes = await socialReportFetch("/api/social-report/data");
      setRows(dataRes.rows || []);
      setLastSyncedAt(dataRes.lastSyncedAt || null);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Lỗi tải dữ liệu Social Report.");
    }
  }

  async function loadStatus() {
    if (!isAdmin) return;
    try {
      const res = await socialReportFetch("/api/social-report/status");
      setStatus(res.status);
    } catch {
      // Non-fatal — the report table itself doesn't depend on this panel.
    }
  }

  useEffect(() => {
    // Google's OAuth callback redirects back to "/?social_oauth=success|error" —
    // surface that as a one-time notice, then clean the URL so a refresh
    // doesn't re-show it.
    const params = new URLSearchParams(window.location.search);
    const oauthParam = params.get("social_oauth");
    if (oauthParam === "success" || oauthParam === "error") {
      setOauthNotice({ type: oauthParam, message: params.get("message") || undefined });
      params.delete("social_oauth");
      params.delete("message");
      const newSearch = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (newSearch ? `?${newSearch}` : ""));
    }

    (async () => {
      setLoading(true);
      await Promise.all([loadData(), loadStatus()]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleConnectGoogle() {
    try {
      const res = await socialReportFetch("/api/social-report/oauth/google/start");
      window.location.href = res.authUrl;
    } catch (err: any) {
      setError(err.message || "Không tạo được đường dẫn kết nối Google.");
    }
  }

  async function handleSyncNow() {
    setSyncing(true);
    setError(null);
    try {
      await socialReportFetch("/api/social-report/sync", { method: "POST" });
      await Promise.all([loadData(), loadStatus()]);
    } catch (err: any) {
      setError(err.message || "Lỗi khi đồng bộ.");
    } finally {
      setSyncing(false);
    }
  }

  // One row per video — the newest snapshot only (rows already come back
  // sorted newest-first per videoId from computeWeeklyReport).
  const latestRows = useMemo(() => {
    const seen = new Set<string>();
    const out: WeeklyReportRow[] = [];
    for (const r of rows) {
      if (seen.has(r.videoId)) continue;
      seen.add(r.videoId);
      out.push(r);
    }
    return out;
  }, [rows]);

  const kpis = useMemo(() => {
    const totalSpend = latestRows.reduce((s, r) => s + (r.spendYtd || 0), 0);
    const totalImpressions = latestRows.reduce((s, r) => s + (r.impressionsCumulative || 0), 0);
    const withAds = latestRows.filter((r) => r.hasAds).length;
    return { totalSpend, totalImpressions, totalVideos: latestRows.length, withAds };
  }, [latestRows]);

  const currency = latestRows[0] ? "VND" : "VND";
  const needsSetup = isAdmin && status && (!status.googleOAuthConfigured || !status.channelIdConfigured || !status.connected);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
            <Youtube className="h-6 w-6 text-rose-600" />
            Social Report — YouTube
          </h2>
          <p className="text-sm text-slate-500">
            Đối soát Organic (YouTube Analytics) + Paid Ads (Google Ads) theo từng video, tự động mỗi thứ Hai.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastSyncedAt && (
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Đồng bộ lần cuối: {new Date(lastSyncedAt).toLocaleString("vi-VN")}
            </span>
          )}
          {isAdmin && (
            <button
              onClick={handleSyncNow}
              disabled={syncing || !status?.connected}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition cursor-pointer"
              title={status?.connected ? "Đồng bộ dữ liệu YouTube + Google Ads ngay" : "Kết nối Google trước khi đồng bộ"}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
            </button>
          )}
        </div>
      </div>

      {oauthNotice && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
            oauthNotice.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {oauthNotice.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {oauthNotice.type === "success" ? "Kết nối Google thành công." : oauthNotice.message || "Kết nối Google thất bại."}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {isAdmin && needsSetup && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-amber-900">
            <AlertCircle className="h-4 w-4" />
            Cần hoàn tất cấu hình trước khi Social Report có dữ liệu
          </h3>
          <ul className="space-y-1.5 text-xs text-amber-900">
            <SetupItem ok={!!status?.googleOAuthConfigured} label="Biến môi trường OAuth (GOOGLE_OAUTH_CLIENT_ID/SECRET/REDIRECT_URI) — xem .env.example" />
            <SetupItem ok={!!status?.channelIdConfigured} label="YOUTUBE_CHANNEL_ID đã cấu hình" />
            <SetupItem ok={!!status?.googleAdsConfigured} label="Google Ads (tuỳ chọn) — thiếu thì chỉ bỏ qua phần chi tiêu Ads" optional />
            <SetupItem ok={!!status?.connected} label="Đã kết nối tài khoản Google" />
          </ul>
          {status?.googleOAuthConfigured && !status?.connected && (
            <button
              onClick={handleConnectGoogle}
              className="flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
            >
              <Link2 className="h-3.5 w-3.5" />
              Kết nối Google
            </button>
          )}
        </div>
      )}

      {isAdmin && status?.connected && status.connectedAt && (
        <p className="text-xs text-slate-400">
          Đã kết nối Google bởi {status.connectedBy} lúc {new Date(status.connectedAt).toLocaleString("vi-VN")}.
          {status.videoCount > 0 && ` Đang theo dõi ${status.videoCount} video.`}
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-10 justify-center text-slate-400 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
            <KpiTile label="Tổng chi tiêu Ads (luỹ kế)" value={fmtMoney(kpis.totalSpend, currency)} icon={<DollarSign className="h-4 w-4 text-indigo-500" />} />
            <KpiTile label="Tổng Impressions (Organic + Paid)" value={fmtCompact(kpis.totalImpressions)} icon={<Eye className="h-4 w-4 text-indigo-500" />} />
            <KpiTile label="Video đang theo dõi" value={fmtInt(kpis.totalVideos)} icon={<Film className="h-4 w-4 text-indigo-500" />} />
            <KpiTile label="Video đang chạy Ads" value={`${kpis.withAds}/${kpis.totalVideos}`} icon={<Megaphone className="h-4 w-4 text-indigo-500" />} />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Video</th>
                  <th className="px-4 py-3">Ngày đăng</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Views tuần này</th>
                  <th className="px-4 py-3 text-right">Organic views tuần này</th>
                  <th className="px-4 py-3 text-right">Impressions tuần này</th>
                  <th className="px-4 py-3 text-right">Spend tuần này</th>
                  <th className="px-4 py-3 text-right">Spend luỹ kế</th>
                </tr>
              </thead>
              <tbody>
                {latestRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                      Chưa có dữ liệu — {isAdmin ? "bấm \"Đồng bộ ngay\" sau khi kết nối Google." : "liên hệ Admin để kết nối Google."}
                    </td>
                  </tr>
                ) : (
                  latestRows.map((r) => (
                    <tr key={r.videoId} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-4 py-3 max-w-xs">
                        <a href={r.videoUrl} target="_blank" rel="noreferrer" className="font-semibold text-slate-800 hover:text-indigo-600 line-clamp-2">
                          {r.title}
                        </a>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {new Date(r.publishedAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3">
                        {r.hasAds ? (
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">Đang chạy Ads</span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">Chỉ Organic</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">{fmtInt(r.weeklyViews)}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">{fmtInt(r.weeklyOrganicViews)}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">{fmtInt(r.weeklyImpressions)}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">
                        {r.weekSpend > 0 ? fmtMoney(r.weekSpend, currency) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">
                        {r.spendYtd > 0 ? fmtMoney(r.spendYtd, currency) : <span className="text-slate-300">—</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400">
            Reach (unique viewers) không được tự động thu thập — YouTube Analytics API không cho số liệu này ổn định ở
            phạm vi lũy kế từ ngày đăng. Views và Impressions cộng dồn organic + paid an toàn (không đếm trùng);
            xem chi tiết logic đối soát trong tài liệu Social Report.
          </p>
        </>
      )}
    </div>
  );
}

function SetupItem({ ok, label, optional }: { ok: boolean; label: string; optional?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      {ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <AlertCircle className={`h-3.5 w-3.5 shrink-0 ${optional ? "text-slate-400" : "text-amber-600"}`} />}
      <span className={ok ? "text-slate-500 line-through" : ""}>{label}</span>
    </li>
  );
}

function KpiTile({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="bg-white p-4">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        {icon}
        {label}
      </div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
