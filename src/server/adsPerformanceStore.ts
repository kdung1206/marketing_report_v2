// ---------------------------------------------------------------------------
// Storage layer for the Digital Ads Report module (paid-ads campaign
// performance across Facebook/Google/TikTok — see facebookAdsSync.ts for the
// Facebook Marketing API sync and src/lib/adsImport.ts for the Google/TikTok
// upload parsers). Separate from facebookStore.ts, which is organic Page
// Insights, not ads.
//
// Same production-vs-local split as facebookStore.ts/appStateStore.ts:
// production (Vercel, isSupabaseConfigured === true) uses the dedicated
// relational tables in supabase/schema.sql (ads_performance/fb_ad_accounts —
// this is time-series data that grows forever and needs date-range queries).
// Local dev has no real Supabase project to point at, so it stores the same
// two collections as extra arrays inside the existing local blob
// (src/db_store.json, via appStateStore's getDatabaseData/saveDatabaseData).
// ---------------------------------------------------------------------------
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { getDatabaseData, saveDatabaseData } from "./appStateStore";

export type AdsChannel = "facebook" | "google" | "tiktok";

export interface AdsPerformanceRow {
  channel: AdsChannel;
  brand: string | null;
  campaign_name: string;
  ad_group_name: string;
  ad_name: string;
  date: string; // YYYY-MM-DD
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  reach: number | null; // null for Google (not present in that export)
  frequency: number | null; // null for Google
  video_views: number | null; // TrueView views / video plays at 50% / 6s views — approximate, not identical across channels
  conversions: number | null; // Leads (FB) / Conversions (TikTok, Google)
  extra: Record<string, unknown>; // channel-specific leftovers (campaign_type, post_engagements, ...)
}

export interface FbAdAccountConfig {
  ad_account_id: string; // e.g. "act_1234567890"
  account_name: string;
  brand: string | null;
  access_token_encrypted: string;
  is_active: boolean;
  last_synced_at: string | null;
  last_sync_error: string | null;
  token_expired: boolean;
  created_at: string;
}

// -- Local (src/db_store.json) helpers ---------------------------------------

async function readLocalCollections(): Promise<{
  store: any;
  ads_performance: AdsPerformanceRow[];
  fb_ad_accounts: FbAdAccountConfig[];
}> {
  const store = await getDatabaseData();
  return {
    store,
    ads_performance: Array.isArray(store.ads_performance) ? store.ads_performance : [],
    fb_ad_accounts: Array.isArray(store.fb_ad_accounts) ? store.fb_ad_accounts : [],
  };
}

async function writeLocalCollections(
  store: any,
  updates: Partial<{ ads_performance: AdsPerformanceRow[]; fb_ad_accounts: FbAdAccountConfig[] }>
): Promise<void> {
  await saveDatabaseData({ ...store, ...updates });
}

function adsPerformanceKey(r: Pick<AdsPerformanceRow, "channel" | "campaign_name" | "ad_group_name" | "ad_name" | "date">): string {
  return `${r.channel}|${r.campaign_name}|${r.ad_group_name}|${r.ad_name}|${r.date}`;
}

// -- Ads performance ----------------------------------------------------------

export async function upsertAdsPerformance(rows: AdsPerformanceRow[]): Promise<void> {
  if (rows.length === 0) return;

  if (!isSupabaseConfigured) {
    const { store, ads_performance } = await readLocalCollections();
    const byKey = new Map(ads_performance.map((r) => [adsPerformanceKey(r), r]));
    for (const row of rows) byKey.set(adsPerformanceKey(row), row);
    await writeLocalCollections(store, { ads_performance: Array.from(byKey.values()) });
    return;
  }

  const { error } = await supabase
    .from("ads_performance")
    .upsert(rows, { onConflict: "channel,campaign_name,ad_group_name,ad_name,date" });
  if (error) throw new Error(`Lỗi lưu số liệu quảng cáo: ${error.message}`);
}

export async function getAdsPerformance(params: {
  channels?: AdsChannel[];
  brand?: string | null;
  since: string;
  until: string;
}): Promise<AdsPerformanceRow[]> {
  const { channels, brand, since, until } = params;

  if (!isSupabaseConfigured) {
    const { ads_performance } = await readLocalCollections();
    return ads_performance.filter((r) => {
      if (channels && channels.length > 0 && !channels.includes(r.channel)) return false;
      if (brand && r.brand !== brand) return false;
      return r.date >= since && r.date <= until;
    });
  }

  let query = supabase.from("ads_performance").select("*").gte("date", since).lte("date", until);
  // Guard against .in() with an empty array (PostgREST syntax error) — same
  // issue as getFbInsightsDaily/getFbPosts in facebookStore.ts.
  if (channels && channels.length > 0) query = query.in("channel", channels);
  if (brand) query = query.eq("brand", brand);
  const { data, error } = await query.order("date", { ascending: true });
  if (error) throw new Error(`Lỗi đọc số liệu quảng cáo: ${error.message}`);
  return data || [];
}

// -- Facebook Ad Accounts (Marketing API config) -------------------------------

export async function getFbAdAccounts(): Promise<FbAdAccountConfig[]> {
  if (!isSupabaseConfigured) {
    const { fb_ad_accounts } = await readLocalCollections();
    return fb_ad_accounts;
  }

  const { data, error } = await supabase.from("fb_ad_accounts").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(`Lỗi đọc danh sách Ad Account: ${error.message}`);
  return data || [];
}

export async function upsertFbAdAccount(input: {
  ad_account_id: string;
  account_name: string;
  brand?: string | null;
  access_token_encrypted: string;
  is_active?: boolean;
}): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, fb_ad_accounts } = await readLocalCollections();
    const existing = fb_ad_accounts.find((a) => a.ad_account_id === input.ad_account_id);
    const next: FbAdAccountConfig = {
      ad_account_id: input.ad_account_id,
      account_name: input.account_name,
      brand: input.brand !== undefined ? input.brand : existing?.brand ?? null,
      access_token_encrypted: input.access_token_encrypted,
      is_active: input.is_active !== undefined ? input.is_active : existing?.is_active !== false,
      last_synced_at: existing?.last_synced_at || null,
      last_sync_error: existing?.last_sync_error || null,
      token_expired: existing?.token_expired || false,
      created_at: existing?.created_at || new Date().toISOString(),
    };
    const rest = fb_ad_accounts.filter((a) => a.ad_account_id !== input.ad_account_id);
    await writeLocalCollections(store, { fb_ad_accounts: [...rest, next] });
    return;
  }

  const { error } = await supabase.from("fb_ad_accounts").upsert(
    {
      ad_account_id: input.ad_account_id,
      account_name: input.account_name,
      brand: input.brand !== undefined ? input.brand : null,
      access_token_encrypted: input.access_token_encrypted,
      is_active: input.is_active !== undefined ? input.is_active : true,
    },
    { onConflict: "ad_account_id" }
  );
  if (error) throw new Error(`Lỗi lưu cấu hình Ad Account: ${error.message}`);
}

export async function deleteFbAdAccount(adAccountId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, fb_ad_accounts, ads_performance } = await readLocalCollections();
    await writeLocalCollections(store, {
      fb_ad_accounts: fb_ad_accounts.filter((a) => a.ad_account_id !== adAccountId),
      // Ad-account-scoped rows aren't keyed by ad_account_id (only by
      // channel/campaign/ad_group/ad/date), so deleting the account config
      // intentionally leaves already-synced facebook rows in place — same
      // "config removal doesn't retroactively delete history" behavior as
      // fb_pages deletion has for fb_insights_daily in production (there it
      // cascades via FK; here there's no FK to cascade through by design,
      // since one ads_performance row isn't tied to a single ad account).
      ads_performance,
    });
    return;
  }

  const { error } = await supabase.from("fb_ad_accounts").delete().eq("ad_account_id", adAccountId);
  if (error) throw new Error(`Lỗi xóa cấu hình Ad Account: ${error.message}`);
}

export async function setFbAdAccountSyncStatus(
  adAccountId: string,
  status: { last_synced_at?: string | null; last_sync_error?: string | null; token_expired?: boolean }
): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, fb_ad_accounts } = await readLocalCollections();
    const next = fb_ad_accounts.map((a) => (a.ad_account_id === adAccountId ? { ...a, ...status } : a));
    await writeLocalCollections(store, { fb_ad_accounts: next });
    return;
  }

  const { error } = await supabase.from("fb_ad_accounts").update(status).eq("ad_account_id", adAccountId);
  if (error) throw new Error(`Lỗi cập nhật trạng thái đồng bộ Ad Account: ${error.message}`);
}
