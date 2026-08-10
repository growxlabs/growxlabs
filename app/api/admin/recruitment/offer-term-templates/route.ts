import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { supabaseAdmin } from "@/lib/supabase/admin";

const roles = new Set(["ADMIN", "HR"]);
async function actor(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  return token?.sub && roles.has(String(token.role).toUpperCase()) ? token.sub : null;
}

export async function GET(request: Request) {
  if (!(await actor(request))) return Response.json({ error: "Access denied" }, { status: 403 });
  const templates = await supabaseAdmin.schema("recruitment").from("offer_term_templates")
    .select("id,name,engagement_type,employment_type,designation_id,status,created_at,updated_at")
    .eq("organisation_id", CAREERS_ORGANISATION).order("name");
  if (templates.error) return Response.json({ error: templates.error.message }, { status: 500 });
  const versions = await supabaseAdmin.schema("recruitment").from("offer_term_template_versions")
    .select("id,template_id,version,status,effective_from,effective_until,working_terms,confidentiality_ip_terms,termination_terms,acceptance_instructions,approved_at,created_at")
    .eq("organisation_id", CAREERS_ORGANISATION).order("version", { ascending: false });
  if (versions.error) return Response.json({ error: versions.error.message }, { status: 500 });
  return Response.json({ items: (templates.data || []).map((template) => ({
    ...template,
    versions: (versions.data || []).filter((version) => version.template_id === template.id),
  })) });
}

const create = z.object({
  name: z.string().trim().min(3),
  engagementType: z.string().trim().min(2),
  employmentType: z.enum(["Full-time", "Part-time", "Contract", "Internship"]),
  designationId: z.uuid().nullable().optional(),
  workingTerms: z.string().trim().min(50),
  confidentialityIp: z.string().trim().min(50),
  termination: z.string().trim().min(50),
  acceptanceInstructions: z.string().trim().min(50),
  effectiveFrom: z.iso.datetime().nullable().optional(),
});

export async function POST(request: Request) {
  const userId = await actor(request);
  if (!userId) return Response.json({ error: "Access denied" }, { status: 403 });
  const parsed = create.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Complete every required template section.", details: parsed.error.flatten() }, { status: 400 });
  const value = parsed.data;
  const template = await supabaseAdmin.schema("recruitment").from("offer_term_templates").upsert({
    organisation_id: CAREERS_ORGANISATION, name: value.name,
    engagement_type: value.engagementType, employment_type: value.employmentType,
    designation_id: value.designationId || null, status: "active", created_by: userId,
    updated_at: new Date().toISOString(),
  }, { onConflict: "organisation_id,name" }).select("id").single();
  if (template.error) return Response.json({ error: template.error.message }, { status: 500 });
  const current = await supabaseAdmin.schema("recruitment").from("offer_term_template_versions")
    .select("version").eq("template_id", template.data.id).order("version", { ascending: false }).limit(1).maybeSingle();
  const version = await supabaseAdmin.schema("recruitment").from("offer_term_template_versions").insert({
    organisation_id: CAREERS_ORGANISATION, template_id: template.data.id,
    version: (current.data?.version || 0) + 1, status: "draft",
    effective_from: value.effectiveFrom || null,
    working_terms: value.workingTerms, confidentiality_ip_terms: value.confidentialityIp,
    termination_terms: value.termination, acceptance_instructions: value.acceptanceInstructions,
    created_by: userId,
  }).select("id,version,status").single();
  if (version.error) return Response.json({ error: version.error.message }, { status: 500 });
  return Response.json({ templateId: template.data.id, ...version.data }, { status: 201 });
}

const transition = z.object({
  versionId: z.uuid().optional(),
  templateId: z.uuid().optional(),
  action: z.enum(["approve", "retire"]),
});
export async function PATCH(request: Request) {
  const userId = await actor(request);
  if (!userId) return Response.json({ error: "Access denied" }, { status: 403 });
  const parsed = transition.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid template action" }, { status: 400 });
  if (parsed.data.action === "approve" && parsed.data.versionId) {
    const result = await supabaseAdmin.schema("recruitment").from("offer_term_template_versions")
      .update({ status: "approved", approved_by: userId, approved_at: new Date().toISOString(), effective_from: new Date().toISOString() })
      .eq("id", parsed.data.versionId).eq("status", "draft").select("id").maybeSingle();
    if (result.error || !result.data) return Response.json({ error: "Only a draft template version can be approved." }, { status: 409 });
    return Response.json({ status: "approved" });
  }
  if (parsed.data.action === "retire" && parsed.data.templateId) {
    const result = await supabaseAdmin.schema("recruitment").from("offer_term_templates")
      .update({ status: "retired", updated_at: new Date().toISOString() }).eq("id", parsed.data.templateId);
    if (result.error) return Response.json({ error: result.error.message }, { status: 500 });
    return Response.json({ status: "retired" });
  }
  return Response.json({ error: "The requested template action is incomplete." }, { status: 400 });
}
