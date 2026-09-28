// ---------------------------------------------------------------------------
// Storage layer for the Technical SEO Monitor (Website Report → SEO Tools —
// see technicalSeoSync.ts for the actual crawl/PageSpeed/GSC Sitemaps logic).
// One row per (account_id, check_type, url), upserted every run — this is a
// "current state" table like fb_pages, not a growing time series like
// ads_performance: what matters is "is this URL broken/slow/unindexed RIGHT
// NOW", not a full history of every past check. `first_detected_at` is the
// one field that's deliberately NOT overwritten on every upsert (see
// upsertTechnicalSeoChecks) so an alert can say "broken for 12 days" instead
// of just "checked today".
//
// Same production-vs-local split as backlinkStore.ts/adsPerformanceStore.ts.
// ---------------------------------------------------------------------------
import { supabase, isSupabaseConfigured, fetchAllRows } from "./supabaseClient";
import { getDatabaseData, saveDatabaseData } from "./appStateStore";

export type TechnicalSeoCheckType = "broken_link" | "pagespeed" | "sitemap";
export type TechnicalSeoStatus = "ok" | "error" | "warning";

export interface TechnicalSeoCheck {
  account_id: string; // google_website_accounts.id — ties the check to a brand's site
  check_type: TechnicalSeoCheckType;
  url: string;
  status: TechnicalSeoStatus;
  details: Record<string, unknown>; // shape depends on check_type — see technicalSeoSync.ts
  first_detected_at: string; // set once, kept across upserts
  checked_at: string;
}

function checkKey(r: Pick<TechnicalSeoCheck, "account_id" | "check_type" | "url">): string {
  return `${r.account_id}|${r.check_type}|${r.url}`;
}

async function readLocal(): Promise<{ store: any; checks: TechnicalSeoCheck[] }> {
  const store = await getDatabaseData();
  return { store, checks: Array.isArray(store.technical_seo_checks) ? store.technical_seo_checks : [] };
}

async function writeLocal(store: any, checks: TechnicalSeoCheck[]): Promise<void> {
  await saveDatabaseData({ ...store, technical_seo_checks: checks });
}

export async function getTechnicalSeoChecks(accountIds: string[]): Promise<TechnicalSeoCheck[]> {
  if (accountIds.length === 0) return [];

  if (!isSupabaseConfigured) {
    const { checks } = await readLocal();
    const idSet = new Set(accountIds);
    return checks.filter((c) => idSet.has(c.account_id));
  }

  const rows = await fetchAllRows<TechnicalSeoCheck>((from, to) =>
    supabase.from("technical_seo_checks").select("*").in("account_id", accountIds).range(from, to)
  ).catch((err: any) => {
    throw new Error(`Lỗi đọc kết quả Technical SEO Monitor: ${err.message}`);
  });
  return rows;
}

// Preserves each row's original first_detected_at across repeated upserts —
// callers pass "now" for every row regardless of whether it's actually new,
// and this fills in the real value for anything that already existed.
export async function upsertTechnicalSeoChecks(rows: TechnicalSeoCheck[]): Promise<void> {
  if (rows.length === 0) return;

  if (!isSupabaseConfigured) {
    const { store, checks } = await readLocal();
    const byKey = new Map(checks.map((c) => [checkKey(c), c]));
    for (const row of rows) {
      const existing = byKey.get(checkKey(row));
      byKey.set(checkKey(row), { ...row, first_detected_at: existing?.first_detected_at || row.first_detected_at });
    }
    await writeLocal(store, Array.from(byKey.values()));
    return;
  }

  const existing = await fetchAllRows<Pick<TechnicalSeoCheck, "account_id" | "check_type" | "url" | "first_detected_at">>((from, to) =>
    supabase
      .from("technical_seo_checks")
      .select("account_id,check_type,url,first_detected_at")
      .in(
        "account_id",
        Array.from(new Set(rows.map((r) => r.account_id)))
      )
      .range(from, to)
  ).catch(() => [] as any[]);
  const existingByKey = new Map<string, string>(existing.map((e) => [checkKey(e), e.first_detected_at] as [string, string]));

  const toUpsert = rows.map((row) => ({
    ...row,
    first_detected_at: existingByKey.get(checkKey(row)) || row.first_detected_at,
  }));

  const { error } = await supabase.from("technical_seo_checks").upsert(toUpsert, { onConflict: "account_id,check_type,url" });
  if (error) throw new Error(`Lỗi lưu kết quả Technical SEO Monitor: ${error.message}`);
}

// Drops rows that weren't part of this run's URL set for a given
// account+check_type — e.g. a URL removed from the sitemap, or a sitemap
// entry no longer submitted in Search Console. Without this, a fixed/removed
// URL would keep showing up (and re-alerting) forever.
export async function pruneStaleTechnicalSeoChecks(accountId: string, checkType: TechnicalSeoCheckType, currentUrls: string[]): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, checks } = await readLocal();
    const currentSet = new Set(currentUrls);
    const next = checks.filter((c) => !(c.account_id === accountId && c.check_type === checkType && !currentSet.has(c.url)));
    await writeLocal(store, next);
    return;
  }

  let query = supabase.from("technical_seo_checks").delete().eq("account_id", accountId).eq("check_type", checkType);
  if (currentUrls.length > 0) query = query.not("url", "in", `(${currentUrls.map((u) => `"${u.replace(/"/g, '\\"')}"`).join(",")})`);
  const { error } = await query;
  if (error) console.error(`pruneStaleTechnicalSeoChecks lỗi (${accountId}/${checkType}):`, error.message);
}
