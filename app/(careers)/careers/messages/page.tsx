"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";

export default function CandidateMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch('/api/v1/candidate/portal').then(async (res) => { const data = await res.json(); if (!res.ok) throw new Error(data.error); setMessages(data.messages || []); }).catch(() => setMessages([])).finally(() => setLoading(false)); }, []);
  return <main className="min-h-screen bg-[#f5f7fb] px-4 py-10"><div className="mx-auto max-w-4xl"><div className="mb-8 flex items-center justify-between"><div><p className="text-sm font-semibold text-[#0075de]">GrowXLabs Careers</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Messages</h1><p className="mt-2 text-sm text-slate-600">Updates about your applications.</p></div><Link href="/careers/dashboard" className="text-sm font-semibold text-[#0075de]">Back to dashboard</Link></div><section className="rounded-2xl border border-slate-200 bg-white shadow-sm">{loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#0075de]" /></div> : messages.length ? <div className="divide-y divide-slate-100">{messages.map((message) => <article key={message.id} className="flex gap-4 px-6 py-5"><Mail className="mt-0.5 shrink-0 text-[#0075de]" size={18}/><div className="min-w-0 flex-1"><h2 className="font-semibold text-slate-900">{message.subject}</h2><p className="mt-1 text-sm text-slate-500">GrowXLabs Careers · {new Date(message.sent_at || message.created_at).toLocaleString()}</p></div><span className="text-xs font-medium text-slate-500">Sent</span></article>)}</div> : <div className="px-6 py-14 text-center text-sm text-slate-600">You don’t have any messages yet.</div>}</section></div></main>;
}
