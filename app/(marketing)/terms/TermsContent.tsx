"use client";

import React from "react";

export function TermsContent() {
  const promises = [
    { title: "2 revision rounds", desc: "Each project phase includes two complimentary rounds of feedback." },
    { title: "Full IP Transfer", desc: "Ownership of codebase and design assets transfers to you upon final payment." },
    { title: "Zero Lock-In", desc: "Cancel monthly retainers or support services with a 15-day notice." }
  ];

  const sections = [
    {
      title: "1. Introduction & Acceptance",
      content: "By accessing and utilizing the services of GrowxLabs Tech, you agree to be bound by these operational Terms and Conditions. Our development environment is tailored for companies seeking software engineering, API orchestration, and production workflow capabilities."
    },
    {
      title: "2. Scope of Services",
      content: "GrowxLabs Tech delivers specialized engineering capabilities including: Next.js and React web architectures, custom backend automation runtimes (n8n, Node.js), cloud node configurations (AWS, Vercel), strategic AI agent modeling, and Technical SEO search integration."
    },
    {
      title: "3. Project Kickoff & Payments",
      content: "A 50% advance deposit is required to initiate any fixed-scope project cycle. Engineering tasks and timeline commitments commence immediately upon the successful capture of the initial deposit and receipt of all technical credentials or scope specifications."
    },
    {
      title: "4. Feedback & Revision cycles",
      content: "Every build phase includes 2 formal rounds of edits based on client review. Any revisions, scope modifications, or structural changes requested beyond these rounds will be billed at our standard developer hourly rates."
    },
    {
      title: "5. Intellectual Property Transfer",
      content: "Complete legal ownership, licensing rights, and codebase repositories are fully transferred to the client upon receipt of the final project balance. GrowxLabs Tech retains the right to display design wireframes and platform achievements in public case studies unless restricted by a prior NDA."
    },
    {
      title: "6. Prohibited Operational Uses",
      content: "We strictly prohibit the hosting, development, or deployment of our custom systems for scams, phishing, automated spamming, adult content, or malicious code distribution. Violation of this clause will lead to immediate service suspension without refund."
    },
    {
      title: "7. Jurisdiction & Dispute Resolution",
      content: "These operational terms are governed by and construed in accordance with the laws of India. Any disputes arising from these covenants will be handled exclusively under the jurisdiction of the courts of Guntur, Andhra Pradesh, India."
    }
  ];

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 xl:px-16 2xl:px-24 w-full bg-[#0d0d0e]">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Sticky Brand Panel (on Desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-between lg:sticky lg:top-32 lg:h-[calc(100vh-200px)]">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#C0F0FB] mb-4 block">
                // OPERATING STANDARDS
              </span>
              <h1 className="text-[clamp(36px,5vw,64px)] font-sans font-black text-white tracking-tighter mb-6 uppercase leading-none">
                Terms of Service
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 font-sans leading-relaxed mb-12 max-w-md">
                Legal framework and structural guidelines governing the engineering, delivery, and support standards of GrowxLabs Tech.
              </p>

              {/* Core Promises List */}
              <div className="border-t border-white/10 pt-8 mt-8 space-y-6">
                <h3 className="font-mono text-xs text-white/40 uppercase tracking-wider">Our Operating Guidelines</h3>
                {promises.map((p, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <h4 className="font-sans font-extrabold text-sm text-white">{p.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky Panel Footer */}
            <div className="mt-12 lg:mt-0 font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
              Last Updated: April 2026 • GL-X
            </div>
          </div>

          {/* Right Column: Detailed Sections */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Sections Loop */}
            <div className="space-y-0">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className="border-t border-white/10 last:border-b border-white/10 py-10 transition-all duration-300"
                >
                  <h2 className="text-lg sm:text-xl font-sans font-bold text-white tracking-tight mb-4">
                    {section.title}
                  </h2>
                  <p className="text-zinc-400 font-sans text-sm sm:text-base leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="border-t border-white/10 pt-12 mt-16 text-left">
              <p className="text-mono text-xs text-white/40 uppercase tracking-widest mb-3">Have a legal inquiry?</p>
              <a href="mailto:sai@growxlabs.tech" className="text-2xl font-sans font-black text-[#C0F0FB] hover:text-white transition-colors duration-300">
                sai@growxlabs.tech
              </a>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

