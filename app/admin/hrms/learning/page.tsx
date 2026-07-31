"use client";

import { useState } from "react";
import { LMSCourseLibrary } from "@/components/learning/LMSCourseLibrary";
import { InternalMobilityPortal } from "@/components/learning/InternalMobilityPortal";
import { AILearningAssistant } from "@/components/learning/AILearningAssistant";

export default function HRMSLearningAdminPage() {
  const [activeTab, setActiveTab] = useState<"courses" | "mobility" | "ai">("courses");

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold">[ HRMS RELEASE 07 ]</span>
          <h1 className="text-3xl font-black tracking-tight text-foreground mt-1">Learning, Development & Internal Mobility</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enterprise LMS, compliance certifications, skill matrices, mentorship, and internal talent marketplace.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800">
          {[
            { id: "courses", label: "LMS Courses" },
            { id: "mobility", label: "Internal Mobility" },
            { id: "ai", label: "AI Recommendations" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "courses" && <LMSCourseLibrary />}
      {activeTab === "mobility" && <InternalMobilityPortal />}
      {activeTab === "ai" && <AILearningAssistant />}
    </main>
  );
}
