import { supabaseAdmin } from "../supabase/admin.ts";
import {
  CAREERS_ORGANISATION,
  slugify,
  nextJobReference,
  nextApplicationReference,
} from "./jobs.ts";

export interface CareerApplicationSyncInput {
  name: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  role?: string | null;
  experience?: string | null;
  techStack?: string | null;
  github?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  resume?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  expectedSalary?: string | null;
  noticePeriod?: string | null;
  employmentType?: string | null;
  motivation?: string | null;
  status?: string | null;
}

/**
 * Infer HRMS department name based on candidate's applied role.
 */
export function inferDepartment(role: string): string {
  const r = (role || "").toLowerCase();
  if (
    r.includes("engineer") ||
    r.includes("software") ||
    r.includes("ai") ||
    r.includes("hardware") ||
    r.includes("robot") ||
    r.includes("developer") ||
    r.includes("deploy")
  ) {
    return "Engineering";
  }
  if (r.includes("design") || r.includes("ui") || r.includes("ux")) {
    return "Design";
  }
  if (r.includes("market") || r.includes("content") || r.includes("brand")) {
    return "Marketing";
  }
  if (
    r.includes("growth") ||
    r.includes("business") ||
    r.includes("sales") ||
    r.includes("sdr") ||
    r.includes("bde")
  ) {
    return "Sales & Growth";
  }
  return "General Operations";
}

/**
 * Maps legacy or alias role titles to published HRMS job titles.
 */
export function normalizeRoleToHrmsTitle(role: string): string {
  const trimmed = (role || "").trim();
  if (!trimmed) return "General Application";

  const lower = trimmed.toLowerCase();
  if (lower.includes("sales development") || lower.includes("sdr")) {
    return "Business Development Executive (BDE)";
  }
  if (lower === "ai / llm engineer" || lower.includes("full-stack developer")) {
    return "AI Engineering/Software Engineering";
  }
  return trimmed;
}

/**
 * Ensures a published job opening exists in recruitment.careers_jobs for the applied role.
 * Returns the matching job UUID.
 */
export async function ensureJobForRole(roleTitle: string): Promise<string> {
  const normalizedTitle = normalizeRoleToHrmsTitle(roleTitle);
  const targetSlug = slugify(normalizedTitle);

  // 1. Try finding existing job by exact title, slug, or normalized title
  const { data: existingJobs } = await supabaseAdmin
    .schema("recruitment")
    .from("careers_jobs")
    .select("id,title,slug")
    .eq("organisation_id", CAREERS_ORGANISATION);

  if (existingJobs && existingJobs.length > 0) {
    const match = existingJobs.find(
      (j) =>
        j.title?.toLowerCase() === normalizedTitle.toLowerCase() ||
        j.slug === targetSlug ||
        j.title?.toLowerCase() === roleTitle.trim().toLowerCase()
    );
    if (match) {
      return match.id;
    }
  }

  // 2. Not found, create new published job opening
  const jobReference = await nextJobReference();
  const department = inferDepartment(normalizedTitle);

  const { data: newJob, error: createError } = await supabaseAdmin
    .schema("recruitment")
    .from("careers_jobs")
    .insert({
      organisation_id: CAREERS_ORGANISATION,
      title: normalizedTitle,
      slug: targetSlug,
      job_reference: jobReference,
      department,
      location: "Remote / Hybrid",
      employment_type: "Full-time",
      workplace_type: "Remote",
      openings: 5,
      summary: `GrowX Labs is seeking exceptional talent for ${normalizedTitle}.`,
      description: `Join our team to build next-generation AI and autonomous systems. Role: ${normalizedTitle}.`,
      responsibilities: [
        "Drive core technical and business objectives with high agency",
        "Collaborate closely with founders and cross-functional teams",
      ],
      requirements: [
        "Strong hands-on background in the relevant technical or functional domain",
        "Proven execution speed and problem-solving mindset",
      ],
      status: "published",
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (createError) {
    // If concurrent insert occurred with duplicate slug, fetch it again
    const { data: fallbackJob } = await supabaseAdmin
      .schema("recruitment")
      .from("careers_jobs")
      .select("id")
      .eq("organisation_id", CAREERS_ORGANISATION)
      .eq("slug", targetSlug)
      .maybeSingle();

    if (fallbackJob) return fallbackJob.id;
    throw new Error(`Failed to ensure job for role ${normalizedTitle}: ${createError.message}`);
  }

  return newJob.id;
}

/**
 * Synchronizes an inbound career application into the HRMS recruitment pipeline.
 * Fully non-blocking and safe: handles existing applications via upsert.
 */
export async function syncApplicationToHrms(
  payload: CareerApplicationSyncInput
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const candidateEmail = (payload.email || "").toLowerCase().trim();
    if (!candidateEmail || !payload.name) {
      return { success: false, error: "Missing required candidate name or email" };
    }

    const role = payload.role || "General Application";
    const jobId = await ensureJobForRole(role);

    const profile = {
      full_name: payload.name.trim(),
      email: candidateEmail,
      phone: payload.phone?.trim() || null,
      location: payload.location?.trim() || null,
      role,
      linkedin_url: payload.linkedin?.trim() || null,
      github_url: payload.github?.trim() || null,
      portfolio_url: payload.portfolio?.trim() || null,
      resume_url: payload.resume?.trim() || null,
      job_title: payload.jobTitle?.trim() || null,
      company: payload.company?.trim() || null,
      expected_salary: payload.expectedSalary?.trim() || null,
      notice_period: payload.noticePeriod?.trim() || null,
      employment_type: payload.employmentType?.trim() || null,
      tech_stack: payload.techStack?.trim() || null,
      experience: payload.experience?.trim() || null,
      motivation: payload.motivation?.trim() || null,
    };

    const answers = [
      ...(payload.motivation
        ? [{ question: "Candidate Statement / Motivation", answer: payload.motivation.trim() }]
        : []),
      ...(payload.techStack
        ? [{ question: "Primary Tech Stack & Tools", answer: payload.techStack.trim() }]
        : []),
      ...(payload.noticePeriod
        ? [{ question: "Notice Period / Availability", answer: payload.noticePeriod.trim() }]
        : []),
    ];

    // Check if candidate already has an application under this job
    const { data: existingApp } = await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .select("id,current_stage,status")
      .eq("organisation_id", CAREERS_ORGANISATION)
      .eq("job_id", jobId)
      .eq("candidate_id", candidateEmail)
      .maybeSingle();

    if (existingApp) {
      // Update existing record with refreshed profile data without resetting stage
      const { data: updatedApp, error: updateErr } = await supabaseAdmin
        .schema("recruitment")
        .from("careers_applications")
        .update({
          profile,
          resume_path: payload.resume?.trim() || null,
          cover_letter: payload.motivation?.trim() || null,
          answers,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingApp.id)
        .select("id")
        .single();

      if (updateErr) throw updateErr;
      return { success: true, id: updatedApp.id };
    }

    // Insert new application into HRMS pipeline
    const appReference = await nextApplicationReference();

    const { data: newApp, error: insertErr } = await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .insert({
        job_id: jobId,
        candidate_id: candidateEmail,
        organisation_id: CAREERS_ORGANISATION,
        application_reference: appReference,
        current_stage: "applied",
        status: "active",
        profile,
        experience: {
          years: payload.experience?.trim() || null,
          tech_stack: payload.techStack?.trim() || null,
          job_title: payload.jobTitle?.trim() || null,
          company: payload.company?.trim() || null,
        },
        answers,
        resume_path: payload.resume?.trim() || null,
        cover_letter: payload.motivation?.trim() || null,
        source: "careers_portal",
        submitted_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertErr) throw insertErr;
    return { success: true, id: newApp.id };
  } catch (err: any) {
    console.warn("HRMS sync warning (non-blocking):", err?.message || err);
    return { success: false, error: err?.message || "Sync failed" };
  }
}

/**
 * Synchronizes candidate status updates from the Career Portal into the HRMS stage.
 */
export async function syncStatusToHrms(
  email: string,
  careerPortalStatus: string
): Promise<void> {
  try {
    const candidateEmail = (email || "").toLowerCase().trim();
    if (!candidateEmail) return;

    const stageMapping: Record<string, { stage: string; status: string }> = {
      new: { stage: "applied", status: "active" },
      reviewed: { stage: "screening", status: "active" },
      shortlisted: { stage: "screening", status: "active" },
      contacted: { stage: "interview", status: "active" },
      hired: { stage: "hired", status: "hired" },
      rejected: { stage: "rejected", status: "rejected" },
    };

    const target = stageMapping[careerPortalStatus.toLowerCase()];
    if (!target) return;

    await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .update({
        current_stage: target.stage,
        status: target.status,
        updated_at: new Date().toISOString(),
      })
      .eq("organisation_id", CAREERS_ORGANISATION)
      .eq("candidate_id", candidateEmail);
  } catch (err: any) {
    console.warn("HRMS status sync warning (non-blocking):", err?.message || err);
  }
}

/**
 * One-time backfill helper to sync historical public.career_applications into recruitment.careers_applications.
 */
export async function backfillExistingPublicApplications(): Promise<{
  total: number;
  synced: number;
  failed: number;
}> {
  const { data: publicApps, error } = await supabaseAdmin
    .from("career_applications")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !publicApps) {
    return { total: 0, synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;

  for (const app of publicApps) {
    const res = await syncApplicationToHrms({
      name: app.name,
      email: app.email,
      phone: app.phone,
      location: app.location,
      role: app.role,
      experience: app.experience,
      techStack: app.tech_stack,
      github: app.github_url,
      linkedin: app.linkedin_url,
      portfolio: app.portfolio_url,
      resume: app.resume_url,
      jobTitle: app.job_title,
      company: app.company,
      expectedSalary: app.expected_salary,
      noticePeriod: app.notice_period,
      employmentType: app.employment_type,
      motivation: app.motivation,
      status: app.status,
    });

    if (res.success) {
      synced++;
    } else {
      failed++;
    }
  }

  return { total: publicApps.length, synced, failed };
}
