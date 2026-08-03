import { ConsultingWorkspace } from "@/components/admin/consulting/ConsultingWorkspace";
export default async function SolutionArchitecturePage({params}:{params:Promise<{architectureId:string}>}){const {architectureId}=await params;return <ConsultingWorkspace kind="architecture" id={architectureId}/>}
