import { errorResponse, HRMSError, jsonBody, requireHRMSContext, requirePermission } from "@/lib/hrms/shared/context";
import { resolveLeaveDays, totalLeaveQuantity, type LeaveDay, type LeaveRule } from "./engine";
import { closeLeave, createLeaveRequest, decideLeave, leaveDb, leaveEligibility, leaveEmployee, unwrapLeave } from "./repository";
import { supabaseAdmin } from "@/lib/supabase/admin";

type RouteContext={params:Promise<{path:string[]}>};
type RequestInput={leaveTypeId:string;policyVersionId:string;fromDate:string;toDate:string;reason:string;attachmentDocumentIds?:string[];days:LeaveDay[];rule?:LeaveRule};
const isoDate=/^\d{4}-\d{2}-\d{2}$/;
export async function handleLeave(request:Request,route:RouteContext){
  try{
    const context=await requireHRMSContext(request),{path}=await route.params;
    if(request.method==="GET"&&path[0]==="balances"){
      requirePermission(context,"leave.view_self","leave.view_team","leave.manage");
      const employee=await leaveEmployee(context);
      const result=await leaveDb.from("ledger_entries").select("leave_type_id,quantity,leave_types(name,key)").eq("organisation_id",context.organisationId).eq("employee_id",employee.id);
      const rows=unwrapLeave(result.data,result.error) as Array<{leave_type_id:string;quantity:number;leave_types:unknown}>,balances=new Map<string,{leaveTypeId:string;balance:number;leaveType:unknown}>();
      for(const row of rows){const value=balances.get(row.leave_type_id)||{leaveTypeId:row.leave_type_id,balance:0,leaveType:row.leave_types};value.balance=Math.round((value.balance+Number(row.quantity))*100)/100;balances.set(row.leave_type_id,value)}
      return Response.json({items:[...balances.values()]});
    }
    if(request.method==="GET"&&path[0]==="requests"){
      requirePermission(context,"leave.view_self","leave.view_team","leave.manage");
      const employee=await leaveEmployee(context);
      const result=await leaveDb.from("requests").select("*,request_days(*),request_approvals(*)").eq("organisation_id",context.organisationId).eq("employee_id",employee.id).order("created_at",{ascending:false});
      return Response.json({items:unwrapLeave(result.data,result.error)});
    }
    if(request.method==="GET"&&path[0]==="team-requests"){
      requirePermission(context,"leave.view_team","leave.approve","leave.manage");
      const manager=await leaveEmployee(context);
      const peopleDb=supabaseAdmin.schema("people");
      const team=await peopleDb.from("employment_records").select("employee_id").eq("organisation_id",context.organisationId).eq("manager_employee_id",manager.id).is("valid_to",null);
      const ids=unwrapLeave(team.data,team.error).map((row:{employee_id:string})=>row.employee_id);
      if(!ids.length)return Response.json({items:[]});
      const result=await leaveDb.from("requests").select("*,request_days(*),request_approvals(*)").eq("organisation_id",context.organisationId).in("employee_id",ids).order("created_at",{ascending:false});
      return Response.json({items:unwrapLeave(result.data,result.error)});
    }
    if(request.method==="GET"&&path[0]==="eligibility"){
      requirePermission(context,"leave.view_self","leave.request","leave.manage");
      const date=new URL(request.url).searchParams.get("date")||new Date().toISOString().slice(0,10);
      return Response.json(await leaveEligibility(context,date));
    }
    if(request.method==="POST"&&path[0]==="requests"&&path.length===1){
      requirePermission(context,"leave.request","leave.manage");
      const input=await jsonBody<RequestInput>(request);
      if(!isoDate.test(input.fromDate)||!isoDate.test(input.toDate)||input.toDate<input.fromDate)throw new HRMSError(422,"invalid_date_range","A valid leave date range is required");
      if(!input.days?.length)throw new HRMSError(422,"leave_days_required","At least one leave day is required");
      const rule=input.rule||{weekendTreatment:"exclude",holidayTreatment:"exclude",sandwichEnabled:false,hourDayMinutes:480};
      const days=resolveLeaveDays(input.days,rule),totalQuantity=totalLeaveQuantity(days);
      if(totalQuantity<=0)throw new HRMSError(422,"zero_leave_quantity","Leave quantity must be greater than zero");
      return Response.json(await createLeaveRequest(context,{...input,days,totalQuantity}),{status:201});
    }
    if(request.method==="POST"&&path[0]==="requests"&&path[2]==="decision"){
      requirePermission(context,"leave.approve","leave.manage");
      return Response.json(await decideLeave(context,path[1],await jsonBody(request)));
    }
    if(request.method==="POST"&&path[0]==="requests"&&["withdraw","cancel"].includes(path[2])){
      requirePermission(context,path[2]==="cancel"?"leave.cancel":"leave.request","leave.manage");
      return Response.json(await closeLeave(context,path[1],path[2] as "withdraw"|"cancel"));
    }
    if(request.method==="GET"&&path[0]==="ledger"){
      requirePermission(context,"leave.ledger.view","leave.manage");
      const employee=await leaveEmployee(context);
      const result=await leaveDb.from("ledger_entries").select("*").eq("organisation_id",context.organisationId).eq("employee_id",employee.id).order("effective_date",{ascending:false});
      return Response.json({items:unwrapLeave(result.data,result.error)});
    }
    if(request.method==="GET"&&["types","policies"].includes(path[0])){
      requirePermission(context,"leave.policy.view","leave.view_self","leave.manage");
      const result=await leaveDb.from(path[0]).select("*").eq("organisation_id",context.organisationId).eq("status","active").order("name");
      return Response.json({items:unwrapLeave(result.data,result.error)});
    }
    throw new HRMSError(404,"not_found","Leave endpoint not found");
  }catch(error){return errorResponse(error)}
}
