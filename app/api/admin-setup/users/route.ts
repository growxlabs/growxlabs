import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data: rawUsers, error } = await supabaseAdmin
      .from("users")
      .select("id, name, email, role, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching users from Supabase:", error);
      return NextResponse.json({ users: [] });
    }

    const users = (rawUsers || []).map((u) => {
      const isSai =
        u.email?.toLowerCase() === "saivarshith8284@gmail.com" ||
        u.email?.toLowerCase() === "sai@growxlabs.tech" ||
        u.name?.toLowerCase().includes("sai varshith");

      const isAdmin = u.role === "ADMIN" || isSai;

      return {
        id: u.id,
        full_name: isSai ? "Sai Varshith Pujala" : (u.name || u.email?.split("@")[0] || "Platform User"),
        email: isSai ? "sai@growxlabs.tech" : u.email,
        role: isSai
          ? "Founder & CEO / Super Admin"
          : isAdmin
          ? "Platform Administrator"
          : "Client Partner Portal",
        department: isSai
          ? "Executive Leadership"
          : isAdmin
          ? "Platform & Engineering"
          : "Enterprise Client",
        status: "Active",
        mfa_enabled: true,
        created_at: u.created_at
      };
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ users: [], error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([{
        name,
        email,
        role: role || "CLIENT"
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      user: {
        id: data.id,
        full_name: data.name,
        email: data.email,
        role: data.role === "ADMIN" ? "Platform Administrator" : "Client Partner Portal",
        department: data.role === "ADMIN" ? "Platform & Engineering" : "Enterprise Client",
        status: "Active",
        mfa_enabled: true,
        created_at: data.created_at
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    const body = await req.json();

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const updatePayload: Record<string, any> = {};
    if (body.name) updatePayload.name = body.name;
    if (body.role) updatePayload.role = body.role;

    const { data, error } = await supabaseAdmin
      .from("users")
      .update(updatePayload)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
