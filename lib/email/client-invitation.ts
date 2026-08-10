import { growxlabsEmailAction, growxlabsEmailFields, growxlabsEmailLayout, escapeGrowXLabsEmailHtml } from "./growxlabs-layout";

type ClientInvitationEmailInput = { clientName?: string; companyName?: string; invitationUrl: string; expiryDate: string; invitedByName?: string; supportEmail?: string; privacyUrl?: string; termsUrl?: string; contactUrl?: string };

export function generateClientInvitationEmail(input: ClientInvitationEmailInput) {
  const clientName = (input.clientName || "Client").trim() || "Client";
  const companyName = (input.companyName || "your organisation").trim() || "your organisation";
  const support = input.supportEmail || "sai@growxlabs.tech";
  if (!input.invitationUrl || !/^https?:\/\//i.test(input.invitationUrl)) throw new Error("Invitation URL is required");
  const content = `<p>Hello ${escapeGrowXLabsEmailHtml(clientName)},</p><p>You have been invited to access a secure GrowXLabs client workspace for <strong>${escapeGrowXLabsEmailHtml(companyName)}</strong>.</p>${growxlabsEmailFields([["Workspace", companyName], ["Expires", input.expiryDate]])}<p>Your workspace provides a secure place to review documents, agreements, project activity, billing information, and communications.</p>${growxlabsEmailAction("Accept Invitation", input.invitationUrl)}<p style="font-size:13px;color:#607086">Need assistance? Contact <a href="mailto:${escapeGrowXLabsEmailHtml(support)}">${escapeGrowXLabsEmailHtml(support)}</a>.</p>`;
  return { subject: "You're invited to the GrowXLabs Client Portal", text: `You're invited to the GrowXLabs Client Portal\n\nHello ${clientName},\n\nActivate your account: ${input.invitationUrl}\n\nThis one-time link expires on ${input.expiryDate}.\n\nSupport: ${support}\n\n{ GROWXLABS }\ngrowxlabs.tech`, html: growxlabsEmailLayout({ context: "CLIENT PORTAL INVITATION", reference: "CLIENT PORTAL", content }) };
}
