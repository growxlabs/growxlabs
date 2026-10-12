import { requireActiveEmployeeContext } from "@/lib/employee-os/context";
import { getAccessibleLead } from "@/lib/employee-os/sales-service";
import { salesError } from "@/lib/employee-os/sales-api";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(_: Request, { params }: { params: Promise<{ leadId: string }> }) {
  try {
    const c = await requireActiveEmployeeContext();
    return Response.json({ lead: await getAccessibleLead(c, (await params).leadId) });
  } catch (e) {
    return salesError(e);
  }
}

export async function PATCH(r: Request, { params }: { params: Promise<{ leadId: string }> }) {
  try {
    const context = await requireActiveEmployeeContext();
    const { leadId } = await params;
    // Verify lead is accessible to this employee
    await getAccessibleLead(context, leadId);

    const body = await r.json();
    const allowed = ["status", "priority", "notes"];
    const updates = Object.fromEntries(
      Object.entries(body).filter(([k]) => allowed.includes(k))
    );

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("leads")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", leadId)
      .eq("organisation_id", context.organisationId)
      .eq("assigned_employee_id", context.employeeId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return Response.json({ lead: data });
  } catch (e) {
    return salesError(e);
  }
}
