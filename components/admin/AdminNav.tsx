"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/navigation-client";
import { cn } from "@/lib/utils";
import { NavigationFlyout } from "@/components/admin/NavigationFlyout";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  BarChart3, Users, Target, Inbox, Terminal, FileText, Zap, ShieldCheck, Rocket,
  BookOpen, ClipboardList, PenTool, TicketPercent, ListOrdered,
  Database, UserCog, Settings, Menu, X, KeyRound, Eye, EyeOff, Loader2, CheckCircle,
  Sun, Moon, Monitor, Building2, DollarSign, Briefcase, Clock, Bug, Wallet, Brain, UserPlus,
  CalendarCheck, CalendarOff, Receipt, Sparkles, Megaphone, LifeBuoy, Cpu, LogOut,
  ChevronDown, ChevronRight, GraduationCap, Award, Mail, Presentation, UserCheck, Video, Layers3, FileSignature, ClipboardCheck
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
      { name: "Client Assessments", href: "/admin/assessments", icon: ClipboardCheck },
      { name: "Business & Technical Audits", href: "/admin/audits", icon: FileText },
      { name: "AI Solution Reports", href: "/admin/ai-solution-reports", icon: Sparkles },
      { name: "Solution Architectures", href: "/admin/solution-architectures", icon: Layers3 },
      { name: "Scopes of Work", href: "/admin/scopes", icon: ClipboardList },
      { name: "Commercial Proposals", href: "/admin/proposals", icon: FileText },
      { name: "Proposal Approvals", href: "/admin/proposal-approvals", icon: ClipboardCheck },
      { name: "Master Service Agreements", href: "/admin/agreements", icon: FileSignature },
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
      { name: "Project Workspaces", href: "/admin/projects", icon: Layers3 },
      { name: "Change Requests", href: "/admin/change-requests", icon: ClipboardList },
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
      { name: "Consulting Activation", href: "/admin/consulting-finance", icon: Receipt },
    ]
  },
  {
    id: "hrms",
    title: "People Operations",
    icon: Users,
    items: [
      { name: "People Core (New)", href: "/admin/people", icon: ShieldCheck },
      { name: "Departments (New)", href: "/admin/people/departments", icon: Building2 },
      { name: "Designations (New)", href: "/admin/people/designations", icon: Layers3 },
      { name: "My Team (New)", href: "/admin/people/team", icon: Users },
      { name: "People Access (New)", href: "/admin/people/access", icon: KeyRound },
      { name: "Recruiter Workspace (New)", href: "/admin/recruitment", icon: UserPlus },
      { name: "Hiring Operations (New)", href: "/admin/recruitment/operations", icon: ClipboardList },
      { name: "Hiring Manager (New)", href: "/admin/recruitment/manager", icon: Briefcase },
      { name: "Offer Management (New)", href: "/admin/offers", icon: FileSignature },
      { name: "HR Onboarding (New)", href: "/admin/hr-onboarding", icon: ClipboardCheck },
      { name: "Manager Onboarding (New)", href: "/admin/hr-onboarding/manager", icon: UserCheck },
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
  const [desktopFlyout, setDesktopFlyout] = useState<{
    groupId: string;
    top: number;
    trigger: HTMLElement | null;
  } | null>(null);

  // Track open accordion sections on mobile
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

  const visibleItemsForGroup = (group: NavGroup) => (
    isCrmAgent ? group.items.filter(item => isPathAllowed(item.href)) : group.items
  );

  const handleGroupClick = (groupId: string, target: HTMLElement) => {
    if (desktopFlyout?.groupId === groupId) {
      setDesktopFlyout(null);
    } else {
      const rect = target.getBoundingClientRect();
      const maxTop = Math.max(12, window.innerHeight - 520);
      setDesktopFlyout({
        groupId,
        top: Math.max(12, Math.min(rect.top - 8, maxTop)),
        trigger: target,
      });
    }
  };

  const closeDesktopFlyout = (restoreFocus = false) => {
    const trigger = desktopFlyout?.trigger;
    setDesktopFlyout(null);
    if (restoreFocus && trigger) {
      window.requestAnimationFrame(() => trigger.focus());
    }
  };

  const renderLink = (
    item: { name: string; href: string; icon: any },
    isMobile = false,
    isFlyout = false
  ) => {
    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        title={isCollapsed && !isMobile ? item.name : ""}
        aria-current={isActive ? "page" : undefined}
        onClick={() => {
          closeDesktopFlyout(false);
          if (isMobileOpen) onMobileToggle();
        }}
        className={cn(
          "flex items-center h-9 px-3 rounded-xl transition-all duration-150 group relative border border-transparent text-[12px] font-medium select-none",
          isActive
            ? "bg-[#0075de]/10 text-[#0075de] dark:text-blue-400 font-bold border-[#0075de]/10 shadow-xs"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-50 dark:hover:bg-neutral-900/50",
          isCollapsed && !isMobile && "lg:justify-center lg:px-0",
          isFlyout && "h-8.5 rounded-xl px-3 !text-[var(--text-secondary)] hover:!text-[var(--text-primary)] hover:bg-slate-50 dark:hover:bg-neutral-900/80",
          isFlyout && isActive && "!text-[#0075de] bg-[#0075de]/8 border-[#0075de]/10"
        )}
      >
        <Icon className={cn(
          "h-3.5 w-3.5 shrink-0 transition-colors",
          isActive ? "text-[#0075de] dark:text-blue-400" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]",
          (!isCollapsed || isMobile) && "mr-2.5",
          isFlyout && "!text-current"
        )} />

        <span className={cn(
          "whitespace-nowrap truncate",
          isCollapsed && !isMobile ? "lg:hidden" : "block"
        )}>
          {item.name}
        </span>

        {isActive && (
          <div className={cn(
            "absolute bg-[#0075de] rounded-r-md left-0 top-1/2 -translate-y-1/2 w-[3px] h-3.5",
            isCollapsed && !isMobile ? "lg:h-4 lg:w-[3px]" : ""
          )} />
        )}
      </Link>
    );
  };

  const renderNavContent = (isMobile = false) => (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-neutral-950 text-[var(--text-primary)] border-r border-slate-100 dark:border-neutral-900">
      
      {/* Sidebar Header */}
      <div className={cn(
        "h-16 flex items-center px-4.5 shrink-0 justify-between border-b border-slate-100 dark:border-neutral-900/60 bg-transparent",
        isCollapsed && !isMobile ? "lg:px-0 lg:justify-center" : ""
      )}>
        <div className="flex items-center gap-3">
          <div className="h-8.5 w-8.5 bg-[#0075de]/10 border border-[#0075de]/15 rounded-xl flex items-center justify-center shrink-0 shadow-xs dark:bg-blue-500/10 dark:border-blue-500/15">
            <ShieldCheck className="text-[#0075de] dark:text-blue-400 h-4.5 w-4.5" />
          </div>
          <div className={cn(
            "flex flex-col overflow-hidden whitespace-nowrap",
            isCollapsed && !isMobile ? "lg:hidden" : ""
          )}>
            <span className="text-sm font-black tracking-tight text-[var(--text-primary)] leading-none font-sans">
              GrowX<span className="text-[#0075de] dark:text-blue-400">Labs</span>
            </span>
            <span className="text-[7.5px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest mt-1">
              Enterprise Admin OS
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={onMobileToggle}
            className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-4 px-3 space-y-2">
        {NAV_GROUPS.map((group) => {
          const visibleItems = visibleItemsForGroup(group);

          if (visibleItems.length === 0) return null;

          const isOpen = openSections[group.id] ?? true;
          const GroupIcon = group.icon;
          const hasActiveItem = visibleItems.some(item =>
            pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`))
          );
          const isFlyoutOpen = desktopFlyout?.groupId === group.id;

          return (
            <div key={group.id} className="space-y-0.5">
              {/* Group Header */}
              <button
                onClick={(event) => {
                  if (isMobile) {
                    toggleSection(group.id);
                  } else {
                    handleGroupClick(group.id, event.currentTarget);
                  }
                }}
                aria-expanded={isMobile ? isOpen : isFlyoutOpen}
                aria-controls={`admin-nav-${group.id}`}
                className={cn(
                  "w-full flex items-center justify-between rounded-xl font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-50 dark:hover:bg-neutral-900/50 transition-all cursor-pointer select-none border border-transparent",
                  isMobile ? "h-9 px-2.5 text-[11px]" : "h-10 px-3.5 text-[12px]",
                  hasActiveItem && !isMobile && "bg-slate-50 text-slate-900 dark:bg-neutral-900/40 dark:text-white border-slate-100 dark:border-neutral-900",
                  isFlyoutOpen && !isMobile && "bg-[#0075de]/10 text-[#0075de] dark:bg-blue-500/10 dark:text-blue-400 border-[#0075de]/15 shadow-xs",
                  isCollapsed && !isMobile && "lg:justify-center lg:px-0 lg:h-10 lg:w-10 lg:mx-auto"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <GroupIcon size={isCollapsed && !isMobile ? 16 : 14} className="shrink-0" />
                  <span className={cn(isCollapsed && !isMobile && "lg:hidden")}>{group.title}</span>
                </div>
                {isMobile ? (
                  <ChevronDown size={11} className={cn("transition-transform duration-200", isOpen ? "" : "-rotate-90")} />
                ) : (
                  <ChevronRight size={11} className={cn("transition-transform duration-200", isCollapsed && "lg:hidden", isFlyoutOpen && "rotate-90")} />
                )}
              </button>

              {/* Mobile Accordion Drawer */}
              {isMobile && isOpen && (
                <div id={`admin-nav-${group.id}`} className="space-y-0.5 pl-1.5 pt-0.5">
                  {visibleItems.map(item => renderLink(item, isMobile))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Area */}
      <div className={cn(
        "py-4 border-t border-slate-100 dark:border-neutral-900/60 bg-white dark:bg-neutral-950 space-y-2 shrink-0 px-3",
        isCollapsed && !isMobile ? "lg:px-2" : ""
      )}>
        {/* Theme Switcher */}
        <div className={cn(
          "flex items-center bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-900 rounded-xl p-0.5 transition-all w-full h-8",
          isCollapsed && !isMobile ? "justify-center mx-auto w-8" : ""
        )}>
          {!mounted ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="h-3 w-3 animate-spin text-[var(--text-muted)]" />
            </div>
          ) : isCollapsed && !isMobile ? (
            <button
              onClick={() => {
                const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
                setTheme(nextTheme);
                updateThemeClass(nextTheme);
              }}
              className="flex items-center justify-center w-7 h-7 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-all cursor-pointer"
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
                      "flex-1 flex items-center justify-center gap-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer h-full px-1",
                      isActive 
                        ? "bg-white text-[#0075de] dark:bg-neutral-950 dark:text-white border border-slate-100 dark:border-neutral-900/60 shadow-xs font-black" 
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-neutral-200"
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
            "w-full flex items-center h-8.5 px-3 rounded-xl text-slate-500 dark:text-[var(--text-secondary)] hover:text-[#0075de] hover:bg-[#0075de]/5 dark:hover:text-blue-400 dark:hover:bg-blue-400/5 transition-all text-left group text-xs",
            isCollapsed && !isMobile && "lg:justify-center lg:px-0"
          )}
        >
          <KeyRound className={cn("h-3.5 w-3.5 shrink-0 transition-colors group-hover:text-[#0075de] dark:group-hover:text-blue-400", (!isCollapsed || isMobile) && "mr-2.5")} />
          <span className={cn(
            "font-semibold text-[11px]",
            isCollapsed && !isMobile ? "lg:hidden" : ""
          )}>Change Password</span>
        </button>

        {/* Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "w-full flex items-center h-8.5 px-3 rounded-xl text-slate-500 dark:text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/5 transition-all text-left group text-xs",
            isCollapsed && !isMobile && "lg:justify-center lg:px-0"
          )}
        >
          <LogOut className={cn("h-3.5 w-3.5 shrink-0 transition-colors group-hover:text-red-500", (!isCollapsed || isMobile) && "mr-2.5")} />
          <span className={cn(
            "font-semibold text-[11px]",
            isCollapsed && !isMobile ? "lg:hidden" : ""
          )}>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ═══ MOBILE TOP NAVBAR ═══ */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-[100] h-14 bg-white dark:bg-neutral-950 border-b border-slate-100 dark:border-neutral-900 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-[#0075de]/10 border border-[#0075de]/15 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck className="text-[#0075de] dark:text-blue-400 h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-[#0F172A] dark:text-white leading-none">
              GrowX<span className="text-[#0075de] dark:text-blue-400">Labs</span>
            </span>
            <span className="text-[8px] font-bold text-[#64748B] dark:text-neutral-500 uppercase tracking-[0.15em] mt-0.5">
              Admin Platform
            </span>
          </div>
        </div>

        <button
          onClick={onMobileToggle}
          className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 flex items-center justify-center text-[#0F172A] dark:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </header>

      {/* ═══ MOBILE DRAWER BACKDROP ═══ */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-[200] transition-opacity duration-300 animate-in fade-in"
          onClick={onMobileToggle}
        />
      )}

      {/* ═══ MOBILE DRAWER SIDEBAR ═══ */}
      <aside
        className={cn(
          "md:hidden fixed left-0 top-0 h-full w-[280px] z-[210] transition-transform duration-300 ease-in-out shadow-2xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {renderNavContent(true)}
      </aside>

      {/* ═══ DESKTOP FIXED SIDEBAR ═══ */}
      <aside 
        id="admin-sidebar-container"
        className={cn(
          "hidden md:flex h-screen bg-white dark:bg-neutral-950 flex-col fixed left-0 top-0 transition-all duration-300 ease-in-out z-[90] overflow-visible border-r border-slate-100 dark:border-neutral-900",
          isCollapsed ? "w-20" : "w-[272px]"
        )}
      >
        {renderNavContent(false)}

        {/* Desktop Collapse Toggle Button (Prominent Floating Badge) */}
        <button 
          onClick={onToggle}
          className="absolute top-4.5 -right-3.5 h-7 w-7 rounded-full bg-white dark:bg-neutral-900 text-[#0F172A] dark:text-white flex items-center justify-center border border-slate-200 dark:border-neutral-800 z-[120] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <ChevronRight className={cn("h-3.5 w-3.5 text-[#0075de] dark:text-blue-400 transition-transform duration-300", isCollapsed ? "" : "rotate-180")} />
        </button>
      </aside>

      {/* Portal flyout is rendered outside the Admin shell by NavigationFlyout. */}
      {desktopFlyout && (() => {
        const group = NAV_GROUPS.find(item => item.id === desktopFlyout.groupId);
        if (!group) return null;
        const visibleItems = visibleItemsForGroup(group);
        if (visibleItems.length === 0) return null;

        return (
          <NavigationFlyout
            open
            mounted={mounted}
            title={group.title}
            groupId={group.id}
            icon={group.icon}
            left={isCollapsed ? 92 : 284}
            top={desktopFlyout.top}
            sidebarWidth={isCollapsed ? 80 : 272}
            items={visibleItems}
            renderLink={renderLink}
            onClose={closeDesktopFlyout}
          />
        );
      })()}

      {/* ═══ CHANGE PASSWORD MODAL ═══ */}
      {showPwModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[300] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-950 border border-slate-100 dark:border-neutral-900 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowPwModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-neutral-900/60 pb-4">
              <div className="p-2 bg-[#0075de]/10 text-[#0075de] dark:text-blue-400 rounded-xl">
                <KeyRound size={18} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)] text-base">Change Password</h3>
                <p className="text-xs text-slate-400 dark:text-neutral-500">Update your account access credentials.</p>
              </div>
            </div>

            {pwSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-2">
                <CheckCircle className="h-8 w-8 text-emerald-450 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-emerald-450">Password Updated Successfully!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pwError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs font-bold rounded-xl">
                    {pwError}
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-neutral-500 mb-1.5 block">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-9 px-3 bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-2 text-neutral-400 hover:text-[var(--text-primary)]"
                    >
                      {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-neutral-500 mb-1.5 block">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full h-9 px-3 bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-2 text-neutral-400 hover:text-[var(--text-primary)]"
                    >
                      {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-neutral-500 mb-1.5 block">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full h-9 px-3 bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPwModal(false)}
                    className="flex-1 h-9 border border-slate-100 dark:border-neutral-800 rounded-xl text-xs font-bold text-slate-400 dark:text-neutral-500 hover:bg-slate-50 dark:hover:bg-neutral-900 hover:text-[var(--text-primary)] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={pwLoading}
                    className="flex-1 h-9 bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center"
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
