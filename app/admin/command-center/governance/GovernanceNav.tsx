"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, FileText, History } from "lucide-react";
import { cn } from "@/lib/utils";

export function GovernanceNav() {
  const pathname = usePathname();

  const links = [
    {
      href: "/admin/command-center/governance/approvals",
      label: "Approvals",
      icon: CheckSquare,
    },
    {
      href: "/admin/command-center/governance/policies",
      label: "Policies",
      icon: FileText,
    },
    {
      href: "/admin/command-center/governance/audit",
      label: "Audit Ledger",
      icon: History,
    },
  ];

  return (
    <nav
      aria-label="Governance Navigation"
      className="inline-flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/80 p-1 shadow-inner backdrop-blur-md"
    >
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 select-none",
              isActive
                ? "bg-zinc-800/90 text-white shadow-xs border border-zinc-700/60 font-semibold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent"
            )}
          >
            <Icon size={13} className={isActive ? "text-blue-400" : "text-zinc-500"} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
