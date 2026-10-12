"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function send(url: string, method: string, body: unknown) {
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Action failed");
  return data;
}

export function LeadActions({ lead }: { lead: any }) {
  const router = useRouter();
  const [tab, setTab] = useState("activity");
  const [message, setMessage] = useState("");
  const base = `/api/workspace/sales/leads/${lead.id}`;

  async function run(fn: () => Promise<any>) {
    setMessage("");
    try {
      await fn();
      setMessage("Saved");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Action failed");
    }
  }

  return (
    <section className="mt-10 border-t border-slate-200 pt-8">
      {/* Horizontally scrollable tabs on small mobile (360px-430px) without jagged wrapping */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1.5 scroll-smooth scrollbar-none">
        {["activity", "follow-up", "qualification", "disqualify", "opportunity"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-md px-3.5 py-2 text-xs font-medium capitalize transition-colors min-h-[38px] ${
              tab === t
                ? "bg-slate-950 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "activity" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run(() =>
              send(`${base}/activities`, "POST", {
                activityType: f.get("type"),
                outcome: f.get("outcome"),
                notes: f.get("notes"),
                nextAction: f.get("nextAction"),
              })
            );
          }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <select
            name="type"
            className="rounded-md border border-slate-300 p-2 text-sm bg-white text-slate-800"
          >
            {[
              "call",
              "whatsapp",
              "email",
              "linkedin",
              "meeting",
              "research",
              "note",
              "other",
            ].map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
          <input
            name="outcome"
            placeholder="Outcome (e.g., Interested, Call back, No answer)"
            className="rounded-md border border-slate-300 p-2 text-sm bg-white text-slate-800"
          />
          <textarea
            required
            name="notes"
            placeholder="What happened? Details of conversation..."
            rows={3}
            className="rounded-md border border-slate-300 p-2 text-sm bg-white text-slate-800 sm:col-span-2"
          />
          <input
            name="nextAction"
            placeholder="Optional next action"
            className="rounded-md border border-slate-300 p-2 text-sm bg-white text-slate-800 sm:col-span-2"
          />
          <button
            type="submit"
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:w-fit"
          >
            Log activity
          </button>
        </form>
      )}

      {tab === "follow-up" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run(() =>
              send(`${base}/follow-ups`, "POST", {
                context: f.get("context"),
                dueAt: new Date(String(f.get("dueAt"))).toISOString(),
                priority: f.get("priority"),
              })
            );
          }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <input
            required
            name="context"
            placeholder="Reason or context"
            className="rounded-md border border-slate-300 p-2 text-sm bg-white text-slate-800"
          />
          <input
            required
            name="dueAt"
            type="datetime-local"
            className="rounded-md border border-slate-300 p-2 text-sm bg-white text-slate-800"
          />
          <select
            name="priority"
            className="rounded-md border border-slate-300 p-2 text-sm bg-white text-slate-800"
          >
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="urgent">urgent</option>
            <option value="low">low</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:w-fit"
          >
            Add follow-up
          </button>
        </form>
      )}

      {tab === "qualification" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run(() =>
              send(`${base}/qualification`, "PATCH", {
                state: f.get("state"),
                problem_summary: f.get("problem"),
                current_process: f.get("process"),
                impact: f.get("impact"),
                urgency: f.get("urgency"),
                stakeholders: f.get("stakeholders"),
                existing_tools: f.get("tools"),
                timeline: f.get("timeline"),
                potential_fit: f.get("fit"),
                next_step: f.get("next"),
              })
            );
          }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <select
            name="state"
            defaultValue={lead.qualification?.state || "researching"}
            className="rounded-md border border-slate-300 p-2 text-sm bg-white text-slate-800"
          >
            {[
              "unqualified",
              "researching",
              "contacting",
              "engaged",
              "qualifying",
              "qualified",
            ].map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
          {[
            ["problem", "Problem / need"],
            ["process", "Current process"],
            ["impact", "Impact"],
            ["urgency", "Urgency"],
            ["stakeholders", "Stakeholders"],
            ["tools", "Existing tools"],
            ["timeline", "Timing"],
            ["fit", "Potential fit"],
            ["next", "Next step"],
          ].map(([n, p]) => (
            <input
              key={n}
              name={n}
              placeholder={p}
              className="rounded-md border border-slate-300 p-2 text-sm bg-white text-slate-800"
            />
          ))}
          <button
            type="submit"
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:w-fit"
          >
            Update qualification
          </button>
        </form>
      )}

      {tab === "disqualify" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run(() =>
              send(`${base}/disqualify`, "POST", {
                reason: f.get("reason"),
                notes: f.get("notes"),
              })
            );
          }}
          className="grid gap-3"
        >
          <select
            required
            name="reason"
            className="rounded-md border border-slate-300 p-2 text-sm bg-white text-slate-800"
          >
            <option value="">Select reason</option>
            {[
              "No current need",
              "No response after reasonable attempts",
              "Not relevant",
              "Wrong contact",
              "Too early",
              "No fit",
              "Duplicate",
              "Invalid information",
              "Other",
            ].map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
          <textarea
            name="notes"
            placeholder="Additional context"
            rows={3}
            className="rounded-md border border-slate-300 p-2 text-sm bg-white text-slate-800"
          />
          <button
            type="submit"
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 sm:w-fit"
          >
            Disqualify
          </button>
        </form>
      )}

      {tab === "opportunity" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run(() =>
              send("/api/workspace/sales/opportunities", "POST", {
                leadId: lead.id,
                name: f.get("name"),
                problemNeed: f.get("problem"),
                potentialFit: f.get("fit"),
                qualificationSummary: f.get("summary"),
                nextAction: f.get("next"),
              })
            );
          }}
          className="grid gap-3"
        >
          <input
            required
            name="name"
            defaultValue={`${lead.business_name || lead.name || "Prospect"} opportunity`}
            className="rounded-md border border-slate-300 p-2 text-sm bg-white text-slate-800"
          />
          <textarea
            required
            name="problem"
            placeholder="Problem / need"
            rows={2}
            className="rounded-md border border-slate-300 p-2 text-sm bg-white text-slate-800"
          />
          <textarea
            required
            name="fit"
            placeholder="Potential fit"
            rows={2}
            className="rounded-md border border-slate-300 p-2 text-sm bg-white text-slate-800"
          />
          <textarea
            required
            name="summary"
            placeholder="Qualification summary"
            rows={2}
            className="rounded-md border border-slate-300 p-2 text-sm bg-white text-slate-800"
          />
          <input
            name="next"
            placeholder="Next action"
            className="rounded-md border border-slate-300 p-2 text-sm bg-white text-slate-800"
          />
          <button
            type="submit"
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:w-fit"
          >
            Create opportunity
          </button>
        </form>
      )}

      {message && (
        <p aria-live="polite" className="mt-4 text-sm font-medium text-emerald-600">
          {message}
        </p>
      )}
    </section>
  );
}
