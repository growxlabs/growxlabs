import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PDFService } from "@/lib/services/pdf.service";
import { getBaseUrl } from "@/lib/utils";
import { Resend } from "resend";
import { EmailAction, EmailSection, GrowXLabsEmailLayout, growxlabsEmailFields, escapeGrowXLabsEmailHtml } from "@/lib/email/growxlabs-layout";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 1. Get Client Details
    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", data.client_id)
      .single();

    if (clientError || !client) throw new Error("Client not found");

    // 2. Create Agreement Record in DB
    const { data: agreement, error: aggError } = await supabaseAdmin
      .from("agreements")
      .insert([{
        client_id: data.client_id,
        service_type: data.service_type,
        project_description: data.project_description,
        total_amount: data.total_amount,
        advance_amount: data.advance_amount,
        balance_amount: Number(data.total_amount) - Number(data.advance_amount),
        start_date: data.start_date || null,
        delivery_date: data.delivery_date || null,
        status: "sent"
      }])
      .select()
      .single();

    if (aggError) throw aggError;

    // 3. Generate PDF
    const pdfUrl = await PDFService.generateAgreement({
      ...agreement,
      client_name: client.name,
      business_name: client.business_name
    });

    // 4. Update Agreement with PDF URL
    await supabaseAdmin
      .from("agreements")
      .update({ pdf_url: pdfUrl })
      .eq("id", agreement.id);

    // 6. Send Email via Resend
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://growxlabs.tech";
    await resend.emails.send({
      from: "GrowX Labs Partners <partners@growxlabs.tech>",
      to: client.email,
      subject: `Partnership Agreement: ${data.service_type}`,
      html: GrowXLabsEmailLayout({ context: "PARTNERSHIP AGREEMENT", reference: agreement.id, content: `<p>Hello ${escapeGrowXLabsEmailHtml(client.name)},</p><p>We have prepared the partnership agreement for your upcoming project with GrowXLabs.</p>${EmailSection("AGREEMENT DETAILS", growxlabsEmailFields([["Service", data.service_type], ["Status", "Ready for review"]]))}<p>Please review and accept the agreement using the secure link below.</p>${EmailAction("REVIEW & SIGN AGREEMENT", `${appUrl}/agreements/${agreement.id}`)}`, footerNote: "PARTNERSHIP COMMUNICATION · PRIVATE & CONFIDENTIAL" }),
      attachments: [{ filename: 'agreement.pdf', path: pdfUrl }]
    });

    return NextResponse.json({ success: true, agreementId: agreement.id, pdfUrl });
  } catch (error: any) {
    console.error("Agreement API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
