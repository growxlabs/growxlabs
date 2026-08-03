import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { assessmentErrorResponse, requireAssessmentAdmin } from "@/lib/assessments/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateClientInvitationEmail } from "@/lib/email/client-invitation";

export async function GET(_request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  try { await requireAssessmentAdmin(); const { leadId } = await params;
    const { data, error } = await supabaseAdmin.from("client_profiles").select("id,deal_id,client_invitations(id,email,expires_at,accepted_at,revoked_at,created_at)").eq("lead_id", leadId).maybeSingle();
    if (error) throw new Error(error.message); if (!data) return Response.json({ status: "not_invited" });
    const list = Array.isArray(data.client_invitations) ? data.client_invitations : []; const latest = [...list].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    const status = latest?.accepted_at ? "accepted" : latest?.revoked_at ? "revoked" : latest && new Date(latest.expires_at) <= new Date() ? "expired" : latest ? "sent" : "not_invited";
    return Response.json({ status, email: latest?.email || null, expiresAt: latest?.expires_at || null, clientId: data.id, dealId: data.deal_id });
  } catch (error) { return assessmentErrorResponse(error); }
}

export async function POST(_request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  try {
    const admin = await requireAssessmentAdmin(); const { leadId } = await params;
    const { data: lead, error: leadError } = await supabaseAdmin.from("leads").select("id,business_name,name,email,status,city,website_url").eq("id", leadId).maybeSingle();
    if (leadError) throw new Error(leadError.message); if (!lead) return Response.json({ error: "Lead not found." }, { status: 404 });
    if (lead.status !== "qualified") return Response.json({ error: "Only qualified leads can be invited." }, { status: 409 });
    if (!lead.email) return Response.json({ error: "Add a valid client email before inviting." }, { status: 400 });
    const companyName = lead.business_name || lead.name; if (!companyName) return Response.json({ error: "Company name is required." }, { status: 400 });
    const { data: company, error: companyError } = await supabaseAdmin.from("companies").select("id").ilike("name", companyName).limit(1).maybeSingle();
    if (companyError) throw new Error(companyError.message); if (!company) return Response.json({ error: "Create the company record before inviting this lead." }, { status: 409 });
    const { data: deal, error: dealError } = await supabaseAdmin.from("deals").select("id").eq("company_id", company.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (dealError || !deal) return Response.json({ error: "Create a deal for this qualified lead before inviting." }, { status: 409 });
    const token = randomBytes(32).toString("base64url"); const tokenHash = createHash("sha256").update(token).digest("hex"); const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 12); const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(); const email = lead.email.toLowerCase();
    const invitation = await supabaseAdmin.rpc("create_client_invitation", { p_email: email, p_name: companyName, p_password_hash: passwordHash, p_company_id: company.id, p_lead_id: lead.id, p_deal_id: deal.id, p_token_hash: tokenHash, p_expires_at: expiresAt, p_created_by: admin.userId });
    if (invitation.error) throw new Error(`Unable to create invitation: ${invitation.error.message}`);
    if (!process.env.RESEND_API_KEY) throw new Error("Invitation created but RESEND_API_KEY is not configured.");
    const base = process.env.NEXTAUTH_URL || "https://growxlabs.tech"; const template = generateClientInvitationEmail({ clientName: lead.name || "Client", companyName, invitationUrl: `${base}/client/invite/${token}`, expiryDate: new Date(expiresAt).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Kolkata" }) });
    const sent = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.RESEND_FROM_EMAIL || "GrowXLabs Client Services <noreply@growxlabs.tech>", replyTo: process.env.RESEND_REPLY_TO || "sai@growxlabs.tech", to: email, subject: template.subject, html: template.html, text: template.text });
    if (sent.error) throw new Error(`Invitation created but email failed: ${sent.error.message}`);
    return Response.json({ status: "sent", email, expiresAt, clientId: invitation.data, dealId: deal.id }, { status: 201 });
  } catch (error) { return assessmentErrorResponse(error); }
}
