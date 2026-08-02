"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Zap, Target, MapPin, Star, X, Copy, Loader2,
  CheckCircle, AlertCircle, Phone, Mail, Users, RefreshCw, Send,
  Info, Plus, Upload, Download, Trash2, Search, MoreHorizontal,
  Globe, Building2, ExternalLink, Sparkles, Check, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Lead } from "@/types";
import { useSession } from "next-auth/react";

// --- LEAD SCORE BARS (Linear style) ---
const LeadScoreBar = ({ score }: { score: number }) => {
  const filledBars = score >= 8 ? 3 : score >= 5 ? 2 : score >= 2 ? 1 : 0;
  const barColors = score >= 8 ? "bg-[#DC2626]" : score >= 5 ? "bg-[#F59E0B]" : "bg-[#6B7280]";
  
  return (
    <div className="flex items-center gap-1.5" title={`Score: ${score}/10`}>
      <span className="text-xs font-semibold text-[#111827] w-6">{score.toFixed(1)}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={cn(
              "w-1 h-3 rounded-full",
              bar <= filledBars ? barColors : "bg-[#E5E7EB]"
            )}
          />
        ))}
      </div>
    </div>
  );
};

// --- STATUS PILL CHIPS ---
const StatusChip = ({ status }: { status: Lead['status'] }) => {
  const configs: Record<string, { label: string, color: string }> = {
    new: { label: "New", color: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]" },
    qualified: { label: "Qualified", color: "bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]" },
    outreach: { label: "Outreach", color: "bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]" },
    contacted: { label: "Contacted", color: "bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]" },
    warm: { label: "Warm", color: "bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]" },
    cold: { label: "Cold", color: "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]" },
    client: { label: "Client", color: "bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7]" },
  };

  const config = configs[status] || configs.new;

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase tracking-wider leading-none shadow-sm", config.color)}>
      {config.label}
    </span>
  );
};

// --- CUSTOM SUBTLE DROPDOWN FILTER ---
interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownFilterProps {
  label: string;
  value: string | null;
  options: DropdownOption[];
  onChange: (value: string | null) => void;
}

const DropdownFilter = ({ label, value, options, onChange }: DropdownFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOption = options.find(o => o.value === value);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--text-secondary)] text-xs font-semibold rounded-lg transition-all cursor-pointer",
          isOpen && "border-[var(--primary)]/45 bg-[var(--card)] text-[var(--primary)] ring-1 ring-[var(--primary)]/10 shadow-sm"
        )}
      >
        <span className="text-[var(--text-muted)] font-normal">{label}:</span>
        <span className="text-[var(--text-primary)]">{activeOption ? activeOption.label : "All"}</span>
        <ChevronDown size={12} className={cn("text-[var(--text-muted)] transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-44 bg-[var(--card)] border border-[var(--border-subtle)] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] py-1 z-[120] animate-in fade-in-50 slide-in-from-top-1 duration-150">
          <button
            type="button"
            onClick={() => { onChange(null); setIsOpen(false); }}
            className={cn(
              "w-full text-left px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] font-medium flex items-center justify-between transition-colors cursor-pointer",
              !value && "bg-[var(--primary)]/15 text-[var(--primary)] font-bold"
            )}
          >
            <span>All</span>
            {!value && <Check size={12} />}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] font-medium flex items-center justify-between transition-colors cursor-pointer",
                value === opt.value && "bg-[var(--primary)]/15 text-[var(--primary)] font-bold"
              )}
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check size={12} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function LeadsAdminPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isAdminOrCoAdmin = role === "ADMIN" || role === "CO_ADMIN";

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // AI Outreach Drawer state inside details drawer
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email' | 'call'>('whatsapp');
  const [generatedContent, setGeneratedContent] = useState<{ whatsapp: string, email: string, call: string } | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [invitation, setInvitation] = useState<{ status: "loading" | "not_invited" | "sent" | "accepted" | "expired" | "revoked"; email?: string | null; expiresAt?: string | null }>({ status: "not_invited" });
  const [inviting, setInviting] = useState(false);

  // New Lead / Import Modals State
  const [showAddLead, setShowAddLead] = useState(false);
  const [showImportLead, setShowImportLead] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLead, setNewLead] = useState({
    business_name: "",
    email: "",
    phone: "",
    city: "",
    status: "new" as Lead['status']
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leads/list?t=${Date.now()}`);
      const data = await res.json() as Lead[];
      const sortedData = (data || []).sort((a, b) => {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
      setLeads(sortedData);
    } catch (e) {
      console.error(e);
      showToast("Failed to fetch leads", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (!activeLeadId) return;
    let cancelled = false;
    setInvitation({ status: "loading" });
    fetch(`/api/admin/leads/${activeLeadId}/invite-client`, { cache: "no-store" })
      .then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error || "Unable to load invitation status"); return body; })
      .then((body) => { if (!cancelled) setInvitation(body); })
      .catch(() => { if (!cancelled) setInvitation({ status: "not_invited" }); });
    return () => { cancelled = true; };
  }, [activeLeadId]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Click outside listener for Action Menu Dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveActionMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const updateStatus = async (id: string | undefined, status: Lead['status'], extraData: Partial<Lead> = {}) => {
    if (!id) return;

    setUpdatingId(id);
    const previousLeads = [...leads];
    setLeads(current => current.map(l => l.id === id ? { ...l, status, ...extraData } : l));

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extraData })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update status");
      }
      
      showToast("Lead updated successfully");
      await fetchLeads();
    } catch (e: unknown) {
      console.error(e);
      setLeads(previousLeads);
      showToast(e instanceof Error ? e.message : "Update failed", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const inviteQualifiedClient = async (lead: Lead) => {
    if (!lead.id) return;
    setInviting(true);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}/invite-client`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to invite client");
      setInvitation(body);
      showToast(`Secure invitation sent to ${body.email}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Invitation failed", "error");
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete lead");
      }

      showToast("Lead deleted successfully");
      if (activeLeadId === id) setActiveLeadId(null);
      fetchLeads();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Delete failed", "error");
    }
  };
  const handleDeleteSelectedLeads = async () => {
    if (selectedLeadIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedLeadIds.length} selected leads?`)) return;

    setIsSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const id of selectedLeadIds) {
        const res = await fetch(`/api/leads/${id}`, {
          method: "DELETE"
        });
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      }

      if (failCount === 0) {
        showToast(`Successfully deleted ${successCount} leads`);
      } else {
        showToast(`Deleted ${successCount} leads (${failCount} failed)`, "error");
      }

      setSelectedLeadIds([]);
      setActiveLeadId(null);
      fetchLeads();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Bulk delete failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  const generateAIOutreach = async (lead: Lead, force = false) => {
    if (!lead.id) return;

    if (!force && lead.outreach_generated && lead.outreach_content) {
      setGeneratedContent(lead.outreach_content);
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/leads/outreach/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setGeneratedContent(data);
      await fetchLeads();
      showToast("Strategy Generated ✨");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "AI Generation failed";
      showToast(message, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create lead");
      
      showToast("Lead added successfully");
      setShowAddLead(false);
      setNewLead({ business_name: "", email: "", phone: "", city: "", status: "new" });
      fetchLeads();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Unable to create lead", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    window.location.href = "/api/crm/export?format=csv";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportCSV = async () => {
    if (!selectedFile) {
      showToast("Please select a file", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const text = await selectedFile.text();
      const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "");
      if (rawLines.length < 2) throw new Error("File is empty or invalid");

      const parseCSVLine = (line: string) => {
        const result = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = "";
          } else cur += char;
        }
        result.push(cur.trim());
        return result;
      };

      const headers = parseCSVLine(rawLines[0]).map(h => h.toLowerCase().replace(/["']/g, ""));
      const data = rawLines.slice(1).map(line => {
        const values = parseCSVLine(line).map(v => v.replace(/["']/g, ""));
        const obj: Record<string, string | number | boolean> = {};
        headers.forEach((header, i) => {
          const val = values[i];
          if (!val) return;

          if (header.includes("business") || header.includes("company") || header.includes("organization")) obj.business_name = val;
          if (header.includes("contact") || header.includes("name") || header.includes("founder") || header.includes("person")) obj.name = val;
          if (header.includes("email") || header.includes("mail")) obj.email = val;
          if (header.includes("phone") || header.includes("mobile") || header.includes("contact number")) obj.phone = val;
          if (header.includes("city") || header.includes("location") || header.includes("address")) obj.city = val;
          if (header.includes("status")) obj.status = val;
        });
        return obj;
      });

      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: data })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Import failed");
      
      showToast(`Success: ${result.count} leads imported`);
      setShowImportLead(false);
      setSelectedFile(null);
      fetchLeads();
    } catch (e: unknown) {
      showToast(`Import Failed: ${e instanceof Error ? e.message : "Unknown error"}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenOutreach = (lead: Lead) => {
    setActiveLeadId(lead.id || null);
    generateAIOutreach(lead);
  };

  // --- MOCK INDUSTRY DERIVATION ---
  const getMockIndustry = (businessName: string) => {
    const name = businessName.toLowerCase();
    if (name.includes("jewel") || name.includes("jwl") || name.includes("gold")) return "Retail";
    if (name.includes("studio") || name.includes("design") || name.includes("creative")) return "Creative";
    if (name.includes("tech") || name.includes("software") || name.includes("ai")) return "Technology";
    if (name.includes("clinic") || name.includes("dental") || name.includes("health")) return "Healthcare";
    if (name.includes("hotel") || name.includes("rest") || name.includes("cafe") || name.includes("cater")) return "Hospitality";
    return "Services";
  };

  // KPI Calculations
  const hotLeadsCount = leads.filter(l => (l.lead_score || 0) >= 7).length;
  const totalLeads = leads.length;
  const qualifiedCount = leads.filter(l => l.status === "qualified").length;
  const newCount = leads.filter(l => l.status === "new").length;
  const clientCount = leads.filter(l => l.status === "client").length;
  const conversionRate = totalLeads ? Math.round(((qualifiedCount + clientCount) / totalLeads) * 100) : 0;
  const revenueValue = clientCount * 25000 + qualifiedCount * 5000;

  // Filter implementation
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchQuery ? (
      lead.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : true;

    const matchesStatus = statusFilter ? lead.status === statusFilter : true;
    const matchesLocation = locationFilter ? lead.city === locationFilter : true;
    const matchesIndustry = industryFilter ? getMockIndustry(lead.business_name) === industryFilter : true;

    return matchesSearch && matchesStatus && matchesLocation && matchesIndustry;
  });

  const selectedLead = leads.find(l => l.id === activeLeadId) || null;

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--text-primary)] font-sans antialiased -m-6 p-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={cn(
              "fixed top-6 left-1/2 z-[150] px-4 py-2.5 rounded-lg shadow-md border flex items-center gap-2 min-w-[280px]",
              toast.type === 'success' ? "bg-[var(--card)] border-[var(--border-subtle)] text-[var(--text-primary)]" : "bg-red-500/10 border-red-500/20 text-red-400"
            )}
          >
            {toast.type === 'success' ? <CheckCircle size={15} className="text-emerald-500" /> : <AlertCircle size={15} />}
            <span className="text-xs font-semibold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* --- PAGE HEADER TOOLBAR --- */}
        <div className="bg-[var(--card)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight leading-none">Leads</h1>
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse mt-0.5" />
              </div>
              <p className="text-[var(--text-muted)] text-xs mt-1">Sales Pipeline & CRM Hub</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-[var(--border-subtle)] rounded-lg text-xs bg-[var(--surface-1)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end shrink-0">
                <Button onClick={() => setShowImportLead(true)} variant="outline" className="h-8 px-3 bg-[var(--card)] border border-[var(--border-subtle)] hover:bg-[var(--surface-2)] text-[var(--text-secondary)] text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer">
                  <Upload size={12} className="shrink-0" /> Import CSV
                </Button>
                <Link href="/admin/leads/scrape" className="shrink-0">
                  <Button className="h-8 px-3 bg-[var(--card)] border border-[var(--border-subtle)] hover:bg-[var(--surface-2)] text-[var(--text-secondary)] text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer">
                    <Zap size={12} className="text-[var(--primary)] fill-[var(--primary)] shrink-0" /> Hunt Leads
                  </Button>
                </Link>
                <Button onClick={() => setShowAddLead(true)} className="h-8 px-3 bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer">
                  <Plus size={12} className="shrink-0" /> Add Lead
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E7EB]">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mr-1">Filters:</span>
            
            {/* Status Dropdown */}
            <DropdownFilter
              label="Status"
              value={statusFilter}
              options={[
                { label: "New", value: "new" },
                { label: "Qualified", value: "qualified" },
                { label: "Outreach", value: "outreach" },
                { label: "Contacted", value: "contacted" },
                { label: "Client", value: "client" }
              ]}
              onChange={setStatusFilter}
            />

            {/* Location Dropdown */}
            <DropdownFilter
              label="Location"
              value={locationFilter}
              options={Array.from(new Set(leads.map(l => l.city).filter(Boolean))).map(city => ({
                label: city!,
                value: city!
              }))}
              onChange={setLocationFilter}
            />

            {/* Industry Dropdown */}
            <DropdownFilter
              label="Industry"
              value={industryFilter}
              options={[
                { label: "Retail", value: "Retail" },
                { label: "Creative", value: "Creative" },
                { label: "Technology", value: "Technology" },
                { label: "Healthcare", value: "Healthcare" },
                { label: "Hospitality", value: "Hospitality" },
                { label: "Services", value: "Services" }
              ]}
              onChange={setIndustryFilter}
            />

            {/* Clear Filters Button */}
            {(statusFilter || locationFilter || industryFilter) && (
              <button
                onClick={() => {
                  setStatusFilter(null);
                  setLocationFilter(null);
                  setIndustryFilter(null);
                }}
                className="text-xs font-semibold text-[#2563EB] hover:text-blue-700 ml-2"
              >
                Clear Filters
              </button>
            )}

            {/* Bulk actions */}
            {selectedLeadIds.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs font-semibold text-[#6B7280]">{selectedLeadIds.length} selected</span>
                {isAdminOrCoAdmin && (
                  <Button
                    onClick={handleDeleteSelectedLeads}
                    variant="outline"
                    className="h-7 px-2.5 bg-red-50 border border-red-200 text-[#DC2626] hover:bg-red-100/50 text-[10px] font-bold rounded-lg"
                  >
                    Delete Selected
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- SUMMARY METRICS --- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Leads", value: totalLeads },
            { label: "Qualified", value: qualifiedCount },
            { label: "New", value: newCount },
            { label: "Hot", value: hotLeadsCount },
            { label: "Conversion", value: `${conversionRate}%` },
            { label: "Revenue", value: `₹${(revenueValue / 100000).toFixed(1)}L` },
          ].map((widget, i) => (
            <div key={i} className="bg-[var(--card)] border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm flex flex-col justify-between h-20 hover:border-[var(--border-hover)] transition-colors">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider leading-none">{widget.label}</p>
              <p className="text-xl font-bold text-[var(--text-primary)] leading-none">{widget.value}</p>
            </div>
          ))}
        </div>

        {/* --- MAIN DATA TABLE --- */}
        <div className="bg-[var(--card)] border border-[var(--border-subtle)] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap table-fixed">
              <thead className="bg-[var(--surface-2)]/30 border-b border-[var(--border-subtle)] text-[var(--text-secondary)] font-semibold sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={leads.length > 0 && selectedLeadIds.length === leads.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeadIds(leads.map(l => l.id).filter(Boolean) as string[]);
                        } else {
                          setSelectedLeadIds([]);
                        }
                      }}
                      className="rounded border-[#E5E7EB] text-[#2563EB] focus:ring-[#2563EB] h-3.5 w-3.5"
                    />
                  </th>
                  <th className="px-5 py-3 w-48 font-bold uppercase tracking-wider text-[10px]">Company</th>
                  <th className="px-4 py-3 w-28 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-4 py-3 w-32 font-bold uppercase tracking-wider text-[10px]">Location</th>
                  <th className="px-4 py-3 w-28 font-bold uppercase tracking-wider text-[10px]">Industry</th>
                  <th className="px-4 py-3 w-36 font-bold uppercase tracking-wider text-[10px]">Website</th>
                  <th className="px-4 py-3 w-40 font-bold uppercase tracking-wider text-[10px]">Email</th>
                  <th className="px-4 py-3 w-32 font-bold uppercase tracking-wider text-[10px]">Phone</th>
                  <th className="px-4 py-3 w-32 font-bold uppercase tracking-wider text-[10px]">Lead Score</th>
                  <th className="px-4 py-3 w-32 font-bold uppercase tracking-wider text-[10px]">Assigned</th>
                  <th className="px-4 py-3 w-32 font-bold uppercase tracking-wider text-[10px]">Date Added</th>
                  <th className="px-4 py-3 w-16 text-center font-bold uppercase tracking-wider text-[10px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {loading ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-20 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
                        Loading lead intelligence...
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-20 text-center bg-[var(--surface-2)]/10">
                      <div className="flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[var(--text-primary)]">No leads matching criteria</h4>
                          <p className="text-xs text-[var(--text-muted)] mt-1">Try adjusting your filters or search terms to locate leads.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.map((lead) => {
                  const isChecked = selectedLeadIds.includes(lead.id || "");
                  const isCurrentActive = activeLeadId === lead.id;
                  const industry = getMockIndustry(lead.business_name);
 
                  return (
                    <tr 
                      key={lead.id} 
                      className={cn(
                        "h-14 hover:bg-[var(--surface-2)]/40 border-b border-[var(--border-subtle)] transition-all cursor-pointer", 
                        isCurrentActive && "bg-[var(--primary)]/10 hover:bg-[var(--primary)]/15"
                      )}
                      onClick={() => setActiveLeadId(lead.id || null)}
                    >
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeadIds(curr => [...curr, lead.id || ""]);
                            } else {
                              setSelectedLeadIds(curr => curr.filter(id => id !== lead.id));
                            }
                          }}
                          className="rounded border-[var(--border-subtle)] text-[var(--primary)] focus:ring-[var(--primary)] h-3.5 w-3.5"
                        />
                      </td>
                      <td className="px-5 py-3 font-semibold text-[var(--text-primary)]">
                        <div className="truncate" title={lead.business_name}>
                          {lead.business_name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip status={lead.status} />
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        <div className="truncate" title={lead.city}>
                          {lead.city || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] font-medium">
                        {industry}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {lead.website_url ? (
                          <a 
                            href={lead.website_url.startsWith("http") ? lead.website_url : `https://${lead.website_url}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline font-medium cursor-pointer"
                          >
                            <Globe size={11} className="shrink-0" />
                            <span className="truncate max-w-[120px]">{lead.website_url.replace(/(https?:\/\/)?(www\.)?/, "")}</span>
                            <ExternalLink size={10} className="shrink-0 text-[var(--text-muted)]" />
                          </a>
                        ) : (
                          <span className="text-[var(--text-muted)] font-normal italic">No website</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] font-medium truncate" title={lead.email}>
                        {lead.email || "—"}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] font-medium">
                        {lead.phone || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <LeadScoreBar score={lead.lead_score || 0} />
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] font-semibold uppercase tracking-wider text-[9px]">
                        {lead.assigned_to_member?.name || "Unassigned"}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setActiveActionMenuId(activeActionMenuId === lead.id ? null : (lead.id || null))}
                            className="p-1.5 hover:bg-[var(--surface-2)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                          
                          {/* Dropdown Options */}
                          {activeActionMenuId === lead.id && (
                            <div 
                              ref={actionMenuRef}
                              className="absolute right-0 mt-1 w-36 bg-[var(--card)] border border-[var(--border-subtle)] rounded-lg shadow-lg py-1 z-[120] text-left"
                            >
                              <button 
                                onClick={() => { setActiveLeadId(lead.id || null); setActiveActionMenuId(null); }}
                                className="w-full text-left px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] font-medium cursor-pointer"
                              >
                                View Details
                              </button>
                              <button 
                                onClick={() => { handleOpenOutreach(lead); setActiveActionMenuId(null); }}
                                className="w-full text-left px-3 py-1.5 text-xs text-[var(--primary)] hover:bg-[var(--surface-2)] font-medium cursor-pointer"
                              >
                                Start Outreach
                              </button>
                              {lead.status === "qualified" ? <button
                                onClick={() => { inviteQualifiedClient(lead); setActiveActionMenuId(null); }}
                                className="w-full text-left px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 font-semibold cursor-pointer"
                              >Invite Client</button> : <button
                                onClick={() => { updateStatus(lead.id, 'qualified'); setActiveActionMenuId(null); }}
                                className="w-full text-left px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] font-medium cursor-pointer"
                              >Mark Qualified</button>}
                              {isAdminOrCoAdmin && (
                                <button 
                                  onClick={() => { handleDeleteLead(lead.id!); setActiveActionMenuId(null); }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 font-semibold border-t border-[var(--border-subtle)] cursor-pointer"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- HUBSPOT-STYLE SLIDE-OUT DRAWER --- */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[110] flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLeadId(null)}
              className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="relative w-full max-w-[420px] bg-white border-l border-[#E5E7EB] shadow-2xl flex flex-col h-full z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-[#6B7280]" />
                  <div>
                    <h2 className="text-sm font-bold text-[#111827] leading-none truncate max-w-[280px]" title={selectedLead.business_name}>
                      {selectedLead.business_name}
                    </h2>
                    <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mt-1">Lead Intelligence Profile</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveLeadId(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Content Panel Scrollable */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-[#F8FAFC]/40">
                
                {/* Section 1: Lead Score Widget */}
                <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl shadow-sm">
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Opportunity Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#111827] leading-none">{(selectedLead.lead_score || 0).toFixed(1)}</span>
                    <span className="text-xs font-semibold text-[#6B7280]">/ 10.0 Calculated Quality</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        (selectedLead.lead_score || 0) >= 7 ? "bg-[#DC2626]" : (selectedLead.lead_score || 0) >= 4 ? "bg-[#F59E0B]" : "bg-[#6B7280]"
                      )}
                      style={{ width: `${(selectedLead.lead_score || 0) * 10}%` }}
                    />
                  </div>
                </div>

                {/* Section 2: Contact Details */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-[#E5E7EB]">
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Contact Details</p>
                  </div>
                  <div className="p-4 space-y-3.5 text-xs text-[#111827] font-medium">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B7280] font-normal">Contact Person</span>
                      <span>{selectedLead.name || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B7280] font-normal">Phone</span>
                      <a href={`tel:${selectedLead.phone}`} className="text-[#2563EB] hover:underline flex items-center gap-1">
                        <Phone size={11} /> {selectedLead.phone || "—"}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B7280] font-normal">Email</span>
                      <a href={`mailto:${selectedLead.email}`} className="text-[#2563EB] hover:underline flex items-center gap-1">
                        <Mail size={11} /> {selectedLead.email || "—"}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B7280] font-normal">Website</span>
                      {selectedLead.website_url ? (
                        <a 
                          href={selectedLead.website_url.startsWith("http") ? selectedLead.website_url : `https://${selectedLead.website_url}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[#2563EB] hover:underline flex items-center gap-1"
                        >
                          <Globe size={11} /> {selectedLead.website_url}
                        </a>
                      ) : "—"}
                    </div>
                  </div>
                </div>

                {/* Section 3: AI Analysis Card (HubSpot style) */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-[#E5E7EB] flex items-center justify-between">
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={12} className="text-[#2563EB]" /> AI Analysis
                    </p>
                    <span className="inline-flex px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wider">
                      Verified
                    </span>
                  </div>
                  <div className="p-4 space-y-4 text-xs text-[#111827]">
                    {/* Critical Issues */}
                    <div>
                      <h4 className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider mb-2">Critical issues</h4>
                      <ul className="space-y-1.5 text-neutral-600 pl-1 list-none">
                        {!selectedLead.has_website ? (
                          <li className="flex items-start gap-2">
                            <span className="text-[#DC2626] shrink-0 mt-0.5">⚠️</span>
                            <span>No operational website detected.</span>
                          </li>
                        ) : null}
                        {!(selectedLead.google_rating) ? (
                          <li className="flex items-start gap-2">
                            <span className="text-[#DC2626] shrink-0 mt-0.5">⚠️</span>
                            <span>No Google Business profile rating listed.</span>
                          </li>
                        ) : null}
                        {selectedLead.instagram_followers && selectedLead.instagram_followers < 500 ? (
                          <li className="flex items-start gap-2">
                            <span className="text-[#DC2626] shrink-0 mt-0.5">⚠️</span>
                            <span>Weak online presence on Instagram ({selectedLead.instagram_followers} followers).</span>
                          </li>
                        ) : null}
                        {selectedLead.has_website && selectedLead.google_rating ? (
                          <li className="flex items-start gap-2">
                            <span className="text-[#16A34A] shrink-0 mt-0.5">✓</span>
                            <span>Digital channels verified and indexed.</span>
                          </li>
                        ) : null}
                      </ul>
                    </div>

                    {/* Recommended Action Checklist */}
                    <div className="pt-3 border-t border-[#E5E7EB]">
                      <h4 className="text-[10px] font-bold text-[#111827] uppercase tracking-wider mb-2">Recommended action</h4>
                      <ul className="space-y-1.5 text-neutral-600 pl-1 list-none">
                        {!selectedLead.has_website ? (
                          <>
                            <li className="flex items-center gap-2">
                              <span className="text-[#2563EB] text-base shrink-0 leading-none">●</span>
                              <span>Call founder and offer website build audit</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-[#2563EB] text-base shrink-0 leading-none">●</span>
                              <span>Pitch custom landing page design</span>
                            </li>
                          </>
                        ) : (
                          <li className="flex items-center gap-2">
                            <span className="text-[#2563EB] text-base shrink-0 leading-none">●</span>
                            <span>Pitch localized SEO optimization campaign</span>
                          </li>
                        )}
                        {!(selectedLead.google_rating) && (
                          <li className="flex items-center gap-2">
                            <span className="text-[#2563EB] text-base shrink-0 leading-none">●</span>
                            <span>Offer Google Profile listing configuration</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Section 4: Notes */}
                <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl shadow-sm space-y-2">
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB] pb-2">Notes</p>
                  <p className="text-xs text-neutral-600 italic leading-relaxed pt-1">
                    {selectedLead.notes ? selectedLead.notes.replace(/\[Source:.*\]/, "").replace(/\[Created By:.*\]/, "").trim() : "No custom notes recorded for this pipeline lead."}
                  </p>
                </div>

                {/* Section 5: Timeline / Recent Activity */}
                <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl shadow-sm space-y-3">
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB] pb-2">Timeline & Logs</p>
                  <div className="space-y-3 pt-1">
                    <div className="flex gap-2.5 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-neutral-700">Lead Created</p>
                        <p className="text-[10px] text-[#6B7280]">
                          {selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleString() : "Recently"} • Pipeline Registered
                        </p>
                      </div>
                    </div>
                    {selectedLead.outreach_sent && (
                      <div className="flex gap-2.5 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-neutral-700">Outreach Delivered</p>
                          <p className="text-[10px] text-[#6B7280]">Status switched to Contacted</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Drawer Actions Footer */}
              <div className="p-5 border-t border-[#E5E7EB] bg-slate-50/50 flex flex-col gap-2">
                {selectedLead.status === "qualified" && <div className="mb-1 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[10px] text-[#6B7280]"><span className="font-bold uppercase tracking-wider text-neutral-700">Client invitation: </span>{invitation.status === "loading" ? "Checking…" : invitation.status === "accepted" ? "Accepted" : invitation.status === "sent" ? `Sent${invitation.email ? ` to ${invitation.email}` : ""}${invitation.expiresAt ? ` · expires ${new Date(invitation.expiresAt).toLocaleString()}` : ""}` : invitation.status === "expired" ? "Expired — resend required" : invitation.status === "revoked" ? "Revoked" : "Not invited"}</div>}
                <div className="flex gap-2">
                  {selectedLead.status === "qualified" ? <Button
                    onClick={() => inviteQualifiedClient(selectedLead)}
                    isLoading={inviting || invitation.status === "loading"}
                    disabled={invitation.status === "accepted"}
                    className="flex-1 h-9 bg-emerald-600 border border-emerald-700 text-white hover:bg-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm disabled:bg-emerald-100 disabled:text-emerald-800"
                  >{invitation.status === "accepted" ? "Invitation Accepted" : invitation.status === "sent" ? "Resend Invitation" : "Invite Client"}</Button> : <Button
                    onClick={() => updateStatus(selectedLead.id, 'qualified')}
                    isLoading={updatingId === selectedLead.id}
                    className="flex-1 h-9 bg-white border border-[#E5E7EB] text-neutral-600 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm"
                  >Mark Qualified</Button>}
                  <Button 
                    onClick={() => {
                      generateAIOutreach(selectedLead);
                      showToast("Outreach generator active");
                    }}
                    className="flex-1 h-9 bg-[#2563EB] hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm"
                  >
                    Start Outreach
                  </Button>
                </div>
                <Button 
                  onClick={() => alert("Proposal generator active for company.")}
                  variant="outline"
                  className="w-full h-9 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-neutral-500 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm"
                >
                  Generate Proposal
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ADD LEAD MODAL --- */}
      {showAddLead && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="bg-[var(--card)] border border-[var(--border-subtle)] w-full max-w-md p-8 shadow-2xl rounded-xl animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight mb-1">Add New Lead</h2>
            <p className="text-[var(--text-muted)] text-xs mb-6">Manually register a business lead in the sales pipeline.</p>
            
            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Business Name</label>
                <input 
                  required
                  value={newLead.business_name}
                  onChange={(e) => setNewLead({...newLead, business_name: e.target.value})}
                  className="w-full bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg h-10 px-3.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--card)] transition-all"
                  placeholder="Company name..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Contact Person</label>
                <input 
                  value={newLead.business_name} // default mock name field mapping
                  onChange={(e) => setNewLead({...newLead, business_name: e.target.value})}
                  className="w-full bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg h-10 px-3.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--card)] transition-all"
                  placeholder="Founder or manager name..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Email</label>
                  <input 
                     type="email"
                     value={newLead.email}
                     onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                     className="w-full bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg h-10 px-3.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--card)] transition-all"
                     placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Phone</label>
                  <input 
                    value={newLead.phone}
                    onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                    className="w-full bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg h-10 px-3.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--card)] transition-all"
                    placeholder="+91 98..."
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
                <Button type="button" onClick={() => setShowAddLead(false)} variant="ghost" className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-9 px-4 rounded-lg cursor-pointer">Cancel</Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0075de] hover:bg-[#005bab] text-white text-[10px] font-bold uppercase tracking-wider h-9 px-5 rounded-lg shadow-sm min-w-[100px] cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Lead"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- IMPORT LEAD MODAL --- */}
      {showImportLead && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="bg-[var(--card)] border border-[var(--border-subtle)] w-full max-w-md p-8 shadow-2xl rounded-xl animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight mb-1">Import Leads</h2>
            <p className="text-[var(--text-muted)] text-xs mb-6">Bulk upload business leads from a CSV spreadsheet.</p>
            
            <div 
              className={cn(
                "relative border border-dashed rounded-lg p-10 text-center transition-all cursor-pointer",
                selectedFile ? "border-emerald-500/20 bg-emerald-500/5" : "border-[var(--border-subtle)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)]"
              )}
            >
              <input 
                type="file" 
                onChange={handleFileChange}
                accept=".csv"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Upload size={24} className={cn("mx-auto mb-2.5", selectedFile ? "text-emerald-500" : "text-[var(--text-muted)]")} />
              <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide">
                {selectedFile ? selectedFile.name : "Select CSV File"}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                {selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : "Maximum file size 5MB"}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-[var(--border-subtle)] pt-4">
              <Button 
                type="button" 
                onClick={() => {
                  setShowImportLead(false);
                  setSelectedFile(null);
                }} 
                variant="ghost"
                className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-9 px-4 rounded-lg cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleImportCSV}
                disabled={!selectedFile || isSubmitting}
                className="bg-[#0075de] hover:bg-[#005bab] text-white text-[10px] font-bold uppercase tracking-wider h-9 px-5 rounded-lg shadow-sm min-w-[100px] cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Process Import"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
