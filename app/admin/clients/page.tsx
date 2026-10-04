"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  CreditCard,
  ArrowUpRight,
  Search,
  Plus,
  Mail,
  X,
  ArrowLeft,
  Building2,
  Globe,
  FileText,
  ExternalLink,
  Copy,
  Check,
  Briefcase,
  Layers,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";

export type ClientPartner = {
  id: string;
  userId: string;
  profileId: string | null;
  companyId: string | null;
  business_name: string;
  name: string;
  email: string;
  industry?: string | null;
  website?: string | null;
  country?: string | null;
  commercialStatus: "active" | "onboarding" | "pending_agreement" | "provisioned";
  agreementNumber: string | null;
  agreementStatus: string | null;
  agreementCount: number;
  onboardingNumber: string | null;
  onboardingStatus: string | null;
  onboardingProgress: number | null;
  invoiceCount: number;
  totalBilled: number;
  totalPaid: number;
  balanceDue: number;
  currency: string;
  latestInvoiceNumber: string | null;
  latestInvoiceStatus: string | null;
  createdAt: string;
};

/* ── Helpers ── */

const PLACEHOLDER_NAMES = new Set(["na", "n/a", "none", "test", "unnamed", "unknown", ""]);

const getDisplayName = (c: ClientPartner) => {
  const biz = (c.business_name || "").trim();
  const name = (c.name || "").trim();
  if (biz && !PLACEHOLDER_NAMES.has(biz.toLowerCase())) return biz;
  if (name && !PLACEHOLDER_NAMES.has(name.toLowerCase())) return name;
  // Derive from email org
  const domain = c.email.split("@")[1]?.split(".")[0] || "Client";
  return domain.charAt(0).toUpperCase() + domain.slice(1) + " Organization";
};

const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "CL";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const fmt = (amount: number, currency = "INR") => {
  if (!amount) return "—";
  const sym = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";
  return `${sym}${amount.toLocaleString("en-IN")}`;
};

/* ── Status Presentation ── */

const STATUS_MAP = {
  active: { label: "Active", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50" },
  onboarding: { label: "Onboarding", dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50" },
  pending_agreement: { label: "Pending MSA", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50" },
  provisioned: { label: "Provisioned", dot: "bg-slate-400", text: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" },
} as const;

/* ── Monogram color derivation (deterministic per name) ── */
/* Quiet, muted tints — avatars should recede, not compete */

const MONOGRAM_PALETTES = [
  "bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400",
  "bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400",
  "bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400",
  "bg-violet-50 text-violet-500 dark:bg-violet-950/40 dark:text-violet-400",
  "bg-rose-50 text-rose-400 dark:bg-rose-950/40 dark:text-rose-400",
  "bg-cyan-50 text-cyan-500 dark:bg-cyan-950/40 dark:text-cyan-400",
  "bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400",
  "bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-400",
];

const monoColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return MONOGRAM_PALETTES[Math.abs(hash) % MONOGRAM_PALETTES.length];
};

/* ════════════════════════════════════════════════════════════════ */

export default function ClientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "active" | "onboarding" | "pending">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const query = useQuery<ClientPartner[]>({
    queryKey: ["admin", "client-partners"],
    queryFn: async () => {
      const r = await fetch("/api/clients/list");
      const body = await r.json();
      if (!r.ok || !Array.isArray(body)) throw new Error(body.error || "Unable to load clients.");
      return body;
    },
  });

  const clients = query.data || [];
  const selectedClientId = searchParams.get("clientId");
  const selected = clients.find(
    (c) => c.id === selectedClientId || c.userId === selectedClientId || c.profileId === selectedClientId
  );

  /* ── Counts ── */
  const counts = useMemo(() => {
    const active = clients.filter((c) => c.commercialStatus === "active" || c.agreementStatus === "signed").length;
    const onb = clients.filter((c) => c.commercialStatus === "onboarding" || (c.onboardingStatus && c.onboardingStatus !== "completed" && c.onboardingStatus !== "not_started")).length;
    return { all: clients.length, active, onboarding: onb, pending: clients.length - active - onb };
  }, [clients]);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    let list = clients;
    if (tab === "active") list = list.filter((c) => c.commercialStatus === "active" || c.agreementStatus === "signed");
    else if (tab === "onboarding") list = list.filter((c) => c.commercialStatus === "onboarding" || (c.onboardingStatus && c.onboardingStatus !== "completed" && c.onboardingStatus !== "not_started"));
    else if (tab === "pending") list = list.filter((c) => c.commercialStatus === "provisioned" || c.commercialStatus === "pending_agreement");

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((c) =>
        [getDisplayName(c), c.email, c.agreementNumber, c.onboardingNumber, c.industry, c.latestInvoiceNumber]
          .filter(Boolean)
          .some((s) => s!.toLowerCase().includes(q))
      );
    }
    return list;
  }, [clients, tab, search]);

  const closeDrawer = () => router.replace("/admin/clients", { scroll: false });

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 1800);
  };

  /* ── Drawer focus trap ── */
  useEffect(() => {
    if (!selected) return;
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
      if (e.key === "Tab") {
        const els = Array.from(document.querySelectorAll<HTMLElement>("[data-client-dialog] button, [data-client-dialog] a"));
        const first = els[0], last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prevOverflow; document.removeEventListener("keydown", onKey); prev?.focus(); };
  }, [selected]);

  /* ════════════════════════════════════════════════════════════════ */
  /* ── RENDER ── */
  /* ════════════════════════════════════════════════════════════════ */

  const TABS: { key: typeof tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "active", label: "Active", count: counts.active },
    { key: "onboarding", label: "Onboarding", count: counts.onboarding },
    { key: "pending", label: "Pending", count: counts.pending },
  ];

  return (
    <div className="max-w-[1560px] mx-auto text-[var(--text-primary,#0f172a)]">
      {/* ──────────── COMPACT HEADER ──────────── */}
      <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-[var(--border-subtle,#e2e8f0)]">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[.14em] uppercase text-[var(--text-muted,#94a3b8)] mb-0.5">
            Customer & Sales / <span className="text-[#0075de]">Client Directory</span>
          </p>
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--text-primary,#0f172a)] leading-tight">
            Client Partners
          </h1>
        </div>
        <button
          onClick={() => router.push("/admin/leads?status=qualified")}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0075de] hover:bg-[#005bab] text-white text-[11px] font-semibold shadow-sm transition-all active:scale-[0.97]"
        >
          <Plus size={14} strokeWidth={2.5} />
          Provision Client
        </button>
      </div>

      {/* ──────────── INLINE CONTROL BAR (tabs + search + stats) ──────────── */}
      <div className="px-6 py-3 flex items-center justify-between gap-4 border-b border-[var(--border-subtle,#e2e8f0)] bg-[var(--background,#fafbfc)]">
        {/* Left: Tabs */}
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-3 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
                tab === t.key
                  ? "text-[#0075de] bg-[#0075de]/8"
                  : "text-[var(--text-secondary,#64748b)] hover:text-[var(--text-primary,#0f172a)] hover:bg-black/[0.03]"
              }`}
            >
              {t.label}
              <span
                className={`ml-1.5 text-[10px] font-mono tabular-nums ${
                  tab === t.key ? "text-[#0075de]" : "text-[var(--text-muted,#94a3b8)]"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Search + Compact Stats */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Inline Revenue Stat */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] pr-3 border-r border-[var(--border-subtle,#e2e8f0)]">
            <span className="text-[var(--text-muted,#94a3b8)]">Billed</span>
            <span className="font-mono font-bold text-[var(--text-primary,#0f172a)] tabular-nums">
              {fmt(clients.reduce((s, c) => s + c.totalBilled, 0))}
            </span>
            <span className="text-[var(--text-muted,#94a3b8)]">Collected</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {fmt(clients.reduce((s, c) => s + c.totalPaid, 0))}
            </span>
          </div>

          {/* Search */}
          <div className="relative w-56">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted,#94a3b8)]" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-md bg-[var(--card,#ffffff)] border border-[var(--border-subtle,#e2e8f0)] text-[11px] text-[var(--text-primary,#0f172a)] placeholder-[var(--text-muted,#94a3b8)] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted,#94a3b8)] hover:text-[var(--text-primary,#0f172a)]"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ──────────── CARD GRID ──────────── */}
      <div className="px-6 py-5">
        {query.isPending ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-[var(--border-subtle,#e2e8f0)] bg-[var(--card,#ffffff)] p-5 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="w-36 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="w-24 h-3 rounded bg-slate-100 dark:bg-slate-800/60" />
                  </div>
                </div>
                <div className="h-12 rounded bg-slate-100 dark:bg-slate-800/40" />
              </div>
            ))}
          </div>
        ) : query.error ? (
          <div className="p-12 text-center rounded-lg bg-[var(--card,#ffffff)] border border-dashed border-red-200 dark:border-red-900/50 space-y-2">
            <p className="text-sm font-semibold text-[var(--text-primary,#0f172a)]">Failed to load clients</p>
            <p className="text-xs text-[var(--text-muted,#64748b)]">{query.error.message}</p>
            <button
              onClick={() => void query.refetch()}
              className="mt-2 px-3 py-1.5 rounded-md bg-[#0075de] text-white text-[11px] font-semibold hover:bg-[#005bab]"
            >
              Retry
            </button>
          </div>
        ) : filtered.length ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
              {filtered.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  copiedId={copiedId}
                  onCopy={copyText}
                  onViewProfile={() =>
                    router.replace(`/admin/clients?clientId=${encodeURIComponent(client.id)}`, { scroll: false })
                  }
                  onBilling={() =>
                    router.push(`/admin/invoices?clientId=${encodeURIComponent(client.id)}`)
                  }
                  onOnboarding={() =>
                    router.push(`/admin/onboarding?partner=${encodeURIComponent(getDisplayName(client))}`)
                  }
                />
              ))}
            </div>
            <p className="text-[11px] text-[var(--text-muted,#94a3b8)] mt-4 tabular-nums">
              {filtered.length} of {clients.length} accounts
            </p>
          </>
        ) : (
          <div className="p-16 text-center rounded-lg bg-[var(--card,#ffffff)] border border-dashed border-[var(--border-subtle,#e2e8f0)]">
            <Users size={24} className="mx-auto text-[#0075de] mb-3" />
            <p className="text-sm font-semibold text-[var(--text-primary,#0f172a)]">
              {search ? "No matching partners" : "Start building your client directory"}
            </p>
            <p className="text-xs text-[var(--text-muted,#64748b)] mt-1 max-w-xs mx-auto">
              {search ? "Try a different search term." : "Provision a qualified lead to create your first client."}
            </p>
            <button
              onClick={() => (search ? setSearch("") : router.push("/admin/leads?status=qualified"))}
              className="mt-3 px-3 py-1.5 rounded-md border border-[var(--border-subtle,#e2e8f0)] bg-[var(--card,#ffffff)] text-[11px] font-semibold text-[var(--text-primary,#0f172a)] hover:bg-[var(--background,#f8fafc)]"
            >
              {search ? "Clear search" : "View Qualified Leads"}
            </button>
          </div>
        )}
      </div>

      {/* ──────────── DRAWER ──────────── */}
      {selected && (
        <DrawerPanel
          client={selected}
          closeRef={closeRef}
          copiedId={copiedId}
          onCopy={copyText}
          onClose={closeDrawer}
          onBilling={() => router.push(`/admin/invoices?clientId=${encodeURIComponent(selected.id)}`)}
          onChangeRequests={() => router.push(`/admin/change-requests?clientId=${encodeURIComponent(selected.id)}`)}
          onOnboarding={() => router.push(`/admin/onboarding?partner=${encodeURIComponent(getDisplayName(selected))}`)}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/* ── CLIENT CARD COMPONENT ── */
/* ════════════════════════════════════════════════════════════════ */

function ClientCard({
  client,
  copiedId,
  onCopy,
  onViewProfile,
  onBilling,
  onOnboarding,
}: {
  client: ClientPartner;
  copiedId: string | null;
  onCopy: (text: string, key: string) => void;
  onViewProfile: () => void;
  onBilling: () => void;
  onOnboarding: () => void;
}) {
  const name = getDisplayName(client);
  const initials = getInitials(name);
  const status = STATUS_MAP[client.commercialStatus] || STATUS_MAP.provisioned;
  const isActive = client.commercialStatus === "active" || client.agreementStatus === "signed";

  return (
    <article className="group rounded-lg bg-[var(--card,#ffffff)] border border-[var(--border-subtle,#e2e8f0)] hover:border-[#0075de]/40 transition-all duration-150 flex flex-col overflow-hidden">
      {/* ── Top: Identity Row ── */}
      <div className="p-4 pb-0">
        <div className="flex items-start gap-3">
          {/* Monogram */}
          <div
            className={`w-10 h-10 rounded-lg ${monoColor(name)} text-[11px] font-semibold tracking-wider flex items-center justify-center shrink-0 select-none border border-black/[0.04]`}
          >
            {initials}
          </div>

          {/* Name + Meta */}
          <div className="flex-1 min-w-0 min-h-[40px] flex flex-col justify-center">
            <div className="flex items-center justify-between gap-2">
              <h3
                onClick={onViewProfile}
                className="text-[13px] font-bold text-[var(--text-primary,#0f172a)] truncate cursor-pointer hover:text-[#0075de] transition-colors leading-snug"
                title={name}
              >
                {name}
              </h3>
              {/* Status chip */}
              <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold border ${status.bg} ${status.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${isActive ? "animate-pulse" : ""}`} />
                {status.label}
              </span>
            </div>

            {/* Sub-line: domain / industry / country */}
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[var(--text-muted,#94a3b8)]">
              {client.website ? (
                <>
                  <Globe size={10} className="shrink-0" />
                  <span className="truncate">{client.website.replace(/^https?:\/\//, "")}</span>
                </>
              ) : client.industry && !PLACEHOLDER_NAMES.has(client.industry.toLowerCase()) ? (
                <>
                  <Briefcase size={10} className="shrink-0" />
                  <span className="truncate">{client.industry}</span>
                </>
              ) : (
                <span>Corporate Partner</span>
              )}
              {client.country && (
                <>
                  <span className="text-[var(--border-subtle,#cbd5e1)]">·</span>
                  <span>{client.country}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Email ── */}
        <div className="flex items-center justify-between gap-2 mt-2.5 text-[11px] text-[var(--text-secondary,#64748b)]">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <Mail size={12} className="shrink-0 text-[var(--text-muted,#94a3b8)]" />
            <a href={`mailto:${client.email}`} className="truncate hover:text-[#0075de] hover:underline transition-colors">
              {client.email}
            </a>
          </div>
          <button
            onClick={() => onCopy(client.email, `e-${client.id}`)}
            className="shrink-0 p-0.5 text-[var(--text-muted,#cbd5e1)] hover:text-[var(--text-primary,#0f172a)] transition-colors"
            title="Copy email"
          >
            {copiedId === `e-${client.id}` ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
          </button>
        </div>
      </div>

      {/* ── Commercial Telemetry Matrix (Clean Borderless Enterprise Layout) ── */}
      <div className="mx-4 my-2.5 grid grid-cols-3 gap-2 px-3 py-2.5 rounded-lg bg-[var(--background,#f8fafc)]">
        {/* Col 1: Agreement */}
        <div className="min-w-0 flex flex-col justify-between h-[62px]">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted,#94a3b8)] truncate leading-none">
            Agreement
          </div>
          <div className="font-mono font-bold text-[11px] text-[var(--text-primary,#0f172a)] truncate tabular-nums leading-tight" title={client.agreementNumber || "No MSA"}>
            {client.agreementNumber ? client.agreementNumber.replace("GXL-MSA-", "MSA-") : "No MSA"}
          </div>
          <div className="text-[10px] truncate leading-none">
            {client.agreementStatus === "signed" ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Executed</span>
            ) : client.agreementStatus ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium capitalize">{client.agreementStatus}</span>
            ) : (
              <span className="text-[var(--text-muted,#cbd5e1)]">—</span>
            )}
          </div>
        </div>

        {/* Col 2: Onboarding */}
        <div className="min-w-0 flex flex-col justify-between h-[62px]">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted,#94a3b8)] truncate leading-none">
            Onboarding
          </div>
          <div className="text-[11px] font-semibold text-[var(--text-primary,#0f172a)] truncate leading-tight">
            {client.onboardingStatus === "completed"
              ? "Completed"
              : client.onboardingStatus === "in_progress"
              ? "In Progress"
              : client.onboardingStatus === "pending_review"
              ? "Review"
              : "Not Started"}
          </div>
          <div className="w-full flex items-center h-2">
            <div className="w-full h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  client.onboardingStatus === "completed"
                    ? "bg-emerald-500 w-full"
                    : client.onboardingStatus === "in_progress"
                    ? "bg-blue-500"
                    : "w-0"
                }`}
                style={
                  client.onboardingStatus === "in_progress"
                    ? { width: `${Math.max(client.onboardingProgress ?? 10, 25)}%` }
                    : undefined
                }
              />
            </div>
          </div>
        </div>

        {/* Col 3: Revenue */}
        <div className="min-w-0 flex flex-col justify-between h-[62px]">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted,#94a3b8)] truncate leading-none">
            Billed
          </div>
          <div className="font-mono font-bold text-[11px] text-[var(--text-primary,#0f172a)] tabular-nums truncate leading-tight">
            {fmt(client.totalBilled, client.currency)}
          </div>
          <div className="text-[10px] truncate leading-none">
            {client.totalPaid > 0 ? (
              <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                {fmt(client.totalPaid, client.currency)} paid
              </span>
            ) : client.totalBilled > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">Pending</span>
            ) : (
              <span className="text-[var(--text-muted,#cbd5e1)]">No invoices</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Action Footer ── */}
      <div className="mt-auto px-4 pb-3 pt-1 flex items-center justify-between gap-2">
        <button
          onClick={onViewProfile}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0075de] hover:text-[#005bab] transition-colors"
        >
          Profile
          <ArrowUpRight size={12} />
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onBilling}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[var(--border-subtle,#e2e8f0)] bg-[var(--card,#ffffff)] hover:bg-[var(--background,#f8fafc)] text-[11px] font-semibold text-[var(--text-secondary,#475569)] transition-colors"
          >
            <CreditCard size={12} className="text-[var(--text-muted,#94a3b8)]" />
            Billing
            {client.invoiceCount > 0 && (
              <span className="px-1 rounded text-[9px] font-mono bg-blue-50 dark:bg-blue-950/40 text-[#0075de]">{client.invoiceCount}</span>
            )}
          </button>
          <button
            onClick={onOnboarding}
            className="p-1 rounded-md border border-[var(--border-subtle,#e2e8f0)] bg-[var(--card,#ffffff)] hover:bg-[var(--background,#f8fafc)] text-[var(--text-muted,#94a3b8)] hover:text-[#0075de] transition-colors"
            title="Onboarding workspace"
          >
            <Layers size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/* ── DRAWER PANEL ── */
/* ════════════════════════════════════════════════════════════════ */

function DrawerPanel({
  client,
  closeRef,
  copiedId,
  onCopy,
  onClose,
  onBilling,
  onChangeRequests,
  onOnboarding,
}: {
  client: ClientPartner;
  closeRef: React.RefObject<HTMLButtonElement | null>;
  copiedId: string | null;
  onCopy: (text: string, key: string) => void;
  onClose: () => void;
  onBilling: () => void;
  onChangeRequests: () => void;
  onOnboarding: () => void;
}) {
  const name = getDisplayName(client);
  const initials = getInitials(name);
  const isActive = client.commercialStatus === "active" || client.agreementStatus === "signed";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs" onClick={onClose}>
      <aside
        data-client-dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-profile-title"
        className="h-full w-full max-w-lg bg-[var(--card,#ffffff)] border-l border-[var(--border-subtle,#e2e8f0)] overflow-y-auto shadow-2xl text-[var(--text-primary,#0f172a)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle,#e2e8f0)] shrink-0">
          <p className="text-[10px] font-semibold tracking-[.14em] uppercase text-[var(--text-muted,#94a3b8)]">
            Account <span className="text-[#0075de]">360°</span>
          </p>
          <button
            ref={closeRef}
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-muted,#94a3b8)] hover:text-[var(--text-primary,#0f172a)] hover:bg-[var(--background,#f8fafc)]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Identity */}
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${monoColor(name)} text-sm font-bold tracking-wider flex items-center justify-center shrink-0 shadow-md`}>
              {initials}
            </div>
            <div className="min-w-0">
              <h2 id="client-profile-title" className="text-lg font-extrabold tracking-tight truncate">
                {name}
              </h2>
              <p className="text-[11px] text-[var(--text-muted,#94a3b8)] mt-0.5">
                {isActive ? "Active Commercial Partner" : "Provisioned Partner Account"}
              </p>
              <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[9px] font-semibold border ${STATUS_MAP[client.commercialStatus].bg} ${STATUS_MAP[client.commercialStatus].text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_MAP[client.commercialStatus].dot}`} />
                {STATUS_MAP[client.commercialStatus].label}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="rounded-lg border border-[var(--border-subtle,#e2e8f0)] divide-y divide-[var(--border-subtle,#e2e8f0)] text-xs">
            <Row label="Contact Person" value={client.name || "—"} />
            <Row label="Email" value={client.email} isLink />
            {client.website && <Row label="Website" value={client.website} />}
            {client.industry && !PLACEHOLDER_NAMES.has(client.industry.toLowerCase()) && <Row label="Industry" value={client.industry} />}
            {client.country && <Row label="Country" value={client.country} />}
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-[var(--text-muted,#94a3b8)]">Account ID</span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--text-secondary,#64748b)]">
                <span className="truncate max-w-[180px]">{client.id}</span>
                <button onClick={() => onCopy(client.id, "did")} className="text-[var(--text-muted,#cbd5e1)] hover:text-[var(--text-primary)]">
                  {copiedId === "did" ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                </button>
              </span>
            </div>
          </div>

          {/* Agreement */}
          <Section icon={<FileText size={13} className="text-emerald-600" />} title="Master Service Agreement">
            {client.agreementNumber ? (
              <div className="flex items-center justify-between p-3 rounded-md bg-[var(--card,#ffffff)] border border-[var(--border-subtle,#e2e8f0)] text-xs">
                <div>
                  <div className="font-mono font-bold text-[var(--text-primary,#0f172a)]">{client.agreementNumber}</div>
                  <div className="text-[10px] text-[var(--text-muted,#94a3b8)] capitalize mt-0.5">{client.agreementStatus || "Active"}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Executed
                </span>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted,#94a3b8)] p-3 border border-dashed border-[var(--border-subtle,#e2e8f0)] rounded-md">
                No MSA linked to this account.
              </p>
            )}
          </Section>

          {/* Billing */}
          <Section icon={<CreditCard size={13} className="text-blue-600" />} title="Billing & Collections">
            <div className="grid grid-cols-3 gap-2">
              <StatTile label="Billed" value={fmt(client.totalBilled, client.currency)} />
              <StatTile label="Collected" value={fmt(client.totalPaid, client.currency)} color="text-emerald-600 dark:text-emerald-400" />
              <StatTile label="Balance" value={fmt(client.balanceDue, client.currency)} color="text-amber-600 dark:text-amber-400" />
            </div>
            {client.latestInvoiceNumber && (
              <div className="flex items-center justify-between text-[10px] text-[var(--text-muted,#94a3b8)] mt-2">
                <span>Latest: <span className="font-mono font-semibold text-[var(--text-secondary,#64748b)]">{client.latestInvoiceNumber}</span></span>
              </div>
            )}
          </Section>

          {/* Onboarding */}
          <Section icon={<Layers size={13} className="text-indigo-600" />} title="Onboarding">
            <div className="flex items-center justify-between p-3 rounded-md bg-[var(--card,#ffffff)] border border-[var(--border-subtle,#e2e8f0)] text-xs">
              <div>
                <div className="font-mono font-bold text-[var(--text-primary,#0f172a)]">{client.onboardingNumber || "—"}</div>
                <div className="text-[10px] text-[var(--text-muted,#94a3b8)] capitalize mt-0.5">{client.onboardingStatus?.replace(/_/g, " ") || "Not initiated"}</div>
              </div>
              <button
                onClick={onOnboarding}
                className="px-2 py-1 rounded-md bg-[#0075de] hover:bg-[#005bab] text-white text-[10px] font-semibold transition-colors"
              >
                Open
              </button>
            </div>
          </Section>
        </div>

        {/* Drawer Footer Actions */}
        <div className="shrink-0 px-6 py-4 border-t border-[var(--border-subtle,#e2e8f0)] space-y-2 bg-[var(--background,#fafbfc)]">
          <button onClick={onBilling} className="w-full py-2 rounded-lg bg-[#0075de] hover:bg-[#005bab] text-white text-[11px] font-semibold flex items-center justify-center gap-2 transition-all">
            <CreditCard size={13} /> Invoices & Billing <ArrowUpRight size={12} />
          </button>
          <button onClick={onChangeRequests} className="w-full py-2 rounded-lg border border-[var(--border-subtle,#e2e8f0)] bg-[var(--card,#ffffff)] hover:bg-[var(--background,#f8fafc)] text-[11px] font-semibold text-[var(--text-primary,#0f172a)] flex items-center justify-center gap-2 transition-colors">
            Change Requests <ArrowUpRight size={12} />
          </button>
          <button onClick={onClose} className="w-full py-1.5 text-[11px] text-[var(--text-muted,#94a3b8)] hover:text-[var(--text-primary,#0f172a)] flex items-center justify-center gap-1 transition-colors">
            <ArrowLeft size={12} /> Back to directory
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ── Tiny reusable components ── */

function Row({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 text-xs">
      <span className="text-[var(--text-muted,#94a3b8)]">{label}</span>
      {isLink ? (
        <a href={`mailto:${value}`} className="font-medium text-[#0075de] hover:underline truncate max-w-[220px]">{value}</a>
      ) : (
        <span className="font-medium text-[var(--text-primary,#0f172a)] truncate max-w-[220px]">{value}</span>
      )}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted,#94a3b8)]">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function StatTile({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-2 rounded-md bg-[var(--card,#ffffff)] border border-[var(--border-subtle,#e2e8f0)]">
      <div className="text-[9px] font-semibold uppercase text-[var(--text-muted,#94a3b8)]">{label}</div>
      <div className={`font-mono font-bold text-[11px] mt-0.5 tabular-nums ${color || "text-[var(--text-primary,#0f172a)]"}`}>{value}</div>
    </div>
  );
}
