"use client";

import { useState } from "react";
import { GoalManagementConsole } from "@/components/performance/GoalManagementConsole";
import { ReviewCycleConsole } from "@/components/performance/ReviewCycleConsole";
import { CalibrationStudio } from "@/components/performance/CalibrationStudio";
import { AIPerformanceAssistant } from "@/components/performance/AIPerformanceAssistant";

export default function HRMSPerformanceAdminPage() {
  const [activeTab, setActiveTab] = useState<"goals" | "reviews" | "calibration" | "ai">("goals");

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-blue-500 font-bold">[ HRMS RELEASE 06 ]</span>
          <h1 className="text-3xl font-black tracking-tight text-foreground mt-1">Performance Management & Talent Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enterprise OKRs/KPIs, 360° reviews, 9-box calibration, competency framework, and AI talent recommendations.
          </p>
        </div>

        {/* Console Navigation */}
        <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800">
          {[
            { id: "goals", label: "Goals & OKRs" },
            { id: "reviews", label: "Review Cycles" },
            { id: "calibration", label: "Calibration Studio" },
            { id: "ai", label: "AI Assistant" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "goals" && <GoalManagementConsole />}
      {activeTab === "reviews" && <ReviewCycleConsole />}
      {activeTab === "calibration" && <CalibrationStudio />}
      {activeTab === "ai" && <AIPerformanceAssistant />}
    </main>
  );
}
