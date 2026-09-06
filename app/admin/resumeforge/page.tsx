"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { 
  FileText, CreditCard, Users, RefreshCw, ExternalLink, 
  Search, Download, CheckCircle2, Clock, AlertCircle, 
  ArrowUpRight, ShieldCheck, Sparkles, Filter, ChevronLeft, 
  ChevronRight, ArrowRight, Zap, Check, Copy
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  AdminKPICardsSkeleton, 
  AdminTableSkeleton 
} from "@/components/admin/AdminSkeletons";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  ResumeForgeInvoice, 
  ResumeForgePayment, 
  ResumeForgeUser,
  ResumeForgeSummaryMetrics 
} from "@/lib/integrations/resumeforge";

type ActiveTab = "invoices" | "payments" | "users";

export default function ResumeForgeHubPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("invoices");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean>(true);

  // Summary Metrics
  const [summary, setSummary] = useState<ResumeForgeSummaryMetrics | null>(null);

  // Invoices State
  const [invoices, setInvoices] = useState<ResumeForgeInvoice[]>([]);
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoiceTotalPages, setInvoiceTotalPages] = useState(1);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("all");
  const [invoiceSearch, setInvoiceSearch] = useState("");

  // Payments State
  const [payments, setPayments] = useState<ResumeForgePayment[]>([]);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentTotalPages, setPaymentTotalPages] = useState(1);
  const [paymentSearch, setPaymentSearch] = useState("");

  // Users State
  const [users, setUsers] = useState<ResumeForgeUser[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userPlanFilter, setUserPlanFilter] = useState<string>("all");
  const [userSearch, setUserSearch] = useState("");

  const [copiedKey, setCopiedKey] = useState(false);

  // Fetch Summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/resumeforge?type=summary");
      const data = await res.json();
      if (data.configured !== undefined) {
        setConfigured(data.configured);
      }
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (e: any) {
      console.error("Failed to fetch summary:", e);
    }
  }, []);

  // Fetch Invoices
  const fetchInvoices = useCallback(async (page: number, status: string) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        type: "invoices",
        page: page.toString(),
        limit: "50",
      });
      if (status !== "all") query.append("status", status);

      const res = await fetch(`/api/admin/resumeforge?${query.toString()}`);
      const data = await res.json();
      if (data.configured !== undefined) setConfigured(data.configured);

      if (data.success) {
        setInvoices(data.invoices || []);
        setInvoiceTotalPages(data.total_pages || 1);
        setError(null);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Payments
  const fetchPayments = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        type: "payments",
        page: page.toString(),
        limit: "50",
      });

      const res = await fetch(`/api/admin/resumeforge?${query.toString()}`);
      const data = await res.json();
      if (data.configured !== undefined) setConfigured(data.configured);

      if (data.success) {
        setPayments(data.payments || []);
        setPaymentTotalPages(data.total_pages || 1);
        setError(null);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async (page: number, plan: string) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        type: "users",
        page: page.toString(),
        limit: "50",
      });
      if (plan !== "all") query.append("plan", plan);

      const res = await fetch(`/api/admin/resumeforge?${query.toString()}`);
      const data = await res.json();
      if (data.configured !== undefined) setConfigured(data.configured);

      if (data.success) {
        setUsers(data.users || []);
        setUserTotalPages(data.total_pages || 1);
        setError(null);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Tab dependent load
  useEffect(() => {
    if (activeTab === "invoices") {
      fetchInvoices(invoicePage, invoiceStatusFilter);
    } else if (activeTab === "payments") {
      fetchPayments(paymentPage);
    } else if (activeTab === "users") {
      fetchUsers(userPage, userPlanFilter);
    }
  }, [activeTab, invoicePage, invoiceStatusFilter, paymentPage, userPage, userPlanFilter, fetchInvoices, fetchPayments, fetchUsers]);

  // Manual Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
    if (activeTab === "invoices") {
      await fetchInvoices(invoicePage, invoiceStatusFilter);
    } else if (activeTab === "payments") {
      await fetchPayments(paymentPage);
    } else if (activeTab === "users") {
      await fetchUsers(userPage, userPlanFilter);
    }
    setRefreshing(false);
  };

  // Filtered Client Invoices
  const filteredInvoices = useMemo(() => {
    if (!invoiceSearch.trim()) return invoices;
    const s = invoiceSearch.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoice_number?.toLowerCase().includes(s) ||
        inv.customer?.email?.toLowerCase().includes(s) ||
        inv.customer?.name?.toLowerCase().includes(s) ||
        inv.plan_purchased?.toLowerCase().includes(s) ||
        inv.transaction_id?.toLowerCase().includes(s)
    );
  }, [invoices, invoiceSearch]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    if (!paymentSearch.trim()) return payments;
    const s = paymentSearch.toLowerCase();
    return payments.filter(
      (p) =>
        p.payment_id?.toLowerCase().includes(s) ||
        p.order_id?.toLowerCase().includes(s) ||
        p.invoice_number?.toLowerCase().includes(s) ||
        p.customer_email?.toLowerCase().includes(s) ||
        p.customer_name?.toLowerCase().includes(s)
    );
  }, [payments, paymentSearch]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const s = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(s) ||
        u.full_name?.toLowerCase().includes(s) ||
        u.subscription_plan?.toLowerCase().includes(s)
    );
  }, [users, userSearch]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Product Switcher Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#141416] border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-base">
            RF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">ResumeForge AI</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800">
                GrowX Venture
              </span>
              {configured ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live API v1
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Key Required
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Automated ingestion of Users, Payments & Invoices directly from <code className="text-neutral-300">resumeforgeai.in</code>.
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-200 text-xs h-9 px-3"
          >
            <RefreshCw size={13} className={`mr-1.5 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
            {refreshing ? "Syncing..." : "Sync Now"}
          </Button>

          <Link href="/admin/invoices" className="hidden sm:inline-flex">
            <Button
              variant="outline"
              size="sm"
              className="border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 text-xs h-9 px-3"
            >
              Consulting Invoices <ArrowRight size={13} className="ml-1.5 opacity-60" />
            </Button>
          </Link>

          <a
            href="https://resumeforgeai.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs h-9 px-3.5 shadow-sm"
            >
              Open Site <ExternalLink size={13} className="ml-1.5" />
            </Button>
          </a>
        </div>
      </div>

      {/* Unconfigured Alert / Quick Setup Guide */}
      {!configured && (
        <div className="border border-amber-500/30 bg-amber-950/20 rounded-xl p-4 text-neutral-200 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-amber-300">
                Setup Required: RESUMEFORGE_COMPANY_KEY
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                To sync live data from ResumeForge AI, add the 256-bit company token issued by the administrator to your environment variables (<code className="text-amber-200 font-mono">.env.local</code> / Vercel Environment).
              </p>
            </div>
          </div>
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-3 font-mono text-xs text-neutral-300 flex items-center justify-between">
            <span>RESUMEFORGE_COMPANY_KEY=rf_comp_live_your_token_here</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText("RESUMEFORGE_COMPANY_KEY=rf_comp_live_");
                setCopiedKey(true);
                setTimeout(() => setCopiedKey(false), 2000);
              }}
              className="h-7 text-[11px] text-neutral-400 hover:text-white"
            >
              {copiedKey ? <Check size={12} className="text-emerald-400 mr-1" /> : <Copy size={12} className="mr-1" />}
              {copiedKey ? "Copied" : "Copy Env Name"}
            </Button>
          </div>
        </div>
      )}

      {/* Metric Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#141416] border-neutral-800 p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs text-neutral-400 font-medium">Total Invoiced</span>
            <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
              <FileText size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {summary ? `₹${summary.totalRevenueInr.toLocaleString("en-IN")}` : "₹0"}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
              <CheckCircle2 size={11} className="text-emerald-400" />
              {summary ? `${summary.totalPaidInvoices} paid invoices` : "0 paid invoices"}
            </p>
          </div>
        </Card>

        <Card className="bg-[#141416] border-neutral-800 p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs text-neutral-400 font-medium">Captured Payments</span>
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
              <CreditCard size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {summary ? summary.totalTransactions : 0}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">Via Razorpay Gateway</p>
          </div>
        </Card>

        <Card className="bg-[#141416] border-neutral-800 p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs text-neutral-400 font-medium">Registered Users</span>
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
              <Users size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {summary ? summary.totalUsers.toLocaleString() : 0}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">Total candidate accounts</p>
          </div>
        </Card>

        <Card className="bg-[#141416] border-neutral-800 p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs text-neutral-400 font-medium">PRO Subscribers</span>
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
              <Sparkles size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {summary ? summary.proUsersCount : 0}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">Active PRO tier accounts</p>
          </div>
        </Card>
      </div>

      {/* View Switcher Tabs */}
      <div className="border-b border-neutral-800">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "invoices"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
            }`}
          >
            <FileText size={14} />
            Customer Invoices
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300">
              {summary?.totalPaidInvoices ?? invoices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "payments"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
            }`}
          >
            <CreditCard size={14} />
            Captured Payments
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300">
              {summary?.totalTransactions ?? payments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "users"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
            }`}
          >
            <Users size={14} />
            User Directory
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300">
              {summary?.totalUsers ?? users.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: INVOICES */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
              <Input
                placeholder="Search by invoice #, email, customer, or order ID..."
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                className="pl-9 bg-[#141416] border-neutral-800 text-neutral-200 text-xs h-9 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <Filter size={12} /> Status:
              </span>
              <select
                value={invoiceStatusFilter}
                onChange={(e) => {
                  setInvoiceStatusFilter(e.target.value);
                  setInvoicePage(1);
                }}
                className="bg-[#141416] border border-neutral-800 text-neutral-200 text-xs rounded-md px-2.5 h-9 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Invoices</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Invoices Table */}
          {loading ? (
            <AdminTableSkeleton />
          ) : filteredInvoices.length === 0 ? (
            <div className="border border-dashed border-neutral-800 rounded-xl p-12 text-center bg-[#141416]/50">
              <FileText className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-300">No invoices found</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                {configured
                  ? "No invoices match the selected filter or search term."
                  : "Connect your RESUMEFORGE_COMPANY_KEY to display live invoices."}
              </p>
            </div>
          ) : (
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-[#141416]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/80 text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id || inv.invoice_number} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {inv.invoice_number}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-white">{inv.customer?.name || "Anonymous"}</div>
                          <div className="text-[11px] text-neutral-400">{inv.customer?.email}</div>
                          {inv.customer?.city && (
                            <div className="text-[10px] text-neutral-500">
                              {inv.customer.city}{inv.customer.state ? `, ${inv.customer.state}` : ""}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-900">
                            {inv.plan_purchased || "Standard"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          ₹{inv.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4">
                          {inv.status === "paid" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/80">
                              <CheckCircle2 size={11} /> Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-400 border border-amber-800/80">
                              <Clock size={11} /> {inv.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-neutral-300">{inv.payment_method || "Razorpay"}</div>
                          {inv.transaction_id && (
                            <div className="text-[10px] text-neutral-500 font-mono truncate max-w-[120px]">
                              {inv.transaction_id}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-400 whitespace-nowrap">
                          {inv.created_at ? new Date(inv.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }) : "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {inv.receipt_url ? (
                            <a
                              href={inv.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                            >
                              <Download size={12} /> PDF
                            </a>
                          ) : (
                            <span className="text-neutral-600 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {invoiceTotalPages > 1 && (
                <div className="p-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <span>Page {invoicePage} of {invoiceTotalPages}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={invoicePage <= 1}
                      onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}
                      className="h-7 text-xs border-neutral-800"
                    >
                      <ChevronLeft size={13} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={invoicePage >= invoiceTotalPages}
                      onClick={() => setInvoicePage((p) => p + 1)}
                      className="h-7 text-xs border-neutral-800"
                    >
                      <ChevronRight size={13} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAYMENTS */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
            <Input
              placeholder="Search by payment ID, order ID, or customer..."
              value={paymentSearch}
              onChange={(e) => setPaymentSearch(e.target.value)}
              className="pl-9 bg-[#141416] border-neutral-800 text-neutral-200 text-xs h-9 focus:border-indigo-500"
            />
          </div>

          {loading ? (
            <AdminTableSkeleton />
          ) : filteredPayments.length === 0 ? (
            <div className="border border-dashed border-neutral-800 rounded-xl p-12 text-center bg-[#141416]/50">
              <CreditCard className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-300">No payments captured</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                {configured ? "No payment transactions match your query." : "Connect API key to sync payments."}
              </p>
            </div>
          ) : (
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-[#141416]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/80 text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Payment ID</th>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Gateway Status</th>
                      <th className="py-3 px-4">Paid At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                    {filteredPayments.map((p) => (
                      <tr key={p.payment_id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-indigo-300 font-medium">
                          {p.payment_id}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                          {p.order_id || "-"}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {p.invoice_number || "-"}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-white">{p.customer_name || "Customer"}</div>
                          <div className="text-[11px] text-neutral-400">{p.customer_email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-900">
                            {p.plan}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          ₹{p.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/80">
                            <CheckCircle2 size={11} /> {p.status || "captured"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-400 whitespace-nowrap">
                          {p.paid_at ? new Date(p.paid_at).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          }) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {paymentTotalPages > 1 && (
                <div className="p-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <span>Page {paymentPage} of {paymentTotalPages}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={paymentPage <= 1}
                      onClick={() => setPaymentPage((p) => Math.max(1, p - 1))}
                      className="h-7 text-xs border-neutral-800"
                    >
                      <ChevronLeft size={13} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={paymentPage >= paymentTotalPages}
                      onClick={() => setPaymentPage((p) => p + 1)}
                      className="h-7 text-xs border-neutral-800"
                    >
                      <ChevronRight size={13} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USERS */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
              <Input
                placeholder="Search by full name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 bg-[#141416] border-neutral-800 text-neutral-200 text-xs h-9 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <Filter size={12} /> Tier:
              </span>
              <select
                value={userPlanFilter}
                onChange={(e) => {
                  setUserPlanFilter(e.target.value);
                  setUserPage(1);
                }}
                className="bg-[#141416] border border-neutral-800 text-neutral-200 text-xs rounded-md px-2.5 h-9 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Plans</option>
                <option value="pro">PRO</option>
                <option value="monthly">Monthly</option>
                <option value="free">Free</option>
              </select>
            </div>
          </div>

          {loading ? (
            <AdminTableSkeleton />
          ) : filteredUsers.length === 0 ? (
            <div className="border border-dashed border-neutral-800 rounded-xl p-12 text-center bg-[#141416]/50">
              <Users className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-300">No users found</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                {configured ? "No candidate accounts match the filters." : "Connect API key to sync users."}
              </p>
            </div>
          ) : (
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-[#141416]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/80 text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Candidate / User</th>
                      <th className="py-3 px-4">Plan Tier</th>
                      <th className="py-3 px-4">Plan Expiry</th>
                      <th className="py-3 px-4">Credits Used Today</th>
                      <th className="py-3 px-4">Student Status</th>
                      <th className="py-3 px-4">Registered At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                    {filteredUsers.map((u) => {
                      const isPro = u.subscription_plan?.toLowerCase() === "pro";
                      return (
                        <tr key={u.id || u.email} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{u.full_name || "User"}</div>
                            <div className="text-[11px] text-neutral-400 font-mono">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            {isPro ? (
                              <span className="font-bold text-[11px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 inline-flex items-center gap-1">
                                <Sparkles size={11} className="text-purple-400" /> PRO
                              </span>
                            ) : u.subscription_plan?.toLowerCase() === "monthly" ? (
                              <span className="font-medium text-[11px] px-2.5 py-0.5 rounded-full bg-blue-950/70 text-blue-300 border border-blue-800">
                                Monthly
                              </span>
                            ) : (
                              <span className="font-medium text-[11px] px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                                Free
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-400">
                            {u.plan_expiry ? new Date(u.plan_expiry).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }) : "Permanent / None"}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-neutral-200 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                              {u.credits_used_today || 0} credits
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-400">
                            {u.is_student ? (
                              <span className="text-emerald-400 font-medium">Student Verified</span>
                            ) : (
                              "Standard"
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-400 whitespace-nowrap">
                            {u.registered_at ? new Date(u.registered_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }) : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {userTotalPages > 1 && (
                <div className="p-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <span>Page {userPage} of {userTotalPages}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      className="h-7 text-xs border-neutral-800"
                    >
                      <ChevronLeft size={13} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={userPage >= userTotalPages}
                      onClick={() => setUserPage((p) => p + 1)}
                      className="h-7 text-xs border-neutral-800"
                    >
                      <ChevronRight size={13} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
