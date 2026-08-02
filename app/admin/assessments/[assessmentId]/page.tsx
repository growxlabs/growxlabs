import { AssessmentAdminDetail } from "@/components/admin/assessments/AssessmentAdminDetail";
export default async function AdminAssessmentPage({params}:{params:Promise<{assessmentId:string}>}){const {assessmentId}=await params;return <main className="p-6 md:p-10"><AssessmentAdminDetail assessmentId={assessmentId}/></main>}
