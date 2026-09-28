// ---------------------------------------------------------------------------
// On-page Optimization Scanner (Website Report → SEO Tools) — see
// HANDOFF.md's "On-page Optimization Scanner (SEO)" entry. Purely on-demand
// (POST /api/onpage-scan, see app.ts): an Editor pastes one URL, this fetches
// that page's HTML, extracts a handful of on-page SEO signals with plain
// regex (title/meta description length, H1 count, image alt-text coverage,
// internal/external link counts, rough word count — no HTML parser
// dependency, same "plain fetch, minimal deps" choice as every other
// integration in this codebase), then asks Gemini for concrete fix
// suggestions in Vietnamese.
//
// Deliberately NOT a scheduled crawl-the-whole-site job: this app's sites run
// ~250-300 pages each (see HANDOFF.md), and running a Gemini call per page on
// a cron would be slow, expensive, and mostly redundant — a human deciding
// which page to audit next (a new product page, an underperforming article
// from the Website Report's keyword/page tables) is a better fit than an
// unattended nightly sweep. No result persistence either, for the same
// reason backlink verification doesn't need Gemini history: this is a
// one-shot audit tool, not a tracked metric.
//
// Restricts scans to the brands' own connected domains (derived from
// google_website_accounts.gsc_site_url) rather than accepting any URL — this
// endpoint is a server-side fetch of whatever URL is passed in, so without
// that allowlist it would double as an open SSRF proxy for anyone with
// Editor access.
// ---------------------------------------------------------------------------
import { getGoogleWebsiteAccounts } from "./googleWebsiteStore";
import { geminiClient, isGeminiConfigured, GEMINI_MODEL } from "./geminiClient";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_HTML_LENGTH = 3_000_000; // ~3MB of markup is already an extreme outlier for a normal page

function deriveHostname(gscSiteUrl: string): string {
  const domain = gscSiteUrl.startsWith("sc-domain:") ? gscSiteUrl.slice("sc-domain:".length) : gscSiteUrl;
  const withScheme = domain.includes("://") ? domain : `https://${domain}`;
  try {
    return new URL(withScheme).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return domain.replace(/^www\./, "").toLowerCase();
  }
}

async function getAllowedHostnames(): Promise<string[]> {
  const accounts = await getGoogleWebsiteAccounts();
  return Array.from(new Set(accounts.filter((a) => a.gsc_site_url).map((a) => deriveHostname(a.gsc_site_url!))));
}

export function validateScanUrl(rawUrl: string, allowedHostnames: string[]): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("URL không hợp lệ.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Chỉ hỗ trợ URL http/https.");
  }
  const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
  if (!allowedHostnames.includes(hostname)) {
    throw new Error(
      allowedHostnames.length > 0
        ? `Chỉ quét được các domain đã kết nối Website Report: ${allowedHostnames.join(", ")}.`
        : "Chưa có brand nào kết nối Website Report (GA4/Search Console) — cần kết nối trước khi dùng công cụ này."
    );
  }
  return parsed;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAttr(tag: string, attr: string): string | null {
  const re = new RegExp(`${attr}\\s*=\\s*["']([^"']*)["']`, "i");
  const m = tag.match(re);
  return m ? m[1] : null;
}

export interface OnPageSignals {
  url: string;
  title: string | null;
  title_length: number;
  meta_description: string | null;
  meta_description_length: number;
  h1_count: number;
  h1_texts: string[];
  image_count: number;
  images_missing_alt: number;
  internal_link_count: number;
  external_link_count: number;
  word_count: number;
}

function extractSignals(html: string, pageUrl: URL): OnPageSignals {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]) : null;

  let metaDescription: string | null = null;
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const name = (extractAttr(tag[0], "name") || extractAttr(tag[0], "property") || "").toLowerCase();
    if (name === "description" || name === "og:description") {
      metaDescription = extractAttr(tag[0], "content");
      if (name === "description") break; // prefer the plain <meta name="description">, og: is a fallback
    }
  }

  const h1Texts = Array.from(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi), (m) => stripTags(m[1])).filter(Boolean);

  let imageCount = 0;
  let imagesMissingAlt = 0;
  for (const tag of html.matchAll(/<img\b[^>]*>/gi)) {
    imageCount++;
    const alt = extractAttr(tag[0], "alt");
    if (!alt || !alt.trim()) imagesMissingAlt++;
  }

  let internalLinks = 0;
  let externalLinks = 0;
  for (const tag of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = extractAttr(tag[0], "href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
    try {
      const resolved = new URL(href, pageUrl);
      const isInternal = resolved.hostname.replace(/^www\./, "").toLowerCase() === pageUrl.hostname.replace(/^www\./, "").toLowerCase();
      if (isInternal) internalLinks++;
      else externalLinks++;
    } catch {
      // Malformed href — ignore rather than miscounting it either way.
    }
  }

  const wordCount = stripTags(html).split(/\s+/).filter(Boolean).length;

  return {
    url: pageUrl.toString(),
    title,
    title_length: title?.length || 0,
    meta_description: metaDescription,
    meta_description_length: metaDescription?.length || 0,
    h1_count: h1Texts.length,
    h1_texts: h1Texts.slice(0, 5),
    image_count: imageCount,
    images_missing_alt: imagesMissingAlt,
    internal_link_count: internalLinks,
    external_link_count: externalLinks,
    word_count: wordCount,
  };
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { "User-Agent": "Mozilla/5.0 (compatible; OnPageScannerBot/1.0)" },
  });
  if (!res.ok) throw new Error(`Không tải được trang (HTTP ${res.status}).`);
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("html")) throw new Error(`URL này không trả về HTML (content-type: ${contentType || "không rõ"}).`);
  const text = await res.text();
  return text.length > MAX_HTML_LENGTH ? text.slice(0, MAX_HTML_LENGTH) : text;
}

async function suggestFixes(signals: OnPageSignals): Promise<string> {
  if (!isGeminiConfigured || !geminiClient) {
    return "Gemini chưa được cấu hình (GEMINI_API_KEY) — chỉ hiển thị số liệu thô, không có gợi ý AI.";
  }

  const prompt = `Bạn là chuyên gia SEO on-page. Dựa trên số liệu trích xuất từ trang web sau đây, hãy đưa ra nhận xét và gợi ý cải thiện ngắn gọn, thực tế bằng tiếng Việt (dạng gạch đầu dòng, tối đa 6 gợi ý, ưu tiên vấn đề nghiêm trọng nhất trước).

URL: ${signals.url}
Tiêu đề (title): "${signals.title || "(không có)"}" — ${signals.title_length} ký tự
Meta description: "${signals.meta_description || "(không có)"}" — ${signals.meta_description_length} ký tự
Số thẻ H1: ${signals.h1_count} (nội dung: ${signals.h1_texts.join(" | ") || "(không có)"})
Số ảnh: ${signals.image_count}, trong đó ${signals.images_missing_alt} ảnh thiếu thuộc tính alt
Internal link: ${signals.internal_link_count}, External link: ${signals.external_link_count}
Số từ nội dung ước tính: ${signals.word_count}

Tiêu chí tham khảo: title nên 50-60 ký tự, meta description 120-160 ký tự, đúng 1 thẻ H1 mỗi trang, ảnh nên có alt text mô tả, nội dung quá ngắn (dưới ~300 từ) thường khó xếp hạng tốt cho từ khoá cạnh tranh.`;

  const response = await geminiClient.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });
  return response.text || "Gemini không trả về nội dung.";
}

export interface OnPageScanResult {
  signals: OnPageSignals;
  ai_suggestions: string;
}

export async function scanPage(rawUrl: string): Promise<OnPageScanResult> {
  const allowedHostnames = await getAllowedHostnames();
  const pageUrl = validateScanUrl(rawUrl, allowedHostnames);
  const html = await fetchHtml(pageUrl.toString());
  const signals = extractSignals(html, pageUrl);
  const ai_suggestions = await suggestFixes(signals);
  return { signals, ai_suggestions };
}
