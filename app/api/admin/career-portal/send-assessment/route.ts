import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getToken } from "next-auth/jwt";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    // Session validation via JWT token
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
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    // 1. Fetch Candidate details
    let candidateEmail = "";
    let candidateName = "Candidate";
    let targetRole = "Sales Development Representative (SDR)";
    let isRecruitmentSchema = false;

    const recruitmentRes = await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .select("*, careers_jobs(title)")
      .eq("id", id)
      .maybeSingle();

    if (recruitmentRes.data) {
      isRecruitmentSchema = true;
      candidateEmail = recruitmentRes.data.profile?.email || "";
      candidateName = recruitmentRes.data.profile?.full_name || recruitmentRes.data.candidate_id || "Candidate";
      targetRole = recruitmentRes.data.careers_jobs?.title || "Sales Development Representative (SDR)";
    } else {
      const { data: legacyCandidate, error: fetchError } = await supabaseAdmin
        .from("career_applications")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (fetchError || !legacyCandidate) {
        return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
      }

      candidateEmail = legacyCandidate.email;
      candidateName = legacyCandidate.name || "Candidate";
      targetRole = legacyCandidate.role || "Sales Development Representative (SDR)";
    }

    // 2. Prepare Resend email payload
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === "your_resend_key_here") {
      return NextResponse.json({ error: "Resend API key missing." }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const subject = `Next Steps: Sales Assessment Task | GrowX Labs Careers`;

    const htmlContent = `
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
                    <p style="color: #a3a3a3; margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 700;">Human Resources & Talent</p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px; color: #171717;">
                    <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #111111; text-transform: uppercase; letter-spacing: 0.05em; font-family: monospace;">// STAGE 2: SALES ASSESSMENT</h2>
                    <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #404040;">Hi ${candidateName},</p>
                    
                    <div style="font-size: 14px; line-height: 1.6; color: #404040; margin-bottom: 25px;">
                      <p>Great speaking with you. As discussed, the next step in our process for the <strong>${targetRole}</strong> role is a brief sales assessment task. This helps us evaluate your copywriting, research skills, and overall sales logic.</p>
                      
                      <p>Please complete the following task within <strong>48 hours</strong>:</p>
                      
                      <ol style="padding-left: 20px; margin: 15px 0;">
                        <li style="margin-bottom: 8px;">Identify <strong>2 traditional, non-tech companies</strong> (e.g., manufacturing plants, logistics firms, packaging suppliers, warehousing, or chemical distribution).</li>
                        <li style="margin-bottom: 8px;">For each company, find a key decision-maker on LinkedIn (e.g., VP of Operations, Founder, Managing Director, or Supply Chain Head).</li>
                        <li style="margin-bottom: 8px;">Write a personalized <strong>3-sentence outreach message</strong> (LinkedIn InMail style) pitching GrowX Labs' custom automation or systems development services to them.</li>
                      </ol>
                      
                      <p>Avoid generic pitches. Focus on a specific business problem (e.g., automated inventory tracking, manual order processing errors, or CRM syncing) and make a clear call-to-action to book a brief discovery call.</p>
                      
                      <p>Please reply directly to this email with your target prospects and outreach scripts.</p>
                    </div>
                    
                    <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 1.6; color: #404040;">Best regards,</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: 700; color: #111111;">GrowX Labs HR Team</p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #f0f0f0; text-align: left;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="color: #737373; font-size: 11px; line-height: 1.5;">
                          <strong>GrowX Labs Inc.</strong><br>
                          High-Performance Digital Platforms & Automations<br>
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

    const bccList = ["sai@growxlabs.tech"];
    if (token?.email && token.email !== "sai@growxlabs.tech") {
      bccList.push(token.email);
    }

    const { error: emailError } = await resend.emails.send({
      from: "GrowX Labs HR <hr@growxlabs.tech>",
      to: [candidateEmail],
      bcc: bccList,
      subject: subject,
      html: htmlContent,
    });

    if (emailError) {
      console.error("Resend error sending Stage 2 Assessment email:", emailError);
      return NextResponse.json({ error: "Failed to dispatch email via Resend" }, { status: 500 });
    }

    // 3. Update candidate status to 'contacted' in Supabase
    let updatedCandidate: any = null;
    if (isRecruitmentSchema) {
      const res = await supabaseAdmin
        .schema("recruitment")
        .from("careers_applications")
        .update({ current_stage: "contacted" })
        .eq("id", id)
        .select()
        .single();
      updatedCandidate = res.data;
    } else {
      const res = await supabaseAdmin
        .from("career_applications")
        .update({ status: "contacted", updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      updatedCandidate = res.data;
    }

    return NextResponse.json({ message: "Stage 2 email sent and status updated successfully", data: updatedCandidate });
  } catch (error: any) {
    console.error("Send Assessment API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
