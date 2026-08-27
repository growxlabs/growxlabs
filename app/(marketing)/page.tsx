import { ServiceCard } from "@/components/ui/ServiceCard";
import { Link } from "@/navigation";
import { projects } from "@/lib/data/projects";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { AEOBlock } from "@/components/marketing/AEOBlock";
import { HeroSection } from "@/components/marketing/HeroSection";
import { SectionG } from "@/components/marketing/SectionG";
import { SectionR } from "@/components/marketing/SectionR";
import { SectionO } from "@/components/marketing/SectionO";
import { SectionW } from "@/components/marketing/SectionW";
import { SectionX } from "@/components/marketing/SectionX";
import { ValuePropositions } from "@/components/marketing/ValuePropositions";
import { AccordionFAQ } from "@/components/marketing/AccordionFAQ";
import { AnimatedSection, AnimatedStagger, AnimatedItem } from "@/components/marketing/AnimatedSection";
import { Feature1 } from "@/components/ui/feature-1";
import { locales } from "@/navigation";
import Script from "next/script";
import { ArrowUpRight } from "lucide-react";

export async function generateMetadata() {
  return {
    title: "GrowxLabs — AI-Native Software Company | Product Studio | AI Engineering Lab",
    description: "GrowxLabs is an AI-native software company, product studio, and engineering lab. We build enterprise AI applications, secure integrations, and production software capabilities.",
    keywords: "custom enterprise AI software company, AI-native enterprise application development, legacy system modernization company, enterprise software development studio, enterprise workflow automation software, custom agentic workflows for legacy databases, enterprise AI systems integrator, private LLM deployment, AI-native software company, product studio, AI engineering lab, GrowxLabs",
    alternates: {
      canonical: "https://growxlabs.tech"
    }
  };
}

export default function Home() {
  const faqData = [
    {
      question: "What is GrowxLabs and what does the studio do?",
      answer: "GrowxLabs is an AI-native software company, product studio, and engineering lab. We research, design, and engineer custom enterprise software, production web platforms, intelligent workflows, and multi-agent systems designed for scale and operational continuity."
    },
    {
      question: "How does GrowxLabs collaborate with engineering and product teams?",
      answer: "We operate as an AI-native software lab that prioritizes production-grade software. We collaborate directly with founders, CTOs, and technical leaders, building modular, maintainable architectures with clear governance, rigorous testing, and observable deployment."
    },
    {
      question: "What industries does GrowxLabs engineer systems for?",
      answer: "We build systems across fintech, enterprise logistics, manufacturing, healthcare, technology infrastructure, and commerce, engineering tailored software architectures that solve complex domain constraints."
    },
    {
      question: "How does GrowxLabs handle enterprise modernization and legacy systems?",
      answer: "We evaluate existing software architecture, map operational workflows, and engineer targeted AI capabilities and secure API integrations that connect with existing databases, ERPs, and cloud environments without disruptive migrations."
    },
    {
      question: "What software and AI capabilities does GrowxLabs develop?",
      answer: "We engineer custom enterprise applications, autonomous background agent harnesses, high-performance web platforms, document intelligence systems, and secure platform integrations connecting enterprise systems."
    },
    {
      question: "What technologies and architecture patterns does GrowxLabs use?",
      answer: "We build with modern production technologies: TypeScript, Next.js, Node.js, Python, PostgreSQL, Redis, vector systems, multi-agent frameworks, frontier LLM architectures, and major cloud providers (AWS, GCP, Vercel)."
    },
    {
      question: "How do we start an engagement with GrowxLabs?",
      answer: "Contact us at sai@growxlabs.tech or through our contact page to discuss your technical requirements, architectural constraints, and engineering scope."
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="flex flex-col">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ═══ HERO (studio + brand only) ═══ */}
      <HeroSection />

      {/* ═══ Swiss-Editorial Sections (G, R, O, W, X) ═══ */}
      <SectionG />
      <SectionR />
      <SectionO />
      <SectionW />
      <SectionX />



      {/* ═══ EXPLORE NAVIGATIONS ═══ */}
      <section className="w-full py-24 px-6 md:px-10 xl:px-16 2xl:px-24 bg-background">
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-[12px] font-semibold uppercase tracking-[0.15em] text-primary mb-3 block">OUR WORK</span>
            <h2 className="text-[clamp(28px,4vw,42px)] font-sans font-black text-foreground tracking-tight">Explore Our Projects</h2>
          </AnimatedSection>
          
          <AnimatedStagger className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* PORTFOLIO CARD */}
            <AnimatedItem>
              <Link href="/portfolio" className="group block h-full">
                <div className="relative h-full flex flex-col justify-between bg-[#111111] text-white border border-white/5 rounded-2xl p-8 md:p-10 overflow-hidden shadow-2xl transition-[border-color,background-image,box-shadow] duration-500 hover:border-[#C0F0FB]/35 hover:bg-[radial-gradient(circle_at_top_right,rgba(192,240,251,0.06),transparent_60%)] min-h-[460px]">
                  {/* Top line with title and circular arrow */}
                  <div className="flex justify-between items-start z-10">
                    <h3 className="text-[clamp(28px,3vw,38px)] font-sans font-black tracking-tight leading-[1.05] max-w-[280px]">
                      Explore Our Portfolio
                    </h3>
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-[#C0F0FB] group-hover:text-black group-hover:border-[#C0F0FB] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Central geometric SVG animation - GPU safe opacity transition */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] group-hover:opacity-[0.16] transition-opacity duration-700">
                    <svg viewBox="0 0 100 100" className="w-72 h-72 text-white group-hover:text-[#C0F0FB] group-hover:scale-[1.03] transition-all duration-700" fill="none" stroke="currentColor" strokeWidth="0.5">
                      <path d="M50 10 L90 50 L50 90 L10 50 Z" />
                      <path d="M50 20 L80 50 L50 80 L20 50 Z" />
                      <path d="M50 30 L70 50 L50 70 L30 50 Z" />
                      <path d="M50 40 L60 50 L50 60 L40 50 Z" />
                      <line x1="50" y1="10" x2="50" y2="90" />
                      <line x1="10" y1="50" x2="90" y2="50" />
                      <line x1="20" y1="50" x2="50" y2="20" />
                      <line x1="80" y1="50" x2="50" y2="20" />
                      <line x1="20" y1="50" x2="50" y2="80" />
                      <line x1="80" y1="50" x2="50" y2="80" />
                    </svg>
                  </div>

                  {/* Bottom description & status indicators */}
                  <div className="z-10 mt-auto pt-16">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4 font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase">
                      <span>[ EXPLORE ]</span>
                      <span>[ CLIENT WORK ]</span>
                    </div>
                    <p className="text-white/70 text-[15px] leading-relaxed max-w-md font-sans">
                      Discover custom software, autonomous AI agents, and secure integrations engineered for global brands.
                    </p>
                  </div>
                </div>
              </Link>
            </AnimatedItem>

            {/* LABS CARD */}
            <AnimatedItem>
              <Link href="/ailab" className="group block h-full">
                <div className="relative h-full flex flex-col justify-between bg-[#111111] text-white border border-white/5 rounded-2xl p-8 md:p-10 overflow-hidden shadow-2xl transition-[border-color,background-image,box-shadow] duration-500 hover:border-[#6366F1]/35 hover:bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.06),transparent_60%)] min-h-[460px]">
                  {/* Top line with title and circular arrow */}
                  <div className="flex justify-between items-start z-10">
                    <h3 className="text-[clamp(28px,3vw,38px)] font-sans font-black tracking-tight leading-[1.05] max-w-[280px]">
                      Explore Our Labs
                    </h3>
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-[#6366F1] group-hover:text-white group-hover:border-[#6366F1] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Central geometric SVG animation - GPU safe opacity transition */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] group-hover:opacity-[0.16] transition-opacity duration-700">
                    <svg viewBox="0 0 100 100" className="w-72 h-72 text-white group-hover:text-[#6366F1] group-hover:scale-[1.03] transition-all duration-700" fill="none" stroke="currentColor" strokeWidth="0.5">
                      <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" />
                      <line x1="50" y1="50" x2="50" y2="10" />
                      <line x1="50" y1="50" x2="85" y2="30" />
                      <line x1="50" y1="50" x2="85" y2="70" />
                      <line x1="50" y1="50" x2="50" y2="90" />
                      <line x1="50" y1="50" x2="15" y2="70" />
                      <line x1="50" y1="50" x2="15" y2="30" />
                      <polygon points="50,25 72,37 72,63 50,75 28,63 28,37" />
                      <circle cx="50" cy="50" r="1.5" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Bottom description & status indicators */}
                  <div className="z-10 mt-auto pt-16">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4 font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase">
                      <span>[ EXPLORE ]</span>
                      <span>[ OWN PRODUCTS ]</span>
                    </div>
                    <p className="text-white/70 text-[15px] leading-relaxed max-w-md font-sans">
                      Test and use proprietary AI SaaS platforms, experimental research tools, and open-source models crafted by our studio.
                    </p>
                  </div>
                </div>
              </Link>
            </AnimatedItem>
          </AnimatedStagger>
        </div>
      </section>
      <AnimatedSection>
        <Feature1 />
      </AnimatedSection>

      {/* ═══ FAQ — Accordion ═══ */}
      <section className="w-full py-24 px-6 md:px-10 xl:px-16 2xl:px-24">
        <div className="max-w-[1400px] mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-[clamp(28px,4vw,36px)] font-bold text-foreground mb-4 tracking-tight">Common Questions</h2>
            <p className="text-muted-foreground text-[16px]">Everything you need to know about working with us.</p>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <AccordionFAQ items={faqData} />
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="text-center mt-12">
            <Link 
              href="/faq" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-border bg-background hover:bg-card text-foreground text-[12px] font-bold tracking-[0.15em] uppercase transition-all shadow-sm active:scale-95 group font-mono"
            >
              <span>View All FAQs</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ AEO — Hidden, SEO only ═══ */}
      <section className="sr-only" aria-hidden="true">
        <div className="max-w-5xl mx-auto">
          <AEOBlock question="What does GrowxLabs actually do?" answer="GrowxLabs researches, designs, and engineers AI-native software, digital platforms, and intelligent workflows for organizations." explanation="We combine product engineering, AI engineering, and systems integration to move complex ideas from architecture to production." example="A team brings an operational constraint → we map the workflow → engineer the capability → deploy it into the existing environment." ctaText="Discuss an engagement" ctaHref="/contact" />
          <AEOBlock question="How does GrowxLabs approach web platform engineering?" answer="We engineer production-grade web applications and digital platforms for performance, accessibility, reliability, and scale." explanation="Web engineering is treated as a software discipline: clear architecture, secure integrations, observable delivery, and maintainable systems." example="A platform is designed around its users, data flows, integrations, and operational requirements before it is released." ctaText="Explore our services" ctaHref="/services" />
          <AEOBlock question="How does GrowxLabs support modernization?" answer="We assess legacy environments, identify high-value opportunities, and deliver practical AI and software capabilities that integrate with existing applications and data." explanation="The work is staged around technical feasibility, governance, and measurable operational outcomes." example="An existing process is mapped → integration constraints are documented → a focused capability is piloted → the architecture is extended deliberately." ctaText="Start a conversation" ctaHref="/contact" />
        </div>
      </section>
    </div>
  );
}
