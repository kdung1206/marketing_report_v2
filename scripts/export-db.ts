import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

import { supabase, APP_STATE_ROW_ID } from "../src/server/supabaseClient";

async function main() {
  const { data, error } = await supabase
    .from("app_state")
    .select("data, updated_at")
    .eq("id", APP_STATE_ROW_ID)
    .maybeSingle();

  if (error) {
    console.error("Lỗi đọc dữ liệu từ Supabase:", error.message);
    process.exit(1);
  }

  if (!data) {
    console.error("Không tìm thấy dòng app_state trong Supabase.");
    process.exit(1);
  }

  const outPath = path.join(process.cwd(), "db_export.json");
  fs.writeFileSync(outPath, JSON.stringify(data.data, null, 2), "utf8");
  console.log(`Đã xuất dữ liệu (cập nhật lần cuối: ${data.updated_at}) vào ${outPath}`);
}

main();
