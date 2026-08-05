import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getToken } from "next-auth/jwt";

export async function GET(request: Request) {
  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = token.role;
    if (role !== "ADMIN" && role !== "CO_ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from("career_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("Admin Careers List API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
