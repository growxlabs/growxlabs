import { activateWorkspace, deliveryError, requireDeliveryAdmin, supabaseAdmin } from "@/lib/delivery/workflow";

export async function GET() {
  try {
    await requireDeliveryAdmin();
    const [workspacesResult, projectsResult] = await Promise.all([
      supabaseAdmin
        .from("project_workspaces")
        .select("id,project_id,status,health,summary,created_at,consulting_projects(project_number)")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("consulting_projects")
        .select("id,project_number,status,client_id,company_id,created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false }),
    ]);

    if (workspacesResult.error) throw new Error(workspacesResult.error.message);

    const workspaces = workspacesResult.data || [];
    const activeProjects = projectsResult.data || [];

    // Get company names
    const companyIds = activeProjects.map((p) => p.company_id).filter(Boolean) as string[];
    const { data: companies } = companyIds.length
      ? await supabaseAdmin.from("companies").select("id,name").in("id", companyIds)
      : { data: [] };
    const companyMap = new Map((companies || []).map((c) => [c.id, c.name]));

    const existingProjectIds = new Set(workspaces.map((w) => w.project_id));
    const unactivatedProjects = activeProjects
      .filter((p) => !existingProjectIds.has(p.id))
      .map((p) => ({
        id: p.id,
        projectNumber: p.project_number,
        companyName: companyMap.get(p.company_id) || "Client Partner",
      }));

    return Response.json({ workspaces, availableProjects: unactivatedProjects });
  } catch (error) {
    return deliveryError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireDeliveryAdmin();
    const body = (await request.json()) as { projectId?: string };
    if (!body.projectId) return Response.json({ error: "Project is required." }, { status: 400 });
    return Response.json({ workspace: await activateWorkspace(body.projectId, userId) }, { status: 201 });
  } catch (error) {
    return deliveryError(error);
  }
}
