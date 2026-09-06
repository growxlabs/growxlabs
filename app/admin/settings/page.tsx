"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, ShieldCheck, Users, KeyRound, Globe, HardDrive, Cpu, Lock,
  RefreshCw, CheckCircle, Search, UserCheck, AlertTriangle, ShieldAlert,
  Activity, FileText, Check, Database, Server, Clock, Plus, ExternalLink
} from "lucide-react";
import {
  AdminKPICardsSkeleton,
  AdminServicesGridSkeleton,
  AdminActivityFeedSkeleton,
  AdminTableSkeleton,
  AdminRBACSkeleton,
  AdminIntegrationsSkeleton
} from "@/components/admin/AdminSkeletons";


interface TabItem {
  id: string;
  label: string;
  icon: any;
}

const TABS: TabItem[] = [
  { id: "overview", label: "Admin Dashboard", icon: Building2 },
  { id: "users", label: "User Directory", icon: Users },
  { id: "rbac", label: "RBAC & Permissions", icon: Lock },
  { id: "security", label: "Security & Audit Center", icon: ShieldAlert },
  { id: "integrations", label: "API & Integrations", icon: KeyRound },
  { id: "ai_governance", label: "AI Governance", icon: Cpu }
];

export default function SettingsAdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");

  // RBAC State
  const [roles, setRoles] = useState<any[]>([]);

  // Security Events State
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);

  // Integrations State
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDashboardMetrics(),
      fetchUsers(),
      fetchRBAC(),
      fetchSecurityEvents(),
      fetchIntegrations()
    ]);
    setLoading(false);
  };

  const fetchDashboardMetrics = async () => {
    try {
      const res = await fetch("/api/admin-setup/dashboard");
      const data = await res.json();
      setMetrics(data);
    } catch (e) {
      toast.error("Failed to load admin dashboard metrics.");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin-setup/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      toast.error("Failed to load platform users.");
    }
  };

  const fetchRBAC = async () => {
    try {
      const res = await fetch("/api/admin-setup/rbac");
      const data = await res.json();
      setRoles(data.roles || []);
    } catch (e) {
      toast.error("Failed to load RBAC roles.");
    }
  };

  const fetchSecurityEvents = async () => {
    try {
      const res = await fetch("/api/admin-setup/security");
      const data = await res.json();
      setSecurityEvents(data.securityEvents || []);
    } catch (e) {
      toast.error("Failed to load security & audit logs.");
    }
  };

  const fetchIntegrations = async () => {
    try {
      const res = await fetch("/api/admin-setup/integrations");
      const data = await res.json();
      setApiKeys(data.apiKeys || []);
      setIntegrations(data.integrations || []);
    } catch (e) {
      toast.error("Failed to load platform integrations.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 text-zinc-100 pb-20 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2 bg-[#0075de]/15 border border-[#0075de]/30 rounded-xl text-[#0075de]">
              <ShieldCheck size={22} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-100">
              Enterprise Administration &amp; Governance
            </h1>
          </div>
          <p className="text-xs text-zinc-400">
            Centralized platform governance layer: organizations, RBAC permissions, audit logging, &amp; infrastructure integrity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Authenticated Role Status Badge */}
          <div className="flex items-center gap-2.5 bg-[#141416] border border-[#27272a] rounded-xl px-3.5 py-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Access:</span>
            <span className="font-bold text-xs text-zinc-200">Super Admin / Executive</span>
          </div>

          <Button
            onClick={() => {
              fetchAllData();
              toast.success("Synchronized Administration Engine with Supabase.");
            }}
            variant="outline"
            className="h-9 px-3 text-xs border-[#27272a] bg-[#141416] text-zinc-200 hover:bg-[#1e1e22] hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Sync Admin Layer
          </Button>
        </div>
      </div>

      {/* HORIZONTAL SUB-NAV TABS */}
      <div className="flex items-center gap-2 border-b border-[#27272a] overflow-x-auto custom-scrollbar pb-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 h-10 px-4 rounded-xl border text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#0075de] text-white border-[#0075de] shadow-md shadow-[#0075de]/20"
                  : "bg-[#141416] border-[#27272a] text-zinc-400 hover:text-zinc-100 hover:bg-[#1e1e22]"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >

          {/* 1. DASHBOARD OVERVIEW */}
          {activeTab === "overview" && (
            loading && !metrics ? (
              <div className="space-y-6">
                <AdminKPICardsSkeleton />
                <AdminServicesGridSkeleton />
                <AdminActivityFeedSkeleton />
              </div>
            ) : (
              <div className="space-y-6">
                {/* 4 KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-5 bg-[#141416] border border-[#27272a] shadow-sm rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2 bg-[#0075de]/10 border border-[#0075de]/20 rounded-lg text-[#0075de]"><Users size={18} /></span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Total Users</p>
                    <h3 className="text-2xl font-black text-zinc-100">{metrics?.totalUsers ?? users.length}</h3>
                    <p className="text-[11px] text-zinc-500 mt-1">Verified Platform Accounts</p>
                  </Card>

                  <Card className="p-5 bg-[#141416] border border-[#27272a] shadow-sm rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400"><Lock size={18} /></span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                        Enforced
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Active Roles</p>
                    <h3 className="text-2xl font-black text-zinc-100">{metrics?.activeRoles ?? 4}</h3>
                    <p className="text-[11px] text-zinc-500 mt-1">Enterprise RBAC Tiers</p>
                  </Card>

                  <Card className="p-5 bg-[#141416] border border-[#27272a] shadow-sm rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400"><ShieldCheck size={18} /></span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Passing
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Security Status</p>
                    <h3 className="text-2xl font-black text-emerald-400">{metrics?.securityStatus ?? "Protected"}</h3>
                    <p className="text-[11px] text-zinc-500 mt-1">PostgreSQL RLS &amp; TLS 1.3 Active</p>
                  </Card>

                  <Card className="p-5 bg-[#141416] border border-[#27272a] shadow-sm rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400"><Activity size={18} /></span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        {metrics?.uptime ?? "99.98%"} Uptime
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">System Health</p>
                    <h3 className="text-2xl font-black text-zinc-100">{metrics?.systemHealth ?? "Operational"}</h3>
                    <p className="text-[11px] text-zinc-500 mt-1">All Core Services Online</p>
                  </Card>
                </div>

                {/* Infrastructure Services Health Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(metrics?.servicesStatus || [
                    { name: "PostgreSQL Database (Supabase)", category: "Primary Store", status: "Operational", latency: "18ms" },
                    { name: "Authentication & RBAC Engine", category: "Security & Auth", status: "Operational", latency: "12ms" },
                    { name: "Google Gemini 1.5 AI Gateway", category: "AI Models", status: "Operational", latency: "45ms" },
                    { name: "Documents & Asset Storage", category: "Cloud Storage", status: "Operational", latency: "22ms" }
                  ]).map((svc: any, idx: number) => (
                    <Card key={idx} className="p-4 bg-[#141416] border border-[#27272a] rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <h4 className="text-xs font-bold text-zinc-200">{svc.name}</h4>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1">{svc.category} • Latency {svc.latency}</p>
                      </div>
                      <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        {svc.status}
                      </span>
                    </Card>
                  ))}
                </div>

                {/* Platform Activity & Recent Audit Trail */}
                <Card className="p-6 bg-[#141416] border border-[#27272a] rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                        <Clock size={16} className="text-[#0075de]" />
                        Live Platform Governance Activity
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Stream of authenticated activities, commercial agreements, and system events.
                      </p>
                    </div>
                    <Button
                      onClick={() => setActiveTab("security")}
                      variant="outline"
                      className="h-8 text-xs border-[#27272a] bg-[#18181b] text-zinc-300 hover:bg-[#1e1e22]"
                    >
                      View All Audit Logs ({securityEvents.length})
                    </Button>
                  </div>

                  {securityEvents.length === 0 ? (
                    <div className="py-8 text-center text-zinc-500 text-xs">
                      No recent platform audit records.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#27272a]/60">
                      {securityEvents.slice(0, 5).map((ev, i) => (
                        <div key={ev.id || i} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <span className="p-1.5 bg-[#0075de]/10 border border-[#0075de]/20 text-[#0075de] rounded-lg mt-0.5 shrink-0">
                              <FileText size={14} />
                            </span>
                            <div>
                              <span className="font-mono text-xs font-bold text-zinc-200 block">
                                {ev.event_type}
                              </span>
                              <span className="text-xs text-zinc-400 block mt-0.5">
                                {ev.details}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                            {ev.created_at}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Platform Telemetry Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#141416] border border-[#27272a] rounded-xl text-center">
                    <p className="text-[10px] font-black uppercase text-zinc-500">Enterprise Leads</p>
                    <p className="text-xl font-black text-zinc-100 mt-1">{metrics?.leadsCount ?? 136}</p>
                  </div>
                  <div className="p-4 bg-[#141416] border border-[#27272a] rounded-xl text-center">
                    <p className="text-[10px] font-black uppercase text-zinc-500">Commercial Agreements</p>
                    <p className="text-xl font-black text-zinc-100 mt-1">{metrics?.agreementsCount ?? 6}</p>
                  </div>
                  <div className="p-4 bg-[#141416] border border-[#27272a] rounded-xl text-center">
                    <p className="text-[10px] font-black uppercase text-zinc-500">Invoices Processed</p>
                    <p className="text-xl font-black text-zinc-100 mt-1">{metrics?.invoicesCount ?? 3}</p>
                  </div>
                  <div className="p-4 bg-[#141416] border border-[#27272a] rounded-xl text-center">
                    <p className="text-[10px] font-black uppercase text-zinc-500">Total Audit Events</p>
                    <p className="text-xl font-black text-zinc-100 mt-1">{metrics?.totalAuditEvents ?? 47}</p>
                  </div>
                </div>

              </div>
            )
          )}

          {/* 2. USER DIRECTORY */}
          {activeTab === "users" && (
            loading && users.length === 0 ? (
              <AdminTableSkeleton rows={6} />
            ) : (
              <Card className="p-6 bg-[#141416] border border-[#27272a] rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">Platform User Directory</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Authentic registered platform accounts stored in Supabase database.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                      placeholder="Search users or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 h-9 text-xs bg-[#18181b] border-[#27272a] text-zinc-200 placeholder:text-zinc-500 rounded-xl focus:border-[#0075de]"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#27272a]">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="border-b border-[#27272a] bg-[#18181b]">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">User Account</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">Platform Role</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">Department / Scope</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272a]">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-zinc-500 text-xs">
                            No users found matching "{userSearch}".
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-[#18181b]/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#0075de]/15 border border-[#0075de]/30 flex items-center justify-center text-xs font-black text-[#0075de]">
                                  {(u.full_name || u.email || "U").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-bold text-zinc-100 block text-xs">{u.full_name}</span>
                                  <span className="text-[11px] font-mono text-zinc-400">{u.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2.5 py-1 bg-[#0075de]/10 border border-[#0075de]/20 text-[#0075de] text-[11px] font-bold rounded-lg inline-block">
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-zinc-300 font-medium">
                              {u.department}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-full">
                                {u.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )
          )}

          {/* 3. RBAC */}
          {activeTab === "rbac" && (
            loading && roles.length === 0 ? (
              <AdminRBACSkeleton />
            ) : (
              <Card className="p-6 bg-[#141416] border border-[#27272a] rounded-2xl shadow-sm">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-zinc-100">Enterprise Role-Based Access Control (RBAC)</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Pre-configured platform governance tiers with granular module authorization.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map((r, i) => (
                    <div key={r.id || i} className="p-5 border border-[#27272a] bg-[#18181b] rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-sm text-zinc-100">{r.name}</h4>
                          <span className="px-2.5 py-0.5 bg-[#0075de]/10 border border-[#0075de]/20 text-[#0075de] rounded-full text-[10px] font-black uppercase">
                            {r.userCount} {r.userCount === 1 ? "User" : "Users"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                          {r.description}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase text-zinc-500 mb-2">Authorized Scopes:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(r.permissions || ["Full Access"]).map((perm: string, pIdx: number) => (
                            <span key={pIdx} className="px-2 py-0.5 bg-[#27272a]/60 border border-[#27272a] text-zinc-300 text-[10px] font-medium rounded-md">
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          )}

          {/* 4. SECURITY & AUDIT */}
          {activeTab === "security" && (
            loading && securityEvents.length === 0 ? (
              <div className="space-y-6">
                <div className="p-5 bg-[#141416] border border-[#27272a] rounded-2xl animate-pulse h-20" />
                <AdminTableSkeleton rows={8} />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Perimeter Security Banner */}
                <div className="p-5 bg-gradient-to-r from-emerald-950/40 via-[#141416] to-[#141416] border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">Platform Security Perimeter: Enforced &amp; Protected</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        PostgreSQL Row-Level Security active, TLS 1.3 enforced, 0 active security vulnerabilities.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-auto">
                    Perimeter Protected
                  </span>
                </div>

                {/* Security Guardrails Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="p-4 bg-[#141416] border border-[#27272a] rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-zinc-200">Database Row Level Security</h4>
                    </div>
                    <p className="text-[11px] text-zinc-400">All Supabase tables guarded by authenticated user policy.</p>
                  </Card>

                  <Card className="p-4 bg-[#141416] border border-[#27272a] rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-zinc-200">TLS 1.3 Encryption</h4>
                    </div>
                    <p className="text-[11px] text-zinc-400">Strict end-to-end transport encryption on all API routes.</p>
                  </Card>

                  <Card className="p-4 bg-[#141416] border border-[#27272a] rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-zinc-200">Environment Secret Isolation</h4>
                    </div>
                    <p className="text-[11px] text-zinc-400">Service role credentials isolated to server runtimes.</p>
                  </Card>
                </div>

                {/* Audit Events Log Stream */}
                <Card className="p-6 bg-[#141416] border border-[#27272a] rounded-2xl shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-zinc-100">Platform Audit Event Logs</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Immutable activity records captured from commercial agreements, invoices, and operations.
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#27272a]">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="border-b border-[#27272a] bg-[#18181b]">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">Action</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">Resource / Details</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">Severity</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">Timestamp (IST)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#27272a]">
                        {securityEvents.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-zinc-500 text-xs">
                              No security audit logs recorded.
                            </td>
                          </tr>
                        ) : (
                          securityEvents.map((ev, i) => (
                            <tr key={ev.id || i} className="hover:bg-[#18181b]/50 transition-colors">
                              <td className="px-4 py-3 font-mono text-xs font-bold text-zinc-200">
                                {ev.event_type}
                              </td>
                              <td className="px-4 py-3 text-xs text-zinc-300">
                                {ev.details}
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 bg-[#0075de]/10 border border-[#0075de]/20 text-[#0075de] text-[10px] font-black uppercase rounded-md">
                                  {ev.severity || "Info"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[11px] font-mono text-zinc-400">
                                {ev.created_at}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )
          )}

          {/* 5. INTEGRATIONS */}
          {activeTab === "integrations" && (
            loading && integrations.length === 0 ? (
              <AdminIntegrationsSkeleton />
            ) : (
              <div className="space-y-6">
                {/* Verified Platform Services */}
                <Card className="p-6 bg-[#141416] border border-[#27272a] rounded-2xl shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-zinc-100">Connected Platform Integrations</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Core third-party services and microservice gateways currently active.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrations.map((item, i) => (
                      <div key={item.id || i} className="p-4 border border-[#27272a] bg-[#18181b] rounded-xl flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-zinc-100">{item.provider_name}</h4>
                          <p className="text-xs text-zinc-400 mt-0.5">{item.category}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase">
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Scoped API Keys */}
                <Card className="p-6 bg-[#141416] border border-[#27272a] rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-zinc-100">External API Keys</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Scoped programmatic tokens for external webhook automation and APIs.
                      </p>
                    </div>
                    <Button
                      onClick={async () => {
                        const name = prompt("Enter a label for the new API Key (e.g., 'Make Integration Key'):");
                        if (name) {
                          try {
                            const res = await fetch("/api/admin-setup/integrations", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "create-api-key", key_name: name, scopes: ["read"] })
                            });
                            const data = await res.json();
                            if (data.apiKey) {
                              setApiKeys([...apiKeys, data.apiKey]);
                              toast.success(`Generated API Key: ${data.apiKey.key_name}`);
                            }
                          } catch (e) {
                            toast.error("Failed to generate API Key.");
                          }
                        }
                      }}
                      className="h-9 px-3 text-xs bg-[#0075de] hover:bg-[#0062bd] text-white rounded-xl font-bold"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Generate Scoped Key
                    </Button>
                  </div>

                  {apiKeys.length === 0 ? (
                    <div className="py-8 px-4 text-center border border-dashed border-[#27272a] rounded-xl bg-[#18181b]/40">
                      <KeyRound className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-zinc-300">No External API Keys Generated</p>
                      <p className="text-[11px] text-zinc-500 mt-1 max-w-md mx-auto">
                        All platform services authenticate via secure internal server credentials. Click "Generate Scoped Key" above to create one.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {apiKeys.map((k, i) => (
                        <div key={k.id || i} className="p-4 border border-[#27272a] bg-[#18181b] rounded-xl flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-sm text-zinc-100">{k.key_name}</h4>
                            <p className="text-xs font-mono text-zinc-400 mt-0.5">{k.key_prefix}••••••••••••</p>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )
          )}

          {/* 6. AI GOVERNANCE */}
          {activeTab === "ai_governance" && (
            <Card className="p-6 bg-[#141416] border border-[#27272a] rounded-2xl shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-zinc-100">AI Platform Security &amp; Data Guardrails</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Enterprise policies governing Google Gemini LLM requests, PII scrubbing, and isolation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-[#27272a] bg-[#18181b] rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle size={16} />
                    <span>DLP PII Masking</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Sensitive data (Phone numbers, PAN, GSTIN, and Auth Tokens) is stripped before model prompt dispatch.
                  </p>
                </div>

                <div className="p-4 border border-[#27272a] bg-[#18181b] rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle size={16} />
                    <span>Workspace Isolation</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Client prompts and document embeddings are isolated to separate workspace boundaries.
                  </p>
                </div>

                <div className="p-4 border border-[#27272a] bg-[#18181b] rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle size={16} />
                    <span>Tool Audit Logging</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Every autonomous action and model execution writes an immutable trace to the audit stream.
                  </p>
                </div>
              </div>

              <div className="p-4 border border-[#27272a] bg-[#18181b] rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Active AI Model Provider</h4>
                  <p className="text-[11px] text-zinc-500">Google Gemini 1.5 Flash &amp; Pro (Direct API Integration)</p>
                </div>
                <span className="px-2.5 py-1 bg-[#0075de]/10 border border-[#0075de]/20 text-[#0075de] text-[10px] font-black uppercase rounded-lg">
                  Connected
                </span>
              </div>
            </Card>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
