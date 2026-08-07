import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendRecruitmentEmail } from "@/lib/recruitment/email-service";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
    }

    // Check if any application exists for this email
    const { data: apps, error: appErr } = await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .select("id,candidate_id,profile")
      .filter("profile->>email", "eq", email)
      .limit(1);

    if (appErr || !apps || apps.length === 0) {
      return NextResponse.json(
        { error: "No job application found matching this email address. Please check your email or apply for an open position." },
        { status: 404 }
      );
    }

    // Generate 6-digit numeric OTP code
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(rawOtp).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins validity

    // Store OTP in database
    const { data: otpRecord, error: otpInsertError } = await supabaseAdmin
      .schema("recruitment")
      .from("candidate_otps")
      .insert({
        email,
        otp_code_hash: otpHash,
        expires_at: expiresAt,
      })
      .select("id,created_at,expires_at")
      .single();
    if (otpInsertError || !otpRecord) throw new Error(otpInsertError?.message || "Unable to store verification code");
    console.info("[OTP_REQUEST]", { emailHash: crypto.createHash("sha256").update(email).digest("hex").slice(0, 16), otpRecordId: otpRecord.id, createdAt: otpRecord.created_at, expiresAt: otpRecord.expires_at });

    // Send OTP via Resend email
    await sendRecruitmentEmail({
      to: email,
      subject: `Your Candidate Portal Login Code: ${rawOtp} | GrowXLabs Careers`,
      templateKey: "general",
      html: `
        <p>Hi,</p>
        <p>Your 6-digit login verification code for the GrowXLabs Candidate Portal is:</p>
        <div style="background-color:#f1f5f9; border:1px border-slate-200; padding:20px; text-align:center; border-radius:12px; margin:16px 0;">
          <span style="font-size:32px; font-weight:800; letter-spacing:6px; color:#0075de;">${rawOtp}</span>
        </div>
        <p>This code is valid for 15 minutes. If you did not request this login code, you can safely ignore this email.</p>
        <p class="text-muted">GrowXLabs Recruitment Team</p>
      `,
    });

    return NextResponse.json({ message: "Verification code sent to your email address." });
  } catch (error: any) {
    console.error("POST Send Candidate OTP Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to send login verification code" }, { status: 500 });
  }
}
