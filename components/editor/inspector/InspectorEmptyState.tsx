"use client";

import React from "react";
import { Layers } from "@/components/editor/icons/StudioIcons";

export function InspectorEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-12 select-none">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center
          bg-neutral-100 dark:bg-[rgba(255,255,255,0.05)]"
      >
        <Layers size={20} className="text-neutral-400 dark:text-neutral-500" />
      </div>
      <div className="text-center">
        <p className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
          No slides yet
        </p>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
          Add a slide to start editing
        </p>
      </div>
    </div>
  );
}
