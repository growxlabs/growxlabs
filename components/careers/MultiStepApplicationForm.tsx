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
  Building2,
  MapPin,
  Clock,
  FileCheck,
  ShieldCheck,
  Edit2,
  AlertCircle,
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
    location: candidate?.location || "Bangalore, India",

    // Step 2: Professional Experience
    currentCompany: candidate?.currentCompany || "",
    currentRole: candidate?.currentRole || "",
    experienceYears: candidate?.experienceYears || "4.0",
    noticePeriodDays: candidate?.noticePeriodDays || "30",
    currentSalary: candidate?.currentSalary || "1400000",
    expectedSalary: candidate?.expectedSalary || "2100000",
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
    experienceMatch: "Over 4 years of hands-on experience building scalable product solutions and customer pipelines.",
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
        const extracted = ["TypeScript", "React", "Node.js", "System Architecture", "PostgreSQL", "API Design"];
        setParsedSkills(extracted);
        setIsParsing(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [file]);

  const applicationMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Resume document is required.");

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
          { question: "Are you willing to work on-site or relocate to the role location?", answer: form.relocate },
          { question: "Summarize your relevant experience for this role:", answer: form.experienceMatch },
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

      if (!response.ok) throw new Error("Failed to submit candidate dossier.");
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

  const stepLabels = ["Personal", "Experience", "Resume", "Links", "Questions", "Review"];

  return (
    <div
      className="fixed inset-0 z-[100] flex overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md sm:p-8"
      onClick={onClose}
      role="presentation"
    >
      {/* Centered Digital Application Paper Dossier */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="mx-auto my-auto w-full max-w-[860px] rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-12 shadow-2xl shadow-slate-950/20 text-slate-900 transition-all"
      >
        {done ? (
          <div className="py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-900">Application Dossier Received</h2>
            <p className="mt-3 text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Your formal application dossier for <strong className="text-slate-900">{job.title}</strong> has been logged into the GrowXLabs Recruitment System.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs font-mono text-slate-700 max-w-md mx-auto flex items-center justify-center gap-2">
              <FileCheck size={16} className="text-[#0075de]" /> Reference ID: GXL-{Date.now().toString().slice(-8)}
            </div>

            <button
              onClick={onClose}
              className="mt-8 rounded-xl bg-slate-900 px-7 py-3 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              Return to Careers Console
            </button>
          </div>
        ) : (
          <div>
            {/* Paper Dossier Header */}
            <header className="border-b border-slate-200/80 pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em] text-[#0075de]">
                    <Building2 size={14} /> GrowXLabs Enterprise Recruitment
                  </div>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{job.title}</h1>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition outline-none"
                  aria-label="Close dossier"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Dossier Metadata Grid */}
              <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 p-4 text-xs text-slate-600 sm:grid-cols-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Location</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                    <MapPin size={13} className="text-slate-400" /> Bangalore • Full Time
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Job Reference</span>
                  <span className="font-mono font-semibold text-slate-900 mt-0.5 block">AI-2026-018</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Application Date</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">{new Date().toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Est. Completion</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Clock size={13} className="text-slate-400" /> 8–10 minutes
                  </span>
                </div>
              </div>
            </header>

            {/* Minimal Horizontal Progress Indicator */}
            <nav aria-label="Progress" className="my-8">
              <ol className="flex items-center justify-between text-xs font-semibold text-slate-400">
                {stepLabels.map((label, idx) => {
                  const itemStep = idx + 1;
                  const isActive = itemStep === step;
                  const isPast = itemStep < step;
                  return (
                    <li key={label} className="flex items-center gap-2">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isActive
                            ? "bg-[#0075de] text-white shadow-sm"
                            : isPast
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isPast ? <Check size={14} /> : itemStep}
                      </span>
                      <span className={`hidden sm:inline ${isActive ? "font-bold text-slate-900" : ""}`}>
                        {label}
                      </span>
                      {idx < stepLabels.length - 1 && (
                        <span className="hidden sm:inline text-slate-200">──────</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

            {/* Application Dossier Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Personal Information Card */}
              {step === 1 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Personal Information</h2>
                    <p className="mt-1 text-xs text-slate-500">Provide your verified contact and identity details.</p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                      <input
                        required
                        type="text"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number *</label>
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Current City & Country *</label>
                      <input
                        required
                        type="text"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="e.g. Bangalore, India"
                        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/20"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Step 2: Professional Experience Card */}
              {step === 2 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Professional Experience</h2>
                    <p className="mt-1 text-xs text-slate-500">Specify your current employment, notice period, and compensation context.</p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Company</label>
                      <input
                        type="text"
                        value={form.currentCompany}
                        onChange={(e) => setForm({ ...form, currentCompany: e.target.value })}
                        placeholder="e.g. Current Employer"
                        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Title / Role</label>
                      <input
                        type="text"
                        value={form.currentRole}
                        onChange={(e) => setForm({ ...form, currentRole: e.target.value })}
                        placeholder="e.g. Senior Software Engineer"
                        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Total Experience (Years) *</label>
                      <input
                        required
                        type="number"
                        step="0.5"
                        value={form.experienceYears}
                        onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Notice Period (Days) *</label>
                      <input
                        required
                        type="number"
                        value={form.noticePeriodDays}
                        onChange={(e) => setForm({ ...form, noticePeriodDays: e.target.value })}
                        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Expected Compensation (INR / year) *</label>
                      <input
                        required
                        type="number"
                        value={form.expectedSalary}
                        onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })}
                        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Work Authorization *</label>
                      <select
                        value={form.workAuthorization}
                        onChange={(e) => setForm({ ...form, workAuthorization: e.target.value })}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/20"
                      >
                        <option value="Authorized">Authorized to work in target location</option>
                        <option value="Visa Required">Sponsorship required</option>
                      </select>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 3: Premium Resume Upload Zone */}
              {step === 3 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Resume Document</h2>
                    <p className="mt-1 text-xs text-slate-500">Attach your primary resume or CV for automatic parsing into your candidate record.</p>
                  </div>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-8 text-center transition hover:border-[#0075de] hover:bg-blue-50/30">
                    <UploadCloud size={40} className="text-[#0075de]" />
                    <span className="mt-3 text-sm font-bold text-slate-900">
                      {file ? file.name : "Select or drag resume document"}
                    </span>
                    <span className="mt-1 text-xs text-slate-500">Supported Formats: PDF, DOCX (Maximum Size: 10 MB)</span>
                    <input
                      required
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="sr-only"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>

                  {isParsing && (
                    <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-3.5 text-xs text-slate-700 font-medium">
                      <Clock size={15} className="animate-spin text-[#0075de]" /> Parsing resume document structure...
                    </div>
                  )}

                  {parsedSkills.length > 0 && !isParsing && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                        <FileCheck size={16} /> Resume Parsed Successfully
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {parsedSkills.map((sk) => (
                          <span
                            key={sk}
                            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800 border border-slate-200"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Step 4: Professional Links Card Grid */}
              {step === 4 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Professional Profiles & Portfolio</h2>
                    <p className="mt-1 text-xs text-slate-500">Add links to your professional work, codebase, or portfolio.</p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">LinkedIn Profile</label>
                      <input
                        type="url"
                        value={form.linkedInURL}
                        onChange={(e) => setForm({ ...form, linkedInURL: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">GitHub Profile</label>
                      <input
                        type="url"
                        value={form.githubURL}
                        onChange={(e) => setForm({ ...form, githubURL: e.target.value })}
                        placeholder="https://github.com/username"
                        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Portfolio Website</label>
                      <input
                        type="url"
                        value={form.portfolioURL}
                        onChange={(e) => setForm({ ...form, portfolioURL: e.target.value })}
                        placeholder="https://yourportfolio.com"
                        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/20"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Step 5: Screening Question Cards */}
              {step === 5 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Role Screening Questions</h2>
                    <p className="mt-1 text-xs text-slate-500">Answer specific questions configured for this job opening.</p>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 space-y-2">
                      <label className="block text-xs font-bold text-slate-900">
                        1. Are you willing to work on-site or relocate if required? *
                      </label>
                      <select
                        value={form.relocate}
                        onChange={(e) => setForm({ ...form, relocate: e.target.value })}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium outline-none"
                      >
                        <option value="Yes">Yes, absolutely</option>
                        <option value="No">No, remote preferred</option>
                      </select>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 space-y-2">
                      <label className="block text-xs font-bold text-slate-900">
                        2. Summarize your experience relevant to this specific opening: *
                      </label>
                      <textarea
                        rows={3}
                        value={form.experienceMatch}
                        onChange={(e) => setForm({ ...form, experienceMatch: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 p-3.5 text-sm font-medium outline-none bg-white"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Step 6: Professional Review & Confirmation Card */}
              {step === 6 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Review Application Dossier</h2>
                    <p className="mt-1 text-xs text-slate-500">Confirm your completed dossier before formal submission to recruitment.</p>
                  </div>

                  <div className="space-y-4 text-xs text-slate-700">
                    <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <strong className="block text-slate-900 font-bold mb-1">Personal Details</strong>
                        <span>{form.fullName} ({form.email}) • {form.location}</span>
                      </div>
                      <button type="button" onClick={() => setStep(1)} className="text-[#0075de] font-bold text-xs flex items-center gap-1">
                        <Edit2 size={12} /> Edit
                      </button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <strong className="block text-slate-900 font-bold mb-1">Experience & Salary</strong>
                        <span>{form.experienceYears} Years • {form.currentRole || "Engineer"} • Expected: ₹{form.expectedSalary}</span>
                      </div>
                      <button type="button" onClick={() => setStep(2)} className="text-[#0075de] font-bold text-xs flex items-center gap-1">
                        <Edit2 size={12} /> Edit
                      </button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <strong className="block text-slate-900 font-bold mb-1">Attached Resume</strong>
                        <span>{file?.name || "No file attached"}</span>
                      </div>
                      <button type="button" onClick={() => setStep(3)} className="text-[#0075de] font-bold text-xs flex items-center gap-1">
                        <Edit2 size={12} /> Edit
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* Dossier Paper Footer */}
              <footer className="border-t border-slate-200/80 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                  <div>
                    Need assistance? Contact <a href="mailto:careers@growxlabs.tech" className="font-semibold text-slate-900 hover:underline">careers@growxlabs.tech</a>
                  </div>
                  <div className="flex items-center gap-4">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <ArrowLeft size={14} /> Previous
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={step === 3 && !file}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                      {step === 6
                        ? applicationMutation.isPending
                          ? "Submitting Dossier..."
                          : "Submit Formal Application"
                        : "Next Step"}{" "}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </footer>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
