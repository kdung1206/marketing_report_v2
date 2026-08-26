// ---------------------------------------------------------------------------
// Storage layer for the Facebook Page Insights module (see facebookSync.ts
// and the fb_pages/fb_insights_daily/fb_posts routes in app.ts).
//
// Same production-vs-local split as appStateStore.ts: production (Vercel,
// isSupabaseConfigured === true) uses the dedicated relational tables in
// supabase/schema.sql — this is time-series data that grows forever and
// needs date-range queries, unlike the single JSONB report blob. Local dev
// has no real Supabase project to point at, so it stores the same three
// collections as extra arrays inside the existing local blob
// (src/db_store.json, via appStateStore's getDatabaseData/saveDatabaseData) —
// consistent with that file's "same JSONB-like blob" local-dev convention.
// ---------------------------------------------------------------------------
import { supabase, isSupabaseConfigured, fetchAllRows } from "./supabaseClient";
import { getDatabaseData, saveDatabaseData } from "./appStateStore";

export interface FbPageConfig {
  page_id: string;
  page_name: string;
  brand: string | null;
  access_token_encrypted: string;
  is_active: boolean;
  last_synced_at: string | null;
  last_sync_error: string | null;
  // True only when Facebook has explicitly confirmed the token itself is
  // dead (OAuthException code 190 — expired/revoked/password changed), set
  // by facebookSync.ts's isTokenInvalidError(). Deliberately separate from
  // last_sync_error/is_active: a transient failure (network blip, Facebook
  // API hiccup, a missed cron run because nothing was running to trigger
  // it) must never look like — or become — a dropped connection. Sync just
  // keeps retrying with the same stored token on every run until Facebook
  // itself says otherwise; only this flag means "Admin action needed".
  token_expired: boolean;
  // Filled in from the Graph API's debug_token endpoint on every sync (and
  // right after an Admin saves a token) — see fetchTokenExpiry() in
  // facebookSync.ts. token_expired above is the *after the fact* signal
  // (Facebook already rejected us); these three are what let the UI warn
  // *before* that happens. null in either deadline means "no such deadline"
  // (a Page token derived from a long-lived User Token normally never
  // expires); token_checked_at null means the probe hasn't succeeded yet, so
  // the deadlines are unknown rather than absent.
  token_expires_at: string | null;
  token_data_access_expires_at: string | null;
  token_checked_at: string | null;
  // Set by expiryNotifier.ts the first time this Page's expiry crosses its
  // warning window and a Telegram alert actually goes out — prevents
  // re-alerting every single day the deadline stays inside that window.
  // Reset to null by upsertFbPage whenever the Admin saves a fresh token
  // (new token = new deadline = worth re-arming the alert).
  expiry_alert_sent_at: string | null;
  // Separate, independent dedupe for the 1-day "urgent" escalation tier (see
  // expiryNotifier.ts) — fires once more, on top of expiry_alert_sent_at
  // above, as the deadline gets critical, so a connection that already got
  // the first warning still gets one final urgent nudge instead of going
  // quiet until it actually dies. Reset to null on reconnect, same as
  // expiry_alert_sent_at.
  urgent_alert_sent_at: string | null;
  created_at: string;
}

export interface FbInsightsDailyRow {
  page_id: string;
  date: string; // YYYY-MM-DD
  impressions: number | null;
  impressions_paid: number | null;
  reach: number | null;
  reach_paid: number | null;
  page_views: number | null;
  fan_count: number | null;
  fan_adds: number | null;
  fan_removes: number | null;
  engaged_users: number | null;
}

export interface FbPostRow {
  post_id: string;
  page_id: string;
  created_time: string;
  message: string | null;
  permalink: string | null;
  thumbnail_url: string | null;
  reach: number | null;
  impressions: number | null;
  engaged_users: number | null;
  clicks: number | null;
  likes: number | null;
  loves: number | null;
  wows: number | null;
  hahas: number | null;
  sorrys: number | null;
  angers: number | null;
  comments: number | null;
  shares: number | null;
  synced_at: string;
}

// -- Local (src/db_store.json) helpers ---------------------------------------

async function readLocalCollections(): Promise<{
  store: any;
  fb_pages: FbPageConfig[];
  fb_insights_daily: FbInsightsDailyRow[];
  fb_posts: FbPostRow[];
}> {
  const store = await getDatabaseData();
  return {
    store,
    fb_pages: Array.isArray(store.fb_pages) ? store.fb_pages : [],
    fb_insights_daily: Array.isArray(store.fb_insights_daily) ? store.fb_insights_daily : [],
    fb_posts: Array.isArray(store.fb_posts) ? store.fb_posts : [],
  };
}

async function writeLocalCollections(
  store: any,
  updates: Partial<{ fb_pages: FbPageConfig[]; fb_insights_daily: FbInsightsDailyRow[]; fb_posts: FbPostRow[] }>
): Promise<void> {
  await saveDatabaseData({ ...store, ...updates });
}

// -- Pages --------------------------------------------------------------------

export async function getFbPages(): Promise<FbPageConfig[]> {
  if (!isSupabaseConfigured) {
    const { fb_pages } = await readLocalCollections();
    return fb_pages;
  }

  const { data, error } = await supabase.from("fb_pages").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(`Lỗi đọc danh sách Facebook Page: ${error.message}`);
  return data || [];
}

export async function upsertFbPage(input: {
  page_id: string;
  page_name: string;
  brand?: string | null;
  access_token_encrypted: string;
  is_active?: boolean;
}): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, fb_pages } = await readLocalCollections();
    const existing = fb_pages.find((p) => p.page_id === input.page_id);
    const next: FbPageConfig = {
      page_id: input.page_id,
      page_name: input.page_name,
      brand: input.brand !== undefined ? input.brand : existing?.brand ?? null,
      access_token_encrypted: input.access_token_encrypted,
      is_active: input.is_active !== undefined ? input.is_active : existing?.is_active !== false,
      last_synced_at: existing?.last_synced_at || null,
      last_sync_error: existing?.last_sync_error || null,
      // A fresh save always clears this — Admin just pasted a (presumably
      // valid) token, so give it the benefit of the doubt until the next
      // sync says otherwise. The stored expiry deadlines belong to the token
      // being replaced, so they're cleared for the same reason and refilled
      // by the next debug_token probe.
      token_expired: false,
      token_expires_at: null,
      token_data_access_expires_at: null,
      token_checked_at: null,
      expiry_alert_sent_at: null,
      urgent_alert_sent_at: null,
      created_at: existing?.created_at || new Date().toISOString(),
    };
    const rest = fb_pages.filter((p) => p.page_id !== input.page_id);
    await writeLocalCollections(store, { fb_pages: [...rest, next] });
    return;
  }

  const { error } = await supabase.from("fb_pages").upsert(
    {
      page_id: input.page_id,
      page_name: input.page_name,
      brand: input.brand !== undefined ? input.brand : null,
      access_token_encrypted: input.access_token_encrypted,
      is_active: input.is_active !== undefined ? input.is_active : true,
      token_expired: false,
      token_expires_at: null,
      token_data_access_expires_at: null,
      token_checked_at: null,
      expiry_alert_sent_at: null,
      urgent_alert_sent_at: null,
    },
    { onConflict: "page_id" }
  );
  if (error) throw new Error(`Lỗi lưu Facebook Page: ${error.message}`);
}

export async function deleteFbPage(pageId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, fb_pages, fb_insights_daily, fb_posts } = await readLocalCollections();
    await writeLocalCollections(store, {
      fb_pages: fb_pages.filter((p) => p.page_id !== pageId),
      fb_insights_daily: fb_insights_daily.filter((r) => r.page_id !== pageId),
      fb_posts: fb_posts.filter((r) => r.page_id !== pageId),
    });
    return;
  }

  // fb_insights_daily/fb_posts rows cascade via the FK's "on delete cascade".
  const { error } = await supabase.from("fb_pages").delete().eq("page_id", pageId);
  if (error) throw new Error(`Lỗi xóa Facebook Page: ${error.message}`);
}

export async function setFbPageSyncStatus(
  pageId: string,
  status: {
    last_synced_at?: string | null;
    last_sync_error?: string | null;
    token_expired?: boolean;
    token_expires_at?: string | null;
    token_data_access_expires_at?: string | null;
    token_checked_at?: string | null;
    expiry_alert_sent_at?: string | null;
    urgent_alert_sent_at?: string | null;
  }
): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, fb_pages } = await readLocalCollections();
    const next = fb_pages.map((p) => (p.page_id === pageId ? { ...p, ...status } : p));
    await writeLocalCollections(store, { fb_pages: next });
    return;
  }

  const { error } = await supabase.from("fb_pages").update(status).eq("page_id", pageId);
  if (error) throw new Error(`Lỗi cập nhật trạng thái đồng bộ: ${error.message}`);
}

// -- Daily insights -------------------------------------------------------------

export async function upsertFbInsightsDaily(rows: FbInsightsDailyRow[]): Promise<void> {
  if (rows.length === 0) return;

  if (!isSupabaseConfigured) {
    const { store, fb_insights_daily } = await readLocalCollections();
    const key = (r: { page_id: string; date: string }) => `${r.page_id}|${r.date}`;
    const byKey = new Map(fb_insights_daily.map((r) => [key(r), r]));
    for (const row of rows) byKey.set(key(row), row);
    await writeLocalCollections(store, { fb_insights_daily: Array.from(byKey.values()) });
    return;
  }

  const { error } = await supabase.from("fb_insights_daily").upsert(rows, { onConflict: "page_id,date" });
  if (error) throw new Error(`Lỗi lưu số liệu insights: ${error.message}`);
}

export async function getFbInsightsDaily(pageIds: string[], since: string, until: string): Promise<FbInsightsDailyRow[]> {
  if (!isSupabaseConfigured) {
    const { fb_insights_daily } = await readLocalCollections();
    return fb_insights_daily.filter(
      (r) => pageIds.includes(r.page_id) && r.date >= since && r.date <= until
    );
  }

  // supabase-js's .in() with an empty array sends `page_id=in.()`, which
  // PostgREST rejects as a syntax error (500 here, since every route wraps
  // failures the same way) — happens whenever no Facebook Page is configured
  // yet, not just as an edge case.
  if (pageIds.length === 0) return [];

  return fetchAllRows<FbInsightsDailyRow>((from, to) =>
    supabase
      .from("fb_insights_daily")
      .select("*")
      .in("page_id", pageIds)
      .gte("date", since)
      .lte("date", until)
      .order("date", { ascending: true })
      .range(from, to)
  ).catch((err: any) => {
    throw new Error(`Lỗi đọc số liệu insights: ${err.message}`);
  });
}

// -- Posts -----------------------------------------------------------------------

export async function upsertFbPosts(rows: FbPostRow[]): Promise<void> {
  if (rows.length === 0) return;

  if (!isSupabaseConfigured) {
    const { store, fb_posts } = await readLocalCollections();
    const byId = new Map(fb_posts.map((r) => [r.post_id, r]));
    for (const row of rows) byId.set(row.post_id, row);
    await writeLocalCollections(store, { fb_posts: Array.from(byId.values()) });
    return;
  }

  const { error } = await supabase.from("fb_posts").upsert(rows, { onConflict: "post_id" });
  if (error) throw new Error(`Lỗi lưu bài đăng: ${error.message}`);
}

export async function getFbPosts(pageIds: string[], since: string, until: string): Promise<FbPostRow[]> {
  if (!isSupabaseConfigured) {
    const { fb_posts } = await readLocalCollections();
    return fb_posts
      .filter((r) => pageIds.includes(r.page_id) && r.created_time >= since && r.created_time <= until)
      .sort((a, b) => (a.created_time < b.created_time ? 1 : -1));
  }

  if (pageIds.length === 0) return [];

  return fetchAllRows<FbPostRow>((from, to) =>
    supabase
      .from("fb_posts")
      .select("*")
      .in("page_id", pageIds)
      .gte("created_time", since)
      .lte("created_time", until)
      .order("created_time", { ascending: false })
      .range(from, to)
  ).catch((err: any) => {
    throw new Error(`Lỗi đọc bài đăng: ${err.message}`);
  });
}
