import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ensureGrowXLabsEmailLayout } from "@/lib/email/growxlabs-layout";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const { error: supabaseError } = await supabaseAdmin
      .from("wish_subscribers")
      .upsert({ name, email }, { onConflict: "email" });

    if (supabaseError) {
      console.error("Wish subscriber Supabase error:", supabaseError);
      return NextResponse.json({ error: "Could not save subscriber." }, { status: 500 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);

      // 1. Add to contact audience if audienceId is present
      if (audienceId) {
        try {
          const { error: createContactError } = await resend.contacts.create({
            audienceId,
            email,
            firstName: name,
            unsubscribed: false,
          });

          if (createContactError) {
            await resend.contacts.update({
              audienceId,
              email,
              firstName: name,
              unsubscribed: false,
            });
          }
        } catch (contactError) {
          console.error("Wish subscriber Resend audience error:", contactError);
        }
      }

      // 2. Always send the confirmation email
      try {
        const { error: emailError } = await resend.emails.send({
          from: 'One Wish Willow <onboarding@growxlabs.tech>',
          to: [email],
          subject: 'You have entered the Gate... 🕯️',
          html: ensureGrowXLabsEmailLayout(`
            <div style="font-family: 'Courier New', Courier, monospace; max-width: 600px; margin: auto; padding: 40px 20px; background-color: #0d0d0d; color: #f5f3ee; border: 3px double #CC1F1F; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #CC1F1F; font-size: 28px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">One Wish Willow</h1>
                <p style="color: #888; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Home of the Authentic Cursed Toy</p>
              </div>
              
              <div style="line-height: 1.6; font-size: 15px;">
                <p>Greetings, <strong>${name}</strong>,</p>
                
                <p>You have entered the gate. Your details have been inscribed upon the wood of the One Wish Willow.</p>
                
                <p>Your path is set. You are now permitted to make your wish. But remember the warning: <em>every wish has its price, and the willow always collects.</em></p>
                
                <p>Keep your eyes open, and watch your inbox. The consequence will follow.</p>
              </div>
              
              <hr style="border: none; border-top: 1px double #CC1F1F; margin: 40px 0;">
              
              <div style="text-align: center; color: #666; font-size: 11px; line-height: 1.4;">
                <p>Inspired by the horror movie <strong>Obsession</strong>.</p>
                <p>GrowXLabsTech | High-Performance Engineering</p>
              </div>
            </div>
          `, { context: "SUBSCRIPTION CONFIRMED", reference: "ONE WISH WILLOW", footerNote: "EDITORIAL COMMUNICATION" })
        });

        if (emailError) {
          console.error("Wish subscriber Resend email error:", emailError);
        }
      } catch (sendEmailError) {
        console.error("Wish subscriber Resend email send catch error:", sendEmailError);
      }
    } else {
      console.warn("RESEND_API_KEY is missing. Subscriber saved without email dispatch.");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wish subscriber API error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
