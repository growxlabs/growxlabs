"use client";

import React, { useState } from "react";
import { ChevronRight, Star, History, X, FileText, User, ExternalLink, Calendar, Mail, Phone, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { CandidateEmailTimeline } from "@/components/admin/recruitment/CandidateEmailTimeline";

const STAGES = ["APPLIED", "SCREENING", "INTERVIEW", "ASSESSMENT", "OFFER", "HIRED"];
const STAGE_COLORS: Record<string, string> = {
  APPLIED: "border-[#0075de]/20 bg-[var(--surface-1)]",
  SCREENING: "border-violet-500/20 bg-[var(--surface-1)]",
  INTERVIEW: "border-amber-500/20 bg-[var(--surface-1)]",
  ASSESSMENT: "border-orange-500/20 bg-[var(--surface-1)]",
  OFFER: "border-emerald-500/20 bg-[var(--surface-1)]",
  HIRED: "border-green-500/20 bg-[var(--surface-1)]",
};
const STAGE_HEADER_COLORS: Record<string, string> = {
  APPLIED: "bg-[#0075de]",
  SCREENING: "bg-violet-600",
  INTERVIEW: "bg-amber-600",
  ASSESSMENT: "bg-orange-600",
  OFFER: "bg-emerald-600",
  HIRED: "bg-green-600",
};

interface RecruitmentPipelineProps {
  candidates: any[];
  onUpdateStage: (id: string, stage: string) => void;
  updatingCandidateId?: string | null;
  onSelectCandidate?: (candidate: any) => void;
}

export function RecruitmentPipeline({ candidates, onUpdateStage, updatingCandidateId, onSelectCandidate }: RecruitmentPipelineProps) {
  const [emailTimelineCandidate, setEmailTimelineCandidate] = useState<any>(null);
  const [selectedCandidateModal, setSelectedCandidateModal] = useState<any>(null);

  const getNextStage = (current: string) => {
    const idx = STAGES.indexOf(current);
    return idx < STAGES.length - 1 ? STAGES[idx + 1] : null;
  };

  return (
    <>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STAGES.map((stage) => {
            const stageCandidates = candidates.filter((c) => {
              const candidateStage = String(c.stage || "APPLIED").trim().toUpperCase().replace(/[\s-]+/g, "_");
              return candidateStage === stage;
            });
            return (
              <div key={stage} className="w-[240px] flex-shrink-0">
                {/* Column Header */}
                <div className={cn("rounded-t-xl px-3 py-2 flex items-center justify-between", STAGE_HEADER_COLORS[stage])}>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-white">{stage.replace("_", " ")}</span>
                  <span className="bg-white/20 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">{stageCandidates.length}</span>
                </div>

                {/* Candidate Cards */}
                <div className={cn("border-x border-b border-[var(--border-subtle)] rounded-b-xl p-2 space-y-2 min-h-[200px]", STAGE_COLORS[stage])}>
                  {stageCandidates.length === 0 && (
                    <p className="text-[9px] text-[var(--text-muted)] text-center py-8 font-medium">No candidates</p>
                  )}
                  {stageCandidates.map((candidate: any) => (
                    <div
                      key={candidate.id}
                      className="bg-[var(--card)] rounded-lg border border-[var(--border-subtle)] p-3 shadow-sm hover:shadow-md transition-shadow space-y-2"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-bold text-[var(--text-primary)] truncate">{candidate.full_name}</p>
                          <span className="text-[8px] font-mono font-bold text-[var(--text-muted)] shrink-0">{candidate.application_reference || "—"}</span>
                        </div>
                        <p className="text-[9px] text-[var(--text-secondary)] truncate">{candidate.email}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-bold text-[var(--text-secondary)]">{candidate.score || 0}</span>
                        </div>
                        {getNextStage(stage) && (
                          <button
                            type="button"
                            onClick={() => onUpdateStage(candidate.id, getNextStage(stage)!)}
                            disabled={updatingCandidateId === candidate.id}
                            aria-busy={updatingCandidateId === candidate.id}
                            className="flex items-center gap-0.5 text-[8px] font-bold text-[#0075de] hover:underline transition-colors uppercase tracking-wider cursor-pointer disabled:cursor-wait disabled:opacity-50"
                          >
                            {updatingCandidateId === candidate.id ? "Updating..." : "Advance"} <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      {/* Card Action Links */}
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[8px] font-bold uppercase tracking-wider">
                        <button
                          type="button"
                          onClick={() => setSelectedCandidateModal(candidate)}
                          className="flex items-center gap-1 text-[#0075de] hover:underline cursor-pointer"
                        >
                          <User className="h-2.5 w-2.5" /> Details
                        </button>

                        {candidate.resume_url ? (
                          <a
                            href={candidate.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-emerald-600 hover:underline cursor-pointer"
                          >
                            <FileText className="h-2.5 w-2.5" /> Resume
                          </a>
                        ) : (
                          <span className="text-[var(--text-muted)] opacity-60">No Resume</span>
                        )}

                        <button
                          type="button"
                          onClick={() => setEmailTimelineCandidate(candidate)}
                          className="flex items-center gap-1 text-violet-500 hover:underline cursor-pointer"
                        >
                          <History className="h-2.5 w-2.5" /> Emails
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate Full Profile Drawer */}
      {selectedCandidateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[200] flex items-center justify-end">
          <div className="h-full w-full max-w-lg bg-[var(--card)] border-l border-[var(--border-subtle)] shadow-2xl overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#0075de] tracking-wider block">
                  {selectedCandidateModal.application_reference || "APPLICATION DETAIL"}
                </span>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">{selectedCandidateModal.full_name}</h2>
                <p className="text-xs text-[var(--text-secondary)]">{selectedCandidateModal.job_title}</p>
              </div>
              <button
                onClick={() => setSelectedCandidateModal(null)}
                className="h-8 w-8 rounded-lg bg-[var(--surface-1)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Candidate Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Email Address</span>
                <span className="font-medium text-[var(--text-primary)] flex items-center gap-1.5"><Mail className="h-3 w-3 text-[#0075de]" /> {selectedCandidateModal.email}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Phone Number</span>
                <span className="font-medium text-[var(--text-primary)] flex items-center gap-1.5"><Phone className="h-3 w-3 text-emerald-600" /> {selectedCandidateModal.phone || "N/A"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Pipeline Stage</span>
                <span className="font-bold text-amber-500 uppercase">{selectedCandidateModal.stage}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Submitted Date</span>
                <span className="font-medium text-[var(--text-secondary)]">{selectedCandidateModal.submitted_at ? new Date(selectedCandidateModal.submitted_at).toLocaleString() : "—"}</span>
              </div>
            </div>

            {/* Resume Button */}
            {selectedCandidateModal.resume_url ? (
              <a
                href={selectedCandidateModal.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <FileText className="h-4 w-4" /> View Submitted Resume <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <div className="p-3 text-center text-xs text-[var(--text-muted)] bg-[var(--surface-1)] rounded-xl border border-[var(--border-subtle)]">
                No resume attached to this application
              </div>
            )}

            {/* Cover Letter */}
            {selectedCandidateModal.cover_letter && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Cover Letter / Statement</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] italic">
                  "{selectedCandidateModal.cover_letter}"
                </p>
              </div>
            )}

            {/* Application Answers */}
            {Array.isArray(selectedCandidateModal.answers) && selectedCandidateModal.answers.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Application Responses</h3>
                <div className="space-y-2">
                  {selectedCandidateModal.answers.map((ans: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border-subtle)] space-y-1 text-xs">
                      <span className="font-bold text-[var(--text-primary)] block">{ans.question_key || `Question ${idx + 1}`}</span>
                      <span className="text-[var(--text-secondary)] block">{String(ans.value || "No response")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email Timeline Modal */}
      {emailTimelineCandidate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[200] flex items-center justify-end">
          <div className="h-full w-full max-w-lg bg-[var(--card)] border-l border-[var(--border-subtle)] shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 bg-[var(--card)] px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">{emailTimelineCandidate.full_name}</h2>
                <p className="text-[10px] text-[var(--text-muted)]">{emailTimelineCandidate.email}</p>
              </div>
              <button
                onClick={() => setEmailTimelineCandidate(null)}
                className="h-8 w-8 rounded-lg bg-[var(--surface-1)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <CandidateEmailTimeline
                candidateId={emailTimelineCandidate.id}
                candidateEmail={emailTimelineCandidate.email}
                candidateName={emailTimelineCandidate.full_name}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
