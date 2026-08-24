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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const languages: Record<string, string> = {
    'x-default': 'https://growxlabs.tech/en-IN',
  };
  locales.forEach((l) => {
    languages[l] = `https://growxlabs.tech/${l}`;
  });

  return {
    title: "GrowxLabs Tech — AI-native Software Company, Product Studio & AI Engineering Lab | Custom Enterprise Applications",
    description: "GrowxLabs Tech is an AI-native software company, product studio, and engineering lab. We build enterprise AI applications, secure integrations, and production software capabilities.",
    keywords: "custom enterprise AI software company, AI-native enterprise application development, legacy system modernization company, enterprise software development studio, AI applications for manufacturing legacy systems, custom AI software for manufacturing ERP, manufacturing workflow automation software, secure enterprise RAG systems, custom agentic workflows for legacy databases, enterprise AI systems integrator, private LLM deployment, AI-native software company, product studio, AI engineering lab, GrowXLabsTech",
    alternates: {
      canonical: "https://growxlabs.tech/en-IN",
      languages
    }
  };
}

export default function Home() {
  const faqData = [
    {
      question: "What is GrowX Labs Tech and what services do you offer?",
      answer: "GrowX Labs Tech is a growing AI-native software company and product studio based in India. We specialize in custom software development, AI agent engineering, intelligent automation solutions, and mobile and web application development. We combine deep AI expertise with rapid product development to ship production-ready solutions in weeks, built to scale from day one. We don't build off-the-shelf systems. We build products."
    },
    {
      question: "How is GrowX Labs Tech different from other consultancies?",
      answer: "Traditional IT firms often operate as body shops or spend months writing discovery documents before writing any code. We do the opposite: we are an AI-first software lab that prioritizes working software. Within 24 hours of kickoff, you get a functional prototype, and we deploy complete, scalable production systems in 2 to 8 weeks. Every engineer on our team has been building with LLMs and neural architectures natively from day one—we don't 'retrofit' AI into legacy software. When you build with us, you collaborate directly with the core developers writing your code, eliminating project management overhead and junior developer errors."
    },
    {
      question: "What industries does GrowX Labs Tech work with?",
      answer: "We work across multiple sectors including fintech, e-commerce, healthcare, retail, manufacturing, logistics, education, and professional services. Our AI solutions are industry-agnostic but highly customisable: whether you need intelligent document processing for banking, AI-powered inventory management for retail, or automated customer support for SaaS, we build solutions tailored to your specific domain requirements."
    },
    {
      question: "Can GrowX Labs Tech help with enterprise AI implementation and digital transformation?",
      answer: "Yes. We help mid-size companies and enterprise teams deploy AI across their operations. This covers AI strategy consulting, workflow automation, intelligent process automation (IPA), custom LLM deployment, RAG systems for enterprise knowledge management, and AI-driven analytics dashboards. We start with a discovery sprint to identify high-impact opportunities, then deliver proof-of-concept systems designed to scale."
    },
    {
      question: "What AI and automation solutions does GrowX Labs Tech build?",
      answer: "We engineer custom AI agents for service operations, knowledge workflows, document processing, data extraction, and application integrations. Our capabilities connect with platforms such as Salesforce, HubSpot, Zoho, SAP, and custom enterprise applications."
    },
    {
      question: "How much does custom software development cost at GrowX Labs Tech?",
      answer: "Our custom software development projects typically start at ₹1 lakh (approximately $1,200 USD) for focused AI agents and automations. Mid-complexity web and mobile applications range from ₹3-10 lakhs, while enterprise-grade platforms with multiple integrations start at ₹10 lakhs and above. We offer transparent pricing upfront based on scope, providing highly competitive rates compared to traditional IT consultancies while delivering faster results."
    },
    {
      question: "What is the typical project timeline for software development?",
      answer: "We operate at high velocity. AI agents and automations typically take 1-2 weeks; web applications and MVPs take 4-6 weeks; and complex enterprise systems require 8-12 weeks. We deliver a working prototype within 24-48 hours of kickoff so you can validate the direction early, and our iterative development ensures you see regular progress every few days."
    },
    {
      question: "Does GrowX Labs Tech provide ongoing support and maintenance?",
      answer: "Yes. We provide flexible support and maintenance plans that cover bug fixes, performance monitoring, security updates, feature enhancements, and 24/7 incident response for business-critical systems. Many clients begin with an initial build phase and transition to a monthly retainer to ensure continuous system optimization and ongoing support."
    },
    {
      question: "Can you build AI chatbots and virtual assistants for customer service?",
      answer: "Absolutely. We design and deploy intelligent customer support systems that handle FAQs, order tracking, appointment scheduling, complaint resolution, and complex multi-turn conversations. Our AI assistants integrate directly with the WhatsApp Business API, web chat, email, Slack, and Microsoft Teams. They learn from your proprietary knowledge base and escalate to human agents only when necessary, reducing customer support costs by 40-70%."
    },
    {
      question: "Do you offer AI consulting and strategy services?",
      answer: "Yes. Our AI consulting services include AI readiness assessments, use-case prioritization, technology stack recommendations, build-vs-buy analysis, AI governance frameworks, and implementation roadmaps. We help leadership teams understand where AI can drive the most value and construct actionable plans to achieve it, whether that involves engineering custom solutions or integrating existing AI tools."
    },
    {
      question: "What technologies and frameworks does GrowX Labs Tech use?",
      answer: "We work with modern, production-grade technologies: React, Next.js, Node.js, Python, and TypeScript for applications; OpenAI, Anthropic Claude, and open-source LLMs for AI; PostgreSQL, MongoDB, and Redis for databases; AWS, Google Cloud, and Vercel for infrastructure; and tools like LangChain and LlamaIndex for AI orchestration. We choose the right stack for each project based on requirements, avoiding vendor lock-in."
    },
    {
      question: "How do I get started with GrowX Labs Tech?",
      answer: "Contact us at sai@growxlabs.tech or through our website contact form. We will schedule a 30-minute discovery call to understand your requirements, assess fit, and outline a preliminary technical approach. If we are aligned, we can deliver a proposal within 48 hours and start work within a week, bypassing lengthy procurement processes or multi-month sales cycles."
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

  const mainServices = [
    {
      title: "AI & Automation",
      description: "Intelligent workflows and AI capabilities that reduce operational friction and improve execution.",
      iconName: "settings",
    },
    {
      title: "Technical SEO",
      description: "Dominant search visibility engineered to capture high-intent traffic and revenue.",
      iconName: "trending",
    },
    {
      title: "Cloud Infrastructure",
      description: "Secure, scalable infrastructure designed for reliability, observability, and operational continuity.",
      iconName: "server",
    },
  ];

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
          <AEOBlock question="What does GrowXLabsTech actually do?" answer="GrowXLabsTech researches, designs, and engineers AI-native software, digital platforms, and intelligent workflows for organizations." explanation="We combine product engineering, AI engineering, and systems integration to move complex ideas from architecture to production." example="A team brings an operational constraint → we map the workflow → engineer the capability → deploy it into the existing environment." ctaText="Discuss an engagement" ctaHref="/contact" />
          <AEOBlock question="How does GrowXLabsTech approach web engineering?" answer="We engineer production-grade web applications and digital platforms for performance, accessibility, reliability, and scale." explanation="Web engineering is treated as a software discipline: clear architecture, secure integrations, observable delivery, and maintainable systems." example="A platform is designed around its users, data flows, integrations, and operational requirements before it is released." ctaText="Explore our services" ctaHref="/services" />
          <AEOBlock question="How does GrowXLabsTech support modernization?" answer="We assess legacy environments, identify high-value opportunities, and deliver practical AI and software capabilities that integrate with existing applications and data." explanation="The work is staged around technical feasibility, governance, and measurable operational outcomes." example="An existing process is mapped → integration constraints are documented → a focused capability is piloted → the architecture is extended deliberately." ctaText="Start a conversation" ctaHref="/contact" />
        </div>
      </section>
    </div>
  );
}
