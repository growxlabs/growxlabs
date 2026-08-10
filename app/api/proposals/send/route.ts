import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { EmailSection, GrowXLabsEmailLayout, growxlabsEmailFields, escapeGrowXLabsEmailHtml } from "@/lib/email/growxlabs-layout";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { proposalId } = await req.json();

    const { data: proposal, error } = await supabaseAdmin
      .from("proposals")
      .select("*")
      .eq("id", proposalId)
      .single();

    if (error || !proposal) throw new Error("Proposal not found");

    // In a real scenario, we'd need the client email. 
    // For now, we'll try to find a client by name or default to a safe place.
    const { data: client } = await supabaseAdmin
      .from("clients")
      .select("email")
      .eq("business_name", proposal.business_name)
      .single();

    const targetEmail = client?.email || "valuable-prospect@growxlabs.tech";

    await resend.emails.send({
      from: "GrowX Labs Partnerships <partners@growxlabs.tech>",
      to: targetEmail,
      subject: `Project Proposal: ${proposal.business_name} x GrowX Labs`,
      html: GrowXLabsEmailLayout({ context: "PROJECT PROPOSAL", reference: proposal.business_name, content: `<p>Hello ${escapeGrowXLabsEmailHtml(proposal.client_name)},</p><p>It was a pleasure discussing your vision for <strong>${escapeGrowXLabsEmailHtml(proposal.business_name)}</strong>.</p><p>We have prepared a technical proposal covering the recommended approach and next steps.</p>${EmailSection("PROPOSAL DETAILS", growxlabsEmailFields([["Recommended package", String(proposal.selected_package || "").toUpperCase()], ["Validity", "7 days"]]))}<p>Please review the complete proposal provided with this communication.</p><p>Regards,<br><strong>GrowXLabs Engineering</strong></p>`, footerNote: "PARTNERSHIP COMMUNICATION · PRIVATE & CONFIDENTIAL" })
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Proposal Send Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
