// ---------------------------------------------------------------------------
// Weekly sync for the Keyword Rank Tracker + Brand SOV (search visibility)
// features. Unlike every other sync module in this codebase, this one calls
// a PAID, credit-metered API (serper.dev) — every call here has a real
// dollar cost, so this runs on its own explicit weekly schedule, never on a
// report page load.
//
// Credit budget this is designed around (confirmed with the user,
// 2026-09): 22 unique tracked keywords (see supabase/schema.sql's seed
// data — "Lọc nước" is shared between both brands and costs only 1 query
// since a single serper.dev result set is checked for BOTH brands' domains)
// + 5 SOV news queries (one per brand/competitor name) = ~27 credits/week,
// ≈21 months of runway on a 2500-credit free-tier grant. Do not change the
// cadence to daily or add many more tracked keywords without re-checking
// this math against the account's actual remaining credit balance.
// ---------------------------------------------------------------------------
import { searchGoogle, findDomainPosition, searchNewsMentionCount, isSerperConfigured } from "./serperClient";
import { getKeywordRankTargets, upsertKeywordRankHistory, upsertSovMentions, Brand } from "./seoToolsStore";

const BRAND_DOMAINS: Record<Brand, string> = {
  Karofi: "karofi.com",
  Livotec: "livotec.com",
};

// Kept in sync with the Dashboard's existing "Thị phần thảo luận" competitor
// list (Kangaroo/Sunhouse/Hòa Phát) so the new SOV card reads consistently
// alongside that one, even though the two numbers come from different
// sources and measure different things (see serperClient.ts's comment on
// searchNewsMentionCount).
const SOV_BRANDS = ["Karofi", "Livotec", "Kangaroo", "Sunhouse", "Hòa Phát"];

export interface KeywordRankSyncResult {
  keyword: string;
  ok: boolean;
  positions?: Partial<Record<Brand, number | null>>;
  error?: string;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function runKeywordRankSync(): Promise<KeywordRankSyncResult[]> {
  if (!isSerperConfigured) throw new Error("SERPER_API_KEY chưa được cấu hình.");

  const targets = (await getKeywordRankTargets()).filter((t) => t.is_active);
  const today = toDateStr(new Date());
  const results: KeywordRankSyncResult[] = [];

  // Sequential, not Promise.all — this is a paid API with its own rate
  // limits; there is no daily-report deadline pressure here the way there is
  // for GA4/Facebook syncs, so there's no reason to parallelize and risk
  // tripping a rate limit.
  for (const target of targets) {
    try {
      const organic = await searchGoogle(target.keyword);
      const rows: { target_id: string; brand: Brand; checked_at: string; position: number | null; ranking_url: string | null }[] = [];
      const positions: Partial<Record<Brand, number | null>> = {};

      for (const brand of target.brands) {
        const found = findDomainPosition(organic, BRAND_DOMAINS[brand]);
        rows.push({ target_id: target.id, brand, checked_at: today, position: found?.position ?? null, ranking_url: found?.url ?? null });
        positions[brand] = found?.position ?? null;
      }

      await upsertKeywordRankHistory(rows);
      results.push({ keyword: target.keyword, ok: true, positions });
    } catch (err: any) {
      console.error(`Rank tracker lỗi cho từ khoá "${target.keyword}":`, err.message || err);
      results.push({ keyword: target.keyword, ok: false, error: err.message || String(err) });
    }
  }

  return results;
}

export interface SovSyncResult {
  brand: string;
  ok: boolean;
  mention_count?: number;
  error?: string;
}

export async function runSovSync(): Promise<SovSyncResult[]> {
  if (!isSerperConfigured) throw new Error("SERPER_API_KEY chưa được cấu hình.");

  const today = toDateStr(new Date());
  const results: SovSyncResult[] = [];

  for (const brand of SOV_BRANDS) {
    try {
      const count = await searchNewsMentionCount(brand);
      await upsertSovMentions([{ brand_name: brand, checked_at: today, mention_count: count }]);
      results.push({ brand, ok: true, mention_count: count });
    } catch (err: any) {
      console.error(`SOV sync lỗi cho brand "${brand}":`, err.message || err);
      results.push({ brand, ok: false, error: err.message || String(err) });
    }
  }

  return results;
}
