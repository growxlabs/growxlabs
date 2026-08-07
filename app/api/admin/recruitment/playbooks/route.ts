import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";

export async function GET(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !["ADMIN", "CO_ADMIN", "HR", "RECRUITER"].includes(String(token.role || "").toUpperCase())) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const { data, error } = await supabaseAdmin.schema("recruitment").from("interview_playbooks").select("id,title,subtitle,role_key,version,status,updated_at").eq("organisation_id", CAREERS_ORGANISATION).eq("status", "published").order("title");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ playbooks: data || [] });
}
