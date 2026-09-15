"use client";

import React from "react";
import { PageHero } from "@/components/marketing/PageHero";
import { DiscoveryBookingForm } from "@/components/marketing/DiscoveryBookingForm";
import { GrowxArrowRight } from "@/components/icons";

export function ContactContent() {
  return (
    <div className="flex flex-col bg-black text-foreground min-h-screen">
      {/* Universal Page Hero matching all remaining pages */}
      <PageHero
        title="Contact"
        viewingText="CONTACT"
        exploreText="DISCOVERY"
        tagline="GLOBAL ENGAGEMENTS"
      />

      {/* Main Content Area */}
      <div className="w-full bg-black pb-32 pt-12 border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 space-y-20">
          
          {/* Interactive "Book a Discovery Call" Flow (Exact 360Labs Reference Pattern) */}
          <section className="py-8">
            <DiscoveryBookingForm />
          </section>

          {/* Alternative Direct Channels Section (Email & WhatsApp) */}
          <section className="pt-16 border-t border-neutral-800/80">
            <div className="mb-8">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
                Direct Channels
              </span>
              <h3 className="font-sans text-2xl sm:text-3xl text-white font-light tracking-tight mt-2">
                Prefer direct communication?
              </h3>
            </div>

            <div className="border-t border-neutral-800">
              {/* Row 1: Email */}
              <a
                href="mailto:sai@growxlabs.tech"
                className="group grid grid-cols-12 items-center py-7 border-b border-neutral-800 hover:bg-white/[0.02] transition-colors duration-300 px-2"
              >
                <div className="col-span-12 sm:col-span-3 mb-1 sm:mb-0 text-[11px] font-mono tracking-[0.25em] text-neutral-500 uppercase select-none">
                  01 / EMAIL
                </div>
                <div className="col-span-10 sm:col-span-8 flex items-center">
                  <span className="text-lg sm:text-2xl font-mono text-neutral-300 group-hover:text-white transition-colors">
                    sai@growxlabs.tech
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1 flex justify-end select-none opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                  <GrowxArrowRight size={18} className="text-white" />
                </div>
              </a>

              {/* Row 2: WhatsApp */}
              <a
                href="https://wa.me/918790907144"
                target="_blank"
                rel="noopener noreferrer"
                className="group grid grid-cols-12 items-center py-7 border-b border-neutral-800 hover:bg-white/[0.02] transition-colors duration-300 px-2"
              >
                <div className="col-span-12 sm:col-span-3 mb-1 sm:mb-0 text-[11px] font-mono tracking-[0.25em] text-neutral-500 uppercase select-none">
                  02 / WHATSAPP
                </div>
                <div className="col-span-10 sm:col-span-8 flex items-center gap-3">
                  <span className="text-lg sm:text-2xl font-mono text-neutral-300 group-hover:text-white transition-colors">
                    +91 87909 07144
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-950/40">
                    LIVE
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1 flex justify-end select-none opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                  <GrowxArrowRight size={18} className="text-white" />
                </div>
              </a>
            </div>
          </section>

          {/* Bottom Meta Bar (360Labs Reference Style) */}
          <div className="flex justify-between items-center text-[11px] font-mono tracking-[0.2em] text-neutral-500 uppercase select-none pt-8 border-t border-neutral-900">
            <span>{"// END OF CONTACT"}</span>
            <span>DISCOVERY SCHEDULER ACTIVE</span>
          </div>

        </div>
      </div>
    </div>
  );
}
