import { communicationError, requireCommunicationClient, supabaseAdmin } from "@/lib/communications/service";

export async function POST(_request: Request, { params }: { params: Promise<{ notificationId: string }> }) {
  try {
    const { userId, clientId } = await requireCommunicationClient();
    const { notificationId } = await params;
    const { data: message, error: messageError } = await supabaseAdmin
      .from("communication_messages")
      .select("id")
      .eq("id", notificationId)
      .eq("client_id", clientId)
      .maybeSingle();
    if (messageError) throw new Error(messageError.message);
    if (!message) return Response.json({ error: "Notification not found." }, { status: 404 });

    const readAt = new Date().toISOString();
    const { error } = await supabaseAdmin.from("client_notification_reads").upsert({
      message_id: message.id,
      client_id: clientId,
      user_id: userId,
      read_at: readAt,
      updated_at: readAt,
    }, { onConflict: "message_id,user_id" });
    if (error) throw new Error(error.message);
    return Response.json({ status: "read", readAt });
  } catch (error) {
    return communicationError(error);
  }
}
