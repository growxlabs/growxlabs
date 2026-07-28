import { calculateDailyAttendance } from "./engine";
import {
  attendance, people, decideRegularisation, eventsForDay, recordEvent, resolvePolicy,
  resolveShift, selfEmployee, submitRegularisation, summaries, unwrap, upsertSummary, validateGeofence,
} from "./repository";
import { errorResponse, HRMSError, jsonBody, requireHRMSContext, requirePermission } from "@/lib/hrms/shared/context";
import { acquireTransientKey, rateLimit } from "@/lib/hrms/shared/transient";
import type { AttendanceEventType } from "./contracts";

type RouteContext={params:Promise<{path:string[]}>};
const allowedEvents=new Set<AttendanceEventType>(["CHECK_IN","CHECK_OUT","BREAK_START","BREAK_END"]);
const dayBounds=(date:string)=>({start:`${date}T00:00:00.000Z`,end:new Date(Date.parse(`${date}T00:00:00.000Z`)+86_400_000).toISOString()});

async function recalculate(context:Awaited<ReturnType<typeof requireHRMSContext>>,employeeId:string,date:string){
  const {start,end}=dayBounds(date);
  const [events,policy,shift]=await Promise.all([eventsForDay(context,employeeId,start,end),resolvePolicy(context,employeeId,date),resolveShift(context,employeeId,date)]);
  const result=calculateDailyAttendance(events,policy,shift,date);
  return upsertSummary(context,employeeId,date,policy.versionId,shift,result as unknown as Record<string,unknown>);
}

export async function handleAttendance(request:Request,route:RouteContext){
  try{
    const context=await requireHRMSContext(request);
    const {path}=await route.params;
    if(request.method==="GET"&&path[0]==="today"){
      requirePermission(context,"attendance.view_self","attendance.view_team","attendance.manage");
      const employee=await selfEmployee(context),date=new URL(request.url).searchParams.get("date")||new Date().toISOString().slice(0,10);
      const {start,end}=dayBounds(date);
      const [events,summary]=await Promise.all([eventsForDay(context,employee.id,start,end),summaries(context,employee.id,date,date)]);
      return Response.json({date,employee,events,summary:summary[0]||null});
    }
    if(request.method==="GET"&&(path[0]==="calendar"||path[0]==="summaries")){
      requirePermission(context,"attendance.view_self","attendance.view_team","attendance.manage");
      const query=new URL(request.url).searchParams,employee=await selfEmployee(context);
      const from=query.get("from")||new Date().toISOString().slice(0,8)+"01",to=query.get("to")||new Date().toISOString().slice(0,10);
      return Response.json({items:await summaries(context,employee.id,from,to)});
    }
    if(request.method==="GET"&&path[0]==="team"){
      requirePermission(context,"attendance.view_team","attendance.manage");
      const manager=await selfEmployee(context),query=new URL(request.url).searchParams;
      const from=query.get("from")||new Date().toISOString().slice(0,10),to=query.get("to")||from;
      const reports=await people.from("employment_records").select("employee_id").eq("organisation_id",context.organisationId).eq("manager_employee_id",manager.id).is("valid_to",null);
      const ids=(unwrap(reports.data,reports.error) as Array<{employee_id:string}>).map(row=>row.employee_id);
      if(!ids.length)return Response.json({items:[]});
      const result=await attendance.from("daily_summaries").select("*,employees:employee_id(employee_number,first_name,last_name)").eq("organisation_id",context.organisationId).in("employee_id",ids).gte("work_date",from).lte("work_date",to).order("work_date",{ascending:false});
      return Response.json({items:unwrap(result.data,result.error)});
    }
    if(request.method==="POST"&&path[0]==="events"){
      requirePermission(context,"attendance.clock","attendance.manage");
      const input=await jsonBody<{eventType:AttendanceEventType;occurredAt?:string;timezone?:string;latitude?:number;longitude?:number;accuracyMetres?:number;deviceId?:string;notes?:string}>(request);
      if(!allowedEvents.has(input.eventType))throw new HRMSError(422,"invalid_event_type","Unsupported clock event");
      const key=request.headers.get("idempotency-key");
      if(!key)throw new HRMSError(400,"idempotency_key_required","Idempotency-Key header is required");
      if(!await rateLimit(`attendance:${context.userId}`,12,60))throw new HRMSError(429,"rate_limited","Too many clock events");
      const occurredAt=input.occurredAt||new Date().toISOString();
      const employee=await selfEmployee(context);
      const policy=await resolvePolicy(context,employee.id,occurredAt.slice(0,10));
      if(policy.gpsRequired&&(input.latitude===undefined||input.longitude===undefined))throw new HRMSError(422,"gps_required","This attendance policy requires a GPS location");
      if(policy.geofenceRequired&&input.latitude!==undefined&&input.longitude!==undefined)await validateGeofence(context,employee.id,occurredAt.slice(0,10),input.latitude,input.longitude);
      if(!await acquireTransientKey(`attendance:${context.organisationId}:${key}`,86_400))throw new HRMSError(409,"duplicate_request","This clock event was already submitted");
      const event=await recordEvent(context,{...input,occurredAt,timezone:input.timezone||"UTC",source:"WEB",idempotencyKey:key,ipAddress:request.headers.get("x-forwarded-for")?.split(",")[0]});
      await recalculate(context,employee.id,occurredAt.slice(0,10));
      return Response.json(event,{status:201});
    }
    if(request.method==="POST"&&path[0]==="regularisations"&&path.length===1){
      requirePermission(context,"attendance.regularisation.create","attendance.manage");
      return Response.json(await submitRegularisation(context,await jsonBody(request)),{status:201});
    }
    if(request.method==="POST"&&path[0]==="regularisations"&&path[2]==="decision"){
      requirePermission(context,"attendance.regularisation.approve","attendance.manage");
      return Response.json(await decideRegularisation(context,path[1],await jsonBody(request)));
    }
    if(request.method==="GET"&&path[0]==="regularisations"){
      requirePermission(context,"attendance.view_self","attendance.view_team","attendance.manage");
      const employee=await selfEmployee(context);
      const result=await attendance.from("regularisation_requests").select("*,regularisation_approvals(*)").eq("organisation_id",context.organisationId).eq("employee_id",employee.id).order("created_at",{ascending:false});
      return Response.json({items:unwrap(result.data,result.error)});
    }
    if(request.method==="GET"&&["policies","shifts","schedules","holidays"].includes(path[0])){
      requirePermission(context,"attendance.policy.view","attendance.manage");
      const table=path[0]==="policies"?"policies":path[0]==="schedules"?"work_schedules":path[0]==="holidays"?"holiday_calendars":"shifts";
      const result=await attendance.from(table).select("*").eq("organisation_id",context.organisationId).order("created_at",{ascending:false});
      return Response.json({items:unwrap(result.data,result.error)});
    }
    throw new HRMSError(404,"not_found","Attendance endpoint not found");
  }catch(error){return errorResponse(error)}
}
