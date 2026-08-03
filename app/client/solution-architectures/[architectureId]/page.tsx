import { ClientDocument } from "@/components/consulting/ClientDocument";
export default async function ClientArchitecture({params}:{params:Promise<{architectureId:string}>}){const {architectureId}=await params;return <ClientDocument kind="architecture" id={architectureId}/>}
