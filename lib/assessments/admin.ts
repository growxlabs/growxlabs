import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function transitionReview(assessmentId:string,reviewerId:string,action:"start_review"|"request_information"|"complete_review"|"reopen",payload:Record<string,unknown>={}){const {error}=await supabaseAdmin.rpc("transition_assessment_review",{p_assessment_id:assessmentId,p_reviewer_id:reviewerId,p_action:action,p_payload:payload});if(error)throw new Error(`Assessment review failed: ${error.message}`);}
