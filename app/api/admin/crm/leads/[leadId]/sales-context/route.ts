import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(_: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const session = await getServerSession(authOptions);
  const roleUpper = String(session?.user?.role || "").toUpperCase();
  if (!session?.user?.id || !["ADMIN", "CO_ADMIN"].includes(roleUpper)) {
    return Response.json({ error: "Access denied" }, { status: 403 });
  }
  const { leadId } = await params;
  const organisationId =
    session.user.organisation_id && session.user.organisation_id !== "REPLACE_WITH_ORGANISATION_UUID"
      ? session.user.organisation_id
      : process.env.DEFAULT_ORGANISATION_ID && process.env.DEFAULT_ORGANISATION_ID !== "REPLACE_WITH_ORGANISATION_UUID"
      ? process.env.DEFAULT_ORGANISATION_ID
      : "8e7d6c54-68f1-4d19-9bf5-c20fe6c37721";
  const lead = await supabaseAdmin.from("leads").select("id,assigned_employee_id").eq("id", leadId).maybeSingle();
  if (!lead.data) return Response.json({ error: "Lead not found" }, { status: 404 });
  const [qualification, activities, followups, opportunity] = await Promise.all([
    supabaseAdmin.from("lead_qualifications").select("*").eq("organisation_id", organisationId).eq("lead_id", leadId).maybeSingle(),
    supabaseAdmin.from("sales_activities").select("*").eq("organisation_id", organisationId).eq("lead_id", leadId).order("occurred_at", { ascending: false }),
    supabaseAdmin.from("sales_followups").select("*").eq("organisation_id", organisationId).eq("lead_id", leadId).order("due_at"),
    supabaseAdmin.from("sales_opportunities").select("*").eq("organisation_id", organisationId).eq("originating_lead_id", leadId).maybeSingle(),
  ]);
  let discovery = null, handoff = null;
  if (opportunity.data) [discovery, handoff] = await Promise.all([
    supabaseAdmin.from("sales_discovery_schedules").select("*").eq("organisation_id", organisationId).eq("opportunity_id", opportunity.data.id).maybeSingle(),
    supabaseAdmin.from("sales_handoffs").select("*").eq("organisation_id", organisationId).eq("opportunity_id", opportunity.data.id).maybeSingle(),
  ]);
  return Response.json({ assignedEmployeeId: lead.data.assigned_employee_id, qualification: qualification.data, activities: activities.data || [], followups: followups.data || [], opportunity: opportunity.data, discovery: discovery?.data || null, handoff: handoff?.data || null });
}
