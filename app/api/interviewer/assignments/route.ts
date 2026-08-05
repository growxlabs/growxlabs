import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email.toLowerCase();

    // Fetch assignments for logged-in interviewer
    const { data: assignments, error } = await supabaseAdmin
      .schema("recruitment")
      .from("interview_assignments")
      .select("*, interviews(*)")
      .or(`interviewer_user_id.eq.${userId},interviewer_email.eq.${userEmail}`)
      .order("access_starts_at", { ascending: false });

    if (error) throw error;

    // Fetch candidate names and job titles for display
    const appIds = [...new Set((assignments || []).map((a) => a.application_id))];
    const { data: applications } = appIds.length
      ? await supabaseAdmin.schema("recruitment").from("careers_applications").select("id,profile,candidate_id,application_reference,job_id").in("id", appIds)
      : { data: [] as any[] };

    const jobIds = [...new Set((assignments || []).map((a) => a.job_id))];
    const { data: jobs } = jobIds.length
      ? await supabaseAdmin.schema("recruitment").from("careers_jobs").select("id,title").in("id", jobIds)
      : { data: [] as any[] };

    const appMap = new Map((applications || []).map((a) => [a.id, a]));
    const jobMap = new Map((jobs || []).map((j) => [j.id, j.title]));

    const enriched = (assignments || []).map((asgn) => {
      const app = appMap.get(asgn.application_id);
      const candidateName = app?.profile?.full_name || app?.candidate_id || asgn.candidate_id;
      const jobTitle = jobMap.get(asgn.job_id) || "Specialist";

      const now = new Date();
      const startsAt = new Date(asgn.access_starts_at);
      const expiresAt = new Date(asgn.access_expires_at);

      let accessState = "active";
      if (asgn.status === "revoked" || asgn.revoked_at) accessState = "revoked";
      else if (asgn.status === "cancelled") accessState = "cancelled";
      else if (now < startsAt) accessState = "upcoming";
      else if (now >= expiresAt) accessState = "expired";

      return {
        ...asgn,
        candidate_name: candidateName,
        job_title: jobTitle,
        application_reference: app?.application_reference,
        access_state: accessState,
      };
    });

    return NextResponse.json({ assignments: enriched });
  } catch (error: any) {
    console.error("GET Interviewer Assignments Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch assignments" }, { status: 500 });
  }
}
