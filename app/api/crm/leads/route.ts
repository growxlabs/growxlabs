import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Row = Record<string, unknown>;
const text = (value: unknown) => typeof value === "string" ? value : "";
const keyFor = (row: Row) => text(row.email).trim().toLowerCase() || text(row.business_name || row.name).trim().toLowerCase();
async function findByIdentity(table: "crm_leads" | "leads", row: Row) {
  const email = text(row.email).trim();
  if (email) { const result = await supabaseAdmin.from(table).select("id").eq("email", email).limit(1).maybeSingle(); if (result.data) return result.data; }
  const business = text(row.business_name || row.name).trim();
  if (business) return (await supabaseAdmin.from(table).select("id").ilike("business_name", business).limit(1).maybeSingle()).data;
  return null;
}

function normalize(row: Row, source: "crm" | "leads") {
  return {
    ...row,
    _source: source,
    contact_name: row.contact_name || row.name || row.business_name,
    score: row.score ?? row.lead_score ?? 0,
    status: row.status || "new",
  };
}

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const { role, id } = session.user as { role?: string; id?: string };
    const { searchParams } = new URL(req.url);
    const assignedTo = searchParams.get("assigned_to");
    let crmQuery = supabaseAdmin.from("crm_leads").select("*, assigned_to_member:team_members(name)").order("created_at", { ascending: false });
    let mainQuery = supabaseAdmin.from("leads").select("*").order("created_at", { ascending: false });
    if (role === "crm_agent") { crmQuery = crmQuery.eq("assigned_to", id); mainQuery = mainQuery.eq("assigned_to", id); }
    else if (assignedTo && assignedTo !== "all") { crmQuery = crmQuery.eq("assigned_to", assignedTo); mainQuery = mainQuery.eq("assigned_to", assignedTo); }
    const [{ data: crmRows, error: crmError }, { data: mainRows, error: mainError }] = await Promise.all([crmQuery, mainQuery]);
    if (crmError && mainError) throw crmError;
    const merged = new Map<string, Record<string, unknown>>();
    for (const row of (mainRows || []) as Row[]) { const normalized = normalize(row, "leads"); merged.set(keyFor(normalized) || `leads:${text(row.id)}`, normalized); }
    for (const row of (crmRows || []) as Row[]) { const normalized = normalize(row, "crm"); merged.set(keyFor(normalized) || `crm:${text(row.id)}`, normalized); }
    return NextResponse.json({ leads: [...merged.values()].sort((a, b) => new Date(text(b.created_at)).getTime() - new Date(text(a.created_at)).getTime()) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load CRM leads" }, { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }); }
}

export async function POST(req: Request) {
  try {
    await requireSession();
    const body = await req.json();
    const input = { business_name: body.business_name, contact_name: body.contact_name || body.business_name, email: body.email || null, phone: body.phone || null, city: body.city || null, status: body.status || "new", assigned_to: body.assigned_to || null };
    const [main, crm] = await Promise.all([
      supabaseAdmin.from("leads").insert({ business_name: input.business_name, name: input.contact_name, email: input.email, phone: input.phone, city: input.city, status: input.status, assigned_to: input.assigned_to }).select().maybeSingle(),
      supabaseAdmin.from("crm_leads").insert(input).select().maybeSingle(),
    ]);
    if (main.error && crm.error) throw crm.error;
    return NextResponse.json({ lead: crm.data || main.data, synchronized: !main.error && !crm.error, warnings: [main.error, crm.error].filter(Boolean).map((error) => error?.message) }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create CRM lead" }, { status: 400 }); }
}

export async function PATCH(req: Request) {
  try {
    await requireSession();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const body = await req.json();
    const crmExisting = await supabaseAdmin.from("crm_leads").select("id,business_name,email").eq("id", id).maybeSingle();
    const mainExisting = await supabaseAdmin.from("leads").select("id,business_name,email").eq("id", id).maybeSingle();
    const crmMatch = crmExisting.data || (mainExisting.data ? await findByIdentity("crm_leads", mainExisting.data) : null);
    const mainMatch = mainExisting.data || (crmExisting.data ? await findByIdentity("leads", crmExisting.data) : null);
    const crmUpdates: Row = { ...body }; delete crmUpdates.id;
    const mainUpdates: Row = {};
    if (body.status) mainUpdates.status = body.status;
    if (body.assigned_to !== undefined) mainUpdates.assigned_to = body.assigned_to;
    if (body.contact_name) mainUpdates.name = body.contact_name;
    for (const key of ["email", "phone", "city", "notes"]) if (body[key] !== undefined) mainUpdates[key] = body[key];
    if (body.score !== undefined) mainUpdates.lead_score = body.score;
    const results = await Promise.all([
      crmMatch?.id ? supabaseAdmin.from("crm_leads").update(crmUpdates).eq("id", crmMatch.id).select().maybeSingle() : Promise.resolve({ data: null, error: null }),
      mainMatch?.id ? supabaseAdmin.from("leads").update(mainUpdates).eq("id", mainMatch.id).select().maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]);
    const errors = results.map((result) => result.error).filter(Boolean);
    if (errors.length === 2) throw errors[0];
    return NextResponse.json({ lead: results[0].data || results[1].data });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update CRM lead" }, { status: 400 }); }
}

export async function DELETE(req: Request) {
  try {
    await requireSession();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const crm = await supabaseAdmin.from("crm_leads").select("id,business_name,email").eq("id", id).maybeSingle();
    const main = await supabaseAdmin.from("leads").select("id,business_name,email").eq("id", id).maybeSingle();
    const crmMatch = crm.data || (main.data ? await findByIdentity("crm_leads", main.data) : null);
    const mainMatch = main.data || (crm.data ? await findByIdentity("leads", crm.data) : null);
    const [crmDeleted, mainDeleted] = await Promise.all([crmMatch?.id ? supabaseAdmin.from("crm_leads").delete().eq("id", crmMatch.id) : Promise.resolve({ error: null }), mainMatch?.id ? supabaseAdmin.from("leads").delete().eq("id", mainMatch.id) : Promise.resolve({ error: null })]);
    if (crmDeleted.error && mainDeleted.error) throw crmDeleted.error;
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete CRM lead" }, { status: 400 }); }
}
