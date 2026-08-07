import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";
import { setCandidateSession } from "@/lib/recruitment/candidate-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const otp = String(body.otp || "").trim();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP code are required" }, { status: 400 });
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    // Always validate against the newest unverified code for this email. This
    // avoids an older OTP row winning when several codes were requested.
    const { data: record, error } = await supabaseAdmin
      .schema("recruitment")
      .from("candidate_otps")
      .select("*")
      .eq("email", email)
      .is("verified_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const storedHash = String(record?.otp_code_hash || "");
    const hashMatches = storedHash.length === otpHash.length && crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(otpHash));
    console.info("[OTP_VERIFY]", { emailHash: crypto.createHash("sha256").update(email).digest("hex").slice(0, 16), otpRecordFound: Boolean(record), expired: Boolean(record && new Date() > new Date(record.expires_at)), alreadyUsed: Boolean(record?.verified_at), hashMatched: hashMatches });
    if (error || !record || !hashMatches) {
      return NextResponse.json({ error: "Invalid verification code. Please try again." }, { status: 400 });
    }

    if (new Date() > new Date(record.expires_at)) {
      return NextResponse.json({ error: "Verification code has expired. Request a new code." }, { status: 400 });
    }

    // Mark OTP as verified
    await supabaseAdmin
      .schema("recruitment")
      .from("candidate_otps")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", record.id);

    // Fetch candidate's applications
    const { data: applications } = await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .select("id,application_reference,submitted_at,current_stage,status,careers_jobs(title,slug)")
      .filter("profile->>email", "eq", email)
      .order("submitted_at", { ascending: false });

    // Set HTTP session cookie for Candidate
    const response = NextResponse.json({
      success: true,
      email,
      applications: (applications || []).map((a: any) => ({
        id: a.id,
        reference: a.application_reference,
        jobTitle: a.careers_jobs?.title || "Specialist",
        submittedAt: a.submitted_at,
        stage: a.current_stage,
        status: a.status,
      })),
    });

    setCandidateSession(response, email);

    return response;
  } catch (error: any) {
    console.error("POST Verify Candidate OTP Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to verify login code" }, { status: 500 });
  }
}
