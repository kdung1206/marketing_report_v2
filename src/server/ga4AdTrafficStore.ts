// ---------------------------------------------------------------------------
// Storage for ga4_ad_traffic_daily — web sessions + time on page per
// paid-campaign/ad, keyed by the UTM values GA4 reports (sessionCampaignName /
// sessionManualAdContent). Used to put "Time on page" on the Digital Ads
// Report's Top Ads cards by matching GA4 against ads_performance:
//   - Facebook ads tag their links with {{campaign.id}} / {{ad.id}}, so
//     campaign_key/ad_key equal the Meta campaign_id/ad_id that
//     facebookAdsSync.ts stores in ads_performance.extra (verified against
//     live GA4 data) — an exact per-ad match.
//   - TikTok ads tag the campaign NAME and no ad content (ad_key is
//     "(not set)"), so those only match at campaign level.
// Separate file from googleWebsiteStore.ts (which types its local collections
// explicitly) so this table doesn't touch that module's shared helpers.
// Same production-vs-local split as the other stores.
// ---------------------------------------------------------------------------
import { supabase, isSupabaseConfigured, fetchAllRows } from "./supabaseClient";
import { getDatabaseData, saveDatabaseData } from "./appStateStore";

export interface Ga4AdTrafficDailyRow {
  account_id: string;
  date: string; // YYYY-MM-DD
  campaign_key: string; // GA4 sessionCampaignName
  ad_key: string; // GA4 sessionManualAdContent ("(not set)" when untagged)
  sessions: number;
  engagement_seconds: number | null; // GA4 userEngagementDuration (total seconds)
  total_users: number | null; // GA4 totalUsers for that day+campaign+ad slice
}

const rowKey = (r: Pick<Ga4AdTrafficDailyRow, "account_id" | "date" | "campaign_key" | "ad_key">) =>
  `${r.account_id}|${r.date}|${r.campaign_key}|${r.ad_key}`;

export async function upsertGa4AdTrafficDaily(rows: Ga4AdTrafficDailyRow[]): Promise<void> {
  if (rows.length === 0) return;

  if (!isSupabaseConfigured) {
    const store = await getDatabaseData();
    const existing: Ga4AdTrafficDailyRow[] = Array.isArray(store.ga4_ad_traffic_daily) ? store.ga4_ad_traffic_daily : [];
    const byKey = new Map(existing.map((r) => [rowKey(r), r]));
    for (const row of rows) byKey.set(rowKey(row), row);
    await saveDatabaseData({ ...store, ga4_ad_traffic_daily: Array.from(byKey.values()) });
    return;
  }

  // Chunked: a 30+ day window of per-ad rows can exceed what's sensible for
  // one PostgREST request body.
  for (let i = 0; i < rows.length; i += 1000) {
    const { error } = await supabase
      .from("ga4_ad_traffic_daily")
      .upsert(rows.slice(i, i + 1000), { onConflict: "account_id,date,campaign_key,ad_key" });
    if (error) throw new Error(`Lỗi lưu số liệu GA4 theo quảng cáo: ${error.message}`);
  }
}

export interface Ga4AdTrafficSummaryRow {
  campaign_key: string;
  ad_key: string;
  sessions: number;
  // Time on page in seconds = sum(engagement_seconds) / sum(total_users) over
  // the range; null when no row has both.
  avg_time_on_page: number | null;
}

// One row per campaign_key+ad_key for the requested date range, already
// collapsed across days/accounts (engagement seconds and users are both additive) —
// the client only ever needs the per-ad total, so there's no reason to ship
// the daily rows.
export async function getGa4AdTrafficSummary(accountIds: string[], since: string, until: string): Promise<Ga4AdTrafficSummaryRow[]> {
  if (accountIds.length === 0) return [];

  let rows: Ga4AdTrafficDailyRow[];
  if (!isSupabaseConfigured) {
    const store = await getDatabaseData();
    const all: Ga4AdTrafficDailyRow[] = Array.isArray(store.ga4_ad_traffic_daily) ? store.ga4_ad_traffic_daily : [];
    rows = all.filter((r) => accountIds.includes(r.account_id) && r.date >= since && r.date <= until);
  } else {
    rows = await fetchAllRows<Ga4AdTrafficDailyRow>((from, to) =>
      supabase.from("ga4_ad_traffic_daily").select("*").in("account_id", accountIds).gte("date", since).lte("date", until).range(from, to)
    ).catch((err: any) => {
      throw new Error(`Lỗi đọc số liệu GA4 theo quảng cáo: ${err.message}`);
    });
  }

  const byKey = new Map<string, { campaign_key: string; ad_key: string; sessions: number; engagement: number; users: number }>();
  for (const r of rows) {
    const key = `${r.campaign_key}|${r.ad_key}`;
    const entry = byKey.get(key) || { campaign_key: r.campaign_key, ad_key: r.ad_key, sessions: 0, engagement: 0, users: 0 };
    entry.sessions += r.sessions || 0;
    if (r.engagement_seconds != null && r.total_users != null) {
      entry.engagement += Number(r.engagement_seconds);
      entry.users += Number(r.total_users);
    }
    byKey.set(key, entry);
  }
  return Array.from(byKey.values()).map((e) => ({
    campaign_key: e.campaign_key,
    ad_key: e.ad_key,
    sessions: e.sessions,
    avg_time_on_page: e.users > 0 ? e.engagement / e.users : null,
  }));
}
