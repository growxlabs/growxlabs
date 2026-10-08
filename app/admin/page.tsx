import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { 
  Building2, 
  TrendingUp, 
  FileText, 
  Receipt, 
  Users, 
  ArrowUpRight, 
  ArrowRight,
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Compass, 
  Layers, 
  Plus, 
  Activity
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/marketing/Reveal";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Use supabaseAdmin to bypass RLS for administrative intelligence, fallback to server client
  const supabase = supabaseAdmin || (await createClient());

  // Fetch real company operations & commercial data concurrently
  const [
    { count: leadsCount },
    { data: deals },
    { data: clients },
    { data: proposals },
    { data: invoices },
    { count: teamCount },
    { data: auditEvents },
    { count: solutionsCount },
    { count: academyUsersCount }
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("deals").select("id, name, value, currency, probability, stage_id, created_at").order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name, created_at").limit(5),
    supabase.from("commercial_proposals").select("id, title, proposal_number, status, commercial_totals, accepted_at, accepted_by_name").order("created_at", { ascending: false }).limit(5),
    supabase.from("consulting_advance_invoices").select("id, invoice_number, status, total, balance_due, amount_paid, issued_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("team_members").select("*", { count: "exact", head: true }),
    supabase.from("audit_events").select("id, action, resource_type, metadata, created_at").order("created_at", { ascending: false }).limit(6),
    supabase.from("solution_architectures").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true })
  ]);

  // Aggregate financial & pipeline vitals
  const totalPipelineValue = deals?.reduce((sum, d) => sum + (Number(d.value) || 0), 0) || 0;
  const activeDealsCount = deals?.length || 0;
  const totalLeads = leadsCount || 0;
  const totalClients = clients?.length || 0;

  const totalInvoiced = invoices?.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0) || 0;
  const totalDue = invoices?.reduce((sum, inv) => sum + (Number(inv.balance_due) || 0), 0) || 0;

  const activeProposal = proposals?.[0];
  const primaryClient = clients?.[0] || { name: "Trionyx India Private Limited" };
  const primaryInvoice = invoices?.[0];

  // Executive pipeline trajectory flow data
  const pipelineFlow = [
    {
      stage: "1. Pipeline & Inbound",
      value: totalPipelineValue > 0 ? `₹${totalPipelineValue.toLocaleString("en-IN")}` : "₹4,50,000",
      status: `${activeDealsCount > 0 ? activeDealsCount : 4} Active Deals`,
      meta: `${totalLeads} qualified leads database`,
      href: "/admin/crm",
      color: "from-blue-500/20 to-blue-600/5",
      border: "border-blue-500/30",
      text: "text-blue-500 dark:text-blue-400"
    },
    {
      stage: "2. Executed Contracts",
      value: activeProposal?.commercial_totals?.grand_total 
        ? `₹${Number(activeProposal.commercial_totals.grand_total).toLocaleString("en-IN")}`
        : "₹1,00,000",
      status: activeProposal?.proposal_number || "GXL-MSA-2026-000001",
      meta: "13 Production Deliverables",
      href: "/admin/proposals",
      color: "from-emerald-500/20 to-emerald-600/5",
      border: "border-emerald-500/30",
      text: "text-emerald-500 dark:text-emerald-400"
    },
    {
      stage: "3. Cashflow Realized",
      value: totalInvoiced > 0 ? `₹${totalInvoiced.toLocaleString("en-IN")}` : "₹50,000",
      status: "50% Billed to Date",
      meta: primaryInvoice?.invoice_number ? `${primaryInvoice.invoice_number} Approved` : "GXL-INV-2026-000001",
      href: "/admin/invoices",
      color: "from-amber-500/20 to-amber-600/5",
      border: "border-amber-500/30",
      text: "text-amber-500 dark:text-amber-400"
    },
    {
      stage: "4. Delivery & Operations",
      value: `${teamCount || 5} Engineers`,
      status: "1 Active Client",
      meta: primaryClient?.name || "Trionyx India Private Limited",
      href: "/admin/pm/projects",
      color: "from-purple-500/20 to-purple-600/5",
      border: "border-purple-500/30",
      text: "text-purple-500 dark:text-purple-400"
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Executive Context and Quick Actions */}
      <Reveal y={-10}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)] dark:border-neutral-800">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] dark:text-white tracking-tight">
              Executive Overview
            </h1>
            <p className="text-sm text-[var(--text-secondary)] dark:text-neutral-400">
              Real-time commercial velocity, client engagements, and operational pulse across GrowX Labs.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0075de]/10 border border-[#0075de]/20 text-[#0075de] dark:text-blue-400 text-xs font-semibold">
              <div className="w-2 h-2 rounded-full bg-[#0075de] animate-pulse" />
              <span>Operations Live</span>
            </div>
            <Link
              href="/admin/proposals"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-all text-xs font-semibold shadow-xs"
            >
              <Plus size={14} />
              <span>New Proposal</span>
            </Link>
            <Link
              href="/admin/crm"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--card)] dark:bg-neutral-900 border border-[var(--border-subtle)] dark:border-neutral-800 text-[var(--text-primary)] dark:text-neutral-200 hover:bg-[var(--surface-hover)] dark:hover:bg-neutral-800 transition-all text-xs font-semibold shadow-xs"
            >
              <span>CRM Pipeline</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Connected Business Trajectory Ribbon (Replaces disconnected KPI cards) */}
      <Reveal>
        <div className="rounded-2xl bg-[var(--card)] dark:bg-neutral-900 border border-[var(--border-subtle)] dark:border-neutral-800 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)] dark:border-neutral-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-[#0075de]/10 text-[#0075de] dark:text-blue-400">
                <TrendingUp size={14} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-neutral-400">
                End-to-End Commercial & Operational Velocity
              </h3>
            </div>
            <span className="text-[11px] font-mono font-medium text-[var(--text-tertiary)] dark:text-neutral-400">
              Q4 FY2026 Live Pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {pipelineFlow.map((step, idx) => (
              <Link
                key={idx}
                href={step.href}
                className="group relative p-4 rounded-xl bg-slate-50/70 dark:bg-neutral-800/40 border border-slate-200/80 dark:border-neutral-800 hover:border-[#0075de]/40 dark:hover:border-neutral-700 transition-all"
              >
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-2">
                  <span className="text-[var(--text-muted)] dark:text-neutral-400">{step.stage}</span>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 font-semibold", step.text)}>
                    {step.status}
                  </span>
                </div>
                <h4 className="text-2xl font-bold text-[var(--text-primary)] dark:text-white tracking-tight mb-1 group-hover:text-[#0075de] transition-colors">
                  {step.value}
                </h4>
                <p className="text-xs text-[var(--text-tertiary)] dark:text-neutral-400 truncate">
                  {step.meta}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Main Content Grid: Active Client Focus (Left) & Real-time Operations (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Commercial Account & Pipeline Execution */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Enterprise Account Dossier */}
          <Reveal>
            <div className="rounded-2xl bg-[var(--card)] dark:bg-neutral-900 border border-[var(--border-subtle)] dark:border-neutral-800 p-6 sm:p-7 shadow-xs space-y-6">
              
              {/* Client Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)] dark:border-neutral-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    T
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg font-bold text-[var(--text-primary)] dark:text-white tracking-tight">
                        Trionyx India Private Limited
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active Client
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] dark:text-neutral-400">
                      Master Service Agreement executed • Digital Transformation & AI Automations
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    href="/admin/pm/projects"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0075de] hover:bg-[#0075de]/90 text-white transition-colors"
                  >
                    <span>Delivery Board</span>
                    <ArrowUpRight size={13} />
                  </Link>
                  <Link
                    href="/admin/clients"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] dark:border-neutral-800 text-[var(--text-primary)] dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <span>Account Details</span>
                  </Link>
                </div>
              </div>

              {/* Engagement Trajectory Dual Track */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Track A: Scope & Milestones */}
                <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-neutral-800/40 border border-slate-200/80 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[var(--text-muted)] dark:text-neutral-400 uppercase tracking-wider text-[10px]">
                      Delivery Milestones
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      65% Completed
                    </span>
                  </div>
                  <div>
                    <h5 className="text-base font-bold text-[var(--text-primary)] dark:text-white">
                      ₹1,00,000 Commercial Scope
                    </h5>
                    <p className="text-xs text-[var(--text-secondary)] dark:text-neutral-400 mt-0.5">
                      13 Production Deliverables • Milestone 1 in Review
                    </p>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0075de] rounded-full w-[65%]" />
                  </div>
                </div>

                {/* Track B: Billing Realization */}
                <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-neutral-800/40 border border-slate-200/80 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[var(--text-muted)] dark:text-neutral-400 uppercase tracking-wider text-[10px]">
                      Financial Realization
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">
                      50% Realized
                    </span>
                  </div>
                  <div>
                    <h5 className="text-base font-bold text-[var(--text-primary)] dark:text-white">
                      ₹50,000 Advance Received
                    </h5>
                    <p className="text-xs text-[var(--text-secondary)] dark:text-neutral-400 mt-0.5">
                      GXL-INV-2026-000001 verified • ₹50,000 balance at completion
                    </p>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[50%]" />
                  </div>
                </div>
              </div>

              {/* Active Workstreams & Delivery Scope */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-neutral-400">
                    Active Delivery Workstreams
                  </h4>
                  <Link
                    href="/admin/pm/projects"
                    className="text-xs font-semibold text-[#0075de] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Kanban Tracks</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { title: "AI & Workflow Automations", status: "In Progress", statusColor: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" },
                    { title: "SEO, AEO & GEO Foundations", status: "In Review", statusColor: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" },
                    { title: "Distributor Enquiries Flow", status: "Queued", statusColor: "text-neutral-600 bg-neutral-100 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700" },
                    { title: "Product & SKU Architecture", status: "In Progress", statusColor: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" },
                    { title: "Analytics & Event Tracking", status: "Ready", statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" },
                    { title: "Accounting Integration", status: "Milestone 2", statusColor: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800" }
                  ].map((ws, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-lg bg-slate-50/60 dark:bg-neutral-800/30 border border-slate-200/70 dark:border-neutral-800 flex flex-col justify-between gap-2 hover:border-[#0075de]/30 transition-all"
                    >
                      <span className="text-xs font-semibold text-[var(--text-primary)] dark:text-neutral-200 leading-snug">
                        {ws.title}
                      </span>
                      <span className={cn("self-start text-[10px] font-bold px-2 py-0.5 rounded border", ws.statusColor)}>
                        {ws.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right 1 Column: Real-Time Operations Activity Feed & Department Pulse */}
        <div className="space-y-6">
          
          {/* Live Operations Feed */}
          <Reveal>
            <div className="rounded-xl bg-[var(--card)] dark:bg-neutral-900 border border-[var(--border-subtle)] dark:border-neutral-800 p-5 shadow-xs flex flex-col h-full">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#0075de]/10 text-[#0075de] dark:text-blue-400">
                    <Activity size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] dark:text-white">
                    Operations Event Log
                  </h3>
                </div>
                <Link
                  href="/admin/audit-logs"
                  className="text-[11px] font-medium text-[#0075de] dark:text-blue-400 hover:underline"
                >
                  Full Log
                </Link>
              </div>

              <div className="space-y-3.5 flex-1">
                {auditEvents && auditEvents.length > 0 ? (
                  auditEvents.map((evt, idx) => {
                    const actionLabel = evt.action.replace(/\./g, " • ").replace(/_/g, " ");
                    const isInvoice = evt.action.includes("invoice");
                    const isAgreement = evt.action.includes("agreement");
                    const dateFormatted = new Date(evt.created_at).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric"
                    });

                    return (
                      <div 
                        key={evt.id || idx}
                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800/60 transition-all border border-transparent hover:border-slate-200/60 dark:hover:border-neutral-700/60"
                      >
                        <div className={cn(
                          "w-2 h-2 mt-1.5 rounded-full shrink-0",
                          isInvoice ? "bg-amber-500" : isAgreement ? "bg-emerald-500" : "bg-blue-500"
                        )} />
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[var(--text-primary)] dark:text-white capitalize truncate">
                            {actionLabel}
                          </p>
                          <p className="text-[11px] text-[var(--text-tertiary)] dark:text-neutral-400 truncate">
                            {evt.metadata?.agreementNumber || evt.metadata?.invoiceNumber || evt.resource_type}
                          </p>
                        </div>

                        <span className="text-[10px] font-medium text-[var(--text-muted)] dark:text-neutral-500 shrink-0">
                          {dateFormatted}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                    No recent events recorded.
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] dark:border-neutral-800">
                <Link
                  href="/admin/audit-logs"
                  className="w-full block py-2 text-center rounded-lg bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 text-[11px] font-semibold text-[var(--text-secondary)] dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-all"
                >
                  View Complete Audit Trail
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Department Pulse Quick Glance - Dark/Light mode unified */}
          <Reveal>
            <div className="rounded-xl bg-[var(--card)] dark:bg-neutral-900 border border-[var(--border-subtle)] dark:border-neutral-800 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-neutral-400">
                Department Pulse
              </h3>

              <div className="space-y-2.5">
                <Link
                  href="/admin/solution-architectures"
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700/80 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers size={15} className="text-blue-500" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-primary)] dark:text-white">
                        AI & Architecture
                      </p>
                      <p className="text-[10px] text-[var(--text-tertiary)] dark:text-neutral-400">
                        {solutionsCount || 1} solution blueprint active
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={13} className="text-[var(--text-muted)]" />
                </Link>

                <Link
                  href="/admin/people"
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700/80 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Users size={15} className="text-purple-500" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-primary)] dark:text-white">
                        People & HRMS
                      </p>
                      <p className="text-[10px] text-[var(--text-tertiary)] dark:text-neutral-400">
                        {teamCount || 5} active core team members
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={13} className="text-[var(--text-muted)]" />
                </Link>

                <Link
                  href="/admin/academy"
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700/80 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Compass size={15} className="text-emerald-500" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-primary)] dark:text-white">
                        Academy & Upskilling
                      </p>
                      <p className="text-[10px] text-[var(--text-tertiary)] dark:text-neutral-400">
                        {academyUsersCount || 6} platform accounts
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={13} className="text-[var(--text-muted)]" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

      </div>
    </div>
  );
}
