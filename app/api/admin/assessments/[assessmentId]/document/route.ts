import { assessmentErrorResponse, getAssessmentByIdOrNumber, requireAssessmentAdmin } from "@/lib/assessments/server";

export async function GET(_request: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  try {
    await requireAssessmentAdmin();
    const { assessmentId } = await params;
    const assessment = await getAssessmentByIdOrNumber(assessmentId);
    if (!assessment) {
      return Response.json({ error: "Assessment not found." }, { status: 404 });
    }
    return Response.json({ assessment });
  } catch (error) {
    return assessmentErrorResponse(error);
  }
}
