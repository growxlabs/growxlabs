"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Kanban, Briefcase, Plus, ArrowRight, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, dealRes] = await Promise.all([
        fetch("/api/pm/projects"),
        fetch("/api/deals")
      ]);

      const projData = await projRes.json();
      const dealData = await dealRes.json();

      setProjects(projData.projects || []);
      // Filter only Won CRM deals that don't have a project yet (simulated by filtering all Won deals)
      const wonDeals = (dealData.deals || []).filter((d: any) => d.stage?.name === "Won");
      setDeals(wonDeals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealId) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/pm/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_id: selectedDealId })
      });
      if (res.ok) {
        setShowPromoteModal(false);
        setSelectedDealId("");
        await fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Failed to initialize project.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An unexpected error occurred while initializing project.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-neutral-950 tracking-tight leading-none flex items-center gap-2">
            <Briefcase size={28} className="text-[#0075de]" /> Projects Registry
          </h1>
          <p className="text-neutral-500 text-xs">Track Agile delivery pipelines, health metrics, and client deliverables.</p>
        </div>
        <Button 
          onClick={() => setShowPromoteModal(true)}
          className="bg-[#0075de] hover:bg-[#0075de]/90 text-white font-bold tracking-widest uppercase text-[10px] px-6 h-10 rounded-md"
        >
          <Plus size={14} className="mr-1" /> Promote Deal
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#0075de] h-6 w-6" />
        </div>
      ) : projects.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-[#e6e6e6] rounded-md bg-white text-center p-6">
          <Briefcase className="w-10 h-10 text-neutral-300 mb-2" />
          <h4 className="text-sm font-bold text-neutral-850">No delivery projects registered</h4>
          <p className="text-xs text-neutral-400 max-w-xs mt-1">Promote a won deal from the CRM to start project tracking.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Card key={p.id} className="p-5 border border-[#e6e6e6] bg-white rounded-lg shadow-sm hover:border-[#0075de]/30 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 leading-snug">{p.name || p.title}</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 mt-0.5 block">{p.company?.name || "Global Client"}</span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-wider bg-green-500/5 text-green-600 border border-green-200 px-2 py-0.5 rounded">
                  {p.status}
                </span>
              </div>

              {/* Progress and Health */}
              <div className="space-y-4 border-t border-[#e6e6e6]/60 pt-3.5">
                <div className="space-y-1.5 text-[10px] font-semibold text-neutral-400">
                  <div className="flex justify-between">
                    <span>Task Progress:</span>
                    <span className="text-neutral-900 font-bold">{p.progress || 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#f6f5f4] rounded-full overflow-hidden border border-[#e6e6e6]/40">
                    <div className="h-full bg-[#0075de]" style={{ width: `${p.progress || 0}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-450">
                  <span>Manager:</span>
                  <span className="text-neutral-800 font-bold">{p.project_manager?.name || "Unassigned"}</span>
                </div>

                <Link 
                  href={`/admin/pm/projects/${p.id}`}
                  className="w-full h-8 text-[9px] font-bold uppercase tracking-widest bg-white border border-[#e6e6e6] text-[#0075de] hover:bg-neutral-50 rounded-md flex items-center justify-center gap-1 mt-2.5 transition-colors"
                >
                  Project Delivery Board <ArrowRight size={10} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Promote Modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white border border-[#e6e6e6] w-full max-w-md p-6 shadow-xl rounded-lg space-y-6">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest border-b border-[#e6e6e6] pb-2.5">Promote Deal to Project</h3>
            <form onSubmit={handlePromoteDeal} className="space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase text-neutral-400">Select Won CRM Deal</span>
                <select
                  required
                  value={selectedDealId}
                  onChange={e => setSelectedDealId(e.target.value)}
                  className="w-full h-9 bg-white border border-[#e6e6e6] rounded-md px-2.5 text-xs text-neutral-805"
                >
                  <option value="">Select won deal...</option>
                  {deals.map(d => <option key={d.id} value={d.id}>{d.name} (₹{Number(d.value).toLocaleString()})</option>)}
                </select>
              </div>

              <div className="flex gap-3 justify-end border-t border-[#e6e6e6] pt-4">
                <Button type="button" onClick={() => setShowPromoteModal(false)} className="h-9 text-[10px] font-bold uppercase tracking-widest bg-white border border-[#e6e6e6] text-neutral-500 hover:bg-neutral-50 rounded-md px-4">Cancel</Button>
                <Button type="submit" disabled={submitting} className="h-9 text-[10px] font-bold uppercase tracking-widest bg-[#0075de] text-white hover:bg-[#0075de]/90 rounded-md px-4">Initialize Project</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
