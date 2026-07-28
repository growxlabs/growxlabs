import { supabaseAdmin } from "@/lib/supabase/admin";
import { calculateDailyAttendance } from "@/lib/hrms/attendance/engine";
import { eventsForDay,resolvePolicy,resolveShift,upsertSummary } from "@/lib/hrms/attendance/repository";
import { boundedLimit,requireCron } from "@/lib/hrms/shared/cron";
import { errorResponse,HRMSError,type HRMSContext } from "@/lib/hrms/shared/context";

export async function GET(request:Request){
  try{
    requireCron(request);
    const actor=process.env.HRMS_SYSTEM_ACTOR_USER_ID;
    if(!actor)throw new HRMSError(503,"system_actor_not_configured","HRMS_SYSTEM_ACTOR_USER_ID is required");
    const defaultDate=new Date(Date.now()-86_400_000).toISOString().slice(0,10),date=new URL(request.url).searchParams.get("date")||defaultDate;
    const {data,error}=await supabaseAdmin.schema("people").from("employment_records").select("organisation_id,employee_id").is("valid_to",null).eq("status","active").limit(boundedLimit(request));
    if(error)throw new HRMSError(422,"attendance_close_failed",error.message);
    let processed=0,failed=0;
    const start=`${date}T00:00:00.000Z`,end=new Date(Date.parse(start)+86_400_000).toISOString();
    for(const row of data||[]){
      try{
        const context:HRMSContext={userId:actor,organisationId:row.organisation_id,permissions:new Set(),requestId:crypto.randomUUID()};
        const [events,policy,shift]=await Promise.all([eventsForDay(context,row.employee_id,start,end),resolvePolicy(context,row.employee_id,date),resolveShift(context,row.employee_id,date)]);
        const result=calculateDailyAttendance(events,policy,shift,date);
        await upsertSummary(context,row.employee_id,date,policy.versionId,shift,result as unknown as Record<string,unknown>);
        processed++;
      }catch{failed++}
    }
    return Response.json({date,processed,failed,hasMore:(data?.length||0)===boundedLimit(request)});
  }catch(error){return errorResponse(error)}
}
export const dynamic="force-dynamic";
export const maxDuration=60;
