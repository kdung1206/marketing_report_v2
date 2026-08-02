// ---------------------------------------------------------------------------
// Server-only password hashing. Uses Node's built-in `crypto.scrypt` (no new
// dependency) instead of the legacy single-round SHA-256 in passwordHash.ts:
// scrypt is deliberately slow and memory-hard, so brute-forcing a leaked
// hash+salt pair offline costs far more per guess than a bare SHA-256 digest.
//
// This file must NEVER be imported from client code (anything under src/
// that ends up in the Vite/browser bundle) — `crypto.scryptSync` is Node-only.
// Only src/server/app.ts (Express/Vercel serverless, Node-only) imports it.
//
// Hash format: passwordHash is either
//   - "scrypt:<hex>"  → this module's format, verified with scryptSync
//   - "<64 hex chars>" (no prefix) → legacy SHA-256 format from
//     src/lib/passwordHash.ts, verified there. New/rotated passwords always
//     get the "scrypt:" format; existing legacy accounts are transparently
//     rehashed to scrypt the next time they log in successfully (see
//     POST /api/login in src/server/app.ts).
// ---------------------------------------------------------------------------
import crypto from "crypto";
import { verifyPassword as verifyLegacyPassword } from "./passwordHash";

const SCRYPT_PREFIX = "scrypt:";
const SCRYPT_KEYLEN = 64;

export function generateServerSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function hashPasswordScrypt(password: string, salt: string): string {
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return SCRYPT_PREFIX + derived.toString("hex");
}

export function isScryptHash(hash: string | undefined | null): boolean {
  return typeof hash === "string" && hash.startsWith(SCRYPT_PREFIX);
}

// Verifies `password` against whichever format `storedHash` is in. Returns
// false (rather than throwing) for malformed/missing input so callers can
// treat it the same as "wrong password".
export async function verifyPasswordAny(
  password: string,
  salt: string | undefined | null,
  storedHash: string | undefined | null
): Promise<boolean> {
  if (!salt || !storedHash) return false;

  if (isScryptHash(storedHash)) {
    const expected = hashPasswordScrypt(password, salt);
    const expectedBuf = Buffer.from(expected);
    const storedBuf = Buffer.from(storedHash);
    return expectedBuf.length === storedBuf.length && crypto.timingSafeEqual(expectedBuf, storedBuf);
  }

  return verifyLegacyPassword(password, salt, storedHash);
}
