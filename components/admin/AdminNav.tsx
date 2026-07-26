"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/navigation-client";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  BarChart3, Users, Target, Inbox, Terminal, FileText, Zap, ShieldCheck, Rocket,
  BookOpen, CreditCard, ClipboardList, PenTool, TicketPercent, ListOrdered,
  Database, UserCog, Settings, Menu, X, Gamepad2, Video, Mail, Presentation,
  UserCheck, KeyRound, Eye, EyeOff, Loader2, CheckCircle, Sun, Moon, Monitor,
  Building2, DollarSign, Briefcase, Clock, Bug, Wallet, Brain, UserPlus,
  CalendarCheck, CalendarOff, Receipt, Sparkles, Megaphone, LifeBuoy, Cpu, LogOut,
  ChevronDown, ChevronRight, GraduationCap, Award
} from "lucide-react";

const InstagramNavIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export interface NavGroup {
  id: string;
  title: string;
  icon: any;
  items: {
    name: string;
    href: string;
    icon: any;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "overview",
    title: "Overview",
    icon: BarChart3,
    items: [
      { name: "Dashboard", href: "/admin", icon: BarChart3 },
      { name: "Command Center", href: "/admin/command-center", icon: Terminal },
    ]
  },
  {
    id: "crm",
    title: "Customer & Sales",
    icon: Database,
    items: [
      { name: "CRM Hub", href: "/admin/crm", icon: Database },
      { name: "Companies", href: "/admin/companies", icon: Building2 },
      { name: "Contacts", href: "/admin/contacts", icon: Users },
      { name: "Deals Pipeline", href: "/admin/deals", icon: DollarSign },
      { name: "Leads", href: "/admin/leads", icon: Target },
      { name: "Lead Research", href: "/admin/leads/scrape", icon: Zap },
      { name: "Lead Enrichment", href: "/admin/apollo", icon: Rocket },
      { name: "Products", href: "/admin/products", icon: FileText },
      { name: "Quotations", href: "/admin/quotations", icon: FileText },
      { name: "Invoices", href: "/admin/invoices", icon: ClipboardList },
      { name: "Proposals", href: "/admin/proposals", icon: FileText },
      { name: "Agreements", href: "/admin/agreements", icon: ShieldCheck },
      { name: "Client Accounts", href: "/admin/clients", icon: Users },
      { name: "Outreach", href: "/admin/outreach", icon: Inbox },
      { name: "GrowX Email", href: "/admin/growx-email", icon: Mail },
      { name: "Presentation Builder", href: "/admin/pitch-deck", icon: Presentation },
      { name: "Client Onboarding", href: "/admin/onboarding", icon: Rocket },
      { name: "Workflows", href: "/admin/workflows", icon: Zap },
    ]
  },
  {
    id: "pm",
    title: "Projects & Delivery",
    icon: Briefcase,
    items: [
      { name: "Projects", href: "/admin/pm/projects", icon: Briefcase },
      { name: "Sprints", href: "/admin/pm/sprints", icon: Zap },
      { name: "Workload", href: "/admin/pm/workload", icon: Users },
      { name: "Timesheets", href: "/admin/pm/timesheets", icon: Clock },
      { name: "Bugs", href: "/admin/pm/bugs", icon: Bug },
      { name: "Project Assistant", href: "/admin/pm/ai-copilot", icon: Sparkles },
    ]
  },
  {
    id: "finance",
    title: "Finance & Accounts",
    icon: Wallet,
    items: [
      { name: "Financial Overview", href: "/admin/finance/dashboard", icon: BarChart3 },
      { name: "Sales Invoices", href: "/admin/finance/invoices", icon: ClipboardList },
      { name: "Expenses", href: "/admin/finance/expenses", icon: Wallet },
      { name: "Ledger Accounts", href: "/admin/finance/accounts", icon: Database },
      { name: "Reports", href: "/admin/finance/reports", icon: FileText },
      { name: "AI Helper", href: "/admin/finance/ai-helper", icon: Brain },
    ]
  },
  {
    id: "hrms",
    title: "People Operations",
    icon: Users,
    items: [
      { name: "People Overview", href: "/admin/hrms/dashboard", icon: BarChart3 },
      { name: "Employees", href: "/admin/hrms/employees", icon: Users },
      { name: "Recruitment", href: "/admin/hrms/recruitment", icon: UserPlus },
      { name: "Attendance", href: "/admin/hrms/attendance", icon: CalendarCheck },
      { name: "Leaves", href: "/admin/hrms/leaves", icon: CalendarOff },
      { name: "Payroll", href: "/admin/hrms/payroll", icon: Receipt },
      { name: "Recruiting Assistant", href: "/admin/hrms/ai-recruiter", icon: Sparkles },
      { name: "Sales Team Onboarding", href: "/admin/employee-onboarding", icon: UserCheck },
    ]
  },
  {
    id: "marketing",
    title: "Growth & Marketing",
    icon: Megaphone,
    items: [
      { name: "Marketing Hub", href: "/admin/marketing", icon: Megaphone },
      { name: "Carousel Creator", href: "/admin/instagram-carousel", icon: InstagramNavIcon },
      { name: "Editorial Carousel", href: "/admin/editorial-carousel", icon: FileText },
      { name: "Reels Creator", href: "/admin/reels-creator", icon: Video },
    ]
  },
  {
    id: "support",
    title: "Customer Support",
    icon: LifeBuoy,
    items: [
      { name: "Support Hub", href: "/admin/support", icon: LifeBuoy },
    ]
  },
  {
    id: "ai",
    title: "Intelligent Tools",
    icon: Cpu,
    items: [
      { name: "Intelligent Workspace", href: "/admin/ai-platform", icon: Cpu },
    ]
  },
  {
    id: "academy",
    title: "Learning & Commerce",
    icon: BookOpen,
    items: [
      { name: "Courses", href: "/admin/academy/courses", icon: BookOpen },
      { name: "Assessments", href: "/admin/academy/assessments", icon: PenTool },
      { name: "Students", href: "/admin/academy/users", icon: GraduationCap },
      { name: "Certificates", href: "/admin/academy/certificates", icon: Award },
      { name: "Coupons", href: "/admin/monetization/coupons", icon: TicketPercent },
      { name: "Orders", href: "/admin/monetization/orders", icon: ListOrdered },
    ]
  },
  {
    id: "admin",
    title: "Administration",
    icon: Settings,
    items: [
      { name: "Settings & Security", href: "/admin/settings", icon: Settings },
      { name: "Team & Access", href: "/admin/team", icon: UserCog },
      { name: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    ]
  }
];

interface AdminNavProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

export function AdminNav({ isCollapsed, onToggle, isMobileOpen, onMobileToggle }: AdminNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isCrmAgent = role === "crm_agent";
  const allowedPaths = (session?.user as any)?.allowed_paths || [];
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  // Track open accordion sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    overview: true,
    crm: false,
    pm: false,
    finance: false,
    hrms: false,
    marketing: false,
    support: false,
    ai: false,
    academy: false,
    admin: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const activeGroup = NAV_GROUPS.find(group =>
      group.items.some(item => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)))
    );
    if (activeGroup) {
      setOpenSections(prev => ({ ...prev, [activeGroup.id]: true }));
    }
  }, [pathname]);

  useEffect(() => {
    if (mounted && theme) {
      updateThemeClass(theme);
    }
  }, [mounted, theme]);

  const updateThemeClass = (newTheme: string) => {
    if (typeof window === "undefined") return;
    const html = document.documentElement;
    if (newTheme === "dark") {
      html.classList.add("dark");
      html.classList.remove("light");
    } else if (newTheme === "light") {
      html.classList.add("light");
      html.classList.remove("dark");
    } else {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemDark) {
        html.classList.add("dark");
        html.classList.remove("light");
      } else {
        html.classList.add("light");
        html.classList.remove("dark");
      }
    }
  };

  // Change Password Modal State
  const [showPwModal, setShowPwModal] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleChangePassword = async () => {
    setPwError("");
    if (!currentPw) { setPwError("Enter your current password."); return; }
    if (newPw.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (newPw !== confirmPw) { setPwError("New passwords do not match."); return; }
    setPwLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setPwSuccess(true);
      setTimeout(() => {
        setShowPwModal(false);
        setPwSuccess(false);
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
      }, 1800);
    } catch (e: any) {
      setPwError(e.message);
    } finally {
      setPwLoading(false);
    }
  };

  const isPathAllowed = (itemHref: string) => {
    if (itemHref.startsWith("/admin/pm") || itemHref.startsWith("/admin/finance") || itemHref.startsWith("/admin/marketing") || itemHref.startsWith("/admin/support") || itemHref.startsWith("/admin/ai-platform")) {
      return true;
    }
    return allowedPaths.some((p: string) => {
      if (p === "/admin") return itemHref === "/admin";
      if (p === "/admin/leads/scrape") return itemHref === "/admin/leads/scrape";
      if (p === "/admin/leads") return itemHref.startsWith("/admin/leads") && !itemHref.startsWith("/admin/leads/scrape");
      return itemHref === p || itemHref.startsWith(p + "/");
    });
  };

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderLink = (item: { name: string; href: string; icon: any }, isMobile = false) => {
    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        title={isCollapsed && !isMobile ? item.name : ""}
        aria-current={isActive ? "page" : undefined}
        onClick={() => {
          if (isMobileOpen) onMobileToggle();
        }}
        className={cn(
          "flex items-center h-8 px-2.5 rounded-md transition-all duration-150 group relative border border-transparent text-xs",
          isActive
            ? "bg-[#0075de]/10 text-[#0075de] dark:text-blue-400 font-bold border-[#0075de]/20 shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)]",
          isCollapsed && !isMobile && "lg:justify-center lg:px-0"
        )}
      >
        <Icon className={cn(
          "h-3.5 w-3.5 shrink-0 transition-colors",
          isActive ? "text-[#0075de] dark:text-blue-400" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]",
          (!isCollapsed || isMobile) && "mr-2.5"
        )} />

        <span className={cn(
          "font-medium tracking-tight whitespace-nowrap truncate",
          isCollapsed && !isMobile ? "lg:hidden" : "block"
        )}>
          {item.name}
        </span>

        {isActive && (
          <div className={cn(
            "absolute bg-[#0075de] rounded-r-sm left-0 top-1/2 -translate-y-1/2 w-[3px] h-3.5",
            isCollapsed && !isMobile ? "lg:h-3.5 lg:w-1" : ""
          )} />
        )}
      </Link>
    );
  };

  const renderNavContent = (isMobile = false) => (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-[var(--surface-2)] text-[var(--text-primary)] transition-colors duration-300">
      
      {/* Sidebar Header */}
      <div className={cn(
        "h-14 flex items-center px-4 shrink-0 bg-transparent justify-between border-b border-slate-100 dark:border-[var(--border-subtle)]",
        isCollapsed && !isMobile ? "lg:px-0 lg:justify-center" : ""
      )}>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-[#0075de]/10 border border-[#0075de]/20 rounded-lg flex items-center justify-center shrink-0">
            <ShieldCheck className="text-[#0075de] h-4 w-4" />
          </div>
          <div className={cn(
            "flex flex-col overflow-hidden whitespace-nowrap",
            isCollapsed && !isMobile ? "lg:hidden" : ""
          )}>
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)] leading-none">
              GrowX<span className="text-[#0075de]">Labs</span>
            </span>
            <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.15em] mt-0.5">
              Enterprise Operating System
            </span>
          </div>
        </div>

        {/* Mobile close button inside header */}
        {isMobile && (
          <button
            onClick={onMobileToggle}
            className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-[var(--surface-1)] border border-slate-200 dark:border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-3 px-2.5 space-y-3">
        {NAV_GROUPS.map((group) => {
          const visibleItems = isCrmAgent
            ? group.items.filter(item => isPathAllowed(item.href))
            : group.items;

          if (visibleItems.length === 0) return null;

          const isOpen = openSections[group.id] ?? true;
          const GroupIcon = group.icon;

          return (
            <div key={group.id} className="space-y-0.5">
              {/* Group Header */}
              <button
                onClick={() => toggleSection(group.id)}
                aria-expanded={isOpen}
                aria-controls={`admin-nav-${group.id}`}
                className={cn(
                  "w-full flex items-center justify-between h-7 px-2.5 rounded-md text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-50 transition-all cursor-pointer select-none",
                  isCollapsed && !isMobile ? "lg:hidden" : ""
                )}
              >
                <div className="flex items-center gap-2">
                  <GroupIcon size={12} className="text-[#94A3B8]" />
                  <span>{group.title}</span>
                </div>
                <ChevronDown size={12} className={cn("transition-transform duration-200", isOpen ? "" : "-rotate-90")} />
              </button>

              {/* Group Items */}
              {(isOpen || (isCollapsed && !isMobile)) && (
                <div id={`admin-nav-${group.id}`} className="space-y-0.5 pl-1">
                  {visibleItems.map(item => renderLink(item, isMobile))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Area */}
      <div className={cn(
        "py-3 border-t border-slate-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--surface-2)] space-y-2 shrink-0",
        isCollapsed && !isMobile ? "lg:px-2 px-3" : "px-3"
      )}>
        {/* Theme Switcher */}
        <div className={cn(
          "flex items-center bg-slate-100 dark:bg-[var(--surface-1)] border border-slate-200 dark:border-[var(--border-subtle)] rounded-lg p-0.5 transition-all w-full h-8",
          isCollapsed && !isMobile ? "justify-center mx-auto w-8" : ""
        )}>
          {!mounted ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--text-muted)]" />
            </div>
          ) : isCollapsed && !isMobile ? (
            <button
              onClick={() => {
                const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
                setTheme(nextTheme);
                updateThemeClass(nextTheme);
              }}
              className="flex items-center justify-center w-7 h-7 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md transition-all cursor-pointer"
              title={`Theme: ${theme}`}
              aria-label={`Theme: ${theme}. Change theme`}
            >
              {theme === 'light' && <Sun size={13} />}
              {theme === 'dark' && <Moon size={13} />}
              {theme === 'system' && <Monitor size={13} />}
            </button>
          ) : (
            <div className="flex w-full h-full gap-0.5">
              {(['light', 'dark', 'system'] as const).map((t) => {
                const isActive = theme === t;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setTheme(t);
                      updateThemeClass(t);
                    }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer h-full px-1",
                      isActive 
                        ? "bg-white text-[#0075de] dark:bg-[var(--surface-2)] dark:text-white border border-slate-200 dark:border-[var(--border-subtle)] shadow-xs font-black" 
                        : "text-[#64748B] hover:text-[#0F172A]"
                    )}
                  >
                    {t === 'light' && <Sun size={10} />}
                    {t === 'dark' && <Moon size={10} />}
                    {t === 'system' && <Monitor size={10} />}
                    <span>{t}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Change Password */}
        <button
          onClick={() => { setPwError(""); setPwSuccess(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); setShowPwModal(true); }}
          className={cn(
            "w-full flex items-center h-8 px-2.5 rounded-lg text-slate-600 dark:text-[var(--text-secondary)] hover:text-[#0075de] hover:bg-[#0075de]/5 transition-all text-left group text-xs",
            isCollapsed && !isMobile && "lg:justify-center lg:px-0"
          )}
        >
          <KeyRound className={cn("h-3.5 w-3.5 shrink-0 transition-colors group-hover:text-[#0075de]", (!isCollapsed || isMobile) && "mr-2.5")} />
          <span className={cn(
            "font-bold uppercase tracking-wider text-[10px]",
            isCollapsed && !isMobile ? "lg:hidden" : ""
          )}>Change Password</span>
        </button>

        {/* Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "w-full flex items-center h-8 px-2.5 rounded-lg text-slate-600 dark:text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/5 transition-all text-left group text-xs",
            isCollapsed && !isMobile && "lg:justify-center lg:px-0"
          )}
        >
          <LogOut className={cn("h-3.5 w-3.5 shrink-0 transition-colors group-hover:text-red-500", (!isCollapsed || isMobile) && "mr-2.5")} />
          <span className={cn(
            "font-bold uppercase tracking-wider text-[10px]",
            isCollapsed && !isMobile ? "lg:hidden" : ""
          )}>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ═══ MOBILE TOP NAVBAR ═══ */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-[100] h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-[#0075de]/10 border border-[#0075de]/20 rounded-lg flex items-center justify-center shrink-0">
            <ShieldCheck className="text-[#0075de] h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-[#0F172A] leading-none">
              GrowX<span className="text-[#0075de]">Labs</span>
            </span>
            <span className="text-[8px] font-bold text-[#64748B] uppercase tracking-[0.15em] mt-0.5">
              Admin Platform
            </span>
          </div>
        </div>

        <button
          onClick={onMobileToggle}
          className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0F172A] hover:bg-slate-200 transition-all cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* ═══ MOBILE DRAWER BACKDROP ═══ */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] transition-opacity duration-300"
          onClick={onMobileToggle}
        />
      )}

      {/* ═══ MOBILE DRAWER SIDEBAR ═══ */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 h-full w-[280px] bg-white border-r border-slate-200 z-[210] transition-transform duration-300 ease-in-out shadow-2xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {renderNavContent(true)}
      </aside>

      {/* ═══ DESKTOP FIXED SIDEBAR ═══ */}
      <aside 
        className={cn(
          "hidden lg:flex h-screen border-r border-slate-200 bg-white flex-col fixed left-0 top-0 transition-all duration-300 ease-in-out z-[90] overflow-visible",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {renderNavContent(false)}

        {/* Desktop Collapse Toggle Button (Prominent Floating Badge) */}
        <button 
          onClick={onToggle}
          className="absolute top-5 -right-3.5 h-7 w-7 rounded-full bg-white text-[#0F172A] flex items-center justify-center border border-slate-300 z-[120] shadow-md hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <ChevronRight className={cn("h-4 w-4 text-[#0075de] transition-transform duration-300", isCollapsed ? "" : "rotate-180")} />
        </button>
      </aside>

      {/* ═══ CHANGE PASSWORD MODAL ═══ */}
      {showPwModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border-subtle)] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowPwModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
              <div className="p-2 bg-[#0075de]/10 text-[#0075de] rounded-lg">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Change Password</h3>
                <p className="text-xs text-neutral-400">Update your account access credentials.</p>
              </div>
            </div>

            {pwSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-2">
                <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-emerald-400">Password Updated Successfully!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pwError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl">
                    {pwError}
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase text-neutral-400 mb-1 block">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 px-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl text-sm text-white focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-white"
                    >
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-neutral-400 mb-1 block">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full h-10 px-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl text-sm text-white focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-white"
                    >
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-neutral-400 mb-1 block">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full h-10 px-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPwModal(false)}
                    className="flex-1 h-10 border border-[var(--border-subtle)] rounded-xl text-xs font-bold text-neutral-400 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={pwLoading}
                    className="flex-1 h-10 bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center"
                  >
                    {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
