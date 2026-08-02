// ---------------------------------------------------------------------------
// Server-only Supabase client. Uses the SERVICE ROLE key, which bypasses Row
// Level Security — this file must NEVER be imported from client code
// (anything under src/ that ends up in the Vite/browser bundle). It is only
// imported by src/server/app.ts, which runs on the Express server (local dev)
// or inside a Vercel serverless function — both are Node-only environments
// where process.env is not shipped to the browser.
// ---------------------------------------------------------------------------
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load env vars here rather than relying on app.ts to have done it first:
// ES module imports all evaluate before the importing file's own top-level
// code runs, so if app.ts's dotenv.config() ran after `import "./supabaseClient"`,
// this file would read process.env before it was populated and permanently
// bake empty/placeholder values into the client below.
dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Whether the real Supabase project is wired up. Intentionally false for
// local dev by default: local testing must never touch the production
// database (a "Khôi phục mặc định" click during local testing once wiped
// real report data with no way to recover it — see git history / removed
// POST /api/reset-data). When false, src/server/app.ts falls back to a
// local-only JSON file (src/db_store.json, gitignored) plus in-memory rate
// limiting and audit logs, so local dev still fully works — it's just
// isolated from anything real. Only Vercel (production) sets these env vars.
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

if (!isSupabaseConfigured) {
  console.warn(
    "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình — đang chạy ở chế độ LOCAL-ONLY " +
    "(dữ liệu lưu vào src/db_store.json, không đụng đến Supabase thật). Đây là hành vi mong muốn cho " +
    "môi trường dev cục bộ; chỉ khai báo 2 biến này trên Vercel (production)."
  );
}

// createClient() throws synchronously if given an empty string, which would
// crash the whole process (and every unrelated route) at startup/import time
// when Supabase isn't configured yet. Fall back to a placeholder URL so the
// client only fails the individual request that actually touches Supabase,
// with a clear error message from that route's try/catch instead.
export const supabase = createClient(
  SUPABASE_URL || "https://placeholder.invalid",
  SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key",
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export const APP_STATE_ROW_ID = "main";
