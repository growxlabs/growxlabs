"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AiSolutionReportDocument } from "@/components/consulting/AiSolutionReportDocument";
import { SolutionArchitectureDocument } from "@/components/consulting/SolutionArchitectureDocument";
import { consultingStatusLabel } from "@/lib/consulting/status";
import { useRouter } from "next/navigation";
const statuses = [
  "draft",
  "internal_review",
  "changes_required",
  "approved_internal",
  "ready_for_client",
  "shared",
  "client_reviewed",
  "client_acknowledged",
  "closed",
  "archived",
];
export function ConsultingWorkspace({
  kind,
  id,
}: {
  kind: "report" | "architecture";
  id: string;
}) {
  const router = useRouter();
  const config =
    kind === "report"
      ? {
          endpoint: "/api/admin/ai-solution-reports",
          key: "ai-solution-report",
          root: "report",
          title: "AI Opportunity & Solution Report",
          nextEndpoint: "/api/admin/solution-architectures",
        }
      : {
          endpoint: "/api/admin/solution-architectures",
          key: "solution-architecture",
          root: "architecture",
          title: "Solution Architecture",
          nextEndpoint: "",
        };
  const qc = useQueryClient(),
    query = useQuery<{ [key: string]: Record<string, unknown> }>({
      queryKey: [config.key, id],
      queryFn: async () => {
        const r = await fetch(`${config.endpoint}/${id}`),
          b = await apiBody(r);
        if (!r.ok)
          throw new Error(String(b.error || "Unable to load document."));
        return b as { [key: string]: Record<string, unknown> };
      },
    });
  const update = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const r = await fetch(`${config.endpoint}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        b = await apiBody(r);
      if (!r.ok)
        throw new Error(
          String(
            b.error || "AI generation did not complete. Please try again.",
          ),
        );
      return b;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [config.key, id] }),
  });
  const createNext = useMutation({
    mutationFn: async () => {
      const r = await fetch(config.nextEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId: id }),
        }),
        b = await apiBody(r);
      if (!r.ok)
        throw new Error(String(b.error || "Unable to continue workflow."));
      const architecture = b.architecture as
        | Record<string, unknown>
        | undefined;
      if (!architecture?.id)
        throw new Error(
          "Architecture was created, but its document ID was not returned.",
        );
      return String(architecture.id);
    },
    onSuccess: (architectureId) => {
      router.push(`/admin/solution-architectures/${architectureId}`);
    },
  });
  const createScope = useMutation({
    mutationFn: async () => {
      if (status !== "closed") {
        const closeResponse = await fetch(`${config.endpoint}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "closed" }),
        });
        const closeBody = await apiBody(closeResponse);
        if (!closeResponse.ok)
          throw new Error(
            String(closeBody.error || "Unable to complete the architecture."),
          );
      }
      const response = await fetch("/api/admin/scopes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ architectureId: id }),
      });
      const body = await apiBody(response);
      if (!response.ok)
        throw new Error(String(body.error || "Unable to create Scope of Work."));
      const scope = body.scope as Record<string, unknown> | undefined;
      if (!scope?.id)
        throw new Error("Scope of Work was created without a document ID.");
      return String(scope.id);
    },
    onSuccess: () => router.push("/admin/scopes"),
  });
  if (query.isPending) return <p>Loading document…</p>;
  if (query.error) return <p className="text-red-700">{query.error.message}</p>;
  const doc = query.data[config.root],
    status = String(doc.status),
    summary = doc.executive_summary as Record<string, unknown> | undefined,
    placeholder =
      kind === "report" && String(summary?.content || "").startsWith("Draft"),
    architecturePlaceholder =
      kind === "architecture" &&
      String(summary?.content || "").startsWith("Draft"),
    error = update.error ?? createNext.error ?? createScope.error;
  if (kind === "report")
    return (
      <main className="p-6 md:p-10">
        <div className="no-print mx-auto mb-6 max-w-6xl rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Consulting workflow
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {consultingStatusLabel(status)}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {![
                "approved_internal",
                "ready_for_client",
                "shared",
                "client_reviewed",
                "client_acknowledged",
                "closed",
                "archived",
              ].includes(status) && (
                <button
                  onClick={() => update.mutate({ generateAi: true })}
                  disabled={update.isPending}
                  className="rounded bg-[#1d4f7a] px-4 py-2 text-sm font-semibold text-white"
                >
                  {update.isPending
                    ? "Generating…"
                    : placeholder
                      ? "Generate AI Draft"
                      : "Regenerate AI Draft"}
                </button>
              )}
              {!placeholder &&
                ["draft", "internal_review", "changes_required"].includes(
                  status,
                ) && (
                  <button
                    onClick={() =>
                      update.mutate({ status: "approved_internal" })
                    }
                    disabled={update.isPending}
                    className="rounded border border-[#1d4f7a] px-4 py-2 text-sm font-semibold text-[#1d4f7a]"
                  >
                    Approve Report
                  </button>
                )}
              {status === "approved_internal" && (
                <button
                  type="button"
                  onClick={() => createNext.mutate()}
                  disabled={createNext.isPending}
                  aria-busy={createNext.isPending}
                  className="inline-flex min-w-64 items-center justify-center gap-2 rounded bg-[#1d4f7a] px-4 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
                >
                  {createNext.isPending && (
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      aria-hidden="true"
                    />
                  )}
                  {createNext.isPending
                    ? "Creating Architecture…"
                    : "Generate Solution Architecture"}
                </button>
              )}
              <button
                onClick={() => window.print()}
                disabled={createNext.isPending}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Print
              </button>
            </div>
          </div>
          {placeholder && (
            <p className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              AI generation is required. The source audit is ready, but this
              report still contains the initial placeholder.
            </p>
          )}
          {createNext.isPending && (
            <p className="mt-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              Creating the Solution Architecture workspace. You will be
              redirected automatically when it is ready.
            </p>
          )}
          {error && (
            <p className="mt-3 text-sm text-red-700">{error.message}</p>
          )}
        </div>
        <div className="mx-auto max-w-6xl">
          <AiSolutionReportDocument report={doc} />
        </div>
      </main>
    );
  return (
    <main className="p-6 md:p-10">
      <div className="no-print mx-auto mb-6 max-w-6xl rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Solution architecture workflow</p><p className="mt-1 text-sm text-slate-600">{consultingStatusLabel(status)}</p></div>
          <div className="flex flex-wrap gap-3">
            {architecturePlaceholder&&<button onClick={()=>update.mutate({generateDraft:true})} disabled={update.isPending} className="rounded bg-[#1d4f7a] px-4 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70">{update.isPending?"Generating Architecture…":"Generate Architecture Draft"}</button>}
            {!architecturePlaceholder&&["draft","internal_review","changes_required"].includes(status)&&<button onClick={()=>update.mutate({status:"approved_internal"})} disabled={update.isPending} className="rounded border border-[#1d4f7a] px-4 py-2 text-sm font-semibold text-[#1d4f7a]">Approve Architecture</button>}
            {["approved_internal","closed"].includes(status)&&<button onClick={()=>createScope.mutate()} disabled={createScope.isPending} className="rounded bg-[#1d4f7a] px-4 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70">{createScope.isPending?"Creating Scope of Work…":status==="closed"?"Create/Open Scope of Work":"Complete & Create Scope of Work"}</button>}
            <button onClick={()=>window.print()} disabled={update.isPending} className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold">Print</button>
          </div>
        </div>
        {architecturePlaceholder&&<p className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Architecture generation is required. This workspace still contains the initial placeholder.</p>}
        {(update.isPending||createScope.isPending)&&<p className="mt-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">{createScope.isPending?"Creating the Scope of Work and opening the scopes workspace…":"Preparing the architecture document from the approved AI report…"}</p>}
        {error&&<p className="mt-3 text-sm text-red-700">{error.message}</p>}
      </div>
      <div className="mx-auto max-w-6xl">
        <SolutionArchitectureDocument architecture={doc}/>
      </div>
    </main>
  );
}
async function apiBody(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {
      error: response.ok
        ? "The server returned an invalid response."
        : "The request timed out or the server was temporarily unavailable. Please try again.",
    };
  }
}
