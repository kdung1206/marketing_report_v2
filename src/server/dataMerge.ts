// ---------------------------------------------------------------------------
// The merge that turns a freshly-parsed data object (offline JSON/spreadsheet
// upload, or an automatic spreadsheet pull — see spreadsheetSync.ts) into the
// next full database snapshot. Extracted out of POST /api/sync-data in app.ts
// so the automatic weekly spreadsheet sync (GET /api/cron/weekly-spreadsheet-
// sync) can run the exact same merge a human-triggered upload does, rather
// than a second hand-maintained copy of these five key functions drifting out
// of sync with the real one.
// ---------------------------------------------------------------------------
import { normalizeMarketingData } from "../data";
import { getDatabaseData, saveDatabaseData } from "./appStateStore";
import { mergeCommentTrees } from "../lib/comments";

function mergeRowsByKey<T>(currentList: T[], newList: T[], keyFn: (row: T) => string): T[] {
  if (!newList || newList.length === 0) return currentList;
  const map = new Map<string, T>();
  currentList.forEach((row) => map.set(keyFn(row), row));
  newList.forEach((row) => map.set(keyFn(row), row));
  return Array.from(map.values());
}

const getDigitalKey = (row: any): string => {
  const week = (row.week || "").toString().trim().toLowerCase();
  const brand = (row.brand || "").toString().trim().toLowerCase();
  const nhom = (row.nhóm_báo_cáo || "").toString().trim().toLowerCase();
  const hm = (row.hạng_mục || "").toString().trim().toLowerCase();
  const nganh = (row.ngành_hàng || "").toString().trim().toLowerCase();
  const channel = (row.kênh_channel || "").toString().trim().toLowerCase();
  const metric = (row.chỉ_số_metric || "").toString().trim().toLowerCase();
  return `${week}|${brand}|${nhom}|${hm}|${nganh}|${channel}|${metric}`;
};

const getKolKey = (row: any): string => {
  const week = (row.week || "").toString().trim().toLowerCase();
  const brand = (row.brand || "").toString().trim().toLowerCase();
  const hm = (row.hạng_mục || "").toString().trim().toLowerCase();
  const nganh = (row.ngành_hàng || "").toString().trim().toLowerCase();
  const channel = (row.kênh_channel || "").toString().trim().toLowerCase();
  const metric = (row.chỉ_số_metric || "").toString().trim().toLowerCase();
  return `${week}|${brand}|${hm}|${nganh}|${channel}|${metric}`;
};

const getBtlKey = (row: any): string => {
  const week = (row.week || "").toString().trim().toLowerCase();
  const brand = (row.brand || "").toString().trim().toLowerCase();
  const hml = (row.hạng_mục_lớn || "").toString().trim().toLowerCase();
  const cthm = (row.chi_tiết_hạng_mục || "").toString().trim().toLowerCase();
  const pl = (row.phân_loại || "").toString().trim().toLowerCase();
  const ts = (row.tần_suất || "").toString().trim().toLowerCase();
  const dvt = (row.đơn_vị_tính || "").toString().trim().toLowerCase();
  return `${week}|${brand}|${hml}|${cthm}|${pl}|${ts}|${dvt}`;
};

const getOohPrKey = (row: any): string => {
  const week = (row.week || "").toString().trim().toLowerCase();
  const tbc = (row.tháng_báo_cáo || "").toString().trim().toLowerCase();
  const hm = (row.hạng_mục || "").toString().trim().toLowerCase();
  const brand = (row.brand || "").toString().trim().toLowerCase();
  const nganh = (row.ngành_hàng || "").toString().trim().toLowerCase();
  const channel = (row.kênh_channel || "").toString().trim().toLowerCase();
  const metric = (row.chỉ_số_metric || "").toString().trim().toLowerCase();
  return `${week}|${tbc}|${hm}|${brand}|${nganh}|${channel}|${metric}`;
};

const getBtlMonthlyKey = (row: any): string => {
  const month = (row.month || 5).toString();
  const year = (row.year || 2026).toString();
  const brand = (row.brand || "").toString().trim().toLowerCase();
  const hml = (row.hạng_mục_lớn || "").toString().trim().toLowerCase();
  const cthm = (row.chi_tiết_hạng_mục || "").toString().trim().toLowerCase();
  const pl = (row.phân_loại || "").toString().trim().toLowerCase();
  const ts = (row.tần_suất || "").toString().trim().toLowerCase();
  const dvt = (row.đơn_vị_tính || "").toString().trim().toLowerCase();
  return `${month}|${year}|${brand}|${hml}|${cthm}|${pl}|${ts}|${dvt}`;
};

// Loads the current database, merges `newData` into it exactly the way a
// manual offline upload does (dedupe-by-key per collection, deep-merge for
// weekly commentary — see mergeCommentTrees), persists the result, and
// returns it. Both POST /api/sync-data and runSpreadsheetAutoSync
// (spreadsheetSync.ts) call this so there is exactly one place that decides
// what "duplicate row" means per collection.
export async function mergeNewDataIntoDatabase(newData: any): Promise<any> {
  const normalizedNew = normalizeMarketingData(newData);
  const currentFullDb = await getDatabaseData();
  const currentDb = normalizeMarketingData(currentFullDb);

  const mergedComments = mergeCommentTrees(currentFullDb.comments, newData?.comments);

  const mergedData = {
    ...currentFullDb,
    digital_marketing: mergeRowsByKey(currentDb.digital_marketing, normalizedNew.digital_marketing, getDigitalKey),
    kol_koc: mergeRowsByKey(currentDb.kol_koc, normalizedNew.kol_koc, getKolKey),
    btl_trade: mergeRowsByKey(currentDb.btl_trade, normalizedNew.btl_trade, getBtlKey),
    monthly_ooh_pr: mergeRowsByKey(currentDb.monthly_ooh_pr, normalizedNew.monthly_ooh_pr, getOohPrKey),
    btl_trade_monthly: mergeRowsByKey(currentFullDb.btl_trade_monthly || [], normalizedNew.btl_trade_monthly || [], getBtlMonthlyKey),
    comments: mergedComments,
  };

  await saveDatabaseData(mergedData);
  return mergedData;
}
