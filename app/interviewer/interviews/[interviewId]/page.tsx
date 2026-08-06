"use client";

import React, { useState, useEffect, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Calendar,
  Clock,
  Video,
  FileText,
  ExternalLink,
  ShieldAlert,
  Send,
  Save,
  Star,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  User,
} from "lucide-react";
import Link from "next/link";
import ZoomEmbeddedMeeting from "@/components/interviewer/ZoomEmbeddedMeeting";

async function fetchInterviewWorkspace(interviewId: string) {
  const res = await fetch(`/api/interviewer/interviews/${interviewId}`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) {
    const err: any = new Error(data.error || "Access denied");
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return data;
}

export default function InterviewerWorkspacePage({ params }: { params: Promise<{ interviewId: string }> }) {
  const { interviewId } = use(params);
  const queryClient = useQueryClient();
  const recordZoomEvent = (event: string) => { void fetch(`/api/interviewer/interviews/${interviewId}/zoom-events`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ event }) }); };

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [scratchpad, setScratchpad] = useState("");
  const [recommendation, setRecommendation] = useState<string>("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const query = useQuery({
    queryKey: ["interviewer", "interview", interviewId],
    queryFn: () => fetchInterviewWorkspace(interviewId),
    enabled: Boolean(interviewId),
    refetchInterval: 30000, // Revalidate background access every 30s
  });

  useEffect(() => {
    if (query.data?.feedback) {
      setRatings(query.data.feedback.ratings || {});
      setNotes(query.data.feedback.notes || "");
      setScratchpad(query.data.feedback.scratchpad_notes || "");
      setRecommendation(query.data.feedback.recommendation || "");
    }
  }, [query.data]);

  const feedbackMutation = useMutation({
    mutationFn: async (payload: { isFinal: boolean }) => {
      const res = await fetch(`/api/interviewer/interviews/${interviewId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ratings,
          notes,
          scratchpadNotes: scratchpad,
          recommendation,
          isFinal: payload.isFinal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save feedback");
      return data;
    },
    onSuccess: (data) => {
      setSaveSuccessMsg(data.message || "Feedback saved");
      queryClient.invalidateQueries({ queryKey: ["interviewer", "interview", interviewId] });
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    },
  });

  // Handle Access Denied / Expired / Revoked
  if (query.isError) {
    const err: any = query.error;
    return (
      <div className="h-[75vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
        <div className="p-4 bg-red-100 rounded-full text-red-600">
          <ShieldAlert size={36} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">
            {err.code === "INTERVIEW_ACCESS_EXPIRED"
              ? "Interview Access Expired"
              : err.code === "INTERVIEW_ACCESS_REVOKED"
              ? "Access Revoked"
              : err.code === "INTERVIEW_ACCESS_NOT_STARTED"
              ? "Access Not Started"
              : "Access Denied"}
          </h2>
          <p className="text-xs text-slate-600 max-w-md">{err.message}</p>
        </div>

        <Link
          href="/interviewer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0075de] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#005bab] transition-all"
        >
          <ArrowLeft size={14} /> Return to Interviewer Dashboard
        </Link>
      </div>
    );
  }

  if (query.isPending) {
    return (
      <div className="h-[75vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 size={32} className="animate-spin text-[#0075de]" />
        <p className="text-xs font-medium text-slate-500">Loading candidate workspace & context...</p>
      </div>
    );
  }

  const { interview, candidate, job, scorecard, feedback, visibilityScope, assignment } = query.data;
  const profile = candidate?.profile || {};
  const isLocked = feedback?.is_locked;

  const criteriaList = scorecard?.criteria || [];

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/interviewer" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft size={16} />
            </Link>
            <span className="text-[10px] font-mono font-bold text-[#0075de] uppercase tracking-wider">
              {candidate?.application_reference || "INTERVIEW WORKSPACE"}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">{profile.full_name}</h1>
          <p className="text-xs text-slate-500 font-medium">{job?.title}</p>
        </div>

        {/* Access Expiry Badge */}
        {assignment?.access_expires_at && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <Clock size={14} className="shrink-0" />
            <span>Access Expires: {new Date(assignment.access_expires_at).toLocaleString()}</span>
          </div>
        )}
      </div>

      {saveSuccessMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Candidate Context (7 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Candidate Card & Resume */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User size={14} className="text-[#0075de]" /> Candidate Context
            </h2>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-400 block">Full Name</span>
                <span className="font-bold text-slate-900 block mt-0.5">{profile.full_name}</span>
              </div>

              {visibilityScope.contact_details && profile.phone && (
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">Phone</span>
                  <span className="font-semibold text-slate-700 block mt-0.5">{profile.phone}</span>
                </div>
              )}

              {visibilityScope.employment_history && profile.experience && (
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">Experience</span>
                  <span className="font-semibold text-slate-700 block mt-0.5">{profile.experience}</span>
                </div>
              )}

              <div>
                <span className="text-[9px] font-bold uppercase text-slate-400 block">Submitted</span>
                <span className="font-semibold text-slate-700 block mt-0.5">
                  {candidate?.submitted_at ? new Date(candidate.submitted_at).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>

            {/* Resume Button */}
            {visibilityScope.resume && candidate?.resume_url ? (
              <a
                href={candidate.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#0075de] hover:bg-[#005bab] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <FileText size={16} /> Preview / Download Approved Resume <ExternalLink size={14} />
              </a>
            ) : (
              <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                Resume view not permitted or not attached
              </div>
            )}

            {/* Portfolio Link */}
            {visibilityScope.portfolio && candidate?.portfolio_url && (
              <a
                href={candidate.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-all"
              >
                View Candidate Portfolio ↗
              </a>
            )}
          </div>

          {/* Cover Letter / Statement */}
          {visibilityScope.application_answers && candidate?.cover_letter && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Candidate Statement</h3>
              <p className="text-xs text-slate-600 italic bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                "{candidate.cover_letter}"
              </p>
            </div>
          )}

          {/* Screening Answers */}
          {visibilityScope.application_answers && Array.isArray(candidate?.answers) && candidate.answers.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Screening Answers</h3>
              <div className="space-y-3">
                {candidate.answers.map((ans: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                    <span className="font-bold text-slate-900 block">{ans.question_key || `Question ${idx + 1}`}</span>
                    <span className="text-slate-600 block">{String(ans.value || "No answer")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Job Description */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Job Description</h3>
            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{job?.description || "No description provided."}</p>
          </div>
        </div>

        {/* Right Column: Meeting & Scorecard Evaluation (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Meeting Banner */}
          <div className="bg-gradient-to-br from-[#0f172a] to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                {interview?.meeting_provider || "Google Meet"}
              </span>
              <span className="text-xs text-slate-300">
                {interview?.scheduled_at ? new Date(interview.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Live Video Interview</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {interview?.instructions || "Conduct the evaluation call and rate the candidate criteria below."}
              </p>
            </div>

            {interview?.meeting_provider === "zoom" ? <ZoomEmbeddedMeeting interviewId={interviewId} externalJoinUrl={interview?.meeting_join_url} enabled={interview?.meeting_sdk_enabled === true && interview?.is_join_enabled === true} onEvent={recordZoomEvent} /> : interview?.meeting_join_url && interview?.is_join_enabled ? (
              <a
                href={interview.meeting_join_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                <Video size={16} /> Join Google Meet <ExternalLink size={14} />
              </a>
            ) : (
              <div className="p-3 text-center text-xs text-amber-300 bg-amber-900/30 rounded-xl border border-amber-800/50 font-medium">
                Meeting link active 15 minutes before scheduled start time
              </div>
            )}
          </div>

          {/* Scorecard Criteria Rating */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Candidate Evaluation Scorecard</h3>
                <p className="text-xs text-slate-500">Rate each criterion on a scale of 1 to 5 stars.</p>
              </div>
              {isLocked && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Lock size={12} /> Locked
                </span>
              )}
            </div>

            {/* Criteria Ratings */}
            <div className="space-y-4">
              {criteriaList.map((crit: any) => {
                const currentRating = ratings[crit.key] || 0;
                return (
                  <div key={crit.key} className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{crit.label}</span>
                      <span className="font-mono text-slate-500 font-bold">{currentRating}/5</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          disabled={isLocked}
                          onClick={() => setRatings({ ...ratings, [crit.key]: star })}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            star <= currentRating ? "text-amber-400" : "text-slate-300 hover:text-amber-300"
                          }`}
                        >
                          <Star size={20} className={star <= currentRating ? "fill-amber-400" : ""} />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Notes & Scratchpad */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Interviewer Summary & Evaluation Notes
              </label>
              <textarea
                rows={4}
                disabled={isLocked}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write specific feedback, key strengths, weaknesses, and rationale..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0075de]"
              />
            </div>

            {/* Recommendation Select */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Final Hiring Recommendation *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { value: "strong_hire", label: "Strong Hire", color: "border-emerald-500 text-emerald-700 bg-emerald-50" },
                  { value: "hire", label: "Hire", color: "border-green-500 text-green-700 bg-green-50" },
                  { value: "mixed", label: "Mixed / Borderline", color: "border-amber-500 text-amber-700 bg-amber-50" },
                  { value: "no_hire", label: "No Hire", color: "border-orange-500 text-orange-700 bg-orange-50" },
                  { value: "strong_no_hire", label: "Strong No Hire", color: "border-red-500 text-red-700 bg-red-50" },
                ].map((rec) => (
                  <button
                    key={rec.value}
                    type="button"
                    disabled={isLocked}
                    onClick={() => setRecommendation(rec.value)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                      recommendation === rec.value ? `${rec.color} ring-2 ring-offset-1 ring-[#0075de]` : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {rec.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            {!isLocked && (
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={feedbackMutation.isPending}
                  onClick={() => feedbackMutation.mutate({ isFinal: false })}
                  className="flex items-center justify-center gap-1.5 flex-1 py-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} /> Save Draft
                </button>

                <button
                  type="button"
                  disabled={feedbackMutation.isPending || !recommendation}
                  onClick={() => feedbackMutation.mutate({ isFinal: true })}
                  className="flex items-center justify-center gap-1.5 flex-1 py-3 rounded-xl bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {feedbackMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  Submit Final Feedback
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
