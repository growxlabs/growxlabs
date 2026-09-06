"use client";

import { FlaskConical, LockKeyhole } from "lucide-react";
import { useState } from "react";

function object(value: unknown): Record<string, unknown> { return value && typeof value === "object" ? value as Record<string, unknown> : {}; }
function text(value: unknown) { return typeof value === "string" ? value : ""; }

export function PolicyConsole() {
  const [toolId, setToolId] = useState("");
  const [operation, setOperation] = useState("");
  const [domain, setDomain] = useState("command-center");
  const [sensitivity, setSensitivity] = useState("internal");
  const [decision, setDecision] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function simulate(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setDecision(null);
    try {
      const requestId = crypto.randomUUID();
      const response = await fetch("/api/admin/command-center/governance/policy/simulate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId, traceId: requestId, organisationId: "server-derived", workspaceId: "server-derived", userId: "server-derived",
          roleIds: [], teamIds: [], permissionIds: [], agentId: "policy-simulator", capabilityId: "governance.simulation",
          toolId, toolVersion: "1.0.0", domain, operation, executionMode: "simulation",
          sensitivity, dataClassification: sensitivity, attributes: {},
        }),
      });
      const payload = object(await response.json());
      if (!response.ok) throw new Error(text(object(payload.error).message) || "Policy simulation failed.");
      setDecision(object(payload.decision));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Policy simulation failed."); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border border-[#27272a] bg-[#141416] p-6 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="grid size-10 place-items-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
            <FlaskConical size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Policy Simulation</h2>
            <p className="mt-1 text-xs text-zinc-400">
              Evaluate a hypothetical action without persisting a decision or executing a tool.
            </p>
          </div>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={(event) => void simulate(event)}>
          <label className="text-xs font-semibold text-zinc-200">
            Tool ID
            <input
              required
              maxLength={200}
              value={toolId}
              onChange={(event) => setToolId(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-[#1a1a1e] px-3.5 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-blue-500 font-normal transition-colors"
              placeholder="finance.payment.initiate"
            />
          </label>

          <label className="text-xs font-semibold text-zinc-200">
            Operation
            <input
              required
              maxLength={200}
              value={operation}
              onChange={(event) => setOperation(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-[#1a1a1e] px-3.5 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-blue-500 font-normal transition-colors"
              placeholder="initiate_payment"
            />
          </label>

          <div className="grid grid-cols-2 gap-3.5">
            <label className="text-xs font-semibold text-zinc-200">
              Domain
              <input
                required
                maxLength={100}
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-[#1a1a1e] px-3.5 text-xs text-white outline-none focus:border-blue-500 font-normal transition-colors"
              />
            </label>
            <label className="text-xs font-semibold text-zinc-200">
              Classification
              <select
                value={sensitivity}
                onChange={(event) => setSensitivity(event.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-[#1a1a1e] px-3 text-xs text-white outline-none focus:border-blue-500 font-normal cursor-pointer"
              >
                <option value="public">public</option>
                <option value="internal">internal</option>
                <option value="confidential">confidential</option>
                <option value="restricted">restricted</option>
              </select>
            </label>
          </div>

          <button
            disabled={busy}
            className="mt-2 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {busy ? "Evaluating…" : "Run simulation"}
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-[#27272a] bg-[#141416] p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-4 border-b border-white/[0.08]">
            <LockKeyhole size={16} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Decision Preview</h2>
          </div>

          {decision ? (
            <div className="mt-5 space-y-3">
              <Result label="Result" value={text(decision.result)} />
              <Result label="Risk" value={text(decision.riskLevel)} />
              <Result label="Explanation" value={text(decision.safeExplanation)} />
              <Result label="Decision ID" value={text(decision.decisionId)} mono />
            </div>
          ) : (
            <div className="grid min-h-56 place-items-center text-center text-xs text-zinc-500 p-6 leading-relaxed">
              Simulation results will appear here.<br />Internal policy conditions remain cryptographically hidden.
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-white/[0.08] pt-4">
          <p className="text-[11px] font-semibold text-zinc-300">Version Administration</p>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
            The console enforces separation of duties. Version creation, activation, and disablement are governed by audited role permissions.
          </p>
        </div>
      </section>
    </div>
  );
}

function Result({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p>
      <p className={`mt-1 break-words text-xs text-zinc-100 ${mono ? "font-mono text-blue-400 text-[11px]" : ""}`}>
        {value || "Not returned"}
      </p>
    </div>
  );
}
