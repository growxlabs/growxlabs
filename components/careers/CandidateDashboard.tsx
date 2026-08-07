"use client";

import { useQuery } from "@tanstack/react-query";
import { User, Briefcase, Calendar, FileText, CheckCircle2, Clock, MapPin, Award } from "lucide-react";

interface CandidateDashboardProps {
  candidate: any;
  onClose: () => void;
}

export function CandidateDashboard({ candidate, onClose }: CandidateDashboardProps) {
  const applicationsQuery = useQuery({
    queryKey: ["candidate-applications", candidate?.id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/hrms/recruitment/public/candidates/me/applications?candidateId=${candidate?.id}`);
      if (!res.ok) return { items: [] };
      return res.json();
    },
    enabled: Boolean(candidate?.id),
  });

  const applications = applicationsQuery.data?.items || [
    {
      id: "app_101",
      jobTitle: "Business Development Executive (BDE)",
      status: "under_review",
      stage: "Screening & Resume Match",
      appliedAt: new Date().toISOString(),
      location: "Multiple Locations Across India",
      employmentType: "Full-time",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0075de] font-bold text-lg">
            {candidate?.fullName?.[0] || <User size={20} />}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">{candidate?.fullName || "Candidate Dashboard"}</h2>
            <p className="text-xs text-slate-500">{candidate?.email} · Candidate Portal</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          Back to Jobs
        </button>
      </div>

      <div className="mt-8 space-y-6">
        {/* My Applications Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
              <Briefcase size={16} className="text-[#0075de]" /> My Applications ({applications.length})
            </h3>
          </div>

          <div className="space-y-4">
            {applications.map((app: any) => (
              <div
                key={app.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4 hover:border-[#0075de]/40 transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-black text-slate-900">{app.jobTitle}</h4>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {app.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-[#0075de] uppercase tracking-wider">
                    {String(app.status || "").toLowerCase() === "rejected" ? "Not selected" : (app.stage || app.status)}
                  </span>
                </div>

                {/* Status Pipeline Progress Bar */}
                <div className="pt-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Application Status Pipeline
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {[
                      { key: "applied", label: "Applied" },
                      { key: "under_review", label: "Review" },
                      { key: "screening", label: "Screening" },
                      { key: "interview", label: "Interview" },
                      { key: "offer", label: "Offer" },
                    ].map((step, idx) => (
                      <div
                        key={step.key}
                        className={`rounded-lg p-2 text-[10px] font-bold ${
                          idx <= 1
                            ? "bg-[#0075de] text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {step.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate Resume & Profile Card */}
        <div className="grid gap-4 sm:grid-cols-2 pt-4">
          <div className="rounded-2xl border border-slate-200 p-5 bg-white">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <FileText size={14} className="text-[#0075de]" /> Saved Resumes
            </div>
            <p className="mt-2 text-xs text-slate-600">Primary Candidate Resume Version 1.0 (PDF)</p>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 p-2 rounded-lg w-fit">
              <CheckCircle2 size={12} /> Parsed & Searchable in Recruiter Database
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5 bg-white">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Award size={14} className="text-[#0075de]" /> Upcoming Interviews
            </div>
            <p className="mt-2 text-xs text-slate-600">No scheduled interviews pending at this time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
