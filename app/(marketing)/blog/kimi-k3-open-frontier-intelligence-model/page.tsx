import React from "react";
import Script from "next/script";
import Image from "next/image";
import { Link } from "@/navigation";
import { 
  ReadingProgressBar, 
  TableOfContents 
} from "@/components/marketing/BlogInteractive";
import { 
  AuthorProfileSidebar, 
  BlogActionBar,
  RelatedEssaysList,
  NewsletterForwardBanner
} from "@/components/marketing/BlogEditorial";
import { FlickerText } from "@/components/marketing/FlickerText";
import { Reveal } from "@/components/marketing/Reveal";
import { 
  Calendar, 
  Clock, 
  User, 
  ChevronDown
} from "lucide-react";
import { BlogShare } from "./InteractiveComponents";

// ═══════════════════════════════════════════════════
// METADATA GENERATOR (SEO & Social Previews)
// ═══════════════════════════════════════════════════
export async function generateMetadata() {
  const title = "Kimi K3 Technical Analysis: Inside Moonshot AI's Open Frontier Intelligence Model";
  const description = "Technical deep-dive into Moonshot AI's Kimi K3 2.8T open-weight Mixture-of-Experts model, analyzing its Delta Attention, sparse routing, and long-horizon benchmark performance.";

  return {
    title: `${title} | GrowxLabs`,
    description,
    alternates: {
      canonical: "https://growxlabs.tech/blog/kimi-k3-open-frontier-intelligence-model"
    },
    openGraph: {
      title,
      description,
      url: "https://growxlabs.tech/blog/kimi-k3-open-frontier-intelligence-model",
      siteName: "GrowxLabs",
      type: "article",
      publishedTime: "2026-07-21T00:00:00.000Z",
      authors: ["GrowxLabs"],
      images: [
        {
          url: "https://growxlabs.tech/images/blog-kimi-k3-woodcut.png",
          width: 1200,
          height: 630,
          alt: "Moonshot AI Kimi K3 Open Frontier Model"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://growxlabs.tech/images/blog-kimi-k3-woodcut.png"]
    },
    keywords: [
      "Kimi K3",
      "Moonshot AI",
      "Open weight LLM",
      "Mixture of Experts",
      "Kimi Delta Attention",
      "SWE Marathon",
      "Terminal Bench 2.1",
      "2.8T parameter model",
      "Yang Zhilin"
    ]
  };
}

export default async function KimiK3BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const titleName = "KIMI K3";

  const headings = [
    { id: "the-ai-race-before-kimi-k3", text: "1. The AI Race Before Kimi K3" },
    { id: "what-is-kimi-k3", text: "2. What is Kimi K3?" },
    { id: "company-behind-kimi", text: "3. Company Behind Kimi: Moonshot AI" },
    { id: "architectural-breakdown", text: "4. Architectural Breakdown" },
    { id: "core-research-innovations", text: "5. Core Research Innovations" },
    { id: "training-pipeline", text: "6. Training Pipeline & Dataset Engineering" },
    { id: "benchmark-evaluation", text: "7. Benchmark Evaluation & Internal Work Benches" },
    { id: "software-engineering", text: "8. Software Engineering & Long-Horizon Coding" },
    { id: "autonomous-agents", text: "9. General & Visual Agent Benchmarks" },
    { id: "hardware-performance", text: "10. Roofline & Hardware Efficiency" },
    { id: "open-weight-strategy", text: "11. The Open-Weight Strategy" },
    { id: "expert-analysis", text: "Expert Analysis" },
    { id: "key-takeaways", text: "Key Takeaways" },
    { id: "faq", text: "Frequently Asked Questions" }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://growxlabs.tech/blog/kimi-k3-open-frontier-intelligence-model/#article`,
        "headline": "Kimi K3 Technical Analysis: Inside Moonshot AI's Open Frontier Intelligence Model",
        "description": "Technical analysis of Moonshot AI's Kimi K3 2.8T open-weight Mixture-of-Experts architecture, Delta Attention, and software engineering benchmarks.",
        "datePublished": "2026-07-21T00:00:00.000Z",
        "dateModified": "2026-07-21T00:00:00.000Z",
        "image": "https://growxlabs.tech/images/blog-kimi-k3-woodcut.png",
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
          "@id": `https://growxlabs.tech/blog/kimi-k3-open-frontier-intelligence-model`
        }
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
            "name": "Kimi K3 Analysis",
            "item": `https://growxlabs.tech/blog/kimi-k3-open-frontier-intelligence-model`
          }
        ]
      }
    ]
  };

  const relatedEssays = [
    {
      title: "Skyroot Aerospace Launches Vikram-1, Ushering India Into Private Orbital Era",
      accentWord: "Orbital",
      excerpt: "Deep technical breakdown of India's first privately developed orbital launcher, carbon composite airframes, and payload economics.",
      href: "/blog/skyroot-aerospace-vikram-1-orbital-launch",
      date: "July 21, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/blog-skyroot-vikram1.png"
    },
    {
      title: "ChatGPT GPT-5.6 Preview: Everything You Need to Know",
      accentWord: "Preview",
      excerpt: "Explore the new tiered family of models (Sol, Terra, Luna) and discover its advanced reasoning and coding capabilities.",
      href: "/blog/chatgpt-gpt-5-6-preview-everything-you-need-to-know",
      date: "June 30, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/blog-gpt56-preview.png"
    },
    {
      title: "Claude Opus 4.8: Anthropic's Most Advanced AI Model — Benchmarks & Review",
      accentWord: "Benchmarks",
      excerpt: "Deep dive into Claude 4.8 benchmarks, including SWE-Bench Pro, Terminal-Bench 2.1, and the new Dynamic Workflows engine.",
      href: "/blog/claude-opus-4-8-anthropic-ai-model",
      date: "May 29, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/claude_blog_woodcut_1780853620986.png"
    }
  ];

  const faqItems = [
    { q: "What is Kimi K3?", a: "Kimi K3 is a 2.8-trillion parameter open-weight Mixture-of-Experts (MoE) foundation model created by Moonshot AI, designed for advanced coding, autonomous agent execution, and 1M context processing." },
    { q: "Is Kimi K3 open-source or open-weight?", a: "Kimi K3 is an open-weight model, meaning its neural network weights and architecture specifications are publicly accessible for self-hosting and research." },
    { q: "How many active parameters does Kimi K3 use per token?", a: "Out of 2.8 trillion total parameters across 512 experts, K3 routes tokens to 128 active experts per pass, utilizing approximately 380 billion active parameters per token." },
    { q: "What is Kimi Delta Attention?", a: "Kimi Delta Attention is a hybrid attention mechanism that compresses historical key-value states into dynamic state-space deltas, reducing KV-cache memory usage by 68% at 1 million tokens." },
    { q: "What context window length does Kimi K3 support?", a: "Kimi K3 natively supports a 1,048,576-token (1 million) context window." },
    { q: "Who founded Moonshot AI?", a: "Moonshot AI was founded in 2023 by Yang Zhilin, a leading AI researcher and co-author of Transformer-XL and XLNet." }
  ];

  return (
    <div className="blog-article-page w-full bg-background min-h-screen text-foreground selection:bg-primary/10 selection:text-primary pt-32 pb-24">
      {/* JSON-LD Structured Data */}
      <Script
        id="kimi-k3-schema"
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
                AI Research
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                /
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                Architecture
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                /
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                Open Weights
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-black leading-[1.1] tracking-tighter text-foreground mb-8 max-w-4xl mx-auto font-serif">
              Kimi K3: Inside Moonshot AI’s <span className="italic font-serif font-normal">Open Frontier</span> Model
              {" "}
              <span className="text-primary font-sans font-black tracking-tighter block mt-2">Technical Deep-Dive into the 2.8T MoE Architecture</span>
            </h2>

            {/* Meta Bar */}
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-6 sm:gap-10 font-mono text-[11px] tracking-[0.1em] text-[#9CA3AF] uppercase border-t border-b border-border py-5">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>By GrowxLabs</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>18 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>July 21, 2026</span>
              </div>
            </div>
          </Reveal>

          {/* Hero Visual — Featured Image */}
          <Reveal y={30} delay={0.2}>
            <div className="blog-editorial-image-frame mt-14 w-full max-w-5xl mx-auto">
              <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-[#0F0F12] rounded-xl border border-white/10">
                <Image
                  src="/images/blog-kimi-k3-woodcut.png"
                  alt="Moonshot AI Kimi K3 Neural Architecture Woodcut Illustration"
                  fill
                  className="object-contain transition-transform duration-700"
                  priority
                />
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
          
          {/* Desktop Author Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-32 h-fit">
            <AuthorProfileSidebar
              authorName="AI Research Group"
              authorRole="Systems & LLM Engineering"
              authorAvatar="/images/avatars/growxlabs.png"
              category="AI • Architecture"
              bio="In-depth technical analysis on sparse Mixture-of-Experts architectures, Delta Attention, and autonomous agent benchmarks."
            />
          </aside>

          {/* Main Content Article */}
          <article className="lg:col-span-9 space-y-12 text-foreground font-serif text-lg leading-relaxed">
            
            <NewsletterForwardBanner />
            <BlogActionBar title="Kimi K3 Technical Analysis: Inside Moonshot AI's Open Frontier Intelligence Model" slug="kimi-k3-open-frontier-intelligence-model" />

            <TableOfContents headings={headings} />

            {/* SECTION 1 */}
            <section id="the-ai-race-before-kimi-k3" className="space-y-4 font-sans">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                1. The AI Race Before Kimi K3
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Prior to the introduction of Kimi K3, the landscape of frontier artificial intelligence was defined by a stark bifurcation between closed-source proprietary APIs and open-weight architectures. Closed-source models such as OpenAI’s GPT-5.5 (and preview variants like GPT-5.6 Sol), Anthropic’s Claude Fable 5 and Mythos 5, and Google’s Gemini 1.5/2.0 Pro maintained a consistent performance lead in multi-file software engineering, mathematical formalization, and complex multi-step reasoning.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                While open-weight models like Meta’s Llama 3.3 405B, Alibaba’s Qwen 2.5 series, and DeepSeek’s V3/R1 architectures drastically lowered inference costs and enabled self-hosted enterprise deployments, a gap persisted in long-horizon task execution. Open-weight models frequently struggled with multi-turn tool loops, maintaining long-context coherence beyond 128,000 tokens, and surviving high-step software engineering benchmarks without state degradation.
              </p>
            </section>

            {/* SECTION 2 */}
            <section id="what-is-kimi-k3" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                2. What is Kimi K3?
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Kimi K3 is Moonshot AI’s flagship third-generation foundation model. Built on a sparse Mixture-of-Experts transformer framework, K3 integrates 2.8 trillion total parameters with an active parameter footprint of 380 billion per token pass.
              </p>
              <div className="overflow-x-auto my-6 border border-border rounded-xl">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-muted uppercase text-foreground">
                    <tr>
                      <th className="p-3 border-b border-border">Specification</th>
                      <th className="p-3 border-b border-border">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-muted-foreground">
                    <tr><td className="p-3 font-bold text-foreground">Core Parameter Count</td><td className="p-3">2.8 Trillion Total / 380 Billion Active</td></tr>
                    <tr><td className="p-3 font-bold text-foreground">Architecture</td><td className="p-3">Sparse MoE + Delta Attention + Latent Routing</td></tr>
                    <tr><td className="p-3 font-bold text-foreground">Context Window Length</td><td className="p-3">1,048,576 Tokens (1M Native)</td></tr>
                    <tr><td className="p-3 font-bold text-foreground">Expert Topology</td><td className="p-3">512 Total Experts / 128 Active per Token</td></tr>
                    <tr><td className="p-3 font-bold text-foreground">Training Corpus</td><td className="p-3">18.2 Trillion Multi-Modal Tokens</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 3 */}
            <section id="company-behind-kimi" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                3. Company Behind Kimi: Moonshot AI
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Founded in March 2023 in Beijing by Yang Zhilin and a team of AI researchers from Tsinghua University, Google Brain, and Meta AI, Moonshot AI established itself as a pioneer in long-context language modeling. Yang Zhilin’s prior research contributions—specifically <em>Transformer-XL</em> and <em>XLNet</em>—focused heavily on scaling sequence lengths and capturing long-range dependencies.
              </p>
            </section>

            {/* SECTION 4 */}
            <section id="architectural-breakdown" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                4. Architectural Breakdown
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                The architecture of Kimi K3 resolves two fundamental bottlenecks: computational throughput during inference and memory bandwidth saturation during 1M long-context processing.
              </p>
            </section>

            {/* SECTION 5 & 6 */}
            <section id="core-research-innovations" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                5. Core Research Innovations & Kimi Delta Attention
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Kimi Delta Attention compresses historical key-value states into dynamic state-space deltas, cutting KV-cache memory usage by 68% at 1 million tokens while preserving single-needle retrieval accuracy at 99.7%.
              </p>
            </section>

            {/* SECTION 7 - INTERNAL KNOWLEDGE WORK BENCH (EMBEDDED UPLOADED IMAGE 1) */}
            <section id="benchmark-evaluation" className="space-y-6 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                7. Benchmark Evaluation & Internal Work Benches
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                In complex enterprise knowledge tasks—such as financial modeling, presentation slide generation, and research synthesis—Kimi K3 achieves top scores on internal and public benchmark suites.
              </p>

              {/* EMBEDDED USER UPLOADED BENCHMARK IMAGE 1 */}
              <div className="my-8 space-y-3">
                <div className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black p-2">
                  <Image
                    src="/images/kimi-k3-knowledge-bench.png"
                    alt="Internal Knowledge Work Bench Results for Kimi K3"
                    width={1200}
                    height={800}
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
                <p className="text-xs font-mono text-center text-muted-foreground">
                  Figure 1: Internal Knowledge Work Bench results comparing Kimi K3 against GPT 5.5 and Claude Opus 4.8 across Online Exp Bench, DECK-Bench, and Finance-Bench.
                </p>
              </div>
            </section>

            {/* SECTION 8 - SOFTWARE ENGINEERING */}
            <section id="software-engineering" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                8. Software Engineering & Long-Horizon Coding
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Kimi K3 scores 42.0% on SWE Marathon, 88.3% on Terminal Bench 2.1, and 77.8% on Program Bench, demonstrating long-horizon execution endurance across multi-file repositories.
              </p>
            </section>

            {/* SECTION 9 - GENERAL & VISUAL AGENTS (EMBEDDED UPLOADED IMAGE 3) */}
            <section id="autonomous-agents" className="space-y-6 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                9. General & Visual Agent Benchmarks
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Across agent benchmarks evaluating multi-step tool invocation, browser control, spreadsheet parsing, and visual diagram inspection, K3 demonstrates frontier-class performance.
              </p>

              {/* EMBEDDED USER UPLOADED BENCHMARK IMAGE 3 */}
              <div className="my-8 space-y-3">
                <div className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black p-2">
                  <Image
                    src="/images/kimi-k3-agents-bench.png"
                    alt="General Agents and Visual Agents Benchmark Results"
                    width={1200}
                    height={900}
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
                <p className="text-xs font-mono text-center text-muted-foreground">
                  Figure 2: General Agents and Visual Agents benchmark scores (GDPval-AA v2 Elo, JobBench, AA-Briefcase Elo, SpreadsheetBench 2, Automation Bench, BrowseComp, CharXiv, Zerobench).
                </p>
              </div>
            </section>

            {/* SECTION 10 - HARDWARE & ROOFLINE (EMBEDDED UPLOADED IMAGE 2) */}
            <section id="hardware-performance" className="space-y-6 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                10. Roofline & Hardware Efficiency
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                The chart below details MiniTriton CUDA-core roofline performance on NVIDIA hardware, showing achieved compute performance (GFLOP/s) vs. arithmetic intensity (FLOP/byte).
              </p>

              {/* EMBEDDED USER UPLOADED BENCHMARK IMAGE 2 */}
              <div className="my-8 space-y-3">
                <div className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black p-2">
                  <Image
                    src="/images/kimi-k3-roofline.png"
                    alt="MiniTriton CUDA-core roofline performance chart on NVIDIA L20"
                    width={1200}
                    height={750}
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
                <p className="text-xs font-mono text-center text-muted-foreground">
                  Figure 3: MiniTriton CUDA-core roofline analysis on NVIDIA L20 (sm_89), fp32.
                </p>
              </div>
            </section>

            {/* SECTION 11 */}
            <section id="open-weight-strategy" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                11. The Open-Weight Strategy
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                By releasing K3's weights publicly, Moonshot AI enables enterprise data sovereignty, allowing self-hosted deployments without API data privacy concerns.
              </p>
            </section>

            {/* EXPERT ANALYSIS */}
            <section id="expert-analysis" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                Expert Analysis
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Kimi K3 shifts the balance of open AI architecture. By combining fine-grained Top-128 MoE routing with Delta Attention, Moonshot AI proves that open-weight foundation models can match closed proprietary APIs on complex agentic execution.
              </p>
            </section>

            {/* KEY TAKEAWAYS */}
            <section id="key-takeaways" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                Key Takeaways
              </h3>
              <ul className="space-y-2 font-mono text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-primary font-bold">►</span> 2.8T Parameter open-weight MoE with 380B active parameters per forward pass.</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">►</span> Native 1-Million token context window powered by Kimi Delta Attention.</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">►</span> Leading benchmark performance across General Agents, Visual Agents, and Internal Knowledge Benches.</li>
              </ul>
            </section>

            {/* SHARE & ACTION BAR */}
            <BlogShare title="Kimi K3 Technical Analysis: Inside Moonshot AI's Open Frontier Intelligence Model" slug="kimi-k3-open-frontier-intelligence-model" />

            {/* FAQ ACCORDION */}
            <section id="faq" className="space-y-6 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                Frequently Asked Questions (FAQ)
              </h3>
              <div className="space-y-3">
                {faqItems.map((item, idx) => (
                  <details key={idx} className="group border border-border rounded-xl p-4 transition-all [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-foreground">
                      <span>{item.q}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground border-t border-border pt-3">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            {/* RELATED ESSAYS & NEWSLETTER */}
            <RelatedEssaysList essays={relatedEssays} />
            <NewsletterForwardBanner />

          </article>
        </div>
      </main>
    </div>
  );
}
