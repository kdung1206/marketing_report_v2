/**
 * Utility functions for exporting the marketing database.
 */
import * as XLSX from "xlsx";
import { commentRowsToTree, CommentsTree } from "./comments";

// Sheet names a spreadsheet upload is matched against (case/space/underscore
// insensitive) — see parseSpreadsheetFile below. Kept as the internal field
// keys (e.g. "week", "brand", "hạng_mục") rather than the pretty Vietnamese
// labels used in exportToExcel's old .xls report, because those keys are
// exactly what normalizeMarketingData's column matching already recognizes
// (src/data.ts) — no separate label→key mapping to keep in sync.
const SPREADSHEET_COLLECTION_ALIASES: Record<string, string[]> = {
  digital_marketing: ["digital_marketing", "digital marketing"],
  kol_koc: ["kol_koc", "kol koc", "kol/koc", "kol_kol"],
  btl_trade: ["btl_trade", "btl trade"],
  monthly_ooh_pr: ["monthly_ooh_pr", "monthly ooh pr", "ooh pr", "ooh_pr"],
  btl_trade_monthly: ["btl_trade_monthly", "btl trade monthly"],
};

// The weekly commentary sheet (see buildFullDatabaseWorkbook) — flat
// week/brand/field/value rows rather than one row per record, so it's read
// separately from the collections above and rebuilt into the nested shape the
// report stores (src/lib/comments.ts).
const COMMENTS_SHEET_ALIASES = ["comments", "nhận định", "nhan dinh"];

// Sheets the full-database export writes that are deliberately NOT imported
// back: `users` carries account rows whose real source of truth is the user
// manager (and whose password hashes the export omits) — silently upserting
// accounts from a spreadsheet is not something an offline data upload should
// ever do.
const IGNORED_KNOWN_SHEETS = ["users"];

function normalizeSheetName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

// What a parsed file turned out to contain, so the Control Panel can show it
// for confirmation before anything is merged into the database — an upload
// that quietly did nothing (wrong sheet names) and one that rewrote hundreds
// of rows used to look identical from the outside.
export interface ImportSummary {
  collections: { key: string; rows: number; sheet?: string }[];
  commentWeeks: string[];
  commentEntries: number;
  ignoredSheets: string[];
}

export interface ParsedImport {
  // Shaped exactly like the offline JSON upload — handed straight to
  // POST /api/sync-data.
  data: Record<string, any>;
  summary: ImportSummary;
}

// Summarizes an already-parsed object (the .json upload path, which has no
// sheets to report on) using the same shape as the spreadsheet path so the
// preview UI only has one thing to render.
export function summarizeParsedData(data: any): ImportSummary {
  const collections: { key: string; rows: number }[] = [];
  Object.keys(SPREADSHEET_COLLECTION_ALIASES).forEach((key) => {
    if (Array.isArray(data?.[key])) collections.push({ key, rows: data[key].length });
  });

  const comments: CommentsTree = data?.comments || {};
  const commentWeeks = Object.keys(comments);
  const commentEntries = commentWeeks.reduce((sum, week) => sum + Object.keys(comments[week] || {}).length, 0);

  return { collections, commentWeeks, commentEntries, ignoredSheets: [] };
}

// Parses a workbook already in memory — shared by parseSpreadsheetFile below
// (the browser upload path, which only has a File to read) and
// src/server/spreadsheetSync.ts (the automatic weekly pull, which only has a
// fetch() response body — no File/browser APIs available in a Vercel
// function). Pure/isomorphic like buildFullDatabaseWorkbook elsewhere in this
// file: no browser or Node-specific API, just XLSX.read over bytes already in
// hand, so the exact same sheet-matching logic runs on both sides without a
// second implementation to keep in sync. Sheets are matched by name (see
// aliases above); any sheet that doesn't match a known collection is ignored
// rather than guessed at.
export function parseWorkbookFromBuffer(buffer: ArrayBuffer | Uint8Array): ParsedImport {
  const workbook = XLSX.read(buffer, { type: "array" });

  const sheetByNormalizedName = new Map<string, string>();
  workbook.SheetNames.forEach((name) => {
    sheetByNormalizedName.set(normalizeSheetName(name), name);
  });

  const data: Record<string, any> = {};
  const collections: { key: string; rows: number; sheet: string }[] = [];
  const usedSheetNames = new Set<string>();

  Object.entries(SPREADSHEET_COLLECTION_ALIASES).forEach(([key, aliases]) => {
    const matchedSheetName = aliases
      .map((alias) => sheetByNormalizedName.get(normalizeSheetName(alias)))
      .find((n): n is string => Boolean(n));
    if (matchedSheetName) {
      const sheet = workbook.Sheets[matchedSheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true }) as any[];
      data[key] = rows;
      collections.push({ key, rows: rows.length, sheet: matchedSheetName });
      usedSheetNames.add(matchedSheetName);
    }
  });

  // Weekly commentary — the same sheet the full-database export writes, read
  // back into the nested shape the report stores, so an exported workbook is
  // a true editable template for the weekly write-up too and not just for the
  // numbers.
  const commentsSheetName = COMMENTS_SHEET_ALIASES.map((alias) => sheetByNormalizedName.get(normalizeSheetName(alias))).find(
    (n): n is string => Boolean(n)
  );
  let commentWeeks: string[] = [];
  let commentEntries = 0;
  if (commentsSheetName) {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[commentsSheetName], { defval: null, raw: false }) as any[];
    const tree = commentRowsToTree(rows);
    commentWeeks = Object.keys(tree);
    commentEntries = commentWeeks.reduce((sum, week) => sum + Object.keys(tree[week] || {}).length, 0);
    if (commentWeeks.length > 0) data.comments = tree;
    usedSheetNames.add(commentsSheetName);
  }

  const ignoredSheets = workbook.SheetNames.filter(
    (name) => !usedSheetNames.has(name) && !IGNORED_KNOWN_SHEETS.includes(normalizeSheetName(name))
  );

  if (Object.keys(data).length === 0) {
    throw new Error(
      `Không tìm thấy sheet nào khớp với các mảng dữ liệu đã biết (digital_marketing, kol_koc, btl_trade, monthly_ooh_pr, btl_trade_monthly, comments). ` +
      `Các sheet có trong tệp: ${workbook.SheetNames.join(", ") || "(không có)"}`
    );
  }

  return { data, summary: { collections, commentWeeks, commentEntries, ignoredSheets } };
}

// Reads an uploaded .xlsx/.xls/.csv file and returns a plain object shaped
// like { digital_marketing: [...], kol_koc: [...], ... } — the same shape
// the offline JSON upload already produces — so it can be handed to the
// exact same merge/sync codepath (POST /api/sync-data) without a separate
// import pipeline. Thin File→ArrayBuffer wrapper around parseWorkbookFromBuffer.
export async function parseSpreadsheetFile(file: File): Promise<ParsedImport> {
  const buffer = await file.arrayBuffer();
  return parseWorkbookFromBuffer(buffer);
}

function escapeXML(str: any): string {
  if (str === null || str === undefined) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function exportToExcel(data: any) {
  const sheets = [
    {
      name: "Digital Marketing",
      headers: [
        "Tuần", "Phân loại thời gian", "Thương hiệu", "Nhóm báo cáo",
        "Hạng mục", "Ngành hàng", "Kênh (channel)", "Chỉ số (metric)",
        "Mục tiêu (target)", "Thực tế (actual)", "Target tháng", "Tích lũy tháng"
      ],
      keys: [
        "week", "phân_loại_thời_gian", "brand", "nhóm_báo_cáo",
        "hạng_mục", "ngành_hàng", "kênh_channel", "chỉ_số_metric",
        "mục_tiêu_target", "thực_tế_actual", "target_tháng", "tích_lũy_tháng"
      ],
      rows: data.digital_marketing || []
    },
    {
      name: "KOL KOC",
      headers: [
        "Tuần", "Thương hiệu", "Hạng mục", "Ngành hàng", "Kênh (channel)",
        "Chỉ số (metric)", "KPI toàn chiến dịch", "Thực tế trong tuần", "Tích lũy chiến dịch"
      ],
      keys: [
        "week", "brand", "hạng_mục", "ngành_hàng", "kênh_channel",
        "chỉ_số_metric", "kpi_toàn_chiến_dịch", "thực_tế_trong_tuần", "tích_lũy_chiến_dịch"
      ],
      rows: data.kol_koc || []
    },
    {
      name: "BTL Trade",
      headers: [
        "Tuần", "Thương hiệu", "Hạng mục lớn", "Chi tiết hạng mục", "Phân loại",
        "Tần suất", "Đơn vị tính", "Thực hiện tháng", "Kế hoạch tháng", "Tích lũy tháng"
      ],
      keys: [
        "week", "brand", "hạng_mục_lớn", "chi_tiết_hạng_mục", "phân_loại",
        "tần_suất", "đơn_vị_tính", "thực_hiện_tháng", "kế_hoạch_tháng", "tích_lũy_tháng"
      ],
      rows: data.btl_trade || []
    },
    {
      name: "Monthly OOH PR",
      headers: [
        "Tuần", "Tháng báo cáo", "Hạng mục", "Thương hiệu", "Ngành hàng",
        "Kênh (channel)", "Chỉ số (metric)", "Mục tiêu (target)", "Thực tế (actual)"
      ],
      keys: [
        "week", "tháng_báo_cáo", "hạng_mục", "brand", "ngành_hàng",
        "kênh_channel", "chỉ_số_metric", "mục_tiêu_target", "thực_tế_actual"
      ],
      rows: data.monthly_ooh_pr || []
    }
  ];

  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>Marketing Dashboard</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
`;

  sheets.forEach(sheet => {
    xml += `  <Worksheet ss:Name="${escapeXML(sheet.name)}">
    <Table>
      <Row ss:Height="22">
`;
    sheet.headers.forEach(h => {
      xml += `        <Cell><Data ss:Type="String">${escapeXML(h)}</Data></Cell>\n`;
    });
    xml += `      </Row>\n`;

    sheet.rows.forEach((row: any) => {
      xml += `      <Row>\n`;
      sheet.keys.forEach(k => {
        const val = row[k];
        const isNum = typeof val === "number" && val !== null;
        const typeAttr = isNum ? 'ss:Type="Number"' : 'ss:Type="String"';
        const displayVal = val === null || val === undefined ? "" : val;
        xml += `        <Cell><Data ${typeAttr}>${escapeXML(displayVal)}</Data></Cell>\n`;
      });
      xml += `      </Row>\n`;
    });

    xml += `    </Table>
  </Worksheet>\n`;
  });

  xml += `</Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `marketing_database_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToJSON(data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `marketing_database_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface FullDatabaseExportPayload {
  digital_marketing: any[];
  kol_koc: any[];
  btl_trade: any[];
  monthly_ooh_pr: any[];
  btl_trade_monthly: any[];
  // { [week]: { [brand]: BrandComments } } — flattened into one row per field.
  comments?: Record<string, any>;
  // Safe fields only — never pass passwordHash/salt here.
  users?: { username: string; name: string; role: string }[];
}

// Builds the full-database workbook (SheetJS WorkBook object) — one sheet
// per collection, covering everything the old exportToExcel above left out
// (btl_trade_monthly, comments, users). Row object keys are used as-is for
// headers, which is why they double as a round-trippable upload template
// for parseSpreadsheetFile above. Pure/isomorphic (no browser APIs), so the
// weekly email backup (src/server/backupMailer.ts) reuses this exact same
// sheet layout instead of maintaining a second copy server-side.
export function buildFullDatabaseWorkbook(payload: FullDatabaseExportPayload): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  const addSheet = (name: string, rows: any[]) => {
    const sheet = XLSX.utils.json_to_sheet(rows && rows.length > 0 ? rows : [{}]);
    XLSX.utils.book_append_sheet(workbook, sheet, name.slice(0, 31));
  };

  addSheet("digital_marketing", payload.digital_marketing || []);
  addSheet("kol_koc", payload.kol_koc || []);
  addSheet("btl_trade", payload.btl_trade || []);
  addSheet("monthly_ooh_pr", payload.monthly_ooh_pr || []);
  addSheet("btl_trade_monthly", payload.btl_trade_monthly || []);

  if (payload.comments) {
    const commentRows: { week: string; brand: string; field: string; value: string }[] = [];
    Object.entries(payload.comments).forEach(([week, byBrand]: [string, any]) => {
      Object.entries(byBrand || {}).forEach(([brand, c]: [string, any]) => {
        commentRows.push({ week, brand, field: "evaluation", value: c?.evaluation || "" });
        commentRows.push({ week, brand, field: "proposals", value: c?.proposals || "" });
        Object.entries(c?.categories || {}).forEach(([cat, value]: [string, any]) => {
          commentRows.push({ week, brand, field: `category_${cat}`, value: value || "" });
        });
      });
    });
    addSheet("comments", commentRows);
  }

  if (payload.users) {
    addSheet(
      "users",
      payload.users.map((u) => ({ username: u.username, name: u.name, role: u.role }))
    );
  }

  return workbook;
}

// Full-database export (task: "xuất excel database hiện có") — downloads
// buildFullDatabaseWorkbook's output as a .xlsx file in the browser.
export function exportFullDatabaseToExcel(payload: FullDatabaseExportPayload) {
  const workbook = buildFullDatabaseWorkbook(payload);
  XLSX.writeFile(workbook, `marketing_database_full_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
