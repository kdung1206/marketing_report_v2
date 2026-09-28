// ---------------------------------------------------------------------------
// Storage layer for platform_oauth_pending (see supabase/schema.sql's comment
// on that table for the full flow). Shared by the Facebook and TikTok Ads
// OAuth-connect routes in app.ts — both need the same "stash a candidate
// list + a token behind a random id, let the admin pick a subset, write the
// final rows" shape, just with different candidate payloads and different
// final tables.
//
// Same production-vs-local split as every other *Store.ts in this codebase:
// production (Vercel, isSupabaseConfigured === true) uses the dedicated
// table; local dev stores the same collection as an extra array inside the
// existing local blob (src/db_store.json).
// ---------------------------------------------------------------------------
import { randomUUID } from "crypto";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { getDatabaseData, saveDatabaseData } from "./appStateStore";
import { encrypt, decrypt } from "./crypto";

export type OAuthPendingPlatform = "facebook" | "tiktok_ads";

export interface OAuthPendingRecord {
  id: string;
  platform: OAuthPendingPlatform;
  token_encrypted: string;
  candidates: unknown;
  created_at: string;
}

// Abandoned rows (admin closed the tab instead of completing/dismissing the
// picker) are never a correctness problem — nothing ever reads a row past
// this age as valid — but they'd otherwise accumulate forever with live
// tokens sitting in them. Swept opportunistically on every new create rather
// than on a cron, since this table only ever sees a handful of rows.
const PENDING_TTL_MS = 60 * 60 * 1000;

async function readLocal(): Promise<{ store: any; rows: OAuthPendingRecord[] }> {
  const store = await getDatabaseData();
  return { store, rows: Array.isArray(store.platform_oauth_pending) ? store.platform_oauth_pending : [] };
}

async function writeLocal(store: any, rows: OAuthPendingRecord[]): Promise<void> {
  await saveDatabaseData({ ...store, platform_oauth_pending: rows });
}

function isExpired(row: OAuthPendingRecord): boolean {
  return Date.now() - new Date(row.created_at).getTime() > PENDING_TTL_MS;
}

export async function createOAuthPending(platform: OAuthPendingPlatform, tokenPlain: string, candidates: unknown): Promise<string> {
  const id = randomUUID();
  const record: OAuthPendingRecord = {
    id,
    platform,
    token_encrypted: encrypt(tokenPlain),
    candidates,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    const { store, rows } = await readLocal();
    await writeLocal(store, [...rows.filter((r) => !isExpired(r)), record]);
    return id;
  }

  await supabase.from("platform_oauth_pending").delete().lt("created_at", new Date(Date.now() - PENDING_TTL_MS).toISOString());
  const { error } = await supabase.from("platform_oauth_pending").insert(record);
  if (error) throw new Error(`Lỗi lưu kết nối tạm thời: ${error.message}`);
  return id;
}

// Returns the decrypted token alongside the record — every caller needs it
// immediately (either to render candidates, which never include the token,
// or to complete the connection, which does) so there's no value in forcing
// two round trips.
export async function getOAuthPending(id: string): Promise<(Omit<OAuthPendingRecord, "token_encrypted"> & { token: string }) | null> {
  let record: OAuthPendingRecord | null = null;

  if (!isSupabaseConfigured) {
    const { rows } = await readLocal();
    record = rows.find((r) => r.id === id) || null;
  } else {
    const { data, error } = await supabase.from("platform_oauth_pending").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`Lỗi đọc kết nối tạm thời: ${error.message}`);
    record = data || null;
  }

  if (!record || isExpired(record)) return null;
  const { token_encrypted, ...rest } = record;
  return { ...rest, token: decrypt(token_encrypted) };
}

export async function deleteOAuthPending(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, rows } = await readLocal();
    await writeLocal(store, rows.filter((r) => r.id !== id));
    return;
  }

  const { error } = await supabase.from("platform_oauth_pending").delete().eq("id", id);
  if (error) throw new Error(`Lỗi xóa kết nối tạm thời: ${error.message}`);
}
