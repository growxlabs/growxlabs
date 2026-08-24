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
    <div className="bg-[#111111] text-foreground min-h-screen">
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
          <div className="w-full overflow-hidden rounded-md border border-neutral-800/90 shadow-xl">
            <Image
              src="/portfolio/growx-crawl.svg"
              alt="GrowX Crawl Local Research Runtime Terminal"
              width={1200}
              height={660}
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
            04 — PLATFORM ARCHITECTURE (Wide Horizontal Blueprint)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16 space-y-8">
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
              // 03 ARCHITECTURE
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              Platform Architecture
            </h2>
            <p className="text-muted-foreground text-base max-w-3xl leading-relaxed">
              System architecture detailing the dual-engine crawl pipeline, extraction layers, and evidence storage.
            </p>
          </div>

          <div className="w-full overflow-x-auto py-6 border-y border-neutral-800/80">
            <div className="min-w-[1000px] max-w-[1300px] mx-auto">
              <svg viewBox="0 0 1200 520" className="w-full h-auto text-foreground" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Zone Headers */}
                <g className="font-mono text-[10px] font-bold tracking-[0.2em] fill-[#bdefff] uppercase">
                  <text x="30" y="24">01 / INPUT &amp; RUNTIME</text>
                  <text x="280" y="24">02 / CRAWL &amp; ENGINE</text>
                  <text x="600" y="24">03 / EXTRACTION &amp; AUDITS</text>
                  <text x="920" y="24">04 / OUTPUT &amp; DELIVERY</text>
                </g>

                {/* Vertical Zone Demarcators */}
                <line x1="240" y1="10" x2="240" y2="420" stroke="#262626" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="560" y1="10" x2="560" y2="420" stroke="#262626" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="880" y1="10" x2="880" y2="420" stroke="#262626" strokeWidth="1" strokeDasharray="3 3" />

                {/* Flow Connectors */}
                <line x1="170" y1="90" x2="200" y2="90" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" />
                <line x1="170" y1="210" x2="200" y2="210" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" />
                
                <path d="M 230 210 C 260 210, 260 90, 290 90" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <polygon points="290,90 282,86 282,94" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 230 210 C 260 210, 260 160, 290 160" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <polygon points="290,160 282,156 282,164" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 230 210 L 290 210" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" />
                <polygon points="290,210 282,206 282,214" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 420 210 C 440 210, 440 185, 460 185" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <polygon points="460,185 452,181 452,189" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 420 210 C 440 210, 440 235, 460 235" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <polygon points="460,235 452,231 452,239" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 540 210 L 580 210" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" />
                <polygon points="580,210 572,206 572,214" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 700 200 C 720 200, 720 120, 740 120" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <polygon points="740,120 732,116 732,124" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 700 220 C 720 220, 720 300, 740 300" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <polygon points="740,300 732,296 732,304" fill="#bdefff" fillOpacity="0.8" />

                <line x1="860" y1="120" x2="890" y2="120" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" />
                <polygon points="890,120 882,116 882,124" fill="#bdefff" fillOpacity="0.8" />

                <line x1="860" y1="300" x2="890" y2="300" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" />
                <polygon points="890,300 882,296 882,304" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 1010 120 C 1040 120, 1040 210, 1060 210" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <path d="M 1010 300 C 1040 300, 1040 210, 1060 210" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <polygon points="1060,210 1052,206 1052,214" fill="#bdefff" fillOpacity="0.8" />

                {/* Nodes Zone 01 */}
                <g>
                  <rect x="30" y="65" width="140" height="50" rx="4" fill="#141414" stroke="#333333" />
                  <text x="100" y="88" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">Research Goal</text>
                  <text x="100" y="103" textAnchor="middle" fill="#888888" fontFamily="monospace" fontSize="8.5">Seed URL / Topic</text>

                  <rect x="30" y="185" width="140" height="50" rx="4" fill="#141414" stroke="#333333" />
                  <text x="100" y="208" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">CLI / Agent</text>
                  <text x="100" y="223" textAnchor="middle" fill="#888888" fontFamily="monospace" fontSize="8.5">Local Node Runtime</text>
                </g>

                {/* Nodes Zone 02 */}
                <g>
                  <rect x="290" y="68" width="130" height="42" rx="3" fill="#121212" stroke="#333333" />
                  <text x="355" y="93" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontSize="10" fontWeight="bold">DISCOVERY</text>

                  <rect x="290" y="138" width="130" height="42" rx="3" fill="#121212" stroke="#333333" />
                  <text x="355" y="163" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontSize="10" fontWeight="bold">SITE MAPPING</text>

                  <rect x="290" y="195" width="130" height="60" rx="4" fill="#181818" stroke="#555555" />
                  <text x="355" y="222" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">Crawl Engine</text>
                  <text x="355" y="238" textAnchor="middle" fill="#bdefff" fontFamily="monospace" fontSize="8">Dual-Mode Fetch</text>

                  <rect x="460" y="165" width="80" height="30" rx="3" fill="#0f0f0f" stroke="#2a2a2a" />
                  <text x="500" y="184" textAnchor="middle" fill="#AAAAAA" fontFamily="monospace" fontSize="8.5">FAST HTTP</text>

                  <rect x="460" y="220" width="80" height="30" rx="3" fill="#0f0f0f" stroke="#2a2a2a" />
                  <text x="500" y="239" textAnchor="middle" fill="#AAAAAA" fontFamily="monospace" fontSize="8.5">PLAYWRIGHT</text>

                  <rect x="580" y="185" width="120" height="50" rx="4" fill="#181818" stroke="#bdefff" strokeWidth="1.2" />
                  <text x="640" y="208" textAnchor="middle" fill="#FFFFFF" fontFamily="serif" fontSize="11" fontWeight="bold">Page Intelligence</text>
                  <text x="640" y="222" textAnchor="middle" fill="#bdefff" fontFamily="monospace" fontSize="8">DOM &amp; Schema Parser</text>
                </g>

                {/* Nodes Zone 03 */}
                <g>
                  <rect x="740" y="98" width="120" height="42" rx="3" fill="#141414" stroke="#333333" />
                  <text x="800" y="123" textAnchor="middle" fill="#E5E5E5" fontFamily="monospace" fontSize="9.5" fontWeight="bold">EXTRACTION</text>

                  <rect x="890" y="98" width="120" height="42" rx="3" fill="#141414" stroke="#444444" />
                  <text x="950" y="118" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10" fontWeight="bold">Evidence Layer</text>
                  <text x="950" y="130" textAnchor="middle" fill="#888888" fontFamily="monospace" fontSize="8">DuckDB Hash Trace</text>

                  <rect x="740" y="278" width="120" height="42" rx="3" fill="#141414" stroke="#333333" />
                  <text x="800" y="303" textAnchor="middle" fill="#E5E5E5" fontFamily="monospace" fontSize="9.5" fontWeight="bold">SEO / AEO / GEO</text>

                  <rect x="890" y="278" width="120" height="42" rx="3" fill="#141414" stroke="#444444" />
                  <text x="950" y="298" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10" fontWeight="bold">Visibility Analysis</text>
                  <text x="950" y="310" textAnchor="middle" fill="#888888" fontFamily="monospace" fontSize="8">Comparative Index</text>
                </g>

                {/* Nodes Zone 04 */}
                <g>
                  <rect x="1060" y="170" width="115" height="80" rx="6" fill="#1a2630" stroke="#bdefff" strokeWidth="1.5" />
                  <text x="1117" y="200" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">Research Output</text>
                  <text x="1117" y="216" textAnchor="middle" fill="#bdefff" fontFamily="monospace" fontSize="8.5">JSON · CSV · PDF</text>
                  <text x="1117" y="232" textAnchor="middle" fill="#888888" fontFamily="monospace" fontSize="8">GrowxLabs Dossier</text>
                </g>

                {/* Bottom Rail */}
                <line x1="30" y1="440" x2="1170" y2="440" stroke="#222222" strokeWidth="1" />
                <text x="600" y="430" textAnchor="middle" fill="#666666" fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="0.2em">
                  // RUNTIME ENGINES &amp; INTEGRATIONS
                </text>

                <g fontFamily="monospace" fontSize="9.5" fill="#A3A3A3">
                  <rect x="160" y="460" width="160" height="28" rx="3" fill="#0d0d0d" stroke="#2a2a2a" />
                  <text x="240" y="478" textAnchor="middle">CHROMIUM / HEADLESS</text>

                  <rect x="380" y="460" width="160" height="28" rx="3" fill="#0d0d0d" stroke="#2a2a2a" />
                  <text x="460" y="478" textAnchor="middle">SITEMAP / DNS RESOLVER</text>

                  <rect x="600" y="460" width="160" height="28" rx="3" fill="#0d0d0d" stroke="#2a2a2a" />
                  <text x="680" y="478" textAnchor="middle">LOCAL DUCKDB PERSISTENCE</text>

                  <rect x="820" y="460" width="160" height="28" rx="3" fill="#0d0d0d" stroke="#2a2a2a" />
                  <text x="900" y="478" textAnchor="middle">PDF &amp; MEDIA SCREENSHOTS</text>
                </g>
              </svg>
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
