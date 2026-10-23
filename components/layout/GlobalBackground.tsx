"use client";

import React from "react";
import { usePathname } from "@/navigation-client";
import { isEmployeeWorkspaceRoute } from "@/lib/routes/application-shell";

/**
 * GlobalBackground Component
 * 
 * Primary background: #A2BECC (Air Force Blue) for all public marketing routes.
 * Dark background for authenticated /admin and /client dashboards.
 */
export function GlobalBackground() {
  const pathname = usePathname();
  
  const isDashboard = pathname?.includes("/admin") || pathname?.includes("/client") || pathname?.includes("/demos");

  if (isEmployeeWorkspaceRoute(pathname)) return null;

  if (isDashboard) {
    return <div className="fixed inset-0 -z-50 bg-[#050810] pointer-events-none" />;
  }

  // Air Force Blue primary canvas for all public marketing pages
  return (
    <div className="fixed inset-0 -z-50 pointer-events-none bg-[#A2BECC] overflow-hidden" />
  );
}
