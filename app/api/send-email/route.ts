import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from 'resend';
import { ensureGrowXLabsEmailLayout } from "@/lib/email/growxlabs-layout";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, leadId } = await req.json();
    const supabase = await createClient();

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "your_resend_key_here") {
      return NextResponse.json({ message: "Resend API key missing. Email not sent." });
    }

    const { data: lead } = await supabase.from("leads").select("*").eq("id", leadId).single();

    if (!lead || !email) {
      return NextResponse.json({ error: "Invalid lead or email address." }, { status: 400 });
    }

    // Professional outreach template
    const { error: emailError } = await resend.emails.send({
      from: 'GrowX Labs <contact@growxlabs.tech>',
      to: [email],
      subject: `Accelerating ${lead.business_name || lead.name}'s Digital Strategy`,
      html: ensureGrowXLabsEmailLayout(`
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="font-weight: 900; letter-spacing: -0.05em;">GrowX Labs</h2>
          <p>Hello,</p>
          <p>We've been analyzing high-performance digital systems in your industry and identified several high-impact growth opportunities for <strong>${lead.business_name || lead.name}</strong>.</p>
          ${!lead.website ? '<p>Our analysis indicates your business currently lacks a dedicated digital platform, which is essential for scaling in the current market.</p>' : ''}
          <p>Our engineering team specializes in custom platforms and automation that help businesses grow faster.</p>
          <p>Are you available for a brief strategy call this week?</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
          <p style="color: #888; font-size: 12px;">GrowX Labs | High-Performance Engineering</p>
        </div>
      `, { context: "GROWTH OPPORTUNITY", reference: lead.business_name || lead.name, footerNote: "BUSINESS COMMUNICATION" })
    });

    if (emailError) {
      console.error("Resend Error:", emailError);
      return NextResponse.json({ error: emailError.message }, { status: 500 });
    }

    // Update status to "contacted"
    await supabase
      .from("leads")
      .update({ status: "contacted" })
      .eq("id", leadId);

    return NextResponse.json({ success: true, message: "Outreach dispatched successfully." });

  } catch (error: any) {
    console.error("Outreach API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
