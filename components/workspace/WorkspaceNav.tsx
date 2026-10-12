"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CircleUserRound,
  Home,
  LogOut,
  Menu,
  UsersRound,
  X,
  CalendarCheck,
  History,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { isHealthcareLeadManager } from "@/lib/employee-os/persona";
import { css, cx } from "@/styled-system/css";

type Item = {
  href: string;
  label: string;
  capability: string;
  icon: typeof Home;
  disabled?: boolean;
};

const genericItems: Item[] = [
  { href: "/workspace", label: "Home", capability: "workspace.home", icon: Home },
  { href: "/workspace/work", label: "My Work", capability: "workspace.work", icon: BriefcaseBusiness },
  { href: "/workspace/sales", label: "Sales", capability: "sales.workspace", icon: UsersRound },
  { href: "/workspace/resources", label: "Resources", capability: "employee.resources", icon: BookOpen },
  { href: "/workspace/employment", label: "My Employment", capability: "employee.profile", icon: CircleUserRound },
  { href: "/workspace/notifications", label: "Notifications", capability: "workspace.home", icon: Bell },
  { href: "/workspace/account", label: "Account", capability: "workspace.home", icon: CircleUserRound },
];

const healthcareItems = [
  { href: "/workspace/h", label: "Home", icon: Home },
  { href: "/workspace/h/leads", label: "Leads", icon: Building2 },
  { href: "/workspace/h/follow-ups", label: "Follow-ups", icon: CalendarCheck },
  { href: "/workspace/h/activity", label: "Activity", icon: History },
];

export function WorkspaceNav({
  name,
  role,
  designation,
  permissions,
  unreadCount = 0,
}: {
  name: string;
  role: string;
  designation?: string | null;
  permissions: string[];
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHealthcare = isHealthcareLeadManager({ designation, role, permissions });

  // --------------------------------------------------------------------------
  // HEALTHCARE LEAD MANAGER NAVIGATION (Panda CSS)
  // --------------------------------------------------------------------------
  if (isHealthcare) {
    const isHealthcareActive = (href: string) => {
      if (href === "/workspace/h") {
        return pathname === "/workspace/h";
      }
      return pathname.startsWith(href);
    };

    return (
      <>
        {/* Mobile Top Header */}
        <header
          className={css({
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 30,
            height: "56px",
            bg: "#FFFFFF",
            borderBottom: "1px solid #E2E8F0",
            px: "16px",
            display: { base: "flex", md: "none" },
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          })}
        >
          <Link
            href="/workspace/h"
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
            })}
          >
            <span className={css({ fontWeight: "600", color: "#020617", fontSize: "14px" })}>GrowXLabs</span>
            <span
              className={css({
                fontSize: "11px",
                fontWeight: "600",
                color: "#2563EB",
                bg: "#EFF6FF",
                px: "6px",
                py: "2px",
                borderRadius: "4px",
              })}
            >
              Healthcare
            </span>
          </Link>
          <div className={css({ display: "flex", alignItems: "center", gap: "12px" })}>
            <span
              className={css({
                fontSize: "12px",
                color: "#475569",
                fontWeight: "500",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "120px",
              })}
            >
              {name.split(" ")[0]}
            </span>
            <button
              onClick={() => void signOut({ callbackUrl: "/login?callbackUrl=/workspace/h" })}
              className={css({
                color: "#94A3B8",
                cursor: "pointer",
                transition: "color 0.15s ease",
                border: "none",
                bg: "transparent",
                _hover: { color: "#334155" },
              })}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className={css({ width: "16px", height: "16px" })} />
            </button>
          </div>
        </header>

        {/* Desktop Sidebar */}
        <aside
          className={css({
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            display: { base: "none", md: "flex" },
            width: "256px",
            flexDirection: "column",
            borderRight: "1px solid #E2E8F0",
            bg: "#FFFFFF",
          })}
        >
          <div className={css({ borderBottom: "1px solid #E2E8F0", px: "20px", py: "24px" })}>
            <Link
              href="/workspace/h"
              className={css({
                fontSize: "16px",
                fontWeight: "600",
                letterSpacing: "-0.01em",
                color: "#020617",
                textDecoration: "none",
              })}
            >
              GrowXLabs
            </Link>
            <p
              className={css({
                mt: "4px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#2563EB",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              })}
            >
              Healthcare
            </p>
          </div>

          <nav
            aria-label="Healthcare workspace"
            className={css({
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              px: "12px",
              py: "20px",
            })}
          >
            {healthcareItems.map((item) => {
              const Icon = item.icon;
              const active = isHealthcareActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    px: "12px",
                    py: "10px",
                    fontSize: "14px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                    bg: active ? "#EFF6FF" : "transparent",
                    color: active ? "#1D4ED8" : "#475569",
                    fontWeight: active ? "600" : "500",
                    _hover: { bg: active ? "#EFF6FF" : "#F8FAFC", color: active ? "#1D4ED8" : "#020617" },
                  })}
                >
                  <Icon className={css({ width: "16px", height: "16px", color: active ? "#1D4ED8" : "#64748B" })} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className={css({ borderTop: "1px solid #E2E8F0", p: "16px" })}>
            <p className={css({ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "14px", fontWeight: "500", color: "#0F172A" })}>
              {name}
            </p>
            <p className={css({ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "12px", fontWeight: "500", color: "#64748B" })}>
              Healthcare Lead Manager
            </p>
            <button
              onClick={() => void signOut({ callbackUrl: "/login?callbackUrl=/workspace/h" })}
              className={css({
                mt: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                fontWeight: "500",
                color: "#475569",
                cursor: "pointer",
                border: "none",
                bg: "transparent",
                transition: "color 0.15s ease",
                _hover: { color: "#020617" },
              })}
            >
              <LogOut className={css({ width: "14px", height: "14px" })} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Bottom Navigation Bar */}
        <nav
          aria-label="Mobile healthcare navigation"
          className={css({
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 40,
            bg: "#FFFFFF",
            borderTop: "1px solid #E2E8F0",
            height: "64px",
            display: { base: "flex", md: "none" },
            alignItems: "center",
            justifyContent: "space-around",
            px: "8px",
            boxShadow: "0 -4px 6px -1px rgba(0,0,0,0.05)",
          })}
        >
          {healthcareItems.map((item) => {
            const Icon = item.icon;
            const active = isHealthcareActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={css({
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  height: "100%",
                  py: "4px",
                  fontSize: "11px",
                  fontWeight: active ? "600" : "500",
                  color: active ? "#1D4ED8" : "#64748B",
                  textDecoration: "none",
                  transition: "color 0.15s ease",
                  _hover: { color: "#020617" },
                })}
              >
                <div
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: "4px",
                    borderRadius: "9999px",
                    mb: "2px",
                    bg: active ? "#EFF6FF" : "transparent",
                    color: active ? "#1D4ED8" : "inherit",
                  })}
                >
                  <Icon className={css({ width: "20px", height: "20px" })} />
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </>
    );
  }

  // --------------------------------------------------------------------------
  // GENERIC EMPLOYEE OS NAVIGATION (Unchanged for standard employees)
  // --------------------------------------------------------------------------
  const allowed = new Set(permissions);
  const nav = (
    <>
      <div className="border-b border-slate-200 px-5 py-6">
        <Link href="/workspace" className="text-base font-semibold tracking-tight text-slate-950">
          GrowXLabs
        </Link>
        <p className="mt-1 text-xs text-slate-500">Employee workspace</p>
      </div>
      <nav aria-label="Employee workspace" className="flex-1 space-y-1 px-3 py-5">
        {genericItems
          .filter((item) => allowed.has(item.capability))
          .map((item) => {
            const Icon = item.icon;
            const active =
              item.href !== "#" &&
              (pathname === item.href || pathname.startsWith(item.href + "/"));
            return item.disabled ? (
              <span
                key={item.label}
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-3 px-3 py-2.5 text-sm text-slate-400"
              >
                <Icon className="h-4 w-4" />
                {item.label}
                <span className="ml-auto text-[10px] uppercase tracking-wider">Soon</span>
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  active
                    ? "bg-slate-100 font-medium text-slate-950"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.href === "/workspace/notifications" && unreadCount > 0 && (
                  <span
                    aria-label={`${unreadCount} unread notifications`}
                    className="ml-auto rounded-full bg-blue-700 px-2 py-0.5 text-[10px] font-semibold text-white"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <p className="truncate text-sm font-medium text-slate-900">{name}</p>
        <p className="truncate text-xs text-slate-500">{designation || role}</p>
        <button
          onClick={() => void signOut({ callbackUrl: "/login?callbackUrl=/workspace" })}
          className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-950"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-md border border-slate-200 bg-white p-2 text-slate-700 shadow-sm md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        {nav}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-slate-950/30"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl">
            <button
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 p-2"
            >
              <X className="h-5 w-5" />
            </button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
