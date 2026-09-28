// ---------------------------------------------------------------------------
// Storage layer for Social Outreach (KOC/KOL) — see supabase/schema.sql's
// comment on koc_kol_accounts/outreach_posts/outreach_post_metrics and
// `task cần làm/campaign task/phan-tich-social-outreach-campaign.md` for the
// full design this was built from.
//
// Edit/delete permission is NOT handled here — every route in app.ts that
// mutates an outreach_posts row reuses canEditCampaign(post.campaign_id, ...)
// exactly like campaign tasks do, per the confirmed answer to that doc's Q7
// (reuse the existing campaign_members mechanism rather than build a new one).
// ---------------------------------------------------------------------------
import crypto from "crypto";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { getDatabaseData, saveDatabaseData } from "./appStateStore";

export type OutreachPlatform = "Facebook" | "TikTok" | "Instagram" | "YouTube" | "Other";

export interface KocKolAccount {
  id: string;
  name: string;
  platform: OutreachPlatform;
  handle_or_url: string | null;
  contact_info: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
}

export interface OutreachPost {
  id: string;
  campaign_id: string;
  koc_kol_id: string | null;
  platform: OutreachPlatform;
  post_url: string;
  external_id: string | null;
  published_at: string | null;
  status: "Scheduled" | "Live" | "Removed";
  cost: number | null;
  added_by: string;
  created_at: string;
}

export interface OutreachPostMetric {
  id: string;
  post_id: string;
  recorded_at: string;
  source: "manual" | "auto_youtube";
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  entered_by: string | null;
  created_at: string;
}

function newId(): string {
  return crypto.randomUUID();
}

async function readLocal(): Promise<{
  store: any;
  koc_kol_accounts: KocKolAccount[];
  outreach_posts: OutreachPost[];
  outreach_post_metrics: OutreachPostMetric[];
}> {
  const store = await getDatabaseData();
  return {
    store,
    koc_kol_accounts: Array.isArray(store.koc_kol_accounts) ? store.koc_kol_accounts : [],
    outreach_posts: Array.isArray(store.outreach_posts) ? store.outreach_posts : [],
    outreach_post_metrics: Array.isArray(store.outreach_post_metrics) ? store.outreach_post_metrics : [],
  };
}

async function writeLocal(
  store: any,
  updates: Partial<{ koc_kol_accounts: KocKolAccount[]; outreach_posts: OutreachPost[]; outreach_post_metrics: OutreachPostMetric[] }>
): Promise<void> {
  await saveDatabaseData({ ...store, ...updates });
}

// -- Roster (KOC/KOL accounts) -------------------------------------------------

export async function getKocKolAccounts(): Promise<KocKolAccount[]> {
  if (!isSupabaseConfigured) {
    const { koc_kol_accounts } = await readLocal();
    return koc_kol_accounts;
  }
  const { data, error } = await supabase.from("koc_kol_accounts").select("*").order("name");
  if (error) throw new Error(`Lỗi đọc danh sách KOC/KOL: ${error.message}`);
  return data || [];
}

export async function createKocKolAccount(
  input: Pick<KocKolAccount, "name" | "platform"> & Partial<Pick<KocKolAccount, "handle_or_url" | "contact_info" | "notes">>,
  createdBy: string
): Promise<KocKolAccount> {
  const account: KocKolAccount = {
    id: newId(),
    name: input.name.trim(),
    platform: input.platform,
    handle_or_url: input.handle_or_url?.trim() || null,
    contact_info: input.contact_info?.trim() || null,
    notes: input.notes?.trim() || null,
    created_by: createdBy,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    const { store, koc_kol_accounts } = await readLocal();
    await writeLocal(store, { koc_kol_accounts: [...koc_kol_accounts, account] });
    return account;
  }

  const { error } = await supabase.from("koc_kol_accounts").insert(account);
  if (error) throw new Error(`Lỗi thêm KOC/KOL: ${error.message}`);
  return account;
}

export async function deleteKocKolAccount(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, koc_kol_accounts } = await readLocal();
    await writeLocal(store, { koc_kol_accounts: koc_kol_accounts.filter((a) => a.id !== id) });
    return;
  }
  const { error } = await supabase.from("koc_kol_accounts").delete().eq("id", id);
  if (error) throw new Error(`Lỗi xoá KOC/KOL: ${error.message}`);
}

// -- Outreach posts -------------------------------------------------------------

export async function getOutreachPosts(filters?: { campaignId?: string }): Promise<OutreachPost[]> {
  if (!isSupabaseConfigured) {
    const { outreach_posts } = await readLocal();
    return filters?.campaignId ? outreach_posts.filter((p) => p.campaign_id === filters.campaignId) : outreach_posts;
  }
  let query = supabase.from("outreach_posts").select("*");
  if (filters?.campaignId) query = query.eq("campaign_id", filters.campaignId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(`Lỗi đọc danh sách bài đăng outreach: ${error.message}`);
  return data || [];
}

export async function getOutreachPost(id: string): Promise<OutreachPost | null> {
  if (!isSupabaseConfigured) {
    const { outreach_posts } = await readLocal();
    return outreach_posts.find((p) => p.id === id) || null;
  }
  const { data, error } = await supabase.from("outreach_posts").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Lỗi đọc bài đăng outreach: ${error.message}`);
  return data;
}

export async function createOutreachPost(
  input: Pick<OutreachPost, "campaign_id" | "platform" | "post_url"> & Partial<Pick<OutreachPost, "koc_kol_id" | "external_id" | "published_at" | "status" | "cost">>,
  addedBy: string
): Promise<OutreachPost> {
  const post: OutreachPost = {
    id: newId(),
    campaign_id: input.campaign_id,
    koc_kol_id: input.koc_kol_id || null,
    platform: input.platform,
    post_url: input.post_url.trim(),
    external_id: input.external_id || null,
    published_at: input.published_at || null,
    status: input.status || "Live",
    cost: input.cost ?? null,
    added_by: addedBy,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    const { store, outreach_posts } = await readLocal();
    await writeLocal(store, { outreach_posts: [...outreach_posts, post] });
    return post;
  }

  const { error } = await supabase.from("outreach_posts").insert(post);
  if (error) throw new Error(`Lỗi thêm bài đăng outreach: ${error.message}`);
  return post;
}

export async function updateOutreachPost(id: string, patch: Partial<Pick<OutreachPost, "koc_kol_id" | "post_url" | "external_id" | "published_at" | "status" | "cost">>): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, outreach_posts } = await readLocal();
    await writeLocal(store, { outreach_posts: outreach_posts.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
    return;
  }
  const { error } = await supabase.from("outreach_posts").update(patch).eq("id", id);
  if (error) throw new Error(`Lỗi cập nhật bài đăng outreach: ${error.message}`);
}

export async function deleteOutreachPost(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, outreach_posts, outreach_post_metrics } = await readLocal();
    await writeLocal(store, {
      outreach_posts: outreach_posts.filter((p) => p.id !== id),
      outreach_post_metrics: outreach_post_metrics.filter((m) => m.post_id !== id),
    });
    return;
  }
  const { error } = await supabase.from("outreach_posts").delete().eq("id", id);
  if (error) throw new Error(`Lỗi xoá bài đăng outreach: ${error.message}`);
}

// -- Outreach post metrics (time series) -----------------------------------------

export async function getOutreachPostMetrics(filters?: { postId?: string; postIds?: string[] }): Promise<OutreachPostMetric[]> {
  if (!isSupabaseConfigured) {
    const { outreach_post_metrics } = await readLocal();
    return outreach_post_metrics.filter((m) => {
      if (filters?.postId && m.post_id !== filters.postId) return false;
      if (filters?.postIds && !filters.postIds.includes(m.post_id)) return false;
      return true;
    });
  }
  let query = supabase.from("outreach_post_metrics").select("*");
  if (filters?.postId) query = query.eq("post_id", filters.postId);
  if (filters?.postIds) query = query.in("post_id", filters.postIds);
  const { data, error } = await query.order("recorded_at", { ascending: false });
  if (error) throw new Error(`Lỗi đọc số liệu outreach: ${error.message}`);
  return data || [];
}

export async function createOutreachPostMetric(
  input: Pick<OutreachPostMetric, "post_id"> & Partial<Pick<OutreachPostMetric, "views" | "likes" | "comments" | "shares">>,
  enteredBy: string
): Promise<OutreachPostMetric> {
  const metric: OutreachPostMetric = {
    id: newId(),
    post_id: input.post_id,
    recorded_at: new Date().toISOString(),
    source: "manual",
    views: input.views ?? null,
    likes: input.likes ?? null,
    comments: input.comments ?? null,
    shares: input.shares ?? null,
    entered_by: enteredBy,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    const { store, outreach_post_metrics } = await readLocal();
    await writeLocal(store, { outreach_post_metrics: [...outreach_post_metrics, metric] });
    return metric;
  }

  const { error } = await supabase.from("outreach_post_metrics").insert(metric);
  if (error) throw new Error(`Lỗi lưu số liệu outreach: ${error.message}`);
  return metric;
}
