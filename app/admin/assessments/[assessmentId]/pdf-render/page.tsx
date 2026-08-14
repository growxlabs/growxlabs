import { AssessmentDocument } from "@/components/assessment/AssessmentDocument";
import { getAssessmentByIdOrNumber } from "@/lib/assessments/server";
import { notFound } from "next/navigation";

export default async function AdminAssessmentPdfRenderPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  const assessment = await getAssessmentByIdOrNumber(assessmentId);
  if (!assessment) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 p-0 m-0 print:p-0">
      <AssessmentDocument assessment={assessment} mode="admin" isPdfRender={true} />
    </main>
  );
}
