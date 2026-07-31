"use client";

import { HelpdeskPortalConsole } from "@/components/workforce/HelpdeskPortalConsole";
import { TravelManagementConsole } from "@/components/workforce/TravelManagementConsole";

export default function EmployeeWorkforcePage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="border-b border-border pb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-blue-500 font-bold">[ ESS WORKFORCE & HELPDESK ]</span>
        <h1 className="text-3xl font-black tracking-tight text-foreground mt-1">My Helpdesk Requests, Travel & Policies</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Submit IT/HR support tickets, request business travel approvals, and access company policies.
        </p>
      </div>

      <HelpdeskPortalConsole />
      <TravelManagementConsole />
    </main>
  );
}
