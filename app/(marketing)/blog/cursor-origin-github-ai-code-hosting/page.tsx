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
  NewsletterForwardBanner,
  InsightCallout,
  WhyThisMatters,
  EditorialDivider,
  RelatedEssaysList
} from "@/components/marketing/BlogEditorial";
import { FlickerText } from "@/components/marketing/FlickerText";
import { Reveal } from "@/components/marketing/Reveal";
import { 
  Calendar, 
  Clock, 
  GitBranch, 
  GitPullRequest, 
  Cpu, 
  Layers, 
  ExternalLink,
  CheckCircle2,
  Terminal,
  Zap,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { 
  BlogShare, 
  NewsletterCTA, 
  AgentCTA, 
  OriginMetricsGrid, 
  AgentWorkflowSimulator, 
  GitForgeEvolutionComparison 
} from "./InteractiveComponents";

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

  // Table of Contents Headings
  const headings = [
    { id: "introduction", text: "1. Cursor Moves Into GitHub's Territory" },
    { id: "what-is-origin", text: "2. What Is Cursor Origin?" },
    { id: "traditional-boundary", text: "3. The Traditional Workflow Had a Boundary" },
    { id: "repository-next-to-agent", text: "4. Bringing the Repository Next to the Agent" },
    { id: "workflow-simulator", text: "5. Interactive Agent Execution Simulator" },
    { id: "github-sync-strategy", text: "6. Cursor Is Not Asking Developers to Leave GitHub Yet" },
    { id: "pull-request-sync", text: "7. Pull Requests Can Also Stay Connected to GitHub" },
    { id: "why-code-hosting", text: "8. Why Is Cursor Moving Into Code Hosting?" },
    { id: "human-agent-boundary", text: "9. PRs as the Boundary Between Humans & Agents" },
    { id: "ci-deployment-mesh", text: "10. Origin Is Also Connecting CI and Deployment" },
    { id: "bigger-than-github", text: "11. This Is Bigger Than Building Another GitHub" },
    { id: "human-dev-assumptions", text: "12. GitHub Was Built Around Human Development" },
    { id: "stack-expansion", text: "13. Cursor Is Expanding Across the Developer Stack" },
    { id: "forge-comparison-matrix", text: "14. Traditional Git vs. Agent-Scale Forge" },
    { id: "sync-killer-feature", text: "15. Why GitHub Sync Is Origin's Most Important Feature" },
    { id: "github-countermove", text: "16. GitHub Is Not Standing Still" },
    { id: "shared-workspace", text: "17. The Repository as a Shared Workspace" },
    { id: "what-origin-doesnt-prove", text: "18. What Origin Does Not Prove Yet" },
    { id: "the-bigger-picture", text: "19. The Bigger Picture: The Agentic Era" },
    { id: "sources", text: "20. Primary Sources & Citations" },
    { id: "faq", text: "21. Frequently Asked Questions (AEO/GEO)" },
  ];

  const faqData = [
    {
      question: "What is Cursor Origin and when was it launched?",
      answer: "Cursor Origin was launched on August 17, 2026 as a Git-based code-hosting platform built directly inside Cursor. It provides native repository hosting, code browsing, pull requests, external CI integrations (Vercel, Depot, Buildkite), and two-way GitHub synchronization designed specifically for agentic software engineering.",
    },
    {
      question: "Is Cursor Origin trying to replace GitHub immediately?",
      answer: "No. Cursor Origin supports bidirectional GitHub synchronization, allowing developers to import existing GitHub repositories into Cursor while keeping GitHub as the upstream source of truth. Pushes, commits, and pull-request comments synchronize between both platforms without requiring full migration.",
    },
    {
      question: "Why did Cursor build its own code hosting platform instead of relying on GitHub?",
      answer: "As AI tools evolve from line-by-line autocomplete into autonomous coding agents that clone repositories, modify dozens of files, run local checks, and create branches, having the code repository live directly inside the agent execution loop dramatically reduces latency, simplifies cloud agent remotes, and turns pull requests into formal safety boundaries.",
    },
    {
      question: "How do pull requests work between humans and AI agents in Origin?",
      answer: "In Cursor Origin, agents perform end-to-end task implementation and open structured pull requests with automated test runs and Vercel preview links. The human developer transitions from manual code author to strategic reviewer and decision-maker at the pull-request approval boundary.",
    },
    {
      question: "Which CI/CD and deployment platforms integrate with Cursor Origin at launch?",
      answer: "At launch, Cursor Origin supports direct integrations with Vercel (for automatic preview deployments attached to pull requests), Depot (for accelerated remote Docker container builds), and Buildkite (for continuous integration test pipelines).",
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
        "alternativeHeadline": "Cursor Origin: Building the Code-Hosting Infrastructure for Agent-Scale Software Engineering",
        "description": "Cursor launched Origin on August 17, 2026, bringing repository hosting, pull requests, GitHub sync and AI agents closer together. Here’s why the move matters for the future of software development.",
        "datePublished": "2026-08-17T08:00:00.000Z",
        "dateModified": "2026-08-21T08:00:00.000Z",
        "inLanguage": locale,
        "image": {
          "@type": "ImageObject",
          "url": "https://growxlabs.tech/images/blog-cursor-origin.png",
          "width": 1200,
          "height": 630,
          "caption": "Cursor Origin - AI Editor and Native Git Forge for Agent-Scale Software Development",
        },
        "author": {
          "@type": "Organization",
          "name": "GrowXLabs Tech Editorial",
          "url": "https://growxlabs.tech",
          "logo": {
            "@type": "ImageObject",
            "url": "https://growxlabs.tech/logo.png",
          },
        },
        "publisher": {
          "@type": "Organization",
          "name": "GrowXLabsTech",
          "url": "https://growxlabs.tech",
          "logo": {
            "@type": "ImageObject",
            "url": "https://growxlabs.tech/logo.png",
          },
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://growxlabs.tech/${locale}/blog/cursor-origin-github-ai-code-hosting`,
        },
        "keywords": [
          "Cursor",
          "Cursor Origin",
          "GitHub",
          "Git Hosting",
          "AI Coding",
          "AI Coding Agents",
          "Cloud Agents",
          "Anysphere",
          "Developer Infrastructure",
          "Pull Requests",
          "Vercel",
        ],
        "about": [
          {
            "@type": "Organization",
            "name": "Cursor (Anysphere)",
            "sameAs": "https://cursor.com",
          },
          {
            "@type": "Organization",
            "name": "GitHub",
            "sameAs": "https://www.wikidata.org/wiki/Q364",
          },
          {
            "@type": "SoftwareApplication",
            "name": "Git",
            "sameAs": "https://www.wikidata.org/wiki/Q186055",
          },
          {
            "@type": "Thing",
            "name": "Software development",
            "sameAs": "https://www.wikidata.org/wiki/Q638608",
          },
        ],
        "citation": [
          "https://cursor.com/changelog/origin-code-hosting",
          "https://cursor.com/origin",
          "https://forum.cursor.com/t/origin-code-hosting/168670",
          "https://www.itpro.com/software/development/vibe-coding-startup-cursor-just-launched-a-github-alternative-heres-what-users-can-expect",
        ],
      },
      {
        "@type": "SpeakableSpecification",
        "cssSelector": [
          "#article-lead",
          "#what-is-origin",
          "#human-agent-boundary",
          "#faq",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `https://growxlabs.tech/${locale}/blog/cursor-origin-github-ai-code-hosting/#faq`,
        "mainEntity": faqData.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `https://growxlabs.tech/${locale}`,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Editorial Insights",
            "item": `https://growxlabs.tech/${locale}/blog`,
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Cursor Origin Launch",
            "item": `https://growxlabs.tech/${locale}/blog/cursor-origin-github-ai-code-hosting`,
          },
        ],
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
                <Clock className="w-3.5 h-3.5" /> 11 min read
              </span>
            </div>

            <div className="w-full overflow-hidden flex justify-start items-end select-none pointer-events-none mb-6">
              <h1 className="font-black select-none tracking-[-0.05em] text-foreground leading-[0.9] text-[clamp(2.2rem,6.8vw,96px)] uppercase max-w-5xl">
                <FlickerText text={titleName} />
              </h1>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground/95 max-w-4xl leading-snug">
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
        <figure className="my-10 rounded-2xl overflow-hidden border border-border/80 bg-card shadow-2xl">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-neutral-950">
            <Image
              src="/images/blog-cursor-origin.png"
              alt="Cursor Origin: AI Editor and Native Git Forge for Agent-Scale Software Development"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1200px) 100vw, 1400px"
            />
          </div>
          <figcaption className="p-4 bg-muted/20 border-t border-border/60 text-xs font-mono text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>FIGURE 1.0: Architectural synthesis of Cursor Origin connecting AI editor, native Git forge, cloud agents, and deployment rails.</span>
            <span className="text-foreground font-semibold shrink-0">GrowXLabs Technical Blueprint Series</span>
          </figcaption>
        </figure>

        {/* Launch Metrics Overview */}
        <OriginMetricsGrid />

        {/* Main Content Layout with Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
          {/* Left Column: Sticky Table of Contents & Editorial Badges */}
          <aside className="hidden lg:block lg:col-span-4 space-y-8">
            <div className="sticky top-28 space-y-6">
              <TableOfContents headings={headings} />
              <AuthorProfileSidebar 
                authorName="GrowXLabs Tech Editorial"
                authorRole="Developer Tooling &amp; Systems Architecture"
                category="Developer Infrastructure &amp; AI Agents"
                bio="Analyzing the evolution of AI coding environments, Git hosting platforms, autonomous software agents, and developer workflow acceleration."
              />
              <NewsletterForwardBanner />
            </div>
          </aside>

          {/* Right Column: Main Body Article */}
          <article className="lg:col-span-8 prose prose-slate dark:prose-invert max-w-none text-foreground/90 leading-relaxed font-sans">
            
            {/* Section 1 */}
            <section id="introduction" className="scroll-mt-32 space-y-6">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                Section 01 // Product Launch
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground not-prose">
                Cursor Moves Into GitHub&apos;s Territory
              </h2>

              <p className="text-base text-foreground/80 leading-relaxed">
                Cursor has spent the last few years fundamentally changing how developers write software with AI. Now it wants to change where that software lives.
              </p>

              <p className="text-base text-foreground/80 leading-relaxed">
                On August 17, 2026, Cursor officially launched <strong>Origin</strong>, a new Git-based code-hosting platform built directly into Cursor.
              </p>

              <p className="text-base text-foreground/80 leading-relaxed">
                Origin is entering early beta across Cursor&apos;s paid tiers, offering native repository hosting, code browsing, code search, pull requests, automated checks, and bidirectional GitHub synchronization.
              </p>

              <InsightCallout variant="insight" label="The Paradigm Shift">
                <p>
                  Calling Origin simply a &ldquo;GitHub competitor&rdquo; misses the more important shift. Cursor is building code hosting around a future where repositories are no longer operated only by human developers.
                </p>
                <p>
                  They are increasingly being worked on by <strong>developers and autonomous AI coding agents together</strong>. Origin is Cursor&apos;s attempt to build the foundational infrastructure for that future.
                </p>
              </InsightCallout>
            </section>

            <EditorialDivider />

            {/* Section 2 */}
            <section id="what-is-origin" className="scroll-mt-32 space-y-6">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                Section 02 // Core Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground not-prose">
                What Is Cursor Origin?
              </h2>

              <p className="text-base text-foreground/80 leading-relaxed">
                Origin is Cursor&apos;s native Git hosting platform. Cursor describes it as a <strong>Git forge designed for agent scale</strong>.
              </p>

              <p className="text-base text-foreground/80 leading-relaxed">
                Developers can create a repository inside Cursor, push an existing codebase using standard Git CLI commands, browse syntax-highlighted files, execute semantic code search, review diffs, open pull requests, and manage access permissions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6 not-prose text-xs font-mono">
                <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Native Git repositories &amp; remote endpoints</span>
                </div>
                <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Deep semantic codebase search</span>
                </div>
                <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Pull requests, diffs &amp; line commenting</span>
                </div>
                <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Automated CI checks &amp; Vercel preview links</span>
                </div>
                <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Zero-friction two-way GitHub sync</span>
                </div>
                <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Cloud agents clone, branch &amp; push directly</span>
                </div>
              </div>

              <p className="text-base text-foreground/80 leading-relaxed">
                Origin repositories live directly inside Cursor&apos;s Codebase environment. Instead of Cursor being solely the text editor while GitHub hosts the source code across the internet, Cursor now hosts the repository itself—bringing code millimeters away from the agents executing changes.
              </p>
            </section>

            <EditorialDivider />

            {/* Section 3 */}
            <section id="traditional-boundary" className="scroll-mt-32 space-y-6">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                Section 03 // Workflow Limits
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground not-prose">
                The Traditional Cursor Workflow Had a Boundary
              </h2>

              <p className="text-base text-foreground/80 leading-relaxed">
                Until Origin, a standard modern development loop involved a strict separation of concerns across multiple platforms:
              </p>

              <div className="p-5 rounded-xl border border-border/70 bg-card font-mono text-xs space-y-1.5 not-prose">
                <div className="text-muted-foreground">Developer (Defines Prompt)</div>
                <div className="text-muted-foreground pl-4">↓</div>
                <div className="text-foreground font-semibold">Cursor IDE (Edits Local Files)</div>
                <div className="text-muted-foreground pl-4">↓</div>
                <div className="text-muted-foreground">Local Git (Git Commit &amp; Push)</div>
                <div className="text-muted-foreground pl-4">↓</div>
                <div className="text-foreground font-semibold">GitHub Remote (Hosts Repository &amp; Pull Request)</div>
                <div className="text-muted-foreground pl-4">↓</div>
                <div className="text-muted-foreground">CI Pipeline (Runs Tests) → Deployment (Production)</div>
              </div>

              <p className="text-base text-foreground/80 leading-relaxed">
                Cursor could understand and modify local code, but another third-party platform remained authoritative for hosting, access control, and review coordination.
              </p>

              <p className="text-base text-foreground/80 leading-relaxed">
                That separation was rational when AI acted merely as an in-line autocomplete assistant. But once autonomous coding agents can inspect full tasks, create isolated branches, edit multiple packages, run diagnostics, and draft pull requests, the repository itself becomes an active execution runtime.
              </p>
            </section>

            <EditorialDivider />

            {/* Section 4 */}
            <section id="repository-next-to-agent" className="scroll-mt-32 space-y-6">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                Section 04 // Architecture Shift
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground not-prose">
                Bringing the Repository Next to the Agent
              </h2>

              <p className="text-base text-foreground/80 leading-relaxed">
                Cursor&apos;s product philosophy centers around a clean thesis: <strong>your code should live directly beside the agents and pull requests working on it.</strong>
              </p>

              {/* Second Editorial Infographic */}
              <figure className="my-8 rounded-xl overflow-hidden border border-border/70 bg-card not-prose">
                <div className="relative w-full aspect-[16/9] bg-neutral-950">
                  <Image
                    src="/images/blog-cursor-origin-architecture.png"
                    alt="Traditional Git Hosting vs Agent-Scale Git Hosting in Cursor Origin"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1200px) 100vw, 1000px"
                  />
                </div>
                <figcaption className="p-3 bg-muted/20 border-t border-border/50 text-[11px] font-mono text-muted-foreground">
                  FIGURE 2.0: Structural comparison between human-centric Git workflows and autonomous agent loops in Cursor Origin.
                </figcaption>
              </figure>

              <p className="text-base text-foreground/80 leading-relaxed">
                Origin allows Cursor Cloud Agents to interact directly with Origin remotes without relying on developer machine synchronization. Cloud agents can perform the full developer lifecycle:
              </p>

              <div className="p-4 rounded-xl border border-primary/30 bg-primary/[0.04] font-mono text-sm font-bold text-primary text-center">
                CLONE → BRANCH → MULTI-FILE EDIT → TEST → COMMIT → PUSH → DRAFT PR
              </div>

              <p className="text-base text-foreground/80 leading-relaxed">
                The repository is no longer a passive file archive. It is an active execution substrate for autonomous software engineering.
              </p>
            </section>

            <EditorialDivider />

            {/* Section 5: Interactive Simulator */}
            <section id="workflow-simulator" className="scroll-mt-32 not-prose">
              <AgentWorkflowSimulator />
            </section>

            <EditorialDivider />

            {/* Section 6 */}
            <section id="github-sync-strategy" className="scroll-mt-32 space-y-6">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                Section 05 // Ecosystem Strategy
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground not-prose">
                Cursor Is Not Asking Developers to Leave GitHub Yet
              </h2>

              <p className="text-base text-foreground/80 leading-relaxed">
                Rather than forcing developers into an all-or-nothing migration, Cursor introduced <strong>bidirectional GitHub synchronization</strong>.
              </p>

              <p className="text-base text-foreground/80 leading-relaxed">
                Engineering teams can link their GitHub organizations, select specific repositories, and import synchronized mirrors into Origin. GitHub remains the authoritative source of truth, while Origin keeps the live copy updated in real time.
              </p>

              <WhyThisMatters>
                <p className="font-semibold text-white">Why GitHub Sync Is Origin&apos;s Smartest Adoption Vector:</p>
                <ul className="space-y-2 list-disc list-inside text-sm text-white/80">
                  <li>Enterprises with thousands of existing GitHub repositories can adopt Cursor Origin with zero migration friction.</li>
                  <li>Developers do not have to choose between GitHub OR Cursor; they get GitHub + Cursor Origin simultaneously.</li>
                  <li>As developers spend 90%+ of their working day inside Cursor, the external GitHub web interface gradually recedes into the background.</li>
                </ul>
              </WhyThisMatters>
            </section>

            <EditorialDivider />

            {/* Section 7 */}
            <section id="pull-request-sync" className="scroll-mt-32 space-y-6">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                Section 06 // Pull Request Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground not-prose">
                Pull Requests Can Also Stay Connected to GitHub
              </h2>

              <p className="text-base text-foreground/80 leading-relaxed">
                The synchronization layer encompasses the entire review lifecycle: commits, checks, changed files, line comments, and merge controls.
              </p>

              <p className="text-base text-foreground/80 leading-relaxed">
                A software engineer can draft or review a pull request entirely within Cursor, while teammates working in GitHub see the comments, status checks, and approvals synchronized seamlessly.
              </p>
            </section>

            <EditorialDivider />

            {/* Section 8 */}
            <section id="why-code-hosting" className="scroll-mt-32 space-y-6">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                Section 07 // The Macro Thesis
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground not-prose">
                Why Is Cursor Moving Into Code Hosting?
              </h2>

              <p className="text-base text-foreground/80 leading-relaxed">
                Because AI coding is rapidly graduating beyond syntax autocomplete.
              </p>

              <p className="text-base text-foreground/80 leading-relaxed">
                The first generation of AI developer tooling (GitHub Copilot v1) focused on completing the current line of code. The current generation of agentic systems takes high-level user stories, plans multi-file refactors, diagnoses failing unit tests, and packages deployable artifacts autonomously.
              </p>

              <p className="text-base text-foreground/80 leading-relaxed">
                Once software agents participate in the end-to-end engineering lifecycle, the traditional boundaries between <em>editor</em>, <em>agent</em>, <em>repository</em>, <em>code review</em>, and <em>deployment</em> collapse. Cursor Origin is built to unite these layers under one unified control surface.
              </p>
            </section>

            <EditorialDivider />

            {/* Section 9 */}
            <section id="human-agent-boundary" className="scroll-mt-32 space-y-6">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                Section 08 // Safety & Review
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground not-prose">
                PRs as the Boundary Between Humans &amp; Agents
              </h2>

              <p className="text-base text-foreground/80 leading-relaxed">
                Historically, pull requests served as a peer review mechanism between two human engineers. In an agent-native software paradigm, the pull request transforms into a <strong>critical verification and governance gate</strong> between autonomous generation and production environments.
              </p>

              <div className="p-5 rounded-xl border border-border/70 bg-card font-mono text-xs space-y-1.5 not-prose">
                <div className="text-foreground font-semibold">1. Human defines architecture &amp; requirements</div>
                <div className="text-muted-foreground pl-4">↓</div>
                <div className="text-primary font-semibold">2. Autonomous Agent executes implementation across codebase</div>
                <div className="text-muted-foreground pl-4">↓</div>
                <div className="text-foreground font-semibold">3. Agent opens structured Pull Request with diffs &amp; changelog</div>
                <div className="text-muted-foreground pl-4">↓</div>
                <div className="text-primary font-semibold">4. Automated CI, typecheck &amp; Vercel preview environments validate change</div>
                <div className="text-muted-foreground pl-4">↓</div>
                <div className="text-foreground font-semibold">5. Human engineer reviews preview, approves &amp; merges</div>
              </div>

              <p className="text-base text-foreground/80 leading-relaxed">
                Developers do not need to monitor every token an agent outputs in real time; they need robust, high-fidelity tooling to inspect, test, and approve the final pull request.
              </p>
            </section>

            <EditorialDivider />

            {/* Section 10 */}
            <section id="ci-deployment-mesh" className="scroll-mt-32 space-y-6">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                Section 09 // Ecosystem Integrations
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground not-prose">
                Origin Is Also Connecting CI and Deployment
              </h2>

              <p className="text-base text-foreground/80 leading-relaxed">
                Code hosting alone is insufficient without testing and deployment rails. At launch, Cursor highlighted first-class partner integrations:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 not-prose">
                <div className="p-4 rounded-xl border border-border/70 bg-card/60">
                  <p className="text-xs font-mono font-bold text-foreground">Vercel</p>
                  <p className="text-xs text-muted-foreground mt-1">Automatic preview URLs attached directly to Origin pull requests.</p>
                </div>
                <div className="p-4 rounded-xl border border-border/70 bg-card/60">
                  <p className="text-xs font-mono font-bold text-foreground">Depot</p>
                  <p className="text-xs text-muted-foreground mt-1">High-speed remote Docker container builds and cached compilation.</p>
                </div>
                <div className="p-4 rounded-xl border border-border/70 bg-card/60">
                  <p className="text-xs font-mono font-bold text-foreground">Buildkite</p>
                  <p className="text-xs text-muted-foreground mt-1">Enterprise-scale continuous integration pipeline orchestration.</p>
                </div>
              </div>
            </section>

            <EditorialDivider />

            {/* Section 11 & 12 */}
            <section id="bigger-than-github" className="scroll-mt-32 space-y-6">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                Section 10 // Long-Term Opportunity
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground not-prose">
                This Is Bigger Than Building Another GitHub
              </h2>

              <p className="text-base text-foreground/80 leading-relaxed">
                GitHub provides exceptionally mature repository infrastructure with decade-long network effects in open source, enterprise compliance, identity, and Actions.
              </p>

              <p className="text-base text-foreground/80 leading-relaxed">
                Recreating GitHub feature-by-feature for traditional human workflows would be uninspired. The massive opportunity lies in building repository infrastructure for an entirely new software lifecycle where AI agents generate 80%+ of all commits and pull requests.
              </p>
            </section>

            <EditorialDivider />

            {/* Section 13 & 14: Matrix */}
            <section id="forge-comparison-matrix" className="scroll-mt-32 not-prose">
              <GitForgeEvolutionComparison />
            </section>

            <EditorialDivider />

            {/* Section 15 */}
            <section id="sync-killer-feature" className="scroll-mt-32 space-y-6">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                Section 11 // Strategic Advantage
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground not-prose">
                Why GitHub Sync Is Origin&apos;s Most Important Feature
              </h2>

              <p className="text-base text-foreground/80 leading-relaxed">
                GitHub sync is far more than a migration bridge. It shifts the competitive question from:
              </p>

              <div className="p-4 rounded-xl border border-border/70 bg-muted/20 font-mono text-xs text-center text-muted-foreground">
                &ldquo;Will engineering teams migrate away from GitHub today?&rdquo;
              </div>

              <p className="text-base text-foreground/80 leading-relaxed">
                To the much more consequential reality:
              </p>

              <div className="p-4 rounded-xl border border-primary/40 bg-primary/[0.04] font-mono text-sm text-center text-primary font-bold">
                &ldquo;Where will developers and coding agents spend the majority of their daily software lifecycle?&rdquo;
              </div>
            </section>

            <EditorialDivider />

            {/* Section 16 & 17 */}
            <section id="github-countermove" className="scroll-mt-32 space-y-6">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                Section 12 // Competitive Dynamics
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground not-prose">
                GitHub Is Not Standing Still
              </h2>

              <p className="text-base text-foreground/80 leading-relaxed">
                GitHub possesses formidable scale with GitHub Copilot, Copilot Workspace, GitHub Actions, and Microsoft’s global cloud distribution. GitHub starts with the repository and is adding agents. Cursor starts with the agent and is adding the repository.
              </p>

              <p className="text-base text-foreground/80 leading-relaxed">
                The battle for the modern developer stack will be fought over which platform becomes the definitive control surface for AI-native software creation.
              </p>
            </section>

            <EditorialDivider />

            {/* Section 18 & 19 */}
            <section id="the-bigger-picture" className="scroll-mt-32 space-y-6">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                Section 13 // The Next Decade
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground not-prose">
                The Bigger Picture: Infrastructure for the Agentic Era
              </h2>

              <p className="text-base text-foreground/80 leading-relaxed">
                AI coding began by accelerating individual keystrokes. Then it automated multi-step engineering tasks. Now it is reshaping the core infrastructure where software lives, verifies, and deploys.
              </p>

              <p className="text-base text-foreground/80 leading-relaxed">
                Cursor started by competing for the editor window. With Origin, it is competing for the entire development operating system.
              </p>
            </section>

            <EditorialDivider />

            {/* Section 20: Primary Citations */}
            <section id="sources" className="scroll-mt-32 space-y-4">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                Section 14 // Primary Citations
              </span>
              <h3 className="text-xl font-bold text-foreground not-prose">
                Primary Sources &amp; Official References
              </h3>

              <div className="space-y-3 not-prose">
                <a
                  href="https://cursor.com/changelog/origin-code-hosting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card/40 hover:border-primary/60 transition-all group"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      Cursor Official Changelog — Origin Code Hosting Launch (August 17, 2026)
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      cursor.com/changelog/origin-code-hosting
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </a>

                <a
                  href="https://cursor.com/origin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card/40 hover:border-primary/60 transition-all group"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      Cursor Origin Product Documentation &amp; Overview
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      cursor.com/origin
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </a>

                <a
                  href="https://forum.cursor.com/t/origin-code-hosting/168670"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card/40 hover:border-primary/60 transition-all group"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      Cursor Community Forum — Origin Technical Announcement &amp; Discussion
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      forum.cursor.com/t/origin-code-hosting/168670
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </a>

                <a
                  href="https://www.itpro.com/software/development/vibe-coding-startup-cursor-just-launched-a-github-alternative-heres-what-users-can-expect"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card/40 hover:border-primary/60 transition-all group"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      ITPro Coverage — Cursor Just Launched a GitHub Alternative: What Users Can Expect
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      itpro.com/software/development/vibe-coding-startup-cursor-just-launched-a-github-alternative
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </a>
              </div>
            </section>

            <EditorialDivider />

            {/* Section 21: AEO / GEO FAQ */}
            <section id="faq" className="scroll-mt-32 space-y-6">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                Section 15 // Answer Engine Optimization (AEO/GEO)
              </span>
              <h3 className="text-2xl font-bold text-foreground not-prose">
                Frequently Asked Questions
              </h3>

              <div className="space-y-4 not-prose">
                {faqData.map((item, idx) => (
                  <div key={idx} className="p-6 rounded-xl border border-border/70 bg-card/50">
                    <h4 className="text-base font-bold text-foreground flex items-start gap-2.5">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary shrink-0 mt-0.5">Q{idx + 1}</span>
                      <span>{item.question}</span>
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-3 pl-8">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Share and Newsletter Components */}
            <div className="not-prose mt-12">
              <BlogShare 
                title="Cursor Launches Origin: Why Cursor Is Moving Into GitHub's Territory" 
                slug="cursor-origin-github-ai-code-hosting" 
              />
              <NewsletterCTA />
              <AgentCTA />
            </div>

          </article>
        </div>

        {/* Related Essays */}
        <section className="mt-24 pt-16 border-t border-border/60">
          <div className="mb-8">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-primary">
              Further Technical Reading
            </span>
            <h3 className="text-2xl font-bold text-foreground mt-1">
              Related Developer Infrastructure &amp; AI Analysis
            </h3>
          </div>
          <RelatedEssaysList
            essays={[
              {
                title: "Stripe Is Buying OpenRouter: Why a Payments Company Wants to Own Part of the AI Infrastructure Layer",
                accentWord: "OpenRouter",
                excerpt: "Stripe agreed to acquire OpenRouter in an $8B+ milestone transaction. Here's how model routing, token usage, billing and payments are converging.",
                href: "/blog/stripe-openrouter-ai-infrastructure-acquisition",
                date: "August 19, 2026",
                author: "GrowXLabs Editorial",
                imageSrc: "/images/blog-stripe-openrouter-acquisition.png",
              },
              {
                title: "Kimi K3 Technical Analysis: Inside Moonshot AI's Open Frontier Model",
                accentWord: "Kimi K3",
                excerpt: "Technical breakdown of Moonshot AI's 2.8T Mixture-of-Experts architecture, Delta Attention, and software engineering benchmarks.",
                href: "/blog/kimi-k3-open-frontier-intelligence-model",
                date: "July 21, 2026",
                author: "GrowXLabs Editorial",
                imageSrc: "/images/blog-kimi-k3-woodcut.png",
              },
              {
                title: "AI Coding Tools Are Reshaping Modern Software Engineering",
                accentWord: "Reshaping",
                excerpt: "Understand how AI coding systems are shifting software engineering from autocomplete syntax helpers to complex multi-agent workflow orchestration.",
                href: "/blog/ai-coding-tools-are-reshaping-modern-software-engineering",
                date: "May 27, 2026",
                author: "GrowXLabs Editorial",
                imageSrc: "/images/coding_blog_woodcut_1780853698423.png",
              },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
