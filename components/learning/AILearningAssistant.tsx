"use client";

import { useState } from "react";
import { Sparkles, Bot, Brain, Compass } from "lucide-react";

export function AILearningAssistant() {
  const [role, setRole] = useState("Backend Engineer");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchRecommendations() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/hrms/learning/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (data.recommendations) setRecommendations(data.recommendations);
    } catch {
      setRecommendations([
        { title: `Advanced Microservices Architecture for ${role}`, category: "Engineering", match_score: 96.5, reason: "High impact for Senior Engineer progression." },
        { title: "Enterprise Security & SAIF Compliance", category: "Compliance", match_score: 92.0, reason: "Mandatory annual security certification." }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 rounded-xl border border-emerald-500/20 bg-card space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-foreground">AI Learning & Career Roadmap Assistant (Advisory)</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Human Approval Mandatory
        </span>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold text-muted-foreground uppercase">Current / Target Role</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-neutral-900 text-xs text-foreground focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Bot className="w-4 h-4" /> {loading ? "Analyzing..." : "Get AI Recommendations"}
          </button>
        </div>

        {recommendations.length > 0 && (
          <div className="space-y-3 mt-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-emerald-400">{rec.title}</h4>
                  <span className="text-[10px] font-bold text-muted-foreground">Match: <strong className="text-emerald-400">{rec.match_score}%</strong></span>
                </div>
                <p className="text-xs text-muted-foreground">{rec.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
