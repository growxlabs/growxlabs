import { communicationError, requireCommunicationClient, supabaseAdmin } from "@/lib/communications/service";

function isMissingReadTable(error: { code?: string; message?: string } | null | undefined) {
  const message = error?.message || "";
  return error?.code === "PGRST205" || /client_notification_reads/i.test(message) && /(schema cache|does not exist|relation)/i.test(message);
}

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
    if (error && !isMissingReadTable(error)) throw new Error(error.message);
    return Response.json({ status: "read", readAt, persisted: !error });
  } catch (error) {
    return communicationError(error);
  }
}
