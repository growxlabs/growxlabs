import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { EmailAction, EmailSection, GrowXLabsEmailLayout, growxlabsEmailFields, escapeGrowXLabsEmailHtml } from "@/lib/email/growxlabs-layout";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { invoiceId, email } = await req.json();

    const { data: invoice, error } = await supabaseAdmin
      .from("invoices")
      .select("*, users(*)")
      .eq("id", invoiceId)
      .single();

    if (error || !invoice) {
      console.error("Fetch invoice error:", error);
      throw new Error("Invoice not found");
    }

    const targetEmail = email || (invoice.users ? invoice.users.email : null);
    if (!targetEmail) throw new Error("No destination email address found");

    await resend.emails.send({
      from: "GrowX Labs Billing <billing@growxlabs.tech>",
      to: targetEmail,
      subject: `Invoice ${invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase()} from GrowX Labs`,
      html: GrowXLabsEmailLayout({ context: "INVOICE", reference: invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase(), content: `<p>Hello ${escapeGrowXLabsEmailHtml(invoice.users?.name || "Client")},</p><p>An invoice has been generated for <strong>${escapeGrowXLabsEmailHtml(invoice.description || "Project Services")}</strong>.</p>${EmailSection("INVOICE DETAILS", growxlabsEmailFields([["Amount due", `$${Number(invoice.amount).toLocaleString()}`], ["Due date", invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"], ["Status", String(invoice.status).toUpperCase()]]))}${invoice.pdf_url ? EmailAction("VIEW INVOICE PDF", invoice.pdf_url) : ""}<p>Thank you for choosing GrowXLabs.</p>`, footerNote: "BILLING COMMUNICATION · PRIVATE & CONFIDENTIAL" })
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email Send Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
