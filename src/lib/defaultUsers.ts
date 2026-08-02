// ---------------------------------------------------------------------------
// Shared between client (App.tsx) and server (src/server/app.ts, auth.ts) so
// both sides agree on the same default accounts and reconciliation rules.
// The server is now the only place that ever sees passwordHash/salt for
// existing accounts — GET /api/get-users strips them before responding — so
// this type marks them optional: client-held UserAccount objects legitimately
// lack these fields.
// ---------------------------------------------------------------------------

export interface UserAccount {
  username: string;
  // Passwords are never stored in plaintext. Two hash formats exist:
  //   - "scrypt:<hex>" — src/lib/serverPasswordHash.ts (current, server-only,
  //     memory-hard). All new/rotated passwords use this.
  //   - "<64 hex chars>" (no prefix) — legacy src/lib/passwordHash.ts
  //     (single-round SHA-256). Verified for backward compatibility only;
  //     transparently rehashed to scrypt on next successful login.
  passwordHash?: string;
  salt?: string;
  // Client → server only, for POST /api/save-users: set to rotate/create a
  // password. The server hashes it (scrypt) and never persists or echoes
  // back this field. Never present on data read back from the server.
  newPassword?: string;
  name: string;
  role: "Admin" | "Editor" | "Viewer";
}

// Precomputed with src/lib/serverPasswordHash.ts (scrypt + per-user salt),
// except viewer1/viewer2 which are still on the legacy SHA-256 format (see
// UserAccount.passwordHash doc above) since rotating their password wasn't
// requested and doing so requires knowing the plaintext to rehash.
// Plaintext passwords are intentionally NOT written anywhere in this repo
// (it's public) — save them in your own password manager instead.
export const DEFAULT_USERS: UserAccount[] = [
  { username: "ntkdung1206@gmail.com", salt: "1b59cef3728bd945106ace0e2a8feaf1", passwordHash: "scrypt:2a8392a87ea3c81a625c6d9cc09ee876f9aaa0f2e27c7a473b4e1633d3b58a0d3106dfb1929520f89aededc338057488b9cf40d3a37cfb8aaf121963b21dc507", name: "Dũng Nguyễn", role: "Admin" },
  { username: "admin", salt: "9a3400813aaa7e03ea5617378950727b", passwordHash: "scrypt:962b332155cc79a7d53dfd90efd38e43ab694c1eeb1f3758ab8d763c397b2b23241cd472afafc6fe39916bd6715df5b8b08c759a184dc618bb0df30a705c6065", name: "Quản trị hệ thống", role: "Admin" },
  { username: "editor1", salt: "78352da124ad5c0f0590a1fb41e387ad", passwordHash: "scrypt:fba642d3dc46433ed8d869addd6d7eca85f7878257fe412bc12ee22f7f73c24a43ad28e644e1945d421f6391bc3d633f5230c34074379d77de2145faa92033b9", name: "Nguyễn Biên Tập", role: "Editor" },
  { username: "viewer1", salt: "9891b5004f979ed95778a77d487a15fc", passwordHash: "7fdc2efb593acbeb57e98d555a3fdce244f547a5a73fa13df66ad61678e2c7b9", name: "Người xem", role: "Viewer" },
  { username: "viewer2", salt: "1bc2d4bf855a868da0e6b85fe199bdc6", passwordHash: "a1d752a1b080a097507451db46a0d1fb1581ac9a7d3317c05af4b326123de5be", name: "Viewer 2", role: "Viewer" }
];

// Bump this number any time DEFAULT_USERS credentials/roles change in code.
// Every browser reconciles the shared user list against the current
// DEFAULT_USERS whenever it sees a newer version — this guarantees credential
// fixes always take effect everywhere. Any extra accounts that aren't part of
// DEFAULT_USERS (added later through the user-management UI) are preserved as-is.
export const USERS_CONFIG_VERSION = 5; // v5: rotated Admin/Editor passwords + migrated their hashes to scrypt

export function reconcileUsers(savedList: UserAccount[], savedVersion: number): UserAccount[] {
  if (savedVersion >= USERS_CONFIG_VERSION) {
    return savedList;
  }
  const defaultUsernames = new Set(DEFAULT_USERS.map((u) => u.username.toLowerCase()));
  // Validity is based on shape only (username + role) — passwordHash/salt are
  // no longer guaranteed to be present client-side, since the server strips
  // them from GET /api/get-users responses.
  const customExtras = savedList.filter(
    (u: any) =>
      !defaultUsernames.has((u.username || "").toLowerCase()) &&
      typeof u.username === "string" &&
      typeof u.role === "string"
  );
  return [...DEFAULT_USERS, ...customExtras];
}
