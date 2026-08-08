import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ConvertCandidateInput, WorkspaceStatus } from "./types";

export class EmployeeProvisioningError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); }
}
type ConversionResult = { employeeId: string; identityId: string; roleId: string; onboardingStateId: string; workspaceStatus: WorkspaceStatus; existing: boolean; activationEmail: "sent"|"pending" };
function safeDatabaseFailure(code:string){return new EmployeeProvisioningError(code,"Employee provisioning could not be completed safely",500)}
function escapeHtml(value:string){return value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]!))}
async function ensureActivationInvitation(input:{organisationId:string;userId:string;identityId:string;email:string;name:string}){
  const open=await supabaseAdmin.schema("identity").from("invitations").select("id,delivered_at").eq("organisation_id",input.organisationId).eq("user_id",input.userId).is("accepted_at",null).gt("expires_at",new Date().toISOString()).order("created_at",{ascending:false}).limit(1).maybeSingle();
  if(open.data?.delivered_at)return"sent" as const;
  if(open.data)await supabaseAdmin.schema("identity").from("invitations").update({expires_at:new Date().toISOString(),delivery_error:"superseded_for_safe_retry"}).eq("id",open.data.id).eq("organisation_id",input.organisationId);
  const token=randomBytes(32).toString("base64url"),created=await supabaseAdmin.schema("identity").from("invitations").insert({organisation_id:input.organisationId,user_id:input.userId,token_hash:createHash("sha256").update(token).digest("hex"),expires_at:new Date(Date.now()+72*3600000).toISOString()}).select("id").single();
  if(created.error)throw safeDatabaseFailure("activation_create_failed");
  if(!process.env.RESEND_API_KEY){await supabaseAdmin.schema("identity").from("invitations").update({delivery_error:"email_provider_not_configured"}).eq("id",created.data.id);return"pending" as const}
  const base=(process.env.NEXTAUTH_URL||"https://growxlabs.tech").replace(/\/$/,""),sent=await new Resend(process.env.RESEND_API_KEY).emails.send({from:process.env.RESEND_FROM_EMAIL||"GrowXLabs People <noreply@growxlabs.tech>",to:input.email,subject:"Activate your GrowXLabs employee workspace",html:`<p>Hello ${escapeHtml(input.name)},</p><p>Your GrowXLabs employee workspace is ready for activation.</p><p><a href="${base}/activate/${token}">Activate your employee account</a></p><p>This one-time link expires in 72 hours.</p>`});
  if(sent.error){await supabaseAdmin.schema("identity").from("invitations").update({delivery_error:"email_delivery_failed"}).eq("id",created.data.id);return"pending" as const}
  await supabaseAdmin.schema("identity").from("invitations").update({delivered_at:new Date().toISOString(),delivery_error:null}).eq("id",created.data.id);return"sent" as const;
}

function names(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts.shift() || "Employee", lastName: parts.join(" ") || "-" };
}
async function audit(input: ConvertCandidateInput, action: string, entityType: string, entityId: string, value: Record<string, unknown>) {
  await supabaseAdmin.schema("audit").from("events").insert({ organisation_id: input.organisationId, actor_user_id: input.actorUserId, entity_type: entityType, entity_id: entityId, action, new_value: value, request_id: crypto.randomUUID() });
}

export async function convertCandidateToEmployee(input: ConvertCandidateInput): Promise<ConversionResult> {
  if (!input.departmentId || !input.designationId) throw new EmployeeProvisioningError("employment_structure_required", "Department and designation are required");
  const existing = await supabaseAdmin.schema("recruitment").from("employee_conversions").select("employee_id,identity_id,role_id,onboarding_state_id,employee_identities(workspace_status)").eq("organisation_id", input.organisationId).eq("application_id", input.applicationId).maybeSingle();
  if (existing.data){const identity=await supabaseAdmin.schema("identity").from("employee_identities").select("auth_user_id,email").eq("id",existing.data.identity_id).eq("organisation_id",input.organisationId).single(),employee=await supabaseAdmin.schema("people").from("employees").select("first_name,last_name").eq("id",existing.data.employee_id).eq("organisation_id",input.organisationId).single();if(!identity.data||!employee.data)throw safeDatabaseFailure("conversion_recovery_failed");const activationEmail=await ensureActivationInvitation({organisationId:input.organisationId,userId:identity.data.auth_user_id,identityId:existing.data.identity_id,email:identity.data.email,name:`${employee.data.first_name} ${employee.data.last_name}`.trim()});return { employeeId: existing.data.employee_id, identityId: existing.data.identity_id, roleId: existing.data.role_id, onboardingStateId: existing.data.onboarding_state_id, workspaceStatus: (existing.data.employee_identities as any)?.workspace_status || "pending", existing: true,activationEmail }}

  const { data: application, error: applicationError } = await supabaseAdmin.schema("recruitment").from("careers_applications")
    .select("id,candidate_id,organisation_id,profile,current_stage,status").eq("id", input.applicationId).eq("organisation_id", input.organisationId).maybeSingle();
  if (applicationError || !application) throw new EmployeeProvisioningError("application_not_found", "Candidate application not found", 404);
  if (String(application.current_stage).toLowerCase() !== "hired" && String(application.status).toLowerCase() !== "hired") throw new EmployeeProvisioningError("candidate_not_hired", "Only a hired or offer-accepted candidate can be converted", 409);
  const profile = (application.profile || {}) as Record<string, unknown>;
  const email = String(profile.email || application.candidate_id || "").trim().toLowerCase();
  if (!email.includes("@")) throw new EmployeeProvisioningError("candidate_email_required", "Candidate email is required");
  const fullName = String(profile.full_name || profile.name || email.split("@")[0]);
  const { firstName, lastName } = names(fullName);

  for (const [table, id, label] of [["departments", input.departmentId, "Department"], ["designations", input.designationId, "Designation"]] as const) {
    const { data } = await supabaseAdmin.schema("people").from(table).select("id").eq("id", id).eq("organisation_id", input.organisationId).is("deleted_at", null).maybeSingle();
    if (!data) throw new EmployeeProvisioningError(`${table.slice(0, -1)}_not_found`, `${label} is missing or belongs to another organisation`, 409);
  }
  if (input.managerEmployeeId) {
    const { data } = await supabaseAdmin.schema("people").from("employees").select("id").eq("id", input.managerEmployeeId).eq("organisation_id", input.organisationId).is("deleted_at", null).maybeSingle();
    if (!data) throw new EmployeeProvisioningError("manager_not_found", "Manager is missing or belongs to another organisation", 409);
  }

  let { data: user } = await supabaseAdmin.schema("identity").from("users").select("id,email").eq("organisation_id", input.organisationId).eq("email", email).maybeSingle();
  if (!user) {
    const created = await supabaseAdmin.schema("identity").from("users").insert({ organisation_id: input.organisationId, email, display_name: fullName, status: "invited", invited_at: new Date().toISOString() }).select("id,email").single();
    if (created.error) throw safeDatabaseFailure("identity_user_failed"); user = created.data;
  }
  let { data: employee } = await supabaseAdmin.schema("people").from("employees").select("id,user_id").eq("organisation_id", input.organisationId).eq("user_id", user.id).maybeSingle();
  if (!employee) {
    const created = await supabaseAdmin.schema("people").from("employees").insert({ organisation_id: input.organisationId, user_id: user.id, employee_number: input.employeeCode.trim(), first_name: firstName, last_name: lastName }).select("id,user_id").single();
    if (created.error) throw new EmployeeProvisioningError("employee_create_failed",created.error.code==="23505"?"Employee code or identity already exists":"Employee provisioning could not be completed safely",created.error.code === "23505" ? 409 : 500); employee = created.data;
    const employment = await supabaseAdmin.schema("people").from("employment_records").insert({ organisation_id: input.organisationId, employee_id: employee.id, department_id: input.departmentId, designation_id: input.designationId, manager_employee_id: input.managerEmployeeId || null, joining_date: input.joiningDate, employment_type: "full_time", status: "active" });
    if (employment.error) throw safeDatabaseFailure("employment_create_failed");
  }
  let { data: identity } = await supabaseAdmin.schema("identity").from("employee_identities").select("id,workspace_status").eq("organisation_id", input.organisationId).eq("employee_id", employee.id).maybeSingle();
  if (!identity) {
    const created = await supabaseAdmin.schema("identity").from("employee_identities").insert({ organisation_id: input.organisationId, auth_user_id: user.id, employee_id: employee.id, email, workspace_status: "pending" }).select("id,workspace_status").single();
    if (created.error) throw safeDatabaseFailure("employee_identity_failed"); identity = created.data;
    await audit(input, "employee_identity_created", "employee_identity", identity.id, { employeeId: employee.id });
  }
  const roleResult = input.roleId ? { data: input.roleId, error: null } : await supabaseAdmin.schema("identity").rpc("ensure_bde_role", { p_organisation_id: input.organisationId });
  if (roleResult.error || !roleResult.data) throw safeDatabaseFailure("role_assignment_failed");
  const roleId = String(roleResult.data);
  const roleCheck = await supabaseAdmin.schema("identity").from("roles").select("id").eq("id", roleId).eq("organisation_id", input.organisationId).maybeSingle();
  if (!roleCheck.data) throw new EmployeeProvisioningError("role_not_found", "Role belongs to another organisation", 409);
  const assignment = await supabaseAdmin.schema("identity").from("user_roles").upsert({ organisation_id: input.organisationId, user_id: user.id, role_id: roleId }, { onConflict: "user_id,role_id", ignoreDuplicates: true });
  if (assignment.error) throw safeDatabaseFailure("role_assignment_failed");
  let { data: onboarding } = await supabaseAdmin.schema("onboarding").from("employee_states").select("id").eq("organisation_id", input.organisationId).eq("employee_id", employee.id).maybeSingle();
  if (!onboarding) {
    const created = await supabaseAdmin.schema("onboarding").from("employee_states").insert({ organisation_id: input.organisationId, employee_id: employee.id, identity_id: identity.id }).select("id").single();
    if (created.error) throw safeDatabaseFailure("onboarding_failed"); onboarding = created.data;
  }
  const conversion = await supabaseAdmin.schema("recruitment").from("employee_conversions").upsert({ organisation_id: input.organisationId, application_id: input.applicationId, candidate_id: application.candidate_id, employee_id: employee.id, identity_id: identity.id, role_id: roleId, onboarding_state_id: onboarding.id, converted_by: input.actorUserId }, { onConflict: "organisation_id,application_id" });
  if (conversion.error) throw safeDatabaseFailure("conversion_record_failed");
  await audit(input, "employee_role_assigned", "employee", employee.id, { roleId });
  await audit(input, "candidate_converted_to_employee", "candidate", input.applicationId, { employeeId: employee.id, identityId: identity.id });
  const activationEmail=await ensureActivationInvitation({organisationId:input.organisationId,userId:user.id,identityId:identity.id,email,name:fullName});
  return { employeeId: employee.id, identityId: identity.id, roleId, onboardingStateId: onboarding.id, workspaceStatus: identity.workspace_status as WorkspaceStatus, existing: false,activationEmail };
}

export async function provisionEmployee(identityId: string, organisationId: string, actorUserId: string) {
  const { data, error } = await supabaseAdmin.schema("identity").from("employee_identities").update({ workspace_status: "active", provisioning_error: null, provisioned_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", identityId).eq("organisation_id", organisationId).neq("workspace_status", "suspended").select("id,employee_id,workspace_status").single();
  if (error) throw safeDatabaseFailure("provisioning_failed");
  await supabaseAdmin.schema("audit").from("events").insert({ organisation_id: organisationId, actor_user_id: actorUserId, entity_type: "employee_identity", entity_id: identityId, action: "employee_workspace_provisioned", new_value: { employeeId: data.employee_id, workspaceStatus: data.workspace_status }, request_id: crypto.randomUUID() });
  return data;
}
