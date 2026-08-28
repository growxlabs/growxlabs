"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/* ─────────────────────────────────────────────
   CONSTANTS
   ───────────────────────────────────────────── */

const PACKAGES: Record<string, {
  name: string;
  price: Record<string, string>;
  timeline: string;
  deliverables: string[];
}> = {
  starter: {
    name: "Starter",
    price: { INR: "₹8,000 – ₹12,000", USD: "$100 – $150", GBP: "£80 – £120", EUR: "€90 – €140" },
    timeline: "7 Business Days",
    deliverables: [
      "3–5 page professionally designed website",
      "Fully mobile-responsive layout",
      "Contact form with WhatsApp integration",
      "Foundational SEO configuration",
      "SSL certificate and optimized hosting",
      "2 rounds of design revisions",
      "14 days of post-launch technical support",
    ],
  },
  growth: {
    name: "Growth",
    price: { INR: "₹20,000 – ₹35,000", USD: "$250 – $420", GBP: "£200 – £330", EUR: "€230 – €380" },
    timeline: "14 Business Days",
    deliverables: [
      "8–10 page website with structured content architecture",
      "Integrated blog or news section",
      "Google Analytics and performance tracking",
      "90+ Google PageSpeed score optimization",
      "Automated lead capture and routing via n8n",
      "Content management panel for self-service updates",
      "Priority support with dedicated response SLA",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: { INR: "₹40,000+", USD: "$500+", GBP: "£400+", EUR: "€450+" },
    timeline: "21–30 Business Days",
    deliverables: [
      "Custom-built web application tailored to business logic",
      "End-to-end workflow automation suite",
      "AI-powered chat and customer interaction layer",
      "Third-party API integrations (CRM, payments, analytics)",
      "Custom admin dashboard for operations management",
      "Ongoing monthly maintenance and monitoring",
      "Dedicated communication channel for rapid support",
    ],
  },
};

const CURRENCY_SYMBOL: Record<string, string> = {
  INR: "₹", USD: "$", GBP: "£", EUR: "€",
};

/* ─────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────── */

export default function PublicProposalView() {
  const params = useParams();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) fetchProposal();
  }, [params.id]);

  const fetchProposal = async () => {
    try {
      const res = await fetch(`/api/proposals/${params.id}/view`);
      const data = await res.json();
      setProposal(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-400">Loading proposal</p>
      </div>
    </div>
  );

  /* ── Not Found ── */
  if (!proposal) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-3">
        <p className="text-lg font-semibold text-neutral-900">Proposal Not Found</p>
        <p className="text-sm text-neutral-500">This proposal may have expired or the link is incorrect.</p>
      </div>
    </div>
  );

  /* ── Derived Data ── */
  const pkg = PACKAGES[proposal.selected_package as string] || PACKAGES.growth;
  const sym = CURRENCY_SYMBOL[proposal.currency] || "₹";
  const priceDisplay = proposal.custom_price
    ? `${sym}${Number(proposal.custom_price).toLocaleString("en-IN")}`
    : pkg.price[proposal.currency as string] || pkg.price.INR;
  const issueDate = new Date(proposal.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  const validDate = proposal.valid_until
    ? new Date(proposal.valid_until).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "7 days from date of issue";

  return (
    <>
      {/* ── Print Styles ── */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        @media print {
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, aside, header, footer, .no-print { display: none !important; }
          .proposal-container {
            padding: 0 !important;
            gap: 0 !important;
          }
          .proposal-sheet {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          .proposal-sheet:last-child {
            page-break-after: avoid !important;
          }
        }

        @media screen {
          .proposal-container {
            background: #f5f5f4;
          }
        }
      `}</style>

      <div className="proposal-container min-h-screen py-12 px-4 md:px-0" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <div className="max-w-[820px] mx-auto space-y-10">

          {/* ═══════════════════════════════════════════
              PAGE 01 — COVER
              ═══════════════════════════════════════════ */}
          <section className="proposal-sheet bg-white p-14 md:p-20 shadow-sm border border-neutral-200/60 aspect-[1/1.414] flex flex-col justify-between relative">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-[15px] font-bold tracking-tight text-neutral-900">GrowXLabsTech</h2>
                <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-400">Digital Infrastructure Partner</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-neutral-400">Confidential</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{issueDate}</p>
              </div>
            </div>

            {/* Center Content */}
            <div className="space-y-8 my-auto py-16">
              <div className="space-y-4">
                <div className="w-10 h-[2px] bg-[#2563EB]" />
                <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#2563EB]">
                  Digital Transformation Proposal
                </p>
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-neutral-900 max-w-[85%]">
                  Strategic Digital Infrastructure Partnership
                </h1>
                <p className="text-base text-neutral-500 font-normal max-w-lg leading-relaxed">
                  A tailored engagement designed to establish and scale your digital presence with measurable business outcomes.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-200 pt-8 grid grid-cols-2 gap-8">
              <div className="space-y-5">
                <div className="space-y-1">
                  <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-neutral-400">Prepared For</p>
                  <p className="text-sm font-semibold text-neutral-900">{proposal.client_name || "—"}</p>
                  <p className="text-xs text-neutral-500">{proposal.business_name} · {proposal.industry}</p>
                </div>
              </div>
              <div className="space-y-5 text-right">
                <div className="space-y-1">
                  <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-neutral-400">Prepared By</p>
                  <p className="text-sm font-semibold text-neutral-900">Pujala Sai Varshith</p>
                  <p className="text-xs text-neutral-500">Founder &amp; Digital Strategist</p>
                </div>
              </div>
            </div>
          </section>


          {/* ═══════════════════════════════════════════
              PAGE 02 — EXECUTIVE PROBLEM FRAMING
              ═══════════════════════════════════════════ */}
          <section className="proposal-sheet bg-white p-14 md:p-20 shadow-sm border border-neutral-200/60 aspect-[1/1.414] flex flex-col justify-between">
            {/* Running Header */}
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <span className="text-[9px] font-semibold tracking-[0.15em] uppercase text-neutral-400">GrowXLabsTech · Proposal</span>
              <span className="text-[9px] font-medium text-neutral-300">02 / 05</span>
            </div>

            <div className="my-auto space-y-10 py-8">
              <div className="space-y-3">
                <div className="w-8 h-[2px] bg-[#2563EB]" />
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#2563EB]">
                  Understanding Your Position
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Current Challenges &amp; Opportunity
                </h2>
              </div>

              {/* Problem Statement */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">What We Understand</p>
                  <div className="border-l-2 border-[#2563EB] pl-6 py-3">
                    <p className="text-[15px] leading-relaxed text-neutral-700 font-normal">
                      {proposal.problem_description || "Your business requires a structured digital presence to effectively reach and convert your target audience online."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cost of Inaction */}
              <div className="bg-neutral-50 border border-neutral-100 p-8 space-y-3">
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">
                  The Cost of Inaction
                </p>
                <p className="text-lg font-semibold text-neutral-900 leading-snug">
                  {proposal.pain_point_cost || "Without a structured digital strategy, potential customers are lost to competitors with stronger online positioning."}
                </p>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-xl">
                  Addressing this gap early protects revenue, strengthens brand credibility, and creates a scalable foundation for sustained growth.
                </p>
              </div>

              {/* Insight */}
              <div className="flex items-start gap-4">
                <div className="w-1 h-1 bg-[#2563EB] rounded-full mt-2 shrink-0" />
                <p className="text-xs text-neutral-500 leading-relaxed">
                  This proposal outlines a clear, actionable strategy to resolve these challenges within a defined timeline and budget.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t border-neutral-100 pt-4">
              <span className="text-[9px] font-medium text-neutral-300 tracking-wide uppercase">Confidential</span>
              <span className="text-[9px] font-medium text-neutral-300">Page 2 of 5</span>
            </div>
          </section>


          {/* ═══════════════════════════════════════════
              PAGE 03 — PROPOSED SOLUTION & INVESTMENT
              ═══════════════════════════════════════════ */}
          <section className="proposal-sheet bg-white p-14 md:p-20 shadow-sm border border-neutral-200/60 aspect-[1/1.414] flex flex-col justify-between">
            {/* Running Header */}
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <span className="text-[9px] font-semibold tracking-[0.15em] uppercase text-neutral-400">GrowXLabsTech · Proposal</span>
              <span className="text-[9px] font-medium text-neutral-300">03 / 05</span>
            </div>

            <div className="my-auto space-y-8 py-8">
              <div className="space-y-3">
                <div className="w-8 h-[2px] bg-[#2563EB]" />
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#2563EB]">
                  Recommended Solution
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  {pkg.name} — Scope &amp; Investment
                </h2>
              </div>

              {/* Investment Summary */}
              <div className="flex items-baseline justify-between border-b border-neutral-100 pb-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Investment</p>
                  <p className="text-3xl font-bold text-neutral-900 tracking-tight">{priceDisplay}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Delivery Timeline</p>
                  <p className="text-sm font-semibold text-neutral-900">{pkg.timeline}</p>
                </div>
              </div>

              {/* Deliverables */}
              <div className="space-y-4">
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">What You Receive</p>
                <div className="space-y-0">
                  {pkg.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 py-3 border-b border-neutral-50 last:border-0">
                      <span className="text-[10px] font-semibold text-neutral-300 mt-0.5 w-5 shrink-0 tabular-nums">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <p className="text-[13px] text-neutral-700 font-normal leading-snug">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Terms */}
              <div className="bg-neutral-50 border border-neutral-100 p-6 flex items-start justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Payment Structure</p>
                  <p className="text-xs text-neutral-600 font-medium">50% at project commencement · 50% upon delivery</p>
                </div>
                <div className="text-right space-y-1 shrink-0">
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Valid Until</p>
                  <p className="text-xs text-neutral-600 font-medium">{validDate}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t border-neutral-100 pt-4">
              <span className="text-[9px] font-medium text-neutral-300 tracking-wide uppercase">Confidential</span>
              <span className="text-[9px] font-medium text-neutral-300">Page 3 of 5</span>
            </div>
          </section>


          {/* ═══════════════════════════════════════════
              PAGE 04 — WHY GROWXLABSTECH
              ═══════════════════════════════════════════ */}
          <section className="proposal-sheet bg-white p-14 md:p-20 shadow-sm border border-neutral-200/60 aspect-[1/1.414] flex flex-col justify-between">
            {/* Running Header */}
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <span className="text-[9px] font-semibold tracking-[0.15em] uppercase text-neutral-400">GrowXLabsTech · Proposal</span>
              <span className="text-[9px] font-medium text-neutral-300">04 / 05</span>
            </div>

            <div className="my-auto space-y-10 py-8">
              <div className="space-y-3">
                <div className="w-8 h-[2px] bg-[#2563EB]" />
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#2563EB]">
                  Why GrowXLabsTech
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  A Partner, Not a Vendor
                </h2>
                <p className="text-sm text-neutral-500 leading-relaxed max-w-lg">
                  We approach every engagement as a long-term partnership. Our success is measured by your business outcomes — not just project delivery.
                </p>
              </div>

              {/* Capability Areas */}
              <div className="grid grid-cols-1 gap-0 border border-neutral-100 divide-y divide-neutral-100">
                {[
                  {
                    title: "Web Platform Engineering",
                    description: "High-performance web platforms and applications built with modern frameworks. Optimized for speed, accessibility, and search visibility.",
                  },
                  {
                    title: "Process Automation",
                    description: "Intelligent workflows that eliminate manual tasks — from lead routing and CRM syncing to automated customer communications.",
                  },
                  {
                    title: "Technical Infrastructure",
                    description: "Enterprise-grade hosting, SSL certification, CDN optimization, and ongoing maintenance to ensure reliability and performance.",
                  },
                ].map((cap, idx) => (
                  <div key={idx} className="flex items-start gap-6 p-6">
                    <span className="text-[11px] font-semibold text-neutral-300 mt-0.5 shrink-0 tabular-nums">
                      0{idx + 1}
                    </span>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-semibold text-neutral-900">{cap.title}</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">{cap.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust Signals */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: "Registered Entity", value: "UDYAM certified micro-enterprise under Ministry of MSME, India" },
                  { label: "Engineering Standards", value: "Production-grade codebases with automated testing and performance benchmarking" },
                  { label: "Client Commitment", value: "Dedicated project communication, transparent timelines, and post-launch support" },
                ].map((trust, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#2563EB]">{trust.label}</p>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">{trust.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t border-neutral-100 pt-4">
              <span className="text-[9px] font-medium text-neutral-300 tracking-wide uppercase">Confidential</span>
              <span className="text-[9px] font-medium text-neutral-300">Page 4 of 5</span>
            </div>
          </section>


          {/* ═══════════════════════════════════════════
              PAGE 05 — ENGAGEMENT FRAMEWORK & SIGN-OFF
              ═══════════════════════════════════════════ */}
          <section className="proposal-sheet bg-white p-14 md:p-20 shadow-sm border border-neutral-200/60 aspect-[1/1.414] flex flex-col justify-between">
            {/* Running Header */}
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <span className="text-[9px] font-semibold tracking-[0.15em] uppercase text-neutral-400">GrowXLabsTech · Proposal</span>
              <span className="text-[9px] font-medium text-neutral-300">05 / 05</span>
            </div>

            <div className="my-auto space-y-10 py-8">
              <div className="space-y-3">
                <div className="w-8 h-[2px] bg-[#2563EB]" />
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#2563EB]">
                  Next Steps
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Engagement Framework
                </h2>
              </div>

              {/* Steps */}
              <div className="space-y-0 border border-neutral-100 divide-y divide-neutral-100">
                {[
                  {
                    step: "01",
                    title: "Confirm Scope",
                    description: "Review this proposal and confirm the selected scope via email or a brief call.",
                  },
                  {
                    step: "02",
                    title: "Agreement & Mobilization",
                    description: "We formalize the engagement with a simple agreement and process the 50% commencement fee.",
                  },
                  {
                    step: "03",
                    title: "Build & Review",
                    description: "Development begins immediately. You receive regular progress updates and review checkpoints.",
                  },
                  {
                    step: "04",
                    title: "Launch & Support",
                    description: "Final review, deployment to production, and post-launch support period begins.",
                  },
                ].map((s, idx) => (
                  <div key={idx} className="flex items-start gap-6 p-5">
                    <span className="text-[11px] font-semibold text-[#2563EB] mt-0.5 shrink-0 tabular-nums">{s.step}</span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-neutral-900">{s.title}</p>
                      <p className="text-xs text-neutral-500 leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Signature Blocks */}
              <div className="grid grid-cols-2 gap-16 pt-4">
                <div className="space-y-6">
                  <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-neutral-400">For GrowXLabsTech</p>
                  <div className="border-b border-neutral-300 pb-8" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-neutral-900">Pujala Sai Varshith</p>
                    <p className="text-[11px] text-neutral-500">Founder &amp; Digital Strategist</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-neutral-400">
                    For {proposal.business_name || "Client"}
                  </p>
                  <div className="border-b border-neutral-300 pb-8" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-neutral-900">Authorized Representative</p>
                    <p className="text-[11px] text-neutral-500">Signature &amp; Date</p>
                  </div>
                </div>
              </div>

              {/* Validity */}
              <p className="text-[10px] text-neutral-400 text-center pt-2">
                This proposal is valid until {validDate}. For questions or to proceed, contact us at{" "}
                <a href="mailto:hello@growxlabs.tech" className="text-[#2563EB] hover:underline">hello@growxlabs.tech</a>
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t border-neutral-100 pt-4">
              <span className="text-[9px] font-medium text-neutral-400 tracking-wide">growxlabs.tech · hello@growxlabs.tech</span>
              <span className="text-[9px] font-medium text-neutral-300">Page 5 of 5</span>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
