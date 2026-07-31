"use client";

import { LMSCourseLibrary } from "@/components/learning/LMSCourseLibrary";
import { AILearningAssistant } from "@/components/learning/AILearningAssistant";

export default function EmployeeLearningPage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="border-b border-border pb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold">[ ESS LEARNING ]</span>
        <h1 className="text-3xl font-black tracking-tight text-foreground mt-1">My Learning, Certifications & Growth</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Access assigned courses, complete certifications, and explore personalized learning paths.
        </p>
      </div>

      <LMSCourseLibrary />
      <AILearningAssistant />
    </main>
  );
}
