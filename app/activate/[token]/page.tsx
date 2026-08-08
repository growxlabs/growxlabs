"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ActivateAccountPage() {
  const params = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 12) { setError("Use at least 12 characters."); return; }
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/hrms/identity/invitations/${encodeURIComponent(params.token)}/accept`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        const structured = data?.error;
        const message = typeof structured === "object" ? structured?.message : structured;
        throw new Error(data?.detail || message || "Account activation failed.");
      }
      setDone(true);
    } catch (activationError) {
      setError(activationError instanceof Error ? activationError.message : "Activation failed");
    } finally { setSaving(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-5">
    <section className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      {done ? <div className="text-center">
        <CheckCircle2 className="mx-auto text-emerald-600" size={42}/>
        <h1 className="mt-5 text-2xl font-black text-neutral-900">Account activated</h1>
        <p className="mt-2 text-sm text-neutral-500">Your identity is active and ready to use.</p>
        <Link href="/login" className="mt-7 inline-flex h-10 items-center rounded-lg bg-[#0075de] px-5 text-xs font-bold text-white">Continue to sign in</Link>
      </div> : <>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075de]"><ShieldCheck/></div>
        <h1 className="mt-5 text-2xl font-black text-neutral-900">Activate your account</h1>
        <p className="mt-2 text-sm text-neutral-500">Create a secure password to accept your People workspace invitation.</p>
        {error && <div className="mt-5 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">Password<input type="password" autoComplete="new-password" required value={password} onChange={event=>setPassword(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm text-neutral-900 outline-none focus:border-[#0075de]"/></label>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">Confirm password<input type="password" autoComplete="new-password" required value={confirm} onChange={event=>setConfirm(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm text-neutral-900 outline-none focus:border-[#0075de]"/></label>
          <button disabled={saving} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0075de] text-xs font-bold text-white disabled:opacity-50">{saving && <Loader2 size={14} className="animate-spin"/>}Activate account</button>
        </form>
      </>}
    </section>
  </main>;
}
