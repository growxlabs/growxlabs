import { buildPortalNotification } from "@/lib/communications/portal-notifications";
import { communicationError, createPortalNotification, requireCommunicationClient, supabaseAdmin } from "@/lib/communications/service";

type CommunicationMessage = {
  id: string;
  message_type: string;
  variables: unknown;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
};

type ClientInvoice = { id: string; invoice_number: string; currency: string; balance_due: number; status: string; company_id: string | null };

function isMissingReadTable(error: { code?: string; message?: string } | null | undefined) {
  const message = error?.message || "";
  return error?.code === "PGRST205" || /client_notification_reads/i.test(message) && /(schema cache|does not exist|relation)/i.test(message);
}

export async function GET() {
  try {
    const { clientId, userId } = await requireCommunicationClient();
    const [messageResult, invoiceResult] = await Promise.all([
      supabaseAdmin
      .from("communication_messages")
      .select("id,message_type,variables,related_entity_type,related_entity_id,created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("consulting_advance_invoices")
        .select("id,invoice_number,currency,balance_due,status,company_id")
        .eq("client_id", clientId)
        .in("status", ["sent", "viewed", "partially_paid", "paid", "overdue", "refunded"]),
    ]);
    if (messageResult.error) throw new Error(messageResult.error.message);
    if (invoiceResult.error) throw new Error(invoiceResult.error.message);

    let messages = (messageResult.data || []) as CommunicationMessage[];
    const invoiceMessages = new Set(messages.filter((message) => message.message_type === "invoice_available" && message.related_entity_id).map((message) => message.related_entity_id as string));
    const missingInvoiceNotifications = (invoiceResult.data || [] as ClientInvoice[]).filter((invoice) => !invoiceMessages.has(invoice.id));
    if (missingInvoiceNotifications.length) {
      await Promise.all(missingInvoiceNotifications.map((invoice) => createPortalNotification({
        messageType: "invoice_available",
        subject: `Invoice ${invoice.invoice_number} is ready`,
        body: `<p>Your GrowXLabs consulting invoice <strong>${invoice.invoice_number}</strong> is ready in the Client Suite.</p><p>Amount due: <strong>${invoice.currency} ${Number(invoice.balance_due).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>.</p>`,
        referenceCode: invoice.invoice_number,
        targetUrl: `/client/invoices?invoiceNumber=${encodeURIComponent(invoice.invoice_number)}`,
        actionLabel: "View Invoice",
        relatedEntityType: "consulting_advance_invoice",
        relatedEntityId: invoice.id,
        clientId,
        companyId: invoice.company_id,
        variables: { invoiceNumber: invoice.invoice_number },
      }, userId)));
      const refreshed = await supabaseAdmin
        .from("communication_messages")
        .select("id,message_type,variables,related_entity_type,related_entity_id,created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      if (refreshed.error) throw new Error(refreshed.error.message);
      messages = (refreshed.data || []) as CommunicationMessage[];
    }
    const messageIds = messages.map((message) => message.id);
    const proposalIds = messages
      .filter((message) => message.message_type === "proposal_available" && message.related_entity_id)
      .map((message) => message.related_entity_id as string);

    let readRows: Array<{ message_id: string; read_at: string }> = [];
    if (messageIds.length) {
      const readResult = await supabaseAdmin.from("client_notification_reads").select("message_id,read_at").eq("client_id", clientId).eq("user_id", userId).in("message_id", messageIds);
      if (readResult.error && !isMissingReadTable(readResult.error)) throw new Error(readResult.error.message);
      if (!readResult.error) readRows = readResult.data || [];
    }
    const proposalResult = proposalIds.length
      ? await supabaseAdmin.from("commercial_proposals").select("id,valid_until").eq("client_id", clientId).in("id", proposalIds)
      : { data: [], error: null };
    if (proposalResult.error) throw new Error(proposalResult.error.message);

    const readAtByMessageId = new Map(readRows.map((item) => [item.message_id, item.read_at]));
    const validUntilByProposalId = new Map((proposalResult.data || []).map((item) => [item.id, item.valid_until]));
    const notifications = messages.map((message) => buildPortalNotification({
      id: message.id,
      messageType: message.message_type,
      variables: message.variables,
      createdAt: message.created_at,
      validUntil: message.related_entity_id ? validUntilByProposalId.get(message.related_entity_id) || null : null,
      readAt: readAtByMessageId.get(message.id) || null,
    })).filter((notification, index, all) => {
      const source = messages[index];
      const key = source.related_entity_id
        ? `${notification.type}:${source.related_entity_type || ""}:${source.related_entity_id}`
        : `${notification.type}:${notification.referenceCode || source.id}`;
      return all.findIndex((candidate, candidateIndex) => {
        const candidateSource = messages[candidateIndex];
        const candidateKey = candidateSource.related_entity_id
          ? `${candidate.type}:${candidateSource.related_entity_type || ""}:${candidateSource.related_entity_id}`
          : `${candidate.type}:${candidate.referenceCode || candidateSource.id}`;
        return candidateKey === key;
      }) === index;
    });

    return Response.json({ notifications });
  } catch (error) {
    return communicationError(error);
  }
}
