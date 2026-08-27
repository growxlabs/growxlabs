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
import { InsightCallout, WhyThisMatters, EditorialDivider, RelatedArticlesGrid } from "@/components/marketing/BlogEditorial";
import { InteractiveSearchEvolution } from "@/components/marketing/InteractiveSearchEvolution";

// ═══════════════════════════════════════════════════
// METADATA GENERATOR (Perfect SEO / AEO Optimization)
// ═══════════════════════════════════════════════════
export async function generateMetadata() {
  const title = "Google Search Is No Longer Just Search: The Rise of the Execution Engine";
  const description = "Explore the historic transition of Google Search from an index of web links to an AI-native execution workspace. What Gemini's infrastructure layer and AEO mean for businesses.";

  return {
    title: `${title} | GrowxLabs`,
    description,
    alternates: {
      canonical: "https://growxlabs.tech/blog/google-search-is-no-longer-just-search"
    },
    openGraph: {
      title,
      description,
      url: "https://growxlabs.tech/blog/google-search-is-no-longer-just-search",
      siteName: "GrowxLabs",
      type: "article",
      publishedTime: "2026-05-27T09:00:00.000Z",
      authors: ["GrowxLabs"],
      images: [
        {
          url: "https://growxlabs.tech/images/hero-google-search.png",
          width: 1200,
          height: 630,
          alt: "Google Search — The Transition to an Execution Engine"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://growxlabs.tech/images/hero-google-search.png"]
    }
  };
}

export default async function GoogleSearchEvolutionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const titleName = "EXECUTION";

  // Headings array for the Table of Contents scrollspy
  const headings = [
    { id: "shift-execution", text: "From Search Engine to Execution Engine" },
    { id: "gemini-core", text: "Gemini Is Becoming the Core Layer" },
    { id: "seo-evolution", text: "AI Search Changes SEO Forever" },
    { id: "interactive-search", text: "Search Is Becoming Interactive" },
    { id: "ai-native-internet", text: "The Rise of AI-Native Internet Experiences" },
    { id: "business-action", text: "Why Businesses Should Pay Attention" },
    { id: "final-thoughts", text: "Final Thoughts" },
    { id: "faq", text: "Frequently Asked Questions" }
  ];

  // Q&A data for both visual UI rendering and search-engine validation schema
  const faqData = [
    {
      question: "How is Google Search changing in 2026?",
      answer: "Google Search is transitioning from an index of web links to an active AI-native execution workspace. Instead of scanning links and manually organizing info, the search experience uses background agents and Gemini workflows to summarize, plan, and automate tasks directly."
    },
    {
      question: "What does this shift mean for traditional SEO?",
      answer: "Traditional keyword stuffing and generic backlinks are becoming obsolete. AI-native search engines like Perplexity, ChatGPT, and Google Gemini AI Search prioritize structured schemas, semantic clarity, authoritative expertise, and workflow-relevant information."
    },
    {
      question: "What is Gemini's role in this transition?",
      answer: "Gemini is no longer treated as a standalone chatbot. It is now positioned as a core, ambient intelligence infrastructure layer embedded natively across Search, Workspace apps, Android, Chrome, and cloud workflows."
    }
  ];

  // Structured Data (JSON-LD) for SEO / AEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://growxlabs.tech/blog/google-search-is-no-longer-just-search/#article`,
        "headline": "Google Search Is No Longer Just Search: The Rise of the Execution Engine",
        "description": "Explore the historic transition of Google Search from an index of web links to an AI-native execution workspace. What Gemini's infrastructure layer and AEO mean for businesses.",
        "datePublished": "2026-05-27T09:00:00Z",
        "dateModified": "2026-05-27T09:00:00Z",
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
          "@id": `https://growxlabs.tech/blog/google-search-is-no-longer-just-search`
        }
      },
      {
        "@type": "FAQPage",
        "@id": `https://growxlabs.tech/blog/google-search-is-no-longer-just-search/#faq`,
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

  // Related articles typographic lists
  const relatedArticles = [
    {
      title: "Google I/O 2026: Gemini Spark, AI Agents & The Future of AI-Native Development",
      href: "/blog/google-io-2026",
      date: "May 27, 2026",
      readTime: "6 min read",
      category: "AI Industry"
    },
    {
      title: "AI Coding Tools Are Reshaping Modern Software Engineering",
      href: "/blog/ai-coding-tools-are-reshaping-modern-software-engineering",
      date: "May 27, 2026",
      readTime: "5 min read",
      category: "Developer Tools"
    },
    {
      title: "Why Anthropic Is Becoming a Serious Threat to OpenAI",
      href: "/blog/why-anthropic-is-becoming-a-serious-threat-to-openai",
      date: "May 27, 2026",
      readTime: "5 min read",
      category: "AI Industry"
    }
  ];

  return (
    <div className="blog-article-page w-full bg-background min-h-screen text-foreground selection:bg-primary/10 selection:text-primary pt-32 pb-24">
      {/* Dynamic JSON-LD Structured Data */}
      <Script
        id="google-search-evolution-schemas"
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
                SEO
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                /
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                Search
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                /
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                AI
              </span>
            </div>

            {/* Editorial Title */}
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-black leading-[1.1] tracking-tighter text-foreground mb-8 max-w-4xl mx-auto">
              Google Search Is No Longer
              {" "}
              <span className="text-primary">Just Search</span>
            </h2>

            {/* Excerpt */}
            <p className="text-[18px] md:text-[20px] text-[#A1A1AA] leading-relaxed max-w-3xl mx-auto mb-10 font-normal">
              For more than 20 years, Google Search linked you to websites. In 2026, the internet is undergoing a historic shift from information discovery to autonomous execution.
            </p>

            {/* Meta Details Grid */}
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-6 sm:gap-10 font-mono text-[11px] tracking-[0.1em] text-[#9CA3AF] uppercase border-t border-b border-border py-5">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>By GrowxLabs</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>5 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>May 27, 2026</span>
              </div>
            </div>
          </Reveal>

          {/* Interactive Evolution Banner */}
          <Reveal y={30} delay={0.2}>
            <div className="blog-editorial-image-frame mt-14 w-full">
              <InteractiveSearchEvolution />
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
          <article className="col-span-12 lg:col-span-9 max-w-[720px] mx-auto lg:mx-0 blog-article">
            {/* Inline Table of Contents for Mobile */}
            <div className="lg:hidden mb-12 bg-card/60 border border-border rounded-xl p-6">
              <TableOfContents headings={headings} />
            </div>

            {/* Intro Content */}
            <div className="text-[17px] leading-[1.9] text-foreground/90 font-normal space-y-8 font-sans blog-prose">
              <p className="first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                For more than 20 years, Google Search worked in a simple, predictable way.
              </p>
              <p>
                You searched. Google showed links. You opened websites.
              </p>
              <p>
                That basic mental model of how the web functions is now completely changing.
              </p>
              <p>
                At Google I/O 2026, Google revealed a future where Search is no longer just a directory. Instead, it is transforming into an AI-native workspace—marking one of the biggest architectural shifts in the history of the modern internet.
              </p>
            </div>

            {/* Divider Line */}
            <EditorialDivider />

            {/* Section 1 */}
            <section id="shift-execution" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                From Search Engine → Execution Engine
              </h2>
              <div className="text-[17px] leading-[1.9] text-foreground/90 font-normal space-y-6 font-sans blog-prose">
                <p>
                  Traditional search was built around <strong>information discovery</strong>. You had a question, and Google served as the index that pointed you toward potential answers written by third-party creators.
                </p>
                <p>
                  Modern AI systems, however, are moving toward <strong>workflow execution</strong>.
                </p>
                <p>
                  Google is actively integrating:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Gemini AI models natively into the query layer</li>
                  <li>Real-time, AI-generated synthetic answers</li>
                  <li>Multimodal parsing and video query analysis</li>
                  <li>Intelligent background planning engines</li>
                  <li>Collaborative AI agents that communicate with other systems</li>
                  <li>Dynamic, dynamically generated interfaces in search results</li>
                </ul>
                <p>
                  This means users may no longer open 10 separate tabs, compare conflicting answers manually, and copy-paste details to organize their thoughts. Instead, the AI system compiles, plans, summarizes, automates, and organizes information dynamically inside Search itself.
                </p>
                <p>
                  The internet is fundamentally shifting from <em>“finding information”</em> to <em>“AI completing complex tasks.”</em>
                </p>
              </div>
            </section>

            <InsightCallout variant="trend">
              Google's shift to AI-native search mirrors what happened with mobile-first indexing—companies that adapted early won dominant positions, and those that didn't became invisible overnight. The window for early-mover advantage in AEO is closing fast.
            </InsightCallout>

            {/* Section 2 */}
            <section id="gemini-core" className="scroll-mt-32 mt-16 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Gemini Is Becoming the Core Layer
              </h2>
              <div className="text-[17px] leading-[1.9] text-foreground/90 font-normal space-y-6 font-sans blog-prose">
                <p>
                  Google is no longer treating Gemini as a standalone app or an experimental chatbot alternative.
                </p>
                <p>
                  Instead, Gemini is becoming the core, ambient intelligence layer across the entire Google ecosystem: from Search and Workspace to Chrome, Android, and backend developer systems.
                </p>
                <p>
                  This represents a major shift: <strong>AI is becoming core digital infrastructure</strong>, rather than an add-on utility.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section id="seo-evolution" className="scroll-mt-32 mt-16 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                AI Search Changes SEO Forever
              </h2>
              <div className="text-[17px] leading-[1.9] text-foreground/90 font-normal space-y-6 font-sans blog-prose">
                <p>
                  This evolution has massive, immediate implications for businesses, agencies, developers, and content creators.
                </p>
                <blockquote className="my-10 pl-6 border-l-3 border-primary italic text-[20px] text-[#A1A1AA] font-serif leading-relaxed">
                  "Traditional SEO focused on keywords, repetitive backlinks, and gaming algorithms. AI-native search engines require a completely new approach: optimization for semantic clarity, deep structured schema data, and factual authority."
                </blockquote>
                <p>
                  If a website is built strictly to target keywords rather than providing clear, structured, and authoritative data that LLMs can extract, it will quickly lose visibility in AI-generated answers.
                </p>
                <p>
                  The future favors websites that provide <strong>well-structured, highly reliable, and semantic-friendly</strong> knowledge.
                </p>
              </div>
            </section>

            <WhyThisMatters>
              Businesses that fail to adopt structured data and AEO strategies will lose visibility entirely as AI systems replace traditional search result pages. The shift isn't gradual—it's binary. Once AI-generated answers become the default interface, websites without semantic schema markup and authoritative structured content won't just rank lower; they'll disappear from the discovery layer altogether.
            </WhyThisMatters>

            {/* Section 4 */}
            <section id="interactive-search" className="scroll-mt-32 mt-16 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Search Is Becoming Interactive
              </h2>
              <div className="text-[17px] leading-[1.9] text-foreground/90 font-normal space-y-6 font-sans blog-prose">
                <p>
                  In its latest demos, Google showcased Search generating visual interfaces, interactive budget planners, dynamic schedules, and step-by-step programming workflows on the fly.
                </p>
                <p>
                  Search is transforming from a static screen into a fluid, interactive digital workspace. Users are beginning to expect actions, results, and executions immediately, bypassing classic web navigational steps.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="ai-native-internet" className="scroll-mt-32 mt-16 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                The Rise of AI-Native Internet Experiences
              </h2>
              <div className="text-[17px] leading-[1.9] text-foreground/90 font-normal space-y-6 font-sans blog-prose">
                <p>
                  The key takeaway is that the internet itself is undergoing an architectural rewrite.
                </p>
                <p>
                  Websites are evolving from static pages into intelligent, interactive, conversational systems that adapt dynamically to a user's intent. This impacts everything from SaaS and digital products to traditional corporate websites and customer service operations.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="business-action" className="scroll-mt-32 mt-16 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Why Businesses Should Pay Attention
              </h2>
              <div className="text-[17px] leading-[1.9] text-foreground/90 font-normal space-y-6 font-sans blog-prose">
                <p>
                  Many businesses are still treating AI as a simple chatbot or a tool to write copy. That perspective is already years out of date.
                </p>
                <p>
                  Modern AI is infrastructure. The companies that build intelligent automation, semantic-first web setups, and automated operations pipelines today will move infinitely faster than legacy teams.
                </p>
                <p>
                  The competitive advantage is no longer just using AI—it is <strong>engineering cohesive, AI-native workflows</strong> that solve customer problems end-to-end.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="final-thoughts" className="scroll-mt-32 mt-16 space-y-6 font-serif italic text-[#A1A1AA]">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight not-italic font-sans">
                Final Thoughts
              </h2>
              <p>
                Google Search is no longer just a lookup table for the web. It is fast becoming the intelligence interface of a unified workspace.
              </p>
              <p>
                This transformation will reshape software, design, branding, and engineering teams. The AI-native era has begun, and the rules of the digital space are being rewritten in real-time.
              </p>
              <p className="mt-8 font-sans font-bold text-foreground not-italic text-sm tracking-[0.1em] uppercase">
                — GrowxLabs
              </p>
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
                  Key takeaways regarding the transition from search indexes to AI execution layers.
                </p>
              </div>
              <div className="mt-8">
                <AccordionFAQ items={faqData} />
              </div>
            </section>

            {/* Divider Line */}
            <EditorialDivider />

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

              <RelatedArticlesGrid articles={relatedArticles} />
            </section>

          </article>
        </div>
      </main>
    </div>
  );
}
