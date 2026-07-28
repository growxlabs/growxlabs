"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Loader2, ShieldAlert, ArrowLeft, LogOut, ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentPath = usePathname();
  const { data: session, status } = useSession();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isEditorialStudio = currentPath?.includes("/admin/editorial-carousel");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const role = (session?.user as any)?.role;
    const permissions: string[] = (session?.user as any)?.permissions || [];
    const rawPathname = window.location.pathname;
    // Strip locale prefix (e.g., /en-IN/admin → /admin)
    const pathname = rawPathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?(?=\/admin)/, '');

    if (role === "IDENTITY_USER") {
      const requiredPermission =
        pathname.startsWith("/admin/attendance-leave") ? "attendance.policy.view" :
        pathname.startsWith("/admin/hr-onboarding/manager") ? "onboarding.manager_task" :
        pathname.startsWith("/admin/hr-onboarding") ? "onboarding.hr_task" :
        pathname.startsWith("/admin/offers") ? "offer.view" :
        pathname.startsWith("/admin/recruitment/manager") ? "candidate.view" :
        pathname.startsWith("/admin/recruitment") ? "candidate.view_all" :
        pathname.startsWith("/admin/people/access") ? "organisation.manage" :
        pathname.startsWith("/admin/people/departments") ? "department.manage" :
        pathname.startsWith("/admin/people/designations") ? "designation.manage" :
        pathname.startsWith("/admin/people/team") ? "manager.view_team" :
        pathname.startsWith("/admin/people") ? "employee.view" : "";
      if (requiredPermission && permissions.includes(requiredPermission)) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
        router.replace("/people/me");
      }
    } else if (role === "ADMIN" || role === "CO_ADMIN") {
      setAuthorized(true);
    } else if (role === "crm_agent") {
      // Strict security override: CRM agents are never allowed to access team management or command-center
      if (pathname.startsWith("/admin/team") || pathname.startsWith("/admin/command-center")) {
        setAuthorized(false);
        router.replace("/admin/crm");
        return;
      }

      const allowedPaths = (session?.user as any)?.allowed_paths || [];
      let isAllowed = false;
      
      if (pathname.startsWith("/admin/pm") || pathname.startsWith("/admin/finance")) {
        isAllowed = true;
      } else {
        for (const p of allowedPaths) {
          if (p === "/admin") {
            if (pathname === "/admin" || pathname === "/admin/") {
              isAllowed = true;
              break;
            }
          } else if (p === "/admin/leads/scrape") {
            if (pathname.startsWith("/admin/leads/scrape")) {
              isAllowed = true;
              break;
            }
          } else if (p === "/admin/leads") {
            // Allow leads subroutes EXCEPT scrape unless they explicitly have scrape permission
            if (pathname.startsWith("/admin/leads") && !pathname.startsWith("/admin/leads/scrape")) {
              isAllowed = true;
              break;
            }
          } else if (pathname.startsWith(p)) {
            isAllowed = true;
            break;
          }
        }
      }

      const isRootPath = pathname === "/admin" || pathname === "/admin/" || rawPathname.match(/^(\/[a-z]{2}(-[A-Z]{2})?)?\/admin\/?$/);
      if (isAllowed || isRootPath) {
        setAuthorized(true);
        if (isRootPath) {
          // Prioritize /admin/crm for CRM agents, then fall back to first allowed path
          const crmPath = allowedPaths.includes("/admin/crm") ? "/admin/crm" : null;
          const fallbackPath = crmPath || allowedPaths.find((p: string) => p !== "/admin/leads/scrape") || allowedPaths[0] || "/admin/crm";
          router.replace(fallbackPath);
        }
      } else {
        setAuthorized(false);
        router.replace("/admin/crm");
        // Log the unauthorized access attempt in the database
        fetch("/api/team/log-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pathname }),
        }).catch(err => console.error("Failed to log security alert:", err));
      }
    } else {
      setAuthorized(false);
    }
  }, [status, session, router, currentPath]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [currentPath]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  if (authorized === null) {
    return (
      <div className="notion-theme min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-8 w-8 text-primary/40" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Authorizing Suite</p>
        </div>
      </div>
    );
  }

  if (authorized === false) {
    const allowedPaths = (session?.user as any)?.allowed_paths || [];
    
    // Path configuration mapping for user-friendly UI presentation
    const PATH_CONFIGS: Record<string, { label: string; desc: string; color: string }> = {
      "/admin": { label: "Overview", desc: "System activity and stats overview", color: "from-blue-500 to-indigo-600" },
      "/admin/crm": { label: "CRM Dashboard", desc: "Manage client accounts and pipelines", color: "from-[#0075de] to-[#005bab]" },
      "/admin/companies": { label: "Companies", desc: "Manage company accounts and Customer 360 dashboards", color: "from-blue-500 to-indigo-600" },
      "/admin/contacts": { label: "Contacts", desc: "Manage client directory and communication details", color: "from-purple-500 to-indigo-600" },
      "/admin/deals": { label: "Deals Pipeline", desc: "Track sales pipeline and Kanban stages", color: "from-emerald-500 to-teal-600" },
      "/admin/workflows": { label: "Workflows", desc: "Configure visual workflow trigger automations", color: "from-amber-500 to-orange-600" },
      "/admin/reports": { label: "Reports", desc: "Sales forecasting and analytics performance overview", color: "from-blue-500 to-cyan-600" },
      "/admin/pm/projects": { label: "Projects Board", desc: "Track Agile projects delivery execution logs", color: "from-blue-500 to-indigo-600" },
      "/admin/pm/sprints": { label: "Sprints Planner", desc: "Manage Agile sprints goals, velocities, and burndowns", color: "from-amber-500 to-orange-600" },
      "/admin/pm/workload": { label: "Workload Balancer", desc: "Track team resources capacity allocations", color: "from-violet-500 to-purple-600" },
      "/admin/pm/timesheets": { label: "Timesheets Tracker", desc: "Log developer productivity hours and activities", color: "from-teal-500 to-emerald-600" },
      "/admin/pm/bugs": { label: "QA Bug Tracker", desc: "Report software bugs and track resolving details", color: "from-rose-500 to-red-600" },
      "/admin/pm/ai-copilot": { label: "AI PM Copilot", desc: "Generate sprint backlogs and identify delivery risks", color: "from-blue-500 to-cyan-600" },
      "/admin/finance/dashboard": { label: "Financial KPIs", desc: "Verify cash balances, assets, liabilities, and margins", color: "from-[#0075de] to-[#005bab]" },
      "/admin/finance/invoices": { label: "Sales Invoices", desc: "Manage accounts receivable and payment tracking", color: "from-blue-500 to-indigo-600" },
      "/admin/finance/expenses": { label: "Corporate Expenses", desc: "Audit corporate expenses claims and vendor payouts", color: "from-amber-500 to-orange-600" },
      "/admin/finance/accounts": { label: "Double-Entry Ledger", desc: "View Trial Balance and post journal vouchers", color: "from-violet-500 to-purple-600" },
      "/admin/finance/reports": { label: "Financial Statements", desc: "Profit & Loss, Balance Sheets, and GST reporting", color: "from-teal-500 to-emerald-600" },
      "/admin/finance/ai-helper": { label: "AI Finance Assistant", desc: "Automate receipt classifications and cash projections", color: "from-blue-500 to-cyan-600" },
      "/admin/hrms/dashboard": { label: "HR Overview", desc: "Monitor workforce metrics, headcount, and HR KPIs", color: "from-[#0075de] to-[#005bab]" },
      "/admin/hrms/employees": { label: "Employees Directory", desc: "Manage employee profiles, documents, and org chart", color: "from-blue-500 to-indigo-600" },
      "/admin/hrms/recruitment": { label: "Recruitment Pipeline", desc: "Track job openings and candidate hiring stages", color: "from-emerald-500 to-teal-600" },
      "/admin/hrms/attendance": { label: "Attendance Records", desc: "Clock in/out tracking and working hours audit", color: "from-amber-500 to-orange-600" },
      "/admin/hrms/leaves": { label: "Leave Management", desc: "Apply, approve, and track employee leave balances", color: "from-violet-500 to-purple-600" },
      "/admin/hrms/payroll": { label: "Payroll Management", desc: "Generate payslips with PF, ESI, and TDS deductions", color: "from-teal-500 to-emerald-600" },
      "/admin/hrms/ai-recruiter": { label: "AI Recruiter", desc: "AI-powered resume scoring and sentiment analysis", color: "from-blue-500 to-cyan-600" },
      "/admin/products": { label: "Product Catalog", desc: "Configure product lists, SKU values, and prices", color: "from-rose-500 to-red-600" },
      "/admin/quotations": { label: "Quotations", desc: "Build line-items price lists and client PDFs", color: "from-teal-500 to-emerald-600" },
      "/admin/leads": { label: "Sales Pipeline", desc: "Track sales pipeline and deal status", color: "from-emerald-500 to-teal-600" },
      "/admin/leads/scrape": { label: "AI Lead Scraper", desc: "Automate leads extraction from the web", color: "from-amber-500 to-orange-600" },
      "/admin/outreach": { label: "AI Outreach Planner", desc: "Schedule and manage outbound email campaigns", color: "from-purple-500 to-indigo-600" },
      "/admin/growx-email": { label: "Email Client", desc: "Manage company email communications", color: "from-blue-500 to-cyan-600" },
      "/admin/onboarding": { label: "Client Onboarding", desc: "Onboard new client accounts and agreements", color: "from-pink-500 to-rose-600" },
      "/admin/employee-onboarding": { label: "SDR Onboarding", desc: "Onboard team members and SDR agents", color: "from-violet-500 to-purple-600" },
      "/admin/career-portal": { label: "Career Portal", desc: "Manage job postings and applications", color: "from-slate-500 to-slate-700" },
      "/admin/academy/courses": { label: "Academy Courses", desc: "Access sales playbooks and educational resources", color: "from-rose-500 to-red-600" },
      "/admin/monetization/coupons": { label: "Coupons Manager", desc: "Configure course discounts and coupons", color: "from-amber-500 to-yellow-600" },
      "/admin/monetization/orders": { label: "Order Logs", desc: "Audit logs for academy subscriptions", color: "from-teal-500 to-emerald-600" },
      "/admin/invoices": { label: "Invoices", desc: "Manage client billing and invoice logs", color: "from-sky-500 to-blue-600" },
      "/admin/agreements": { label: "Agreements", desc: "Manage legal agreements and e-signs", color: "from-emerald-500 to-green-600" },
      "/admin/proposals": { label: "Proposals", desc: "Draft and review business proposals", color: "from-indigo-500 to-violet-600" },
    };

    return (
      <div className="notion-theme min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden transition-colors duration-300">
        {/* Decorative subtle background blur elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0075de]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Header */}
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between shrink-0 mb-8 border-b border-[var(--border-subtle)] pb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-[var(--card)] rounded-lg border border-[var(--border-subtle)] flex items-center justify-center shadow-sm">
              <ShieldAlert className="text-[#0075de] h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] leading-tight">GrowX Labs</h2>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Agent Workspace</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/5 transition-all"
          >
            <LogOut size={12} /> Sign Out
          </button>
        </div>

        {/* Workspace Menu */}
        <div className="flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto my-auto py-8">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] leading-none">
              Welcome back, <span className="text-[#0075de]">{session?.user?.name || "Agent"}</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-xs">
              {allowedPaths.length > 0 
                ? "Your account clearance allows access to the following workspace applications:" 
                : "Your account is active but has no permissions assigned. Please contact your administrator."}
            </p>
          </div>

          {allowedPaths.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allowedPaths.map((path: string) => {
                const config = PATH_CONFIGS[path] || { 
                  label: path.split("/").pop()?.replace(/-/g, " ") || "Workspace", 
                  desc: `Access application at ${path}`,
                  color: "from-neutral-500 to-neutral-700" 
                };
                
                return (
                  <button
                    key={path}
                    onClick={() => router.push(path)}
                    className="flex items-start text-left p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] hover:border-[#0075de]/30 hover:shadow-md hover:shadow-neutral-900/5 dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                  >
                    <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shrink-0 shadow-sm mr-4", config.color)}>
                      <ExternalLink size={16} className="group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="min-w-0 flex-1 pr-2">
                      <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[#0075de] transition-colors leading-tight mb-1">
                        {config.label}
                      </h3>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-snug font-medium">
                        {config.desc}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-neutral-400 group-hover:text-[#0075de] group-hover:translate-x-0.5 transition-all self-center ml-auto shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Footer Info */}
        <div className="max-w-4xl w-full mx-auto text-center shrink-0 pt-8 border-t border-[var(--border-subtle)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          GrowX Labs outbound systems • Authorized Personnel Only
        </div>
      </div>
    );
  }

  return (
    <div className="notion-theme min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--background)] text-[var(--text-primary)] flex relative print:bg-white print:text-black print:block print:overflow-visible">
      {/* PERSISTENT SIDEBAR */}
      <div className="print:hidden">
        <AdminNav
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileOpen}
          onMobileToggle={() => setIsMobileOpen(!isMobileOpen)}
        />
      </div>
      
      {/* SCROLLABLE MAIN CONTENT AREA */}
      <main className={cn(
        "min-w-0 min-h-screen max-w-full overflow-x-hidden overflow-y-auto relative custom-scrollbar transition-[margin,width] duration-300 ease-out bg-[var(--background)] z-10 print:ml-0 print:w-full print:bg-transparent print:overflow-visible print:min-h-0",
        // Exact desktop shell sizing prevents flyouts or nested panels from changing workspace width.
        isCollapsed
          ? "md:ml-20 md:w-[calc(100vw-5rem)] lg:flex-none"
          : "md:ml-[272px] md:w-[calc(100vw-272px)] lg:flex-none",
        // Mobile: no margin, add top padding for the mobile top bar
        "ml-0 pt-14 md:pt-0"
      )}>
         {/* Internal Spacing — responsive padding */}
         <div className={cn(
           "w-full mx-auto print:p-0 print:m-0 print:space-y-0 print:max-w-none",
           isEditorialStudio
             ? "h-[calc(100vh-3.5rem)] md:h-screen max-w-none overflow-hidden"
             : "p-4 sm:p-6 md:p-12 max-w-[1600px] space-y-6 sm:space-y-8 lg:space-y-10"
         )}>
            {children}
         </div>
      </main>
    </div>
  );
}
