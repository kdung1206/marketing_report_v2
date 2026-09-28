// ---------------------------------------------------------------------------
// Budget & Pacing alert (Ads) — "Ngân sách & Pacing" trong
// Phan_Tich_Cong_Viec_SEO_Ads_Automation.xlsx's "Ads Branding Tasks" sheet
// (xem HANDOFF.md mục 0, "Đang dở" #1). Free — reuses data that already
// exists: Campaign Calendar's campaigns.budget/start_date/end_date/brand
// (Digital Ads Report has no budget field of its own) and the Digital Ads
// Report's ads_performance.spend (Facebook/Google/TikTok, already synced
// daily/uploaded).
//
// Deliberately does NOT try to match a campaign to "its" rows in
// ads_performance by name/id — campaigns.channel is free text typed by
// whoever created the campaign, and there is no reliable foreign key between
// a Campaign Calendar entry and the campaign_name an ad platform actually
// uses (a single Calendar "campaign" often spans several ad-platform
// campaigns, or none at all yet). Instead it sums ALL spend for that
// brand + the channel(s) parsed out of campaigns.channel, over the
// campaign's own date range — the same aggregate-by-brand-and-channel
// approach the rest of the Digital Ads Report already relies on.
//
// Pacing = % of budget spent vs % of the campaign's time elapsed. A
// campaign that is 50% through its flight but has already spent 80% of
// budget is running "over" pace (will exhaust budget before the end date);
// one that's 50% through but only spent 20% is running "under" pace (won't
// spend the full budget, likely under-delivering).
// ---------------------------------------------------------------------------
import { getCampaigns, setCampaignPacingAlertStatus, Campaign } from "./campaignStore";
import { getAdsPerformance, AdsChannel } from "./adsPerformanceStore";
import { sendTelegramMessage, isTelegramConfigured } from "./telegramNotifier";

// How far the budget-used% vs time-elapsed% can drift before it's worth
// interrupting someone — matches the >15% figure the user chose when this
// was scoped out (see HANDOFF.md).
const PACING_DEVIATION_THRESHOLD = 0.15;

// Once a campaign is alerted for a given state (over/under), don't repeat
// the same alert every day it stays that way — but do remind again after a
// week so a long-running drift doesn't just fall off everyone's radar
// (same "eventually re-notify" idea as expiryNotifier's urgent tier, just on
// a fixed interval instead of a second threshold).
const REMINDER_AFTER_DAYS = 7;

type PacingState = "over" | "under" | "ok";

function mapChannelText(channelText: string): AdsChannel[] {
  const text = channelText.toLowerCase();
  const out: AdsChannel[] = [];
  if (text.includes("facebook") || /\bfb\b/.test(text)) out.push("facebook");
  if (text.includes("google")) out.push("google");
  if (text.includes("tiktok")) out.push("tiktok");
  return out;
}

function toDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

interface PacingComputation {
  channels: AdsChannel[];
  timeElapsedPct: number; // 0..1
  budgetUsedPct: number; // can exceed 1
  actualSpend: number;
  deviation: number; // budgetUsedPct - timeElapsedPct
  state: PacingState;
  daysRemaining: number;
  projectedExhaustionDate: string | null; // only set when state === "over"
}

async function computePacing(c: Campaign): Promise<PacingComputation | null> {
  if (!c.budget || c.budget <= 0 || !c.channel) return null;
  const channels = mapChannelText(c.channel);
  if (channels.length === 0) return null;

  const startMs = new Date(c.start_date).getTime();
  const endMs = new Date(c.end_date).getTime();
  const totalMs = endMs - startMs;
  if (!Number.isFinite(totalMs) || totalMs <= 0) return null;

  const nowMs = Date.now();
  const elapsedMs = Math.min(Math.max(nowMs - startMs, 0), totalMs);
  const timeElapsedPct = elapsedMs / totalMs;

  const today = toDateOnly(new Date().toISOString());
  const until = today < toDateOnly(c.end_date) ? today : toDateOnly(c.end_date);
  const since = toDateOnly(c.start_date);

  const rows = await getAdsPerformance({ channels, brand: c.brand, since, until });
  const actualSpend = rows.reduce((sum, r) => sum + (r.spend || 0), 0);
  const budgetUsedPct = actualSpend / c.budget;
  const deviation = budgetUsedPct - timeElapsedPct;

  let state: PacingState = "ok";
  if (deviation > PACING_DEVIATION_THRESHOLD) state = "over";
  else if (deviation < -PACING_DEVIATION_THRESHOLD) state = "under";

  const daysRemaining = Math.max(0, Math.ceil((endMs - nowMs) / 86400000));

  let projectedExhaustionDate: string | null = null;
  if (state === "over" && elapsedMs > 0) {
    const avgDailySpend = actualSpend / (elapsedMs / 86400000);
    if (avgDailySpend > 0) {
      const daysUntilExhausted = c.budget / avgDailySpend;
      projectedExhaustionDate = toDateOnly(new Date(startMs + daysUntilExhausted * 86400000).toISOString());
    }
  }

  return { channels, timeElapsedPct, budgetUsedPct, actualSpend, deviation, state, daysRemaining, projectedExhaustionDate };
}

function formatMoney(n: number): string {
  return Math.round(n).toLocaleString("vi-VN");
}

function formatLine(c: Campaign, p: PacingComputation): string {
  const emoji = p.state === "over" ? "🔴" : "🟡";
  const label = p.state === "over" ? "Vượt tiến độ chi tiêu" : "Chi tiêu chậm hơn tiến độ";
  const lines = [
    `${emoji} <b>${label}</b> — ${escapeHtml(c.name)} (${escapeHtml(c.brand)}, ${escapeHtml(c.channel || "")})`,
    `  Đã dùng <b>${formatMoney(p.actualSpend)}đ</b> / ${formatMoney(c.budget!)}đ ngân sách (${Math.round(p.budgetUsedPct * 100)}%), trong khi đã qua ${Math.round(p.timeElapsedPct * 100)}% thời gian chạy.`,
  ];
  if (p.state === "over" && p.projectedExhaustionDate) {
    lines.push(`  Dự kiến cạn ngân sách vào khoảng <b>${p.projectedExhaustionDate}</b> (còn ${p.daysRemaining} ngày tới hạn kết thúc).`);
  } else {
    lines.push(`  Còn ${p.daysRemaining} ngày tới hạn kết thúc.`);
  }
  return lines.join("\n");
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface BudgetPacingCheckResult {
  checked: boolean;
  evaluatedCount: number;
  alertedCount: number;
  notified: boolean;
  error?: string;
}

// Called from GET /api/cron/facebook-sync (see app.ts) — piggybacks on the
// existing daily cron for the same "no extra Vercel Cron job needed" reason
// as the recurring-task generation and backlink verification already there;
// this is free (no paid API), unlike the Keyword Rank Tracker/SOV sync.
export async function checkBudgetPacingAndNotify(): Promise<BudgetPacingCheckResult> {
  const liveCampaigns = await getCampaigns({ status: "Live" });

  const toAlert: { campaign: Campaign; pacing: PacingComputation }[] = [];
  const toReset: string[] = [];
  let evaluatedCount = 0;

  for (const c of liveCampaigns) {
    const pacing = await computePacing(c).catch((err) => {
      console.error(`budgetPacingNotifier: lỗi tính pacing cho campaign ${c.id}:`, err.message);
      return null;
    });
    if (!pacing) continue;
    evaluatedCount++;

    if (pacing.state === "ok") {
      if (c.pacing_alert_state) toReset.push(c.id);
      continue;
    }

    const daysSinceLastAlert = c.pacing_alert_sent_at ? (Date.now() - new Date(c.pacing_alert_sent_at).getTime()) / 86400000 : Infinity;
    const isNewState = c.pacing_alert_state !== pacing.state;
    if (isNewState || daysSinceLastAlert >= REMINDER_AFTER_DAYS) {
      toAlert.push({ campaign: c, pacing });
    }
  }

  // Recovered campaigns are reset regardless of whether Telegram is
  // configured/succeeds — this is just clearing stale state, not a
  // notification, so it shouldn't depend on that.
  await Promise.all(
    toReset.map((id) =>
      setCampaignPacingAlertStatus(id, { pacing_alert_state: null, pacing_alert_sent_at: null }).catch((err) =>
        console.error(`budgetPacingNotifier: lỗi reset trạng thái pacing cho campaign ${id}:`, err.message)
      )
    )
  );

  if (toAlert.length === 0) {
    return { checked: true, evaluatedCount, alertedCount: 0, notified: false };
  }

  if (!isTelegramConfigured) {
    console.warn(`budgetPacingNotifier: ${toAlert.length} campaign lệch pacing nhưng TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID chưa cấu hình — không gửi được cảnh báo.`);
    return { checked: true, evaluatedCount, alertedCount: toAlert.length, notified: false, error: "Telegram chưa cấu hình" };
  }

  const sorted = [...toAlert].sort((a, b) => b.pacing.deviation - a.pacing.deviation);
  const text = `⚠️ <b>Cảnh báo ngân sách & pacing (Ads)</b>\n\n${sorted.map(({ campaign, pacing }) => formatLine(campaign, pacing)).join("\n\n")}\n\nVào Campaign Marketing → Campaign Calendar để xem chi tiết.`;

  try {
    await sendTelegramMessage(text);
  } catch (err: any) {
    console.error("budgetPacingNotifier: gửi Telegram thất bại:", err.message);
    return { checked: true, evaluatedCount, alertedCount: toAlert.length, notified: false, error: err.message };
  }

  // Only mark as notified after the send actually succeeds — same reasoning
  // as expiryNotifier: a failed send must keep retrying, not go silent.
  await Promise.all(
    sorted.map(({ campaign, pacing }) =>
      setCampaignPacingAlertStatus(campaign.id, { pacing_alert_state: pacing.state as "over" | "under", pacing_alert_sent_at: new Date().toISOString() }).catch(
        (err) => console.error(`budgetPacingNotifier: lỗi lưu trạng thái pacing cho campaign ${campaign.id}:`, err.message)
      )
    )
  );

  return { checked: true, evaluatedCount, alertedCount: toAlert.length, notified: true };
}
