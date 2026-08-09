import { ShieldCheck } from "lucide-react";

export function ActivationHeader() {
  return <header className="h-16 border-b border-slate-200 bg-white"><div className="mx-auto flex h-full max-w-6xl items-center justify-between px-5 sm:px-8"><span className="text-base font-semibold tracking-tight text-slate-900">GrowXLabs</span><span className="flex items-center gap-2 text-xs font-medium text-slate-500"><ShieldCheck size={15} className="text-[#0075de]"/>Secure employee access</span></div></header>;
}
