import {supabaseAdmin} from "@/lib/supabase/admin";
import {boundedLimit,requireCron} from "@/lib/hrms/shared/cron";
import {errorResponse,HRMSError} from "@/lib/hrms/shared/context";
export async function GET(request:Request){try{requireCron(request);const date=new URL(request.url).searchParams.get("date")||new Date().toISOString().slice(0,10),{data,error}=await supabaseAdmin.schema("learning").rpc("run_due_reminders",{p_run_date:date,p_limit:boundedLimit(request)});if(error)throw new HRMSError(422,"learning_reminders_failed",error.message);return Response.json(data)}catch(error){return errorResponse(error)}}
export const dynamic="force-dynamic";export const maxDuration=60;
