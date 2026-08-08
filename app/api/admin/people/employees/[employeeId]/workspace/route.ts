import { z } from "zod";import { adminSalesResponse,setEmployeeWorkspaceStatus } from "@/lib/employee-os/admin-sales-control";
const schema=z.object({status:z.enum(["active","suspended"])});
export async function PATCH(request:Request,{params}:{params:Promise<{employeeId:string}>}){try{const parsed=schema.safeParse(await request.json());if(!parsed.success)return Response.json({error:"Invalid workspace status"},{status:422});return Response.json({workspace:await setEmployeeWorkspaceStatus((await params).employeeId,parsed.data.status)})}catch(error){return adminSalesResponse(error)}}
