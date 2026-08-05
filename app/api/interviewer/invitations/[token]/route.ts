import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";
import { logInterviewAccessEvent } from "@/lib/recruitment/interviewer-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Authentication required before accepting invitation" }, { status: 401 });
    }

    const { token: rawToken } = await params;
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Fetch assignment matching hashed token
    const { data: assignment, error } = await supabaseAdmin
      .schema("recruitment")
      .from("interview_assignments")
      .select("*")
      .eq("invitation_token_hash", tokenHash)
      .maybeSingle();

    if (error || !assignment) {
      return NextResponse.json({ error: "Invalid or expired invitation token." }, { status: 404 });
    }

    // Check invitation token expiration
    if (assignment.invitation_expires_at && new Date() > new Date(assignment.invitation_expires_at)) {
      return NextResponse.json({ error: "This invitation link has expired. Contact HR to resend." }, { status: 400 });
    }

    // Verify logged-in email matches assigned interviewer email
    const userEmail = session.user.email.toLowerCase();
    const assignedEmail = assignment.interviewer_email.toLowerCase();

    if (userEmail !== assignedEmail && !["ADMIN", "CO_ADMIN"].includes(String(session.user.role || "").toUpperCase())) {
      return NextResponse.json(
        { error: `This invitation was issued to ${assignedEmail}. Please sign in with ${assignedEmail} to accept.` },
        { status: 403 }
      );
    }

    // Accept assignment
    const { data: updated, error: updateErr } = await supabaseAdmin
      .schema("recruitment")
      .from("interview_assignments")
      .update({
        interviewer_user_id: session.user.id,
        status: "active",
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", assignment.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Log audit event
    await logInterviewAccessEvent({
      assignmentId: assignment.id,
      interviewId: assignment.interview_id,
      userId: session.user.id,
      userEmail,
      eventType: "invitation_accepted",
    });

    return NextResponse.json({
      success: true,
      interviewId: assignment.interview_id,
      assignment: updated,
    });
  } catch (error: any) {
    console.error("POST Accept Invitation Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to accept invitation" }, { status: 500 });
  }
}
