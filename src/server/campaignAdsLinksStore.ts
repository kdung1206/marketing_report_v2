// ---------------------------------------------------------------------------
// Storage layer for campaign_ads_links — links a Campaign Calendar entry to
// the real campaign_name(s) it runs as on each ad platform, so the Campaign
// Calendar drilldown (CampaignManagement.tsx) can show EXACT ad spend
// instead of budgetPacingNotifier.ts's brand+channel+date-range
// approximation. See supabase/schema.sql's comment on this table for why
// there's no direct campaign_id column on ads_performance itself.
//
// Same production-vs-local split as outreachStore.ts/campaignStore.ts.
// ---------------------------------------------------------------------------
import crypto from "crypto";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { getDatabaseData, saveDatabaseData } from "./appStateStore";
import { AdsChannel } from "./adsPerformanceStore";

export interface CampaignAdsLink {
  id: string;
  campaign_id: string;
  channel: AdsChannel;
  ads_campaign_name: string;
  added_by: string;
  created_at: string;
}

function newId(): string {
  return crypto.randomUUID();
}

async function readLocal(): Promise<{ store: any; campaign_ads_links: CampaignAdsLink[] }> {
  const store = await getDatabaseData();
  return { store, campaign_ads_links: Array.isArray(store.campaign_ads_links) ? store.campaign_ads_links : [] };
}

async function writeLocal(store: any, campaign_ads_links: CampaignAdsLink[]): Promise<void> {
  await saveDatabaseData({ ...store, campaign_ads_links });
}

export async function getCampaignAdsLinks(campaignId: string): Promise<CampaignAdsLink[]> {
  if (!isSupabaseConfigured) {
    const { campaign_ads_links } = await readLocal();
    return campaign_ads_links.filter((l) => l.campaign_id === campaignId);
  }
  const { data, error } = await supabase.from("campaign_ads_links").select("*").eq("campaign_id", campaignId).order("created_at", { ascending: true });
  if (error) throw new Error(`Lỗi đọc danh sách campaign quảng cáo đã gắn: ${error.message}`);
  return data || [];
}

export async function getCampaignAdsLink(id: string): Promise<CampaignAdsLink | null> {
  if (!isSupabaseConfigured) {
    const { campaign_ads_links } = await readLocal();
    return campaign_ads_links.find((l) => l.id === id) || null;
  }
  const { data, error } = await supabase.from("campaign_ads_links").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Lỗi đọc campaign quảng cáo đã gắn: ${error.message}`);
  return data;
}

export async function createCampaignAdsLink(
  input: { campaign_id: string; channel: AdsChannel; ads_campaign_name: string },
  addedBy: string
): Promise<CampaignAdsLink> {
  const link: CampaignAdsLink = {
    id: newId(),
    campaign_id: input.campaign_id,
    channel: input.channel,
    ads_campaign_name: input.ads_campaign_name.trim(),
    added_by: addedBy,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    const { store, campaign_ads_links } = await readLocal();
    if (campaign_ads_links.some((l) => l.campaign_id === link.campaign_id && l.channel === link.channel && l.ads_campaign_name === link.ads_campaign_name)) {
      throw new Error("Campaign quảng cáo này đã được gắn rồi.");
    }
    await writeLocal(store, [...campaign_ads_links, link]);
    return link;
  }

  const { error } = await supabase.from("campaign_ads_links").insert(link);
  if (error) {
    if (error.code === "23505") throw new Error("Campaign quảng cáo này đã được gắn rồi.");
    throw new Error(`Lỗi gắn campaign quảng cáo: ${error.message}`);
  }
  return link;
}

export async function deleteCampaignAdsLink(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, campaign_ads_links } = await readLocal();
    await writeLocal(store, campaign_ads_links.filter((l) => l.id !== id));
    return;
  }
  const { error } = await supabase.from("campaign_ads_links").delete().eq("id", id);
  if (error) throw new Error(`Lỗi gỡ campaign quảng cáo: ${error.message}`);
}
