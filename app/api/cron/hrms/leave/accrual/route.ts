import { supabaseAdmin } from "@/lib/supabase/admin";
import { boundedLimit,requireCron } from "@/lib/hrms/shared/cron";
import { errorResponse,HRMSError } from "@/lib/hrms/shared/context";
export async function GET(request:Request){try{requireCron(request);const actor=process.env.HRMS_SYSTEM_ACTOR_USER_ID;if(!actor)throw new HRMSError(503,"system_actor_not_configured","HRMS_SYSTEM_ACTOR_USER_ID is required");const date=new URL(request.url).searchParams.get("date")||new Date().toISOString().slice(0,10);const {data,error}=await supabaseAdmin.schema("leave").rpc("run_accrual",{p_effective_date:date,p_actor_user_id:actor,p_limit:boundedLimit(request)});if(error)throw new HRMSError(422,"accrual_failed",error.message);return Response.json(data)}catch(error){return errorResponse(error)}}
export const dynamic="force-dynamic";
export const maxDuration=60;
