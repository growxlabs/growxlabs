import { NextResponse } from "next/server";
import { CAREERS_ORGANISATION, nextJobReference, publicJob, slugify } from "@/lib/careers/jobs";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin.schema("recruitment").from("careers_jobs").select("*").eq("organisation_id", CAREERS_ORGANISATION).in("status", ["published", "scheduled", "closing_soon"]).order("published_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load roles" }, { status: 500 });
  return NextResponse.json({ jobs: (data || []).map(publicJob) });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.description) return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    const slug = slugify(body.slug || body.title);
    const openAt = body.applications_open_at || null;
    const closeAt = body.applications_close_at || null;
    if (openAt && closeAt && new Date(closeAt) <= new Date(openAt)) return NextResponse.json({ error: "Closing time must be after opening time" }, { status: 400 });
    const status = openAt && new Date(openAt) > new Date() ? "scheduled" : (body.status || "published");
    const { data, error } = await supabaseAdmin.schema("recruitment").from("careers_jobs").insert({
      organisation_id: CAREERS_ORGANISATION, title: body.title, slug, job_reference: body.job_reference || await nextJobReference(),
      department: body.department || null, location: body.location || "India", employment_type: body.employment_type || "Full-time",
      workplace_type: body.workplace_type || "On-site", experience_level: body.experience_level || null, openings: body.openings || 1,
      summary: body.summary || body.description.slice(0, 180), description: body.description, responsibilities: body.responsibilities || [],
      requirements: body.requirements || [], preferred_qualifications: body.preferred_qualifications || [], benefits: body.benefits || [],
      compensation_text: body.compensation_text || body.salary_range || null, hiring_process: body.hiring_process || [], application_questions: body.application_questions || [],
      applications_open_at: openAt, applications_close_at: closeAt, applications_timezone: body.applications_timezone || "Asia/Kolkata",
      application_limit: body.application_limit || null, close_when_limit_reached: Boolean(body.close_when_limit_reached), allow_late_applications: Boolean(body.allow_late_applications),
      status, published_at: status === "published" ? new Date().toISOString() : null,
    }).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ job: publicJob(data) }, { status: 201 });
  } catch { return NextResponse.json({ error: "Invalid job payload" }, { status: 400 }); }
}
