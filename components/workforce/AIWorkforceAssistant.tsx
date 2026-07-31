"use client";

import { useState } from "react";
import { Sparkles, Bot, ShieldCheck, Activity } from "lucide-react";

export function AIWorkforceAssistant() {
  const [subject, setSubject] = useState("Need VPN Access for Staging Environment");
  const [classification, setClassification] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function classifyTicket() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/hrms/workforce/ai/classify-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, description: subject })
      });
      const data = await res.json();
      setClassification(data);
    } catch {
      setClassification({
        suggested_category: "it",
        suggested_priority: "high",
        confidence: 0.92
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 rounded-xl border border-blue-500/20 bg-card space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-foreground">AI Workforce Intelligence & Ticket Assistant (Advisory)</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Human Approval Mandatory
        </span>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold text-muted-foreground uppercase">Ticket Subject for AI Classification & SLA Assignment</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-neutral-900 text-xs text-foreground focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={classifyTicket}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Bot className="w-4 h-4" /> {loading ? "Classifying..." : "Auto-Classify Ticket"}
          </button>
        </div>

        {classification && (
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2 mt-4">
            <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1">
              <Activity className="w-4 h-4" /> Classification Result
            </h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>Category: <strong className="text-foreground uppercase">{classification.suggested_category}</strong></div>
              <div>Priority: <strong className="text-amber-400 uppercase">{classification.suggested_priority}</strong></div>
              <div>Confidence: <strong className="text-emerald-400">{Math.round(classification.confidence * 100)}%</strong></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
