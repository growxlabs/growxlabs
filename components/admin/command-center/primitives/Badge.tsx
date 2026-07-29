import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "blue" | "emerald" | "amber";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variantStyles = {
    default: "bg-neutral-100 text-neutral-700 border-neutral-200",
    outline: "border-neutral-300 text-neutral-600 bg-transparent",
    blue: "bg-[#0075de]/10 text-[#0075de] border-[#0075de]/20",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200"
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border font-mono tracking-tight",
      variantStyles[variant],
      className
    )}>
      {children}
    </span>
  );
}
