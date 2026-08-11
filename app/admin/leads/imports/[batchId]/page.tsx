"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ImportDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const [id, setId] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    params.then(({ batchId }) => {
      setId(batchId);
      fetch(`/api/admin/leads/imports/${batchId}`)
        .then(async (r) => {
          const b = await r.json();
          if (!r.ok) throw new Error(b.error || "Import could not be loaded");
          setData(b);
        })
        .catch((e) => setError(e.message));
    });
  }, [params]);
  async function approve(candidateId: string) {
    const r = await fetch("/api/admin/leads/imports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId }),
    });
    const b = await r.json();
    if (!r.ok) return setError(b.error || "Candidate could not be approved");
    setData((current: any) => ({
      ...current,
      candidates: current.candidates.map((c: any) =>
        c.id === candidateId
          ? { ...c, review_status: "imported", promoted_lead_id: b.leadId }
          : c,
      ),
    }));
  }
  if (error)
    return (
      <main className="p-8">
        <p className="rounded border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </p>
      </main>
    );
  if (!data)
    return (
      <main className="p-8 text-sm text-[var(--text-secondary)]">
        Loading import…
      </main>
    );
  return (
    <main className="space-y-8">
      <Link href="/admin/leads/imports" className="text-sm text-[#0075de]">
        ← Lead Imports
      </Link>
      <header>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0075de]">
          {data.batch.source}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">
          {data.batch.batch_reference}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Job / segment: {data.batch.source_job_id} · Status:{" "}
          {data.batch.status}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded border bg-[var(--border-subtle)] sm:grid-cols-5">
          {[
            ["Received", data.batch.received_count],
            ["Ready", data.batch.valid_count],
            ["Duplicates", data.batch.duplicate_count],
            ["Review", data.batch.needs_review_count],
            ["Imported", data.batch.imported_count],
            ["Rejected", data.batch.rejected_count || 0],
          ].map(([label, value]) => (
            <div key={String(label)} className="bg-[var(--card)] p-4">
              <p className="text-xl font-bold">{value}</p>
              <p className="mt-1 text-[10px] uppercase text-[var(--text-muted)]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </header>
      <section className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[10px] uppercase text-[var(--text-muted)]">
            <tr>
              {[
                "Company",
                "Location",
                "Phone",
                "Email",
                "Decision maker",
                "Match",
                "Status",
                "Lead score",
                "Priority",
                "Action",
              ].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.candidates.map((candidate: any) => {
              const p = candidate.payload_snapshot;
              return (
                <tr
                  key={candidate.id}
                  className="border-t border-[var(--border-subtle)]"
                >
                  <td className="px-4 py-4 font-semibold">{p.company_name}</td>
                  <td className="px-4 py-4">
                    {[p.city, p.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-4">
                    {p.contact?.phone || p.phone || "—"}
                  </td>
                  <td className="px-4 py-4">
                    {p.contact?.email || p.email || "—"}
                  </td>
                  <td className="px-4 py-4">
                    {[p.contact?.name, p.contact?.role]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-4">{candidate.match_status}</td>
                  <td className="px-4 py-4">{candidate.review_status}</td>
                  <td className="px-4 py-4">{p.score ?? "—"}</td>
                  <td className="px-4 py-4">{p.priority || "—"}</td>
                  <td className="px-4 py-4">
                    {candidate.review_status === "pending" &&
                    candidate.match_status === "no_match" ? (
                      <button
                        onClick={() => void approve(candidate.id)}
                        className="rounded bg-[#0075de] px-3 py-2 text-xs font-bold text-white"
                      >
                        Approve
                      </button>
                    ) : candidate.promoted_lead_id ? (
                      <span className="text-emerald-700">Imported</span>
                    ) : (
                      <span className="text-amber-700">Review required</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}
