import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export type ResolvedOfferTerms = {
  templateId: string;
  templateVersionId: string;
  templateName: string;
  templateVersion: number;
  engagementType: string;
  employmentType: string;
  designationId: string | null;
  terms: {
    workingTerms: string;
    confidentialityIp: string;
    termination: string;
    acceptanceInstructions: string;
  };
};

function canonicalEmploymentType(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("intern")) return "Internship";
  if (normalized.includes("part")) return "Part-time";
  if (normalized.includes("contract")) return "Contract";
  return "Full-time";
}

export async function resolveApprovedOfferTerms(input: {
  organisationId: string;
  employmentType: string;
  designationId?: string | null;
  at?: Date;
}): Promise<ResolvedOfferTerms | null> {
  const now = (input.at || new Date()).toISOString();
  const templates = await supabaseAdmin
    .schema("recruitment")
    .from("offer_term_templates")
    .select("id,name,engagement_type,employment_type,designation_id")
    .eq("organisation_id", input.organisationId)
    .eq("employment_type", canonicalEmploymentType(input.employmentType))
    .eq("status", "active");
  if (templates.error) throw new Error(templates.error.message);
  const ranked = (templates.data || [])
    .filter((template) => !template.designation_id || template.designation_id === input.designationId)
    .sort((a, b) => Number(Boolean(b.designation_id)) - Number(Boolean(a.designation_id)));
  for (const template of ranked) {
    const version = await supabaseAdmin
      .schema("recruitment")
      .from("offer_term_template_versions")
      .select("id,version,working_terms,confidentiality_ip_terms,termination_terms,acceptance_instructions")
      .eq("organisation_id", input.organisationId)
      .eq("template_id", template.id)
      .eq("status", "approved")
      .lte("effective_from", now)
      .or(`effective_until.is.null,effective_until.gt.${now}`)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (version.error) throw new Error(version.error.message);
    if (version.data) return {
      templateId: template.id,
      templateVersionId: version.data.id,
      templateName: template.name,
      templateVersion: version.data.version,
      engagementType: template.engagement_type,
      employmentType: template.employment_type,
      designationId: template.designation_id,
      terms: {
        workingTerms: version.data.working_terms,
        confidentialityIp: version.data.confidentiality_ip_terms,
        termination: version.data.termination_terms,
        acceptanceInstructions: version.data.acceptance_instructions,
      },
    };
  }
  return null;
}

export async function listApprovedOfferTerms(organisationId: string) {
  const templates = await supabaseAdmin
    .schema("recruitment")
    .from("offer_term_templates")
    .select("id,name,engagement_type,employment_type,designation_id")
    .eq("organisation_id", organisationId)
    .eq("status", "active");
  if (templates.error) throw new Error(templates.error.message);
  const resolved = await Promise.all((templates.data || []).map((template) =>
    resolveApprovedOfferTerms({
      organisationId,
      employmentType: template.employment_type,
      designationId: template.designation_id,
    })
  ));
  return resolved.filter((item): item is ResolvedOfferTerms => Boolean(item));
}
