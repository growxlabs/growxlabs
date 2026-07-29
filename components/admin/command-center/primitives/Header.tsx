import React from "react";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  className?: string;
}

export function Header({
  title = "GXL Command Center",
  subtitle = "AI-Native Operating System",
  leftActions,
  rightActions,
  className
}: HeaderProps) {
  return (
    <header className={cn("h-14 border-b border-[#e6e6e6] bg-white px-4 flex items-center justify-between shrink-0 select-none z-10", className)}>
      <div className="flex items-center gap-3">
        {leftActions}
        <div>
          <h1 className="font-bold text-sm text-neutral-900 tracking-tight leading-none">{title}</h1>
          <p className="text-[11px] text-neutral-500 font-mono mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {rightActions}
      </div>
    </header>
  );
}
