import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowRight } from "lucide-react";
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
    <div className="w-full bg-[#111111] text-foreground min-h-screen">
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
          <div className="space-y-4 max-w-4xl">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-primary">
              // CASE STUDY
            </span>
            <p className="text-xl sm:text-2xl text-muted-foreground font-light leading-relaxed max-w-3xl">
              A digital platform built around Trionyx's products, customer experience and day-to-day operations.
            </p>
          </div>

          {/* Clean Metadata Strip */}
          <div className="flex flex-wrap items-center gap-x-12 gap-y-4 py-6 border-y border-neutral-800 text-xs font-mono uppercase tracking-wider">
            <div>
              <span className="text-muted-foreground/60 mr-2">Project:</span>
              <span className="font-bold text-foreground">Web Platform</span>
            </div>
            <div>
              <span className="text-muted-foreground/60 mr-2">Status:</span>
              <span className="font-bold text-primary">Live</span>
            </div>
            <div>
              <span className="text-muted-foreground/60 mr-2">Client:</span>
              <span className="font-bold text-foreground">Trionyx</span>
            </div>
          </div>

          {/* Large Full-Width Hero Screenshot */}
          <div className="w-full overflow-hidden rounded-md border border-neutral-800/90 shadow-xl">
            <Image
              src="/portfolio/trionyx-dashboard.png"
              alt="Trionyx Main Platform Interface"
              width={1400}
              height={788}
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
              <p className="text-base font-bold text-primary">Live</p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            04 — PRODUCT EXPERIENCE (Alternating Large Screenshots)
        ══════════════════════════════════════════════════════════════════ */}
        {/* ══════════════════════════════════════════════════════════════════
            04 — PRODUCT EXPERIENCE & SPECIFICATIONS
        ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-12">
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
              // 02 PLATFORM SPECIFICATIONS
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              Customer Experience & Platform Capabilities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-neutral-800/80">
            {/* Spec 1: Product Catalog */}
            <div className="space-y-3 md:pr-8">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#bdefff]">
                01 / CATALOG
              </span>
              <h3 className="font-serif font-bold text-2xl text-foreground">
                Product Catalog
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Products are organized by category with structured specifications, technical drawings, and dimension charts. Prospective clients can search and filter industrial equipment models directly in the browser without downloading bulky catalog PDFs.
              </p>
            </div>

            {/* Spec 2: RFQ & Enquiry */}
            <div className="space-y-3 pt-8 md:pt-0 md:px-8">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#bdefff]">
                02 / INQUIRY
              </span>
              <h3 className="font-serif font-bold text-2xl text-foreground">
                RFQ & Enquiry Flow
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Custom enquiry forms collect essential engineering parameters, volume requirements, and project timelines upfront before dispatching requests directly to Trionyx's technical sales desk, eliminating back-and-forth email delays.
              </p>
            </div>

            {/* Spec 3: Multi-Device Responsive */}
            <div className="space-y-3 pt-8 md:pt-0 md:pl-8">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#bdefff]">
                03 / ADAPTABILITY
              </span>
              <h3 className="font-serif font-bold text-2xl text-foreground">
                Responsive Design
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Engineered for desktop, tablet, and mobile browsers, ensuring field engineers and buyers on site visits can quickly verify catalog measurements, part numbers, and component compatibility on any device.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            04 — ARCHITECTURE (Platform & Operations Architecture)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16 space-y-8">
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
              // 03 ARCHITECTURE
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              Platform &amp; Operations Architecture
            </h2>
            <p className="text-muted-foreground text-base max-w-3xl leading-relaxed">
              How Trionyx connects its digital experience, customer enquiries, products, sales, inventory, distributors, business operations and management through one connected platform.
            </p>
          </div>

          {/* Wide Architectural SVG Schematic */}
          <div className="w-full overflow-x-auto py-6 border-y border-neutral-800/80">
            <div className="min-w-[1200px] max-w-[1440px] mx-auto">
              <svg
                viewBox="0 0 1440 680"
                className="w-full h-auto text-foreground"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* ══════════════ ARCHITECTURAL GRID & BUSES ══════════════ */}
                <g stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1">
                  <line x1="210" y1="10" x2="210" y2="530" strokeDasharray="3 3" />
                  <line x1="530" y1="10" x2="530" y2="530" strokeDasharray="3 3" />
                  <line x1="910" y1="10" x2="910" y2="530" strokeDasharray="3 3" />
                  <line x1="1190" y1="10" x2="1190" y2="530" strokeDasharray="3 3" />
                </g>

                {/* ══════════════ ZONE HEADERS ══════════════ */}
                <g className="font-mono text-[10px] font-bold tracking-[0.2em] fill-[#bdefff] uppercase">
                  <text x="25" y="24">01 / USERS</text>
                  <text x="235" y="24">02 / DIGITAL EXPERIENCE</text>
                  <text x="555" y="24">03 / BUSINESS OPERATIONS</text>
                  <text x="935" y="24">04 / AI &amp; AUTOMATION</text>
                  <text x="1215" y="24">05 / MANAGEMENT</text>
                </g>

                {/* Subhead indicators */}
                <g className="font-mono text-[9px] fill-[#666666] tracking-wider uppercase">
                  <text x="235" y="42">Trionyx Web Platform</text>
                  <text x="555" y="42">Trionyx Operations Platform</text>
                  <text x="935" y="42">AI + Automation Layer</text>
                  <text x="1215" y="42">Unified Admin Dashboard</text>
                </g>


                {/* ══════════════ FLOW CONNECTORS (Left to Right) ══════════════ */}

                {/* Zone 1 -> Zone 2 */}
                <path d="M 180 85 L 235 85" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" />
                <polygon points="235,85 227,81 227,89" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 180 185 L 235 185" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" />
                <polygon points="235,185 227,181 227,189" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 180 285 L 235 285" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" />
                <polygon points="235,285 227,281 227,289" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 180 385 C 205 385, 205 385, 235 385" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <polygon points="235,385 227,381 227,389" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 180 485 C 210 485, 210 515, 1215 515" stroke="#bdefff" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="3 3" fill="none" />
                <polygon points="1215,515 1207,511 1207,519" fill="#bdefff" fillOpacity="0.6" />

                {/* Zone 2 -> Zone 3 Connectors */}
                <path d="M 505 85 L 555 85" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" />
                <polygon points="555,85 547,81 547,89" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 505 185 L 555 185" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" />
                <polygon points="555,185 547,181 547,189" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 505 285 L 555 285" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" />
                <polygon points="555,285 547,281 547,289" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 505 385 L 555 385" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" />
                <polygon points="555,385 547,381 547,389" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 505 480 L 555 480" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" />
                <polygon points="555,480 547,476 547,484" fill="#bdefff" fillOpacity="0.8" />

                {/* Zone 3 -> Zone 4 Connectors */}
                <path d="M 885 85 C 910 85, 910 105, 935 105" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <polygon points="935,105 927,101 927,109" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 885 185 C 910 185, 910 220, 935 220" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <polygon points="935,220 927,216 927,224" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 885 285 C 910 285, 910 335, 935 335" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <polygon points="935,335 927,331 927,339" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 885 480 C 910 480, 910 450, 935 450" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <polygon points="935,450 927,446 927,454" fill="#bdefff" fillOpacity="0.8" />

                {/* Zone 4 -> Zone 5 Connectors */}
                <path d="M 1165 105 C 1190 105, 1190 200, 1215 200" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <polygon points="1215,200 1207,196 1207,204" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 1165 220 C 1190 220, 1190 250, 1215 250" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <polygon points="1215,250 1207,246 1207,254" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 1165 335 C 1190 335, 1190 300, 1215 300" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <polygon points="1215,300 1207,296 1207,304" fill="#bdefff" fillOpacity="0.8" />

                <path d="M 1165 450 C 1190 450, 1190 350, 1215 350" stroke="#bdefff" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                <polygon points="1215,350 1207,346 1207,354" fill="#bdefff" fillOpacity="0.8" />


                {/* ══════════════ ZONE 01: USERS ══════════════ */}
                <g>
                  {/* User 1: Customer */}
                  <rect x="25" y="55" width="155" height="60" rx="3" fill="#141414" stroke="#2c2c2c" strokeWidth="1" />
                  <text x="102" y="80" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">Customer / Vehicle Owner</text>
                  <text x="102" y="98" textAnchor="middle" fill="#888888" fontFamily="monospace" fontSize="8.5">Product Discovery &amp; Inquiries</text>

                  {/* User 2: Dealer */}
                  <rect x="25" y="155" width="155" height="60" rx="3" fill="#141414" stroke="#2c2c2c" strokeWidth="1" />
                  <text x="102" y="180" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">Certified Dealer</text>
                  <text x="102" y="198" textAnchor="middle" fill="#888888" fontFamily="monospace" fontSize="8.5">Catalog &amp; Application RFQ</text>

                  {/* User 3: Distributor */}
                  <rect x="25" y="255" width="155" height="60" rx="3" fill="#141414" stroke="#2c2c2c" strokeWidth="1" />
                  <text x="102" y="280" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">Regional Distributor</text>
                  <text x="102" y="298" textAnchor="middle" fill="#888888" fontFamily="monospace" fontSize="8.5">Territory Enquiries &amp; Supply</text>

                  {/* User 4: Sales Team */}
                  <rect x="25" y="355" width="155" height="60" rx="3" fill="#141414" stroke="#2c2c2c" strokeWidth="1" />
                  <text x="102" y="380" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">Sales Team</text>
                  <text x="102" y="398" textAnchor="middle" fill="#888888" fontFamily="monospace" fontSize="8.5">Lead Pipeline &amp; Follow-up</text>

                  {/* User 5: Admin */}
                  <rect x="25" y="455" width="155" height="60" rx="3" fill="#181818" stroke="#444444" strokeWidth="1" />
                  <text x="102" y="480" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold">Trionyx Leadership</text>
                  <text x="102" y="498" textAnchor="middle" fill="#bdefff" fontFamily="monospace" fontSize="8.5">Admin &amp; Business Management</text>
                </g>


                {/* ══════════════ ZONE 02: DIGITAL EXPERIENCE ══════════════ */}
                <g>
                  {/* Module 1: Product Catalog & PPF Experience */}
                  <rect x="235" y="55" width="270" height="74" rx="3" fill="#151515" stroke="#282828" strokeWidth="1" />
                  <text x="250" y="74" fill="#bdefff" fontFamily="monospace" fontSize="8.5" fontWeight="bold">01 / PRODUCT CATALOGUE</text>
                  <text x="250" y="91" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">Ceramic · Graphene · PPF · Accessories</text>
                  <text x="250" y="106" fill="#888888" fontFamily="sans-serif" fontSize="8.5">Interactive PPF Experience &amp; Specifications</text>
                  <text x="250" y="119" fill="#555555" fontFamily="monospace" fontSize="7.5">Structured Specs · Technical Drawings · Media</text>

                  {/* Module 2: Inquiries & RFQs */}
                  <rect x="235" y="150" width="270" height="74" rx="3" fill="#151515" stroke="#282828" strokeWidth="1" />
                  <text x="250" y="169" fill="#bdefff" fontFamily="monospace" fontSize="8.5" fontWeight="bold">02 / ENQUIRY &amp; RFQ ROUTING</text>
                  <text x="250" y="186" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">Customer Enquiries &amp; Dealer RFQs</text>
                  <text x="250" y="201" fill="#888888" fontFamily="sans-serif" fontSize="8.5">Direct Quote Dispatch to Sales Desk</text>
                  <text x="250" y="214" fill="#555555" fontFamily="monospace" fontSize="7.5">Validation · Application Scope · Lead Capture</text>

                  {/* Module 3: Distributor Channel Touchpoint */}
                  <rect x="235" y="245" width="270" height="74" rx="3" fill="#151515" stroke="#282828" strokeWidth="1" />
                  <text x="250" y="264" fill="#bdefff" fontFamily="monospace" fontSize="8.5" fontWeight="bold">03 / DISTRIBUTOR CHANNEL</text>
                  <text x="250" y="281" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">Distributor Inquiries &amp; Onboarding</text>
                  <text x="250" y="296" fill="#888888" fontFamily="sans-serif" fontSize="8.5">Regional Partner Inquiries &amp; Network Expansion</text>
                  <text x="250" y="309" fill="#555555" fontFamily="monospace" fontSize="7.5">Territory Inquiry Forms · Channel Touchpoints</text>

                  {/* Module 4: Engagement & Social */}
                  <rect x="235" y="340" width="270" height="74" rx="3" fill="#151515" stroke="#282828" strokeWidth="1" />
                  <text x="250" y="359" fill="#bdefff" fontFamily="monospace" fontSize="8.5" fontWeight="bold">04 / DIRECT ENGAGEMENT</text>
                  <text x="250" y="376" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">WhatsApp · Instagram · Social Feeds</text>
                  <text x="250" y="391" fill="#888888" fontFamily="sans-serif" fontSize="8.5">Direct Customer Contact &amp; Brand Media</text>
                  <text x="250" y="404" fill="#555555" fontFamily="monospace" fontSize="7.5">Fast Messaging Connect · Social Touchpoints</text>

                  {/* Module 5: Search & Visibility */}
                  <rect x="235" y="435" width="270" height="74" rx="3" fill="#151515" stroke="#282828" strokeWidth="1" />
                  <text x="250" y="454" fill="#bdefff" fontFamily="monospace" fontSize="8.5" fontWeight="bold">05 / SEARCH ENGINE VISIBILITY</text>
                  <text x="250" y="471" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">SEO · AEO · GEO Optimization</text>
                  <text x="250" y="486" fill="#888888" fontFamily="sans-serif" fontSize="8.5">Search &amp; Generative Visibility</text>
                  <text x="250" y="499" fill="#555555" fontFamily="monospace" fontSize="7.5">Structured Schema · Fast Mobile Performance</text>
                </g>


                {/* ══════════════ ZONE 03: BUSINESS OPERATIONS ══════════════ */}
                <g>
                  {/* Subsystem 1: CRM */}
                  <rect x="555" y="55" width="330" height="74" rx="3" fill="#13171d" stroke="#22303c" strokeWidth="1" />
                  <text x="570" y="74" fill="#bdefff" fontFamily="monospace" fontSize="8.5" fontWeight="bold">CRM &amp; LEAD PIPELINE</text>
                  <text x="570" y="91" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">Customer &amp; Enquiry Management</text>
                  <text x="570" y="106" fill="#888888" fontFamily="sans-serif" fontSize="8.5">Lead / Sales Pipeline · Follow-up Tracking · Sales Activity</text>
                  <text x="570" y="119" fill="#555555" fontFamily="monospace" fontSize="7.5">Customer Records · Inquiry History · Interaction Log</text>

                  {/* Subsystem 2: Inventory Management */}
                  <rect x="555" y="150" width="330" height="74" rx="3" fill="#13171d" stroke="#22303c" strokeWidth="1" />
                  <text x="570" y="169" fill="#bdefff" fontFamily="monospace" fontSize="8.5" fontWeight="bold">INVENTORY MANAGEMENT</text>
                  <text x="570" y="186" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">Product Master &amp; SKU Tracking</text>
                  <text x="570" y="201" fill="#888888" fontFamily="sans-serif" fontSize="8.5">Current Stock Levels · Stock Movement Visibility</text>
                  <text x="570" y="214" fill="#555555" fontFamily="monospace" fontSize="7.5">Product Master · SKU Inventory · Stock Visibility</text>

                  {/* Subsystem 3: Distributor Management */}
                  <rect x="555" y="245" width="330" height="74" rx="3" fill="#13171d" stroke="#22303c" strokeWidth="1" />
                  <text x="570" y="264" fill="#bdefff" fontFamily="monospace" fontSize="8.5" fontWeight="bold">DISTRIBUTOR MANAGEMENT</text>
                  <text x="570" y="281" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">Distributor Network &amp; Records</text>
                  <text x="570" y="296" fill="#888888" fontFamily="sans-serif" fontSize="8.5">Regional Enquiries · Orders &amp; Requests · Activity</text>
                  <text x="570" y="309" fill="#555555" fontFamily="monospace" fontSize="7.5">Distributor Information · Region Mapping · Channel Records</text>

                  {/* Subsystem 4: Product Master */}
                  <rect x="555" y="340" width="330" height="74" rx="3" fill="#13171d" stroke="#22303c" strokeWidth="1" />
                  <text x="570" y="359" fill="#bdefff" fontFamily="monospace" fontSize="8.5" fontWeight="bold">PRODUCT MANAGEMENT</text>
                  <text x="570" y="376" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">Specifications, Pricing &amp; Media Master</text>
                  <text x="570" y="391" fill="#888888" fontFamily="sans-serif" fontSize="8.5">Product Information Master · Specs &amp; Media Documents</text>
                  <text x="570" y="404" fill="#555555" fontFamily="monospace" fontSize="7.5">Technical Data Sheets · Asset Links · Classification</text>

                  {/* Subsystem 5: Accounting & Billing */}
                  <rect x="555" y="435" width="330" height="74" rx="3" fill="#13171d" stroke="#22303c" strokeWidth="1" />
                  <text x="570" y="454" fill="#bdefff" fontFamily="monospace" fontSize="8.5" fontWeight="bold">BILLING &amp; ACCOUNTING</text>
                  <text x="570" y="471" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold">Billing Records &amp; Invoices</text>
                  <text x="570" y="486" fill="#888888" fontFamily="sans-serif" fontSize="8.5">Invoice Information · Payment Status · Tally Integration / Export</text>
                  <text x="570" y="499" fill="#555555" fontFamily="monospace" fontSize="7.5">Transaction Records · Tax Summaries · Export Formats</text>
                </g>


                {/* ══════════════ ZONE 04: AI & AUTOMATION ══════════════ */}
                <g>
                  {/* AI Module 1 */}
                  <rect x="935" y="55" width="230" height="96" rx="3" fill="#151515" stroke="#2a2a2a" strokeWidth="1" />
                  <text x="950" y="75" fill="#bdefff" fontFamily="monospace" fontSize="8" fontWeight="bold">ENQUIRY ASSISTANCE</text>
                  <text x="950" y="93" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10" fontWeight="bold">Classification &amp; Routing</text>
                  <text x="950" y="108" fill="#888888" fontFamily="sans-serif" fontSize="8.5">• Intent classification</text>
                  <text x="950" y="122" fill="#888888" fontFamily="sans-serif" fontSize="8.5">• Inquiry categorization</text>
                  <text x="950" y="136" fill="#555555" fontFamily="monospace" fontSize="7.5">• Lead routing assistance</text>

                  {/* AI Module 2 */}
                  <rect x="935" y="165" width="230" height="96" rx="3" fill="#151515" stroke="#2a2a2a" strokeWidth="1" />
                  <text x="950" y="185" fill="#bdefff" fontFamily="monospace" fontSize="8" fontWeight="bold">FOLLOW-UP ASSISTANCE</text>
                  <text x="950" y="203" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10" fontWeight="bold">Sales Response Aid</text>
                  <text x="950" y="218" fill="#888888" fontFamily="sans-serif" fontSize="8.5">• Contextual reply assistance</text>
                  <text x="950" y="232" fill="#888888" fontFamily="sans-serif" fontSize="8.5">• Follow-up reminders</text>
                  <text x="950" y="246" fill="#555555" fontFamily="monospace" fontSize="7.5">• Customer &amp; dealer response aid</text>

                  {/* AI Module 3 */}
                  <rect x="935" y="275" width="230" height="96" rx="3" fill="#151515" stroke="#2a2a2a" strokeWidth="1" />
                  <text x="950" y="295" fill="#bdefff" fontFamily="monospace" fontSize="8" fontWeight="bold">BUSINESS INSIGHTS</text>
                  <text x="950" y="313" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10" fontWeight="bold">Sales &amp; Customer Insights</text>
                  <text x="950" y="328" fill="#888888" fontFamily="sans-serif" fontSize="8.5">• Inquiry &amp; sales signals</text>
                  <text x="950" y="342" fill="#888888" fontFamily="sans-serif" fontSize="8.5">• Inventory visibility</text>
                  <text x="950" y="356" fill="#555555" fontFamily="monospace" fontSize="7.5">• Operational summaries</text>

                  {/* AI Module 4 */}
                  <rect x="935" y="385" width="230" height="106" rx="3" fill="#151515" stroke="#2a2a2a" strokeWidth="1" />
                  <text x="950" y="405" fill="#bdefff" fontFamily="monospace" fontSize="8" fontWeight="bold">REPORTING ASSISTANCE</text>
                  <text x="950" y="423" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10" fontWeight="bold">Operational Summaries</text>
                  <text x="950" y="438" fill="#888888" fontFamily="sans-serif" fontSize="8.5">• Activity reporting</text>
                  <text x="950" y="452" fill="#888888" fontFamily="sans-serif" fontSize="8.5">• Channel summaries</text>
                  <text x="950" y="466" fill="#555555" fontFamily="monospace" fontSize="7.5">• Workflow automation</text>
                </g>


                {/* ══════════════ ZONE 05: MANAGEMENT ══════════════ */}
                <g>
                  {/* 12 Dashboard Function Pills (Grid / Compact Flow) */}
                  <g fontFamily="sans-serif" fontSize="8.5" fontWeight="bold" fill="#E0E0E0">
                    <rect x="1215" y="55" width="95" height="28" rx="2" fill="#121b22" stroke="#2d4050" />
                    <text x="1262" y="73" textAnchor="middle">Overview</text>

                    <rect x="1320" y="55" width="95" height="28" rx="2" fill="#121b22" stroke="#2d4050" />
                    <text x="1367" y="73" textAnchor="middle">Customers</text>

                    <rect x="1215" y="91" width="95" height="28" rx="2" fill="#121b22" stroke="#2d4050" />
                    <text x="1262" y="109" textAnchor="middle">Enquiries</text>

                    <rect x="1320" y="91" width="95" height="28" rx="2" fill="#121b22" stroke="#2d4050" />
                    <text x="1367" y="109" textAnchor="middle">Sales Pipeline</text>

                    <rect x="1215" y="127" width="95" height="28" rx="2" fill="#121b22" stroke="#2d4050" />
                    <text x="1262" y="145" textAnchor="middle">Products</text>

                    <rect x="1320" y="127" width="95" height="28" rx="2" fill="#121b22" stroke="#2d4050" />
                    <text x="1367" y="145" textAnchor="middle">Inventory</text>

                    <rect x="1215" y="163" width="95" height="28" rx="2" fill="#121b22" stroke="#2d4050" />
                    <text x="1262" y="181" textAnchor="middle">Distributors</text>

                    <rect x="1320" y="163" width="95" height="28" rx="2" fill="#121b22" stroke="#2d4050" />
                    <text x="1367" y="181" textAnchor="middle">Billing &amp; Tax</text>

                    <rect x="1215" y="199" width="95" height="28" rx="2" fill="#121b22" stroke="#2d4050" />
                    <text x="1262" y="217" textAnchor="middle">Web Content</text>

                    <rect x="1320" y="199" width="95" height="28" rx="2" fill="#121b22" stroke="#2d4050" />
                    <text x="1367" y="217" textAnchor="middle">Marketing</text>

                    <rect x="1215" y="235" width="95" height="28" rx="2" fill="#121b22" stroke="#2d4050" />
                    <text x="1262" y="253" textAnchor="middle">Analytics</text>

                    <rect x="1320" y="235" width="95" height="28" rx="2" fill="#121b22" stroke="#2d4050" />
                    <text x="1367" y="253" textAnchor="middle">Access / Admin</text>
                  </g>

                  {/* Central Command Summary Card */}
                  <rect x="1215" y="275" width="200" height="234" rx="3" fill="#16222c" stroke="#bdefff" strokeWidth="1" />
                  <text x="1315" y="305" textAnchor="middle" fill="#FFFFFF" fontFamily="serif" fontSize="11.5" fontWeight="bold" letterSpacing="0.04em">
                    TRIONYX MANAGEMENT
                  </text>
                  <text x="1315" y="322" textAnchor="middle" fill="#bdefff" fontFamily="monospace" fontSize="8" fontWeight="bold">
                    CENTRAL OPERATIONS COMMAND
                  </text>
                  <line x1="1230" y1="335" x2="1400" y2="335" stroke="#2d4050" strokeWidth="1" />
                  
                  <g fontFamily="sans-serif" fontSize="8.5" fill="#888888">
                    <text x="1235" y="360">• Unified Operations View</text>
                    <text x="1235" y="380">• Cross-module visibility</text>
                    <text x="1235" y="400">• Lead &amp; inquiry oversight</text>
                    <text x="1235" y="420">• Stock &amp; distributor records</text>
                    <text x="1235" y="440">• Billing export control</text>
                    <text x="1235" y="460">• Role-based permissions</text>
                  </g>

                  <rect x="1230" y="475" width="170" height="24" rx="2" fill="#1f384d" stroke="#bdefff" strokeWidth="0.8" />
                  <text x="1315" y="491" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontSize="8" fontWeight="bold">
                    OPERATIONAL CONTROL HUB
                  </text>
                </g>


                {/* ══════════════ 06 / EXTERNAL CONNECTIONS RAIL ══════════════ */}
                <line x1="25" y1="545" x2="1415" y2="545" stroke="#222222" strokeWidth="1" />
                <text x="720" y="538" textAnchor="middle" fill="#666666" fontFamily="monospace" fontSize="8.5" fontWeight="bold" letterSpacing="0.25em">
                  // 06 EXTERNAL CONNECTIONS &amp; INTEGRATIONS
                </text>

                {/* Vertical Bus Drop Lines */}
                <path d="M 370 510 L 370 560" stroke="#333333" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 720 510 L 720 560" stroke="#333333" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 1050 490 L 1050 560" stroke="#333333" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 1315 510 L 1315 560" stroke="#333333" strokeWidth="1" strokeDasharray="3 3" />

                {/* 7 Integration Nodes Along the Bus */}
                <g fontFamily="monospace" fontSize="8.5" fill="#A3A3A3">
                  {/* WhatsApp */}
                  <rect x="40" y="565" width="165" height="34" rx="2" fill="#0d0d0d" stroke="#262626" />
                  <text x="122" y="581" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">WHATSAPP</text>
                  <text x="122" y="593" textAnchor="middle" fill="#666666" fontSize="7">Direct Contact &amp; Enquiries</text>

                  {/* Email Service */}
                  <rect x="235" y="565" width="165" height="34" rx="2" fill="#0d0d0d" stroke="#262626" />
                  <text x="317" y="581" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">EMAIL DISPATCH</text>
                  <text x="317" y="593" textAnchor="middle" fill="#666666" fontSize="7">Quotes &amp; Enquiries</text>

                  {/* Tally */}
                  <rect x="430" y="565" width="165" height="34" rx="2" fill="#0d0d0d" stroke="#262626" />
                  <text x="512" y="581" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">TALLY INTEGRATION</text>
                  <text x="512" y="593" textAnchor="middle" fill="#666666" fontSize="7">Billing &amp; Invoice Export</text>

                  {/* Google Search & Console */}
                  <rect x="625" y="565" width="185" height="34" rx="2" fill="#0d0d0d" stroke="#262626" />
                  <text x="717" y="581" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">GOOGLE SEARCH &amp; CONSOLE</text>
                  <text x="717" y="593" textAnchor="middle" fill="#666666" fontSize="7">SEO &amp; Indexing Telemetry</text>

                  {/* Google Analytics */}
                  <rect x="840" y="565" width="165" height="34" rx="2" fill="#0d0d0d" stroke="#262626" />
                  <text x="922" y="581" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">GOOGLE ANALYTICS</text>
                  <text x="922" y="593" textAnchor="middle" fill="#666666" fontSize="7">Traffic &amp; Conversion Data</text>

                  {/* Meta / Instagram */}
                  <rect x="1035" y="565" width="165" height="34" rx="2" fill="#0d0d0d" stroke="#262626" />
                  <text x="1117" y="581" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">META / INSTAGRAM</text>
                  <text x="1117" y="593" textAnchor="middle" fill="#666666" fontSize="7">Social &amp; Brand Feeds</text>

                  {/* Cloud Storage */}
                  <rect x="1230" y="565" width="180" height="34" rx="2" fill="#0d0d0d" stroke="#262626" />
                  <text x="1320" y="581" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">MEDIA &amp; ASSET STORAGE</text>
                  <text x="1320" y="593" textAnchor="middle" fill="#666666" fontSize="7">Product Docs, Media &amp; PDFs</text>
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
            title="Trionyx"
            url="/portfolio/trionyx"
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            04 — CLOSING (Minimalist Call to Action)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-20 pb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              Running an automotive or distribution company?
            </h2>
            <p className="text-muted-foreground text-base">
              We can build a platform like this for your company.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all shadow-md group"
            >
              <span>Contact GrowxLabs</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
