// ---------------------------------------------------------------------------
// Storage + verification for the Backlink Tracker — see supabase/schema.sql's
// comment on the `backlinks` table. Verification is free (a plain fetch() +
// substring check against a URL the admin already entered), unlike the
// Keyword Rank Tracker/SOV in seoToolsSync.ts — runs on the existing daily
// cron with everything else.
// ---------------------------------------------------------------------------
import crypto from "crypto";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { getDatabaseData, saveDatabaseData } from "./appStateStore";

export type Brand = "Livotec" | "Karofi";
export type BacklinkStatus = "Submitted" | "Pending Review" | "Live" | "Removed";
export type LinkType = "dofollow" | "nofollow" | "unknown";

export interface Backlink {
  id: string;
  brand: Brand;
  source_platform: string;
  target_url: string;
  anchor_text: string | null;
  backlink_url: string;
  link_type: LinkType;
  status: BacklinkStatus;
  assignee_username: string | null;
  submitted_at: string | null;
  last_checked_at: string | null;
  last_check_result: "found" | "not_found" | "error" | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

function newId(): string {
  return crypto.randomUUID();
}

async function readLocal(): Promise<{ store: any; backlinks: Backlink[] }> {
  const store = await getDatabaseData();
  return { store, backlinks: Array.isArray(store.backlinks) ? store.backlinks : [] };
}

async function writeLocal(store: any, backlinks: Backlink[]): Promise<void> {
  await saveDatabaseData({ ...store, backlinks });
}

export async function getBacklinks(filters?: { brand?: Brand }): Promise<Backlink[]> {
  if (!isSupabaseConfigured) {
    const { backlinks } = await readLocal();
    return filters?.brand ? backlinks.filter((b) => b.brand === filters.brand) : backlinks;
  }
  let query = supabase.from("backlinks").select("*");
  if (filters?.brand) query = query.eq("brand", filters.brand);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(`Lỗi đọc danh sách backlink: ${error.message}`);
  return data || [];
}

export async function createBacklink(
  input: Pick<Backlink, "brand" | "source_platform" | "target_url" | "backlink_url"> &
    Partial<Pick<Backlink, "anchor_text" | "link_type" | "assignee_username" | "submitted_at">>,
  createdBy: string
): Promise<Backlink> {
  const now = new Date().toISOString();
  const backlink: Backlink = {
    id: newId(),
    brand: input.brand,
    source_platform: input.source_platform.trim(),
    target_url: input.target_url.trim(),
    anchor_text: input.anchor_text?.trim() || null,
    backlink_url: input.backlink_url.trim(),
    link_type: input.link_type || "unknown",
    status: "Submitted",
    assignee_username: input.assignee_username || null,
    submitted_at: input.submitted_at || now.slice(0, 10),
    last_checked_at: null,
    last_check_result: null,
    created_by: createdBy,
    created_at: now,
    updated_at: now,
  };

  if (!isSupabaseConfigured) {
    const { store, backlinks } = await readLocal();
    await writeLocal(store, [...backlinks, backlink]);
    return backlink;
  }

  const { error } = await supabase.from("backlinks").insert(backlink);
  if (error) throw new Error(`Lỗi thêm backlink: ${error.message}`);
  return backlink;
}

export async function updateBacklink(
  id: string,
  patch: Partial<Pick<Backlink, "source_platform" | "target_url" | "anchor_text" | "backlink_url" | "link_type" | "status" | "assignee_username" | "submitted_at">>
): Promise<void> {
  const updated_at = new Date().toISOString();
  if (!isSupabaseConfigured) {
    const { store, backlinks } = await readLocal();
    await writeLocal(store, backlinks.map((b) => (b.id === id ? { ...b, ...patch, updated_at } : b)));
    return;
  }
  const { error } = await supabase.from("backlinks").update({ ...patch, updated_at }).eq("id", id);
  if (error) throw new Error(`Lỗi cập nhật backlink: ${error.message}`);
}

export async function deleteBacklink(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, backlinks } = await readLocal();
    await writeLocal(store, backlinks.filter((b) => b.id !== id));
    return;
  }
  const { error } = await supabase.from("backlinks").delete().eq("id", id);
  if (error) throw new Error(`Lỗi xoá backlink: ${error.message}`);
}

async function setCheckResult(id: string, result: "found" | "not_found" | "error", newStatus?: BacklinkStatus): Promise<void> {
  const patch: Partial<Backlink> = { last_checked_at: new Date().toISOString(), last_check_result: result };
  if (newStatus) patch.status = newStatus;
  if (!isSupabaseConfigured) {
    const { store, backlinks } = await readLocal();
    await writeLocal(store, backlinks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    return;
  }
  const { error } = await supabase.from("backlinks").update(patch).eq("id", id);
  if (error) console.error("setCheckResult error:", error.message);
}

export interface BacklinkVerifyResult {
  id: string;
  backlink_url: string;
  ok: boolean;
  result: "found" | "not_found" | "error";
}

// Fetches each non-removed backlink's own URL and checks whether the page
// still contains a link to `target_url`'s hostname — a real (if blunt) proxy
// for "is this backlink still live". A page that 404s, times out, or no
// longer contains the target host all count as "not_found" (auto-flips
// status to "Removed"); a network/parse error that isn't really the link's
// fault leaves status untouched so a transient failure never wrongly marks
// a good backlink as removed.
export async function verifyAllBacklinks(): Promise<BacklinkVerifyResult[]> {
  const backlinks = (await getBacklinks()).filter((b) => b.status !== "Removed");
  const results: BacklinkVerifyResult[] = [];

  for (const b of backlinks) {
    try {
      const targetHost = new URL(b.target_url.includes("://") ? b.target_url : `https://${b.target_url}`).hostname.replace(/^www\./, "");
      const res = await fetch(b.backlink_url, { redirect: "follow" });
      if (!res.ok) {
        await setCheckResult(b.id, "not_found", "Removed");
        results.push({ id: b.id, backlink_url: b.backlink_url, ok: true, result: "not_found" });
        continue;
      }
      const html = await res.text();
      const found = html.toLowerCase().includes(targetHost.toLowerCase());
      await setCheckResult(b.id, found ? "found" : "not_found", found ? "Live" : "Removed");
      results.push({ id: b.id, backlink_url: b.backlink_url, ok: true, result: found ? "found" : "not_found" });
    } catch (err: any) {
      console.error(`Kiểm tra backlink lỗi (${b.backlink_url}):`, err.message || err);
      await setCheckResult(b.id, "error");
      results.push({ id: b.id, backlink_url: b.backlink_url, ok: false, result: "error" });
    }
  }

  return results;
}
