import { financeError, requireFinanceClient, supabaseAdmin } from "@/lib/finance/activation-workflow";

export async function GET() {
  try {
    const { clientId } = await requireFinanceClient();
    const { data, error } = await supabaseAdmin
      .from("consulting_projects")
      .select(
        "id,project_number,status,activated_at,consulting_kickoffs(kickoff_number,status,agenda,preparation,meeting_details,scheduled_for),project_workspaces(id,status,health,summary,project_milestones(milestone_number,name,status,planned_completion,progress),project_tasks(task_number,title,status,priority,due_date,client_visible),project_deliverables(deliverable_number,title,status,version,client_review_status,client_visible),project_releases(release_number,version,environment,status,release_notes,deployed_at))"
      )
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const projects = (data || []).map((project) => {
      // Normalize workspace whether Supabase returned an object or array
      const rawWs = project.project_workspaces;
      const wsList = Array.isArray(rawWs) ? rawWs : rawWs ? [rawWs] : [];

      const normalizedWorkspaces = wsList.map((ws: any) => ({
        ...ws,
        project_milestones: ws.project_milestones || [],
        project_tasks: (ws.project_tasks || []).filter((t: any) => t.client_visible === true),
        project_deliverables: (ws.project_deliverables || []).filter((d: any) => d.client_visible === true),
        project_releases: ws.project_releases || [],
      }));

      return {
        ...project,
        project_workspaces: normalizedWorkspaces,
      };
    });

    return Response.json({ projects });
  } catch (error) {
    return financeError(error);
  }
}
