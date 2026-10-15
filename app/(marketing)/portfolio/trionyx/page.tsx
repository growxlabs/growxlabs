import { TrionyxArchitecture } from "@/components/marketing/TrionyxArchitecture";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GrowxArrowRight } from "@/components/icons";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { PageHero } from "@/components/marketing/PageHero";
import { AIReadActions } from "@/components/marketing/AIReadActions";

export const metadata = {
  title: "Trionyx — Digital Platform Case Study | GrowXLabs",
  description: "A digital platform built around Trionyx's products, customer experience and day-to-day operations.",
  alternates: {
    canonical: "https://growxlabs.tech/portfolio/trionyx",
  },
};

export default function TrionyxCaseStudyPage() {
  return (
    <div className="w-full bg-black text-foreground min-h-screen">
      {/* ═══ PAGE HERO (Full Viewport Swiss Architectural Cover) ═══ */}
      <PageHero
        title="Trionyx"
        viewingText="TRIONYX"
        exploreText="CASE STUDY"
        tagline="CLIENT PLATFORM"
      />

      {/* Top Breadcrumb & Back Link */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-8 pb-4 border-t border-neutral-800/80">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-muted-foreground hover:text-white uppercase transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>PORTFOLIO / TRIONYX</span>
        </Link>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 md:px-12 pb-32 space-y-28 md:space-y-36">

        {/* ══════════════════════════════════════════════════════════════════
            01 — HERO METADATA & PREVIEW
        ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-10 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
            <div className="md:col-span-4">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#C0F0FB] block">
                // CASE STUDY
              </span>
            </div>
            <div className="md:col-span-8">
              <p className="text-xl sm:text-2xl text-muted-foreground font-light leading-relaxed">
                A digital platform built around Trionyx's products, customer experience and day-to-day operations.
              </p>
            </div>
          </div>

          {/* Clean Metadata Strip */}
          <div className="flex flex-wrap items-center gap-x-12 gap-y-4 py-6 border-y border-neutral-800 text-xs font-mono uppercase tracking-wider">
            <div>
              <span className="text-muted-foreground/60 mr-2">Project:</span>
              <span className="font-bold text-foreground">Web Platform</span>
            </div>
            <div>
              <span className="text-muted-foreground/60 mr-2">Status:</span>
              <span className="font-bold text-[#C0F0FB]">Live</span>
            </div>
            <div>
              <span className="text-muted-foreground/60 mr-2">Client:</span>
              <span className="font-bold text-foreground">Trionyx</span>
            </div>
          </div>

          {/* Large Hero Operations Interface Showcase */}
          <div className="w-full overflow-hidden rounded-xl border border-neutral-800/90 shadow-2xl bg-[#0A0A0C]">
            <Image
              src="/portfolio/trionyx-operations.png"
              alt="Trionyx Central Operations & Inventory Telemetry Platform"
              width={1920}
              height={1080}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
          <div className="font-mono text-[11px] text-muted-foreground flex justify-between px-1">
            <span>OPERATIONS SUMMARY · LIVE TELEMETRY</span>
            <span>DOMAIN BALANCES &amp; INVENTORY CONTROL</span>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            02 — OVERVIEW (2-Column Editorial Layout)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5 space-y-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#C0F0FB] block">
                // 01 OVERVIEW
              </span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-[42px] text-foreground tracking-tight leading-[1.12]">
                What Trionyx needed and what we built.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-6 text-muted-foreground text-base sm:text-lg leading-relaxed font-normal">
              <p>
                Trionyx manufactures specialized industrial products that require accurate technical communication. Prior to this build, prospective clients had to rely on fragmented product brochures and static PDF catalogs that were difficult to maintain and search.
              </p>
              <p>
                GrowXLabs engineered a dedicated digital platform centered around their physical catalog. The system combines clear product categorization, technical specifications, direct inquiry pipelines, and an internal administrative surface to keep catalog data and inquiries synchronized.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            03 — SPECIFICATIONS (Clean Horizontal Row)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-y border-neutral-800 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-neutral-800/80">
            <div className="space-y-1.5 md:pr-6">
              <span className="font-mono text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest block">
                APPLICATION
              </span>
              <p className="text-base font-bold text-foreground">Digital Web Platform</p>
            </div>
            <div className="space-y-1.5 pt-6 md:pt-0 md:px-6">
              <span className="font-mono text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest block">
                DELIVERY
              </span>
              <p className="text-base font-bold text-foreground">Custom Build</p>
            </div>
            <div className="space-y-1.5 pt-6 md:pt-0 md:px-6">
              <span className="font-mono text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest block">
                DEVICES
              </span>
              <p className="text-base font-bold text-foreground">Desktop · Tablet · Mobile</p>
            </div>
            <div className="space-y-1.5 pt-6 md:pt-0 md:pl-6">
              <span className="font-mono text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest block">
                STATUS
              </span>
              <p className="text-base font-bold text-[#C0F0FB]">Live</p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            03 — ARCHITECTURE (Platform & Operations Architecture)
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="architecture-title" className="border-t border-neutral-800 pt-16 space-y-8">
          <h2 id="architecture-title" className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
            Trionyx Architecture
          </h2>
          <TrionyxArchitecture />
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            EXPLORE WITH AI (Secondary Publishing Utility)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="pt-4">
          <AIReadActions
            type="project"
            title="Trionyx"
            url="/portfolio/trionyx"
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            04 — CLOSING (360Labs Reference Style)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="pt-16 pb-12 space-y-20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div>
              <h2 className="font-sans font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.05]">
                Interested<br />in Trionyx?
              </h2>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-5">
              <p className="text-neutral-400 text-sm sm:text-base font-sans">
                Let&apos;s discuss how this can work for you.
              </p>
              <LiquidButton
                href="/contact"
                variant="white"
                size="lg"
                icon={<GrowxArrowRight size={15} className="transition-transform group-hover:translate-x-1" />}
                iconPosition="right"
              >
                Get in Touch
              </LiquidButton>
            </div>
          </div>

          {/* Bottom Meta Bar (360labs reference) */}
          <div className="flex justify-between items-center text-[11px] font-mono tracking-[0.2em] text-neutral-500 uppercase select-none pt-8">
            <span>// END OF CASE STUDY</span>
            <span>TRIONYX</span>
          </div>
        </section>

      </main>
    </div>
  );
}
