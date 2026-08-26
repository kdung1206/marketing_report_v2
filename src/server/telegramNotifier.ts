// ---------------------------------------------------------------------------
// Outbound Telegram notifications — chosen over WhatsApp Business Cloud API
// for the token-expiry alert (see expiryNotifier.ts) because it needs no
// Meta Business verification, no phone number, and no pre-approved message
// template: create a bot via @BotFather (a few minutes, free), then sending
// a message is one plain fetch() POST. Setup steps for whoever configures
// this are in .env.example next to TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID.
//
// Kept generic (just "send this text") rather than expiry-specific, so any
// future alert (e.g. a failed cron run) can reuse it without a new module.
// ---------------------------------------------------------------------------

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

export const isTelegramConfigured = Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);

export async function sendTelegramMessage(text: string): Promise<void> {
  if (!isTelegramConfigured) {
    throw new Error("TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID chưa được cấu hình.");
  }

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.ok) {
    throw new Error(`Gửi Telegram thất bại: ${body?.description || `HTTP ${res.status}`}`);
  }
}
