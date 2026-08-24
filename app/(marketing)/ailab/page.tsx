"use client";

import React from "react";
import { PageHero } from "@/components/marketing/PageHero";

export default function AiLabPage() {
  return (
    <>
      <PageHero
        title="AI Lab"
        viewingText="AI LAB"
        exploreText="R&D"
        tagline="OWN LAB SYSTEMS"
      />

      <div className="w-full bg-background px-4 sm:px-6 md:px-8 xl:px-12 pb-24 border-t border-border/20 pt-16">
        <div className="max-w-[1780px] mx-auto text-center py-20">
          <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-primary mb-3 block font-mono">
            R&D // AI LAB
          </span>
          <h2 className="text-[clamp(1.65rem,4vw,2.75rem)] font-black text-foreground tracking-tight mb-4 leading-[1.12]">
            GrowXLabs AI Lab
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto font-sans">
            Proprietary AI research, experimental harnesses, and lab systems engineered by GrowXLabs.
          </p>
        </div>
      </div>
    </>
  );
}
