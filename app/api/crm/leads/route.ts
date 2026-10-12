import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { upsertCanonicalLead } from "@/lib/leads/canonical";
import { assignLeadToEmployee } from "@/lib/employee-os/lead-assignment-service";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user?.id) return null;
  const roleUpper = String(user.role || "").toUpperCase();
  const allowed =
    ["ADMIN", "CO_ADMIN"].includes(roleUpper) ||
    user.permissions?.some((p) =>
      ["sales.team.view", "sales.assignment.manage"].includes(p)
    );
  const orgId =
    user.organisation_id && user.organisation_id !== "REPLACE_WITH_ORGANISATION_UUID"
      ? user.organisation_id
      : process.env.DEFAULT_ORGANISATION_ID || "8e7d6c54-68f1-4d19-9bf5-c20fe6c37721";
  return allowed && orgId ? { ...user, organisation_id: orgId } : null;
}

const fail = (message: string, status: number) =>
  Response.json({ error: message }, { status });

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (!user) return fail("Admin sales access required", 403);
  const organisationId = user.organisation_id!;
  const url = new URL(request.url),
    page = Math.max(1, Number(url.searchParams.get("page")) || 1),
    limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 50)),
    from = (page - 1) * limit;

  let query = supabaseAdmin
    .from("leads")
    .select("*", { count: "exact" })
    .or(`organisation_id.eq.${organisationId},organisation_id.is.null`)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  for (const key of ["status", "source", "priority"] as const) {
    const value = url.searchParams.get(key);
    if (value && value !== "all") query = query.eq(key, value);
  }

  const assigned = url.searchParams.get("assigned_employee_id");
  if (assigned === "unassigned") query = query.is("assigned_employee_id", null);
  else if (assigned) query = query.eq("assigned_employee_id", assigned);

  const search = (url.searchParams.get("q") || "")
    .replace(/[^a-zA-Z0-9@.\- +]/g, "")
    .slice(0, 100);
  if (search)
    query = query.or(
      `business_name.ilike.%${search}%,contact_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
    );

  const { data, error, count } = await query;
  if (error) return fail("Unable to load lead pool", 500);

  // Enrich leads with assigned employee name for the CRM table
  const rawLeads = data || [];
  const empIds = [
    ...new Set(rawLeads.map((l: any) => l.assigned_employee_id).filter(Boolean)),
  ];

  let empMap = new Map<string, string>();
  if (empIds.length > 0) {
    const { data: emps } = await supabaseAdmin
      .schema("people")
      .from("employees")
      .select("id, first_name, last_name")
      .in("id", empIds);
    for (const e of emps || []) {
      empMap.set(e.id, `${e.first_name} ${e.last_name}`.trim());
    }
  }

  const enrichedLeads = rawLeads.map((l: any) => {
    const empName = l.assigned_employee_id
      ? empMap.get(l.assigned_employee_id)
      : undefined;
    return {
      ...l,
      assigned_to: l.assigned_employee_id || l.assigned_to,
      assigned_to_member: empName
        ? { name: empName }
        : l.assigned_to_member || null,
    };
  });

  return Response.json({
    leads: enrichedLeads,
    page,
    limit,
    total: count || 0,
  });
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) return fail("Admin sales access required", 403);
  try {
    const body = await request.json();
    const result = await upsertCanonicalLead(user.organisation_id!, {
      businessName: body.business_name,
      contactName: body.contact_name,
      email: body.email,
      phone: body.phone,
      websiteUrl: body.website_url,
      linkedinUrl: body.linkedin_url,
      instagramUrl: body.instagram_url,
      city: body.city,
      state: body.state,
      country: body.country,
      source: "manual_admin",
      priority: body.priority,
      status: body.status,
      notes: body.notes,
      customFields: body.custom_fields,
      createdBy: user.id,
    });
    return Response.json(result, {
      status: result.outcome === "created" ? 201 : 200,
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Unable to create lead",
      400
    );
  }
}

export async function PATCH(request: Request) {
  const user = await requireAdmin();
  if (!user) return fail("Admin sales access required", 403);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return fail("Lead ID required", 400);
  const body = await request.json();

  if (
    body.status &&
    !new Set(["new", "contacted", "engaged", "qualified", "disqualified"]).has(
      body.status
    )
  )
    return fail("Invalid operational lead status", 422);
  if (
    body.priority &&
    !new Set(["low", "medium", "high", "urgent"]).has(body.priority)
  )
    return fail("Invalid priority", 422);

  // Handle lead assignment to employee
  const incomingEmployeeId = body.assigned_employee_id ?? body.assigned_to;
  if (incomingEmployeeId !== undefined) {
    if (
      incomingEmployeeId === null ||
      incomingEmployeeId === "" ||
      incomingEmployeeId === "unassigned"
    ) {
      // Unassign lead
      await supabaseAdmin
        .from("leads")
        .update({
          assigned_employee_id: null,
          assigned_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("organisation_id", user.organisation_id);

      await supabaseAdmin
        .from("lead_assignment_history")
        .update({ ended_at: new Date().toISOString() })
        .eq("lead_id", id)
        .eq("organisation_id", user.organisation_id)
        .is("ended_at", null);
    } else {
      try {
        await assignLeadToEmployee({
          organisationId: user.organisation_id!,
          leadId: id,
          employeeId: incomingEmployeeId,
          actorUserId: user.id,
          assignmentNote: "Assigned from Admin CRM",
        });
      } catch (assignErr: any) {
        return fail(assignErr.message || "Unable to assign lead to employee", 409);
      }
    }
  }

  const allowed = [
    "business_name",
    "contact_name",
    "contact_title",
    "email",
    "phone",
    "website_url",
    "linkedin_url",
    "instagram_url",
    "city",
    "state",
    "country",
    "status",
    "priority",
    "notes",
    "custom_fields",
  ];
  const updates = Object.fromEntries(
    Object.entries(body).filter(([key]) => allowed.includes(key))
  );

  if (Object.keys(updates).length > 0) {
    updates.updated_at = new Date().toISOString();
    const { data: updatedLead, error } = await supabaseAdmin
      .from("leads")
      .update(updates)
      .eq("id", id)
      .eq("organisation_id", user.organisation_id)
      .is("deleted_at", null)
      .select("*")
      .maybeSingle();
    if (error || !updatedLead)
      return fail("Lead not found or update rejected", 404);
    return Response.json({ lead: updatedLead });
  }

  const { data: currentLead } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("id", id)
    .eq("organisation_id", user.organisation_id)
    .maybeSingle();

  return Response.json({ lead: currentLead });
}

export async function DELETE(request: Request) {
  const user = await requireAdmin();
  if (!user) return fail("Admin sales access required", 403);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return fail("Lead ID required", 400);
  const { data, error } = await supabaseAdmin
    .from("leads")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organisation_id", user.organisation_id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();
  if (error || !data) return fail("Lead not found", 404);
  return Response.json({ success: true });
}
