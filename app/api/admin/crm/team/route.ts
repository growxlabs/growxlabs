import { adminSalesResponse,getAdminSalesOverview } from "@/lib/employee-os/admin-sales-control";
export async function GET(request:Request){try{const value=new URL(request.url).searchParams.get("period"),period=value==="today"||value==="month"?value:"week";return Response.json(await getAdminSalesOverview(period))}catch(error){return adminSalesResponse(error)}}
