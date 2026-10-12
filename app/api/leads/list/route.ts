import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, id } = session.user as any;

    if (role !== "ADMIN" && role !== "CO_ADMIN" && role !== "crm_agent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let query = supabaseAdmin
      .from("leads")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    // Filter by assigned agent if it's a CRM Agent
    if (role === "crm_agent") {
      query = query.eq("assigned_to", id);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Ensure every lead has a business_name for the UI
    const processedLeads = (data || []).map((lead) => ({
      ...lead,
      business_name: lead.business_name || lead.name || "Unknown Business",
    }));

    return NextResponse.json(processedLeads);
  } catch (error: any) {
    console.error("Leads Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
