// ---------------------------------------------------------------------------
// Automatic weekly pull of the weekly-report spreadsheet — the scheduled
// counterpart to the manual "Nhập liệu" upload in the Control Panel. An
// Admin/Editor pastes a shareable Google Sheets/Drive link once; from then on
// GET /api/cron/weekly-spreadsheet-sync (Vercel Cron, Monday ~12:00 ICT — see
// vercel.json) fetches that same link, parses it with the exact same sheet
// logic the manual upload uses (parseWorkbookFromBuffer, src/lib/export.ts),
// and merges it through the exact same database merge
// (mergeNewDataIntoDatabase, dataMerge.ts) a human upload goes through — so
// there is exactly one definition of "how a spreadsheet becomes report data"
// on either path.
//
// No OAuth, no Google API client library (this project's established
// no-heavy-SDK convention — see ONBOARDING.md): the link only needs to be
// shared "Anyone with the link can view", same requirement fetch-drive
// (JSON-only, ad hoc) already asks of the user for the same reason.
//
// Config (the URL + on/off + last-run status) lives inside the same app_state
// JSONB blob every other single-object config in this app uses (mail_config
// is the template) — no dedicated table, since there is exactly one of these
// per deployment, not a per-item collection like fb_pages.
// ---------------------------------------------------------------------------
import { getDatabaseData, saveDatabaseData } from "./appStateStore";
import { parseWorkbookFromBuffer, ImportSummary } from "../lib/export";
import { mergeNewDataIntoDatabase } from "./dataMerge";

export interface SpreadsheetSyncConfig {
  url: string;
  is_active: boolean;
  last_synced_at: string | null;
  last_sync_error: string | null;
  last_sync_summary: ImportSummary | null;
}

const EMPTY_CONFIG: SpreadsheetSyncConfig = {
  url: "",
  is_active: true,
  last_synced_at: null,
  last_sync_error: null,
  last_sync_summary: null,
};

export async function getSpreadsheetSyncConfig(): Promise<SpreadsheetSyncConfig> {
  const store = await getDatabaseData();
  return { ...EMPTY_CONFIG, ...(store.spreadsheet_sync_config || {}) };
}

export async function saveSpreadsheetSyncConfig(input: { url: string; is_active: boolean }): Promise<void> {
  const store = await getDatabaseData();
  const existing: SpreadsheetSyncConfig = { ...EMPTY_CONFIG, ...(store.spreadsheet_sync_config || {}) };
  store.spreadsheet_sync_config = {
    ...existing,
    url: input.url.trim(),
    is_active: input.is_active,
    // A new/changed link is unproven until it actually runs — clear the
    // stale status from whatever link was there before rather than showing
    // an old success/error next to a URL it no longer describes.
    last_synced_at: null,
    last_sync_error: null,
    last_sync_summary: null,
  };
  await saveDatabaseData(store);
}

async function setSyncStatus(status: Partial<Pick<SpreadsheetSyncConfig, "last_synced_at" | "last_sync_error" | "last_sync_summary">>): Promise<void> {
  const store = await getDatabaseData();
  const existing: SpreadsheetSyncConfig = { ...EMPTY_CONFIG, ...(store.spreadsheet_sync_config || {}) };
  store.spreadsheet_sync_config = { ...existing, ...status };
  await saveDatabaseData(store);
}

// A response body that's actually an XLSX ZIP archive always starts with the
// "PK" local-file-header signature; a Google login/permission-denied page (or
// any other HTML error page a misconfigured link might return) does not.
// Cheaper and more reliable than sniffing Content-Type, which Google doesn't
// always set helpfully for these endpoints.
function looksLikeXlsx(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

// Resolves whatever link an Admin pasted into a directly-fetchable URL that
// returns raw XLSX bytes:
//   - a Google Sheets link (docs.google.com/spreadsheets/d/<id>/...) exports
//     the whole multi-sheet workbook as one .xlsx, which is exactly the shape
//     parseWorkbookFromBuffer expects (one sheet per collection);
//   - a Google Drive-hosted file link (drive.google.com/file/d/<id>/... or a
//     bare "id=<id>" link) downloads that file directly — the same endpoint
//     GET /api/fetch-drive already uses for JSON, just returning bytes here
//     instead of being JSON.parse'd;
//   - anything else is assumed to already be a direct link to the file (e.g.
//     company-hosted .xlsx) and is fetched as-is.
function resolveDownloadUrl(sourceUrl: string): string {
  const sheetsMatch = sourceUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetsMatch) {
    return `https://docs.google.com/spreadsheets/d/${sheetsMatch[1]}/export?format=xlsx`;
  }

  const driveFileMatch = sourceUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const driveIdMatch = sourceUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveFileMatch || driveIdMatch) {
    const fileId = (driveFileMatch || driveIdMatch)![1];
    return `https://docs.google.com/uc?export=download&id=${fileId}`;
  }

  return sourceUrl;
}

export interface SpreadsheetSyncRunResult {
  skipped: boolean;
  reason?: string;
  summary?: ImportSummary;
}

// Shared by the manual "Đồng bộ thử ngay" button (Admin/Editor, tests a link
// right after saving it) and the Monday cron. Never throws for a
// business-as-usual "nothing to do" case (no link configured, or the toggle
// is off) — those come back as `skipped` so callers can render them the same
// way, not as an error.
export async function runSpreadsheetAutoSync(): Promise<SpreadsheetSyncRunResult> {
  const config = await getSpreadsheetSyncConfig();
  if (!config.url) {
    return { skipped: true, reason: "Chưa cấu hình link spreadsheet." };
  }
  if (!config.is_active) {
    return { skipped: true, reason: "Tự động đồng bộ spreadsheet đang tắt (is_active=false)." };
  }

  try {
    const downloadUrl = resolveDownloadUrl(config.url);
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Tải tệp trả về mã lỗi HTTP ${response.status} ${response.statusText}`);
    }
    const buffer = new Uint8Array(await response.arrayBuffer());

    if (!looksLikeXlsx(buffer)) {
      throw new Error(
        "Tải về thành công nhưng nội dung không phải tệp Excel (.xlsx) hợp lệ — có thể link chưa ở chế độ " +
        "\"Anyone with the link\"/\"Bất kỳ ai có đường link\", nên Google trả về trang đăng nhập/xin quyền thay vì tệp."
      );
    }

    const { data, summary } = parseWorkbookFromBuffer(buffer);
    await mergeNewDataIntoDatabase(data);
    await setSyncStatus({ last_synced_at: new Date().toISOString(), last_sync_error: null, last_sync_summary: summary });
    return { skipped: false, summary };
  } catch (err: any) {
    const message = err?.message || String(err);
    // last_synced_at is "last time this actually succeeded", not "last
    // attempt" — a failed run must never overwrite it, same convention
    // facebookSync.ts's setFbPageSyncStatus follows, so the Control Panel
    // keeps showing when data was last genuinely refreshed even while a link
    // has been failing for several runs in a row.
    await setSyncStatus({ last_sync_error: message }).catch(() => {});
    throw new Error(message);
  }
}
