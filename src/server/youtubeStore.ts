// ---------------------------------------------------------------------------
// Storage layer for the YouTube organic insights module (see youtubeSync.ts
// and the youtube_accounts/youtube_insights_daily/youtube_videos routes in
// app.ts). Same production-vs-local split as tiktokStore.ts/facebookStore.ts:
// production (Vercel, isSupabaseConfigured === true) uses the dedicated
// relational tables in supabase/schema.sql. Local dev has no real Supabase
// project to point at, so it stores the same three collections as extra
// arrays inside the existing local blob (src/db_store.json, via
// appStateStore's getDatabaseData/saveDatabaseData).
// ---------------------------------------------------------------------------
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { getDatabaseData, saveDatabaseData } from "./appStateStore";

export interface YoutubeAccountConfig {
  channel_id: string;
  channel_title: string | null;
  brand: string | null;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  access_token_expires_at: string;
  // Set once at connect time, never updated by a later access-token refresh
  // (same "fixed at grant, not rolling" behavior confirmed for TikTok). Google
  // normally never expires a refresh_token on a schedule — but while this
  // app's OAuth consent screen sits in "Testing" publish status (the default
  // until verified/published, or switched to "Internal" for a Workspace-owned
  // project), Google hard-expires it after 7 days regardless of use. There is
  // no API to ask Google which publish status applies, so this is always
  // computed as connected_at + 7 days — a deliberately conservative estimate:
  // if the app is later published or made Internal, the real token outlives
  // this estimate and the "sắp hết hạn" warning becomes a false alarm (safe
  // direction to be wrong in), but it will never miss the real Testing-mode
  // cutoff, which is the failure this is guarding against (see the actual
  // 2026-08-17 incident where this connection died with no warning at all).
  refresh_token_expires_at: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  last_sync_error: string | null;
  token_expired: boolean;
  // Set by expiryNotifier.ts the first time this channel's refresh_token
  // deadline crosses its warning window and a Telegram alert goes out —
  // avoids re-alerting daily. Every caller of upsertYoutubeAccount (a fresh
  // OAuth exchange, full-row replace) passes null here so a reconnect
  // re-arms it.
  expiry_alert_sent_at: string | null;
  created_at: string;
}

export interface YoutubeInsightsDailyRow {
  channel_id: string;
  date: string; // YYYY-MM-DD
  subscriber_count: number | null;
  view_count: number | null;
  video_count: number | null;
}

export interface YoutubeVideoRow {
  video_id: string;
  channel_id: string;
  published_at: string;
  title: string | null;
  thumbnail_url: string | null;
  views: number | null;
  organic_views: number | null;
  advertising_views: number | null;
  synced_at: string;
}

// -- Local (src/db_store.json) helpers ---------------------------------------

async function readLocalCollections(): Promise<{
  store: any;
  youtube_accounts: YoutubeAccountConfig[];
  youtube_insights_daily: YoutubeInsightsDailyRow[];
  youtube_videos: YoutubeVideoRow[];
}> {
  const store = await getDatabaseData();
  return {
    store,
    youtube_accounts: Array.isArray(store.youtube_accounts) ? store.youtube_accounts : [],
    youtube_insights_daily: Array.isArray(store.youtube_insights_daily) ? store.youtube_insights_daily : [],
    youtube_videos: Array.isArray(store.youtube_videos) ? store.youtube_videos : [],
  };
}

async function writeLocalCollections(
  store: any,
  updates: Partial<{
    youtube_accounts: YoutubeAccountConfig[];
    youtube_insights_daily: YoutubeInsightsDailyRow[];
    youtube_videos: YoutubeVideoRow[];
  }>
): Promise<void> {
  await saveDatabaseData({ ...store, ...updates });
}

// -- Accounts -----------------------------------------------------------------

export async function getYoutubeAccounts(): Promise<YoutubeAccountConfig[]> {
  if (!isSupabaseConfigured) {
    const { youtube_accounts } = await readLocalCollections();
    return youtube_accounts;
  }

  const { data, error } = await supabase.from("youtube_accounts").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(`Lỗi đọc danh sách kênh YouTube: ${error.message}`);
  return data || [];
}

// Upserted wholesale (not a partial patch) because this is called right
// after a fresh OAuth exchange, when every field — including brand-new
// tokens and their expiry — is known.
export async function upsertYoutubeAccount(account: YoutubeAccountConfig): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, youtube_accounts } = await readLocalCollections();
    const rest = youtube_accounts.filter((a) => a.channel_id !== account.channel_id);
    await writeLocalCollections(store, { youtube_accounts: [...rest, account] });
    return;
  }

  const { error } = await supabase.from("youtube_accounts").upsert(account, { onConflict: "channel_id" });
  if (error) throw new Error(`Lỗi lưu kênh YouTube: ${error.message}`);
}

export async function deleteYoutubeAccount(channelId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, youtube_accounts, youtube_insights_daily, youtube_videos } = await readLocalCollections();
    await writeLocalCollections(store, {
      youtube_accounts: youtube_accounts.filter((a) => a.channel_id !== channelId),
      youtube_insights_daily: youtube_insights_daily.filter((r) => r.channel_id !== channelId),
      youtube_videos: youtube_videos.filter((r) => r.channel_id !== channelId),
    });
    return;
  }

  // youtube_insights_daily/youtube_videos rows cascade via the FK's "on delete cascade".
  const { error } = await supabase.from("youtube_accounts").delete().eq("channel_id", channelId);
  if (error) throw new Error(`Lỗi xóa kênh YouTube: ${error.message}`);
}

export async function setYoutubeAccountSyncStatus(
  channelId: string,
  status: { last_synced_at?: string | null; last_sync_error?: string | null; token_expired?: boolean; expiry_alert_sent_at?: string | null }
): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, youtube_accounts } = await readLocalCollections();
    const next = youtube_accounts.map((a) => (a.channel_id === channelId ? { ...a, ...status } : a));
    await writeLocalCollections(store, { youtube_accounts: next });
    return;
  }

  const { error } = await supabase.from("youtube_accounts").update(status).eq("channel_id", channelId);
  if (error) throw new Error(`Lỗi cập nhật trạng thái đồng bộ YouTube: ${error.message}`);
}

// Called after a successful token refresh. Unlike TikTok, Google does NOT
// return a new refresh_token on a refresh_token grant (the original stays
// valid indefinitely until revoked) — only access_token_encrypted/
// access_token_expires_at ever change here.
export async function updateYoutubeAccountAccessToken(
  channelId: string,
  tokens: { access_token_encrypted: string; access_token_expires_at: string }
): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, youtube_accounts } = await readLocalCollections();
    const next = youtube_accounts.map((a) => (a.channel_id === channelId ? { ...a, ...tokens } : a));
    await writeLocalCollections(store, { youtube_accounts: next });
    return;
  }

  const { error } = await supabase.from("youtube_accounts").update(tokens).eq("channel_id", channelId);
  if (error) throw new Error(`Lỗi cập nhật token YouTube: ${error.message}`);
}

// -- Daily insights (channel-level snapshot) ---------------------------------

export async function upsertYoutubeInsightsDaily(rows: YoutubeInsightsDailyRow[]): Promise<void> {
  if (rows.length === 0) return;

  if (!isSupabaseConfigured) {
    const { store, youtube_insights_daily } = await readLocalCollections();
    const key = (r: { channel_id: string; date: string }) => `${r.channel_id}|${r.date}`;
    const byKey = new Map(youtube_insights_daily.map((r) => [key(r), r]));
    for (const row of rows) byKey.set(key(row), row);
    await writeLocalCollections(store, { youtube_insights_daily: Array.from(byKey.values()) });
    return;
  }

  const { error } = await supabase.from("youtube_insights_daily").upsert(rows, { onConflict: "channel_id,date" });
  if (error) throw new Error(`Lỗi lưu số liệu insights YouTube: ${error.message}`);
}

export async function getYoutubeInsightsDaily(channelIds: string[], since: string, until: string): Promise<YoutubeInsightsDailyRow[]> {
  if (!isSupabaseConfigured) {
    const { youtube_insights_daily } = await readLocalCollections();
    return youtube_insights_daily.filter((r) => channelIds.includes(r.channel_id) && r.date >= since && r.date <= until);
  }

  const { data, error } = await supabase
    .from("youtube_insights_daily")
    .select("*")
    .in("channel_id", channelIds)
    .gte("date", since)
    .lte("date", until)
    .order("date", { ascending: true });
  if (error) throw new Error(`Lỗi đọc số liệu insights YouTube: ${error.message}`);
  return data || [];
}

// -- Videos (latest cumulative snapshot per video, no date dimension — same
// "overwritten every sync" convention as tiktok_posts) -----------------------

export async function upsertYoutubeVideos(rows: YoutubeVideoRow[]): Promise<void> {
  if (rows.length === 0) return;

  if (!isSupabaseConfigured) {
    const { store, youtube_videos } = await readLocalCollections();
    const byId = new Map(youtube_videos.map((r) => [r.video_id, r]));
    for (const row of rows) byId.set(row.video_id, row);
    await writeLocalCollections(store, { youtube_videos: Array.from(byId.values()) });
    return;
  }

  const { error } = await supabase.from("youtube_videos").upsert(rows, { onConflict: "video_id" });
  if (error) throw new Error(`Lỗi lưu video YouTube: ${error.message}`);
}

export async function getYoutubeVideos(channelIds: string[], since: string, until: string): Promise<YoutubeVideoRow[]> {
  if (!isSupabaseConfigured) {
    const { youtube_videos } = await readLocalCollections();
    return youtube_videos
      .filter((r) => channelIds.includes(r.channel_id) && r.published_at >= since && r.published_at <= until)
      .sort((a, b) => (a.published_at < b.published_at ? 1 : -1));
  }

  const { data, error } = await supabase
    .from("youtube_videos")
    .select("*")
    .in("channel_id", channelIds)
    .gte("published_at", since)
    .lte("published_at", until)
    .order("published_at", { ascending: false });
  if (error) throw new Error(`Lỗi đọc video YouTube: ${error.message}`);
  return data || [];
}
