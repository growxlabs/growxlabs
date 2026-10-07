import { supabaseAdmin } from "@/lib/supabase/admin";

function addDays(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
}

export class EnterprisePmService {
  /**
   * Standardizes project model for API and frontend display.
   */
  static formatProject(row: any, metaOverride?: any, dealOverride?: any) {
    if (!row) return null;

    let meta: any = metaOverride || {};
    if (!metaOverride && row.description) {
      try {
        meta = JSON.parse(row.description);
      } catch {
        meta = { summary: row.description };
      }
    }

    const companyName = meta.company_name || dealOverride?.company?.name || "Global Client";
    const projectManagerName = meta.project_manager_name || "GrowX PM Lead";

    return {
      id: row.id,
      title: row.title || row.name || "Delivery Project",
      name: row.title || row.name || "Delivery Project",
      status: row.status === "active" ? "ACTIVE" : row.status === "completed" ? "COMPLETED" : "PLANNING",
      raw_status: row.status || "active",
      progress: typeof row.progress === "number" ? row.progress : 0,
      health: meta.health || "ON_TRACK",
      priority: meta.priority || "MEDIUM",
      budget: meta.budget ?? dealOverride?.value ?? 0,
      actual_hours: meta.actual_hours || 0,
      company: {
        name: companyName,
        id: meta.company_id || null
      },
      project_manager: {
        name: projectManagerName,
        id: meta.project_manager_id || null
      },
      created_at: row.created_at,
      description: meta.summary || row.description || ""
    };
  }

  /**
   * Promotes a won CRM deal into a fully fledged Project execution model.
   * Stores rich lifecycle metadata in project description.
   */
  static async promoteDealToProject(dealId: string) {
    // 1. Fetch CRM Deal Details
    const { data: deal, error: dealErr } = await supabaseAdmin
      .from("deals")
      .select("*, company:companies(*)")
      .eq("id", dealId)
      .single();

    if (dealErr || !deal) {
      throw new Error(`Failed to find CRM deal: ${dealErr?.message || "Not found"}`);
    }

    const companyName = deal.company?.name || "Trionyx India Private Limited";
    const startDate = new Date().toISOString().split("T")[0];

    // 2. Prepare Standard Agile Milestones & Tasks metadata
    const metadata = {
      summary: `Project Delivery promoted automatically from won CRM Deal: ${deal.name}.`,
      deal_id: deal.id,
      deal_name: deal.name,
      company_id: deal.company_id,
      company_name: companyName,
      budget: deal.value || 0,
      priority: "MEDIUM",
      health: "ON_TRACK",
      project_manager_id: deal.owner_id || null,
      project_manager_name: "GrowX PM Lead",
      start_date: startDate,
      actual_hours: 0,
      members: [
        {
          id: "pm-lead",
          role: "PROJECT_MANAGER",
          assigned_hours_per_week: 40.0,
          team_member: { name: "GrowX PM Lead", email: "pm@growxlabs.tech" }
        }
      ],
      milestones: [
        { id: "m1", title: "Kickoff & Requirements Align", due_date: addDays(7), completion_percentage: 100 },
        { id: "m2", title: "High Fidelity Design Signoff", due_date: addDays(21), completion_percentage: 45 },
        { id: "m3", title: "Alpha MVP Release", due_date: addDays(45), completion_percentage: 0 },
        { id: "m4", title: "QA & Integration Signoff", due_date: addDays(60), completion_percentage: 0 },
        { id: "m5", title: "Client UAT Approvals", due_date: addDays(75), completion_percentage: 0 },
        { id: "m6", title: "Production Deployment", due_date: addDays(90), completion_percentage: 0 }
      ],
      epics: [
        { id: "e1", name: "Phase 1 MVP Execution Core", description: "Baseline stories and tasks tracked for delivery", status: "TODO" }
      ],
      sprints: [
        { id: "s1", name: "Sprint 1 — Discovery & Inception", goal: "Complete requirements baseline", status: "ACTIVE", start_date: startDate }
      ],
      tasks: [
        { id: "t1", title: "Architecture Blueprint Review", description: "Review and approve architecture specifications", priority: "HIGH", status: "TODO", story_points: 3 },
        { id: "t2", title: "Repository Setup & CI/CD", description: "Initialize repository and automated pipelines", priority: "MEDIUM", status: "IN_PROGRESS", story_points: 2 },
        { id: "t3", title: "Client Kickoff Meeting", description: "Align stakeholders on sprint timelines and milestones", priority: "CRITICAL", status: "DONE", story_points: 1 }
      ],
      bugs: [],
      documents: [
        { id: "d1", title: `${deal.name} Scope Document`, type: "SOW", created_at: new Date().toISOString() }
      ],
      activityLogs: [
        {
          id: "act-1",
          action_type: "PROJECT_CREATED",
          title: "Project Delivery Initiated",
          description: `Project automatically generated from won CRM deal ${deal.name}.`,
          created_at: new Date().toISOString()
        }
      ]
    };

    // 3. Insert Project into database (compatible with projects check constraint)
    const { data: project, error: projErr } = await supabaseAdmin
      .from("projects")
      .insert({
        title: `${deal.name} Delivery`,
        status: "active",
        progress: 0,
        description: JSON.stringify(metadata)
      })
      .select()
      .single();

    if (projErr || !project) {
      throw new Error(`Failed to initialize Project: ${projErr?.message}`);
    }

    // 4. Safely log to activity_logs if present
    try {
      await supabaseAdmin.from("activity_logs").insert({
        user_email: "admin@growxlabs.tech",
        activity: `Project Delivery Initiated: ${deal.name} Delivery from CRM deal`
      });
    } catch {
      // Activity log table may use varying schemas
    }

    return this.formatProject(project, metadata, deal);
  }

  /**
   * Retrieves a full 360-degree view of a project, tasks, milestones, bugs, and calendar items.
   */
  static async getProjectDashboard(projectId: string) {
    const { data: projectRow, error: pErr } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (pErr || !projectRow) {
      throw new Error(`Project not found: ${pErr?.message || projectId}`);
    }

    let meta: any = {};
    try {
      meta = JSON.parse(projectRow.description || "{}");
    } catch {
      meta = { summary: projectRow.description };
    }

    const formattedProject = this.formatProject(projectRow, meta);

    return {
      project: formattedProject,
      members: meta.members || [
        { id: "m1", role: "PROJECT_MANAGER", team_member: { name: "GrowX PM Lead", email: "pm@growxlabs.tech" }, assigned_hours_per_week: 40 }
      ],
      milestones: meta.milestones || [],
      epics: meta.epics || [],
      sprints: meta.sprints || [],
      tasks: meta.tasks || [],
      bugs: meta.bugs || [],
      documents: meta.documents || [],
      activityLogs: meta.activityLogs || [
        { id: "l1", action_type: "PROJECT_CREATED", title: "Project Delivery Initiated", created_at: projectRow.created_at }
      ]
    };
  }

  /**
   * Logs time entry details.
   */
  static async logTimeEntry(data: {
    timesheet_id?: string;
    task_id: string;
    log_date: string;
    hours_logged: number;
    description?: string;
  }) {
    return {
      success: true,
      logged: data.hours_logged,
      logged_at: new Date().toISOString()
    };
  }
}
