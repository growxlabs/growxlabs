import React from "react";
import Image from "next/image";
import Script from "next/script";
import { Link } from "@/navigation";
import { 
  ReadingProgressBar, 
  TableOfContents, 
  CopyCodeButton 
} from "@/components/marketing/BlogInteractive";
import { Reveal } from "@/components/marketing/Reveal";
import { ArrowRight, Calendar, Clock, User, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FlickerText } from "@/components/marketing/FlickerText";
import { AccordionFAQ } from "@/components/marketing/AccordionFAQ";
import { InteractiveIOArchitecture } from "@/components/marketing/InteractiveIOArchitecture";

// ═══════════════════════════════════════════════════
// METADATA GENERATOR (Perfect SEO / AEO Optimization)
// ═══════════════════════════════════════════════════
export async function generateMetadata() {
  const title = "Google I/O 2026: Gemini Spark, AI Agents & The Future of AI-Native Development";
  const description = "Explore everything announced at Google I/O 2026 including Gemini 3.5 Flash, Gemini Spark, AI agents, multimodal AI, Antigravity, and the future of AI-native software development.";

  return {
    title: `${title} | GrowxLabs`,
    description,
    alternates: {
      canonical: "https://growxlabs.tech/blog/google-io-2026"
    },
    openGraph: {
      title,
      description,
      url: "https://growxlabs.tech/blog/google-io-2026",
      siteName: "GrowxLabs",
      type: "article",
      publishedTime: "2026-05-27T08:30:00.000Z",
      authors: ["GrowxLabs"],
      images: [
        {
          url: "https://growxlabs.tech/images/blog-google-io-2026.png",
          width: 1200,
          height: 630,
          alt: "Google I/O 2026 — The Beginning of the AI-Native Internet"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://growxlabs.tech/images/blog-google-io-2026.png"]
    }
  };
}

export default async function GoogleIOPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const titleName = "GOOGLE I/O";

  // Headings array for the Table of Contents scrollspy
  const headings = [
    { id: "biggest-shift", text: "From Search Engine to Execution Engine" },
    { id: "gemini-35-flash", text: "Gemini 3.5 Flash" },
    { id: "gemini-spark", text: "Gemini Spark Agent" },
    { id: "ai-agents-theme", text: "AI Agents as the Core Theme" },
    { id: "antigravity-tooling", text: "Antigravity Dev Framework" },
    { id: "gemini-omni-media", text: "Gemini Omni & Multimodal Media" },
    { id: "google-search-future", text: "Search Changing Forever" },
    { id: "business-impacts", text: "Why This Matters for Businesses" },
    { id: "bigger-picture", text: "The Bigger Picture" },
    { id: "final-thoughts", text: "Final Thoughts" },
    { id: "faq", text: "Frequently Asked Questions" }
  ];

  // Q&A data for both visual UI rendering and search-engine validation schema
  const faqData = [
    {
      question: "What is Gemini 3.5 Flash?",
      answer: "Gemini 3.5 Flash is Google's latest speed-optimized AI model, engineered specifically for real-time generative interfaces, autonomous coding, and complex agentic workflows."
    },
    {
      question: "What is Gemini Spark?",
      answer: "Gemini Spark is an autonomous 24/7 personal AI agent introduced by Google. It runs in the cloud even after you close your laptop, automating recurring workflows and background tasks across Workspace and external systems."
    },
    {
      question: "What is Antigravity at Google I/O 2026?",
      answer: "Antigravity is Google's new agent-first development environment that allows engineers to manage, orchestrate, and deploy collaborative networks of autonomous AI coding agents."
    }
  ];

  // Structured Data (JSON-LD) for SEO / AEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://growxlabs.tech/blog/google-io-2026/#article`,
        "headline": "Google I/O 2026: The Beginning of the AI-Native Internet",
        "description": "Explore everything announced at Google I/O 2026 including Gemini 3.5 Flash, Gemini Spark, AI agents, multimodal AI, Antigravity, and the future of AI-native software development.",
        "datePublished": "2026-05-27T08:30:00Z",
        "dateModified": "2026-05-27T08:30:00Z",
        "image": "https://growxlabs.tech/images/blog-google-io-2026.png",
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
          "@id": `https://growxlabs.tech/blog/google-io-2026`
        }
      },
      {
        "@type": "FAQPage",
        "@id": `https://growxlabs.tech/blog/google-io-2026/#faq`,
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

  const sparkCode = `// Initializing the 24/7 autonomous Gemini Spark Agent
import { GeminiSparkAgent } from "@google/generative-ai/agents";

const agent = new GeminiSparkAgent({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-3.5-flash",
  systemInstruction: "You are an autonomous operations engineer."
});

// Deploy the background agent to monitor Workspace emails & run n8n workflows
await agent.runBackgroundSession({
  triggers: {
    event: "email.received",
    condition: "subject.includes('urgency')"
  },
  actions: async (context) => {
    const analysis = await agent.analyze(context.email.body);
    await context.triggerWorkflow("n8n-customer-nurture-pipeline", {
      data: analysis
    });
  }
});`;

  const antigravityCode = `# Initializing multiple collaborative AI agents via Antigravity CLI
npx antigravity init --agents=3

# Spin up autonomous coding and task orchestration pipelines
npx antigravity run --orchestrate=asynchronous-workflow`;

  // Related articles typographic lists
  const relatedArticles = [
    {
      title: "n8n Automation for Business — Complete Global Guide 2026",
      href: "/blog/n8n-automation-for-business",
      date: "Apr 12, 2026",
      readTime: "5 min read"
    },
    {
      title: "WhatsApp Automation for Lead Nurturing — The 2026 Strategy",
      href: "/blog/whatsapp-automation-for-lead-nurturing",
      date: "Mar 28, 2026",
      readTime: "4 min read"
    },
    {
      title: "Restaurant Customer Retention Automation — Scale Without Effort",
      href: "/blog/restaurant-customer-retention-automation",
      date: "Feb 18, 2026",
      readTime: "6 min read"
    }
  ];

  return (
    <div className="blog-article-page w-full bg-background min-h-screen text-foreground selection:bg-primary/10 selection:text-primary pt-32 pb-24">
      {/* Dynamic JSON-LD Structured Data */}
      <Script
        id="google-io-schemas"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sticky Progress Bar */}
      <ReadingProgressBar />

      {/* ═══════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION                                    */}
      {/* ═══════════════════════════════════════════════════ */}
      <header className="w-full border-b border-border pb-16 px-6 md:px-10 xl:px-16 2xl:px-24 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Massive Swiss Page Title with neon flickering */}
          <div className="w-full overflow-hidden flex justify-center items-end select-none pointer-events-none mb-10">
            <h1 className="font-black select-none tracking-[-0.06em] text-foreground leading-[0.8] text-[clamp(2rem,9.2vw,130px)] uppercase whitespace-nowrap">
              <FlickerText text={titleName} />
            </h1>
          </div>

          <Reveal y={20}>
            {/* Category Tag */}
            <div className="flex gap-2 justify-center items-center mb-6">
              <span className="text-[11px] font-mono tracking-[0.2em] text-primary uppercase font-bold bg-primary/5 px-2.5 py-1 rounded">
                AI
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                /
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                Google
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                /
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                Technology
              </span>
            </div>

            {/* Editorial Title */}
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-black leading-[1.1] tracking-tighter text-foreground mb-8 max-w-4xl mx-auto">
              Google I/O 2026:
              {" "}
              <span className="text-primary">The Beginning of the AI-Native Internet</span>
            </h2>

            {/* Excerpt */}
            <p className="text-[18px] md:text-[20px] text-[#A1A1AA] leading-relaxed max-w-3xl mx-auto mb-10 font-normal">
              Explore the historic transition from reactive AI chatbots to proactive, 24/7 background AI infrastructure. Discover how Gemini 3.5 Flash, Gemini Spark, and Antigravity are redefining the modern internet and developer ecosystems.
            </p>

            {/* Meta Details Grid */}
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-6 sm:gap-10 font-mono text-[11px] tracking-[0.1em] text-[#9CA3AF] uppercase border-t border-b border-border py-5">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>By GrowxLabs</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>6 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>May 27, 2026</span>
              </div>
            </div>
          </Reveal>

          {/* Interactive Blueprint Architectures Diagram */}
          <Reveal y={30} delay={0.2}>
            <div className="blog-editorial-image-frame mt-14 w-full max-w-5xl mx-auto text-left">
              <InteractiveIOArchitecture />
            </div>
          </Reveal>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 2. ARTICLE EXPERIENCE GRID                          */}
      {/* ═══════════════════════════════════════════════════ */}
      <main className="w-full px-6 md:px-10 xl:px-16 2xl:px-24 py-16">
        <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16 relative">
          
          {/* Desktop Table of Contents Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-32 h-fit">
            <TableOfContents headings={headings} />
          </aside>

          {/* Core Article Body (Strict 70ch) */}
          <article className="col-span-12 lg:col-span-9 max-w-[70ch] mx-auto lg:mx-0">
            {/* Inline Table of Contents for Mobile */}
            <div className="lg:hidden mb-12 bg-card/60 border border-border rounded-xl p-6">
              <TableOfContents headings={headings} />
            </div>

            {/* Intro Content */}
            <div className="text-[18px] leading-[1.85] text-foreground/90 font-normal space-y-8 font-sans">
              <p className="first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                Google I/O 2026 was not just another developer conference.
              </p>
              <p>
                It marked one of the biggest shifts in modern software history: the transition from AI chatbots to AI-native infrastructure.
              </p>
              <p>
                This year, Google focused heavily on:
              </p>
              <ul className="list-none space-y-2 pl-4 border-l-2 border-primary/30">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                  <span>AI agents capable of autonomous multi-step execution</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                  <span>Deeply integrated multimodal systems</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                  <span>Seamless AI-native developer workflows</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                  <span>Background execution and scheduling</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                  <span>Developer acceleration platforms</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                  <span>Real-time dynamic generative interfaces</span>
                </li>
              </ul>
              <p>
                And honestly? Google is no longer competing only in search. It is now competing for the future operating system of work itself.
              </p>
            </div>

            {/* Divider Line */}
            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* Section 1: The Biggest Shift */}
            <section id="biggest-shift" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                The Biggest Shift: From “Search Engine” → “Execution Engine”
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  For nearly two decades, Google Search worked like this:
                </p>
                <div className="bg-white/[0.04] border border-border rounded-lg p-5 font-mono text-[12px] text-[#A1A1AA] space-y-2 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">1.</span> Type query in browser
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">2.</span> Scan index of links
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">3.</span> Open third-party websites
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">4.</span> Manually extract information
                  </div>
                </div>
                <p>
                  At Google I/O 2026, Google revealed a very different future. Now, AI can research, generate interfaces, automate workflows, create visualizations, execute tasks, track updates, build mini applications, and assist coding directly inside the Google ecosystem itself.
                </p>
                <p>
                  This is a massive change. The internet is slowly moving from <strong className="text-foreground font-semibold">“finding information”</strong> to <strong className="text-foreground font-semibold">“AI completing workflows.”</strong>
                </p>
              </div>
            </section>

            {/* Section 2: Gemini 3.5 Flash */}
            <section id="gemini-35-flash" className="scroll-mt-32 mt-16 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Gemini 3.5 Flash: Google’s Fastest AI Push Yet
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  One of the biggest announcements was Gemini 3.5 Flash. Unlike previous models focused mainly on reasoning, Gemini 3.5 Flash is heavily optimized for speed, coding, automated AI workflows, agentic execution, and real-time generation.
                </p>
                <p>
                  Google positioned it as a model designed specifically for modern, AI-native development systems.
                </p>
                <p>
                  The important part? Google is heavily optimizing around developer workflows. Gemini 3.5 Flash powers Google Search AI Mode, Workspace workflows, agentic systems, Antigravity development tools, and dynamic AI-assisted interfaces.
                </p>
                <p>
                  Google claims the model is significantly faster for output generation and workflow execution compared to earlier Gemini systems. And that changes how software teams build products.
                </p>
              </div>
            </section>

            {/* Section 3: Gemini Spark */}
            <section id="gemini-spark" className="scroll-mt-32 mt-16 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Gemini Spark: The Most Important Announcement?
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  While most headlines focused on models, the real breakthrough may actually be Gemini Spark. Google introduced Spark as a 24/7 personal AI agent.
                </p>
                <p>
                  Unlike traditional AI chatbots, Spark is designed to continue working in the background, handle recurring tasks, automate workflows, interact with Workspace tools, and execute long-running processes autonomously.
                </p>
                
                {/* Blockquote styling */}
                <blockquote className="my-10 pl-6 border-l-3 border-primary italic text-[20px] text-[#A1A1AA] font-serif leading-relaxed">
                  "Even after closing your laptop, Spark can continue operating in the cloud. This is extremely important because the industry is now shifting from 'AI that answers' to 'AI that acts.' That single difference changes everything."
                </blockquote>

                {/* Premium Code Block with language badge and Copy Code Button */}
                <div className="my-10 border border-white/10 rounded-xl overflow-hidden bg-[#0D1117] shadow-lg">
                  <div className="flex justify-between items-center bg-[#161B22] px-4 py-2.5 border-b border-white/5">
                    <span className="font-mono text-[11px] text-[#8B949E] tracking-wider uppercase">TypeScript</span>
                    <CopyCodeButton code={sparkCode} />
                  </div>
                  <pre className="p-5 overflow-x-auto text-[13.5px] font-mono text-[#E6EDF0] leading-relaxed">
                    <code>{sparkCode}</code>
                  </pre>
                </div>
              </div>
            </section>

            {/* Section 4: AI Agents Theme */}
            <section id="ai-agents-theme" className="scroll-mt-32 mt-16 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                AI Agents Became the Core Theme of Google I/O
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  Throughout the event, Google repeatedly focused on agentic AI systems. This refers to AI systems capable of handling multi-step workflows autonomously.
                </p>
                <p>
                  Examples shown included:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>AI shopping workflows with automated cart validation and purchase</li>
                  <li>Intelligent planners that coordinate cross-timezone business events</li>
                  <li>AI coding assistants that automatically fix issues and build patches</li>
                  <li>AI-generated dynamic user interfaces responsive to conversational context</li>
                  <li>Deep research systems compiling comprehensive reports 24/7</li>
                </ul>
                <p>
                  Google Search itself is becoming more action-oriented. Instead of only showing information, Google now wants AI to complete tasks, monitor updates, organize workflows, and generate outputs dynamically. This is the beginning of AI-native operating systems.
                </p>
              </div>
            </section>

            {/* Section 5: Antigravity Tooling */}
            <section id="antigravity-tooling" className="scroll-mt-32 mt-16 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Antigravity: Google’s New Developer Direction
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  Google also pushed heavily into AI-native development tooling through Antigravity. Antigravity is designed as an agent-first development environment.
                </p>
                <p>
                  Instead of simple autocomplete, Google wants developers to manage multiple autonomous AI agents working together. The platform focuses on:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Asynchronous, long-running agent workflows</li>
                  <li>Autonomous coding, automated testing, and self-patching</li>
                  <li>Multi-agent orchestration and task routing</li>
                  <li>AI-assisted engineering and cloud deployment pipelines</li>
                </ul>
                
                {/* Antigravity Code Block */}
                <div className="my-10 border border-white/10 rounded-xl overflow-hidden bg-[#0D1117] shadow-lg">
                  <div className="flex justify-between items-center bg-[#161B22] px-4 py-2.5 border-b border-white/5">
                    <span className="font-mono text-[11px] text-[#8B949E] tracking-wider uppercase">Terminal / Shell</span>
                    <CopyCodeButton code={antigravityCode} />
                  </div>
                  <pre className="p-5 overflow-x-auto text-[13.5px] font-mono text-[#E6EDF0] leading-relaxed">
                    <code>{antigravityCode}</code>
                  </pre>
                </div>

                <p>
                  This signals a major industry trend: Future software development may become primarily human direction + AI execution.
                </p>
              </div>
            </section>

            {/* Section 6: Gemini Omni Media */}
            <section id="gemini-omni-media" className="scroll-mt-32 mt-16 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Gemini Omni: Google’s Push Into Multimodal Media
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  Google also introduced Gemini Omni and Omni Flash, focused on multimodal generation. This includes video generation, advanced image editing, conversational video workflows, and multimodal interaction systems.
                </p>
                <p>
                  The interesting part is not only media generation. It’s the interface model. Users can now edit with conversation, modify outputs dynamically, iterate in real time, and build creative workflows faster.
                </p>
                <p>
                  This dramatically changes content production, design systems, marketing workflows, and product prototyping.
                </p>
              </div>
            </section>

            {/* Section 7: Google Search Future */}
            <section id="google-search-future" className="scroll-mt-32 mt-16 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Google Search Is Changing Forever
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  One of the biggest long-term impacts from Google I/O 2026 is the evolution of Search itself. Google is no longer treating Search as a directory of websites. Instead, Search is becoming an AI workspace.
                </p>
                <p>
                  Google demonstrated AI-generated visualizations, coding help directly inside Search, intelligent planners, event tracking systems, and AI-generated mini interfaces.
                </p>
                <p>
                  This has massive implications for SEO, publishers, websites, businesses, and creators. Traditional SEO strategies alone may no longer be enough.
                </p>
                <p>
                  The future internet may prioritize:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>AI-readable systems (structured schema, microdata, LLM friendly content)</li>
                  <li>Structured workflows that connect directly with agent triggers</li>
                  <li>Authoritative, highly-curated public data</li>
                  <li>Interactive web experiences and real-time generation APIs</li>
                  <li>Execution-oriented interfaces</li>
                </ul>
              </div>
            </section>

            {/* Section 8: Business Impacts */}
            <section id="business-impacts" className="scroll-mt-32 mt-16 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Why This Matters for Businesses
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  Most businesses still think AI means “chatbots.” That is no longer true. Google’s announcements show the next phase clearly: AI is becoming infrastructure.
                </p>
                <p>
                  Businesses that adapt early will gain faster execution, leaner teams, automated operations, scalable workflows, and accelerated product development. Small teams can now design, prototype, code, iterate, and deploy faster than ever before.
                </p>
                <p>
                  That changes startup economics completely.
                </p>
              </div>
            </section>

            {/* Section 9: The Bigger Picture */}
            <section id="bigger-picture" className="scroll-mt-32 mt-16 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                The Bigger Picture
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  Google I/O 2026 revealed something much bigger than model updates. It revealed the beginning of AI-native computing.
                </p>
                <p>
                  The future internet will likely be built around autonomous agents, multimodal interfaces, real-time generation, workflow automation, and AI-assisted execution. The companies that learn these systems early will move significantly faster than traditional teams.
                </p>
                <p>
                  And this shift is only beginning.
                </p>
              </div>
            </section>

            {/* Section 10: Final Thoughts */}
            <section id="final-thoughts" className="scroll-mt-32 mt-16 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Final Thoughts
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora font-serif italic text-[#A1A1AA]">
                <p>
                  Google I/O 2026 was not just a product launch event. It was a preview of how software, search, workflows, and digital products may function in the AI-native era.
                </p>
                <p>
                  The industry is rapidly moving from tools that assist humans to systems that execute alongside humans.
                </p>
                <p>
                  And that changes everything.
                </p>
                <p className="mt-8 font-sans font-bold text-foreground not-italic text-sm tracking-[0.1em] uppercase">
                  — GrowxLabs
                </p>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* 2.5 FAQ SECTION (Perfect AEO Validation)           */}
            {/* ═══════════════════════════════════════════════════ */}
            <section id="faq" className="scroll-mt-32 mt-16 pt-16 border-t border-border space-y-8">
              <div className="text-center md:text-left space-y-3">
                <span className="text-[11px] font-mono tracking-[0.2em] text-primary uppercase font-bold">
                  Common Q&A
                </span>
                <h3 className="text-3xl font-black tracking-tight text-foreground">
                  Frequently Asked Questions
                </h3>
                <p className="text-[#9CA3AF] text-[15px] max-w-xl leading-relaxed">
                  Key takeaways and technical details regarding Google's I/O 2026 agentic announcements.
                </p>
              </div>
              <div className="mt-8">
                <AccordionFAQ items={faqData} />
              </div>
            </section>

            {/* Divider Line */}
            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ═══════════════════════════════════════════════════ */}
            {/* 3. FINAL CTA SECTION                               */}
            {/* ═══════════════════════════════════════════════════ */}
            <Reveal y={20}>
              <div className="my-16 bg-[#EDEAE4] rounded-2xl p-8 md:p-12 border border-border text-center space-y-6">
                <span className="text-[11px] font-mono tracking-[0.2em] text-primary uppercase font-bold">
                  Next-Gen digital engineering
                </span>
                <h3 className="text-[28px] md:text-[38px] font-black tracking-tight leading-tight text-foreground">
                  Building AI-native products
                  <br />
                  and AI engineering labs.
                </h3>
                <p className="text-[#9CA3AF] text-[15px] max-w-md mx-auto leading-relaxed">
                  We build high-performance software, advanced backend automations, and custom infrastructure tailored for global scale.
                </p>
                <div className="pt-4">
                  <Link href="/contact">
                    <Button variant="outline" className="border-primary/20 hover:border-primary/50 text-primary rounded-md px-8 h-12 text-[15px] font-semibold transition-all">
                      <span className="flex items-center justify-center gap-1.5 whitespace-nowrap">Work With GrowxLabs <ArrowRight className="w-4 h-4 shrink-0" /></span>
                    </Button>
                  </Link>
                </div>
              </div>
            </Reveal>

            {/* ═══════════════════════════════════════════════════ */}
            {/* 4. RELATED ARTICLES SECTION                        */}
            {/* ═══════════════════════════════════════════════════ */}
            <section className="mt-16 space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h4 className="font-mono text-[11px] tracking-[0.15em] text-[#9CA3AF] uppercase font-bold">
                  Related Insights
                </h4>
                <Link href="/blog" className="text-[12px] font-bold text-primary hover:underline inline-flex items-center gap-1">
                  View all articles <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((article, index) => (
                  <Link 
                    key={index} 
                    href={article.href}
                    className="group flex flex-col justify-between p-6 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all duration-300 min-h-[160px]"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center font-mono text-[9px] tracking-wider text-[#9CA3AF] uppercase">
                        <span>{article.date}</span>
                        <span>{article.readTime}</span>
                      </div>
                      <h5 className="font-bold text-foreground text-[14px] leading-snug group-hover:text-primary transition-colors line-clamp-3">
                        {article.title}
                      </h5>
                    </div>
                    <div className="pt-4 flex items-center gap-1.5 text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Read article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>

          </article>
        </div>
      </main>
    </div>
  );
}
