// ---------------------------------------------------------------------------
// Thin client for serper.dev (Google Search/News results via API) — powers
// the Keyword Rank Tracker and Brand SOV (search visibility) features in
// Website Report. Paid per query (credit-metered, not a free-forever API
// like GA4/Search Console) — see seoToolsSync.ts's header comment for the
// exact weekly credit budget this app is designed to stay within. Every
// caller of this module should be on a deliberately rate-limited schedule
// (the weekly cron), never called ad hoc from a report page load the way
// GA4/Search Console are.
// ---------------------------------------------------------------------------
const SERPER_API_BASE = "https://google.serper.dev";
const SERPER_API_KEY = process.env.SERPER_API_KEY || "";
export const isSerperConfigured = Boolean(SERPER_API_KEY);

class SerperApiError extends Error {}

async function serperPost(path: string, body: Record<string, unknown>): Promise<any> {
  if (!isSerperConfigured) throw new SerperApiError("SERPER_API_KEY chưa được cấu hình.");
  const res = await fetch(`${SERPER_API_BASE}${path}`, {
    method: "POST",
    headers: { "X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new SerperApiError(json?.message || `Serper API trả về lỗi HTTP ${res.status}`);
  }
  return json;
}

export interface SerperOrganicResult {
  position: number;
  title: string;
  link: string;
}

// 1 credit. gl=vn/hl=vi pins results to Vietnam/Vietnamese, matching what a
// real user searching from Vietnam would see — critical for rank tracking,
// since organic results vary heavily by region.
export async function searchGoogle(query: string, num = 30): Promise<SerperOrganicResult[]> {
  const body = await serperPost("/search", { q: query, gl: "vn", hl: "vi", num });
  return (body?.organic || []).map((r: any) => ({ position: r.position, title: r.title, link: r.link }));
}

// Finds the best (lowest-number) ranking position among organic results
// whose link's hostname ends with `domain` — e.g. domain "karofi.com" matches
// both "karofi.com" and "www.karofi.com", never a completely different site
// that merely contains that substring in its path/query.
export function findDomainPosition(results: SerperOrganicResult[], domain: string): { position: number; url: string } | null {
  const needle = domain.toLowerCase();
  for (const r of results) {
    try {
      const host = new URL(r.link).hostname.toLowerCase();
      if (host === needle || host.endsWith(`.${needle}`)) return { position: r.position, url: r.link };
    } catch {
      // Malformed link from the API — skip rather than throw.
    }
  }
  return null;
}

// 1 credit. Used for the Brand SOV (search-based, distinct from the
// Dashboard's own "Thị phần thảo luận" widget, which is a manually-entered
// number from a different source — see WebsiteReport.tsx's SOV card
// comment). Result count is a simple, cheap proxy for recent online
// visibility, not a precise mention-count analytics product.
export async function searchNewsMentionCount(query: string): Promise<number> {
  const body = await serperPost("/news", { q: query, gl: "vn", hl: "vi" });
  return Array.isArray(body?.news) ? body.news.length : 0;
}
