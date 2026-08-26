// ---------------------------------------------------------------------------
// Pushes the same "token sắp hết hạn" warning that Control Panel → Kết nối
// nền tảng already shows in-app (FacebookPagesAdmin.tsx, TiktokAccountsAdmin.tsx,
// YoutubeAccountsAdmin.tsx) out to Telegram, so the ads/social team finds out
// even when nobody happens to have the Control Panel open — that in-app-only
// banner is exactly what missed the 2026-08-17 YouTube Testing-mode expiry
// live (see commit "fix: warn before a YouTube channel's Testing-mode token
// expires").
//
// Deliberately reuses the exact day-count math and WARN_WITHIN_DAYS
// thresholds already used by those three client components (7 / 30 / 2 days)
// rather than inventing new ones — same deadline fields, same "how many days
// left" formula, just evaluated server-side once a day instead of whenever
// an Admin happens to look.
//
// Two independent alert tiers per connection:
//   - "standard": fires once when the deadline first enters the platform's
//     usual warning window (7 / 30 / 2 days) — the early heads-up.
//   - "urgent": fires once more at <= URGENT_WARN_WITHIN_DAYS (1 day) left,
//     regardless of whether the standard tier already fired — a final,
//     harder-to-miss nudge right before the connection actually dies. Each
//     tier has its own dedupe column so getting the early warning doesn't
//     suppress the later urgent one.
// A connection that qualifies for both in the same run only shows once, as
// urgent (the more actionable message) — see pickTier().
// ---------------------------------------------------------------------------
import { getFbPages, setFbPageSyncStatus, FbPageConfig } from "./facebookStore";
import { getTiktokAccounts, setTiktokAccountSyncStatus, TiktokAccountConfig } from "./tiktokStore";
import { getYoutubeAccounts, setYoutubeAccountSyncStatus, YoutubeAccountConfig } from "./youtubeStore";
import { sendTelegramMessage, isTelegramConfigured } from "./telegramNotifier";

const FACEBOOK_WARN_WITHIN_DAYS = 7;
const TIKTOK_WARN_WITHIN_DAYS = 30;
const YOUTUBE_WARN_WITHIN_DAYS = 2;
const URGENT_WARN_WITHIN_DAYS = 1;

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / 86400000);
}

// Same "earliest of the two deadlines" rule as FacebookPagesAdmin.tsx's
// tokenDeadline() — a Page connection dies at whichever comes first.
function facebookDaysUntil(p: FbPageConfig): number | null {
  const times = [p.token_expires_at, p.token_data_access_expires_at]
    .filter((v): v is string => !!v)
    .map((v) => new Date(v).getTime())
    .filter((t) => !Number.isNaN(t));
  if (times.length === 0) return null;
  return Math.ceil((Math.min(...times) - Date.now()) / 86400000);
}

type Tier = "urgent" | "standard";

// Decides which tier (if any) a connection should be alerted at this run,
// preferring urgent over standard when both would otherwise fire.
function pickTier(
  days: number | null,
  warnWithinDays: number,
  standardAlreadySent: boolean,
  urgentAlreadySent: boolean
): Tier | null {
  if (days === null) return null;
  if (days <= URGENT_WARN_WITHIN_DAYS && !urgentAlreadySent) return "urgent";
  if (days <= warnWithinDays && !standardAlreadySent) return "standard";
  return null;
}

interface ExpiringItem {
  tier: Tier;
  emoji: string;
  platform: string;
  label: string;
  brand: string | null;
  days: number;
  markNotified: () => Promise<void>;
}

async function collectExpiring(): Promise<ExpiringItem[]> {
  const items: ExpiringItem[] = [];

  const pages = await getFbPages();
  for (const p of pages) {
    if (!p.is_active || p.token_expired) continue;
    const days = facebookDaysUntil(p);
    const tier = pickTier(days, FACEBOOK_WARN_WITHIN_DAYS, !!p.expiry_alert_sent_at, !!p.urgent_alert_sent_at);
    if (!tier || days === null) continue;
    items.push({
      tier,
      emoji: "🔵",
      platform: "Facebook",
      label: p.page_name,
      brand: p.brand,
      days,
      markNotified: () =>
        setFbPageSyncStatus(p.page_id, {
          [tier === "urgent" ? "urgent_alert_sent_at" : "expiry_alert_sent_at"]: new Date().toISOString(),
        }),
    });
  }

  const tiktokAccounts = await getTiktokAccounts();
  for (const a of tiktokAccounts) {
    if (!a.is_active || a.token_expired) continue;
    const days = daysUntil(a.refresh_token_expires_at);
    const tier = pickTier(days, TIKTOK_WARN_WITHIN_DAYS, !!a.expiry_alert_sent_at, !!a.urgent_alert_sent_at);
    if (!tier || days === null) continue;
    items.push({
      tier,
      emoji: "⚫",
      platform: "TikTok",
      label: a.display_name || a.username || a.open_id,
      brand: a.brand,
      days,
      markNotified: () =>
        setTiktokAccountSyncStatus(a.open_id, {
          [tier === "urgent" ? "urgent_alert_sent_at" : "expiry_alert_sent_at"]: new Date().toISOString(),
        }),
    });
  }

  const youtubeAccounts = await getYoutubeAccounts();
  for (const a of youtubeAccounts) {
    if (!a.is_active || a.token_expired) continue;
    const days = daysUntil(a.refresh_token_expires_at);
    const tier = pickTier(days, YOUTUBE_WARN_WITHIN_DAYS, !!a.expiry_alert_sent_at, !!a.urgent_alert_sent_at);
    if (!tier || days === null) continue;
    items.push({
      tier,
      emoji: "🔴",
      platform: "YouTube",
      label: a.channel_title || a.channel_id,
      brand: a.brand,
      days,
      markNotified: () =>
        setYoutubeAccountSyncStatus(a.channel_id, {
          [tier === "urgent" ? "urgent_alert_sent_at" : "expiry_alert_sent_at"]: new Date().toISOString(),
        }),
    });
  }

  return items;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface ExpiryCheckResult {
  checked: boolean;
  expiringCount: number;
  notified: boolean;
  error?: string;
}

function formatLine(it: ExpiringItem): string {
  const prefix = it.tier === "urgent" ? "🚨 <b>KHẨN CẤP</b>" : it.emoji;
  const daysText = it.days <= 0 ? "hôm nay hoặc đã quá hạn" : `còn <b>${it.days} ngày</b>`;
  return `${prefix} <b>${escapeHtml(it.platform)}</b> — ${escapeHtml(it.label)}${it.brand ? ` (${escapeHtml(it.brand)})` : ""}: ${daysText}`;
}

// Called from GET /api/cron/facebook-sync (see app.ts) — same daily cadence
// as the Facebook/TikTok/YouTube syncs it piggybacks on, run right after
// them so it reads each platform's freshest token_checked_at/expires_at.
export async function checkExpiringConnectionsAndNotify(): Promise<ExpiryCheckResult> {
  const expiring = await collectExpiring();
  if (expiring.length === 0) {
    return { checked: true, expiringCount: 0, notified: false };
  }

  if (!isTelegramConfigured) {
    console.warn(
      `expiryNotifier: ${expiring.length} kết nối sắp hết hạn nhưng TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID chưa cấu hình — không gửi được cảnh báo.`
    );
    return { checked: true, expiringCount: expiring.length, notified: false, error: "Telegram chưa cấu hình" };
  }

  // Urgent items first (most actionable), then standard, each group sorted
  // by days remaining ascending.
  const sorted = [...expiring].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier === "urgent" ? -1 : 1;
    return a.days - b.days;
  });
  const lines = sorted.map(formatLine);

  const text = `⚠️ <b>Cảnh báo kết nối sắp hết hạn</b>\n\n${lines.join("\n")}\n\nVào Control Panel → "Kết nối nền tảng" để cấp lại token/kết nối lại trước khi hết hạn.`;

  try {
    await sendTelegramMessage(text);
  } catch (err: any) {
    console.error("expiryNotifier: gửi Telegram thất bại:", err.message);
    return { checked: true, expiringCount: expiring.length, notified: false, error: err.message };
  }

  // Only mark as notified after the send actually succeeds — a failed send
  // must keep retrying tomorrow, not go silent.
  await Promise.all(expiring.map((it) => it.markNotified().catch((err) => console.error("expiryNotifier: markNotified lỗi:", err.message))));

  return { checked: true, expiringCount: expiring.length, notified: true };
}
