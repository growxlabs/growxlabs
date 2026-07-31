"use client";

import { useState, useEffect, FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  UploadCloud,
  X,
  FileText,
  User,
  Briefcase,
  Link as LinkIcon,
  HelpCircle,
  Check,
  Sparkles,
} from "lucide-react";
import type { CareerJob } from "./JobCard";

interface MultiStepApplicationFormProps {
  job: Pick<CareerJob, "id" | "title" | "slug">;
  candidate: any;
  onClose: () => void;
}

export function MultiStepApplicationForm({ job, candidate, onClose }: MultiStepApplicationFormProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedSkills, setParsedSkills] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  // Application state
  const [form, setForm] = useState({
    // Step 1: Personal Info
    fullName: candidate?.fullName || "",
    email: candidate?.email || "",
    phone: candidate?.phone || "",
    location: candidate?.location || "India",

    // Step 2: Professional Info
    currentCompany: candidate?.currentCompany || "",
    currentRole: candidate?.currentRole || "",
    experienceYears: candidate?.experienceYears || "3.5",
    noticePeriodDays: candidate?.noticePeriodDays || "30",
    currentSalary: candidate?.currentSalary || "1200000",
    expectedSalary: candidate?.expectedSalary || "1800000",
    workAuthorization: "Authorized",
    preferredLocation: "On-site / Hybrid",

    // Step 4: Professional Links
    linkedInURL: candidate?.linkedInURL || "",
    githubURL: candidate?.githubURL || "",
    portfolioURL: candidate?.portfolioURL || "",
    behanceURL: candidate?.behanceURL || "",
    dribbbleURL: candidate?.dribbbleURL || "",
    mediumURL: candidate?.mediumURL || "",

    // Step 5: Screening Questions
    relocate: "Yes",
    experienceMatch: "Over 3 years of hands-on experience in business development and technical client solutions.",
    availabilityDate: "Immediate",

    // Cover letter & consent
    coverLetter: "",
    consent: true,
  });

  // Handle auto-parsing when file is selected
  useEffect(() => {
    if (file) {
      setIsParsing(true);
      const timer = setTimeout(() => {
        // Simulated AI Parser extraction
        const nameSkills = ["Sales", "Business Development", "Client Acquisition", "CRM", "Negotiation", "Strategy"];
        setParsedSkills(nameSkills);
        setIsParsing(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [file]);

  const applicationMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Resume is required.");

      const payload = {
        jobId: job.id,
        candidateId: candidate?.id || `cand_${Date.now()}`,
        organisationID: process.env.NEXT_PUBLIC_DEFAULT_ORGANISATION_ID || "org_default",
        personalInfo: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          location: form.location,
        },
        professionalInfo: {
          currentCompany: form.currentCompany,
          currentRole: form.currentRole,
          experienceYears: Number(form.experienceYears),
          noticePeriodDays: Number(form.noticePeriodDays),
          currentSalary: Number(form.currentSalary),
          expectedSalary: Number(form.expectedSalary),
          workAuthorization: form.workAuthorization,
          preferredLocation: form.preferredLocation,
        },
        links: {
          linkedIn: form.linkedInURL,
          github: form.githubURL,
          portfolio: form.portfolioURL,
          behance: form.behanceURL,
          dribbble: form.dribbbleURL,
          medium: form.mediumURL,
        },
        screeningAnswers: [
          { question: "Are you willing to relocate or work on-site?", answer: form.relocate },
          { question: "Describe your relevant experience.", answer: form.experienceMatch },
          { question: "What is your earliest availability date?", answer: form.availabilityDate },
        ],
        coverLetter: form.coverLetter,
        resume: {
          name: file.name,
          sizeBytes: file.size,
          contentType: file.type || "application/pdf",
          parsedSkills,
        },
      };

      const response = await fetch(`/api/v1/hrms/recruitment/public/jobs/${job.slug}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to submit application.");
      return response.json();
    },
    onSuccess: () => {
      setDone(true);
      void queryClient.invalidateQueries({ queryKey: ["candidate-applications"] });
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (step < 6) {
      setStep(step + 1);
    } else {
      applicationMutation.mutate();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="mx-auto my-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-10"
      >
        {done ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="mt-6 text-3xl font-black text-slate-900">Application Submitted!</h2>
            <p className="mt-3 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your candidate profile, resume, and answers have been securely submitted for{" "}
              <strong className="text-slate-900">{job.title}</strong>.
            </p>

            <div className="mt-6 rounded-2xl bg-blue-50/60 p-4 text-xs text-[#0075de] font-semibold border border-blue-100 max-w-md mx-auto">
              Candidate Application ID: <span className="font-mono">{`APP-${Date.now().toString().slice(-6)}`}</span>
            </div>

            <button
              onClick={onClose}
              className="mt-8 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#0075de]">
                  Job Application · Step {step} of 6
                </div>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{job.title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-[#0075de]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="my-6 flex gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i <= step ? "bg-[#0075de]" : "bg-slate-100"
                  }`}
                />
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <User size={16} className="text-[#0075de]" /> Step 1: Personal Information
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Full Name
                      </label>
                      <input
                        required
                        type="text"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Email Address
                      </label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Phone Number
                      </label>
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Current City & Country
                      </label>
                      <input
                        required
                        type="text"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="e.g. Hyderabad, India"
                        className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Professional Info */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Briefcase size={16} className="text-[#0075de]" /> Step 2: Professional Information
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Current Company
                      </label>
                      <input
                        type="text"
                        value={form.currentCompany}
                        onChange={(e) => setForm({ ...form, currentCompany: e.target.value })}
                        placeholder="e.g. Acme Corp"
                        className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Current Role Title
                      </label>
                      <input
                        type="text"
                        value={form.currentRole}
                        onChange={(e) => setForm({ ...form, currentRole: e.target.value })}
                        placeholder="e.g. Sales Executive"
                        className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Total Experience (Years)
                      </label>
                      <input
                        required
                        type="number"
                        step="0.5"
                        value={form.experienceYears}
                        onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                        className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Notice Period (Days)
                      </label>
                      <input
                        required
                        type="number"
                        value={form.noticePeriodDays}
                        onChange={(e) => setForm({ ...form, noticePeriodDays: e.target.value })}
                        className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Expected Salary (INR / year)
                      </label>
                      <input
                        required
                        type="number"
                        value={form.expectedSalary}
                        onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })}
                        className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Work Authorization
                      </label>
                      <select
                        value={form.workAuthorization}
                        onChange={(e) => setForm({ ...form, workAuthorization: e.target.value })}
                        className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
                      >
                        <option value="Authorized">Authorized to work in target country</option>
                        <option value="Visa Required">Sponsorship / Visa required</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Resume Upload & Parsing */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <FileText size={16} className="text-[#0075de]" /> Step 3: Resume Upload & AI Parser
                  </div>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#0075de]/40 bg-blue-50/50 p-8 text-center transition hover:bg-blue-50">
                    <UploadCloud size={36} className="text-[#0075de]" />
                    <span className="mt-3 text-sm font-bold text-slate-900">
                      {file ? file.name : "Click or drag resume here"}
                    </span>
                    <span className="mt-1 text-xs text-slate-500">Supports PDF or DOCX (Max 10 MB)</span>
                    <input
                      required
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="sr-only"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>

                  {isParsing && (
                    <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-xs text-[#0075de] font-semibold animate-pulse">
                      <Sparkles size={14} /> AI Parser is extracting skills and work history...
                    </div>
                  )}

                  {parsedSkills.length > 0 && !isParsing && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Extracted Resume Skills
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {parsedSkills.map((sk) => (
                          <span
                            key={sk}
                            className="rounded-full bg-white px-2.5 py-1 text-xs font-bold border border-slate-200 text-slate-700"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Professional Links */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <LinkIcon size={16} className="text-[#0075de]" /> Step 4: Professional Links & Portfolio
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        value={form.linkedInURL}
                        onChange={(e) => setForm({ ...form, linkedInURL: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        GitHub Profile
                      </label>
                      <input
                        type="url"
                        value={form.githubURL}
                        onChange={(e) => setForm({ ...form, githubURL: e.target.value })}
                        placeholder="https://github.com/username"
                        className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Portfolio Website
                      </label>
                      <input
                        type="url"
                        value={form.portfolioURL}
                        onChange={(e) => setForm({ ...form, portfolioURL: e.target.value })}
                        placeholder="https://yourportfolio.com"
                        className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Screening Questions */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <HelpCircle size={16} className="text-[#0075de]" /> Step 5: Role Screening Questions
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        1. Are you willing to work on-site or relocate to the role location?
                      </label>
                      <select
                        value={form.relocate}
                        onChange={(e) => setForm({ ...form, relocate: e.target.value })}
                        className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
                      >
                        <option value="Yes">Yes, absolutely</option>
                        <option value="No">No, remote preferred</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        2. Summarize your experience relevant to this specific opening:
                      </label>
                      <textarea
                        rows={3}
                        value={form.experienceMatch}
                        onChange={(e) => setForm({ ...form, experienceMatch: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Review & Submit */}
              {step === 6 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Check size={16} className="text-[#0075de]" /> Step 6: Review & Confirm Submission
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3 text-xs text-slate-700">
                    <div>
                      <strong>Applicant:</strong> {form.fullName} ({form.email})
                    </div>
                    <div>
                      <strong>Location:</strong> {form.location} · {form.experienceYears} yrs experience
                    </div>
                    <div>
                      <strong>Attached Resume:</strong> {file?.name || "None attached"}
                    </div>
                  </div>
                </div>
              )}

              {/* Form Action Controls */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={step === 3 && !file}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0075de] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#0062bd] disabled:opacity-50"
                >
                  {step === 6
                    ? applicationMutation.isPending
                      ? "Submitting..."
                      : "Submit Application"
                    : "Continue Next Step"}{" "}
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
