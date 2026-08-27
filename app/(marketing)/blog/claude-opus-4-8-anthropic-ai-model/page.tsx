import React from "react";
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
import { 
  ClaudeOpusBenchmarks, 
  DynamicWorkflowViz, 
  EffortControlDiagram 
} from "@/components/marketing/InteractiveClaudeOpus";

// ═══════════════════════════════════════════════════
// METADATA GENERATOR (SEO / GEO / AEO Optimization)
// ═══════════════════════════════════════════════════
export async function generateMetadata() {
  const title = "Claude Opus 4.8: Anthropic's Most Advanced AI Model — Benchmarks, Features & Full Review";
  const description = "Complete analysis of Claude Opus 4.8 released May 28, 2026. Explore benchmark results (SWE-Bench 69.2%, Terminal-Bench 74.2%), Dynamic Workflows, Effort Control, pricing, API access, and what's next with Claude Mythos.";

  return {
    title: `${title} | GrowxLabs`,
    description,
    alternates: {
      canonical: "https://growxlabs.tech/blog/claude-opus-4-8-anthropic-ai-model"
    },
    openGraph: {
      title,
      description,
      url: "https://growxlabs.tech/blog/claude-opus-4-8-anthropic-ai-model",
      siteName: "GrowxLabs",
      type: "article",
      publishedTime: "2026-05-29T08:00:00.000Z",
      authors: ["GrowxLabs"],
      images: [
        {
          url: "https://growxlabs.tech/images/blog-claude-opus-4-8.png",
          width: 1200,
          height: 630,
          alt: "Claude Opus 4.8 — Anthropic's Most Advanced AI Model"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://growxlabs.tech/images/blog-claude-opus-4-8.png"]
    },
    keywords: [
      "Claude Opus 4.8",
      "Anthropic Claude",
      "Claude Code",
      "AI Coding Assistant",
      "Agentic Coding",
      "Claude Opus Review",
      "Claude Opus Benchmarks",
      "Anthropic AI",
      "Dynamic Workflows",
      "Claude Mythos"
    ]
  };
}

export default async function ClaudeOpus48Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const titleName = "CLAUDE OPUS";

  // Headings for Table of Contents scrollspy
  const headings = [
    { id: "what-is-opus-48", text: "What Is Claude Opus 4.8?" },
    { id: "key-improvements", text: "Key Improvements Over Opus 4.7" },
    { id: "benchmark-results", text: "Benchmark Results" },
    { id: "new-features", text: "New Features" },
    { id: "early-tester-feedback", text: "Early Tester Feedback" },
    { id: "pricing", text: "Pricing" },
    { id: "api-access", text: "API Access & Code" },
    { id: "opus-timeline", text: "Opus Model Timeline" },
    { id: "whats-next", text: "What's Coming Next" },
    { id: "quick-reference", text: "Quick Reference Table" },
    { id: "faq", text: "Frequently Asked Questions" }
  ];

  // FAQ data for both visual rendering and JSON-LD schema
  const faqData = [
    {
      question: "What is Claude Opus 4.8?",
      answer: "Claude Opus 4.8 is Anthropic's latest and most advanced flagship AI model, released on May 28, 2026. It is stronger across coding, agentic tasks, and professional work, with the consistency and autonomy to keep working on long-running tasks."
    },
    {
      question: "How does Claude Opus 4.8 compare to Opus 4.7?",
      answer: "Opus 4.8 scores 69.2% on SWE-Bench Pro (+4.9%), 74.2% on Terminal-Bench 2.1 (+8.4%), and 57.9% on Multidisciplinary Reasoning (+3.2%). It is also 4x less likely to allow code flaws to go unremarked, and features a 2.5x faster Fast Mode that is 3x cheaper than previous Opus fast mode pricing."
    },
    {
      question: "What are Dynamic Workflows in Claude Code?",
      answer: "Dynamic Workflows is a Research Preview feature in Claude Code where Claude plans the full work upfront, spawns hundreds of parallel subagents in a single session, each handling a small piece of the task, verifies all outputs before reporting back, and can handle massive codebase migrations end-to-end."
    },
    {
      question: "What is Effort Control in Claude Opus 4.8?",
      answer: "Effort Control lets users choose how deeply Claude thinks — from Low (simple queries, fast replies) to High (default, general tasks), Extra (difficult tasks, async workflows), and Max (hardest tasks, maximum performance). Higher effort means deeper thinking and better results."
    },
    {
      question: "How much does Claude Opus 4.8 cost?",
      answer: "Claude Opus 4.8 pricing is unchanged from Opus 4.7: Standard Input at $5 per 1M tokens, Standard Output at $25 per 1M tokens, Fast Mode Input at $10 per 1M tokens, and Fast Mode Output at $50 per 1M tokens. Zero price increase from the previous version."
    },
    {
      question: "What is Claude Mythos?",
      answer: "Claude Mythos is Anthropic's upcoming next-generation model class with intelligence higher than Opus. It is currently being tested with a small number of organizations focused on cybersecurity (Project Glasswing), and Anthropic expects to bring Mythos-class models to all customers in the coming weeks."
    },
    {
      question: "Does Claude Opus 4.8 outperform GPT-5.5?",
      answer: "Yes, Claude Opus 4.8 outperforms GPT-5.5 on SWE-Bench Pro, Multidisciplinary Reasoning, and Online-Mind2Web (Browser Agent). GPT-5.5 leads only on Terminal-Bench when using its specialized Codex CLI harness (83.4%)."
    }
  ];

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://growxlabs.tech/blog/claude-opus-4-8-anthropic-ai-model/#article`,
        "headline": "Claude Opus 4.8: Anthropic's Most Advanced AI Model — Benchmarks, Features & Full Review",
        "description": "Complete analysis of Claude Opus 4.8 released May 28, 2026. Explore benchmark results, Dynamic Workflows, Effort Control, pricing, API access, and what's next with Claude Mythos.",
        "datePublished": "2026-05-29T08:00:00Z",
        "dateModified": "2026-05-29T08:00:00Z",
        "image": "https://growxlabs.tech/images/blog-claude-opus-4-8.png",
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
          "@id": `https://growxlabs.tech/blog/claude-opus-4-8-anthropic-ai-model`
        }
      },
      {
        "@type": "FAQPage",
        "@id": `https://growxlabs.tech/blog/claude-opus-4-8-anthropic-ai-model/#faq`,
        "mainEntity": faqData.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `https://growxlabs.tech/${locale}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": `https://growxlabs.tech/blog`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Claude Opus 4.8",
            "item": `https://growxlabs.tech/blog/claude-opus-4-8-anthropic-ai-model`
          }
        ]
      }
    ]
  };

  // Code examples
  const pythonCode = `import anthropic

client = anthropic.Anthropic(api_key="YOUR_API_KEY")

message = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=8192,
    messages=[
        {"role": "user", "content": "Your prompt here"}
    ]
)

print(message.content)`;

  const jsCode = `const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
  },
  body: JSON.stringify({
    model: "claude-opus-4-8",
    max_tokens: 8192,
    messages: [
      { role: "user", content: "Your prompt here" }
    ]
  })
});

const data = await response.json();
console.log(data.content);`;

  const curlCode = `curl https://api.anthropic.com/v1/messages \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{
    "model": "claude-opus-4-8",
    "max_tokens": 8192,
    "messages": [
      {"role": "user", "content": "Your prompt here"}
    ]
  }'`;

  // Related articles
  const relatedArticles = [
    {
      title: "Why Anthropic Is Becoming a Serious Threat to OpenAI",
      href: "/blog/why-anthropic-is-becoming-a-serious-threat-to-openai",
      date: "May 27, 2026",
      readTime: "5 min read"
    },
    {
      title: "AI Coding Tools Are Reshaping Modern Software Engineering",
      href: "/blog/ai-coding-tools-are-reshaping-modern-software-engineering",
      date: "May 27, 2026",
      readTime: "5 min read"
    },
    {
      title: "Google I/O 2026: The Beginning of the AI-Native Internet",
      href: "/blog/google-io-2026",
      date: "May 27, 2026",
      readTime: "6 min read"
    }
  ];

  return (
    <div className="blog-article-page w-full bg-background min-h-screen text-foreground selection:bg-primary/10 selection:text-primary pt-32 pb-24">
      {/* JSON-LD Structured Data */}
      <Script
        id="claude-opus-schemas"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sticky Reading Progress */}
      <ReadingProgressBar />

      {/* ═══════════════════════════════════════════════════ */}
      {/* HERO SECTION                                       */}
      {/* ═══════════════════════════════════════════════════ */}
      <header className="w-full border-b border-border pb-16 px-6 md:px-10 xl:px-16 2xl:px-24 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Swiss Title */}
          <div className="w-full overflow-hidden flex justify-center items-end select-none pointer-events-none mb-10">
            <h1 className="font-black select-none tracking-[-0.06em] text-foreground leading-[0.8] text-[clamp(2rem,9.2vw,130px)] uppercase whitespace-nowrap">
              <FlickerText text={titleName} />
            </h1>
          </div>

          <Reveal y={20}>
            {/* Category Tags */}
            <div className="flex gap-2 justify-center items-center mb-6">
              <span className="text-[11px] font-mono tracking-[0.2em] text-primary uppercase font-bold bg-primary/5 px-2.5 py-1 rounded">
                AI
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                /
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                Anthropic
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                /
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                Engineering
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-black leading-[1.1] tracking-tighter text-foreground mb-8 max-w-4xl mx-auto">
              Claude Opus 4.8:
              {" "}
              <span className="text-primary">Anthropic&apos;s Most Advanced AI Model</span>
            </h2>

            {/* Excerpt */}
            <p className="text-[18px] md:text-[20px] text-[#A1A1AA] leading-relaxed max-w-3xl mx-auto mb-10 font-normal">
              Stronger across coding, agentic tasks, and professional work. Opus 4.8 has the consistency and autonomy to keep working on long-running tasks — with new highs in honesty, speed, and alignment.
            </p>

            {/* Meta Bar */}
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-6 sm:gap-10 font-mono text-[11px] tracking-[0.1em] text-[#9CA3AF] uppercase border-t border-b border-border py-5">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>By GrowxLabs</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>12 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>May 29, 2026</span>
              </div>
            </div>
          </Reveal>

          {/* Hero Visual — Opus 4.8 Identity Block */}
          <Reveal y={30} delay={0.2}>
            <div className="blog-editorial-image-frame mt-14 w-full max-w-4xl mx-auto">
              <div className="bg-[#0F0F12] rounded-2xl p-10 md:p-14 text-white relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C0F0FB]/8 rounded-full blur-[120px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#D97706]/5 rounded-full blur-[100px] -ml-32 -mb-32" />
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#C0F0FB] animate-pulse" />
                    <span className="text-[11px] font-mono tracking-[0.3em] text-primary uppercase font-bold">Released May 28, 2026</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-4xl md:text-5xl font-black tracking-tight">Claude Opus 4.8</h3>
                    <p className="text-[#9CA3AF] font-mono text-sm">Model ID: claude-opus-4-8 · Developer: Anthropic</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                    {[
                      { label: "SWE-Bench Pro", value: "69.2%", delta: "+4.9%" },
                      { label: "Terminal-Bench", value: "74.2%", delta: "+8.4%" },
                      { label: "Browser Agent", value: "84.0%", delta: "Best" },
                      { label: "Code Review", value: "4×", delta: "Better" },
                    ].map((stat, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[10px] font-mono tracking-wider text-[#9CA3AF] uppercase">{stat.label}</p>
                        <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                        <p className="text-[11px] font-mono text-[#22C55E] font-bold">{stat.delta}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════ */}
      {/* ARTICLE BODY                                       */}
      {/* ═══════════════════════════════════════════════════ */}
      <main className="w-full px-6 md:px-10 xl:px-16 2xl:px-24 py-16">
        <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16 relative">
          
          {/* Desktop TOC Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-32 h-fit">
            <TableOfContents headings={headings} />
          </aside>

          {/* Article Content */}
          <article className="col-span-12 lg:col-span-9 max-w-[70ch] mx-auto lg:mx-0">
            {/* Mobile TOC */}
            <div className="lg:hidden mb-12 bg-card/60 border border-border rounded-xl p-6">
              <TableOfContents headings={headings} />
            </div>

            {/* ─────────────────────────────────────── */}
            {/* SECTION 01 — WHAT IS CLAUDE OPUS 4.8?  */}
            {/* ─────────────────────────────────────── */}
            <section id="what-is-opus-48" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                What Is Claude Opus 4.8?
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p className="first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                  Anthropic released Claude Opus 4.8 on May 28, 2026. It is the latest and most advanced version of Anthropic&apos;s flagship AI model. Released less than 2 months after Opus 4.7 — showing a faster upgrade cadence.
                </p>
              </div>

              {/* Official Quote */}
              <blockquote className="border-l-4 border-primary bg-[#C0F0FB]/[0.03] pl-6 pr-6 py-6 my-8 rounded-r-xl">
                <p className="text-[17px] italic leading-relaxed text-foreground/90 font-medium">
                  &ldquo;Stronger across coding, agentic tasks, and professional work, Opus 4.8 has the consistency and autonomy to keep working on long-running tasks.&rdquo;
                </p>
                <cite className="text-[13px] text-[#9CA3AF] font-mono mt-3 block not-italic">— Anthropic</cite>
              </blockquote>

              <div className="text-[18px] leading-[1.85] text-foreground/90 font-normal space-y-4 font-sans">
                <p className="font-semibold text-foreground">Areas of Improvement:</p>
                <ul className="list-none space-y-2 pl-4 border-l-2 border-primary/30">
                  {["Agentic Coding", "Multidisciplinary Reasoning", "Agentic Computer Use", "Knowledge Work", "Agentic Financial Analysis"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Facts Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
                {[
                  { label: "Model ID", value: "claude-opus-4-8" },
                  { label: "Release Date", value: "May 28, 2026" },
                  { label: "Developer", value: "Anthropic" },
                  { label: "Predecessor", value: "Opus 4.7 (Apr 16, 2026)" },
                  { label: "Price Change", value: "NONE" },
                ].map((fact, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-1">
                    <p className="text-[10px] font-mono tracking-[0.15em] text-[#9CA3AF] uppercase">{fact.label}</p>
                    <p className="text-[15px] font-bold text-foreground">{fact.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 02 — KEY IMPROVEMENTS          */}
            {/* ─────────────────────────────────────── */}
            <section id="key-improvements" className="scroll-mt-32 space-y-10">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Key Improvements Over Opus 4.7
              </h2>

              {/* Improvement 1: Honesty */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="text-[12px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">01</span>
                  Honesty &amp; Reliability
                </h3>
                <div className="text-[18px] leading-[1.85] text-foreground/90 space-y-4">
                  <p>The most emphasized improvement in Opus 4.8 is <strong className="text-foreground">honesty</strong>. AI models often jump to conclusions and claim progress without evidence. Opus 4.8 is trained to actively fight this problem.</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 space-y-3">
                  <p className="text-[11px] font-mono tracking-[0.15em] text-[#9CA3AF] uppercase font-bold">Results</p>
                  <ul className="list-none space-y-2">
                    {[
                      "4x LESS likely to allow code flaws to go unremarked",
                      "More likely to flag uncertainties in its own work",
                      "Less likely to make unsupported or unverified claims",
                      "More transparent when it lacks sufficient information"
                    ].map((r, i) => (
                      <li key={i} className="flex items-start gap-3 text-[15px] text-foreground/90">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] mt-2.5 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <blockquote className="border-l-4 border-primary bg-[#C0F0FB]/[0.03] pl-6 pr-6 py-5 rounded-r-xl">
                  <p className="text-[16px] italic leading-relaxed text-foreground/90">
                    &ldquo;Early testers report that Opus 4.8 is more likely to flag uncertainties about its work and less likely to make unsupported claims.&rdquo;
                  </p>
                  <cite className="text-[13px] text-[#9CA3AF] font-mono mt-2 block not-italic">— Anthropic</cite>
                </blockquote>
              </div>

              {/* Improvement 2: Fast Mode */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="text-[12px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">02</span>
                  Fast Mode — Speed &amp; Cost
                </h3>
                <div className="text-[18px] leading-[1.85] text-foreground/90 space-y-4">
                  <ul className="list-none space-y-2 pl-4 border-l-2 border-primary/30">
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                      <span>Fast Mode now runs at <strong className="text-foreground">2.5x the speed</strong> of standard mode</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                      <span>Fast Mode is now <strong className="text-foreground">3x CHEAPER</strong> than it was for previous Opus models</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                      <span>This makes Opus 4.8 far more practical for high-frequency workloads</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Improvement 3: Agentic Judgment */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="text-[12px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">03</span>
                  Agentic Judgment
                </h3>
                <div className="text-[18px] leading-[1.85] text-foreground/90 space-y-4">
                  <ul className="list-none space-y-2 pl-4 border-l-2 border-primary/30">
                    {[
                      "Sharper judgment when performing long-running agentic tasks",
                      "Asks the right questions before making big decisions",
                      "Catches its own mistakes mid-task",
                      "Pushes back when a plan isn't sound",
                      "Works more autonomously over extended sessions"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Improvement 4: Alignment */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="text-[12px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">04</span>
                  Alignment &amp; Safety
                </h3>
                <div className="text-[18px] leading-[1.85] text-foreground/90 space-y-4">
                  <ul className="list-none space-y-2 pl-4 border-l-2 border-primary/30">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB] mt-2.5 shrink-0" />
                      <span>Reaches new highs on prosocial traits: supporting user autonomy and acting in the user&apos;s best interest</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                      <span>Deception and misuse rates substantially <strong className="text-foreground">LOWER</strong> than Opus 4.7</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB] mt-2.5 shrink-0" />
                      <span>Alignment scores now <strong className="text-foreground">COMPARABLE</strong> to Claude Mythos Preview (Anthropic&apos;s most advanced aligned model)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 03 — BENCHMARK RESULTS         */}
            {/* ─────────────────────────────────────── */}
            <section id="benchmark-results" className="scroll-mt-32 space-y-8">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Benchmark Results
              </h2>

              {/* Interactive Benchmark Component */}
              <Reveal y={20}>
                <ClaudeOpusBenchmarks />
              </Reveal>

              {/* Competitor Comparison */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <p className="text-[11px] font-mono tracking-[0.15em] text-[#9CA3AF] uppercase font-bold">vs Competitors</p>
                <ul className="list-none space-y-2">
                  <li className="flex items-start gap-3 text-[15px] text-foreground/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] mt-2.5 shrink-0" />
                    <span><strong className="text-foreground">Outperforms GPT-5.5</strong> on: SWE-Bench Pro, Reasoning, Browser Agent</span>
                  </li>
                  <li className="flex items-start gap-3 text-[15px] text-foreground/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] mt-2.5 shrink-0" />
                    <span><strong className="text-foreground">Outperforms Gemini 3.1</strong> on: Most benchmarks</span>
                  </li>
                  <li className="flex items-start gap-3 text-[15px] text-foreground/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-2.5 shrink-0" />
                    <span><strong className="text-foreground">GPT-5.5 leads only</strong> on: Terminal-Bench (using Codex CLI harness 83.4%)</span>
                  </li>
                </ul>
              </div>

              {/* Notes */}
              <div className="bg-[#C0F0FB]/[0.03] border border-primary/10 rounded-xl p-5 text-[14px] text-[#9CA3AF] space-y-2">
                <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-primary font-bold">Notes</p>
                <ul className="list-disc list-inside space-y-1 text-[14px]">
                  <li>Terminal-Bench tested using Terminus-2 public harness for Opus 4.8</li>
                  <li>GPT-5.5 Terminal-Bench score (83.4%) uses Codex CLI harness (different)</li>
                  <li>OSWorld-Verified methodology updated for real-world accuracy (Opus 4.7 score updated to 82.3% under new methodology)</li>
                </ul>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 04 — NEW FEATURES              */}
            {/* ─────────────────────────────────────── */}
            <section id="new-features" className="scroll-mt-32 space-y-12">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                New Features Launched with Opus 4.8
              </h2>

              {/* Feature 1: Dynamic Workflows */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-foreground">Dynamic Workflows — Claude Code</h3>
                  <span className="text-[10px] font-mono tracking-wider text-[#D97706] bg-[#D97706]/10 px-2 py-0.5 rounded font-bold uppercase">Research Preview</span>
                </div>
                <div className="flex gap-4 flex-wrap text-[13px] font-mono text-[#9CA3AF]">
                  <span>Plans: Enterprise, Team, Max</span>
                  <span>·</span>
                  <span>Tool: Claude Code</span>
                </div>
                <div className="text-[18px] leading-[1.85] text-foreground/90 space-y-4">
                  <p className="font-semibold text-foreground">What it does:</p>
                  <ul className="list-none space-y-2 pl-4 border-l-2 border-primary/30">
                    {[
                      "Claude plans the full work upfront",
                      "Spawns HUNDREDS of parallel subagents in a single session",
                      "Each subagent handles a small piece of the task",
                      "Verifies all outputs before reporting back to user",
                      "Handles massive codebase migrations end-to-end"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#0F0F12] text-white rounded-xl p-6 text-[15px] leading-relaxed border border-white/5">
                  <p className="text-[11px] font-mono tracking-[0.15em] text-primary uppercase font-bold mb-3">Real Example</p>
                  <p className="text-[#A0A0A0]">
                    Claude Code + Opus 4.8 can rewrite an entire application in a new programming language — from kickoff to merge — using the existing test suite as its quality bar.
                  </p>
                </div>

                {/* Interactive Workflow Visualization */}
                <Reveal y={20}>
                  <DynamicWorkflowViz />
                </Reveal>
              </div>

              <div className="w-full h-px bg-[#E5E2DC]" />

              {/* Feature 2: Effort Control */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-foreground">Effort Control — claude.ai &amp; Cowork</h3>
                  <span className="text-[10px] font-mono tracking-wider text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded font-bold uppercase">Live</span>
                </div>
                <div className="flex gap-4 flex-wrap text-[13px] font-mono text-[#9CA3AF]">
                  <span>Plans: ALL plans</span>
                  <span>·</span>
                  <span>Location: Alongside the model selector</span>
                </div>

                {/* Interactive Effort Control Diagram */}
                <Reveal y={20}>
                  <EffortControlDiagram />
                </Reveal>

                <div className="text-[18px] leading-[1.85] text-foreground/90 space-y-4">
                  <p className="font-semibold text-foreground">Notes:</p>
                  <ul className="list-none space-y-2 pl-4 border-l-2 border-primary/30">
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                      <span>Higher effort = thinks more deeply = better results</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                      <span>Lower effort = faster response = slower rate limit usage</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                      <span>Rate limits increased in Claude Code for extra/max levels</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="w-full h-px bg-[#E5E2DC]" />

              {/* Feature 3: Mid-Task System Prompts */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-foreground">Mid-Task System Prompts — Messages API</h3>
                  <span className="text-[10px] font-mono tracking-wider text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded font-bold uppercase">Live</span>
                </div>
                <div className="text-[18px] leading-[1.85] text-foreground/90 space-y-4">
                  <p className="font-semibold text-foreground">What it does:</p>
                  <ul className="list-none space-y-2 pl-4 border-l-2 border-primary/30">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB] mt-2.5 shrink-0" />
                      <span>System entries can now be passed INSIDE the messages array</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB] mt-2.5 shrink-0" />
                      <span>Update Claude&apos;s instructions mid-task without breaking the prompt cache or routing through a user turn</span>
                    </li>
                  </ul>
                  <p className="font-semibold text-foreground">Use cases:</p>
                  <ul className="list-none space-y-2 pl-4 border-l-2 border-[#D97706]/30">
                    {[
                      "Update permissions mid-agent run",
                      "Update token budgets dynamically",
                      "Update environment context as agent progresses"
                    ].map((uc, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                        <span>{uc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="w-full h-px bg-[#E5E2DC]" />

              {/* Feature 4: Rate Limits */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-foreground">Increased Rate Limits — Claude Code</h3>
                  <span className="text-[10px] font-mono tracking-wider text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded font-bold uppercase">Live</span>
                </div>
                <div className="text-[18px] leading-[1.85] text-foreground/90 space-y-4">
                  <ul className="list-none space-y-2 pl-4 border-l-2 border-primary/30">
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                      <span>Rate limits raised to support extra and max effort token usage</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                      <span>Users can select effort level that fits their project needs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 05 — EARLY TESTER FEEDBACK     */}
            {/* ─────────────────────────────────────── */}
            <section id="early-tester-feedback" className="scroll-mt-32 space-y-8">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Early Tester Feedback
              </h2>

              <div className="space-y-4">
                {[
                  {
                    quote: "Claude Opus 4.8 has noticeably better judgment. In Claude Code, it asks the right questions, catches its own mistakes, pushes back when a plan isn't sound.",
                    author: "Tom Pritchard",
                    title: "Staff Engineer"
                  },
                  {
                    quote: "On our Super-Agent benchmark, Claude Opus 4.8 is the only model to complete every case end-to-end, beating prior Opus models and GPT-5.5 at parity on cost.",
                    author: "Kay Zhu",
                    title: "Co-Founder and CTO"
                  },
                  {
                    quote: "On CursorBench, Claude Opus 4.8 exceeds prior Opus models across every effort level. Tool calling is meaningfully more efficient, using fewer steps for the same intelligence.",
                    author: "Michael Truell",
                    title: "Co-Founder & CEO, Cursor"
                  },
                  {
                    quote: "Claude Opus 4.8 delivers the highest score on our Legal Agent Benchmark and is the first model to break 10% on the all-pass standard.",
                    author: "Niko Grupen",
                    title: "Head of Applied Research"
                  },
                  {
                    quote: "Claude Opus 4.8 is the strongest computer-use and browser-agent model we've tested, scoring 84% on Online-Mind2Web — a meaningful jump over both Opus 4.7 and GPT-5.5.",
                    author: "Miguel Gonzalez",
                    title: "Tech Lead"
                  },
                  {
                    quote: "It improves on Opus 4.6 and fixes the comment-verbosity and tool-calling issues we saw with Opus 4.7. This translates directly into faster capability gains for engineers building on Devin.",
                    author: "Scott Wu",
                    title: "CEO, Devin"
                  },
                  {
                    quote: "Its multimodal strength lets Genie reason over PDFs, diagrams, and unstructured content at 61% cheaper token cost than Opus 4.7.",
                    author: "Hanlin Tang",
                    title: "CTO Neural Networks, Databricks"
                  },
                  {
                    quote: "The biggest differentiator was Opus 4.8's tendency to proactively flag issues — something other models routinely missed and left to users to catch.",
                    author: "Michael Ran",
                    title: "Sr. Investment Associate"
                  },
                  {
                    quote: "Across CoCounsel Legal, Claude Opus 4.8 delivered meaningful improvements in consistency and reasoning quality. For high-stakes professional workflows, that reliability matters.",
                    author: "Joel Hron",
                    title: "CTO, CoCounsel"
                  },
                  {
                    quote: "Claude Opus 4.8 feels like a major quality-of-life update over Opus 4.7: faster, easier to collaborate with, and better at carrying context across a long session.",
                    author: "Katie Parrott",
                    title: "Staff Writer"
                  }
                ].map((t, i) => (
                  <blockquote key={i} className="bg-card border border-border rounded-xl p-6 space-y-3">
                    <p className="text-[16px] italic leading-relaxed text-foreground/90">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#C0F0FB] rounded-full" />
                      <cite className="text-[13px] text-foreground font-semibold not-italic">{t.author}</cite>
                      <span className="text-[12px] text-[#9CA3AF]">— {t.title}</span>
                    </div>
                  </blockquote>
                ))}
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 06 — PRICING                   */}
            {/* ─────────────────────────────────────── */}
            <section id="pricing" className="scroll-mt-32 space-y-8">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Pricing
              </h2>
              <p className="text-[18px] leading-[1.85] text-foreground/90">
                <strong className="text-foreground">Unchanged from Opus 4.7:</strong>
              </p>

              {/* Pricing Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-border rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-[#0F0F12] text-white">
                      <th className="px-6 py-4 text-[12px] font-mono tracking-[0.1em] uppercase font-bold">Mode &amp; Direction</th>
                      <th className="px-6 py-4 text-[12px] font-mono tracking-[0.1em] uppercase font-bold text-right">Price per 1M Tokens</th>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-white/10">
                    {[
                      { mode: "Standard — Input", price: "$5.00" },
                      { mode: "Standard — Output", price: "$25.00" },
                      { mode: "Fast Mode — Input", price: "$10.00" },
                      { mode: "Fast Mode — Output", price: "$50.00" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-background transition-colors">
                        <td className="px-6 py-4 text-[15px] font-medium text-foreground/90">{row.mode}</td>
                        <td className="px-6 py-4 text-[15px] font-bold text-foreground text-right font-mono">{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 space-y-3">
                <p className="text-[11px] font-mono tracking-[0.15em] text-[#9CA3AF] uppercase font-bold">Key Points</p>
                <ul className="list-none space-y-2">
                  {[
                    "Zero price increase from Opus 4.7",
                    "Fast mode is 3x CHEAPER than previous Opus fast mode pricing",
                    "Fast mode runs 2.5x FASTER than standard mode",
                    "Available: claude.ai, API, Vertex AI, AWS Bedrock, MS Foundry"
                  ].map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-[15px] text-foreground/90">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 07 — API ACCESS & CODE         */}
            {/* ─────────────────────────────────────── */}
            <section id="api-access" className="scroll-mt-32 space-y-8">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                API Access &amp; Code
              </h2>
              <p className="text-[18px] leading-[1.85] text-foreground/90">
                Model ID: <code className="bg-[#0F0F12] text-primary px-2 py-0.5 rounded text-[15px] font-mono">claude-opus-4-8</code>
              </p>

              {/* Python */}
              <div className="bg-[#0F0F12] rounded-xl overflow-hidden border border-white/5">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                  <span className="text-[11px] font-mono tracking-[0.1em] text-[#9CA3AF] uppercase">Python</span>
                  <CopyCodeButton code={pythonCode} />
                </div>
                <pre className="p-5 overflow-x-auto text-[14px] leading-relaxed">
                  <code className="text-[#A0A0A0] font-mono">{pythonCode}</code>
                </pre>
              </div>

              {/* JavaScript */}
              <div className="bg-[#0F0F12] rounded-xl overflow-hidden border border-white/5">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                  <span className="text-[11px] font-mono tracking-[0.1em] text-[#9CA3AF] uppercase">JavaScript / Node.js</span>
                  <CopyCodeButton code={jsCode} />
                </div>
                <pre className="p-5 overflow-x-auto text-[14px] leading-relaxed">
                  <code className="text-[#A0A0A0] font-mono">{jsCode}</code>
                </pre>
              </div>

              {/* cURL */}
              <div className="bg-[#0F0F12] rounded-xl overflow-hidden border border-white/5">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                  <span className="text-[11px] font-mono tracking-[0.1em] text-[#9CA3AF] uppercase">cURL</span>
                  <CopyCodeButton code={curlCode} />
                </div>
                <pre className="p-5 overflow-x-auto text-[14px] leading-relaxed">
                  <code className="text-[#A0A0A0] font-mono">{curlCode}</code>
                </pre>
              </div>

              {/* Availability */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-3">
                <p className="text-[11px] font-mono tracking-[0.15em] text-[#9CA3AF] uppercase font-bold">Available Via</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: "Anthropic API", url: "platform.claude.com" },
                    { name: "Google Cloud", url: "Vertex AI Model Garden" },
                    { name: "Amazon", url: "AWS Bedrock" },
                    { name: "Microsoft", url: "Azure AI Foundry" },
                  ].map((p, i) => (
                    <div key={i} className="bg-background rounded-lg p-3 space-y-1 text-center">
                      <p className="text-[13px] font-bold text-foreground">{p.name}</p>
                      <p className="text-[11px] text-[#9CA3AF] font-mono">{p.url}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 08 — OPUS TIMELINE             */}
            {/* ─────────────────────────────────────── */}
            <section id="opus-timeline" className="scroll-mt-32 space-y-8">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Opus Model Timeline
              </h2>

              <div className="space-y-0 border-l-2 border-primary/30 pl-8">
                {[
                  {
                    date: "May 28, 2026",
                    model: "Opus 4.8",
                    highlight: "Honesty focus, Dynamic Workflows, 2.5x fast mode, 4x better code review",
                    current: true
                  },
                  {
                    date: "Apr 16, 2026",
                    model: "Opus 4.7",
                    highlight: "Stronger coding, vision, complex multi-step tasks",
                    current: false
                  },
                  {
                    date: "Feb 5, 2026",
                    model: "Opus 4.6",
                    highlight: "Reliability & precision for enterprise agents and workflows",
                    current: false
                  },
                  {
                    date: "2025",
                    model: "Opus 4.5",
                    highlight: "Foundation of the Opus 4.x series",
                    current: false
                  }
                ].map((entry, i) => (
                  <div key={i} className="relative pb-8 last:pb-0">
                    <div className={`absolute -left-[calc(2rem+5px)] w-3 h-3 rounded-full border-2 ${entry.current ? 'bg-[#C0F0FB] border-primary' : 'bg-card border-[#D1D5DB]'}`} />
                    <div className={`${entry.current ? 'bg-[#C0F0FB]/[0.03] border border-primary/10' : 'bg-card border border-border'} rounded-xl p-5 space-y-2`}>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[12px] font-mono text-[#9CA3AF]">{entry.date}</span>
                        {entry.current && <span className="text-[9px] font-mono tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded font-bold uppercase">Current</span>}
                      </div>
                      <p className="text-[17px] font-bold text-foreground">{entry.model}</p>
                      <p className="text-[14px] text-[#9CA3AF]">{entry.highlight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 09 — WHAT'S COMING NEXT        */}
            {/* ─────────────────────────────────────── */}
            <section id="whats-next" className="scroll-mt-32 space-y-8">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                What&apos;s Coming Next
              </h2>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-foreground">Claude Mythos — Next Generation Model Class</h3>
                <div className="text-[18px] leading-[1.85] text-foreground/90 space-y-4">
                  <ul className="list-none space-y-2 pl-4 border-l-2 border-primary/30">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB] mt-2.5 shrink-0" />
                      <span>Intelligence level: <strong className="text-foreground">HIGHER</strong> than Opus</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB] mt-2.5 shrink-0" />
                      <span>Currently: Testing with small number of organizations — Cybersecurity focus (Project Glasswing)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                      <span>Requires stronger cyber safeguards before public release</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                      <span>ETA: &ldquo;Coming weeks&rdquo; for all customers</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                      <span>Opus 4.8 alignment is already at Mythos Preview level</span>
                    </li>
                  </ul>
                </div>
                <blockquote className="border-l-4 border-primary bg-[#C0F0FB]/[0.03] pl-6 pr-6 py-5 rounded-r-xl">
                  <p className="text-[16px] italic leading-relaxed text-foreground/90">
                    &ldquo;We plan to release a new class of model with even higher intelligence than Opus. We expect to bring Mythos-class models to all customers in the coming weeks.&rdquo;
                  </p>
                  <cite className="text-[13px] text-[#9CA3AF] font-mono mt-2 block not-italic">— Anthropic</cite>
                </blockquote>

                <div className="text-[18px] leading-[1.85] text-foreground/90 space-y-4">
                  <p>Also Coming: Models with same Opus capabilities at a <strong className="text-foreground">LOWER COST</strong> (Smarter Sonnet or new affordable tier — not confirmed yet).</p>
                </div>
              </div>

              {/* Funding Round */}
              <div className="bg-[#0F0F12] text-white rounded-xl p-8 space-y-4 border border-white/5">
                <p className="text-[11px] font-mono tracking-[0.2em] text-primary uppercase font-bold">$65 Billion Funding Round</p>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-3xl font-black tracking-tight">$65B</p>
                    <p className="text-[12px] font-mono text-[#9CA3AF]">Series H Raised</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-black tracking-tight">$965B</p>
                    <p className="text-[12px] font-mono text-[#9CA3AF]">Valuation</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black tracking-tight leading-snug">Largest AI round in history</p>
                    <p className="text-[12px] font-mono text-[#9CA3AF]">As of May 2026</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 10 — QUICK REFERENCE TABLE     */}
            {/* ─────────────────────────────────────── */}
            <section id="quick-reference" className="scroll-mt-32 space-y-8">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Complete Quick Reference
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border border-border rounded-xl overflow-hidden text-[14px]">
                  <thead>
                    <tr className="bg-[#0F0F12] text-white">
                      <th className="px-5 py-3 text-[11px] font-mono tracking-[0.1em] uppercase font-bold w-[40%]">Property</th>
                      <th className="px-5 py-3 text-[11px] font-mono tracking-[0.1em] uppercase font-bold">Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-white/10">
                    {[
                      ["Model Name", "Claude Opus 4.8"],
                      ["API Model ID", "claude-opus-4-8"],
                      ["Release Date", "May 28, 2026"],
                      ["Developer", "Anthropic"],
                      ["Predecessor", "Claude Opus 4.7 (Apr 16, 2026)"],
                      ["SWE-Bench Pro", "69.2% (+4.9% vs 4.7)"],
                      ["Terminal-Bench 2.1", "74.2% (+8.4% vs 4.7)"],
                      ["Multidisciplinary Reasoning", "57.9% (+3.2% vs 4.7)"],
                      ["Online-Mind2Web (Browser)", "84% — Best in class"],
                      ["Legal Agent Benchmark", "Highest recorded — First 10% all-pass"],
                      ["Code Flaw Detection", "4x less likely to miss flaws"],
                      ["Standard Input Price", "$5 per 1M tokens"],
                      ["Standard Output Price", "$25 per 1M tokens"],
                      ["Fast Mode Input Price", "$10 per 1M tokens"],
                      ["Fast Mode Output Price", "$50 per 1M tokens"],
                      ["Price Change vs 4.7", "NONE"],
                      ["Fast Mode Speed", "2.5x faster than standard"],
                      ["Fast Mode Cost Change", "3x cheaper than previous fast mode"],
                      ["New Feature 1 (Claude Code)", "Dynamic Workflows (Research Preview)"],
                      ["Dynamic Workflows Plans", "Enterprise, Team, Max"],
                      ["New Feature 2 (claude.ai)", "Effort Control (All plans)"],
                      ["Effort Levels", "Low / High (default) / Extra / Max"],
                      ["Claude Code Effort IDs", "low / high / xhigh / max"],
                      ["New Feature 3 (API)", "Mid-task system prompt updates"],
                      ["New Feature 4 (Claude Code)", "Increased rate limits"],
                      ["Alignment Level", "Comparable to Claude Mythos Preview"],
                      ["Prosocial Traits", "New highs vs all previous Opus models"],
                      ["Deception Rate", "Substantially lower than Opus 4.7"],
                      ["Coming Next", "Mythos-class models (weeks away)"],
                      ["Funding Raised", "$65 Billion (Series H)"],
                      ["Anthropic Valuation", "$965 Billion"],
                    ].map(([prop, val], i) => (
                      <tr key={i} className="hover:bg-background transition-colors">
                        <td className="px-5 py-3 font-medium text-[#9CA3AF]">{prop}</td>
                        <td className="px-5 py-3 font-semibold text-foreground">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SOURCES                                 */}
            {/* ─────────────────────────────────────── */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Sources</h3>
              <div className="bg-card border border-border rounded-xl p-6 space-y-2">
                {[
                  { label: "Official Blog", url: "https://www.anthropic.com/news/claude-opus-4-8" },
                  { label: "Model Page", url: "https://www.anthropic.com/claude/opus" },
                  { label: "System Card", url: "https://www.anthropic.com/claude-opus-4-8-system-card" },
                  { label: "API Docs", url: "https://platform.claude.com/docs/en/about-claude/models" },
                  { label: "Series H Funding", url: "https://www.anthropic.com/news/series-h" },
                ].map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[14px] text-primary hover:text-foreground transition-colors group">
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="font-medium">{s.label}</span>
                    <span className="text-[12px] text-[#9CA3AF] font-mono truncate hidden sm:inline">{s.url}</span>
                  </a>
                ))}
              </div>
              <p className="text-[13px] text-[#9CA3AF] text-center italic mt-4">All data sourced from Anthropic&apos;s official release — May 28, 2026</p>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* FAQ SECTION                             */}
            {/* ─────────────────────────────────────── */}
            <section id="faq" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Frequently Asked Questions
              </h2>
              <AccordionFAQ items={faqData} />
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* AUTHOR BLOCK                            */}
            {/* ─────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-8 flex flex-col sm:flex-row items-start gap-6">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <span className="text-xl font-black text-primary">G</span>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-mono tracking-[0.15em] text-[#9CA3AF] uppercase">Published by</p>
                <p className="text-lg font-bold text-foreground">GrowxLabs</p>
                <p className="text-[15px] text-[#9CA3AF] leading-relaxed">
                  Developing scalable software systems, advanced automation engines, and AGI-native infrastructure. Based in India, serving businesses globally.
                </p>
                <a href="https://growxlabs.tech" target="_blank" rel="noopener noreferrer" className="text-[13px] text-primary font-mono font-bold hover:underline inline-flex items-center gap-1.5 mt-2">
                  growxlabs.tech <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* RELATED ARTICLES                        */}
            {/* ─────────────────────────────────────── */}
            <section className="space-y-8">
              <h2 className="text-2xl font-black tracking-tight text-foreground">Continue Reading</h2>
              <div className="grid gap-4">
                {relatedArticles.map((article, i) => (
                  <Link key={i} href={article.href} className="group block bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-[17px] font-bold text-foreground group-hover:text-primary transition-colors leading-snug">{article.title}</h3>
                        <div className="flex items-center gap-4 font-mono text-[11px] text-[#9CA3AF] tracking-wider uppercase">
                          <span>{article.date}</span>
                          <span>·</span>
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#D1D5DB] group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
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
