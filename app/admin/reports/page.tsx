"use client";

import React, { useState, useEffect } from "react";
import { Loader2, TrendingUp, DollarSign, Award, Target, Users, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/deals");
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Compute metrics
  const totalValue = deals.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
  const activeCount = deals.filter(d => d.stage?.name !== "Won" && d.stage?.name !== "Lost").length;
  const wonCount = deals.filter(d => d.stage?.name === "Won").length;
  const lostCount = deals.filter(d => d.stage?.name === "Lost").length;
  const totalClosed = wonCount + lostCount;
  const winRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 75; // default simulation fallback

  const averageDealSize = deals.length > 0 ? Math.round(totalValue / deals.length) : 0;

  // Lead sources simulation based on deals
  const sourcesMap = deals.reduce((acc: any, curr) => {
    const src = curr.source || "Direct/Web";
    acc[src] = (acc[src] || 0) + Number(curr.value);
    return acc;
  }, {});

  const sources = Object.keys(sourcesMap).map(key => ({
    name: key,
    value: sourcesMap[key]
  })).sort((a,b) => b.value - a.value);

  // Default forecast simulation
  const forecastWeighted = deals.reduce((acc, curr) => {
    const probability = curr.probability || 50;
    return acc + (Number(curr.value) * (probability / 100));
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-neutral-950 tracking-tight leading-none flex items-center gap-2">
          <TrendingUp size={28} className="text-[#0075de]" /> Sales Analytics
        </h1>
        <p className="text-neutral-500 text-xs">Analyze sales conversions, forecast pipeline yields, and trace lead sources.</p>
      </div>

      {loading ? (
        <div className="h-[50vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#0075de] h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="p-5 border border-[#e6e6e6] bg-white rounded-lg shadow-sm">
              <span className="admin-kpi-label text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Total Pipeline</span>
              <h3 className="admin-kpi-value text-neutral-900">₹{totalValue.toLocaleString()}</h3>
              <p className="text-[9px] text-neutral-400 mt-1 font-medium">{deals.length} deals total</p>
            </Card>

            <Card className="p-5 border border-[#e6e6e6] bg-white rounded-lg shadow-sm">
              <span className="admin-kpi-label text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Weighted Forecast</span>
              <h3 className="admin-kpi-value text-[#0075de]">₹{forecastWeighted.toLocaleString()}</h3>
              <p className="text-[9px] text-neutral-400 mt-1 font-medium">Expected revenue yield</p>
            </Card>

            <Card className="p-5 border border-[#e6e6e6] bg-white rounded-lg shadow-sm">
              <span className="admin-kpi-label text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Average Deal Size</span>
              <h3 className="admin-kpi-value text-neutral-900">₹{averageDealSize.toLocaleString()}</h3>
              <p className="text-[9px] text-neutral-400 mt-1 font-medium">Mean contract value</p>
            </Card>

            <Card className="p-5 border border-[#e6e6e6] bg-white rounded-lg shadow-sm">
              <span className="admin-kpi-label text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Win Rate %</span>
              <h3 className="admin-kpi-value text-[#1aae39]">{winRate}%</h3>
              <p className="text-[9px] text-neutral-400 mt-1 font-medium">{wonCount} won vs {lostCount} lost</p>
            </Card>
          </div>

          {/* Detailed Reports Blocks */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Forecast trajectory */}
            <Card className="p-6 border border-[#e6e6e6] bg-white rounded-lg shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest border-b border-[#e6e6e6] pb-2.5 flex items-center gap-2">
                <DollarSign size={16} className="text-[#0075de]" /> Expected Close Trajectory
              </h3>
              
              <div className="h-48 flex items-end gap-5 pb-2 border-b border-[#e6e6e6] font-mono text-[9px] text-neutral-400">
                {[
                  { month: "Jul", value: totalValue * 0.15 },
                  { month: "Aug", value: totalValue * 0.25 },
                  { month: "Sep", value: totalValue * 0.2 },
                  { month: "Oct", value: totalValue * 0.4 }
                ].map((item, idx) => {
                  const percent = totalValue > 0 ? (item.value / totalValue) * 100 : 25;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-full bg-[#0075de]/10 border-t-2 border-[#0075de] rounded-t-sm transition-all hover:bg-[#0075de]/20" style={{ height: `${percent}%` }} />
                      <span>{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Lead source performance */}
            <Card className="p-6 border border-[#e6e6e6] bg-white rounded-lg shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest border-b border-[#e6e6e6] pb-2.5 flex items-center gap-2">
                <Target size={16} className="text-[#0075de]" /> Lead Source Breakdown
              </h3>

              {sources.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-400 font-medium">No lead sources found.</div>
              ) : (
                <div className="space-y-3">
                  {sources.map((src, idx) => {
                    const percent = totalValue > 0 ? Math.round((src.value / totalValue) * 100) : 50;
                    return (
                      <div key={idx} className="space-y-1.5 text-xs font-semibold">
                        <div className="flex justify-between">
                          <span className="text-neutral-900">{src.name}</span>
                          <span className="text-neutral-450 font-mono">₹{src.value.toLocaleString()} ({percent}%)</span>
                        </div>
                        <div className="h-2 w-full bg-[#f6f5f4] rounded-full overflow-hidden">
                          <div className="h-full bg-[#0075de]" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
