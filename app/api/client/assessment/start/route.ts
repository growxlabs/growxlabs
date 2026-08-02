import { assessmentErrorResponse, requireClientContext, startClientAssessment } from "@/lib/assessments/server";
export async function POST(){try{const context=await requireClientContext();return Response.json({assessment:await startClientAssessment(context)},{status:201});}catch(error){return assessmentErrorResponse(error);}}
