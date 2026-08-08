import { requireActiveEmployeeContext } from "@/lib/employee-os/context";import { getFollowUps } from "@/lib/employee-os/sales-service";import { salesError } from "@/lib/employee-os/sales-api";
export async function GET(){try{return Response.json({followups:await getFollowUps(await requireActiveEmployeeContext())})}catch(e){return salesError(e)}}
