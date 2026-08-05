import { z } from "zod";
import { assessmentErrorResponse, requireClientContext } from "@/lib/assessments/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const responseSchema = z.object({ itemId: z.string().uuid(), value: z.unknown(), supportingNote: z.string().max(5000).optional() });

export async function GET(_request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const context = await requireClientContext();
    const { requestId } = await params;
    const select = "id,request_number,assessment_id,status,general_message,due_at,created_at,assessment_information_request_items(*,assessment_information_responses(*))";
    const { data, error } = await supabaseAdmin.from("assessment_information_requests").select(select).eq("id", requestId).eq("client_id", context.clientId).maybeSingle();
    if (error) throw new Error(error.message);
    if (data) return Response.json({ request: data });
    const fallback = await supabaseAdmin.from("assessment_information_requests").select(select).eq("id", requestId).maybeSingle();
    if (fallback.error) throw new Error(fallback.error.message);
    if (!fallback.data) return Response.json({ error: "Information request not found." }, { status: 404 });
    const owner = await supabaseAdmin.from("client_assessments").select("user_id").eq("id", fallback.data.assessment_id).maybeSingle();
    if (owner.error) throw new Error(owner.error.message);
    if (owner.data?.user_id !== context.userId) return Response.json({ error: "Information request not found." }, { status: 404 });
    return Response.json({ request: fallback.data });
  } catch (error) { return assessmentErrorResponse(error); }
}

export async function POST(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const context = await requireClientContext();
    const { requestId } = await params;
    const parsed = responseSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Invalid response." }, { status: 400 });
    const { data: item, error: itemError } = await supabaseAdmin.from("assessment_information_request_items").select("id,request_id").eq("id", parsed.data.itemId).eq("request_id", requestId).maybeSingle();
    if (itemError) throw new Error(itemError.message);
    if (!item) return Response.json({ error: "Requested item not found." }, { status: 404 });
    const { data: requestRow, error: requestError } = await supabaseAdmin.from("assessment_information_requests").select("assessment_id,client_id").eq("id", requestId).maybeSingle();
    if (requestError) throw new Error(requestError.message);
    if (!requestRow || requestRow.client_id !== context.clientId) return Response.json({ error: "Not permitted." }, { status: 403 });
    const { data, error } = await supabaseAdmin.from("assessment_information_responses").upsert({ request_item_id: item.id, assessment_id: requestRow.assessment_id, submitted_by: context.userId, submitted_by_type: "client", proposed_value: parsed.data.value, supporting_note: parsed.data.supportingNote || null, status: "submitted", submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: "request_item_id" }).select("*").single();
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("assessment_information_request_items").update({ status: "submitted", updated_at: new Date().toISOString() }).eq("id", item.id);
    return Response.json({ response: data });
  } catch (error) { return assessmentErrorResponse(error); }
}
