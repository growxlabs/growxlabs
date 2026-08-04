import { NextResponse } from "next/server";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) { const candidateId = new URL(request.url).searchParams.get("candidate_id"); if (!candidateId) return NextResponse.json({ applications: [] }); const { data } = await supabaseAdmin.schema("recruitment").from("careers_applications").select("id,application_reference,current_stage,status,submitted_at,job:careers_jobs(title,slug,job_reference)").eq("organisation_id", CAREERS_ORGANISATION).eq("candidate_id", candidateId); return NextResponse.json({ applications: data || [] }); }
