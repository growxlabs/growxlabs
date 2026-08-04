import { supabaseAdmin } from "@/lib/supabase/admin";

export const CAREERS_ORGANISATION =
  process.env.DEFAULT_ORGANISATION_ID ||
  process.env.NEXT_PUBLIC_DEFAULT_ORGANISATION_ID ||
  "org_default";

export type CareersJob = Record<string, any>;

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "role";
}

export function availability(job: CareersJob, now = new Date()) {
  if (["archived", "cancelled", "closed"].includes(job.status)) return { open: false, code: job.status === "archived" ? "JOB_ARCHIVED" : job.status === "cancelled" ? "JOB_CANCELLED" : "APPLICATIONS_CLOSED" };
  if (job.applications_open_at && now < new Date(job.applications_open_at)) return { open: false, code: "APPLICATIONS_NOT_OPEN" };
  if (job.applications_close_at && now >= new Date(job.applications_close_at) && !job.allow_late_applications) return { open: false, code: "APPLICATIONS_CLOSED" };
  return { open: true, code: "OPEN" };
}

export function publicJob(job: CareersJob): CareersJob {
  const state = availability(job);
  return { ...job, availability: state, internal_id: undefined, organisation_id: undefined, workspace_id: undefined };
}

export async function findJob(slug: string) {
  const { data, error } = await supabaseAdmin.schema("recruitment").from("careers_jobs").select("*").eq("organisation_id", CAREERS_ORGANISATION).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function nextJobReference() {
  const year = new Date().getUTCFullYear();
  const { count } = await supabaseAdmin.schema("recruitment").from("careers_jobs").select("id", { count: "exact", head: true }).eq("organisation_id", CAREERS_ORGANISATION);
  return `GXL-CC-${year}-${String((count || 0) + 1).padStart(3, "0")}`;
}

export async function nextApplicationReference() {
  const year = new Date().getUTCFullYear();
  const { count } = await supabaseAdmin.schema("recruitment").from("careers_applications").select("id", { count: "exact", head: true }).eq("organisation_id", CAREERS_ORGANISATION);
  return `GXL-APP-${year}-${String((count || 0) + 1).padStart(5, "0")}`;
}
