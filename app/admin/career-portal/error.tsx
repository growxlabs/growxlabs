"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function CareerPortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Career Portal error:", error);
  }, [error]);

  return (
    <div className="h-[70vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
      <div className="p-4 bg-red-500/10 rounded-full text-red-500">
        <AlertCircle size={32} />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Career Portal Temporary Error</h2>
        <p className="text-xs text-[var(--text-secondary)] max-w-md">
          Unable to render application details. Click below to refresh the candidate workspace.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 h-9 px-5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer"
      >
        <RefreshCw size={14} /> Retry Loading
      </button>
    </div>
  );
}
