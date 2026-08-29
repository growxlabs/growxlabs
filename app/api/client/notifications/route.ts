import { buildPortalNotification } from "@/lib/communications/portal-notifications";
import { communicationError, requireCommunicationClient, supabaseAdmin } from "@/lib/communications/service";

type CommunicationMessage = {
  id: string;
  message_type: string;
  variables: unknown;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
};

export async function GET() {
  try {
    const { clientId, userId } = await requireCommunicationClient();
    const { data, error } = await supabaseAdmin
      .from("communication_messages")
      .select("id,message_type,variables,related_entity_type,related_entity_id,created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const messages = (data || []) as CommunicationMessage[];
    const messageIds = messages.map((message) => message.id);
    const proposalIds = messages
      .filter((message) => message.message_type === "proposal_available" && message.related_entity_id)
      .map((message) => message.related_entity_id as string);

    const [readResult, proposalResult] = await Promise.all([
      messageIds.length
        ? supabaseAdmin.from("client_notification_reads").select("message_id,read_at").eq("client_id", clientId).eq("user_id", userId).in("message_id", messageIds)
        : Promise.resolve({ data: [], error: null }),
      proposalIds.length
        ? supabaseAdmin.from("commercial_proposals").select("id,valid_until").eq("client_id", clientId).in("id", proposalIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (readResult.error) throw new Error(readResult.error.message);
    if (proposalResult.error) throw new Error(proposalResult.error.message);

    const readAtByMessageId = new Map((readResult.data || []).map((item) => [item.message_id, item.read_at]));
    const validUntilByProposalId = new Map((proposalResult.data || []).map((item) => [item.id, item.valid_until]));
    const notifications = messages.map((message) => buildPortalNotification({
      id: message.id,
      messageType: message.message_type,
      variables: message.variables,
      createdAt: message.created_at,
      validUntil: message.related_entity_id ? validUntilByProposalId.get(message.related_entity_id) || null : null,
      readAt: readAtByMessageId.get(message.id) || null,
    }));

    return Response.json({ notifications });
  } catch (error) {
    return communicationError(error);
  }
}
