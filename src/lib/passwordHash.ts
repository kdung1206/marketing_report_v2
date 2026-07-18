// ---------------------------------------------------------------------------
// Client-side password hashing (SHA-256 + per-user salt), using the
// browser's built-in Web Crypto API — no external library needed.
//
// WHAT THIS SOLVES: previously DEFAULT_USERS stored plaintext passwords
// (e.g. `password: "123"`), which meant anyone could read every account's
// real password directly from "View Page Source" / the shipped JS bundle.
// Now only a salted hash is stored/shipped, so the plaintext password is
// never present in the source code or the built JS at all.
//
// WHAT THIS DOES **NOT** SOLVE (please read — important limitations):
//   - This is still a 100% client-side, static site (GitHub Pages has no
//     server). The hash + comparison logic itself is still visible to
//     anyone in the JS bundle, so a technically determined person could:
//       a) brute-force weak/short passwords offline against the hash, or
//       b) simply open the browser console and forge a logged-in state
//          directly (e.g. call the app's own React state setters), since
//          there is no server verifying anything.
//   - This protects against the *casual* "view source and read the
//     password" case, and against passwords being trivially copy-pasted
//     out of the repo. It is NOT equivalent to real server-side
//     authentication (see the Firebase/Supabase Auth recommendation).
// ---------------------------------------------------------------------------

export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digestBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digestBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const computed = await hashPassword(password, salt);
  return computed === expectedHash;
}
