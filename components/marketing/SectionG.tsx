"use client";

import { AnimatedSection } from "@/components/marketing/AnimatedSection";

export function SectionG() {
  return (
    <section className="w-full relative px-6 md:px-10 xl:px-16 2xl:px-24 min-h-dvh border-b border-border bg-background flex flex-col justify-center pt-20 sm:pt-28 pb-8 flex-none">
      <AnimatedSection className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full relative flex items-center justify-center min-h-[300px]">
        {/* Left Vertical Indicators */}
        <div className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 font-mono text-xs text-muted-foreground select-none">
          <span className="text-foreground font-bold">[G]</span>
          <span>R</span>
          <span>O</span>
          <span>W</span>
          <span>X</span>
        </div>

        {/* Centered Statement */}
        <div className="max-w-4xl text-center px-8">
          <h2 className="text-[clamp(1.6rem,3.2vw,2.5rem)] font-medium text-foreground tracking-tight leading-[1.35] font-sans">
            India's AI-native software Company,<br />
            product studio and AI Engineering Lab
          </h2>
        </div>

      </AnimatedSection>

      {/* Horizontal Indicators (Bottom Footer) */}
      <div className="absolute bottom-8 left-6 right-6 md:left-10 md:right-10 xl:left-16 xl:right-16 2xl:left-24 2xl:right-24 flex items-center justify-between font-mono text-[9px] sm:text-[10px] tracking-[0.22em] text-muted-foreground uppercase select-none">
        <span>SOFTWARE STUDIO</span>
        <span className="text-foreground font-bold">{`{ GROWXLABS }`}</span>
        <span>AI LAB</span>
      </div>
    </section>
  );
}
