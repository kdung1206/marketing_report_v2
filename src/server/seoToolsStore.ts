// ---------------------------------------------------------------------------
// Storage layer for Keyword Rank Tracker + Brand SOV (search visibility) —
// see serperClient.ts/seoToolsSync.ts and supabase/schema.sql's comment on
// keyword_rank_targets/keyword_rank_history/sov_mentions_history for the
// full design (why `brands` is an array, why history is a time series, the
// weekly serper.dev credit budget this stays within).
//
// Same production-vs-local split as every other *Store.ts in this codebase.
// ---------------------------------------------------------------------------
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { getDatabaseData, saveDatabaseData } from "./appStateStore";
import crypto from "crypto";

export type Brand = "Livotec" | "Karofi";

export interface KeywordRankTarget {
  id: string;
  keyword: string;
  category: string;
  brands: Brand[];
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface KeywordRankHistoryRow {
  id: string;
  target_id: string;
  brand: Brand;
  checked_at: string; // YYYY-MM-DD
  position: number | null;
  ranking_url: string | null;
  created_at: string;
}

export interface SovMentionRow {
  id: string;
  brand_name: string;
  checked_at: string;
  mention_count: number;
  created_at: string;
}

function newId(): string {
  return crypto.randomUUID();
}

async function readLocal(): Promise<{
  store: any;
  keyword_rank_targets: KeywordRankTarget[];
  keyword_rank_history: KeywordRankHistoryRow[];
  sov_mentions_history: SovMentionRow[];
}> {
  const store = await getDatabaseData();
  return {
    store,
    keyword_rank_targets: Array.isArray(store.keyword_rank_targets) ? store.keyword_rank_targets : [],
    keyword_rank_history: Array.isArray(store.keyword_rank_history) ? store.keyword_rank_history : [],
    sov_mentions_history: Array.isArray(store.sov_mentions_history) ? store.sov_mentions_history : [],
  };
}

async function writeLocal(
  store: any,
  updates: Partial<{
    keyword_rank_targets: KeywordRankTarget[];
    keyword_rank_history: KeywordRankHistoryRow[];
    sov_mentions_history: SovMentionRow[];
  }>
): Promise<void> {
  await saveDatabaseData({ ...store, ...updates });
}

// -- Keyword rank targets -----------------------------------------------------

export async function getKeywordRankTargets(): Promise<KeywordRankTarget[]> {
  if (!isSupabaseConfigured) {
    const { keyword_rank_targets } = await readLocal();
    return keyword_rank_targets;
  }
  const { data, error } = await supabase.from("keyword_rank_targets").select("*").order("category").order("keyword");
  if (error) throw new Error(`Lỗi đọc danh sách từ khoá theo dõi: ${error.message}`);
  return data || [];
}

export async function createKeywordRankTarget(input: { keyword: string; category: string; brands: Brand[] }, createdBy: string): Promise<KeywordRankTarget> {
  const target: KeywordRankTarget = {
    id: newId(),
    keyword: input.keyword.trim(),
    category: input.category.trim(),
    brands: input.brands,
    is_active: true,
    created_by: createdBy,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    const { store, keyword_rank_targets } = await readLocal();
    if (keyword_rank_targets.some((t) => t.keyword.toLowerCase() === target.keyword.toLowerCase())) {
      throw new Error("Từ khoá này đã có trong danh sách theo dõi.");
    }
    await writeLocal(store, { keyword_rank_targets: [...keyword_rank_targets, target] });
    return target;
  }

  const { error } = await supabase.from("keyword_rank_targets").insert(target);
  if (error) throw new Error(`Lỗi thêm từ khoá theo dõi: ${error.message}`);
  return target;
}

export async function updateKeywordRankTarget(id: string, patch: Partial<Pick<KeywordRankTarget, "category" | "brands" | "is_active">>): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, keyword_rank_targets } = await readLocal();
    await writeLocal(store, { keyword_rank_targets: keyword_rank_targets.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
    return;
  }
  const { error } = await supabase.from("keyword_rank_targets").update(patch).eq("id", id);
  if (error) throw new Error(`Lỗi cập nhật từ khoá theo dõi: ${error.message}`);
}

export async function deleteKeywordRankTarget(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, keyword_rank_targets, keyword_rank_history } = await readLocal();
    await writeLocal(store, {
      keyword_rank_targets: keyword_rank_targets.filter((t) => t.id !== id),
      keyword_rank_history: keyword_rank_history.filter((h) => h.target_id !== id),
    });
    return;
  }
  const { error } = await supabase.from("keyword_rank_targets").delete().eq("id", id);
  if (error) throw new Error(`Lỗi xoá từ khoá theo dõi: ${error.message}`);
}

// -- Keyword rank history ------------------------------------------------------

export async function upsertKeywordRankHistory(rows: Omit<KeywordRankHistoryRow, "id" | "created_at">[]): Promise<void> {
  if (rows.length === 0) return;
  const withMeta = rows.map((r) => ({ ...r, id: newId(), created_at: new Date().toISOString() }));

  if (!isSupabaseConfigured) {
    const { store, keyword_rank_history } = await readLocal();
    const key = (r: { target_id: string; brand: string; checked_at: string }) => `${r.target_id}|${r.brand}|${r.checked_at}`;
    const byKey = new Map(keyword_rank_history.map((r) => [key(r), r]));
    for (const row of withMeta) byKey.set(key(row), row);
    await writeLocal(store, { keyword_rank_history: Array.from(byKey.values()) });
    return;
  }

  const { error } = await supabase.from("keyword_rank_history").upsert(withMeta, { onConflict: "target_id,brand,checked_at" });
  if (error) throw new Error(`Lỗi lưu lịch sử thứ hạng: ${error.message}`);
}

export async function getKeywordRankHistory(filters?: { brand?: Brand; since?: string; until?: string }): Promise<KeywordRankHistoryRow[]> {
  if (!isSupabaseConfigured) {
    const { keyword_rank_history } = await readLocal();
    return keyword_rank_history.filter((r) => {
      if (filters?.brand && r.brand !== filters.brand) return false;
      if (filters?.since && r.checked_at < filters.since) return false;
      if (filters?.until && r.checked_at > filters.until) return false;
      return true;
    });
  }

  let query = supabase.from("keyword_rank_history").select("*");
  if (filters?.brand) query = query.eq("brand", filters.brand);
  if (filters?.since) query = query.gte("checked_at", filters.since);
  if (filters?.until) query = query.lte("checked_at", filters.until);
  const { data, error } = await query.order("checked_at", { ascending: false });
  if (error) throw new Error(`Lỗi đọc lịch sử thứ hạng: ${error.message}`);
  return data || [];
}

// -- SOV mentions history -------------------------------------------------------

export async function upsertSovMentions(rows: Omit<SovMentionRow, "id" | "created_at">[]): Promise<void> {
  if (rows.length === 0) return;
  const withMeta = rows.map((r) => ({ ...r, id: newId(), created_at: new Date().toISOString() }));

  if (!isSupabaseConfigured) {
    const { store, sov_mentions_history } = await readLocal();
    const key = (r: { brand_name: string; checked_at: string }) => `${r.brand_name}|${r.checked_at}`;
    const byKey = new Map(sov_mentions_history.map((r) => [key(r), r]));
    for (const row of withMeta) byKey.set(key(row), row);
    await writeLocal(store, { sov_mentions_history: Array.from(byKey.values()) });
    return;
  }

  const { error } = await supabase.from("sov_mentions_history").upsert(withMeta, { onConflict: "brand_name,checked_at" });
  if (error) throw new Error(`Lỗi lưu lịch sử SOV: ${error.message}`);
}

export async function getSovMentions(filters?: { since?: string; until?: string }): Promise<SovMentionRow[]> {
  if (!isSupabaseConfigured) {
    const { sov_mentions_history } = await readLocal();
    return sov_mentions_history.filter((r) => {
      if (filters?.since && r.checked_at < filters.since) return false;
      if (filters?.until && r.checked_at > filters.until) return false;
      return true;
    });
  }

  let query = supabase.from("sov_mentions_history").select("*");
  if (filters?.since) query = query.gte("checked_at", filters.since);
  if (filters?.until) query = query.lte("checked_at", filters.until);
  const { data, error } = await query.order("checked_at", { ascending: false });
  if (error) throw new Error(`Lỗi đọc lịch sử SOV: ${error.message}`);
  return data || [];
}
