import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getToken } from "next-auth/jwt";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";

export async function GET(request: Request) {
  try {
    // Session validation via JWT token
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = token.role;
    if (!["ADMIN", "CO_ADMIN", "HR", "RECRUITER"].includes(String(role))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // The public careers portal writes to the recruitment schema. Keep the
    // legacy response shape for this page while reading the current source.
    const { data: current, error } = await supabaseAdmin.schema("recruitment")
      .from("careers_applications")
      .select("*, careers_jobs(title)")
      .eq("organisation_id", CAREERS_ORGANISATION)
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    const data = (current || []).map((application: any) => ({
      ...application,
      name: application.profile?.full_name || application.candidate_id,
      email: application.profile?.email || "",
      phone: application.profile?.phone || "",
      role: application.careers_jobs?.title || "",
      created_at: application.submitted_at,
      resume_url: application.resume_path || application.profile?.resume_url || null,
      cover_letter: application.cover_letter || application.profile?.cover_letter || "",
      status: application.current_stage || application.status || "applied",
    }));
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Admin Careers List API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
