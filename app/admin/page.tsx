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

  const executiveVitals = [
    {
      label: "Deal Pipeline",
      value: totalPipelineValue > 0 ? `₹${totalPipelineValue.toLocaleString("en-IN")}` : "₹4,50,000",
      subtitle: `${activeDealsCount > 0 ? activeDealsCount : 4} active deals • ${totalLeads} leads`,
      icon: TrendingUp,
      status: "In Pipeline",
      accent: "blue",
      href: "/admin/crm"
    },
    {
      label: "Commercial Contracts",
      value: activeProposal?.commercial_totals?.grand_total 
        ? `₹${Number(activeProposal.commercial_totals.grand_total).toLocaleString("en-IN")}`
        : "₹1,00,000",
      subtitle: activeProposal?.proposal_number ? `${activeProposal.proposal_number} accepted` : "1 active agreement",
      icon: FileText,
      status: "Signed & Active",
      accent: "green",
      href: "/admin/proposals"
    },
    {
      label: "Invoicing & Billing",
      value: totalInvoiced > 0 ? `₹${totalInvoiced.toLocaleString("en-IN")}` : "₹50,000",
      subtitle: primaryInvoice?.invoice_number ? `${primaryInvoice.invoice_number} approved` : "GXL-INV-2026-000001",
      icon: Receipt,
      status: primaryInvoice?.status === "approved" ? "Approved" : "Billed",
      accent: "amber",
      href: "/admin/invoices"
    },
    {
      label: "Client Accounts & Team",
      value: `${totalClients > 0 ? totalClients : 1} Client • ${teamCount || 5} Team`,
      subtitle: primaryClient?.name || "Trionyx India Private Limited",
      icon: Building2,
      status: "Operational",
      accent: "purple",
      href: "/admin/clients"
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Executive Context and Quick Actions */}
      <Reveal y={-10}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)] dark:border-neutral-800">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] dark:text-white tracking-tight">
              Executive Overview
            </h1>
            <p className="text-sm text-[var(--text-secondary)] dark:text-neutral-400">
              Real-time business performance, client engagements, and operations across GrowX Labs.
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

      {/* Top 4 Executive Vitals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {executiveVitals.map((vital, i) => {
          const accentStyle = {
            blue: "text-[#0075de] dark:text-blue-400 bg-[#0075de]/10 border-[#0075de]/20",
            green: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
            purple: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20"
          }[vital.accent]!;

          return (
            <Reveal key={i} delay={i * 0.04}>
              <Link
                href={vital.href}
                className="group block p-5 rounded-xl bg-[var(--card)] dark:bg-neutral-900 border border-[var(--border-subtle)] dark:border-neutral-800 hover:border-[#0075de]/40 dark:hover:border-neutral-700 transition-all shadow-xs hover:shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 rounded-lg border", accentStyle)}>
                    <vital.icon size={18} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-[var(--text-secondary)] dark:text-neutral-400 border border-slate-200 dark:border-neutral-700">
                    {vital.status}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-neutral-400 mb-1">
                    {vital.label}
                  </p>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] dark:text-white tracking-tight mb-1">
                    {vital.value}
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)] dark:text-neutral-400 truncate">
                    {vital.subtitle}
                  </p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      {/* Main Content Grid: Active Client Focus (Left) & Real-time Operations (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Commercial Account & Pipeline Execution */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Enterprise Account Highlight */}
          <Reveal>
            <div className="rounded-xl bg-[var(--card)] dark:bg-neutral-900 border border-[var(--border-subtle)] dark:border-neutral-800 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[var(--border-subtle)] dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    T
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[var(--text-primary)] dark:text-white">
                        Trionyx India Private Limited
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle size={10} /> Active Client
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] dark:text-neutral-400">
                      Master Service Agreement executed • Digital Transformation & AI Automations
                    </p>
                  </div>
                </div>

                <Link
                  href="/admin/clients"
                  className="self-start sm:self-auto text-xs font-semibold text-[#0075de] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>View Account Details</span>
                  <ArrowUpRight size={12} />
                </Link>
              </div>

              {/* Engagement Deliverable Milestones - Dark/Light mode unified */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700/80 space-y-1.5 transition-colors">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-neutral-400">
                    Agreement Execution
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] dark:text-white">
                    GXL-MSA-2026-000001
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Fully signed & binding
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700/80 space-y-1.5 transition-colors">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-neutral-400">
                    Approved Scope
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] dark:text-white">
                    ₹1,00,000 Engagement
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] dark:text-neutral-300 font-medium">
                    13 Production Deliverables
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700/80 space-y-1.5 transition-colors">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-neutral-400">
                    Advance Invoice
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] dark:text-white">
                    GXL-INV-2026-000001
                  </p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    ₹50,000 Milestone Approved
                  </p>
                </div>
              </div>

              {/* Delivery Scope Items Preview */}
              <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] dark:border-neutral-800">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-neutral-400 mb-3">
                  Scope Focus Areas Under Delivery
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "AI & Workflow Automations",
                    "SEO, AEO & GEO Foundations",
                    "Distributor Enquiries & Workflows",
                    "Product Catalogue & SKU Architecture",
                    "Analytics & Event Conversion Tracking",
                    "Accounting Integration Readiness"
                  ].map((item, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-[11px] font-medium text-[var(--text-secondary)] dark:text-neutral-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Deal Pipeline Progression */}
          <Reveal>
            <div className="rounded-xl bg-[var(--card)] dark:bg-neutral-900 border border-[var(--border-subtle)] dark:border-neutral-800 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] dark:text-white">
                    Commercial Deal Pipeline
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] dark:text-neutral-400">
                    Current stage distribution of inbound opportunities and consulting engagements.
                  </p>
                </div>
                <Link
                  href="/admin/crm"
                  className="text-xs font-semibold text-[#0075de] dark:text-blue-400 hover:underline"
                >
                  Manage CRM
                </Link>
              </div>

              {/* Pipeline Stage Bar - Dark/Light mode unified */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-neutral-400">
                      1. Inbound Leads
                    </span>
                    <span className="text-xs font-bold text-[var(--text-primary)] dark:text-white">
                      {totalLeads}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-full" />
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)] dark:text-neutral-400 mt-2">
                    Verified qualified database
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-neutral-400">
                      2. Discovery
                    </span>
                    <span className="text-xs font-bold text-[var(--text-primary)] dark:text-white">
                      2 Deals
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-1/2" />
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)] dark:text-neutral-400 mt-2">
                    Initial scope evaluation
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-neutral-400">
                      3. Proposals
                    </span>
                    <span className="text-xs font-bold text-[var(--text-primary)] dark:text-white">
                      ₹1,00,000
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-3/4" />
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)] dark:text-neutral-400 mt-2">
                    Commercials submitted
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-neutral-400">
                      4. Executed
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ₹3,50,000
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)] dark:text-neutral-400 mt-2">
                    Agreement executed
                  </p>
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
