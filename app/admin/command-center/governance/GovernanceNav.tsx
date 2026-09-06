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
      label: "Audit",
      icon: History,
    },
  ];

  return (
    <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141416] border border-[#27272a] shadow-xs">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all",
              isActive
                ? "bg-white/10 text-white shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon size={14} className={isActive ? "text-blue-400" : "text-zinc-500"} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
