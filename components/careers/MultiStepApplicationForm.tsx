"use client";

import { useRef, useState, FormEvent } from "react";
import { ArrowRight, CheckCircle2, UploadCloud, X } from "lucide-react";
import type { CareerJob } from "./JobCard";
import type { CandidateIdentity } from "./CandidateAuthModal";

interface MultiStepApplicationFormProps {
  job: Pick<CareerJob, "id" | "title" | "slug">;
  candidate: CandidateIdentity;
  onClose: () => void;
}

export function MultiStepApplicationForm({ job, candidate, onClose }: MultiStepApplicationFormProps) {
  const idempotencyKey = useRef(crypto.randomUUID());
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    firstName: candidate?.fullName?.split(" ")[0] || "",
    lastName: candidate?.fullName?.split(" ").slice(1).join(" ") || "",
    email: candidate?.email || "",
    phone: candidate?.phone || "",
    location: candidate?.location || "",
    coverLetter: "",
    linkedInURL: candidate?.linkedInURL || "",
    githubURL: candidate?.githubURL || "",
    portfolioURL: candidate?.portfolioURL || "",
    currentCompany: candidate?.currentCompany || "",
    noticePeriodDays: candidate?.noticePeriodDays || "",
    expectedSalary: candidate?.expectedSalary || "",
    source: "Careers portal",
    consent: false,
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Please attach a resume.");
      return;
    }
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError("Resume must be a PDF or DOCX file no larger than 10 MB.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      let checksum = "";
      try {
        const checksumBuffer = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
        checksum = Array.from(new Uint8Array(checksumBuffer))
          .map((v) => v.toString(16).padStart(2, "0"))
          .join("");
      } catch {}

      const payload = {
        ...form,
        candidateId: candidate?.id,
        noticePeriodDays: form.noticePeriodDays ? Number(form.noticePeriodDays) : null,
        expectedSalary: form.expectedSalary ? Number(form.expectedSalary) : null,
        resume: {
          name: file.name,
          contentType: file.type || "application/pdf",
          sizeBytes: file.size,
          checksumSHA256: checksum,
        },
      };

      const response = await fetch(`/api/v1/hrms/recruitment/public/jobs/${job.slug}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey.current },
        body: JSON.stringify(payload),
      });

      const body = await response.json();
      if (!response.ok) {
        const apiError = body?.error;
        throw new Error(typeof apiError === "object" ? apiError.message : body.detail || apiError || "Failed to submit application");
      }

      if (body.resumeUpload) {
          const upload = await fetch(body.resumeUpload.uploadUrl, {
            method: body.resumeUpload.method || "PUT",
            headers: body.resumeUpload.headers || { "Content-Type": file.type },
            body: file,
          });
          if (!upload.ok) throw new Error("Resume upload failed. Your application was saved without an attached resume.");
      }
      setDone(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Application could not be submitted.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className="mx-auto my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8 text-slate-950"
      >
        {done ? (
          <div className="py-14 text-center">
            <CheckCircle2 className="mx-auto text-emerald-600" size={44} />
            <h2 className="mt-5 text-2xl font-black text-slate-900">Application received</h2>
            <p className="mt-2 text-sm text-slate-500">
              We will review your profile for <strong className="text-slate-900">{job.title}</strong> and contact you by email.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-lg bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#0075de]">Apply now</div>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{job.title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {error && <div className="mt-5 rounded-lg bg-red-50 p-3 text-xs text-red-700 font-semibold">{error}</div>}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["First name", "firstName", "text"],
                ["Last name", "lastName", "text"],
                ["Email", "email", "email"],
                ["Phone", "phone", "tel"],
                ["Location", "location", "text"],
                ["Current company", "currentCompany", "text"],
                ["LinkedIn", "linkedInURL", "url"],
                ["GitHub", "githubURL", "url"],
                ["Portfolio", "portfolioURL", "url"],
                ["Notice period (days)", "noticePeriodDays", "number"],
                ["Expected salary (INR)", "expectedSalary", "number"],
              ].map(([label, key, type]) => (
                <label key={key} className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {label}
                  <input
                    required={["firstName", "lastName", "email"].includes(key)}
                    type={type}
                    value={(form[key as keyof typeof form] as string) || ""}
                    onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:border-[#0075de]"
                  />
                </label>
              ))}

              <label className="sm:col-span-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Cover letter
                <textarea
                  value={form.coverLetter}
                  onChange={(event) => setForm({ ...form, coverLetter: event.target.value })}
                  rows={4}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-3 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:border-[#0075de]"
                />
              </label>

              <label className="sm:col-span-2 flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-[#0075de]/40 bg-blue-50/60 p-5 text-sm font-bold text-[#0075de] hover:bg-blue-50">
                <UploadCloud size={20} />
                {file ? file.name : "Attach resume (PDF or DOCX, max 10MB)"}
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
              </label>

              <label className="sm:col-span-2 flex items-start gap-3 text-xs leading-5 text-slate-600">
                <input
                  required
                  type="checkbox"
                  checked={form.consent}
                  onChange={(event) => setForm({ ...form, consent: event.target.checked })}
                  className="mt-1 rounded"
                />
                I consent to GrowX Labs processing my information for recruitment purposes.
              </label>
            </div>

            <button
              disabled={saving}
              className="mt-6 h-11 w-full rounded-xl bg-[#0075de] text-sm font-bold text-white transition hover:bg-[#0062bd] disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {saving ? "Submitting…" : "Submit application"} <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
