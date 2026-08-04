"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Loader2, Plus, RefreshCw } from "lucide-react";

type Proposal = {
  id: string;
  proposal_number: string;
  status: string;
  version: number;
  client_id: string | null;
  deal_id: string | null;
  updated_at: string;
};

type Scope = {
  id: string;
  scope_number: string;
  status: string;
  version: number;
  client_id: string | null;
  deal_id: string | null;
  updated_at: string;
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  internal_review: "Internal review",
  changes_required: "Changes required",
  approved_internal: "Approved internally",
  ready_for_client: "Ready for client",
  sent: "Sent",
  viewed: "Viewed",
  negotiation: "Negotiation",
  client_changes_requested: "Client changes requested",
  approved: "Approved",
  rejected: "Rejected",
  expired: "Expired",
  signed: "Signed",
  cancelled: "Cancelled",
  archived: "Archived",
};

function label(status: string) {
  return statusLabels[status] ?? status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AdminProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [status, setStatus] = useState("all");
  const [scopeId, setScopeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [proposalResponse, scopeResponse] = await Promise.all([
        fetch("/api/admin/proposals", { cache: "no-store" }),
        fetch("/api/admin/scopes", { cache: "no-store" }),
      ]);
      const proposalData = await proposalResponse.json();
      const scopeData = await scopeResponse.json();
      if (!proposalResponse.ok) throw new Error(proposalData.error || "Unable to load proposals.");
      if (!scopeResponse.ok) throw new Error(scopeData.error || "Unable to load approved scopes.");
      setProposals(proposalData.proposals || []);
      setScopes(scopeData.scopes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load proposals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(
    () => status === "all" ? proposals : proposals.filter((proposal) => proposal.status === status),
    [proposals, status],
  );

  async function createProposal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scopeId) return;
    setCreating(true);
    setError("");
    try {
      const response = await fetch("/api/admin/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scopeId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create proposal.");
      setShowCreate(false);
      setScopeId("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create proposal.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Consulting workflow</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Commercial proposals</h1>
          <p className="mt-2 text-sm text-slate-500">Create and manage client-ready proposals generated from approved scopes of work.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void load()} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <RefreshCw size={15} /> Refresh
          </button>
          <button type="button" onClick={() => setShowCreate((value) => !value)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus size={16} /> New proposal
          </button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={createProposal} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 text-sm font-medium text-slate-700">
              Approved scope of work
              <select value={scopeId} onChange={(event) => setScopeId(event.target.value)} required className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900">
                <option value="">Select a scope...</option>
                {scopes.filter((scope) => scope.status !== "archived").map((scope) => (
                  <option key={scope.id} value={scope.id}>{scope.scope_number} · {label(scope.status)}</option>
                ))}
              </select>
            </label>
            <button disabled={creating || !scopeId} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white disabled:opacity-50">
              {creating && <Loader2 size={15} className="animate-spin" />} Create draft
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">A proposal can only be created after its Scope of Work has reached an approved workflow status.</p>
        </form>
      )}

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="flex flex-wrap gap-2">
        {["all", ...Array.from(new Set(proposals.map((proposal) => proposal.status)))].map((value) => (
          <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status === value ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {value === "all" ? "All proposals" : label(value)}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? <div className="flex h-56 items-center justify-center text-slate-500"><Loader2 className="animate-spin" /></div> : filtered.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 text-center"><FileText className="text-slate-300" size={30} /><p className="font-medium text-slate-700">No commercial proposals found</p><p className="text-sm text-slate-500">Create one from an approved Scope of Work.</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Proposal</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Version</th><th className="px-5 py-3">Client / deal</th><th className="px-5 py-3">Last updated</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((proposal) => <tr key={proposal.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-semibold text-slate-900">{proposal.proposal_number}</td><td className="px-5 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{label(proposal.status)}</span></td><td className="px-5 py-4 text-slate-600">v{proposal.version}</td><td className="px-5 py-4 text-xs text-slate-500">{proposal.client_id || "—"}<br />{proposal.deal_id || "No linked deal"}</td><td className="px-5 py-4 text-slate-600">{formatDate(proposal.updated_at)}</td></tr>)}</tbody></table></div>
        )}
      </div>
    </div>
  );
}
