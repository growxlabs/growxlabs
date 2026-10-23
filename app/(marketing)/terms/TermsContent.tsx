"use client";

import React from "react";

export function TermsContent() {
  const promises = [
    { title: "Transparent Scoping", desc: "Every project begins with a crystal-clear deliverable architecture." },
    { title: "IP Sovereignty", desc: "You own 100% of your bespoke intellectual property upon full payment." },
    { title: "Structured Delivery", desc: "Sprint-based checkpoints with verifiable test coverage before signoff." }
  ];

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing, contracting, or deploying software engineered by GrowxLabs Tech Private Limited, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, you must not use our software or engineering services."
    },
    {
      title: "2. Engineering Services & Scoping",
      content: "GrowxLabs provides digital product engineering, AI agent architectures, web platforms, and automated workflow solutions. All custom builds are governed by specific project statements of work (SOWs) that define scope, timelines, deliverables, and payment milestones."
    },
    {
      title: "3. Intellectual Property Rights",
      content: "Upon receipt of full payment for agreed milestones, all bespoke software code, database models, and documentation created specifically for your project become your exclusive intellectual property. GrowxLabs retains ownership of its pre-existing core libraries, scaffolding, and developer harnesses."
    },
    {
      title: "4. Confidentiality & Non-Disclosure",
      content: "Both parties agree to treat all non-public technical specifications, source code, business logic, customer data, and commercial arrangements as strictly confidential, exercising reasonable industry care to prevent unauthorized dissemination."
    },
    {
      title: "5. Limitation of Liability",
      content: "To the maximum extent permitted by applicable law, GrowxLabs Tech shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of profits or revenues, whether incurred directly or indirectly."
    },
    {
      title: "6. Prohibited Activities",
      content: "We strictly prohibit the hosting, development, or deployment of our custom systems for scams, phishing, automated spamming, adult content, or malicious code distribution. Violation of this clause will lead to immediate service suspension without refund."
    },
    {
      title: "7. Jurisdiction & Dispute Resolution",
      content: "These operational terms are governed by and construed in accordance with the laws of India. Any disputes arising from these covenants will be handled exclusively under the jurisdiction of the courts of Guntur, Andhra Pradesh, India."
    }
  ];

  return (
    <div className="pt-28 pb-24 px-6 md:px-10 xl:px-16 2xl:px-24 w-full bg-[#A2BECC] text-[#17252D]">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Sticky Brand Panel (on Desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-between lg:sticky lg:top-32 lg:h-[calc(100vh-200px)]">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#55788D] mb-4 block">
                // OPERATING STANDARDS
              </span>
              <h1 className="text-[clamp(36px,5vw,64px)] font-sans font-black text-[#17252D] tracking-tighter mb-6 uppercase leading-none">
                Terms of Service
              </h1>
              <p className="text-base sm:text-lg text-[#55788D] font-sans leading-relaxed mb-12 max-w-md font-medium">
                Legal framework and structural guidelines governing the engineering, delivery, and support standards of GrowxLabs Tech.
              </p>

              {/* Core Promises List */}
              <div className="border-t border-[#D5E2E9] pt-8 mt-8 space-y-6">
                <h3 className="font-mono text-xs text-[#55788D] uppercase tracking-wider font-bold">Our Operating Guidelines</h3>
                {promises.map((p, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <h4 className="font-sans font-bold text-sm text-[#17252D]">{p.title}</h4>
                    <p className="text-xs text-[#55788D] leading-relaxed max-w-sm">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky Panel Footer */}
            <div className="mt-12 lg:mt-0 font-mono text-[10px] text-[#55788D] uppercase tracking-widest font-bold">
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
                  className="border-t border-[#D5E2E9] last:border-b py-10 transition-all duration-300"
                >
                  <h2 className="text-lg sm:text-xl font-sans font-bold text-[#17252D] tracking-tight mb-4">
                    {section.title}
                  </h2>
                  <p className="text-[#17252D]/85 font-sans text-sm sm:text-base leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="border-t border-[#D5E2E9] pt-12 mt-16 text-left">
              <p className="font-mono text-xs text-[#55788D] uppercase tracking-widest mb-3 font-bold">Have a legal inquiry?</p>
              <a href="mailto:svp@growxlabs.tech" className="text-2xl font-sans font-bold text-[#17252D] hover:text-[#55788D] transition-colors duration-300">
                svp@growxlabs.tech
              </a>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
