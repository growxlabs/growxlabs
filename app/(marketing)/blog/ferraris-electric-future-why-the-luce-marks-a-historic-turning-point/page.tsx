import React from "react";
import Image from "next/image";
import Script from "next/script";
import { Link } from "@/navigation";
import { Reveal } from "@/components/marketing/Reveal";
import { ArrowRight, Calendar, Clock, User, ArrowUpRight, BarChart2, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AccordionFAQ } from "@/components/marketing/AccordionFAQ";
import { 
  CombustionToElectricVisual, 
  TransformationTimelineVisual, 
  OpinionNetworkVisual, 
  LuxuryEcosystemVisual, 
  AdaptationOSVisual 
} from "@/components/marketing/InteractiveFerrariLuce";
import { 
  InsightCallout, 
  WhyThisMatters, 
  EditorialDivider, 
  QuoteBlock, 
  RelatedArticlesGrid 
} from "@/components/marketing/BlogEditorial";
import { 
  ReadingProgressBar, 
  TableOfContents 
} from "@/components/marketing/BlogInteractive";
import { EditorialImageFrame } from "@/components/marketing/EditorialImageFrame";

// ═══════════════════════════════════════════════════
// METADATA GENERATOR (Perfect SEO / AEO Optimization)
// ═══════════════════════════════════════════════════
export async function generateMetadata() {
  const title = "Ferrari’s Electric Future: Why The Luce Marks A Historic Turning Point";
  const description = "Analyze Ferrari’s transition to electrification. An immersive, non-traditional digital publication examining solid-state batteries, axial flux torque latency, and business lessons.";

  return {
    title: `${title} | GrowxLabs Insights`,
    description,
    alternates: {
      canonical: "https://growxlabs.tech/blog/ferraris-electric-future-why-the-luce-marks-a-historic-turning-point"
    },
    openGraph: {
      title,
      description,
      url: "https://growxlabs.tech/blog/ferraris-electric-future-why-the-luce-marks-a-historic-turning-point",
      siteName: "GrowxLabs",
      type: "article",
      publishedTime: "2026-05-29T08:00:00.000Z",
      authors: ["GrowxLabs"],
      images: [
        {
          url: "https://growxlabs.tech/images/blog-ferrari-luce.png",
          width: 1200,
          height: 630,
          alt: "Ferrari Luce — The Beginning of the Electric Era"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://growxlabs.tech/images/blog-ferrari-luce.png"]
    }
  };
}

export default async function FerrariLuceBlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Headings array for the Table of Contents scrollspy
  const headings = [
    { id: "executive-brief", text: "The Main Change" },
    { id: "more-than-ev", text: "More Than An Electric Vehicle" },
    { id: "transition-matrix", text: "How the Transition Works" },
    { id: "why-ferrari-changed", text: "Why Ferrari Had To Change" },
    { id: "internet-divided", text: "The Internet Is Divided" },
    { id: "luxury-redefined", text: "Luxury Is Being Redefined" },
    { id: "business-lessons", text: "What Businesses Can Learn" },
    { id: "bigger-picture", text: "The Bigger Picture" },
    { id: "final-thoughts", text: "Final Thoughts" },
    { id: "faq", text: "Frequently Asked Questions" }
  ];

  // Q&A data for UI rendering and Search Engine Schema validation (Highly optimized for AEO/GEO)
  const faqData = [
    {
      question: "What makes the Ferrari Luce a historic turning point in automotive engineering?",
      answer: "The Ferrari Luce represents Maranello's first fully electric hypercar, transitioning the brand from mechanical internal combustion engines to a software-defined, electric powertrain. It proves that heritage brands can preserve luxury status while actively adapting to sustainable technology."
    },
    {
      question: "How does the Ferrari Luce solve the weight and agility challenges of electric vehicles?",
      answer: "Ferrari engineers integrated lightweight solid-state battery cells directly into the carbon-fiber monocoque chassis (480 Wh/kg energy density). Coupled with three high-density axial flux motors, this reduces chassis weight while delivering a 1.2ms torque vectoring sync latency for unmatched track agility."
    },
    {
      question: "Does the electric Ferrari Luce retain emotional acoustic feedback?",
      answer: "Yes, the Luce incorporates structural acoustic resonators mapped to raw motor spin frequencies. This translates the electric power cycles into emotional sound and vibrational feedback, replacing the V12 exhaust note with a direct digital-mechanical acoustic profile."
    },
    {
      question: "What strategic business lessons can startups and enterprises learn from Ferrari's transition?",
      answer: "Startups and enterprises must evolve before change becomes unavoidable. Rather than delaying transformation to protect legacy cash cows, Ferrari proactively retrofitted its manufacturing, retrained artisanal talent, and invested in software R&D while remaining highly profitable."
    }
  ];

  // Structured Data (JSON-LD) for SEO / AEO / GEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://growxlabs.tech/blog/ferraris-electric-future-why-the-luce-marks-a-historic-turning-point/#article`,
        "headline": "Ferrari’s Electric Future: Why The Luce Marks A Historic Turning Point",
        "description": "Explore Ferrari’s transition to electrification. An immersive, non-traditional digital publication examining solid-state batteries, axial flux torque latency, and business lessons.",
        "datePublished": "2026-05-29T08:00:00Z",
        "dateModified": "2026-05-29T08:00:00Z",
        "image": "https://growxlabs.tech/images/blog-ferrari-luce.png",
        "author": {
          "@type": "Organization",
          "name": "GrowxLabs",
          "url": "https://growxlabs.tech",
          "logo": "https://growxlabs.tech/logo.png"
        },
        "publisher": {
          "@type": "Organization",
          "name": "GrowxLabs",
          "logo": {
            "@type": "ImageObject",
            "url": "https://growxlabs.tech/logo.png"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://growxlabs.tech/blog/ferraris-electric-future-why-the-luce-marks-a-historic-turning-point`
        }
      },
      {
        "@type": "FAQPage",
        "@id": `https://growxlabs.tech/blog/ferraris-electric-future-why-the-luce-marks-a-historic-turning-point/#faq`,
        "mainEntity": faqData.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ]
  };

  const relatedArticles = [
    {
      title: "Google I/O 2026: The Beginning of the AI-Native Internet",
      href: "/blog/google-io-2026",
      date: "May 27, 2026",
      readTime: "6 min read",
      category: "AI / Technology"
    },
    {
      title: "Google Search Is No Longer Just Search: The Rise of the Execution Engine",
      href: "/blog/google-search-is-no-longer-just-search",
      date: "May 27, 2026",
      readTime: "5 min read",
      category: "SEO / Search"
    },
    {
      title: "AI Coding Tools Are Reshaping Modern Software Engineering",
      href: "/blog/ai-coding-tools-are-reshaping-modern-software-engineering",
      date: "May 27, 2026",
      readTime: "5 min read",
      category: "Engineering / AI"
    }
  ];

  return (
    <div className="blog-article-page w-full bg-background min-h-screen text-foreground selection:bg-[#E60000]/10 selection:text-[#E60000] pt-32 pb-24 font-sans">
      {/* Schema Injection */}
      <Script
        id="ferrari-luce-schemas"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sticky Progress Bar */}
      <ReadingProgressBar />

      {/* ═══════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION (Split Layout)                      */}
      {/* ═══════════════════════════════════════════════════ */}
      <header className="w-full border-b border-border pb-20 px-6 md:px-10 xl:px-16 2xl:px-24">
        <div className="max-w-[1240px] mx-auto">
          
          {/* Left Column: Metadata & Large Headlines (Swiss Layout) */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <Reveal y={20}>
              {/* Category tags */}
              <div className="flex gap-2 items-center">
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#E60000] uppercase font-bold bg-[#E60000]/5 px-2.5 py-1 rounded">
                  CASE STUDY
                </span>
                <span className="text-[10px] font-mono text-[#9CA3AF] uppercase">/</span>
                <span className="text-[10px] font-mono tracking-[0.15em] text-[#A1A1AA] uppercase font-semibold">
                  AUTOMOTIVE FUTURE
                </span>
                <span className="text-[10px] font-mono text-[#9CA3AF] uppercase">/</span>
                <span className="text-[10px] font-mono tracking-[0.15em] text-[#A1A1AA] uppercase font-semibold">
                  STRATEGY
                </span>
              </div>
            </Reveal>

            <Reveal y={25} delay={0.1}>
              {/* Swiss Editorial Title */}
              <h1 className="text-[clamp(36px,4.2vw,58px)] font-black leading-[1.05] tracking-tighter text-foreground">
                Ferrari’s <span className="text-[#E60000]">Electric Future</span>: Why The Luce Marks A Historic Turning Point
              </h1>
            </Reveal>

            <Reveal y={30} delay={0.2}>
              {/* Sub-summary */}
              <p className="text-[17px] md:text-[19px] text-[#A1A1AA] leading-relaxed font-normal">
                This is not simply another car launch. It is a cinematic glimpse into how even the most iconic, heritage-focused brands in the world adapt and redefine themselves when confronted by a shifting technological horizon.
              </p>
            </Reveal>

            {/* Swiss Grid Metadata Box */}
            <Reveal y={35} delay={0.3}>
              <div className="grid grid-cols-3 gap-6 font-mono text-[10px] tracking-[0.15em] text-[#9CA3AF] uppercase border-t border-b border-border py-6">
                <div>
                  <span className="text-[#9CA3AF] block mb-1">Author</span>
                  <div className="flex items-center gap-1.5 text-foreground font-bold">
                    <User className="w-3.5 h-3.5 text-[#E60000]" />
                    <span>GrowXLabs</span>
                  </div>
                </div>
                <div>
                  <span className="text-[#9CA3AF] block mb-1">Read Time</span>
                  <div className="flex items-center gap-1.5 text-foreground font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#E60000]" />
                    <span>7 min read</span>
                  </div>
                </div>
                <div>
                  <span className="text-[#9CA3AF] block mb-1">Unveiled</span>
                  <div className="flex items-center gap-1.5 text-foreground font-bold">
                    <Calendar className="w-3.5 h-3.5 text-[#E60000]" />
                    <span>May 29, 2026</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal y={30} delay={0.2}>
            <EditorialImageFrame className="mt-12">
              <Image
                src="/images/blog-ferrari-luce-landscape.png"
                alt="Ferrari Luce electric future editorial artwork"
                fill
                priority
                sizes="(max-width: 767px) 100vw, (max-width: 1320px) 100vw, 1320px"
                className="object-contain object-center"
              />
            </EditorialImageFrame>
          </Reveal>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 2. MAIN CONTENT GRID                                */}
      {/* ═══════════════════════════════════════════════════ */}
      <main className="w-full px-6 md:px-10 xl:px-16 2xl:px-24 py-16">
        <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16 relative">
          
          {/* Left Table of Contents Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-32 h-fit">
            <TableOfContents headings={headings} />
          </aside>

          {/* Core Editorial Narrative */}
          <article className="col-span-12 lg:col-span-9 max-w-[70ch] mx-auto lg:mx-0">
            {/* Inline Table of Contents for Mobile */}
            <div className="lg:hidden mb-12 bg-card/60 border border-border rounded-xl p-6">
              <TableOfContents headings={headings} />
            </div>

            {/* ═══════════════════════════════════════════════════ */}
              {/* Main takeaway panel */}
            {/* ═══════════════════════════════════════════════════ */}
            <section id="executive-brief" className="scroll-mt-32 mb-12">
              <div className="bg-background border border-border rounded-xl p-6 md:p-8 font-mono space-y-6">
                <div className="flex items-center gap-2 border-b border-border pb-4">
                  <BarChart2 className="w-4 h-4 text-[#E60000]" />
                  <span className="text-[11px] font-bold tracking-[0.2em] text-[#E60000] uppercase">
                    THE MAIN CHANGE
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#A1A1AA] leading-relaxed">
                  <div className="space-y-3">
                    <span className="font-bold text-foreground block">1. THE CORE SHIFT</span>
                    <p>
                      Ferrari’s transition from mechanical V12 combustion engines to the <strong>Luce solid-state axial-flux platform</strong> represents a major shift in luxury engineering, trading thermal expansion dynamics for direct software-defined torque vectoring.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <span className="font-bold text-foreground block">2. KEY PERFORMANCE METRICS</span>
                    <ul className="space-y-1.5 list-none pl-0">
                      <li className="flex justify-between border-b border-border/50 pb-1">
                        <span>Peak Output:</span>
                        <span className="font-bold text-foreground">1400 Horsepower</span>
                      </li>
                      <li className="flex justify-between border-b border-border/50 pb-1">
                        <span>Energy Density:</span>
                        <span className="font-bold text-foreground">480 Wh/kg (Solid-State)</span>
                      </li>
                      <li className="flex justify-between pb-1">
                        <span>Torque Latency:</span>
                        <span className="font-bold text-[#E60000]">1.2ms Sync Speed</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex items-start gap-2.5 text-[11px] text-[#A1A1AA] leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>What it means:</strong> Updating long-established manufacturing before the market forces the change is critical. Ferrari shows that protecting a brand&apos;s heritage and investing in new software can work together.
                  </p>
                </div>
              </div>
            </section>

            {/* Intro paragraph with large dropcap */}
            <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-8 font-lora">
              <p className="first-letter:text-6xl first-letter:font-black first-letter:text-[#E60000] first-letter:mr-3.5 first-letter:float-left first-letter:leading-[0.8] first-letter:mt-1 font-serif">
                For decades, Ferrari represented something larger than performance.
              </p>
              <p>
                It was the mechanical sound of a naturally aspirated, high-revving engine. It was limits pushed on the boundaries of mechanical tolerance. A visceral driving experience built around pure human emotion rather than digital convenience.
              </p>
              <p>
                That uncompromising identity helped Maranello become one of the most respected automotive brands and absolute symbols of luxury in the world.
              </p>
              <p>
                Now, Ferrari is entering a completely new chapter. The company has officially unveiled the <strong>Ferrari Luce</strong>, its first fully electric hypercar, signaling one of the biggest structural transformations in its history.
              </p>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* SECTION 1: More Than An Electric Vehicle           */}
            {/* ═══════════════════════════════════════════════════ */}
            <EditorialDivider label="Section 1" />
            
            <section id="more-than-ev" className="scroll-mt-32 space-y-6">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground leading-tight font-serif">
                More Than An Electric Vehicle
              </h2>
              
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  Most electric vehicle launches follow a predictable, highly commoditized formula. They highlight battery sizes in kilowatt-hours, high-speed charging curves, absolute ranges under testing cycles, and sprint performance numbers from zero to sixty.
                </p>
                <p>
                  But Ferrari's announcement operates in a different paradigm. The significance of the Luce is not about technical specifications. The significance is what it represents.
                </p>

                <QuoteBlock 
                  quote="Ferrari built its entire legacy on mechanical internal combustion excellence. Evolving from that foundation is the ultimate proof that no brand can protect the past forever."
                  attribution="GrowxLabs analysis"
                  role="Maranello Synthesis"
                />

                <p>
                  Many enthusiasts believed the company would be one of the last luxury manufacturers to fully embrace electrification. Instead, Ferrari has chosen to actively participate in shaping the future.
                </p>
                <p>
                  The Luce is proof that even legendary brands cannot ignore technological shifts. Electrification is no longer a niche alternative; it is the fundamental medium of future automotive design.
                </p>
              </div>

              {/* SECTION 1 VISUAL BLOCK */}
              <Reveal y={20}>
                <div className="my-12 w-full text-left">
                  <CombustionToElectricVisual />
                </div>
              </Reveal>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* GEO COMPARATIVE TABLE MODULE                        */}
            {/* ═══════════════════════════════════════════════════ */}
            <section id="transition-matrix" className="scroll-mt-32 my-12 space-y-4">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase font-bold block">
                COMPARISON
              </span>
              
              <div className="w-full overflow-x-auto border border-border rounded-xl bg-transparent">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="bg-background border-b border-border text-foreground font-bold">
                      <th className="p-4">ENGINEERING PARAMETER</th>
                      <th className="p-4">V12 MECHANICAL CORE (OLD)</th>
                      <th className="p-4 text-[#E60000]">LUCE AXIAL-FLUX ELECTRIC (NEW)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-[#A1A1AA]">
                    <tr>
                      <td className="p-4 font-bold text-foreground">Power Density Core</td>
                      <td className="p-4">Mechanical displacement (~830 HP peak)</td>
                      <td className="p-4 text-[#E60000] font-bold">Triple Axial Flux motors (1400 HP peak)</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-foreground">Energy Medium</td>
                      <td className="p-4">Liquid hydrocarbon / Fuel combustion</td>
                      <td className="p-4">Solid-State structural battery matrix (480 Wh/kg)</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-foreground">Drivetrain Latency</td>
                      <td className="p-4">80-120ms (Mechanical gear sync and throttle)</td>
                      <td className="p-4 text-[#E60000] font-bold">1.2ms (Algorithmic direct current delivery)</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-foreground">Acoustic Profile</td>
                      <td className="p-4">Natural high-rev exhaust resonance (V12 note)</td>
                      <td className="p-4">Algorithmic structural resonators (Acoustic feedback)</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-foreground">Slip Yaw Controls</td>
                      <td className="p-4">Reactive hydraulic locking differentials</td>
                      <td className="p-4 text-[#E60000] font-bold">Proactive neural slip yaw controllers (Torque vector)</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-foreground">Carbon Footprint</td>
                      <td className="p-4">High local emissions profile</td>
                      <td className="p-4">Zero tailpipe emissions (Carbon-neutral supply chain)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* SECTION 2: Why Ferrari Had To Change               */}
            {/* ═══════════════════════════════════════════════════ */}
            <EditorialDivider label="Section 2" />

            <section id="why-ferrari-changed" className="scroll-mt-32 space-y-6">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground leading-tight font-serif">
                Why Ferrari Had To Change
              </h2>
              
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  The automotive industry is undergoing a structural disruption unlike anything seen in the last century. Governments are introducing stricter emissions limits, cities are proposing full internal combustion bans, and a new demographic of environmentally-conscious luxury buyers is asserting control of the market.
                </p>
                
                <InsightCallout variant="trend" label="Industry Realities">
                  Regulatory frameworks and global mandates are shifting too quickly for legacy systems to sustain. In the high-end luxury space, adaptation is not about compliance—it is about retaining brand sovereignty.
                </InsightCallout>

                <p>
                  The challenge facing Ferrari was clear: continue protecting the mechanical systems of the past or actively build the software-driven infrastructure of the future. The company chose the latter.
                </p>
                <p>
                  Rather than waiting for disruption to render their legacy systems obsolete, Ferrari is actively preparing for the next generation of luxury buyers. Evolving early allows them to define the rules of electric performance, rather than playing catch-up to newer, agile competitors.
                </p>
              </div>

              {/* SECTION 2 VISUAL BLOCK */}
              <Reveal y={20}>
                <div className="my-12 w-full text-left">
                  <TransformationTimelineVisual />
                </div>
              </Reveal>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* SECTION 3: The Internet Is Divided                */}
            {/* ═══════════════════════════════════════════════════ */}
            <EditorialDivider label="Section 3" />

            <section id="internet-divided" className="scroll-mt-32 space-y-6">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground leading-tight font-serif">
                The Internet Is Divided
              </h2>
              
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  The response to the Luce has been intense. For traditional purists, the move feels like an abandonment of the brand's core soul. They argue that electric motors cannot replace the organic acoustics, micro-vibrations, and mechanical connection of a high-revving Ferrari V12.
                </p>
                <p>
                  On the other side, technology visionaries acclaim the launch. They see the Luce as an inevitable, exciting integration of high-density solid-state batteries and intelligent chassis controls that will push lateral G-forces and handling dynamics beyond mechanical limits.
                </p>

                <InsightCallout variant="warning" label="Heritage Clash">
                  Every major technological transition in history has faced massive resistance. From the transition of horses to steam engines, or analog to digital watches, resistance eventually gives way to acceptance as the new medium demonstrates superior capabilities.
                </InsightCallout>

                <p>
                  Electrification does not mean losing the driving soul; it means discovering a different dimension of responsiveness. When software controls power delivery 1,000 times a second, the physical relationship between driver and machine becomes incredibly intimate.
                </p>
              </div>

              {/* SECTION 3 VISUAL BLOCK */}
              <Reveal y={20}>
                <div className="my-12 w-full text-left">
                  <OpinionNetworkVisual />
                </div>
              </Reveal>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* SECTION 4: Luxury Is Being Redefined               */}
            {/* ═══════════════════════════════════════════════════ */}
            <EditorialDivider label="Section 4" />

            <section id="luxury-redefined" className="scroll-mt-32 space-y-6">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground leading-tight font-serif">
                Luxury Is Being Redefined
              </h2>
              
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  The definition of luxury is undergoing a major paradigm shift. In previous decades, luxury was represented by raw mechanical excess: larger cylinder counts, massive displacements, high fuel consumption, and heavy chassis builds.
                </p>
                <p>
                  Today, luxury increasingly means:
                </p>
                <ul className="list-none space-y-3 pl-4 border-l-2 border-[#E60000]/30 font-sans text-[15px] text-[#A1A1AA]">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E60000]" />
                    <span>Intelligent software-defined chassis systems</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E60000]" />
                    <span>Conscious, sustainable craftsmanship</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E60000]" />
                    <span>Proprietary digital telemetry networks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E60000]" />
                    <span>Instantaneous, zero-lag kinetic control</span>
                  </li>
                </ul>
                <p>
                  Modern elite buyers expect technical innovation. Brands that fail to transition their interfaces and drivetrains risk looking like relics of a past century. The Luce is Ferrari's definitive attempt to bridge heritage prestige with high-end tech ecosystems.
                </p>
              </div>

              {/* SECTION 4 VISUAL BLOCK */}
              <Reveal y={20}>
                <div className="my-12 w-full text-left">
                  <LuxuryEcosystemVisual />
                </div>
              </Reveal>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* SECTION 5: What Businesses Can Learn               */}
            {/* ═══════════════════════════════════════════════════ */}
            <EditorialDivider label="Section 5" />

            <section id="business-lessons" className="scroll-mt-32 space-y-6">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground leading-tight font-serif">
                What Businesses Can Learn From Ferrari
              </h2>
              
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  The most profound takeaway from this transition extends far beyond automotive manufacturing. It applies directly to any modern organization: startups, agencies, enterprise platforms, and digital product builders.
                </p>
                <p>
                  Every successful company eventually confronts the critical question:
                </p>

                <WhyThisMatters>
                  Do we continue defending the legacy systems that made us successful yesterday, or do we willingly disrupt ourselves to build what will matter tomorrow?
                </WhyThisMatters>

                <p>
                  Many organizations fall victim to their own historical success. They protect old workflows, resist incorporating artificial intelligence or automation, and delay infrastructure migrations to avoid immediate friction. Eventually, faster competitors pass them by.
                </p>
                <p>
                  Ferrari's strategy shows the correct path. They are retrofitting their manufacturing capabilities, investing in software R&D, and re-educating their artisanal engineering talents <em>while they are still highly profitable</em>.
                </p>
              </div>

              {/* SECTION 5 VISUAL BLOCK */}
              <Reveal y={20}>
                <div className="my-12 w-full text-left">
                  <AdaptationOSVisual />
                </div>
              </Reveal>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* SECTION 6: The Bigger Picture                      */}
            {/* ═══════════════════════════════════════════════════ */}
            <EditorialDivider label="Section 6" />

            <section id="bigger-picture" className="scroll-mt-32 space-y-6">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground leading-tight font-serif">
                The Bigger Picture
              </h2>
              
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  The Ferrari Luce represents something much wider than a premium vehicle release. It is the ultimate collision between legacy craftsmanship and deep software innovation.
                </p>
                <p>
                  It serves as a stark reminder: no industry is immune to technological disruption. Whether it is automotive engineering, enterprise software development, content media, or global digital business, the future belongs entirely to organizations that choose to adapt.
                </p>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* SECTION 7: Final Thoughts                          */}
            {/* ═══════════════════════════════════════════════════ */}
            <EditorialDivider label="Section 7" />

            <section id="final-thoughts" className="scroll-mt-32 space-y-6">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground leading-tight font-serif">
                Final Thoughts
              </h2>
              
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  The Ferrari Luce will likely be remembered as one of the most important product decisions of this decade. Not because it is electric or controversial, but because it represents the courage to transform.
                </p>
                <p>
                  The future does not wait for legacy players to feel comfortable. Ferrari has made its choice, setting a new benchmark for brand adaptation. The only remaining question is whether the rest of the industry is ready to do the same.
                </p>

                <div className="pt-6 font-mono text-sm font-bold text-[#E60000]">
                  — GrowxLabs Engineering Team
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* 3. FAQ ACCORDION SECTION                           */}
            {/* ═══════════════════════════════════════════════════ */}
            <EditorialDivider label="FAQ" />

            <section id="faq" className="scroll-mt-32 space-y-6">
              <div className="border-b border-border pb-4">
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase font-bold">
                  Perfect SEO Verification // Q&A
                </span>
                <h3 className="text-2xl font-black text-foreground mt-1 font-serif">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="w-full text-left bg-card border border-border rounded-xl p-6">
                <AccordionFAQ items={faqData} />
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* 4. RELATED ARTICLES GRID                            */}
            {/* ═══════════════════════════════════════════════════ */}
            <EditorialDivider label="Keep Reading" />

            <section className="space-y-6">
              <h4 className="text-xs font-mono tracking-[0.2em] text-[#9CA3AF] uppercase font-bold">
                More Editorial Deep-Dives
              </h4>
              <RelatedArticlesGrid articles={relatedArticles} />
            </section>
          </article>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 5. BOTTOM CONSTRUCT STUDIO CTA                      */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-6 mt-20 border-t border-border pt-16">
        <Reveal y={20}>
          <div className="bg-background rounded-2xl p-8 md:p-12 border border-border text-center space-y-6 relative overflow-hidden">
                {/* Subtle background detail */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border border-border/50 pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full border border-border/50 pointer-events-none" />

            <span className="text-[11px] font-mono tracking-[0.2em] text-[#E60000] uppercase font-bold bg-[#E60000]/5 px-3 py-1 rounded">
              Construct Your Future OS
            </span>
            
            <h3 className="text-[28px] md:text-[36px] font-black tracking-tight leading-tight text-foreground font-serif">
              Engineering AI-native dynamics<br />and production software platforms.
            </h3>
            
            <p className="text-[#A1A1AA] text-[15px] max-w-lg mx-auto leading-relaxed">
              Work directly with the GrowXLabs software engineering team to deploy autonomous background agents, scale backend systems, and build state-of-the-art software platforms.
            </p>
            
            <div className="pt-4">
              <Link href="/contact">
                <Button className="bg-[#1A1A1A] hover:bg-[#E60000] text-white rounded-md px-8 h-12 text-[15px] font-bold transition-all duration-300 inline-flex items-center gap-2 hover:gap-3">
                  Deploy Your System <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
