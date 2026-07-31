"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { UploadCloud, CheckCircle2, X, Sparkles, UserCheck } from "lucide-react";

interface TalentNetworkModalProps {
  isOpen: boolean;
  candidate: any;
  onClose: () => void;
}

export function TalentNetworkModal({ isOpen, candidate, onClose }: TalentNetworkModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const talentMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Resume required.");
      const response = await fetch("/api/v1/hrms/recruitment/public/candidates/me/talent-network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidate?.id,
          fullName: candidate?.fullName,
          email: candidate?.email,
          resumeName: file.name,
          sizeBytes: file.size,
        }),
      });
      if (!response.ok) throw new Error("Talent network registration failed.");
      return response.json();
    },
    onSuccess: () => setSubmitted(true),
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0075de]">
            <Sparkles size={14} /> GrowXLabs Talent Network
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="mt-4 text-xl font-black text-slate-900">Joined Talent Network!</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Your resume has been parsed and added to our executive candidate database. Our talent team will match your profile with upcoming openings.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <h3 className="mt-3 text-2xl font-black text-slate-900">Join Our Proactive Talent Network</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Don&apos;t see an exact role today? Upload your resume so our recruiters can discover your profile for future AI, engineering, and product opportunities.
            </p>

            <div className="mt-5 rounded-2xl bg-blue-50/50 border border-blue-100 p-3.5 flex items-center gap-3 text-xs text-slate-700">
              <UserCheck className="text-[#0075de] shrink-0" size={18} />
              <div>
                <strong>Signed in as:</strong> {candidate?.fullName || candidate?.email}
              </div>
            </div>

            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#0075de]/40 bg-blue-50/40 p-6 text-center transition hover:bg-blue-50">
              <UploadCloud size={30} className="text-[#0075de]" />
              <span className="mt-2 text-xs font-bold text-slate-900">
                {file ? file.name : "Attach Resume (PDF or DOCX)"}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <button
              onClick={() => talentMutation.mutate()}
              disabled={!file || talentMutation.isPending}
              className="mt-6 h-11 w-full rounded-xl bg-[#0075de] text-xs font-bold text-white transition hover:bg-[#0062bd] disabled:opacity-50"
            >
              {talentMutation.isPending ? "Adding to Talent Network..." : "Submit Resume to Talent Network"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
