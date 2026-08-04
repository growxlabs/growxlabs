import { NextResponse } from "next/server";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const now = new Date();
  const { data: jobs, error } = await supabaseAdmin.schema("recruitment").from("careers_jobs").select("id,status,applications_open_at,applications_close_at,application_limit,close_when_limit_reached").eq("organisation_id", CAREERS_ORGANISATION).in("status", ["scheduled", "published", "closing_soon"]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let updated = 0;
  for (const job of jobs || []) {
    let next = job.status;
    if (job.status === "scheduled" && (!job.applications_open_at || now >= new Date(job.applications_open_at))) next = "published";
    if (job.applications_close_at && now >= new Date(job.applications_close_at)) next = "closed";
    if (job.applications_close_at && now < new Date(job.applications_close_at) && new Date(job.applications_close_at).getTime() - now.getTime() <= 72 * 60 * 60 * 1000 && next === "published") next = "closing_soon";
    if (job.application_limit && job.close_when_limit_reached) { const { count } = await supabaseAdmin.schema("recruitment").from("careers_applications").select("id", { count: "exact", head: true }).eq("job_id", job.id).neq("status", "withdrawn"); if ((count || 0) >= job.application_limit) next = "closed"; }
    if (next !== job.status) { await supabaseAdmin.schema("recruitment").from("careers_jobs").update({ status: next, closed_at: next === "closed" ? now.toISOString() : null, updated_at: now.toISOString() }).eq("id", job.id); updated++; }
  }
  return NextResponse.json({ updated, checked: jobs?.length || 0 });
}
