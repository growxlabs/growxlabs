"use client";

import React from "react";
import { usePathname } from "@/navigation-client";
import { isEmployeeWorkspaceRoute } from "@/lib/routes/application-shell";

/**
 * GlobalBackground Component
 * 
 * Outer canvas: #F5F4F0 (Warm Neutral) for public marketing routes.
 * Dark background for authenticated /admin and /client dashboards.
 */
export function GlobalBackground() {
  const pathname = usePathname();
  
  const isDashboard = pathname?.includes("/admin") || pathname?.includes("/client") || pathname?.includes("/demos");

  if (isEmployeeWorkspaceRoute(pathname)) return null;

  if (isDashboard) {
    return <div className="fixed inset-0 -z-50 bg-[#050810] pointer-events-none" />;
  }

  // Warm Neutral #F5F4F0 outer canvas for public marketing pages
  return (
    <div className="fixed inset-0 -z-50 pointer-events-none bg-[#F5F4F0] overflow-hidden" />
  );
}
