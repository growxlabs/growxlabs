"use client";

import React from "react";

interface PropertySummaryProps {
  text: string;
}

export const PropertySummary: React.FC<PropertySummaryProps> = ({ text }) => {
  return (
    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-[120px] font-medium">
      {text}
    </div>
  );
};
