"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Meeting = { id: string; meeting_number: string; title?: string | null };

export default function NewAuditPage() {
  const router = useRouter();
  const [meetingId, setMeetingId] = useState("");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/discovery-meetings?status=closed", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error();
        const available = (body.meetings || []) as Meeting[];
        setMeetings(available);
        if (available.length === 1) setMeetingId(available[0].id);
      })
      .catch(() => setError("We couldn’t load completed discovery meetings. Please refresh and try again."))
      .finally(() => setLoading(false));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!meetingId) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discoveryMeetingId: meetingId }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error();
      router.push(`/admin/audits/${body.audit.id}`);
    } catch {
      setError("We couldn’t create the audit. Confirm that the selected discovery meeting has been completed, then try again.");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6 md:p-10">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Consulting deliverable</p>
      <h1 className="mt-2 text-3xl font-bold">Create Business & Technical Audit</h1>
      <p className="mt-2 text-sm text-slate-600">Choose a completed discovery meeting. The audit will be prepared from its meeting notes and assessment information.</p>
      <form onSubmit={submit} className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <label className="grid gap-2 text-sm font-semibold">
          Completed discovery meeting
          <select required value={meetingId} disabled={loading || !meetings.length} onChange={(event) => setMeetingId(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal disabled:bg-slate-50">
            <option value="">{loading ? "Loading completed meetings…" : "Select a discovery meeting"}</option>
            {meetings.map((meeting) => <option key={meeting.id} value={meeting.id}>{meeting.meeting_number}{meeting.title ? ` — ${meeting.title}` : ""}</option>)}
          </select>
        </label>
        {!loading && !meetings.length && !error && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">There are no completed discovery meetings available yet. Complete a meeting first, then return here to create its audit.</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy || loading || !meetingId} className="rounded-lg bg-[#1d4f7a] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? "Creating audit…" : "Create audit"}
        </button>
      </form>
    </main>
  );
}
