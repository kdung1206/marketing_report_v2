// ---------------------------------------------------------------------------
// GitHub-backed data sync
// ---------------------------------------------------------------------------
// This module is used as a FALLBACK data store whenever the app cannot reach
// the Express backend (server.ts) — most notably when deployed as a static
// site on GitHub Pages, which cannot run any server-side code at all.
//
// Instead of only writing to the local browser's localStorage (which is what
// happened before, and which is why Admin's edits never reached Viewers),
// we read and write the shared database file (src/db_store.json) directly
// in this GitHub repository, using the GitHub REST "Contents" API. Every
// save becomes a small commit; every read (including the periodic polling
// that already exists in App.tsx) picks up the latest committed version.
//
// SECURITY NOTE
// -------------
// GitHub Pages is 100% static: there is no server to keep a secret on. That
// means the GitHub token configured below is bundled into the shipped
// JavaScript and can be extracted by anyone who opens dev tools. To keep the
// blast radius small:
//   1. Create a *fine-grained* Personal Access Token
//      (https://github.com/settings/personal-access-tokens/new)
//   2. Restrict it to ONLY this one repository ("Only select repositories")
//   3. Grant ONLY the "Contents: Read and write" repository permission
//      (nothing else — no Actions, no Admin, no other repos)
//   4. Rotate it periodically, and immediately if you suspect it leaked.
// With those settings, a leaked token can at worst let someone push commits
// to this single report repo — it cannot touch your account, other repos,
// or anything outside "Contents" of this repo.
// ---------------------------------------------------------------------------

import { normalizeMarketingData, getBtlReportMonth, RAW_INITIAL_DATA } from "../data";

const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER || "";
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || "";
const GITHUB_BRANCH = import.meta.env.VITE_GITHUB_BRANCH || "main";
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || "";
const GITHUB_DATA_PATH = import.meta.env.VITE_GITHUB_DATA_PATH || "src/db_store.json";

export function isGithubSyncConfigured(): boolean {
  return Boolean(GITHUB_OWNER && GITHUB_REPO && GITHUB_TOKEN);
}

const contentsUrl = () =>
  `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}`;

// --- UTF-8 safe base64 helpers (Vietnamese text needs this, plain btoa/atob don't handle it) ---
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// --- ETag cache: a conditional GET that returns "304 Not Modified" does NOT
// count against the GitHub API rate limit, so frequent polling (every few
// seconds for Viewers) stays cheap. ---
let cachedEtag: string | null = null;
let cachedRaw: any | null = null;
let cachedSha: string | null = null;

async function readDbFromGithub(): Promise<{ raw: any; sha: string }> {
  if (!isGithubSyncConfigured()) {
    throw new Error("GitHub sync chưa được cấu hình (thiếu VITE_GITHUB_OWNER/VITE_GITHUB_REPO/VITE_GITHUB_TOKEN).");
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  };
  if (cachedEtag) headers["If-None-Match"] = cachedEtag;

  const res = await fetch(`${contentsUrl()}?ref=${GITHUB_BRANCH}`, { headers });

  if (res.status === 304 && cachedRaw && cachedSha) {
    return { raw: cachedRaw, sha: cachedSha };
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Lỗi đọc dữ liệu từ GitHub (${res.status}): ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  const raw = JSON.parse(base64ToUtf8(json.content));
  cachedEtag = res.headers.get("ETag");
  cachedRaw = raw;
  cachedSha = json.sha;
  return { raw, sha: json.sha };
}

async function writeDbToGithub(raw: any, sha: string, message: string): Promise<void> {
  const res = await fetch(contentsUrl(), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: utf8ToBase64(JSON.stringify(raw, null, 2)),
      sha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 409) {
      // Someone else committed in between our read and our write. Invalidate
      // the cache so the next read/write picks up the true latest version,
      // then surface a clear message so the caller can retry.
      cachedEtag = null;
      throw new Error("Có người khác vừa lưu dữ liệu cùng lúc. Vui lòng thử lại (dữ liệu mới nhất sẽ được tải lại).");
    }
    throw new Error(`Lỗi lưu dữ liệu lên GitHub (${res.status}): ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  cachedEtag = null; // Force a fresh read next time; simplest way to stay correct.
  cachedRaw = raw;
  cachedSha = json.content?.sha || null;
}

async function commitDbUpdate(mutate: (raw: any) => any, message: string): Promise<any> {
  const { raw, sha } = await readDbFromGithub();
  const updatedRaw = mutate(raw);
  await writeDbToGithub(updatedRaw, sha, message);
  return updatedRaw;
}

// --------------------------------------------------------------------------
// High-level operations. Each one mirrors the shape of the matching
// server.ts REST endpoint, so App.tsx can use them as drop-in replacements.
// --------------------------------------------------------------------------

export async function githubGetData() {
  const { raw } = await readDbFromGithub();
  return {
    success: true,
    data: normalizeMarketingData(raw),
    comments: raw.comments || {},
    activeState: raw.active_state || null,
  };
}

export async function githubSaveActiveState(
  selectedBrand: string,
  selectedTimelineId: string,
  activeCategoryTab: string
) {
  await commitDbUpdate((raw) => {
    raw.active_state = {
      selectedBrand,
      selectedTimelineId,
      activeCategoryTab,
      updatedAt: new Date().toISOString(),
    };
    return raw;
  }, "chore: sync active view state [skip ci]");
  return { success: true };
}

export async function githubSaveComments(week: string, comments: any) {
  await commitDbUpdate((raw) => {
    if (!raw.comments) raw.comments = {};
    raw.comments[week] = comments;
    return raw;
  }, `chore: update comments for ${week} [skip ci]`);
  return { success: true };
}

export async function githubSaveRawData(data: any) {
  const updatedRaw = await commitDbUpdate((raw) => {
    raw.digital_marketing = data.digital_marketing || [];
    raw.kol_koc = data.kol_koc || [];
    raw.btl_trade = data.btl_trade || [];
    raw.monthly_ooh_pr = data.monthly_ooh_pr || [];
    if (!raw.btl_trade_monthly) raw.btl_trade_monthly = [];

    // Mirrors server.ts /api/save-raw-data: roll weekly btl_trade "thực_hiện_tháng"
    // values back into the monthly summary table.
    raw.btl_trade.forEach((row: any) => {
      const info = getBtlReportMonth(row.week || "");
      const lastMonth = info.month === 1 ? 12 : info.month - 1;
      const lastYear = info.month === 1 ? info.year - 1 : info.year;
      const val = row.thực_hiện_tháng;
      if (val !== undefined && val !== null) {
        const match = raw.btl_trade_monthly.find((m: any) =>
          m.month === lastMonth &&
          m.year === lastYear &&
          (m.brand || "").toLowerCase() === (row.brand || "").toLowerCase() &&
          (m.hạng_mục_lớn || "").toLowerCase() === (row.hạng_mục_lớn || "").toLowerCase() &&
          (m.chi_tiết_hạng_mục || "").toLowerCase() === (row.chi_tiết_hạng_mục || "").toLowerCase() &&
          (m.phân_loại || "").toString().toLowerCase() === (row.phân_loại || "").toString().toLowerCase() &&
          (m.tần_suất || "").toLowerCase() === (row.tần_suất || "").toLowerCase() &&
          (m.đơn_vị_tính || "").toLowerCase() === (row.đơn_vị_tính || "").toLowerCase()
        );
        if (match) {
          match.thực_hiện_tháng = Number(val);
        } else {
          raw.btl_trade_monthly.push({
            month: lastMonth,
            year: lastYear,
            brand: row.brand,
            hạng_mục_lớn: row.hạng_mục_lớn,
            chi_tiết_hạng_mục: row.chi_tiết_hạng_mục,
            phân_loại: row.phân_loại,
            tần_suất: row.tần_suất,
            đơn_vị_tính: row.đơn_vị_tính,
            thực_hiện_tháng: Number(val),
          });
        }
      }
    });

    if (data.btl_trade_monthly) raw.btl_trade_monthly = data.btl_trade_monthly;
    return raw;
  }, "chore: update raw marketing data (row edit/delete) [skip ci]");

  return { success: true, data: normalizeMarketingData(updatedRaw) };
}

export async function githubSyncData(newData: any) {
  const updatedRaw = await commitDbUpdate((raw) => {
    const normalizedNew = normalizeMarketingData(newData);
    const currentDb = normalizeMarketingData(raw);

    function mergeRowsByKey<T>(currentList: T[], newList: T[], keyFn: (row: T) => string): T[] {
      if (!newList || newList.length === 0) return currentList;
      const map = new Map<string, T>();
      currentList.forEach((row) => map.set(keyFn(row), row));
      newList.forEach((row) => map.set(keyFn(row), row));
      return Array.from(map.values());
    }

    const getDigitalKey = (row: any): string =>
      [row.week, row.brand, row.nhóm_báo_cáo, row.hạng_mục, row.ngành_hàng, row.kênh_channel, row.chỉ_số_metric]
        .map((v) => (v || "").toString().trim().toLowerCase()).join("|");
    const getKolKey = (row: any): string =>
      [row.week, row.brand, row.hạng_mục, row.ngành_hàng, row.kênh_channel, row.chỉ_số_metric]
        .map((v) => (v || "").toString().trim().toLowerCase()).join("|");
    const getBtlKey = (row: any): string =>
      [row.week, row.brand, row.hạng_mục_lớn, row.chi_tiết_hạng_mục, row.phân_loại, row.tần_suất, row.đơn_vị_tính]
        .map((v) => (v || "").toString().trim().toLowerCase()).join("|");
    const getOohPrKey = (row: any): string =>
      [row.week, row.tháng_báo_cáo, row.hạng_mục, row.brand, row.ngành_hàng, row.kênh_channel, row.chỉ_số_metric]
        .map((v) => (v || "").toString().trim().toLowerCase()).join("|");
    const getBtlMonthlyKey = (row: any): string =>
      [row.month ?? 5, row.year ?? 2026, row.brand, row.hạng_mục_lớn, row.chi_tiết_hạng_mục, row.phân_loại, row.tần_suất, row.đơn_vị_tính]
        .map((v) => (v ?? "").toString().trim().toLowerCase()).join("|");

    raw.digital_marketing = mergeRowsByKey(currentDb.digital_marketing, normalizedNew.digital_marketing, getDigitalKey);
    raw.kol_koc = mergeRowsByKey(currentDb.kol_koc, normalizedNew.kol_koc, getKolKey);
    raw.btl_trade = mergeRowsByKey(currentDb.btl_trade, normalizedNew.btl_trade, getBtlKey);
    raw.monthly_ooh_pr = mergeRowsByKey(currentDb.monthly_ooh_pr, normalizedNew.monthly_ooh_pr, getOohPrKey);
    raw.btl_trade_monthly = mergeRowsByKey(raw.btl_trade_monthly || [], normalizedNew.btl_trade_monthly || [], getBtlMonthlyKey);

    if (newData && newData.comments) {
      const mergedComments = { ...(raw.comments || {}) };
      Object.keys(newData.comments).forEach((weekKey) => {
        mergedComments[weekKey] = { ...(mergedComments[weekKey] || {}), ...newData.comments[weekKey] };
      });
      raw.comments = mergedComments;
    }

    return raw;
  }, "chore: sync/merge weekly report data [skip ci]");

  return { success: true, data: normalizeMarketingData(updatedRaw) };
}

export async function githubResetData() {
  const updatedRaw = await commitDbUpdate(() => JSON.parse(JSON.stringify(RAW_INITIAL_DATA)), "chore: reset data to defaults [skip ci]");
  return { success: true, data: normalizeMarketingData(updatedRaw) };
}
