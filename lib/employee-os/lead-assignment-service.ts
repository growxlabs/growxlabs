import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

export class LeadAssignmentError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export type ValidatedEmployee = {
  id: string;
  userId: string;
  name: string;
};

/**
 * Validates whether an employee is active, in-scope, and authorized with the sales.workspace capability.
 */
export async function validateAssignableEmployee(
  organisationId: string,
  employeeId: string
): Promise<ValidatedEmployee> {
  if (!employeeId || typeof employeeId !== "string") {
    throw new LeadAssignmentError(400, "Valid employee ID is required");
  }

  // 1. Employee record verification
  const { data: employee, error: empError } = await supabaseAdmin
    .schema("people")
    .from("employees")
    .select("id,first_name,last_name,user_id")
    .eq("id", employeeId)
    .eq("organisation_id", organisationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (empError || !employee) {
    throw new LeadAssignmentError(409, "Active employee not found in this organisation");
  }

  // 2. Active employment tenure verification
  const { data: employment, error: recError } = await supabaseAdmin
    .schema("people")
    .from("employment_records")
    .select("status")
    .eq("employee_id", employee.id)
    .eq("organisation_id", organisationId)
    .is("valid_to", null)
    .maybeSingle();

  if (recError || !employment || !["active", "probation", "notice"].includes(employment.status)) {
    throw new LeadAssignmentError(409, "Employee is not in an active employment status");
  }

  // 3. Capability authorization (sales.workspace)
  const { data: permission } = await supabaseAdmin
    .schema("identity")
    .from("permissions")
    .select("id")
    .eq("key", "sales.workspace")
    .maybeSingle();

  if (permission) {
    const { data: grants } = await supabaseAdmin
      .schema("identity")
      .from("role_permissions")
      .select("role_id")
      .eq("organisation_id", organisationId)
      .eq("permission_id", permission.id);

    const roleIds = (grants || []).map((g) => g.role_id);
    if (roleIds.length > 0) {
      const candidateUserIds = [employee.user_id].filter(Boolean);
      const { data: identity } = await supabaseAdmin
        .schema("identity")
        .from("employee_identities")
        .select("auth_user_id, workspace_status")
        .eq("employee_id", employee.id)
        .maybeSingle();

      if (identity?.auth_user_id && !candidateUserIds.includes(identity.auth_user_id)) {
        candidateUserIds.push(identity.auth_user_id);
      }

      const { data: userRole } = await supabaseAdmin
        .schema("identity")
        .from("user_roles")
        .select("role_id")
        .eq("organisation_id", organisationId)
        .in("user_id", candidateUserIds)
        .in("role_id", roleIds)
        .limit(1)
        .maybeSingle();

      if (!userRole) {
        throw new LeadAssignmentError(403, "Employee does not possess sales workspace permissions");
      }
    }
  }

  return {
    id: employee.id,
    userId: employee.user_id,
    name: `${employee.first_name} ${employee.last_name}`.trim(),
  };
}

/**
 * Assigns or reassigns a single lead to an employee with full audit trail and notification.
 */
export async function assignLeadToEmployee(params: {
  organisationId: string;
  leadId: string;
  employeeId: string;
  actorUserId: string;
  assignmentNote?: string;
  validatedEmployee?: ValidatedEmployee;
}) {
  const { organisationId, leadId, employeeId, actorUserId, assignmentNote } = params;

  const targetEmployee =
    params.validatedEmployee || (await validateAssignableEmployee(organisationId, employeeId));

  const { data: lead, error: leadError } = await supabaseAdmin
    .from("leads")
    .select("id,business_name,assigned_employee_id,organisation_id")
    .eq("id", leadId)
    .or(`organisation_id.eq.${organisationId},organisation_id.is.null`)
    .is("deleted_at", null)
    .maybeSingle();

  if (leadError || !lead) {
    throw new LeadAssignmentError(404, "Lead not found in this organisation");
  }

  const now = new Date().toISOString();

  // If already assigned to this employee, no history record change required
  if (lead.assigned_employee_id === targetEmployee.id) {
    return {
      lead: {
        id: lead.id,
        business_name: lead.business_name,
        assigned_employee_id: targetEmployee.id,
      },
      assigned: true,
      unchanged: true,
    };
  }

  // Close previous active assignment
  await supabaseAdmin
    .from("lead_assignment_history")
    .update({ ended_at: now })
    .eq("organisation_id", organisationId)
    .eq("lead_id", leadId)
    .is("ended_at", null);

  // Update lead assignment
  const { data: updatedLead, error: updateError } = await supabaseAdmin
    .from("leads")
    .update({
      organisation_id: organisationId,
      assigned_employee_id: targetEmployee.id,
      assigned_at: now,
      updated_at: now,
    })
    .eq("id", leadId)
    .select("id,business_name,assigned_employee_id,assigned_at")
    .single();

  if (updateError || !updatedLead) {
    throw new LeadAssignmentError(500, updateError?.message || "Assignment update failed");
  }

  // Insert audit record
  await supabaseAdmin.from("lead_assignment_history").insert({
    organisation_id: organisationId,
    lead_id: leadId,
    previous_employee_id: lead.assigned_employee_id || null,
    assigned_employee_id: targetEmployee.id,
    assigned_by: actorUserId,
    assignment_note: assignmentNote || null,
    assigned_at: now,
  });

  // Dispatch employee notification
  await supabaseAdmin
    .schema("notifications")
    .from("notifications")
    .insert({
      organisation_id: organisationId,
      recipient_user_id: targetEmployee.userId,
      template_key: "sales_lead_assigned",
      payload: {
        title: "New prospect assigned",
        message: `${lead.business_name || "A prospect"} has been assigned to you.`,
        href: `/workspace/sales/leads/${leadId}`,
      },
    });

  return {
    lead: updatedLead,
    assigned: true,
    unchanged: false,
  };
}
