"use client";

import { useState, useEffect, useRef } from "react";
import { Link, usePathname } from "@/navigation-client";
import { cn } from "@/lib/utils";
import { NavigationFlyout } from "@/components/admin/NavigationFlyout";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  GrowXLogo,
  IconOverview,
  IconTerminal,
  IconCRM,
  IconConsulting,
  IconProjects,
  IconFinance,
  IconPeople,
  IconMarketing,
  IconSupport,
  IconAI,
  IconAcademy,
  IconSettings,
  IconActivity,
  IconFile,
  IconChevronRight,
  IconChevronDown,
  IconChevronLeft,
  IconClose,
  IconSun,
  IconMoon,
  IconMonitor,
  IconKey,
  IconLogOut,
  IconMenu,
  IconUser,
  IconSparkle,
  IconCheckCircle,
  IconShield,
  IconTarget,
  IconZap,
  IconLayers,
  IconEye,
  IconEyeOff,
  IconSpinner,
} from "@/components/admin/GrowXIcons";

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
    icon: IconOverview,
    items: [
      { name: "Dashboard", href: "/admin", icon: IconOverview },
      { name: "Command Center", href: "/admin/command-center", icon: IconTerminal },
    ],
  },
  {
    id: "crm",
    title: "Customer & Sales",
    icon: IconCRM,
    items: [
      { name: "CRM Hub", href: "/admin/crm", icon: IconCRM },
      { name: "Sales Team", href: "/admin/crm/team", icon: IconPeople },
      { name: "Companies", href: "/admin/companies", icon: IconFile },
      { name: "Contacts", href: "/admin/contacts", icon: IconPeople },
      { name: "Deals Pipeline", href: "/admin/deals", icon: IconTarget },
      { name: "Leads", href: "/admin/leads", icon: IconTarget },
      { name: "Lead Imports", href: "/admin/leads/imports", icon: IconFile },
      { name: "Lead Research", href: "/admin/leads/scrape", icon: IconZap },
      { name: "Products", href: "/admin/products", icon: IconFile },
      { name: "Quotations", href: "/admin/quotations", icon: IconFile },
      { name: "Invoices", href: "/admin/invoices", icon: IconFinance },
      { name: "Proposals", href: "/admin/proposals", icon: IconFile },
      { name: "Agreements", href: "/admin/agreements", icon: IconConsulting },
      { name: "Client Accounts", href: "/admin/clients", icon: IconPeople },
      { name: "Client Assessments", href: "/admin/assessments", icon: IconFile },
      { name: "Business & Technical Audits", href: "/admin/audits", icon: IconFile },
      { name: "AI Solution Reports", href: "/admin/ai-solution-reports", icon: IconSparkle },
      { name: "Solution Architectures", href: "/admin/solution-architectures", icon: IconLayers },
      { name: "Scopes of Work", href: "/admin/scopes", icon: IconFile },
      { name: "Proposal Approvals", href: "/admin/proposal-approvals", icon: IconCheckCircle },
      { name: "Outreach", href: "/admin/outreach", icon: IconMarketing },
      { name: "GrowX Email", href: "/admin/growx-email", icon: IconFile },
      { name: "Communications", href: "/admin/communications", icon: IconFile },
      { name: "Presentation Builder", href: "/admin/pitch-deck", icon: IconFile },
      { name: "Client Onboarding", href: "/admin/onboarding", icon: IconZap },
      { name: "Workflows", href: "/admin/workflows", icon: IconZap },
    ],
  },
  {
    id: "consulting",
    title: "Consulting Workflow",
    icon: IconConsulting,
    items: [
      { name: "Assessments", href: "/admin/assessments", icon: IconFile },
      { name: "Business & Technical Audits", href: "/admin/audits", icon: IconFile },
      { name: "Discovery Meetings", href: "/admin/discovery-meetings", icon: IconActivity },
      { name: "Solution Architecture", href: "/admin/solution-architectures", icon: IconLayers },
      { name: "Scopes of Work", href: "/admin/scopes", icon: IconFile },
      { name: "Commercial Proposals", href: "/admin/proposals", icon: IconFile },
      { name: "Agreements", href: "/admin/agreements", icon: IconConsulting },
      { name: "Contractor Agreements", href: "/admin/contractor-agreements", icon: IconConsulting },
      { name: "Client Onboarding", href: "/admin/onboarding", icon: IconZap },
      { name: "Invoices & Payments", href: "/admin/consulting-finance", icon: IconFinance },
      { name: "Project Workspaces", href: "/admin/projects", icon: IconProjects },
      { name: "Communications", href: "/admin/communications", icon: IconFile },
    ],
  },
  {
    id: "pm",
    title: "Projects & Delivery",
    icon: IconProjects,
    items: [
      { name: "Projects", href: "/admin/pm/projects", icon: IconProjects },
      { name: "Project Workspaces", href: "/admin/projects", icon: IconLayers },
      { name: "Change Requests", href: "/admin/change-requests", icon: IconFile },
      { name: "Sprints", href: "/admin/pm/sprints", icon: IconZap },
      { name: "Workload", href: "/admin/pm/workload", icon: IconPeople },
      { name: "Timesheets", href: "/admin/pm/timesheets", icon: IconActivity },
      { name: "Bugs", href: "/admin/pm/bugs", icon: IconActivity },
      { name: "Project Assistant", href: "/admin/pm/ai-copilot", icon: IconSparkle },
    ],
  },
  {
    id: "finance",
    title: "Finance & Accounts",
    icon: IconFinance,
    items: [
      { name: "Financial Overview", href: "/admin/finance/dashboard", icon: IconFinance },
      { name: "Sales Invoices", href: "/admin/finance/invoices", icon: IconFile },
      { name: "Expenses", href: "/admin/finance/expenses", icon: IconFinance },
      { name: "Ledger Accounts", href: "/admin/finance/accounts", icon: IconFile },
      { name: "Reports", href: "/admin/finance/reports", icon: IconFile },
      { name: "AI Helper", href: "/admin/finance/ai-helper", icon: IconSparkle },
      { name: "Consulting Activation", href: "/admin/consulting-finance", icon: IconFinance },
    ],
  },
  {
    id: "hrms",
    title: "People Operations",
    icon: IconPeople,
    items: [
      { name: "People Core", href: "/admin/people", icon: IconShield },
      { name: "Departments", href: "/admin/people/departments", icon: IconFile },
      { name: "Designations", href: "/admin/people/designations", icon: IconLayers },
      { name: "My Team", href: "/admin/people/team", icon: IconPeople },
      { name: "People Access", href: "/admin/people/access", icon: IconKey },
      { name: "Recruiter Workspace", href: "/admin/recruitment", icon: IconPeople },
      { name: "Hiring Operations", href: "/admin/recruitment/operations", icon: IconFile },
      { name: "Hiring Manager", href: "/admin/recruitment/manager", icon: IconProjects },
      { name: "Offer Management", href: "/admin/offers", icon: IconConsulting },
      { name: "HR Onboarding", href: "/admin/hr-onboarding", icon: IconCheckCircle },
      { name: "Manager Onboarding", href: "/admin/hr-onboarding/manager", icon: IconPeople },
      { name: "People Overview", href: "/admin/hrms/dashboard", icon: IconOverview },
      { name: "Employees", href: "/admin/hrms/employees", icon: IconPeople },
      { name: "Recruitment", href: "/admin/hrms/recruitment", icon: IconPeople },
      { name: "Interviews & Access", href: "/admin/hrms/recruitment/interviews", icon: IconKey },
      { name: "Career Portal Applications", href: "/admin/career-portal", icon: IconFile },
      { name: "Attendance", href: "/admin/hrms/attendance", icon: IconActivity },
      { name: "Leaves", href: "/admin/hrms/leaves", icon: IconActivity },
      { name: "Payroll", href: "/admin/hrms/payroll", icon: IconFinance },
      { name: "Recruiting Assistant", href: "/admin/hrms/ai-recruiter", icon: IconSparkle },
      { name: "Email Status", href: "/admin/hrms/recruitment/emails", icon: IconFile },
      { name: "Email Templates", href: "/admin/hrms/recruitment/email-templates", icon: IconFile },
      { name: "Email Settings", href: "/admin/hrms/recruitment/email-settings", icon: IconSettings },
      { name: "Sales Team Onboarding", href: "/admin/employee-onboarding", icon: IconPeople },
    ],
  },
  {
    id: "marketing",
    title: "Growth & Marketing",
    icon: IconMarketing,
    items: [
      { name: "Marketing Hub", href: "/admin/marketing", icon: IconMarketing },
      { name: "Carousel Creator", href: "/admin/instagram-carousel", icon: IconFile },
      { name: "Editorial Carousel", href: "/admin/editorial-carousel", icon: IconFile },
      { name: "Reels Creator", href: "/admin/reels-creator", icon: IconFile },
    ],
  },
  {
    id: "support",
    title: "Customer Support",
    icon: IconSupport,
    items: [{ name: "Support Hub", href: "/admin/support", icon: IconSupport }],
  },
  {
    id: "ai",
    title: "Intelligent Tools",
    icon: IconAI,
    items: [
      { name: "Intelligent Workspace", href: "/admin/ai-platform", icon: IconAI },
    ],
  },
  {
    id: "academy",
    title: "Learning & Commerce",
    icon: IconAcademy,
    items: [
      { name: "Courses", href: "/admin/academy/courses", icon: IconAcademy },
      { name: "Assessments", href: "/admin/academy/assessments", icon: IconFile },
      { name: "Students", href: "/admin/academy/users", icon: IconPeople },
      { name: "Certificates", href: "/admin/academy/certificates", icon: IconFile },
      { name: "Coupons", href: "/admin/monetization/coupons", icon: IconFinance },
      { name: "Orders", href: "/admin/monetization/orders", icon: IconFile },
    ],
  },
  {
    id: "admin",
    title: "Administration",
    icon: IconSettings,
    items: [
      { name: "Settings & Security", href: "/admin/settings", icon: IconSettings },
      { name: "Reports & Analytics", href: "/admin/reports", icon: IconOverview },
    ],
  },
  {
    id: "operations",
    title: "Operations & Audit",
    icon: IconActivity,
    items: [
      { name: "Activity", href: "/admin/activity", icon: IconActivity },
      { name: "Audit Logs", href: "/admin/audit-logs", icon: IconFile },
      { name: "System Errors", href: "/admin/system/errors", icon: IconActivity },
    ],
  },
];

interface AdminNavProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

export function AdminNav({
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileToggle,
}: AdminNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isCrmAgent = role === "crm_agent";
  const allowedPaths = (session?.user as any)?.allowed_paths || [];
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [desktopFlyout, setDesktopFlyout] = useState<{
    groupId: string;
    top: number;
    trigger: HTMLElement | null;
  } | null>(null);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showProfileMenu]);

  useEffect(() => {
    const activeGroup = NAV_GROUPS.find((group) =>
      group.items.some(
        (item) =>
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)),
      ),
    );
    if (activeGroup) {
      setOpenSections((prev) => ({ ...prev, [activeGroup.id]: true }));
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
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
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
    if (!currentPw) {
      setPwError("Enter your current password.");
      return;
    }
    if (newPw.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setPwSuccess(true);
      setTimeout(() => {
        setShowPwModal(false);
        setPwSuccess(false);
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      }, 1800);
    } catch (e: any) {
      setPwError(e.message);
    } finally {
      setPwLoading(false);
    }
  };

  const isPathAllowed = (itemHref: string) => {
    if (
      itemHref.startsWith("/admin/pm") ||
      itemHref.startsWith("/admin/finance") ||
      itemHref.startsWith("/admin/marketing") ||
      itemHref.startsWith("/admin/support") ||
      itemHref.startsWith("/admin/ai-platform")
    ) {
      return true;
    }
    return allowedPaths.some((p: string) => {
      if (p === "/admin") return itemHref === "/admin";
      if (p === "/admin/leads/scrape")
        return itemHref === "/admin/leads/scrape";
      if (p === "/admin/leads")
        return (
          itemHref.startsWith("/admin/leads") &&
          !itemHref.startsWith("/admin/leads/scrape")
        );
      return itemHref === p || itemHref.startsWith(p + "/");
    });
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const visibleItemsForGroup = (group: NavGroup) =>
    isCrmAgent
      ? group.items.filter((item) => isPathAllowed(item.href))
      : group.items;

  const handleGroupClick = (groupId: string, target: HTMLElement) => {
    if (desktopFlyout?.groupId === groupId) {
      setDesktopFlyout(null);
    } else {
      const rect = target.getBoundingClientRect();
      const maxTop = Math.max(16, window.innerHeight - 480);
      setDesktopFlyout({
        groupId,
        top: Math.max(16, Math.min(rect.top - 6, maxTop)),
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
    isFlyout = false,
  ) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
    const Icon = item.icon;

    return (
      <Link
        key={`${item.href}-${item.name}`}
        href={item.href}
        title={isCollapsed && !isMobile ? item.name : ""}
        aria-current={isActive ? "page" : undefined}
        onClick={() => {
          closeDesktopFlyout(false);
          if (isMobileOpen) onMobileToggle();
        }}
        className={cn(
          "flex items-center h-8.5 px-3 rounded-xl transition-all duration-150 group relative text-[12px] font-medium select-none cursor-pointer",
          isActive
            ? "bg-[#0075de]/10 text-[#0075de] dark:bg-blue-500/15 dark:text-blue-400 font-semibold"
            : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-neutral-900/60",
          isCollapsed && !isMobile && "lg:justify-center lg:px-0",
          isFlyout &&
            "h-8 rounded-lg px-2.5 hover:bg-slate-100/90 dark:hover:bg-neutral-800/80",
          isFlyout && isActive && "bg-[#0075de]/10 text-[#0075de] dark:bg-blue-500/20 dark:text-blue-400"
        )}
      >
        <Icon
          size={14}
          className={cn(
            "shrink-0 transition-colors",
            isActive
              ? "text-[#0075de] dark:text-blue-400"
              : "text-slate-400 dark:text-neutral-500 group-hover:text-slate-700 dark:group-hover:text-neutral-300",
            (!isCollapsed || isMobile) && "mr-2.5",
          )}
        />

        <span
          className={cn(
            "whitespace-nowrap truncate",
            isCollapsed && !isMobile ? "lg:hidden" : "block",
          )}
        >
          {item.name}
        </span>

        {isActive && !isFlyout && (
          <div
            className={cn(
              "absolute bg-[#0075de] dark:bg-blue-400 rounded-r-md left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-3.5",
              isCollapsed && !isMobile ? "lg:h-4" : "",
            )}
          />
        )}
      </Link>
    );
  };

  const userName = session?.user?.name || "Admin User";
  const userRole = role === "crm_agent" ? "CRM Agent" : role || "Administrator";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const renderNavContent = (isMobile = false) => (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-neutral-950 text-slate-800 dark:text-neutral-200 border-r border-slate-200/80 dark:border-neutral-900">
      {/* Sidebar Header */}
      <div
        className={cn(
          "h-14 flex items-center px-3.5 shrink-0 justify-between bg-transparent",
          isCollapsed && !isMobile ? "lg:px-0 lg:justify-center" : "",
        )}
      >
        <div className="flex items-center gap-2.5">
          <GrowXLogo size={26} className="shrink-0" />
          <div
            className={cn(
              "flex flex-col overflow-hidden whitespace-nowrap",
              isCollapsed && !isMobile ? "lg:hidden" : "",
            )}
          >
            <span className="text-[13.5px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              GrowX<span className="text-[#0075de]">Labs</span>
            </span>
            <span className="text-[9px] font-medium text-slate-400 dark:text-neutral-500 tracking-wide flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              Workspace
            </span>
          </div>
        </div>

        {/* Desktop Header Collapse Button */}
        {!isMobile && !isCollapsed && (
          <button
            onClick={onToggle}
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-900 flex items-center justify-center transition-all cursor-pointer"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <IconChevronLeft size={13} />
          </button>
        )}

        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={onMobileToggle}
            className="h-8 w-8 rounded-xl bg-slate-100/80 dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-all cursor-pointer"
            aria-label="Close menu"
          >
            <IconClose size={14} />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-3 px-2.5 space-y-1">
        {NAV_GROUPS.map((group) => {
          const visibleItems = visibleItemsForGroup(group);
          if (visibleItems.length === 0) return null;

          const isOpen = openSections[group.id] ?? true;
          const GroupIcon = group.icon;
          const hasActiveItem = visibleItems.some(
            (item) =>
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)),
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
                  "w-full flex items-center justify-between rounded-xl font-medium text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-neutral-900/60 transition-all cursor-pointer select-none",
                  isMobile
                    ? "h-9 px-2.5 text-[11.5px]"
                    : "h-9 px-3 text-[12px]",
                  hasActiveItem &&
                    !isMobile &&
                    "bg-slate-100/80 text-slate-900 dark:bg-neutral-900/80 dark:text-white font-semibold",
                  isFlyoutOpen &&
                    !isMobile &&
                    "bg-[#0075de]/10 text-[#0075de] dark:bg-blue-500/15 dark:text-blue-400 font-semibold shadow-xs",
                  isCollapsed &&
                    !isMobile &&
                    "lg:justify-center lg:px-0 lg:h-9 lg:w-9 lg:mx-auto",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <GroupIcon
                    size={isCollapsed && !isMobile ? 16 : 14}
                    className="shrink-0"
                  />
                  <span className={cn(isCollapsed && !isMobile && "lg:hidden")}>
                    {group.title}
                  </span>
                </div>
                {isMobile ? (
                  <IconChevronDown
                    size={11}
                    className={cn(
                      "transition-transform duration-200",
                      isOpen ? "" : "-rotate-90",
                    )}
                  />
                ) : (
                  <IconChevronRight
                    size={11}
                    className={cn(
                      "transition-transform duration-200 text-slate-400 dark:text-neutral-500",
                      isCollapsed && "lg:hidden",
                      isFlyoutOpen && "rotate-90 text-[#0075de] dark:text-blue-400",
                    )}
                  />
                )}
              </button>

              {/* Mobile Accordion Drawer */}
              {isMobile && isOpen && (
                <div
                  id={`admin-nav-${group.id}`}
                  className="space-y-0.5 pl-2 pt-0.5"
                >
                  {visibleItems.map((item) => renderLink(item, isMobile))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Executive Footer: User Profile & Quick Actions */}
      <div
        ref={profileMenuRef}
        className={cn(
          "relative mt-auto p-2 pb-2.5 shrink-0 bg-transparent",
          isCollapsed && !isMobile ? "lg:p-1.5 lg:pb-2.5" : "",
        )}
      >
        {/* Profile Card Trigger */}
        <div
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={cn(
            "flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white dark:hover:bg-neutral-900 border border-transparent hover:border-slate-200/80 dark:hover:border-neutral-800 transition-all cursor-pointer select-none",
            isCollapsed && !isMobile ? "justify-center" : "",
            showProfileMenu && "bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-xs"
          )}
          title={isCollapsed && !isMobile ? userName : ""}
        >
          {/* Avatar Initials with Status Ring */}
          <div className="relative shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#0075de] to-blue-400 text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
              {userInitials || "GX"}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-950" />
          </div>

          {/* User Info */}
          <div
            className={cn(
              "min-w-0 flex-1 flex flex-col",
              isCollapsed && !isMobile ? "lg:hidden" : "",
            )}
          >
            <span className="text-[12px] font-bold text-slate-900 dark:text-white truncate leading-tight">
              {userName}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-medium truncate">
              {userRole}
            </span>
          </div>

          {/* Settings Trigger Chevron */}
          <div
            className={cn(
              "text-slate-400 dark:text-neutral-500 shrink-0",
              isCollapsed && !isMobile ? "lg:hidden" : "",
            )}
          >
            <IconChevronDown
              size={12}
              className={cn(
                "transition-transform duration-200",
                showProfileMenu ? "rotate-180" : ""
              )}
            />
          </div>
        </div>

        {/* Dropup Profile Menu */}
        {showProfileMenu && (
          <div
            className={cn(
              "absolute bottom-[calc(100%+8px)] z-[150] rounded-2xl border border-slate-200/90 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl p-2 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150 space-y-2",
              isCollapsed && !isMobile ? "left-2 w-56" : "left-2 right-2"
            )}
          >
            {/* Theme Toggle Pill */}
            <div className="p-1 bg-slate-100 dark:bg-neutral-950 rounded-xl flex items-center gap-0.5">
              {(["light", "dark", "system"] as const).map((t) => {
                const isActive = (theme || "system") === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTheme(t);
                      updateThemeClass(t);
                    }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg text-[10px] font-semibold capitalize transition-all cursor-pointer",
                      isActive
                        ? "bg-white text-slate-900 dark:bg-neutral-800 dark:text-white shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
                    )}
                  >
                    {t === "light" && <IconSun size={11} />}
                    {t === "dark" && <IconMoon size={11} />}
                    {t === "system" && <IconMonitor size={11} />}
                    <span>{t}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-[1px] bg-slate-100 dark:bg-neutral-800 my-1" />

            {/* Change Password Button */}
            <button
              onClick={() => {
                setShowProfileMenu(false);
                setPwError("");
                setPwSuccess(false);
                setCurrentPw("");
                setNewPw("");
                setConfirmPw("");
                setShowPwModal(true);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-neutral-300 hover:text-[#0075de] dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-neutral-800/80 transition-all text-left text-[11.5px] font-medium cursor-pointer"
            >
              <IconKey size={13} className="text-slate-400 dark:text-neutral-500" />
              <span>Change Password</span>
            </button>

            {/* Sign Out Button */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-left text-[11.5px] font-medium cursor-pointer"
            >
              <IconLogOut size={13} className="text-slate-400 dark:text-neutral-500" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ═══ MOBILE TOP NAVBAR ═══ */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-[100] h-14 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-neutral-900 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <GrowXLogo size={24} className="shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              GrowX<span className="text-[#0075de]">Labs</span>
            </span>
            <span className="text-[8.5px] font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-widest mt-0.5">
              Workspace
            </span>
          </div>
        </div>

        <button
          onClick={onMobileToggle}
          className="h-8.5 w-8.5 rounded-xl bg-slate-100/80 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 flex items-center justify-center text-slate-700 dark:text-neutral-200 hover:bg-slate-200/60 dark:hover:bg-neutral-800 transition-all cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <IconClose size={15} /> : <IconMenu size={15} />}
        </button>
      </header>

      {/* ═══ MOBILE DRAWER BACKDROP ═══ */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-[200] transition-opacity duration-300 animate-in fade-in"
          onClick={onMobileToggle}
        />
      )}

      {/* ═══ MOBILE DRAWER SIDEBAR ═══ */}
      <aside
        className={cn(
          "md:hidden fixed left-0 top-0 h-full w-[270px] z-[210] transition-transform duration-300 ease-in-out shadow-2xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {renderNavContent(true)}
      </aside>

      {/* ═══ DESKTOP FIXED SIDEBAR ═══ */}
      <aside
        id="admin-sidebar-container"
        className={cn(
          "hidden md:flex h-screen bg-white dark:bg-neutral-950 flex-col fixed left-0 top-0 transition-all duration-300 ease-in-out z-[90] overflow-visible border-r border-slate-200/80 dark:border-neutral-900",
          isCollapsed ? "w-20" : "w-[260px]",
        )}
      >
        {renderNavContent(false)}

        {/* Border Expand Button: Only shown when sidebar is collapsed */}
        {isCollapsed && (
          <button
            onClick={onToggle}
            className="absolute top-4.5 -right-3 h-6 w-6 rounded-full bg-white dark:bg-neutral-900 text-slate-400 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white flex items-center justify-center border border-slate-200 dark:border-neutral-800 z-[120] shadow-xs hover:shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <IconChevronRight
              size={11}
              className="text-slate-400 dark:text-neutral-400"
            />
          </button>
        )}
      </aside>

      {/* Portal flyout is rendered outside the Admin shell by NavigationFlyout */}
      {desktopFlyout &&
        (() => {
          const group = NAV_GROUPS.find(
            (item) => item.id === desktopFlyout.groupId,
          );
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
              left={isCollapsed ? 88 : 268}
              top={desktopFlyout.top}
              sidebarWidth={isCollapsed ? 80 : 260}
              items={visibleItems}
              renderLink={renderLink}
              onClose={closeDesktopFlyout}
            />
          );
        })()}

      {/* ═══ CHANGE PASSWORD MODAL ═══ */}
      {showPwModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[300] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowPwModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <IconClose size={15} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-neutral-900 pb-4">
              <div className="p-2 bg-[#0075de]/10 text-[#0075de] dark:text-blue-400 rounded-xl">
                <IconKey size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Change Password
                </h3>
                <p className="text-xs text-slate-400 dark:text-neutral-500">
                  Update your account access credentials.
                </p>
              </div>
            </div>

            {pwSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-2">
                <IconCheckCircle size={28} className="text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-emerald-500">
                  Password Updated Successfully!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pwError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs font-semibold rounded-xl">
                    {pwError}
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-neutral-500 mb-1.5 block tracking-wider">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-9 px-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#0075de]/40 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      {showCurrentPw ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-neutral-500 mb-1.5 block tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full h-9 px-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#0075de]/40 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      {showNewPw ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-neutral-500 mb-1.5 block tracking-wider">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full h-9 px-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#0075de]/40"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPwModal(false)}
                    className="flex-1 h-9 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs font-semibold text-slate-500 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-900 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={pwLoading}
                    className="flex-1 h-9 bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center cursor-pointer"
                  >
                    {pwLoading ? (
                      <IconSpinner size={16} className="text-white" />
                    ) : (
                      "Update Password"
                    )}
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
