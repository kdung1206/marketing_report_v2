// One-off generator for the TikTok Ads manual-upload Excel template (see
// src/lib/adsImport.ts's parseTiktokAdsExport) — run with:
//   npx tsx scripts/generate-tiktok-ads-template.ts
// Not part of the app build; output is handed to the user directly, not
// committed.
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Column names/order match exactly what parseTiktokAdsExport reads by name
// (row["By Day"], row["Campaign name"], ...) — a real TikTok Ads Manager
// export ("Campaign/Report → tải về định dạng .xlsx") has these same headers;
// this template mirrors that shape so it uploads with zero code changes.
const HEADERS = [
  "By Day",
  "Campaign name",
  "Campaign type",
  "Ad group name",
  "Ad name",
  "Account name",
  "Spend",
  "Impressions",
  "Clicks (destination)",
  "Reach",
  "Frequency",
  "6-second video views",
  "Conversions",
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// 2 campaigns x 2 ad groups x 2 ads x 2 days = 16 sample rows, realistic
// numbers so the shape (multiple ad groups/ads per campaign, multiple days)
// is obvious when opened — not just 1 blank row to fill in blind.
const SAMPLE_ROWS: (string | number)[][] = [
  [daysAgo(1), "Bếp từ đôi - Trade activation NPP miền Bắc", "Spark Ads", "Spark Ads - KOC review", "Video KOC #1 unbox", "Karofi Official", 7166667, 413333, 10400, 326667, 1.27, 286667, 135],
  [daysAgo(1), "Bếp từ đôi - Trade activation NPP miền Bắc", "Spark Ads", "Spark Ads - KOC review", "Video KOC #2 review 7 ngày", "Karofi Official", 6600000, 393333, 9133, 303333, 1.3, 263333, 124],
  [daysAgo(1), "Bếp từ đôi - Trade activation NPP miền Bắc", "In-feed ads", "In-feed - Nhắc lại NPP", "In-feed CTA Tìm cửa hàng gần bạn", "Karofi Official", 3146667, 203833, 5287, 156667, 1.3, 170000, 56],
  [daysAgo(1), "Bếp từ đôi - Trade activation NPP miền Bắc", "In-feed ads", "In-feed - Nhắc lại NPP", "In-feed CTA Ưu đãi tháng 9", "Karofi Official", 0, 0, 0, 0, 0, 0, 0],
  [daysAgo(2), "Bếp từ đôi - Trade activation NPP miền Bắc", "Spark Ads", "Spark Ads - KOC review", "Video KOC #1 unbox", "Karofi Official", 7166667, 413333, 10400, 326667, 1.27, 286667, 135],
  [daysAgo(2), "Bếp từ đôi - Trade activation NPP miền Bắc", "Spark Ads", "Spark Ads - KOC review", "Video KOC #2 review 7 ngày", "Karofi Official", 6600000, 393333, 9133, 303333, 1.3, 263333, 124],
  [daysAgo(2), "Bếp từ đôi - Trade activation NPP miền Bắc", "In-feed ads", "In-feed - Nhắc lại NPP", "In-feed CTA Tìm cửa hàng gần bạn", "Karofi Official", 3146667, 203833, 5287, 156667, 1.3, 170000, 56],
  [daysAgo(2), "Bếp từ đôi - Trade activation NPP miền Bắc", "In-feed ads", "In-feed - Nhắc lại NPP", "In-feed CTA Ưu đãi tháng 9", "Karofi Official", 0, 0, 0, 0, 0, 0, 0],
  [daysAgo(1), "Karofi - Máy lọc nước - Always On", "In-feed ads", "Broad - Toàn quốc", "Video 15s - Công nghệ RO", "Karofi Official", 2100000, 156000, 3120, 118000, 1.32, 89000, 18],
  [daysAgo(1), "Karofi - Máy lọc nước - Always On", "In-feed ads", "Broad - Toàn quốc", "Carousel - So sánh 3 dòng máy", "Karofi Official", 1850000, 138500, 2670, 104000, 1.33, 71500, 14],
  [daysAgo(1), "Karofi - Máy lọc nước - Always On", "In-feed ads", "Retargeting - Đã xem video", "Video testimonial khách hàng", "Karofi Official", 980000, 61000, 1980, 42000, 1.45, 38500, 22],
  [daysAgo(1), "Karofi - Máy lọc nước - Always On", "In-feed ads", "Retargeting - Đã xem video", "Ảnh tĩnh - Ưu đãi lắp đặt", "Karofi Official", 640000, 39500, 890, 27000, 1.46, 0, 9],
  [daysAgo(2), "Karofi - Máy lọc nước - Always On", "In-feed ads", "Broad - Toàn quốc", "Video 15s - Công nghệ RO", "Karofi Official", 2100000, 156000, 3120, 118000, 1.32, 89000, 18],
  [daysAgo(2), "Karofi - Máy lọc nước - Always On", "In-feed ads", "Broad - Toàn quốc", "Carousel - So sánh 3 dòng máy", "Karofi Official", 1850000, 138500, 2670, 104000, 1.33, 71500, 14],
  [daysAgo(2), "Karofi - Máy lọc nước - Always On", "In-feed ads", "Retargeting - Đã xem video", "Video testimonial khách hàng", "Karofi Official", 980000, 61000, 1980, 42000, 1.45, 38500, 22],
  [daysAgo(2), "Karofi - Máy lọc nước - Always On", "In-feed ads", "Retargeting - Đã xem video", "Ảnh tĩnh - Ưu đãi lắp đặt", "Karofi Official", 640000, 39500, 890, 27000, 1.46, 0, 9],
];

const wb = XLSX.utils.book_new();

// Sheet 1: the actual data sheet — MUST be workbook.SheetNames[0], since
// parseTiktokAdsExport always reads the first sheet regardless of its name.
const dataSheet = XLSX.utils.aoa_to_sheet([HEADERS, ...SAMPLE_ROWS]);
dataSheet["!cols"] = [
  { wch: 12 }, { wch: 38 }, { wch: 14 }, { wch: 26 }, { wch: 30 }, { wch: 16 },
  { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 12 },
];
XLSX.utils.book_append_sheet(wb, dataSheet, "TikTok Ads Export");

// Sheet 2: instructions — safe to add extra sheets, the parser only ever
// looks at SheetNames[0].
const guideRows: (string | number)[][] = [
  ["HƯỚNG DẪN DÙNG FILE NÀY"],
  [""],
  ["1. Đây là template tạm thời để nhập tay số liệu TikTok Ads trong lúc chưa nối API thật."],
  ["2. Xoá hết các dòng dữ liệu mẫu ở sheet 'TikTok Ads Export' (từ dòng 2 trở đi), giữ nguyên dòng tiêu đề (dòng 1) — không đổi tên cột, không đổi thứ tự cột."],
  ["3. Điền số liệu thật vào, MỖI DÒNG = 1 ad, trong 1 ngày cụ thể (giống hệt cách TikTok Ads Manager tự xuất ra khi bạn bấm 'Xuất từ TikTok Ads Manager → Campaign/Report → tải về .xlsx')."],
  ["4. Cột 'By Day' bắt buộc theo định dạng YYYY-MM-DD (ví dụ 2026-09-24), hoặc để Excel tự nhận dạng là cột ngày tháng cũng được."],
  ["5. Các cột bắt buộc có số liệu: Campaign name, Ad group name, Ad name, Spend, Impressions, Clicks (destination)."],
  ["6. Các cột còn lại (Campaign type, Account name, Reach, Frequency, 6-second video views, Conversions) — điền được thì điền, để trống cũng không lỗi."],
  ["7. 1 campaign có thể có nhiều Ad group, 1 Ad group có nhiều Ad — file càng nhiều dòng càng chi tiết, ứng dụng sẽ tự gộp lại theo Campaign/Ad set khi hiển thị (xem Digital Ads Report → TikTok)."],
  ["8. Upload file này ở: đăng nhập → Control Panel → Kết nối nền tảng → TikTok → mục Upload Excel."],
  [""],
  ["Ý nghĩa từng cột:"],
  ["By Day", "Ngày phát sinh số liệu (1 dòng = số liệu của 1 ngày, không phải tổng cả chiến dịch)"],
  ["Campaign name", "Tên chiến dịch"],
  ["Campaign type", "Loại chiến dịch (Spark Ads / In-feed ads / ...) — không bắt buộc"],
  ["Ad group name", "Tên nhóm quảng cáo (ad set)"],
  ["Ad name", "Tên quảng cáo cụ thể"],
  ["Account name", "Tên tài khoản quảng cáo — không bắt buộc"],
  ["Spend", "Chi phí (VNĐ)"],
  ["Impressions", "Số lần hiển thị"],
  ["Clicks (destination)", "Số lượt click tới trang đích"],
  ["Reach", "Số người tiếp cận — không bắt buộc"],
  ["Frequency", "Tần suất lặp lại = Impressions / Reach — không bắt buộc"],
  ["6-second video views", "Lượt xem video ≥ 6 giây — không bắt buộc"],
  ["Conversions", "Số chuyển đổi — không bắt buộc"],
];
const guideSheet = XLSX.utils.aoa_to_sheet(guideRows);
guideSheet["!cols"] = [{ wch: 24 }, { wch: 90 }];
XLSX.utils.book_append_sheet(wb, guideSheet, "Huong dan");

const outPath = path.resolve(__dirname, "..", "template-tiktok-ads-upload.xlsx");
const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
fs.writeFileSync(outPath, buf);
console.log("Written to", outPath);
