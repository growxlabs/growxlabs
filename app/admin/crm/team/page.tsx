import { getAdminSalesOverview } from "@/lib/employee-os/admin-sales-control";
import { AdminSalesTeam } from "@/components/admin/crm/AdminSalesTeam";
export const dynamic="force-dynamic";
export default async function AdminSalesTeamPage(){const data=await getAdminSalesOverview("week");return <AdminSalesTeam initial={data}/>}
