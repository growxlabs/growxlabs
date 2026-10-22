"use client";

import React from "react";

export function PrivacyContent() {
  const promises = [
    { title: "Zero Data Selling", desc: "We NEVER monetize your personal details or code specifications." },
    { title: "Enterprise Grade Encryption", desc: "All client databases are encrypted at rest with AES-256." },
    { title: "Direct Ownership", desc: "You retain full rights to request complete data erasure anytime." }
  ];

  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information necessary to deliver, optimize, and support our digital engineering and automation solutions. This includes personal contact details (name, email address, phone number), billing records, technical system specifications, API parameters, and telemetry data (IP addresses, browser client details, and navigation metrics)."
    },
    {
      title: "2. Processing & Usage Purpose",
      content: "Your data is strictly utilized to engineer, host, and secure your business systems. We process this information to manage client accounts, execute secure financial transactions, analyze system stability, and maintain the integrity of automated workflows. We do not use your proprietary business workflows for general model training."
    },
    {
      title: "3. No-Share Commitment",
      content: "GrowX Labs Tech operates under a strict privacy-first architecture. We do not sell, trade, or distribute your personal details, codebases, database schematics, or email logs to any third-party marketing firms or data brokers."
    },
    {
      title: "4. Infrastructure & Security Frameworks",
      content: "All client data is housed in high-security, SOC2-compliant cloud nodes (utilizing Supabase and AWS). Databases are protected with row-level security (RLS) policies, secure SSL/TLS 1.3 transits, and regular vulnerability audits."
    },
    {
      title: "5. Third-Party API Transits",
      content: "When deploying custom AI orchestration engines (e.g. interfacing with Anthropic, OpenAI, or Google Cloud APIs), your data is routed through secure, encrypted endpoints. We configurationally enforce zero-data retention (ZDR) APIs where available to prevent third-party training on your data."
    },
    {
      title: "6. Your Legal Rights & Choices",
      content: "Depending on your jurisdiction (including GDPR, CCPA, and Indian IT Amendment Act frameworks), you have the right to request comprehensive reports of stored data, seek immediate rectification of errors, or demand complete, permanent erasure of all associated database entries."
    }
  ];

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 xl:px-16 2xl:px-24 w-full bg-black">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Sticky Brand Panel (on Desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-between lg:sticky lg:top-32 lg:h-[calc(100vh-200px)]">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#C0F0FB] mb-4 block">
                // COMPLIANCE & TRUST
              </span>
              <h1 className="text-[clamp(36px,5vw,64px)] font-sans font-black text-white tracking-tighter mb-6 uppercase leading-none">
                Privacy Policy
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 font-sans leading-relaxed mb-12 max-w-md">
                How we protect your digital identity, database integrity, and proprietary project intelligence within the GrowX Labs Tech ecosystem.
              </p>

              {/* Core Promises List */}
              <div className="border-t border-white/10 pt-8 mt-8 space-y-6">
                <h3 className="font-mono text-xs text-white/40 uppercase tracking-wider">Our Core Commitments</h3>
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

          {/* Right Column: Detailed Sections & Retention Table */}
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

            {/* Retention Table Section */}
            <div className="border-t border-white/10 pt-12 mt-16">
              <h3 className="text-lg font-sans font-bold text-white tracking-tight mb-6 uppercase">
                Data Retention Schedule
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-zinc-400 font-sans text-sm">Project Code & Architecture Details</span>
                  <span className="text-white font-mono text-xs font-bold bg-white/5 px-2.5 py-1 rounded">3 Years</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-zinc-400 font-sans text-sm">Enquiry Correspondence & Metadata</span>
                  <span className="text-white font-mono text-xs font-bold bg-white/5 px-2.5 py-1 rounded">1 Year</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-zinc-400 font-sans text-sm">Financial Audits & Payment Logs</span>
                  <span className="text-white font-mono text-xs font-bold bg-white/5 px-2.5 py-1 rounded">7 Years</span>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="border-t border-white/10 pt-12 mt-16 text-left">
              <p className="text-mono text-xs text-white/40 uppercase tracking-widest mb-3">Questions regarding your data?</p>
              <a href="mailto:svp@growxlabs.tech" className="text-2xl font-sans font-black text-[#C0F0FB] hover:text-white transition-colors duration-300">
                svp@growxlabs.tech
              </a>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

