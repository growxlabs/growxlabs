"use client";

import React from "react";
import { usePathname } from "@/navigation-client";
import { isEmployeeWorkspaceRoute } from "@/lib/routes/application-shell";

/**
 * GlobalBackground Component
 * 
 * Style: Warm Cream for marketing, Dark for admin/dashboard
 */
export function GlobalBackground() {
  const pathname = usePathname();
  
  const isDashboard = pathname?.includes("/admin") || pathname?.includes("/client") || pathname?.includes("/demos");
  const isBlog = pathname?.includes("/blog");

  if (isEmployeeWorkspaceRoute(pathname)) return null;

  if (isDashboard) {
    return <div className="fixed inset-0 -z-50 bg-[#050810] pointer-events-none" />;
  }

  if (isBlog) {
    return (
      <div className="fixed inset-0 -z-50 pointer-events-none bg-background overflow-hidden">
        <div 
          className="absolute inset-0 opacity-60" 
          style={{
            backgroundImage: `
              radial-gradient(ellipse 70% 42% at 50% -10%, rgba(53, 92, 255, 0.05) 0%, transparent 60%),
              linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(253, 250, 247, 0) 38%)
            `,
          }}
        />
      </div>
    );
  }

  // Dark Marketing pages background
  return (
    <div className="fixed inset-0 -z-50 pointer-events-none bg-black overflow-hidden" />
  );
}
