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
import Script from "next/script";
import { ArrowUpRight } from "@/components/icons";

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
      question: "What is GrowxLabs and what services do you offer?",
      answer: "GrowxLabs is an AI-native software company and product studio based in India. We specialize in custom software development, AI agent engineering, intelligent automation solutions, and mobile and web application development. We combine deep AI expertise with rapid product development to ship production-ready solutions, built to scale from day one. We don't build off-the-shelf systems. We build products."
    },
    {
      question: "How is GrowxLabs different from other consultancies?",
      answer: "Traditional IT firms often operate as body shops or spend months writing discovery documents before writing any code. We do the opposite: we are an AI-first software lab that prioritizes working software. Within 24 hours of kickoff, you get a functional prototype, and we deploy complete, scalable production systems. Every engineer on our team has been building with LLMs and neural architectures natively from day one—we don't 'retrofit' AI into legacy software. When you build with us, you collaborate directly with the core developers writing your code, eliminating project management overhead and junior developer errors."
    },
    {
      question: "What industries does GrowxLabs work with?",
      answer: "We work across multiple sectors including fintech, e-commerce, healthcare, retail, manufacturing, logistics, education, and professional services. Our AI solutions are industry-agnostic but highly customisable: whether you need intelligent document processing for banking, AI-powered inventory management for retail, or automated customer support for SaaS, we build solutions tailored to your specific domain requirements."
    },
    {
      question: "Can GrowxLabs help with enterprise AI implementation and digital transformation?",
      answer: "Yes. We help mid-size companies and enterprise teams deploy AI across their operations. This covers AI strategy consulting, workflow automation, intelligent process automation (IPA), custom LLM deployment, RAG systems for enterprise knowledge management, and AI-driven analytics dashboards. We start with a discovery sprint to identify high-impact opportunities, then deliver proof-of-concept systems designed to scale."
    },
    {
      question: "What AI and automation solutions does GrowxLabs build?",
      answer: "We engineer custom AI agents for service operations, knowledge workflows, document processing, data extraction, and application integrations. Our capabilities connect with platforms such as Salesforce, HubSpot, Zoho, SAP, and custom enterprise applications."
    },
    {
      question: "How much does custom software development cost at GrowxLabs?",
      answer: "Our custom software development projects typically start at ₹1 lakh (approximately $1,200 USD) for focused AI agents and automations. Mid-complexity web and mobile applications range from ₹3-10 lakhs, while enterprise-grade platforms with multiple integrations start at ₹10 lakhs and above. We offer transparent pricing upfront based on scope, providing highly competitive rates compared to traditional IT consultancies while delivering faster results."
    },
    {
      question: "What is the typical project timeline for software development?",
      answer: "We operate at high velocity. AI agents and automations typically take 1-2 weeks; web applications and MVPs take 4-6 weeks; and complex enterprise systems require 8-12 weeks. We deliver a working prototype within 24-48 hours of kickoff so you can validate the direction early, and our iterative development ensures you see regular progress every few days."
    },
    {
      question: "Does GrowxLabs provide ongoing support and maintenance?",
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
      question: "What technologies and frameworks does GrowxLabs use?",
      answer: "We work with modern, production-grade technologies: React, Next.js, Node.js, Python, and TypeScript for applications; OpenAI, Anthropic Claude, and open-source LLMs for AI; PostgreSQL, MongoDB, and Redis for databases; AWS, Google Cloud, and Vercel for infrastructure; and tools like LangChain and LlamaIndex for AI orchestration. We choose the right stack for each project based on requirements, avoiding vendor lock-in."
    },
    {
      question: "How do I get started with GrowxLabs?",
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

  return (
    <div className="flex flex-col bg-black text-foreground min-h-screen">
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



      {/* ═══ PRACTICE AREAS & DIVISIONS ═══ */}
      <section className="w-full py-24 px-6 md:px-10 xl:px-16 2xl:px-24 bg-black border-t border-white/10">
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-[clamp(32px,4vw,48px)] font-sans font-bold text-white tracking-tight">
              Client Solutions & Proprietary Labs
            </h2>
          </AnimatedSection>
          
          <AnimatedStagger className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl xl:max-w-7xl mx-auto">
            {/* PORTFOLIO CARD */}
            <AnimatedItem>
              <Link href="/portfolio" className="group block h-full">
                <div className="relative h-full flex flex-col justify-between bg-[#0c0c0e] text-white border border-white/10 rounded-[24px] p-10 md:p-12 lg:p-14 overflow-hidden shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)] transition-all duration-300 hover:border-white/20 hover:bg-[#101014] min-h-[460px] md:min-h-[500px]">
                  {/* Top Bar: Eyebrow + Title + Arrow */}
                  <div className="flex justify-between items-start z-10 gap-6">
                    <div>
                      <span className="font-mono text-xs tracking-[0.2em] text-white/45 uppercase block mb-3">
                        [ 01 / CLIENT ENGAGEMENTS ]
                      </span>
                      <h3 className="text-2xl sm:text-3xl md:text-[32px] lg:text-[36px] font-sans font-bold tracking-tight leading-tight text-white">
                        Production Software & AI Systems
                      </h3>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-white/15 bg-white/5 flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Bottom Bar: Meta & Description */}
                  <div className="z-10 mt-auto pt-20">
                    <div className="flex justify-between items-center pb-3 mb-4 font-mono text-xs tracking-[0.18em] text-white/40 uppercase border-b border-white/10">
                      <span>[ CASE STUDIES ]</span>
                      <span className="text-white/60 group-hover:text-white transition-colors">VIEW WORK →</span>
                    </div>
                    <p className="text-white/70 text-base md:text-[17px] leading-relaxed font-sans max-w-xl">
                      Custom software architectures, autonomous AI workflows, and secure integrations engineered with senior-developer velocity.
                    </p>
                  </div>
                </div>
              </Link>
            </AnimatedItem>

            {/* LABS CARD */}
            <AnimatedItem>
              <Link href="/ailab" className="group block h-full">
                <div className="relative h-full flex flex-col justify-between bg-[#0c0c0e] text-white border border-white/10 rounded-[24px] p-10 md:p-12 lg:p-14 overflow-hidden shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)] transition-all duration-300 hover:border-white/20 hover:bg-[#101014] min-h-[460px] md:min-h-[500px]">
                  {/* Top Bar: Eyebrow + Title + Arrow */}
                  <div className="flex justify-between items-start z-10 gap-6">
                    <div>
                      <span className="font-mono text-xs tracking-[0.2em] text-white/45 uppercase block mb-3">
                        [ 02 / RESEARCH & VENTURES ]
                      </span>
                      <h3 className="text-2xl sm:text-3xl md:text-[32px] lg:text-[36px] font-sans font-bold tracking-tight leading-tight text-white">
                        Proprietary AI Labs & Products
                      </h3>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-white/15 bg-white/5 flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Bottom Bar: Meta & Description */}
                  <div className="z-10 mt-auto pt-20">
                    <div className="flex justify-between items-center pb-3 mb-4 font-mono text-xs tracking-[0.18em] text-white/40 uppercase border-b border-white/10">
                      <span>[ STUDIO LABS ]</span>
                      <span className="text-white/60 group-hover:text-white transition-colors">EXPLORE LAB →</span>
                    </div>
                    <p className="text-white/70 text-base md:text-[17px] leading-relaxed font-sans max-w-xl">
                      Test and use proprietary AI SaaS platforms, experimental research tools, and open-source models incubated by our studio.
                    </p>
                  </div>
                </div>
              </Link>
            </AnimatedItem>
          </AnimatedStagger>
        </div>
      </section>

      {/* ═══ FAQ — Accordion (360labs.dev Swiss-editorial layout) ═══ */}
      <section className="w-full py-24 sm:py-32 px-6 md:px-10 xl:px-16 2xl:px-24 bg-black border-t border-white/10">
        <div className="max-w-[1400px] mx-auto">
          {/* Eyebrow Bar: { FAQ } — { GROWXLABS } — SUPPORT */}
          <div className="flex items-center justify-between font-mono text-[11px] sm:text-xs tracking-[0.22em] text-white/40 uppercase mb-12 sm:mb-16 select-none">
            <span>{`{ FAQ }`}</span>
            <span className="text-white/60 font-semibold">{`{ GROWXLABS }`}</span>
            <span>SUPPORT</span>
          </div>

          {/* Asymmetric Header: Giant 3-Line Heading + Subtext on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end pb-12 sm:pb-16 border-b border-white/10 mb-2">
            <div className="lg:col-span-7 xl:col-span-8">
              <h2 className="font-sans font-bold tracking-tight text-white leading-[0.96] text-[clamp(44px,6.5vw,84px)]">
                Frequently<br />
                Asked<br />
                Questions
              </h2>
            </div>
            <div className="lg:col-span-5 xl:col-span-4 lg:pb-3">
              <p className="font-sans text-[15px] sm:text-[17px] text-white/60 leading-relaxed max-w-md">
                Got questions? We have got answers. If you do not find what you are looking for, feel free to reach out.
              </p>
            </div>
          </div>

          <AnimatedSection delay={0.15}>
            <AccordionFAQ items={faqData} />
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="text-center mt-14 sm:mt-16">
            <Link 
              href="/faq" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 text-white text-[12px] font-bold tracking-[0.15em] uppercase transition-all shadow-sm active:scale-95 group font-mono"
            >
              <span>View All FAQs</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ AEO — Hidden, SEO only ═══ */}
      <section className="sr-only" aria-hidden="true">
        <div className="max-w-5xl mx-auto">
          <AEOBlock question="What does GrowxLabs actually do?" answer="GrowxLabs researches, designs, and engineers AI-native software, digital platforms, and intelligent workflows for organizations." explanation="We combine product engineering, AI engineering, and systems integration to move complex ideas from architecture to production." example="A team brings an operational constraint → we map the workflow → engineer the capability → deploy it into the existing environment." ctaText="Discuss an engagement" ctaHref="/contact" />
          <AEOBlock question="How does GrowxLabs approach web platform engineering?" answer="We engineer production-grade web applications and digital platforms for performance, accessibility, reliability, and scale." explanation="Web platform engineering is treated as a software discipline: clear architecture, secure integrations, observable delivery, and maintainable systems." example="A platform is designed around its users, data flows, integrations, and operational requirements before it is released." ctaText="Explore our services" ctaHref="/services" />
          <AEOBlock question="How does GrowxLabs support modernization?" answer="We assess legacy environments, identify high-value opportunities, and deliver practical AI and software capabilities that integrate with existing applications and data." explanation="The work is staged around technical feasibility, governance, and measurable operational outcomes." example="An existing process is mapped → integration constraints are documented → a focused capability is piloted → the architecture is extended deliberately." ctaText="Start a conversation" ctaHref="/contact" />
        </div>
      </section>
    </div>
  );
}
