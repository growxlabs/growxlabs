import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { GROWXLABS_OFFER_SIGNATORY, missingOfferInputs } from "@/lib/recruitment/offer-letter";
import { listApprovedOfferTerms, resolveApprovedOfferTerms } from "@/lib/recruitment/offer-terms";
const roles = new Set(["ADMIN", "HR", "RECRUITER"]),
  input = z.object({
    applicationId: z.uuid(),
    title: z.string().trim().min(1),
    departmentId: z.uuid(),
    designationId: z.uuid(),
    managerEmployeeId: z.uuid().nullable().optional(),
    employmentType: z.enum([
      "Full-time",
      "Part-time",
      "Contract",
      "Internship",
    ]),
    workLocation: z.string().trim().min(1),
    joiningDate: z.iso.date(),
    salaryAmount: z.number().nonnegative().default(0),
    salaryCurrency: z.string().trim().length(3).default("INR"),
    compensationType: z.enum(["Fixed", "Incentive-based", "Fixed plus incentive"]),
    fixedAmount: z.number().positive().nullable().optional(),
    fixedFrequency: z.enum(["monthly", "annual"]).nullable().optional(),
    stipendPeriod: z.string().trim().nullable().optional(),
    incentiveType: z.string().trim().nullable().optional(),
    incentiveValue: z.number().nonnegative().nullable().optional(),
    incentiveValueType: z.enum(["percentage", "fixed_amount"]).nullable().optional(),
    incentiveBasis: z.string().trim().nullable().optional(),
    paymentTiming: z.string().trim().nullable().optional(),
    compensationNotes: z.string().trim().nullable().optional(),
    reviewPeriodDays: z.number().int().positive().nullable().optional(),
    postReviewCompensationType: z.string().trim().nullable().optional(),
    postReviewFixedAmount: z.number().positive().nullable().optional(),
    postReviewFixedFrequency: z.enum(["monthly", "annual"]).nullable().optional(),
    probationDays: z.number().int().nonnegative(),
    noticePeriodDays: z.number().int().nonnegative(),
    expiresAt: z.iso.datetime(),
    candidateAddress: z.string().trim().nullable().optional(),
    backfillReason: z.string().trim().nullable().optional(),
    reissue: z.boolean().optional(),
  });
async function actor(request: Request) {
  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token?.sub || !roles.has(String(token.role).toUpperCase())) return null;
  return { id: token.sub };
}
const applicationFields =
  "id,application_reference,profile,status,job_id,careers_jobs(title,department,location,employment_type)";
function presentApplication(a: any) {
  return {
    id: a.id,
    reference: a.application_reference,
    candidateName: String(
      a.profile?.full_name || a.profile?.email || "Candidate",
    ),
    candidateAddress: String(a.profile?.address || ""),
    jobId: a.job_id,
    title: a.careers_jobs?.title || "",
    department: a.careers_jobs?.department || "",
    location: a.careers_jobs?.location || "",
    employmentType: a.careers_jobs?.employment_type || "Full-time",
  };
}
async function directories(applicationId?: string) {
  const applicationQuery = applicationId
    ? supabaseAdmin
        .schema("recruitment")
        .from("careers_applications")
        .select(applicationFields)
        .eq("organisation_id", CAREERS_ORGANISATION)
        .eq("id", applicationId)
        .maybeSingle()
    : Promise.resolve({ data: null, error: null });
  const [
    departments,
    designations,
    employees,
    employment,
    applications,
    requestedApplication,
    offerTermTemplates,
  ] = await Promise.all([
    supabaseAdmin
      .schema("people")
      .from("departments")
      .select("id,name,code")
      .eq("organisation_id", CAREERS_ORGANISATION)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("name"),
    supabaseAdmin
      .schema("people")
      .from("designations")
      .select("id,name,code,department_id")
      .eq("organisation_id", CAREERS_ORGANISATION)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("name"),
    supabaseAdmin
      .schema("people")
      .from("employees")
      .select("id,first_name,last_name,employee_number")
      .eq("organisation_id", CAREERS_ORGANISATION)
      .is("deleted_at", null)
      .order("first_name"),
    supabaseAdmin
      .schema("people")
      .from("employment_records")
      .select("employee_id,designation_id")
      .eq("organisation_id", CAREERS_ORGANISATION)
      .is("valid_to", null),
    supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .select(applicationFields)
      .eq("organisation_id", CAREERS_ORGANISATION)
      .in("status", ["active", "hired"])
      .order("submitted_at", { ascending: false })
      .limit(250),
    applicationQuery,
    listApprovedOfferTerms(CAREERS_ORGANISATION),
  ]);
  const failed = [
    departments,
    designations,
    employees,
    employment,
    applications,
    requestedApplication,
  ].find((result) => result.error);
  if (failed?.error) throw new Error(failed.error.message);
  const requested = requestedApplication.data;
  if (applicationId && !requested)
    throw new Error(
      "The requested candidate application was not found in this organisation.",
    );
  const allApplications = [...(applications.data || [])];
  if (requested && !allApplications.some((a) => a.id === requested.id))
    allApplications.unshift(requested);
  const designationMap = new Map(
    (designations.data || []).map((x) => [x.id, x.name]),
  );
  return {
    departments: departments.data || [],
    designations: designations.data || [],
    employees: (employees.data || []).map((e) => ({
      ...e,
      name: `${e.first_name} ${e.last_name}`.trim(),
      designation:
        designationMap.get(
          (employment.data || []).find((x) => x.employee_id === e.id)
            ?.designation_id,
        ) || "Employee",
    })),
    applications: allApplications.map(presentApplication),
    offerTermTemplates,
  };
}
export async function GET(request: Request) {
  if (!(await actor(request)))
    return Response.json({ error: "Access denied" }, { status: 403 });
  const applicationId =
    new URL(request.url).searchParams.get("applicationId") || undefined;
  try {
    const [result, options] = await Promise.all([
      supabaseAdmin
        .schema("recruitment")
        .from("offers")
        .select(
          "id,application_id,candidate_id,employee_id,title,status,start_date,salary,currency,issued_at,accepted_at,declined_at,expires_at,current_version,updated_at",
        )
        .eq("organisation_id", CAREERS_ORGANISATION)
        .order("updated_at", { ascending: false }),
      directories(applicationId),
    ]);
    if (result.error) throw new Error(result.error.message);
    const applicationIds = [
        ...new Set(
          (result.data || [])
            .map((offer) => offer.application_id)
            .filter(Boolean),
        ),
      ],
      offerApplications = applicationIds.length
        ? await supabaseAdmin
            .schema("recruitment")
            .from("careers_applications")
            .select("id,application_reference,profile")
            .eq("organisation_id", CAREERS_ORGANISATION)
            .in("id", applicationIds)
        : { data: [], error: null };
    if (offerApplications.error)
      throw new Error(offerApplications.error.message);
    const versionRows = applicationIds.length
      ? await supabaseAdmin
          .schema("recruitment")
          .from("offer_versions")
          .select("offer_id,version,snapshot")
          .in(
            "offer_id",
            (result.data || []).map((offer) => offer.id),
          )
      : { data: [], error: null };
    if (versionRows.error) throw new Error(versionRows.error.message);
    const snapshotMap = new Map(
      (versionRows.data || []).map((version) => [
        `${version.offer_id}:${version.version}`,
        version.snapshot,
      ]),
    );
    const applicationMap = new Map(
      (offerApplications.data || []).map((application) => [
        application.id,
        application,
      ]),
    );
    return Response.json({
      items: (result.data || []).map((offer: any) => {
        const application = applicationMap.get(offer.application_id);
        return {
          ...offer,
          candidateName:
            application?.profile?.full_name ||
            application?.profile?.email ||
            offer.candidate_id,
          applicationReference: application?.application_reference || "",
          currentSnapshot:
            snapshotMap.get(`${offer.id}:${offer.current_version}`) || null,
        };
      }),
      ...options,
    });
  } catch (error) {
    console.error("Offer workspace load failed", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Offers could not be loaded",
      },
      { status: 500 },
    );
  }
}
export async function POST(request: Request) {
  const user = await actor(request);
  if (!user) return Response.json({ error: "Access denied" }, { status: 403 });
  const parsed = input.safeParse(await request.json());
  if (!parsed.success)
    return Response.json(
      {
        error: "Confirm all required employment terms.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  const v = parsed.data,
    validationError = (() => {
      if (v.compensationType === "Fixed" && !v.fixedAmount && !v.salaryAmount) return "Fixed compensation amount is required.";
      if (/incentive/i.test(v.compensationType) && (!v.incentiveValueType || v.incentiveValue == null)) return "Incentive value type and value are required.";
      if (v.incentiveValueType === "percentage" && (!(v.incentiveValue! > 0) || v.incentiveValue! > 100)) return "Percentage incentive must be greater than 0 and no more than 100.";
      if (v.incentiveValueType === "fixed_amount" && (!(v.incentiveValue! > 0) || !v.salaryCurrency)) return "Fixed incentives require a positive amount and currency.";
      if (v.postReviewFixedAmount != null && !v.postReviewFixedFrequency) return "Post-review fixed compensation requires a frequency.";
      return null;
    })();
  if (validationError) return Response.json({ error: validationError }, { status: 422 });
  const
    [app, department, designation, manager, conversion] = await Promise.all([
      supabaseAdmin
        .schema("recruitment")
        .from("careers_applications")
        .select(
          "id,candidate_id,job_id,profile,current_stage,status,application_reference,careers_jobs(title)",
        )
        .eq("id", v.applicationId)
        .eq("organisation_id", CAREERS_ORGANISATION)
        .maybeSingle(),
      supabaseAdmin
        .schema("people")
        .from("departments")
        .select("id,name")
        .eq("id", v.departmentId)
        .eq("organisation_id", CAREERS_ORGANISATION)
        .eq("status", "active")
        .maybeSingle(),
      supabaseAdmin
        .schema("people")
        .from("designations")
        .select("id,name,department_id")
        .eq("id", v.designationId)
        .eq("organisation_id", CAREERS_ORGANISATION)
        .eq("status", "active")
        .maybeSingle(),
      v.managerEmployeeId
        ? supabaseAdmin
            .schema("people")
            .from("employees")
            .select("id,first_name,last_name")
            .eq("id", v.managerEmployeeId)
            .eq("organisation_id", CAREERS_ORGANISATION)
            .is("deleted_at", null)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabaseAdmin
        .schema("recruitment")
        .from("employee_conversions")
        .select("employee_id")
        .eq("application_id", v.applicationId)
        .maybeSingle(),
    ]);
  if (app.error || !app.data)
    return Response.json({ error: "Application not found" }, { status: 404 });
  if (
    !department.data ||
    !designation.data ||
    designation.data.department_id !== department.data.id
  )
    return Response.json(
      { error: "Choose a valid department and designation." },
      { status: 422 },
    );
  if (v.managerEmployeeId && !manager.data)
    return Response.json(
      { error: "Choose a valid reporting manager." },
      { status: 422 },
    );
  const resolvedTerms = await resolveApprovedOfferTerms({
    organisationId: CAREERS_ORGANISATION,
    employmentType: v.employmentType,
    designationId: v.designationId,
  });
  if (!resolvedTerms)
    return Response.json(
      { error: `No approved offer terms template is available for ${v.employmentType} and the selected designation.` },
      { status: 422 },
    );
  const candidateName = String(
      app.data.profile?.full_name || app.data.candidate_id,
    ),
    departmentName = department.data.name,
    reportingManager = manager.data
      ? `${manager.data.first_name} ${manager.data.last_name}`.trim()
      : null,
    snapshot = {
      candidateName,
      candidateAddress: v.candidateAddress || null,
      title: v.title,
      departmentName,
      reportingManager,
      employmentType: v.employmentType,
      workLocation: v.workLocation,
      joiningDate: v.joiningDate,
      salaryAmount: v.salaryAmount,
      salaryCurrency: v.salaryCurrency.toUpperCase(),
      fixedAmount: v.fixedAmount ?? (v.compensationType === "Fixed" ? v.salaryAmount : null),
      fixedFrequency: v.fixedFrequency || null,
      compensationModel: v.compensationType,
      stipendPeriod: v.stipendPeriod || null,
      incentiveType: v.incentiveType || null,
      incentiveValue: v.incentiveValue ?? null,
      incentiveValueType: v.incentiveValueType || null,
      incentiveStructure: v.incentiveBasis || null,
      paymentTerms: v.paymentTiming || null,
      compensationNotes: v.compensationNotes || null,
      reviewPeriodDays: v.reviewPeriodDays || null,
      postReviewCompensationType: v.postReviewCompensationType || null,
      postReviewFixedAmount: v.postReviewFixedAmount || null,
      postReviewFixedFrequency: v.postReviewFixedFrequency || null,
      probationDays: v.probationDays,
      noticePeriodDays: v.noticePeriodDays,
      expiresAt: v.expiresAt,
      signatoryName: GROWXLABS_OFFER_SIGNATORY.name,
      signatoryTitle: GROWXLABS_OFFER_SIGNATORY.title,
      offerTermTemplate: {
        id: resolvedTerms.templateId,
        versionId: resolvedTerms.templateVersionId,
        name: resolvedTerms.templateName,
        version: resolvedTerms.templateVersion,
        engagementType: resolvedTerms.engagementType,
      },
      terms: resolvedTerms.terms,
    },
    missing = missingOfferInputs(snapshot),
    existing = await supabaseAdmin
      .schema("recruitment")
      .from("offers")
      .select("id,current_version,status")
      .eq("application_id", v.applicationId)
      .maybeSingle();
  if (
    existing.data &&
    !["draft", "changes_requested", "approved"].includes(
      existing.data.status,
    ) &&
    !v.reissue
  )
    return Response.json(
      { error: "Issued offers are immutable. Choose New version to reissue." },
      { status: 409 },
    );
  if (v.reissue && !existing.data)
    return Response.json(
      { error: "No existing offer is available to reissue." },
      { status: 409 },
    );
  // Every save creates a new immutable snapshot. Updating the existing
  // offer_versions row would violate the append-only history contract.
  const version = (existing.data?.current_version || 0) + 1;
  const payload = {
      organisation_id: CAREERS_ORGANISATION,
      application_id: v.applicationId,
      candidate_id: String(app.data.candidate_id),
      job_id: app.data.job_id,
      employee_id: conversion.data?.employee_id || null,
      title: v.title,
      department_id: v.departmentId,
      designation_id: v.designationId,
      manager_employee_id: v.managerEmployeeId || null,
      employment_type: v.employmentType,
      work_location: v.workLocation,
      salary: v.salaryAmount,
      salary_offered: v.salaryAmount,
      currency: v.salaryCurrency.toUpperCase(),
      compensation_type: v.compensationType,
      fixed_stipend: v.salaryAmount,
      stipend_period: v.stipendPeriod || null,
      fixed_amount: v.fixedAmount ?? (v.compensationType === "Fixed" ? v.salaryAmount : null),
      fixed_frequency: v.fixedFrequency || null,
      incentive_type: v.incentiveType || null,
      incentive_value: v.incentiveValue ?? null,
      incentive_value_type: v.incentiveValueType || null,
      incentive_basis: v.incentiveBasis || null,
      payment_timing: v.paymentTiming || null,
      compensation_notes: v.compensationNotes || null,
      review_period_days: v.reviewPeriodDays || null,
      post_review_compensation_type: v.postReviewCompensationType || null,
      post_review_fixed_amount: v.postReviewFixedAmount || null,
      post_review_fixed_frequency: v.postReviewFixedFrequency || null,
      start_date: v.joiningDate,
      probation_days: v.probationDays,
      notice_period_days: v.noticePeriodDays,
      terms: resolvedTerms.terms,
      expires_at: v.expiresAt,
      status: "draft",
      current_version: version,
      created_by: user.id,
      updated_at: new Date().toISOString(),
      backfill_reason: v.backfillReason || null,
    };
  const saved = existing.data
    ? await supabaseAdmin
        .schema("recruitment")
        .from("offers")
        .update(payload)
        .eq("id", existing.data.id)
        .select("id")
        .single()
    : await supabaseAdmin
        .schema("recruitment")
        .from("offers")
        .insert(payload)
        .select("id")
        .single();
  if (saved.error)
    return Response.json(
      { error: "Offer draft could not be saved" },
      { status: 500 },
    );
  const versionPayload = {
    organisation_id: CAREERS_ORGANISATION,
    offer_id: saved.data.id,
    version,
    snapshot,
    change_summary: v.backfillReason || "Admin-confirmed offer terms",
    created_by: user.id,
  };
  const versionRow = await supabaseAdmin
    .schema("recruitment")
    .from("offer_versions")
    .insert(versionPayload);
  if (versionRow.error)
    return Response.json(
      { error: "Immutable offer version could not be saved" },
      { status: 500 },
    );
  const action = v.reissue
    ? "offer_reissued"
    : conversion.data?.employee_id
      ? "offer_backfilled"
      : "offer_draft_created";
  await supabaseAdmin
    .schema("recruitment")
    .from("offer_audit")
    .insert({
      organisation_id: CAREERS_ORGANISATION,
      offer_id: saved.data.id,
      action,
      actor_user_id: user.id,
      reason: v.backfillReason || null,
      metadata: {
        applicationId: v.applicationId,
        applicationReference: app.data.application_reference,
        version,
      },
    });
  return Response.json(
    {
      offerId: saved.data.id,
      status: "draft",
      version,
      missingAdminInputs: missing,
    },
    { status: 201 },
  );
}
