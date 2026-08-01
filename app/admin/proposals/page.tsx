"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  FileText, Send, Download, Plus, 
  Trash2, ChevronRight, CheckCircle2, 
  Target, Rocket, Shield, Clock, 
  Globe, Briefcase, MapPin, Loader2,
  Package, Layout, Zap, Users,
  ExternalLink, Calendar, DollarSign,
  Copy, XCircle, CheckSquare, Printer
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// --- Data Types & Constants ---

const CURRENCIES = [
  { label: "₹ INR", value: "INR", symbol: "₹" },
  { label: "$ USD", value: "USD", symbol: "$" },
  { label: "£ GBP", value: "GBP", symbol: "£" },
  { label: "€ EUR", value: "EUR", symbol: "€" }
];

const PACKAGES = {
  starter: {
    name: "Starter",
    price: { INR: "₹8k - 12k", USD: "$100 - 150", GBP: "£80 - 120", EUR: "€90 - 140" },
    timeline: "7 days",
    features: [
      "3-5 page website",
      "Mobile responsive",
      "Contact + WhatsApp integration",
      "Basic SEO setup",
      "SSL + fast hosting",
      "2 revision rounds",
      "14-day support"
    ],
    color: "from-blue-500/10 to-blue-500/5",
    accent: "text-blue-500"
  },
  growth: {
    name: "Growth",
    price: { INR: "₹20k - 35k", USD: "$250 - 420", GBP: "£200 - 330", EUR: "€230 - 380" },
    timeline: "14 days",
    features: [
      "8-10 pages",
      "Blog/news section",
      "Google Analytics",
      "90+ PageSpeed score",
      "n8n lead automation",
      "Admin content panel",
      "Priority support"
    ],
    color: "from-primary/10 to-primary/5",
    accent: "text-primary"
  },
  enterprise: {
    name: "Enterprise",
    price: { INR: "₹40k+", USD: "$500+", GBP: "£400+", EUR: "€450+" },
    timeline: "21-30 days",
    features: [
      "Custom web application",
      "Full n8n automation suite",
      "AI chat integration",
      "API integrations",
      "Custom admin dashboard",
      "Monthly maintenance",
      "Dedicated support channel"
    ],
    color: "from-purple-500/10 to-purple-500/5",
    accent: "text-purple-500"
  }
};

const COMPANY_DETAILS = {
  name: "GrowXLabsTech",
  founder: "Pujala Sai Varshith",
  website: "growxlabs.tech",
  email: "hello@growxlabs.tech",
  tagline: "Engineering Digital Growth. Globally.",
};

const CAPABILITIES = [
  { 
    name: "Custom Web Architectures", 
    description: "High-performance React/Next.js systems designed strictly for lead capturing and speed optimization.",
    icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
  },
  { 
    name: "Intelligent Systems Automation", 
    description: "Tailored server-side n8n processes, lead routing, autonomous webhook hooks, and custom CRM syncing.",
    icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
  },
  { 
    name: "Technical Infrastructure & SLAs", 
    description: "Secure Cloudflare CDN staging, database encryption layers, SSL certifications, and post-deployment maintenance.",
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.599-3.749A11.96 11.96 0 0112 2.714z"
  }
];

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // --- Form State ---
  const [form, setForm] = useState({
    clientName: "",
    businessName: "",
    country: "India",
    currency: "INR",
    industry: "",
    problem: "",
    impact: "",
    selectedPackage: "growth" as keyof typeof PACKAGES,
    customPrice: "",
    validDays: 7,
    callDate: "",
  });

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/proposals/list");
      if (!res.ok) {
        console.error(`API Error: ${res.status}`);
        setProposals([]);
        return;
      }
      const data = await res.json();
      setProposals(Array.isArray(data) ? data.filter(Boolean) : []);
    } catch (e) { 
      console.error(e);
      setProposals([]);
    }
    finally { setLoading(false); }
  };

  const filteredProposals = useMemo(() => {
    if (!Array.isArray(proposals)) return [];
    return proposals.filter(p => p && typeof p === 'object' && (activeFilter === "all" || p.status === activeFilter));
  }, [proposals, activeFilter]);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/proposals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowGenerator(false);
        fetchProposals();
      }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/proposals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchProposals();
    } catch (e) { console.error(e); }
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-10 pb-20">
      <style jsx global>{`
        @media print {
          /* Hide all UI elements */
          nav, aside, .no-print, header, footer { display: none !important; }
          
          /* Reset parent structures to prevent layout shifting/collapsing */
          body, html { 
             background: white !important; 
             color: black !important; 
             width: 210mm !important;
             height: auto !important;
             overflow: visible !important;
          }
          
          /* Flow the document previews as normal, centered, static block page sheets */
          .proposal-preview { 
             position: static !important; 
             width: 210mm !important; 
             height: auto !important; 
             margin: 0 auto !important; 
             padding: 0 !important; 
             overflow: visible !important;
             display: block !important; 
             background: transparent !important; 
             border: none !important; 
             box-shadow: none !important;
          }
          
          .proposal-page-wrapper {
             margin: 0 !important;
             padding: 0 !important;
             page-break-after: always !important;
             break-after: page !important;
             background: white !important;
             display: block !important;
             width: 210mm !important;
             height: auto !important; /* Flow naturally to prevent browser page-split bugs */
          }
          
          /* Hide the interactive page indicators on printed sheets */
          .proposal-page-wrapper > div:first-child {
             display: none !important;
          }
          
          .proposal-page {
             width: 210mm !important;
             height: 297mm !important;
             box-shadow: none !important;
             border: none !important;
             margin: 0 !important;
             padding: 2.2cm !important;
             background: white !important;
             color: black !important;
             display: flex !important;
             flex-direction: column !important;
             justify-content: space-between !important;
             page-break-inside: avoid !important;
             box-sizing: border-box !important;
          }
          
          .proposal-page * {
             color: black !important;
          }
          
          .text-primary, .text-\[\#355CFF\] {
             color: #355CFF !important;
          }
          
          .bg-zinc-50, .bg-neutral-50, .bg-zinc-100\/50 {
             background-color: #f8fafc !important;
             border-color: #e2e8f0 !important;
          }
          
          .border-zinc-200\/60, .border-zinc-200, .border-zinc-150 {
             border-color: #e2e8f0 !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="no-print space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-gradient-to-br from-[#355CFF] to-[#7B61FF] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#355CFF]/25">
                  <Rocket size={18} />
               </div>
               <div>
                 <h1 className="text-2xl font-bold text-white tracking-tight">
                    Proposal Engine
                 </h1>
                 <p className="text-zinc-500 text-xs font-medium">
                    Deploy luxury digital solutions and outbound system proposals globally.
                 </p>
               </div>
            </div>
          </div>
          <Button
            onClick={() => setShowGenerator(!showGenerator)}
            className="bg-gradient-to-r from-[#355CFF] to-[#7B61FF] hover:opacity-90 text-white font-bold uppercase text-[10px] tracking-[0.15em] h-11 px-7 rounded-xl shadow-lg shadow-[#355CFF]/20 transition-all border-0"
          >
            <Plus size={14} className="mr-1.5" />
            {showGenerator ? "Discard Draft" : "New Proposal"}
          </Button>
        </div>

        {/* Pipeline Stats Strip */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Total", count: proposals.length, color: "from-zinc-500/10 to-zinc-500/5", text: "text-zinc-300", dot: "bg-zinc-400" },
            { label: "Sent", count: proposals.filter(p => p?.status === "sent").length, color: "from-blue-500/10 to-blue-500/5", text: "text-blue-400", dot: "bg-blue-400" },
            { label: "Viewed", count: proposals.filter(p => p?.status === "viewed").length, color: "from-purple-500/10 to-purple-500/5", text: "text-purple-400", dot: "bg-purple-400" },
            { label: "Accepted", count: proposals.filter(p => p?.status === "accepted").length, color: "from-emerald-500/10 to-emerald-500/5", text: "text-emerald-400", dot: "bg-emerald-400" },
            { label: "Rejected", count: proposals.filter(p => p?.status === "rejected").length, color: "from-red-500/10 to-red-500/5", text: "text-red-400", dot: "bg-red-400" },
          ].map(stat => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border border-zinc-800/60 rounded-xl p-4 flex items-center gap-3 transition-all hover:border-zinc-700/60`}>
              <div className={`h-2 w-2 rounded-full ${stat.dot} shrink-0`} />
              <div>
                <p className={`text-lg font-bold ${stat.text} leading-none`}>{stat.count}</p>
                <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showGenerator ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid lg:grid-cols-2 gap-10"
          >
            {/* FORM SIDE (ELITE BUILDER CONTROL DECK) */}
            <Card className="p-8 border border-zinc-800/80 bg-zinc-950 rounded-2xl space-y-8 h-fit sticky top-10 max-h-[85vh] overflow-y-auto no-scrollbar shadow-3xl no-print">
               <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4 mb-6">
                     <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                     <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-primary">BUILDER CONTROL DECK</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Client Name</label>
                        <input value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl h-11 px-4 text-xs font-semibold text-white outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-650" placeholder="Jane Doe" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Business Name</label>
                        <input value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl h-11 px-4 text-xs font-semibold text-white outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-655" placeholder="Acme Global" />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Country</label>
                        <select value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl h-11 px-4 text-xs font-semibold text-white outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer">
                           <option value="India" className="bg-zinc-950">India</option>
                           <option value="United States" className="bg-zinc-950">United States</option>
                           <option value="United Kingdom" className="bg-zinc-950">United Kingdom</option>
                           <option value="Canada" className="bg-zinc-950">Canada</option>
                           <option value="Germany" className="bg-zinc-950">Germany</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Currency</label>
                        <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl h-11 px-4 text-xs font-semibold text-white outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer">
                           {CURRENCIES.map(c => <option key={c.value} value={c.value} className="bg-zinc-950">{c.label}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Industry / Niche</label>
                     <input value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl h-11 px-4 text-xs font-semibold text-white outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-650" placeholder="SaaS / Real Estate / Fintech" />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Pain Point Description</label>
                     <textarea value={form.problem} onChange={e => setForm({...form, problem: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 text-xs font-semibold text-white outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-650 min-h-[90px] no-scrollbar" placeholder="What specific problem are they facing?" />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Business Impact (The Cost)</label>
                     <textarea value={form.impact} onChange={e => setForm({...form, impact: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 text-xs font-semibold text-white outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-650 min-h-[90px] no-scrollbar" placeholder="What is this costing their business monthly?" />
                  </div>

                  <div className="space-y-4 pt-6 border-t border-zinc-800/80">
                     <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Solution Architecture</label>
                     <div className="grid grid-cols-3 gap-3 bg-zinc-900/30 p-1.5 border border-zinc-850 rounded-xl">
                        {Object.keys(PACKAGES).map(pk => {
                           const p = PACKAGES[pk as keyof typeof PACKAGES];
                           const isSelected = form.selectedPackage === pk;
                           return (
                              <button 
                                type="button"
                                key={pk} 
                                onClick={() => setForm({...form, selectedPackage: pk as any})}
                                className={cn(
                                   "p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center cursor-pointer", 
                                   isSelected 
                                     ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                                     : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"
                                )}
                              >
                                 <span className="text-[10px] font-mono font-bold uppercase tracking-wider">{p.name}</span>
                                 <span className="text-[8px] opacity-75 font-semibold mt-1">{p.price[form.currency as 'INR']}</span>
                              </button>
                           );
                        })}
                     </div>
                     <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                           <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Price Override</label>
                           <input value={form.customPrice} onChange={e => setForm({...form, customPrice: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl h-11 px-4 text-xs font-semibold text-white outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-650" placeholder="e.g. ₹28,000" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Discovery Call</label>
                           <input type="datetime-local" value={form.callDate} onChange={e => setForm({...form, callDate: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl h-11 px-4 text-xs font-semibold text-white outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all" />
                        </div>
                     </div>
                  </div>

                  <div className="pt-6 grid grid-cols-2 gap-4">
                     <Button 
                        onClick={handleCreate} 
                        disabled={submitting} 
                        className="h-12 bg-white hover:bg-zinc-200 text-black font-bold uppercase text-[9px] tracking-[0.2em] rounded-xl shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer w-full"
                     >
                        {submitting ? <Loader2 className="animate-spin" size={14} /> : <CheckSquare size={14} />}
                        DEPLOY SOLUTION
                     </Button>
                     <Button 
                        onClick={handlePrint} 
                        variant="outline" 
                        className="h-12 border border-zinc-800 hover:border-zinc-700 bg-transparent hover:bg-zinc-900/30 text-zinc-400 hover:text-white font-bold uppercase text-[9px] tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer w-full"
                     >
                        <Printer size={14} />
                        GENERATE PDF
                     </Button>
                  </div>
               </div>
            </Card>

            {/* PREVIEW SIDE (DRAFTBOARD CANVAS) */}
            <div className="proposal-preview space-y-16 h-[85vh] overflow-y-auto no-scrollbar rounded-2xl pb-24 bg-zinc-950 border border-zinc-900 shadow-3xl p-8 relative bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px]">
               
               {/* PAGE 1 - COVER */}
               <div className="proposal-page-wrapper space-y-3">
                  <div className="flex justify-between items-center px-4">
                     <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 font-semibold">PAGE 01 — COVER PAGE</span>
                     <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  </div>
                  <div className="proposal-page bg-[#FAF9F6] text-slate-900 p-20 flex flex-col justify-between shadow-2xl relative overflow-hidden aspect-[1/1.414]">
                     <div className="relative z-10 flex justify-between items-start">
                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-[#355CFF] rounded flex items-center justify-center text-white text-[10px] font-black italic">G</div>
                              <h2 className="text-sm font-bold tracking-tight uppercase">{COMPANY_DETAILS.name}</h2>
                           </div>
                           <p className="text-[8px] font-mono font-bold uppercase tracking-[0.4em] text-zinc-400">{COMPANY_DETAILS.tagline}</p>
                        </div>
                        <div className="px-4 py-1.5 border border-[#355CFF]/20 bg-[#355CFF]/5 text-[#355CFF] rounded-full text-[8px] font-mono font-bold uppercase tracking-widest">
                           PARTNERSHIP BRIEF
                        </div>
                     </div>

                     <div className="relative z-10 my-auto space-y-6">
                        <div className="space-y-2">
                           <span className="text-[9px] font-mono font-bold uppercase tracking-[0.45em] text-[#355CFF] block">SYSTEM ENGINEERING PROPOSAL</span>
                           <h1 className="text-4xl font-extrabold tracking-tight leading-none text-zinc-900 break-words max-w-[90%]">
                              {form.businessName || "Dynamic Enterprise"}
                           </h1>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="h-[1.5px] w-12 bg-[#355CFF]" />
                           <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                              {form.industry || "Target Sector"}
                           </span>
                        </div>
                     </div>

                     <div className="relative z-10 grid grid-cols-2 gap-8 border-t border-zinc-200/60 pt-8 mt-auto">
                        <div className="grid grid-cols-2 gap-4 text-[9px] font-mono">
                           <div className="space-y-1">
                              <span className="text-zinc-400 uppercase tracking-wider block">PROJECT INITIATIVE</span>
                              <span className="font-bold text-zinc-700">Digital Solutions Framework</span>
                           </div>
                           <div className="space-y-1">
                              <span className="text-zinc-400 uppercase tracking-wider block">DATE ISSUED</span>
                              <span className="font-bold text-zinc-700">{new Date().toLocaleDateString()}</span>
                           </div>
                        </div>
                        <div className="text-right space-y-1">
                           <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">PREPARED BY</span>
                           <span className="text-xs font-bold text-zinc-800 block">{COMPANY_DETAILS.founder}</span>
                           <span className="text-[8px] font-mono font-bold text-[#355CFF] uppercase tracking-widest block">FOUNDER & SYSTEMS ENGINEER</span>
                        </div>
                     </div>
                     
                     <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-0 -mr-60 -mt-60" />
                  </div>
               </div>

               {/* PAGE 2 - CHALLENGE */}
               <div className="proposal-page-wrapper space-y-3">
                  <div className="flex justify-between items-center px-4">
                     <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 font-semibold">PAGE 02 — GAP ASSESSMENT</span>
                     <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <div className="proposal-page bg-[#FAF9F6] text-slate-900 p-20 flex flex-col justify-between shadow-2xl relative overflow-hidden aspect-[1/1.414]">
                     <div className="flex justify-between items-center border-b border-zinc-200/50 pb-3 text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                        <span>GROWXLABSTECH · SYSTEM BRIEFING</span>
                        <span>REF: GXL-{new Date().getFullYear()}-PRP</span>
                     </div>

                     <div className="my-auto space-y-8">
                        <div className="space-y-1.5">
                           <span className="text-[9px] font-mono font-bold uppercase tracking-[0.35em] text-[#355CFF] block">01 / ANALYTICS DECK</span>
                           <h3 className="text-2xl font-bold tracking-tight text-zinc-955 leading-tight">Operational Gap Assessment</h3>
                        </div>

                        <div className="grid grid-cols-12 gap-8 pt-4">
                           {/* Left Side: Client Pain Points */}
                           <div className="col-span-7 space-y-4">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">OBSERVED OPERATIONAL CHALLENGES</span>
                              <div className="bg-zinc-50 border border-zinc-200/30 p-5 rounded-xl">
                                 <p className="text-xs leading-relaxed text-zinc-600 font-medium">
                                    {form.problem ? `"${form.problem}"` : "Your current system parameters fall short of optimizing global operations, causing drop-offs in customer response speed and structural performance."}
                                 </p>
                              </div>
                              <div className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                                 Analyzing the current framework reveals a core need for systems restructuring to achieve fast loading speeds and reliable conversions.
                              </div>
                           </div>

                           {/* Right Side: Cost of Inaction */}
                           <div className="col-span-5 flex flex-col justify-between border-l border-zinc-200 pl-8 space-y-4">
                              <div className="space-y-2">
                                 <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#355CFF] block">OPERATIONAL IMPACT</span>
                                 <p className="text-xs font-semibold text-zinc-700 leading-relaxed">
                                    {form.impact || "Every day without dynamic optimizations directly reduces platform scalability and structural customer retention."}
                                 </p>
                              </div>
                              
                              <div className="space-y-1.5 pt-4 border-t border-zinc-150">
                                 <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">RESOLUTION DIRECTIVE</span>
                                 <p className="text-[9px] text-zinc-500 leading-relaxed">
                                    Deploy a high-performance system structure engineered to minimize operational friction and maximize retention.
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="flex justify-between items-center border-t border-zinc-200/50 pt-3 text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-400 mt-auto">
                        <span>CONFIDENTIAL · OPERATIONAL GAP DECK</span>
                        <span>PAGE 02 OF 05</span>
                     </div>
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-0 -ml-32 -mb-32" />
                  </div>
               </div>

               {/* PAGE 3 - INVESTMENT */}
               <div className="proposal-page-wrapper space-y-3">
                  <div className="flex justify-between items-center px-4">
                     <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 font-semibold">PAGE 03 — STRATEGY & INVESTMENT</span>
                     <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <div className="proposal-page bg-[#FAF9F6] text-slate-900 p-20 flex flex-col justify-between shadow-2xl aspect-[1/1.414]">
                     <div className="flex justify-between items-center border-b border-zinc-200/50 pb-3 text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                        <span>GROWXLABSTECH · SYSTEM BRIEFING</span>
                        <span>REF: GXL-{new Date().getFullYear()}-PRP</span>
                     </div>

                     <div className="my-auto space-y-8">
                        <div className="text-center space-y-1.5">
                           <span className="text-[9px] font-mono font-bold uppercase tracking-[0.35em] text-[#355CFF]">02 / STRATEGY FRAMEWORK</span>
                           <h3 className="text-2xl font-bold tracking-tight text-zinc-955 leading-tight">Investment Strategy</h3>
                           <p className="text-[10px] text-zinc-400 max-w-xl mx-auto">Scalable system integrations structured for professional corporate returns.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                           {Object.keys(PACKAGES).map(pk => {
                              const p = PACKAGES[pk as keyof typeof PACKAGES];
                              const isSelected = form.selectedPackage === pk;
                              return (
                                 <div 
                                   key={pk} 
                                   className={cn(
                                      "p-4 rounded-xl border flex flex-col justify-between min-h-[300px] h-fit pb-4 relative transition-all duration-300",
                                      isSelected 
                                        ? "border-[#355CFF] bg-[#355CFF]/[0.01] shadow-lg shadow-[#355CFF]/5" 
                                        : "border-zinc-200 bg-white"
                                   )}
                                 >
                                    {isSelected && (
                                       <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#355CFF] text-white px-2.5 py-0.5 rounded-full text-[6px] font-mono font-bold uppercase tracking-wider shadow-sm">
                                          SELECTED DIRECTION
                                       </div>
                                    )}
                                    
                                    <div>
                                       <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">TIER LEVEL</span>
                                       <h4 className={cn("text-xs font-black uppercase mt-0.5", isSelected ? "text-[#355CFF]" : "text-zinc-700")}>{p.name}</h4>
                                       
                                       <div className="mt-4 space-y-0.5">
                                          <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">FEES</span>
                                          <p className="text-sm font-extrabold text-zinc-900 tracking-tight">
                                             {isSelected && form.customPrice ? form.customPrice : p.price[form.currency as 'INR']}
                                          </p>
                                       </div>

                                       <div className="flex items-center gap-1.5 mt-2.5 text-[8px] text-zinc-400 font-bold uppercase">
                                          <Clock size={11} className="text-zinc-400 shrink-0" />
                                          <span>Engineering: {p.timeline}</span>
                                       </div>
                                    </div>

                                    <ul className="space-y-1.5 mt-4 pt-3 border-t border-zinc-150 flex-1">
                                       {p.features.map((f, i) => (
                                          <li key={i} className="flex items-start gap-1.5 text-[8px] font-medium text-zinc-500 leading-tight">
                                             <CheckCircle2 size={10} className="text-[#355CFF] shrink-0 mt-0.5" />
                                             <span className="break-words">{f}</span>
                                          </li>
                                       ))}
                                    </ul>

                                    <div className={cn(
                                       "w-full py-2 rounded-lg text-center text-[7px] font-mono font-bold uppercase tracking-wider mt-3",
                                       isSelected ? "bg-zinc-900 text-white font-extrabold" : "bg-zinc-100 text-zinc-400"
                                    )}>
                                       {isSelected ? "CHOSEN DIRECTION" : "AVAILABLE"}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>

                        <p className="text-center text-[7px] text-zinc-400 font-mono max-w-lg mx-auto leading-relaxed border-t border-zinc-200/50 pt-3">
                           *All strategy fees are inclusive of post-deployment support and core maintenance. Custom price overrides reflect specialized automation logic as defined in discovery.
                        </p>
                     </div>

                     <div className="flex justify-between items-center border-t border-zinc-200/50 pt-3 text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-400 mt-auto">
                        <span>CONFIDENTIAL · INVESTMENT FRAMEWORK</span>
                        <span>PAGE 03 OF 05</span>
                     </div>
                  </div>
               </div>

               {/* PAGE 4 - CAPABILITIES */}
               <div className="proposal-page-wrapper space-y-3">
                  <div className="flex justify-between items-center px-4">
                     <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 font-semibold">PAGE 04 — CORE CAPABILITIES</span>
                     <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <div className="proposal-page bg-[#FAF9F6] text-slate-900 p-20 flex flex-col justify-between shadow-2xl aspect-[1/1.414]">
                     <div className="flex justify-between items-center border-b border-zinc-200/50 pb-3 text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                        <span>GROWXLABSTECH · SYSTEM BRIEFING</span>
                        <span>REF: GXL-{new Date().getFullYear()}-PRP</span>
                     </div>

                     <div className="my-auto space-y-8">
                        <div className="text-center space-y-1.5">
                           <span className="text-[9px] font-mono font-bold uppercase tracking-[0.35em] text-[#355CFF]">03 / ENGINEERING VALUE</span>
                           <h3 className="text-2xl font-bold tracking-tight text-zinc-950 leading-tight">Core Capabilities & Scope</h3>
                           <p className="text-[10px] text-zinc-400 max-w-xl mx-auto">Custom technology assets deployed to secure corporate performance and data scaling.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                           {CAPABILITIES.map((cap, idx) => (
                              <div key={idx} className="bg-zinc-50 border border-zinc-200/60 p-4 rounded-xl flex flex-col">
                                 <div className="h-7 w-7 bg-white border border-zinc-200 rounded-lg flex items-center justify-center mb-3 shadow-sm shrink-0">
                                    <svg className="w-3.5 h-3.5 text-[#355CFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" d={cap.icon} />
                                    </svg>
                                 </div>
                                 <div className="space-y-1">
                                    <h4 className="text-[10px] font-bold tracking-tight text-zinc-900 uppercase leading-snug">{cap.name}</h4>
                                    <p className="text-[9px] font-medium leading-relaxed text-zinc-400">{cap.description}</p>
                                 </div>
                              </div>
                           ))}
                        </div>

                        <div className="grid grid-cols-3 gap-5 pt-5 border-t border-zinc-200/60">
                           {[
                              {
                                 title: "AI-Accelerated",
                                 desc: "Structured workflows to deliver projects 3x faster than conventional methods."
                              },
                              {
                                 title: "UDYAM Registered",
                                 desc: "Certified micro-enterprise under Ministry of MSME, India."
                              },
                              {
                                 title: "Professional Standards",
                                 desc: "Enterprise-grade code, optimized queries, and custom configurations."
                              }
                           ].map((t, idx) => (
                              <div key={idx} className="space-y-1">
                                 <h5 className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-700">{t.title}</h5>
                                 <p className="text-[9px] text-zinc-400 font-medium leading-relaxed">{t.desc}</p>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="flex justify-between items-center border-t border-zinc-200/50 pt-3 text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-400 mt-auto">
                        <span>CONFIDENTIAL · SYSTEM ENGINEERING CAPABILITIES</span>
                        <span>PAGE 04 OF 05</span>
                     </div>
                  </div>
               </div>

               {/* PAGE 5 - NEXT STEPS */}
               <div className="proposal-page-wrapper space-y-3">
                  <div className="flex justify-between items-center px-4">
                     <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 font-semibold">PAGE 05 — EXECUTION & SIGN-OFF</span>
                     <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <div className="proposal-page bg-[#FAF9F6] text-slate-900 p-20 flex flex-col justify-between shadow-2xl aspect-[1/1.414] relative overflow-hidden">
                     <div className="flex justify-between items-center border-b border-zinc-200/50 pb-3 text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                        <span>GROWXLABSTECH · SYSTEM BRIEFING</span>
                        <span>REF: GXL-{new Date().getFullYear()}-PRP</span>
                     </div>

                     <div className="my-auto space-y-8">
                        <div className="text-center space-y-1.5">
                           <span className="text-[9px] font-mono font-bold uppercase tracking-[0.35em] text-[#355CFF]">04 / CONTRACT DECK</span>
                           <h3 className="text-2xl font-bold tracking-tight text-zinc-950 leading-tight">Execution Protocol</h3>
                           <p className="text-[10px] text-zinc-400 max-w-xl mx-auto">Structured pipeline coordinates to proceed with custom development.</p>
                        </div>

                        <div className="grid gap-2 max-w-2xl mx-auto w-full">
                           {[
                              { step: "01", title: "Select Solution Tier", desc: "Confirm the chosen package level via email or securely in our client workspace." },
                              { step: "02", title: "Scope Execution", desc: "We prepare and execute the formal Agreement detailing deliverables within 4 hours." },
                              { step: "03", title: "Kick-off Transfer", desc: "Process the 50% mobilization fee to secure system engineering capacity." },
                              { step: "04", title: "Production Phase", desc: "Engineering sprints begin immediately. Live client progress dashboard access is issued." },
                              { step: "05", title: "Launch Check", desc: "We complete database caching, perform speed audits, and deploy live to production." }
                           ].map((s, idx) => (
                              <div key={idx} className="flex items-center gap-5 bg-zinc-50 border border-zinc-200/50 p-3.5 rounded-lg w-full">
                                 <span className="text-[9px] font-mono font-bold text-zinc-300 tracking-widest">{s.step}</span>
                                 <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-zinc-800 leading-none">{s.title}</p>
                                    <p className="text-[8px] text-zinc-400 font-medium tracking-wide uppercase leading-none">{s.desc}</p>
                                 </div>
                              </div>
                           ))}
                        </div>

                        {/* Sign-off Blocks */}
                        <div className="grid grid-cols-2 gap-10 pt-6 border-t border-zinc-200/50 max-w-xl mx-auto mt-4 w-full">
                           <div className="space-y-4">
                              <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">FOR GROWXLABSTECH</span>
                              <div className="h-[1px] bg-zinc-300 w-full pt-8" />
                              <div className="text-[8px] font-mono">
                                 <span className="font-bold text-zinc-800 block">{COMPANY_DETAILS.founder}</span>
                                 <span className="text-zinc-400 block">Founding Engineer & Director</span>
                              </div>
                           </div>
                           <div className="space-y-4">
                              <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">FOR {form.businessName ? form.businessName.toUpperCase() : "THE CLIENT"}</span>
                              <div className="h-[1px] bg-zinc-300 w-full pt-8" />
                              <div className="text-[8px] font-mono">
                                 <span className="font-bold text-zinc-800 block">Authorized Representative</span>
                                 <span className="text-zinc-400 block">Title & Date</span>
                              </div>
                           </div>
                        </div>

                        <div className="text-center text-[7px] font-mono text-zinc-400 tracking-wider">
                           This proposal remains valid for 7 business days. All operations governed by standard framework terms.
                        </div>
                     </div>

                     <div className="flex justify-between items-center border-t border-zinc-200/50 pt-3 text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-400 mt-auto">
                        <span>CONFIDENTIAL · PARTNERSHIP SIGN-OFF</span>
                        <span>PAGE 05 OF 05</span>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          /* LIST VIEW */
          <div className="space-y-6 no-print">
            {/* Filter Bar */}
            <div className="flex items-center justify-between">
               <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                  <FileText size={18} className="text-zinc-500" />
                  Proposals
                  <span className="text-xs font-medium text-zinc-500 bg-zinc-800/60 px-2.5 py-0.5 rounded-full ml-1">{filteredProposals.length}</span>
               </h2>
               <div className="flex bg-zinc-900/80 p-1 rounded-lg border border-zinc-800/60">
                  {[
                    { key: "all", label: "All" },
                    { key: "sent", label: "Sent" },
                    { key: "viewed", label: "Viewed" },
                    { key: "accepted", label: "Accepted" },
                    { key: "rejected", label: "Rejected" },
                  ].map((st) => (
                    <button 
                      key={st.key} 
                      onClick={() => setActiveFilter(st.key)}
                      className={cn(
                        "h-7 px-4 rounded-md text-[10px] font-semibold transition-all whitespace-nowrap cursor-pointer", 
                        activeFilter === st.key 
                          ? "bg-white text-black shadow-sm" 
                          : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      {st.label}
                    </button>
                  ))}
               </div>
            </div>

            {/* Proposal Cards */}
            <div className="grid gap-3">
              {loading ? (
                 <div className="h-72 flex items-center justify-center border border-zinc-800/50 rounded-2xl bg-zinc-900/30">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-[#355CFF]/60" size={24} />
                      <p className="text-zinc-600 text-xs font-medium">Loading proposals...</p>
                    </div>
                 </div>
              ) : filteredProposals.length > 0 ? (
                 filteredProposals.map((p, i) => {
                    if (!p || typeof p !== 'object') return null;
                    const statusConfig: Record<string, { bg: string; text: string; dot: string }> = { 
                      sent: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" }, 
                      viewed: { bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-400" }, 
                      accepted: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" }, 
                      rejected: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" } 
                    };
                    const sc = statusConfig[p.status || ""] || { bg: "bg-zinc-500/10", text: "text-zinc-400", dot: "bg-zinc-400" };
                    const pkgColors: Record<string, string> = {
                      starter: "text-blue-400",
                      growth: "text-[#355CFF]",
                      enterprise: "text-purple-400"
                    };
                    return (
                       <motion.div key={p.id || `proposal-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }}>
                          <div className="p-5 border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700/60 transition-all group rounded-xl">
                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                   <div className="h-11 w-11 bg-gradient-to-br from-zinc-800/80 to-zinc-900 rounded-lg flex items-center justify-center text-zinc-500 border border-zinc-800/60 group-hover:border-zinc-700 group-hover:text-[#355CFF] transition-all shrink-0">
                                      <FileText size={18} />
                                   </div>
                                   <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                         <h3 className="text-sm font-bold text-white tracking-tight leading-none truncate">{p.business_name || "Unnamed"}</h3>
                                         <span className={cn("h-5 px-2 rounded-md text-[8px] font-semibold uppercase tracking-wider flex items-center gap-1.5", sc.bg, sc.text)}>
                                            <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
                                            {p.status || "draft"}
                                         </span>
                                         {p.viewed_at && <span className="h-5 px-2 bg-emerald-500/10 text-emerald-400 text-[8px] font-semibold rounded-md flex items-center gap-1">
                                           <Globe size={9} /> Opened
                                         </span>}
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                                         <span>{p.client_name || "Unknown"}</span>
                                         <span className="w-0.5 h-0.5 bg-zinc-700 rounded-full" />
                                         <span className={pkgColors[p.selected_package] || "text-zinc-400"}>{p.selected_package && typeof p.selected_package === 'string' ? p.selected_package.charAt(0).toUpperCase() + p.selected_package.slice(1) : "Unknown"}</span>
                                         <span className="w-0.5 h-0.5 bg-zinc-700 rounded-full" />
                                         <span className="text-zinc-600">{p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ""}</span>
                                         {p.valid_until && <><span className="w-0.5 h-0.5 bg-zinc-700 rounded-full" /><span className="text-zinc-600">Expires {new Date(p.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></>}
                                      </div>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => updateStatus(p.id, 'accepted')} title="Accept" className="h-8 w-8 rounded-lg border border-zinc-800/60 flex items-center justify-center text-zinc-500 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer">
                                        <CheckSquare size={13} />
                                      </button>
                                      <button onClick={() => updateStatus(p.id, 'rejected')} title="Reject" className="h-8 w-8 rounded-lg border border-zinc-800/60 flex items-center justify-center text-zinc-500 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer">
                                        <XCircle size={13} />
                                      </button>
                                      <button onClick={() => {
                                         navigator.clipboard.writeText(`${window.location.origin}/proposal/${p.id}`);
                                         alert("Share link copied!");
                                      }} title="Copy Link" className="h-8 w-8 rounded-lg border border-zinc-800/60 flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white hover:border-zinc-600 transition-all cursor-pointer">
                                        <Copy size={13} />
                                      </button>
                                      <button onClick={async () => {
                                          const res = await fetch("/api/proposals/send", {
                                            method: "POST", headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ proposalId: p.id })
                                          });
                                          if (res.ok) alert("Email Dispatched.");
                                      }} title="Send Email" className="h-8 w-8 rounded-lg border border-zinc-800/60 flex items-center justify-center text-zinc-500 hover:bg-[#355CFF]/20 hover:text-[#355CFF] hover:border-[#355CFF]/30 transition-all cursor-pointer">
                                        <Send size={13} />
                                      </button>
                                   </div>
                                   <Link href={`/proposal/${p.id}`} target="_blank">
                                      <Button className="h-8 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold text-[10px] tracking-wide rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-zinc-700/50">
                                         <ExternalLink size={12} />
                                         View
                                      </Button>
                                   </Link>
                                </div>
                             </div>
                          </div>
                       </motion.div>
                    )
                 })
              ) : (
                 /* Premium Empty State */
                 <div className="relative overflow-hidden rounded-2xl border border-zinc-800/40 bg-gradient-to-br from-zinc-900/50 via-[#0B0F19] to-zinc-900/30">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(53,92,255,0.08),transparent_70%)]" />
                    <div className="relative flex flex-col items-center justify-center py-20 px-8">
                       <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-zinc-800/80 to-zinc-900 border border-zinc-700/40 flex items-center justify-center mb-5 shadow-lg">
                          <Rocket size={28} className="text-zinc-500" />
                       </div>
                       <h3 className="text-lg font-bold text-white tracking-tight mb-1.5">No proposals yet</h3>
                       <p className="text-zinc-500 text-sm font-medium text-center max-w-sm mb-6">
                          Create your first proposal to start closing deals and tracking client engagement.
                       </p>
                       <Button
                         onClick={() => setShowGenerator(true)}
                         className="bg-gradient-to-r from-[#355CFF] to-[#7B61FF] hover:opacity-90 text-white font-bold uppercase text-[10px] tracking-[0.15em] h-10 px-6 rounded-xl shadow-lg shadow-[#355CFF]/20 transition-all border-0"
                       >
                         <Plus size={14} className="mr-1.5" />
                         Create First Proposal
                       </Button>
                    </div>
                 </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
