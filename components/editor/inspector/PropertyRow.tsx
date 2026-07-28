"use client";

import React from "react";

interface PropertyRowProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export const PropertyRow = React.forwardRef<HTMLDivElement, PropertyRowProps>(
  ({ label, children, className = "" }, ref) => {
    return (
      <div
        ref={ref}
        className={`grid grid-cols-[84px_minmax(0,1fr)] items-center gap-[10px] min-h-[36px] ${className}`}
      >
        <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 truncate">
          {label}
        </span>
        <div className="flex-1 w-full min-w-0 flex items-center">
          {children}
        </div>
      </div>
    );
  }
);

PropertyRow.displayName = "PropertyRow";
