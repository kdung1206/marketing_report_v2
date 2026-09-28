// ---------------------------------------------------------------------------
// Technical SEO Monitor (Website Report → SEO Tools) — see HANDOFF.md's
// "Technical SEO Monitor" entry. Three independent, all-free checks per
// connected Website (GA4/Search Console) account:
//
//   1. Broken-link crawl — discover every URL from the site's sitemap.xml
//      (or whatever robots.txt declares) and check each one's HTTP status.
//      Plain fetch, no XML library — same "no heavy SDK" choice as
//      googleWebsiteSync.ts, and sitemap.xml's <loc> tags are simple enough
//      that a regex is both correct and much lighter than pulling in a full
//      XML parser dependency.
//   2. PageSpeed Insights — homepage performance score + Core Web Vitals via
//      Google's public PageSpeedOnline API (free, 25k req/day — needs
//      PAGESPEED_API_KEY in practice: confirmed live while building this
//      that the shared unauthenticated quota is already exhausted globally,
//      see PAGESPEED_API_KEY's comment in .env.example). Deliberately scoped to
//      just the homepage, not every page: this app has no reliable way to
//      pick "the important pages" beyond that, and PSI is slow (~10-20s per
//      call) — running it for hundreds of URLs would blow the cron's time
//      budget for very little signal beyond the homepage's own result.
//   3. Sitemap coverage — Search Console's Sitemaps API (submitted/indexed
//      counts, warnings/errors, last downloaded), a genuinely different
//      signal from #1: this is what Google itself thinks of the sitemaps the
//      site owner submitted in Search Console, independent of whatever this
//      app's own crawler in #1 found by convention.
//
// Deliberately does NOT call Search Console's URL Inspection API (indexing
// status per URL) — that quota is far tighter (a few hundred/day is
// realistic before rate-limiting) and checking it for every sitemap URL
// weekly would burn most of it for one property alone. Left for a future
// session if the user wants per-URL indexing status specifically; the three
// checks above already cover "is anything broken / slow / not properly
// submitted".
//
// Runs on its own weekly cron (GET /api/cron/technical-seo-weekly, see
// vercel.json) rather than piggybacking on the daily facebook-sync cron:
// crawling a few hundred URLs plus a PageSpeed call is genuinely slow (this
// is network-bound, not cheap like the backlink/recurring-task checks that
// do piggyback there), and site health doesn't change minute-to-minute the
// way ad spend or follower counts do.
// ---------------------------------------------------------------------------
import { getGoogleWebsiteAccounts, GoogleWebsiteAccountConfig } from "./googleWebsiteStore";
import { getFreshAccessToken } from "./googleWebsiteSync";
import { upsertTechnicalSeoChecks, pruneStaleTechnicalSeoChecks, TechnicalSeoCheck, TechnicalSeoCheckType } from "./technicalSeoStore";
import { sendTelegramMessage, isTelegramConfigured } from "./telegramNotifier";

const SEARCH_CONSOLE_API_BASE = "https://www.googleapis.com/webmasters/v3";
const PAGESPEED_API_BASE = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY || "";

// Bounds the crawl to a sane size regardless of how large a real sitemap
// turns out to be — this app's own sites run ~250-300 URLs (see HANDOFF.md's
// "Xem URL thật" finding for karofi.com), so this comfortably covers a real
// site without risking a runaway crawl against an unexpectedly huge sitemap.
const MAX_CRAWL_URLS = 300;
const CRAWL_CONCURRENCY = 10;
const FETCH_TIMEOUT_MS = 10_000;

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

// "sc-domain:karofi.com" (domain property) or "https://karofi.com/" (URL-
// prefix property) — Search Console accepts both kinds of site, but only the
// latter is directly fetchable. Domain properties have no scheme at all, so
// this always assumes https (every real site this app tracks serves https).
function deriveOrigin(gscSiteUrl: string): string {
  const domain = gscSiteUrl.startsWith("sc-domain:") ? gscSiteUrl.slice("sc-domain:".length) : gscSiteUrl;
  const withScheme = domain.includes("://") ? domain : `https://${domain}`;
  return withScheme.replace(/\/+$/, "");
}

function extractLocs(xml: string): string[] {
  const matches = xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi);
  return Array.from(matches, (m) => m[1].trim());
}

// robots.txt is the canonical place a site declares its sitemap(s) — falls
// back to the conventional /sitemap.xml path if robots.txt has no Sitemap:
// line (or doesn't exist), which is what most small/mid sites actually do.
async function discoverSitemapLocations(origin: string): Promise<string[]> {
  try {
    const res = await fetch(`${origin}/robots.txt`, { signal: withTimeout(FETCH_TIMEOUT_MS) });
    if (res.ok) {
      const text = await res.text();
      const found = Array.from(text.matchAll(/^\s*Sitemap:\s*(\S+)/gim), (m) => m[1].trim());
      if (found.length > 0) return found;
    }
  } catch {
    // robots.txt missing/unreachable — fall through to the default path.
  }
  return [`${origin}/sitemap.xml`];
}

export interface SitemapFetchFailure {
  url: string;
  error: string;
}

// One level of recursion for sitemap index files (<sitemapindex> pointing at
// several child <sitemap><loc> files) — enough for how sitemap index nesting
// actually works in practice (a second level would be unusual and this is
// already capped by MAX_CRAWL_URLS regardless).
//
// A sitemap.xml that fails to fetch is itself surfaced as a failure (see
// sitemapFailures below) rather than silently skipped — confirmed against
// this app's real site while building this: karofi.com/sitemap1.xml
// currently 500s, which would otherwise have gone completely unnoticed (0
// URLs discovered, 0 broken links reported, no error anywhere).
async function discoverSitemapUrls(origin: string): Promise<{ urls: string[]; sitemapLocations: string[]; sitemapFailures: SitemapFetchFailure[] }> {
  const sitemapLocations = await discoverSitemapLocations(origin);
  const allUrls: string[] = [];
  const sitemapFailures: SitemapFetchFailure[] = [];

  for (const loc of sitemapLocations) {
    try {
      const res = await fetch(loc, { signal: withTimeout(FETCH_TIMEOUT_MS) });
      if (!res.ok) {
        sitemapFailures.push({ url: loc, error: `HTTP ${res.status}` });
        continue;
      }
      const xml = await res.text();
      const isIndex = /<sitemapindex/i.test(xml);
      if (isIndex) {
        const childLocs = extractLocs(xml);
        for (const childLoc of childLocs) {
          if (allUrls.length >= MAX_CRAWL_URLS) break;
          try {
            const childRes = await fetch(childLoc, { signal: withTimeout(FETCH_TIMEOUT_MS) });
            if (!childRes.ok) {
              sitemapFailures.push({ url: childLoc, error: `HTTP ${childRes.status}` });
              continue;
            }
            allUrls.push(...extractLocs(await childRes.text()));
          } catch (err: any) {
            sitemapFailures.push({ url: childLoc, error: err.message || String(err) });
          }
        }
      } else {
        allUrls.push(...extractLocs(xml));
      }
    } catch (err: any) {
      sitemapFailures.push({ url: loc, error: err.message || String(err) });
    }
  }

  return { urls: Array.from(new Set(allUrls)).slice(0, MAX_CRAWL_URLS), sitemapLocations, sitemapFailures };
}

export interface CrawlResult {
  url: string;
  ok: boolean;
  status_code: number | null;
  error: string | null;
}

// HEAD first (cheaper — no body transferred); a real handful of servers
// return 405/406 or otherwise misbehave on HEAD even though GET works fine,
// so anything that isn't a plain 2xx/3xx/4xx/5xx HTTP response falls back to
// GET once before being counted as broken.
async function checkUrl(url: string): Promise<CrawlResult> {
  try {
    const headRes = await fetch(url, { method: "HEAD", redirect: "follow", signal: withTimeout(FETCH_TIMEOUT_MS) });
    if (headRes.status !== 405 && headRes.status !== 501) {
      return { url, ok: headRes.ok, status_code: headRes.status, error: null };
    }
  } catch {
    // Fall through to GET — some servers reject HEAD outright (connection
    // reset, not just a 405 status).
  }
  try {
    const getRes = await fetch(url, { method: "GET", redirect: "follow", signal: withTimeout(FETCH_TIMEOUT_MS) });
    return { url, ok: getRes.ok, status_code: getRes.status, error: null };
  } catch (err: any) {
    return { url, ok: false, status_code: null, error: err.message || String(err) };
  }
}

async function crawlUrls(urls: string[]): Promise<CrawlResult[]> {
  const results: CrawlResult[] = [];
  for (let i = 0; i < urls.length; i += CRAWL_CONCURRENCY) {
    const batch = urls.slice(i, i + CRAWL_CONCURRENCY);
    results.push(...(await Promise.all(batch.map(checkUrl))));
  }
  return results;
}

export interface PageSpeedResult {
  ok: boolean;
  performance_score: number | null; // 0-100
  lcp_ms: number | null;
  cls: number | null;
  error?: string;
}

async function fetchPageSpeed(url: string, strategy: "mobile" | "desktop" = "mobile"): Promise<PageSpeedResult> {
  const params = new URLSearchParams({ url, strategy, category: "performance" });
  if (PAGESPEED_API_KEY) params.set("key", PAGESPEED_API_KEY);

  try {
    // PSI genuinely takes a while (it runs a real Lighthouse audit
    // server-side) — a longer timeout than the plain fetch checks above.
    const res = await fetch(`${PAGESPEED_API_BASE}?${params.toString()}`, { signal: withTimeout(30_000) });
    const body = await res.json();
    if (!res.ok || body?.error) {
      return { ok: false, performance_score: null, lcp_ms: null, cls: null, error: body?.error?.message || `HTTP ${res.status}` };
    }
    const perfScore = body?.lighthouseResult?.categories?.performance?.score;
    const audits = body?.lighthouseResult?.audits || {};
    return {
      ok: true,
      performance_score: typeof perfScore === "number" ? Math.round(perfScore * 100) : null,
      lcp_ms: audits["largest-contentful-paint"]?.numericValue ?? null,
      cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
    };
  } catch (err: any) {
    return { ok: false, performance_score: null, lcp_ms: null, cls: null, error: err.message || String(err) };
  }
}

interface SitemapStatusEntry {
  path: string;
  is_pending: boolean;
  is_sitemaps_index: boolean;
  last_downloaded: string | null;
  warnings: number;
  errors: number;
  submitted: number | null;
  indexed: number | null;
}

async function fetchSitemapsStatus(accessToken: string, siteUrl: string): Promise<SitemapStatusEntry[]> {
  const res = await fetch(`${SEARCH_CONSOLE_API_BASE}/sites/${encodeURIComponent(siteUrl)}/sitemaps`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: withTimeout(FETCH_TIMEOUT_MS),
  });
  const body = await res.json();
  if (!res.ok || body?.error) {
    throw new Error(body?.error?.message || `Search Console sitemaps.list trả về lỗi HTTP ${res.status}`);
  }
  return (body?.sitemap || []).map((s: any) => {
    const contents = s.contents || [];
    return {
      path: s.path,
      is_pending: !!s.isPending,
      is_sitemaps_index: !!s.isSitemapsIndex,
      last_downloaded: s.lastDownloaded || null,
      warnings: Number(s.warnings) || 0,
      errors: Number(s.errors) || 0,
      submitted: contents.length > 0 ? contents.reduce((sum: number, c: any) => sum + (Number(c.submitted) || 0), 0) : null,
      indexed: contents.length > 0 ? contents.reduce((sum: number, c: any) => sum + (Number(c.indexed) || 0), 0) : null,
    };
  });
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface TechnicalSeoRunResult {
  account_id: string;
  brand: string | null;
  ok: boolean;
  broken_links_found?: number;
  urls_crawled?: number;
  pagespeed_score?: number | null;
  sitemap_issues_found?: number;
  error?: string;
}

const PAGESPEED_WARN_THRESHOLD = 50; // Google's own "poor" cutoff for the performance category

async function runAccountCheck(account: GoogleWebsiteAccountConfig): Promise<{ result: TechnicalSeoRunResult; alertLines: string[] }> {
  const origin = deriveOrigin(account.gsc_site_url!);
  const now = new Date().toISOString();
  const alertLines: string[] = [];
  const rows: TechnicalSeoCheck[] = [];

  // 1. Broken-link crawl
  const { urls, sitemapFailures } = await discoverSitemapUrls(origin);
  const crawlResults = urls.length > 0 ? await crawlUrls(urls) : [];
  let brokenCount = 0;
  for (const r of crawlResults) {
    const status: "ok" | "error" = r.ok ? "ok" : "error";
    if (status === "error") brokenCount++;
    rows.push({
      account_id: account.id,
      check_type: "broken_link",
      url: r.url,
      status,
      details: { status_code: r.status_code, error: r.error },
      first_detected_at: now,
      checked_at: now,
    });
  }
  // The sitemap.xml file itself failing to load is tracked the same way as
  // any other broken URL (it IS one) — see discoverSitemapUrls's header
  // comment for why this matters more than an average broken page.
  for (const f of sitemapFailures) {
    rows.push({
      account_id: account.id,
      check_type: "broken_link",
      url: f.url,
      status: "error",
      details: { status_code: null, error: f.error, is_sitemap_file: true },
      first_detected_at: now,
      checked_at: now,
    });
  }
  if (crawlResults.length > 0 || sitemapFailures.length > 0) {
    await pruneStaleTechnicalSeoChecks(account.id, "broken_link", [...urls, ...sitemapFailures.map((f) => f.url)]);
  }

  // 2. PageSpeed Insights (homepage only, mobile — see header comment)
  const pagespeed = await fetchPageSpeed(origin, "mobile");
  const pagespeedStatus: "ok" | "error" | "warning" = !pagespeed.ok
    ? "warning" // PSI itself failing (rate limit, timeout) isn't a site problem worth alerting on
    : pagespeed.performance_score !== null && pagespeed.performance_score < PAGESPEED_WARN_THRESHOLD
    ? "error"
    : "ok";
  rows.push({
    account_id: account.id,
    check_type: "pagespeed",
    url: origin,
    status: pagespeedStatus,
    details: { performance_score: pagespeed.performance_score, lcp_ms: pagespeed.lcp_ms, cls: pagespeed.cls, error: pagespeed.error },
    first_detected_at: now,
    checked_at: now,
  });

  // 3. Search Console Sitemaps API — isolated in its own try/catch: a token
  // refresh failure or a transient Google outage here must not discard the
  // crawl + PageSpeed results above, which already succeeded and are worth
  // keeping on their own.
  let sitemapIssues = 0;
  let sitemapCheckError: string | null = null;
  try {
    const accessToken = await getFreshAccessToken(account);
    const sitemapEntries = await fetchSitemapsStatus(accessToken, account.gsc_site_url!);
    for (const s of sitemapEntries) {
      const hasIssue = s.errors > 0 || s.warnings > 0;
      if (hasIssue) sitemapIssues++;
      rows.push({
        account_id: account.id,
        check_type: "sitemap",
        url: s.path,
        status: hasIssue ? "error" : "ok",
        details: { ...s },
        first_detected_at: now,
        checked_at: now,
      });
    }
    if (sitemapEntries.length > 0) await pruneStaleTechnicalSeoChecks(account.id, "sitemap", sitemapEntries.map((s) => s.path));
  } catch (err: any) {
    sitemapCheckError = err.message || String(err);
    console.error(`technicalSeoSync: lỗi kiểm tra Search Console Sitemaps API cho account ${account.id}:`, sitemapCheckError);
  }

  await upsertTechnicalSeoChecks(rows);

  const brandLabel = account.brand ? ` (${escapeHtml(account.brand)})` : "";
  if (sitemapFailures.length > 0) {
    alertLines.push(
      `🔴🔴 <b>Sitemap không tải được</b>${brandLabel}: ${sitemapFailures.map((f) => `${escapeHtml(f.url)} (${escapeHtml(f.error)})`).join(", ")}. ` +
        (urls.length === 0 ? "Không thể quét toàn bộ trang do sitemap lỗi." : "")
    );
  }
  if (brokenCount > 0) {
    const examples = crawlResults.filter((r) => !r.ok).slice(0, 5).map((r) => `${escapeHtml(r.url)} — HTTP ${r.status_code ?? "lỗi kết nối"}`);
    alertLines.push(
      `🔴 <b>${brokenCount} URL lỗi</b>${brandLabel} (${origin}):\n${examples.map((e) => `  ${e}`).join("\n")}${brokenCount > 5 ? `\n  … và ${brokenCount - 5} URL khác` : ""}`
    );
  }
  if (pagespeedStatus === "error") {
    alertLines.push(`🟡 <b>PageSpeed điểm thấp</b>${brandLabel}: ${pagespeed.performance_score}/100 (trang chủ, mobile) — LCP ${pagespeed.lcp_ms ? Math.round(pagespeed.lcp_ms) : "?"}ms.`);
  }
  if (sitemapIssues > 0) {
    alertLines.push(`🟠 <b>${sitemapIssues} sitemap có cảnh báo/lỗi</b>${brandLabel} theo Search Console.`);
  }

  return {
    result: {
      account_id: account.id,
      brand: account.brand,
      ok: true,
      broken_links_found: brokenCount,
      urls_crawled: crawlResults.length,
      pagespeed_score: pagespeed.performance_score,
      sitemap_issues_found: sitemapIssues,
      ...(sitemapCheckError ? { error: `Sitemap coverage (Search Console) bỏ qua: ${sitemapCheckError}` } : {}),
    },
    alertLines,
  };
}

export async function runTechnicalSeoSync(): Promise<TechnicalSeoRunResult[]> {
  const accounts = (await getGoogleWebsiteAccounts()).filter((a) => a.is_active && a.gsc_site_url);
  const results: TechnicalSeoRunResult[] = [];
  const allAlertLines: string[] = [];

  for (const account of accounts) {
    try {
      const { result, alertLines } = await runAccountCheck(account);
      results.push(result);
      allAlertLines.push(...alertLines);
    } catch (err: any) {
      const message = err?.message || String(err);
      console.error(`technicalSeoSync: lỗi kiểm tra cho account ${account.id}:`, message);
      results.push({ account_id: account.id, brand: account.brand, ok: false, error: message });
    }
  }

  // Same "log a warning, don't fail the run" contract as every other
  // notifier here — the checks themselves already succeeded and are stored;
  // only the Telegram push is best-effort.
  if (allAlertLines.length > 0) {
    if (!isTelegramConfigured) {
      console.warn(`technicalSeoSync: ${allAlertLines.length} vấn đề Technical SEO nhưng Telegram chưa cấu hình.`);
    } else {
      const text = `⚠️ <b>Technical SEO Monitor</b>\n\n${allAlertLines.join("\n\n")}\n\nVào Website Report → SEO Tools để xem chi tiết.`;
      await sendTelegramMessage(text).catch((err) => console.error("technicalSeoSync: gửi Telegram thất bại:", err.message));
    }
  }

  return results;
}
