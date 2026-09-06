"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { 
  CreditCard, ArrowUpRight, Clock, CheckCircle2, 
  Loader2, Plus, Filter, Download, Trash2, 
  Send, Copy, Printer, Save, User as UserIcon,
  FileText, Calendar, DollarSign, Globe,
  Briefcase, Phone, Mail, Hash, ChevronDown,
  Copy as CopyIcon, RotateCcw, Search, X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Hardcoded Company Details ---
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
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      d.setDate(d.getDate() + 3);
      return d.toISOString().split('T')[0];
    })(),
    currency: "INR",
    paymentType: "Full Payment",
    gstEnabled: false,
    amountPaid: 0,
    razorpayLink: "",
    notes: "Payment due within 3 days. Work paused if overdue. No refund after work started.",
    lineItems: [
      { id: '1', description: 'Project Work - Phase 1', qty: 1, rate: 25000 }
    ] as LineItem[],
    status: "pending" as InvoiceStatus
  });

  // --- Computations ---
  const currency = CURRENCIES.find(c => c.value === form.currency) || CURRENCIES[0];
  const subtotal = useMemo(() => form.lineItems.reduce((acc, item) => acc + (item.qty * item.rate), 0), [form.lineItems]);
  const gstAmount = form.gstEnabled ? subtotal * 0.18 : 0;
  const total = subtotal + gstAmount;
  const balanceDue = total - form.amountPaid;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/invoice/list");
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
      
      // Auto-increment invoice number
      if (Array.isArray(data) && data.length > 0) {
        setForm(prev => ({
          ...prev,
          invoiceNumber: `INV-2026-${String(data.length + 1).padStart(3, '0')}`
        }));
      }
    } catch (e) {
      console.error(e);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = () => {
    setForm({
      ...form,
      lineItems: [...form.lineItems, { id: Math.random().toString(), description: "", qty: 1, rate: 0 }]
    });
  };

  const removeLineItem = (id: string) => {
    if (form.lineItems.length > 1) {
      setForm({
        ...form,
        lineItems: form.lineItems.filter(item => item.id !== id)
      });
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setForm({
      ...form,
      lineItems: form.lineItems.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const handleSubmit = async () => {
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
      }
    } catch (error) {
      console.error(error);
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
      lineItems: inv.items || [{ id: '1', description: '', qty: 1, rate: 0 }],
      notes: inv.notes || form.notes,
      status: "pending"
    });
    setShowGenerator(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/invoice/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handlePrint = () => window.print();

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10 pb-20">
      <style jsx global>{`
        @media print {
          nav, aside, .no-print, .actions-bar { display: none !important; }
          body { background: white !important; color: black !important; }
          .invoice-preview {
            border: none !important; box-shadow: none !important; margin: 0 !important;
            padding: 0 !important; width: 100% !important; position: absolute; top: 0; left: 0;
          }
          .zebra-stripe tr:nth-child(even) { background-color: #f9fafb !important; }
        }
      `}</style>

      {/* Product View Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-[#141416] border border-neutral-800 rounded-xl w-fit no-print">
        <button
          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-black shadow-sm transition-all flex items-center gap-2"
        >
          <CreditCard size={13} />
          GrowX Consulting Invoices
        </button>
        <Link
          href="/admin/resumeforge"
          className="px-4 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          ResumeForge AI Invoices
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
            Venture
          </span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <CreditCard className="text-primary" /> Billing & Invoices
          </h1>
          <p className="text-white/40 font-medium tracking-tight">Project Payments · GrowXLabsTech</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowGenerator(!showGenerator)}
            className="bg-white text-black hover:bg-neutral-200 px-8 font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-white/5 h-12 rounded-full"
          >
            {showGenerator ? "Discard Draft" : <><Plus size={14} className="mr-2" /> New Invoice</>}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showGenerator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="grid lg:grid-cols-2 gap-10 no-print"
          >
            {/* FORM SIDE */}
            <Card className="p-8 border-[var(--border-subtle)] bg-[var(--surface-1)] rounded-2xl space-y-8 h-fit">
               <div className="space-y-6">
                 {/* Client Info */}
                 <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-2">Client Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1 flex items-center gap-2"><UserIcon size={12}/> Name</label>
                          <input 
                            value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})}
                            className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl h-12 px-4 text-sm font-bold text-white focus:border-[var(--border-hover)] outline-none transition-all" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1 flex items-center gap-2"><Mail size={12}/> Email</label>
                          <input 
                            value={form.clientEmail} onChange={e => setForm({...form, clientEmail: e.target.value})}
                            className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl h-12 px-4 text-sm font-bold text-white focus:border-[var(--border-hover)] outline-none transition-all" 
                          />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1 flex items-center gap-2"><Phone size={12}/> Phone</label>
                          <input 
                            value={form.clientPhone} onChange={e => setForm({...form, clientPhone: e.target.value})}
                            className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl h-12 px-4 text-sm font-bold text-white focus:border-[var(--border-hover)] outline-none transition-all" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1 flex items-center gap-2"><Briefcase size={12}/> Business</label>
                          <input 
                            value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})}
                            className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl h-12 px-4 text-sm font-bold text-white focus:border-[var(--border-hover)] outline-none transition-all" 
                          />
                       </div>
                    </div>
                 </div>

                 {/* Project Info */}
                 <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-2">Project Details</h3>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Project Name</label>
                       <input 
                         placeholder="e.g. Next.js SaaS Architecture"
                         value={form.projectName} onChange={e => setForm({...form, projectName: e.target.value})}
                         className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl h-12 px-4 text-sm font-bold text-white focus:border-[var(--border-hover)] outline-none transition-all" 
                       />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1 flex items-center gap-2"><Hash size={12}/> ID</label>
                          <input 
                            value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})}
                            className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl h-12 px-4 text-sm font-bold text-white focus:border-[var(--border-hover)] outline-none transition-all" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1 flex items-center gap-2"><Calendar size={12}/> Due</label>
                          <input 
                            type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})}
                            className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl h-12 px-4 text-sm font-bold text-white focus:border-[var(--border-hover)] outline-none transition-all" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1 flex items-center gap-2"><Globe size={12}/> Currency</label>
                          <select 
                            value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}
                            className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl h-12 px-4 text-sm font-bold text-white focus:border-[var(--border-hover)] outline-none appearance-none"
                          >
                             {CURRENCIES.map(c => <option key={c.value} value={c.value} className="bg-neutral-900">{c.label}</option>)}
                          </select>
                       </div>
                    </div>
                 </div>

                 {/* Line Items */}
                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Line Items</h3>
                       <Button onClick={addLineItem} variant="outline" className="h-8 px-4 rounded-full border-white/10 text-[10px] font-black uppercase tracking-widest">
                          <Plus size={12} className="mr-2" /> Add Item
                       </Button>
                    </div>
                    <div className="space-y-3">
                       {form.lineItems.map((item) => (
                          <div key={item.id} className="flex gap-3 items-center group">
                             <input 
                               placeholder="Description" value={item.description}
                               onChange={e => updateLineItem(item.id, 'description', e.target.value)}
                               className="flex-[4] bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl h-11 px-4 text-xs text-white outline-none focus:border-primary/50"
                             />
                             <input 
                               type="number" placeholder="Qty" value={item.qty}
                               onChange={e => updateLineItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                               className="flex-1 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl h-11 px-4 text-xs text-center text-white outline-none focus:border-primary/50"
                             />
                             <input 
                               type="number" placeholder="Rate" value={item.rate}
                               onChange={e => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                               className="flex-[1.5] bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl h-11 px-4 text-xs text-right text-white outline-none focus:border-primary/50"
                             />
                             <Button onClick={() => removeLineItem(item.id)} variant="ghost" className="h-11 w-11 p-0 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl">
                                <Trash2 size={16} />
                             </Button>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Financial Settings */}
                 <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Payment Type</label>
                          <select 
                            value={form.paymentType} 
                            onChange={e => {
                               const type = e.target.value;
                               let newPaid = form.amountPaid;
                               if (type === "Advance 50%") newPaid = total * 0.5;
                               if (type === "Full Payment") newPaid = total;
                               if (type === "Final Balance 50%") newPaid = total;
                               
                               setForm({...form, paymentType: type, amountPaid: newPaid});
                            }}
                            className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl h-11 px-4 text-sm font-bold text-white outline-none appearance-none"
                          >
                             <option value="Full Payment" className="bg-neutral-900">100% Full Payment</option>
                             <option value="Advance 50%" className="bg-neutral-900">50% Advance</option>
                             <option value="Final Balance 50%" className="bg-neutral-900">50% Final Balance</option>
                             <option value="Custom" className="bg-neutral-900">Custom Amount</option>
                          </select>
                       </div>
                       <div className="flex items-center justify-between bg-white/5 px-4 h-11 rounded-xl">
                          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Enable GST (18%)</span>
                          <button 
                            onClick={() => setForm({...form, gstEnabled: !form.gstEnabled})}
                            className={cn("w-10 h-5 rounded-full p-1 transition-all", form.gstEnabled ? "bg-primary" : "bg-white/10")}
                          >
                            <div className={cn("w-3 h-3 bg-white rounded-full transition-all", form.gstEnabled ? "translate-x-5" : "translate-x-0")} />
                          </button>
                       </div>
                       {!form.gstEnabled && <p className="text-[8px] text-white/20 uppercase tracking-widest font-black">* GST not applicable below ₹20L annual turnover</p>}
                    </div>
                    <div className="space-y-4 text-right">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Amount Paid ({currency.symbol})</label>
                          <input 
                            type="number" value={form.amountPaid} onChange={e => setForm({...form, amountPaid: parseFloat(e.target.value) || 0})}
                            className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl h-11 px-4 text-right text-sm font-bold text-white outline-none"
                          />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Balance Due</p>
                          <p className="text-2xl font-black text-primary">{currency.symbol}{balanceDue.toLocaleString()}</p>
                       </div>
                    </div>
                 </div>

                 {/* Payment Methods */}
                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Razorpay Payment Link</label>
                       <div className="relative">
                          <input 
                            placeholder="https://rzp.io/l/..." value={form.razorpayLink} onChange={e => setForm({...form, razorpayLink: e.target.value})}
                            className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl h-11 px-4 text-sm font-bold text-white outline-none pr-12 focus:border-primary/50" 
                          />
                          <CopyIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Internal Notes / Terms</label>
                       <textarea 
                         value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                         className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl p-4 text-xs font-medium text-white/60 outline-none focus:border-primary/50 min-h-[80px]" 
                       />
                    </div>
                 </div>

                 <div className="pt-6 grid grid-cols-2 gap-4">
                    <Button onClick={handleSubmit} disabled={submitting} className="h-14 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-2xl shadow-white/5">
                       {submitting ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-3" /> Execute & Store</>}
                    </Button>
                    <Button onClick={handlePrint} variant="outline" className="h-14 border-zinc-800 text-white/40 hover:text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl">
                       <Printer size={16} className="mr-3" /> System Preview
                    </Button>
                 </div>
               </div>
            </Card>

            {/* LIVE PREVIEW */}
            <div className="invoice-preview relative">
               <div className="bg-white rounded-3xl shadow-2xl overflow-hidden text-black min-h-[900px] flex flex-col scale-[0.98] origin-top">
                  {/* PDF Header */}
                  <div className="bg-[#0D1B4B] p-16 text-white flex justify-between items-end">
                     <div className="space-y-2">
                        <h2 className="text-4xl font-black tracking-tighter leading-none">{COMPANY.name}</h2>
                        <p className="text-[10px] font-black tracking-[0.5em] uppercase opacity-40">Project Invoice</p>
                     </div>
                     <div className="text-right">
                        <h1 className="text-7xl font-black tracking-tighter opacity-10 mb-2">INVOICE</h1>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Certificate ID</p>
                           <p className="font-black text-xl tracking-tight">{form.invoiceNumber}</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-16 flex-grow space-y-16">
                     {/* Entity Info */}
                     <div className="grid grid-cols-2 gap-16">
                        <div className="space-y-4">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300">Bill To</p>
                           <div className="space-y-1">
                              <p className="text-2xl font-black tracking-tight">{form.businessName || "Dynamic Client Entity"}</p>
                              <p className="font-bold text-neutral-500">{form.clientName}</p>
                              <p className="text-sm text-neutral-400">{form.clientEmail}</p>
                              <p className="text-sm text-neutral-400">{form.clientPhone}</p>
                           </div>
                        </div>
                        <div className="text-right space-y-4">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300">From</p>
                           <div className="space-y-1">
                              <p className="text-2xl font-black tracking-tight">{COMPANY.name}</p>
                              <p className="font-bold text-neutral-500">{COMPANY.address}</p>
                              <p className="text-sm text-neutral-400">{COMPANY.email}</p>
                              <p className="text-sm font-black text-primary uppercase mt-2 tracking-widest">{COMPANY.website}</p>
                              <p className="text-[10px] text-neutral-300 mt-2">MSME: {COMPANY.msme}</p>
                           </div>
                        </div>
                     </div>

                     {/* Metrics Bar */}
                     <div className="grid grid-cols-3 gap-1 px-1 bg-neutral-100 rounded-3xl overflow-hidden py-1">
                        <div className="bg-white p-6 text-center">
                           <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">Project Description</p>
                           <p className="font-black text-sm">{form.projectName || "Standard Engineering"}</p>
                        </div>
                        <div className="bg-white p-6 text-center">
                           <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">Date Issued</p>
                           <p className="font-black text-sm">{new Date(form.invoiceDate).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-[#00A86B]/5 p-6 text-center">
                           <p className="text-[9px] font-black uppercase tracking-widest text-[#00A86B] mb-2">Due Date</p>
                           <p className="font-black text-sm text-[#00A86B]">{new Date(form.dueDate).toLocaleDateString()}</p>
                        </div>
                     </div>

                     {/* Line Items Table */}
                     <div className="space-y-6">
                        <table className="w-full zebra-stripe">
                           <thead>
                              <tr className="border-b-2 border-neutral-100 text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300">
                                 <th className="text-left py-6 px-4">Description of Engineering Service</th>
                                 <th className="text-center py-6 px-4 w-24">Qty</th>
                                 <th className="text-right py-6 px-4 w-32">Rate ({currency.symbol})</th>
                                 <th className="text-right py-6 px-4 w-32">Amount</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-neutral-50">
                              {form.lineItems.map((item, idx) => (
                                 <tr key={idx} className="text-sm">
                                    <td className="py-8 px-4 font-bold tracking-tight text-neutral-700">{item.description || "Unspecified Milestone"}</td>
                                    <td className="text-center py-8 px-4 text-neutral-400">{item.qty}</td>
                                    <td className="text-right py-8 px-4 font-medium text-neutral-500">{currency.symbol}{item.rate.toLocaleString()}</td>
                                    <td className="text-right py-8 px-4 font-black">{currency.symbol}{(item.qty * item.rate).toLocaleString()}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>

                     {/* Financial Closure */}
                     <div className="flex justify-between items-start">
                        <div className="space-y-8 max-w-sm">
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300">Payment Details</h4>
                              <div className="flex gap-4 items-center">
                                 <div className="h-16 w-16 bg-neutral-50 border border-neutral-100 rounded-2xl flex items-center justify-center opacity-40">
                                    <Globe size={32} strokeWidth={1} />
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">UPI ID</p>
                                    <p className="font-black text-lg text-primary">{COMPANY.upi}</p>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="space-y-2">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300">Notes & Terms</h4>
                              <p className="text-[10px] text-neutral-400 font-bold leading-relaxed pr-8 italic">{form.notes}</p>
                           </div>
                        </div>

                        <div className="w-80 space-y-1">
                           <div className="bg-neutral-50 p-8 rounded-[2rem] space-y-4 border border-neutral-100">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                 <span>Subtotal</span>
                                 <span className="text-black">{currency.symbol}{subtotal.toLocaleString()}</span>
                              </div>
                              {form.gstEnabled && (
                                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                    <span>GST (18%)</span>
                                    <span className="text-black">{currency.symbol}{gstAmount.toLocaleString()}</span>
                                 </div>
                              )}
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                 <span>Paid Amount</span>
                                 <span className="text-blue-600">-{currency.symbol}{form.amountPaid.toLocaleString()}</span>
                              </div>
                              <div className="pt-6 border-t border-neutral-200 mt-2 flex justify-between items-center">
                                 <span className="text-xs font-black uppercase tracking-[0.3em]">Balance Due</span>
                                 <span className="text-4xl font-black text-[#00A86B] tracking-tighter">{currency.symbol}{balanceDue.toLocaleString()}</span>
                              </div>
                           </div>
                           <p className="text-center text-[8px] font-black uppercase tracking-[0.5em] text-neutral-300 pt-4">Final Ledger Clearance</p>
                        </div>
                     </div>
                  </div>

                  {/* PDF Footer */}
                  <div className="bg-neutral-50 p-12 text-center border-t border-neutral-100 flex flex-col items-center gap-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-200 italic">This is a system generated digital settlement certificate</p>
                     <p className="text-[10px] font-black tracking-widest text-black/20">GROWXLABSTECH · MSME UDYAM-AP-22-0063260</p>
                  </div>

                  {/* PAID STAMP */}
                  {form.status === 'paid' && (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-[16px] border-[#00A86B] rounded-[3rem] px-20 py-10 rotate-[-15deg] opacity-20 pointer-events-none z-50">
                        <h1 className="text-[10rem] font-black text-[#00A86B] tracking-tighter leading-none mb-4">PAID</h1>
                        <p className="text-center font-black text-[#00A86B] tracking-[1.5em] text-2xl">GROWXLABSTECH SYSTEM</p>
                     </div>
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice List */}
      <div className="space-y-6 no-print">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3 italic">
               Invoice History <span className="h-6 px-3 bg-white/5 rounded-full text-[10px] font-bold flex items-center non-italic tracking-widest border border-white/5">{invoices.length} INVOICES</span>
            </h2>
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    placeholder="Search client index..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-full h-10 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-white/10"
                  />
               </div>
               <div className="flex bg-white/5 p-1 rounded-full border border-white/5">
                  {["all", "pending", "paid", "overdue"].map((f) => (
                    <button 
                      key={f} onClick={() => setStatusFilter(f)}
                      className={cn(
                        "h-8 px-4 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                        statusFilter === f ? "bg-white text-black" : "text-white/40 hover:text-white"
                      )}
                    >
                      {f}
                    </button>
                  ))}
               </div>
            </div>
         </div>

         <div className="grid gap-3">
            {loading ? (
               <div className="h-64 flex items-center justify-center border border-white/5 border-dashed rounded-[2rem]">
                  <Loader2 className="animate-spin text-white/20" />
               </div>
            ) : filteredInvoices.length > 0 ? (
               <AnimatePresence mode="popLayout">
                  {filteredInvoices.map((inv, i) => {
                     const isOverdue = new Date(inv.due_date) < new Date() && inv.status !== 'paid';
                     const curr = CURRENCIES.find(c => c.value === inv.currency) || CURRENCIES[0];
                     return (
                        <motion.div
                           key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.03 }}
                        >
                           <Card className={cn(
                             "p-6 border-[var(--border-subtle)] bg-[var(--surface-1)] hover:border-[var(--border-hover)] transition-all group rounded-2xl",
                             isOverdue && "border-red-500/30 bg-red-500/[0.02]"
                           )}>
                              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                 <div className="flex items-center space-x-6">
                                    <div className={cn(
                                       "h-14 w-14 rounded-2xl flex items-center justify-center border shadow-2xl",
                                       inv.status === 'paid' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-white/5 text-white/20 border-white/5"
                                    )}>
                                       <CreditCard size={24} />
                                    </div>
                                    <div>
                                       <div className="flex items-center gap-3 mb-1">
                                          <h3 className="text-lg font-black text-white tracking-tighter leading-none hover:text-primary transition-colors cursor-pointer">
                                             {inv.business_name || inv.client_name}
                                          </h3>
                                          {isOverdue && <span className="h-4 px-2 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center tracking-widest">CRITICAL OVERDUE</span>}
                                       </div>
                                       <div className="flex items-center space-x-4 text-[9px] font-black uppercase tracking-[0.2em]">
                                          <span className="text-white/40 tracking-normal font-bold">#{inv.invoice_number}</span>
                                          <span className="w-1 h-1 rounded-full bg-white/5" />
                                          <span className={cn(
                                             inv.status === 'paid' ? "text-green-500" : inv.status === 'overdue' || isOverdue ? "text-red-500" : "text-yellow-500"
                                          )}>
                                             {inv.status}
                                          </span>
                                          <span className="w-1 h-1 rounded-full bg-white/5" />
                                          <span className="text-white/20 font-medium tracking-normal">{new Date(inv.created_at).toLocaleDateString()}</span>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="flex items-center space-x-12 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                       <p className="text-2xl font-black text-white tracking-tighter">{curr.symbol}{Number(inv.amount).toLocaleString()}</p>
                                       <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">{inv.project_name || 'Standard Service'}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                       <div className="flex items-center -space-x-1 opacity-40 group-hover:opacity-100 transition-opacity mr-2">
                                          <Button 
                                             onClick={() => handleDuplicate(inv)} title="Duplicate and Edit"
                                             variant="outline" className="h-10 w-10 p-0 border-white/5 rounded-xl hover:bg-white hover:text-black"
                                          >
                                             <CopyIcon size={14} />
                                          </Button>
                                          <Button 
                                             onClick={() => updateStatus(inv.id, 'paid')} title="Mark as Settled"
                                             variant="outline" className="h-10 w-10 p-0 border-white/5 rounded-xl hover:bg-green-500 hover:text-white"
                                          >
                                             <CheckCircle2 size={14} />
                                          </Button>
                                          <Button 
                                             onClick={async () => {
                                                const res = await fetch("/api/invoice/send", {
                                                  method: "POST", headers: { "Content-Type": "application/json" },
                                                  body: JSON.stringify({ invoiceId: inv.id })
                                                });
                                                if (res.ok) alert("Certificate Dispatched.");
                                             }} title="Send to Client"
                                             variant="outline" className="h-10 w-10 p-0 border-white/5 rounded-xl hover:bg-primary hover:text-white"
                                          >
                                             <Send size={14} />
                                          </Button>
                                       </div>
                                       <Link href={inv.pdf_url || "#"}>
                                          <Button className="h-12 px-6 bg-white text-black font-black uppercase text-[9px] tracking-[0.2em] rounded-2xl shadow-xl shadow-white/5">
                                             View Vault
                                          </Button>
                                       </Link>
                                    </div>
                                 </div>
                              </div>
                           </Card>
                        </motion.div>
                     );
                  })}
               </AnimatePresence>
            ) : (
               <div className="h-64 flex flex-col items-center justify-center border border-[var(--border-subtle)] border-dashed rounded-2xl bg-[var(--surface-1)] space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)] italic font-black text-2xl border border-[var(--border-subtle)]">?</div>
                  <div className="text-center">
                     <p className="text-white font-black uppercase tracking-widest text-xs mb-1">Financial Index Void</p>
                     <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">Deploy your first settlement certificate to start tracking.</p>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
