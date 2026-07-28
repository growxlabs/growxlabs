import { supabaseAdmin } from "@/lib/supabase/admin";
import { HRMSError, type HRMSContext } from "@/lib/hrms/shared/context";

export const leaveDb=supabaseAdmin.schema("leave");
const people=supabaseAdmin.schema("people");
export function unwrapLeave<T>(data:T|null,error:{message:string}|null){if(error)throw new HRMSError(422,"database_error",error.message);return data as T}
export async function leaveEmployee(context:HRMSContext){const result=await people.from("employees").select("id,employee_number,first_name,last_name").eq("organisation_id",context.organisationId).eq("user_id",context.userId).is("deleted_at",null).single();return unwrapLeave(result.data,result.error)}
export async function leaveEligibility(context:HRMSContext,date:string){
  const employee=await leaveEmployee(context);
  const employment=await people.from("employment_records").select("department_id").eq("organisation_id",context.organisationId).eq("employee_id",employee.id).is("valid_to",null).single();
  const departmentId=unwrapLeave(employment.data,employment.error).department_id;
  const assignment=await leaveDb.from("policy_assignments").select("policy_id").eq("organisation_id",context.organisationId).or(`employee_id.eq.${employee.id},department_id.eq.${departmentId}`).lte("effective_from",date).or(`effective_to.is.null,effective_to.gte.${date}`).order("employee_id",{ascending:false,nullsFirst:false}).order("effective_from",{ascending:false}).limit(1).single();
  const policyId=unwrapLeave(assignment.data,assignment.error).policy_id;
  const version=await leaveDb.from("policy_versions").select("*").eq("organisation_id",context.organisationId).eq("policy_id",policyId).lte("effective_from",date).or(`effective_to.is.null,effective_to.gte.${date}`).order("version",{ascending:false}).limit(1).single();
  const policyVersion=unwrapLeave(version.data,version.error);
  const rules=await leaveDb.from("policy_type_rules").select("*,types(*)").eq("organisation_id",context.organisationId).eq("policy_version_id",policyVersion.id);
  return{policyVersion,rules:unwrapLeave(rules.data,rules.error)};
}
export async function createLeaveRequest(context:HRMSContext,input:{leaveTypeId:string;fromDate:string;toDate:string;reason:string;attachmentDocumentIds?:string[];days:unknown[];totalQuantity:number;policyVersionId:string}){const result=await leaveDb.rpc("create_request",{p_organisation_id:context.organisationId,p_actor_user_id:context.userId,p_leave_type_id:input.leaveTypeId,p_policy_version_id:input.policyVersionId,p_from_date:input.fromDate,p_to_date:input.toDate,p_reason:input.reason,p_attachment_document_ids:input.attachmentDocumentIds||[],p_days:input.days,p_total_quantity:input.totalQuantity,p_request_id:context.requestId});return unwrapLeave(result.data,result.error)}
export async function decideLeave(context:HRMSContext,id:string,input:{decision:string;comment?:string}){const result=await leaveDb.rpc("decide_request",{p_organisation_id:context.organisationId,p_actor_user_id:context.userId,p_leave_request_id:id,p_decision:input.decision,p_comment:input.comment||"",p_request_id:context.requestId});return unwrapLeave(result.data,result.error)}
export async function closeLeave(context:HRMSContext,id:string,action:"withdraw"|"cancel"){const result=await leaveDb.rpc("close_request",{p_organisation_id:context.organisationId,p_actor_user_id:context.userId,p_leave_request_id:id,p_action:action,p_request_id:context.requestId});return unwrapLeave(result.data,result.error)}
