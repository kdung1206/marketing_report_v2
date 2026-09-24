// One-off local-dev seed: duplicates the "Bếp từ đôi" demo dataset from
// `task cần làm/campaign task/vi-du-mau-migrate-campaign-excel.xlsx` two more
// times, each shifted to a different timeline, so the Campaign Calendar
// Gantt/KPI tiles have enough data to look populated when testing/comparing
// against the reference KAROFI PH DM Cockpit UI.
//
// Local dev only — writes straight to src/db_store.json via campaignStore's
// existing local-blob path (same file the running `npm run dev` reads on
// every request, no restart needed). Refuses to run at all if Supabase env
// vars are configured, so it can never touch a real project by accident.
//
// Run: npx tsx scripts/seed-campaign-demo.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { isSupabaseConfigured } from "../src/server/supabaseClient";
import { getCategories, createCategory, createCampaign, createTask, addCampaignMember, Brand } from "../src/server/campaignStore";

if (isSupabaseConfigured) {
  console.error(
    "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY đang được cấu hình — script này CHỈ chạy ở chế độ local " +
    "(ghi vào src/db_store.json). Bỏ 2 biến này khỏi .env.local nếu bạn thực sự muốn seed local, hoặc " +
    "đừng chạy script này nếu bạn đang trỏ vào Supabase thật."
  );
  process.exit(1);
}

const CREATOR = "admin"; // real DEFAULT_USERS account — see src/lib/defaultUsers.ts
const MEMBERS = ["admin", "editor1"]; // both can edit every seeded campaign

function shift(dateStr: string, months: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

interface TaskSeed {
  title: string;
  assignee: string | null;
  start: string;
  end: string;
  priority: "Low" | "Medium" | "High";
  status: "To do" | "In progress" | "Blocked" | "Done";
}

interface CampaignSeed {
  name: string;
  type: string;
  channel: string;
  status: "Planned" | "Live" | "Done";
  start: string;
  end: string;
  budget: number;
  pic: string;
  tasks: TaskSeed[];
}

// Mirrors the 3 campaigns / 12 tasks in vi-du-mau-migrate-campaign-excel.xlsx
// (Campaigns/Tasks sheets), dates relative to the original Mar–Jun 2026 run.
const TEMPLATE: CampaignSeed[] = [
  {
    name: "Ra mắt Bếp từ đôi 2026 - Awareness",
    type: "Awareness",
    channel: "Multi",
    status: "Live",
    start: "2026-03-01",
    end: "2026-06-30",
    budget: 450000000,
    pic: "editor1",
    tasks: [
      { title: "Thiết kế concept KV hình ảnh chính", assignee: "editor1", start: "2026-03-01", end: "2026-03-08", priority: "High", status: "Done" },
      { title: "Chụp ảnh sản phẩm studio", assignee: "editor1", start: "2026-03-09", end: "2026-03-15", priority: "Medium", status: "Done" },
      { title: "Viết kịch bản TVC", assignee: "admin", start: "2026-03-10", end: "2026-03-18", priority: "High", status: "Done" },
      { title: "Quay và dựng TVC", assignee: null, start: "2026-03-19", end: "2026-03-31", priority: "High", status: "In progress" },
      { title: "Chốt bảng giá bán lẻ", assignee: "admin", start: "2026-03-20", end: "2026-03-23", priority: "High", status: "Done" },
      { title: "Duyệt chính sách chiết khấu Sale", assignee: "admin", start: "2026-03-23", end: "2026-03-25", priority: "Medium", status: "Done" },
    ],
  },
  {
    name: "Bếp từ đôi - Promo mở bán sớm",
    type: "Conversion",
    channel: "TMDT + Social",
    status: "Live",
    start: "2026-04-01",
    end: "2026-04-15",
    budget: 120000000,
    pic: "editor1",
    tasks: [
      { title: "Setup mã voucher Shopee/Lazada", assignee: "editor1", start: "2026-04-01", end: "2026-04-03", priority: "Medium", status: "Done" },
      { title: "Test flow áp mã trên sàn", assignee: "editor1", start: "2026-04-03", end: "2026-04-05", priority: "Low", status: "Done" },
      { title: "Danh sách KOL đề xuất", assignee: "editor1", start: "2026-04-05", end: "2026-04-07", priority: "Medium", status: "In progress" },
      { title: "Gửi sản phẩm cho KOL review", assignee: null, start: "2026-04-08", end: "2026-04-10", priority: "Medium", status: "To do" },
    ],
  },
  {
    name: "Bếp từ đôi - Trade activation NPP miền Bắc",
    type: "Trade",
    channel: "Offline",
    status: "Planned",
    start: "2026-05-01",
    end: "2026-05-31",
    budget: 80000000,
    pic: "admin",
    tasks: [
      { title: "Thiết kế file in standee", assignee: "admin", start: "2026-05-05", end: "2026-05-10", priority: "Medium", status: "To do" },
      { title: "Làm việc với xưởng in", assignee: "admin", start: "2026-05-10", end: "2026-05-20", priority: "Medium", status: "To do" },
    ],
  },
];

const WAVES: { label: string; offsetMonths: number }[] = [
  { label: "Wave 1", offsetMonths: 0 }, // unchanged — matches the original xlsx template
  { label: "Wave 2", offsetMonths: 4 }, // Jul–Oct 2026 — overlaps "today" (2026-09-15)
  { label: "Wave 3", offsetMonths: 7 }, // Oct 2026–Jan 2027
];

const BRAND: Brand = "Livotec";
const CATEGORY_NAME = "Bếp từ đôi";

async function main() {
  let categories = await getCategories();
  let category = categories.find((c) => c.brand === BRAND && c.name === CATEGORY_NAME);
  if (!category) {
    category = await createCategory({ brand: BRAND, name: CATEGORY_NAME });
    console.log(`Đã tạo ngành hàng "${CATEGORY_NAME}" (${BRAND}).`);
  }

  let campaignCount = 0;
  let taskCount = 0;

  for (const wave of WAVES) {
    for (const c of TEMPLATE) {
      const campaign = await createCampaign(
        {
          name: `${c.name} (${wave.label})`,
          type: c.type,
          brand: BRAND,
          category_id: category.id,
          channel: c.channel,
          status: c.status,
          start_date: shift(c.start, wave.offsetMonths),
          end_date: shift(c.end, wave.offsetMonths),
          budget: c.budget,
          pic_username: c.pic,
        },
        CREATOR
      );
      campaignCount += 1;
      for (const username of MEMBERS) {
        await addCampaignMember(campaign.id, username, CREATOR);
      }

      for (const t of c.tasks) {
        await createTask(
          {
            title: t.title,
            task_type: "campaign",
            campaign_id: campaign.id,
            assignee_username: t.assignee,
            start_date: shift(t.start, wave.offsetMonths),
            end_date: shift(t.end, wave.offsetMonths),
            priority: t.priority,
            status: t.status,
          },
          CREATOR
        );
        taskCount += 1;
      }
    }
  }

  console.log(`Đã seed ${campaignCount} campaign và ${taskCount} task (${WAVES.length} timeline khác nhau) vào src/db_store.json.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed thất bại:", err);
    process.exit(1);
  });
