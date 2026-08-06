/**
 * Client-side parsers for the Digital Ads Report's Google/TikTok manual
 * upload flow (Facebook is synced server-side via the Marketing API instead —
 * see src/server/facebookAdsSync.ts). Same "parse in the browser, POST
 * normalized JSON" pattern as src/lib/export.ts's parseSpreadsheetFile, just
 * with dedicated column mapping per export format instead of the weekly
 * report's named-sheet convention (these exports don't share that shape).
 *
 * Local type copies rather than importing from src/server/adsPerformanceStore
 * — this file ends up in the client bundle, and the rest of the codebase
 * (see FacebookInsights.tsx) already keeps frontend-side mirrors of
 * server-side row shapes instead of importing across the client/server
 * boundary.
 */
import * as XLSX from "xlsx";

export type AdsChannel = "facebook" | "google" | "tiktok";

export interface AdsPerformanceRow {
  channel: AdsChannel;
  brand: string | null;
  campaign_name: string;
  ad_group_name: string;
  ad_name: string;
  date: string; // YYYY-MM-DD
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  reach: number | null;
  frequency: number | null;
  video_views: number | null;
  conversions: number | null;
  extra: Record<string, unknown>;
}

// Handles both "1,234.5" (thousand separators) and Google's " --" empty-field
// placeholder — returns null rather than 0 for anything that isn't a real
// number, so a missing metric doesn't silently look like zero spend/clicks.
function toNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  const cleaned = String(raw).replace(/,/g, "").replace(/%/g, "").trim();
  if (cleaned === "" || cleaned === "-" || cleaned === "--") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function cleanText(raw: unknown): string {
  const s = raw === null || raw === undefined ? "" : String(raw).trim();
  return s === "--" || s === "-" ? "" : s;
}

// ads_performance's primary key is (channel, campaign_name, ad_group_name,
// ad_name, date) — coarser than one row per source line. Both real exports
// can have multiple distinct underlying ads collapse onto the same key
// within a single upload (confirmed against real files: Google Search ads
// frequently leave "Ad name"/"Image ad name" blank, so several different
// creatives in the same ad group/day all key identically; TikTok has a much
// smaller number of the same collision). Left unmerged, the upsert's
// "replace on matching key" semantics would silently keep only the LAST
// colliding row and discard the others' spend/clicks/etc. — merging by
// summing here, before upload, is what makes one uploaded row per key
// actually correct.
function mergeDuplicateKeys(rows: AdsPerformanceRow[]): AdsPerformanceRow[] {
  const byKey = new Map<string, AdsPerformanceRow>();
  for (const r of rows) {
    const key = `${r.channel}|${r.campaign_name}|${r.ad_group_name}|${r.ad_name}|${r.date}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...r });
      continue;
    }
    existing.spend = (existing.spend || 0) + (r.spend || 0);
    existing.impressions = (existing.impressions || 0) + (r.impressions || 0);
    existing.clicks = (existing.clicks || 0) + (r.clicks || 0);
    existing.reach = (existing.reach || 0) + (r.reach || 0);
    existing.video_views = (existing.video_views || 0) + (r.video_views || 0);
    existing.conversions = (existing.conversions || 0) + (r.conversions || 0);
    // Frequency isn't additive across merged rows (it's impressions/reach for
    // a given audience) — recompute from the merged totals instead of
    // summing/averaging the source rows' frequency values.
    existing.frequency = existing.reach ? (existing.impressions || 0) / existing.reach : null;
  }
  return Array.from(byKey.values());
}

// ---------------------------------------------------------------------------
// Google Ads Editor "Ads" export (tab-delimited, UTF-16LE with a BOM, 2
// preamble lines — brand name, then the date range — before the real header
// row). Confirmed against a real export (Livotec GG.csv): the header row is
// found by scanning for the first column literally named "Day" rather than
// assuming a fixed line number, since the number of preamble lines isn't
// documented and could vary by Ads Editor version.
// ---------------------------------------------------------------------------

// Same tab/quote-aware line parser Google Ads Editor's own export needs
// (fields containing a comma get quoted even though the delimiter is a tab —
// standard CSV quoting rules applied to a non-comma delimiter).
function parseDelimited(text: string, delim: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delim) {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // skip — \r\n line endings
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function decodeGoogleAdsExportText(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(buffer).replace(/^﻿/, "");
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(buffer).replace(/^﻿/, "");
  }
  return new TextDecoder("utf-8").decode(buffer).replace(/^﻿/, "");
}

export async function parseGoogleAdsExport(file: File, brand: string | null): Promise<AdsPerformanceRow[]> {
  const buffer = await file.arrayBuffer();
  const text = decodeGoogleAdsExportText(buffer);
  const rows = parseDelimited(text, "\t");

  const headerRowIndex = rows.findIndex((r) => r[0]?.trim() === "Day");
  if (headerRowIndex === -1) {
    throw new Error(
      "Không tìm thấy dòng tiêu đề (cột 'Day') — tệp này có đúng là bản xuất 'Ads' từ Google Ads Editor không?"
    );
  }
  const header = rows[headerRowIndex].map((h) => h.trim());
  const idx = (name: string) => header.indexOf(name);
  const col = {
    day: idx("Day"),
    campaignType: idx("Campaign type"),
    campaign: idx("Campaign"),
    adGroup: idx("Ad group"),
    adName: idx("Ad name"),
    imageAdName: idx("Image ad name"),
    cost: idx("Cost"),
    impr: idx("Impr."),
    clicks: idx("Clicks"),
    trueViewViews: idx("TrueView views"),
    conversions: idx("Conversions"),
    videoPlayed50: idx("Video played to 50%"),
  };
  if (col.day === -1 || col.campaign === -1 || col.cost === -1) {
    throw new Error("Thiếu cột bắt buộc (Day/Campaign/Cost) trong tệp Google Ads.");
  }

  const out: AdsPerformanceRow[] = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 2) continue;
    const date = (r[col.day] || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue; // skips blank/summary trailing rows

    const adName = cleanText(r[col.adName]) || cleanText(r[col.imageAdName]);
    out.push({
      channel: "google",
      brand,
      campaign_name: cleanText(r[col.campaign]),
      ad_group_name: cleanText(r[col.adGroup]),
      ad_name: adName,
      date,
      spend: toNumber(r[col.cost]),
      impressions: toNumber(r[col.impr]),
      clicks: toNumber(r[col.clicks]),
      reach: null, // not present in this export
      frequency: null, // not present in this export
      video_views: toNumber(r[col.trueViewViews]),
      conversions: toNumber(r[col.conversions]),
      extra: {
        campaign_type: cleanText(r[col.campaignType]) || null,
        video_played_to_50pct: toNumber(r[col.videoPlayed50]),
      },
    });
  }
  return mergeDuplicateKeys(out);
}

// ---------------------------------------------------------------------------
// TikTok Ads Manager export (single-sheet .xlsx, one row per ad/day — the
// richest of the three exports, no special encoding handling needed).
// ---------------------------------------------------------------------------

// A date column read via XLSX.utils.sheet_to_json comes back as either a
// plain "YYYY-MM-DD" string or an Excel date serial number, depending on how
// the exporting tool typed that cell (confirmed against real TikTok .xlsx
// and Facebook .csv exports — same ambiguity in both) — handle both rather
// than assuming one. Shared by parseTiktokAdsExport and parseFacebookAdsExport.
function normalizeExcelDateCell(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  if (typeof raw === "number") {
    const parsed = XLSX.SSF.parse_date_code(raw);
    if (!parsed) return null;
    const mm = String(parsed.m).padStart(2, "0");
    const dd = String(parsed.d).padStart(2, "0");
    return `${parsed.y}-${mm}-${dd}`;
  }
  return null;
}

export async function parseTiktokAdsExport(file: File, brand: string | null): Promise<AdsPerformanceRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Tệp TikTok Ads không có sheet nào.");
  const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null, raw: true });

  const out: AdsPerformanceRow[] = [];
  for (const row of json) {
    const date = normalizeExcelDateCell(row["By Day"]);
    if (!date) continue;

    out.push({
      channel: "tiktok",
      brand,
      campaign_name: cleanText(row["Campaign name"]),
      ad_group_name: cleanText(row["Ad group name"]),
      ad_name: cleanText(row["Ad name"]),
      date,
      spend: toNumber(row["Spend"]),
      impressions: toNumber(row["Impressions"]),
      clicks: toNumber(row["Clicks (destination)"]),
      reach: toNumber(row["Reach"]),
      frequency: toNumber(row["Frequency"]),
      video_views: toNumber(row["6-second video views"]),
      conversions: toNumber(row["Conversions"]),
      extra: {
        campaign_type: cleanText(row["Campaign type"]) || null,
        account_name: cleanText(row["Account name"]) || null,
      },
    });
  }
  return mergeDuplicateKeys(out);
}

// ---------------------------------------------------------------------------
// Facebook Ads Manager export (breakdown by day, .csv or .xlsx — both parse
// through XLSX.read, which auto-detects plain delimited text same as a real
// spreadsheet; confirmed against a real "facebook MKT-report.csv"). Manual
// fallback for periods outside the Marketing API sync's rolling 30-day
// window (see facebookAdsSync.ts) — e.g. backfilling months already outside
// that window without waiting on a long API backfill run.
//
// This export has no raw "clicks" column, only "CPC (cost per link click)" —
// clicks are derived as spend/CPC, which is specifically LINK clicks, not the
// same click definition the Marketing API sync's `clicks` field uses (that's
// Meta's broader "clicks" metric). Flagged in `extra` rather than silently
// conflated — a manually uploaded row and an API-synced row for the same
// campaign/day are both real, but not counting the identical thing.
// ---------------------------------------------------------------------------
export async function parseFacebookAdsExport(file: File, brand: string | null): Promise<AdsPerformanceRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Tệp Facebook Ads không có sheet nào.");
  const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null, raw: true });

  const out: AdsPerformanceRow[] = [];
  for (const row of json) {
    const date = normalizeExcelDateCell(row["Day"]);
    if (!date) continue;
    if (!cleanText(row["Campaign name"])) continue;

    const spend = toNumber(row["Amount spent (VND)"]);
    const cpc = toNumber(row["CPC (cost per link click)"]);
    const clicks = spend != null && cpc && cpc > 0 ? Math.round(spend / cpc) : null;

    out.push({
      channel: "facebook",
      brand,
      campaign_name: cleanText(row["Campaign name"]),
      ad_group_name: cleanText(row["Ad set name"]),
      ad_name: cleanText(row["Ad name"]),
      date,
      spend,
      impressions: toNumber(row["Impressions"]),
      clicks,
      reach: toNumber(row["Reach"]),
      frequency: toNumber(row["Frequency"]),
      video_views: toNumber(row["Video plays at 50%"]),
      conversions: toNumber(row["Leads"]),
      extra: {
        account_name: cleanText(row["Account name"]) || null,
        post_engagements: toNumber(row["Post engagements"]),
        three_second_video_plays: toNumber(row["3-second video plays"]),
        clicks_are_link_clicks_derived_from_cpc: true,
      },
    });
  }
  return mergeDuplicateKeys(out);
}
