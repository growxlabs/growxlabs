import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { getCandidateSession } from "@/lib/recruitment/candidate-session";

export async function GET(request: Request, { params }: { params: Promise<{ playbookSlug: string }> }) {
  const session = getCandidateSession(request);
  if (!session?.email) return NextResponse.json({ error: "Please sign in to view this playbook." }, { status: 401 });
  const { playbookSlug } = await params;
  const { data: applications } = await supabaseAdmin.schema("recruitment").from("careers_applications").select("id,candidate_id,application_reference,profile").eq("organisation_id", CAREERS_ORGANISATION).filter("profile->>email", "eq", session.email);
  const appIds = (applications || []).map((app) => app.id);
  if (!appIds.length) return NextResponse.json({ error: "Playbook unavailable." }, { status: 404 });
  const { data: playbook } = await supabaseAdmin.schema("recruitment").from("interview_playbooks").select("id,slug,title,subtitle,description,content,version,updated_at").eq("organisation_id", CAREERS_ORGANISATION).eq("slug", playbookSlug).eq("status", "published").maybeSingle();
  if (!playbook) return NextResponse.json({ error: "Playbook unavailable." }, { status: 404 });
  const { data: assignment } = await supabaseAdmin.schema("recruitment").from("candidate_playbooks").select("id,application_id,assigned_at,published_at,opened_at,last_viewed_at,status").in("application_id", appIds).eq("playbook_id", playbook.id).in("status", ["published", "opened"]).maybeSingle();
  if (!assignment) return NextResponse.json({ error: "Playbook unavailable." }, { status: 404 });
  const now = new Date().toISOString();
  await supabaseAdmin.schema("recruitment").from("candidate_playbooks").update({ opened_at: assignment.opened_at || now, last_viewed_at: now, status: assignment.opened_at ? "opened" : "opened" }).eq("id", assignment.id);
  if (!assignment.opened_at) await supabaseAdmin.schema("audit").from("events").insert({ organisation_id: CAREERS_ORGANISATION, actor_user_id: null, entity_type: "candidate_playbook", entity_id: assignment.id, action: "playbook_opened", new_value: { applicationId: assignment.application_id, playbookSlug } }).then(() => undefined, () => undefined);
  const application = (applications || []).find((item) => item.id === assignment.application_id);
  return NextResponse.json({ playbook, assignment: { assignedAt: assignment.assigned_at, publishedAt: assignment.published_at, openedAt: assignment.opened_at || now }, application: { id: application?.id, reference: application?.application_reference, candidateName: application?.profile?.full_name || "Candidate" } });
}
