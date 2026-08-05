"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Plus, RefreshCw, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RecruitmentPipeline } from "@/components/admin/hrms/RecruitmentPipeline";

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showJobForm, setShowJobForm] = useState(false);
  const emptyJob = { title: "", department: "", description: "", salary_range: "", requirements: "", location: "India", employment_type: "Full-time", workplace_type: "On-site", applications_open_at: "", applications_close_at: "", application_limit: "" };
  const [jobForm, setJobForm] = useState(emptyJob);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [updatingCandidateId, setUpdatingCandidateId] = useState<string | null>(null);
  const [stageError, setStageError] = useState("");

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const res = await fetch("/api/hrms/recruitment", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load recruitment data");
      setJobs(data.jobs || []);
    } catch (e) { console.error(e); setJobs([]); setLoadError("We couldn’t load recruitment information. Please refresh and try again."); } finally { setLoading(false); }
  };

  const handleCreateJob = async () => {
    try {
      setSubmitting(true);
      setSubmitError("");
      const res = await fetch("/api/hrms/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...jobForm,
          requirements: jobForm.requirements.split(",").map(r => r.trim()).filter(Boolean),
          applications_open_at: jobForm.applications_open_at ? new Date(jobForm.applications_open_at).toISOString() : null,
          applications_close_at: jobForm.applications_close_at ? new Date(jobForm.applications_close_at).toISOString() : null,
          application_limit: jobForm.application_limit ? Number(jobForm.application_limit) : null,
        })
      });
      if (res.ok) {
        setShowJobForm(false);
        setJobForm(emptyJob);
        fetchJobs();
      } else { setSubmitError("We couldn’t publish this job opening. Please review the details and try again."); }
    } catch (e) { console.error(e); setSubmitError("Unable to publish job opening. Please try again."); } finally { setSubmitting(false); }
  };

  const handleUpdateStage = async (candidateId: string, newStage: string) => {
    try {
      setUpdatingCandidateId(candidateId);
      setStageError("");
      const response = await fetch("/api/hrms/recruitment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: candidateId, stage: newStage }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to update candidate stage");
      await fetchJobs();
    } catch (e) {
      console.error(e);
      setStageError("We couldn’t update this candidate’s stage. Please try again.");
    } finally {
      setUpdatingCandidateId(null);
    }
  };

  const allCandidates = jobs.flatMap((j: any) => (j.candidates || []).map((c: any) => ({ ...c, job_title: j.title })));
  const displayStage = (stage: string) => String(stage || "APPLIED").replace(/[_-]+/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <div className="space-y-8 text-[var(--text-primary)]">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight leading-none">Recruitment Pipeline</h1>
        <p className="text-[var(--text-secondary)] text-xs">Track job openings, candidate progress, and hiring activity.</p>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <p className="text-xs font-bold text-[var(--text-secondary)]">Active Job Openings: {jobs.length}</p>
        <div className="flex items-center gap-2">
          <button onClick={fetchJobs} className="flex items-center gap-1.5 border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer" title="Refresh applications"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
          <button onClick={() => setShowJobForm(true)} className="flex items-center gap-1.5 bg-[#0075de] hover:bg-[#005bab] text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"><Plus className="h-3.5 w-3.5" /> Post Job Opening</button>
        </div>
      </div>

      {loadError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{loadError}</div>}

      {/* Post Job Modal */}
      {showJobForm && (
        <Card className="p-5 border border-[var(--border-subtle)] bg-[var(--card)] rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">New Job Opening</h3>
            <button onClick={() => setShowJobForm(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: "title", label: "Job Title", placeholder: "Senior Full Stack Engineer" },
              { key: "department", label: "Department", placeholder: "Sales & Marketing" },
              { key: "salary_range", label: "Salary Range", placeholder: "₹15,00,000 - ₹25,00,000" },
              { key: "description", label: "Description", placeholder: "Key responsibilities...", full: true },
              { key: "requirements", label: "Requirements (comma-separated)", placeholder: "React, Node.js, PostgreSQL", full: true },
              { key: "location", label: "Location", placeholder: "India" },
              { key: "employment_type", label: "Employment type", placeholder: "Full-time / Internship" },
              { key: "workplace_type", label: "Workplace", placeholder: "On-site / Remote / Hybrid" },
              { key: "applications_open_at", label: "Opening (optional)", placeholder: "YYYY-MM-DDTHH:mm", type: "datetime-local" },
              { key: "applications_close_at", label: "Closing (optional)", placeholder: "YYYY-MM-DDTHH:mm", type: "datetime-local" },
              { key: "application_limit", label: "Application limit (optional)", placeholder: "Maximum applications", type: "number" },
            ].map((field) => (
              <div key={field.key} className={field.full ? "md:col-span-2" : ""}>
                <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">{field.label}</label>
                <input
                  type={(field as any).type || "text"}
                  placeholder={field.placeholder}
                  value={(jobForm as any)[field.key]}
                  onChange={(e) => setJobForm({ ...jobForm, [field.key]: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0075de]/20"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleCreateJob}
            disabled={submitting}
            className="mt-4 bg-[#0075de] hover:bg-[#005bab] text-white px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : "Publish Job Opening"}
          </button>
          {submitError && <p className="mt-3 text-xs text-red-600">{submitError}</p>}
        </Card>
      )}

      {/* Kanban Board */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#0075de] h-8 w-8" />
        </div>
      ) : (
        <>
          {stageError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {stageError}
            </div>
          )}
          <RecruitmentPipeline
            candidates={allCandidates}
            onUpdateStage={handleUpdateStage}
            updatingCandidateId={updatingCandidateId}
          />
        </>
      )}

      {!loading && !loadError && (
        <Card className="overflow-hidden border border-[var(--border-subtle)] bg-[var(--card)] rounded-xl">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
            <div><h2 className="text-sm font-bold">Submitted Applications</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">Applications received from the public careers portal.</p></div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">{allCandidates.length}</span>
          </div>
          {allCandidates.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-[var(--text-secondary)]">No applications have been submitted yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--surface-1)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  <tr>
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3">Candidate</th>
                    <th className="px-5 py-3">Job</th>
                    <th className="px-5 py-3">Stage</th>
                    <th className="px-5 py-3">Resume</th>
                    <th className="px-5 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {allCandidates.map((candidate: any) => (
                    <tr key={candidate.id} className="border-t border-[var(--border-subtle)] hover:bg-[var(--surface-1)]/50 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-[#0075de]">{candidate.application_reference || "—"}</td>
                      <td className="px-5 py-3 font-medium">
                        {candidate.full_name}
                        <div className="text-[10px] text-[var(--text-secondary)]">{candidate.email}</div>
                      </td>
                      <td className="px-5 py-3 font-medium">{candidate.job_title}</td>
                      <td className="px-5 py-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500">
                          {displayStage(candidate.stage)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {candidate.resume_url ? (
                          <a
                            href={candidate.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:underline uppercase tracking-wider"
                          >
                            Download Resume ↗
                          </a>
                        ) : (
                          <span className="text-[10px] text-[var(--text-muted)] italic">No Resume</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[var(--text-secondary)]">{candidate.submitted_at ? new Date(candidate.submitted_at).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
