import React from "react";
import { cn } from "@/lib/utils";

export interface WorkspaceProps {
  children: React.ReactNode;
  className?: string;
}

export function Workspace({ children, className }: WorkspaceProps) {
  return (
    <div className={cn("flex-1 flex min-h-0 relative overflow-hidden bg-white", className)}>
      {children}
    </div>
  );
}
