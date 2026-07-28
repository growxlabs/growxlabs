"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

interface InspectorBreadcrumbProps {
  layerName: string;
  onNavigateBack: () => void;
}

export function InspectorBreadcrumb({ layerName, onNavigateBack }: InspectorBreadcrumbProps) {
  return (
    <nav
      className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-medium
        border-b border-neutral-100 dark:border-[var(--inspector-border)]
        bg-neutral-50/50 dark:bg-[rgba(255,255,255,0.015)]"
      aria-label="Inspector breadcrumb"
    >
      <button
        onClick={onNavigateBack}
        className="text-neutral-400 dark:text-neutral-500 hover:text-[var(--inspector-brand)]
          transition-colors cursor-pointer bg-transparent border-none p-0"
      >
        Layers
      </button>
      <ChevronRight size={10} className="text-neutral-300 dark:text-neutral-600" />
      <span className="text-neutral-700 dark:text-neutral-300 truncate">{layerName}</span>
    </nav>
  );
}
