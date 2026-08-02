// ---------------------------------------------------------------------------
// Weekly database backup email — builds the full-database .xlsx workbook
// (same layout as the "Xuất Database Đầy Đủ" button, see src/lib/export.ts)
// and emails it via the Admin-configured SMTP settings. Used by both:
//   - POST /api/send-backup-now (manual "Gửi thử ngay" button, Admin-only)
//   - GET  /api/cron/weekly-backup (Vercel Cron, every Friday 17:00 ICT —
//     see vercel.json)
// Node-only (nodemailer + xlsx buffer output) — never imported from client code.
// ---------------------------------------------------------------------------
import nodemailer from "nodemailer";
import * as XLSX from "xlsx";
import { buildFullDatabaseWorkbook, FullDatabaseExportPayload } from "../lib/export";

export interface DecryptedMailConfig {
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_pass: string; // plaintext at this point — caller must decrypt() first
  notification_email: string;
  enabled: boolean;
}

export function buildBackupAttachmentBuffer(payload: FullDatabaseExportPayload): Buffer {
  const workbook = buildFullDatabaseWorkbook(payload);
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export async function sendBackupEmail(
  config: DecryptedMailConfig,
  attachmentBuffer: Buffer,
  filename: string
): Promise<void> {
  if (!config.smtp_host || !config.smtp_user || !config.smtp_pass) {
    throw new Error("Chưa cấu hình đầy đủ SMTP (host / user / mật khẩu) — vào mục Sao Lưu Tự Động để thiết lập.");
  }
  if (!config.notification_email) {
    throw new Error("Chưa cấu hình email nhận backup.");
  }

  const port = Number(config.smtp_port) || 587;
  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port,
    secure: port === 465,
    auth: { user: config.smtp_user, pass: config.smtp_pass },
  });

  const todayLabel = new Date().toISOString().slice(0, 10);
  await transporter.sendMail({
    from: config.smtp_user,
    to: config.notification_email,
    subject: `[Marketing Report] Backup dữ liệu tự động — ${todayLabel}`,
    text:
      "Đính kèm là bản backup Excel đầy đủ của cơ sở dữ liệu Báo Cáo Marketing (Livotec & Karofi), " +
      "bao gồm digital_marketing, kol_koc, btl_trade, monthly_ooh_pr, btl_trade_monthly, nhận định và danh sách tài khoản.\n\n" +
      "Email này được gửi tự động vào 17:00 thứ Sáu hàng tuần.",
    attachments: [{ filename, content: attachmentBuffer }],
  });
}
