import { NextResponse } from "next/server";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCandidateSession } from "@/lib/recruitment/candidate-session";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const reference = url.searchParams.get("reference")?.trim();
    const session = getCandidateSession(request);
    const email = session?.email;

    if (!email) {
      return NextResponse.json({ error: "Please sign in to view your applications." }, { status: 401 });
    }

    // 1. Fetch Candidate Applications
    let query = supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .select("id,application_reference,candidate_id,current_stage,status,profile,submitted_at,updated_at,job_id,resume_path,cover_letter,careers_jobs(title,slug,department,description)")
      .eq("organisation_id", CAREERS_ORGANISATION);

    query = query.filter("profile->>email", "eq", email);
    if (reference) query = query.or(`application_reference.eq.${reference},id.eq.${reference}`);

    const { data: applications, error: appErr } = await query;

    if (appErr || !applications || applications.length === 0) {
      return NextResponse.json({ error: "Application not found. Check the reference number and email address." }, { status: 404 });
    }

    // Pick target application
    const application = reference
      ? applications.find((a) => a.application_reference === reference) || applications[0]
      : applications[0];

    const candidateEmail = String(application.profile?.email || email || "").toLowerCase();

    if (String(application.profile?.email || "").toLowerCase() !== email) {
      return NextResponse.json({ error: "Application not found. Verification failed." }, { status: 404 });
    }

    // 2. Fetch Linked Details in Parallel
    const [historyRes, interviewsRes, messagesRes, offersRes, rescheduleRes, responseRes, playbooksRes] = await Promise.all([
      supabaseAdmin
        .schema("recruitment")
        .from("application_stage_history")
        .select("from_stage,to_stage,notes,created_at")
        .eq("application_id", application.id)
        .order("created_at", { ascending: true }),

      supabaseAdmin
        .schema("recruitment")
        .from("interviews")
        .select("id,scheduled_at,duration_minutes,meeting_provider,meeting_join_url,status,title,instructions")
        .eq("application_id", application.id)
        .order("scheduled_at", { ascending: false }),

      supabaseAdmin
        .schema("recruitment")
        .from("email_logs")
        .select("id,template_key,subject,status,sent_at,created_at,recipient_email")
        .eq("application_id", application.id)
        .order("created_at", { ascending: false }),

      supabaseAdmin
        .schema("recruitment")
        .from("offers")
        .select("id,status,start_date,salary,offer_letter_url,created_at")
        .eq("application_id", application.id)
        .order("created_at", { ascending: false })
        .limit(1),

      supabaseAdmin
        .schema("recruitment")
        .from("candidate_reschedule_requests")
        .select("id,reason,preferred_times,status,created_at")
        .eq("application_id", application.id)
        .order("created_at", { ascending: false }),

      supabaseAdmin
        .schema("recruitment")
        .from("candidate_offer_responses")
        .select("id,decision,notes,responded_at")
        .eq("application_id", application.id)
        .order("created_at", { ascending: false })
        .limit(1),

      supabaseAdmin
        .schema("recruitment")
        .from("candidate_playbooks")
        .select("assigned_at,published_at,opened_at,last_viewed_at,status,playbook:interview_playbooks(slug,title,subtitle,description,version,updated_at)")
        .eq("application_id", application.id)
        .in("status", ["published", "opened"])
        .order("published_at", { ascending: false }),
    ]);

    // 3. Build Stage Timeline with Timestamps
    const stageHistory = historyRes.data || [];
    const timeline = [
      { stage: "applied", label: "Applied", timestamp: application.submitted_at, completed: true },
      { stage: "under_review", label: "Under Review", timestamp: stageHistory.find((h) => h.to_stage === "under_review")?.created_at || null, completed: false },
      { stage: "screening", label: "Screening", timestamp: stageHistory.find((h) => h.to_stage === "screening")?.created_at || null, completed: false },
      { stage: "interview", label: "Interview Scheduled", timestamp: stageHistory.find((h) => h.to_stage === "interview")?.created_at || null, completed: false },
      { stage: "assessment", label: "Assessment", timestamp: stageHistory.find((h) => h.to_stage === "assessment")?.created_at || null, completed: false },
      { stage: "offer", label: "Offer", timestamp: stageHistory.find((h) => h.to_stage === "offer")?.created_at || null, completed: false },
      { stage: "hired", label: "Hired", timestamp: stageHistory.find((h) => h.to_stage === "hired")?.created_at || null, completed: false },
    ];

    const currentStageIdx = timeline.findIndex((t) => t.stage === String(application.current_stage).toLowerCase());
    timeline.forEach((t, i) => {
      if (currentStageIdx >= 0 && i <= currentStageIdx) {
        t.completed = true;
      }
    });

    if (String(application.current_stage).toLowerCase() === "rejected" || String(application.status).toLowerCase() === "rejected") {
      timeline.push({
        stage: "rejected",
        label: "Application Closed / Rejected",
        timestamp: stageHistory.find((h) => h.to_stage === "rejected")?.created_at || application.updated_at,
        completed: true,
      });
    }

    // 4. Enrich Scheduled Interviews with Join Window Validation
    const now = new Date();
    const interviews = (interviewsRes.data || []).map((inv: any) => {
      const scheduledAt = new Date(inv.scheduled_at);
      const durationMins = inv.duration_minutes || 30;

      const joinStartsAt = new Date(scheduledAt.getTime() - 15 * 60 * 1000);
      const joinExpiresAt = new Date(scheduledAt.getTime() + (durationMins + 30) * 60 * 1000);
      const isJoinEnabled = now >= joinStartsAt && now < joinExpiresAt;

      // Generate Google Calendar Link
      const gcalTitle = encodeURIComponent(`Interview: ${(application.careers_jobs as any)?.title || "GrowXLabs"} with ${application.profile?.full_name || "Candidate"}`);
      const gcalStart = scheduledAt.toISOString().replace(/-|:|\.\d\d\d/g, "");
      const gcalEnd = new Date(scheduledAt.getTime() + durationMins * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
      const gcalDetails = encodeURIComponent(`GrowXLabs Interview Call. Meeting Link: ${inv.meeting_join_url || "https://meet.google.com/fau-nfbw-kfu"}`);
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalTitle}&dates=${gcalStart}/${gcalEnd}&details=${gcalDetails}`;

      return {
        ...inv,
        meeting_link: isJoinEnabled ? inv.meeting_join_url || "https://meet.google.com/fau-nfbw-kfu" : null,
        is_join_enabled: isJoinEnabled,
        google_calendar_url: googleCalendarUrl,
      };
    });

    // 5. Build Documents List
    const documents = [];
    if (application.resume_path || application.profile?.resume_url) {
      documents.push({
        id: "resume",
        type: "Resume",
        name: `${application.profile?.full_name || "Candidate"}_Resume.pdf`,
        url: application.resume_path || application.profile?.resume_url,
      });
    }

    const offerData = offersRes.data?.[0] || null;
    if (offerData?.offer_letter_url) {
      documents.push({
        id: "offer_letter",
        type: "Offer Letter",
        name: `Offer_Letter_${application.application_reference}.pdf`,
        url: offerData.offer_letter_url,
      });
    }

    return NextResponse.json({
      candidate: {
        name: application.profile?.full_name || "Candidate",
        email: candidateEmail,
        phone: application.profile?.phone || null,
        location: application.profile?.location || null,
        linkedInURL: application.profile?.linkedInURL || null,
        portfolioURL: application.profile?.portfolio_url || application.profile?.portfolioURL || null,
      },
      application: {
        id: application.id,
        reference: application.application_reference,
        jobTitle: (application.careers_jobs as any)?.title || "Role",
        jobDepartment: (application.careers_jobs as any)?.department || "Engineering",
        jobDescription: (application.careers_jobs as any)?.description || null,
        appliedAt: application.submitted_at,
        updatedAt: application.updated_at,
        status: application.status,
        stage: application.current_stage,
        profile: application.profile,
        resumePath: application.resume_path,
        coverLetter: application.cover_letter || application.profile?.cover_letter || null,
      },
      allApplications: (applications || []).map((a: any) => ({
        id: a.id,
        reference: a.application_reference,
        jobTitle: a.careers_jobs?.title || "Role",
        appliedAt: a.submitted_at,
        stage: a.current_stage,
        status: a.status,
      })),
      timeline,
      interviews,
      messages: messagesRes.data || [],
      offer: offerData ? {
        ...offerData,
        candidate_response: responseRes.data?.[0] || null,
      } : null,
      rescheduleRequests: rescheduleRes.data || [],
      documents,
      playbooks: (playbooksRes.data || []).map((item: any) => ({
        ...item,
        playbook: Array.isArray(item.playbook) ? item.playbook[0] : item.playbook,
      })),
    });
  } catch (error: any) {
    console.error("GET Candidate Portal API Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch candidate portal data" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const reference = String(body.reference || "").trim();
    const session = getCandidateSession(request);
    const email = session?.email;

    if (!reference || !email) {
      return NextResponse.json({ error: "Please sign in before updating your profile." }, { status: 401 });
    }

    const { data: application, error } = await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .select("id,profile")
      .eq("organisation_id", CAREERS_ORGANISATION)
      .eq("application_reference", reference)
      .maybeSingle();

    if (error || !application || String(application.profile?.email || "").toLowerCase() !== email) {
      return NextResponse.json({ error: "Application verification failed." }, { status: 404 });
    }

    const profile = { ...application.profile };

    if (typeof body.phone === "string") profile.phone = body.phone.trim();
    if (typeof body.address === "string") profile.location = body.address.trim();
    if (typeof body.linkedInURL === "string") profile.linkedInURL = body.linkedInURL.trim();
    if (typeof body.portfolioURL === "string") profile.portfolio_url = body.portfolioURL.trim();
    if (typeof body.resumeUrl === "string") profile.resume_url = body.resumeUrl.trim();

    const { data: updated, error: updateErr } = await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .update({
        profile,
        ...(body.resumeUrl ? { resume_path: body.resumeUrl } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", application.id)
      .select("profile,updated_at")
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({ profile: updated.profile, updatedAt: updated.updated_at, message: "Profile updated successfully." });
  } catch (error: any) {
    console.error("PATCH Candidate Profile Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update profile" }, { status: 500 });
  }
}
