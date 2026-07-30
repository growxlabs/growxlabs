import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export default async function GovernanceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Command Center</p>
            <h1 className="mt-2 text-3xl font-semibold">Governance</h1>
            <p className="mt-2 text-sm text-slate-500">Policy decisions, human approvals, and tamper-evident audit history.</p>
          </div>
          <nav className="flex gap-2 text-sm">
            <Link className="rounded-lg px-3 py-2 text-slate-500 hover:bg-white" href="/admin/command-center">← Command Center</Link>
            <Link className="rounded-lg border border-slate-200 bg-white px-4 py-2 hover:border-blue-300" href="/admin/command-center/governance/approvals">Approvals</Link>
            <Link className="rounded-lg border border-slate-200 bg-white px-4 py-2 hover:border-blue-300" href="/admin/command-center/governance/policies">Policies</Link>
            <Link className="rounded-lg border border-slate-200 bg-white px-4 py-2 hover:border-blue-300" href="/admin/command-center/governance/audit">Audit</Link>
          </nav>
        </div>
        {children}
      </div>
    </main>
  );
}
