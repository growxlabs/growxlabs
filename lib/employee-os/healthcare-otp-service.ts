import "server-only";
import crypto from "crypto";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { GrowXLabsEmailLayout } from "@/lib/email/growxlabs-layout";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const HEALTHCARE_FROM_EMAIL = "GrowXLabs Healthcare <noreply@growxlabs.tech>";

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  user?: {
    id: string;
    email: string;
    organisation_id: string;
    display_name: string | null;
  };
  identity?: {
    id: string;
    employee_id: string;
    workspace_status: string;
  };
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  designation?: string;
}

interface StoredOtpRecord {
  id: string;
  email: string;
  otp_code_hash: string;
  expires_at: string;
  consumed_at: string | null;
  attempts: number;
  created_at: string;
}

// Resilient memory store fallback if database migration 0043 is pending in Supabase
const fallbackMemoryOtps = new Map<string, StoredOtpRecord[]>();

/**
 * Checks whether an email belongs to an active, provisioned Healthcare Lead Manager.
 * Strictly verifies identity.users, identity.employee_identities, people.employees,
 * and current active employment_records with designation "Healthcare Lead Manager".
 */
export async function checkHealthcareLeadManagerEligibility(
  email: string
): Promise<EligibilityResult> {
  const emailLower = email.trim().toLowerCase();
  if (!emailLower || !emailLower.includes("@")) {
    return { eligible: false, reason: "invalid_email" };
  }

  // 1. Check active user in identity.users
  const { data: user, error: userError } = await supabaseAdmin
    .schema("identity")
    .from("users")
    .select("id,email,status,organisation_id,display_name,locked_until")
    .eq("email", emailLower)
    .eq("status", "active")
    .maybeSingle();

  if (userError || !user) {
    return { eligible: false, reason: "user_not_found_or_inactive" };
  }

  if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
    return { eligible: false, reason: "account_locked" };
  }

  // 2. Check active employee identity in identity.employee_identities
  const { data: identity, error: identityError } = await supabaseAdmin
    .schema("identity")
    .from("employee_identities")
    .select("id,employee_id,workspace_status")
    .eq("auth_user_id", user.id)
    .eq("organisation_id", user.organisation_id)
    .eq("workspace_status", "active")
    .maybeSingle();

  if (identityError || !identity || !identity.employee_id) {
    return { eligible: false, reason: "workspace_not_active" };
  }

  // 3. Check active employee in people.employees (not soft-deleted)
  const { data: employee, error: employeeError } = await supabaseAdmin
    .schema("people")
    .from("employees")
    .select("id,first_name,last_name,deleted_at")
    .eq("id", identity.employee_id)
    .eq("organisation_id", user.organisation_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (employeeError || !employee) {
    return { eligible: false, reason: "employee_record_missing" };
  }

  // 4. Check active employment record in people.employment_records
  const { data: employment, error: employmentError } = await supabaseAdmin
    .schema("people")
    .from("employment_records")
    .select("id,status,designation_id,valid_to")
    .eq("employee_id", employee.id)
    .eq("organisation_id", user.organisation_id)
    .is("valid_to", null)
    .maybeSingle();

  if (
    employmentError ||
    !employment ||
    !["active", "probation", "notice"].includes(employment.status)
  ) {
    return { eligible: false, reason: "employment_not_active" };
  }

  if (!employment.designation_id) {
    return { eligible: false, reason: "no_designation_assigned" };
  }

  // 5. Check designation name matches "Healthcare Lead Manager"
  const { data: designation, error: designationError } = await supabaseAdmin
    .schema("people")
    .from("designations")
    .select("name")
    .eq("id", employment.designation_id)
    .eq("organisation_id", user.organisation_id)
    .maybeSingle();

  if (designationError || !designation?.name) {
    return { eligible: false, reason: "designation_not_found" };
  }

  const normalizedDesignation = designation.name.trim().toLowerCase();
  if (normalizedDesignation !== "healthcare lead manager") {
    return { eligible: false, reason: "not_healthcare_lead_manager" };
  }

  return {
    eligible: true,
    user: {
      id: user.id,
      email: user.email,
      organisation_id: user.organisation_id,
      display_name: user.display_name,
    },
    identity: {
      id: identity.id,
      employee_id: identity.employee_id,
      workspace_status: identity.workspace_status,
    },
    employee: {
      id: employee.id,
      first_name: employee.first_name,
      last_name: employee.last_name,
    },
    designation: designation.name,
  };
}

import {
  generateOtpCode,
  hashOtp,
  verifyOtpHash,
  isOtpExpired,
} from "./healthcare-otp-utils";

export { generateOtpCode, hashOtp, verifyOtpHash, isOtpExpired };

/**
 * Resend cooldown and rate limit check.
 */
export async function checkOtpRateLimit(
  email: string
): Promise<{ allowed: boolean; waitSeconds?: number; error?: string }> {
  const emailLower = email.trim().toLowerCase();
  const cooldownPeriod = 60; // 60s cooldown

  // Check database first
  try {
    const { data: recentOtp } = await supabaseAdmin
      .schema("identity")
      .from("healthcare_otps")
      .select("created_at")
      .eq("email", emailLower)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentOtp?.created_at) {
      const elapsedSeconds = Math.floor(
        (Date.now() - new Date(recentOtp.created_at).getTime()) / 1000
      );
      if (elapsedSeconds < cooldownPeriod) {
        return {
          allowed: false,
          waitSeconds: cooldownPeriod - elapsedSeconds,
          error: `Please wait ${cooldownPeriod - elapsedSeconds}s before requesting a new code.`,
        };
      }
    }
  } catch {
    // If DB check fails, fallback to memory store
  }

  // Check memory store
  const memList = fallbackMemoryOtps.get(emailLower) || [];
  const latestMem = memList[memList.length - 1];
  if (latestMem) {
    const elapsedSeconds = Math.floor(
      (Date.now() - new Date(latestMem.created_at).getTime()) / 1000
    );
    if (elapsedSeconds < cooldownPeriod) {
      return {
        allowed: false,
        waitSeconds: cooldownPeriod - elapsedSeconds,
        error: `Please wait ${cooldownPeriod - elapsedSeconds}s before requesting a new code.`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Sends a Healthcare Lead Manager OTP to the provided email if eligible.
 * Returns a generic success response to prevent email enumeration.
 */
export async function sendHealthcareOtp(
  email: string
): Promise<{ success: boolean; message: string; cooldownSeconds?: number }> {
  const emailLower = email.trim().toLowerCase();
  const genericMessage =
    "If this account is eligible, a verification code has been sent.";

  if (!emailLower || !emailLower.includes("@")) {
    return { success: false, message: "Valid email address is required." };
  }

  // 1. Check eligibility
  const eligibility = await checkHealthcareLeadManagerEligibility(emailLower);
  if (!eligibility.eligible) {
    // Return generic success to avoid email enumeration
    return { success: true, message: genericMessage, cooldownSeconds: 60 };
  }

  // 2. Check rate limit / resend cooldown
  const rateLimit = await checkOtpRateLimit(emailLower);
  if (!rateLimit.allowed) {
    return {
      success: false,
      message: rateLimit.error || "Please wait before requesting a new code.",
      cooldownSeconds: rateLimit.waitSeconds,
    };
  }

  // 3. Generate 6-digit OTP code & 10-minute expiry
  const rawCode = generateOtpCode();
  const codeHash = hashOtp(rawCode);
  const nowIso = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // 4. Invalidate prior unconsumed OTPs in memory store
  const memList = fallbackMemoryOtps.get(emailLower) || [];
  memList.forEach((r) => {
    if (!r.consumed_at) r.consumed_at = nowIso;
  });

  // 5. Invalidate prior unconsumed OTPs in database
  try {
    await supabaseAdmin
      .schema("identity")
      .from("healthcare_otps")
      .update({ consumed_at: nowIso })
      .eq("email", emailLower)
      .is("consumed_at", null);
  } catch {
    // Best effort
  }

  // 6. Store OTP record in database (with memory store fallback)
  let persistedInDb = false;
  try {
    const { error: insertError } = await supabaseAdmin
      .schema("identity")
      .from("healthcare_otps")
      .insert({
        email: emailLower,
        otp_code_hash: codeHash,
        expires_at: expiresAt,
        attempts: 0,
      });

    if (!insertError) {
      persistedInDb = true;
    } else {
      console.warn("DB OTP store fallback to memory store:", insertError.message);
    }
  } catch (err: any) {
    console.warn("DB OTP store caught error; falling back to memory store:", err?.message);
  }

  // Always keep in memory store as fallback
  const newMemRecord: StoredOtpRecord = {
    id: crypto.randomUUID(),
    email: emailLower,
    otp_code_hash: codeHash,
    expires_at: expiresAt,
    consumed_at: null,
    attempts: 0,
    created_at: nowIso,
  };
  memList.push(newMemRecord);
  fallbackMemoryOtps.set(emailLower, memList);

  // 7. Send OTP via Resend
  if (resend) {
    try {
      const recipientName = eligibility.employee?.first_name || "Healthcare Lead Manager";
      const emailContent = `
        <p style="margin:0 0 16px;color:#1e293b;font-size:15px;line-height:24px;">
          Hello <strong>${recipientName}</strong>,
        </p>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:22px;">
          Use the 6-digit verification code below to sign in to your GrowXLabs Healthcare Lead Manager Workspace.
        </p>
        <div style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:24px 16px;text-align:center;margin:24px 0;">
          <div style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:36px;font-weight:700;letter-spacing:10px;color:#1D4ED8;margin-left:10px;">
            ${rawCode}
          </div>
          <p style="margin:12px 0 0;font-size:12px;color:#64748B;font-weight:500;">
            Valid for 10 minutes · Single use only
          </p>
        </div>
        <p style="margin:24px 0 0;font-size:13px;color:#64748B;line-height:20px;">
          If you did not request this login code, no action is needed. Your account remains secure.
        </p>
      `;

      const htmlBody = GrowXLabsEmailLayout({
        context: "Healthcare Workspace Verification",
        content: emailContent,
        footerNote: "GROWXLABS HEALTHCARE ACCESS · CONFIDENTIAL",
      });

      await resend.emails.send({
        from: HEALTHCARE_FROM_EMAIL,
        to: emailLower,
        subject: `Your Healthcare Login Code: ${rawCode} | GrowXLabs`,
        html: htmlBody,
      });
    } catch (emailError: any) {
      console.error("Failed to send healthcare OTP email:", { message: emailError?.message });
      return {
        success: false,
        message: "Failed to dispatch verification email. Please try again shortly.",
      };
    }
  }

  return { success: true, message: genericMessage, cooldownSeconds: 60 };
}

/**
 * Verifies a 6-digit Healthcare OTP code for an email.
 * - Single-use: marks consumed_at on successful verification.
 * - Max attempts: locks after 5 failed attempts.
 * - Enforces 10-minute expiry.
 * - Constant-time timingSafeEqual hash comparison.
 */
export async function verifyHealthcareOtp(
  email: string,
  code: string
): Promise<{
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    organisation_id: string;
    display_name: string | null;
  };
}> {
  const emailLower = email.trim().toLowerCase();
  const trimmedCode = code.trim();

  if (!emailLower || !trimmedCode || trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
    return { success: false, error: "Please enter a valid 6-digit verification code." };
  }

  // 1. Fetch newest unconsumed OTP from DB or memory
  let record: StoredOtpRecord | null = null;
  let source: "db" | "memory" = "db";

  try {
    const { data: dbRecord } = await supabaseAdmin
      .schema("identity")
      .from("healthcare_otps")
      .select("id,email,otp_code_hash,expires_at,attempts,consumed_at,created_at")
      .eq("email", emailLower)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (dbRecord) {
      record = dbRecord as StoredOtpRecord;
      source = "db";
    }
  } catch {
    // DB query failed; will check memory
  }

  if (!record) {
    const memList = fallbackMemoryOtps.get(emailLower) || [];
    const unconsumedMem = memList.filter((r) => !r.consumed_at);
    if (unconsumedMem.length > 0) {
      record = unconsumedMem[unconsumedMem.length - 1];
      source = "memory";
    }
  }

  if (!record) {
    return { success: false, error: "Invalid or expired verification code. Please request a new code." };
  }

  // 2. Check maximum verification attempts (max 5)
  if (record.attempts >= 5) {
    // Invalidate record due to brute force attempts
    if (source === "db") {
      await supabaseAdmin
        .schema("identity")
        .from("healthcare_otps")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", record.id);
    }
    record.consumed_at = new Date().toISOString();

    return {
      success: false,
      error: "Too many incorrect attempts. For security, please request a new verification code.",
    };
  }

  // 3. Increment attempts count
  record.attempts += 1;
  if (source === "db") {
    try {
      await supabaseAdmin
        .schema("identity")
        .from("healthcare_otps")
        .update({ attempts: record.attempts })
        .eq("id", record.id);
    } catch {
      // Best effort
    }
  }

  // 4. Check expiry
  if (Date.now() > new Date(record.expires_at).getTime()) {
    return {
      success: false,
      error: "Verification code has expired. Please request a new code.",
    };
  }

  // 5. Compare hash using timingSafeEqual
  const inputHash = hashOtp(trimmedCode);
  const storedHash = String(record.otp_code_hash || "");
  const hashMatches =
    storedHash.length === inputHash.length &&
    crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(inputHash));

  if (!hashMatches) {
    const remainingAttempts = 5 - record.attempts;
    return {
      success: false,
      error:
        remainingAttempts > 0
          ? `Incorrect code. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining.`
          : "Incorrect code. Please request a new verification code.",
    };
  }

  // 6. Invalidate/consume code immediately upon successful match
  const consumedIso = new Date().toISOString();
  record.consumed_at = consumedIso;
  if (source === "db") {
    try {
      await supabaseAdmin
        .schema("identity")
        .from("healthcare_otps")
        .update({ consumed_at: consumedIso })
        .eq("id", record.id);
    } catch {
      // Best effort
    }
  }

  // 7. Verify eligibility and retrieve user context
  const eligibility = await checkHealthcareLeadManagerEligibility(emailLower);
  if (!eligibility.eligible || !eligibility.user) {
    return {
      success: false,
      error: "This account is not authorized for the Healthcare workspace.",
    };
  }

  return {
    success: true,
    user: eligibility.user,
  };
}
