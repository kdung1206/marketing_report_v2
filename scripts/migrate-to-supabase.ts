// One-time migration: push the current src/db_store.json (live report data)
// into the Supabase app_state table, so the app can start reading/writing
// Supabase instead of the local file. Safe to re-run: it upserts by id and
// will simply overwrite row 'main' with whatever is in db_store.json again.
//
// Usage:
//   1. Run supabase/schema.sql once in the Supabase SQL Editor.
//   2. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
//   3. npx tsx scripts/migrate-to-supabase.ts
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config(); // fallback to .env if .env.local isn't used

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local. Dừng lại.");
    process.exit(1);
  }

  const dbPath = path.join(process.cwd(), "src", "db_store.json");
  const seedPath = path.join(process.cwd(), "src", "initial_data.json");
  const sourcePath = fs.existsSync(dbPath) ? dbPath : seedPath;

  console.log(`Đọc dữ liệu từ: ${sourcePath}`);
  const raw = fs.readFileSync(sourcePath, "utf8");
  const data = JSON.parse(raw);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase
    .from("app_state")
    .upsert({ id: "main", data, updated_at: new Date().toISOString() });

  if (error) {
    console.error("Ghi vào Supabase thất bại:", error.message);
    process.exit(1);
  }

  console.log("Đã di chuyển dữ liệu vào Supabase thành công (bảng app_state, id = 'main').");
}

main();
