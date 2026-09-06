import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { GovernanceNav } from "./GovernanceNav";

export default async function GovernanceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <main className="min-h-screen bg-[#09090b] text-[#f4f4f5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Top Header & Navigation */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/admin/command-center"
                className="inline-flex items-center gap-1.5 font-medium text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Command Center</span>
              </Link>
              <span className="text-zinc-600">/</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-blue-400 uppercase tracking-wider">
                <ShieldCheck size={13} />
                Governance & Security
              </span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
              Command Governance
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Policy decisions, human-in-the-loop approvals, and tamper-evident audit history.
            </p>
          </div>

          <GovernanceNav />
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          {children}
        </div>
      </div>
    </main>
  );
}
