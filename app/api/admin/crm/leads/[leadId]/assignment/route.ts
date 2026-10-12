import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { assignLeadToEmployee } from "@/lib/employee-os/lead-assignment-service";

const allowedRoles = ["ADMIN", "CO_ADMIN"];

async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const roleUpper = String(session.user.role || "").toUpperCase();
  if (!allowedRoles.includes(roleUpper)) return null;
  return session;
}

function resolveOrgId(session: any): string {
  const userOrg = session?.user?.organisation_id;
  if (userOrg && userOrg !== "REPLACE_WITH_ORGANISATION_UUID") {
    return userOrg;
  }
  const envOrg = process.env.DEFAULT_ORGANISATION_ID;
  if (envOrg && envOrg !== "REPLACE_WITH_ORGANISATION_UUID") {
    return envOrg;
  }
  return "8e7d6c54-68f1-4d19-9bf5-c20fe6c37721";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Access denied" }, { status: 403 });
  }

  const { leadId } = await params;

  // 1. Fetch current assignment for this lead
  const { data: lead } = await supabaseAdmin
    .from("leads")
    .select("id, assigned_employee_id")
    .eq("id", leadId)
    .maybeSingle();

  // 2. Fetch active workspace employees from Employee OS
  const { data: activeIdentities } = await supabaseAdmin
    .schema("identity")
    .from("employee_identities")
    .select("employee_id, email, workspace_status")
    .eq("workspace_status", "active");

  const empIds = (activeIdentities || []).map((i) => i.employee_id).filter(Boolean);

  const { data: employees } = empIds.length
    ? await supabaseAdmin
        .schema("people")
        .from("employees")
        .select("id, first_name, last_name")
        .in("id", empIds)
        .is("deleted_at", null)
    : { data: [] };

  const employeeList = (employees || []).map((employee) => ({
    id: employee.id,
    name: `${employee.first_name} ${employee.last_name || ""}`.trim(),
  }));

  return Response.json({
    employees: employeeList,
    currentEmployeeId: lead?.assigned_employee_id || null,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Access denied" }, { status: 403 });
  }

  const org = resolveOrgId(session);
  const { leadId } = await params;
  const body = await request.json().catch(() => ({}));
  const employeeId = body.employeeId;

  if (!employeeId || employeeId === "unassigned") {
    // Unassign lead
    const now = new Date().toISOString();
    await supabaseAdmin
      .from("leads")
      .update({
        assigned_employee_id: null,
        assigned_at: null,
        updated_at: now,
      })
      .eq("id", leadId);

    await supabaseAdmin
      .from("lead_assignment_history")
      .update({ ended_at: now })
      .eq("lead_id", leadId)
      .is("ended_at", null);

    return Response.json({ success: true, lead: { id: leadId, assigned_employee_id: null } });
  }

  try {
    const result = await assignLeadToEmployee({
      organisationId: org,
      leadId,
      employeeId,
      actorUserId: session.user.id,
      assignmentNote: "Assigned from Admin Lead Details",
    });

    return Response.json({ lead: result.lead, currentEmployeeId: employeeId });
  } catch (err: any) {
    const status = err.status || 500;
    return Response.json({ error: err.message || "Assignment failed" }, { status });
  }
}
