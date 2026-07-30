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
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3"><div className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-600"><FlaskConical size={17} /></div><div><h2 className="text-lg font-semibold">Policy simulation</h2><p className="mt-1 text-sm text-slate-500">Evaluate a hypothetical action without persisting a decision or executing a tool.</p></div></div>
        <form className="mt-5 grid gap-4" onSubmit={(event) => void simulate(event)}>
          <label className="text-xs font-semibold text-slate-700">Tool ID<input required maxLength={200} value={toolId} onChange={(event) => setToolId(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-blue-500" placeholder="finance.payment.initiate" /></label>
          <label className="text-xs font-semibold text-slate-700">Operation<input required maxLength={200} value={operation} onChange={(event) => setOperation(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-blue-500" placeholder="initiate_payment" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-slate-700">Domain<input required maxLength={100} value={domain} onChange={(event) => setDomain(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-blue-500" /></label>
            <label className="text-xs font-semibold text-slate-700">Classification<select value={sensitivity} onChange={(event) => setSensitivity(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal"><option>public</option><option>internal</option><option>confidential</option><option>restricted</option></select></label>
          </div>
          <button disabled={busy} className="h-10 rounded-lg bg-slate-900 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Evaluating…" : "Run simulation"}</button>
        </form>
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2"><LockKeyhole size={16} className="text-slate-500" /><h2 className="text-sm font-semibold">Decision preview</h2></div>
        {decision ? <div className="mt-5 space-y-3">
          <Result label="Result" value={text(decision.result)} />
          <Result label="Risk" value={text(decision.riskLevel)} />
          <Result label="Explanation" value={text(decision.safeExplanation)} />
          <Result label="Decision ID" value={text(decision.decisionId)} mono />
        </div> : <div className="grid min-h-64 place-items-center text-center text-sm text-slate-400">Simulation results appear here.<br />Internal policy conditions remain hidden.</div>}
        <div className="mt-5 border-t border-slate-100 pt-4"><p className="text-xs font-semibold text-slate-700">Version administration</p><p className="mt-1 text-xs leading-5 text-slate-500">The UI does not offer unsafe local activation controls. Version creation, validation, activation, and disablement appear only when the protected governance administration endpoints are available.</p></div>
      </section>
    </div>
  );
}

function Result({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="rounded-lg border border-slate-200 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className={`mt-1 break-words text-sm text-slate-700 ${mono ? "font-mono text-xs" : ""}`}>{value || "Not returned"}</p></div>;
}
