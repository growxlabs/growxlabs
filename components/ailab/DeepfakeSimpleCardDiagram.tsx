"use client";

import React from "react";

export function DeepfakeSimpleCardDiagram({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-full h-full bg-[#FFFFFF] text-neutral-900 select-none flex flex-col justify-between p-3 sm:p-4 md:p-5 relative overflow-hidden font-sans ${className}`}
    >
      {/* Background Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#94A3B8 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />

      {/* ── Top Header Bar ── */}
      <div className="relative z-10 flex items-center justify-between pb-2 sm:pb-2.5 border-b border-neutral-200">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] sm:text-xs font-bold tracking-wider text-neutral-900 uppercase">
            GrowX Deepfake™
          </span>
          <span className="text-neutral-400 text-[10px] hidden sm:inline">/</span>
          <span className="text-neutral-500 text-[10px] sm:text-[11px] font-medium hidden sm:inline">
            Architecture
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <span>● REAL-TIME SHIELD</span>
        </div>
      </div>

      {/* ── Main 3-Step Flow Architecture (Always 3 Columns) ── */}
      <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-2.5 my-auto items-stretch">
        {/* Step 1: Input */}
        <div className="bg-neutral-50/95 rounded-lg p-2.5 sm:p-3 border border-neutral-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="font-mono text-[8px] sm:text-[9px] font-bold text-neutral-500 tracking-wider uppercase">
                01 / INPUT
              </span>
              <span className="text-[8px] sm:text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                STREAM
              </span>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-1.5 sm:mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-neutral-900 tracking-tight leading-snug mb-0.5 sm:mb-1">
              Live Video Call
            </h4>
            <p className="text-[10px] sm:text-[11px] text-neutral-600 leading-snug line-clamp-3">
              Captures camera feed during video calls, interviews, and identity verification.
            </p>
          </div>
        </div>

        {/* Step 2: AI Core */}
        <div className="bg-neutral-50/95 rounded-lg p-2.5 sm:p-3 border border-neutral-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="font-mono text-[8px] sm:text-[9px] font-bold text-neutral-500 tracking-wider uppercase">
                02 / SCAN
              </span>
              <span className="text-[8px] sm:text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                GROWX AI
              </span>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-1.5 sm:mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-neutral-900 tracking-tight leading-snug mb-0.5 sm:mb-1">
              Deepfake Detection
            </h4>
            <p className="text-[10px] sm:text-[11px] text-neutral-600 leading-snug line-clamp-3">
              Scans facial movements, skin lighting, and voice sync to catch synthetic avatars.
            </p>
          </div>
        </div>

        {/* Step 3: Verified Output */}
        <div className="bg-emerald-50/90 rounded-lg p-2.5 sm:p-3 border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="font-mono text-[8px] sm:text-[9px] font-bold text-emerald-800 tracking-wider uppercase">
                03 / RESULT
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                VERIFIED
              </span>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-1.5 sm:mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-emerald-950 tracking-tight leading-snug mb-0.5 sm:mb-1">
              Authentic Human
            </h4>
            <p className="text-[10px] sm:text-[11px] text-emerald-800/90 leading-snug line-clamp-3">
              Confirms genuine human identity and triggers instant alerts on face swaps.
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom Summary Footer ── */}
      <div className="relative z-10 flex items-center justify-between pt-2 border-t border-neutral-200 text-neutral-500 font-mono text-[9px] sm:text-[10px]">
        <span className="text-neutral-700 font-semibold truncate">
          An antivirus for video calls & digital identity
        </span>
        <span className="text-emerald-700 font-bold shrink-0">
          96.89% Accuracy
        </span>
      </div>
    </div>
  );
}
