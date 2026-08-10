import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { EmployeeContext } from "./context";
import { getFollowUps, getMeetings } from "./sales-service";

export type WorkItem = { id: string; sourceType: "onboarding" | "crm_followup" | "discovery"; sourceId: string; title: string; description?: string; dueAt?: string; priority?: string; status: string; href?: string };
export async function employeeOnboarding(context: EmployeeContext) {
  const { data } = await supabaseAdmin.schema("onboarding").from("employee_states").select("id,status,checklist,updated_at").eq("organisation_id", context.organisationId).eq("employee_id", context.employeeId).maybeSingle();
  return data;
}
export async function employeeWorkItems(context: EmployeeContext): Promise<WorkItem[]> {
  const onboarding = await employeeOnboarding(context);
  const items:WorkItem[] = onboarding && Array.isArray(onboarding.checklist) ? onboarding.checklist.filter((item: any) => item.status !== "completed").map((item: any) => ({ id: `onboarding:${item.key}`, sourceType: "onboarding" as const, sourceId: onboarding.id, title: String(item.title), status: String(item.status), href: "/workspace/employment" })) : [];
  if(context.permissions.includes("sales.followups.manage_own")){const followups=await getFollowUps(context);items.push(...followups.filter(item=>item.status==="open").map(item=>({id:`followup:${item.id}`,sourceType:"crm_followup" as const,sourceId:item.id,title:`Follow up with ${item.leads?.business_name||"prospect"}`,description:item.context,dueAt:item.due_at,priority:item.priority,status:item.status,href:"/workspace/sales/follow-ups"})));}
  if(context.permissions.includes("sales.meetings.schedule")){const meetings=await getMeetings(context);items.push(...meetings.filter(item=>item.status==="scheduled"&&Date.parse(item.scheduled_start)>=Date.now()).map(item=>({id:`discovery:${item.id}`,sourceType:"discovery" as const,sourceId:item.id,title:`Discovery: ${item.sales_opportunities?.name||"Opportunity"}`,dueAt:item.scheduled_start,status:item.status,href:"/workspace/sales/meetings"})));}
  return items.sort((a,b)=>Date.parse(a.dueAt||"9999-12-31")-Date.parse(b.dueAt||"9999-12-31"));
}
export async function employeeNotifications(context: EmployeeContext, limit = 20) {
  const { data, error } = await supabaseAdmin.schema("notifications").from("notifications").select("id,template_key,payload,created_at,read_at").eq("organisation_id", context.organisationId).eq("recipient_user_id", context.authUserId).order("created_at", { ascending: false }).limit(limit);
  if (error && error.code !== "PGRST106") console.error("Employee notifications could not be loaded.", { code: error.code });
  return data || [];
}
export async function employeeDocuments(context: EmployeeContext) {
  const offers=await supabaseAdmin.schema("recruitment").from("offers").select("document_id").eq("organisation_id",context.organisationId).eq("employee_id",context.employeeId).not("document_id","is",null);
  const offerIds=(offers.data||[]).map(x=>x.document_id).filter(Boolean),owned=await supabaseAdmin.schema("documents").from("documents").select("id,name,status,created_at,category_id").eq("organisation_id", context.organisationId).eq("owner_entity_type", "employee").eq("owner_entity_id", context.employeeId).eq("status", "active").is("deleted_at", null).order("created_at", { ascending: false });
  const linked=offerIds.length?await supabaseAdmin.schema("documents").from("documents").select("id,name,status,created_at,category_id").eq("organisation_id",context.organisationId).in("id",offerIds).eq("status","active").is("deleted_at",null):{data:[]};
  return [...new Map([...(owned.data||[]),...(linked.data||[])].map(x=>[x.id,x])).values()];
}

function rpcPayload<T>(data: unknown, fallback: T): T { return data && typeof data === "object" ? data as T : fallback; }
export async function employeeAttendance(context: EmployeeContext) {
  const today=new Date(),from=new Date(today.getFullYear(),today.getMonth(),1).toISOString().slice(0,10),to=today.toISOString().slice(0,10);
  const {data,error}=await supabaseAdmin.rpc("employee_attendance_snapshot",{p_organisation_id:context.organisationId,p_employee_id:context.employeeId,p_from:from,p_to:to});
  if(error) throw new Error("Attendance records could not be loaded.");
  return rpcPayload(data,{today:{},events:[],summaries:[]});
}
export async function employeeLeave(context: EmployeeContext) {
  const {data,error}=await supabaseAdmin.rpc("employee_leave_snapshot",{p_organisation_id:context.organisationId,p_employee_id:context.employeeId});
  if(error) throw new Error("Leave records could not be loaded.");
  return rpcPayload(data,{requests:[],balances:[],types:[]});
}
export async function employeeLearning(context: EmployeeContext) {
  const {data,error}=await supabaseAdmin.rpc("employee_learning_snapshot",{p_organisation_id:context.organisationId,p_employee_id:context.employeeId});
  if(error) throw new Error("Assigned learning could not be loaded.");
  return rpcPayload(data,{enrollments:[]});
}
export async function employeeAssets(context: EmployeeContext) {
  const {data,error}=await supabaseAdmin.rpc("employee_assets_snapshot",{p_organisation_id:context.organisationId,p_employee_id:context.employeeId});
  if(error) throw new Error("Assigned assets could not be loaded.");
  return rpcPayload(data,{assignments:[]});
}
export async function employeePayslips(context: EmployeeContext) {
  const {data,error}=await supabaseAdmin.from("hrms_payslips").select("id,payroll_cycle_id,gross_earnings,total_deductions,net_pay,breakdown_json,pdf_url,status,generated_at").eq("employee_id",context.employeeId).in("status",["published","paid"]).order("generated_at",{ascending:false});
  if(error) throw new Error("Published payslips could not be loaded."); return data||[];
}
export async function employeePerformance(context: EmployeeContext) {
  const [goals,reviews]=await Promise.all([
    supabaseAdmin.from("hrms_goals").select("id,title,description,goal_type,cycle_code,status,progress_percent,due_date").eq("organisation_id",context.organisationId).eq("employee_id",context.employeeId).not("status","in",'(draft,archived)').order("due_date",{ascending:true}),
    supabaseAdmin.from("hrms_performance_reviews").select("id,status,overall_rating,summary_comments,submitted_at,approved_at").eq("organisation_id",context.organisationId).eq("employee_id",context.employeeId).in("status",["published","approved","completed"]).order("approved_at",{ascending:false})
  ]);
  if(goals.error||reviews.error) throw new Error("Published performance records could not be loaded.");
  return {goals:goals.data||[],reviews:reviews.data||[]};
}
