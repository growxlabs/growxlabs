"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Bell, BookOpen, BriefcaseBusiness, CircleUserRound, Home, LogOut, Menu, UsersRound, X } from "lucide-react";
import { useState } from "react";

type Item = { href: string; label: string; capability: string; icon: typeof Home; disabled?: boolean };
const items: Item[] = [
  { href: "/workspace", label: "Home", capability: "workspace.home", icon: Home },
  { href: "/workspace/work", label: "My Work", capability: "workspace.work", icon: BriefcaseBusiness },
  { href: "/workspace/sales", label: "Sales", capability: "sales.workspace", icon: UsersRound },
  { href: "/workspace/resources", label: "Resources", capability: "employee.resources", icon: BookOpen },
  { href: "/workspace/employment", label: "My Employment", capability: "employee.profile", icon: CircleUserRound },
  { href: "/workspace/notifications", label: "Notifications", capability: "workspace.home", icon: Bell },
  { href: "/workspace/account", label: "Account", capability: "workspace.home", icon: CircleUserRound },
];
export function WorkspaceNav({ name, role, permissions, unreadCount=0 }: { name: string; role: string; permissions: string[]; unreadCount?:number }) {
  const pathname = usePathname(); const [open, setOpen] = useState(false); const allowed = new Set(permissions);
  const nav = <><div className="border-b border-slate-200 px-5 py-6"><Link href="/workspace" className="text-base font-semibold tracking-tight text-slate-950">GrowXLabs</Link><p className="mt-1 text-xs text-slate-500">Employee workspace</p></div><nav aria-label="Employee workspace" className="flex-1 space-y-1 px-3 py-5">{items.filter(item => allowed.has(item.capability)).map(item => { const Icon=item.icon; const active=item.href!=="#"&&(pathname===item.href||pathname.startsWith(item.href+"/")); return item.disabled?<span key={item.label} aria-disabled="true" className="flex cursor-not-allowed items-center gap-3 px-3 py-2.5 text-sm text-slate-400"><Icon className="h-4 w-4"/>{item.label}<span className="ml-auto text-[10px] uppercase tracking-wider">Soon</span></span>:<Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${active?"bg-slate-100 font-medium text-slate-950":"text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}><Icon className="h-4 w-4"/>{item.label}{item.href==="/workspace/notifications"&&unreadCount>0&&<span aria-label={`${unreadCount} unread notifications`} className="ml-auto rounded-full bg-blue-700 px-2 py-0.5 text-[10px] font-semibold text-white">{unreadCount>99?"99+":unreadCount}</span>}</Link>})}</nav><div className="border-t border-slate-200 p-4"><p className="truncate text-sm font-medium text-slate-900">{name}</p><p className="truncate text-xs text-slate-500">{role}</p><button onClick={()=>void signOut({callbackUrl:"/login"})} className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-950"><LogOut className="h-3.5 w-3.5"/>Sign out</button></div></>;
  return <><button aria-label="Open navigation" onClick={()=>setOpen(true)} className="fixed left-4 top-4 z-40 rounded-md border border-slate-200 bg-white p-2 text-slate-700 shadow-sm md:hidden"><Menu className="h-5 w-5"/></button><aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">{nav}</aside>{open&&<div className="fixed inset-0 z-50 md:hidden"><button aria-label="Close navigation overlay" className="absolute inset-0 bg-slate-950/30" onClick={()=>setOpen(false)}/><aside className="relative flex h-full w-72 flex-col bg-white shadow-xl"><button aria-label="Close navigation" onClick={()=>setOpen(false)} className="absolute right-3 top-3 p-2"><X className="h-5 w-5"/></button>{nav}</aside></div>}</>;
}
