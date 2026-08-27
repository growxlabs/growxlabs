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

// ═══════════════════════════════════════════════════
// METADATA GENERATOR (SEO / GEO / AEO Optimization)
// ═══════════════════════════════════════════════════
export async function generateMetadata() {
  const title = "Claude Fable 5 & Mythos 5 Launch: Benchmarks & Guide";
  const description = "Explore Anthropic's Claude Fable 5 and Mythos 5 models. Check out benchmarks, comparison specs, use cases, and details on global API availability.";

  return {
    title: `${title} | GrowxLabs`,
    description,
    alternates: {
      canonical: "https://growxlabs.tech/blog/claude-fable-5-mythos-5-anthropic-models"
    },
    openGraph: {
      title,
      description,
      url: "https://growxlabs.tech/blog/claude-fable-5-mythos-5-anthropic-models",
      siteName: "GrowxLabs",
      type: "article",
      publishedTime: "2026-06-09T08:00:00.000Z",
      authors: ["GrowxLabs"],
      images: [
        {
          url: "https://growxlabs.tech/images/blog-claude-fable-5-mythos-5.png",
          width: 1200,
          height: 630,
          alt: "Claude Fable 5 and Mythos 5 launch cover"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://growxlabs.tech/images/blog-claude-fable-5-mythos-5.png"]
    },
    keywords: [
      "Claude Fable 5",
      "Claude Mythos 5",
      "Anthropic Fable 5",
      "Mythos-class AI",
      "agentic workflows",
      "long-context AI",
      "cybersecurity AI safeguards",
      "Project Glasswing"
    ]
  };
}

export default async function ClaudeFable5Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const titleName = "CLAUDE FABLE";

  // Headings for Table of Contents scrollspy
  const headings = [
    { id: "what-is-fable-5", text: "What Is Claude Fable 5?" },
    { id: "what-is-mythos-5", text: "What Is Claude Mythos 5?" },
    { id: "model-comparison", text: "Fable 5 vs. Mythos 5 Comparison" },
    { id: "release-details", text: "Release & Availability" },
    { id: "why-it-matters", text: "Why This Launch Matters" },
    { id: "practical-use-cases", text: "Practical Use Cases" },
    { id: "challenges-limitations", text: "Challenges & Limitations" },
    { id: "quick-reference", text: "Quick Reference Table" },
    { id: "faq", text: "Frequently Asked Questions" }
  ];

  // FAQ data for both visual rendering and JSON-LD schema
  const faqData = [
    {
      question: "What is Claude Fable 5?",
      answer: "Claude Fable 5 is Anthropic's most advanced public AI model, featuring a 500k-token context window and specialized optimization for software engineering, deep reasoning, and autonomous agentic workflows."
    },
    {
      question: "When were Claude Fable 5 and Mythos 5 released?",
      answer: "Both models were officially announced and made available on June 9, 2026."
    },
    {
      question: "How do I access Claude Fable 5?",
      answer: "Developers can access Fable 5 through the Anthropic API Console using the model ID 'claude-fable-5', or find it hosted on AWS Bedrock and GCP Vertex AI. It is also available to Claude Pro and Team subscribers."
    },
    {
      question: "Why is Claude Mythos 5 restricted?",
      acceptedAnswer: {
        "@type": "Answer",
        "text": "Anthropic has restricted access to Claude Mythos 5 due to its advanced cybersecurity capabilities, limiting its usage to approved security researchers and enterprise partners to prevent misuse."
      },
      answer: "Anthropic has restricted access to Claude Mythos 5 due to its advanced cybersecurity capabilities, limiting its usage to approved security researchers and enterprise partners to prevent misuse."
    },
    {
      question: "What is Project Glasswing?",
      answer: "Project Glasswing is a collaborative safety research initiative using Claude Mythos 5 to test automated cyber-defense mechanisms and vulnerability discovery in secure, sandboxed environments."
    }
  ];

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://growxlabs.tech/blog/claude-fable-5-mythos-5-anthropic-models/#article`,
        "headline": "Claude Fable 5 and Mythos 5 Officially Launch: Anthropic Introduces Its Most Powerful AI Models Yet",
        "description": "Explore Anthropic's Claude Fable 5 and Mythos 5 models. Check out benchmarks, comparison specs, use cases, and details on global API availability.",
        "datePublished": "2026-06-09T08:00:00Z",
        "dateModified": "2026-06-09T08:00:00Z",
        "image": "https://growxlabs.tech/images/blog-claude-fable-5-mythos-5.png",
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
          "@id": `https://growxlabs.tech/blog/claude-fable-5-mythos-5-anthropic-models`
        }
      },
      {
        "@type": "FAQPage",
        "@id": `https://growxlabs.tech/blog/claude-fable-5-mythos-5-anthropic-models/#faq`,
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
            "name": "Claude Fable 5 & Mythos 5",
            "item": `https://growxlabs.tech/blog/claude-fable-5-mythos-5-anthropic-models`
          }
        ]
      }
    ]
  };

  // Code examples
  const pythonCode = `import anthropic

client = anthropic.Anthropic(api_key="YOUR_API_KEY")

message = client.messages.create(
    model="claude-fable-5",
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
    model: "claude-fable-5",
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
    "model": "claude-fable-5",
    "max_tokens": 8192,
    "messages": [
      {"role": "user", "content": "Your prompt here"}
    ]
  }'`;

  // Related articles
  const relatedArticles = [
    {
      title: "Claude Opus 4.8: Anthropic's Most Advanced AI Model — Benchmarks, Features & Full Review",
      href: "/blog/claude-opus-4-8-anthropic-ai-model",
      date: "May 29, 2026",
      readTime: "12 min read"
    },
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
    }
  ];

  return (
    <div className="blog-article-page w-full bg-background min-h-screen text-foreground selection:bg-primary/10 selection:text-primary pt-32 pb-24">
      {/* JSON-LD Structured Data */}
      <Script
        id="claude-fable-schemas"
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
              Claude Fable 5 &amp; Mythos 5:
              {" "}
              <span className="text-primary">Anthropic&apos;s Next-Gen AI Architecture</span>
            </h2>

            {/* Excerpt */}
            <p className="text-[18px] md:text-[20px] text-[#A1A1AA] leading-relaxed max-w-3xl mx-auto mb-10 font-normal">
              Anthropic officially unveils Fable 5 and Mythos 5, introducing a 500k context window, advanced software engineering tools, and Project Glasswing safety environments.
            </p>

            {/* Meta Bar */}
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-6 sm:gap-10 font-mono text-[11px] tracking-[0.1em] text-[#9CA3AF] uppercase border-t border-b border-border py-5">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>By GrowxLabs</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>10 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>June 9, 2026</span>
              </div>
            </div>
          </Reveal>

          {/* Hero Visual Card */}
          <Reveal y={30} delay={0.2}>
            <div className="blog-editorial-image-frame mt-14 w-full max-w-4xl mx-auto">
              <div className="bg-[#0F0F12] rounded-2xl p-10 md:p-14 text-white relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C0F0FB]/8 rounded-full blur-[120px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#D97706]/5 rounded-full blur-[100px] -ml-32 -mb-32" />
                <div className="relative z-10 space-y-8 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#C0F0FB] animate-pulse" />
                    <span className="text-[11px] font-mono tracking-[0.3em] text-primary uppercase font-bold">Released June 9, 2026</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-4xl md:text-5xl font-black tracking-tight">Claude Fable 5</h3>
                    <p className="text-[#9CA3AF] font-mono text-sm">Model ID: claude-fable-5 · Developer: Anthropic</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                    {[
                      { label: "SWE-Bench Verified", value: "78.6%", delta: "+9.4% vs Opus 4.8" },
                      { label: "Context Window", value: "500K", delta: "Tokens" },
                      { label: "GPQA Reasoning", value: "72.1%", delta: "Near-Expert" },
                      { label: "Math (MATH)", value: "84.5%", delta: "Best" },
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
            {/* SECTION 01 — WHAT IS CLAUDE FABLE 5?   */}
            {/* ─────────────────────────────────────── */}
            <section id="what-is-fable-5" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                What Is Claude Fable 5?
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p className="first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                  Claude Fable 5 is Anthropic&apos;s most advanced public AI model to date. Built specifically to handle complex task structures, multi-step planning, and autonomous agent loops, Fable 5 is engineered for developers and business operational pipelines.
                </p>
                <p>
                  Equipped with a massive 500,000-token context window, Fable 5 can ingest entire software codebases, comprehensive quarterly financial logs, or hundreds of pages of legal compliance documentation in a single prompt. More importantly, its needle-in-a-haystack recall score remains at 99.9% across the entire window, meaning you will not lose context or experience hallucination loops.
                </p>
              </div>

              <div className="text-[18px] leading-[1.85] text-foreground/90 font-normal space-y-4 font-sans">
                <p className="font-semibold text-foreground">Core Benchmarks:</p>
                <ul className="list-none space-y-2 pl-4 border-l-2 border-primary/30">
                  <li><strong>SWE-Bench Verified:</strong> 78.6% (vs. 69.2% for Claude Opus 4.8)</li>
                  <li><strong>GPQA Reasoning:</strong> 72.1% (Graduate-Level Google-Proof Q&A)</li>
                  <li><strong>MMLU-Pro:</strong> 89.4% (Multitask Language Understanding)</li>
                  <li><strong>MATH Reasoning:</strong> 84.5% (Abstract Math Logic)</li>
                </ul>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 02 — WHAT IS CLAUDE MYTHOS 5?  */}
            {/* ─────────────────────────────────────── */}
            <section id="what-is-mythos-5" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                What Is Claude Mythos 5?
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  Claude Mythos 5 is the underlying flagship model that powers the new Mythos-class architecture. While it shares the same core reasoning engine as Fable 5, it operates with fewer restrictions and is intended exclusively for highly trusted organizations and enterprise partners under custom agreements.
                </p>
                <p>
                  Because of its powerful capabilities in cybersecurity vulnerability scanning and Abstract Mathematics, Anthropic has opted for a tiered, safety-first launch approach. Direct access to the raw Mythos 5 engine is currently restricted to key researchers and safety teams engaged in custom sandboxed audits, such as Project Glasswing.
                </p>
              </div>

              <blockquote className="border-l-4 border-primary bg-[#C0F0FB]/[0.03] pl-6 pr-6 py-6 my-8 rounded-r-xl">
                <p className="text-[17px] italic leading-relaxed text-foreground/90 font-medium">
                  &ldquo;By releasing a filtered, safety-compliant public model in Fable 5 while keeping the raw Mythos 5 class restricted, Anthropic balances global commercial competitiveness with rigorous safety alignment.&rdquo;
                </p>
                <cite className="text-[13px] text-[#9CA3AF] font-mono mt-3 block not-italic">— GrowxLabs Analysis</cite>
              </blockquote>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 03 — FABLE 5 VS MYTHOS 5       */}
            {/* ─────────────────────────────────────── */}
            <section id="model-comparison" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Fable 5 vs. Mythos 5 Comparison
              </h2>
              <div className="text-[18px] leading-[1.85] text-foreground/90 font-normal space-y-4">
                <p>
                  The table below outlines the operational and target differences between the public-facing Claude Fable 5 and the restricted enterprise Claude Mythos 5 model tiers:
                </p>
              </div>

              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left border border-border rounded-xl overflow-hidden text-[14px]">
                  <thead>
                    <tr className="bg-[#0F0F12] text-white">
                      <th className="px-5 py-3 text-[11px] font-mono tracking-[0.1em] uppercase font-bold w-[40%]">Metric</th>
                      <th className="px-5 py-3 text-[11px] font-mono tracking-[0.1em] uppercase font-bold">Claude Fable 5</th>
                      <th className="px-5 py-3 text-[11px] font-mono tracking-[0.1em] uppercase font-bold">Claude Mythos 5</th>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-white/10">
                    {[
                      ["Availability", "Public API & Claude Web Console", "Restricted Enterprise Partners"],
                      ["Context Window", "500,000 Tokens (Standard)", "500,000+ (Dynamic Allocation)"],
                      ["SWE-Bench Score", "78.6% (Verified)", "84.1% (Internal Benchmark)"],
                      ["Focus Area", "Production applications & agentic code", "Cybersecurity research & simulation"],
                      ["Safety Guardrails", "Integrated Native Post-processing", "Monitored sandboxed environment"],
                      ["API Model ID", "claude-fable-5", "Private Custom Endpoints"],
                    ].map(([prop, val1, val2], i) => (
                      <tr key={i} className="hover:bg-card/40 transition-colors">
                        <td className="px-5 py-3 font-medium text-[#9CA3AF]">{prop}</td>
                        <td className="px-5 py-3 font-semibold text-foreground">{val1}</td>
                        <td className="px-5 py-3 font-semibold text-foreground">{val2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 04 — RELEASE & AVAILABILITY    */}
            {/* ─────────────────────────────────────── */}
            <section id="release-details" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Release &amp; Availability
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  Both models launched on <strong>June 9, 2026</strong>. Developers can access Fable 5 through the standard Anthropic developer dashboard. Cloud integrations are also available for enterprise platforms.
                </p>
              </div>

              {/* Availability Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
                {[
                  { label: "AWS Bedrock", value: "Available Now" },
                  { label: "GCP Vertex AI", value: "Available Now" },
                  { label: "Azure AI Foundry", value: "Pending Integration" },
                  { label: "Model ID", value: "claude-fable-5" },
                  { label: "Price per 1M Input", value: "$8.00" },
                  { label: "Price per 1M Output", value: "$32.00" },
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
            {/* SECTION 05 — WHY THIS LAUNCH MATTERS   */}
            {/* ─────────────────────────────────────── */}
            <section id="why-it-matters" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Why This Launch Matters
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  The release of Fable 5 and Mythos 5 highlights a shift in the AI competition from conversational responsiveness to agentic autonomy. In 2026, the primary metric of AI performance is no longer how fast a model answers a prompt, but how reliably it can plan, execute, test, and self-correct over multi-hour operational timelines.
                </p>
                <p>
                  By introducing Fable 5, Anthropic has set a benchmark that forces competitors like OpenAI and Google DeepMind to focus on task resilience (coyote time error recovery and loop self-correction) over simple chat speed.
                </p>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 06 — PRACTICAL USE CASES       */}
            {/* ─────────────────────────────────────── */}
            <section id="practical-use-cases" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Practical Use Cases
              </h2>
              <div className="grid gap-6">
                {[
                  {
                    title: "Software Developers & Startups",
                    desc: "Feed Fable 5 an entire software directory to refactor legacy codebases, locate complex memory leaks, upgrade versions, and configure multi-agent CI/CD bug fixers."
                  },
                  {
                    title: "Enterprises & Financial Analyst Teams",
                    desc: "Automate large-scale document audits, contract reviews, and quarterly financial report processing to spot data inconsistencies and compliance risks instantly."
                  },
                  {
                    title: "Researchers & Academics",
                    desc: "Ingest and synthesize hundreds of arXiv or bioRxiv papers, trace conflicting studies, format complex charts, and generate structured research outlines."
                  }
                ].map((uc, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-2">
                    <h3 className="text-lg font-bold text-foreground">{uc.title}</h3>
                    <p className="text-[15px] text-[#9CA3AF] leading-relaxed">{uc.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 07 — CHALLENGES & LIMITATIONS  */}
            {/* ─────────────────────────────────────── */}
            <section id="challenges-limitations" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Challenges &amp; Limitations
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  Operationalizing a 500k context window comes with challenges. High token counts lead to increased costs, making optimization methods like prompt caching and session reuse essential for developer pipelines.
                </p>
                <p>
                  Additionally, because Fable 5 runs deeper cognitive cycles to coordinate long-running tasks, latency is higher than lightweight models, meaning it is not optimized for instantaneous chat applications.
                </p>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 08 — QUICK REFERENCE TABLE     */}
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
                      ["Model Name", "Claude Fable 5"],
                      ["API Model ID", "claude-fable-5"],
                      ["Release Date", "June 9, 2026"],
                      ["Developer", "Anthropic"],
                      ["SWE-Bench Verified", "78.6%"],
                      ["GPQA (Reasoning)", "72.1%"],
                      ["Context Window", "500,000 Tokens"],
                      ["Standard Input Price", "$8.00 per 1M tokens"],
                      ["Standard Output Price", "$32.00 per 1M tokens"],
                      ["Restricted Counterpart", "Claude Mythos 5"],
                      ["Safety Protocol", "Project Glasswing Sandboxed Testing"],
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
                  { label: "Anthropic Fable 5 Launch", url: "https://www.anthropic.com/news/claude-fable-5" },
                  { label: "API Model Specifications", url: "https://platform.claude.com/docs/models" },
                  { label: "Anthropic System Card", url: "https://www.anthropic.com/fable-5-system-card" },
                ].map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[14px] text-primary hover:text-foreground transition-colors group">
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="font-medium">{s.label}</span>
                    <span className="text-[12px] text-[#9CA3AF] font-mono truncate hidden sm:inline">{s.url}</span>
                  </a>
                ))}
              </div>
              <p className="text-[13px] text-[#9CA3AF] text-center italic mt-4">All data sourced from Anthropic&apos;s official release — June 9, 2026</p>
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
