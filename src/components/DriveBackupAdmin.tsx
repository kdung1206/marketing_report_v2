import React, { useEffect, useState } from "react";
import { HardDrive, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, Unplug } from "lucide-react";
import { safeFetchJson } from "../App";

interface DriveBackupStatus {
  configured: boolean;
  connected: boolean;
  connected_email: string | null;
  enabled: boolean;
  folder_id: string | null;
  retention_days: number;
  last_backup_at: string | null;
  last_backup_error: string | null;
}

// Admin-only Control Panel section, sibling card to the email backup form
// above it under "Sao Lưu Tự Động". Same real-OAuth-redirect shape as
// TiktokAccountsAdmin.tsx/YoutubeAccountsAdmin.tsx — "Kết nối Google Drive"
// sends the browser to Google's consent screen rather than taking a pasted
// token. See GET /api/backup/drive/oauth/start and /callback in app.ts.
export default function DriveBackupAdmin() {
  const [status, setStatus] = useState<DriveBackupStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<{ filename: string; tables: Record<string, number> } | null>(null);
  const [folderIdInput, setFolderIdInput] = useState("");
  const [retentionInput, setRetentionInput] = useState("30");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadStatus() {
    setIsLoading(true);
    try {
      const result = await safeFetchJson("/api/backup/drive/status");
      if (result.success) {
        setStatus(result);
        setFolderIdInput(result.folder_id || "");
        setRetentionInput(String(result.retention_days ?? 30));
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tải được trạng thái sao lưu Google Drive." });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
    const params = new URLSearchParams(window.location.search);
    if (params.get("driveBackupConnected") === "1") {
      setMessage({ type: "success", text: "Đã kết nối Google Drive thành công." });
      params.delete("driveBackupConnected");
      const next = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (next ? `?${next}` : ""));
    }
  }, []);

  async function handleConnect() {
    setIsConnecting(true);
    setMessage(null);
    try {
      const result = await safeFetchJson("/api/backup/drive/oauth/start");
      if (result.success && result.authorizeUrl) {
        window.location.href = result.authorizeUrl;
      } else {
        setMessage({ type: "error", text: result.error || "Không tạo được liên kết kết nối Google Drive." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tạo được liên kết kết nối Google Drive." });
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!window.confirm("Ngắt kết nối Google Drive? Lịch sao lưu tự động hàng tuần sẽ dừng cho tới khi kết nối lại.")) return;
    try {
      const result = await safeFetchJson("/api/backup/drive/disconnect", { method: "DELETE" });
      if (result.success) await loadStatus();
      else setMessage({ type: "error", text: result.error || "Ngắt kết nối thất bại." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Ngắt kết nối thất bại." });
    }
  }

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const result = await safeFetchJson("/api/backup/drive/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: folderIdInput, retention_days: Number(retentionInput) || 30, enabled: true }),
      });
      if (result.success) {
        setMessage({ type: "success", text: "Đã lưu cấu hình sao lưu Google Drive." });
        await loadStatus();
      } else {
        setMessage({ type: "error", text: result.error || "Lưu cấu hình thất bại." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lưu cấu hình thất bại." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRunNow() {
    setIsRunning(true);
    setRunResult(null);
    setMessage(null);
    try {
      const result = await safeFetchJson("/api/backup/drive/run-now", { method: "POST" });
      if (result.success) {
        setRunResult({ filename: result.filename, tables: result.tables });
        await loadStatus();
      } else {
        setMessage({ type: "error", text: result.error || "Sao lưu thất bại." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Sao lưu thất bại." });
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm space-y-4 animate-fade-in w-full">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <HardDrive className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Sao Lưu Database Đầy Đủ Lên Google Drive</h3>
          <p className="text-[11px] text-slate-500">
            Tự động sao lưu <strong>toàn bộ</strong> database (mọi bảng, không chỉ dữ liệu báo cáo như email backup ở trên) vào <strong>9h sáng thứ Ba hàng tuần</strong> lên
            Google Drive dưới dạng file JSON. Kết nối bằng đăng nhập Google thật (OAuth) — không dán token tay. File cũ hơn số ngày lưu trữ dưới đây sẽ tự bị xóa.
          </p>
        </div>
      </div>

      {status && !status.configured && (
        <div className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
          <p className="font-semibold">Chưa cấu hình Google Cloud OAuth Client.</p>
          <p>
            Cần khai báo 3 biến môi trường <code className="rounded bg-amber-100 px-1">GOOGLE_DRIVE_CLIENT_ID</code>,{" "}
            <code className="rounded bg-amber-100 px-1">GOOGLE_DRIVE_CLIENT_SECRET</code>,{" "}
            <code className="rounded bg-amber-100 px-1">GOOGLE_DRIVE_REDIRECT_URI</code> (xem README) trước khi nút "Kết nối Google Drive" hoạt động được.
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

      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang tải...
        </div>
      ) : !status?.connected ? (
        <button
          type="button"
          onClick={handleConnect}
          disabled={isConnecting || !status?.configured}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
        >
          <ExternalLink className={`h-3.5 w-3.5 ${isConnecting ? "animate-pulse" : ""}`} />
          {isConnecting ? "Đang chuyển đến Google..." : "Kết nối Google Drive"}
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs">
            <div>
              <div className="font-semibold text-slate-700">Đã kết nối: {status.connected_email || "(không rõ email)"}</div>
              <div className="mt-0.5 text-slate-500">
                {status.last_backup_error ? (
                  <span className="font-semibold text-rose-600" title={status.last_backup_error}>
                    ⚠️ Lần gần nhất lỗi: {status.last_backup_error.slice(0, 60)}
                    {status.last_backup_error.length > 60 ? "…" : ""}
                  </span>
                ) : status.last_backup_at ? (
                  <span className="text-emerald-600">Sao lưu gần nhất: {new Date(status.last_backup_at).toLocaleString("vi-VN")}</span>
                ) : (
                  <span className="text-slate-400">Chưa chạy sao lưu lần nào</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleDisconnect}
              className="flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50"
            >
              <Unplug className="h-3 w-3" /> Ngắt kết nối
            </button>
          </div>

          <form onSubmit={handleSaveConfig} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600">Drive Folder ID (để trống = lưu ở Drive gốc)</label>
              <input
                type="text"
                value={folderIdInput}
                onChange={(e) => setFolderIdInput(e.target.value)}
                placeholder="vd: 1a2B3cD4eFgHiJkLmNoP"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs shadow-inner focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600">Số ngày lưu trữ (file cũ hơn sẽ tự xóa)</label>
              <input
                type="number"
                min={1}
                value={retentionInput}
                onChange={(e) => setRetentionInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs shadow-inner focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2 pt-1">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
              </button>
              <button
                type="button"
                onClick={handleRunNow}
                disabled={isRunning}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 shadow-sm transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRunning ? "animate-spin" : ""}`} />
                {isRunning ? "Đang sao lưu..." : "Sao lưu ngay"}
              </button>
            </div>
          </form>

          {runResult && (
            <div className="space-y-1 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              <p className="font-semibold">Đã tạo {runResult.filename}</p>
              <p className="text-emerald-700">
                {Object.entries(runResult.tables)
                  .map(([table, count]) => `${table}: ${count}`)
                  .join(" · ")}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
