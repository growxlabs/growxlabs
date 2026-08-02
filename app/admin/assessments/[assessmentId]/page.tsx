import { AdminDocumentActions } from "@/components/admin/assessments/AdminDocumentActions";
import { AssessmentDocumentPage } from "@/components/assessment/AssessmentDocumentPage";
export default async function AdminAssessmentPage({params}:{params:Promise<{assessmentId:string}>}){const {assessmentId}=await params;return <AssessmentDocumentPage mode="admin" assessmentId={assessmentId} adminActions={<AdminDocumentActions assessmentId={assessmentId}/>}/>}
