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
dotenv.config({ path: ".env.local" });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình. " +
    "Các API đọc/ghi dữ liệu sẽ báo lỗi cho đến khi bạn khai báo 2 biến này (xem .env.example)."
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
