import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";

async function checkAdmin(req: Request) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token) return false;
  const role = String(token.role || "").toUpperCase();
  return role === "ADMIN" || role === "CO_ADMIN";
}

export async function GET(req: Request) {
  try {
    if (!(await checkAdmin(req))) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    // 1. Fetch recent activities from lead_activities table
    const { data: activityLogs, error: logError } = await supabaseAdmin
      .from("lead_activities")
      .select(`
        id,
        activity_type,
        notes,
        created_at,
        team_member:team_members(name)
      `)
      .order("created_at", { ascending: false })
      .limit(20);

    if (logError) {
      console.warn("Activity logs fetch warning:", logError.message);
    }

    // 2. Fetch active workspace employees from Employee OS
    const { data: activeIdentities } = await supabaseAdmin
      .schema("identity")
      .from("employee_identities")
      .select("employee_id, email, workspace_status")
      .eq("workspace_status", "active");

    const empIds = (activeIdentities || []).map((i) => i.employee_id).filter(Boolean);
    const emailByEmpId = new Map(
      (activeIdentities || []).map((i) => [i.employee_id, i.email])
    );

    const { data: emps, error: empError } = empIds.length
      ? await supabaseAdmin
          .schema("people")
          .from("employees")
          .select("id, first_name, last_name")
          .in("id", empIds)
          .is("deleted_at", null)
      : { data: [], error: null };

    if (empError) {
      console.error("Error loading employees for team:", empError);
    }

    const workspaceEmployees = (emps || []).map((e) => ({
      id: e.id,
      name: `${e.first_name} ${e.last_name || ""}`.trim(),
      email: emailByEmpId.get(e.id) || "",
      role: "Healthcare Lead Manager",
      is_active: true,
      sessions: [],
    }));

    return NextResponse.json({
      team: workspaceEmployees,
      logs: activityLogs || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!await checkAdmin(req)) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }
    const body = await req.json();
    const { name, email, phone, role, password, allowed_paths } = body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    const { data, error } = await supabaseAdmin.from("team_members").insert([{
      name, email, phone, role, password_hash, allowed_paths: allowed_paths || [], is_active: true
    }]).select("id, name, email").single();
    
    if (error) throw error;
    
    // In a real scenario, trigger Resend to send the welcome email here.
    
    return NextResponse.json({ member: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    if (!await checkAdmin(req)) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();
    
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password_hash = await bcrypt.hash(body.password, salt);
      delete body.password;
    }
    
    const { data, error } = await supabaseAdmin.from("team_members").update(body).eq("id", id).select().single();
    if (error) throw error;
    
    return NextResponse.json({ member: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
