import "server-only";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const DISCOVERY_STATUSES = ["draft","scheduled","confirmed","in_progress","completed","information_required","follow_up_required","closed","cancelled"] as const;
export const statusLabel = (status: string) => ({ draft:"Draft", scheduled:"Scheduled", confirmed:"Confirmed", in_progress:"In Progress", completed:"Meeting Completed", information_required:"Additional Information Required", follow_up_required:"Follow-Up Required", closed:"Discovery Complete", cancelled:"Cancelled" } as Record<string,string>)[status] || "Draft";

export class DiscoveryHttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function requireDiscoveryAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new DiscoveryHttpError(401,"Authentication required.");
  if (!["ADMIN","CO_ADMIN"].includes(session.user.role)) throw new DiscoveryHttpError(403,"Discovery administration permission is required.");
  return { userId: session.user.id, role: session.user.role };
}
export function discoveryError(error: unknown) { return Response.json({ error: error instanceof Error ? error.message : "Discovery request failed." }, { status: error instanceof DiscoveryHttpError ? error.status : 500 }); }

export async function createMeeting(input: Record<string, unknown>, userId: string) {
  const assessmentId = String(input.assessmentId || "");
  if (!assessmentId) throw new DiscoveryHttpError(400,"Assessment is required.");
  const { data: assessment, error: assessmentError } = await supabaseAdmin.from("client_assessments").select("id,status,client_id,company_id,lead_id,deal_id,assessment_number,assessment_answers(question_key,value)").eq("id",assessmentId).maybeSingle();
  if (assessmentError) throw new Error(assessmentError.message);
  if (!assessment) throw new DiscoveryHttpError(404,"Assessment not found.");
  if (!["submitted","under_review","review_complete","more_information_required"].includes(String(assessment.status))) throw new DiscoveryHttpError(409,"The assessment must be submitted before scheduling discovery.");
  const { data: review } = await supabaseAdmin.from("assessment_reviews").select("status").eq("assessment_id",assessmentId).maybeSingle();
  if (!review || !["in_progress","complete"].includes(String(review.status))) throw new DiscoveryHttpError(409,"Complete or start the assessment review before scheduling discovery.");
  const { data: existing } = await supabaseAdmin.from("discovery_meetings").select("id,meeting_number").eq("assessment_id",assessmentId).not("status","in","(closed,cancelled)").maybeSingle();
  if (existing) return existing;
  const answers = Array.isArray(assessment.assessment_answers) ? assessment.assessment_answers as {question_key:string;value:unknown}[] : [];
  const answer = (key: string) => answers.find((item) => item.question_key === key)?.value;
  const agenda = ["Introductions and meeting objective","Business model and current priorities","Highest-priority business problem","Current workflow and operational bottlenecks","Existing systems and data sources","AI and automation opportunities","Commercial expectations and timeline","Decisions and next steps"].map((title, index) => ({ order:index+1, title, source:"assessment", draft:true }));
  const payload = { assessment_id:assessment.id, client_id:assessment.client_id, company_id:assessment.company_id, lead_id:assessment.lead_id, deal_id:assessment.deal_id, meeting_type:String(input.meetingType || "initial_discovery"), title:String(input.title || "Business Discovery Meeting"), status:"draft", agenda, assigned_consultant_id:input.assignedConsultantId || null, created_by:userId };
  const { data, error } = await supabaseAdmin.from("discovery_meetings").insert(payload).select("*").single();
  if (error) throw new Error(error.message);
  await supabaseAdmin.from("discovery_activity").insert({ meeting_id:data.id,actor_id:userId,actor_type:"admin",event_type:"meeting_created",metadata:{assessmentNumber:assessment.assessment_number || null} });
  return data;
}
