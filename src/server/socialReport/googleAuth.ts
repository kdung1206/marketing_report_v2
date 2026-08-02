// ---------------------------------------------------------------------------
// Google OAuth2 client + the one-time consent flow used to obtain a
// long-lived refresh token for both YouTube Analytics and Google Ads (same
// Google account owns both, so one OAuth grant covers both scopes).
//
// The refresh token is stored encrypted (see ../crypto.ts) inside the shared
// app_state blob, alongside every other piece of app data — not in a
// separate table, matching how mail_config's SMTP password is stored.
// ---------------------------------------------------------------------------
import crypto from "crypto";
// Deliberately importing the small, single-API `@googleapis/youtube` package
// rather than the `googleapis` umbrella package: the umbrella package bundles
// generated client code for every Google API there is, which blew up the
// Vercel serverless function bundle (api/index.js) to ~94MB when esbuild
// inlined it. `@googleapis/youtube` and `@googleapis/youtubeanalytics` (see
// youtube.ts) both depend on the same shared `googleapis-common`, so the
// `auth.OAuth2` instance built here is type-compatible with both.
import { auth } from "@googleapis/youtube";
import { encrypt, decrypt } from "../crypto";
import type { SocialReportState, GoogleOAuthTokenRecord } from "./types";

export type OAuth2Client = InstanceType<typeof auth.OAuth2>;

// No fallback default: a hardcoded OAuth client secret in this public repo
// would let anyone impersonate this app to Google. Consumers must check
// isGoogleOAuthConfigured() before calling anything else in this module.
const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI || "";

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET && REDIRECT_URI);
}

// Read-only scopes only: YouTube Analytics + the video-listing scope needed
// to auto-discover recent uploads, plus Google Ads (which unfortunately has
// no read-only-specific scope — `adwords` is the only one — but every call
// this module makes is a `query`/report read, never a mutate).
export const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/yt-analytics.readonly",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/adwords",
];

function buildOAuth2Client() {
  return new auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

// ---------------------------------------------------------------------------
// Signed, stateless "state" param (HMAC, same construction as auth.ts's
// session tokens) — proves the OAuth flow was started by an authenticated
// Admin a few minutes ago, without needing any server-side session storage.
// Vercel serverless functions don't share memory across invocations, so the
// /start and /callback hits can land on two different instances; a
// self-verifying signed value is the only stateless option here. Reuses
// SESSION_SECRET rather than introducing a new env var.
// ---------------------------------------------------------------------------
const STATE_TTL_SECONDS = 10 * 60;

function getStateSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET chưa được cấu hình (dùng chung để ký state cho luồng OAuth Google).");
  }
  return secret;
}

export function signOAuthState(username: string): string {
  const payload = { username, exp: Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", getStateSecret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyOAuthState(state: string | undefined | null): { username: string } | null {
  if (!state || !state.includes(".")) return null;
  const [data, sig] = state.split(".");
  if (!data || !sig) return null;
  const expected = crypto.createHmac("sha256", getStateSecret()).update(data).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) return null;
    return { username: payload.username };
  } catch {
    return null;
  }
}

export function buildGoogleAuthUrl(state: string): string {
  const client = buildOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline", // required to get a refresh_token back at all
    prompt: "consent", // force the consent screen every time so a refresh_token is re-issued even on a re-connect
    scope: GOOGLE_OAUTH_SCOPES,
    state,
  });
}

export async function exchangeCodeForTokens(code: string): Promise<{ refreshToken: string; scope: string }> {
  const client = buildOAuth2Client();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error(
      "Google không trả về refresh_token. Nguyên nhân thường gặp: tài khoản này đã từng cấp quyền trước đó — " +
      "vào https://myaccount.google.com/permissions, gỡ quyền của ứng dụng này rồi thử kết nối lại."
    );
  }
  return { refreshToken: tokens.refresh_token, scope: tokens.scope || GOOGLE_OAUTH_SCOPES.join(" ") };
}

export function saveGoogleTokenIntoState(
  state: SocialReportState,
  refreshToken: string,
  scope: string,
  connectedBy: string
): void {
  const record: GoogleOAuthTokenRecord = {
    refreshTokenEnc: encrypt(refreshToken),
    scope,
    connectedAt: new Date().toISOString(),
    connectedBy,
  };
  state.oauth = { ...(state.oauth || {}), google: record };
}

export function isGoogleConnected(state: SocialReportState): boolean {
  return Boolean(state.oauth?.google?.refreshTokenEnc);
}

// Builds an OAuth2Client already carrying the decrypted stored refresh token,
// ready to hand to youtube.ts / googleAds.ts. Throws with a clear Vietnamese
// message if nothing is connected yet — every caller should surface that
// message rather than a raw Google SDK error.
export function getAuthorizedClient(state: SocialReportState) {
  const record = state.oauth?.google;
  if (!record?.refreshTokenEnc) {
    throw new Error("Chưa kết nối tài khoản Google. Vào Social Report → Kết nối Google để cấp quyền trước.");
  }
  const client = buildOAuth2Client();
  client.setCredentials({ refresh_token: decrypt(record.refreshTokenEnc) });
  return client;
}

export function getDecryptedRefreshToken(state: SocialReportState): string {
  const record = state.oauth?.google;
  if (!record?.refreshTokenEnc) {
    throw new Error("Chưa kết nối tài khoản Google.");
  }
  return decrypt(record.refreshTokenEnc);
}
