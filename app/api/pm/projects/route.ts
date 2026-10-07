import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { EnterprisePmService } from "@/services/enterprise-pm";

export async function GET(request: Request) {
  try {
    const { data: rawProjects, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    const projects = (rawProjects || []).map((p: any) => EnterprisePmService.formatProject(p));
    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("GET /api/pm/projects error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { deal_id } = await request.json();
    if (!deal_id) throw new Error("Missing deal_id parameter");

    const project = await EnterprisePmService.promoteDealToProject(deal_id);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/pm/projects error:", error);
    return NextResponse.json({ error: error.message || "Failed to promote CRM deal to Project" }, { status: 400 });
  }
}
