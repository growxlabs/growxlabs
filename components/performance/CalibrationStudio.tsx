"use client";

import { useState } from "react";
import { Grid, Sparkles, Sliders } from "lucide-react";

export function CalibrationStudio() {
  const [activeTab, setActiveTab] = useState<"nine_box" | "forced" | "bell_curve">("nine_box");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Grid className="w-5 h-5 text-purple-500" />
            Calibration Studio (9-Box Grid & Rating Distribution)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Calibrate rating distribution across teams with 9-Box matrix (Performance vs. Potential) and Bell Curve alignment.
          </p>
        </div>

        <div className="flex gap-2 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setActiveTab("nine_box")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "nine_box" ? "bg-purple-600 text-white" : "text-neutral-400 hover:text-white"
            }`}
          >
            9-Box Grid
          </button>
          <button
            onClick={() => setActiveTab("bell_curve")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "bell_curve" ? "bg-purple-600 text-white" : "text-neutral-400 hover:text-white"
            }`}
          >
            Bell Curve Distribution
          </button>
        </div>
      </div>

      {activeTab === "nine_box" && (
        <div className="grid grid-cols-3 gap-3 p-4 rounded-xl border border-border bg-card">
          {[
            { box: "High Potential / Low Perf", count: 2, label: "Enigma" },
            { box: "High Potential / Medium Perf", count: 5, label: "Growth Star" },
            { box: "High Potential / High Perf", count: 8, label: "Star Performer" },
            { box: "Med Potential / Low Perf", count: 1, label: "Dilemma" },
            { box: "Med Potential / Medium Perf", count: 14, label: "Core Player" },
            { box: "Med Potential / High Perf", count: 7, label: "High Professional" },
            { box: "Low Potential / Low Perf", count: 0, label: "Underperformer" },
            { box: "Low Potential / Medium Perf", count: 3, label: "Effective Specialist" },
            { box: "Low Potential / High Perf", count: 4, label: "Solid Performer" },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-neutral-800 bg-neutral-950/60 hover:border-purple-500/50 transition-colors space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">{item.label}</span>
              <div className="text-2xl font-black text-foreground">{item.count} <span className="text-xs text-muted-foreground font-normal">employees</span></div>
              <p className="text-[11px] text-muted-foreground">{item.box}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "bell_curve" && (
        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <h3 className="text-sm font-bold text-foreground">Rating Distribution Comparison (Target vs Actual)</h3>
          <div className="space-y-3">
            {[
              { level: "Level 5 (Outstanding)", target: "10%", actual: "12%", status: "Slight Over" },
              { level: "Level 4 (Exceeds)", target: "20%", actual: "22%", status: "Aligned" },
              { level: "Level 3 (Meets)", target: "55%", actual: "53%", status: "Aligned" },
              { level: "Level 2 (Needs Imp.)", target: "10%", actual: "9%", status: "Aligned" },
              { level: "Level 1 (Unsatisfactory)", target: "5%", actual: "4%", status: "Aligned" },
            ].map((row, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs p-3 rounded-lg border border-neutral-800 bg-neutral-950">
                <span className="font-bold text-foreground">{row.level}</span>
                <div className="flex items-center gap-6">
                  <span className="text-muted-foreground">Target: <strong className="text-foreground">{row.target}</strong></span>
                  <span className="text-muted-foreground">Actual: <strong className="text-purple-400">{row.actual}</strong></span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
