"use client";

import { CheckCircle2, FlaskConical, LockKeyhole, Sparkles, XCircle } from "lucide-react";
import { useState } from "react";

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function PolicyConsole() {
  const [toolId, setToolId] = useState("");
  const [operation, setOperation] = useState("");
  const [domain, setDomain] = useState("command-center");
  const [sensitivity, setSensitivity] = useState("internal");
  const [decision, setDecision] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const presets = [
    {
      label: "Payment Wire",
      tool: "finance.payment.initiate",
      op: "initiate_payment",
      domain: "finance",
      sens: "restricted",
    },
    {
      label: "Data Export",
      tool: "crm.contacts.export",
      op: "bulk_export",
      domain: "crm",
      sens: "confidential",
    },
    {
      label: "Model Exec",
      tool: "agent.gemini.inference",
      op: "execute_prompt",
      domain: "command-center",
      sens: "internal",
    },
  ];

  function applyPreset(p: typeof presets[0]) {
    setToolId(p.tool);
    setOperation(p.op);
    setDomain(p.domain);
    setSensitivity(p.sens);
  }

  async function simulate(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setDecision(null);
    try {
      const requestId = crypto.randomUUID();
      const response = await fetch("/api/admin/command-center/governance/policy/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          traceId: requestId,
          organisationId: "server-derived",
          workspaceId: "server-derived",
          userId: "server-derived",
          roleIds: [],
          teamIds: [],
          permissionIds: [],
          agentId: "policy-simulator",
          capabilityId: "governance.simulation",
          toolId,
          toolVersion: "1.0.0",
          domain,
          operation,
          executionMode: "simulation",
          sensitivity,
          dataClassification: sensitivity,
          attributes: {},
        }),
      });
      const payload = object(await response.json());
      if (!response.ok) {
        throw new Error(text(object(payload.error).message) || "Policy simulation failed.");
      }
      setDecision(object(payload.decision));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Policy simulation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Simulation Form Section */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-start gap-3.5 pb-5 border-b border-zinc-800/80">
          <div className="grid size-10 place-items-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 shrink-0">
            <FlaskConical size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Policy Simulation Laboratory</h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              Evaluate real-time rule outcomes without modifying records or executing tools.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium text-zinc-500 flex items-center gap-1">
            <Sparkles size={11} className="text-blue-400" /> Presets:
          </span>
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        <form className="mt-5 grid gap-4" onSubmit={(event) => void simulate(event)}>
          <label className="text-xs font-semibold text-zinc-200">
            Tool Identifier
            <input
              required
              maxLength={200}
              value={toolId}
              onChange={(event) => setToolId(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none transition-all focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 font-mono"
              placeholder="e.g. finance.payment.initiate"
            />
          </label>

          <label className="text-xs font-semibold text-zinc-200">
            Target Operation
            <input
              required
              maxLength={200}
              value={operation}
              onChange={(event) => setOperation(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none transition-all focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 font-mono"
              placeholder="e.g. execute_payment"
            />
          </label>

          <div className="grid grid-cols-2 gap-3.5">
            <label className="text-xs font-semibold text-zinc-200">
              Domain Boundary
              <input
                required
                maxLength={100}
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 text-xs text-zinc-100 outline-none transition-all focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 font-mono"
              />
            </label>
            <label className="text-xs font-semibold text-zinc-200">
              Data Sensitivity
              <select
                value={sensitivity}
                onChange={(event) => setSensitivity(event.target.value)}
                style={{ colorScheme: "dark" }}
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 text-xs text-zinc-100 outline-none transition-all focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="public">Public</option>
                <option value="internal">Internal</option>
                <option value="confidential">Confidential</option>
                <option value="restricted">Restricted</option>
              </select>
            </label>
          </div>

          <button
            disabled={busy}
            className="mt-2 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {busy ? "Evaluating Policy Rules..." : "Execute Simulation"}
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
            {error}
          </p>
        )}
      </section>

      {/* Decision Output Section */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-800/80">
            <LockKeyhole size={16} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Evaluated Policy Decision</h2>
          </div>

          {decision ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Verdict</span>
                <div className="mt-1 flex items-center gap-2">
                  {text(decision.result).toLowerCase() === "allow" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 uppercase">
                      <CheckCircle2 size={13} />
                      ALLOW
                    </span>
                  ) : text(decision.result).toLowerCase() === "deny" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 uppercase">
                      <XCircle size={13} />
                      DENY
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 uppercase">
                      REQUIRE APPROVAL
                    </span>
                  )}
                  <span className="text-xs text-zinc-400 capitalize">
                    {text(decision.riskLevel)} risk
                  </span>
                </div>
              </div>

              <Result label="Explanation" value={text(decision.safeExplanation)} />
              <Result label="Cryptographic Decision ID" value={text(decision.decisionId)} mono />
            </div>
          ) : (
            <div className="grid min-h-[200px] place-items-center text-center text-xs text-zinc-500 p-6 leading-relaxed">
              Simulation evaluation verdict will appear here.<br />Underlying rule conditions remain cryptographically secured.
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-zinc-800/80 pt-4">
          <p className="text-[11px] font-semibold text-zinc-300">Audited Version Administration</p>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
            Policy definitions, rulesets, and thresholds are versioned immutably. Modifying policy parameters requires dual-key administrator sign-off.
          </p>
        </div>
      </section>
    </div>
  );
}

function Result({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p>
      <p className={`mt-1 break-words text-xs text-zinc-100 ${mono ? "font-mono text-blue-400 text-[11px]" : ""}`}>
        {value || "Not returned"}
      </p>
    </div>
  );
}
