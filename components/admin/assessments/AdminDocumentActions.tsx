"use client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminDocumentActions({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();
  const [success, setSuccess] = useState("");
  const action = useMutation({
    mutationFn: async (name: string) => {
      const payload = name === "request-information" ? { message: "Please provide the additional information requested by our consulting team.", questionKeys: [], sectionKeys: [] } : name === "reopen" ? { questionKeys: [], sectionKeys: [] } : {};
      const response = await fetch(`/api/admin/assessments/${assessmentId}/${name}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Action failed.");
      return { name };
    },
    onSuccess: ({ name }) => { setSuccess(`${name.replaceAll("-", " ")} completed successfully.`); setTimeout(() => window.location.reload(), 500); },
  });
  return <div className="flex flex-wrap items-center gap-2">
    <button type="button" onClick={() => router.push(`/admin/discovery-meetings/new?assessmentId=${assessmentId}`)} className="min-h-11 rounded bg-[#1d4f7a] px-3 text-sm font-semibold text-white">Schedule Discovery Meeting</button>
    {["start-review", "request-information", "reopen"].map((name) => <button key={name} type="button" disabled={action.isPending} onClick={() => { setSuccess(""); action.mutate(name); }} className="min-h-11 rounded border border-slate-300 px-3 text-sm font-semibold capitalize disabled:opacity-50">{action.isPending ? "Working…" : name.replaceAll("-", " ")}</button>)}
    {action.error && <span role="alert" className="text-xs text-red-700">{action.error.message}</span>}{success && <span role="status" className="text-xs font-semibold text-emerald-700">{success}</span>}
  </div>;
}
