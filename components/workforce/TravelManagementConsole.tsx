"use client";

import { useState } from "react";
import { Plane, Calendar, Building2, CheckCircle2, Clock } from "lucide-react";

export function TravelManagementConsole() {
  const [travels] = useState([
    { id: "tr1", employee: "Rahul Sharma", destination: "London, UK (Tech Summit)", departure: "Feb 12, 2026", returnDate: "Feb 18, 2026", budget: "₹1,85,000", status: "approved" },
    { id: "tr2", employee: "Ananya Iyer", destination: "Mumbai Office Audit", departure: "Feb 20, 2026", returnDate: "Feb 22, 2026", budget: "₹25,000", status: "manager_approved" },
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Plane className="w-5 h-5 text-indigo-500" />
          Business Travel Requests & Itineraries
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          3-stage business travel approvals (Employee → Manager → Finance → Approved) with flight & hotel itinerary integration.
        </p>
      </div>

      <div className="space-y-4">
        {travels.map((tr) => (
          <div key={tr.id} className="p-5 rounded-xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400">
                  Business Travel
                </span>
                <h3 className="text-sm font-bold text-foreground">{tr.destination}</h3>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Traveler: <span className="font-semibold text-foreground">{tr.employee}</span> ({tr.departure} - {tr.returnDate})
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Estimated Budget</span>
                <div className="text-base font-black text-foreground">{tr.budget}</div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold capitalize bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {tr.status.replace("_", " ")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
