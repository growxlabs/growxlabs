import { ClientDocument } from "@/components/consulting/ClientDocument";
export default async function ClientAiSolutionReport({params}:{params:Promise<{reportId:string}>}){const {reportId}=await params;return <ClientDocument kind="report" id={reportId}/>}
