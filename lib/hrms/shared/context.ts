import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type HRMSContext={userId:string;organisationId:string;permissions:Set<string>;requestId:string};
export async function requireHRMSContext(request:Request):Promise<HRMSContext>{
  const session=await getServerSession(authOptions);
  const user=session?.user;
  if(!user?.id)throw new HRMSError(401,"unauthenticated","Authentication is required");
  const organisationId=user.organisation_id||process.env.DEFAULT_ORGANISATION_ID;
  if(!organisationId)throw new HRMSError(403,"organisation_context_required","Organisation context is required");
  return{userId:user.id,organisationId,permissions:new Set(user.permissions||[]),requestId:request.headers.get("x-request-id")||crypto.randomUUID()};
}
export function requirePermission(context:HRMSContext,...allowed:string[]){if(!allowed.some(permission=>context.permissions.has(permission)))throw new HRMSError(403,"forbidden",`Required permission: ${allowed.join(" or ")}`)}
export class HRMSError extends Error{constructor(public status:number,public code:string,message:string){super(message)}}
export function errorResponse(error:unknown){if(error instanceof HRMSError)return Response.json({error:error.code,detail:error.message,status:error.status},{status:error.status});console.error(JSON.stringify({level:"error",operation:"hrms.request",error:error instanceof Error?error.message:String(error)}));return Response.json({error:"internal_error",detail:"Request could not be completed"},{status:500})}
export async function jsonBody<T>(request:Request):Promise<T>{const length=Number(request.headers.get("content-length")||0);if(length>2_000_000)throw new HRMSError(413,"payload_too_large","Request body exceeds 2MB");try{return await request.json() as T}catch{throw new HRMSError(400,"invalid_json","A valid JSON body is required")}}
