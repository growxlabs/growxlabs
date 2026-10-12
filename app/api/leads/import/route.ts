import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { upsertCanonicalLead } from "@/lib/leads/canonical";
import {
  validateAssignableEmployee,
  assignLeadToEmployee,
  ValidatedEmployee,
} from "@/lib/employee-os/lead-assignment-service";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (
    !user?.id ||
    !user.organisation_id ||
    (user.role !== "ADMIN" && user.role !== "CO_ADMIN")
  ) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  if (!Array.isArray(body.leads) || body.leads.length === 0 || body.leads.length > 1000) {
    return Response.json({ error: "Provide between 1 and 1000 leads" }, { status: 400 });
  }

  const defaultEmployeeId = body.assigned_employee_id || body.assignedEmployeeId || null;
  let prevalidatedEmployee: ValidatedEmployee | null = null;

  if (defaultEmployeeId) {
    try {
      prevalidatedEmployee = await validateAssignableEmployee(
        user.organisation_id,
        defaultEmployeeId
      );
    } catch (err: any) {
      return Response.json(
        { error: `Bulk assignment target invalid: ${err.message || "Employee not assignable"}` },
        { status: 400 }
      );
    }
  }

  const summary = {
    created: 0,
    updated: 0,
    duplicates: 0,
    assigned: 0,
    failed_assignment: 0,
    invalid: 0,
  };

  for (const row of body.leads) {
    try {
      const result = await upsertCanonicalLead(user.organisation_id, {
        businessName: row.business_name || row.company || row.name,
        contactName: row.contact_name || row.name || row.founder,
        contactTitle: row.title || row.contact_title,
        email: row.email,
        phone: row.phone,
        websiteUrl: row.website_url || row.website,
        linkedinUrl: row.linkedin_url,
        instagramUrl: row.instagram_url,
        city: row.city,
        state: row.state,
        country: row.country,
        source: row.source || "import",
        sourceTool: "csv",
        priority: row.priority,
        status: row.status,
        notes: row.notes,
        customFields: row.custom_fields || row.customFields,
        createdBy: user.id,
      });

      if (result.outcome === "created") {
        summary.created++;
      } else if (result.outcome === "updated") {
        summary.updated++;
        summary.duplicates++;
      } else {
        summary.duplicates++;
      }

      // Handle employee assignment
      const rowTargetEmployeeId =
        row.assigned_employee_id || row.assignedEmployeeId || defaultEmployeeId;

      if (rowTargetEmployeeId && result.lead?.id) {
        try {
          const validated =
            prevalidatedEmployee && prevalidatedEmployee.id === rowTargetEmployeeId
              ? prevalidatedEmployee
              : await validateAssignableEmployee(user.organisation_id, rowTargetEmployeeId);

          await assignLeadToEmployee({
            organisationId: user.organisation_id,
            leadId: result.lead.id,
            employeeId: validated.id,
            actorUserId: user.id,
            assignmentNote: "Bulk import assignment",
            validatedEmployee: validated,
          });
          summary.assigned++;
        } catch (assignErr) {
          console.error("[BULK_IMPORT_ASSIGNMENT_ERROR]", assignErr);
          summary.failed_assignment++;
        }
      }
    } catch (rowErr) {
      console.error("[BULK_IMPORT_ROW_ERROR]", rowErr);
      summary.invalid++;
    }
  }

  return Response.json({
    success: true,
    ...summary,
    total: body.leads.length,
  });
}
