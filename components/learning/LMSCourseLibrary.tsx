"use client";

import { useState } from "react";
import { BookOpen, Play, CheckCircle2, Award, Clock, FileText } from "lucide-react";

export function LMSCourseLibrary() {
  const [courses] = useState([
    { id: "c1", title: "Go Microservices & Event Architecture", type: "department", category: "Engineering", duration: "4h 30m", lessons: 12, completed: 8, isMandatory: true },
    { id: "c2", title: "Enterprise Security & SAIF Compliance 2026", type: "organisation_wide", category: "Compliance", duration: "1h 15m", lessons: 4, completed: 4, isMandatory: true },
    { id: "c3", title: "Strategic Leadership & Mentorship Skills", type: "optional", category: "Management", duration: "3h 00m", lessons: 8, completed: 2, isMandatory: false },
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          LMS Course Library & Mandatory Compliance
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Explore interactive modules, video lessons, documents, and mandatory compliance certifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c) => (
          <div key={c.id} className="p-5 rounded-xl border border-border bg-card hover:border-emerald-500/50 transition-colors space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400">
                  {c.category}
                </span>
                {c.isMandatory && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Mandatory
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-foreground">{c.title}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-3">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {c.duration}</span>
                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {c.lessons} lessons</span>
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-bold text-foreground">{Math.round((c.completed / c.lessons) * 100)}%</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${(c.completed / c.lessons) * 100}%` }} />
                </div>
              </div>

              <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                <Play className="w-3.5 h-3.5" /> Continue Learning
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
