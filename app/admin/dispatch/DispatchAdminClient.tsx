"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Send,
  Users,
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  ExternalLink,
  ShieldCheck,
  Search,
  Check,
  ArrowRight,
  Monitor,
  Smartphone,
  Copy,
  Trash2,
  UserPlus,
  X,
  ChevronDown,
  SlidersHorizontal,
  Edit3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Subscriber {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface Edition {
  slug: string;
  title: string;
  deck: string;
  cover_image: string;
  excerpt: string;
  category: string;
  date: string;
}

interface Props {
  initialSubscribers: Subscriber[];
  totalSubscribers: number;
  editions: Edition[];
}

export default function DispatchAdminClient({
  initialSubscribers,
  totalSubscribers,
  editions,
}: Props) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [selectedEdition, setSelectedEdition] = useState<Edition>(editions[0]);
  const [customSubject, setCustomSubject] = useState("");
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  
  // Viewport Device Preview Mode
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Flyout / Sheet states
  const [showEditionDropdown, setShowEditionDropdown] = useState(false);
  const [showSubscribersSheet, setShowSubscribersSheet] = useState(false);
  const [showBroadcastSheet, setShowBroadcastSheet] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  // Form & Dispatch inputs
  const [testEmail, setTestEmail] = useState("");
  const [dispatching, setDispatching] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Subscriber Directory search & add
  const [searchQuery, setSearchQuery] = useState("");
  const [newSubEmail, setNewSubEmail] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [addingSub, setAddingSub] = useState(false);
  const [showAddSubForm, setShowAddSubForm] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Active Subject Line
  const effectiveSubject = customSubject.trim() || selectedEdition.title;

  // Filtered Subscribers in Sheet
  const filteredSubscribers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return subscribers;
    return subscribers.filter(
      (s) =>
        s.email.toLowerCase().includes(q) ||
        (s.name && s.name.toLowerCase().includes(q))
    );
  }, [subscribers, searchQuery]);

  // Handler: Test Email
  const handleTestDispatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testEmail.trim()) {
      setDispatchStatus({
        type: "error",
        message: "Please enter a valid recipient email address.",
      });
      return;
    }

    setDispatching(true);
    setDispatchStatus({ type: null, message: "" });

    try {
      const res = await fetch("/api/newsletter/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: selectedEdition.slug,
          title: effectiveSubject,
          deck: selectedEdition.deck,
          cover_image: selectedEdition.cover_image,
          excerpt: selectedEdition.excerpt,
          test_email: testEmail.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Delivery failed.");

      setDispatchStatus({
        type: "success",
        message: `Test email dispatched to ${testEmail.trim()}. Check your inbox.`,
      });
      setShowTestModal(false);
    } catch (err: any) {
      setDispatchStatus({
        type: "error",
        message: err.message || "Failed to dispatch test email.",
      });
    } finally {
      setDispatching(false);
    }
  };

  // Handler: Full Broadcast
  const handleFullBroadcast = async () => {
    if (subscribers.length === 0) {
      setDispatchStatus({
        type: "error",
        message: "No subscribers found in roster.",
      });
      return;
    }

    setDispatching(true);
    setDispatchStatus({ type: null, message: "" });

    try {
      const res = await fetch("/api/newsletter/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: selectedEdition.slug,
          title: effectiveSubject,
          deck: selectedEdition.deck,
          cover_image: selectedEdition.cover_image,
          excerpt: selectedEdition.excerpt,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Broadcast failed.");

      setDispatchStatus({
        type: "success",
        message: `Broadcast delivered to ${data.sent_count} subscribers.`,
      });
      setShowBroadcastSheet(false);
    } catch (err: any) {
      setDispatchStatus({
        type: "error",
        message: err.message || "Broadcast delivery failed.",
      });
    } finally {
      setDispatching(false);
    }
  };

  // Add Subscriber
  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubEmail.trim()) return;
    setAddingSub(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newSubEmail.trim().toLowerCase(),
          name: newSubName.trim() || newSubEmail.split("@")[0],
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to save subscriber.");

      setSubscribers((prev) => [
        {
          id: String(Date.now()),
          email: newSubEmail.trim().toLowerCase(),
          name: newSubName.trim() || newSubEmail.split("@")[0],
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setNewSubEmail("");
      setNewSubName("");
      setShowAddSubForm(false);
      setDispatchStatus({
        type: "success",
        message: `Subscriber added: ${newSubEmail.trim()}`,
      });
    } catch (err: any) {
      setDispatchStatus({ type: "error", message: err.message });
    } finally {
      setAddingSub(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://growxlabs.tech/blog/${selectedEdition.slug}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto pb-12">
      
      {/* ─── 1. TOP STUDIO COMMAND BAR ─── */}
      <div className="bg-[var(--card)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3 sticky top-2 z-30 backdrop-blur-md">
        
        {/* Left: Edition Dropdown Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEditionDropdown(!showEditionDropdown)}
            className="h-9 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-left flex items-center gap-2.5 transition-all text-xs cursor-pointer shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#0075de]" />
            <span className="font-bold text-[var(--text-primary)] max-w-[280px] sm:max-w-[360px] truncate">
              {selectedEdition.title}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface-2)] px-1.5 py-0.5 rounded uppercase">
              {selectedEdition.category}
            </span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-[var(--text-muted)] transition-transform", showEditionDropdown && "rotate-180")} />
          </button>

          {/* Floating Dropdown Menu */}
          <AnimatePresence>
            {showEditionDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowEditionDropdown(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-1.5 w-[380px] max-w-[90vw] bg-[var(--card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-2 z-50 space-y-1"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Available Editions
                  </div>
                  {editions.map((ed) => {
                    const isSelected = selectedEdition.slug === ed.slug;
                    return (
                      <button
                        key={ed.slug}
                        type="button"
                        onClick={() => {
                          setSelectedEdition(ed);
                          setCustomSubject("");
                          setShowEditionDropdown(false);
                          setDispatchStatus({ type: null, message: "" });
                        }}
                        className={cn(
                          "w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer",
                          isSelected
                            ? "bg-[#0075de]/10 text-[#0075de]"
                            : "hover:bg-[var(--surface-2)] text-[var(--text-secondary)]"
                        )}
                      >
                        <div className="relative w-10 h-8 rounded bg-black shrink-0 overflow-hidden border border-black/10">
                          <Image src={ed.cover_image} alt={ed.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate leading-tight text-[var(--text-primary)]">
                            {ed.title}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5 font-mono">
                            {ed.category} • {ed.date}
                          </p>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#0075de] shrink-0" />}
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Center: Device Viewport Controls */}
        <div className="flex items-center gap-1 bg-[var(--surface-1)] border border-[var(--border-subtle)] p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setPreviewDevice("desktop")}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
              previewDevice === "desktop"
                ? "bg-[var(--card)] text-[var(--text-primary)] shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            )}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice("mobile")}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
              previewDevice === "mobile"
                ? "bg-[var(--card)] text-[var(--text-primary)] shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            )}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Right: Actions (Subscribers Flyout, Test Email, Broadcast) */}
        <div className="flex items-center gap-2">
          {/* Subscribers Sheet Trigger */}
          <button
            type="button"
            onClick={() => setShowSubscribersSheet(true)}
            className="h-9 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--text-secondary)] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-[#0075de]" />
            <span>Subscribers</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[var(--surface-2)] text-[10px] font-mono text-[var(--text-muted)]">
              {subscribers.length}
            </span>
          </button>

          {/* Test Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowTestModal(true)}
            className="h-9 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Test Send</span>
          </button>

          {/* Broadcast Trigger (Opens Slide-out Drawer) */}
          <button
            type="button"
            onClick={() => setShowBroadcastSheet(true)}
            className="h-9 px-3.5 rounded-lg bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Edition</span>
          </button>
        </div>

      </div>

      {/* Notification Banner */}
      <AnimatePresence>
        {dispatchStatus.message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "px-4 py-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 shadow-xs",
              dispatchStatus.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                : "bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-300"
            )}
          >
            <div className="flex items-center gap-2">
              {dispatchStatus.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              )}
              <span>{dispatchStatus.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setDispatchStatus({ type: null, message: "" })}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 2. STUDIO WORKSPACE CANVAS ─── */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 sm:p-8 min-h-[750px] flex flex-col items-center justify-start relative overflow-hidden">
        
        {/* Top Canvas Bar: Subject Line & Meta Details */}
        <div className="w-full max-w-[620px] mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          {/* Editable Subject */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-mono text-[11px] text-[var(--text-muted)] shrink-0">
              Subject:
            </span>
            {isEditingSubject ? (
              <input
                type="text"
                autoFocus
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                onBlur={() => setIsEditingSubject(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingSubject(false)}
                placeholder={selectedEdition.title}
                className="flex-1 px-2.5 py-1 text-xs border border-[#0075de] rounded bg-[var(--card)] text-[var(--text-primary)] focus:outline-none"
              />
            ) : (
              <span
                onClick={() => setIsEditingSubject(true)}
                title="Click to edit subject line"
                className="font-semibold text-[var(--text-primary)] truncate hover:text-[#0075de] cursor-pointer flex items-center gap-1 group"
              >
                <span>{effectiveSubject}</span>
                <Edit3 className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[#0075de] opacity-60" />
              </span>
            )}
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono text-[var(--text-muted)]">
            <button
              type="button"
              onClick={handleCopyLink}
              className="hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? "Copied" : "Article URL"}</span>
            </button>
            <Link
              href={`/blog/${selectedEdition.slug}`}
              target="_blank"
              className="hover:text-[#0075de] flex items-center gap-1"
            >
              <span>Live Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Simulated Email Viewport Frame */}
        <div
          className={cn(
            "transition-all duration-300 rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-[#000000]",
            previewDevice === "mobile" ? "w-full max-w-[390px]" : "w-full max-w-[620px]"
          )}
        >
          {/* Simulated Email Client Titlebar */}
          <div className="px-4 py-3 bg-[#0d0d12] border-b border-white/10 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2 font-mono text-[11px] text-neutral-400">
                Mail Client Preview
              </span>
            </div>
            <span className="font-mono text-[10px] text-neutral-500">
              contact@growxlabs.tech
            </span>
          </div>

          {/* Email Headers Panel */}
          <div className="px-5 py-3.5 bg-[#09090d] border-b border-white/10 text-xs font-sans space-y-1.5">
            <div className="flex items-center justify-between text-neutral-400">
              <div>
                <span className="font-mono text-[11px] text-neutral-500 mr-2">From:</span>
                <strong className="text-white">GrowxLabs Dispatch</strong>
                <span className="font-mono text-[11px] text-neutral-400 ml-1.5">&lt;contact@growxlabs.tech&gt;</span>
              </div>
              <span className="font-mono text-[10px] text-neutral-500">Today</span>
            </div>

            <div className="text-neutral-400">
              <span className="font-mono text-[11px] text-neutral-500 mr-2">To:</span>
              <span className="text-neutral-300">subscriber@frontier-ai.org</span>
            </div>

            <div className="pt-1 text-white font-semibold text-sm">
              <span className="font-mono text-[11px] text-neutral-500 font-normal mr-2">Subject:</span>
              <span>{effectiveSubject}</span>
            </div>
          </div>

          {/* Newsletter Email Body Frame */}
          <div className="p-4 sm:p-6 bg-[#0b0c10]">
            <div className="w-full rounded-xl border border-[#232733] bg-[#12141a] overflow-hidden shadow-2xl">
              
              {/* Masthead */}
              <div className="px-6 py-4 border-b border-[#1e2330] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs tracking-wider text-[#f8fafc]">GROWX LABS</span>
                  <span className="text-xs text-[#64748b]">/ Technical Dispatch</span>
                </div>
                <span className="text-xs text-[#64748b] font-sans">September 2026</span>
              </div>

              {/* Cover Artwork */}
              <div className="p-6 pb-0">
                <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-[#1e2330] bg-black">
                  <Image
                    src={selectedEdition.cover_image}
                    alt={selectedEdition.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Email Content Body */}
              <div className="p-6 sm:p-8 space-y-3.5 font-sans">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded">
                  Engineering Research
                </span>

                <h2 className="text-xl sm:text-2xl font-bold text-[#f8fafc] tracking-tight leading-snug">
                  {effectiveSubject}
                </h2>

                <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                  {selectedEdition.deck}
                </p>

                <div className="h-px bg-[#1e2330] my-2" />

                <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed pt-1">
                  {selectedEdition.excerpt}
                </p>

                {/* CTA Action */}
                <div className="pt-4 pb-1 text-left">
                  <span className="inline-block px-5 py-2.5 rounded-md bg-[#0075de] text-white font-semibold text-xs shadow-sm hover:bg-[#005bab] transition-colors">
                    Read Technical Breakdown →
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[#1e2330] bg-[#0f1117] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#64748b]">
                <span>GrowxLabs · Systems Engineering & Architecture</span>
                <span className="text-[11px]">growxlabs.tech · Unsubscribe</span>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* ─── 3. FLYOUT SHEET: SUBSCRIBER DIRECTORY ─── */}
      <AnimatePresence>
        {showSubscribersSheet && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubscribersSheet(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-[var(--card)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col h-full"
              >
                {/* Sheet Header */}
                <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-1)]">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#0075de]" />
                    <h2 className="text-sm font-bold text-[var(--text-primary)]">
                      Subscriber Directory
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#0075de]/10 text-[#0075de] text-[10px] font-mono font-bold">
                      {subscribers.length} Verified
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSubscribersSheet(false)}
                    className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Sheet Search & Add Controls */}
                <div className="p-4 border-b border-[var(--border-subtle)] space-y-2.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search email or name..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#0075de]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddSubForm(!showAddSubForm)}
                      className="h-8 px-2.5 rounded-md bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Inline Add Subscriber Form */}
                  {showAddSubForm && (
                    <form onSubmit={handleAddSubscriber} className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] space-y-2">
                      <input
                        type="email"
                        required
                        value={newSubEmail}
                        onChange={(e) => setNewSubEmail(e.target.value)}
                        placeholder="email@domain.com"
                        className="w-full px-2.5 py-1.5 rounded border border-[var(--border-subtle)] bg-[var(--card)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]"
                      />
                      <input
                        type="text"
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        placeholder="Full Name (optional)"
                        className="w-full px-2.5 py-1.5 rounded border border-[var(--border-subtle)] bg-[var(--card)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]"
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddSubForm(false)}
                          className="px-2.5 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={addingSub}
                          className="px-3 py-1 rounded bg-[#0075de] text-white text-xs font-semibold disabled:opacity-50"
                        >
                          {addingSub ? "Adding..." : "Save Subscriber"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Subscriber List */}
                <div className="flex-1 overflow-y-auto p-4 divide-y divide-[var(--border-subtle)] custom-scrollbar">
                  {filteredSubscribers.length === 0 ? (
                    <div className="text-center py-12 text-[var(--text-muted)] text-xs">
                      No subscribers match &ldquo;{searchQuery}&rdquo;
                    </div>
                  ) : (
                    filteredSubscribers.map((sub, idx) => (
                      <div key={sub.id || sub.email} className="py-3 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                        <div className="min-w-0 pr-3">
                          <p className="font-bold text-[var(--text-primary)] truncate">
                            {sub.email}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">
                            {sub.name || "Subscriber"} • {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : "Recent"}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold shrink-0">
                          Active
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Sheet Footer */}
                <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--surface-1)] text-center text-[10px] font-mono text-[var(--text-muted)]">
                  Synced with Resend Audience & Supabase
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 4. FLYOUT SHEET: BROADCAST EXECUTION ─── */}
      <AnimatePresence>
        {showBroadcastSheet && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBroadcastSheet(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-[var(--card)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col h-full"
              >
                {/* Header */}
                <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-1)]">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#0075de]" />
                    <h2 className="text-sm font-bold text-[var(--text-primary)]">
                      Broadcast Newsletter Edition
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBroadcastSheet(false)}
                    className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
                  
                  {/* Selected Briefing Summary */}
                  <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                      Target Edition
                    </span>
                    <div className="flex gap-3">
                      <div className="relative w-16 h-12 rounded overflow-hidden bg-black shrink-0">
                        <Image src={selectedEdition.cover_image} alt={selectedEdition.title} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-[var(--text-primary)] truncate leading-snug">
                          {selectedEdition.title}
                        </h4>
                        <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                          {selectedEdition.category} • {selectedEdition.date}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dispatch Parameters */}
                  <div className="space-y-3 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                      Delivery Specs
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)]">Verified Sender:</span>
                        <strong className="text-[var(--text-primary)] font-mono">contact@growxlabs.tech</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)]">Audience Count:</span>
                        <strong className="text-[#0075de]">{subscribers.length} Subscribers</strong>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[var(--text-muted)]">Unsubscribe Handling:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">1-Click Automated</strong>
                      </div>
                    </div>
                  </div>

                  {/* Subject Line Verification */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)]">
                      Final Subject Line
                    </label>
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder={selectedEdition.title}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]"
                    />
                  </div>

                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--surface-1)] space-y-2">
                  <button
                    type="button"
                    disabled={dispatching || subscribers.length === 0}
                    onClick={handleFullBroadcast}
                    className="w-full py-3 rounded-lg bg-[#0075de] hover:bg-[#005bab] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {dispatching
                        ? "Broadcasting to Audience..."
                        : `Confirm & Broadcast to ${subscribers.length} Subscribers`}
                    </span>
                  </button>
                  <p className="text-[10px] text-[var(--text-muted)] text-center">
                    Immediate broadcast via Resend API.
                  </p>
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 5. POPUP MODAL: TEST EMAIL ─── */}
      <AnimatePresence>
        {showTestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTestModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-[var(--card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-5 space-y-4 z-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#0075de]" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Send Test Delivery
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleTestDispatch} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                    Recipient Address
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="saivarshith8284@gmail.com"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#0075de]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTestModal(false)}
                    className="px-3 py-1.5 rounded text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={dispatching}
                    className="px-4 py-1.5 rounded-lg bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {dispatching ? "Sending..." : "Deliver Test"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
