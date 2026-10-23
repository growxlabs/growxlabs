"use client";

import React, { useState } from "react";
import { DollarSign, User, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Stage {
  id: string;
  name: string;
  probability: number;
}

interface Deal {
  id: string;
  name: string;
  value: number;
  currency: string;
  expected_close_date?: string;
  company?: { name: string };
  primary_contact?: { first_name: string; last_name: string };
  stage_id: string;
  probability?: number;
}

interface KanbanBoardProps {
  initialDeals: Deal[];
  stages: Stage[];
  onStageChange: (dealId: string, newStageId: string) => Promise<void>;
}

export function KanbanBoard({ initialDeals, stages, onStageChange }: KanbanBoardProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedId(dealId);
    e.dataTransfer.setData("text/plain", dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("text/plain") || draggedId;
    if (!dealId) return;

    const deal = deals.find(d => d.id === dealId);
    if (deal && deal.stage_id !== targetStageId) {
      // Optimistic Update
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage_id: targetStageId } : d));
      try {
        await onStageChange(dealId, targetStageId);
      } catch (err) {
        console.error("Failed to persist stage change:", err);
        // Rollback on failure
        setDeals(initialDeals);
      }
    }
    setDraggedId(null);
  };

  const getStageStats = (stageId: string) => {
    const stageDeals = deals.filter(d => d.stage_id === stageId);
    const count = stageDeals.length;
    const totalValue = stageDeals.reduce((acc, curr) => acc + Number(curr.value), 0);
    return { count, totalValue };
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin select-none h-[calc(100vh-14rem)] min-h-[500px]">
      {stages.map((stage) => {
        const stageDeals = deals.filter(d => d.stage_id === stage.id);
        const { count, totalValue } = getStageStats(stage.id);

        return (
          <div
            key={stage.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
            className="flex-shrink-0 w-80 flex flex-col bg-[#f6f5f4] border border-[#e6e6e6] rounded-lg p-3.5"
          >
            {/* Stage Header */}
            <div className="flex items-start justify-between mb-3.5">
              <div>
                <h3 className="text-[14px] font-semibold text-neutral-900 leading-none mb-1">{stage.name}</h3>
                <span className="text-[11px] font-medium text-neutral-500">{stage.probability}% Probability</span>
              </div>
              <span className="text-[11px] font-medium bg-white text-[#0075de] border border-[#e6e6e6] px-2 py-0.5 rounded-full">
                {count}
              </span>
            </div>

            {/* Total Stage Value */}
            <div className="bg-white border border-[#e6e6e6] px-3.5 py-2.5 rounded-md mb-4 flex items-center justify-between shadow-sm">
              <span className="text-[11px] font-medium text-neutral-500">Total Value</span>
              <span className="text-[13px] font-semibold text-neutral-900 tabular-nums">₹{totalValue.toLocaleString()}</span>
            </div>

            {/* Cards List container */}
            <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pb-6">
              {stageDeals.length === 0 ? (
                <div className="h-28 border border-dashed border-[#e6e6e6] rounded-md flex items-center justify-center text-center p-4">
                  <span className="text-[12px] font-normal text-neutral-400">Drag deals here</span>
                </div>
              ) : (
                stageDeals.map((deal) => {
                  const dateStr = deal.expected_close_date 
                    ? new Date(deal.expected_close_date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                    : "No close date";

                  return (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      className={cn(
                        "bg-white border border-[#e6e6e6] p-4 rounded-md shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200 hover:border-[#0075de]/30 hover:shadow-md",
                        draggedId === deal.id && "opacity-40"
                      )}
                    >
                      <h4 className="text-[13px] font-semibold text-neutral-900 leading-snug mb-1 group-hover:text-[#0075de] transition-colors">{deal.name}</h4>
                      
                      {deal.company && (
                        <p className="text-[12px] font-normal text-neutral-500 mb-2.5">{deal.company.name}</p>
                      )}

                      <div className="border-t border-[#e6e6e6]/60 pt-2.5 flex items-center justify-between text-[12px] font-normal text-neutral-500">
                        <div className="flex items-center gap-1">
                          <TrendingUp size={11} className="text-[#1aae39]" />
                          <span className="font-semibold text-neutral-900 tabular-nums">₹{Number(deal.value).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] tabular-nums">
                          <Calendar size={11} className="text-neutral-400" />
                          <span>{dateStr}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
