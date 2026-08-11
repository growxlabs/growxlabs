import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const schema = z.object({ employeeId: z.uuid() });
const allowedRoles = ["ADMIN", "CO_ADMIN"];

async function admin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !allowedRoles.includes(session.user.role))
    return null;
  return session;
}

export async function GET() {
  const session = await admin();
  if (!session?.user.organisation_id)
    return Response.json({ error: "Access denied" }, { status: 403 });
  const org = session.user.organisation_id;
  const permission = await supabaseAdmin
    .schema("identity")
    .from("permissions")
    .select("id")
    .eq("key", "sales.workspace")
    .maybeSingle();
  if (!permission.data) return Response.json({ employees: [] });
  const grants = await supabaseAdmin
    .schema("identity")
    .from("role_permissions")
    .select("role_id")
    .eq("organisation_id", org)
    .eq("permission_id", permission.data.id);
  const roleIds = (grants.data || []).map((item) => item.role_id);
  if (!roleIds.length) return Response.json({ employees: [] });
  const roles = await supabaseAdmin
    .schema("identity")
    .from("user_roles")
    .select("user_id")
    .eq("organisation_id", org)
    .in("role_id", roleIds);
  const userIds = [...new Set((roles.data || []).map((item) => item.user_id))];
  const employees = userIds.length
    ? await supabaseAdmin
        .schema("people")
        .from("employees")
        .select("id,first_name,last_name,user_id")
        .eq("organisation_id", org)
        .in("user_id", userIds)
        .is("deleted_at", null)
    : { data: [] };
  return Response.json({
    employees: (employees.data || []).map((employee) => ({
      id: employee.id,
      name: `${employee.first_name} ${employee.last_name}`.trim(),
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const session = await admin();
  if (!session?.user.organisation_id)
    return Response.json({ error: "Access denied" }, { status: 403 });
  const org = session.user.organisation_id;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return Response.json({ error: "Valid employee required" }, { status: 400 });
  const { leadId } = await params;
  const employee = await supabaseAdmin
    .schema("people")
    .from("employees")
    .select("id,user_id")
    .eq("id", parsed.data.employeeId)
    .eq("organisation_id", org)
    .is("deleted_at", null)
    .maybeSingle();
  if (!employee.data)
    return Response.json(
      { error: "Active employee not found" },
      { status: 409 },
    );
  const employment = await supabaseAdmin
    .schema("people")
    .from("employment_records")
    .select("status")
    .eq("employee_id", employee.data.id)
    .eq("organisation_id", org)
    .is("valid_to", null)
    .maybeSingle();
  if (
    !employment.data ||
    !["active", "probation", "notice"].includes(employment.data.status)
  )
    return Response.json({ error: "Employee is not active" }, { status: 409 });
  const lead = await supabaseAdmin
    .from("leads")
    .select("id,business_name,assigned_employee_id")
    .eq("id", leadId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!lead.data)
    return Response.json({ error: "Lead not found" }, { status: 404 });
  await supabaseAdmin
    .from("lead_assignment_history")
    .update({ ended_at: new Date().toISOString() })
    .eq("organisation_id", org)
    .eq("lead_id", leadId)
    .is("ended_at", null);
  const updated = await supabaseAdmin
    .from("leads")
    .update({
      organisation_id: org,
      assigned_employee_id: employee.data.id,
      assigned_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .is("deleted_at", null)
    .select("id,business_name,assigned_employee_id,assigned_at")
    .single();
  if (updated.error)
    return Response.json({ error: "Assignment failed" }, { status: 500 });
  await supabaseAdmin.from("lead_assignment_history").insert({
    organisation_id: org,
    lead_id: leadId,
    previous_employee_id: lead.data.assigned_employee_id,
    assigned_employee_id: employee.data.id,
    assigned_by: session.user.id,
  });
  await supabaseAdmin
    .schema("notifications")
    .from("notifications")
    .insert({
      organisation_id: org,
      recipient_user_id: employee.data.user_id,
      template_key: "sales_lead_assigned",
      payload: {
        title: "New prospect assigned",
        message: `${lead.data.business_name || "A prospect"} has been assigned to you.`,
        href: `/workspace/sales/leads/${leadId}`,
      },
    });
  return Response.json({ lead: updated.data });
}
