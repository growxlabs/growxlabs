import "server-only";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { AssessmentAnswerValue, AssessmentOption, AssessmentQuestion, AssessmentSection, AssessmentTemplate, ClientAssessment } from "@/types/assessment";

type ClientContext = { userId: string; clientId: string; companyId: string | null; leadId: string | null; dealId: string | null };
type DbRecord = Record<string, unknown>;
const record = (value: unknown): DbRecord => value && typeof value === "object" && !Array.isArray(value) ? value as DbRecord : {};
const list = (value: unknown): DbRecord[] => Array.isArray(value) ? value.map(record) : [];
const text = (value: unknown) => typeof value === "string" ? value : "";
const nullableText = (value: unknown) => typeof value === "string" ? value : null;
const integer = (value: unknown) => typeof value === "number" ? value : Number(value) || 0;
const jsonRecord = (value: unknown) => record(value);

export async function requireClientContext(): Promise<ClientContext> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) throw new AssessmentHttpError(401, "Authentication required.");
  if (session.user.role !== "CLIENT") throw new AssessmentHttpError(403, "A client account is required.");
  const { data, error } = await supabaseAdmin.from("client_profiles").select("id,user_id,company_id,lead_id,deal_id").eq("user_id", session.user.id).maybeSingle();
  if (error) throw new Error(`Unable to resolve client ownership: ${error.message}`);
  if (!data) throw new AssessmentHttpError(403, "Your client account has not been linked. Contact GrowXLabs support.");
  return { userId: session.user.id, clientId: data.id, companyId: data.company_id, leadId: data.lead_id, dealId: data.deal_id };
}

export async function requireAssessmentAdmin() {
  const session=await getServerSession(authOptions); if(!session?.user?.id)throw new AssessmentHttpError(401,"Authentication required.");
  if(!["ADMIN","CO_ADMIN"].includes(session.user.role))throw new AssessmentHttpError(403,"Assessment administration permission is required.");
  return {userId:session.user.id,role:session.user.role};
}

export class AssessmentHttpError extends Error { constructor(public status: number, message: string) { super(message); } }

export async function loadPublishedTemplate(): Promise<AssessmentTemplate> {
  const { data, error } = await supabaseAdmin.from("assessment_templates").select("id,name,slug,description,version,status,assessment_sections(id,section_key,title,description,position,is_required,config,assessment_questions(id,question_key,label,description,field_type,placeholder,help_text,position,is_required,validation,visibility_rules,config,assessment_question_options(id,label,value,position,metadata)))").eq("slug", "business-discovery-consulting").eq("status", "published").order("version", { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error(`Unable to load assessment template: ${error.message}`);
  if (!data) throw new AssessmentHttpError(503, "The assessment template is not published yet.");
  return mapTemplate(record(data));
}

function mapTemplate(row: DbRecord): AssessmentTemplate {
  const sections: AssessmentSection[] = list(row.assessment_sections).map((section) => ({
    id: text(section.id), key: text(section.section_key), title: text(section.title), description: nullableText(section.description), position: integer(section.position), required: Boolean(section.is_required), config: jsonRecord(section.config),
    questions: list(section.assessment_questions).map((question): AssessmentQuestion => ({
      id: text(question.id), key: text(question.question_key), label: text(question.label), description: nullableText(question.description), fieldType: text(question.field_type) as AssessmentQuestion["fieldType"], placeholder: nullableText(question.placeholder), helpText: nullableText(question.help_text), position: integer(question.position), required: Boolean(question.is_required), validation: jsonRecord(question.validation), visibilityRules: Array.isArray(question.visibility_rules) ? question.visibility_rules as AssessmentQuestion["visibilityRules"] : [], config: jsonRecord(question.config),
      options: list(question.assessment_question_options).map((option): AssessmentOption => ({ id: text(option.id), label: text(option.label), value: text(option.value), position: integer(option.position), metadata: jsonRecord(option.metadata) })).sort((a,b) => a.position-b.position),
    })).sort((a,b) => a.position-b.position),
  })).sort((a,b) => a.position-b.position);
  return { id: text(row.id), name: text(row.name), slug: text(row.slug), description: nullableText(row.description), version: integer(row.version), status: text(row.status) as AssessmentTemplate["status"], sections };
}

export async function getClientAssessment(context: ClientContext): Promise<ClientAssessment | null> {
  const { data, error } = await supabaseAdmin.from("client_assessments").select("*,assessment_answers(question_key,value,updated_at),assessment_files(id,question_id,question_key,file_name,file_type,file_size,created_at),assessment_information_requests(id,message,requested_question_keys,requested_section_keys,status,due_at,created_at)").eq("user_id",context.userId).neq("status","archived").order("created_at",{ascending:false}).limit(1).maybeSingle();
  if (error) throw new Error(`Unable to load assessment: ${error.message}`);
  if (!data) return null;
  return mapStoredAssessment(data);
}

export function mapStoredAssessment(data: unknown): ClientAssessment {
  const row=record(data); const answers: Record<string,AssessmentAnswerValue>={}; for(const answer of list(row.assessment_answers)) answers[text(answer.question_key)]=answer.value as AssessmentAnswerValue;
  const snapshot=record(row.template_snapshot); const template=(Array.isArray(snapshot.sections)?snapshot:mapTemplate(snapshot)) as AssessmentTemplate;
  return { id:text(row.id),assessmentNumber:nullableText(row.assessment_number)||text(row.id),templateId:text(row.template_id),templateVersion:integer(row.template_version),clientId:text(row.client_id),companyId:nullableText(row.company_id),leadId:nullableText(row.lead_id),dealId:nullableText(row.deal_id),status:text(row.status) as ClientAssessment["status"],currentSection:integer(row.current_section),completedSections:Array.isArray(row.completed_sections)?row.completed_sections.map(text):[],completionPercentage:integer(row.completion_percentage),template,answers,
    files:list(row.assessment_files).map((file)=>({id:text(file.id),questionId:nullableText(file.question_id),questionKey:nullableText(file.question_key),fileName:text(file.file_name),fileType:nullableText(file.file_type),fileSize:file.file_size===null?null:integer(file.file_size),createdAt:text(file.created_at)})),
    informationRequests:list(row.assessment_information_requests).map((request)=>({id:text(request.id),message:text(request.message),requestedQuestionKeys:Array.isArray(request.requested_question_keys)?request.requested_question_keys.map(text):[],requestedSectionKeys:Array.isArray(request.requested_section_keys)?request.requested_section_keys.map(text):[],status:text(request.status) as "open"|"answered"|"resolved"|"cancelled",dueAt:nullableText(request.due_at),createdAt:text(request.created_at)})),
    startedAt:nullableText(row.started_at),submittedAt:nullableText(row.submitted_at),updatedAt:text(row.updated_at) };
}

export async function startClientAssessment(context: ClientContext) {
  const existing=await getClientAssessment(context); if(existing) return existing;
  if(!context.companyId)throw new AssessmentHttpError(409,"Your client account must be linked to a company before the assessment can start.");
  if(!context.dealId&&!context.leadId)throw new AssessmentHttpError(409,"Your client account must be linked to a qualified lead or deal before the assessment can start.");
  const template=await loadPublishedTemplate();
  const { error }=await supabaseAdmin.rpc("start_client_assessment",{p_user_id:context.userId,p_client_id:context.clientId,p_company_id:context.companyId,p_lead_id:context.leadId,p_deal_id:context.dealId,p_template_id:template.id,p_template_version:template.version,p_template_snapshot:template});
  if(error) throw new Error(`Unable to start assessment: ${error.message}`);
  const created=await getClientAssessment(context); if(!created) throw new Error("Assessment was not created."); return created;
}

export function assessmentErrorResponse(error: unknown) { const status=error instanceof AssessmentHttpError?error.status:500; return Response.json({error:error instanceof Error?error.message:"Assessment request failed."},{status}); }
