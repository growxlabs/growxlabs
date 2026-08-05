import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const otp = String(body.otp || "").trim();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP code are required" }, { status: 400 });
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    // Query OTP record
    const { data: record, error } = await supabaseAdmin
      .schema("recruitment")
      .from("candidate_otps")
      .select("*")
      .eq("email", email)
      .eq("otp_code_hash", otpHash)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !record) {
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

    response.cookies.set("candidate_session_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("POST Verify Candidate OTP Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to verify login code" }, { status: 500 });
  }
}
