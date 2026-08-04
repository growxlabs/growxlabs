import { NextResponse } from "next/server";
import { availability, CAREERS_ORGANISATION, findJob, nextApplicationReference } from "@/lib/careers/jobs";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const job = await findJob((await params).slug); if (!job) return NextResponse.json({ error: "Role not found" }, { status: 404 });
    const gate = availability(job); if (!gate.open) return NextResponse.json({ code: gate.code, error: "Applications are closed or not yet open" }, { status: 409 });
    const body = await request.json(); const candidateId = String(body.candidate_id || body.email || "").trim().toLowerCase();
    if (!candidateId || !body.profile?.full_name || !body.profile?.email) return NextResponse.json({ error: "Candidate name and email are required" }, { status: 400 });
    const existing = await supabaseAdmin.schema("recruitment").from("careers_applications").select("id,application_reference").eq("organisation_id", CAREERS_ORGANISATION).eq("job_id", job.id).eq("candidate_id", candidateId).maybeSingle();
    if (existing.data) return NextResponse.json({ code: "ALREADY_APPLIED", application: existing.data }, { status: 409 });
    if (job.application_limit) { const { count } = await supabaseAdmin.schema("recruitment").from("careers_applications").select("id", { count: "exact", head: true }).eq("organisation_id", CAREERS_ORGANISATION).eq("job_id", job.id).neq("status", "withdrawn"); if ((count || 0) >= job.application_limit) return NextResponse.json({ code: "APPLICATION_LIMIT_REACHED", error: "Application limit reached" }, { status: 409 }); }
    const { data, error } = await supabaseAdmin.schema("recruitment").from("careers_applications").insert({ job_id: job.id, candidate_id: candidateId, organisation_id: CAREERS_ORGANISATION, application_reference: await nextApplicationReference(), profile: body.profile, experience: body.experience || {}, answers: body.answers || {}, resume_path: body.resume_path || null, cover_letter: body.cover_letter || null }).select("id,application_reference,current_stage,submitted_at,job_id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ application: data }, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to submit application" }, { status: 400 }); }
}
