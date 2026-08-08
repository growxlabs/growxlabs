import { requireActiveEmployeeContext } from "@/lib/employee-os/context";import { discoveryParticipants } from "@/lib/employee-os/sales-service";import { salesError } from "@/lib/employee-os/sales-api";
export async function GET(){try{return Response.json({participants:await discoveryParticipants(await requireActiveEmployeeContext())})}catch(e){return salesError(e)}}
