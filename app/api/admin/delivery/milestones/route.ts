import {
  createMilestone,
  deliveryError,
  getAvailableAssignees,
  requireDeliveryAdmin,
  supabaseAdmin,
} from "@/lib/delivery/workflow";

export async function GET(request: Request) {
  try {
    await requireDeliveryAdmin();
    const projectId = new URL(request.url).searchParams.get("projectId");
    let query = supabaseAdmin
      .from("project_milestones")
      .select("*")
      .order("created_at", { ascending: false });

    if (projectId) query = query.eq("project_id", projectId);
    const { data: milestones, error } = await query;
    if (error) throw new Error(error.message);

    const assignees = await getAvailableAssignees();
    const assigneeMap = new Map(assignees.map((a) => [a.id, a]));

    const milestoneIds = (milestones || []).map((m) => m.id);
    let taskCountsByMilestone = new Map<string, number>();

    if (milestoneIds.length > 0) {
      const { data: tasks } = await supabaseAdmin
        .from("project_tasks")
        .select("milestone_id")
        .in("milestone_id", milestoneIds);

      if (tasks) {
        for (const t of tasks) {
          if (t.milestone_id) {
            taskCountsByMilestone.set(
              t.milestone_id,
              (taskCountsByMilestone.get(t.milestone_id) || 0) + 1
            );
          }
        }
      }
    }

    const enriched = (milestones || []).map((m) => ({
      ...m,
      tasks_count: taskCountsByMilestone.get(m.id) || 0,
      owner: m.owner_id ? assigneeMap.get(m.owner_id) || null : null,
    }));

    return Response.json({
      milestones: enriched,
      assignees,
    });
  } catch (error) {
    return deliveryError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireDeliveryAdmin();
    const body = (await request.json()) as Record<string, unknown>;
    if (!body.projectId) return Response.json({ error: "Workspace is required." }, { status: 400 });
    return Response.json(
      { milestone: await createMilestone(String(body.projectId), userId, body) },
      { status: 201 }
    );
  } catch (error) {
    return deliveryError(error);
  }
}

