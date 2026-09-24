// ---------------------------------------------------------------------------
// Storage layer for the Campaign Calendar & Campaign Task module (Phase 1 —
// see task cần làm/campaign task/tong-hop-campaign-calendar-task.md).
//
// Same production-vs-local split as adsPerformanceStore.ts/facebookStore.ts:
// production (Vercel, isSupabaseConfigured === true) uses the dedicated
// relational tables in supabase/schema.sql (categories/campaigns/
// campaign_members/tasks/task_activity_log). Local dev has no real Supabase
// project, so it stores the same collections as extra arrays inside the
// local blob (src/db_store.json, via appStateStore's
// getDatabaseData/saveDatabaseData).
//
// No Supabase Auth / UUID users in this app — every "who" field here is the
// plain lower-cased `username` string from the custom session (see
// src/server/auth.ts), same as action_logs.username elsewhere.
// ---------------------------------------------------------------------------
import crypto from "crypto";
import { supabase, isSupabaseConfigured, fetchAllRows } from "./supabaseClient";
import { getDatabaseData, saveDatabaseData } from "./appStateStore";

export type Brand = "Livotec" | "Karofi";
export type TaskType = "campaign" | "alwayson" | "adhoc";
export type TaskStatus = "To do" | "In progress" | "Blocked" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";

export interface Category {
  id: string;
  brand: Brand;
  name: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string | null;
  brand: Brand;
  category_id: string | null;
  channel: string | null;
  status: "Planned" | "Live" | "Done";
  start_date: string; // YYYY-MM-DD
  end_date: string;
  budget: number | null;
  pic_username: string | null;
  visual_gallery_url: string | null;
  visual_urls: string[];
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignMember {
  campaign_id: string;
  username: string;
  added_by: string;
  added_at: string;
}

export interface Task {
  id: string;
  title: string;
  task_type: TaskType;
  campaign_id: string | null;
  activity_id: string | null;
  assignee_username: string | null;
  start_date: string | null;
  end_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  blocked_reason: string | null;
  due_soon_threshold_days: number;
  recurrence: unknown | null;
  parent_recurring_id: string | null;
  // "Main task" this one branches off of — AlwaysOn/Ad-hoc tasks have no
  // Campaign/Activity to organize under, so this is their way to link a
  // related/child task to a main one. Not a full subtask system: no status
  // cascading, no multi-level cycle detection (see updateTask).
  parent_task_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskActivityLogEntry {
  id: string;
  task_id: string;
  type: "created" | "status_change" | "edited" | "linked_activity" | "moved_campaign" | "note";
  text: string | null;
  actor_username: string;
  created_at: string;
}

export type AssetGroupKey = "Branding" | "Performance" | "Project";

export interface AssetLink {
  id: string;
  group_key: AssetGroupKey;
  label: string;
  url: string;
  created_by: string;
  created_at: string;
}

// -- Local (src/db_store.json) helpers ---------------------------------------

async function readLocalCollections(): Promise<{
  store: any;
  categories: Category[];
  campaigns: Campaign[];
  campaign_members: CampaignMember[];
  tasks: Task[];
  task_activity_log: TaskActivityLogEntry[];
  asset_links: AssetLink[];
}> {
  const store = await getDatabaseData();
  return {
    store,
    categories: Array.isArray(store.categories) ? store.categories : [],
    campaigns: Array.isArray(store.campaigns) ? store.campaigns : [],
    campaign_members: Array.isArray(store.campaign_members) ? store.campaign_members : [],
    tasks: Array.isArray(store.tasks) ? store.tasks : [],
    task_activity_log: Array.isArray(store.task_activity_log) ? store.task_activity_log : [],
    asset_links: Array.isArray(store.asset_links) ? store.asset_links : [],
  };
}

async function writeLocalCollections(
  store: any,
  updates: Partial<{
    categories: Category[];
    campaigns: Campaign[];
    campaign_members: CampaignMember[];
    tasks: Task[];
    task_activity_log: TaskActivityLogEntry[];
    asset_links: AssetLink[];
  }>
): Promise<void> {
  await saveDatabaseData({ ...store, ...updates });
}

function newId(): string {
  return crypto.randomUUID();
}

// -- Categories ---------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) {
    const { categories } = await readLocalCollections();
    return categories;
  }
  const { data, error } = await supabase.from("categories").select("*").order("brand").order("name");
  if (error) throw new Error(`Lỗi đọc danh sách ngành hàng: ${error.message}`);
  return data || [];
}

export async function createCategory(input: { brand: Brand; name: string }): Promise<Category> {
  const category: Category = {
    id: newId(),
    brand: input.brand,
    name: input.name.trim(),
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    const { store, categories } = await readLocalCollections();
    if (categories.some((c) => c.brand === category.brand && c.name.toLowerCase() === category.name.toLowerCase())) {
      throw new Error("Ngành hàng này đã tồn tại cho brand đã chọn.");
    }
    await writeLocalCollections(store, { categories: [...categories, category] });
    return category;
  }

  const { data, error } = await supabase.from("categories").insert(category).select().single();
  if (error) throw new Error(`Lỗi tạo ngành hàng: ${error.message}`);
  return data;
}

// -- Campaigns ------------------------------------------------------------------

export async function getCampaigns(filters?: {
  brand?: Brand;
  categoryId?: string;
  status?: Campaign["status"];
}): Promise<Campaign[]> {
  if (!isSupabaseConfigured) {
    const { campaigns } = await readLocalCollections();
    return campaigns.filter((c) => {
      if (filters?.brand && c.brand !== filters.brand) return false;
      if (filters?.categoryId && c.category_id !== filters.categoryId) return false;
      if (filters?.status && c.status !== filters.status) return false;
      return true;
    });
  }

  const rows = await fetchAllRows<Campaign>((from, to) => {
    let query = supabase.from("campaigns").select("*");
    if (filters?.brand) query = query.eq("brand", filters.brand);
    if (filters?.categoryId) query = query.eq("category_id", filters.categoryId);
    if (filters?.status) query = query.eq("status", filters.status);
    return query.order("start_date", { ascending: false }).range(from, to);
  }).catch((err: any) => {
    throw new Error(`Lỗi đọc danh sách campaign: ${err.message}`);
  });
  return rows;
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  if (!isSupabaseConfigured) {
    const { campaigns } = await readLocalCollections();
    return campaigns.find((c) => c.id === id) || null;
  }
  const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Lỗi đọc campaign: ${error.message}`);
  return data;
}

export async function createCampaign(
  input: Pick<Campaign, "name" | "brand" | "start_date" | "end_date"> &
    Partial<Pick<Campaign, "type" | "category_id" | "channel" | "status" | "budget" | "pic_username" | "visual_gallery_url" | "visual_urls">>,
  creatorUsername: string
): Promise<Campaign> {
  const now = new Date().toISOString();
  const campaign: Campaign = {
    id: newId(),
    name: input.name.trim(),
    type: input.type ?? null,
    brand: input.brand,
    category_id: input.category_id ?? null,
    channel: input.channel ?? null,
    status: input.status ?? "Planned",
    start_date: input.start_date,
    end_date: input.end_date,
    budget: input.budget ?? null,
    pic_username: input.pic_username ?? null,
    visual_gallery_url: input.visual_gallery_url ?? null,
    visual_urls: input.visual_urls ?? [],
    created_by: creatorUsername,
    updated_by: creatorUsername,
    created_at: now,
    updated_at: now,
  };
  // Creator can always edit what they just created, without waiting for an
  // Admin to grant campaign membership separately.
  const membership: CampaignMember = {
    campaign_id: campaign.id,
    username: creatorUsername,
    added_by: creatorUsername,
    added_at: now,
  };

  if (!isSupabaseConfigured) {
    const { store, campaigns, campaign_members } = await readLocalCollections();
    await writeLocalCollections(store, {
      campaigns: [...campaigns, campaign],
      campaign_members: [...campaign_members, membership],
    });
    return campaign;
  }

  const { error } = await supabase.from("campaigns").insert(campaign);
  if (error) throw new Error(`Lỗi tạo campaign: ${error.message}`);
  const { error: memberError } = await supabase.from("campaign_members").insert(membership);
  if (memberError) throw new Error(`Lỗi gán quyền chỉnh sửa campaign: ${memberError.message}`);
  return campaign;
}

export async function updateCampaign(
  id: string,
  patch: Partial<Omit<Campaign, "id" | "created_by" | "created_at">>,
  actorUsername: string
): Promise<Campaign> {
  const updated_at = new Date().toISOString();

  if (!isSupabaseConfigured) {
    const { store, campaigns } = await readLocalCollections();
    const existing = campaigns.find((c) => c.id === id);
    if (!existing) throw new Error("Không tìm thấy campaign.");
    const next: Campaign = { ...existing, ...patch, updated_by: actorUsername, updated_at };
    await writeLocalCollections(store, { campaigns: campaigns.map((c) => (c.id === id ? next : c)) });
    return next;
  }

  const { data, error } = await supabase
    .from("campaigns")
    .update({ ...patch, updated_by: actorUsername, updated_at })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Lỗi cập nhật campaign: ${error.message}`);
  return data;
}

export async function deleteCampaign(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, campaigns, campaign_members, tasks } = await readLocalCollections();
    await writeLocalCollections(store, {
      campaigns: campaigns.filter((c) => c.id !== id),
      campaign_members: campaign_members.filter((m) => m.campaign_id !== id),
      // Same "config removal doesn't retroactively delete history" choice as
      // fb_ad_accounts deletion — tasks lose their campaign link (matches
      // the `on delete set null` foreign key used in the Supabase schema)
      // rather than disappearing.
      tasks: tasks.map((t) => (t.campaign_id === id ? { ...t, campaign_id: null } : t)),
    });
    return;
  }

  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw new Error(`Lỗi xoá campaign: ${error.message}`);
}

// -- Campaign members (per-campaign edit permission) ---------------------------

export async function getCampaignMembers(campaignId: string): Promise<CampaignMember[]> {
  if (!isSupabaseConfigured) {
    const { campaign_members } = await readLocalCollections();
    return campaign_members.filter((m) => m.campaign_id === campaignId);
  }
  const { data, error } = await supabase.from("campaign_members").select("*").eq("campaign_id", campaignId);
  if (error) throw new Error(`Lỗi đọc danh sách người được phân quyền: ${error.message}`);
  return data || [];
}

export async function isCampaignMember(campaignId: string, username: string): Promise<boolean> {
  const members = await getCampaignMembers(campaignId);
  return members.some((m) => m.username.toLowerCase() === username.toLowerCase());
}

export async function addCampaignMember(campaignId: string, username: string, addedBy: string): Promise<void> {
  const membership: CampaignMember = { campaign_id: campaignId, username, added_by: addedBy, added_at: new Date().toISOString() };

  if (!isSupabaseConfigured) {
    const { store, campaign_members } = await readLocalCollections();
    const rest = campaign_members.filter((m) => !(m.campaign_id === campaignId && m.username.toLowerCase() === username.toLowerCase()));
    await writeLocalCollections(store, { campaign_members: [...rest, membership] });
    return;
  }

  const { error } = await supabase.from("campaign_members").upsert(membership, { onConflict: "campaign_id,username" });
  if (error) throw new Error(`Lỗi gán quyền chỉnh sửa: ${error.message}`);
}

export async function removeCampaignMember(campaignId: string, username: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, campaign_members } = await readLocalCollections();
    await writeLocalCollections(store, {
      campaign_members: campaign_members.filter((m) => !(m.campaign_id === campaignId && m.username.toLowerCase() === username.toLowerCase())),
    });
    return;
  }

  const { error } = await supabase.from("campaign_members").delete().eq("campaign_id", campaignId).eq("username", username);
  if (error) throw new Error(`Lỗi thu hồi quyền chỉnh sửa: ${error.message}`);
}

// -- Tasks ----------------------------------------------------------------------

export async function getTasks(filters?: {
  campaignId?: string | null;
  status?: TaskStatus;
  taskType?: TaskType;
  assigneeUsername?: string;
}): Promise<Task[]> {
  if (!isSupabaseConfigured) {
    const { tasks } = await readLocalCollections();
    return tasks.filter((t) => {
      if (filters?.campaignId !== undefined && t.campaign_id !== filters.campaignId) return false;
      if (filters?.status && t.status !== filters.status) return false;
      if (filters?.taskType && t.task_type !== filters.taskType) return false;
      if (filters?.assigneeUsername && (t.assignee_username || "").toLowerCase() !== filters.assigneeUsername.toLowerCase()) return false;
      return true;
    });
  }

  const rows = await fetchAllRows<Task>((from, to) => {
    let query = supabase.from("tasks").select("*");
    if (filters?.campaignId !== undefined) query = query.eq("campaign_id", filters.campaignId);
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.taskType) query = query.eq("task_type", filters.taskType);
    if (filters?.assigneeUsername) query = query.eq("assignee_username", filters.assigneeUsername);
    return query.order("end_date", { ascending: true }).range(from, to);
  }).catch((err: any) => {
    throw new Error(`Lỗi đọc danh sách task: ${err.message}`);
  });
  return rows;
}

export async function getTask(id: string): Promise<Task | null> {
  if (!isSupabaseConfigured) {
    const { tasks } = await readLocalCollections();
    return tasks.find((t) => t.id === id) || null;
  }
  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Lỗi đọc task: ${error.message}`);
  return data;
}

export async function createTask(
  input: Pick<Task, "title" | "task_type"> &
    Partial<
      Pick<
        Task,
        "campaign_id" | "activity_id" | "assignee_username" | "start_date" | "end_date" | "priority" | "status" | "due_soon_threshold_days" | "parent_task_id"
      >
    >,
  creatorUsername: string
): Promise<Task> {
  const now = new Date().toISOString();
  const task: Task = {
    id: newId(),
    title: input.title.trim(),
    task_type: input.task_type,
    campaign_id: input.task_type === "campaign" ? input.campaign_id ?? null : null,
    activity_id: input.activity_id ?? null,
    assignee_username: input.assignee_username ?? null,
    start_date: input.start_date ?? null,
    end_date: input.end_date ?? null,
    priority: input.priority ?? "Medium",
    status: input.status ?? "To do",
    blocked_reason: null,
    // Ad-hoc is by nature urgent — warn immediately instead of waiting 2 days.
    due_soon_threshold_days: input.due_soon_threshold_days ?? (input.task_type === "adhoc" ? 0 : 2),
    recurrence: null,
    parent_recurring_id: null,
    parent_task_id: input.parent_task_id ?? null,
    created_by: creatorUsername,
    created_at: now,
    updated_at: now,
  };

  if (task.task_type === "campaign" && !task.campaign_id) {
    throw new Error("Task loại Campaign bắt buộc phải chọn Campaign.");
  }

  if (!isSupabaseConfigured) {
    const { store, tasks, task_activity_log } = await readLocalCollections();
    const logEntry: TaskActivityLogEntry = {
      id: newId(),
      task_id: task.id,
      type: "created",
      text: `Tạo task "${task.title}"`,
      actor_username: creatorUsername,
      created_at: now,
    };
    await writeLocalCollections(store, { tasks: [...tasks, task], task_activity_log: [...task_activity_log, logEntry] });
    return task;
  }

  const { error } = await supabase.from("tasks").insert(task);
  if (error) throw new Error(`Lỗi tạo task: ${error.message}`);
  await appendTaskLog(task.id, "created", `Tạo task "${task.title}"`, creatorUsername);
  return task;
}

export async function updateTask(
  id: string,
  patch: Partial<Pick<Task, "title" | "campaign_id" | "activity_id" | "assignee_username" | "start_date" | "end_date" | "priority" | "status" | "blocked_reason" | "due_soon_threshold_days" | "parent_task_id">>,
  actorUsername: string
): Promise<Task> {
  const existing = await getTask(id);
  if (!existing) throw new Error("Không tìm thấy task.");

  if (patch.status === "Blocked" && !patch.blocked_reason && !existing.blocked_reason) {
    throw new Error("Chuyển sang trạng thái Blocked cần nhập lý do (blocked_reason).");
  }
  if (patch.parent_task_id === id) {
    throw new Error("Task không thể tự làm task chính của chính nó.");
  }

  const updated_at = new Date().toISOString();
  // Moving a task to a different campaign invalidates whatever Activity it
  // was linked to (that Activity belongs to the old campaign) — see mục 6,
  // "Đổi campaignId của 1 task".
  const nextActivityId =
    patch.campaign_id !== undefined && patch.campaign_id !== existing.campaign_id ? null : (patch.activity_id ?? existing.activity_id);
  // Blocked reason only makes sense while status = Blocked: moving to any
  // other status clears it so a stale reason doesn't linger and resurface
  // if the task is blocked again later.
  let nextBlockedReason = existing.blocked_reason;
  if (patch.status === "Blocked") {
    nextBlockedReason = patch.blocked_reason ?? existing.blocked_reason;
  } else if (patch.status) {
    nextBlockedReason = null;
  } else if (patch.blocked_reason !== undefined) {
    nextBlockedReason = patch.blocked_reason;
  }
  const next: Task = {
    ...existing,
    ...patch,
    activity_id: nextActivityId,
    blocked_reason: nextBlockedReason,
    updated_at,
  };

  if (!isSupabaseConfigured) {
    const { store, tasks } = await readLocalCollections();
    await writeLocalCollections(store, { tasks: tasks.map((t) => (t.id === id ? next : t)) });
  } else {
    const { error } = await supabase
      .from("tasks")
      .update({ ...patch, activity_id: nextActivityId, blocked_reason: next.blocked_reason, updated_at })
      .eq("id", id);
    if (error) throw new Error(`Lỗi cập nhật task: ${error.message}`);
  }

  if (patch.status && patch.status !== existing.status) {
    let text = `Status: ${existing.status} → ${patch.status}`;
    if (patch.status === "Blocked" && next.blocked_reason) text += ` (Lý do: ${next.blocked_reason})`;
    await appendTaskLog(id, "status_change", text, actorUsername);
  }
  if (patch.campaign_id !== undefined && patch.campaign_id !== existing.campaign_id) {
    await appendTaskLog(id, "moved_campaign", `Chuyển campaign: ${existing.campaign_id ?? "(không có)"} → ${patch.campaign_id ?? "(không có)"}`, actorUsername);
  }
  // blocked_reason is excluded here too — when it changes alongside status
  // (the normal case), it's already folded into the status_change text above
  // instead of producing a second, redundant "edited" entry.
  const otherFieldsChanged = (Object.keys(patch) as (keyof typeof patch)[]).some(
    (k) => k !== "status" && k !== "campaign_id" && k !== "blocked_reason" && patch[k] !== (existing as any)[k]
  );
  if (otherFieldsChanged) {
    await appendTaskLog(id, "edited", "Cập nhật thông tin task", actorUsername);
  }

  return next;
}

export async function deleteTask(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, tasks, task_activity_log } = await readLocalCollections();
    await writeLocalCollections(store, {
      tasks: tasks.filter((t) => t.id !== id),
      task_activity_log: task_activity_log.filter((l) => l.task_id !== id),
    });
    return;
  }
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(`Lỗi xoá task: ${error.message}`);
}

// -- Task activity log ----------------------------------------------------------

export async function getTaskActivityLog(taskId: string): Promise<TaskActivityLogEntry[]> {
  if (!isSupabaseConfigured) {
    const { task_activity_log } = await readLocalCollections();
    return task_activity_log.filter((l) => l.task_id === taskId).sort((a, b) => a.created_at.localeCompare(b.created_at));
  }
  const { data, error } = await supabase
    .from("task_activity_log")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Lỗi đọc nhật ký task: ${error.message}`);
  return data || [];
}

export async function appendTaskLog(
  taskId: string,
  type: TaskActivityLogEntry["type"],
  text: string,
  actorUsername: string
): Promise<void> {
  const entry: TaskActivityLogEntry = {
    id: newId(),
    task_id: taskId,
    type,
    text,
    actor_username: actorUsername,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    const { store, task_activity_log } = await readLocalCollections();
    await writeLocalCollections(store, { task_activity_log: [...task_activity_log, entry] });
    return;
  }

  const { error } = await supabase.from("task_activity_log").insert(entry);
  if (error) console.error("appendTaskLog error:", error.message);
}

// -- Asset Library (Campaign Calendar screen) ------------------------------------

export async function getAssetLinks(): Promise<AssetLink[]> {
  if (!isSupabaseConfigured) {
    const { asset_links } = await readLocalCollections();
    return asset_links;
  }
  const { data, error } = await supabase.from("asset_links").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(`Lỗi đọc Asset Library: ${error.message}`);
  return data || [];
}

export async function createAssetLink(input: { group_key: AssetGroupKey; label: string; url: string }, createdBy: string): Promise<AssetLink> {
  const link: AssetLink = {
    id: newId(),
    group_key: input.group_key,
    label: input.label.trim(),
    url: input.url.trim(),
    created_by: createdBy,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    const { store, asset_links } = await readLocalCollections();
    await writeLocalCollections(store, { asset_links: [...asset_links, link] });
    return link;
  }

  const { error } = await supabase.from("asset_links").insert(link);
  if (error) throw new Error(`Lỗi thêm link vào Asset Library: ${error.message}`);
  return link;
}

export async function deleteAssetLink(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const { store, asset_links } = await readLocalCollections();
    await writeLocalCollections(store, { asset_links: asset_links.filter((l) => l.id !== id) });
    return;
  }
  const { error } = await supabase.from("asset_links").delete().eq("id", id);
  if (error) throw new Error(`Lỗi xoá link: ${error.message}`);
}
