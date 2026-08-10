import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { getToken } from "next-auth/jwt";
import { ensureGrowXLabsEmailLayout } from "@/lib/email/growxlabs-layout";

export async function POST(req: Request) {
  try {
    // 1. Session authorization
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { toEmail, fromName, fromEmail, bccEmail, bcc, subject, body, html, attachments, leadId } = await req.json();

    if (!toEmail || !fromName || !fromEmail || !subject || (!body && !html)) {
      return NextResponse.json({ error: "All required email fields must be provided" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "your_resend_key_here") {
      return NextResponse.json({ error: "Resend API key is not configured on the server." }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const bccList = bccEmail ? [bccEmail] : (bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined);

    let formattedAttachments: any[] | undefined = undefined;
    if (attachments && Array.isArray(attachments)) {
      formattedAttachments = attachments.map((att: any) => {
        if (typeof att.content === "string") {
          let base64Data = att.content;
          if (base64Data.includes(",")) {
            base64Data = base64Data.split(",")[1];
          }
          const buf = Buffer.from(base64Data, "base64");
          console.log(`[Email Route] Attachment ${att.filename} formatted with buffer size: ${buf.length} bytes`);
          return {
            filename: att.filename || "Offer_Letter.pdf",
            content: buf
          };
        }
        return att;
      });
    }

    console.log(`[Email Route] Sending email to ${toEmail} with ${formattedAttachments?.length || 0} attachments.`);

    // Send the dynamic email using Resend with optional BCC & PDF attachment
    const { data, error: sendError } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [toEmail],
      bcc: bccList,
      subject: subject,
      text: body || undefined,
      html: ensureGrowXLabsEmailLayout(html || (body ? body.replace(/\n/g, "<br />") : ""), { context: "COMMUNICATION", preheader: subject, footerNote: "PRIVATE & CONFIDENTIAL" }),
      attachments: formattedAttachments
    });

    if (sendError) {
      console.error("Resend API Error:", sendError);
      return NextResponse.json({ error: sendError.message }, { status: 500 });
    }

    // 2. Update lead status in Supabase if leadId is provided
    if (leadId) {
      const supabase = await createClient();
      await supabase
        .from("leads")
        .update({
          status: "contacted",
          outreach_channel: "email",
          follow_up_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days follow up
          notes: `Sent dynamic email via GrowX Server from "${fromName} <${fromEmail}>" on ${new Date().toLocaleDateString()}`
        })
        .eq("id", leadId);
    }

    return NextResponse.json({ success: true, messageId: data?.id });

  } catch (error: any) {
    console.error("Dynamic Outreach API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
