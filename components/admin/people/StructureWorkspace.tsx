"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CircleAlert, Layers3, Loader2, Plus, RefreshCw, X } from "lucide-react";
import {
  createPeopleReference,
  listPeopleReferences,
  PeopleEntity,
  PeopleStatus,
  peopleQueryKeys,
  updatePeopleReferenceStatus,
} from "@/lib/people/api";

export default function StructureWorkspace({ kind }: { kind: PeopleEntity }) {
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [level, setLevel] = useState("");
  const [formError, setFormError] = useState("");
  const filters = { status: "all" as const, page: 1, pageSize: 50 };
  const title = kind === "departments" ? "Departments" : "Designations";
  const query = useQuery({
    queryKey: peopleQueryKeys.referenceList(kind, filters),
    queryFn: () => listPeopleReferences(kind, filters),
    staleTime: 30_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
  const createMutation = useMutation({
    mutationFn: () => createPeopleReference(kind, {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      ...(kind === "designations" && level ? { level: Number(level) } : {}),
    }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: peopleQueryKeys.references(kind) });
      setOpen(false);
      setName("");
      setCode("");
      setLevel("");
      setFormError("");
    },
    onError: (error) => setFormError(error instanceof Error ? error.message : "Unable to create record."),
  });
  const statusMutation = useMutation({
    mutationFn: ({ item, status }: { item: NonNullable<typeof query.data>["items"][number]; status: PeopleStatus }) =>
      updatePeopleReferenceStatus(kind, item, status),
    onSuccess: async () => client.invalidateQueries({ queryKey: peopleQueryKeys.references(kind) }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    createMutation.mutate();
  }

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      <header className="flex items-end justify-between border-b border-[var(--border-subtle)] pb-6">
        <div><div className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#0075de]">People Core · Organisation</div><h1 className="text-3xl font-extrabold tracking-tight">{title}</h1><p className="mt-2 text-xs text-[var(--text-secondary)]">Maintain persisted organisation structure and current status.</p></div>
        <button onClick={() => setOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#0075de] px-3 text-[11px] font-bold text-white"><Plus size={14}/> Add {kind === "departments" ? "department" : "designation"}</button>
      </header>

      {query.isError && <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5"><div className="flex items-center gap-2 text-sm font-bold text-red-600"><CircleAlert size={16}/>{title} could not be loaded.</div><p className="mt-1 text-xs text-[var(--text-muted)]">Check the service connection and try again.</p><button onClick={() => query.refetch()} className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold"><RefreshCw size={13}/> Retry</button></div>}
      {statusMutation.isError && <p className="rounded-lg bg-red-500/10 p-3 text-xs text-red-600">Status could not be saved. Please retry.</p>}

      {!query.isError && <section className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--card)]">
        <div className="grid grid-cols-[1fr_160px_150px] bg-[var(--surface-2)] px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]"><span>Name</span><span>{kind === "departments" ? "Code" : "Level"}</span><span>Status</span></div>
        {query.isLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="m-4 h-10 animate-pulse rounded bg-[var(--surface-2)]"/>) : query.data?.items.map(item => <div key={item.id} className="grid grid-cols-[1fr_160px_150px] items-center border-t border-[var(--border-subtle)] px-4 py-4 text-xs"><div className="flex items-center gap-3">{kind === "departments" ? <Building2 size={15} className="text-[#0075de]"/> : <Layers3 size={15} className="text-[#0075de]"/>}<div><b>{item.name}</b><p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{item.code}</p></div></div><span>{kind === "departments" ? item.code : item.level || "—"}</span><select aria-label={`Status for ${item.name}`} value={item.status} disabled={statusMutation.isPending || item.status === "archived"} onChange={(event) => statusMutation.mutate({ item, status: event.target.value as PeopleStatus })} className={`w-fit rounded-full border-0 px-2 py-1 text-[9px] font-bold capitalize ${item.status === "active" ? "bg-emerald-500/10 text-emerald-600" : item.status === "inactive" ? "bg-amber-500/10 text-amber-600" : "bg-slate-500/10 text-slate-500"}`}><option value="active">Active</option><option value="inactive">Inactive</option><option value="archived">Archived</option></select></div>)}
        {!query.isLoading && !query.data?.items.length && <div className="py-16 text-center"><Building2 className="mx-auto text-[var(--text-muted)]"/><b className="mt-3 block text-sm">No {kind} yet</b><p className="mt-1 text-xs text-[var(--text-muted)]">Create your first {kind === "departments" ? "department" : "designation"} to begin building the organisation structure.</p></div>}
      </section>}

      {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => !createMutation.isPending && setOpen(false)}><form onSubmit={submit} onClick={event => event.stopPropagation()} className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">New {kind === "departments" ? "department" : "designation"}</h2><button type="button" disabled={createMutation.isPending} onClick={() => setOpen(false)}><X size={17}/></button></div>{formError && <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-xs text-red-600">{formError}</p>}<div className="mt-6 space-y-4"><label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Name<input required value={name} onChange={event => setName(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] px-3 text-xs normal-case tracking-normal"/></label><label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Code<input required value={code} onChange={event => setCode(event.target.value.toUpperCase())} className="mt-1.5 h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] px-3 text-xs normal-case tracking-normal"/></label>{kind === "designations" && <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Level<input type="number" min="1" value={level} onChange={event => setLevel(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] px-3 text-xs"/></label>}</div><button disabled={createMutation.isPending} className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0075de] text-xs font-bold text-white disabled:opacity-50">{createMutation.isPending && <Loader2 size={14} className="animate-spin"/>}{createMutation.isPending ? "Creating…" : `Create ${kind === "departments" ? "department" : "designation"}`}</button></form></div>}
    </div>
  );
}
