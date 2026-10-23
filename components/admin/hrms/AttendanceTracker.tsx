"use client";

import React, { useState, useEffect } from "react";
import { Clock, LogIn, LogOut } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface AttendanceTrackerProps {
  attendance: any[];
  onClockIn: () => void;
  onClockOut: () => void;
  isCheckedIn: boolean;
}

export function AttendanceTracker({ attendance, onClockIn, onClockOut, isCheckedIn }: AttendanceTrackerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const heatmapData = weekDays.map((day, i) => {
    const record = attendance[i];
    const hours = record?.working_hours || 0;
    return { day, hours };
  });

  const getHeatColor = (hours: number) => {
    if (hours === 0) return "bg-[var(--surface-1)] border-[var(--border-subtle)] text-[var(--text-muted)]";
    if (hours < 4) return "bg-red-500/10 border-red-500/20 text-red-500";
    if (hours < 6) return "bg-amber-500/10 border-amber-500/20 text-amber-500";
    if (hours < 8) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-500";
    return "bg-[#0075de]/10 border-[#0075de]/20 text-[#0075de]";
  };

  return (
    <div className="space-y-5 text-[var(--text-primary)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Digital Clock */}
        <Card className="p-6 border border-[var(--border-subtle)] bg-[var(--card)] rounded-xl shadow-sm col-span-1 lg:col-span-2 flex flex-col items-center justify-center">
          <Clock className="h-6 w-6 text-[#0075de] mb-2" />
          <h2 className="admin-kpi-value text-[var(--text-primary)]">
            {formatTime(currentTime)}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">{formatDate(currentTime)}</p>

          <div className="flex gap-3 mt-5">
            <button
              onClick={onClockIn}
              disabled={isCheckedIn}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                isCheckedIn
                  ? "bg-[var(--surface-2)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-subtle)]"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:scale-[1.02]"
              )}
            >
              <LogIn className="h-3.5 w-3.5" /> Check In
            </button>
            <button
              onClick={onClockOut}
              disabled={!isCheckedIn}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                !isCheckedIn
                  ? "bg-[var(--surface-2)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-subtle)]"
                  : "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:scale-[1.02]"
              )}
            >
              <LogOut className="h-3.5 w-3.5" /> Check Out
            </button>
          </div>
        </Card>

        {/* Today's Status */}
        <Card className="p-5 border border-[var(--border-subtle)] bg-[var(--card)] rounded-xl shadow-sm">
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Today&apos;s Status</h4>
          <div className="space-y-3">
            <div>
              <span className="text-[9px] text-[var(--text-muted)] font-medium">Status</span>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                {isCheckedIn ? (
                  <span className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded text-[10px] font-bold">● Clocked In</span>
                ) : (
                  <span className="text-[var(--text-muted)] bg-[var(--surface-2)] border border-[var(--border-subtle)] px-2 py-1 rounded text-[10px] font-bold">○ Not Clocked</span>
                )}
              </p>
            </div>
            <div>
              <span className="text-[9px] text-[var(--text-muted)] font-medium">Check-In Time</span>
              <p className="text-sm font-mono font-bold text-[var(--text-primary)]">
                {attendance[0]?.check_in ? new Date(attendance[0].check_in).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
              </p>
            </div>
            <div>
              <span className="text-[9px] text-[var(--text-muted)] font-medium">Check-Out Time</span>
              <p className="text-sm font-mono font-bold text-[var(--text-primary)]">
                {attendance[0]?.check_out ? new Date(attendance[0].check_out).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Heatmap */}
      <Card className="p-5 border border-[var(--border-subtle)] bg-[var(--card)] rounded-xl shadow-sm">
        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Weekly Hours Heatmap</h4>
        <div className="grid grid-cols-7 gap-2">
          {heatmapData.map((item) => (
            <div
              key={item.day}
              className={cn("p-3 rounded-lg border text-center transition-all", getHeatColor(item.hours))}
            >
              <span className="text-[9px] font-extrabold uppercase block">{item.day}</span>
              <span className="text-sm font-black font-mono block mt-1">{item.hours}h</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
