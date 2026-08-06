// ---------------------------------------------------------------------------
// Persistent database. Production (Vercel) is always backed by Supabase
// (Postgres) — Vercel serverless functions have an ephemeral/read-only
// filesystem, so a file on disk cannot be the source of truth there, and
// every deployed instance/browser needs to share one store.
//
// Local dev (no SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY configured, the
// default — see supabaseClient.ts) instead reads/writes a local file,
// src/db_store.json (gitignored), so local testing is fully isolated from
// the real database. This is a deliberate design constraint, not a fallback
// of convenience: local testing must never be able to touch production data.
//
// Either way the stored shape is the same JSONB-like blob (digital_marketing,
// kol_koc, btl_trade, monthly_ooh_pr, btl_trade_monthly, comments,
// active_state, mail_config, users, fb_pages, fb_insights_daily, fb_posts).
//
// Extracted out of app.ts so src/server/facebookStore.ts can read/write the
// same local blob without a circular import between app.ts and
// facebookStore.ts (app.ts also imports facebookStore.ts's routes).
// ---------------------------------------------------------------------------
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { supabase, APP_STATE_ROW_ID, isSupabaseConfigured } from "./supabaseClient";

const INITIAL_DATA_PATH = path.join(process.cwd(), "src", "initial_data.json");
const LOCAL_DB_PATH = path.join(process.cwd(), "src", "db_store.json");

function readInitialSeed(): any {
  try {
    const raw = fs.readFileSync(INITIAL_DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read initial_data.json:", err);
    return { digital_marketing: [], kol_koc: [], btl_trade: [], monthly_ooh_pr: [] };
  }
}

export async function getDatabaseData(): Promise<any> {
  if (!isSupabaseConfigured) {
    let raw: string;
    try {
      raw = fs.readFileSync(LOCAL_DB_PATH, "utf8");
    } catch (err: any) {
      // Only a missing file (first run ever) is safe to auto-seed. Any other
      // read error must NOT fall through to reseeding — a previous version of
      // this function reseeded (and persisted!) on *any* error, including a
      // transient one from a concurrent writer truncating the file mid-write,
      // which silently destroyed real local data (fb_pages included) with no
      // way to recover it. Surface everything else as a real error instead.
      if (err.code !== "ENOENT") throw err;
      const seed = readInitialSeed();
      await saveDatabaseData(seed);
      return seed;
    }

    try {
      return JSON.parse(raw);
    } catch (err: any) {
      throw new Error(
        `src/db_store.json chứa JSON không hợp lệ — có thể bị đọc giữa lúc một tiến trình khác đang ghi file. ` +
        `Không tự động ghi đè/seed lại để tránh mất dữ liệu thật; hãy kiểm tra thủ công file này. Lỗi gốc: ${err.message}`
      );
    }
  }

  const { data, error } = await supabase
    .from("app_state")
    .select("data")
    .eq("id", APP_STATE_ROW_ID)
    .maybeSingle();

  if (error) {
    throw new Error(`Lỗi đọc dữ liệu từ Supabase: ${error.message}`);
  }

  if (data?.data) {
    return data.data;
  }

  // First run ever: seed the row from initial_data.json so the app has
  // something to show, then persist it so subsequent reads hit Supabase directly.
  const seed = readInitialSeed();
  await saveDatabaseData(seed);
  return seed;
}

export async function saveDatabaseData(fullData: any): Promise<void> {
  if (!isSupabaseConfigured) {
    // Write to a temp file then rename over the real path. A plain
    // writeFileSync truncates-then-writes in place, leaving a window where a
    // concurrent reader (another request) sees a half-written/empty file —
    // rename() is atomic on the same filesystem, so readers always see either
    // the fully-old or fully-new content, never a partial one.
    const tmpPath = `${LOCAL_DB_PATH}.tmp-${process.pid}-${crypto.randomBytes(4).toString("hex")}`;
    fs.writeFileSync(tmpPath, JSON.stringify(fullData, null, 2), "utf8");
    fs.renameSync(tmpPath, LOCAL_DB_PATH);
    return;
  }

  const { error } = await supabase
    .from("app_state")
    .upsert({ id: APP_STATE_ROW_ID, data: fullData, updated_at: new Date().toISOString() });

  if (error) {
    throw new Error(`Lỗi ghi dữ liệu vào Supabase: ${error.message}`);
  }
}
