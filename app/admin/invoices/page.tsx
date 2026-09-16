"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  CreditCard, ArrowUpRight, Clock, CheckCircle2, 
  Loader2, Plus, Filter, Download, Trash2, 
  Send, Copy, Printer, FileText, Calendar, 
  DollarSign, Briefcase, Phone, Mail, Hash, 
  Search, X, ExternalLink, Check, AlertCircle,
  Eye, RefreshCw, Layers, ShieldCheck, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Official GrowX Entity Details ---
const COMPANY = {
  name: "GrowXLabsTech",
  website: "growxlabs.tech",
  email: "hello@growxlabs.tech",
  address: "Guntur, Andhra Pradesh, India",
  msme: "UDYAM-AP-22-0063260",
  upi: "growxlabs@upi"
};

type LineItem = {
  id: string;
  description: string;
  qty: number;
  rate: number;
};

type InvoiceStatus = "pending" | "paid" | "overdue" | "cancelled";

const CURRENCIES = [
  { label: "₹ INR", value: "INR", symbol: "₹" },
  { label: "$ USD", value: "USD", symbol: "$" },
  { label: "€ EUR", value: "EUR", symbol: "€" }
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // --- Generator State ---
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    businessName: "",
    projectName: "",
    invoiceNumber: "INV-2026-001",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().split('T')[0];
    })(),
    currency: "INR",
    paymentType: "Full Payment",
    gstEnabled: false,
    amountPaid: 0,
    razorpayLink: "",
    notes: "Payment due within 7 days. Milestone releases proceed upon settlement.",
    lineItems: [
      { id: '1', description: 'Product Engineering - Sprint 1', qty: 1, rate: 50000 }
    ] as LineItem[],
    status: "pending" as InvoiceStatus
  });

  // --- Calculations ---
  const currency = CURRENCIES.find(c => c.value === form.currency) || CURRENCIES[0];
  const subtotal = useMemo(() => form.lineItems.reduce((acc, item) => acc + (item.qty * item.rate), 0), [form.lineItems]);
  const gstAmount = form.gstEnabled ? subtotal * 0.18 : 0;
  const total = subtotal + gstAmount;
  const balanceDue = Math.max(0, total - form.amountPaid);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/invoice/list");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setInvoices(list);

      if (list.length > 0) {
        setForm(prev => ({
          ...prev,
          invoiceNumber: `INV-2026-${String(list.length + 1).padStart(3, '0')}`
        }));
      }
    } catch (e) {
      console.error("Failed to load invoices:", e);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = () => {
    setForm(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: Math.random().toString(), description: "", qty: 1, rate: 0 }]
    }));
  };

  const removeLineItem = (id: string) => {
    if (form.lineItems.length > 1) {
      setForm(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter(item => item.id !== id)
      }));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setForm(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleSubmit = async () => {
    if (!form.businessName && !form.clientName) {
      alert("Please provide a client or business name.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/invoice/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: form.clientName,
          client_email: form.clientEmail,
          client_phone: form.clientPhone,
          business_name: form.businessName,
          project_name: form.projectName,
          invoice_number: form.invoiceNumber,
          amount: total,
          subtotal: subtotal,
          currency: form.currency,
          due_date: form.dueDate,
          items: form.lineItems,
          notes: form.notes,
          payment_type: form.paymentType,
          razorpay_link: form.razorpayLink,
          balance_due: balanceDue,
          status: form.status
        })
      });
      if (res.ok) {
        setShowGenerator(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create invoice");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred while creating invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = (inv: any) => {
    setForm({
      ...form,
      clientName: inv.client_name || "",
      clientEmail: inv.client_email || "",
      clientPhone: inv.client_phone || "",
      businessName: inv.business_name || "",
      projectName: inv.project_name || "",
      currency: inv.currency || "INR",
      lineItems: Array.isArray(inv.items) && inv.items.length > 0 ? inv.items : [{ id: '1', description: 'Engineering Service', qty: 1, rate: Number(inv.amount) || 0 }],
      notes: inv.notes || form.notes,
      amountPaid: 0,
      gstEnabled: false,
      paymentType: "Full Payment",
      razorpayLink: "",
      invoiceNumber: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d.toISOString().split('T')[0];
      })(),
      status: "pending"
    });
    setShowGenerator(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/invoice/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const sendInvoiceEmail = async (inv: any) => {
    setSendingId(inv.id);
    try {
      const res = await fetch("/api/invoice/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: inv.id, email: inv.client_email })
      });
      if (res.ok) {
        alert(`Invoice dispatched to ${inv.client_email || "client"}.`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to dispatch email.");
      }
    } catch (e) {
      console.error(e);
      alert("Error dispatching email.");
    } finally {
      setSendingId(null);
    }
  };

  const copyInvoiceNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(num);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Metrics Aggregates ---
  const metrics = useMemo(() => {
    const totalBilled = invoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
    const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
    const totalDue = invoices.reduce((acc, inv) => acc + (Number(inv.balance_due) ?? (inv.status === 'paid' ? 0 : Number(inv.amount) || 0)), 0);
    const pendingCount = invoices.filter(inv => inv.status === 'pending').length;
    const paidCount = invoices.filter(inv => inv.status === 'paid').length;
    const overdueCount = invoices.filter(inv => {
      if (inv.status === 'paid' || !inv.due_date) return false;
      const d = new Date(inv.due_date);
      return !isNaN(d.getTime()) && d.getTime() < Date.now();
    }).length;

    return { totalBilled, totalPaid, totalDue, pendingCount, paidCount, overdueCount };
  }, [invoices]);

  // --- Filtered Invoices ---
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const clientStr = (inv.client_name || "").toLowerCase();
      const bizStr = (inv.business_name || "").toLowerCase();
      const numStr = (inv.invoice_number || "").toLowerCase();
      const projStr = (inv.project_name || "").toLowerCase();
      const query = searchTerm.toLowerCase().trim();

      const matchesSearch = !query || clientStr.includes(query) || bizStr.includes(query) || numStr.includes(query) || projStr.includes(query);

      let matchesStatus = true;
      if (statusFilter === "pending") matchesStatus = inv.status === "pending";
      else if (statusFilter === "paid") matchesStatus = inv.status === "paid";
      else if (statusFilter === "overdue") {
        const isPast = inv.due_date && !isNaN(new Date(inv.due_date).getTime()) && new Date(inv.due_date).getTime() < Date.now();
        matchesStatus = inv.status === "overdue" || (isPast && inv.status !== "paid");
      }

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          nav, aside, .no-print, .admin-dock, header { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-container {
            border: none !important; box-shadow: none !important; margin: 0 !important;
            padding: 0 !important; width: 100% !important; position: absolute; top: 0; left: 0;
          }
        }
      `}</style>

      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border-subtle)] pb-6 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0075de]/10 border border-[#0075de]/20 rounded-lg text-[#0075de]">
              <CreditCard size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Billing & Invoices
              </h1>
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Generate client invoices, track settlement records, and issue digital payment certificates.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link href="/admin/consulting-finance">
            <Button variant="outline" className="h-9 px-3.5 text-xs font-semibold rounded-lg flex items-center gap-2 border-[var(--border-subtle)] hover:bg-[var(--surface-2)]">
              <Layers size={14} className="text-[#0075de]" />
              Consulting Milestones
              <ArrowUpRight size={13} className="text-[var(--text-muted)]" />
            </Button>
          </Link>
          <Button 
            onClick={() => setShowGenerator(true)}
            className="h-9 px-4 bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2"
          >
            <Plus size={14} /> Create Invoice
          </Button>
        </div>
      </div>

      {/* --- KPI Summary Metric Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <Card className="p-4 bg-[var(--card)] border border-[var(--border-subtle)] rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Invoiced</span>
            <div className="p-1.5 rounded-md bg-[var(--surface-2)] text-[var(--text-secondary)]">
              <FileText size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              ₹{metrics.totalBilled.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"} generated
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-[var(--card)] border border-[var(--border-subtle)] rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-[11px] font-medium uppercase tracking-wider">Collected Revenue</span>
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold tracking-tight text-emerald-500">
              ₹{metrics.totalPaid.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              {metrics.paidCount} settled in full
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-[var(--card)] border border-[var(--border-subtle)] rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-[11px] font-medium uppercase tracking-wider">Outstanding Balance</span>
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
              <Clock size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              ₹{metrics.totalDue.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              {metrics.pendingCount} awaiting clearance
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-[var(--card)] border border-[var(--border-subtle)] rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-[11px] font-medium uppercase tracking-wider">Overdue Alerts</span>
            <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-500">
              <AlertCircle size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {metrics.overdueCount}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              {metrics.overdueCount > 0 ? "Requires client follow-up" : "All payments on schedule"}
            </p>
          </div>
        </Card>
      </div>

      {/* --- Filter & Search Toolbar --- */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 no-print">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by client, invoice #, or service..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-[var(--card)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#0075de] transition-colors shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: "all", label: "All", count: invoices.length },
            { key: "pending", label: "Pending", count: metrics.pendingCount },
            { key: "paid", label: "Paid", count: metrics.paidCount },
            { key: "overdue", label: "Overdue", count: metrics.overdueCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer",
                statusFilter === tab.key
                  ? "bg-[#0075de] text-white shadow-sm"
                  : "bg-[var(--card)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--surface-2)]"
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full",
                statusFilter === tab.key ? "bg-white/20 text-white" : "bg-[var(--surface-2)] text-[var(--text-muted)]"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            title="Refresh Invoices"
            className="h-8 w-8 p-0 border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] shrink-0"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* --- Invoices List / Table --- */}
      {loading ? (
        <Card className="h-64 flex flex-col items-center justify-center border border-[var(--border-subtle)] bg-[var(--card)] rounded-xl">
          <Loader2 className="animate-spin text-[#0075de] h-6 w-6" />
          <p className="text-xs text-[var(--text-secondary)] mt-3">Loading billing index...</p>
        </Card>
      ) : filteredInvoices.length === 0 ? (
        <Card className="h-72 flex flex-col items-center justify-center border border-dashed border-[var(--border-subtle)] bg-[var(--card)] text-center p-8 rounded-xl no-print">
          <div className="h-12 w-12 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)] mb-3">
            <FileText size={22} />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">No invoices found</h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mt-1">
            {searchTerm || statusFilter !== "all" 
              ? "No invoices match your current search or status filter." 
              : "Generate your first client invoice with custom line items and tax breakdowns."}
          </p>
          {(searchTerm || statusFilter !== "all") ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
              className="mt-4 text-xs font-semibold"
            >
              Reset Filters
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setShowGenerator(true)}
              className="mt-4 bg-[#0075de] text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus size={14} /> Create First Invoice
            </Button>
          )}
        </Card>
      ) : (
        <Card className="border border-[var(--border-subtle)] bg-[var(--card)] rounded-xl shadow-sm overflow-hidden no-print">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-1)]">
                <tr className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client / Account</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Issued Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredInvoices.map((inv) => {
                  const curr = CURRENCIES.find(c => c.value === inv.currency) || CURRENCIES[0];
                  const hasDueDate = inv.due_date && !isNaN(new Date(inv.due_date).getTime());
                  const isOverdue = hasDueDate && new Date(inv.due_date).getTime() < Date.now() && inv.status !== 'paid';
                  const invoiceNum = inv.invoice_number || `INV-${inv.id.slice(0, 8).toUpperCase()}`;

                  return (
                    <tr key={inv.id} className="hover:bg-[var(--surface-1)]/60 transition-colors group">
                      {/* Invoice Number */}
                      <td className="py-3.5 px-4 font-mono font-medium text-[var(--text-primary)]">
                        <div className="flex items-center gap-2">
                          <span>{invoiceNum}</span>
                          <button
                            onClick={() => copyInvoiceNumber(invoiceNum)}
                            title="Copy invoice number"
                            className="text-[var(--text-muted)] hover:text-[#0075de] transition-colors p-1"
                          >
                            {copiedId === invoiceNum ? (
                              <Check size={12} className="text-emerald-500" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Client Account */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[var(--text-primary)] text-xs">
                            {inv.business_name || inv.client_name || "Enterprise Account"}
                          </p>
                          {(inv.client_email || inv.client_name) && (
                            <p className="text-[11px] text-[var(--text-secondary)]">
                              {inv.client_email || inv.client_name}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Project / Service */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                          {inv.project_name || "Engineering Service"}
                        </span>
                      </td>

                      {/* Issued Date */}
                      <td className="py-3.5 px-4 text-[var(--text-secondary)] text-[11px]">
                        {inv.created_at ? new Date(inv.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-[11px]">
                        {hasDueDate ? (
                          <span className={cn(isOverdue ? "text-rose-500 font-medium" : "text-[var(--text-secondary)]")}>
                            {new Date(inv.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">On Receipt</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {inv.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Paid
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold font-mono text-[var(--text-primary)] text-sm">
                          {curr.symbol}{Number(inv.amount || 0).toLocaleString("en-IN")}
                        </div>
                        {inv.balance_due && inv.balance_due > 0 && inv.status !== 'paid' && (
                          <p className="text-[10px] text-[var(--text-muted)]">
                            Balance: {curr.symbol}{Number(inv.balance_due).toLocaleString("en-IN")}
                          </p>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Preview / View Certificate */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (inv.pdf_url) {
                                window.open(inv.pdf_url, "_blank");
                              } else {
                                setPreviewInvoice(inv);
                              }
                            }}
                            title={inv.pdf_url ? "Open PDF Document" : "Preview Settlement Certificate"}
                            className="h-8 px-2 text-[var(--text-secondary)] hover:text-[#0075de] hover:bg-[var(--surface-2)]"
                          >
                            <Eye size={14} />
                          </Button>

                          {/* Toggle Paid / Pending */}
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={updatingId === inv.id}
                            onClick={() => updateStatus(inv.id, inv.status === 'paid' ? 'pending' : 'paid')}
                            title={inv.status === 'paid' ? "Mark as Pending" : "Mark as Paid"}
                            className={cn(
                              "h-8 px-2",
                              inv.status === 'paid' ? "text-emerald-500 hover:text-amber-500" : "text-[var(--text-secondary)] hover:text-emerald-500"
                            )}
                          >
                            <CheckCircle2 size={14} />
                          </Button>

                          {/* Send Email */}
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={sendingId === inv.id}
                            onClick={() => sendInvoiceEmail(inv)}
                            title="Send invoice via email"
                            className="h-8 px-2 text-[var(--text-secondary)] hover:text-[#0075de] hover:bg-[var(--surface-2)]"
                          >
                            <Send size={13} className={sendingId === inv.id ? "animate-pulse text-[#0075de]" : ""} />
                          </Button>

                          {/* Duplicate */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(inv)}
                            title="Duplicate invoice template"
                            className="h-8 px-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                          >
                            <Copy size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ============================================================ */}
      {/* --- CREATE INVOICE MODAL / DRAWER --- */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showGenerator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#0075de]/10 text-[#0075de] border border-[#0075de]/20">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">New Client Invoice</h2>
                    <p className="text-xs text-[var(--text-secondary)]">Create an itemized billing invoice for client settlement.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGenerator(false)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <div className="space-y-6 text-xs">
                {/* Section 1: Client & Invoice Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--text-primary)]">Company / Business Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Varshith Engineering Ltd."
                      value={form.businessName}
                      onChange={e => setForm({ ...form, businessName: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--text-primary)]">Contact Person Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Varshith Reddy"
                      value={form.clientName}
                      onChange={e => setForm({ ...form, clientName: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--text-primary)]">Client Email</label>
                    <input
                      type="email"
                      placeholder="client@company.com"
                      value={form.clientEmail}
                      onChange={e => setForm({ ...form, clientEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--text-primary)]">Client Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.clientPhone}
                      onChange={e => setForm({ ...form, clientPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]"
                    />
                  </div>
                </div>

                {/* Section 2: Invoice Numbers, Dates & Currency */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)]">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--text-secondary)] text-[11px]">Invoice #</label>
                    <input
                      type="text"
                      value={form.invoiceNumber}
                      onChange={e => setForm({ ...form, invoiceNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[var(--card)] border border-[var(--border-subtle)] rounded-md font-mono text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--text-secondary)] text-[11px]">Issue Date</label>
                    <input
                      type="date"
                      value={form.invoiceDate}
                      onChange={e => setForm({ ...form, invoiceDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[var(--card)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--text-secondary)] text-[11px]">Due Date</label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={e => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[var(--card)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--text-secondary)] text-[11px]">Currency</label>
                    <select
                      value={form.currency}
                      onChange={e => setForm({ ...form, currency: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[var(--card)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)]"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section 3: Line Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--text-primary)] text-xs">Itemized Deliverables / Milestones</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLineItem}
                      className="h-7 px-2.5 text-xs font-semibold gap-1"
                    >
                      <Plus size={12} /> Add Item
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {form.lineItems.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Description of milestone or engineering sprint..."
                          value={item.description}
                          onChange={e => updateLineItem(item.id, "description", e.target.value)}
                          className="flex-1 px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)]"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.qty}
                          onChange={e => updateLineItem(item.id, "qty", parseInt(e.target.value) || 1)}
                          className="w-16 px-2.5 py-2 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg text-xs text-center text-[var(--text-primary)]"
                        />
                        <input
                          type="number"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={e => updateLineItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                          className="w-28 px-2.5 py-2 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg text-xs text-right text-[var(--text-primary)] font-mono"
                        />
                        <div className="w-24 text-right font-mono font-semibold text-[var(--text-primary)] px-2">
                          {currency.symbol}{(item.qty * item.rate).toLocaleString("en-IN")}
                        </div>
                        {form.lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLineItem(item.id)}
                            className="p-2 text-[var(--text-muted)] hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Taxes, Notes & Financial Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-subtle)]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border-subtle)]">
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">Apply GST (18%)</p>
                        <p className="text-[10px] text-[var(--text-muted)]">Goods & Services Tax for domestic clients</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.gstEnabled}
                        onChange={e => setForm({ ...form, gstEnabled: e.target.checked })}
                        className="h-4 w-4 rounded text-[#0075de] cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-[var(--text-secondary)] text-[11px]">Razorpay Payment Link (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://rzp.io/l/..."
                        value={form.razorpayLink}
                        onChange={e => setForm({ ...form, razorpayLink: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-[var(--text-secondary)] text-[11px]">Terms / Internal Notes</label>
                      <textarea
                        rows={2}
                        value={form.notes}
                        onChange={e => setForm({ ...form, notes: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  {/* Financial Total Box */}
                  <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-[var(--text-secondary)]">
                        <span>Subtotal:</span>
                        <span className="font-mono">{currency.symbol}{subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      {form.gstEnabled && (
                        <div className="flex justify-between text-[var(--text-secondary)]">
                          <span>GST (18%):</span>
                          <span className="font-mono">{currency.symbol}{gstAmount.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[var(--text-secondary)]">
                        <span>Amount Paid:</span>
                        <div className="flex items-center gap-1">
                          <span>{currency.symbol}</span>
                          <input
                            type="number"
                            min="0"
                            value={form.amountPaid}
                            onChange={e => setForm({ ...form, amountPaid: parseFloat(e.target.value) || 0 })}
                            className="w-24 px-2 py-0.5 bg-[var(--card)] border border-[var(--border-subtle)] rounded text-right font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--border-subtle)]">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-bold text-[var(--text-primary)]">Balance Due:</span>
                        <span className="text-xl font-bold font-mono text-[#0075de]">
                          {currency.symbol}{balanceDue.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline text-[11px] text-[var(--text-muted)] mt-1">
                        <span>Grand Total:</span>
                        <span className="font-mono">{currency.symbol}{total.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGenerator(false)}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-semibold px-5 flex items-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 size={14} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Check size={14} /> Generate & Save Invoice</>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* --- INVOICE PRINTABLE / DIGITAL CERTIFICATE MODAL --- */}
      {/* ============================================================ */}
      <AnimatePresence>
        {previewInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white text-neutral-900 rounded-2xl shadow-2xl p-8 sm:p-12 space-y-8 relative print-container"
            >
              {/* Close & Print Buttons */}
              <div className="flex items-center justify-between border-b pb-4 no-print">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Digital Settlement Certificate
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => window.print()}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Printer size={13} /> Print / Save PDF
                  </Button>
                  <button
                    onClick={() => setPreviewInvoice(null)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Certificate Branding Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-neutral-950">
                    {COMPANY.name}
                  </h2>
                  <p className="text-xs text-neutral-500">{COMPANY.address}</p>
                  <p className="text-xs text-neutral-500">{COMPANY.email} · {COMPANY.website}</p>
                  <p className="text-[10px] text-neutral-400 mt-1">MSME Reg: {COMPANY.msme}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-widest text-neutral-400">INVOICE</div>
                  <div className="text-lg font-mono font-bold text-neutral-900">
                    {previewInvoice.invoice_number || `INV-${previewInvoice.id.slice(0, 8).toUpperCase()}`}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Date: {new Date(previewInvoice.created_at || Date.now()).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Bill To Info */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 flex justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Billed To</span>
                  <p className="font-bold text-sm text-neutral-900 mt-0.5">
                    {previewInvoice.business_name || previewInvoice.client_name || "Enterprise Account"}
                  </p>
                  {previewInvoice.client_email && (
                    <p className="text-xs text-neutral-500">{previewInvoice.client_email}</p>
                  )}
                  {previewInvoice.client_phone && (
                    <p className="text-xs text-neutral-500">{previewInvoice.client_phone}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Payment Status</span>
                  <div className="mt-1">
                    {previewInvoice.status === 'paid' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        PAID & SETTLED
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        PAYMENT PENDING
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <table className="w-full text-left text-xs">
                  <thead className="border-b-2 border-neutral-100 text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                    <tr>
                      <th className="py-2.5">Description</th>
                      <th className="py-2.5 text-center w-16">Qty</th>
                      <th className="py-2.5 text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {Array.isArray(previewInvoice.items) && previewInvoice.items.length > 0 ? (
                      previewInvoice.items.map((it: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-3 font-medium text-neutral-800">{it.description || "Engineering Service"}</td>
                          <td className="py-3 text-center text-neutral-500">{it.qty || 1}</td>
                          <td className="py-3 text-right font-mono font-bold text-neutral-900">
                            ₹{((it.qty || 1) * (it.rate || 0)).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-3 font-medium text-neutral-800">{previewInvoice.project_name || "Custom Engineering & Consulting Service"}</td>
                        <td className="py-3 text-center text-neutral-500">1</td>
                        <td className="py-3 text-right font-mono font-bold text-neutral-900">
                          ₹{Number(previewInvoice.amount || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-between items-start pt-4 border-t border-neutral-100">
                <div className="space-y-1 text-xs text-neutral-500 max-w-xs">
                  <p className="font-bold text-neutral-700">Bank & UPI Settlement:</p>
                  <p className="font-mono text-neutral-900">{COMPANY.upi}</p>
                  <p className="text-[10px] text-neutral-400 mt-2">
                    Official digital receipt certified by GrowXLabs Enterprise Systems.
                  </p>
                </div>
                <div className="text-right space-y-1 text-xs">
                  <div className="text-neutral-500">Total Amount:</div>
                  <div className="text-2xl font-black font-mono text-neutral-950">
                    ₹{Number(previewInvoice.amount || 0).toLocaleString("en-IN")}
                  </div>
                  {previewInvoice.balance_due !== undefined && (
                    <div className="text-[11px] text-neutral-500">
                      Balance Remaining: ₹{Number(previewInvoice.balance_due).toLocaleString("en-IN")}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
