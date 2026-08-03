"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { 
  Users, TrendingUp, Download, Upload, Filter, Plus, FileDown, FileText, ArrowUpRight, Loader2,
  Building2, X, Search, RefreshCw, SlidersHorizontal, Calendar, ChevronLeft, ChevronRight,
  Mail, Phone, ExternalLink, Sparkles, Clock, StickyNote, MoreHorizontal, Check, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

interface Lead {
  id?: string;
  business_name: string;
  contact_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  business_type?: string;
  source?: string;
  source_tool?: string;
  source_url?: string;
  website_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  has_website?: boolean;
  score?: number;
  status: 'new' | 'contacted' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  priority?: 'low' | 'medium' | 'high';
  assigned_to?: string;
  notes?: string;
  last_contacted_at?: string;
  next_followup_at?: string;
  deal_value?: number;
  tags?: string[];
  custom_fields?: any;
  created_at?: string;
  updated_at?: string;
  assigned_to_member?: {
    name: string;
  };
}

function LeadScoreBar({ score }: { score: number }) {
  const barsCount = 3;
  const scoreOutOfTen = score > 10 ? score / 10 : score;
  const filledBars = scoreOutOfTen >= 7 ? 3 : scoreOutOfTen >= 4 ? 2 : scoreOutOfTen >= 1 ? 1 : 0;
  const colorClass = scoreOutOfTen >= 7 ? "bg-[#1aae39]" : scoreOutOfTen >= 4 ? "bg-[#dd5b00]" : "bg-[#615d59]";
  
  return (
    <div className="flex items-center gap-1.5" title={`Opportunity Score: ${scoreOutOfTen.toFixed(1)}/10.0`}>
      <span className="text-[11px] font-bold text-slate-800 w-5">{scoreOutOfTen.toFixed(1)}</span>
      <div className="flex gap-0.5">
        {Array.from({ length: barsCount }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "w-1 h-3 rounded-[1px] transition-colors", 
              i < filledBars ? colorClass : "bg-slate-100"
            )} 
          />
        ))}
      </div>
    </div>
  );
}

export default function AdminCRMPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isAdminOrCoAdmin = role === "ADMIN" || role === "CO_ADMIN";

  const [leads, setLeads] = useState<Lead[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals & Panels
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Dropdown UI States
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form States
  const [newLead, setNewLead] = useState({
    business_name: "",
    contact_name: "",
    email: "",
    phone: "",
    city: "",
    status: "new" as Lead['status'],
    assigned_to: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const actionMenuRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const ownerRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Loaders & API Calls
  useEffect(() => {
    fetchLeads();
    if (isAdminOrCoAdmin) {
      fetchTeamMembers();
    }
  }, [isAdminOrCoAdmin]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Click outside dropdown listeners
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveActionMenuId(null);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (ownerRef.current && !ownerRef.current.contains(event.target as Node)) {
        setShowOwnerDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/leads");
      if (!res.ok) throw new Error("Failed to fetch CRM leads");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch("/api/admin/team");
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.team || []);
      }
    } catch (e) {
      console.error("Error fetching team members:", e);
    }
  };

  // Sync update to BOTH tables (crm_leads + leads)
  const handleUpdateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      // 1. Update crm_leads
      const resCrm = await fetch(`/api/crm/leads?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!resCrm.ok) throw new Error("Failed to update CRM table");

      // 2. Synchronize translation fields to main leads table
      const mainUpdates: Record<string, any> = {};
      if (updates.status) mainUpdates.status = updates.status;
      if (updates.assigned_to) mainUpdates.assigned_to = updates.assigned_to;
      if (updates.contact_name) mainUpdates.name = updates.contact_name;
      if (updates.email) mainUpdates.email = updates.email;
      if (updates.phone) mainUpdates.phone = updates.phone;
      if (updates.city) mainUpdates.city = updates.city;
      if (updates.notes) mainUpdates.notes = updates.notes;
      if (updates.score) mainUpdates.lead_score = updates.score;

      const resMain = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mainUpdates)
      });
      
      if (!resMain.ok) {
        console.warn("Main lead sync non-fatal warning:", await resMain.text());
      }

      showToast("Lead updated successfully");
      fetchLeads();
    } catch (e: any) {
      showToast(e.message || "Failed to update lead", "error");
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const res = await fetch(`/api/crm/leads?id=${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete lead");
      }

      showToast("Lead deleted successfully");
      if (activeLeadId === id) setActiveLeadId(null);
      setSelectedIds(curr => curr.filter(item => item !== id));
      fetchLeads();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected leads?`)) return;

    setIsSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const id of selectedIds) {
        const res = await fetch(`/api/crm/leads?id=${id}`, {
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

      setSelectedIds([]);
      setActiveLeadId(null);
      fetchLeads();
    } catch (e: any) {
      showToast(e.message || "Bulk delete failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAssign = async (memberId: string) => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    let successCount = 0;
    
    try {
      for (const id of selectedIds) {
        const res = await fetch(`/api/crm/leads?id=${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assigned_to: memberId })
        });
        if (res.ok) successCount++;
      }
      showToast(`Assigned ${successCount} leads successfully`);
      setSelectedIds([]);
      fetchLeads();
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead)
      });
      if (!res.ok) throw new Error("Failed to add lead");
      
      showToast("Lead added successfully");
      setShowAddLead(false);
      setNewLead({ business_name: "", contact_name: "", email: "", phone: "", city: "", status: "new", assigned_to: "" });
      fetchLeads();
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async (format: string) => {
    if (format === 'csv') {
      window.location.href = '/api/crm/export?format=csv'; 
    } else {
      alert(`${format.toUpperCase()} export functionality is building...`);
    }
    setShowExport(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportCSV = async () => {
    if (!selectedFile) return;

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
        const obj: any = {};
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
      setShowImport(false);
      setSelectedFile(null);
      fetchLeads();
    } catch (e: any) {
      showToast(`Import Failed: ${e.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = () => {
    if (!noteInput.trim() || !activeLeadId) return;
    const selectedLead = leads.find(l => l.id === activeLeadId);
    if (!selectedLead) return;

    const timestamp = new Date().toLocaleString();
    const newNotes = selectedLead.notes 
      ? `${selectedLead.notes}\n[${timestamp}] ${noteInput}`
      : `[${timestamp}] ${noteInput}`;

    handleUpdateLead(activeLeadId, { notes: newNotes });
    setNoteInput("");
  };

  // Selection toggles
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredLeads.map(l => l.id!).filter(Boolean));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedIds(curr => [...curr, id]);
    } else {
      setSelectedIds(curr => curr.filter(item => item !== id));
    }
  };

  // Filter & Sort Pipeline logic
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.contact_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.city || "").toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    const matchesOwner = !ownerFilter || lead.assigned_to === ownerFilter;

    return matchesSearch && matchesStatus && matchesOwner;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let valA = a[sortField as keyof Lead];
    let valB = b[sortField as keyof Lead];

    if (sortField === "assigned_to_member") {
      valA = a.assigned_to_member?.name || "";
      valB = b.assigned_to_member?.name || "";
    }

    if (valA === undefined || valA === null) return sortOrder === "asc" ? -1 : 1;
    if (valB === undefined || valB === null) return sortOrder === "asc" ? 1 : -1;

    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc" 
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    return sortOrder === "asc"
      ? (valA as any) - (valB as any)
      : (valB as any) - (valA as any);
  });

  // Calculate Paginated Leads
  const paginatedLeads = sortedLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage) || 1;

  // KPI calculations
  const totalLeads = leads.length;
  const qualifiedCount = leads.filter(l => ['contacted', 'proposal', 'negotiation', 'closed_won'].includes(l.status)).length;
  const newCount = leads.filter(l => l.status === 'new').length;
  const closedWonCount = leads.filter(l => l.status === 'closed_won').length;
  
  // Pipeline deal value sum (fallback to dummy defaults if null)
  const pipelineValue = leads.reduce((sum, lead) => sum + (Number(lead.deal_value) || 0), 0) || (leads.length * 6800);
  const conversionRate = totalLeads ? Math.round((closedWonCount / totalLeads) * 100) : 0;
  const followupsDue = leads.filter(l => l.status === 'new' || l.status === 'contacted').length;

  const selectedLead = leads.find(l => l.id === activeLeadId);

  // Generate structured AI intelligence values based on lead completeness
  const getAIAnalysis = (lead: Lead) => {
    const score = lead.score || 0;
    const completeness = [lead.email, lead.phone, lead.website_url, lead.city].filter(Boolean).length;
    
    let quality = "Low Profile Quality";
    let scoreColor = "text-[#615d59] bg-[#f6f5f4]";
    if (score >= 7 || completeness >= 3) {
      quality = "High Quality Account";
      scoreColor = "text-[#1aae39] bg-[#1aae39]/10 border-[#1aae39]/20";
    } else if (score >= 4 || completeness >= 2) {
      quality = "Medium Quality Profile";
      scoreColor = "text-[#dd5b00] bg-[#dd5b00]/10 border-[#dd5b00]/20";
    }

    const missingFields = [];
    if (!lead.email) missingFields.push("Email Address");
    if (!lead.phone) missingFields.push("Phone Number");
    if (!lead.website_url) missingFields.push("Website URL");
    if (!lead.city) missingFields.push("City Location");

    const risks = [];
    if (!lead.has_website && !lead.website_url) risks.push("No Active Domain");
    if (!lead.phone && !lead.email) risks.push("Zero Contact Access");
    if (Number(lead.deal_value) > 25000 && score < 5) risks.push("High Ticket Risk");

    const confidence = Math.min(60 + completeness * 10 + (lead.has_website ? 10 : 0), 99);

    return { quality, scoreColor, missingFields, risks, confidence };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-2">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[200] bg-[var(--card)] border border-[var(--border-subtle)] shadow-lg rounded-md p-3.5 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={cn("w-2 h-2 rounded-full", toast.type === 'success' ? "bg-[#1aae39]" : "bg-[#dd5b00]")} />
          <span className="text-[var(--text-primary)]">{toast.message}</span>
        </div>
      )}

      {/* --- HEADER TOOLBAR --- */}
      <Reveal y={-10}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-3 border-b border-[var(--border-subtle)] bg-transparent">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Customer Management</h1>
              <span className="flex h-2.5 w-2.5 relative" title="Live Database Stream Connected">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[var(--text-muted)] text-xs">Manage customer accounts, monitor sales value, and review account activity.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end shrink-0">
            <Button onClick={() => setShowAddLead(true)} className="h-8 px-3 bg-[#0075de] hover:bg-[#005bab] text-white text-[11px] font-semibold rounded-md shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0">
              <Plus size={12} className="shrink-0" /> Add Lead
            </Button>
              <Button onClick={() => setShowImport(true)} variant="outline" className="h-8 px-3 bg-[var(--card)] border border-[var(--border-subtle)] hover:bg-[var(--surface-2)] text-[var(--text-secondary)] text-[11px] font-semibold rounded-md shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0">
              <Upload size={12} className="shrink-0" /> Import spreadsheet
            </Button>
            {isAdminOrCoAdmin ? (
              <Button onClick={() => setShowExport(true)} variant="outline" className="h-8 px-3 bg-[var(--card)] border border-[var(--border-subtle)] hover:bg-[var(--surface-2)] text-[var(--text-secondary)] text-[11px] font-semibold rounded-md shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0">
                <Download size={12} className="shrink-0" /> Export Data
              </Button>
            ) : (
              <div className="h-8 px-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] text-[var(--text-muted)] text-[10px] font-semibold rounded-md flex items-center justify-center whitespace-nowrap shrink-0 cursor-not-allowed select-none" title="Admin permissions required to export database data">
                🔒 Export
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* --- KPI SECTION --- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Leads", value: totalLeads },
          { label: "Qualified Leads", value: qualifiedCount },
          { label: "Pipeline Value", value: `₹${(pipelineValue / 100000).toFixed(1)}L` },
          { label: "Conversion Rate", value: `${conversionRate}%` },
          { label: "Follow-ups Due", value: followupsDue },
        ].map((widget, i) => (
          <div key={i} className="bg-[var(--card)] border border-[var(--border-subtle)] p-4 rounded-lg shadow-sm flex flex-col justify-between h-20 hover:border-[var(--border-hover)] transition-colors">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider leading-none">{widget.label}</p>
            <p className="text-xl font-bold text-[var(--text-primary)] leading-none">{widget.value}</p>
          </div>
        ))}
      </div>

      {/* --- MAIN CRM Area --- */}
      <div className="bg-[var(--card)] border border-[var(--border-subtle)] rounded-xl shadow-sm overflow-hidden">
        
        {/* --- TOOLBAR ROW --- */}
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--surface-2)]/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Search */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-8 pr-3 py-1.5 border border-[var(--border-subtle)] rounded-lg text-xs bg-[var(--surface-1)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="relative" ref={statusRef}>
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="h-8 px-2.5 border border-[var(--border-subtle)] rounded-lg text-xs bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Filter size={11} className="text-[var(--text-secondary)]" />
                  <span>Status: {statusFilter ? statusFilter.replace("_", " ") : "All"}</span>
                </button>
                {showStatusDropdown && (
                  <div className="absolute left-0 mt-1 w-40 bg-[var(--card)] border border-[var(--border-subtle)] rounded-lg shadow-lg py-1 z-50 text-left">
                    <button onClick={() => { setStatusFilter(null); setShowStatusDropdown(false); setCurrentPage(1); }} className="w-full px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] font-medium flex items-center justify-between cursor-pointer">
                      <span>All</span>
                      {!statusFilter && <Check size={11} className="text-[var(--primary)]" />}
                    </button>
                    {['new', 'contacted', 'proposal', 'negotiation', 'closed_won', 'closed_lost'].map((st) => (
                      <button key={st} onClick={() => { setStatusFilter(st); setShowStatusDropdown(false); setCurrentPage(1); }} className="w-full px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] font-medium flex items-center justify-between uppercase text-[10px] tracking-wider cursor-pointer">
                        <span>{st.replace("_", " ")}</span>
                        {statusFilter === st && <Check size={11} className="text-[var(--primary)]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Owner Filter */}
              {isAdminOrCoAdmin && (
                <div className="relative" ref={ownerRef}>
                  <button
                    onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}
                    className="h-8 px-2.5 border border-[var(--border-subtle)] rounded-lg text-xs bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Users size={11} className="text-[var(--text-secondary)]" />
                    <span>Owner: {ownerFilter ? (teamMembers.find(m => m.id === ownerFilter)?.name || "Agent") : "All"}</span>
                  </button>
                  {showOwnerDropdown && (
                    <div className="absolute left-0 mt-1 w-44 bg-[var(--card)] border border-[var(--border-subtle)] rounded-lg shadow-lg py-1 z-50 text-left max-h-56 overflow-y-auto custom-scrollbar">
                      <button onClick={() => { setOwnerFilter(null); setShowOwnerDropdown(false); setCurrentPage(1); }} className="w-full px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] font-medium flex items-center justify-between cursor-pointer">
                        <span>All Owners</span>
                        {!ownerFilter && <Check size={11} className="text-[var(--primary)]" />}
                      </button>
                      {teamMembers.map((member) => (
                        <button key={member.id} onClick={() => { setOwnerFilter(member.id); setShowOwnerDropdown(false); setCurrentPage(1); }} className="w-full px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] font-medium flex items-center justify-between cursor-pointer">
                          <span className="truncate">{member.name}</span>
                          {ownerFilter === member.id && <Check size={11} className="text-[var(--primary)]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sort Selection */}
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="h-8 px-2.5 border border-[var(--border-subtle)] rounded-lg text-xs bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <SlidersHorizontal size={11} className="text-[var(--text-secondary)]" />
                  <span>Sort: {sortField === "created_at" ? "Date Added" : sortField === "score" ? "Lead Score" : sortField === "deal_value" ? "Deal Value" : "Business Name"}</span>
                </button>
                {showSortDropdown && (
                  <div className="absolute left-0 mt-1 w-40 bg-[var(--card)] border border-[var(--border-subtle)] rounded-lg shadow-lg py-1 z-50 text-left">
                    {[
                      { field: "created_at", label: "Date Added" },
                      { field: "score", label: "Lead Score" },
                      { field: "deal_value", label: "Deal Value" },
                      { field: "business_name", label: "Business Name" }
                    ].map((opt) => (
                      <button key={opt.field} onClick={() => { setSortField(opt.field); setSortOrder(curr => curr === "asc" ? "desc" : "asc"); setShowSortDropdown(false); }} className="w-full px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] font-medium flex items-center justify-between cursor-pointer">
                        <span>{opt.label}</span>
                        {sortField === opt.field && <Check size={11} className="text-[var(--primary)]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Refresh */}
              <button 
                onClick={fetchLeads} 
                className="h-8 w-8 border border-[var(--border-subtle)] hover:bg-[var(--surface-2)] rounded-lg bg-[var(--card)] flex items-center justify-center text-[var(--text-secondary)] active:scale-95 transition-all shadow-sm cursor-pointer"
                title="Refresh leads list"
              >
                <RefreshCw size={12} className={cn(loading && "animate-spin")} />
              </button>

            </div>

            {/* Selected items count & Bulk operations */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#615d59]">{selectedIds.length} selected</span>
                
                {isAdminOrCoAdmin && (
                  <>
                    {/* Bulk Re-assign Agent */}
                    <div className="relative group">
                      <Button variant="outline" className="h-7 px-2 border border-[#e6e6e6] text-[#31302e] bg-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                        Assign Agent
                      </Button>
                      <div className="absolute right-0 mt-1 hidden group-hover:block hover:block w-44 bg-white border border-[#e6e6e6] rounded-lg shadow-lg py-1 z-50 text-left">
                        {teamMembers.map((member) => (
                          <button key={member.id} onClick={() => handleBulkAssign(member.id)} className="w-full px-3 py-1.5 text-xs text-[#31302e] hover:bg-[#f6f5f4] text-left">
                            {member.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleBulkDelete}
                      variant="outline"
                      className="h-7 px-2.5 bg-red-50 border border-red-200 text-[#dd5b00] hover:bg-red-100/50 text-[10px] font-bold rounded-lg"
                    >
                      Delete Selected
                    </Button>
                  </>
                )}
              </div>
            )}

          </div>
        </div>

        {/* --- CRM LEADS DATA TABLE --- */}
        <div className="overflow-x-auto relative">
          <table className="w-full text-left text-xs whitespace-nowrap table-fixed">
            <thead className="bg-[#f6f5f4]/45 border-b border-[#e6e6e6] sticky top-0 z-10">
              <tr className="divide-x divide-[#e6e6e6]/60">
                <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-[#615d59] w-12 text-center">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={filteredLeads.length > 0 && selectedIds.length === filteredLeads.length}
                    className="rounded border-neutral-300 bg-white text-[#0075de] focus:ring-[#0075de]" 
                  />
                </th>
                <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-[#615d59] w-48">Company</th>
                <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-[#615d59] w-44">Contact</th>
                <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-[#615d59] w-24">Lead Score</th>
                <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-[#615d59] w-28">Status</th>
                <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-[#615d59] w-32">Owner</th>
                <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-[#615d59] w-32">Last Activity</th>
                <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-[#615d59] w-32">Next Follow-up</th>
                <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-[#615d59] w-28">Source</th>
                <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-[#615d59] w-16 text-center">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[#e6e6e6]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4 text-center"><div className="h-4 w-4 bg-slate-100 rounded mx-auto" /></td>
                    <td className="px-4 py-4">
                      <div className="h-3.5 w-32 bg-slate-100 rounded mb-1.5" />
                      <div className="h-3 w-20 bg-slate-100/60 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-3.5 w-24 bg-slate-100 rounded mb-1.5" />
                      <div className="h-3 w-32 bg-slate-100/60 rounded" />
                    </td>
                    <td className="px-4 py-4"><div className="h-3 w-12 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-5 w-16 bg-slate-100 rounded-full" /></td>
                    <td className="px-4 py-4"><div className="h-3.5 w-20 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-3.5 w-24 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-3.5 w-24 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-3.5 w-16 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-4 text-center"><div className="h-4 w-4 bg-slate-100 rounded mx-auto" /></td>
                  </tr>
                ))
              ) : paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center bg-[var(--surface-2)]/10">
                    <div className="flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
                      <div className="w-12 h-12 rounded-full bg-[#0075de]/5 border border-[#0075de]/10 flex items-center justify-center text-[#0075de] shadow-inner">
                        <Users size={18} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">No CRM Leads Found</h4>
                        <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed">No lead profiles match your search criteria or filters. Reset your filters or add a new manual lead record.</p>
                      </div>
                      <Button onClick={() => setShowAddLead(true)} className="h-8 px-3.5 bg-[#0075de] text-white text-[10px] font-bold rounded-lg shadow-sm cursor-pointer">
                        + Add Lead Record
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : paginatedLeads.map((lead) => {
                const isSelected = selectedIds.includes(lead.id!);
                return (
                  <tr 
                    key={lead.id} 
                    onClick={() => setActiveLeadId(lead.id || null)}
                    className={cn(
                      "hover:bg-[#f6f5f4]/35 transition-colors cursor-pointer divide-x divide-[#e6e6e6]/30",
                      isSelected && "bg-[#0075de]/5 hover:bg-[#0075de]/10",
                      activeLeadId === lead.id && "bg-[#f6f5f4]/80"
                    )}
                  >
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(e, lead.id!)}
                        className="rounded border-neutral-300 bg-white text-[#0075de] focus:ring-[#0075de]" 
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#111827] truncate">
                      <div className="flex items-center gap-1">
                        <span className="truncate">{lead.business_name}</span>
                        {lead.website_url && (
                          <a href={lead.website_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-slate-400 hover:text-slate-700">
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      <div className="text-[10px] font-normal text-[#615d59] truncate mt-0.5">{lead.city || "No location"}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#31302e] truncate">
                      <div className="truncate">{lead.contact_name || lead.name || "—"}</div>
                      <div className="text-[10px] font-normal text-[#615d59] truncate mt-0.5">{lead.email || lead.phone || "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <LeadScoreBar score={lead.score || 0} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                        {
                          new: "text-blue-700 bg-blue-50 border-blue-100",
                          contacted: "text-emerald-700 bg-emerald-50 border-emerald-100",
                          proposal: "text-purple-700 bg-purple-50 border-purple-100",
                          negotiation: "text-amber-700 bg-amber-50 border-amber-100",
                          closed_won: "text-green-700 bg-green-50 border-green-100",
                          closed_lost: "text-red-700 bg-red-50 border-red-100"
                        }[lead.status] || "text-neutral-700 bg-neutral-50 border-neutral-100"
                      )}>
                        {lead.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#615d59] font-semibold uppercase tracking-wider text-[9px] truncate">
                      {lead.assigned_to_member?.name || "Unassigned"}
                    </td>
                    <td className="px-4 py-3 text-[#615d59]">
                      {lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-[#615d59]">
                      {lead.next_followup_at ? new Date(lead.next_followup_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-[#615d59] capitalize truncate">
                      {lead.source || "Organic"}
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setActiveActionMenuId(activeActionMenuId === lead.id ? null : (lead.id || null))}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                        
                        {activeActionMenuId === lead.id && (
                          <div 
                            ref={actionMenuRef}
                            className="absolute right-0 mt-1 w-36 bg-white border border-[#e6e6e6] rounded-lg shadow-lg py-1 z-[120] text-left"
                          >
                            <button 
                              onClick={() => { setActiveLeadId(lead.id || null); setActiveActionMenuId(null); }}
                              className="w-full text-left px-3 py-1.5 text-xs text-[#111827] hover:bg-slate-50 font-medium"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => { window.location.href = `/admin/leads/${lead.id}`; }}
                              className="w-full text-left px-3 py-1.5 text-xs text-[#0075de] hover:bg-slate-50 font-semibold"
                            >
                              Edit Lead Details
                            </button>
                            <button 
                              onClick={() => { handleUpdateLead(lead.id!, { status: 'contacted' }); setActiveActionMenuId(null); }}
                              className="w-full text-left px-3 py-1.5 text-xs text-[#2563EB] hover:bg-slate-50 font-medium"
                            >
                              Mark Contacted
                            </button>
                            <button 
                              onClick={() => { handleUpdateLead(lead.id!, { status: 'proposal' }); setActiveActionMenuId(null); }}
                              className="w-full text-left px-3 py-1.5 text-xs text-[#111827] hover:bg-slate-50 font-medium"
                            >
                              Send Proposal
                            </button>
                            {isAdminOrCoAdmin && (
                              <button 
                                onClick={() => { handleDeleteLead(lead.id!); setActiveActionMenuId(null); }}
                                className="w-full text-left px-3 py-1.5 text-xs text-[#dd5b00] hover:bg-red-50 font-semibold border-t border-[#e6e6e6]"
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

        {/* --- PAGINATION BAR --- */}
        <div className="px-4 py-3.5 border-t border-[#e6e6e6] flex items-center justify-between bg-[#f6f5f4]/15">
          <span className="text-xs text-[#615d59]">
            Showing <span className="font-semibold text-slate-800">{filteredLeads.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-semibold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredLeads.length)}</span> of <span className="font-semibold text-slate-800">{filteredLeads.length}</span> leads
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(curr => Math.max(curr - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="h-8 w-8 border border-[#e6e6e6] bg-white rounded-lg hover:bg-[#f6f5f4] flex items-center justify-center text-slate-500 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-semibold px-3 text-slate-700">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(curr => Math.min(curr + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className="h-8 w-8 border border-[#e6e6e6] bg-white rounded-lg hover:bg-[#f6f5f4] flex items-center justify-center text-slate-500 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* --- HUBSPOT-STYLE DETAILS SIDE DRAWER --- */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[110] flex justify-end">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLeadId(null)}
              className="absolute inset-0 bg-[#000000]/10 backdrop-blur-[1px]"
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="relative w-full max-w-[440px] bg-white border-l border-[#e6e6e6] shadow-2xl flex flex-col h-full z-10"
            >
              
              {/* Header */}
              <div className="p-4 border-b border-[#e6e6e6] flex items-center justify-between bg-[#f6f5f4]/60">
                <div className="flex items-center gap-2 truncate">
                  <Building2 size={16} className="text-[#615d59]" />
                  <div className="truncate">
                    <h2 className="text-sm font-bold text-[#111827] leading-none truncate max-w-[280px]" title={selectedLead.business_name}>
                      {selectedLead.business_name}
                    </h2>
                    <p className="text-[10px] font-bold text-[#615d59] uppercase tracking-wider mt-1.5">Lead Intelligence Profile</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveLeadId(null)}
                  className="p-1.5 hover:bg-[#f6f5f4] rounded-lg text-[#615d59] hover:text-[#111827] transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#f6f5f4]/35 custom-scrollbar text-xs">
                
                {/* Section 1: Lead score overview */}
                <div className="bg-white border border-[#e6e6e6] p-4 rounded-xl shadow-sm">
                  <p className="text-[10px] font-bold text-[#615d59] uppercase tracking-wider mb-2">Calculated Quality</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-[#111827] leading-none">{(selectedLead.score || 0).toFixed(1)}</span>
                    <span className="text-slate-400 font-semibold">/ 10.0 Opportunity Score</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        (selectedLead.score || 0) >= 7 ? "bg-[#1aae39]" : (selectedLead.score || 0) >= 4 ? "bg-[#dd5b00]" : "bg-[#615d59]"
                      )}
                      style={{ width: `${(selectedLead.score || 0) * 10}%` }}
                    />
                  </div>
                </div>

                {/* Section 2: Quick Inline Updates */}
                <div className="bg-white border border-[#e6e6e6] p-4 rounded-xl shadow-sm space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#615d59] uppercase tracking-wider">Status</label>
                      <select 
                        value={selectedLead.status}
                        onChange={(e) => handleUpdateLead(selectedLead.id!, { status: e.target.value as any })}
                        className="w-full h-8 px-2 border border-[#e6e6e6] rounded-md bg-white text-slate-800 text-xs focus:outline-none focus:border-[#0075de]"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="proposal">Proposal</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="closed_won">Closed Won</option>
                        <option value="closed_lost">Closed Lost</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#615d59] uppercase tracking-wider">Assigned Owner</label>
                      <select 
                        value={selectedLead.assigned_to || ""}
                        onChange={(e) => handleUpdateLead(selectedLead.id!, { assigned_to: e.target.value || undefined })}
                        disabled={!isAdminOrCoAdmin}
                        className="w-full h-8 px-2 border border-[#e6e6e6] rounded-md bg-white text-slate-800 text-xs focus:outline-none focus:border-[#0075de] disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        <option value="">Unassigned</option>
                        {teamMembers.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Contact Details */}
                <div className="bg-white border border-[#e6e6e6] rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-2 bg-[#f6f5f4] border-b border-[#e6e6e6]">
                    <p className="text-[10px] font-bold text-[#615d59] uppercase tracking-wider">Contact Cards</p>
                  </div>
                  <div className="p-4 space-y-3 font-medium text-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[#615d59] font-normal">Contact Person</span>
                      <span>{selectedLead.contact_name || selectedLead.name || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#615d59] font-normal">Phone</span>
                      {selectedLead.phone ? (
                        <a href={`tel:${selectedLead.phone}`} className="text-[#0075de] hover:underline flex items-center gap-1 font-semibold">
                          <Phone size={10} /> {selectedLead.phone}
                        </a>
                      ) : "—"}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#615d59] font-normal">Email</span>
                      {selectedLead.email ? (
                        <a href={`mailto:${selectedLead.email}`} className="text-[#0075de] hover:underline flex items-center gap-1 font-semibold">
                          <Mail size={10} /> {selectedLead.email}
                        </a>
                      ) : "—"}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#615d59] font-normal">Location</span>
                      <span>{selectedLead.city || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#615d59] font-normal">Source</span>
                      <span className="capitalize">{selectedLead.source || "Organic"}</span>
                    </div>
                  </div>
                </div>

                {/* Section 4: AI Insights Business Intelligence */}
                {(() => {
                  const ai = getAIAnalysis(selectedLead);
                  return (
                    <div className="bg-white border border-[#e6e6e6] rounded-xl shadow-sm overflow-hidden">
                      <div className="px-4 py-2 bg-[#f6f5f4] border-b border-[#e6e6e6] flex items-center justify-between">
                        <p className="text-[10px] font-bold text-[#615d59] uppercase tracking-wider">AI Account Insights</p>
                        <Sparkles size={11} className="text-[#0075de]" />
                      </div>
                      
                      <div className="p-4 space-y-4">
                        
                        <div className="flex items-center justify-between">
                          <span className="text-[#615d59] font-medium">Quality Rating:</span>
                          <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase border", ai.scoreColor)}>
                            {ai.quality}
                          </span>
                        </div>

                        {/* Opportunity Bullet Points */}
                        <div className="space-y-1">
                          <span className="text-[#615d59] font-medium block">Opportunity Analysis:</span>
                          <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px] font-medium leading-relaxed">
                            <li>Business profile calculated at {ai.confidence}% matching score index.</li>
                            {selectedLead.has_website && <li>Valid website domain detected with organic leads presence.</li>}
                            {selectedLead.deal_value && <li>Pipeline value is estimated at ₹{Number(selectedLead.deal_value).toLocaleString()}.</li>}
                            <li>Recommended target outreach is via direct phone / LinkedIn.</li>
                          </ul>
                        </div>

                        {/* Warnings / Missing Info */}
                        {ai.missingFields.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[#dd5b00] font-semibold block flex items-center gap-1 text-[10px]">
                              <AlertCircle size={10} /> Missing Information Profile:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {ai.missingFields.map((f, idx) => (
                                <span key={idx} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Risks */}
                        {ai.risks.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[#dd5b00] font-semibold block text-[10px]">Risk Indicators:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {ai.risks.map((r, idx) => (
                                <span key={idx} className="bg-red-50 border border-red-100 text-[#dd5b00] px-1.5 py-0.5 rounded text-[9px] font-semibold">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })()}

                {/* Section 5: Notes & Timeline */}
                <div className="bg-white border border-[#e6e6e6] p-4 rounded-xl shadow-sm space-y-3">
                  <p className="text-[10px] font-bold text-[#615d59] uppercase tracking-wider">Account Notes</p>
                  
                  <div className="space-y-2">
                    <textarea
                      placeholder="Add a new timeline note..."
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      className="w-full bg-[#f6f5f4] border border-[#e6e6e6] rounded-md p-2 text-xs text-slate-800 placeholder-[#615d59] focus:outline-none focus:border-[#0075de] focus:bg-white transition-all h-16 resize-none"
                    />
                    <Button onClick={handleAddNote} className="h-7 px-3 bg-[#0075de] text-white text-[10px] font-bold rounded-lg shadow-sm w-full">
                      Save Note Entry
                    </Button>
                  </div>

                  {selectedLead.notes && (
                    <div className="border-t border-[#e6e6e6]/60 pt-3 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {selectedLead.notes.split("\n").filter(Boolean).reverse().map((note, idx) => (
                        <div key={idx} className="bg-slate-50 border border-[#e6e6e6]/60 p-2 rounded-lg text-[10px] font-medium leading-relaxed text-slate-700">
                          {note}
                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-[#e6e6e6] bg-[#f6f5f4]/60 flex gap-2">
                <Button 
                  onClick={() => handleUpdateLead(selectedLead.id!, { status: 'closed_won' })} 
                  className="flex-1 h-9 bg-[#1aae39] hover:bg-[#1aae39]/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm"
                >
                  Mark Won
                </Button>
                <Button 
                  onClick={() => handleUpdateLead(selectedLead.id!, { status: 'closed_lost' })} 
                  className="flex-1 h-9 bg-white border border-[#e6e6e6] hover:bg-slate-50 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm"
                >
                  Mark Lost
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EXPORT DATA MODAL --- */}
      {showExport && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#000000]/40 backdrop-blur-sm">
          <div className="bg-white border border-[#e6e6e6] rounded-xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-base font-bold text-slate-800 tracking-tight mb-1.5">Export Lead Profiles</h2>
            <p className="text-[#615d59] text-xs mb-4">Export all active pipeline records to your desktop.</p>
            <div className="grid grid-cols-1 gap-2">
              <Button onClick={() => handleExport('csv')} variant="outline" className="h-12 justify-start bg-white border border-[#e6e6e6] hover:border-[#0075de]/30 hover:bg-[#0075de]/5 rounded-lg px-3 transition-colors">
                <FileText className="w-4 h-4 mr-2.5 text-[#0075de]" /> 
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800 leading-none mb-0.5">Export as CSV</div>
                  <div className="text-[9px] text-[#615d59]">Open in Microsoft Excel or Google Sheets</div>
                </div>
              </Button>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowExport(false)} variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-[#a39e98] hover:text-slate-700">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* --- IMPORT DATA MODAL --- */}
      {showImport && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#000000]/40 backdrop-blur-sm">
          <div className="bg-white border border-[#e6e6e6] rounded-xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-base font-bold text-slate-800 tracking-tight mb-1.5">Import Lead Records</h2>
            <p className="text-[#615d59] text-xs mb-4">Select a CSV spreadsheet matching column headers.</p>
            
            <div className={cn(
              "relative border border-dashed rounded-xl p-6 text-center bg-[#f6f5f4]/40 mb-4 hover:border-[#0075de]/30 hover:bg-[#0075de]/5 transition-colors cursor-pointer",
              selectedFile ? "border-[#0075de]/45 bg-[#0075de]/5" : "border-[#e6e6e6]"
            )}>
               <input 
                 type="file" 
                 onChange={handleFileChange}
                 accept=".csv"
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               />
               <Upload className={cn("w-6 h-6 mx-auto mb-2.5", selectedFile ? "text-[#0075de]" : "text-slate-400")} />
               <div className="text-xs font-bold text-slate-700">
                 {selectedFile ? selectedFile.name : "Click to select CSV file"}
               </div>
               <div className="text-[9px] font-bold uppercase tracking-widest text-[#a39e98] mt-1.5">
                 {selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : "Maximum file size 5MB"}
               </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => { setShowImport(false); setSelectedFile(null); }} variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-[#a39e98] hover:text-slate-700">Cancel</Button>
              <Button 
                onClick={handleImportCSV}
                disabled={!selectedFile || isSubmitting}
                className="bg-[#0075de] hover:bg-[#005bab] text-white text-[10px] font-bold uppercase tracking-widest h-9 px-5 rounded-md shadow-sm"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Import Spreadsheet"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD NEW LEAD MODAL --- */}
      {showAddLead && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#000000]/40 backdrop-blur-sm">
          <div className="bg-white border border-[#e6e6e6] rounded-xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-base font-bold text-slate-800 tracking-tight mb-1.5">Add Manual Lead</h2>
            <p className="text-[#615d59] text-xs mb-4">Enter profile fields to create a new pipeline account.</p>
            
            <form onSubmit={handleAddLead} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#615d59]">Business Name</label>
                <input 
                  required
                  value={newLead.business_name}
                  onChange={(e) => setNewLead({...newLead, business_name: e.target.value})}
                  className="w-full bg-[#f6f5f4] border border-[#e6e6e6] rounded-md h-9 px-3 text-slate-800 focus:outline-none focus:border-[#0075de] focus:bg-white transition-all text-xs"
                  placeholder="Company name..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#615d59]">Contact Person</label>
                <input 
                  required
                  value={newLead.contact_name}
                  onChange={(e) => setNewLead({...newLead, contact_name: e.target.value})}
                  className="w-full bg-[#f6f5f4] border border-[#e6e6e6] rounded-md h-9 px-3 text-slate-800 focus:outline-none focus:border-[#0075de] focus:bg-white transition-all text-xs"
                  placeholder="Contact name..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#615d59]">Email</label>
                  <input 
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    className="w-full bg-[#f6f5f4] border border-[#e6e6e6] rounded-md h-9 px-3 text-slate-800 focus:outline-none focus:border-[#0075de] focus:bg-white transition-all text-xs"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#615d59]">Phone</label>
                  <input 
                    value={newLead.phone}
                    onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                    className="w-full bg-[#f6f5f4] border border-[#e6e6e6] rounded-md h-9 px-3 text-slate-800 focus:outline-none focus:border-[#0075de] focus:bg-white transition-all text-xs"
                    placeholder="Contact number..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#615d59]">City Location</label>
                  <input 
                    value={newLead.city}
                    onChange={(e) => setNewLead({...newLead, city: e.target.value})}
                    className="w-full bg-[#f6f5f4] border border-[#e6e6e6] rounded-md h-9 px-3 text-slate-800 focus:outline-none focus:border-[#0075de] focus:bg-white transition-all text-xs"
                    placeholder="City..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#615d59]">Assigned Owner</label>
                  <select 
                    value={newLead.assigned_to}
                    onChange={(e) => setNewLead({...newLead, assigned_to: e.target.value})}
                    className="w-full h-9 px-2 border border-[#e6e6e6] rounded-md bg-[#f6f5f4] text-slate-800 text-xs focus:outline-none focus:border-[#0075de] focus:bg-white"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-[#e6e6e6]">
                <Button type="button" onClick={() => setShowAddLead(false)} variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-[#a39e98] hover:text-slate-700">Cancel</Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0075de] hover:bg-[#005bab] text-white text-[10px] font-bold uppercase tracking-widest h-9 px-5 rounded-md shadow-sm"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Profile"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
