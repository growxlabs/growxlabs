import { assessmentErrorResponse, getAssessmentByIdOrNumber, requireAssessmentAdmin } from "@/lib/assessments/server";
import { generateAssessmentPdf } from "@/lib/pdf/assessment-pdf";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  try {
    await requireAssessmentAdmin();
    const { assessmentId } = await params;
    const assessment = await getAssessmentByIdOrNumber(assessmentId);

    if (!assessment) {
      return Response.json({ error: "Assessment not found." }, { status: 404 });
    }

    const pdfBuffer = await generateAssessmentPdf(assessment);
    const filename = `${assessment.assessmentNumber || "GrowXLabs-Assessment"}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return assessmentErrorResponse(error);
  }
}
