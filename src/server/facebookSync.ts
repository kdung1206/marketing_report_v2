// ---------------------------------------------------------------------------
// Pulls Page + Post Insights from the Facebook Graph API for every active
// row in fb_pages and upserts the results into fb_insights_daily/fb_posts
// (see facebookStore.ts). Called from POST /api/fb/sync-now (manual, Admin)
// and GET /api/cron/facebook-sync (daily, Vercel Cron) in app.ts.
//
// Metric names below are the best-known-current Page Insights field names —
// Meta renames/retires these periodically. Verify against
// https://developers.facebook.com/docs/graph-api/reference/page/insights (or
// GET /{page-id}/insights with no `metric` param, which lists the metrics
// actually valid for that page) if a metric starts erroring out. Each metric
// is requested individually specifically so one renamed/retired metric
// degrades gracefully (logged, field left null) instead of failing the
// entire page's sync.
// ---------------------------------------------------------------------------
import { decrypt } from "./crypto";
import {
  getFbPages,
  getFbInsightsDaily,
  upsertFbInsightsDaily,
  upsertFbPosts,
  setFbPageSyncStatus,
  FbInsightsDailyRow,
  FbPostRow,
} from "./facebookStore";

const GRAPH_API_VERSION = "v21.0";
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// How far back each sync run re-pulls data. Larger than "since the last
// successful sync" on purpose: Meta backfills/revises insights values for
// recent days after the fact, and this also self-heals any missed cron runs
// without needing to track per-page sync cursors.
const INSIGHTS_BACKFILL_DAYS = 14;
const POSTS_LOOKBACK_DAYS = 30;

// How many posts to fetch metrics for at once. Each post needs ~5 sequential
// Graph API round trips (4 metrics + a reactions batch); done one post at a
// time, a page with 20-30 recent posts alone can take well past Vercel's
// function timeout (see vercel.json's maxDuration) and get killed mid-run —
// this is what was producing the 504 on POST /api/fb/sync-now in practice.
// Capped rather than unbounded Promise.all to stay clear of Facebook's
// per-token rate limits.
const POST_FETCH_CONCURRENCY = 6;

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// page_impressions*/page_fans* (and their _paid/_unique variants) are gone —
// Meta returns "(#100) The value must be a valid insights metric" for all of
// them as of Graph API v21 (confirmed against a real Page, 2026-08). Only
// these two page-level metrics still return data:
const METRIC_FIELD_MAP: Record<string, keyof FbInsightsDailyRow> = {
  page_views_total: "page_views",
  page_post_engagements: "engaged_users",
};

// Same per-metric probing for post-level insights — request individually so
// a metric Meta has retired doesn't take down the others.
const POST_METRIC_FIELD_MAP: Record<string, keyof FbPostRow> = {
  post_impressions: "impressions",
  post_impressions_unique: "reach",
  post_engaged_users: "engaged_users",
  post_clicks: "clicks",
};

// Confirmed against a real post's error message ("Param type must be one of
// {NONE, LIKE, LOVE, WOW, HAHA, SAD, ANGRY, ...}") — SORRY/ANGER (an older
// naming) are not valid; Meta's current enum is SAD/ANGRY.
const REACTION_TYPES = ["LIKE", "LOVE", "WOW", "HAHA", "SAD", "ANGRY"] as const;
const REACTION_FIELD_BY_TYPE: Record<(typeof REACTION_TYPES)[number], keyof FbPostRow> = {
  LIKE: "likes",
  LOVE: "loves",
  WOW: "wows",
  HAHA: "hahas",
  SAD: "sorrys",
  ANGRY: "angers",
};

// Shared with facebookAdsSync.ts (Marketing API sync uses the same Graph API
// error shape and code-190-means-dead-token convention as this Page Insights
// sync — no reason to duplicate the error class or the fetch wrapper).
export function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Carries the Graph API's error `code`/`error_subcode` so callers can tell
// "the token is dead" (code 190 — OAuthException) apart from every other
// failure (rate limiting, a retired metric name, a transient API hiccup),
// which must never be treated as a dropped connection.
export class GraphApiError extends Error {
  code?: number;
  subcode?: number;
  constructor(message: string, code?: number, subcode?: number) {
    super(message);
    this.code = code;
    this.subcode = subcode;
  }
}

export function isTokenInvalidError(err: unknown): boolean {
  return err instanceof GraphApiError && err.code === 190;
}

// Mutable accumulator threaded through one page's sync run: true the moment
// ANY call for that page hits a code-190 error, even if other calls for the
// same page still succeed (most of ours are per-metric and individually
// swallowed so partial data keeps flowing — this is how a real "reconnect
// needed" signal still surfaces instead of getting lost in those catches).
export interface TokenStatus {
  invalid: boolean;
}

export async function graphGet(pathAndQuery: string, accessToken: string): Promise<any> {
  const sep = pathAndQuery.includes("?") ? "&" : "?";
  const url = `${GRAPH_API_BASE}${pathAndQuery}${sep}access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok || body?.error) {
    throw new GraphApiError(
      body?.error?.message || `Graph API trả về lỗi HTTP ${res.status}`,
      body?.error?.code,
      body?.error?.error_subcode
    );
  }
  return body;
}

async function fetchPageDailyInsights(
  pageId: string,
  accessToken: string,
  since: string,
  until: string,
  tokenStatus: TokenStatus
): Promise<FbInsightsDailyRow[]> {
  const byDate = new Map<string, FbInsightsDailyRow>();
  const getRow = (date: string): FbInsightsDailyRow => {
    let row = byDate.get(date);
    if (!row) {
      row = {
        page_id: pageId,
        date,
        impressions: null,
        impressions_paid: null,
        reach: null,
        reach_paid: null,
        page_views: null,
        fan_count: null,
        fan_adds: null,
        fan_removes: null,
        engaged_users: null,
      };
      byDate.set(date, row);
    }
    return row;
  };

  // Each metric/the follower snapshot is an independent Graph API call — run
  // them concurrently (each still individually try/caught) instead of
  // sequentially, same reasoning as fetchRecentPosts below.
  await Promise.all(
    Object.entries(METRIC_FIELD_MAP).map(async ([metric, field]) => {
      try {
        const body = await graphGet(
          `/${pageId}/insights?metric=${metric}&period=day&since=${since}&until=${until}`,
          accessToken
        );
        const series = body?.data?.[0]?.values || [];
        for (const point of series) {
          const value = Number(point?.value);
          if (!point?.end_time || Number.isNaN(value)) continue;
          const date = String(point.end_time).slice(0, 10);
          (getRow(date) as any)[field] = value;
        }
      } catch (err: any) {
        if (isTokenInvalidError(err)) tokenStatus.invalid = true;
        console.error(`Facebook metric "${metric}" (page ${pageId}) lỗi:`, err.message || err);
      }
    })
  );

  // page_fans/page_fan_adds/page_fan_removes (the old delta-based follower
  // metrics) are dead — see METRIC_FIELD_MAP's comment. The Page node itself
  // still exposes the current total via followers_count/fan_count, so we
  // snapshot that into *today's* row every sync run; the "Follower Growth"
  // chart is then built from our own accumulated daily snapshots rather than
  // from Facebook's (retired) historical series.
  try {
    const page = await graphGet(`/${pageId}?fields=followers_count,fan_count`, accessToken);
    const followers = typeof page.followers_count === "number" ? page.followers_count : page.fan_count;
    if (typeof followers === "number") {
      getRow(until).fan_count = followers;
    }
  } catch (err: any) {
    if (isTokenInvalidError(err)) tokenStatus.invalid = true;
    console.error(`Facebook followers_count (page ${pageId}) lỗi:`, err.message || err);
  }

  return Array.from(byDate.values());
}

async function fetchRecentPosts(
  pageId: string,
  accessToken: string,
  since: string,
  tokenStatus: TokenStatus
): Promise<FbPostRow[]> {
  let posts: any[] = [];
  try {
    const body = await graphGet(
      `/${pageId}/posts?since=${since}&fields=id,message,created_time,permalink_url,full_picture,shares,comments.limit(0).summary(true)`,
      accessToken
    );
    posts = body?.data || [];
  } catch (err: any) {
    if (isTokenInvalidError(err)) tokenStatus.invalid = true;
    throw err; // no post list at all means nothing else here can proceed
  }
  // Each post needs its own ~5 Graph API round trips (4 metrics + a
  // reactions batch); fetched with bounded concurrency across posts (rather
  // than one post fully at a time) so a page with many recent posts doesn't
  // run the whole sync past Vercel's function timeout — see
  // POST_FETCH_CONCURRENCY's comment.
  return mapWithConcurrency(posts, POST_FETCH_CONCURRENCY, async (post) => {
    const row: FbPostRow = {
      post_id: post.id,
      page_id: pageId,
      created_time: post.created_time,
      message: post.message || null,
      permalink: post.permalink_url || null,
      thumbnail_url: post.full_picture || null,
      reach: null,
      impressions: null,
      engaged_users: null,
      clicks: null,
      likes: null,
      loves: null,
      wows: null,
      hahas: null,
      sorrys: null,
      angers: null,
      comments: post.comments?.summary?.total_count ?? null,
      shares: post.shares?.count ?? null,
      synced_at: new Date().toISOString(),
    };

    // Requested one metric at a time (like fetchPageDailyInsights) — Meta has
    // retired individual post metrics before without warning, and a single
    // comma-joined request fails entirely if even one name is invalid. Fired
    // together with the reactions breakdown in one Promise.all (instead of
    // two sequential round trips) — each call is still independently
    // try/caught so one failing metric/reaction never affects the others.
    await Promise.all([
      ...Object.entries(POST_METRIC_FIELD_MAP).map(async ([metric, field]) => {
        try {
          const insights = await graphGet(`/${post.id}/insights?metric=${metric}`, accessToken);
          const value = insights?.data?.[0]?.values?.[0]?.value;
          if (typeof value === "number") (row as any)[field] = value;
        } catch (err: any) {
          if (isTokenInvalidError(err)) tokenStatus.invalid = true;
          console.error(`Facebook post metric "${metric}" (${post.id}) lỗi:`, err.message || err);
        }
      }),
      ...REACTION_TYPES.map(async (type) => {
        try {
          const r = await graphGet(`/${post.id}/reactions?type=${type}&summary=true&limit=0`, accessToken);
          (row as any)[REACTION_FIELD_BY_TYPE[type]] = r?.summary?.total_count ?? 0;
        } catch (err: any) {
          if (isTokenInvalidError(err)) tokenStatus.invalid = true;
          console.error(`Facebook reactions breakdown (${type}, ${post.id}) lỗi:`, err.message || err);
        }
      }),
    ]);

    return row;
  });
}

// Facebook never volunteers a token's remaining lifetime — it just starts
// answering with code 190 once the token is already dead, which is why an
// expired connection could only ever be noticed after the report had already
// gone stale. debug_token reports both deadlines that can kill a Page token:
//
//   expires_at             the token's own lifetime. 0/absent = never expires,
//                          which is what a Page token derived from a
//                          long-lived User Token normally gets.
//   data_access_expires_at Meta cuts the app off from the granting user's data
//                          ~90 days after they last used the app — this one
//                          bites even when the token itself never expires.
//
// The endpoint's `access_token` param officially wants an App token; we use
// one when FB_APP_ID/FB_APP_SECRET are set (both optional — see .env.example)
// and otherwise inspect the token with itself, which works for Page tokens and
// keeps this zero-config. Best effort throughout: this is a nice-to-have
// warning, so a failure here must never fail a sync that is otherwise pulling
// data fine.
export interface TokenExpiryInfo {
  expires_at: string | null;
  data_access_expires_at: string | null;
}

function expiryToIso(seconds: unknown): string | null {
  const n = Number(seconds);
  // 0 (and a missing field) is Facebook's "no such deadline", not "expired in
  // 1970" — both must read as null, never as a date in the past.
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Date(n * 1000).toISOString();
}

export async function fetchTokenExpiry(accessToken: string): Promise<TokenExpiryInfo | null> {
  const appId = process.env.FB_APP_ID;
  const appSecret = process.env.FB_APP_SECRET;
  const inspectorToken = appId && appSecret ? `${appId}|${appSecret}` : accessToken;
  try {
    const body = await graphGet(`/debug_token?input_token=${encodeURIComponent(accessToken)}`, inspectorToken);
    if (!body?.data) return null;
    return {
      expires_at: expiryToIso(body.data.expires_at),
      data_access_expires_at: expiryToIso(body.data.data_access_expires_at),
    };
  } catch (err: any) {
    console.error("Facebook debug_token lỗi:", err.message || err);
    return null;
  }
}

// Every run re-pulls a rolling INSIGHTS_BACKFILL_DAYS window and upserts whole
// rows, so any field Facebook didn't return this run comes back null and
// overwrites what an earlier run had already stored. That silently destroyed
// the follower history: fan_count only ever lands on *today's* row (Meta
// retired the historical page_fans* series — see METRIC_FIELD_MAP), so every
// earlier date in the window was being reset to null the next morning, leaving
// the "Follower Growth" chart with a single usable data point and "Follower
// mới" permanently at 0. Also covers the page_views/engaged_users case where a
// transient per-metric failure would otherwise blank out days that were
// already collected correctly. A null here always means "no value from this
// run", never a real zero — so stored values win over new nulls.
async function preserveStoredValues(
  pageId: string,
  rows: FbInsightsDailyRow[],
  since: string,
  until: string
): Promise<FbInsightsDailyRow[]> {
  const stored = await getFbInsightsDaily([pageId], since, until);
  if (stored.length === 0) return rows;

  const storedByDate = new Map(stored.map((r) => [r.date, r]));
  return rows.map((row) => {
    const old = storedByDate.get(row.date);
    if (!old) return row;
    const merged: FbInsightsDailyRow = { ...row };
    for (const key of Object.keys(merged) as (keyof FbInsightsDailyRow)[]) {
      if (key === "page_id" || key === "date") continue;
      if (merged[key] == null && old[key] != null) (merged as any)[key] = old[key];
    }
    return merged;
  });
}

export interface FacebookSyncResult {
  page_id: string;
  page_name: string;
  ok: boolean;
  error?: string;
}

export async function runFacebookSync(): Promise<FacebookSyncResult[]> {
  const pages = (await getFbPages()).filter((p) => p.is_active);

  const now = new Date();
  const until = toDateStr(now);
  const since = toDateStr(new Date(now.getTime() - INSIGHTS_BACKFILL_DAYS * 24 * 60 * 60 * 1000));
  const postsSince = toDateStr(new Date(now.getTime() - POSTS_LOOKBACK_DAYS * 24 * 60 * 60 * 1000));

  // Pages are fully independent of each other (own token, own rows, own
  // sync-status row) — run them concurrently rather than one at a time.
  // Sequential per-page was the other half of the 504s on
  // POST /api/fb/sync-now: with N pages each taking tens of seconds for
  // their posts, only the first page or two would finish before Vercel
  // killed the whole request.
  return Promise.all(
    pages.map(async (page): Promise<FacebookSyncResult> => {
      // Threaded through every Graph API call made for this page — true the
      // moment any of them comes back with a confirmed-dead token (code 190).
      // Everything else (network blips, a retired metric, temporary API
      // errors) leaves this false: the page stays connected and next sync
      // just retries with the same stored token, per the "never auto-drop a
      // connection unless Facebook itself says the token is dead" contract.
      const tokenStatus: TokenStatus = { invalid: false };
      try {
        const accessToken = decrypt(page.access_token_encrypted);
        if (!accessToken) throw new Error("Access token trống hoặc giải mã thất bại.");

        // The token probe is independent of the data pull — fired alongside it
        // rather than before, so refreshing the expiry costs no extra wall
        // clock against Vercel's function timeout.
        const [expiry, dailyRows] = await Promise.all([
          fetchTokenExpiry(accessToken),
          fetchPageDailyInsights(page.page_id, accessToken, since, until, tokenStatus),
        ]);
        if (dailyRows.length > 0) {
          await upsertFbInsightsDaily(await preserveStoredValues(page.page_id, dailyRows, since, until));
        }

        const postRows = await fetchRecentPosts(page.page_id, accessToken, postsSince, tokenStatus);
        if (postRows.length > 0) await upsertFbPosts(postRows);

        await setFbPageSyncStatus(page.page_id, {
          last_synced_at: new Date().toISOString(),
          last_sync_error: null,
          token_expired: tokenStatus.invalid,
          // Only written when the probe actually answered — a failed probe
          // must leave the last known deadlines in place rather than blanking
          // them back to "unknown".
          ...(expiry
            ? {
                token_expires_at: expiry.expires_at,
                token_data_access_expires_at: expiry.data_access_expires_at,
                token_checked_at: new Date().toISOString(),
              }
            : {}),
        });
        return { page_id: page.page_id, page_name: page.page_name, ok: true };
      } catch (err: any) {
        const message = err?.message || String(err);
        console.error(`Đồng bộ Facebook thất bại cho page ${page.page_id}:`, message);
        await setFbPageSyncStatus(page.page_id, { last_sync_error: message, token_expired: tokenStatus.invalid }).catch(() => {});
        return { page_id: page.page_id, page_name: page.page_name, ok: false, error: message };
      }
    })
  );
}
