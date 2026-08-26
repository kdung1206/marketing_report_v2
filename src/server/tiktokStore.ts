// ---------------------------------------------------------------------------
// Storage layer for the TikTok organic insights module (see tiktokSync.ts
// and the tiktok_accounts/tiktok_insights_daily/tiktok_posts routes in
// app.ts). Same production-vs-local split as facebookStore.ts: production
// (Vercel, isSupabaseConfigured === true) uses the dedicated relational
// tables in supabase/schema.sql — this is time-series data that grows
// forever and needs date-range queries. Local dev has no real Supabase
// project to point at, so it stores the same three collections as extra
// arrays inside the existing local blob (src/db_store.json, via
// appStateStore's getDatabaseData/saveDatabaseData) — consistent with that
// file's "same JSONB-like blob" local-dev convention.
// ---------------------------------------------------------------------------
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { getDatabaseData, saveDatabaseData } from "./appStateStore";

export interface TiktokAccountConfig {
  open_id: string;
  username: string | null;
  display_name: string | null;
  brand: string | null;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  is_active: boolean;
  last_synced_at: string | null;
  last_sync_error: string | null;
  token_expired: boolean;
  // Set by expiryNotifier.ts the first time this account's refresh_token
  // deadline crosses its warning window and a Telegram alert goes out —
  // avoids re-alerting daily. Every caller of upsertTiktokAccount (a fresh
  // OAuth exchange, full-row replace) passes null here so a reconnect
  // re-arms it — see tiktokSync.ts's OAuth callback.
  expiry_alert_sent_at: string | null;
  // Separate, independent dedupe for the 1-day "urgent" escalation tier (see
  // expiryNotifier.ts) — same purpose as fb_pages' column of the same name.
  urgent_alert_sent_at: string | null;
  created_at: string;
}

export interface TiktokInsightsDailyRow {
  open_id: string;
  date: string; // YYYY-MM-DD
  follower_count: number | null;
  following_count: number | null;
  likes_count: number | null;
  video_count: number | null;
}

export interface TiktokPostRow {
  video_id: string;
  open_id: string;
  create_time: string;
  title: string | null;
  cover_image_url: string | null;
  share_url: string | null;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  share_count: number | null;
  synced_at: string;
}

// -- Local (src/db_store.json) helpers ---------------------------------------

async function readLocalCollections(): Promise<{
  store: any;
  tiktok_accounts: TiktokAccountConfig[];
  tiktok_insights_daily: TiktokInsightsDailyRow[];
  tiktok_posts: TiktokPostRow[];
}> {
  const store = await getDatabaseData();
  return {
    store,
    tiktok_accounts: Array.isArray(store.tiktok_accounts) ? store.tiktok_accounts : [],
    tiktok_insights_daily: Array.isArray(store.tiktok_insights_daily) ? store.tiktok_insights_daily : [],
    tiktok_posts: Array.isArray(store.tiktok_posts) ? store.tiktok_posts : [],
  };
}

async function writeLocalCollections(
  store: any,
  updates: Partial<{
    tiktok_accounts: TiktokAccountConfig[];
    tiktok_insights_daily: TiktokInsightsDailyRow[];
    tiktok_posts: TiktokPostRow[];
  }>
): Promise<void> {
  await saveDatabaseData({ ...store, ...updates });
}

// -- Accounts -----------------------------------------------------------------

export async function getTiktokAccounts(): Promise<TiktokAccountConfig[]> {
  if (!isSupabaseConfigured) {
    const { tiktok_accounts } = await readLocalCollections();
    return tiktok_accounts;
  }

  const { data, error } = await supabase.from("tiktok_accounts").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(`Lỗi đọc danh sách tài khoản TikTok: ${error.message}`);
  return data || [];
}

// Upserted wholesale (not a partial patch like setTiktokAccountSyncStatus)
// because this is called right after a fresh OAuth exchange, when every
// field — including brand-new tokens and their expiry timestamps — is known.
export async function upsertTiktokAccount(account: TiktokAccountConfig): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, tiktok_accounts } = await readLocalCollections();
    const rest = tiktok_accounts.filter((a) => a.open_id !== account.open_id);
    await writeLocalCollections(store, { tiktok_accounts: [...rest, account] });
    return;
  }

  const { error } = await supabase.from("tiktok_accounts").upsert(account, { onConflict: "open_id" });
  if (error) throw new Error(`Lỗi lưu tài khoản TikTok: ${error.message}`);
}

export async function deleteTiktokAccount(openId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, tiktok_accounts, tiktok_insights_daily, tiktok_posts } = await readLocalCollections();
    await writeLocalCollections(store, {
      tiktok_accounts: tiktok_accounts.filter((a) => a.open_id !== openId),
      tiktok_insights_daily: tiktok_insights_daily.filter((r) => r.open_id !== openId),
      tiktok_posts: tiktok_posts.filter((r) => r.open_id !== openId),
    });
    return;
  }

  // tiktok_insights_daily/tiktok_posts rows cascade via the FK's "on delete cascade".
  const { error } = await supabase.from("tiktok_accounts").delete().eq("open_id", openId);
  if (error) throw new Error(`Lỗi xóa tài khoản TikTok: ${error.message}`);
}

export async function setTiktokAccountSyncStatus(
  openId: string,
  status: { last_synced_at?: string | null; last_sync_error?: string | null; token_expired?: boolean; expiry_alert_sent_at?: string | null; urgent_alert_sent_at?: string | null }
): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, tiktok_accounts } = await readLocalCollections();
    const next = tiktok_accounts.map((a) => (a.open_id === openId ? { ...a, ...status } : a));
    await writeLocalCollections(store, { tiktok_accounts: next });
    return;
  }

  const { error } = await supabase.from("tiktok_accounts").update(status).eq("open_id", openId);
  if (error) throw new Error(`Lỗi cập nhật trạng thái đồng bộ TikTok: ${error.message}`);
}

// Called after a successful token refresh — separate from
// setTiktokAccountSyncStatus since a refresh can succeed independently of
// (and before) the rest of that sync run completing.
export async function updateTiktokAccountTokens(
  openId: string,
  tokens: {
    access_token_encrypted: string;
    refresh_token_encrypted: string;
    access_token_expires_at: string;
    refresh_token_expires_at: string;
  }
): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, tiktok_accounts } = await readLocalCollections();
    const next = tiktok_accounts.map((a) => (a.open_id === openId ? { ...a, ...tokens } : a));
    await writeLocalCollections(store, { tiktok_accounts: next });
    return;
  }

  const { error } = await supabase.from("tiktok_accounts").update(tokens).eq("open_id", openId);
  if (error) throw new Error(`Lỗi cập nhật token TikTok: ${error.message}`);
}

// -- Daily insights -------------------------------------------------------------

export async function upsertTiktokInsightsDaily(rows: TiktokInsightsDailyRow[]): Promise<void> {
  if (rows.length === 0) return;

  if (!isSupabaseConfigured) {
    const { store, tiktok_insights_daily } = await readLocalCollections();
    const key = (r: { open_id: string; date: string }) => `${r.open_id}|${r.date}`;
    const byKey = new Map(tiktok_insights_daily.map((r) => [key(r), r]));
    for (const row of rows) byKey.set(key(row), row);
    await writeLocalCollections(store, { tiktok_insights_daily: Array.from(byKey.values()) });
    return;
  }

  const { error } = await supabase.from("tiktok_insights_daily").upsert(rows, { onConflict: "open_id,date" });
  if (error) throw new Error(`Lỗi lưu số liệu insights TikTok: ${error.message}`);
}

export async function getTiktokInsightsDaily(openIds: string[], since: string, until: string): Promise<TiktokInsightsDailyRow[]> {
  if (!isSupabaseConfigured) {
    const { tiktok_insights_daily } = await readLocalCollections();
    return tiktok_insights_daily.filter((r) => openIds.includes(r.open_id) && r.date >= since && r.date <= until);
  }

  const { data, error } = await supabase
    .from("tiktok_insights_daily")
    .select("*")
    .in("open_id", openIds)
    .gte("date", since)
    .lte("date", until)
    .order("date", { ascending: true });
  if (error) throw new Error(`Lỗi đọc số liệu insights TikTok: ${error.message}`);
  return data || [];
}

// -- Posts -----------------------------------------------------------------------

export async function upsertTiktokPosts(rows: TiktokPostRow[]): Promise<void> {
  if (rows.length === 0) return;

  if (!isSupabaseConfigured) {
    const { store, tiktok_posts } = await readLocalCollections();
    const byId = new Map(tiktok_posts.map((r) => [r.video_id, r]));
    for (const row of rows) byId.set(row.video_id, row);
    await writeLocalCollections(store, { tiktok_posts: Array.from(byId.values()) });
    return;
  }

  const { error } = await supabase.from("tiktok_posts").upsert(rows, { onConflict: "video_id" });
  if (error) throw new Error(`Lỗi lưu video TikTok: ${error.message}`);
}

export async function getTiktokPosts(openIds: string[], since: string, until: string): Promise<TiktokPostRow[]> {
  if (!isSupabaseConfigured) {
    const { tiktok_posts } = await readLocalCollections();
    return tiktok_posts
      .filter((r) => openIds.includes(r.open_id) && r.create_time >= since && r.create_time <= until)
      .sort((a, b) => (a.create_time < b.create_time ? 1 : -1));
  }

  const { data, error } = await supabase
    .from("tiktok_posts")
    .select("*")
    .in("open_id", openIds)
    .gte("create_time", since)
    .lte("create_time", until)
    .order("create_time", { ascending: false });
  if (error) throw new Error(`Lỗi đọc video TikTok: ${error.message}`);
  return data || [];
}
