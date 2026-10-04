import {
  deliveryError,
  getAvailableAssignees,
  getMilestoneDetails,
  requireDeliveryAdmin,
  updateMilestone,
} from "@/lib/delivery/workflow";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  try {
    await requireDeliveryAdmin();
    const { milestoneId } = await params;
    const [milestone, assignees] = await Promise.all([
      getMilestoneDetails(milestoneId),
      getAvailableAssignees(),
    ]);
    return Response.json({ milestone, assignees });
  } catch (error) {
    return deliveryError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  try {
    const { userId } = await requireDeliveryAdmin();
    const { milestoneId } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    const input: {
      status?: string;
      ownerId?: string | null;
      plannedStart?: string | null;
      plannedCompletion?: string | null;
    } = {};

    if (body.status !== undefined) input.status = String(body.status);
    if (body.ownerId !== undefined) {
      input.ownerId = body.ownerId ? String(body.ownerId) : null;
    }
    if (body.plannedStart !== undefined) {
      input.plannedStart = body.plannedStart ? String(body.plannedStart) : null;
    }
    if (body.plannedCompletion !== undefined) {
      input.plannedCompletion = body.plannedCompletion ? String(body.plannedCompletion) : null;
    }

    const updated = await updateMilestone(milestoneId, userId, input);
    const milestone = await getMilestoneDetails(updated.id);

    return Response.json({ milestone });
  } catch (error) {
    return deliveryError(error);
  }
}
