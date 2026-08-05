import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getToken } from "next-auth/jwt";
import { Resend } from "resend";
import crypto from "crypto";

// Helper to sign JWT using Node's crypto module
function signGoogleJWT(payload: any, privateKey: string): string {
  const header = { alg: "RS256", typ: "JWT" };
  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sign = crypto.createSign("RSA-SHA256");
  sign.write(`${base64Header}.${base64Payload}`);
  sign.end();
  const signature = sign.sign(privateKey, "base64url");
  return `${base64Header}.${base64Payload}.${signature}`;
}

// Helper to get Google OAuth2 Token
async function getGoogleAccessToken(email: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: email,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };
  const jwt = signGoogleJWT(payload, privateKey.replace(/\\n/g, "\n"));
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data.access_token;
}

// Create Google Calendar event on hr@growxlabs.tech calendar and return the Google Meet URL
async function createHRCalendarEvent(
  name: string, 
  email: string, 
  dateTimeStr: string, 
  customMeetLink: string | null, 
  role: string
): Promise<string> {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const calendarId = "hr@growxlabs.tech"; // HR specific calendar
  const defaultMeetLink = customMeetLink || process.env.GOOGLE_MEET_LINK || "https://meet.google.com/fau-nfbw-kfu";

  if (!serviceAccountEmail || !privateKey) {
    console.warn("Google Calendar service account variables not configured.");
    return defaultMeetLink;
  }

  try {
    const token = await getGoogleAccessToken(serviceAccountEmail, privateKey);
    const startDateTime = new Date(dateTimeStr);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30-min slot

    const requestId = crypto.randomBytes(16).toString("hex");

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          summary: `SDR Interview | GrowX Labs & ${name}`,
          description: `GrowX Labs Interview Invitation.\n\nCandidate Name: ${name}\nCandidate Email: ${email}\nRole: ${role}`,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: "Asia/Kolkata"
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: "Asia/Kolkata"
          },
          attendees: [
            { email: email },
            { email: "sai@growxlabs.tech" }
          ],
          conferenceData: customMeetLink ? undefined : {
            createRequest: {
              requestId: requestId,
              conferenceSolutionKey: {
                type: "hangoutsMeet"
              }
            }
          }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Google Calendar event creation failed for HR:", data);
      return defaultMeetLink;
    }

    // Try to extract Google Meet link from conferenceData
    const meetEntryPoint = data.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === "video");
    if (meetEntryPoint?.uri) {
      console.log("Successfully created Google Calendar event with auto-generated Meet link:", meetEntryPoint.uri);
      return meetEntryPoint.uri;
    }

    console.log("Successfully created Google Calendar event on HR calendar:", data.htmlLink);
    return defaultMeetLink;
  } catch (error) {
    console.error("Google Calendar API connection error:", error);
    return defaultMeetLink;
  }
}

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

    const adminRole = token.role;
    if (adminRole !== "ADMIN" && adminRole !== "CO_ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { id, dateTime, customMeetLink } = body;

    if (!id || !dateTime) {
      return NextResponse.json({ error: "Application ID and Interview Date/Time are required" }, { status: 400 });
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

    // 2. Write event to the hr@growxlabs.tech Calendar and obtain the Meet URL
    const meetUrl = await createHRCalendarEvent(candidateName, candidateEmail, dateTime, customMeetLink, targetRole);

    // 3. Prepare Resend email payload
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === "your_resend_key_here") {
      return NextResponse.json({ error: "Resend API key missing." }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const subject = `Interview Schedule: Sales Development Representative (SDR) | GrowX Labs`;

    const formattedDate = new Date(dateTime).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const formattedTime = new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short"
    });

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
                    <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #111111; text-transform: uppercase; letter-spacing: 0.05em; font-family: monospace;">// STAGE 3: INTERVIEW INVITATION</h2>
                    <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #404040;">Hi ${candidateName},</p>
                    
                    <div style="font-size: 14px; line-height: 1.6; color: #404040; margin-bottom: 25px;">
                      <p>We are pleased to invite you to schedule the next phase of your evaluation for the <strong>${targetRole}</strong> position at GrowX Labs.</p>
                      <p>We would love to coordinate your live technical discovery and mock outreach roleplay call.</p>
                      
                      <div style="background-color: #f4f4f5; border-left: 4px solid #000000; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <h4 style="margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: #111;">Meeting Details:</h4>
                        <p style="margin: 0; font-size: 13px;">📅 <strong>Date:</strong> ${formattedDate}</p>
                        <p style="margin: 5px 0 0 0; font-size: 13px;">⏰ <strong>Time:</strong> ${formattedTime}</p>
                        <p style="margin: 5px 0 0 0; font-size: 13px;">📍 <strong>Platform:</strong> <a href="${meetUrl}" style="color: #3b82f6; text-decoration: underline; font-weight: bold;">Join Google Meet</a></p>
                      </div>
                      
                      <p>Please check the calendar invite sent to your address and confirm your availability. We look forward to speaking with you.</p>
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
      console.error("Resend error sending interview invite email:", emailError);
      return NextResponse.json({ error: "Failed to dispatch email via Resend" }, { status: 500 });
    }

    // 4. Update candidate status to 'contacted' in Supabase
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

    return NextResponse.json({ message: "Interview scheduled and email invitation dispatched successfully", data: updatedCandidate });
  } catch (error: any) {
    console.error("Schedule Interview API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
