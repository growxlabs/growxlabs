"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "@/components/icons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="w-full min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center">
        {/* Subtle // error label in Fira Code */}
        <p className="font-mono text-xs text-neutral-400 dark:text-neutral-500 mb-1 select-none tracking-widest lowercase">
          // error
        </p>

        {/* Large Muted 500 Display in Inter */}
        <div className="text-8xl sm:text-9xl md:text-[140px] font-black tracking-tight leading-none select-none text-neutral-200 dark:text-neutral-800">
          500
        </div>

        {/* Clean Sans-Serif Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white -mt-3 sm:-mt-5 mb-3">
          Unable to Load Page
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-md mx-auto mb-8">
          We encountered an unexpected issue while loading this page. Please try refreshing or return to home.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-sm">
          <button
            onClick={() => reset()}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 text-sm font-medium transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white text-sm font-medium transition-all shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Optional Technical Reference Code */}
        {error.digest && (
          <p className="mt-8 font-mono text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-widest select-all">
            Ref: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
