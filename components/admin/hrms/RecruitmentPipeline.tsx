"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  Star,
  History,
  X,
  FileText,
  User,
  ExternalLink,
  Mail,
  Phone,
  Video,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CandidateEmailTimeline } from "@/components/admin/recruitment/CandidateEmailTimeline";

const STAGES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "HIRED",
];
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
  onRefresh?: () => void;
  showRejected?: boolean;
}

export function RecruitmentPipeline({
  candidates,
  onUpdateStage,
  updatingCandidateId,
  onRefresh,
  showRejected,
}: RecruitmentPipelineProps) {
  const [emailTimelineCandidate, setEmailTimelineCandidate] =
    useState<any>(null);
  const [selectedCandidateModal, setSelectedCandidateModal] =
    useState<any>(null);
  const [rejecting, setRejecting] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [converting, setConverting] = useState<any>(null);
  const [conversion, setConversion] = useState({
    employeeCode: "",
    departmentId: "",
    designationId: "",
    managerEmployeeId: "",
    joiningDate: new Date().toISOString().slice(0, 10),
    roleId: "",
  });
  const [conversionOptions, setConversionOptions] = useState<any>({
    departments: [],
    designations: [],
    employees: [],
    roleName: "Business Development Executive",
  });
  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionResult, setConversionResult] = useState<any>(null);
  const [conversionError, setConversionError] = useState("");
  const [offerOverrideReason, setOfferOverrideReason] = useState("");
  const [offerOverrideRequired, setOfferOverrideRequired] = useState(false);
  const [conversionBusy, setConversionBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const openConversion = async (candidate: any) => {
    setConverting(candidate);
    setConversionResult(null);
    setConversionError("");
    setOfferOverrideRequired(false);
    setOfferOverrideReason("");
    setConversionLoading(true);
    try {
      const response = await fetch(
        `/api/admin/recruitment/offers?applicationId=${encodeURIComponent(candidate.id)}`,
      );
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(body?.error || "Conversion data could not be loaded.");
      const offer = (body?.items || []).find(
        (item: any) => item.application_id === candidate.id,
      );
      const snapshot = offer?.currentSnapshot || {};
      const department = (body?.departments || []).find(
        (item: any) =>
          item.id === snapshot.departmentId ||
          item.name === snapshot.departmentName,
      );
      const designation = (body?.designations || []).find(
        (item: any) =>
          item.id === snapshot.designationId ||
          item.name === snapshot.designationName ||
          item.name === snapshot.title,
      );
      const existing = (body?.employees || []).find(
        (item: any) =>
          item.name?.toLowerCase() === candidate.full_name?.toLowerCase(),
      );
      setConversionOptions({
        departments: body?.departments || [],
        designations: body?.designations || [],
        employees: body?.employees || [],
        roleName: snapshot.title || "Business Development Executive",
        offerStatus: offer?.status,
        offerVersion: offer?.current_version,
        existing,
      });
      setConversion({
        employeeCode:
          existing?.employee_number ||
          `GXL-EMP-${new Date().getFullYear()}-${String((body?.employees || []).length + 1).padStart(4, "0")}`,
        departmentId: department?.id || "",
        designationId: designation?.id || "",
        managerEmployeeId: "",
        joiningDate:
          snapshot.joiningDate ||
          offer?.start_date ||
          new Date().toISOString().slice(0, 10),
        roleId: "",
      });
    } catch (error) {
      setConversionError(
        error instanceof Error
          ? error.message
          : "Conversion data could not be loaded.",
      );
    } finally {
      setConversionLoading(false);
    }
  };
  const convert = async (offerOverride = false) => {
    if (!converting) return;
    setConversionError("");
    setConversionBusy(true);
    try {
      const response = await fetch(
        `/api/admin/recruitment/applications/${converting.id}/convert-to-employee`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...conversion,
            managerEmployeeId: conversion.managerEmployeeId || null,
            roleId: conversion.roleId || null,
            offerOverride,
            offerOverrideReason: offerOverride
              ? offerOverrideReason
              : undefined,
          }),
        },
      );
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.success) {
        setOfferOverrideRequired(body?.error?.code === "offer_required");
        return setConversionError(
          body?.error?.message || "We couldn't create this employee.",
        );
      }
      setConversionResult(body.conversion);
      onRefresh?.();
    } catch {
      setConversionError(
        "We couldn't reach the employee service. Please try again.",
      );
    } finally {
      setConversionBusy(false);
    }
  };
  const resendActivation = async () => {
    if (!conversionResult?.employeeId || resendBusy) return;
    setResendBusy(true);
    setConversionError("");
    try {
      const response = await fetch(
        `/api/admin/employees/${conversionResult.employeeId}/activation/reissue`,
        { method: "POST" },
      );
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.success)
        return setConversionError(
          body?.error?.message || "The activation email could not be reissued.",
        );
      setConversionResult((result: any) => ({
        ...result,
        activationEmail: body.activationEmail,
      }));
    } catch {
      setConversionError(
        "We couldn't reach the email service. Please try again.",
      );
    } finally {
      setResendBusy(false);
    }
  };
  const reasons = [
    "Does not meet role requirements",
    "Insufficient relevant experience",
    "Communication not suitable",
    "Interview performance",
    "Assessment performance",
    "Availability / joining constraints",
    "Compensation mismatch",
    "Position filled",
    "Candidate withdrew",
    "Duplicate application",
    "Other",
  ];
  const reject = async () => {
    if (!rejecting || !reason || (reason === "Other" && !note.trim())) return;
    const response = await fetch(
      `/api/admin/recruitment/applications/${rejecting.id}/rejection`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          note,
          sendEmail,
          otherReason: reason === "Other" ? note : undefined,
        }),
      },
    );
    if (response.ok) {
      setRejecting(null);
      setReason("");
      setNote("");
      onRefresh?.();
    }
  };
  const reopen = async (candidate: any) => {
    if (
      (
        await fetch(
          `/api/admin/recruitment/applications/${candidate.id}/rejection`,
          { method: "PATCH" },
        )
      ).ok
    )
      onRefresh?.();
  };
  const resendForCandidate = async (candidate: any) => {
    const response = await fetch(
      `/api/admin/employees/${candidate.employee_id}/activation/reissue`,
      { method: "POST" },
    );
    window.alert(
      response.ok
        ? "A new activation email was sent."
        : "The activation email could not be reissued.",
    );
  };

  const getNextStage = (current: string) => {
    const idx = STAGES.indexOf(current);
    return idx < STAGES.length - 1 ? STAGES[idx + 1] : null;
  };

  return (
    <>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {(showRejected ? ["REJECTED"] : STAGES).map((stage) => {
            const stageCandidates = candidates.filter((c) => {
              const candidateStage = String(c.stage || "APPLIED")
                .trim()
                .toUpperCase()
                .replace(/[\s-]+/g, "_");
              return (
                candidateStage === stage &&
                (showRejected || c.status !== "rejected")
              );
            });
            return (
              <div key={stage} className="w-[240px] flex-shrink-0">
                {/* Column Header */}
                <div
                  className={cn(
                    "rounded-t-xl px-3 py-2 flex items-center justify-between",
                    STAGE_HEADER_COLORS[stage],
                  )}
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-white">
                    {stage.replace("_", " ")}
                  </span>
                  <span className="bg-white/20 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Candidate Cards */}
                <div
                  className={cn(
                    "border-x border-b border-[var(--border-subtle)] rounded-b-xl p-2 space-y-2 min-h-[200px]",
                    STAGE_COLORS[stage],
                  )}
                >
                  {stageCandidates.length === 0 && (
                    <p className="text-[9px] text-[var(--text-muted)] text-center py-8 font-medium">
                      No candidates
                    </p>
                  )}
                  {stageCandidates.map((candidate: any) => (
                    <div
                      key={candidate.id}
                      className="bg-[var(--card)] rounded-lg border border-[var(--border-subtle)] p-3 shadow-sm hover:shadow-md transition-shadow space-y-2"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                            {candidate.full_name}
                          </p>
                          <span className="text-[8px] font-mono font-bold text-[var(--text-muted)] shrink-0">
                            {candidate.application_reference || "—"}
                          </span>
                        </div>
                        <p className="text-[9px] text-[var(--text-secondary)] truncate">
                          {candidate.email}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                            {candidate.score || 0}
                          </span>
                        </div>
                        {!showRejected &&
                        stage === "HIRED" &&
                        candidate.employee_id ? (
                          <button
                            type="button"
                            onClick={() => void resendForCandidate(candidate)}
                            className="text-[8px] font-bold uppercase text-amber-600 hover:underline"
                          >
                            Resend activation
                          </button>
                        ) : (
                          !showRejected &&
                          stage !== "OFFER" &&
                          getNextStage(stage) && (
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateStage(
                                  candidate.id,
                                  getNextStage(stage)!,
                                )
                              }
                              disabled={updatingCandidateId === candidate.id}
                              aria-busy={updatingCandidateId === candidate.id}
                              className="flex items-center gap-0.5 text-[8px] font-bold text-[#0075de] hover:underline transition-colors uppercase tracking-wider cursor-pointer disabled:cursor-wait disabled:opacity-50"
                            >
                              {updatingCandidateId === candidate.id
                                ? "Updating..."
                                : "Advance"}{" "}
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          )
                        )}
                        {!showRejected && stage !== "HIRED" && (
                          <button
                            type="button"
                            onClick={() => setRejecting(candidate)}
                            className="text-[8px] font-bold uppercase text-red-600 hover:underline"
                          >
                            Reject
                          </button>
                        )}
                        {!showRejected && stage === "OFFER" && (
                          <Link
                            href={`/admin/offers?applicationId=${encodeURIComponent(candidate.id)}&title=${encodeURIComponent(candidate.job_title || "")}`}
                            className="text-[8px] font-bold uppercase text-emerald-700 hover:underline"
                          >
                            Prepare Offer
                          </Link>
                        )}
                        {!showRejected &&
                          stage === "HIRED" &&
                          candidate.employee_id && (
                            <Link
                              href={`/admin/offers?applicationId=${encodeURIComponent(candidate.id)}&title=${encodeURIComponent(candidate.job_title || "")}&backfill=1`}
                              className="text-[8px] font-bold uppercase text-violet-700 hover:underline"
                            >
                              Create Missing Offer
                            </Link>
                          )}
                        {!showRejected && stage === "HIRED" && (
                          <button
                            type="button"
                            onClick={() => void openConversion(candidate)}
                            className="text-[8px] font-bold uppercase text-emerald-600 hover:underline"
                          >
                            Convert to Employee
                          </button>
                        )}
                        {showRejected && (
                          <button
                            type="button"
                            onClick={() => void reopen(candidate)}
                            className="text-[8px] font-bold uppercase text-[#0075de] hover:underline"
                          >
                            Reopen
                          </button>
                        )}
                      </div>

                      {stage === "INTERVIEW" && (
                        <div className="border-t border-[var(--border-subtle)] pt-2">
                          {candidate.interview ? (
                            <>
                              <p className="mb-2 flex items-center gap-1 text-[9px] text-[var(--text-secondary)]">
                                <Video className="h-3 w-3 text-[#0075de]" />{" "}
                                {candidate.interview.scheduled_at
                                  ? new Date(
                                      candidate.interview.scheduled_at,
                                    ).toLocaleString([], {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Interview scheduled"}{" "}
                                ·{" "}
                                {candidate.interview.meeting_provider ||
                                  "Meeting"}
                              </p>
                              <Link
                                href={`/admin/hrms/recruitment/interviews/${candidate.interview.id}`}
                                className="flex items-center justify-center rounded-md border border-[#0075de] px-2 py-1.5 text-[9px] font-bold text-[#0075de] hover:bg-blue-50"
                              >
                                Manage Interview
                              </Link>
                            </>
                          ) : (
                            <Link
                              href={`/admin/hrms/recruitment/interviews?applicationId=${encodeURIComponent(candidate.id)}`}
                              className="flex items-center justify-center rounded-md bg-[#0075de] px-2 py-1.5 text-[9px] font-bold text-white hover:bg-[#005bab]"
                            >
                              Schedule Interview
                            </Link>
                          )}
                        </div>
                      )}

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
                          <span className="text-[var(--text-muted)] opacity-60">
                            No Resume
                          </span>
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
                  {selectedCandidateModal.application_reference ||
                    "APPLICATION DETAIL"}
                </span>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">
                  {selectedCandidateModal.full_name}
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  {selectedCandidateModal.job_title}
                </p>
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
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Email Address
                </span>
                <span className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-[#0075de]" />{" "}
                  {selectedCandidateModal.email}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Phone Number
                </span>
                <span className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-emerald-600" />{" "}
                  {selectedCandidateModal.phone || "N/A"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Pipeline Stage
                </span>
                <span className="font-bold text-amber-500 uppercase">
                  {selectedCandidateModal.stage}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Submitted Date
                </span>
                <span className="font-medium text-[var(--text-secondary)]">
                  {selectedCandidateModal.submitted_at
                    ? new Date(
                        selectedCandidateModal.submitted_at,
                      ).toLocaleString()
                    : "—"}
                </span>
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
                <FileText className="h-4 w-4" /> View Submitted Resume{" "}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <div className="p-3 text-center text-xs text-[var(--text-muted)] bg-[var(--surface-1)] rounded-xl border border-[var(--border-subtle)]">
                No resume attached to this application
              </div>
            )}

            {/* Cover Letter */}
            {selectedCandidateModal.cover_letter && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Cover Letter / Statement
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] italic">
                  "{selectedCandidateModal.cover_letter}"
                </p>
              </div>
            )}

            {/* Application Answers */}
            {Array.isArray(selectedCandidateModal.answers) &&
              selectedCandidateModal.answers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    Application Responses
                  </h3>
                  <div className="space-y-2">
                    {selectedCandidateModal.answers.map(
                      (ans: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border-subtle)] space-y-1 text-xs"
                        >
                          <span className="font-bold text-[var(--text-primary)] block">
                            {ans.question_key || `Question ${idx + 1}`}
                          </span>
                          <span className="text-[var(--text-secondary)] block">
                            {String(ans.value || "No response")}
                          </span>
                        </div>
                      ),
                    )}
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
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  {emailTimelineCandidate.full_name}
                </h2>
                <p className="text-[10px] text-[var(--text-muted)]">
                  {emailTimelineCandidate.email}
                </p>
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
      {rejecting && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--card)] p-5 shadow-2xl">
            <h2 className="text-base font-bold">Reject candidate</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              This removes the application from the active pipeline.
            </p>
            <label className="mt-4 block text-[10px] font-bold uppercase">
              Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-2 text-xs"
            >
              <option value="">Select reason</option>
              {reasons.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <label className="mt-3 block text-[10px] font-bold uppercase">
              Optional internal note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-2 text-xs"
              rows={3}
            />
            <label className="mt-3 flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
              />{" "}
              Send rejection email
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setRejecting(null)}
                className="rounded-lg border px-4 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => void reject()}
                disabled={!reason || (reason === "Other" && !note.trim())}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                Reject Candidate
              </button>
            </div>
          </div>
        </div>
      )}
      {converting && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl bg-[var(--card)] p-5 shadow-2xl">
            <div className="flex justify-between">
              <div>
                <h2 className="text-base font-bold">
                  {conversionResult
                    ? "Employee conversion"
                    : "Convert to Employee"}
                </h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {converting.full_name} · Workspace remains pending until
                  activation.
                </p>
              </div>
              <button onClick={() => setConverting(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            {conversionResult ? (
              <div className="mt-5 space-y-3">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
                  <p className="font-bold">
                    {conversionResult.existing
                      ? "Employee already created"
                      : "Employee created"}
                  </p>
                  <p className="mt-1">
                    {converting.full_name} has been converted to an employee.
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-y-2">
                    <dt>Employee code</dt>
                    <dd className="font-semibold">{conversion.employeeCode}</dd>
                    <dt>Workspace</dt>
                    <dd className="font-semibold">
                      {conversionResult.workspaceStatus === "active"
                        ? "Active"
                        : "Pending activation"}
                    </dd>
                    <dt>Activation email</dt>
                    <dd className="font-semibold">
                      {conversionResult.activationEmail?.sent
                        ? "Sent"
                        : "Failed"}
                    </dd>
                  </dl>
                </div>
                {!conversionResult.activationEmail?.sent && (
                  <button
                    onClick={() => void resendActivation()}
                    disabled={resendBusy}
                    className="w-full rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {resendBusy ? "Sending…" : "Resend activation email"}
                  </button>
                )}
                {conversionError && (
                  <p className="text-xs text-red-600">{conversionError}</p>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={() => setConverting(null)}
                    className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                {conversionLoading ? <p className="mt-5 text-xs text-[var(--text-secondary)]">Resolving approved offer and employee data…</p> : <div className="mt-5 grid grid-cols-2 gap-3">
                  <label className="text-[10px] font-bold uppercase">Employee code<input readOnly value={conversion.employeeCode} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2 text-xs normal-case" /></label>
                  <label className="text-[10px] font-bold uppercase">Department<select value={conversion.departmentId} onChange={e=>setConversion({...conversion,departmentId:e.target.value})} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-2 text-xs normal-case"><option value="">Select department</option>{conversionOptions.departments.map((item:any)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                  <label className="text-[10px] font-bold uppercase">Designation<select value={conversion.designationId} onChange={e=>setConversion({...conversion,designationId:e.target.value})} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-2 text-xs normal-case"><option value="">Select designation</option>{conversionOptions.designations.map((item:any)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                  <label className="text-[10px] font-bold uppercase">Reporting manager<select value={conversion.managerEmployeeId} onChange={e=>setConversion({...conversion,managerEmployeeId:e.target.value})} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-2 text-xs normal-case"><option value="">No reporting manager</option>{conversionOptions.employees.map((item:any)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                  <label className="text-[10px] font-bold uppercase">Joining date<input type="date" value={conversion.joiningDate} onChange={e=>setConversion({...conversion,joiningDate:e.target.value})} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-2 text-xs normal-case" /></label>
                  <div className="text-[10px] font-bold uppercase">Workspace role<div className="mt-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2 text-xs normal-case">{conversionOptions.roleName}</div></div>
                  {conversionOptions.offerStatus && <p className="col-span-2 text-[10px] text-[var(--text-secondary)]">Offer source: {String(conversionOptions.offerStatus).toUpperCase()} · version {conversionOptions.offerVersion || "current"}</p>}
                </div>}
                {conversionError && (
                  <p className="mt-3 text-xs text-red-600">{conversionError}</p>
                )}
                {offerOverrideRequired && (
                  <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
                    <label className="text-[10px] font-bold uppercase text-amber-900">
                      Admin override reason
                      <textarea
                        value={offerOverrideReason}
                        onChange={(e) => setOfferOverrideReason(e.target.value)}
                        className="mt-1 min-h-20 w-full rounded border border-amber-300 bg-white p-2 text-xs normal-case"
                      />
                    </label>
                    <button
                      onClick={() => void convert(true)}
                      disabled={
                        conversionBusy || offerOverrideReason.trim().length < 3
                      }
                      className="mt-2 rounded bg-amber-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                    >
                      Convert Without Offer
                    </button>
                  </div>
                )}
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => void convert()}
                    disabled={
                      conversionBusy ||
                      !conversion.employeeCode ||
                      !conversion.departmentId ||
                      !conversion.designationId ||
                      !conversion.joiningDate
                    }
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {conversionBusy ? "Converting…" : "Convert to Employee"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
