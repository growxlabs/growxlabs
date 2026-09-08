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
                GrowX Crawl is a local-first web crawling, scraping, research and intelligence system built inside GrowxLabs. It supports fast asynchronous HTTP crawling, Playwright/Chromium browser rendering, single-page scraping, 50–100+ page multi-page crawling, configurable crawl depth, 100+ URL batch jobs, CSS/XPath extraction, sitemap and internal-link discovery, caching, proxies, robots handling, screenshots, PDFs, structured company and decision-maker extraction, SEO/AEO/GEO analysis, competitor research, evidence collection, scoring, monitoring and Agent Runtime orchestration.
              </p>
              <p>
                It uses automatic HTTP-to-browser escalation for JavaScript-heavy sites and includes a separate AI Lab access-resilience layer for detecting WAFs, bot protection, Cloudflare challenges, CAPTCHAs and rate limits, with controlled bypass/resilience testing limited to systems GrowxLabs owns or is authorized to test. The complete system can run locally on a laptop through either CLI commands or the Agent Runtime.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            03 — SPECIFICATIONS (Compact Technical Sheet)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16 space-y-8">
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
              // 02 SPECIFICATIONS
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              Engineering Parameters
            </h2>
          </div>

          <div className="border border-neutral-800 rounded-2xl overflow-hidden font-mono text-xs">
            <table className="w-full text-left divide-y divide-neutral-800">
              <thead className="bg-[#181818] text-neutral-400">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">Specification</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80 bg-[#121212]">
                <tr>
                  <td className="px-6 py-3.5 text-neutral-300">Runtime</td>
                  <td className="px-6 py-3.5 text-foreground font-bold text-right">Local-first</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-neutral-300">Control</td>
                  <td className="px-6 py-3.5 text-foreground font-bold text-right">CLI + Agent Runtime</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-neutral-300">Website Crawl</td>
                  <td className="px-6 py-3.5 text-foreground font-bold text-right">50–100+ pages</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-neutral-300">Batch Processing</td>
                  <td className="px-6 py-3.5 text-foreground font-bold text-right">100+ URLs</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-neutral-300">Dynamic Websites</td>
                  <td className="px-6 py-3.5 text-foreground font-bold text-right">Supported</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-neutral-300">Browser Rendering</td>
                  <td className="px-6 py-3.5 text-foreground font-bold text-right">Playwright / Chromium</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-neutral-300">Sitemap Discovery</td>
                  <td className="px-6 py-3.5 text-foreground font-bold text-right">Supported</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-neutral-300">Internal Link Mapping</td>
                  <td className="px-6 py-3.5 text-foreground font-bold text-right">Supported</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-neutral-300">SEO Audit</td>
                  <td className="px-6 py-3.5 text-foreground font-bold text-right">0–100</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-neutral-300">AEO Audit</td>
                  <td className="px-6 py-3.5 text-foreground font-bold text-right">0–100</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-neutral-300">GEO Audit</td>
                  <td className="px-6 py-3.5 text-foreground font-bold text-right">0–100</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-neutral-300">Screenshots</td>
                  <td className="px-6 py-3.5 text-foreground font-bold text-right">Supported</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-neutral-300">PDF Capture</td>
                  <td className="px-6 py-3.5 text-foreground font-bold text-right">Supported</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-neutral-300">Website Monitoring</td>
                  <td className="px-6 py-3.5 text-foreground font-bold text-right">Supported</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-neutral-300">Reports</td>
                  <td className="px-6 py-3.5 text-foreground font-bold text-right">JSON / CSV / XLSX / PDF</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-neutral-300">Local Dashboard</td>
                  <td className="px-6 py-3.5 text-foreground font-bold text-right">Supported</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            03 — PLATFORM ARCHITECTURE (Engineering Blueprint & Pipeline)
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
              End-to-end technical blueprint detailing dual-engine ingestion, stealth browser orchestration, multi-dimensional auditing, cryptographic provenance, and CRM pipeline sync.
            </p>
          </div>

          {/* SVG Blueprint Canvas */}
          <div className="w-full overflow-x-auto py-6 px-2 border-y border-neutral-800/80 bg-[#060608] rounded-xl">
            <div className="min-w-[1100px] max-w-[1340px] mx-auto">
              <svg viewBox="0 0 1280 540" className="w-full h-auto text-foreground" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#C0F0FB" />
                  </marker>
                  <marker id="arrowDim" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#52525B" />
                  </marker>
                  <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#15151A" />
                    <stop offset="100%" stopColor="#0D0D11" />
                  </linearGradient>
                  <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#18232C" />
                    <stop offset="100%" stopColor="#0D151C" />
                  </linearGradient>
                </defs>

                {/* Zone Headers */}
                <g className="font-mono text-[10.5px] font-bold tracking-[0.2em] fill-[#C0F0FB] uppercase">
                  <text x="35" y="24">01 / INGESTION &amp; RUNTIME</text>
                  <text x="320" y="24">02 / CRAWL &amp; RESILIENCE</text>
                  <text x="655" y="24">03 / INTELLIGENCE &amp; AUDITS</text>
                  <text x="990" y="24">04 / EVIDENCE &amp; DELIVERY</text>
                </g>

                {/* Vertical Zone Demarcators */}
                <line x1="295" y1="10" x2="295" y2="445" stroke="#222228" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="630" y1="10" x2="630" y2="445" stroke="#222228" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="965" y1="10" x2="965" y2="445" stroke="#222228" strokeWidth="1" strokeDasharray="3 3" />

                {/* ── FLOW CONNECTORS ── */}
                <path d="M 260 92 L 315 92" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.65" markerEnd="url(#arrow)" fill="none" />
                <path d="M 260 185 C 285 185, 285 195, 315 195" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.65" markerEnd="url(#arrow)" fill="none" />
                <path d="M 260 278 C 285 278, 285 205, 315 205" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.65" markerEnd="url(#arrow)" fill="none" />
                <path d="M 455 120 L 455 135 C 455 145, 415 145, 395 155" stroke="#52525B" strokeWidth="1.2" strokeOpacity="0.6" markerEnd="url(#arrowDim)" fill="none" />
                <path d="M 435 178 C 450 178, 455 168, 470 168" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.65" markerEnd="url(#arrow)" fill="none" />
                <path d="M 435 218 C 450 218, 455 228, 470 228" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.65" markerEnd="url(#arrow)" fill="none" />
                <path d="M 545 250 L 545 270" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.65" strokeDasharray="3 3" fill="none" />
                <path d="M 380 275 C 380 255, 380 245, 380 238" stroke="#52525B" strokeWidth="1.2" strokeOpacity="0.6" markerEnd="url(#arrowDim)" fill="none" />
                <path d="M 610 168 C 630 168, 635 185, 650 185" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.65" markerEnd="url(#arrow)" fill="none" />
                <path d="M 610 228 C 630 228, 635 210, 650 210" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.65" markerEnd="url(#arrow)" fill="none" />
                <path d="M 785 175 C 805 175, 805 92, 820 92" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.65" markerEnd="url(#arrow)" fill="none" />
                <path d="M 785 198 L 820 198" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.65" markerEnd="url(#arrow)" fill="none" />
                <path d="M 785 220 C 805 220, 805 302, 820 302" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.65" markerEnd="url(#arrow)" fill="none" />
                <path d="M 950 92 L 985 92" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.65" markerEnd="url(#arrow)" fill="none" />
                <path d="M 950 198 L 985 198" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.65" markerEnd="url(#arrow)" fill="none" />
                <path d="M 950 302 C 965 302, 970 215, 985 215" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.65" markerEnd="url(#arrow)" fill="none" />
                <path d="M 1105 125 L 1105 155" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.65" markerEnd="url(#arrow)" fill="none" />
                <path d="M 1105 238 L 1105 268" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.65" markerEnd="url(#arrow)" fill="none" />

                {/* ── ZONE 01: INGESTION & RUNTIME ── */}
                <g>
                  <rect x="35" y="65" width="225" height="55" rx="6" fill="url(#cardGrad)" stroke="#26262E" strokeWidth="1" />
                  <rect x="45" y="73" width="70" height="13" rx="2" fill="#1C1C24" />
                  <text x="80" y="82.5" textAnchor="middle" fill="#C0F0FB" fontFamily="monospace" fontSize="7.5" fontWeight="bold" letterSpacing="0.08em">INPUT SPEC</text>
                  <text x="45" y="99" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">Seed URLs &amp; Batch Scope</text>
                  <text x="45" y="111" fill="#888896" fontFamily="monospace" fontSize="8">Sitemaps · CSV seeds · Schema rules</text>

                  <rect x="35" y="157" width="225" height="55" rx="6" fill="url(#activeGrad)" stroke="#C0F0FB" strokeWidth="1" strokeOpacity="0.4" />
                  <rect x="45" y="165" width="82" height="13" rx="2" fill="#142633" />
                  <text x="86" y="174.5" textAnchor="middle" fill="#C0F0FB" fontFamily="monospace" fontSize="7.5" fontWeight="bold" letterSpacing="0.08em">FASTAPI SURFACE</text>
                  <text x="45" y="191" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">Web Control Center (Port 7411)</text>
                  <text x="45" y="203" fill="#888896" fontFamily="monospace" fontSize="8">Live SSE Stream · REST API · Metrics</text>

                  <rect x="35" y="250" width="225" height="55" rx="6" fill="url(#cardGrad)" stroke="#26262E" strokeWidth="1" />
                  <rect x="45" y="258" width="86" height="13" rx="2" fill="#1C1C24" />
                  <text x="88" y="267.5" textAnchor="middle" fill="#A1A1AA" fontFamily="monospace" fontSize="7.5" fontWeight="bold" letterSpacing="0.08em">AGENT RUNTIME</text>
                  <text x="45" y="284" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">Python 3.12 CLI &amp; Daemon</text>
                  <text x="45" y="296" fill="#888896" fontFamily="monospace" fontSize="8">AsyncIO loop · High-concurrency queues</text>
                </g>

                {/* ── ZONE 02: CRAWL & RESILIENCE ── */}
                <g>
                  <rect x="320" y="65" width="275" height="55" rx="6" fill="url(#cardGrad)" stroke="#26262E" strokeWidth="1" />
                  <rect x="330" y="73" width="98" height="13" rx="2" fill="#1C1C24" />
                  <text x="379" y="82.5" textAnchor="middle" fill="#A1A1AA" fontFamily="monospace" fontSize="7.5" fontWeight="bold" letterSpacing="0.08em">FRONTIER DISCOVERY</text>
                  <text x="330" y="99" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">Sitemap &amp; Link Graph Explorer</text>
                  <text x="330" y="111" fill="#888896" fontFamily="monospace" fontSize="8">Recursive BFS · Robots.txt · Canonical audit</text>

                  <rect x="320" y="155" width="115" height="85" rx="6" fill="url(#cardGrad)" stroke="#383844" strokeWidth="1.2" />
                  <rect x="328" y="163" width="82" height="13" rx="2" fill="#202028" />
                  <text x="369" y="172.5" textAnchor="middle" fill="#C0F0FB" fontFamily="monospace" fontSize="7.2" fontWeight="bold" letterSpacing="0.06em">SMART ROUTER</text>
                  <text x="377" y="196" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11.5" fontWeight="bold">Dual-Engine</text>
                  <text x="377" y="210" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11.5" fontWeight="bold">Dispatcher</text>
                  <text x="377" y="226" textAnchor="middle" fill="#888896" fontFamily="monospace" fontSize="7.5">Auto-escalate</text>

                  <rect x="475" y="146" width="135" height="44" rx="5" fill="#101015" stroke="#2B2B34" strokeWidth="1" />
                  <text x="485" y="163" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">Fast HTTP Tier</text>
                  <text x="485" y="176" fill="#C0F0FB" fontFamily="monospace" fontSize="7.5">HTTP/2 · TLS Spoof · ~112ms</text>

                  <rect x="475" y="206" width="135" height="44" rx="5" fill="#101015" stroke="#2B2B34" strokeWidth="1" />
                  <text x="485" y="223" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">Stealth Chromium</text>
                  <text x="485" y="236" fill="#C0F0FB" fontFamily="monospace" fontSize="7.5">Playwright · 64 Sessions</text>

                  <rect x="320" y="275" width="290" height="55" rx="6" fill="url(#cardGrad)" stroke="#30303C" strokeWidth="1" />
                  <rect x="330" y="283" width="94" height="13" rx="2" fill="#202028" />
                  <text x="377" y="292.5" textAnchor="middle" fill="#C0F0FB" fontFamily="monospace" fontSize="7.5" fontWeight="bold" letterSpacing="0.08em">RESILIENCE SHIELD</text>
                  <text x="330" y="309" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">WAF &amp; Anti-Bot Evasion Layer</text>
                  <text x="330" y="321" fill="#888896" fontFamily="monospace" fontSize="8">Cloudflare Turnstile · Fingerprint spoof · Proxies</text>
                </g>

                {/* ── ZONE 03: INTELLIGENCE & AUDITS ── */}
                <g>
                  <rect x="655" y="155" width="130" height="85" rx="6" fill="url(#activeGrad)" stroke="#C0F0FB" strokeWidth="1.2" strokeOpacity="0.5" />
                  <rect x="665" y="163" width="80" height="13" rx="2" fill="#142633" />
                  <text x="705" y="172.5" textAnchor="middle" fill="#C0F0FB" fontFamily="monospace" fontSize="7.2" fontWeight="bold" letterSpacing="0.06em">DOM ENGINE</text>
                  <text x="720" y="196" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11.5" fontWeight="bold">Page Intelligence</text>
                  <text x="720" y="210" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11.5" fontWeight="bold">Core</text>
                  <text x="720" y="226" textAnchor="middle" fill="#888896" fontFamily="monospace" fontSize="7.5">Semantic AST &amp; MD</text>

                  <rect x="825" y="65" width="125" height="55" rx="6" fill="url(#cardGrad)" stroke="#26262E" strokeWidth="1" />
                  <rect x="833" y="73" width="68" height="13" rx="2" fill="#1C1C24" />
                  <text x="867" y="82.5" textAnchor="middle" fill="#A1A1AA" fontFamily="monospace" fontSize="7.2" fontWeight="bold" letterSpacing="0.06em">EXTRACTION</text>
                  <text x="833" y="99" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">Structured Data</text>
                  <text x="833" y="111" fill="#888896" fontFamily="monospace" fontSize="7.5">Pydantic Schemas · Profiles</text>

                  <rect x="825" y="160" width="125" height="75" rx="6" fill="url(#cardGrad)" stroke="#26262E" strokeWidth="1" />
                  <rect x="833" y="168" width="62" height="13" rx="2" fill="#1C1C24" />
                  <text x="864" y="177.5" textAnchor="middle" fill="#C0F0FB" fontFamily="monospace" fontSize="7.2" fontWeight="bold" letterSpacing="0.06em">AUDIT SUITE</text>
                  <text x="833" y="196" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">SEO · AEO · GEO</text>
                  <text x="833" y="210" fill="#888896" fontFamily="monospace" fontSize="7.8">0–100 Engine Scores</text>
                  <text x="833" y="223" fill="#888896" fontFamily="monospace" fontSize="7.5">AI Citations &amp; Vitals</text>

                  <rect x="825" y="275" width="125" height="55" rx="6" fill="url(#cardGrad)" stroke="#26262E" strokeWidth="1" />
                  <rect x="833" y="283" width="76" height="13" rx="2" fill="#1C1C24" />
                  <text x="871" y="292.5" textAnchor="middle" fill="#A1A1AA" fontFamily="monospace" fontSize="7.2" fontWeight="bold" letterSpacing="0.06em">VISUAL ENGINE</text>
                  <text x="833" y="309" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">Screenshots &amp; PDF</text>
                  <text x="833" y="321" fill="#888896" fontFamily="monospace" fontSize="7.5">Full-Page Viewports</text>
                </g>

                {/* ── ZONE 04: EVIDENCE & DELIVERY ── */}
                <g>
                  <rect x="990" y="65" width="245" height="60" rx="6" fill="url(#cardGrad)" stroke="#30303C" strokeWidth="1" />
                  <rect x="1000" y="73" width="94" height="13" rx="2" fill="#1E2028" />
                  <text x="1047" y="82.5" textAnchor="middle" fill="#C0F0FB" fontFamily="monospace" fontSize="7.5" fontWeight="bold" letterSpacing="0.08em">EVIDENCE VAULT</text>
                  <text x="1000" y="100" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11.5" fontWeight="bold">DuckDB Provenance Store</text>
                  <text x="1000" y="113" fill="#888896" fontFamily="monospace" fontSize="8">SHA-256 Hashes · Raw HTML archive · Audit log</text>

                  <rect x="990" y="157" width="245" height="80" rx="6" fill="url(#activeGrad)" stroke="#C0F0FB" strokeWidth="1.4" />
                  <rect x="1000" y="165" width="92" height="13" rx="2" fill="#142633" />
                  <text x="1046" y="174.5" textAnchor="middle" fill="#C0F0FB" fontFamily="monospace" fontSize="7.5" fontWeight="bold" letterSpacing="0.08em">RESEARCH OUTPUT</text>
                  <text x="1000" y="195" fill="#FFFFFF" fontFamily="sans-serif" fontSize="13" fontWeight="bold">Multi-Format Delivery</text>
                  <text x="1000" y="210" fill="#C0F0FB" fontFamily="monospace" fontSize="8.5">JSON · JSONL · CSV · XLSX · PDF</text>
                  <text x="1000" y="225" fill="#888896" fontFamily="monospace" fontSize="8">GrowxLabs Enterprise Intelligence Dossier</text>

                  <rect x="990" y="270" width="245" height="55" rx="6" fill="url(#cardGrad)" stroke="#26262E" strokeWidth="1" />
                  <rect x="1000" y="278" width="98" height="13" rx="2" fill="#1C1C24" />
                  <text x="1049" y="287.5" textAnchor="middle" fill="#A1A1AA" fontFamily="monospace" fontSize="7.5" fontWeight="bold" letterSpacing="0.08em">ENTERPRISE INGEST</text>
                  <text x="1000" y="304" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">GrowxLabs Lead Pipeline</text>
                  <text x="1000" y="316" fill="#888896" fontFamily="monospace" fontSize="8">Webhook sync to /api/internal/leads/ingest</text>
                </g>

                {/* ── BOTTOM RAIL ── */}
                <line x1="35" y1="445" x2="1235" y2="445" stroke="#222228" strokeWidth="1" />
                <text x="635" y="435" textAnchor="middle" fill="#71717A" fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="0.22em">
                  // CORE SUBSYSTEM RUNTIMES &amp; ENTERPRISE PROTOCOLS
                </text>

                <g fontFamily="monospace" fontSize="9" fill="#A1A1AA">
                  <rect x="35" y="465" width="220" height="32" rx="4" fill="#0C0C10" stroke="#24242C" />
                  <text x="145" y="485" textAnchor="middle">PYTHON 3.12 / ASYNCIO RUNTIME</text>

                  <rect x="275" y="465" width="225" height="32" rx="4" fill="#0C0C10" stroke="#24242C" />
                  <text x="387.5" y="485" textAnchor="middle">PLAYWRIGHT CHROMIUM 64-POOL</text>

                  <rect x="520" y="465" width="220" height="32" rx="4" fill="#0C0C10" stroke="#24242C" />
                  <text x="630" y="485" textAnchor="middle">LOCAL DUCKDB SQL PERSISTENCE</text>

                  <rect x="760" y="465" width="225" height="32" rx="4" fill="#0C0C10" stroke="#24242C" />
                  <text x="872.5" y="485" textAnchor="middle">WAF &amp; TURNSTILE RESILIENCE</text>

                  <rect x="1005" y="465" width="230" height="32" rx="4" fill="#0C0C10" stroke="#24242C" />
                  <text x="1120" y="485" textAnchor="middle">FASTAPI SSE &amp; REST API SUITE</text>
                </g>
              </svg>
            </div>
          </div>

          {/* 4-Stage Technical Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            <div className="border border-neutral-800/80 bg-[#0A0A0C] p-6 rounded-xl space-y-3">
              <span className="font-mono text-xs font-bold text-primary tracking-widest block">
                01 / INGESTION
              </span>
              <h3 className="font-serif text-lg font-bold text-foreground">
                Dual Control &amp; Scheduling
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Native FastAPI web surface on port 7411 with real-time SSE streaming alongside a low-overhead Python 3.12 async CLI. Supports single URLs, XML sitemaps, and 100+ domain batch queues.
              </p>
            </div>

            <div className="border border-neutral-800/80 bg-[#0A0A0C] p-6 rounded-xl space-y-3">
              <span className="font-mono text-xs font-bold text-primary tracking-widest block">
                02 / FETCH &amp; EVASION
              </span>
              <h3 className="font-serif text-lg font-bold text-foreground">
                Smart Dual-Mode Dispatch
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Sub-150ms HTTP/2 tier with TLS spoofing for high-throughput discovery, escalating autonomously to a 64-session Playwright Chromium pool when Cloudflare, JS gates, or Turnstile challenges are met.
              </p>
            </div>

            <div className="border border-neutral-800/80 bg-[#0A0A0C] p-6 rounded-xl space-y-3">
              <span className="font-mono text-xs font-bold text-primary tracking-widest block">
                03 / INTELLIGENCE
              </span>
              <h3 className="font-serif text-lg font-bold text-foreground">
                Tri-Engine Audits &amp; DOM AST
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                DOM normalized into semantic Markdown with Pydantic extraction. Concurrently calculates 0–100 scores across SEO, AEO (Answer Engine Optimization), and GEO (Generative search visibility).
              </p>
            </div>

            <div className="border border-neutral-800/80 bg-[#0A0A0C] p-6 rounded-xl space-y-3">
              <span className="font-mono text-xs font-bold text-primary tracking-widest block">
                04 / STORAGE &amp; SYNC
              </span>
              <h3 className="font-serif text-lg font-bold text-foreground">
                DuckDB Provenance &amp; API Ingest
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Embedded DuckDB SQL warehouse cryptographically seals raw HTML snapshots with SHA-256 hashes. Delivers clean JSONL, CSV, and PDF briefs, syncing directly with the internal GrowxLabs lead pipeline.
              </p>
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
