import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CAREERS_ORGANISATION, nextJobReference, slugify } from "@/lib/careers/jobs";

export async function GET() {
  try {
    const { data: jobs, error } = await supabaseAdmin.schema("recruitment").from("careers_jobs").select("*").eq("organisation_id", CAREERS_ORGANISATION).order("created_at", { ascending: false });

    if (error) throw error;
    const ids = (jobs || []).map((job) => job.id);
    const { data: applications } = ids.length ? await supabaseAdmin.schema("recruitment").from("careers_applications").select("id,job_id,candidate_id,profile,current_stage,status,application_reference,submitted_at").in("job_id", ids) : { data: [] };
    return NextResponse.json({ jobs: (jobs || []).map((job) => ({ ...job, candidates: (applications || []).filter((a) => a.job_id === job.id).map((a) => ({ id: a.id, full_name: a.profile?.full_name || a.candidate_id, email: a.profile?.email || a.candidate_id, stage: a.current_stage, application_reference: a.application_reference, submitted_at: a.submitted_at })) })) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch recruitment data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requirements = Array.isArray(body.requirements) ? body.requirements : String(body.requirements || "").split(",").map((x) => x.trim()).filter(Boolean);
    const { data: job, error } = await supabaseAdmin.schema("recruitment").from("careers_jobs").insert({
      organisation_id: CAREERS_ORGANISATION, title: body.title, slug: slugify(body.slug || body.title), job_reference: await nextJobReference(),
      description: body.description || "", summary: body.summary || body.description || "", requirements, responsibilities: body.responsibilities || [],
      compensation_text: body.salary_range || body.compensation_text || null, location: body.location || "India", employment_type: body.employment_type || "Full-time",
      workplace_type: body.workplace_type || "On-site", application_questions: body.application_questions || [], status: "published", published_at: new Date().toISOString(),
    })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ job }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create job opening" }, { status: 400 });
  }
}
