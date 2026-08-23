import React from "react";
import Script from "next/script";
import Image from "next/image";
import { Link, locales } from "@/navigation";
import { 
  ReadingProgressBar, 
  TableOfContents 
} from "@/components/marketing/BlogInteractive";
import { 
  AuthorProfileSidebar, 
  BlogActionBar, 
  NewsletterForwardBanner,
  RelatedEssaysList
} from "@/components/marketing/BlogEditorial";
import { FlickerText } from "@/components/marketing/FlickerText";
import { Reveal } from "@/components/marketing/Reveal";
import { 
  Calendar, 
  Clock, 
  GitBranch, 
  ArrowRight,
  HelpCircle
} from "lucide-react";
import { BlogShare, NewsletterCTA, AgentCTA } from "./InteractiveComponents";

// ═══════════════════════════════════════════════════
// METADATA GENERATOR (SEO, AEO & Social Previews)
// ═══════════════════════════════════════════════════
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const path = "blog/cursor-origin-github-ai-code-hosting";

  const languages: Record<string, string> = {
    'x-default': `https://growxlabs.tech/en-IN/${path}`,
  };
  locales.forEach((l) => {
    languages[l] = `https://growxlabs.tech/${l}/${path}`;
  });

  const title = "Cursor Launches Origin: Why Cursor Is Moving Into GitHub’s Territory";
  const description = "Cursor launched Origin on August 17, 2026, bringing repository hosting, pull requests, GitHub sync and AI agents closer together. Here’s why the move matters for the future of software development.";

  return {
    title: `${title} | GrowXLabsTech`,
    description,
    alternates: {
      canonical: `https://growxlabs.tech/${locale}/${path}`,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `https://growxlabs.tech/${locale}/${path}`,
      siteName: "GrowXLabsTech",
      type: "article",
      publishedTime: "2026-08-17T08:00:00.000Z",
      modifiedTime: "2026-08-21T08:00:00.000Z",
      authors: ["GrowXLabs Tech Editorial"],
      images: [
        {
          url: "https://growxlabs.tech/images/blog-cursor-origin.png",
          width: 1200,
          height: 630,
          alt: "Cursor Origin: AI Editor and Native Git Forge for Agent-Scale Software Development",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://growxlabs.tech/images/blog-cursor-origin.png"],
    },
    keywords: [
      "Cursor",
      "Cursor Origin",
      "Origin Code Hosting",
      "GitHub",
      "Git Hosting",
      "AI Coding",
      "AI Coding Agents",
      "Cloud Agents",
      "AI Software Development",
      "Developer Infrastructure",
      "Developer Tools",
      "Code Hosting",
      "Pull Requests",
      "Agentic Coding",
      "Software Engineering",
      "AI Agents",
      "Anysphere",
      "GrowxLabs",
      "growxlabs.tech",
    ],
  };
}

export default async function CursorOriginBlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const titleName = "DEVELOPER INFRA";

  // Streamlined Table of Contents Headings
  const headings = [
    { id: "introduction", text: "1. Cursor Moves Into GitHub's Territory" },
    { id: "traditional-boundary", text: "2. The Traditional Workflow Boundary" },
    { id: "repository-next-to-agent", text: "3. Bringing the Repository Next to the Agent" },
    { id: "github-sync-strategy", text: "4. Bidirectional GitHub Synchronization" },
    { id: "human-agent-boundary", text: "5. Pull Requests as the Human–Agent Boundary" },
    { id: "the-bigger-picture", text: "6. The Strategic Shift in Developer Tooling" },
    { id: "faq", text: "7. Frequently Asked Questions" },
  ];

  const faqData = [
    {
      question: "What is Cursor Origin and when was it launched?",
      answer: "Cursor Origin was launched on August 17, 2026 as a native Git-based code-hosting platform built directly inside Cursor. It provides repository hosting, code browsing, pull requests, external CI integrations, and bidirectional GitHub synchronization.",
    },
    {
      question: "Is Cursor Origin trying to replace GitHub immediately?",
      answer: "No. Cursor Origin supports bidirectional GitHub synchronization, allowing developers to import existing GitHub repositories into Cursor while keeping GitHub as the upstream source of truth. Pushes, commits, and pull-request comments synchronize between both platforms without requiring a forced migration.",
    },
    {
      question: "Why did Cursor build its own code hosting platform instead of relying on GitHub?",
      answer: "As AI tools evolve from line-by-line autocomplete into autonomous coding agents that clone repositories, modify dozens of files, run local checks, and create branches, colocating the repository directly next to the agent execution runtime dramatically reduces latency, simplifies cloud agents, and makes pull requests the natural human review boundary.",
    },
    {
      question: "How do pull requests work between humans and AI agents in Origin?",
      answer: "In Cursor Origin, agents perform multi-step task implementation and open structured pull requests with automated test runs and preview links. The human developer transitions from manual code author to strategic reviewer and decision-maker at the pull-request approval boundary.",
    },
  ];

  const relatedEssays = [
    {
      title: "Chatbots Are Dying. Agents Are Taking Over.",
      accentWord: "Agents",
      excerpt: "AI is moving from conversational chat interfaces to autonomous agents that execute multi-step workflows across systems.",
      href: "/blog/chatbots-are-dying-agents-are-taking-over",
      date: "June 1, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/chatbots-are-dying-agents-are-taking-over.png",
    },
    {
      title: "Claude Opus 4.8: Anthropic's Most Advanced AI Model",
      accentWord: "Anthropic",
      excerpt: "Deep dive into Claude 4.8 benchmarks, including SWE-Bench Pro, Terminal-Bench 2.1, and dynamic agentic execution.",
      href: "/blog/claude-opus-4-8-anthropic-ai-model",
      date: "May 29, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/claude_blog_woodcut_1780853620986.png",
    },
    {
      title: "Why Anthropic Is Becoming a Serious Threat to OpenAI",
      accentWord: "Threat",
      excerpt: "Analyzing Anthropic's developer mindshare, Claude Code CLI, and the race to capture the agentic engineering ecosystem.",
      href: "/blog/why-anthropic-is-becoming-a-serious-threat-to-openai",
      date: "May 24, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/claude-models-overview-banner.png",
    },
  ];

  // Comprehensive AEO / GEO / Search Generative Experience JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://growxlabs.tech/${locale}/blog/cursor-origin-github-ai-code-hosting/#article`,
        "headline": "Cursor Launches Origin: Why Cursor Is Moving Into GitHub’s Territory",
        "description": "Cursor launched Origin on August 17, 2026, bringing repository hosting, pull requests, GitHub sync and AI agents closer together. Here’s why the move matters for the future of software development.",
        "datePublished": "2026-08-17T08:00:00.000Z",
        "dateModified": "2026-08-21T08:00:00.000Z",
        "inLanguage": locale,
        "image": {
          "@type": "ImageObject",
          "url": "https://growxlabs.tech/images/blog-cursor-origin.png",
          "width": 1200,
          "height": 630,
        },
        "author": {
          "@type": "Organization",
          "name": "GrowXLabs Tech Editorial",
          "url": "https://growxlabs.tech",
        },
        "publisher": {
          "@type": "Organization",
          "name": "GrowXLabsTech",
          "url": "https://growxlabs.tech",
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://growxlabs.tech/${locale}/blog/cursor-origin-github-ai-code-hosting`,
        },
      },
    ],
  };

  return (
    <div className="w-full bg-background min-h-screen text-foreground selection:bg-primary/20 selection:text-primary pt-32 pb-24">
      {/* Dynamic Reading Progress Bar */}
      <ReadingProgressBar />

      {/* JSON-LD Schema Injection */}
      <Script
        id="cursor-origin-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 md:px-10 xl:px-16 2xl:px-24">
        {/* Top Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-foreground transition-colors">Insights</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-xs md:max-w-md">Cursor Launches Origin</span>
        </nav>

        {/* Header Block */}
        <header className="pb-10 border-b border-border/60">
          <Reveal y={15}>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <GitBranch className="w-3.5 h-3.5" /> Developer Infrastructure
              </span>
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> News: August 17, 2026 • Updated: August 21, 2026
              </span>
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> 8 min read
              </span>
            </div>

            <div className="w-full overflow-hidden flex justify-start items-end select-none pointer-events-none mb-6">
              <h1 className="font-black select-none tracking-[-0.05em] text-foreground leading-[0.9] text-[clamp(2.2rem,6.8vw,96px)] uppercase max-w-5xl">
                <FlickerText text={titleName} />
              </h1>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground/95 max-w-4xl leading-snug font-serif">
              Cursor Launches Origin: Why Cursor Is Moving Into GitHub’s Territory
            </h2>

            <p id="article-lead" className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl font-normal">
              Cursor has spent the last few years revolutionizing how developers write code with AI. Now it wants to change where that software lives. On August 17, 2026, Cursor launched <strong>Origin</strong>, bringing code hosting, pull requests, GitHub synchronization, and autonomous agents under one unified surface.
            </p>

            <div className="mt-8 flex items-center gap-4 pt-6 border-t border-border/40">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-sm text-primary font-mono">
                GX
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">GrowXLabs Tech Editorial Staff</p>
                <p className="text-[11px] font-mono text-muted-foreground">Developer Tooling &amp; AI Systems Research</p>
              </div>
            </div>
          </Reveal>
        </header>

        {/* Hero Editorial Illustration */}
        <figure className="my-10 overflow-hidden rounded-md border border-border/80 bg-neutral-950">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
            <Image
              src="/images/blog-cursor-origin.png"
              alt="Cursor Origin: AI Editor and Native Git Forge for Agent-Scale Software Development"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1200px) 100vw, 1400px"
            />
          </div>
          <figcaption className="p-3 bg-[#111111] border-t border-border/60 text-xs font-mono text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>FIGURE 1.0: Cursor Origin connecting AI editor, native Git forge, cloud agents, and deployment rails.</span>
            <span className="text-foreground font-semibold shrink-0">GrowXLabs Technical Blueprint</span>
          </figcaption>
        </figure>

        {/* Main Content Layout with Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
          {/* Left Column: Sticky Table of Contents & Editorial Badges */}
          <aside className="hidden lg:block lg:col-span-4 space-y-8">
            <div className="sticky top-28 space-y-6">
              <TableOfContents headings={headings} />
              <AuthorProfileSidebar 
                authorName="GrowXLabs Tech Editorial"
                authorRole="Developer Tooling &amp; Systems Architecture"
                category="Developer Infrastructure"
                bio="Analyzing the evolution of AI coding environments, Git hosting platforms, autonomous software agents, and developer workflow acceleration."
              />
              <NewsletterForwardBanner />
            </div>
          </aside>

          {/* Right Column: Main Body Article */}
          <article className="lg:col-span-8 max-w-[72ch] text-foreground/90 leading-relaxed font-sans space-y-12">
            
            {/* Action Bar (Listen + Read with AI + Share) */}
            <BlogActionBar 
              title="Cursor Launches Origin: Why Cursor Is Moving Into GitHub’s Territory" 
              slug="cursor-origin-github-ai-code-hosting" 
            />

            {/* Section 1 */}
            <section id="introduction" className="scroll-mt-32 space-y-5">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase block">
                01 // Product Launch
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                Cursor Moves Into GitHub&apos;s Territory
              </h2>

              <p className="text-base text-muted-foreground leading-relaxed">
                Cursor has spent the last few years fundamentally changing how developers write software with AI. Now it wants to change where that software lives. On August 17, 2026, Cursor officially launched <strong>Origin</strong>, a new Git-based code-hosting platform built directly into Cursor.
              </p>

              <p className="text-base text-muted-foreground leading-relaxed">
                Origin is entering early beta across Cursor&apos;s paid tiers, offering native repository hosting, code browsing, code search, pull requests, automated checks, and bidirectional GitHub synchronization.
              </p>

              <blockquote className="border-l-2 border-primary pl-4 py-1 my-6 text-foreground/90 font-serif italic text-lg">
                &ldquo;Origin is not just another Git forge. It is the first code-hosting platform engineered around a world where repositories are continuously modified by both humans and autonomous AI agents.&rdquo;
              </blockquote>
            </section>

            {/* Section 2 */}
            <section id="traditional-boundary" className="scroll-mt-32 space-y-5 border-t border-neutral-800/80 pt-10">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase block">
                02 // Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                The Traditional Workflow Boundary
              </h2>

              <p className="text-base text-muted-foreground leading-relaxed">
                For nearly two decades, software development has followed a strict division of labor across two environments:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-base text-muted-foreground">
                <li><strong className="text-foreground">The Local Editor (IDE):</strong> Where code is drafted, typed, edited, and debugged on a developer&apos;s machine.</li>
                <li><strong className="text-foreground">The Remote Git Forge (GitHub / GitLab):</strong> Where code is pushed, reviewed through pull requests, tested via CI/CD, and merged into production branches.</li>
              </ul>

              <p className="text-base text-muted-foreground leading-relaxed">
                This separation worked when human engineers were the sole authors of every line of code. But as AI moved from inline autocomplete to autonomous agents running multi-file edits and terminal executions, this boundary became an artificial bottleneck.
              </p>
            </section>

            {/* Section 3 */}
            <section id="repository-next-to-agent" className="scroll-mt-32 space-y-5 border-t border-neutral-800/80 pt-10">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase block">
                03 // Compute Colocation
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                Bringing the Repository Next to the Agent
              </h2>

              <p className="text-base text-muted-foreground leading-relaxed">
                When an AI agent executes a non-trivial engineering task—such as refactoring an authentication service or migrating a database schema—it needs to read large swaths of the codebase, build syntax trees, execute tests, and create feature branches.
              </p>

              <p className="text-base text-muted-foreground leading-relaxed">
                If the repository lives in a separate remote third-party system, the agent spends seconds negotiating SSH keys, cloning repositories over network boundaries, and polling webhooks. By colocating the Git forge directly inside Cursor&apos;s cloud infrastructure, agents have zero-latency access to the repository filesystem and branch state.
              </p>

              <div className="bg-[#141414] rounded-md p-5 border border-neutral-800 font-mono text-xs text-neutral-300 space-y-2">
                <div className="text-neutral-500">// Native Agent Execution Flow in Cursor Origin</div>
                <div className="text-[#bdefff]">$ cursor agent --task &quot;Add OAuth2 token rotation&quot;</div>
                <div className="text-neutral-400">→ Branch created: origin/feat-oauth-rotation (local forge instant branch)</div>
                <div className="text-neutral-400">→ 14 files modified · 6 unit tests generated · Build status: OK</div>
                <div className="text-neutral-400">→ Pull Request #42 opened with preview environment deployed</div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="github-sync-strategy" className="scroll-mt-32 space-y-5 border-t border-neutral-800/80 pt-10">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase block">
                04 // Adoption Strategy
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                Bidirectional GitHub Synchronization
              </h2>

              <p className="text-base text-muted-foreground leading-relaxed">
                Rather than forcing developers and enterprises into a risky, all-or-nothing migration, Cursor introduced <strong>bidirectional GitHub synchronization</strong>.
              </p>

              <p className="text-base text-muted-foreground leading-relaxed">
                Engineering organizations can connect their GitHub accounts, choose specific repositories, and create synchronized mirrors in Origin. GitHub remains the authoritative source of truth, while Cursor Origin keeps the local and cloud workspaces updated in real time. Commits, branch pushes, and pull request reviews sync automatically between both platforms.
              </p>

              <p className="text-base text-muted-foreground leading-relaxed">
                This eliminates migration friction entirely: developers can experience the speed of agent-native code hosting without asking their corporate security teams to abandon GitHub overnight.
              </p>
            </section>

            {/* Section 5 */}
            <section id="human-agent-boundary" className="scroll-mt-32 space-y-5 border-t border-neutral-800/80 pt-10">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase block">
                05 // Developer Experience
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                Pull Requests as the Human–Agent Boundary
              </h2>

              <p className="text-base text-muted-foreground leading-relaxed">
                As AI coding capabilities expand, the primary role of the human engineer is shifting from typing boilerplate code to setting requirements, architectural review, and safety validation.
              </p>

              <p className="text-base text-muted-foreground leading-relaxed">
                In Cursor Origin, the pull request becomes the formal contract between human intent and machine execution. An agent drafts the code, attaches automated test runs and deployment preview URLs (via partners like Vercel and Depot), and submits the PR. The human developer reviews the diff, leaves inline commentary, and approves the merge.
              </p>
            </section>

            {/* Section 6 */}
            <section id="the-bigger-picture" className="scroll-mt-32 space-y-5 border-t border-neutral-800/80 pt-10">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase block">
                06 // The Strategic Shift
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                The Strategic Shift in Developer Tooling
              </h2>

              <p className="text-base text-muted-foreground leading-relaxed">
                Cursor&apos;s expansion into code hosting represents a broader industry pattern: the convergence of the IDE, the repository, the runtime environment, and autonomous agents into a single integrated platform.
              </p>

              <p className="text-base text-muted-foreground leading-relaxed">
                While GitHub continues to roll out Copilot Workspace and Microsoft&apos;s AI capabilities, Cursor is attacking the problem from the developer&apos;s daily working canvas outward. Whoever builds the fastest, most reliable loop between human intent, code generation, and deployment verification will define the next generation of software engineering.
              </p>
            </section>

            {/* Section 7: FAQ */}
            <section id="faq" className="scroll-mt-32 space-y-6 border-t border-neutral-800/80 pt-10">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                  07 // Frequently Asked Questions
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                Understanding Cursor Origin
              </h2>

              <div className="divide-y divide-neutral-800/80 pt-2">
                {faqData.map((item, idx) => (
                  <div key={idx} className="py-6 first:pt-2 last:pb-0 space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-foreground font-serif">
                      {item.question}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Commercial & Newsletter Footers */}
            <div className="border-t border-neutral-800/80 pt-10 space-y-12">
              <AgentCTA />
              <BlogShare 
                title="Cursor Launches Origin: Why Cursor Is Moving Into GitHub’s Territory" 
                url={`https://growxlabs.tech/${locale}/blog/cursor-origin-github-ai-code-hosting`} 
              />
              <RelatedEssaysList essays={relatedEssays} />
              <NewsletterCTA />
            </div>

          </article>
        </div>
      </div>
    </div>
  );
}
