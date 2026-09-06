// ---------------------------------------------------------------------------
// Storage layer for the Website Report module (GA4 + Search Console, see
// googleWebsiteSync.ts and the google_website_accounts/ga4_insights_daily/
// search_console_insights_daily routes in app.ts). Same production-vs-local
// split as youtubeStore.ts/tiktokStore.ts: production (Vercel,
// isSupabaseConfigured === true) uses the dedicated relational tables in
// supabase/schema.sql. Local dev has no real Supabase project to point at,
// so it stores the same three collections as extra arrays inside the
// existing local blob (src/db_store.json, via appStateStore's
// getDatabaseData/saveDatabaseData).
// ---------------------------------------------------------------------------
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { getDatabaseData, saveDatabaseData } from "./appStateStore";

export interface GoogleWebsiteAvailableProperty {
  id: string;
  name: string;
}

export interface GoogleWebsiteAccountConfig {
  id: string; // Google account id ("sub") — stable across reconnects
  google_account_email: string | null;
  brand: string | null;
  ga4_property_id: string | null; // null while pending selection
  ga4_property_name: string | null;
  ga4_available_properties: GoogleWebsiteAvailableProperty[] | null;
  gsc_site_url: string | null; // null while pending selection
  gsc_available_sites: string[] | null;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  access_token_expires_at: string;
  // Same "conservative estimate, not a Google-reported deadline" convention
  // as YoutubeAccountConfig in youtubeStore.ts — see that file's comment.
  refresh_token_expires_at: string | null;
  is_active: boolean; // false while pending property/site selection
  last_synced_at: string | null;
  last_sync_error: string | null;
  token_expired: boolean;
  expiry_alert_sent_at: string | null;
  urgent_alert_sent_at: string | null;
  created_at: string;
}

export interface Ga4InsightsDailyRow {
  account_id: string;
  date: string; // YYYY-MM-DD
  sessions: number | null;
  active_users: number | null;
  new_users: number | null;
  engaged_sessions: number | null;
  avg_engagement_time_seconds: number | null;
  conversions: number | null;
  bounce_rate: number | null;
}

export interface SearchConsoleInsightsDailyRow {
  account_id: string;
  date: string; // YYYY-MM-DD
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
}

// -- Local (src/db_store.json) helpers ---------------------------------------

async function readLocalCollections(): Promise<{
  store: any;
  google_website_accounts: GoogleWebsiteAccountConfig[];
  ga4_insights_daily: Ga4InsightsDailyRow[];
  search_console_insights_daily: SearchConsoleInsightsDailyRow[];
}> {
  const store = await getDatabaseData();
  return {
    store,
    google_website_accounts: Array.isArray(store.google_website_accounts) ? store.google_website_accounts : [],
    ga4_insights_daily: Array.isArray(store.ga4_insights_daily) ? store.ga4_insights_daily : [],
    search_console_insights_daily: Array.isArray(store.search_console_insights_daily) ? store.search_console_insights_daily : [],
  };
}

async function writeLocalCollections(
  store: any,
  updates: Partial<{
    google_website_accounts: GoogleWebsiteAccountConfig[];
    ga4_insights_daily: Ga4InsightsDailyRow[];
    search_console_insights_daily: SearchConsoleInsightsDailyRow[];
  }>
): Promise<void> {
  await saveDatabaseData({ ...store, ...updates });
}

// -- Accounts -----------------------------------------------------------------

export async function getGoogleWebsiteAccounts(): Promise<GoogleWebsiteAccountConfig[]> {
  if (!isSupabaseConfigured) {
    const { google_website_accounts } = await readLocalCollections();
    return google_website_accounts;
  }

  const { data, error } = await supabase.from("google_website_accounts").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(`Lỗi đọc danh sách kết nối Website: ${error.message}`);
  return data || [];
}

// Upserted wholesale (not a partial patch) — called right after a fresh OAuth
// exchange, when every field (including brand-new tokens/expiry) is known.
export async function upsertGoogleWebsiteAccount(account: GoogleWebsiteAccountConfig): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, google_website_accounts } = await readLocalCollections();
    const rest = google_website_accounts.filter((a) => a.id !== account.id);
    await writeLocalCollections(store, { google_website_accounts: [...rest, account] });
    return;
  }

  const { error } = await supabase.from("google_website_accounts").upsert(account, { onConflict: "id" });
  if (error) throw new Error(`Lỗi lưu kết nối Website: ${error.message}`);
}

// Partial patch — used by the "complete setup" step (admin picks a GA4
// property / Search Console site out of the pending lists) and by sync
// status updates below.
export async function patchGoogleWebsiteAccount(id: string, patch: Partial<GoogleWebsiteAccountConfig>): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, google_website_accounts } = await readLocalCollections();
    const next = google_website_accounts.map((a) => (a.id === id ? { ...a, ...patch } : a));
    await writeLocalCollections(store, { google_website_accounts: next });
    return;
  }

  const { error } = await supabase.from("google_website_accounts").update(patch).eq("id", id);
  if (error) throw new Error(`Lỗi cập nhật kết nối Website: ${error.message}`);
}

export async function deleteGoogleWebsiteAccount(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, google_website_accounts, ga4_insights_daily, search_console_insights_daily } = await readLocalCollections();
    await writeLocalCollections(store, {
      google_website_accounts: google_website_accounts.filter((a) => a.id !== id),
      ga4_insights_daily: ga4_insights_daily.filter((r) => r.account_id !== id),
      search_console_insights_daily: search_console_insights_daily.filter((r) => r.account_id !== id),
    });
    return;
  }

  // ga4_insights_daily/search_console_insights_daily rows cascade via the FK's "on delete cascade".
  const { error } = await supabase.from("google_website_accounts").delete().eq("id", id);
  if (error) throw new Error(`Lỗi xóa kết nối Website: ${error.message}`);
}

// -- GA4 daily insights -------------------------------------------------------

export async function upsertGa4InsightsDaily(rows: Ga4InsightsDailyRow[]): Promise<void> {
  if (rows.length === 0) return;

  if (!isSupabaseConfigured) {
    const { store, ga4_insights_daily } = await readLocalCollections();
    const key = (r: { account_id: string; date: string }) => `${r.account_id}|${r.date}`;
    const byKey = new Map(ga4_insights_daily.map((r) => [key(r), r]));
    for (const row of rows) byKey.set(key(row), row);
    await writeLocalCollections(store, { ga4_insights_daily: Array.from(byKey.values()) });
    return;
  }

  const { error } = await supabase.from("ga4_insights_daily").upsert(rows, { onConflict: "account_id,date" });
  if (error) throw new Error(`Lỗi lưu số liệu GA4: ${error.message}`);
}

export async function getGa4InsightsDaily(accountIds: string[], since: string, until: string): Promise<Ga4InsightsDailyRow[]> {
  if (!isSupabaseConfigured) {
    const { ga4_insights_daily } = await readLocalCollections();
    return ga4_insights_daily.filter((r) => accountIds.includes(r.account_id) && r.date >= since && r.date <= until);
  }

  const { data, error } = await supabase
    .from("ga4_insights_daily")
    .select("*")
    .in("account_id", accountIds)
    .gte("date", since)
    .lte("date", until)
    .order("date", { ascending: true });
  if (error) throw new Error(`Lỗi đọc số liệu GA4: ${error.message}`);
  return data || [];
}

// -- Search Console daily insights --------------------------------------------

export async function upsertSearchConsoleInsightsDaily(rows: SearchConsoleInsightsDailyRow[]): Promise<void> {
  if (rows.length === 0) return;

  if (!isSupabaseConfigured) {
    const { store, search_console_insights_daily } = await readLocalCollections();
    const key = (r: { account_id: string; date: string }) => `${r.account_id}|${r.date}`;
    const byKey = new Map(search_console_insights_daily.map((r) => [key(r), r]));
    for (const row of rows) byKey.set(key(row), row);
    await writeLocalCollections(store, { search_console_insights_daily: Array.from(byKey.values()) });
    return;
  }

  const { error } = await supabase.from("search_console_insights_daily").upsert(rows, { onConflict: "account_id,date" });
  if (error) throw new Error(`Lỗi lưu số liệu Search Console: ${error.message}`);
}

export async function getSearchConsoleInsightsDaily(accountIds: string[], since: string, until: string): Promise<SearchConsoleInsightsDailyRow[]> {
  if (!isSupabaseConfigured) {
    const { search_console_insights_daily } = await readLocalCollections();
    return search_console_insights_daily.filter((r) => accountIds.includes(r.account_id) && r.date >= since && r.date <= until);
  }

  const { data, error } = await supabase
    .from("search_console_insights_daily")
    .select("*")
    .in("account_id", accountIds)
    .gte("date", since)
    .lte("date", until)
    .order("date", { ascending: true });
  if (error) throw new Error(`Lỗi đọc số liệu Search Console: ${error.message}`);
  return data || [];
}
