import "server-only";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { publishClientActivity,recordAuditEvent } from "@/lib/activity/events";
import type { ClientOnboarding,OnboardingStatus } from "@/types/onboarding";

type Row=Record<string,unknown>;const row=(v:unknown):Row=>v&&typeof v==="object"&&!Array.isArray(v)?v as Row:{};const rows=(v:unknown):Row[]=>Array.isArray(v)?v.map(row):[];const str=(v:unknown)=>typeof v==="string"?v:"";const nullable=(v:unknown)=>typeof v==="string"?v:null;const obj=(v:unknown):Record<string,unknown>=>row(v);
export class OnboardingHttpError extends Error{constructor(public status:number,message:string){super(message)}}
export async function requireOnboardingClient(){const session=await getServerSession(authOptions);if(!session?.user?.id||session.user.role!=="CLIENT")throw new OnboardingHttpError(403,"A client account is required.");const result=await supabaseAdmin.from("client_profiles").select("id,user_id,company_id,lead_id,deal_id").eq("user_id",session.user.id).maybeSingle();if(result.error)throw new Error(result.error.message);if(!result.data)throw new OnboardingHttpError(403,"Client account is not linked.");return{userId:session.user.id,clientId:result.data.id,companyId:result.data.company_id as string|null,dealId:result.data.deal_id as string|null};}
export async function requireOnboardingAdmin(){const session=await getServerSession(authOptions);if(!session?.user?.id)throw new OnboardingHttpError(401,"Authentication required.");if(!["ADMIN","CO_ADMIN"].includes(session.user.role))throw new OnboardingHttpError(403,"Onboarding administration permission is required.");return{userId:session.user.id};}
export function onboardingError(error:unknown){return Response.json({error:error instanceof Error?error.message:"Onboarding request failed."},{status:error instanceof OnboardingHttpError?error.status:500});}
const select="*,onboarding_requirements(*),onboarding_access_requests(*),onboarding_documents(*),onboarding_information_requests(*),onboarding_readiness_checks(*)";
export async function getClientOnboarding(context:Awaited<ReturnType<typeof requireOnboardingClient>>){const result=await supabaseAdmin.from("client_onboardings").select(select).eq("user_id",context.userId).order("created_at",{ascending:false}).limit(1).maybeSingle();if(result.error)throw new Error(result.error.message);return result.data?mapOnboarding(result.data):null;}
export async function getAdminOnboarding(id:string){const result=await supabaseAdmin.from("client_onboardings").select(select).eq("id",id).maybeSingle();if(result.error)throw new Error(result.error.message);if(!result.data)throw new OnboardingHttpError(404,"Onboarding was not found.");return mapOnboarding(result.data);}
export function mapOnboarding(value:unknown):ClientOnboarding{const v=row(value);return{id:str(v.id),onboardingNumber:str(v.onboarding_number),clientId:str(v.client_id),companyId:nullable(v.company_id),assessmentId:nullable(v.assessment_id),dealId:nullable(v.deal_id),proposalId:nullable(v.proposal_id),agreementId:nullable(v.agreement_id),scopeId:nullable(v.scope_id),invoiceId:nullable(v.invoice_id),projectId:nullable(v.project_id),ownerId:nullable(v.owner_id),status:str(v.status) as OnboardingStatus,completionPercentage:Number(v.completion_percentage)||0,formData:obj(v.form_data),applicableSections:Array.isArray(v.applicable_sections)?v.applicable_sections.map(str):[],confirmation:obj(v.confirmation),createdAt:str(v.created_at),invitedAt:nullable(v.invited_at),startedAt:nullable(v.started_at),submittedAt:nullable(v.submitted_at),approvedAt:nullable(v.approved_at),updatedAt:str(v.updated_at),requirements:rows(v.onboarding_requirements).map(x=>({id:str(x.id),requirementKey:str(x.requirement_key),sectionKey:str(x.section_key),name:str(x.name),description:nullable(x.description),requirementType:str(x.requirement_type),required:Boolean(x.required),position:Number(x.position)||0,status:str(x.status),config:obj(x.config),adminNotes:nullable(x.admin_notes)})).sort((a,b)=>a.position-b.position),accessRequests:rows(v.onboarding_access_requests).map(x=>({id:str(x.id),serviceName:str(x.service_name),required:Boolean(x.required),reason:nullable(x.reason),instructions:nullable(x.instructions),status:str(x.status),assignedContact:obj(x.assigned_contact),requestedAt:nullable(x.requested_at),grantedAt:nullable(x.granted_at),verifiedAt:nullable(x.verified_at),adminNotes:nullable(x.admin_notes)})),documents:rows(v.onboarding_documents).map(x=>({id:str(x.id),category:str(x.category),fileName:str(x.file_name),mimeType:nullable(x.mime_type),sizeBytes:x.size_bytes===null?null:Number(x.size_bytes),version:Number(x.version)||1,verificationStatus:str(x.verification_status),adminNote:nullable(x.admin_note),createdAt:str(x.created_at)})),informationRequests:rows(v.onboarding_information_requests).map(x=>({id:str(x.id),reason:str(x.reason),status:str(x.status),requestedItems:Array.isArray(x.requested_items)?x.requested_items:[],dueAt:nullable(x.due_at),createdAt:str(x.created_at)})),readinessChecks:rows(v.onboarding_readiness_checks).map(x=>({id:str(x.id),checkKey:str(x.check_key),label:str(x.label),complete:Boolean(x.complete),note:nullable(x.note),position:Number(x.position)||0})).sort((a,b)=>a.position-b.position)}}
async function resolveClientIdentifier(reference: string) {
  const trimmed = reference.trim();
  if (!trimmed) throw new OnboardingHttpError(400, "Client partner or agreement reference is required.");
  let clientId = trimmed;
  let agreementId: string | null = null;
  let proposalId: string | null = null;
  let scopeId: string | null = null;
  let invoiceId: string | null = null;
  if (trimmed.startsWith("GXL-MSA-") || trimmed.includes("MSA")) {
    const agr = await supabaseAdmin.from("master_service_agreements").select("id,client_id,proposal_id,scope_of_work_id").eq("agreement_number", trimmed).maybeSingle();
    if (agr.data?.client_id) {
      clientId = agr.data.client_id;
      agreementId = agr.data.id;
      proposalId = agr.data.proposal_id;
      scopeId = agr.data.scope_of_work_id;
    }
  }
  if (trimmed.startsWith("GXL-INV-") || trimmed.includes("INV")) {
    const inv = await supabaseAdmin.from("consulting_advance_invoices").select("id,client_id,agreement_id,proposal_id,scope_id").eq("invoice_number", trimmed).maybeSingle();
    if (inv.data?.client_id) {
      clientId = inv.data.client_id;
      invoiceId = inv.data.id;
      agreementId = inv.data.agreement_id;
      proposalId = inv.data.proposal_id;
      scopeId = inv.data.scope_id;
    }
  }
  if (trimmed.includes("@")) {
    const user = await supabaseAdmin.from("users").select("id").ilike("email", trimmed).maybeSingle();
    if (user.data?.id) {
      const prof = await supabaseAdmin.from("client_profiles").select("id").eq("user_id", user.data.id).maybeSingle();
      if (prof.data?.id) clientId = prof.data.id;
    }
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId);
  if (!isUuid) {
    const comp = await supabaseAdmin.from("companies").select("id").ilike("name", `%${trimmed}%`).maybeSingle();
    if (comp.data?.id) {
      const prof = await supabaseAdmin.from("client_profiles").select("id").eq("company_id", comp.data.id).maybeSingle();
      if (prof.data?.id) clientId = prof.data.id;
    }
  }
  const profile = await supabaseAdmin.from("client_profiles").select("id,user_id,company_id,deal_id").eq("id", clientId).maybeSingle();
  if (profile.error) throw new Error(profile.error.message);
  if (!profile.data) {
    throw new OnboardingHttpError(404, `Client profile not found for reference "${trimmed}". Please select a valid client partner.`);
  }
  if (!agreementId) {
    const latestAgr = await supabaseAdmin.from("master_service_agreements").select("id,agreement_number,proposal_id,scope_of_work_id").eq("client_id", clientId).not("status", "eq", "archived").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (latestAgr.data) {
      agreementId = latestAgr.data.id;
      proposalId = latestAgr.data.proposal_id;
      scopeId = latestAgr.data.scope_of_work_id;
    }
  }
  if (!invoiceId) {
    const latestInv = await supabaseAdmin.from("consulting_advance_invoices").select("id").eq("client_id", clientId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (latestInv.data) invoiceId = latestInv.data.id;
  }
  return { clientId, profile: profile.data, agreementId, proposalId, scopeId, invoiceId };
}

export async function createOnboarding(input:Record<string,unknown>,actorId:string){
  const rawReference = str(input.clientId || input.reference || input.agreementNumber || "");
  if (!rawReference) throw new OnboardingHttpError(400, "Client or agreement reference is required.");
  const resolved = await resolveClientIdentifier(rawReference);
  const clientId = resolved.clientId;
  const profile = { data: resolved.profile };
  const assessment=await supabaseAdmin.from("client_assessments").select("id,assessment_answers(question_key,value)").eq("client_id",clientId).neq("status","archived").order("created_at",{ascending:false}).limit(1).maybeSingle();if(assessment.error)throw new Error(assessment.error.message);const answers=Object.fromEntries(rows(assessment.data?.assessment_answers).map(a=>[str(a.question_key),a.value]));const formData={company_details:{company_name:answers.business_name||"",legal_entity_name:answers.legal_entity_name||"",primary_contact:answers.primary_contact||"",designation:answers.designation||"",email:answers.business_email||"",phone:answers.phone||"",website:answers.website||"",headquarters:answers.headquarters||"",operating_regions:answers.operating_regions||""},billing_legal:{registered_legal_name:answers.legal_entity_name||""},project_contacts:[],assets:{},digital_properties:{website:answers.website||"",properties:answers.digital_presence||answers.ai_data_locations||[]}};
  const created=await supabaseAdmin.from("client_onboardings").insert({onboarding_number:"",client_id:clientId,user_id:profile.data.user_id,company_id:profile.data.company_id,assessment_id:assessment.data?.id||null,deal_id:profile.data.deal_id,proposal_id:(input.proposalId as string) || resolved.proposalId,agreement_id:(input.agreementId as string) || resolved.agreementId,scope_id:(input.scopeId as string) || resolved.scopeId,invoice_id:(input.invoiceId as string) || resolved.invoiceId,project_id:input.projectId||null,owner_id:input.ownerId||actorId,status:"not_started",form_data:formData,applicable_sections:input.applicableSections||undefined}).select("id,onboarding_number,client_id,company_id").single();if(created.error)throw new Error(created.error.message);const definitions=await supabaseAdmin.from("onboarding_requirement_definitions").select("*").eq("active",true);if(definitions.error)throw new Error(definitions.error.message);const selected=new Set(Array.isArray(input.requirementKeys)?input.requirementKeys.map(str):["company_details","billing_legal","project_contacts","final_confirmation"]);const requirements=(definitions.data||[]).filter(d=>selected.has(d.requirement_key)).map((d,index)=>({onboarding_id:created.data.id,definition_id:d.id,requirement_key:d.requirement_key,section_key:d.requirement_key,name:d.name,description:d.description,requirement_type:d.requirement_type,required:d.default_required,position:index+1,config:d.config}));if(requirements.length){const added=await supabaseAdmin.from("onboarding_requirements").insert(requirements);if(added.error)throw new Error(added.error.message);}const checks=["Required information received","Required documents received","Critical access granted","Access verified","Commercial documents completed","Billing information available","Project contacts confirmed","Scope / engagement linked","Internal owner assigned"];const checkResult=await supabaseAdmin.from("onboarding_readiness_checks").insert(checks.map((label,index)=>({onboarding_id:created.data.id,check_key:label.toLowerCase().replace(/[^a-z0-9]+/g,"_"),label,position:index+1})));if(checkResult.error)throw new Error(checkResult.error.message);await recordAuditEvent({actorId,action:"onboarding.created",resourceType:"client_onboarding",resourceId:created.data.id,clientId,companyId:created.data.company_id,metadata:{onboardingNumber:created.data.onboarding_number}});return getAdminOnboarding(created.data.id);}
export async function recordOnboardingActivity(onboarding:ClientOnboarding,actorId:string,eventType:string,audience:"client"|"admin"|"audit"="admin",metadata:Record<string,unknown>={}){await supabaseAdmin.from("onboarding_activity").insert({onboarding_id:onboarding.id,actor_id:actorId,actor_type:audience==="client"?"client":"staff",event_type:eventType,audience,metadata});if(audience==="client")await publishClientActivity({clientId:onboarding.clientId,companyId:onboarding.companyId,activityType:eventType,title:"Client Onboarding",description:eventType.replaceAll("_"," "),businessNumber:onboarding.onboardingNumber,href:"/client/onboarding",metadata});}
