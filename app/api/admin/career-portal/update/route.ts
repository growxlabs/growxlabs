import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getToken } from "next-auth/jwt";
import { Resend } from "resend";

function getEmailContent(name: string, role: string, status: string) {
  let subject = "";
  let heading = "";
  let body = "";

  switch (status.toLowerCase()) {
    case "reviewed":
      subject = `Update regarding your application for ${role} at GrowX Labs`;
      heading = "Application Under Review";
      body = `
        <p>Thank you for submitting your application for the <strong>${role}</strong> position at GrowX Labs.</p>
        <p>We wanted to let you know that our recruitment team has successfully received and reviewed your application details. We are currently assessing your profile against the technical requirements of this role.</p>
        <p>If your qualifications align with our current needs, a member of our talent team will reach out to discuss the next steps.</p>
        <p>We appreciate your interest in joining our team and thank you for your patience during this process.</p>
      `;
      break;
    case "shortlisted":
      subject = `Exciting News! You've been shortlisted for the ${role} role at GrowX Labs`;
      heading = "Application Shortlisted";
      body = `
        <p>Congratulations!</p>
        <p>We have finished reviewing your application for the <strong>${role}</strong> position, and we are highly impressed by your credentials and professional background.</p>
        <p>We have shortlisted your application and would love to move you forward to the next stage of our interview process. A coordinator from our hiring team will contact you shortly to schedule an initial technical conversation.</p>
        <p>In the meantime, feel free to review our website to learn more about our projects and engineering culture.</p>
      `;
      break;
    case "contacted":
      subject = `Next steps: Interview for ${role} position at GrowX Labs`;
      heading = "Interview Coordination";
      body = `
        <p>Hello ${name},</p>
        <p>We are reaching out regarding your application for the <strong>${role}</strong> position at GrowX Labs.</p>
        <p>Our hiring team has initiated outreach to coordinate your upcoming interview schedule. A representative will contact you via email or phone within the next 24 hours to finalize details.</p>
        <p>We look forward to speaking with you and learning more about your technical expertise.</p>
      `;
      break;
    case "hired":
      subject = `Offer of Employment: ${role} at GrowX Labs`;
      heading = "Welcome to GrowX Labs!";
      body = `
        <p>Congratulations, ${name}!</p>
        <p>On behalf of the entire team at GrowX Labs, we are thrilled to offer you the position of <strong>${role}</strong>.</p>
        <p>We were extremely impressed by your performance throughout the interview process and believe your skills and expertise will be invaluable to our engineering team.</p>
        <p>Our Human Resources team will be in touch with you shortly to share the formal offer letter, contract details, and the onboarding roadmap.</p>
        <p>We are excited about the prospect of you joining us and building the future of digital systems together!</p>
      `;
      break;
    case "rejected":
      subject = `Update on your application for ${role} at GrowX Labs`;
      heading = "Application Update";
      body = `
        <p>Thank you for your interest in the <strong>${role}</strong> position at GrowX Labs and for taking the time to apply.</p>
        <p>After careful consideration of your qualifications and experience, we regret to inform you that we will not be moving forward with your application at this time.</p>
        <p>The standard of applications we received was exceptionally high, and we had to make some very difficult decisions.</p>
        <p>We will retain your profile in our talent database for future opportunities that match your skill set. We wish you the very best in your professional endeavors.</p>
      `;
      break;
    default:
      subject = `Update regarding your application at GrowX Labs`;
      heading = "Application Status Update";
      body = `
        <p>We are updating you that the status of your application for the <strong>${role}</strong> role has been updated to <strong>${status}</strong>.</p>
        <p>Our recruitment team will keep you informed of any further updates or requirements.</p>
      `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafafa; padding: 40px 0;">
        <tr>
          <td>
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px; background-color: #000000; text-align: left;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.03em;">GrowX Labs</h1>
                  <p style="color: #a3a3a3; margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 700;">Careers & Talent Acquisition</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 40px 30px 40px; color: #171717;">
                  <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #111111; text-transform: uppercase; letter-spacing: 0.05em; font-family: monospace;">// ${heading}</h2>
                  <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #404040;">Dear ${name},</p>
                  <div style="font-size: 14px; line-height: 1.6; color: #404040; margin-bottom: 25px;">
                    ${body}
                  </div>
                  <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 1.6; color: #404040;">Best regards,</p>
                  <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: 700; color: #111111;">GrowX Labs Talent Team</p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #f0f0f0; text-align: left;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="color: #737373; font-size: 11px; line-height: 1.5;">
                        <strong>GrowX Labs Inc.</strong><br>
                        High-Performance Engineering & Digital Platforms<br>
                        <a href="https://growxlabs.tech" style="color: #000000; text-decoration: none; font-weight: 600;">growxlabs.tech</a>
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

  return { subject, html };
}

export async function POST(request: Request) {
  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = token.role;
    if (role !== "ADMIN" && role !== "CO_ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    const updateFields: any = { updated_at: new Date().toISOString() };
    if (status !== undefined) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;

    const { data, error } = await supabaseAdmin
      .from("career_applications")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (status && data && data.email) {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey && apiKey !== "your_resend_key_here") {
        try {
          const resend = new Resend(apiKey);
          const { subject, html } = getEmailContent(data.name || "Candidate", data.role || "Specialist", status);
          
          const bccList = ["sai@growxlabs.tech"];
          if (token?.email && token.email !== "sai@growxlabs.tech") {
            bccList.push(token.email);
          }

          await resend.emails.send({
            from: "GrowX Labs Careers <careers@growxlabs.tech>",
            to: [data.email],
            ...(bccList.length > 0 ? { bcc: bccList } : {}),
            subject: subject,
            html: html,
          });
        } catch { /* swallow email error */ }
      }
    }

    return NextResponse.json({ message: "Application updated successfully", data });
  } catch (error: any) {
    console.error("Admin Careers Update API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
