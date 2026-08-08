"use client";

import { FormEvent, useState } from "react";
import { Check, CheckCircle2, CircleAlert, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";

type ActivationState = "form" | "unavailable" | "done";

function getErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") return "We couldn't activate your account. Please try again.";
  const body = payload as { detail?: unknown; message?: unknown; error?: unknown };
  if (typeof body.detail === "string") return body.detail;
  if (typeof body.message === "string") return body.message;
  if (typeof body.error === "string") return body.error;
  if (body.error && typeof body.error === "object") {
    const message = (body.error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "We couldn't activate your account. Please try again.";
}

function getErrorCode(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const error = (payload as { error?: unknown }).error;
  return error && typeof error === "object" && typeof (error as { code?: unknown }).code === "string"
    ? String((error as { code: string }).code)
    : "";
}

export default function ActivateAccountPage() {
  const params = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<ActivationState>("form");
  const passwordLongEnough = password.length >= 12;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (!passwordLongEnough) { setError("Use at least 12 characters."); return; }
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/hrms/identity/invitations/${encodeURIComponent(params.token)}/accept`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }),
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        if (getErrorCode(data) === "INVITATION_INVALID") setState("unavailable");
        throw new Error(getErrorMessage(data));
      }
      setState("done");
    } catch (activationError) {
      setError(activationError instanceof Error ? activationError.message : "We couldn't activate your account. Please try again.");
    } finally { setSaving(false); }
  }

  return <main className="flex min-h-[calc(100vh-210px)] items-center bg-[#f6f7f9] px-4 py-12 text-[#152033] sm:px-6 sm:py-16 lg:px-12 lg:py-20">
    <section className="mx-auto grid w-full max-w-[1200px] overflow-hidden rounded-2xl border border-[#dfe3e8] bg-white lg:grid-cols-[.92fr_1.08fr]">
      <div className="border-b border-[#dfe3e8] bg-[#f8fafc] p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#0075de]"><ShieldCheck size={20}/></div>
        <p className="mt-8 text-[10px] font-bold uppercase tracking-[.18em] text-[#0075de]">GrowXLabs</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#101828] sm:text-4xl">Employee Workspace</h1>
        <div className="mt-8 border-t border-[#dfe3e8] pt-7">
          <h2 className="text-xl font-extrabold text-[#101828]">Welcome to GrowXLabs</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#596579]">Your employee account is ready to be activated. Create your password to access your GrowXLabs workspace.</p>
        </div>
        <div className="mt-9 rounded-lg border border-[#dfe3e8] bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#667085]">Secure employee access</p>
          <p className="mt-2 text-xs leading-5 text-[#596579]">This invitation is personal to you. Choose a password you do not use elsewhere and never share your activation link.</p>
        </div>
      </div>

      <div className="flex min-h-[560px] items-start p-7 sm:p-10 lg:min-h-[520px] lg:p-14">
        {state === "done" ? <div className="w-full text-center" aria-live="polite">
          <CheckCircle2 className="mx-auto text-emerald-600" size={38}/>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-[#101828]">Account activated</h2>
          <p className="mt-3 text-sm text-[#596579]">Your GrowXLabs workspace is ready.</p>
          <Link href="/login" className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-[#0075de] px-6 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:ring-offset-2">Continue to sign in</Link>
        </div> : state === "unavailable" ? <div className="w-full pt-2 text-center lg:pt-0" role="alert">
          <CircleAlert className="mx-auto text-amber-600" size={36}/>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-[#101828]">Activation link unavailable</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#596579]">This activation link is invalid or has expired.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#596579]">Contact your GrowXLabs administrator for a new invitation.</p>
          <Link href="/login" className="mt-8 inline-flex h-11 items-center justify-center rounded-lg border border-[#cfd5dd] bg-white px-6 text-xs font-bold text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:ring-offset-2">Continue to sign in</Link>
        </div> : <div className="w-full max-w-[560px]">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#0075de]">Identity activation</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-[#101828]">Activate your account</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#596579]">Create a secure password to finish setting up your GrowXLabs employee workspace.</p>
          {error && <div id="activation-error" role="alert" className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold leading-5 text-red-700"><CircleAlert className="mt-0.5 shrink-0" size={14}/><span>{error}</span></div>}
          <form onSubmit={submit} className="mt-8 space-y-5" aria-describedby={error ? "activation-error" : undefined}>
            <div>
              <label htmlFor="activation-password" className="block text-[10px] font-bold uppercase tracking-wider text-[#475467]">Password</label>
              <div className="relative mt-2">
                <input id="activation-password" type={showPassword ? "text" : "password"} autoComplete="new-password" required value={password} onChange={event=>setPassword(event.target.value)} aria-describedby="password-requirements" className="h-12 w-full rounded-lg border border-[#cfd5dd] bg-white px-3 pr-11 text-sm text-[#101828] outline-none transition focus:border-[#0075de] focus:ring-2 focus:ring-blue-100"/>
                <button type="button" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#667085] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0075de]">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
              </div>
              <div id="password-requirements" className={`mt-3 flex items-center gap-2 text-xs ${passwordLongEnough ? "text-emerald-700" : "text-[#667085]"}`}><span className={`flex h-4 w-4 items-center justify-center rounded-full border ${passwordLongEnough ? "border-emerald-600 bg-emerald-50" : "border-[#cfd5dd]"}`}>{passwordLongEnough && <Check size={10}/>}</span>At least 12 characters</div>
            </div>
            <div>
              <label htmlFor="activation-confirm" className="block text-[10px] font-bold uppercase tracking-wider text-[#475467]">Confirm password</label>
              <div className="relative mt-2">
                <input id="activation-confirm" type={showConfirm ? "text" : "password"} autoComplete="new-password" required value={confirm} onChange={event=>setConfirm(event.target.value)} className="h-12 w-full rounded-lg border border-[#cfd5dd] bg-white px-3 pr-11 text-sm text-[#101828] outline-none transition focus:border-[#0075de] focus:ring-2 focus:ring-blue-100"/>
                <button type="button" onClick={()=>setShowConfirm(value=>!value)} aria-label={showConfirm ? "Hide confirmed password" : "Show confirmed password"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#667085] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0075de]">{showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
              </div>
            </div>
            <button disabled={saving} aria-busy={saving} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#0075de] text-xs font-bold text-white transition hover:bg-[#0068c5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">{saving && <Loader2 size={14} className="animate-spin"/>}{saving ? "Activating account…" : "Activate account"}</button>
          </form>
        </div>}
      </div>
    </section>
  </main>;
}
