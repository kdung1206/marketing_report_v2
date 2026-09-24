import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  ListChecks,
  PlusCircle,
  Trash2,
  Pencil,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  X,
  ChevronLeft,
  ChevronRight,
  Link2,
  ImagePlus,
  RefreshCcw,
  Zap,
} from "lucide-react";
import { safeFetchJson } from "../App";
import type { UserAccount } from "../lib/defaultUsers";

// Campaign Calendar & Campaign Task. See
// `task cần làm/campaign task/tong-hop-campaign-calendar-task.md` for the
// full spec. Gantt chart (grouped by category, month view) and Asset Library
// were originally Phase 2/3 but were brought forward to match the reference
// KAROFI PH DM Cockpit UI. Activities (Key Activities) and AlwaysOn
// recurrence are still later phases — campaign progress here is a
// placeholder (% of that campaign's own tasks marked Done) until Activities
// ship and the real "average per-activity completion" rule from mục 6 in the
// spec doc applies.

type Brand = "Livotec" | "Karofi";
type TaskType = "campaign" | "alwayson" | "adhoc";
type TaskStatus = "To do" | "In progress" | "Blocked" | "Done";

interface Category {
  id: string;
  brand: Brand;
  name: string;
}

interface Campaign {
  id: string;
  name: string;
  type: string | null;
  brand: Brand;
  category_id: string | null;
  channel: string | null;
  status: "Planned" | "Live" | "Done";
  start_date: string;
  end_date: string;
  budget: number | null;
  pic_username: string | null;
  visual_gallery_url: string | null;
  visual_urls: string[];
  can_edit: boolean;
}

type AssetGroupKey = "Branding" | "Performance" | "Project";

interface AssetLink {
  id: string;
  group_key: AssetGroupKey;
  label: string;
  url: string;
}

const ASSET_GROUPS: { key: AssetGroupKey; label: string; hint: string }[] = [
  { key: "Branding", label: "Branding", hint: "Brand guideline, key visual, logo, font — tài nguyên nhận diện thương hiệu dùng lại được" },
  { key: "Performance", label: "Performance", hint: "Dashboard/báo cáo hiệu suất, file tracker chạy ads" },
  { key: "Project", label: "Project", hint: "Tài liệu quản lý dự án, timeline, biên bản họp" },
];

// Cycled per category swimlane in the Gantt chart — matches the reference UI
// (each MKT PIC group gets its own bar color).
const GANTT_COLORS = [
  { bar: "bg-indigo-500", text: "text-white" },
  { bar: "bg-sky-400", text: "text-white" },
  { bar: "bg-emerald-600", text: "text-white" },
  { bar: "bg-lime-300", text: "text-slate-800" },
  { bar: "bg-slate-400", text: "text-white" },
];

interface Task {
  id: string;
  title: string;
  task_type: TaskType;
  campaign_id: string | null;
  assignee_username: string | null;
  start_date: string | null;
  end_date: string | null;
  priority: "Low" | "Medium" | "High";
  status: TaskStatus;
  blocked_reason: string | null;
  due_soon_threshold_days: number;
  parent_task_id: string | null;
  created_by: string;
  can_edit: boolean;
}

interface BasicUser {
  username: string;
  name: string;
}

interface CampaignMember {
  campaign_id: string;
  username: string;
}

const EMPTY_CAMPAIGN_FORM = {
  name: "",
  type: "",
  brand: "Livotec" as Brand,
  category_id: "",
  channel: "",
  status: "Planned" as Campaign["status"],
  start_date: "",
  end_date: "",
  budget: "",
  pic_username: "",
  visual_gallery_url: "",
  visual_urls_text: "", // textarea, one URL per line — split into visual_urls on submit
};

const EMPTY_TASK_FORM = {
  title: "",
  task_type: "campaign" as TaskType,
  campaign_id: "",
  assignee_username: "",
  start_date: "",
  end_date: "",
  priority: "Medium" as Task["priority"],
  status: "To do" as TaskStatus,
  parent_task_id: "",
};

function daysUntil(dateStr: string): number {
  const end = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86400000);
}

// null = no warning, "overdue" = past end_date and not Done, "due-soon" =
// within due_soon_threshold_days of end_date and not Done. See mục 6/10 in
// tong-hop-campaign-calendar-task.md for the exact rule + worked example.
function taskUrgency(t: Task): "overdue" | "due-soon" | null {
  if (t.status === "Done" || !t.end_date) return null;
  const diff = daysUntil(t.end_date);
  if (diff < 0) return "overdue";
  if (diff <= t.due_soon_threshold_days) return "due-soon";
  return null;
}

// -- Gantt period helpers (Month or Week view) ------------------------------

type GanttViewMode = "month" | "week";
type GanttGroupBy = "category" | "pic";

// Campaign start/end are now full timestamps ("2026-03-01T09:15:30..."),
// recorded down to the second — but existing seed/demo data (and any row
// created before that change) may still be a bare "YYYY-MM-DD" date, so both
// forms are accepted here. A bare date is parsed as LOCAL midnight (appending
// "T00:00:00"), not UTC midnight — JS's own date-only parsing defaults to
// UTC, which would silently shift the displayed day in some timezones.
function toDateOnly(dateStr: string): Date {
  return dateStr.includes("T") ? new Date(dateStr) : new Date(dateStr + "T00:00:00");
}

function endOfDay(d: Date): Date {
  const result = new Date(d);
  result.setHours(23, 59, 59, 999);
  return result;
}

// <input type="datetime-local" step="1"> reads/writes "YYYY-MM-DDTHH:mm:ss"
// with NO timezone suffix, which the Date constructor (and toISOString on
// the resulting Date) treats as local wall-clock time — exactly what we
// want, since campaign start/end are entered in the user's own timezone.
function toDatetimeLocalValue(dateStr: string): string {
  const d = toDateOnly(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

function formatDateTime(dateStr: string): string {
  const d = toDateOnly(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

// Monday-based week start, to match how Vietnamese work weeks are usually
// read (and how the existing week-range picker elsewhere in this app works).
function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0 = Sun ... 6 = Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const result = addDays(d, diffToMonday);
  result.setHours(0, 0, 0, 0);
  return result;
}

const MONTH_LABELS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function formatShort(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// periodStart is always day 1 (month mode) or a Monday (week mode) — see
// setGanttViewMode/jumpToToday, which keep it normalized on every mode
// switch and nav click.
function periodRange(periodStart: Date, mode: GanttViewMode): { start: Date; end: Date; days: number; label: string } {
  if (mode === "week") {
    const start = periodStart;
    const end = endOfDay(addDays(start, 6));
    return { start, end, days: 7, label: `${formatShort(start)} – ${formatShort(end)}/${end.getFullYear()}` };
  }
  const start = new Date(periodStart.getFullYear(), periodStart.getMonth(), 1);
  // end-of-day on the last day of the month — a campaign that starts, say,
  // 6pm on the last day still counts as active that day (overlapsRange below
  // compares real timestamps now, not just calendar days).
  const end = endOfDay(new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0));
  return { start, end, days: end.getDate(), label: `${MONTH_LABELS[start.getMonth()]} ${start.getFullYear()}` };
}

// Campaign overlaps the given [start, end] range (inclusive) at all.
function overlapsRange(c: Pick<Campaign, "start_date" | "end_date">, start: Date, end: Date): boolean {
  return toDateOnly(c.start_date) <= end && toDateOnly(c.end_date) >= start;
}

interface CampaignManagementProps {
  currentUser: UserAccount;
}

export default function CampaignManagement({ currentUser }: CampaignManagementProps) {
  const [section, setSection] = useState<"campaigns" | "tasks">("campaigns");
  const [categories, setCategories] = useState<Category[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [basicUsers, setBasicUsers] = useState<BasicUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const canEditAnything = currentUser.role !== "Viewer";

  // -- Campaign form --------------------------------------------------------
  const [campaignForm, setCampaignForm] = useState(EMPTY_CAMPAIGN_FORM);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [campaignMembers, setCampaignMembers] = useState<CampaignMember[]>([]);
  const [newMemberUsername, setNewMemberUsername] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>("");
  // Campaign Marketing is NOT split by brand (unlike the other report tabs) —
  // Livotec and Karofi campaigns show together; brand is just a filter here,
  // defaulting to "show both".
  const [campaignBrandFilter, setCampaignBrandFilter] = useState<Brand | "">("");

  // -- Task form --------------------------------------------------------
  const [taskForm, setTaskForm] = useState(EMPTY_TASK_FORM);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskCampaignFilter, setTaskCampaignFilter] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);

  // -- Gantt + Asset Library --------------------------------------------------
  const [ganttViewMode, setGanttViewMode] = useState<GanttViewMode>("month");
  const [ganttGroupBy, setGanttGroupBy] = useState<GanttGroupBy>("category");
  const [ganttPeriodStart, setGanttPeriodStart] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(1);
    return d;
  });
  const [assetLinks, setAssetLinks] = useState<AssetLink[]>([]);
  const [assetForm, setAssetForm] = useState<Record<AssetGroupKey, { label: string; url: string }>>({
    Branding: { label: "", url: "" },
    Performance: { label: "", url: "" },
    Project: { label: "", url: "" },
  });

  // Every direct data-loading call below is wrapped in try/catch and surfaces
  // failures via `message` — a fetch() that fails at the network level
  // (server down/restarting mid-request) throws "Failed to fetch" and would
  // otherwise become a silent unhandled rejection with nothing shown on
  // screen except a stale banner from some earlier action.
  async function loadCategories() {
    try {
      const result = await safeFetchJson("/api/campaign/categories");
      if (result.success) setCategories(result.categories || []);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tải được danh sách ngành hàng." });
    }
  }

  async function loadCampaigns() {
    try {
      const params = new URLSearchParams();
      if (campaignBrandFilter) params.set("brand", campaignBrandFilter);
      if (campaignStatusFilter) params.set("status", campaignStatusFilter);
      const result = await safeFetchJson(`/api/campaign/campaigns?${params.toString()}`);
      if (result.success) setCampaigns(result.campaigns || []);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tải được danh sách campaign." });
    }
  }

  // Fetches the FULL task list once (no query filters) — campaign/status/
  // taskType/mine are all applied client-side (see `visibleTasks` below) so
  // the "Campaign X / AlwaysOn Y / Ad-hoc Z" summary tiles can show accurate
  // counts across types no matter which filter is currently active, without
  // extra round-trips every time a filter changes.
  async function loadTasks() {
    try {
      const result = await safeFetchJson("/api/campaign/tasks");
      if (result.success) setTasks(result.tasks || []);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tải được danh sách task." });
    }
  }

  async function loadBasicUsers() {
    if (currentUser.role === "Viewer") return;
    try {
      const result = await safeFetchJson("/api/campaign/users/basic");
      if (result.success) setBasicUsers(result.users || []);
    } catch {
      // Non-critical (only affects assignee/PIC dropdown labels) — don't
      // surface a banner for it, campaigns/tasks loading above already will.
    }
  }

  async function loadAssetLinks() {
    try {
      const result = await safeFetchJson("/api/campaign/asset-links");
      if (result.success) setAssetLinks(result.links || []);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không tải được Asset Library." });
    }
  }

  async function loadAll() {
    setIsLoading(true);
    await Promise.all([loadCategories(), loadCampaigns(), loadTasks(), loadBasicUsers(), loadAssetLinks()]);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignBrandFilter, campaignStatusFilter]);

  const brandCategories = useMemo(() => categories.filter((c) => c.brand === campaignForm.brand), [categories, campaignForm.brand]);
  const categoryNameById = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const campaignNameById = useMemo(() => new Map(campaigns.map((c) => [c.id, c.name])), [campaigns]);
  const userNameByUsername = useMemo(() => new Map(basicUsers.map((u) => [u.username, u.name])), [basicUsers]);
  const taskTitleById = useMemo(() => new Map(tasks.map((t) => [t.id, t.title])), [tasks]);
  // Reverse lookup for the "main task" link — which other tasks point at a
  // given one as their parent, so a main task's row can show its subtasks.
  const childTasksByParent = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (!t.parent_task_id) continue;
      const list = map.get(t.parent_task_id) || [];
      list.push(t);
      map.set(t.parent_task_id, list);
    }
    return map;
  }, [tasks]);

  // Every filter except taskType applied — used to compute the "Campaign X /
  // AlwaysOn Y / Ad-hoc Z" tiles below, so they stay meaningful (reflect
  // campaign/status/"my tasks" filters) even while one type is being viewed.
  const tasksBeforeTypeFilter = useMemo(
    () =>
      tasks.filter((t) => {
        if (taskCampaignFilter && t.campaign_id !== taskCampaignFilter) return false;
        if (taskStatusFilter && t.status !== taskStatusFilter) return false;
        if (onlyMine && (t.assignee_username || "").toLowerCase() !== currentUser.username.toLowerCase()) return false;
        return true;
      }),
    [tasks, taskCampaignFilter, taskStatusFilter, onlyMine, currentUser.username]
  );
  const taskTypeCounts = useMemo(() => {
    const counts: Record<TaskType, number> = { campaign: 0, alwayson: 0, adhoc: 0 };
    for (const t of tasksBeforeTypeFilter) counts[t.task_type] += 1;
    return counts;
  }, [tasksBeforeTypeFilter]);
  const visibleTasks = useMemo(
    () => (taskTypeFilter ? tasksBeforeTypeFilter.filter((t) => t.task_type === taskTypeFilter) : tasksBeforeTypeFilter),
    [tasksBeforeTypeFilter, taskTypeFilter]
  );
  const overdueTasks = useMemo(() => visibleTasks.filter((t) => taskUrgency(t) === "overdue"), [visibleTasks]);
  const dueSoonTasks = useMemo(() => visibleTasks.filter((t) => taskUrgency(t) === "due-soon"), [visibleTasks]);

  // Campaign progress placeholder until Activities (Phase 2) ship — see the
  // file header comment. % of that campaign's own tasks marked Done.
  const campaignProgress = useMemo(() => {
    const byCampaign = new Map<string, { done: number; total: number }>();
    for (const t of tasks) {
      if (t.task_type !== "campaign" || !t.campaign_id) continue;
      const entry = byCampaign.get(t.campaign_id) || { done: 0, total: 0 };
      entry.total += 1;
      if (t.status === "Done") entry.done += 1;
      byCampaign.set(t.campaign_id, entry);
    }
    const result = new Map<string, number>();
    byCampaign.forEach((v, k) => result.set(k, v.total > 0 ? v.done / v.total : 0));
    return result;
  }, [tasks]);

  // -- KPI tiles ("Campaigns" / "Live Now" / "Planned", each vs. the
  // previous period) — counts campaigns overlapping the Gantt's visible
  // month/week. "Previous period" is the same length immediately before it.
  const kpi = useMemo(() => {
    const { start, end, days } = periodRange(ganttPeriodStart, ganttViewMode);
    const prevStart = addDays(start, -days);
    const prevEnd = endOfDay(addDays(start, -1));
    const current = campaigns.filter((c) => overlapsRange(c, start, end));
    const previous = campaigns.filter((c) => overlapsRange(c, prevStart, prevEnd));
    const pctChange = (curr: number, prev: number): number | null => (prev > 0 ? ((curr - prev) / prev) * 100 : null);
    const currentTotal = current.filter((c) => c.status !== "Done").length;
    const previousTotal = previous.filter((c) => c.status !== "Done").length;
    const currentLive = current.filter((c) => c.status === "Live").length;
    const previousLive = previous.filter((c) => c.status === "Live").length;
    const currentPlanned = current.filter((c) => c.status === "Planned").length;
    const previousPlanned = previous.filter((c) => c.status === "Planned").length;
    return {
      total: currentTotal,
      totalChange: pctChange(currentTotal, previousTotal),
      live: currentLive,
      liveChange: pctChange(currentLive, previousLive),
      planned: currentPlanned,
      plannedChange: pctChange(currentPlanned, previousPlanned),
    };
  }, [campaigns, ganttPeriodStart, ganttViewMode]);

  // -- Gantt grouping — by ngành hàng (category) or by PIC (người phụ
  // trách), toggle-able (mục 4.2 in the spec doc: "cho phép nhóm theo 1
  // trong 2, tuỳ chọn").
  const ganttGroups = useMemo(() => {
    const { start, end, days, label } = periodRange(ganttPeriodStart, ganttViewMode);
    const visible = campaigns.filter((c) => overlapsRange(c, start, end));
    const byGroup = new Map<string, Campaign[]>();
    for (const c of visible) {
      const key =
        ganttGroupBy === "pic"
          ? c.pic_username
            ? userNameByUsername.get(c.pic_username) || c.pic_username
            : "Chưa gán PIC"
          : c.category_id
          ? categoryNameById.get(c.category_id) || "Chưa phân loại"
          : "Chưa phân loại";
      const list = byGroup.get(key) || [];
      list.push(c);
      byGroup.set(key, list);
    }
    const groupNames = Array.from(byGroup.keys()).sort();
    return { groups: groupNames.map((name) => ({ name, campaigns: byGroup.get(name)! })), days, start, end, label };
  }, [campaigns, ganttPeriodStart, ganttViewMode, ganttGroupBy, categoryNameById, userNameByUsername]);

  function assetLinksByGroup(key: AssetGroupKey) {
    return assetLinks.filter((l) => l.group_key === key);
  }

  async function handleAddAssetLink(group: AssetGroupKey) {
    const form = assetForm[group];
    if (!form.label.trim() || !form.url.trim()) return;
    try {
      const result = await safeFetchJson("/api/campaign/asset-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_key: group, label: form.label.trim(), url: form.url.trim() }),
      });
      if (result.success) {
        setAssetForm((prev) => ({ ...prev, [group]: { label: "", url: "" } }));
        await loadAssetLinks();
      } else {
        setMessage({ type: "error", text: result.error || "Thêm link thất bại." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Thêm link thất bại." });
    }
  }

  async function handleDeleteAssetLink(id: string) {
    try {
      const result = await safeFetchJson(`/api/campaign/asset-links/${id}`, { method: "DELETE" });
      if (result.success) setAssetLinks((prev) => prev.filter((l) => l.id !== id));
      else setMessage({ type: "error", text: result.error || "Xoá link thất bại." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Xoá link thất bại." });
    }
  }

  function resetCampaignForm() {
    setEditingCampaignId(null);
    setCampaignForm(EMPTY_CAMPAIGN_FORM);
    setCampaignMembers([]);
  }

  async function startEditCampaign(c: Campaign) {
    setEditingCampaignId(c.id);
    setCampaignForm({
      name: c.name,
      type: c.type || "",
      brand: c.brand,
      category_id: c.category_id || "",
      channel: c.channel || "",
      status: c.status,
      start_date: toDatetimeLocalValue(c.start_date),
      end_date: toDatetimeLocalValue(c.end_date),
      budget: c.budget != null ? String(c.budget) : "",
      pic_username: c.pic_username || "",
      visual_gallery_url: c.visual_gallery_url || "",
      visual_urls_text: (c.visual_urls || []).join("\n"),
    });
    if (currentUser.role === "Admin") {
      const result = await safeFetchJson(`/api/campaign/campaigns/${c.id}/members`);
      if (result.success) setCampaignMembers(result.members || []);
    }
  }

  async function handleSubmitCampaign(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const payload = {
      name: campaignForm.name.trim(),
      type: campaignForm.type.trim() || null,
      brand: campaignForm.brand,
      category_id: campaignForm.category_id || null,
      channel: campaignForm.channel.trim() || null,
      status: campaignForm.status,
      start_date: fromDatetimeLocalValue(campaignForm.start_date),
      end_date: fromDatetimeLocalValue(campaignForm.end_date),
      budget: campaignForm.budget ? Number(campaignForm.budget) : null,
      pic_username: campaignForm.pic_username || null,
      visual_gallery_url: campaignForm.visual_gallery_url.trim() || null,
      visual_urls: campaignForm.visual_urls_text
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      const result = editingCampaignId
        ? await safeFetchJson(`/api/campaign/campaigns/${editingCampaignId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await safeFetchJson("/api/campaign/campaigns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (result.success) {
        setMessage({ type: "success", text: editingCampaignId ? "Đã cập nhật campaign." : "Đã tạo campaign." });
        resetCampaignForm();
        await loadCampaigns();
      } else {
        setMessage({ type: "error", text: result.error || "Lưu campaign thất bại." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lưu campaign thất bại." });
    }
  }

  async function handleDeleteCampaign(c: Campaign) {
    if (!window.confirm(`Xoá campaign "${c.name}"? Các task đang gắn campaign này sẽ chuyển về "không có campaign".`)) return;
    try {
      const result = await safeFetchJson(`/api/campaign/campaigns/${c.id}`, { method: "DELETE" });
      if (result.success) {
        await Promise.all([loadCampaigns(), loadTasks()]);
      } else {
        setMessage({ type: "error", text: result.error || "Xoá campaign thất bại." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Xoá campaign thất bại." });
    }
  }

  async function handleAddMember() {
    if (!editingCampaignId || !newMemberUsername) return;
    const result = await safeFetchJson(`/api/campaign/campaigns/${editingCampaignId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: newMemberUsername }),
    });
    if (result.success) {
      setCampaignMembers((prev) => [...prev, { campaign_id: editingCampaignId, username: newMemberUsername }]);
      setNewMemberUsername("");
    } else {
      setMessage({ type: "error", text: result.error || "Gán quyền thất bại." });
    }
  }

  async function handleRemoveMember(username: string) {
    if (!editingCampaignId) return;
    const result = await safeFetchJson(`/api/campaign/campaigns/${editingCampaignId}/members/${encodeURIComponent(username)}`, {
      method: "DELETE",
    });
    if (result.success) {
      setCampaignMembers((prev) => prev.filter((m) => m.username !== username));
    } else {
      setMessage({ type: "error", text: result.error || "Thu hồi quyền thất bại." });
    }
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    const result = await safeFetchJson("/api/campaign/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand: campaignForm.brand, name: newCategoryName.trim() }),
    });
    if (result.success) {
      setNewCategoryName("");
      await loadCategories();
    } else {
      setMessage({ type: "error", text: result.error || "Tạo ngành hàng thất bại." });
    }
  }

  function resetTaskForm() {
    setEditingTaskId(null);
    setTaskForm(EMPTY_TASK_FORM);
  }

  function startEditTask(t: Task) {
    setEditingTaskId(t.id);
    setTaskForm({
      title: t.title,
      task_type: t.task_type,
      campaign_id: t.campaign_id || "",
      assignee_username: t.assignee_username || "",
      start_date: t.start_date || "",
      end_date: t.end_date || "",
      priority: t.priority,
      status: t.status,
      parent_task_id: t.parent_task_id || "",
    });
  }

  async function handleSubmitTask(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const payload: Record<string, unknown> = {
      title: taskForm.title.trim(),
      task_type: taskForm.task_type,
      campaign_id: taskForm.task_type === "campaign" ? taskForm.campaign_id || null : null,
      assignee_username: taskForm.assignee_username || null,
      start_date: taskForm.start_date || null,
      end_date: taskForm.end_date || null,
      priority: taskForm.priority,
      status: taskForm.status,
      parent_task_id: taskForm.parent_task_id || null,
    };
    if (taskForm.task_type === "campaign" && !taskForm.campaign_id) {
      setMessage({ type: "error", text: "Task loại Campaign bắt buộc phải chọn Campaign." });
      return;
    }
    if (taskForm.status === "Blocked") {
      const reason = window.prompt("Lý do Blocked (bắt buộc):", "");
      if (!reason) {
        setMessage({ type: "error", text: "Cần nhập lý do Blocked." });
        return;
      }
      payload.blocked_reason = reason;
    }
    try {
      const result = editingTaskId
        ? await safeFetchJson(`/api/campaign/tasks/${editingTaskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await safeFetchJson("/api/campaign/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (result.success) {
        setMessage({ type: "success", text: editingTaskId ? "Đã cập nhật task." : "Đã tạo task." });
        resetTaskForm();
        await loadTasks();
      } else {
        setMessage({ type: "error", text: result.error || "Lưu task thất bại." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lưu task thất bại." });
    }
  }

  async function handleDeleteTask(t: Task) {
    if (!window.confirm(`Xoá task "${t.title}"?`)) return;
    const result = await safeFetchJson(`/api/campaign/tasks/${t.id}`, { method: "DELETE" });
    if (result.success) await loadTasks();
    else setMessage({ type: "error", text: result.error || "Xoá task thất bại." });
  }

  async function handleInlineStatusChange(t: Task, nextStatus: TaskStatus) {
    let blocked_reason: string | undefined;
    if (nextStatus === "Blocked") {
      const reason = window.prompt("Lý do Blocked (bắt buộc):", t.blocked_reason || "");
      if (!reason) return; // cancelled — leave status unchanged
      blocked_reason = reason;
    }
    // Optimistic update — same UX as the reference KAROFI list view.
    setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: nextStatus, blocked_reason: blocked_reason ?? x.blocked_reason } : x)));
    const result = await safeFetchJson(`/api/campaign/tasks/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, ...(blocked_reason ? { blocked_reason } : {}) }),
    });
    if (!result.success) {
      setMessage({ type: "error", text: result.error || "Đổi trạng thái thất bại." });
      await loadTasks(); // revert to server truth
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <h1 className="text-sm font-bold uppercase tracking-wider text-slate-800">Campaign Marketing</h1>
          <p className="min-w-0 text-[11px] text-slate-400">Livotec &amp; Karofi cùng 1 nơi — lọc theo Brand nếu cần, xem cột "Brand" trong bảng bên dưới</p>
        </div>
        <div className="flex rounded-lg bg-slate-100/80 border border-slate-200/50 p-0.5">
          <button
            onClick={() => {
              setMessage(null);
              setSection("campaigns");
            }}
            className={`flex items-center gap-1.5 rounded-md px-4 py-1 text-xs font-bold transition-all ${
              section === "campaigns" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <CalendarRange className="h-3.5 w-3.5" /> Campaign Calendar
          </button>
          <button
            onClick={() => {
              setMessage(null);
              setSection("tasks");
            }}
            className={`flex items-center gap-1.5 rounded-md px-4 py-1 text-xs font-bold transition-all ${
              section === "tasks" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ListChecks className="h-3.5 w-3.5" /> Campaign Tasks
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs ${
            message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {section === "campaigns" ? (
        <div className="space-y-4">
          {/* KPI tiles — Campaigns (live+planned) / Live Now / Planned, each
              vs. the month before the one the Gantt below is showing. */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "CAMPAIGNS", sub: "live + planned", value: kpi.total, change: kpi.totalChange },
              { label: "LIVE NOW", sub: "đang chạy", value: kpi.live, change: kpi.liveChange },
              { label: "PLANNED", sub: "sắp chạy", value: kpi.planned, change: kpi.plannedChange },
            ].map((tile) => (
              <div key={tile.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{tile.label}</p>
                <div className="mt-1 flex items-end justify-between">
                  <span className="text-3xl font-extrabold text-slate-900">{tile.value}</span>
                  {tile.change !== null && (
                    <span className={`text-xs font-bold ${tile.change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {tile.change >= 0 ? "▲" : "▼"} {Math.abs(tile.change).toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">{tile.sub}</p>
              </div>
            ))}
          </div>

          {/* Gantt — nhóm theo Ngành hàng hoặc PIC (toggle), xem theo Month
              hoặc Week (toggle). Progress % trên thanh là placeholder (xem
              comment đầu file) tới khi có Activities. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900">{ganttGroups.label}</h3>
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
                  <button
                    onClick={() => setGanttGroupBy("category")}
                    className={`rounded-md px-2.5 py-1 ${ganttGroupBy === "category" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                  >
                    Ngành hàng
                  </button>
                  <button
                    onClick={() => setGanttGroupBy("pic")}
                    className={`rounded-md px-2.5 py-1 ${ganttGroupBy === "pic" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                  >
                    PIC
                  </button>
                </div>
                <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
                  <button
                    onClick={() => {
                      setGanttViewMode("month");
                      setGanttPeriodStart((d) => new Date(d.getFullYear(), d.getMonth(), 1));
                    }}
                    className={`rounded-md px-2.5 py-1 ${ganttViewMode === "month" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => {
                      setGanttViewMode("week");
                      setGanttPeriodStart((d) => startOfWeek(d));
                    }}
                    className={`rounded-md px-2.5 py-1 ${ganttViewMode === "week" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                  >
                    Week
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setGanttPeriodStart((d) =>
                        ganttViewMode === "week" ? addDays(d, -7) : new Date(d.getFullYear(), d.getMonth() - 1, 1)
                      )
                    }
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setGanttPeriodStart(ganttViewMode === "week" ? startOfWeek(new Date()) : (() => { const d = new Date(); d.setDate(1); return d; })())}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Today
                  </button>
                  <button
                    onClick={() =>
                      setGanttPeriodStart((d) =>
                        ganttViewMode === "week" ? addDays(d, 7) : new Date(d.getFullYear(), d.getMonth() + 1, 1)
                      )
                    }
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {ganttGroups.groups.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">Không có campaign nào trong kỳ này.</p>
            ) : (
              <div className="space-y-4 overflow-x-auto">
                <div className="min-w-[700px] space-y-4">
                  {/* Day ruler */}
                  <div className="grid text-[10px] text-slate-400" style={{ gridTemplateColumns: `repeat(${ganttGroups.days}, minmax(0, 1fr))` }}>
                    {Array.from({ length: ganttGroups.days }, (_, i) => i + 1).map((d) => (
                      <span key={d} className={d % 5 === 1 ? "" : "opacity-0"}>
                        {d}
                      </span>
                    ))}
                  </div>
                  {ganttGroups.groups.map((group, groupIdx) => {
                    const color = GANTT_COLORS[groupIdx % GANTT_COLORS.length];
                    return (
                      <div key={group.name} className="space-y-1.5 border-t border-slate-100 pt-2 first:border-t-0 first:pt-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          {group.name} <span className="font-normal text-slate-400">· {group.campaigns.length} campaign</span>
                        </p>
                        {group.campaigns.map((c) => {
                          const clampedStart = toDateOnly(c.start_date) < ganttGroups.start ? ganttGroups.start : toDateOnly(c.start_date);
                          const clampedEnd = toDateOnly(c.end_date) > ganttGroups.end ? ganttGroups.end : toDateOnly(c.end_date);
                          const startDay = clampedStart.getDate();
                          const span = Math.max(1, clampedEnd.getDate() - startDay + 1);
                          const progress = Math.round((campaignProgress.get(c.id) || 0) * 100);
                          return (
                            <div
                              key={c.id}
                              className="grid h-7 items-center"
                              style={{ gridTemplateColumns: `repeat(${ganttGroups.days}, minmax(0, 1fr))` }}
                            >
                              <button
                                onClick={() => startEditCampaign(c)}
                                title={`${c.name} · ${progress}%`}
                                className={`flex h-6 items-center truncate rounded px-2 text-[10px] font-semibold ${color.bar} ${color.text} hover:opacity-90`}
                                style={{ gridColumn: `${startDay} / span ${span}` }}
                              >
                                {c.name} · {progress}%
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Asset Library — brand asset links dùng chung, KHÔNG gắn 1
              campaign cụ thể (asset riêng của campaign nằm trong Visual
              Gallery của chính campaign đó, xem form bên dưới). */}
          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <Link2 className="h-4 w-4 text-slate-400" /> Asset Library
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Thư viện link tài nguyên <strong>dùng chung cho cả team</strong> (Google Docs, Drive, SharePoint...) —
              không thuộc riêng 1 campaign nào. Muốn lưu ảnh/tài liệu riêng của 1 campaign cụ thể, dùng ô
              "Visual Gallery URL" khi tạo/sửa campaign đó ở form bên dưới thay vì đưa vào đây.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {ASSET_GROUPS.map((group) => {
              const links = assetLinksByGroup(group.key);
              return (
                <div key={group.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-0.5 flex items-center justify-between">
                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Link2 className="h-3.5 w-3.5 text-slate-400" /> {group.label}
                    </h4>
                    <span className="text-[11px] text-slate-400">{links.length} links</span>
                  </div>
                  <p className="mb-2 text-[10px] text-slate-400">{group.hint}</p>
                  <div className="space-y-1.5">
                    {links.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-slate-200 p-2 text-center text-[11px] text-slate-400">No links yet</p>
                    ) : (
                      links.map((l) => (
                        <div key={l.id} className="flex items-center justify-between gap-1 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5 text-xs">
                          <a href={l.url} target="_blank" rel="noreferrer" className="truncate font-medium text-indigo-700 hover:underline">
                            {l.label}
                          </a>
                          {canEditAnything && (
                            <button onClick={() => handleDeleteAssetLink(l.id)} className="shrink-0 text-slate-400 hover:text-rose-600">
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  {canEditAnything && (
                    <div className="mt-2 space-y-1.5">
                      <input
                        type="text"
                        placeholder="Label"
                        value={assetForm[group.key].label}
                        onChange={(e) => setAssetForm((prev) => ({ ...prev, [group.key]: { ...prev[group.key], label: e.target.value } }))}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                      />
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="https://..."
                          value={assetForm[group.key].url}
                          onChange={(e) => setAssetForm((prev) => ({ ...prev, [group.key]: { ...prev[group.key], url: e.target.value } }))}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddAssetLink(group.key)}
                          className="shrink-0 rounded-lg bg-indigo-600 px-2.5 text-xs font-bold text-white hover:bg-indigo-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {canEditAnything && (
            <form onSubmit={handleSubmitCampaign} className="grid gap-3 rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm sm:grid-cols-4">
              <div className="sm:col-span-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{editingCampaignId ? "Sửa Campaign" : "Thêm Campaign"}</h3>
                {editingCampaignId && (
                  <button type="button" onClick={resetCampaignForm} className="text-xs text-slate-400 hover:text-slate-600">
                    Huỷ sửa
                  </button>
                )}
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Tên Campaign *</label>
                <input
                  type="text"
                  required
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Type</label>
                <input
                  type="text"
                  placeholder="Awareness, Conversion..."
                  value={campaignForm.type}
                  onChange={(e) => setCampaignForm({ ...campaignForm, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Brand *</label>
                <select
                  value={campaignForm.brand}
                  onChange={(e) => setCampaignForm({ ...campaignForm, brand: e.target.value as Brand, category_id: "" })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                >
                  <option value="Livotec">Livotec</option>
                  <option value="Karofi">Karofi</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Ngành hàng</label>
                <select
                  value={campaignForm.category_id}
                  onChange={(e) => setCampaignForm({ ...campaignForm, category_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                >
                  <option value="">-- Chọn --</option>
                  {brandCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">+ Ngành hàng mới</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Tên ngành hàng"
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  />
                  {currentUser.role === "Admin" && (
                    <button type="button" onClick={handleAddCategory} className="shrink-0 rounded-lg border border-slate-200 px-2 text-slate-500 hover:bg-slate-50">
                      <PlusCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Channel</label>
                <input
                  type="text"
                  value={campaignForm.channel}
                  onChange={(e) => setCampaignForm({ ...campaignForm, channel: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Status</label>
                <select
                  value={campaignForm.status}
                  onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value as Campaign["status"] })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                >
                  <option value="Planned">Planned</option>
                  <option value="Live">Live</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Bắt đầu (giờ:phút:giây) *</label>
                <input
                  type="datetime-local"
                  step="1"
                  required
                  value={campaignForm.start_date}
                  onChange={(e) => setCampaignForm({ ...campaignForm, start_date: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Kết thúc (giờ:phút:giây) *</label>
                <input
                  type="datetime-local"
                  step="1"
                  required
                  value={campaignForm.end_date}
                  onChange={(e) => setCampaignForm({ ...campaignForm, end_date: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Budget (VND)</label>
                <input
                  type="number"
                  value={campaignForm.budget}
                  onChange={(e) => setCampaignForm({ ...campaignForm, budget: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">PIC (người phụ trách)</label>
                <select
                  value={campaignForm.pic_username}
                  onChange={(e) => setCampaignForm({ ...campaignForm, pic_username: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                >
                  <option value="">-- Chọn --</option>
                  {basicUsers.map((u) => (
                    <option key={u.username} value={u.username}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Visual Gallery URL</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/..."
                  value={campaignForm.visual_gallery_url}
                  onChange={(e) => setCampaignForm({ ...campaignForm, visual_gallery_url: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3 space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <ImagePlus className="h-3.5 w-3.5" /> Visuals — dán URL ảnh, mỗi dòng 1 URL
                </label>
                <textarea
                  rows={2}
                  placeholder={"https://...jpg\nhttps://...png"}
                  value={campaignForm.visual_urls_text}
                  onChange={(e) => setCampaignForm({ ...campaignForm, visual_urls_text: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>

              {editingCampaignId && currentUser.role === "Admin" && (
                <div className="sm:col-span-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Người được quyền sửa campaign này</p>
                  <div className="flex flex-wrap gap-1.5">
                    {campaignMembers.map((m) => (
                      <span key={m.username} className="flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-1 text-xs text-slate-700">
                        {userNameByUsername.get(m.username) || m.username}
                        <button type="button" onClick={() => handleRemoveMember(m.username)} className="text-slate-400 hover:text-rose-600">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <select
                      value={newMemberUsername}
                      onChange={(e) => setNewMemberUsername(e.target.value)}
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    >
                      <option value="">-- Chọn người --</option>
                      {basicUsers.filter((u) => !campaignMembers.some((m) => m.username === u.username)).map((u) => (
                        <option key={u.username} value={u.username}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={handleAddMember} className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">
                      <UserPlus className="h-3.5 w-3.5" /> Thêm
                    </button>
                  </div>
                </div>
              )}

              <div className="sm:col-span-4">
                <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700">
                  <PlusCircle className="h-3.5 w-3.5" />
                  {editingCampaignId ? "Cập nhật Campaign" : "Tạo Campaign"}
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              All Campaigns <span className="font-normal text-slate-400">({campaigns.length})</span>
            </h3>
            <div className="flex gap-2">
              <select
                value={campaignBrandFilter}
                onChange={(e) => setCampaignBrandFilter(e.target.value as Brand | "")}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
              >
                <option value="">Tất cả Brand</option>
                <option value="Livotec">Livotec</option>
                <option value="Karofi">Karofi</option>
              </select>
              <select
                value={campaignStatusFilter}
                onChange={(e) => setCampaignStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
              >
                <option value="">Tất cả Status</option>
                <option value="Planned">Planned</option>
                <option value="Live">Live</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[950px] text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Campaign</th>
                  <th className="px-3 py-2 text-left">Brand</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Channel</th>
                  <th className="px-3 py-2 text-left">Start</th>
                  <th className="px-3 py-2 text-left">End</th>
                  <th className="px-3 py-2 text-right">Budget</th>
                  <th className="px-3 py-2 text-left">Owner</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-6 text-center text-slate-400">Đang tải...</td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-6 text-center text-slate-400">Chưa có campaign nào.</td>
                  </tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c.id}>
                      <td className="px-3 py-2 font-medium text-slate-700">{c.name}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded px-1.5 py-0.5 font-semibold ${c.brand === "Livotec" ? "bg-indigo-50 text-indigo-700" : "bg-sky-50 text-sky-700"}`}>
                          {c.brand}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-500">{c.type || "—"}</td>
                      <td className="px-3 py-2 text-slate-500">{c.channel || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-500">{formatDateTime(c.start_date)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-500">{formatDateTime(c.end_date)}</td>
                      <td className="px-3 py-2 text-right text-slate-500">{c.budget ? c.budget.toLocaleString("vi-VN") : "—"}</td>
                      <td className="px-3 py-2 text-slate-500">{c.pic_username ? userNameByUsername.get(c.pic_username) || c.pic_username : "—"}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded px-1.5 py-0.5 font-semibold ${
                            c.status === "Live" ? "bg-emerald-100 text-emerald-700" : c.status === "Done" ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {c.can_edit ? (
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => startEditCampaign(c)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50">
                              <Pencil className="h-3 w-3" /> Sửa
                            </button>
                            <button onClick={() => handleDeleteCampaign(c)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-rose-600 hover:bg-rose-50">
                              <Trash2 className="h-3 w-3" /> Xoá
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-300">Không có quyền sửa</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Task type breakdown — trước đây AlwaysOn/Ad-hoc chỉ là 1 lựa
              chọn ẩn trong dropdown "Tất cả loại", không ai thấy có bao
              nhiêu việc loại này đang mở. 3 ô này luôn hiện đủ 3 loại, click
              để lọc nhanh; đang lọc theo loại nào thì ô đó được viền nổi. */}
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                { key: "campaign", label: "Campaign", icon: CalendarRange, active: "border-indigo-300 bg-indigo-50 text-indigo-700" },
                { key: "alwayson", label: "AlwaysOn", icon: RefreshCcw, active: "border-emerald-300 bg-emerald-50 text-emerald-700" },
                { key: "adhoc", label: "Ad-hoc", icon: Zap, active: "border-amber-300 bg-amber-50 text-amber-700" },
              ] as const
            ).map((tile) => {
              const Icon = tile.icon;
              const isActive = taskTypeFilter === tile.key;
              return (
                <button
                  key={tile.key}
                  onClick={() => setTaskTypeFilter(isActive ? "" : tile.key)}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left shadow-sm transition-colors ${
                    isActive ? tile.active : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">{tile.label}</p>
                    <p className="text-2xl font-extrabold">{taskTypeCounts[tile.key]}</p>
                  </div>
                  <Icon className="h-5 w-5 opacity-60" />
                </button>
              );
            })}
          </div>

          {(overdueTasks.length > 0 || dueSoonTasks.length > 0) && (
            <div className="space-y-2">
              {overdueTasks.length > 0 && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <div className="mb-1.5 flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="h-3.5 w-3.5" /> Quá hạn ({overdueTasks.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {overdueTasks.map((t) => (
                      <button key={t.id} onClick={() => startEditTask(t)} className="rounded-full border border-rose-200 bg-white px-2 py-1 hover:bg-rose-100">
                        {t.title} · {t.assignee_username ? userNameByUsername.get(t.assignee_username) || t.assignee_username : "Chưa gán"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {dueSoonTasks.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                  <div className="mb-1.5 flex items-center gap-1.5 font-bold">
                    <Clock className="h-3.5 w-3.5" /> Sắp đến hạn ({dueSoonTasks.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dueSoonTasks.map((t) => (
                      <button key={t.id} onClick={() => startEditTask(t)} className="rounded-full border border-amber-200 bg-white px-2 py-1 hover:bg-amber-100">
                        {t.title} · {t.assignee_username ? userNameByUsername.get(t.assignee_username) || t.assignee_username : "Chưa gán"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {canEditAnything && (
            <form onSubmit={handleSubmitTask} className="grid gap-3 rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm sm:grid-cols-4">
              <div className="sm:col-span-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{editingTaskId ? "Sửa Task" : "Thêm Task"}</h3>
                {editingTaskId && (
                  <button type="button" onClick={resetTaskForm} className="text-xs text-slate-400 hover:text-slate-600">
                    Huỷ sửa
                  </button>
                )}
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Task *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Loại *</label>
                <select
                  value={taskForm.task_type}
                  onChange={(e) => setTaskForm({ ...taskForm, task_type: e.target.value as TaskType, campaign_id: e.target.value === "campaign" ? taskForm.campaign_id : "" })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                >
                  <option value="campaign">Campaign</option>
                  <option value="alwayson">AlwaysOn</option>
                  <option value="adhoc">Ad-hoc</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Campaign {taskForm.task_type === "campaign" ? "*" : ""}</label>
                <select
                  value={taskForm.campaign_id}
                  disabled={taskForm.task_type !== "campaign"}
                  onChange={(e) => setTaskForm({ ...taskForm, campaign_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">-- Chọn --</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {taskForm.task_type !== "campaign" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Task chính (nếu là task phụ)</label>
                  <select
                    value={taskForm.parent_task_id}
                    onChange={(e) => setTaskForm({ ...taskForm, parent_task_id: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="">-- Không có, đây là task độc lập --</option>
                    {tasks
                      .filter((t) => t.id !== editingTaskId)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          [{t.task_type === "alwayson" ? "AlwaysOn" : t.task_type === "adhoc" ? "Ad-hoc" : "Campaign"}] {t.title}
                        </option>
                      ))}
                  </select>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Người phụ trách</label>
                <select
                  value={taskForm.assignee_username}
                  onChange={(e) => setTaskForm({ ...taskForm, assignee_username: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                >
                  <option value="">-- Chọn --</option>
                  {basicUsers.map((u) => (
                    <option key={u.username} value={u.username}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Bắt đầu</label>
                <input
                  type="date"
                  value={taskForm.start_date}
                  onChange={(e) => setTaskForm({ ...taskForm, start_date: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Kết thúc</label>
                <input
                  type="date"
                  value={taskForm.end_date}
                  onChange={(e) => setTaskForm({ ...taskForm, end_date: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as Task["priority"] })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Status</label>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                >
                  <option value="To do">To do</option>
                  <option value="In progress">In progress</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="sm:col-span-4">
                <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700">
                  <PlusCircle className="h-3.5 w-3.5" />
                  {editingTaskId ? "Cập nhật Task" : "Tạo Task"}
                </button>
              </div>
            </form>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <select value={taskCampaignFilter} onChange={(e) => setTaskCampaignFilter(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs">
              <option value="">Tất cả Campaign</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select value={taskStatusFilter} onChange={(e) => setTaskStatusFilter(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs">
              <option value="">Tất cả Status</option>
              <option value="To do">To do</option>
              <option value="In progress">In progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Done">Done</option>
            </select>
            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
              Chỉ task của tôi (My Tasks)
            </label>
            <span className="ml-auto text-xs text-slate-400">{visibleTasks.length} task</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[1000px] text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Task</th>
                  <th className="px-3 py-2 text-left">Loại</th>
                  <th className="px-3 py-2 text-left">Campaign</th>
                  <th className="px-3 py-2 text-left">Người phụ trách</th>
                  <th className="px-3 py-2 text-left">End</th>
                  <th className="px-3 py-2 text-left">Priority</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-slate-400">Đang tải...</td>
                  </tr>
                ) : visibleTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-slate-400">Chưa có task nào khớp bộ lọc.</td>
                  </tr>
                ) : (
                  visibleTasks.map((t) => {
                    const urgency = taskUrgency(t);
                    return (
                      <tr key={t.id}>
                        <td className="px-3 py-2 font-medium text-slate-700">
                          {t.title}
                          {t.parent_task_id && (
                            <div className="font-normal text-slate-400">↳ Subtask của: {taskTitleById.get(t.parent_task_id) || "—"}</div>
                          )}
                          {(childTasksByParent.get(t.id) || []).length > 0 && (
                            <div className="font-normal text-indigo-500">
                              └ {(childTasksByParent.get(t.id) || []).length} task phụ: {(childTasksByParent.get(t.id) || []).map((c) => c.title).join(", ")}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                              t.task_type === "campaign"
                                ? "bg-indigo-50 text-indigo-700"
                                : t.task_type === "alwayson"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {t.task_type === "campaign" ? "Campaign" : t.task_type === "alwayson" ? "AlwaysOn" : "Ad-hoc"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-500">{t.campaign_id ? campaignNameById.get(t.campaign_id) || "—" : "—"}</td>
                        <td className="px-3 py-2 text-slate-500">{t.assignee_username ? userNameByUsername.get(t.assignee_username) || t.assignee_username : "—"}</td>
                        <td className={`px-3 py-2 font-medium ${urgency === "overdue" ? "text-rose-600" : urgency === "due-soon" ? "text-amber-600" : "text-slate-500"}`}>
                          {t.end_date || "—"}
                          {urgency === "overdue" && " 🔴"}
                          {urgency === "due-soon" && " 🟡"}
                        </td>
                        <td className="px-3 py-2 text-slate-500">{t.priority}</td>
                        <td className="px-3 py-2">
                          {t.can_edit ? (
                            <select
                              value={t.status}
                              onChange={(e) => handleInlineStatusChange(t, e.target.value as TaskStatus)}
                              className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                                t.status === "Done"
                                  ? "bg-slate-100 text-slate-500"
                                  : t.status === "Blocked"
                                  ? "bg-rose-100 text-rose-700"
                                  : t.status === "In progress"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              <option value="To do">To do</option>
                              <option value="In progress">In progress</option>
                              <option value="Blocked">Blocked</option>
                              <option value="Done">Done</option>
                            </select>
                          ) : (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-500">{t.status}</span>
                          )}
                          {t.status === "Blocked" && t.blocked_reason && (
                            <div className="mt-0.5 text-[10px] text-rose-500" title={t.blocked_reason}>
                              {t.blocked_reason.length > 30 ? `${t.blocked_reason.slice(0, 30)}…` : t.blocked_reason}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {t.can_edit ? (
                            <div className="flex justify-end gap-1.5">
                              <button onClick={() => startEditTask(t)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50">
                                <Pencil className="h-3 w-3" /> Sửa
                              </button>
                              <button onClick={() => handleDeleteTask(t)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-rose-600 hover:bg-rose-50">
                                <Trash2 className="h-3 w-3" /> Xoá
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-300">Không có quyền sửa</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
