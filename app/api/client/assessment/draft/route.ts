import { draftSchema } from "@/lib/assessments/request-schema";
import { saveDraft } from "@/lib/assessments/mutations";
import { assessmentErrorResponse,getClientAssessment,requireClientContext } from "@/lib/assessments/server";
export async function PATCH(request:Request){try{const context=await requireClientContext();const parsed=draftSchema.safeParse(await request.json());if(!parsed.success)return Response.json({error:"Invalid draft payload.",details:parsed.error.flatten()},{status:400});const assessment=await getClientAssessment(context);if(!assessment)return Response.json({error:"Start the assessment first."},{status:404});return Response.json(await saveDraft(assessment,context.userId,parsed.data));}catch(error){return assessmentErrorResponse(error);}}
