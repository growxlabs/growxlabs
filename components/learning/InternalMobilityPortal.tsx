"use client";

import { useState } from "react";
import { Briefcase, ArrowUpRight, CheckCircle2, Clock, Building2 } from "lucide-react";

export function InternalMobilityPortal() {
  const [jobs] = useState([
    { id: "j1", title: "Staff Platform Engineer", department: "Core Engineering", location: "Remote / Hybrid", status: "open", applicants: 4 },
    { id: "j2", title: "Senior Product Manager - AI Capabilities", department: "Product", location: "Bangalore HQ", status: "open", applicants: 2 },
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-500" />
          Internal Mobility & Talent Marketplace
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Internal job postings, career progression tracks, promotion requests, and department transfer approvals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((j) => (
          <div key={j.id} className="p-5 rounded-xl border border-border bg-card hover:border-blue-500/50 transition-colors space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400">
                  {j.department}
                </span>
                <h3 className="text-base font-bold text-foreground mt-2">{j.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> {j.location}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400">
                {j.status}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
              <span className="text-xs text-muted-foreground">{j.applicants} internal applicants</span>
              <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                Apply Internally <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
