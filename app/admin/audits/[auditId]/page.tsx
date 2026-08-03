import { AuditWorkspace } from "@/components/admin/audits/AuditWorkspace";
export default async function AuditPage({params}:{params:Promise<{auditId:string}>}){const {auditId}=await params;return <main className="p-6 md:p-10"><AuditWorkspace auditId={auditId}/></main>}
