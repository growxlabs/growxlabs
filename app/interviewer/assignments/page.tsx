"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Calendar, Clock, ChevronRight, UserCheck } from "lucide-react";
import Link from "next/link";

export default function InterviewerAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/interviewer/assignments", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load assignments");
      setAssignments(json.assignments || []);
    } catch (err: any) {
      setError(err.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const filtered = assignments.filter((a) => {
    if (filter === "all") return true;
    return a.access_state === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">All Interview Assignments</h1>
          <p className="text-xs text-slate-500 mt-0.5">Filter and review your current, past, and upcoming interviewer assignments.</p>
        </div>

        <Link href="/interviewer" className="text-xs font-bold text-[#0075de] hover:underline">
          Dashboard View
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {["all", "active", "upcoming", "expired", "revoked"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${filter === tab ? "bg-[#0075de] text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#0075de]" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          No assignments matching filter '{filter}'.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Job Role</th>
                <th className="px-5 py-3">Scheduled Time</th>
                <th className="px-5 py-3">Access State</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((asgn) => (
                <tr key={asgn.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-900">{asgn.candidate_name}</td>
                  <td className="px-5 py-4 font-medium text-slate-600">{asgn.job_title}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {asgn.interviews?.scheduled_at ? new Date(asgn.interviews.scheduled_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-5 py-4 uppercase font-bold text-[10px] text-slate-700">{asgn.access_state}</td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/interviewer/interviews/${asgn.interview_id}`}
                      className="inline-flex items-center gap-1 text-[#0075de] font-bold text-xs hover:underline"
                    >
                      Open Workspace <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
