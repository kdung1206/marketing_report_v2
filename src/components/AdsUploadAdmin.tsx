import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, FileCheck2, X } from "lucide-react";
import { safeFetchJson } from "../App";
import { parseGoogleAdsExport, parseTiktokAdsExport, parseFacebookAdsExport, AdsPerformanceRow } from "../lib/adsImport";

const CHANNEL_LABELS = { google: "Google Ads", tiktok: "TikTok Ads", facebook: "Facebook Ads" } as const;
const fmt = (v: number) => new Intl.NumberFormat("vi-VN").format(Math.round(v));

interface AdsUploadAdminProps {
  channel: "google" | "tiktok" | "facebook";
}

interface PendingUpload {
  fileName: string;
  brand: "Livotec" | "Karofi";
  rows: AdsPerformanceRow[];
  campaignCount: number;
  dateFrom: string;
  dateTo: string;
  totalSpend: number;
}

// Control Panel section for the Digital Ads Report's Google/TikTok manual
// upload flow (Facebook is synced via the Marketing API instead — see
// FbAdAccountsAdmin.tsx, right next to this under "Kết nối nền tảng").
//
// Two explicit steps — parse-and-preview, then a separate "Xác nhận & Lưu"
// submit — rather than saving the instant a file is selected. Requested
// after a real upload attempt left the uploader unsure whether anything had
// actually been recorded: with no confirm step and no visible summary of
// what was read, a parse that silently returned 0 usable rows (wrong file,
// wrong brand, unexpected column layout) looked identical to a successful
// save. The preview surfaces exactly what would be written — row/campaign
// count, date range, total spend, and the brand it'll be tagged with —
// before anything touches the server, so a bad file or wrong brand is caught
// pre-save, not discovered later on the report tab.
export default function AdsUploadAdmin({ channel }: AdsUploadAdminProps) {
  const [brand, setBrand] = useState<"Livotec" | "Karofi">("Livotec");
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pending, setPending] = useState<PendingUpload | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleFile(file: File) {
    setIsParsing(true);
    setMessage(null);
    setPending(null);
    try {
      const rows =
        channel === "google"
          ? await parseGoogleAdsExport(file, brand)
          : channel === "tiktok"
          ? await parseTiktokAdsExport(file, brand)
          : await parseFacebookAdsExport(file, brand);
      if (rows.length === 0) {
        setMessage({ type: "error", text: "Không đọc được dòng dữ liệu nào hợp lệ từ tệp này — kiểm tra lại đúng định dạng file xuất từ nền tảng chưa." });
        return;
      }
      const dates = rows.map((r) => r.date).sort();
      const campaigns = new Set(rows.map((r) => r.campaign_name));
      const totalSpend = rows.reduce((s, r) => s + (r.spend || 0), 0);
      setPending({
        fileName: file.name,
        brand,
        rows,
        campaignCount: campaigns.size,
        dateFrom: dates[0],
        dateTo: dates[dates.length - 1],
        totalSpend,
      });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không đọc được tệp." });
    } finally {
      setIsParsing(false);
    }
  }

  async function handleConfirm() {
    if (!pending) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const result = await safeFetchJson("/api/ads-performance/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: pending.rows }),
      });
      if (result.success) {
        setMessage({
          type: "success",
          text: `Đã lưu ${result.count} dòng cho thương hiệu ${pending.brand} (${pending.dateFrom} → ${pending.dateTo}). Xem tại tab "Digital Ads Report" → ${CHANNEL_LABELS[channel]}.`,
        });
        setPending(null);
      } else {
        setMessage({ type: "error", text: result.error || "Lưu dữ liệu thất bại." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lưu dữ liệu thất bại." });
    } finally {
      setIsSaving(false);
    }
  }

  const accept = channel === "google" ? ".csv" : ".xlsx,.xls,.csv";
  const hint =
    channel === "google"
      ? "Xuất từ Google Ads Editor → chọn các Ads cần báo cáo → Export → 'Selected rows and columns' (định dạng .csv)."
      : channel === "tiktok"
      ? "Xuất từ TikTok Ads Manager → Campaign/Report → tải về định dạng .xlsx."
      : "Xuất từ Facebook Ads Manager → Breakdown theo ngày (Day) → tải về định dạng .csv hoặc .xlsx. Dùng để bổ sung giai đoạn ngoài phạm vi 30 ngày mà đồng bộ API tự động không lấy tới.";
  const channelDescription = channel === "google" ? "Google" : channel === "tiktok" ? "TikTok" : "Facebook (bổ sung ngoài API)";

  return (
    <div className="w-full animate-fade-in space-y-4 rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <UploadCloud className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Tải Lên Dữ Liệu {CHANNEL_LABELS[channel]}</h3>
          <p className="text-[11px] text-slate-500">
            {channel === "facebook"
              ? "Đồng bộ API đã có sẵn (30 ngày gần nhất) — dùng upload này chỉ để bổ sung giai đoạn cũ hơn."
              : `${channelDescription} chưa hỗ trợ đồng bộ API — cập nhật thủ công bằng cách tải lên tệp xuất báo cáo.`}{" "}
            {hint}
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

      {!pending && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Thương hiệu</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value as "Livotec" | "Karofi")}
              className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
            >
              <option value="Livotec">Livotec</option>
              <option value="Karofi">Karofi</option>
            </select>
          </div>

          <label
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 ${
              isParsing ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <UploadCloud className={`h-3.5 w-3.5 ${isParsing ? "animate-pulse" : ""}`} />
            {isParsing ? "Đang đọc tệp..." : `Chọn tệp ${CHANNEL_LABELS[channel]}`}
            <input
              type="file"
              accept={accept}
              className="hidden"
              disabled={isParsing}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      )}

      {pending && (
        <div className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-800">
            <FileCheck2 className="h-4 w-4" />
            Xem lại trước khi lưu — "{pending.fileName}"
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <PreviewStat label="Số dòng" value={fmt(pending.rows.length)} />
            <PreviewStat label="Số campaign" value={fmt(pending.campaignCount)} />
            <PreviewStat label="Khoảng thời gian" value={`${pending.dateFrom} → ${pending.dateTo}`} />
            <PreviewStat label="Tổng chi phí" value={fmt(pending.totalSpend)} />
          </div>
          {channel === "facebook" && (
            <p className="text-[11px] text-amber-700">
              Lưu ý: tệp này không có sẵn số Clicks, nên được tính lại từ Chi phí ÷ CPC (chỉ tính link click) — có thể lệch nhẹ so với số "Clicks" của những ngày đã đồng bộ qua API (tính theo định nghĩa "clicks" rộng hơn của Facebook).
            </p>
          )}
          <p className="text-[11px] text-indigo-700">
            Sẽ được ghi nhận cho thương hiệu <strong>{pending.brand}</strong>. Kiểm tra lại đúng thương hiệu và khoảng thời gian trước khi xác nhận — dữ liệu trùng ngày/campaign/ad group đã có sẽ được cập nhật lại theo số liệu mới trong tệp này.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <CheckCircle2 className={`h-3.5 w-3.5 ${isSaving ? "animate-pulse" : ""}`} />
              {isSaving ? "Đang lưu..." : "Xác nhận & Lưu"}
            </button>
            <button
              type="button"
              onClick={() => setPending(null)}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              Hủy, chọn tệp khác
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-indigo-100 bg-white px-3 py-2">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <span className="block font-mono text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}
