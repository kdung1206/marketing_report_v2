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
  // Passwords are never stored in plaintext. `passwordHash` = SHA-256(`${salt}:${plainPassword}`), hex-encoded.
  passwordHash?: string;
  salt?: string;
  name: string;
  role: "Admin" | "Editor" | "Viewer";
}

// Precomputed with src/lib/passwordHash.ts (SHA-256 + per-user salt).
// Plaintext passwords are intentionally NOT written anywhere in this repo
// (it's public) — save them in your own password manager instead.
export const DEFAULT_USERS: UserAccount[] = [
  { username: "ntkdung1206@gmail.com", salt: "3e83a6d1a854840d5e1af6028d17224d", passwordHash: "77bb43ffd629f0621d85cd86a0b2e55551a8c0d7eadb7c3e9c65fddb35842511", name: "Dũng Nguyễn", role: "Admin" },
  { username: "admin", salt: "8f89341202e6b122fd50319143c90700", passwordHash: "15725c760fe8dfef6c39c3ebc343183d7a7ceb6a8a964d1d60b07b4ac2c26020", name: "Quản trị hệ thống", role: "Admin" },
  { username: "editor1", salt: "8a7a42e05d4a245bb937ff9e038ddae5", passwordHash: "70b94d7025353a71dbdcf0250875d6a54e640be672693aa3cea56d80a12bfd7a", name: "Nguyễn Biên Tập", role: "Editor" },
  { username: "viewer1", salt: "9891b5004f979ed95778a77d487a15fc", passwordHash: "7fdc2efb593acbeb57e98d555a3fdce244f547a5a73fa13df66ad61678e2c7b9", name: "Người xem", role: "Viewer" },
  { username: "viewer2", salt: "1bc2d4bf855a868da0e6b85fe199bdc6", passwordHash: "a1d752a1b080a097507451db46a0d1fb1581ac9a7d3317c05af4b326123de5be", name: "Viewer 2", role: "Viewer" }
];

// Bump this number any time DEFAULT_USERS credentials/roles change in code.
// Every browser reconciles the shared user list against the current
// DEFAULT_USERS whenever it sees a newer version — this guarantees credential
// fixes always take effect everywhere. Any extra accounts that aren't part of
// DEFAULT_USERS (added later through the user-management UI) are preserved as-is.
export const USERS_CONFIG_VERSION = 3; // v3: switched from plaintext `password` to salted `passwordHash`

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
