// ---------------------------------------------------------------------------
// Full-database backup to Google Drive — the real "pg_dump equivalent" this
// app has never had. The existing weekly email backup (backupMailer.ts,
// src/lib/export.ts's buildFullDatabaseWorkbook) only ever covered the
// original report tables (digital_marketing/kol_koc/btl_trade/
// monthly_ooh_pr/btl_trade_monthly/comments/users) — every table added
// since (fb_pages, fb_insights_daily, fb_posts, fb_ad_accounts,
// ads_performance, tiktok_*, youtube_*, login_attempts, login_logs,
// action_logs) was never included in ANY backup. This dumps literally every
// table in supabase/schema.sql.
//
// Plain fetch() against the Drive v3 REST API only — no googleapis SDK, same
// reasoning as tiktokSync.ts/youtubeSync.ts (the previous YouTube Analytics
// attempt's SDK-bundle-size incident). OAuth is its own Google Cloud Client
// (GOOGLE_DRIVE_CLIENT_ID/SECRET/REDIRECT_URI) — deliberately separate from
// YOUTUBE_CLIENT_ID so this doesn't inherit whatever publish-status/expiry
// problems that project has; see .env.example for the option to reuse the
// same Google Cloud project anyway if you'd rather not create a second one.
//
// Only ever runs against Supabase (production) — local dev's db_store.json
// is a single file already backed up by copying it; there's nothing for
// this to dump locally that isn't already sitting right there on disk.
// ---------------------------------------------------------------------------
import { encrypt, decrypt } from "./crypto";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { getDatabaseData, saveDatabaseData } from "./appStateStore";

const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
export const DRIVE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const DRIVE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export const GOOGLE_DRIVE_CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID || "";
const GOOGLE_DRIVE_CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET || "";
export const GOOGLE_DRIVE_REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI || "";
export const isDriveBackupConfigured = Boolean(GOOGLE_DRIVE_CLIENT_ID && GOOGLE_DRIVE_CLIENT_SECRET && GOOGLE_DRIVE_REDIRECT_URI);

// drive.file (not full drive/drive.readonly) — this app only ever needs to
// see/manage files IT created, never the account's existing Drive content.
// userinfo.email is just so the Control Panel can show *which* Google
// account is connected, same reason as displaying a connected TikTok/YouTube
// account's name.
export const DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/userinfo.email"];

export interface DriveBackupConfig {
  enabled: boolean;
  connected_email: string | null;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  access_token_expires_at: string | null;
  folder_id: string | null; // null = upload to Drive root
  retention_days: number;
  last_backup_at: string | null;
  last_backup_error: string | null;
}

export const DEFAULT_DRIVE_BACKUP_CONFIG: DriveBackupConfig = {
  enabled: false,
  connected_email: null,
  access_token_encrypted: null,
  refresh_token_encrypted: null,
  access_token_expires_at: null,
  folder_id: null,
  retention_days: 30,
  last_backup_at: null,
  last_backup_error: null,
};

export async function getDriveBackupConfig(): Promise<DriveBackupConfig> {
  const store = await getDatabaseData();
  return { ...DEFAULT_DRIVE_BACKUP_CONFIG, ...(store.drive_backup_config || {}) };
}

export async function saveDriveBackupConfig(patch: Partial<DriveBackupConfig>): Promise<DriveBackupConfig> {
  const store = await getDatabaseData();
  const next = { ...DEFAULT_DRIVE_BACKUP_CONFIG, ...(store.drive_backup_config || {}), ...patch };
  store.drive_backup_config = next;
  await saveDatabaseData(store);
  return next;
}

class DriveApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

async function postTokenEndpoint(params: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(DRIVE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  const body = await res.json();
  if (!res.ok || body?.error) {
    throw new DriveApiError(body?.error_description || body?.error || `Google token endpoint trả về lỗi HTTP ${res.status}`, res.status);
  }
  return body as TokenResponse;
}

export async function exchangeDriveCode(code: string, redirectUri: string): Promise<TokenResponse> {
  return postTokenEndpoint({
    client_id: GOOGLE_DRIVE_CLIENT_ID,
    client_secret: GOOGLE_DRIVE_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });
}

async function refreshDriveToken(refreshToken: string): Promise<TokenResponse> {
  return postTokenEndpoint({
    client_id: GOOGLE_DRIVE_CLIENT_ID,
    client_secret: GOOGLE_DRIVE_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

export async function fetchGoogleEmail(accessToken: string): Promise<string | null> {
  const res = await fetch(USERINFO_URL, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return null;
  const body = await res.json();
  return body?.email || null;
}

// Ensures a valid access_token, refreshing (and persisting) if it's at/near
// expiry — same proactive-refresh pattern as tiktokSync.ts/youtubeSync.ts.
async function getValidAccessToken(config: DriveBackupConfig): Promise<string> {
  if (!config.refresh_token_encrypted) throw new Error("Chưa kết nối Google Drive.");
  const expiresAt = config.access_token_expires_at ? new Date(config.access_token_expires_at).getTime() : 0;
  if (config.access_token_encrypted && Date.now() < expiresAt - 5 * 60 * 1000) {
    return decrypt(config.access_token_encrypted);
  }
  const refreshToken = decrypt(config.refresh_token_encrypted);
  const refreshed = await refreshDriveToken(refreshToken);
  await saveDriveBackupConfig({
    access_token_encrypted: encrypt(refreshed.access_token),
    access_token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
  });
  return refreshed.access_token;
}

// Multipart upload (metadata + media in one request) built by hand — Drive's
// v3 upload endpoint is plain REST/multipart, no client library needed.
async function uploadJsonToDrive(accessToken: string, filename: string, jsonContent: string, folderId: string | null): Promise<void> {
  const boundary = `drive_backup_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const metadata: Record<string, unknown> = { name: filename, mimeType: "application/json" };
  if (folderId) metadata.parents = [folderId];

  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${jsonContent}\r\n` +
    `--${boundary}--`;

  const res = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": `multipart/related; boundary=${boundary}` },
    body,
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new DriveApiError(errBody?.error?.message || `Drive upload trả về lỗi HTTP ${res.status}`, res.status);
  }
}

interface DriveFileMeta {
  id: string;
  name: string;
  createdTime: string;
}

async function listBackupFiles(accessToken: string, folderId: string | null): Promise<DriveFileMeta[]> {
  const q = [
    "name contains 'marketing_report_v2_backup_'",
    "trashed = false",
    folderId ? `'${folderId}' in parents` : null,
  ]
    .filter(Boolean)
    .join(" and ");
  const params = new URLSearchParams({ q, fields: "files(id,name,createdTime)", pageSize: "1000" });
  const res = await fetch(`${DRIVE_FILES_URL}?${params.toString()}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new DriveApiError(errBody?.error?.message || `Drive files.list trả về lỗi HTTP ${res.status}`, res.status);
  }
  const body = await res.json();
  return body?.files || [];
}

async function deleteBackupFile(accessToken: string, fileId: string): Promise<void> {
  const res = await fetch(`${DRIVE_FILES_URL}/${fileId}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
  // 404 just means it's already gone (e.g. deleted manually) — not an error worth failing the whole backup over.
  if (!res.ok && res.status !== 404) {
    const errBody = await res.json().catch(() => ({}));
    throw new DriveApiError(errBody?.error?.message || `Drive files.delete trả về lỗi HTTP ${res.status}`, res.status);
  }
}

// Every table in supabase/schema.sql — see that file's `create table`
// statements. Kept as an explicit list (not introspected at runtime) so a
// forgotten new table shows up as an obvious "add it here" review comment
// the next time this file is touched, rather than silently never being backed up.
const RELATIONAL_TABLES = [
  "login_attempts",
  "login_logs",
  "action_logs",
  "fb_pages",
  "fb_insights_daily",
  "fb_posts",
  "fb_ad_accounts",
  "google_ads_accounts",
  "tiktok_ads_accounts",
  "ads_performance",
  "tiktok_accounts",
  "tiktok_insights_daily",
  "tiktok_posts",
  "youtube_accounts",
  "youtube_insights_daily",
  "youtube_videos",
] as const;

export async function runDriveBackup(): Promise<{ filename: string; tables: Record<string, number> }> {
  if (!isDriveBackupConfigured) {
    throw new Error("GOOGLE_DRIVE_CLIENT_ID / GOOGLE_DRIVE_CLIENT_SECRET / GOOGLE_DRIVE_REDIRECT_URI chưa được cấu hình.");
  }
  if (!isSupabaseConfigured) {
    throw new Error("Sao lưu Google Drive chỉ chạy trên production (Supabase) — không áp dụng cho local dev.");
  }

  const config = await getDriveBackupConfig();
  if (!config.refresh_token_encrypted) {
    throw new Error("Chưa kết nối Google Drive — vào Control Panel → Sao Lưu Tự Động để kết nối.");
  }

  try {
    const accessToken = await getValidAccessToken(config);

    const appState = await getDatabaseData();
    const dump: Record<string, unknown> = { app_state: appState };
    const tableCounts: Record<string, number> = {};

    for (const table of RELATIONAL_TABLES) {
      const { data, error } = await supabase.from(table).select("*");
      if (error) throw new Error(`Lỗi đọc bảng ${table}: ${error.message}`);
      dump[table] = data || [];
      tableCounts[table] = (data || []).length;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `marketing_report_v2_backup_${timestamp}.json`;
    await uploadJsonToDrive(accessToken, filename, JSON.stringify(dump), config.folder_id);

    // Retention cleanup — best-effort, must not fail the backup that just
    // succeeded just because an old file couldn't be deleted.
    try {
      const files = await listBackupFiles(accessToken, config.folder_id);
      const cutoff = Date.now() - config.retention_days * 24 * 60 * 60 * 1000;
      const stale = files.filter((f) => new Date(f.createdTime).getTime() < cutoff);
      for (const f of stale) await deleteBackupFile(accessToken, f.id).catch(() => {});
    } catch (err: any) {
      console.error("Drive backup retention cleanup lỗi (không chặn backup):", err.message || err);
    }

    await saveDriveBackupConfig({ last_backup_at: new Date().toISOString(), last_backup_error: null });
    return { filename, tables: tableCounts };
  } catch (err: any) {
    await saveDriveBackupConfig({ last_backup_error: err.message || String(err) }).catch(() => {});
    throw err;
  }
}
