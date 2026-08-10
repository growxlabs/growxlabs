"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { FileSignature, Plus, Send, ShieldCheck, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
type Offer = {
  id: string;
  application_id: string;
  title: string;
  status: string;
  start_date: string;
  salary: number;
  currency: string;
  current_version: number;
  candidateName: string;
  applicationReference: string;
  document_id?: string | null;
  delivery_status?: string;
  delivery_error?: string | null;
  issued_at?: string | null;
  currentSnapshot?: Record<string, any> | null;
};
type Option = {
  id: string;
  name: string;
  code?: string;
  department_id?: string;
};
type Application = {
  id: string;
  reference: string;
  candidateName: string;
  candidateAddress: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
};
type Employee = {
  id: string;
  name: string;
  designation: string;
  employee_number: string;
};
type OfferTermTemplate = {
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
const blank = {
  applicationId: "",
  title: "",
  departmentId: "",
  designationId: "",
  managerEmployeeId: "",
  employmentType: "Full-time",
  workLocation: "",
  joiningDate: "",
  salaryAmount: "",
  salaryCurrency: "INR",
  compensationType: "Fixed",
  stipendPeriod: "",
  incentiveType: "",
  incentiveValue: "",
  incentiveBasis: "",
  paymentTiming: "",
  compensationNotes: "",
  probationDays: "90",
  noticePeriodDays: "30",
  expiresAt: "",
  candidateAddress: "",
  backfillReason: "",
  workingTerms: "",
  confidentialityIp: "",
  termination: "",
  acceptanceInstructions: "",
  offerTermTemplateName: "",
  offerTermTemplateVersion: "",
};
const inputClass =
  "h-11 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] px-3 text-xs text-[var(--text-primary)] outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/15";
export default function OfferWorkspace() {
  const params = useSearchParams(),
    [items, setItems] = useState<Offer[]>([]),
    [applications, setApplications] = useState<Application[]>([]),
    [departments, setDepartments] = useState<Option[]>([]),
    [designations, setDesignations] = useState<Option[]>([]),
    [employees, setEmployees] = useState<Employee[]>([]),
    [offerTermTemplates, setOfferTermTemplates] = useState<OfferTermTemplate[]>([]),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [reissue, setReissue] = useState(false),
    [managerSearch, setManagerSearch] = useState(""),
    [form, setForm] = useState(blank);
  async function load() {
    const applicationId = params.get("applicationId"),
      query = applicationId
        ? `?applicationId=${encodeURIComponent(applicationId)}`
        : "",
      r = await fetch(`/api/admin/recruitment/offers${query}`, {
        cache: "no-store",
      }),
      b = await r.json();
    if (!r.ok) return setMessage(b.error || "Offers could not be loaded");
    setItems(b.items || []);
    setApplications(b.applications || []);
    setDepartments(b.departments || []);
    setDesignations(b.designations || []);
    setEmployees(b.employees || []);
    setOfferTermTemplates(b.offerTermTemplates || []);
  }
  function chooseApplication(id: string, source = applications) {
    const a = source.find((x) => x.id === id);
    if (!a) return setForm((v) => ({ ...v, applicationId: id }));
    const departmentKey = a.department.trim().toLowerCase(),
      titleKey = a.title
        .replace(/\s*\([^)]*\)\s*$/, "")
        .trim()
        .toLowerCase(),
      titleCode = a.title
        .match(/\(([^)]+)\)\s*$/)?.[1]
        .trim()
        .toLowerCase(),
      department = departments.find(
        (x) =>
          x.name.toLowerCase() === departmentKey ||
          x.code?.toLowerCase() === departmentKey,
      ),
      designation = designations.find(
        (x) =>
          x.name.toLowerCase() === titleKey ||
          Boolean(titleCode && x.code?.toLowerCase() === titleCode),
      );
    const employmentType = ["Full-time", "Part-time", "Contract", "Internship"].includes(a.employmentType)
      ? a.employmentType
      : /intern/i.test(a.employmentType)
        ? "Internship"
        : "Full-time";
    const template = offerTermTemplates.find(
      (item) => item.employmentType === employmentType && (!item.designationId || item.designationId === designation?.id),
    );
    setForm((v) => ({
      ...v,
      applicationId: id,
      title: a.title || v.title,
      departmentId: department?.id || v.departmentId,
      designationId: designation?.id || v.designationId,
      employmentType,
      workLocation: a.location || v.workLocation,
      candidateAddress: a.candidateAddress || v.candidateAddress,
      workingTerms: template?.terms.workingTerms || "",
      confidentialityIp: template?.terms.confidentialityIp || "",
      termination: template?.terms.termination || "",
      acceptanceInstructions: template?.terms.acceptanceInstructions || "",
      offerTermTemplateName: template?.templateName || "",
      offerTermTemplateVersion: template ? String(template.templateVersion) : "",
    }));
  }
  function hydrateOffer(item: Offer) {
    const snapshot = item.currentSnapshot || {};
    const deptId = departments.find((x) => x.name === snapshot.departmentName || x.name === (item as any).department_name)?.id;
    const desigId = designations.find((x) => x.name === snapshot.title || x.name === item.title)?.id;
    setForm((v) => ({
      ...v,
      applicationId: item.application_id,
      title: snapshot.title || item.title || v.title,
      departmentId: deptId || (item as any).department_id || v.departmentId,
      designationId: desigId || (item as any).designation_id || v.designationId,
      managerEmployeeId: (item as any).manager_employee_id || v.managerEmployeeId,
      employmentType: snapshot.employmentType || (item as any).employment_type || v.employmentType,
      workLocation: snapshot.workLocation || (item as any).work_location || v.workLocation,
      joiningDate: snapshot.joiningDate || (item as any).start_date || v.joiningDate,
      salaryAmount:
        snapshot.salaryAmount != null
          ? String(snapshot.salaryAmount)
          : item.salary != null
          ? String(item.salary)
          : v.salaryAmount,
      salaryCurrency: snapshot.salaryCurrency || item.currency || v.salaryCurrency,
      compensationType: snapshot.compensationModel || v.compensationType,
      stipendPeriod: snapshot.stipendPeriod || v.stipendPeriod,
      incentiveType: snapshot.incentiveType || v.incentiveType,
      incentiveValue: snapshot.incentiveValue != null ? String(snapshot.incentiveValue) : v.incentiveValue,
      incentiveBasis: snapshot.incentiveStructure || v.incentiveBasis,
      paymentTiming: snapshot.paymentTerms || v.paymentTiming,
      compensationNotes: snapshot.compensationNotes || v.compensationNotes,
      probationDays:
        snapshot.probationDays != null
          ? String(snapshot.probationDays)
          : (item as any).probation_days != null
          ? String((item as any).probation_days)
          : v.probationDays,
      noticePeriodDays:
        snapshot.noticePeriodDays != null
          ? String(snapshot.noticePeriodDays)
          : (item as any).notice_period_days != null
          ? String((item as any).notice_period_days)
          : v.noticePeriodDays,
      expiresAt: snapshot.expiresAt
        ? String(snapshot.expiresAt).slice(0, 16)
        : (item as any).expires_at
        ? String((item as any).expires_at).slice(0, 16)
        : v.expiresAt,
      candidateAddress: snapshot.candidateAddress || (item as any).candidate_address || v.candidateAddress,
      workingTerms: snapshot.terms?.workingTerms || (item as any).terms?.workingTerms || v.workingTerms,
      confidentialityIp:
        snapshot.terms?.confidentialityIp || (item as any).terms?.confidentialityIp || v.confidentialityIp,
      termination: snapshot.terms?.termination || (item as any).terms?.termination || v.termination,
      acceptanceInstructions:
        snapshot.terms?.acceptanceInstructions || (item as any).terms?.acceptanceInstructions || v.acceptanceInstructions,
      offerTermTemplateName: snapshot.offerTermTemplate?.name || "Historical offer snapshot",
      offerTermTemplateVersion: snapshot.offerTermTemplate?.version ? String(snapshot.offerTermTemplate.version) : "",
    }));
  }
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    const id = params.get("applicationId");
    const existing = items.find((item) => item.application_id === id);
    if (id && applications.some((application) => application.id === id)) {
      if (existing) {
        hydrateOffer(existing);
      } else {
        chooseApplication(id);
      }
      setForm((v) => ({
        ...v,
        backfillReason:
          params.get("backfill") === "1"
            ? "Existing employee was converted before the formal offer workflow was completed."
            : v.backfillReason,
      }));
      setOpen(true);
    }
  }, [applications, departments, designations, items, offerTermTemplates, params]);
  const application = applications.find((x) => x.id === form.applicationId),
    filteredDesignations = designations.filter(
      (x) =>
        !form.departmentId ||
        !x.department_id ||
        x.department_id === form.departmentId,
    ),
    managerOptions = useMemo(
      () =>
        employees
          .filter((x) =>
            `${x.name} ${x.designation} ${x.employee_number}`
              .toLowerCase()
              .includes(managerSearch.toLowerCase()),
          )
          .slice(0, 30),
      [employees, managerSearch],
    );
  function applyResolvedTemplate(next: typeof blank, employmentType: string, designationId: string) {
    const template = offerTermTemplates
      .filter((item) => item.employmentType === employmentType && (!item.designationId || item.designationId === designationId))
      .sort((a, b) => Number(Boolean(b.designationId)) - Number(Boolean(a.designationId)))[0];
    return {
      ...next,
      employmentType,
      designationId,
      workingTerms: template?.terms.workingTerms || "",
      confidentialityIp: template?.terms.confidentialityIp || "",
      termination: template?.terms.termination || "",
      acceptanceInstructions: template?.terms.acceptanceInstructions || "",
      offerTermTemplateName: template?.templateName || "",
      offerTermTemplateVersion: template ? String(template.templateVersion) : "",
    };
  }
  async function create(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const payload = {
      ...form,
      reissue,
      salaryAmount: Number(form.salaryAmount),
      incentiveValue: form.incentiveValue === "" ? null : Number(form.incentiveValue),
      probationDays: Number(form.probationDays),
      noticePeriodDays: Number(form.noticePeriodDays),
      expiresAt: new Date(form.expiresAt).toISOString(),
      managerEmployeeId: form.managerEmployeeId || null,
      candidateAddress: form.candidateAddress || null,
      backfillReason: form.backfillReason || null,
    };
    const r = await fetch("/api/admin/recruitment/offers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }),
      b = await r.json();
    setBusy(false);
    if (!r.ok) return setMessage(b.error || "Draft could not be saved");
    setMessage(
      b.missingAdminInputs?.length
        ? `Draft saved. Required before issue: ${b.missingAdminInputs.join(", ")}`
        : "Draft saved for review.",
    );
    setOpen(false);
    setReissue(false);
    setForm(blank);
    await load();
  }
  async function action(id: string, action: "approve" | "issue") {
    setBusy(true);
    const r = await fetch(`/api/admin/recruitment/offers/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      }),
      b = await r.json();
    setBusy(false);
    setMessage(
      r.ok
        ? action === "issue"
          ? b.emailSent
            ? "Offer issued and emailed."
            : "Offer issued; email delivery failure was recorded."
          : "Offer approved and ready to issue."
        : b.missingAdminInputs
          ? `Required: ${b.missingAdminInputs.join(", ")}`
          : [b.error, b.detail].filter(Boolean).join(": ") || "Action failed",
    );
    await load();
  }
  async function offlineAcceptance(id: string) {
    const acceptedAt = window.prompt(
        "Accepted date and time",
        new Date().toISOString(),
      ),
      evidenceReference =
        acceptedAt && window.prompt("Evidence/reference (required)"),
      note =
        evidenceReference && window.prompt("Administrative note (required)");
    if (!acceptedAt || !evidenceReference || !note) return;
    setBusy(true);
    const r = await fetch(`/api/admin/recruitment/offers/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "record_offline_acceptance",
          acceptedAt,
          evidenceReference,
          note,
        }),
      }),
      b = await r.json();
    setBusy(false);
    setMessage(
      r.ok
        ? "Offline acceptance recorded with evidence and audit trail."
        : b.error || "Acceptance could not be recorded",
    );
    await load();
  }
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#0075de]">
            People · Recruitment
          </div>
          <h1 className="mt-2 text-3xl font-extrabold">Offer management</h1>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            Formal offer drafting, approval, issue, and acceptance.
          </p>
        </div>
        <button
          onClick={() => {
            setReissue(false);
            setForm(blank);
            setOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-[#0075de] px-4 py-2 text-xs font-bold text-white"
        >
          <Plus size={14} />
          Create offer
        </button>
      </header>
      {message && (
        <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
          {message}
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
        <table className="w-full min-w-[850px] text-left text-xs">
          <thead className="bg-[var(--surface-2)]">
            <tr>
              {[
                "Candidate",
                "Application",
                "Role",
                "Joining",
                "Compensation",
                "Version",
                "Status",
                "Actions",
              ].map((x) => (
                <th className="px-4 py-3" key={x}>
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-t border-[var(--border-subtle)]"
              >
                <td className="px-4 py-3 font-semibold">
                  {item.candidateName}
                </td>
                <td className="px-4 py-3">{item.applicationReference}</td>
                <td className="px-4 py-3">{item.title}</td>
                <td className="px-4 py-3">{item.start_date || "—"}</td>
                <td className="px-4 py-3">
                  {item.currency}{" "}
                  {Number(item.salary || 0).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3">v{item.current_version}</td>
                <td className="px-4 py-3 font-bold uppercase">
                  {item.status === "sent"
                    ? "issued"
                    : item.status === "rejected"
                      ? "declined"
                      : item.status}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {["draft", "approved"].includes(item.status) && (
                      <button
                        onClick={() => {
                          setReissue(false);
                          hydrateOffer(item);
                          setOpen(true);
                        }}
                        className="rounded border px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Edit offer
                      </button>
                    )}
                    {item.status === "draft" && (
                      <button
                        disabled={busy}
                        onClick={() => void action(item.id, "approve")}
                        className="flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800"
                      >
                        <ShieldCheck size={11} />
                        Approve
                      </button>
                    )}
                    {item.status === "approved" && (
                      <button
                        disabled={busy}
                        onClick={() => void action(item.id, "issue")}
                        className="flex items-center gap-1 rounded bg-[#0075de] px-2 py-1 text-[10px] font-bold text-white hover:bg-blue-600"
                      >
                        <Send size={11} />
                        Issue offer
                      </button>
                    )}
                    {["sent", "accepted"].includes(item.status) && (
                      <a
                        className="rounded border px-2 py-1 text-[10px] font-bold hover:bg-slate-50"
                        href={`/api/admin/recruitment/offers/${item.id}`}
                      >
                        View document
                      </a>
                    )}
                    {item.status === "sent" && (
                      <button
                        disabled={busy}
                        onClick={() => void offlineAcceptance(item.id)}
                        className="rounded border border-amber-300 px-2 py-1 text-[10px] font-bold text-amber-800"
                      >
                        Record offline acceptance
                      </button>
                    )}
                    {["sent", "accepted", "rejected", "expired"].includes(
                      item.status,
                    ) && (
                      <button
                        onClick={() => {
                          setReissue(true);
                          hydrateOffer(item);
                          setOpen(true);
                        }}
                        className="rounded border px-2 py-1 text-[10px] font-bold text-purple-700 hover:bg-purple-50"
                      >
                        Create revision
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && (
          <div className="py-16 text-center text-xs text-[var(--text-muted)]">
            <FileSignature className="mx-auto mb-3" />
            No offers yet.
          </div>
        )}
      </div>
      {open && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/55 p-4"
          onMouseDown={() => setOpen(false)}
        >
          <form
            onSubmit={create}
            onMouseDown={(e) => e.stopPropagation()}
            className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-[var(--background)] p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black">
                  {reissue ? "Create new offer version" : "Create formal offer"}
                </h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Confirm approved employment terms. Internal database
                  identifiers remain hidden.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <section className="mt-6 rounded-xl border bg-[var(--surface-2)] p-4">
              <Field label="Application">
                <select
                  required
                  value={form.applicationId}
                  onChange={(e) => chooseApplication(e.target.value)}
                  className="input"
                >
                  <option value="">Select candidate application</option>
                  {applications.map((a) => (
                    <option value={a.id} key={a.id}>
                      {a.candidateName} · {a.title} · {a.reference}
                    </option>
                  ))}
                </select>
              </Field>
              {application && (
                <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                  <div>
                    <dt className="muted">Candidate</dt>
                    <dd className="font-bold">{application.candidateName}</dd>
                  </div>
                  <div>
                    <dt className="muted">Position</dt>
                    <dd className="font-bold">{application.title}</dd>
                  </div>
                  <div>
                    <dt className="muted">Application</dt>
                    <dd className="font-bold">{application.reference}</dd>
                  </div>
                </dl>
              )}
            </section>
            {form.backfillReason && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <strong>Recovery record</strong>
                <p className="mt-1">
                  This offer is being created for an employee whose recruitment
                  conversion was completed before the formal offer workflow.
                </p>
              </div>
            )}
            <Section title="Employment">
              <Field label="Job title">
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="Department">
                <select
                  required
                  value={form.departmentId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      departmentId: e.target.value,
                      designationId: "",
                    })
                  }
                  className="input"
                >
                  <option value="">Select department</option>
                  {departments.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Designation">
                <select
                  required
                  value={form.designationId}
                  onChange={(e) => setForm(applyResolvedTemplate(form, form.employmentType, e.target.value))}
                  className="input"
                >
                  <option value="">Select designation</option>
                  {filteredDesignations.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Reporting manager">
                <input
                  value={managerSearch}
                  onChange={(e) => setManagerSearch(e.target.value)}
                  placeholder="Search employee…"
                  className="input"
                />
                <select
                  value={form.managerEmployeeId}
                  onChange={(e) =>
                    setForm({ ...form, managerEmployeeId: e.target.value })
                  }
                  className="input mt-2"
                >
                  <option value="">No reporting manager</option>
                  {managerOptions.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name} · {x.designation}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Employment type">
                <select
                  value={form.employmentType}
                  onChange={(e) => setForm(applyResolvedTemplate(form, e.target.value, form.designationId))}
                  className="input"
                >
                  {["Full-time", "Part-time", "Contract", "Internship"].map(
                    (x) => (
                      <option key={x}>{x}</option>
                    ),
                  )}
                </select>
              </Field>
              <Field label="Work location">
                <input
                  required
                  value={form.workLocation}
                  onChange={(e) =>
                    setForm({ ...form, workLocation: e.target.value })
                  }
                  placeholder="Remote, office, hybrid, or location"
                  className="input"
                />
              </Field>
              <Field label="Joining date">
                <input
                  required
                  type="date"
                  value={form.joiningDate}
                  onChange={(e) =>
                    setForm({ ...form, joiningDate: e.target.value })
                  }
                  className="input"
                />
              </Field>
              <Field label="Candidate address">
                <textarea
                  value={form.candidateAddress}
                  onChange={(e) =>
                    setForm({ ...form, candidateAddress: e.target.value })
                  }
                  className="input min-h-20 py-3"
                />
              </Field>
            </Section>
            <Section title="Compensation">
              <Field label="Compensation type">
                <select value={form.compensationType} onChange={(e) => setForm({ ...form, compensationType: e.target.value })} className="input">
                  <option>Fixed</option><option>Incentive-based</option><option>Fixed plus incentive</option>
                </select>
              </Field>
              <Field label="Annual compensation">
                <input
                  required
                  type="number"
                  min="0"
                  value={form.salaryAmount}
                  onChange={(e) =>
                    setForm({ ...form, salaryAmount: e.target.value })
                  }
                  className="input"
                />
              </Field>
              <Field label="Currency">
                <select
                  value={form.salaryCurrency}
                  onChange={(e) =>
                    setForm({ ...form, salaryCurrency: e.target.value })
                  }
                  className="input"
                >
                  <option>INR</option>
                  <option>USD</option>
                  <option>GBP</option>
                  <option>EUR</option>
                </select>
              </Field>
              <Field label="Stipend period"><input value={form.stipendPeriod} onChange={(e) => setForm({ ...form, stipendPeriod: e.target.value })} placeholder="Monthly, one-time, or not applicable" className="input" /></Field>
              {/incentive/i.test(form.compensationType) && <>
                <Field label="Incentive type"><input required value={form.incentiveType} onChange={(e) => setForm({ ...form, incentiveType: e.target.value })} placeholder="Per qualified meeting, percentage, milestone" className="input" /></Field>
                <Field label="Incentive value"><input type="number" min="0" value={form.incentiveValue} onChange={(e) => setForm({ ...form, incentiveValue: e.target.value })} className="input" /></Field>
                <Field label="Incentive basis"><textarea required value={form.incentiveBasis} onChange={(e) => setForm({ ...form, incentiveBasis: e.target.value })} placeholder="State exactly when an incentive is earned" className="input min-h-20 py-3" /></Field>
                <Field label="Payment timing"><input required value={form.paymentTiming} onChange={(e) => setForm({ ...form, paymentTiming: e.target.value })} placeholder="For example: paid monthly after validation" className="input" /></Field>
              </>}
              <Field label="Compensation notes"><textarea value={form.compensationNotes} onChange={(e) => setForm({ ...form, compensationNotes: e.target.value })} className="input min-h-20 py-3" /></Field>
            </Section>
            <Section title="Employment terms">
              <Field label="Probation period">
                <div className="flex items-center gap-2">
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.probationDays}
                    onChange={(e) =>
                      setForm({ ...form, probationDays: e.target.value })
                    }
                    className="input"
                  />
                  <span className="text-xs">days</span>
                </div>
              </Field>
              <Field label="Notice period">
                <div className="flex items-center gap-2">
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.noticePeriodDays}
                    onChange={(e) =>
                      setForm({ ...form, noticePeriodDays: e.target.value })
                    }
                    className="input"
                  />
                  <span className="text-xs">days</span>
                </div>
              </Field>
              <Field label="Offer valid until">
                <input
                  required
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                  className="input"
                />
              </Field>
            </Section>
            <section className="mt-6 rounded-xl border p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Additional offer terms
              </h3>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Template: {form.offerTermTemplateName
                  ? `${form.offerTermTemplateName}${form.offerTermTemplateVersion ? ` — v${form.offerTermTemplateVersion}` : ""}`
                  : "No approved template resolved"}
              </p>
              <div className="mt-5 space-y-5">
                {[
                  ["workingTerms", "Working terms"],
                  ["confidentialityIp", "Confidentiality & intellectual property"],
                  ["termination", /intern/i.test(form.employmentType) ? "Ending the internship" : "Ending the engagement"],
                  ["acceptanceInstructions", "Acceptance"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#075a9c]">{label}</h4>
                    <p className="mt-2 whitespace-pre-line rounded-lg bg-[var(--surface-2)] p-3 text-xs leading-6 text-[var(--text-secondary)]">
                      {(form as any)[key] || "This approved section has not been configured."}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border px-5 py-3 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                disabled={busy}
                className="rounded-lg bg-[#0075de] px-5 py-3 text-xs font-bold text-white disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save draft"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-[#0075de]">
        {title}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-wide">
      {label}
      <div className="mt-1 normal-case">{children}</div>
    </label>
  );
}
