import { ConsultingWorkspace } from "@/components/admin/consulting/ConsultingWorkspace";
export default async function AiSolutionReportPage({params}:{params:Promise<{reportId:string}>}){const {reportId}=await params;return <ConsultingWorkspace kind="report" id={reportId}/>}
