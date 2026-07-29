import React from "react";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn("w-full h-full bg-[#fcfcfc] text-neutral-900 overflow-hidden flex flex-col font-sans", className)}>
      {children}
    </div>
  );
}
