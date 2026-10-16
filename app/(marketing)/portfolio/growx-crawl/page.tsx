import { ArrowLeft } from "lucide-react";
import { GrowxArrowRight } from "@/components/icons";
import Image from "next/image";
import { Link } from "@/navigation";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { PageHero } from "@/components/marketing/PageHero";
import { AIReadActions } from "@/components/marketing/AIReadActions";
import { GrowXCrawlArchitecture } from "@/components/marketing/GrowXCrawlArchitecture";

export const metadata = {
  title: "GrowX Crawl — Web Research & Discovery Platform | GrowXLabs",
  description: "Production-grade web crawling API for scraping pages, extracting structured data, crawling websites, processing URLs in batches, capturing screenshots, generating PDFs, and auditing SEO.",
};

const CRAWL_SPECIFICATIONS = [
  {
    label: "Capabilities",
    value: "7: scrape, extract, crawl, batch, screenshot, PDF, URL-based SEO audit",
  },
  {
    label: "Fetching",
    value: "3 modes: Fast HTTP, headless browser, stealth",
  },
  {
    label: "Crawl limit",
    value: "Up to 50 pages and five levels deep",
  },
  {
    label: "Batch limit",
    value: "Up to 100 URLs per job; configurable concurrency",
  },
  {
    label: "Job delivery",
    value: "Status polling and optional completion webhook",
  },
  {
    label: "Formats",
    value: "PNG/JPEG screenshots and A4, Letter, or Legal PDFs",
  },
];

const CRAWL_FEATURES = [
  "Fetches standard and JavaScript-heavy pages, switching methods when a page resists extraction",
  "Pulls the exact fields you need with CSS or XPath rules",
  "Follows links through a site, up to 50 pages and five levels",
  "Processes URL lists in batches of up to 100",
  "Creates page screenshots and PDFs, and checks a URL’s SEO",
  "Provides API key access, usage limits, job tracking, webhooks, and scrape caching",
];

export default function GrowXCrawlCaseStudy() {
  return (
    <div className="bg-black text-foreground min-h-screen">
      {/* ═══ PAGE HERO (Full Viewport Swiss Architectural Cover) ═══ */}
      <PageHero
        title="GrowX Crawl"
        viewingText="GROWX CRAWL"
        exploreText="CASE STUDY"
        tagline="INTERNAL R&D"
      />

      {/* Top Breadcrumb & Navigation */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-8 pb-4 border-t border-neutral-800/80">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>PORTFOLIO / GROWX CRAWL</span>
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-24 md:space-y-32">
        
        {/* ══════════════════════════════════════════════════════════════════
            01 — HERO METADATA & PREVIEW
        ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
            <div className="md:col-span-4">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#C0F0FB] block">
                // INTERNAL R&D
              </span>
            </div>
            <div className="md:col-span-8">
              <p className="text-muted-foreground text-lg sm:text-xl md:text-2xl leading-relaxed font-normal">
                Production-grade web crawling API for scraping pages, extracting structured data, crawling websites, processing URLs in batches, capturing screenshots, generating PDFs, and auditing SEO.
              </p>
            </div>
          </div>

          {/* Metadata Parameters Strip */}
          <div className="border-t border-neutral-800 pt-6 flex flex-wrap items-center gap-8 sm:gap-14 font-mono text-xs tracking-wider">
            <div>
              <span className="text-muted-foreground/60 block text-[10px] uppercase">PROJECT</span>
              <span className="text-foreground font-bold uppercase">Web Research</span>
            </div>
            <div>
              <span className="text-muted-foreground/60 block text-[10px] uppercase">BUILT BY</span>
              <span className="text-foreground font-bold uppercase">GrowxLabs</span>
            </div>
            <div>
              <span className="text-muted-foreground/60 block text-[10px] uppercase">RUNTIME</span>
              <span className="text-foreground font-bold uppercase">Local-first</span>
            </div>
          </div>

          {/* Hero Terminal / Research Interface Showcase */}
          <div className="max-w-3xl mr-auto w-full overflow-hidden rounded-xl border border-neutral-800/90 shadow-2xl bg-[#0A0A0C]">
            <Image
              src="/portfolio/growx-crawl.png"
              alt="GrowX Crawl Enterprise Web Intelligence & Research Platform"
              width={1920}
              height={1080}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            01 — OVERVIEW (2-Column Editorial Layout)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
            <div className="md:col-span-4">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#C0F0FB] block">
                // 01 OVERVIEW
              </span>
            </div>
            <div className="md:col-span-8 space-y-6 text-muted-foreground text-base sm:text-lg leading-relaxed font-normal">
              <p>
                One API, seven capabilities. GrowX Crawl scrapes individual pages using fast HTTP, a browser, or stealth fetching when needed, and extracts specific data with CSS or XPath selectors. It can crawl up to 50 pages across five levels or process batches of up to 100 URLs, with job tracking and webhooks for longer runs. It also captures screenshots, generates PDFs, and audits site SEO. Proxy support, robots.txt controls, and response caching are built in.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            02 — SPECIFICATIONS (2-Column Editorial Layout)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
            <div className="md:col-span-4">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#C0F0FB] block">
                // 02 SPECIFICATIONS
              </span>
            </div>
            <div className="md:col-span-8">
              <div className="border-y border-neutral-800 divide-y divide-neutral-800/80">
                <div className="py-3.5 flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <span>Specification</span>
                  <span className="text-right">GrowX Crawl</span>
                </div>
                {CRAWL_SPECIFICATIONS.map((spec) => (
                  <div
                    key={spec.label}
                    className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-6 transition-colors hover:bg-white/[0.02]"
                  >
                    <span className="text-foreground font-semibold text-sm sm:text-base shrink-0 sm:w-36">
                      {spec.label}
                    </span>
                    <span className="text-muted-foreground text-sm sm:text-base sm:text-right font-normal">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            03 — FEATURES (2-Column Editorial Layout)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
            <div className="md:col-span-4">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#C0F0FB] block">
                // 03 FEATURES
              </span>
            </div>
            <div className="md:col-span-8 divide-y divide-neutral-800/80">
              {CRAWL_FEATURES.map((feature, idx) => (
                <div
                  key={idx}
                  className={`text-base sm:text-lg leading-relaxed flex items-start gap-4 ${
                    idx === 0 ? "pb-5 first:pt-0" : idx === CRAWL_FEATURES.length - 1 ? "pt-5" : "py-5"
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-[#C0F0FB] shrink-0 mt-1 select-none w-6">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="text-foreground font-normal">{feature}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            04 — ARCHITECTURE (2-Column Editorial Layout)
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-label="Architecture" className="border-t border-neutral-800 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
            <div className="md:col-span-4">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#C0F0FB] block">
                // 04 ARCHITECTURE
              </span>
            </div>
            <div className="md:col-span-8 w-full">
              <GrowXCrawlArchitecture />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            EXPLORE WITH AI (Secondary Publishing Utility)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="pt-4">
          <AIReadActions
            type="project"
            title="GrowX Crawl"
            url="/portfolio/growx-crawl"
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            05 — CLOSING (360Labs Reference Style)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="pt-16 pb-12 space-y-20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div>
              <h2 className="font-sans font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.05]">
                Interested<br />in GrowX Crawl?
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
            <span>GROWX CRAWL</span>
          </div>
        </section>

      </main>
    </div>
  );
}
