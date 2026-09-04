"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone, Target, TrendingUp, BarChart3, Users, DollarSign, Globe, Sparkles,
  Search, Plus, CheckCircle, RefreshCw, Send, Lock, UserCheck, ArrowUpRight, ArrowDownRight,
  MousePointer, Eye, ShieldCheck, Mail, Play, AlertTriangle
} from "lucide-react";

type Role =
  | "Marketing Director"
  | "Marketing Manager"
  | "Growth Strategist"
  | "Content Manager"
  | "SEO Specialist"
  | "Performance Marketer"
  | "Sales Representative"
  | "Viewer"
  | "Super Admin";

interface TabItem {
  id: string;
  label: string;
  icon: any;
  allowedRoles: Role[];
}

const TABS: TabItem[] = [
  { id: "overview", label: "Dashboard", icon: BarChart3, allowedRoles: ["Super Admin", "Marketing Director", "Marketing Manager", "Growth Strategist", "Viewer"] },
  { id: "campaigns", label: "Campaigns", icon: Megaphone, allowedRoles: ["Super Admin", "Marketing Director", "Marketing Manager", "Performance Marketer"] },
  { id: "funnel", label: "Funnel Analytics", icon: TrendingUp, allowedRoles: ["Super Admin", "Marketing Director", "Growth Strategist", "Viewer"] },
  { id: "leads_crm", label: "Leads & CRM Sync", icon: Users, allowedRoles: ["Super Admin", "Marketing Director", "Marketing Manager", "Sales Representative"] },
  { id: "landing_pages", label: "Landing Pages", icon: Globe, allowedRoles: ["Super Admin", "Marketing Manager", "Content Manager"] },
  { id: "forms", label: "Forms & Submissions", icon: Target, allowedRoles: ["Super Admin", "Marketing Director", "Marketing Manager"] },
  { id: "automation", label: "Workflows", icon: RefreshCw, allowedRoles: ["Super Admin", "Marketing Director", "Growth Strategist"] },
  { id: "ai_copywriter", label: "AI Copywriter", icon: Sparkles, allowedRoles: ["Super Admin", "Marketing Director", "Marketing Manager", "Content Manager", "Performance Marketer"] },
  { id: "seo", label: "SEO & Keywords", icon: Search, allowedRoles: ["Super Admin", "SEO Specialist", "Content Manager"] },
  { id: "ads_roi", label: "Ads Spend & ROI", icon: DollarSign, allowedRoles: ["Super Admin", "Marketing Director", "Performance Marketer"] }
];

export default function MarketingHubPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRole, setSelectedRole] = useState<Role>("Super Admin");
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  // Campaigns State
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [newCampaign, setNewCampaign] = useState({ name: "", channel: "Email", target_audience: "", budget: "" });

  // Leads State
  const [leads, setLeads] = useState<any[]>([]);

  // Landing Pages State
  const [landingPages, setLandingPages] = useState<any[]>([]);

  // Forms State
  const [forms, setForms] = useState<any[]>([]);
  const [newSubmission, setNewSubmission] = useState({ form_name: "Inbound Contact Form", lead_name: "", lead_email: "", company: "" });

  // AI Copywriter State
  const [aiType, setAiType] = useState("blog");
  const [aiPromptText, setAiPromptText] = useState("");
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchDashboardMetrics();
    fetchCampaigns();
    fetchLeads();
    fetchLandingPages();
    fetchForms();
  }, []);

  useEffect(() => {
    const tabObj = TABS.find(t => t.id === activeTab);
    if (tabObj && !tabObj.allowedRoles.includes(selectedRole)) {
      const firstAllowed = TABS.find(t => t.allowedRoles.includes(selectedRole));
      if (firstAllowed) {
        setActiveTab(firstAllowed.id);
        toast.info(`Switched tab to ${firstAllowed.label} based on ${selectedRole} clearance.`);
      }
    }
  }, [selectedRole]);

  const fetchDashboardMetrics = async () => {
    try {
      const res = await fetch("/api/marketing/dashboard");
      const data = await res.json();
      setMetrics(data);
    } catch (e) {
      toast.error("Failed to load marketing dashboard metrics.");
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/marketing/campaigns");
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (e) {
      toast.error("Failed to load campaigns.");
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/marketing/leads");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (e) {
      toast.error("Failed to load marketing leads.");
    }
  };

  const fetchLandingPages = async () => {
    try {
      const res = await fetch("/api/marketing/landing-pages");
      const data = await res.json();
      setLandingPages(data.landingPages || []);
    } catch (e) {
      toast.error("Failed to load landing pages.");
    }
  };

  const fetchForms = async () => {
    try {
      const res = await fetch("/api/marketing/forms");
      const data = await res.json();
      setForms(data.forms || []);
    } catch (e) {
      toast.error("Failed to load marketing forms.");
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name) return toast.error("Campaign Name is required");

    setLoading(true);
    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCampaign,
          budget: Number(newCampaign.budget) || 1000
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Campaign '${newCampaign.name}' created!`);
        setNewCampaign({ name: "", channel: "Email", target_audience: "", budget: "" });
        fetchCampaigns();
      }
    } catch (e) {
      toast.error("Failed to create campaign.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmissionSyncCRM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubmission.lead_name || !newSubmission.lead_email) return toast.error("Name and Email required");

    setLoading(true);
    try {
      const res = await fetch("/api/marketing/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubmission)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Form submitted! Lead auto-scored (${data.leadScore}) & synced to CRM.`);
        setNewSubmission({ form_name: "Inbound Contact Form", lead_name: "", lead_email: "", company: "" });
        fetchLeads();
      }
    } catch (e) {
      toast.error("Form submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const runAICopywriter = async () => {
    if (!aiPromptText) return toast.error("Please enter a topic or prompt.");
    setAiLoading(true);
    setAiResult(null);

    try {
      const res = await fetch("/api/marketing/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: aiType, prompt: aiPromptText })
      });
      const data = await res.json();
      if (res.ok && data.result) {
        setAiResult(data.result);
        toast.success("AI Content Generated!");
      }
    } catch (e) {
      toast.error("AI Generation error.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-10 text-white pb-20">
      
      {/* ═ HEADER & ROLE SWITCHER ═ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3.5 mb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Enterprise Marketing &amp; Growth Automation
            </h1>
          </div>
          <p className="text-neutral-400 text-sm">
            End-to-end inbound marketing lifecycle: funnel analytics, campaign execution, landing pages, lead scoring, &amp; automatic CRM handoff.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2.5 bg-neutral-900 border border-white/10 rounded-xl px-4 py-2">
            <UserCheck className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Simulation Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              className="bg-transparent border-0 text-white font-extrabold text-[12px] uppercase tracking-wide focus:outline-none cursor-pointer"
            >
              {([
                "Marketing Director", "Marketing Manager", "Growth Strategist", "Content Manager",
                "SEO Specialist", "Performance Marketer", "Sales Representative", "Viewer", "Super Admin"
              ] as Role[]).map((r) => (
                <option key={r} value={r} className="bg-neutral-950 text-white">{r}</option>
              ))}
            </select>
          </div>
          
          <Button
            onClick={() => {
              fetchDashboardMetrics();
              fetchCampaigns();
              fetchLeads();
              toast.success("Synchronized Marketing Hub.");
            }}
            variant="outline"
            className="h-10 px-4 bg-white/5 border border-white/10 text-neutral-300 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Sync Marketing Engine
          </Button>
        </div>
      </div>

      {/* ═ CORE NAVIGATION GRID ═ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR TABS NAV */}
        <div className="lg:col-span-3 xl:col-span-2 space-y-2">
          {TABS.map((tab) => {
            const isAllowed = tab.allowedRoles.includes(selectedRole);
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isAllowed) {
                    setActiveTab(tab.id);
                  } else {
                    toast.error(`Clearance Restricted: ${tab.label} is locked for role ${selectedRole}.`);
                  }
                }}
                className={`w-full flex items-center justify-between h-11 px-4 rounded-xl border text-[13px] font-bold tracking-tight transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                    : isAllowed
                    ? "bg-white/5 border-white/5 text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                    : "bg-black/20 border-white/5 text-neutral-600 cursor-not-allowed opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-blue-400" : "text-neutral-500"}`} />
                  <span>{tab.label}</span>
                </div>
                {!isAllowed && <Lock className="h-3 w-3 text-neutral-600" />}
              </button>
            );
          })}
        </div>

        {/* TAB WORKSPACE */}
        <div className="lg:col-span-9 xl:col-span-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >

              {/* ══ 1. DASHBOARD OVERVIEW ══ */}
              {activeTab === "overview" && metrics && (
                <div className="space-y-8">
                  {/* KPI Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    <Card className="bg-white/[0.02] border-white/10 hover:border-blue-500/30 transition-all p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400"><Eye size={18} /></span>
                        <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center"><ArrowUpRight size={12} className="mr-0.5" /> 18.4%</span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">Website Visitors</p>
                      <h3 className="text-3xl font-black text-white">{(metrics.websiteVisitors ?? 0).toLocaleString()}</h3>
                    </Card>

                    <Card className="bg-white/[0.02] border-white/10 hover:border-purple-500/30 transition-all p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400"><Users size={18} /></span>
                        <span className="text-[10px] font-black uppercase text-purple-400">{metrics.mqlCount ?? 0} MQLs</span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">New Leads</p>
                      <h3 className="text-3xl font-black text-white">{(metrics.newLeads ?? 0).toLocaleString()}</h3>
                    </Card>

                    <Card className="bg-white/[0.02] border-white/10 hover:border-emerald-500/30 transition-all p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400"><TrendingUp size={18} /></span>
                        <span className="text-[10px] font-black uppercase text-emerald-400">Target 4.0%</span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">Funnel Conversion Rate</p>
                      <h3 className="text-3xl font-black text-white">{metrics.conversionRate ?? 0}%</h3>
                    </Card>

                    <Card className="bg-white/[0.02] border-white/10 hover:border-amber-500/30 transition-all p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400"><DollarSign size={18} /></span>
                        <span className="text-[10px] font-black uppercase text-amber-400">ROI: {metrics.campaignROI ?? 0}x</span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">Ad Spend (CAC: ${metrics.cac ?? 0})</p>
                      <h3 className="text-3xl font-black text-white">${(metrics.adSpend ?? 0).toLocaleString()}</h3>
                    </Card>
                  </div>

                  {/* Funnel & Conversion Chart */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <Card className="p-6 bg-white/[0.02] border-white/10">
                      <h3 className="text-base font-bold text-white mb-6">Marketing-to-Sales Conversion Funnel</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1.5 font-bold uppercase tracking-wider text-neutral-400">
                            <span>1. Website Visitors</span>
                            <span className="text-white font-black">{(metrics.funnelData?.visitors ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: "100%" }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1.5 font-bold uppercase tracking-wider text-neutral-400">
                            <span>2. New Inbound Leads</span>
                            <span className="text-purple-400 font-black">{(metrics.funnelData?.leads ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: "22%" }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1.5 font-bold uppercase tracking-wider text-neutral-400">
                            <span>3. Marketing Qualified Leads (MQL)</span>
                            <span className="text-emerald-400 font-black">{(metrics.funnelData?.mql ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: "9.5%" }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1.5 font-bold uppercase tracking-wider text-neutral-400">
                            <span>4. Sales Qualified Leads (SQL)</span>
                            <span className="text-amber-400 font-black">{(metrics.funnelData?.sql ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: "3.8%" }} />
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 bg-white/[0.02] border-white/10">
                      <h3 className="text-base font-bold text-white mb-6">Channel Performance Benchmark</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3.5 bg-white/5 rounded-xl">
                          <span className="text-xs font-bold text-neutral-300">Email Campaign Open Rate</span>
                          <span className="text-xs font-black text-blue-400">{metrics.emailOpenRate}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3.5 bg-white/5 rounded-xl">
                          <span className="text-xs font-bold text-neutral-300">Click-Through Rate (CTR)</span>
                          <span className="text-xs font-black text-purple-400">{metrics.emailClickRate}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3.5 bg-white/5 rounded-xl">
                          <span className="text-xs font-bold text-neutral-300">Landing Page Conversion Rate</span>
                          <span className="text-xs font-black text-emerald-400">{metrics.landingPageConversion}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3.5 bg-white/5 rounded-xl">
                          <span className="text-xs font-bold text-neutral-300">Cost Per Lead (CPL)</span>
                          <span className="text-xs font-black text-amber-400">${metrics.cpl}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* ══ 2. CAMPAIGNS TAB ══ */}
              {activeTab === "campaigns" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Create Campaign Panel */}
                  <Card className="xl:col-span-1 p-6 bg-white/[0.02] border-white/10 h-fit">
                    <h3 className="text-base font-bold text-white mb-6">Create New Campaign</h3>
                    <form onSubmit={handleCreateCampaign} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5 block">Campaign Name</label>
                        <Input
                          value={newCampaign.name}
                          onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                          placeholder="e.g. Q3 SaaS Enterprise Growth Launch"
                          className="h-10 border-white/10 bg-white/5"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5 block">Channel</label>
                          <select
                            value={newCampaign.channel}
                            onChange={(e) => setNewCampaign({ ...newCampaign, channel: e.target.value })}
                            className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none"
                          >
                            <option value="Email" className="bg-neutral-950">Email</option>
                            <option value="Google Ads" className="bg-neutral-950">Google Ads</option>
                            <option value="LinkedIn Ads" className="bg-neutral-950">LinkedIn Ads</option>
                            <option value="Meta Ads" className="bg-neutral-950">Meta Ads</option>
                            <option value="Social" className="bg-neutral-950">Social</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5 block">Budget ($)</label>
                          <Input
                            type="number"
                            value={newCampaign.budget}
                            onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
                            placeholder="5000"
                            className="h-10 border-white/10 bg-white/5"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5 block">Target Audience Persona</label>
                        <Input
                          value={newCampaign.target_audience}
                          onChange={(e) => setNewCampaign({ ...newCampaign, target_audience: e.target.value })}
                          placeholder="VP Engineering & CTOs"
                          className="h-10 border-white/10 bg-white/5"
                        />
                      </div>

                      <Button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold h-10 mt-4 rounded-md">
                        {loading ? "Launching..." : "Launch Campaign"}
                      </Button>
                    </form>
                  </Card>

                  {/* Campaigns Roster */}
                  <Card className="xl:col-span-2 p-6 bg-white/[0.02] border-white/10">
                    <h3 className="text-base font-bold text-white mb-6">Active Multi-Channel Campaigns</h3>
                    
                    <div className="space-y-4">
                      {campaigns.map((c) => (
                        <div key={c.id} className="border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] p-5 rounded-2xl flex justify-between items-center transition-all">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-[9px] font-black text-blue-400 uppercase tracking-widest">{c.channel}</span>
                              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Audience: {c.target_audience}</span>
                            </div>
                            <h4 className="font-bold text-white text-base mt-1.5">{c.name}</h4>
                            <p className="text-xs text-neutral-400 mt-1">Leads Generated: <strong className="text-white">{c.leads_generated || 0}</strong> · Conversion: <strong className="text-emerald-400">4.2%</strong></p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs font-black text-white">${Number(c.budget).toLocaleString()}</p>
                            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-black uppercase mt-1 inline-block">{c.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* ══ 4. LEADS & CRM SYNC TAB ══ */}
              {activeTab === "leads_crm" && (
                <Card className="p-6 bg-white/[0.02] border-white/10">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-base font-bold text-white">Marketing Qualified Leads (MQL) Registry</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">Leads with Score &ge; 80 automatically sync to CRM deals pipeline.</p>
                    </div>
                    <Button onClick={() => toast.success("CRM Lead Sync Engine re-triggered!")} variant="outline" className="h-9 border-white/10 text-xs">
                      Trigger CRM Handoff
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="border-b border-white/10 bg-white/5">
                        <tr>
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-400">Lead Candidate</th>
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-400">Company</th>
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-400">Lead Score</th>
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-400">Stage</th>
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-400">CRM Sync</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 bg-transparent">
                        {leads.map((l) => (
                          <tr key={l.id} className="hover:bg-white/[0.01]">
                            <td className="px-5 py-4">
                              <span className="font-bold text-white block">{l.name}</span>
                              <span className="text-[10px] text-neutral-400">{l.email}</span>
                            </td>
                            <td className="px-5 py-4 text-xs font-bold text-neutral-300">{l.company_name}</td>
                            <td className="px-5 py-4 font-black text-base text-blue-400">{l.score} / 100</td>
                            <td className="px-5 py-4">
                              <span className={`px-2 py-0.5 border rounded-full text-[9px] font-black uppercase tracking-widest ${
                                l.score >= 80 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                              }`}>{l.status}</span>
                            </td>
                            <td className="px-5 py-4">
                              {l.synced_to_crm ? (
                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle size={14} /> Synced to CRM</span>
                              ) : (
                                <span className="text-xs font-bold text-neutral-500">Pending</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* ══ 6. FORMS & INBOUND SYNC TAB ══ */}
              {activeTab === "forms" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Form Simulator */}
                  <Card className="xl:col-span-1 p-6 bg-white/[0.02] border-white/10 h-fit">
                    <h3 className="text-base font-bold text-white mb-6">Test Inbound Form Handoff</h3>
                    <form onSubmit={handleFormSubmissionSyncCRM} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5 block">Full Name</label>
                        <Input
                          value={newSubmission.lead_name}
                          onChange={(e) => setNewSubmission({ ...newSubmission, lead_name: e.target.value })}
                          placeholder="e.g. Sarah Connor"
                          className="h-10 bg-white/5 border-white/10"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5 block">Business Email</label>
                        <Input
                          type="email"
                          value={newSubmission.lead_email}
                          onChange={(e) => setNewSubmission({ ...newSubmission, lead_email: e.target.value })}
                          placeholder="sarah@cyberdyne.com"
                          className="h-10 bg-white/5 border-white/10"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5 block">Company Name</label>
                        <Input
                          value={newSubmission.company}
                          onChange={(e) => setNewSubmission({ ...newSubmission, company: e.target.value })}
                          placeholder="Cyberdyne Systems"
                          className="h-10 bg-white/5 border-white/10"
                        />
                      </div>
                      <Button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-10 mt-2 rounded-md">
                        {loading ? "Syncing to CRM..." : "Submit Form & Auto-Sync CRM"}
                      </Button>
                    </form>
                  </Card>

                  {/* Forms Roster */}
                  <Card className="xl:col-span-2 p-6 bg-white/[0.02] border-white/10">
                    <h3 className="text-base font-bold text-white mb-6">Active Lead Capture Forms</h3>
                    <div className="space-y-4">
                      {forms.map((f) => (
                        <div key={f.id} className="border border-white/5 bg-white/[0.01] p-4 rounded-xl flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-white text-sm">{f.form_name}</h4>
                            <p className="text-xs text-neutral-400 mt-1">Total Submissions: <strong className="text-white">{f.submissions_count}</strong></p>
                          </div>
                          <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[9px] font-black uppercase">Live Embed</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* ══ 8. AI COPYWRITER TAB ══ */}
              {activeTab === "ai_copywriter" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <Card className="p-6 bg-white/[0.02] border-white/10">
                    <h3 className="text-base font-bold text-white mb-6">Gemini Marketing Copywriter</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5 block">Content Format</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "blog", label: "Blog Post" },
                            { id: "social", label: "Social Copy" },
                            { id: "email", label: "Email Campaign" },
                            { id: "ad", label: "Ad Copy" },
                            { id: "keywords", label: "SEO Keywords" }
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setAiType(t.id)}
                              className={`h-9 rounded-lg border text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                                aiType === t.id
                                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                  : "bg-white/5 border-white/5 text-neutral-400 hover:text-white"
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5 block">Prompt / Topic / Keywords</label>
                        <textarea
                          value={aiPromptText}
                          onChange={(e) => setAiPromptText(e.target.value)}
                          placeholder="e.g. AI-driven CRM automation for B2B SaaS startups..."
                          className="w-full h-32 p-3 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none"
                        />
                      </div>

                      <Button
                        onClick={runAICopywriter}
                        disabled={aiLoading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold h-11 rounded-md"
                      >
                        {aiLoading ? "Generating Copy..." : "Generate AI Copy"}
                      </Button>
                    </div>
                  </Card>

                  {/* AI Copywriter Output */}
                  <Card className="p-6 bg-white/[0.02] border-white/10 min-h-[400px]">
                    <h3 className="text-base font-bold text-white mb-6">Generated Content Output</h3>
                    
                    {aiResult ? (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        {aiType === "blog" && (
                          <div className="space-y-3">
                            <h4 className="font-extrabold text-lg text-white">{aiResult.title}</h4>
                            <p className="text-xs text-neutral-300 italic">{aiResult.summary}</p>
                            <div className="bg-black/10 border border-white/5 p-4 rounded-xl text-xs text-neutral-200 whitespace-pre-line font-mono">
                              {aiResult.fullMarkdown}
                            </div>
                          </div>
                        )}

                        {aiType === "email" && (
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-blue-400">Subject: {aiResult.subject}</p>
                            <div className="bg-black/10 border border-white/5 p-4 rounded-xl text-xs text-neutral-200 whitespace-pre-line font-mono">
                              {aiResult.body}
                            </div>
                          </div>
                        )}

                        {aiType === "ad" && (
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-white">Ad Headlines:</p>
                            {aiResult.headlines?.map((h: string, i: number) => (
                              <div key={i} className="p-2.5 bg-white/5 rounded-lg text-xs font-bold text-emerald-400">{h}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20 text-neutral-500">
                        <Sparkles size={28} className="text-neutral-600 mb-4" />
                        <p className="font-bold">AI Copywriter Standby</p>
                        <p className="text-xs max-w-xs mt-1">Select a format and enter a prompt to generate marketing copy.</p>
                      </div>
                    )}
                  </Card>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
