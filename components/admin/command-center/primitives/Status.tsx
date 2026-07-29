import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Check, AlertTriangle } from "lucide-react";

export interface StatusProps {
  status: "idle" | "running" | "completed" | "error";
  label?: string;
  className?: string;
}

export function Status({ status, label, className }: StatusProps) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 text-xs font-mono", className)}>
      {status === "running" && (
        <Loader2 className="w-3.5 h-3.5 text-[#0075de] animate-spin" />
      )}
      {status === "completed" && (
        <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
      )}
      {status === "error" && (
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
      )}
      {label && <span className="text-neutral-600 font-medium">{label}</span>}
    </div>
  );
}
