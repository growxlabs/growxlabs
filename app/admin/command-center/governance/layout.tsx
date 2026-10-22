import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { GovernanceNav } from "./GovernanceNav";

export default async function GovernanceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] antialiased selection:bg-blue-600/30 selection:text-blue-200">
      {/* Top Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#09090b]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          {/* Breadcrumbs & Status */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <Link
              href="/admin/command-center"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 font-medium text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all shadow-xs"
            >
              <ArrowLeft size={13} />
              <span>Command Center</span>
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-blue-400 tracking-wide">
              <ShieldCheck size={14} className="text-blue-400" />
              <span>Governance</span>
            </span>
            <span className="hidden sm:inline-block text-zinc-700">•</span>
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>Cryptographic Chain Active</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <GovernanceNav />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-zinc-800/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-sans flex items-center gap-2.5">
              <span>Command Governance & Security</span>
              <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-normal">
                v1.0
              </span>
            </h1>
            <p className="mt-1 text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Real-time policy enforcement, human-in-the-loop approvals, and tamper-evident SHA-256 hash-chained audit streams.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
            <Lock size={12} className="text-zinc-400" />
            <span>Tenant Isolation: Enforced</span>
          </div>
        </div>

        <div className="min-h-[500px]">
          {children}
        </div>
      </main>
    </div>
  );
}
