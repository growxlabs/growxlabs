"use client";

import { Link, usePathname } from "@/navigation-client";
import { cn } from "@/lib/utils";
import {
  Layout, FileText, CreditCard, Bell, ClipboardList,
  Rocket, LogOut, ShieldCheck
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { name: "Overview", href: "/client/dashboard", icon: Layout },
  { name: "Contracts", href: "/client/agreement", icon: FileText },
  { name: "Billing", href: "/client/invoices", icon: CreditCard },
  { name: "Progress", href: "/client/project", icon: Rocket },
  { name: "Change Requests", href: "/client/change-requests", icon: ClipboardList },
  { name: "Notifications", href: "/client/notifications", icon: Bell },
];

export function ClientNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between bg-white border border-[#e6e6e6] p-2 pl-5 pr-2 rounded-md mb-8 shadow-sm">
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
        {/* Logo/Brand for Client Portal */}
        <div className="flex items-center gap-2 shrink-0 pr-4 border-r border-[#e6e6e6]">
           <div className="w-6 h-6 bg-[#f6f5f4] border border-[#e6e6e6] rounded-md flex items-center justify-center">
              <ShieldCheck className="text-[#0075de]" size={14} />
           </div>
           <span className="text-sm font-bold tracking-tight text-neutral-900 hidden sm:block">Client Suite</span>
        </div>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-1.5 rounded-md transition-all whitespace-nowrap group",
                  isActive
                    ? "bg-[#0075de]/10 text-[#0075de] font-semibold"
                    : "text-[#615d59] hover:text-neutral-900 hover:bg-[#e6e6e6]/50"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 mr-2",
                  isActive ? "text-[#0075de]" : "text-[#615d59] group-hover:text-neutral-950"
                )} />
                <span className="text-[11px] uppercase tracking-wider font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-[#0075de]/5 rounded-md border border-[#0075de]/10">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0075de] animate-pulse" />
          <span className="text-[9px] font-bold text-[#0075de] uppercase tracking-widest">Active Partner</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-2 text-[#615d59] hover:text-red-500 hover:bg-red-500/5 rounded-md transition-all"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
