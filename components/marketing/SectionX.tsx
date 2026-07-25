"use client";

import { AnimatedSection } from "@/components/marketing/AnimatedSection";
import { Link } from "@/navigation";

export function SectionX() {
  return (
    <section className="w-full relative px-6 md:px-10 xl:px-16 2xl:px-24 min-h-dvh border-b border-border bg-background flex flex-col justify-center pt-20 sm:pt-28 pb-8 flex-none">
      <AnimatedSection className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full relative flex items-center justify-center min-h-[300px]">
        {/* Left Vertical Indicators */}
        <div className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 font-mono text-xs text-muted-foreground select-none">
          <span>G</span>
          <span>R</span>
          <span>O</span>
          <span>W</span>
          <span className="text-foreground font-bold">[X]</span>
        </div>

        {/* Centered Statement + CTA */}
        <div className="max-w-4xl text-center px-8 flex flex-col items-center gap-8">
          <h2 className="text-[clamp(1.6rem,3.2vw,2.5rem)] font-medium text-foreground tracking-tight leading-[1.35] font-sans">
            We help legacy enterprises become AI-native.
          </h2>
        </div>

        {/* Right Vertical Indicators */}
        <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-4 font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase select-none items-end leading-relaxed">
          <span>GET IN TOUCH</span>
        </div>
      </AnimatedSection>

      {/* Mobile Horizontal Indicators (Bottom Footer) */}
      <div className="flex sm:hidden absolute bottom-8 left-6 right-6 items-center justify-between font-mono text-[9px] tracking-[0.18em] text-muted-foreground uppercase select-none">
        <span>GET IN TOUCH</span>
        <span className="flex gap-2">
          <span>G</span>
          <span>R</span>
          <span>O</span>
          <span>W</span>
          <span className="text-foreground font-bold">[X]</span>
        </span>
      </div>
    </section>
  );
}
