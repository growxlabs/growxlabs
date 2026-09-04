import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      slug,
      title,
      deck,
      cover_image,
      excerpt,
      test_email, // If provided, sends ONLY to this test email
    } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required to dispatch." }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: "Resend API key missing on server." }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);
    const blogUrl = `https://growxlabs.tech/blog/${slug}`;
    const coverUrl = cover_image ? (cover_image.startsWith("http") ? cover_image : `https://growxlabs.tech${cover_image}`) : null;
    const fromAddress = "GrowxLabs Dispatch <contact@growxlabs.tech>";

    // Clean, professional engineering newsletter template (No AI jargon, no hype)
    const renderEmailHtml = (recipientEmail: string, recipientName: string) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
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
                          <span style="font-size: 12px; color: #64748b;">
                            September 2026
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Cover Artwork -->
                ${coverUrl ? `
                <tr>
                  <td style="padding: 24px 32px 0;">
                    <a href="${blogUrl}" style="display: block; border-radius: 8px; overflow: hidden; border: 1px solid #1e2330;">
                      <img src="${coverUrl}" alt="${title}" style="width: 100%; height: auto; display: block; border-radius: 8px;" />
                    </a>
                  </td>
                </tr>
                ` : ""}

                <!-- Article Content -->
                <tr>
                  <td style="padding: 28px 32px 24px;">
                    
                    <span style="display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #38bdf8; background-color: rgba(56, 189, 248, 0.1); padding: 3px 8px; border-radius: 4px; margin-bottom: 14px;">
                      Engineering Research
                    </span>

                    <h1 style="font-size: 22px; font-weight: 700; line-height: 1.35; color: #f8fafc; margin: 0 0 12px 0;">
                      <a href="${blogUrl}" style="color: #f8fafc; text-decoration: none;">
                        ${title}
                      </a>
                    </h1>

                    ${deck ? `
                    <p style="font-size: 15px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px 0;">
                      ${deck}
                    </p>
                    ` : ""}

                    <div style="height: 1px; background-color: #1e2330; margin: 20px 0;"></div>

                    <p style="font-size: 14px; line-height: 1.7; color: #cbd5e1; margin: 0 0 24px 0;">
                      ${excerpt}
                    </p>

                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0 8px;">
                      <tr>
                        <td align="left">
                          <a href="${blogUrl}" style="display: inline-block; background-color: #0075de; color: #ffffff; font-size: 13px; font-weight: 600; padding: 12px 22px; text-decoration: none; border-radius: 6px;">
                            Read Technical Breakdown →
                          </a>
                        </td>
                      </tr>
                    </table>

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
                          <a href="https://growxlabs.tech/api/unsubscribe?email=${encodeURIComponent(recipientEmail)}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
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
    `;

    // CASE 1: Test Email Mode
    if (test_email) {
      const { error: testErr } = await resend.emails.send({
        from: fromAddress,
        to: [test_email.trim()],
        subject: `[TEST DISPATCH] ${title}`,
        html: renderEmailHtml(test_email, "Test User"),
      });

      if (testErr) {
        return NextResponse.json({ error: testErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        test_mode: true,
        message: `Test email dispatched to ${test_email}`,
      });
    }

    // CASE 2: Broadcast Mode (All Subscribers)
    const { data: subscribers, error: subsError } = await supabaseAdmin
      .from("wish_subscribers")
      .select("id, name, email");

    if (subsError) {
      return NextResponse.json({ error: "Failed to fetch subscribers from database." }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        sent_count: 0,
        message: "No subscribers found in database.",
      });
    }

    let sentCount = 0;
    for (const sub of subscribers) {
      try {
        await resend.emails.send({
          from: fromAddress,
          to: [sub.email],
          subject: `${title} · GrowxLabs Dispatch`,
          html: renderEmailHtml(sub.email, sub.name || "Subscriber"),
        });
        sentCount++;
      } catch (sendErr) {
        console.error(`Failed to send to ${sub.email}:`, sendErr);
      }
    }

    return NextResponse.json({
      success: true,
      sent_count: sentCount,
      total_subscribers: subscribers.length,
      message: `Dispatched edition to ${sentCount} subscribers.`,
    });
  } catch (error: any) {
    console.error("Newsletter dispatch error:", error);
    return NextResponse.json({ error: error.message || "Dispatch error." }, { status: 500 });
  }
}
