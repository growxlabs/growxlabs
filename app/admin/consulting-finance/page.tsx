"use client";

import { useEffect, useState } from "react";

type Invoice = { id: string; invoice_number: string; status: string; currency: string; total: number; balance_due: number };
type Payment = { id: string; payment_number: string; invoice_id: string; amount: number; status: string; submitted_at: string };

export default function ConsultingFinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState("");
  const load = async () => {
    setError("");
    const [invoiceResponse, paymentResponse] = await Promise.all([fetch("/api/admin/consulting-invoices"), fetch("/api/admin/consulting-payments")]);
    const invoiceJson = await invoiceResponse.json(); const paymentJson = await paymentResponse.json();
    if (!invoiceResponse.ok || !paymentResponse.ok) { setError(invoiceJson.error || paymentJson.error || "Unable to load consulting finance."); return; }
    setInvoices(invoiceJson.invoices || []); setPayments(paymentJson.payments || []);
  };
  useEffect(() => { void load(); }, []);
  const verify = async (paymentId: string, action: "verify" | "reject") => { const response = await fetch("/api/admin/consulting-payments", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ paymentId, action }) }); if (!response.ok) { const json = await response.json(); setError(json.error || "Payment update failed."); return; } await load(); };
  return <main className="mx-auto max-w-7xl space-y-8 p-8"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Finance & activation</p><h1 className="mt-2 text-3xl font-semibold text-slate-950">Consulting billing</h1><p className="mt-2 text-slate-600">Review advance invoices and verify client payments before project activation.</p></div>{error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Advance invoices</h2><div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase tracking-wide text-slate-500"><th className="p-3">Number</th><th className="p-3">Status</th><th className="p-3">Total</th><th className="p-3">Balance</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id} className="border-b last:border-0"><td className="p-3 font-medium">{invoice.invoice_number}</td><td className="p-3">{invoice.status.replaceAll("_", " ")}</td><td className="p-3">{invoice.currency} {Number(invoice.total).toLocaleString()}</td><td className="p-3">{invoice.currency} {Number(invoice.balance_due).toLocaleString()}</td></tr>)}{!invoices.length && <tr><td className="p-4 text-slate-500" colSpan={4}>No consulting invoices yet.</td></tr>}</tbody></table></div></section><section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Payment verification</h2><div className="mt-4 space-y-3">{payments.map((payment) => <div key={payment.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 p-4"><div><p className="font-medium">{payment.payment_number}</p><p className="text-sm text-slate-600">{payment.amount} · {payment.status.replaceAll("_", " ")}</p></div>{payment.status === "verification_required" && <div className="flex gap-2"><button className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white" onClick={() => void verify(payment.id, "verify")}>Verify</button><button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium" onClick={() => void verify(payment.id, "reject")}>Reject</button></div>}</div>)}{!payments.length && <p className="text-slate-500">No submitted payments.</p>}</div></section></main>;
}
