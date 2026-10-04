"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Users, CreditCard, ArrowUpRight, Search, Plus, Mail, X, ArrowLeft } from "lucide-react";
import styles from "./clients.module.css";

type Client = { id: string; business_name?: string; name: string; email: string };
const clientName = (client: Client) => client.business_name || client.name || "Unnamed client";
const initials = (client: Client) => clientName(client).trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase();

export default function ClientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const query = useQuery<Client[]>({
    queryKey: ["admin", "client-partners"],
    queryFn: async () => {
      const response = await fetch("/api/clients/list");
      const body = await response.json();
      if (!response.ok || !Array.isArray(body)) throw new Error(body.error || "Unable to load clients.");
      return body;
    },
  });
  const clients = query.data || [];
  const selected = clients.find(client => client.id === searchParams.get("clientId"));
  const filtered = clients.filter(client => `${clientName(client)} ${client.email}`.toLowerCase().includes(search.trim().toLowerCase()));
  const close = () => router.replace("/admin/clients", { scroll: false });

  useEffect(() => {
    if (!selected) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") router.replace("/admin/clients", { scroll: false });
      if (event.key === "Tab") {
        const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-client-dialog] button, [data-client-dialog] a'));
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); previousFocus?.focus(); };
  }, [selected, router]);

  return <div className={styles.workspace}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>CUSTOMER & SALES / CLIENT DIRECTORY</p><h1>Client partners</h1><p className={styles.subtitle}>Your client relationships, profiles, and billing in one place.</p></div>
      <button className={styles.primary} onClick={() => router.push("/admin/leads?status=qualified")}><Plus size={16} /> Provision new client</button>
    </header>
    <div className={styles.toolbar}>
      <div className={styles.directoryLabel}><Users size={18} /><strong>All clients</strong><span className={styles.count}>{query.isPending ? "—" : clients.length}</span></div>
      <label className={styles.search}><Search size={16} /><input aria-label="Search clients by company or email" placeholder="Search company or email…" value={search} onChange={event => setSearch(event.target.value)} />{search && <button aria-label="Clear search" onClick={() => setSearch("")}><X size={15} /></button>}</label>
    </div>
    {query.isPending ? <div className={styles.grid} aria-label="Loading clients" aria-busy="true">{Array.from({length: 6}, (_, i) => <div key={i} className={styles.skeleton}><div /><div /><div /></div>)}</div> : query.error ? <div className={styles.empty} role="alert"><h2>Clients could not be loaded</h2><p>{query.error.message}</p><button className={styles.secondary} onClick={() => void query.refetch()}>Try again</button></div> : filtered.length ? <>
      <div className={styles.grid}>{filtered.map(client => <article key={client.id} className={styles.card}>
        <div className={styles.cardTop}><div className={styles.avatar} aria-hidden="true">{initials(client)}</div><span className={styles.badge}>Client partner</span></div>
        <h2>{clientName(client)}</h2><div className={styles.email}><Mail size={14} /><span title={client.email}>{client.email}</span></div>
        <div className={styles.cardFooter}><button className={styles.profile} onClick={() => router.replace(`/admin/clients?clientId=${encodeURIComponent(client.id)}`, {scroll: false})}>View profile<ArrowUpRight size={15} /></button><button className={styles.billing} onClick={() => router.push(`/admin/invoices?clientId=${encodeURIComponent(client.id)}`)}><CreditCard size={15} /> Billing</button></div>
      </article>)}</div><p className={styles.results}>Showing {filtered.length} of {clients.length} client partners</p>
    </> : <div className={styles.empty}><Users size={28} /><h2>{search ? "No matching clients" : "Your client directory starts here"}</h2><p>{search ? "Try another company name or email address." : "Provision a qualified lead to create your first client partner."}</p><button className={styles.secondary} onClick={() => search ? setSearch("") : router.push("/admin/leads?status=qualified")}>{search ? "Clear search" : "View qualified leads"}</button></div>}
    {selected && <div className={styles.overlay} onClick={close}><aside data-client-dialog role="dialog" aria-modal="true" aria-labelledby="client-profile-title" className={styles.drawer} onClick={event => event.stopPropagation()}>
      <div className={styles.drawerTop}><span className={styles.eyebrow}>CLIENT PROFILE</span><button ref={closeRef} className={styles.close} onClick={close} aria-label="Close client profile"><X size={19} /></button></div>
      <div className={styles.avatar}>{initials(selected)}</div><h2 id="client-profile-title">{clientName(selected)}</h2><p className={styles.subtitle}>Client partner details and account actions.</p>
      <dl className={styles.details}><div><dt>Company / client name</dt><dd>{clientName(selected)}</dd></div><div><dt>Contact email</dt><dd>{selected.email}</dd></div><div><dt>Client reference</dt><dd className={styles.reference}>{selected.id}</dd></div></dl>
      <button className={styles.primary} onClick={() => router.push(`/admin/invoices?clientId=${encodeURIComponent(selected.id)}`)}><CreditCard size={16} /> View billing<ArrowUpRight size={16} /></button>
      <button className={styles.secondary} onClick={() => router.push(`/admin/change-requests?clientId=${encodeURIComponent(selected.id)}`)}>View change requests<ArrowUpRight size={16} /></button>
      <button className={styles.back} onClick={close}><ArrowLeft size={15} /> Back to directory</button>
    </aside></div>}
  </div>;
}
