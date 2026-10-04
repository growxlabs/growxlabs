import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth";
import { supabaseAdmin } from "../supabase/admin";
import { ConsultingHttpError } from "../consulting/workflow";

export { supabaseAdmin };
const admins = ["ADMIN", "CO_ADMIN"];
export async function requireDeliveryAdmin(customSession?: { user?: { id?: string; role?: string } } | null) {
  const session = customSession !== undefined ? customSession : await getServerSession(authOptions);
  if (!session?.user?.id) throw new ConsultingHttpError(401, "Authentication required.");
  if (!admins.includes(session.user.role || "")) throw new ConsultingHttpError(403, "Project delivery permission is required.");
  return { userId: session.user.id };
}
export async function requireDeliveryClient() { const session = await getServerSession(authOptions); if (!session?.user?.id || session.user.role !== "CLIENT") throw new ConsultingHttpError(403, "A client account is required."); const { data } = await supabaseAdmin.from("client_profiles").select("id").eq("user_id", session.user.id).maybeSingle(); if (!data) throw new ConsultingHttpError(403, "Client account is not linked."); return { userId: session.user.id, clientId: data.id }; }
export function deliveryError(error: unknown) { return Response.json({ error: error instanceof Error ? error.message : "Project delivery request failed." }, { status: error instanceof ConsultingHttpError ? error.status : 500 }); }
async function activity(projectId: string, entityType: string, entityId: string | null, actorId: string, eventType: string, metadata: Record<string, unknown> = {}) { const { error } = await supabaseAdmin.from("project_delivery_activity").insert({ project_id: projectId, entity_type: entityType, entity_id: entityId, actor_id: actorId, event_type: eventType, metadata }); if (error) throw new Error(error.message); }

export async function activateWorkspace(projectId: string, userId: string) {
  const trimmed = projectId.trim();
  const query = trimmed.toUpperCase().startsWith("GXL-PRJ")
    ? supabaseAdmin.from("consulting_projects").select("*").eq("project_number", trimmed).maybeSingle()
    : supabaseAdmin.from("consulting_projects").select("*").eq("id", trimmed).maybeSingle();
  const { data: project } = await query;
  if (!project) throw new ConsultingHttpError(404, "Project not found.");
  if (project.status !== "active") throw new ConsultingHttpError(409, "Project must be active after verified payment and kickoff.");
  const { data: existing } = await supabaseAdmin.from("project_workspaces").select("*").eq("project_id", project.id).maybeSingle(); if (existing) return existing;
  const { data: workspace, error } = await supabaseAdmin.from("project_workspaces").insert({ project_id: project.id, client_id: project.client_id, company_id: project.company_id, scope_id: project.scope_id, agreement_id: project.agreement_id, status: "planning", created_by: userId, summary: { projectNumber: project.project_number } }).select("*").single(); if (error) throw new Error(error.message);
  await activity(workspace.id, "workspace", workspace.id, userId, "workspace_activated", { projectNumber: project.project_number }); return workspace;
}

export async function createMilestone(projectId: string, userId: string, input: Record<string, unknown>) { const { data: workspace } = await supabaseAdmin.from("project_workspaces").select("id,status").eq("id", projectId).maybeSingle(); if (!workspace || !["planning", "active"].includes(workspace.status)) throw new ConsultingHttpError(409, "Workspace is not ready for milestones."); if (!input.name) throw new ConsultingHttpError(400, "Milestone name is required."); const { data, error } = await supabaseAdmin.from("project_milestones").insert({ project_id: projectId, name: input.name, objective: input.objective || null, description: input.description || null, planned_start: input.plannedStart || null, planned_completion: input.plannedCompletion || null, owner_id: input.ownerId || null, exit_criteria: input.exitCriteria || [], created_by: userId }).select("*").single(); if (error) throw new Error(error.message); await activity(projectId, "milestone", data.id, userId, "milestone_created", { milestoneNumber: data.milestone_number }); return data; }

export const ALLOWED_MILESTONE_STATUSES = [
  "not_started",
  "planned",
  "in_progress",
  "blocked",
  "internal_review",
  "client_review",
  "approved",
  "completed",
  "cancelled",
] as const;

export type MilestoneStatus = (typeof ALLOWED_MILESTONE_STATUSES)[number];

export function validateMilestoneDates(plannedStart?: string | null, plannedCompletion?: string | null) {
  if (plannedStart && plannedCompletion) {
    const start = new Date(plannedStart).getTime();
    const completion = new Date(plannedCompletion).getTime();
    if (isNaN(start) || isNaN(completion)) {
      throw new ConsultingHttpError(400, "Invalid date format.");
    }
    if (completion < start) {
      throw new ConsultingHttpError(400, "Due date must be on or after start date.");
    }
  }
}

export async function getAvailableAssignees() {
  const [adminsRes, teamRes] = await Promise.all([
    supabaseAdmin.from("users").select("id, name, email, role").in("role", ["ADMIN", "CO_ADMIN"]),
    supabaseAdmin.from("team_members").select("id, name, email, role"),
  ]);

  const list: { id: string; name: string; email: string; role: string }[] = [];
  const seen = new Set<string>();

  for (const u of adminsRes.data || []) {
    if (!seen.has(u.id)) {
      seen.add(u.id);
      list.push({ id: u.id, name: u.name || u.email, email: u.email, role: u.role || "ADMIN" });
    }
  }

  for (const t of teamRes.data || []) {
    if (!seen.has(t.id)) {
      seen.add(t.id);
      list.push({ id: t.id, name: t.name || t.email, email: t.email, role: t.role || "Team Member" });
    }
  }

  return list;
}

export async function getMilestoneDetails(milestoneId: string) {
  const { data: milestone, error } = await supabaseAdmin
    .from("project_milestones")
    .select("*")
    .eq("id", milestoneId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!milestone) throw new ConsultingHttpError(404, "Milestone not found.");

  const { count: tasksCount } = await supabaseAdmin
    .from("project_tasks")
    .select("id", { count: "exact", head: true })
    .eq("milestone_id", milestone.id);

  let owner = null;
  if (milestone.owner_id) {
    const assignees = await getAvailableAssignees();
    owner = assignees.find((a) => a.id === milestone.owner_id) || null;
  }

  return {
    ...milestone,
    tasks_count: tasksCount || 0,
    owner,
  };
}

export async function updateMilestone(
  milestoneId: string,
  userId: string,
  input: {
    status?: string;
    ownerId?: string | null;
    plannedStart?: string | null;
    plannedCompletion?: string | null;
  }
) {
  const { data: existing, error: fetchErr } = await supabaseAdmin
    .from("project_milestones")
    .select("*")
    .eq("id", milestoneId)
    .maybeSingle();

  if (fetchErr) throw new Error(fetchErr.message);
  if (!existing) throw new ConsultingHttpError(404, "Milestone not found.");

  if (input.status !== undefined) {
    if (!ALLOWED_MILESTONE_STATUSES.includes(input.status as any)) {
      throw new ConsultingHttpError(400, `Invalid milestone status: ${input.status}`);
    }
  }

  const effectiveStart = input.plannedStart !== undefined ? input.plannedStart : existing.planned_start;
  const effectiveCompletion = input.plannedCompletion !== undefined ? input.plannedCompletion : existing.planned_completion;
  validateMilestoneDates(effectiveStart, effectiveCompletion);

  if (input.ownerId) {
    const assignees = await getAvailableAssignees();
    const valid = assignees.some((a) => a.id === input.ownerId);
    if (!valid) throw new ConsultingHttpError(400, "Selected owner is invalid.");
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.status !== undefined) {
    updateData.status = input.status;
    if (input.status === "in_progress" && !existing.actual_start) {
      updateData.actual_start = new Date().toISOString().slice(0, 10);
    }
    if (input.status === "completed") {
      if (!existing.actual_completion) {
        updateData.actual_completion = new Date().toISOString().slice(0, 10);
      }
      updateData.progress = 100;
    } else if (input.status === "planned") {
      updateData.progress = 0;
    }
  }

  if (input.ownerId !== undefined) {
    updateData.owner_id = input.ownerId || null;
  }

  if (input.plannedStart !== undefined) {
    updateData.planned_start = input.plannedStart || null;
  }

  if (input.plannedCompletion !== undefined) {
    updateData.planned_completion = input.plannedCompletion || null;
  }

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from("project_milestones")
    .update(updateData)
    .eq("id", milestoneId)
    .select("*")
    .single();

  if (updateErr) throw new Error(updateErr.message);

  await activity(existing.project_id, "milestone", existing.id, userId, "milestone_updated", {
    milestoneNumber: existing.milestone_number,
    status: updateData.status ?? existing.status,
    ownerId: updateData.owner_id ?? existing.owner_id,
    plannedStart: updateData.planned_start ?? existing.planned_start,
    plannedCompletion: updateData.planned_completion ?? existing.planned_completion,
  });

  return updated;
}
export async function createTask(projectId: string, userId: string, input: Record<string, unknown>) { if (!input.title) throw new ConsultingHttpError(400, "Task title is required."); const { data, error } = await supabaseAdmin.from("project_tasks").insert({ project_id: projectId, milestone_id: input.milestoneId || null, title: input.title, description: input.description || null, owner_id: input.ownerId || null, priority: input.priority || "medium", due_date: input.dueDate || null, client_visible: input.clientVisible === true, created_by: userId }).select("*").single(); if (error) throw new Error(error.message); await activity(projectId, "task", data.id, userId, "task_created", { taskNumber: data.task_number }); return data; }
export async function createChangeRequest(projectId: string, userId: string, clientId: string, input: Record<string, unknown>) { if (!input.title || !input.description) throw new ConsultingHttpError(400, "Change title and description are required."); const { data, error } = await supabaseAdmin.from("change_requests").insert({ project_id: projectId, client_id: clientId, requested_by: userId, title: input.title, description: input.description, status: "submitted", impact: input.impact || {} }).select("*").single(); if (error) throw new Error(error.message); await activity(projectId, "change_request", data.id, userId, "change_request_submitted", { changeNumber: data.change_number }); return data; }
export async function createTicket(projectId: string, userId: string, clientId: string, input: Record<string, unknown>) { if (!input.title || !input.description) throw new ConsultingHttpError(400, "Ticket title and description are required."); const { data, error } = await supabaseAdmin.from("support_tickets").insert({ project_id: projectId, client_id: clientId, requester_id: userId, title: input.title, description: input.description, type: input.type || "question", severity: input.severity || "medium", business_impact: input.businessImpact || null }).select("id,ticket_number,title,status,severity,created_at").single(); if (error) throw new Error(error.message); await activity(projectId, "support_ticket", data.id, userId, "support_ticket_created", { ticketNumber: data.ticket_number }); return data; }
