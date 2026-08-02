import { assessmentErrorResponse, getClientAssessment, requireClientContext } from "@/lib/assessments/server";
export async function GET(){try{const context=await requireClientContext();return Response.json({assessment:await getClientAssessment(context)});}catch(error){return assessmentErrorResponse(error);}}
