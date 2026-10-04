"use client";

import { useState, useEffect } from "react";
import { Search, X, Command, ArrowRight, LayoutDashboard, Users, FolderKanban, DollarSign, UserCheck, Megaphone, LifeBuoy, BarChart3, Cpu, Settings, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  name: string;
  workspace: string;
  href: string;
  icon: any;
}

const COMMAND_ITEMS: CommandItem[] = [
  { id: "c1", name: "Executive Platform Dashboard", workspace: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { id: "c2", name: "CRM Deals & Pipeline", workspace: "CRM", href: "/admin/crm", icon: Users },
  { id: "c3", name: "Project Management Board", workspace: "Projects", href: "/admin/pm", icon: FolderKanban },
  { id: "c4", name: "Finance Invoices & Revenue", workspace: "Finance", href: "/admin/finance", icon: DollarSign },
  { id: "c5", name: "HRMS Employees & Payroll", workspace: "HRMS", href: "/admin/hrms", icon: UserCheck },
  { id: "c6", name: "Marketing Campaigns & Funnels", workspace: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { id: "c7", name: "Customer Support Desk & SLAs", workspace: "Support", href: "/admin/support", icon: LifeBuoy },
  { id: "c8", name: "Analytics Executive Dashboards", workspace: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { id: "c9", name: "AI Command Center & Agent Studio", workspace: "Command Center", href: "/admin/command-center", icon: Cpu },
  { id: "c10", name: "Administration & Security Setup", workspace: "Administration", href: "/admin/settings", icon: Settings }
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredItems = COMMAND_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.workspace.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-white/5">
          <Search className="h-5 w-5 text-neutral-400 mr-3 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search workspace... (Esc to close)"
            className="w-full bg-transparent border-0 text-white placeholder-neutral-500 font-medium text-sm focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    router.push(item.href);
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{item.name}</h4>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider">{item.workspace} Workspace</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-500" />
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-neutral-500 text-xs font-medium">
              No matching commands or workspace items found.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/10 bg-black/20 text-[10px] text-neutral-400 font-medium">
          <span>Navigation: Use ↑ ↓ to navigate</span>
          <span className="flex items-center gap-1"><Command className="h-3 w-3" /> K to toggle</span>
        </div>

      </div>
    </div>
  );
}
