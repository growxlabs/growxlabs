"use client";

import React, { useState, useEffect } from "react";
import { Play, Square, Pause, Clock, Check, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Task {
  id: string;
  title: string;
  project?: { name: string };
}

interface TimeTrackerProps {
  tasks: Task[];
  onLogTime: (data: any) => Promise<void>;
}

export function TimeTracker({ tasks, onLogTime }: TimeTrackerProps) {
  // Timer State
  const [activeTaskId, setActiveTaskId] = useState("");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Manual Log State
  const [manualTaskId, setManualTaskId] = useState("");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const toggleTimer = () => {
    if (!activeTaskId) return alert("Select a task to track time against.");
    setIsTimerRunning(!isTimerRunning);
  };

  const handleStopTimer = async () => {
    if (seconds < 60) return alert("Logs must be at least 1 minute long.");
    
    const decimalHours = Number((seconds / 3600).toFixed(2));
    const targetTask = tasks.find(t => t.id === activeTaskId);

    try {
      setSubmitting(true);
      await onLogTime({
        task_id: activeTaskId,
        log_date: new Date().toISOString().split("T")[0],
        hours_logged: decimalHours,
        description: `Timer logged for task: ${targetTask?.title || "Project task"}`
      });
      alert(`Successfully tracked ${decimalHours} hours!`);
      // Reset
      setIsTimerRunning(false);
      setSeconds(0);
      setActiveTaskId("");
    } catch (e) {
      console.error(e);
      alert("Failed to track timer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTaskId || !hours) return;

    try {
      setSubmitting(true);
      await onLogTime({
        task_id: manualTaskId,
        log_date: date,
        hours_logged: Number(hours),
        description
      });
      alert("Manual timesheet log submitted!");
      setHours("");
      setDescription("");
      setManualTaskId("");
    } catch (e) {
      console.error(e);
      alert("Failed to save log.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Running timer log */}
      <Card className="p-6 border border-[#e6e6e6] bg-white rounded-lg shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest border-b border-[#e6e6e6] pb-2.5 flex items-center gap-2">
          <Clock size={16} className="text-[#0075de]" /> Running Activity Timer
        </h3>

        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase text-neutral-450">Active Task</span>
            <select
              disabled={isTimerRunning}
              value={activeTaskId}
              onChange={(e) => setActiveTaskId(e.target.value)}
              className="w-full h-10 bg-[#f6f5f4] border border-[#e6e6e6] rounded-md px-3 text-xs text-neutral-805 outline-none disabled:opacity-60"
            >
              <option value="">Choose task to clock...</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>

          <div className="flex flex-col items-center justify-center py-6 bg-[#f6f5f4] rounded-md border border-[#e6e6e6]/60 font-mono">
            <span className="admin-kpi-label text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Time Elapsed</span>
            <span className="admin-kpi-value text-neutral-950">{formatTime(seconds)}</span>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={toggleTimer}
              className={`flex-1 h-10 text-[10px] font-bold uppercase tracking-widest rounded-md ${
                isTimerRunning 
                  ? "bg-amber-500 hover:bg-amber-500/90 text-white" 
                  : "bg-[#0075de] hover:bg-[#0075de]/90 text-white"
              }`}
            >
              {isTimerRunning ? <><Pause size={12} className="mr-1" /> Pause</> : <><Play size={12} className="mr-1" fill="white" /> Start Timer</>}
            </Button>

            <Button
              type="button"
              disabled={seconds === 0 || submitting}
              onClick={handleStopTimer}
              className="flex-1 h-10 text-[10px] font-bold uppercase tracking-widest bg-red-500 hover:bg-red-500/90 text-white rounded-md flex items-center justify-center gap-1"
            >
              <Square size={12} fill="white" /> Stop & Log
            </Button>
          </div>
        </div>
      </Card>

      {/* Manual log form */}
      <Card className="p-6 border border-[#e6e6e6] bg-white rounded-lg shadow-sm">
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest border-b border-[#e6e6e6] pb-2.5">Manual Timesheet Log</h3>

          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase text-neutral-450">Select Task</span>
            <select
              required
              value={manualTaskId}
              onChange={(e) => setManualTaskId(e.target.value)}
              className="w-full h-9 bg-[#f6f5f4] border border-[#e6e6e6] rounded-md px-2.5 text-xs text-neutral-805"
            >
              <option value="">Select task...</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase text-neutral-450">Hours Worked</span>
              <Input
                type="number"
                step="0.25"
                required
                min="0.25"
                max="24"
                placeholder="e.g. 3.5"
                value={hours}
                onChange={e => setHours(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase text-neutral-450">Work Date</span>
              <Input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase text-neutral-450">Description</span>
            <textarea
              rows={2}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detail accomplishments..."
              className="w-full text-xs bg-[#f6f5f4] border border-[#e6e6e6] rounded p-2 focus:outline-none focus:bg-white focus:border-[#0075de] transition-all"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#0075de] text-white hover:bg-[#0075de]/95 font-bold uppercase tracking-widest text-[10px] h-10 rounded-md"
          >
            {submitting ? "Submitting log..." : "Submit Hours Log"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
