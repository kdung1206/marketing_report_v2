import crypto from "crypto";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { normalizeMarketingData, getBtlReportMonth } from "../data";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { getDatabaseData, saveDatabaseData } from "./appStateStore";
import { DEFAULT_USERS, reconcileUsers, UserAccount } from "../lib/defaultUsers";
import { hashPasswordScrypt, generateServerSalt, isScryptHash, verifyPasswordAny } from "../lib/serverPasswordHash";
import { requireAuth, signSessionToken, signOAuthState, verifyOAuthState } from "./auth";
import { buildBackupAttachmentBuffer, sendBackupEmail } from "./backupMailer";
import { encrypt, decrypt } from "./crypto";
import { getFbPages, upsertFbPage, deleteFbPage, getFbInsightsDaily, getFbPosts } from "./facebookStore";
import { runFacebookSync } from "./facebookSync";
import {
  getAdsPerformance,
  upsertAdsPerformance,
  getFbAdAccounts,
  upsertFbAdAccount,
  deleteFbAdAccount,
  AdsChannel,
  AdsPerformanceRow,
} from "./adsPerformanceStore";
import { runFacebookAdsSync } from "./facebookAdsSync";
import { getTiktokAccounts, deleteTiktokAccount, upsertTiktokAccount, getTiktokInsightsDaily, getTiktokPosts } from "./tiktokStore";
import {
  exchangeTiktokCode,
  runTiktokSync,
  fetchUserInfo as fetchTiktokUserInfo,
  isTiktokConfigured,
  TIKTOK_CLIENT_KEY,
  TIKTOK_REDIRECT_URI,
  TIKTOK_AUTHORIZE_URL,
  TIKTOK_SCOPES,
} from "./tiktokSync";

// .env.local (documented in README) takes precedence for local dev; .env is
// the fallback. On Vercel neither file exists — env vars are injected
// directly into process.env by the platform, so this is a no-op there.
dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

export const app = express();

app.use(express.json({ limit: "20mb" }));

// ---------------------------------------------------------------------------
// POST /api/login rate limiting — keyed by "<ip>|<username>" (see
// supabase/schema.sql: login_attempts table + record_login_failure /
// reset_login_attempts functions). Backed by Supabase rather than an
// in-memory counter because Vercel serverless functions don't share memory
// across invocations/instances; an in-memory counter would reset on every
// cold start and give no real protection.
//
// 5 failed attempts / 15-minute window → 15-minute lockout, auto-clears
// itself (no permanent ban, no manual unlock needed). Deliberately not a
// stricter 3-attempt cutoff: the default usernames in this very repo
// (defaultUsers.ts) are public, so a low fixed cutoff would let anyone lock
// out a real account just by failing a few logins on purpose. Keying by
// ip+username (not username alone) keeps that DoS surface bounded to one
// attacker IP, while still stopping credential stuffing against one account
// from a botnet (each bot IP gets its own budget, but a slow escalating delay
// below adds friction regardless of source IP).
// ---------------------------------------------------------------------------
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_SECONDS = 15 * 60;
const LOGIN_LOCKOUT_SECONDS = 15 * 60;

function getClientIp(req: express.Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (first) return first.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

function loginAttemptKey(req: express.Request, username: string): string {
  return `${getClientIp(req)}|${username.trim().toLowerCase()}`;
}

// ---------------------------------------------------------------------------
// Local-only in-memory fallbacks (rate limiting + audit logs), used only when
// isSupabaseConfigured is false — i.e. local dev, which must never touch the
// real database (see supabaseClient.ts). Process memory is fine here: it's
// never running as Vercel serverless (Vercel always has Supabase configured),
// so there's exactly one long-lived process and no cross-instance state to
// keep consistent. Resets on every `npm run dev` restart, which is expected.
// ---------------------------------------------------------------------------
const localLoginAttempts = new Map<string, { failCount: number; windowStartedAt: number; lockedUntil: number | null }>();
let localLoginLogId = 1;
const localLoginLogs: {
  id: number; username: string; status: "success" | "failure"; ip: string | null;
  user_agent: string | null; session_id: string | null; created_at: string;
}[] = [];
let localActionLogId = 1;
const localActionLogs: {
  id: number; username: string; role: string | null; action: string;
  details: string | null; ip: string | null; created_at: string;
}[] = [];

async function getLoginLockout(key: string): Promise<Date | null> {
  if (!isSupabaseConfigured) {
    const rec = localLoginAttempts.get(key);
    if (!rec?.lockedUntil) return null;
    return rec.lockedUntil > Date.now() ? new Date(rec.lockedUntil) : null;
  }
  const { data, error } = await supabase
    .from("login_attempts")
    .select("locked_until")
    .eq("key", key)
    .maybeSingle();
  if (error || !data?.locked_until) return null;
  const lockedUntil = new Date(data.locked_until);
  return lockedUntil.getTime() > Date.now() ? lockedUntil : null;
}

// Returns the failure count after recording this attempt, used to scale the
// escalating response delay below.
async function recordLoginFailure(key: string): Promise<number> {
  if (!isSupabaseConfigured) {
    const now = Date.now();
    const existing = localLoginAttempts.get(key);
    const windowExpired = !existing || now - existing.windowStartedAt > LOGIN_WINDOW_SECONDS * 1000;
    const rec = windowExpired
      ? { failCount: 1, windowStartedAt: now, lockedUntil: null as number | null }
      : { ...existing, failCount: existing.failCount + 1 };
    if (rec.failCount >= LOGIN_MAX_ATTEMPTS) rec.lockedUntil = now + LOGIN_LOCKOUT_SECONDS * 1000;
    localLoginAttempts.set(key, rec);
    return rec.failCount;
  }
  const { data, error } = await supabase.rpc("record_login_failure", {
    p_key: key,
    p_window_seconds: LOGIN_WINDOW_SECONDS,
    p_max_attempts: LOGIN_MAX_ATTEMPTS,
    p_lockout_seconds: LOGIN_LOCKOUT_SECONDS,
  });
  if (error) {
    console.error("record_login_failure error:", error.message);
    return 1;
  }
  return data?.[0]?.fail_count ?? 1;
}

async function resetLoginAttempts(key: string): Promise<void> {
  if (!isSupabaseConfigured) {
    localLoginAttempts.delete(key);
    return;
  }
  const { error } = await supabase.rpc("reset_login_attempts", { p_key: key });
  if (error) console.error("reset_login_attempts error:", error.message);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getUserAgent(req: express.Request): string {
  return (req.headers["user-agent"] as string) || "unknown";
}

// Records every POST /api/login attempt (success or failure) to login_logs —
// see supabase/schema.sql. Never throws: a logging failure must not block a
// real login, so errors are swallowed here (and reported to the server
// console only) rather than propagated to the route handler.
async function logLoginAttempt(
  username: string,
  status: "success" | "failure",
  req: express.Request,
  sessionId: string | null
): Promise<void> {
  if (!isSupabaseConfigured) {
    localLoginLogs.unshift({
      id: localLoginLogId++,
      username: username.trim().toLowerCase(),
      status,
      ip: getClientIp(req),
      user_agent: getUserAgent(req),
      session_id: sessionId,
      created_at: new Date().toISOString(),
    });
    return;
  }
  const { error } = await supabase.from("login_logs").insert({
    username: username.trim().toLowerCase(),
    status,
    ip: getClientIp(req),
    user_agent: getUserAgent(req),
    session_id: sessionId,
  });
  if (error) console.error("logLoginAttempt error:", error.message);
}

// Records a mutating action to action_logs for the audit trail (GET
// /api/action-logs). Same never-throws contract as logLoginAttempt above.
async function logAction(
  session: { username: string; role: string },
  req: express.Request,
  action: string,
  details?: string
): Promise<void> {
  if (!isSupabaseConfigured) {
    localActionLogs.unshift({
      id: localActionLogId++,
      username: session.username,
      role: session.role,
      action,
      details: details ?? null,
      ip: getClientIp(req),
      created_at: new Date().toISOString(),
    });
    return;
  }
  const { error } = await supabase.from("action_logs").insert({
    username: session.username,
    role: session.role,
    action,
    details: details ?? null,
    ip: getClientIp(req),
  });
  if (error) console.error("logAction error:", error.message);
}

// POST /api/login — the only public data endpoint. Verifies credentials
// server-side and issues a signed session token; the client never sees any
// passwordHash/salt in the response, and never sees other accounts' hashes
// either (contrast with the old client-side login, which fetched the full
// account list including every hash+salt before checking anything).
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu." });
    }

    const attemptKey = loginAttemptKey(req, String(username));
    const existingLockout = await getLoginLockout(attemptKey);
    if (existingLockout) {
      const minutesLeft = Math.max(1, Math.ceil((existingLockout.getTime() - Date.now()) / 60000));
      return res.status(429).json({
        error: `Tài khoản tạm thời bị khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau khoảng ${minutesLeft} phút.`,
      });
    }

    const store = await getDatabaseData();
    const storedUsers: UserAccount[] = Array.isArray(store.users) ? store.users : [];
    // Same reconciliation the client applies to /api/get-users results: merge
    // DEFAULT_USERS with any custom accounts added via the user-management UI.
    const allUsers = reconcileUsers(storedUsers, -1);

    const candidate = allUsers.find((u) => u.username.toLowerCase() === String(username).trim().toLowerCase());
    const ok = candidate?.passwordHash && candidate?.salt
      ? await verifyPasswordAny(String(password), candidate.salt, candidate.passwordHash)
      : false;

    if (!candidate || !ok) {
      const failCount = await recordLoginFailure(attemptKey);
      await logLoginAttempt(String(username), "failure", req, null);
      // Escalating delay (1s, 2s, 3s, 4s... capped at 8s) slows down
      // automated brute-forcing even before the lockout threshold trips.
      await sleep(Math.min(failCount * 1000, 8000));
      return res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không chính xác." });
    }

    await resetLoginAttempts(attemptKey);

    // Transparently migrate accounts still on the legacy single-round
    // SHA-256 format to scrypt now that we know the correct plaintext.
    // No-op for accounts already on "scrypt:" and for the 5 hardcoded
    // DEFAULT_USERS (their source of truth is defaultUsers.ts, not this
    // Supabase row — see reconcileUsers above), but real for any custom
    // account created through the user-management UI.
    if (candidate.passwordHash && !isScryptHash(candidate.passwordHash)) {
      const migratedHash = hashPasswordScrypt(String(password), candidate.salt!);
      const migratedUsers = storedUsers.map((u) =>
        u.username.toLowerCase() === candidate.username.toLowerCase() ? { ...u, passwordHash: migratedHash } : u
      );
      store.users = migratedUsers;
      await saveDatabaseData(store).catch((err) => console.error("Login hash migration save failed:", err));
    }

    const { token, sid } = signSessionToken(candidate);
    await logLoginAttempt(candidate.username, "success", req, sid);
    return res.json({
      success: true,
      token,
      user: { username: candidate.username, name: candidate.name, role: candidate.role },
    });
  } catch (err: any) {
    console.error("POST /api/login error:", err);
    return res.status(500).json({ error: `Lỗi đăng nhập: ${err.message}` });
  }
});

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY is not configured or uses placeholder value.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini API Client:", error);
}

// API: Fetch file from Google Drive via direct link
app.post("/api/fetch-drive", requireAuth("Editor"), async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Vui lòng cung cấp link Google Drive" });
    }

    // Regular expressions to extract file ID from Google Drive link
    const regId1 = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const regId2 = /[?&]id=([a-zA-Z0-9_-]+)/;

    let fileId = "";
    const match1 = url.match(regId1);
    const match2 = url.match(regId2);

    if (match1 && match1[1]) {
      fileId = match1[1];
    } else if (match2 && match2[1]) {
      fileId = match2[1];
    } else {
      // Direct string can be treated as ID
      fileId = url.trim();
    }

    if (url.includes("/folders/")) {
      return res.status(400).json({ error: "Đường dẫn bạn cung cấp là Thư mục (Folder). Vui lòng cung cấp link của một tệp tin (File) JSON cụ thể ở chế độ công khai." });
    }

    if (!fileId || fileId.length < 10) {
      return res.status(400).json({ error: "Không tìm thấy ID tệp Google Drive hợp lệ từ đường dẫn." });
    }

    // Google Drive direct export download link
    const downloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
    console.log(`Attempting to fetch Google Drive file ID: ${fileId} from ${downloadUrl}`);

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Google Drive trả về mã lỗi: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();

    // Verify if downloaded content is actually HTML (often Google login or permission screen)
    if (text.includes("<!DOCTYPE html>") || text.includes("<html") || text.includes("google.com/accounts/Login")) {
      return res.status(401).json({
        error: "Không thể tải trực tuyến. Tệp Google Drive phải được chia sẻ ở chế độ 'Bất kỳ ai có đường link đều có thể xem' (Anyone with link can view). Vui lòng kiểm tra lại quyền chia sẻ trên Google Drive hoặc copy-paste thủ công."
      });
    }

    try {
      const jsonData = JSON.parse(text);
      await logAction((req as any).session, req, "fetch-drive", `Tải tệp từ Google Drive (fileId: ${fileId})`);
      return res.json({ success: true, data: jsonData });
    } catch (parseError) {
      console.error("Failed to parse fetched content as JSON. Head:", text.substring(0, 200));
      return res.status(422).json({
        error: "Tải tệp thành công nhưng nội dung tệp không phải định dạng JSON hợp lệ. Vui lòng kiểm tra lại cấu trúc file.",
        preview: text.substring(0, 200)
      });
    }

  } catch (error: any) {
    console.error("Fetch Drive error:", error);
    return res.status(500).json({ error: `Lỗi kết nối tệp: ${error.message || error}` });
  }
});

// API: Call Gemini to analyze marketing report
app.post("/api/analyze", requireAuth("Editor"), async (req, res) => {
  try {
    const { data, brand } = req.body;
    if (!data) {
      return res.status(400).json({ error: "Không có dữ liệu đầu vào để phân tích." });
    }

    if (!ai) {
      return res.status(503).json({
        error: "Gemini API chưa được định cấu hình. Bạn hãy cấu hình GEMINI_API_KEY trong phần Secrets, hoặc sử dụng các bản biên tập thủ công cực kỳ chi tiết có sẵn.",
      });
    }

    const brandName = brand || "Livotec";
    const dataString = typeof data === "string" ? data : JSON.stringify(data, null, 2);

    const prompt = `Bạn là một Chuyên gia Phân tích Dữ liệu Marketing (Marketing Data Analyst) chuyên nghiệp.
Hãy đọc và phân tích chuyên sâu báo cáo chiến dịch tuần này của thương hiệu "${brandName}" dựa trên dữ liệu JSON được cung cấp dưới đây.

Dưới đây là dữ liệu báo cáo chiến dịch:
${dataString}

YÊU CẦU:
Hãy xuất ra nhận định phân tích bằng tiếng Việt theo cấu trúc JSON định dạng chính xác sau đây. Các nhận xét cần chuyên sâu, kết hợp các con số thực tế có trong dữ liệu (ví dụ: số bài viết, chi phí đã tiêu, impressions, reach, CPM, organic traffic...) và đưa ra phân tích sắc bén, lời khuyên thực tế nhất.

Cấu trúc JSON phản hồi bắt buộc phải đúng 100% mẫu dưới đây, không chứa bất kỳ văn bản nào khác ngoài JSON (không bọc trong dấu markdown \`\`\`json):
{
  "executiveSummary": {
    "evaluation": "Nhận xét tổng quan cực kỳ chi tiết, đánh giá khách quan về thực trạng triển khai trong tuần (những điểm sáng và hạn chế cụ thể của thương hiệu ${brandName}). Sử dụng số liệu chứng minh từ các mảng SEO, Ads, Content, SOV.",
    "proposals": "Các đề xuất cụ thể, hành động thiết thực cho tuần kế tiếp để tối ưu hóa hiệu quả (đưa ra ít nhất 3 đề xuất ngắn gọn, trực diện)."
  },
  "categoryAnalysis": {
    "sov": "Nhận xét phân tích ngắn gọn, súc tích kèm số liệu về thị phần thảo luận (Share of Voice) của thương hiệu ${brandName} so với các đối thủ cạnh tranh như Karofi, Kangaroo, Sunhouse, Hòa Phát...",
    "kol_koc": "Nhận xét về việc triển khai KOL/KOC trong tuần của ${brandName}. Đối chiếu KPI toàn chiến dịch, tích lũy chiến dịch và số thực hiện tuần này.",
    "content": "Nhận xét về hoạt động sản xuất, xuất bản các ấn phẩm Content & Sáng tạo nội dung (ví dụ: số lượng bài viết đăng tải, clip giới thiệu sản phẩm, ooh/led, các nội dung social media khác) trong tuần của ${brandName}.",
    "tvc": "Phân tích và nhận xét chi tiết về hiệu quả phát sóng TVC (chỉ số metric là GRPS) trên các kênh truyền hình tại các thành phố/kênh sóng trọng điểm của ${brandName} như HAN, HCM, CAN, HTV & THVL.",
    "pr": "Nhận xét chi tiết về hiệu quả hoạt động PR báo chí của ${brandName} trong tuần hoặc trong tháng (đối chiếu lượng bài viết Quantity và lượng người tiếp cận Views của bài viết).",
    "ooh": "Nhận xét chi tiết hoạt động truyền thông ngoài trời OOH của thương hiệu ${brandName} theo các phân khúc: LCD Building, LED Cities, LED Airport, Pano.",
    "paid_ads": "Phân tích hiệu quả Paid Ads trong tuần (về Amount spent, Impressions, Reach, CPM, Frequency), đánh giá mức độ phủ thương hiệu và tối ưu chi phí.",
    "seo": "Phân tích hiệu quả SEO Website & SEO Content trong tuần (Traffic Organic, Impressions Organic, số lượng bài viết). So sánh thực tế đạt được so với mục tiêu đề ra.",
    "btl_trade": "Đánh giá chi tiết hoạt động BTL & Trade Marketing của thương hiệu ${brandName} (biển bảng POSM, quầy kệ, kiểm soát hình ảnh điểm bán, sự kiện activation/workshop). So sánh kế hoạch tháng 6, lũy kế đạt được và đối chiếu tăng trưởng so với thực tế thực hiện tháng 5."
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    try {
      const parsed = JSON.parse(text.trim());
      await logAction((req as any).session, req, "analyze", `Phân tích AI cho thương hiệu ${brandName}`);
      return res.json({ success: true, analysis: parsed });
    } catch (e) {
      console.error("Gemini raw text parse failure:", text);
      // Fallback: search for first { and last } in case it wrapped in markdown
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start >= 0 && end > start) {
        try {
          const parsedFixed = JSON.parse(text.substring(start, end + 1));
          return res.json({ success: true, analysis: parsedFixed });
        } catch (innerErr) {
          throw new Error("Không thể phân tích phản hồi JSON từ AI.");
        }
      }
      throw new Error("Phản hồi của AI không đúng định dạng JSON.");
    }

  } catch (error: any) {
    console.error("Gemini API error:", error);
    return res.status(500).json({ error: error.message || "Lỗi xử lý phân tích AI" });
  }
});

// GET /api/get-mail-config
app.get("/api/get-mail-config", requireAuth("Admin"), async (req, res) => {
  try {
    const store = await getDatabaseData();
    const config = store.mail_config || {};
    const decryptedPass = config.smtp_pass ? decrypt(config.smtp_pass) : "";
    res.json({
      success: true,
      config: {
        smtp_host: config.smtp_host || "",
        smtp_port: config.smtp_port || "587",
        smtp_user: config.smtp_user || "",
        smtp_pass: decryptedPass,
        notification_email: config.notification_email || "ntkdung1206@gmail.com",
        enabled: config.enabled !== undefined ? config.enabled : true
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/save-mail-config
app.post("/api/save-mail-config", requireAuth("Admin"), async (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_user, smtp_pass, notification_email, enabled } = req.body;
    const store = await getDatabaseData();

    const encryptedPass = smtp_pass ? encrypt(smtp_pass) : "";

    store.mail_config = {
      smtp_host: smtp_host || "",
      smtp_port: smtp_port || "587",
      smtp_user: smtp_user || "",
      smtp_pass: encryptedPass,
      notification_email: notification_email || "",
      enabled: enabled === true
    };

    await saveDatabaseData(store);
    await logAction((req as any).session, req, "save-mail-config", "Cập nhật cấu hình gửi mail SMTP");
    res.json({ success: true, message: "Cấu hình gửi mail tự động đã được lưu và mã hóa bảo mật!" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Shared by POST /api/send-backup-now and GET /api/cron/weekly-backup:
// builds the same full-database workbook as the "Xuất Database Đầy Đủ"
// button, then emails it using the stored (encrypted) SMTP config.
async function runDatabaseBackupEmail(): Promise<void> {
  const store = await getDatabaseData();
  const config = store.mail_config || {};

  const normalized = normalizeMarketingData(store);
  const safeUsers = (Array.isArray(store.users) ? store.users : []).map((u: UserAccount) => ({
    username: u.username,
    name: u.name,
    role: u.role,
  }));
  const buffer = buildBackupAttachmentBuffer({
    ...normalized,
    comments: store.comments || {},
    users: safeUsers,
  });

  await sendBackupEmail(
    {
      smtp_host: config.smtp_host || "",
      smtp_port: config.smtp_port || "587",
      smtp_user: config.smtp_user || "",
      smtp_pass: config.smtp_pass ? decrypt(config.smtp_pass) : "",
      notification_email: config.notification_email || "",
      enabled: config.enabled !== false,
    },
    buffer,
    `marketing_backup_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}

// POST /api/send-backup-now — Admin-only manual trigger, mainly for testing
// the SMTP config right after saving it (see "Sao Lưu Tự Động" section)
// instead of waiting for the actual Friday 17:00 schedule.
app.post("/api/send-backup-now", requireAuth("Admin"), async (req, res) => {
  try {
    await runDatabaseBackupEmail();
    await logAction((req as any).session, req, "send-backup-now", "Gửi thử email backup database");
    return res.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/send-backup-now error:", err);
    return res.status(500).json({ error: err.message || "Lỗi gửi email backup." });
  }
});

// Shared by both GET /api/cron/* routes below. Vercel Cron has no user to
// log in as, so these gate on CRON_SECRET instead of a session — compared
// with crypto.timingSafeEqual rather than `!==`/`===`, same reasoning as
// verifySessionToken/verifyPasswordAny (auth.ts / serverPasswordHash.ts): a
// plain string comparison short-circuits on the first mismatched byte, which
// in principle leaks how many leading characters of the secret a guess got
// right. timingSafeEqual requires equal-length buffers, so the length check
// has to happen first — done via a fixed-size digest of both sides.
function isValidCronRequest(req: express.Request): boolean {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.authorization;
  if (!expected || !provided) return false;
  const expectedDigest = crypto.createHash("sha256").update(`Bearer ${expected}`).digest();
  const providedDigest = crypto.createHash("sha256").update(provided).digest();
  return crypto.timingSafeEqual(expectedDigest, providedDigest);
}

// GET /api/cron/weekly-backup — hit by Vercel Cron every Friday 17:00 ICT
// (10:00 UTC, see vercel.json). Not session-authenticated (Vercel Cron has
// no user to log in as) — instead requires the CRON_SECRET env var to match,
// which Vercel automatically sends as `Authorization: Bearer <CRON_SECRET>`
// when that env var is configured on the project. Never runs in local dev:
// there's no real mail_config there anyway (see supabaseClient.ts), and this
// route only matters for the deployed schedule.
app.get("/api/cron/weekly-backup", async (req, res) => {
  try {
    if (!isValidCronRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const store = await getDatabaseData();
    if (store.mail_config?.enabled === false) {
      return res.json({ success: true, skipped: true, reason: "Gửi mail tự động đang tắt (enabled=false)." });
    }

    await runDatabaseBackupEmail();
    return res.json({ success: true });
  } catch (err: any) {
    console.error("GET /api/cron/weekly-backup error:", err);
    return res.status(500).json({ error: err.message || "Lỗi gửi email backup định kỳ." });
  }
});

// GET /api/get-data
app.get("/api/get-data", requireAuth(), async (req, res) => {
  try {
    const rawDbData = await getDatabaseData();
    const normalized = normalizeMarketingData(rawDbData);
    return res.json({
      success: true,
      data: normalized,
      comments: rawDbData.comments || {},
      activeState: rawDbData.active_state || null
    });
  } catch (err: any) {
    console.error("GET /api/get-data error:", err);
    return res.status(500).json({ error: `Lỗi đọc cơ sở dữ liệu: ${err.message}` });
  }
});

// GET /api/get-users — shared user/account list (Admin/Editor/Viewer), so
// accounts added or edited by one Admin are visible to every browser instead
// of only living in that Admin's localStorage. Admin-only, and never returns
// passwordHash/salt — the client only needs username/name/role to render the
// account list; login itself is verified entirely server-side (POST /api/login).
app.get("/api/get-users", requireAuth("Admin"), async (req, res) => {
  try {
    const store = await getDatabaseData();
    const users: UserAccount[] = Array.isArray(store.users) ? store.users : [];
    const publicUsers = users.map(({ username, name, role }) => ({ username, name, role }));
    return res.json({ success: true, users: publicUsers });
  } catch (err: any) {
    console.error("GET /api/get-users error:", err);
    return res.status(500).json({ error: `Lỗi đọc danh sách người dùng: ${err.message}` });
  }
});

// POST /api/save-users — Admin-only. The client never computes or holds a
// password hash at all (see UserAccount.newPassword doc in defaultUsers.ts):
// it sends plaintext `newPassword` only when actually rotating/setting a
// password, over HTTPS, and only this route ever turns that into a hash.
// Any `passwordHash`/`salt` the client sends is ignored — trusting a
// client-supplied hash would let a tampered request plant an
// attacker-known password straight into the database.
app.post("/api/save-users", requireAuth("Admin"), async (req, res) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users)) {
      return res.status(400).json({ error: "Dữ liệu người dùng phải là một mảng." });
    }
    const store = await getDatabaseData();
    const existingByUsername = new Map<string, UserAccount>(
      (Array.isArray(store.users) ? store.users : []).map((u: UserAccount) => [u.username.toLowerCase(), u])
    );

    const merged: UserAccount[] = users.map((incoming: UserAccount) => {
      const { passwordHash: _ignoredClientHash, salt: _ignoredClientSalt, newPassword, ...rest } = incoming;
      const existing = existingByUsername.get((incoming.username || "").toLowerCase());

      if (newPassword) {
        const salt = generateServerSalt();
        return { ...rest, passwordHash: hashPasswordScrypt(newPassword, salt), salt };
      }
      return { ...rest, passwordHash: existing?.passwordHash, salt: existing?.salt };
    });

    store.users = merged;
    await saveDatabaseData(store);
    await logAction(
      (req as any).session,
      req,
      "save-users",
      `Cập nhật danh sách tài khoản (${merged.length} tài khoản: ${merged.map((u) => u.username).join(", ")})`
    );
    return res.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/save-users error:", err);
    return res.status(500).json({ error: `Lỗi lưu danh sách người dùng: ${err.message}` });
  }
});

// POST /api/save-active-state
app.post("/api/save-active-state", requireAuth("Editor"), async (req, res) => {
  try {
    const { selectedBrand, selectedTimelineId, activeCategoryTab } = req.body;
    const rawDbData = await getDatabaseData();

    rawDbData.active_state = {
      selectedBrand,
      selectedTimelineId,
      activeCategoryTab,
      updatedAt: new Date().toISOString()
    };

    await saveDatabaseData(rawDbData);
    // Not logged to action_logs on purpose: this fires on every brand/timeline
    // switch (debounced, but still every few seconds while browsing) — it's
    // navigation state, not a data-changing action, and would drown out the
    // audit trail's meaningful entries.
    return res.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/save-active-state error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/save-comments
app.post("/api/save-comments", requireAuth("Editor"), async (req, res) => {
  try {
    const { week, comments } = req.body;
    if (!week || !comments) {
      return res.status(400).json({ error: "Thiếu thông tin tuần báo cáo hoặc nội dung nhận định." });
    }

    const rawDbData = await getDatabaseData();
    if (!rawDbData.comments) {
      rawDbData.comments = {};
    }

    rawDbData.comments[week] = comments;
    await saveDatabaseData(rawDbData);
    await logAction((req as any).session, req, "save-comments", `Cập nhật nhận định tuần ${week}`);

    return res.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/save-comments error:", err);
    return res.status(500).json({ error: `Lỗi lưu nhận định vào cơ sở dữ liệu: ${err.message}` });
  }
});

// POST /api/save-raw-data (Direct edit/delete row management for Admin)
app.post("/api/save-raw-data", requireAuth("Editor"), async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "Thiếu dữ liệu để lưu." });
    }

    const rawDbData = await getDatabaseData();
    // Overwrite the specific core array lists while keeping existing comments
    rawDbData.digital_marketing = data.digital_marketing || [];
    rawDbData.kol_koc = data.kol_koc || [];
    rawDbData.btl_trade = data.btl_trade || [];
    rawDbData.monthly_ooh_pr = data.monthly_ooh_pr || [];

    // Sync weekly btl_trade thực_hiện_tháng back to btl_trade_monthly
    if (!rawDbData.btl_trade_monthly) {
      rawDbData.btl_trade_monthly = [];
    }

    rawDbData.btl_trade.forEach((row: any) => {
      const weekStr = row.week || "";
      const info = getBtlReportMonth(weekStr);
      const lastMonth = info.month === 1 ? 12 : info.month - 1;
      const lastYear = info.month === 1 ? info.year - 1 : info.year;

      const val = row.thực_hiện_tháng;
      if (val !== undefined && val !== null) {
        // Find if there is a matching row in btl_trade_monthly
        const match = rawDbData.btl_trade_monthly.find((m: any) => {
          return m.month === lastMonth &&
                 m.year === lastYear &&
                 (m.brand || "").toLowerCase() === (row.brand || "").toLowerCase() &&
                 (m.hạng_mục_lớn || "").toLowerCase() === (row.hạng_mục_lớn || "").toLowerCase() &&
                 (m.chi_tiết_hạng_mục || "").toLowerCase() === (row.chi_tiết_hạng_mục || "").toLowerCase() &&
                 (m.phân_loại || "").toString().toLowerCase() === (row.phân_loại || "").toString().toLowerCase() &&
                 (m.tần_suất || "").toLowerCase() === (row.tần_suất || "").toLowerCase() &&
                 (m.đơn_vị_tính || "").toLowerCase() === (row.đơn_vị_tính || "").toLowerCase();
        });

        if (match) {
          match.thực_hiện_tháng = Number(val);
        } else {
          rawDbData.btl_trade_monthly.push({
            month: lastMonth,
            year: lastYear,
            brand: row.brand,
            hạng_mục_lớn: row.hạng_mục_lớn,
            chi_tiết_hạng_mục: row.chi_tiết_hạng_mục,
            phân_loại: row.phân_loại,
            tần_suất: row.tần_suất,
            đơn_vị_tính: row.đơn_vị_tính,
            thực_hiện_tháng: Number(val)
          });
        }
      }
    });

    if (data.btl_trade_monthly) {
      rawDbData.btl_trade_monthly = data.btl_trade_monthly;
    }

    await saveDatabaseData(rawDbData);
    const normalized = normalizeMarketingData(rawDbData);
    await logAction(
      (req as any).session,
      req,
      "save-raw-data",
      `Chỉnh sửa trực tiếp dữ liệu (${normalized.digital_marketing.length + normalized.kol_koc.length + normalized.btl_trade.length + normalized.monthly_ooh_pr.length} dòng)`
    );

    return res.json({ success: true, data: normalized });
  } catch (err: any) {
    console.error("POST /api/save-raw-data error:", err);
    return res.status(500).json({ error: `Lỗi cập nhật cơ sở dữ liệu: ${err.message}` });
  }
});

// POST /api/sync-data
app.post("/api/sync-data", requireAuth("Editor"), async (req, res) => {
  try {
    const { newData } = req.body;
    if (!newData) {
      return res.status(400).json({ error: "Không tìm thấy dữ liệu đồng bộ mới." });
    }

    // 1. Normalize the incoming new data
    const normalizedNew = normalizeMarketingData(newData);

    // 2. Load the existing database data
    const currentFullDb = await getDatabaseData();
    const currentDb = normalizeMarketingData(currentFullDb);

    // 3. Helper to merge lists type-safely by identifying identical keys, updating matching ones, and appending new ones
    function mergeRowsByKey<T>(currentList: T[], newList: T[], keyFn: (row: T) => string): T[] {
      if (!newList || newList.length === 0) return currentList;
      const map = new Map<string, T>();
      currentList.forEach((row) => {
        map.set(keyFn(row), row);
      });
      newList.forEach((row) => {
        map.set(keyFn(row), row);
      });
      return Array.from(map.values());
    }

    // Key extraction functions for identifying duplicates
    const getDigitalKey = (row: any): string => {
      const week = (row.week || "").toString().trim().toLowerCase();
      const brand = (row.brand || "").toString().trim().toLowerCase();
      const nhom = (row.nhóm_báo_cáo || "").toString().trim().toLowerCase();
      const hm = (row.hạng_mục || "").toString().trim().toLowerCase();
      const nganh = (row.ngành_hàng || "").toString().trim().toLowerCase();
      const channel = (row.kênh_channel || "").toString().trim().toLowerCase();
      const metric = (row.chỉ_số_metric || "").toString().trim().toLowerCase();
      return `${week}|${brand}|${nhom}|${hm}|${nganh}|${channel}|${metric}`;
    };

    const getKolKey = (row: any): string => {
      const week = (row.week || "").toString().trim().toLowerCase();
      const brand = (row.brand || "").toString().trim().toLowerCase();
      const hm = (row.hạng_mục || "").toString().trim().toLowerCase();
      const nganh = (row.ngành_hàng || "").toString().trim().toLowerCase();
      const channel = (row.kênh_channel || "").toString().trim().toLowerCase();
      const metric = (row.chỉ_số_metric || "").toString().trim().toLowerCase();
      return `${week}|${brand}|${hm}|${nganh}|${channel}|${metric}`;
    };

    const getBtlKey = (row: any): string => {
      const week = (row.week || "").toString().trim().toLowerCase();
      const brand = (row.brand || "").toString().trim().toLowerCase();
      const hml = (row.hạng_mục_lớn || "").toString().trim().toLowerCase();
      const cthm = (row.chi_tiết_hạng_mục || "").toString().trim().toLowerCase();
      const pl = (row.phân_loại || "").toString().trim().toLowerCase();
      const ts = (row.tần_suất || "").toString().trim().toLowerCase();
      const dvt = (row.đơn_vị_tính || "").toString().trim().toLowerCase();
      return `${week}|${brand}|${hml}|${cthm}|${pl}|${ts}|${dvt}`;
    };

    const getOohPrKey = (row: any): string => {
      const week = (row.week || "").toString().trim().toLowerCase();
      const tbc = (row.tháng_báo_cáo || "").toString().trim().toLowerCase();
      const hm = (row.hạng_mục || "").toString().trim().toLowerCase();
      const brand = (row.brand || "").toString().trim().toLowerCase();
      const nganh = (row.ngành_hàng || "").toString().trim().toLowerCase();
      const channel = (row.kênh_channel || "").toString().trim().toLowerCase();
      const metric = (row.chỉ_số_metric || "").toString().trim().toLowerCase();
      return `${week}|${tbc}|${hm}|${brand}|${nganh}|${channel}|${metric}`;
    };

    const getBtlMonthlyKey = (row: any): string => {
      const month = (row.month || 5).toString();
      const year = (row.year || 2026).toString();
      const brand = (row.brand || "").toString().trim().toLowerCase();
      const hml = (row.hạng_mục_lớn || "").toString().trim().toLowerCase();
      const cthm = (row.chi_tiết_hạng_mục || "").toString().trim().toLowerCase();
      const pl = (row.phân_loại || "").toString().trim().toLowerCase();
      const ts = (row.tần_suất || "").toString().trim().toLowerCase();
      const dvt = (row.đơn_vị_tính || "").toString().trim().toLowerCase();
      return `${month}|${year}|${brand}|${hml}|${cthm}|${pl}|${ts}|${dvt}`;
    };

    // Merge comments if present in newData
    const mergedComments = { ...(currentFullDb.comments || {}) };
    if (newData && newData.comments) {
      Object.keys(newData.comments).forEach((weekKey) => {
        if (!mergedComments[weekKey]) {
          mergedComments[weekKey] = newData.comments[weekKey];
        } else {
          mergedComments[weekKey] = {
            ...mergedComments[weekKey],
            ...newData.comments[weekKey],
          };
        }
      });
    }

    const mergedData = {
      ...currentFullDb,
      digital_marketing: mergeRowsByKey(currentDb.digital_marketing, normalizedNew.digital_marketing, getDigitalKey),
      kol_koc: mergeRowsByKey(currentDb.kol_koc, normalizedNew.kol_koc, getKolKey),
      btl_trade: mergeRowsByKey(currentDb.btl_trade, normalizedNew.btl_trade, getBtlKey),
      monthly_ooh_pr: mergeRowsByKey(currentDb.monthly_ooh_pr, normalizedNew.monthly_ooh_pr, getOohPrKey),
      btl_trade_monthly: mergeRowsByKey(currentFullDb.btl_trade_monthly || [], normalizedNew.btl_trade_monthly || [], getBtlMonthlyKey),
      comments: mergedComments
    };

    // 4. Save the fully merged and normalized dataset back to Supabase
    await saveDatabaseData(mergedData);
    await logAction((req as any).session, req, "sync-data", "Đồng bộ dữ liệu ngoại tuyến (JSON/Excel)");

    // The response only needs the report fields the client actually reads
    // (digital_marketing/kol_koc/.../comments) — `users` (password hashes +
    // salts) and `mail_config` (decrypted SMTP password) must never be echoed
    // back here, unlike the full `mergedData` that gets persisted above.
    const { users: _omitUsers, mail_config: _omitMailConfig, ...responseData } = mergedData;

    return res.json({ success: true, data: responseData });
  } catch (err: any) {
    console.error("POST /api/sync-data error:", err);
    return res.status(500).json({ error: `Lỗi đồng bộ hóa dữ liệu vào DB: ${err.message}` });
  }
});

// GET /api/login-logs — Admin-only audit trail of every login attempt
// (success and failure), newest first. See supabase/schema.sql: login_logs.
app.get("/api/login-logs", requireAuth("Admin"), async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 200, 1), 1000);

    if (!isSupabaseConfigured) {
      return res.json({ success: true, logs: localLoginLogs.slice(0, limit) });
    }

    const { data, error } = await supabase
      .from("login_logs")
      .select("id, username, status, ip, user_agent, session_id, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return res.json({ success: true, logs: data || [] });
  } catch (err: any) {
    console.error("GET /api/login-logs error:", err);
    return res.status(500).json({ error: `Lỗi đọc nhật ký đăng nhập: ${err.message}` });
  }
});

// GET /api/action-logs — Admin sees every user's actions; every other role
// is restricted to its own username. This scoping happens here, server-side,
// based on the verified session — never from a client-supplied parameter —
// so there is no way to request someone else's history by tampering with
// the request. See supabase/schema.sql: action_logs.
app.get("/api/action-logs", requireAuth(), async (req, res) => {
  try {
    const session = (req as any).session as { username: string; role: string };
    const limit = Math.min(Math.max(Number(req.query.limit) || 200, 1), 1000);

    if (!isSupabaseConfigured) {
      const scoped = session.role === "Admin" ? localActionLogs : localActionLogs.filter((l) => l.username === session.username);
      return res.json({ success: true, logs: scoped.slice(0, limit) });
    }

    let query = supabase
      .from("action_logs")
      .select("id, username, role, action, details, ip, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (session.role !== "Admin") {
      query = query.eq("username", session.username);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return res.json({ success: true, logs: data || [] });
  } catch (err: any) {
    console.error("GET /api/action-logs error:", err);
    return res.status(500).json({ error: `Lỗi đọc nhật ký thao tác: ${err.message}` });
  }
});

// ---------------------------------------------------------------------------
// Facebook Page Insights module. fb_pages/fb_insights_daily/fb_posts are
// stored via facebookStore.ts (dedicated Supabase tables in production,
// extra arrays in the local JSON blob in dev — see that file's header
// comment). Access tokens are encrypted with the same AES-256-CBC helper
// used for mail_config.smtp_pass (src/server/crypto.ts).
// ---------------------------------------------------------------------------

// GET /api/fb/pages — list configured pages (never returns the token itself).
app.get("/api/fb/pages", requireAuth("Admin"), async (req, res) => {
  try {
    const pages = await getFbPages();
    res.json({
      success: true,
      pages: pages.map((p) => ({
        page_id: p.page_id,
        page_name: p.page_name,
        brand: p.brand,
        is_active: p.is_active,
        last_synced_at: p.last_synced_at,
        last_sync_error: p.last_sync_error,
        token_expired: p.token_expired,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/fb/pages — add or update a page's Page ID / name / Access Token.
app.post("/api/fb/pages", requireAuth("Admin"), async (req, res) => {
  try {
    const { page_id, page_name, brand, access_token, is_active } = req.body;
    if (!page_id || !page_name || !access_token) {
      return res.status(400).json({ success: false, error: "Thiếu page_id, page_name hoặc access_token." });
    }

    await upsertFbPage({
      page_id: String(page_id).trim(),
      page_name: String(page_name).trim(),
      brand: brand ? String(brand).trim() : null,
      access_token_encrypted: encrypt(String(access_token).trim()),
      is_active: is_active !== undefined ? Boolean(is_active) : undefined,
    });

    await logAction((req as any).session, req, "save-fb-page", `Cập nhật cấu hình Facebook Page ${page_id}`);
    res.json({ success: true, message: "Đã lưu cấu hình Facebook Page." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/fb/pages/:page_id
app.delete("/api/fb/pages/:page_id", requireAuth("Admin"), async (req, res) => {
  try {
    await deleteFbPage(req.params.page_id);
    await logAction((req as any).session, req, "delete-fb-page", `Xóa cấu hình Facebook Page ${req.params.page_id}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/fb/sync-now — Admin-only manual trigger, mirrors
// POST /api/send-backup-now's "test it right after saving" UX.
app.post("/api/fb/sync-now", requireAuth("Admin"), async (req, res) => {
  try {
    const results = await runFacebookSync();
    await logAction((req as any).session, req, "sync-facebook", `Đồng bộ thủ công ${results.length} Facebook Page`);
    res.json({ success: true, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/cron/facebook-sync — hit by Vercel Cron once daily (see
// vercel.json). Same CRON_SECRET pattern as GET /api/cron/weekly-backup.
//
// Also runs the Facebook Ads (Marketing API) sync here rather than adding a
// third vercel.json cron entry — Vercel's Hobby plan caps a project at 2 cron
// jobs, so a separate "/api/cron/facebook-ads-sync" entry would break
// deployment for anyone still on that plan. Both syncs are independent and a
// failure in one must not block the other, so they're run and reported
// separately even though one HTTP call triggers both.
app.get("/api/cron/facebook-sync", async (req, res) => {
  try {
    if (!isValidCronRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const [pageResults, adsResults, tiktokResults] = await Promise.all([
      runFacebookSync().catch((err) => {
        console.error("GET /api/cron/facebook-sync (page insights) error:", err);
        return [];
      }),
      runFacebookAdsSync().catch((err) => {
        console.error("GET /api/cron/facebook-sync (ads) error:", err);
        return [];
      }),
      // TikTok organic insights piggybacks on this same cron for the same
      // reason the Facebook Ads sync does — Vercel Hobby caps a project at
      // 2 cron jobs, so this stays one HTTP trigger fanning out to all three
      // independent syncs rather than a third vercel.json entry.
      isTiktokConfigured
        ? runTiktokSync().catch((err) => {
            console.error("GET /api/cron/facebook-sync (tiktok) error:", err);
            return [];
          })
        : Promise.resolve([]),
    ]);
    res.json({ success: true, results: pageResults, adsResults, tiktokResults });
  } catch (err: any) {
    console.error("GET /api/cron/facebook-sync error:", err);
    res.status(500).json({ error: err.message || "Lỗi đồng bộ Facebook định kỳ." });
  }
});

// GET /api/fb/insights?pages=<id1,id2>&since=YYYY-MM-DD&until=YYYY-MM-DD —
// shaped data for the "Facebook Insights" dashboard tab. Any logged-in role
// can read it (it's a read-only report, same visibility as the main dashboard).
app.get("/api/fb/insights", requireAuth(), async (req, res) => {
  try {
    const allPages = await getFbPages();
    const requestedIds = typeof req.query.pages === "string" && req.query.pages.length > 0
      ? req.query.pages.split(",").map((s) => s.trim())
      : allPages.map((p) => p.page_id);

    const until = typeof req.query.until === "string" && req.query.until ? req.query.until : new Date().toISOString().slice(0, 10);
    const since = typeof req.query.since === "string" && req.query.since
      ? req.query.since
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [daily, posts] = await Promise.all([
      getFbInsightsDaily(requestedIds, since, until),
      getFbPosts(requestedIds, `${since}T00:00:00.000Z`, `${until}T23:59:59.999Z`),
    ]);

    res.json({
      success: true,
      pages: allPages.map((p) => ({ page_id: p.page_id, page_name: p.page_name, brand: p.brand, is_active: p.is_active })),
      daily,
      posts,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Digital Ads Report module. ads_performance is stored via
// adsPerformanceStore.ts — one normalized table for all 3 channels (Facebook/
// Google/TikTok), keyed by (channel, campaign_name, ad_group_name, ad_name,
// date) so both the Facebook API sync and the Google/TikTok manual uploads
// upsert through the exact same idempotent path. fb_ad_accounts is the
// Marketing-API counterpart of fb_pages — a different token type (ads_read on
// an ad account, not a Page token), so it gets its own Admin-only config
// routes rather than reusing /api/fb/pages.
// ---------------------------------------------------------------------------

const ADS_CHANNELS: AdsChannel[] = ["facebook", "google", "tiktok"];

// Real exports seen so far top out around 3-4k rows (a month of TikTok
// ad-level data for one brand). Capped well above that rather than left
// unbounded — the only other limit on this route is the 20mb express.json()
// body cap (see app.use(express.json(...)) above), and a single .upsert()
// call with tens of thousands of rows risks a slow/oversized request before
// it ever gets that big. Reject with a clear message rather than letting a
// huge payload silently eat most of the request's time budget.
const MAX_UPLOAD_ROWS = 20000;

function isValidAdsPerformanceRow(r: any): r is AdsPerformanceRow {
  return (
    r &&
    typeof r === "object" &&
    ADS_CHANNELS.includes(r.channel) &&
    typeof r.campaign_name === "string" &&
    typeof r.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(r.date)
  );
}

// GET /api/ads-performance?channels=facebook,google&brand=Livotec&since=&until=
// Any logged-in role can read it — same visibility as /api/fb/insights.
app.get("/api/ads-performance", requireAuth(), async (req, res) => {
  try {
    const channels = typeof req.query.channels === "string" && req.query.channels.length > 0
      ? (req.query.channels.split(",").map((s) => s.trim()) as AdsChannel[]).filter((c) => ADS_CHANNELS.includes(c))
      : undefined;
    const brand = typeof req.query.brand === "string" && req.query.brand ? req.query.brand : null;
    const until = typeof req.query.until === "string" && req.query.until ? req.query.until : new Date().toISOString().slice(0, 10);
    const since = typeof req.query.since === "string" && req.query.since
      ? req.query.since
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const rows = await getAdsPerformance({ channels, brand, since, until });
    res.json({ success: true, rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ads-performance/upload — Google/TikTok manual upload. Rows are
// parsed client-side (src/lib/adsImport.ts: parseGoogleAdsExport /
// parseTiktokAdsExport) and posted here already normalized — this route only
// validates shape and upserts, same "parse in browser → POST normalized JSON"
// pattern as the existing offline spreadsheet sync (parseSpreadsheetFile +
// POST /api/sync-data).
app.post("/api/ads-performance/upload", requireAuth("Editor"), async (req, res) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, error: "Không có dòng dữ liệu nào để lưu." });
    }
    if (rows.length > MAX_UPLOAD_ROWS) {
      return res.status(400).json({
        success: false,
        error: `File có ${rows.length} dòng, vượt quá giới hạn ${MAX_UPLOAD_ROWS} dòng/lần tải lên. Hãy chia nhỏ theo khoảng thời gian rồi tải lên từng phần.`,
      });
    }
    const invalid = rows.filter((r) => !isValidAdsPerformanceRow(r));
    if (invalid.length > 0) {
      return res.status(400).json({
        success: false,
        error: `${invalid.length}/${rows.length} dòng thiếu channel/campaign_name/date hợp lệ.`,
      });
    }

    await upsertAdsPerformance(rows as AdsPerformanceRow[]);
    await logAction(
      (req as any).session,
      req,
      "upload-ads-performance",
      `Tải lên ${rows.length} dòng số liệu quảng cáo (${rows[0].channel})`
    );
    res.json({ success: true, count: rows.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/fb-ads/accounts — list configured Ad Accounts (never returns the token).
app.get("/api/fb-ads/accounts", requireAuth("Admin"), async (req, res) => {
  try {
    const accounts = await getFbAdAccounts();
    res.json({
      success: true,
      accounts: accounts.map((a) => ({
        ad_account_id: a.ad_account_id,
        account_name: a.account_name,
        brand: a.brand,
        is_active: a.is_active,
        last_synced_at: a.last_synced_at,
        last_sync_error: a.last_sync_error,
        token_expired: a.token_expired,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/fb-ads/accounts — add or update an Ad Account's ID / name / token.
app.post("/api/fb-ads/accounts", requireAuth("Admin"), async (req, res) => {
  try {
    const { ad_account_id, account_name, brand, access_token, is_active } = req.body;
    if (!ad_account_id || !account_name || !access_token) {
      return res.status(400).json({ success: false, error: "Thiếu ad_account_id, account_name hoặc access_token." });
    }

    await upsertFbAdAccount({
      ad_account_id: String(ad_account_id).trim(),
      account_name: String(account_name).trim(),
      brand: brand ? String(brand).trim() : null,
      access_token_encrypted: encrypt(String(access_token).trim()),
      is_active: is_active !== undefined ? Boolean(is_active) : undefined,
    });

    await logAction((req as any).session, req, "save-fb-ad-account", `Cập nhật cấu hình Ad Account ${ad_account_id}`);
    res.json({ success: true, message: "Đã lưu cấu hình Ad Account." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/fb-ads/accounts/:ad_account_id
app.delete("/api/fb-ads/accounts/:ad_account_id", requireAuth("Admin"), async (req, res) => {
  try {
    await deleteFbAdAccount(req.params.ad_account_id);
    await logAction((req as any).session, req, "delete-fb-ad-account", `Xóa cấu hình Ad Account ${req.params.ad_account_id}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/fb-ads/sync-now — Admin-only manual trigger, mirrors POST /api/fb/sync-now.
app.post("/api/fb-ads/sync-now", requireAuth("Admin"), async (req, res) => {
  try {
    // Optional {since, until} lets an Admin trigger a one-off historical
    // backfill (e.g. "from Jan 1st") from the same button, instead of only
    // ever re-pulling the daily cron's rolling 30-day window.
    const { since, until } = req.body || {};
    const overrides =
      typeof since === "string" && /^\d{4}-\d{2}-\d{2}$/.test(since)
        ? { since, until: typeof until === "string" && /^\d{4}-\d{2}-\d{2}$/.test(until) ? until : undefined }
        : undefined;
    const results = await runFacebookAdsSync(overrides);
    await logAction(
      (req as any).session,
      req,
      "sync-facebook-ads",
      overrides ? `Đồng bộ thủ công ${results.length} Ad Account (từ ${overrides.since})` : `Đồng bộ thủ công ${results.length} Ad Account`
    );
    res.json({ success: true, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// TikTok organic insights module (src/server/tiktokSync.ts,
// src/server/tiktokStore.ts) — merges with Facebook Page Insights into the
// "Social Report" tab. Unlike every other integration in this file, the
// connection step is a real OAuth redirect (TikTok's Login Kit), not a
// pasted token — see oauth/start + oauth/callback below.
// ---------------------------------------------------------------------------

// GET /api/tiktok/oauth/start — Admin-only. Returns the TikTok authorize URL
// (rather than redirecting directly) so the frontend can navigate the
// browser there itself; this route is called via the normal authenticated
// fetch() pattern (Authorization: Bearer), which a raw HTTP redirect
// response couldn't carry through a full-page navigation anyway.
app.get("/api/tiktok/oauth/start", requireAuth("Admin"), (req, res) => {
  if (!isTiktokConfigured) {
    return res.status(400).json({
      success: false,
      error: "TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET / TIKTOK_REDIRECT_URI chưa được cấu hình đầy đủ.",
    });
  }
  const brand = typeof req.query.brand === "string" ? req.query.brand : null;
  // TikTok's v2 authorize endpoint now rejects requests without PKCE
  // (error: "code_challenge") — codeVerifier rides inside the signed state
  // rather than a server-side session, since oauth/callback may land on a
  // different serverless instance than oauth/start.
  const codeVerifier = crypto.randomBytes(48).toString("base64url");
  const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
  const state = signOAuthState({ brand, username: (req as any).session.username, codeVerifier });
  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    scope: TIKTOK_SCOPES.join(","),
    response_type: "code",
    redirect_uri: TIKTOK_REDIRECT_URI,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    // Without this, TikTok silently re-authorizes using whatever scopes were
    // granted the FIRST time the account approved this app, skipping the
    // consent screen entirely on later logins — so a scope added afterwards
    // (e.g. video.list) never reaches the user for approval until they
    // revoke the app from their TikTok settings. Forcing the screen every
    // time avoids depending on that manual revoke step.
    disable_auto_auth: "1",
  });
  res.json({ success: true, authorizeUrl: `${TIKTOK_AUTHORIZE_URL}?${params.toString()}` });
});

// GET /api/tiktok/oauth/callback — hit by a real browser navigation (TikTok
// redirecting the user back), never by fetch(). There is no Authorization
// header to check here — the signed `state` param (minted by oauth/start
// above, verified via verifyOAuthState) is what proves this callback
// corresponds to a request an Admin actually initiated, not a forged hit.
app.get("/api/tiktok/oauth/callback", async (req, res) => {
  const { code, state, error: oauthError, error_description } = req.query as Record<string, string | undefined>;
  if (oauthError) {
    return res.status(400).send(`Kết nối TikTok bị hủy hoặc lỗi: ${error_description || oauthError}`);
  }
  const payload = verifyOAuthState<{ brand: string | null; username: string; codeVerifier: string }>(state);
  if (!payload || typeof code !== "string") {
    return res.status(400).send("Liên kết xác thực TikTok không hợp lệ hoặc đã hết hạn — vui lòng thử kết nối lại từ Control Panel.");
  }

  try {
    const tokens = await exchangeTiktokCode(code, TIKTOK_REDIRECT_URI, payload.codeVerifier);
    let profile: { username?: string; display_name?: string } = {};
    try {
      profile = await fetchTiktokUserInfo(tokens.access_token);
    } catch (err: any) {
      // Non-fatal — the account still connects; username/display_name just
      // backfill on the next scheduled sync instead of showing immediately.
      console.error("TikTok oauth/callback: fetchUserInfo lỗi (không chặn kết nối):", err.message || err);
    }

    await upsertTiktokAccount({
      open_id: tokens.open_id,
      username: profile.username || null,
      display_name: profile.display_name || null,
      brand: payload.brand,
      access_token_encrypted: encrypt(tokens.access_token),
      refresh_token_encrypted: encrypt(tokens.refresh_token),
      access_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      refresh_token_expires_at: new Date(Date.now() + tokens.refresh_expires_in * 1000).toISOString(),
      is_active: true,
      last_synced_at: null,
      last_sync_error: null,
      token_expired: false,
      created_at: new Date().toISOString(),
    });

    await logAction(
      { username: payload.username, role: "Admin" },
      req,
      "connect-tiktok-account",
      `Kết nối tài khoản TikTok ${profile.username || tokens.open_id}`
    );

    res.redirect(302, "/?tiktokConnected=1");
  } catch (err: any) {
    console.error("GET /api/tiktok/oauth/callback error:", err);
    res.status(500).send(`Kết nối TikTok thất bại: ${err.message}`);
  }
});

// GET /api/tiktok/accounts — list connected accounts (never returns tokens).
app.get("/api/tiktok/accounts", requireAuth("Admin"), async (req, res) => {
  try {
    const accounts = await getTiktokAccounts();
    res.json({
      success: true,
      accounts: accounts.map((a) => ({
        open_id: a.open_id,
        username: a.username,
        display_name: a.display_name,
        brand: a.brand,
        is_active: a.is_active,
        last_synced_at: a.last_synced_at,
        last_sync_error: a.last_sync_error,
        token_expired: a.token_expired,
      })),
      tiktokConfigured: isTiktokConfigured,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/tiktok/accounts/:open_id
app.delete("/api/tiktok/accounts/:open_id", requireAuth("Admin"), async (req, res) => {
  try {
    await deleteTiktokAccount(req.params.open_id);
    await logAction((req as any).session, req, "delete-tiktok-account", `Xóa tài khoản TikTok ${req.params.open_id}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tiktok/sync-now — Admin-only manual trigger.
app.post("/api/tiktok/sync-now", requireAuth("Admin"), async (req, res) => {
  try {
    const results = await runTiktokSync();
    await logAction((req as any).session, req, "sync-tiktok", `Đồng bộ thủ công ${results.length} tài khoản TikTok`);
    res.json({ success: true, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tiktok/insights?accounts=<open_id1,open_id2>&since=&until= — same
// shape/visibility as GET /api/fb/insights (any logged-in role).
app.get("/api/tiktok/insights", requireAuth(), async (req, res) => {
  try {
    const allAccounts = await getTiktokAccounts();
    const requestedIds =
      typeof req.query.accounts === "string" && req.query.accounts.length > 0
        ? req.query.accounts.split(",").map((s) => s.trim())
        : allAccounts.map((a) => a.open_id);

    const until = typeof req.query.until === "string" && req.query.until ? req.query.until : new Date().toISOString().slice(0, 10);
    const since = typeof req.query.since === "string" && req.query.since
      ? req.query.since
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [daily, posts] = await Promise.all([
      getTiktokInsightsDaily(requestedIds, since, until),
      getTiktokPosts(requestedIds, `${since}T00:00:00.000Z`, `${until}T23:59:59.999Z`),
    ]);

    res.json({
      success: true,
      accounts: allAccounts.map((a) => ({ open_id: a.open_id, username: a.username, display_name: a.display_name, brand: a.brand, is_active: a.is_active })),
      daily,
      posts,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default app;
