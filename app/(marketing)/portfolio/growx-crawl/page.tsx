import { ArrowLeft } from "lucide-react";
import { GrowxArrowRight } from "@/components/icons";
import Image from "next/image";
import { Link } from "@/navigation";
import { PageHero } from "@/components/marketing/PageHero";
import { AIReadActions } from "@/components/marketing/AIReadActions";

export const metadata = {
  title: "GrowX Crawl — Web Research & Discovery Platform | GrowXLabs",
  description: "A web research tool built inside GrowxLabs to discover companies, crawl websites, extract useful information and keep the evidence behind every finding.",
};

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
          <div className="space-y-4 max-w-4xl">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
              // INTERNAL R&D
            </span>
            <p className="text-muted-foreground text-lg sm:text-xl md:text-2xl leading-relaxed font-normal max-w-3xl">
              A web research tool built inside GrowxLabs to discover companies, crawl websites, extract useful information and keep the evidence behind every finding.
            </p>
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

          {/* Large Hero Terminal / Research Interface Showcase */}
          <div className="w-full overflow-hidden rounded-xl border border-neutral-800/90 shadow-2xl bg-[#0A0A0C]">
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
            02 — OVERVIEW (2-Column Editorial Layout)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5 space-y-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
                // 01 OVERVIEW
              </span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-[42px] text-foreground tracking-tight leading-[1.12]">
                Researching the web from one place.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-6 text-muted-foreground text-base sm:text-lg leading-relaxed font-normal">
              <p>
                GrowX Crawl is a web research platform built by GrowxLabs. Give it a URL, a list of websites, or a research topic — and it will discover pages, extract structured information, score search visibility, capture screenshots, and deliver clean reports. Everything runs locally on your machine with no cloud dependency.
              </p>
              <p>
                It handles both simple and complex websites automatically. For pages that need full browser rendering, GrowX Crawl switches seamlessly without any extra setup. The platform includes a web dashboard for running research tasks, reviewing results, and exporting data in multiple formats.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            02 — WHAT IT DOES
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16 space-y-8">
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
              // 02 CAPABILITIES
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              What It Does
            </h2>
          </div>

          <div className="border border-neutral-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left divide-y divide-neutral-800">
              <thead className="bg-[#111114]">
                <tr>
                  <th className="px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-500">Capability</th>
                  <th className="px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-500 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-[#0A0A0D] text-sm">
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Single Website Crawl</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">Up to 100+ pages per site</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Batch Research</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">100+ websites in one run</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Page Discovery</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">Sitemaps, internal links, robots.txt</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Content Extraction</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">Company info, contacts, key data</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Dynamic Websites</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">Full browser rendering when needed</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">SEO Score</td>
                  <td className="px-6 py-4 text-primary font-bold text-right">0 – 100</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">AEO Score</td>
                  <td className="px-6 py-4 text-primary font-bold text-right">0 – 100</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">GEO Score</td>
                  <td className="px-6 py-4 text-primary font-bold text-right">0 – 100</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Screenshots</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">Full-page captures of every site</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">PDF Export</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">Save any page as a PDF</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Reports</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">JSON, CSV, Excel, PDF</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Web Dashboard</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">Visual interface for all tasks</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Runs On</td>
                  <td className="px-6 py-4 text-primary font-bold text-right">Your machine — no cloud needed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>



        {/* ══════════════════════════════════════════════════════════════════
        {/* ══════════════════════════════════════════════════════════════════

            03 — PLATFORM ARCHITECTURE

        ══════════════════════════════════════════════════════════════════ */}

        <section className="border-t border-neutral-800 pt-16 space-y-10">

          <div className="space-y-3">

            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">

              // 03 ARCHITECTURE

            </span>

            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">

              Platform Architecture

            </h2>

            <p className="text-muted-foreground text-base max-w-3xl leading-relaxed">

              How GrowX Crawl moves from a research goal to verified, structured intelligence.

            </p>

          </div>



          {/* Clean SVG Architecture */}

          <div className="w-full overflow-x-auto py-8 px-2 border-y border-neutral-800/80 bg-[#060608] rounded-xl">

            <div className="min-w-[900px] max-w-[1200px] mx-auto">

              <svg viewBox="0 0 1100 380" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">



                {/* Zone Headers */}

                <g className="font-mono text-[10px] font-bold tracking-[0.2em] fill-[#C0F0FB] uppercase">

                  <text x="80" y="22">INPUT</text>

                  <text x="330" y="22">CRAWL</text>

                  <text x="600" y="22">PROCESS</text>

                  <text x="900" y="22">OUTPUT</text>

                </g>



                {/* Zone Dividers */}

                <line x1="250" y1="8" x2="250" y2="310" stroke="#1E1E26" strokeWidth="1" strokeDasharray="4 4" />

                <line x1="510" y1="8" x2="510" y2="310" stroke="#1E1E26" strokeWidth="1" strokeDasharray="4 4" />

                <line x1="790" y1="8" x2="790" y2="310" stroke="#1E1E26" strokeWidth="1" strokeDasharray="4 4" />



                {/* ─── CONNECTORS ─── */}

                {/* Input -> Crawl */}

                <line x1="210" y1="85" x2="280" y2="85" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.5" />

                <polygon points="280,85 273,81 273,89" fill="#C0F0FB" fillOpacity="0.6" />



                <line x1="210" y1="170" x2="280" y2="170" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.5" />

                <polygon points="280,170 273,166 273,174" fill="#C0F0FB" fillOpacity="0.6" />



                {/* Crawl internal */}

                <line x1="470" y1="115" x2="470" y2="155" stroke="#3A3A48" strokeWidth="1" strokeOpacity="0.5" />



                {/* Crawl -> Process */}

                <line x1="470" y1="85" x2="540" y2="130" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.5" />

                <polygon points="540,130 532,128 535,121" fill="#C0F0FB" fillOpacity="0.6" />



                <line x1="470" y1="170" x2="540" y2="140" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.5" />



                {/* Process -> sub-outputs */}

                <path d="M 700 120 C 730 120, 740 80, 810 80" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />

                <polygon points="810,80 803,76 803,84" fill="#C0F0FB" fillOpacity="0.6" />



                <line x1="700" y1="140" x2="810" y2="140" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.5" />

                <polygon points="810,140 803,136 803,144" fill="#C0F0FB" fillOpacity="0.6" />



                <path d="M 700 160 C 730 160, 740 200, 810 200" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />

                <polygon points="810,200 803,196 803,204" fill="#C0F0FB" fillOpacity="0.6" />



                <path d="M 700 170 C 730 170, 740 260, 810 260" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />

                <polygon points="810,260 803,256 803,264" fill="#C0F0FB" fillOpacity="0.6" />



                {/* ─── ZONE 1: INPUT ─── */}

                <g>

                  <rect x="30" y="55" width="180" height="58" rx="8" fill="#111116" stroke="#28282F" strokeWidth="1" />

                  <text x="120" y="80" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="12" fontWeight="bold">Research Goal</text>

                  <text x="120" y="96" textAnchor="middle" fill="#71717A" fontFamily="monospace" fontSize="8.5">URL, Topic, or Seed List</text>



                  <rect x="30" y="140" width="180" height="58" rx="8" fill="#111116" stroke="#28282F" strokeWidth="1" />

                  <text x="120" y="165" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="12" fontWeight="bold">Batch Queue</text>

                  <text x="120" y="181" textAnchor="middle" fill="#71717A" fontFamily="monospace" fontSize="8.5">CSV / Sitemap / 100+ URLs</text>

                </g>



                {/* ─── ZONE 2: CRAWL ─── */}

                <g>

                  <rect x="280" y="55" width="190" height="58" rx="8" fill="#111116" stroke="#28282F" strokeWidth="1" />

                  <text x="375" y="80" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="12" fontWeight="bold">Discovery Engine</text>

                  <text x="375" y="96" textAnchor="middle" fill="#71717A" fontFamily="monospace" fontSize="8.5">Sitemaps · Links · Robots</text>



                  <rect x="280" y="140" width="190" height="58" rx="8" fill="#12161E" stroke="#C0F0FB" strokeWidth="1" strokeOpacity="0.3" />

                  <text x="375" y="165" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="12" fontWeight="bold">Smart Crawl Engine</text>

                  <text x="375" y="181" textAnchor="middle" fill="#C0F0FB" fontFamily="monospace" fontSize="8.5">Fast HTTP + Browser Rendering</text>



                  <rect x="280" y="230" width="190" height="48" rx="8" fill="#111116" stroke="#28282F" strokeWidth="1" />

                  <text x="375" y="253" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">Access Resilience</text>

                  <text x="375" y="267" textAnchor="middle" fill="#71717A" fontFamily="monospace" fontSize="8.5">Bot Detection Handling</text>

                </g>



                {/* ─── ZONE 3: PROCESS ─── */}

                <g>

                  <rect x="540" y="95" width="160" height="85" rx="8" fill="#12161E" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.4" />

                  <text x="620" y="125" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="13" fontWeight="bold">Page Analysis</text>

                  <text x="620" y="143" textAnchor="middle" fill="#C0F0FB" fontFamily="monospace" fontSize="8.5">Content Extraction</text>

                  <text x="620" y="157" textAnchor="middle" fill="#C0F0FB" fontFamily="monospace" fontSize="8.5">Schema Structuring</text>

                  <text x="620" y="171" textAnchor="middle" fill="#C0F0FB" fontFamily="monospace" fontSize="8.5">Visibility Scoring</text>

                </g>



                {/* ─── ZONE 4: OUTPUT ─── */}

                <g>

                  <rect x="810" y="55" width="245" height="50" rx="8" fill="#111116" stroke="#28282F" strokeWidth="1" />

                  <text x="932" y="77" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11.5" fontWeight="bold">Structured Research Data</text>

                  <text x="932" y="93" textAnchor="middle" fill="#71717A" fontFamily="monospace" fontSize="8.5">JSON · CSV · PDF Reports</text>



                  <rect x="810" y="118" width="245" height="50" rx="8" fill="#111116" stroke="#28282F" strokeWidth="1" />

                  <text x="932" y="140" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11.5" fontWeight="bold">SEO · AEO · GEO Scores</text>

                  <text x="932" y="156" textAnchor="middle" fill="#71717A" fontFamily="monospace" fontSize="8.5">0–100 Search Visibility Audit</text>



                  <rect x="810" y="180" width="245" height="50" rx="8" fill="#111116" stroke="#28282F" strokeWidth="1" />

                  <text x="932" y="202" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11.5" fontWeight="bold">Screenshots &amp; Media</text>

                  <text x="932" y="218" textAnchor="middle" fill="#71717A" fontFamily="monospace" fontSize="8.5">Full-Page Captures · PDF Snapshots</text>



                  <rect x="810" y="242" width="245" height="50" rx="8" fill="#12161E" stroke="#C0F0FB" strokeWidth="1" strokeOpacity="0.3" />

                  <text x="932" y="264" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11.5" fontWeight="bold">Evidence Archive</text>

                  <text x="932" y="280" textAnchor="middle" fill="#71717A" fontFamily="monospace" fontSize="8.5">Verified Source Records</text>

                </g>



                {/* Bottom Bar */}

                <line x1="30" y1="330" x2="1060" y2="330" stroke="#1E1E26" strokeWidth="1" />

                <text x="545" y="355" textAnchor="middle" fill="#52525B" fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="0.15em">

                  LOCAL-FIRST · RUNS ON YOUR MACHINE · NO CLOUD DEPENDENCY

                </text>

              </svg>

            </div>

          </div>

        </section>





        {/* ══════════════════════════════════════════════════════════════════
            04 — PLATFORM SURFACES (Playground & API Reference)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16 space-y-8">
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
              // 04 PLATFORM SURFACES
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              Interactive Extraction &amp; API Suite
            </h2>
            <p className="text-muted-foreground text-base max-w-3xl leading-relaxed">
              Explore the dedicated Extraction Playground for live testing across 7 scraping capabilities, alongside the complete RESTful API specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-neutral-800/90 shadow-xl bg-[#0A0A0C]">
                <Image
                  src="/portfolio/growx-crawl-playground.png"
                  alt="GrowX Crawl Extraction Playground"
                  width={1920}
                  height={1080}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="font-mono text-[11px] text-muted-foreground flex justify-between px-1">
                <span>EXTRACTION PLAYGROUND</span>
                <span>7 ENGINE CAPABILITIES</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-neutral-800/90 shadow-xl bg-[#0A0A0C]">
                <Image
                  src="/portfolio/growx-crawl-api.png"
                  alt="GrowX Crawl API Reference"
                  width={1920}
                  height={1080}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="font-mono text-[11px] text-muted-foreground flex justify-between px-1">
                <span>RESTFUL API REFERENCE</span>
                <span>CURL &amp; SCHEMA DOCS</span>
              </div>
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
            05 — CLOSING (Minimalist Call to Action)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-20 pb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              Have something you want us to build?
            </h2>
            <p className="text-muted-foreground text-base">
              GrowXLabs designs, architects, and ships custom digital platforms and software systems.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all shadow-md group"
            >
              <span>Contact GrowxLabs</span>
              <GrowxArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
