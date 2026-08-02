import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateAssessment, validateSection } from "@/lib/assessments/validation";
import type { AssessmentAnswerValue, ClientAssessment } from "@/types/assessment";

export type DraftInput = { answers: Record<string, AssessmentAnswerValue>; currentSection: number };

function snapshots(assessment: ClientAssessment, answers: Record<string, AssessmentAnswerValue>) {
  return Object.entries(answers).flatMap(([questionKey,value]) => {
    for(const section of assessment.template.sections){ const question=section.questions.find((item)=>item.key===questionKey); if(question) return [{questionKey,value,sectionSnapshot:{key:section.key,title:section.title,position:section.position},questionSnapshot:question}]; }
    return [];
  });
}

export function calculateProgress(assessment: ClientAssessment, answers: Record<string, AssessmentAnswerValue>) {
  const completed=assessment.template.sections.filter((section)=>validateSection(section,answers).length===0).map((section)=>section.key);
  return {completedSections:completed,completionPercentage:Math.round((completed.length/assessment.template.sections.length)*100)};
}

export async function saveDraft(assessment: ClientAssessment,userId:string,input:DraftInput){
  if(!["not_started","draft","more_information_required"].includes(assessment.status)) throw new Error("Submitted assessments are locked.");
  const allowedKeys=new Set(assessment.template.sections.flatMap((section)=>section.questions.map((question)=>question.key))); if(Object.keys(input.answers).some((key)=>!allowedKeys.has(key)))throw new Error("Draft contains an unknown assessment question.");
  if(assessment.status==="more_information_required"){
    const requests=assessment.informationRequests.filter((request)=>request.status==="open"); const reopenedSections=new Set(requests.flatMap((request)=>request.requestedSectionKeys)); const reopenedKeys=new Set(requests.flatMap((request)=>request.requestedQuestionKeys));
    for(const section of assessment.template.sections)if(reopenedSections.has(section.key))for(const question of section.questions)reopenedKeys.add(question.key);
    if(Object.keys(input.answers).some((key)=>!reopenedKeys.has(key)))throw new Error("Only questions reopened by the consulting team may be changed.");
  }
  const answers={...assessment.answers,...input.answers}; const progress=calculateProgress(assessment,answers);
  const {data,error}=await supabaseAdmin.rpc("save_client_assessment_draft",{p_assessment_id:assessment.id,p_user_id:userId,p_answers:snapshots(assessment,input.answers),p_current_section:Math.max(1,Math.min(input.currentSection,assessment.template.sections.length)),p_completed_sections:progress.completedSections,p_completion_percentage:progress.completionPercentage});
  if(error) throw new Error(`Unable to save draft: ${error.message}`); return {savedAt:data,...progress};
}

export async function completeSection(assessment:ClientAssessment,userId:string,sectionKey:string,answers:Record<string,AssessmentAnswerValue>){
  const merged={...assessment.answers,...answers}; const section=assessment.template.sections.find((item)=>item.key===sectionKey); if(!section) throw new Error("Assessment section not found.");
  const errors=validateSection(section,merged); if(errors.length) return {ok:false,errors};
  await saveDraft(assessment,userId,{answers,currentSection:Math.min(section.position+1,assessment.template.sections.length)}); return {ok:true,errors:[]};
}

export async function submitAssessment(assessment:ClientAssessment,userId:string,answers:Record<string,AssessmentAnswerValue>){
  await saveDraft(assessment,userId,{answers,currentSection:assessment.template.sections.length}); const merged={...assessment.answers,...answers}; const errors=validateAssessment(assessment.template,merged); if(errors.length) return {ok:false,errors};
  const signature=String(merged.signature_name||"").trim(); const consent=merged.consent===true||merged.consent==="yes"; if(!signature||!consent) return {ok:false,errors:[...(!signature?[{questionKey:"signature_name",message:"Digital signature is required."}]:[]),...(!consent?[{questionKey:"consent",message:"Consent is required."}]:[])]};
  const {data,error}=await supabaseAdmin.rpc("submit_client_assessment",{p_assessment_id:assessment.id,p_user_id:userId}); if(error) throw new Error(`Unable to submit assessment: ${error.message}`); return {ok:true,submittedAt:data,errors:[]};
}
