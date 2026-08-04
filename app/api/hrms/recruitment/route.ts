import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CAREERS_ORGANISATION, nextJobReference, slugify } from "@/lib/careers/jobs";

export async function GET() {
  try {
    const { data: jobs, error } = await supabaseAdmin.schema("recruitment").from("careers_jobs").select("*").eq("organisation_id", CAREERS_ORGANISATION).order("created_at", { ascending: false });

    if (error) throw error;
    const ids = (jobs || []).map((job) => job.id);
    const applicationResult = ids.length
      ? await supabaseAdmin.schema("recruitment").from("careers_applications").select("id,job_id,candidate_id,profile,current_stage,status,application_reference,submitted_at").in("job_id", ids).order("submitted_at", { ascending: false })
      : { data: [], error: null };
    if (applicationResult.error) throw applicationResult.error;
    const applications = applicationResult.data || [];
    const normalizeStage = (value: unknown) => String(value || "applied").trim().toUpperCase().replace(/[\s-]+/g, "_");
    return NextResponse.json({ jobs: (jobs || []).map((job) => ({ ...job, candidates: applications.filter((a) => a.job_id === job.id).map((a) => ({ id: a.id, job_id: a.job_id, full_name: a.profile?.full_name || a.candidate_id, email: a.profile?.email || a.candidate_id, stage: normalizeStage(a.current_stage || a.status), application_reference: a.application_reference, submitted_at: a.submitted_at })) })) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch recruitment data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requirements = Array.isArray(body.requirements) ? body.requirements : String(body.requirements || "").split(",").map((x) => x.trim()).filter(Boolean);
    const openAt = body.applications_open_at || null;
    const closeAt = body.applications_close_at || null;
    if (openAt && closeAt && new Date(closeAt) <= new Date(openAt)) return NextResponse.json({ error: "Closing time must be after opening time" }, { status: 400 });
    const status = openAt && new Date(openAt) > new Date() ? "scheduled" : "published";
    const { data: job, error } = await supabaseAdmin.schema("recruitment").from("careers_jobs").insert({
      organisation_id: CAREERS_ORGANISATION, title: body.title, slug: slugify(body.slug || body.title), job_reference: await nextJobReference(),
      department: body.department || null,
      description: body.description || "", summary: body.summary || body.description || "", requirements, responsibilities: body.responsibilities || [],
      compensation_text: body.salary_range || body.compensation_text || null, location: body.location || "India", employment_type: body.employment_type || "Full-time",
      workplace_type: body.workplace_type || "On-site", application_questions: body.application_questions || [],
      applications_open_at: openAt, applications_close_at: closeAt, application_limit: body.application_limit || null,
      close_when_limit_reached: Boolean(body.close_when_limit_reached), status, published_at: status === "published" ? new Date().toISOString() : null,
    })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ job }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create job opening" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const applicationId = String(body.applicationId || "").trim();
    const stage = String(body.stage || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
    const allowedStages = new Set(["applied", "screening", "interview", "assessment", "offer", "hired"]);

    if (!applicationId || !allowedStages.has(stage)) {
      return NextResponse.json({ error: "A valid applicationId and stage are required" }, { status: 400 });
    }

    const { data: application, error: lookupError } = await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .select("id, organisation_id")
      .eq("id", applicationId)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!application || application.organisation_id !== CAREERS_ORGANISATION) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .update({ current_stage: stage })
      .eq("id", applicationId)
      .eq("organisation_id", CAREERS_ORGANISATION)
      .select("id, current_stage, status")
      .single();

    if (error) throw error;
    return NextResponse.json({ application: data });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update candidate stage" }, { status: 500 });
  }
}
