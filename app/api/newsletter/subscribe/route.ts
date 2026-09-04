import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : rawEmail.split("@")[0];

    if (!rawEmail || !emailPattern.test(rawEmail)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    // 1. Save subscriber in Supabase database
    const { error: dbError } = await supabaseAdmin
      .from("wish_subscribers")
      .upsert({ name, email: rawEmail }, { onConflict: "email" });

    if (dbError) {
      console.error("Newsletter Supabase save error:", dbError);
    }

    // 2. Sync to Resend Contacts & Send Professional Welcome Email
    const resendApiKey = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID && process.env.RESEND_AUDIENCE_ID !== "REPLACE_WITH_RESEND_AUDIENCE_ID" 
      ? process.env.RESEND_AUDIENCE_ID 
      : undefined;

    if (resendApiKey && resendApiKey !== "your_resend_key_here") {
      const resend = new Resend(resendApiKey);

      // Sync contact to Audience if configured
      if (audienceId) {
        try {
          await resend.contacts.create({
            audienceId,
            email: rawEmail,
            firstName: name,
            unsubscribed: false,
          });
        } catch (contactErr) {
          console.log("Contact sync info:", contactErr);
        }
      }

      // Send Professional Executive Welcome Email
      try {
        const fromAddress = "GrowxLabs Dispatch <contact@growxlabs.tech>";
        const unsubscribeUrl = `https://growxlabs.tech/api/unsubscribe?email=${encodeURIComponent(rawEmail)}`;

        await resend.emails.send({
          from: fromAddress,
          to: [rawEmail],
          subject: "Subscription Confirmed · GrowxLabs Dispatch",
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Subscription Confirmed · GrowxLabs Dispatch</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #0b0c10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #e2e8f0; -webkit-font-smoothing: antialiased;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0c10; padding: 48px 16px;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="580" cellspacing="0" cellpadding="0" style="max-width: 580px; width: 100%; background-color: #12141a; border: 1px solid #232733; border-radius: 12px; overflow: hidden;">
                      
                      <!-- Masthead -->
                      <tr>
                        <td style="padding: 24px 32px 20px; border-bottom: 1px solid #1e2330;">
                          <table width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="left">
                                <span style="font-size: 13px; font-weight: 700; letter-spacing: 0.05em; color: #f8fafc;">GROWX LABS</span>
                                <span style="font-size: 13px; font-weight: 400; color: #64748b; margin-left: 6px;">/ Technical Dispatch</span>
                              </td>
                              <td align="right">
                                <span style="font-size: 12px; color: #34d399; font-weight: 500;">Confirmed</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Body Content -->
                      <tr>
                        <td style="padding: 32px 32px 24px;">
                          <h1 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 0 0 16px 0; line-height: 1.4;">
                            Subscription Confirmed
                          </h1>

                          <p style="font-size: 14px; line-height: 1.7; color: #cbd5e1; margin: 0 0 16px 0;">
                            Hello ${name},
                          </p>

                          <p style="font-size: 14px; line-height: 1.7; color: #cbd5e1; margin: 0 0 16px 0;">
                            You are confirmed to receive new technical briefings from GrowxLabs. We publish engineering deep-dives covering frontier AI model architectures, distributed systems, and developer infrastructure.
                          </p>

                          <p style="font-size: 14px; line-height: 1.7; color: #cbd5e1; margin: 0 0 24px 0;">
                            Each edition includes architectural breakdowns, verified benchmark numbers, and practical implementation context. Zero sponsored filler or promotional marketing.
                          </p>

                          <!-- Featured Edition Card -->
                          <div style="background-color: #171a23; border: 1px solid #232733; border-radius: 8px; padding: 20px; margin: 24px 0;">
                            <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #38bdf8; display: block; margin-bottom: 8px;">
                              Current Edition
                            </span>
                            <h2 style="font-size: 16px; font-weight: 700; color: #f8fafc; margin: 0 0 8px 0; line-height: 1.4;">
                              GPT-6 Astra: Inside OpenAI’s Autonomous Desktop Agent
                            </h2>
                            <p style="font-size: 13px; line-height: 1.6; color: #94a3b8; margin: 0 0 16px 0;">
                              A technical analysis of OSWorld 2.0 and BenchCAD benchmark evaluations, native computer control, and security thresholds.
                            </p>
                            <a href="https://growxlabs.tech/blog/gpt-6-astra" style="display: inline-block; background-color: #0075de; color: #ffffff; font-size: 13px; font-weight: 600; padding: 9px 18px; text-decoration: none; border-radius: 6px;">
                              Read Article →
                            </a>
                          </div>

                          <p style="font-size: 13px; line-height: 1.6; color: #94a3b8; margin: 20px 0 0;">
                            Expect new editions as notable systems or research papers are published.
                          </p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="padding: 20px 32px; border-top: 1px solid #1e2330; background-color: #0f1117;">
                          <table width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="left" style="font-size: 12px; color: #64748b; line-height: 1.5;">
                                GrowxLabs · Systems Engineering & Architecture<br>
                                <a href="https://growxlabs.tech" style="color: #64748b; text-decoration: underline;">growxlabs.tech</a>
                              </td>
                              <td align="right" style="font-size: 12px; color: #64748b; vertical-align: top;">
                                <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        });
      } catch (emailErr) {
        console.error("Newsletter welcome email error:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Subscribed to GrowxLabs Dispatch.",
    });
  } catch (error: any) {
    console.error("Newsletter subscription route error:", error);
    return NextResponse.json({ error: error.message || "Internal error." }, { status: 500 });
  }
}
