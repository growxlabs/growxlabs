import { NextResponse } from "next/server";
import { availability, CAREERS_ORGANISATION, findJob } from "@/lib/careers/jobs";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const job = await findJob((await params).slug); if (!job) return NextResponse.json({ error: "Role not found" }, { status: 404 });
    const gate = availability(job); if (!gate.open && gate.code !== "APPLICATIONS_NOT_OPEN") return NextResponse.json({ code: gate.code, error: "Applications are not available" }, { status: 409 });
    const body = await request.json(); const candidateId = String(body.candidate_id || body.email || "").trim().toLowerCase();
    if (!candidateId) return NextResponse.json({ error: "Candidate identity is required" }, { status: 400 });
    const { data, error } = await supabaseAdmin.schema("recruitment").from("careers_application_drafts").upsert({ job_id: job.id, candidate_id: candidateId, organisation_id: CAREERS_ORGANISATION, payload: body.payload || body }, { onConflict: "organisation_id,job_id,candidate_id" }).select("id,job_id,candidate_id,payload,updated_at").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 }); return NextResponse.json({ draft: data });
  } catch { return NextResponse.json({ error: "Invalid draft payload" }, { status: 400 }); }
}
