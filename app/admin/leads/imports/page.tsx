"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function LeadImportsPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch("/api/admin/leads/imports")
      .then((r) => r.json())
      .then((b) => setBatches(b.batches || []));
  }, []);
  return (
    <main className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0075de]">
          Customer & Sales
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">Lead Imports</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Review GrowX Crawl prospects before they enter the canonical Lead
          Pool.
        </p>
      </header>
      {message && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {message}
        </p>
      )}
      <section className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--card)]">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            <tr>
              {[
                "Source",
                "Segment / Job",
                "Received",
                "Ready",
                "Duplicates",
                "Review",
                "Imported",
                "Rejected",
                "Status",
                "Created",
              ].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr
                key={batch.id}
                className="border-t border-[var(--border-subtle)]"
              >
                <td className="px-4 py-4 font-semibold">
                  <Link
                    href={`/admin/leads/imports/${batch.id}`}
                    className="text-[#0075de] hover:underline"
                  >
                    {batch.batch_reference}
                  </Link>
                  <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                    {batch.source}
                  </span>
                </td>
                <td className="px-4 py-4">{batch.source_job_id}</td>
                <td className="px-4 py-4">{batch.received_count}</td>
                <td className="px-4 py-4">{batch.valid_count}</td>
                <td className="px-4 py-4">{batch.duplicate_count}</td>
                <td className="px-4 py-4">{batch.needs_review_count}</td>
                <td className="px-4 py-4">{batch.imported_count}</td>
                <td className="px-4 py-4">{batch.rejected_count || 0}</td>
                <td className="px-4 py-4 font-semibold">{batch.status}</td>
                <td className="px-4 py-4 text-xs text-[var(--text-muted)]">
                  {new Date(batch.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {!batches.length && (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-12 text-center text-[var(--text-secondary)]"
                >
                  No lead imports received yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
