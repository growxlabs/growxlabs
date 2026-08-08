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
  const { data } = await supabaseAdmin.schema("notifications").from("notifications").select("id,template_key,payload,created_at,read_at").eq("organisation_id", context.organisationId).eq("recipient_user_id", context.authUserId).order("created_at", { ascending: false }).limit(limit);
  return data || [];
}
export async function employeeDocuments(context: EmployeeContext) {
  const { data } = await supabaseAdmin.schema("documents").from("documents").select("id,name,status,created_at,category_id").eq("organisation_id", context.organisationId).eq("owner_entity_type", "employee").eq("owner_entity_id", context.employeeId).eq("status", "active").is("deleted_at", null).order("created_at", { ascending: false });
  return data || [];
}
