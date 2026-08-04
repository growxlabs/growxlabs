"use client";

import React from "react";
import { ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export function RecruitmentPipeline({ candidates, onUpdateStage, updatingCandidateId }: RecruitmentPipelineProps) {
  const getNextStage = (current: string) => {
    const idx = STAGES.indexOf(current);
    return idx < STAGES.length - 1 ? STAGES[idx + 1] : null;
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {STAGES.map((stage) => {
          const stageCandidates = candidates.filter((c) => {
            const candidateStage = String(c.stage || "APPLIED").trim().toUpperCase().replace(/[\s-]+/g, "_");
            return candidateStage === stage;
          });
          return (
            <div key={stage} className="w-[220px] flex-shrink-0">
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
                    className="bg-[var(--card)] rounded-lg border border-[var(--border-subtle)] p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">{candidate.full_name}</p>
                    <p className="text-[9px] text-[var(--text-secondary)] truncate">{candidate.email}</p>
                    <div className="flex items-center justify-between mt-2">
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
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
