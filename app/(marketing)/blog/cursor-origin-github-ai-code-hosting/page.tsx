import React from "react";
import Script from "next/script";
import Image from "next/image";

import { RelatedEssaysList } from "@/components/marketing/BlogEditorial";
import { AIReadLinks, BlogShare, NewsletterCTA, AgentCTA } from "./InteractiveComponents";
import { EditorialReadingProgress, EditorialTableOfContents } from "./EditorialTableOfContents";
import type { EditorialHeading } from "./EditorialTableOfContents";
import styles from "./editorial.module.css";

// ═══════════════════════════════════════════════════
// METADATA GENERATOR (SEO, AEO & Social Previews)
// ═══════════════════════════════════════════════════
export async function generateMetadata() {
  const title = "Cursor Launches Origin: Why Cursor Is Moving Into GitHub’s Territory";
  const description = "Cursor launched Origin on August 17, 2026, bringing repository hosting, pull requests, GitHub sync and AI agents closer together. Here’s why the move matters for the future of software development.";

  return {
    title: `${title} | GrowxLabs`,
    description,
    alternates: {
      canonical: "https://growxlabs.tech/blog/cursor-origin-github-ai-code-hosting"
    },
    openGraph: {
      title,
      description,
      url: "https://growxlabs.tech/blog/cursor-origin-github-ai-code-hosting",
      siteName: "GrowxLabs",
      type: "article",
      publishedTime: "2026-08-17T08:00:00.000Z",
      modifiedTime: "2026-08-21T08:00:00.000Z",
      authors: ["GrowxLabs"],
      images: [
        {
          url: "https://growxlabs.tech/images/blog-cursor-origin.png",
          width: 1200,
          height: 630,
          alt: "Cursor Origin connecting an AI editor with code hosting and GitHub workflows",
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
      "Developer Tools",
      "Code Hosting",
      "Pull Requests",
      "AI-Assisted Coding",
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

  const headings: EditorialHeading[] = [
    { id: "introduction", text: "What Cursor Is Adding With Origin" },
    { id: "traditional-boundary", text: "How Cursor and GitHub Worked Before Origin" },
    { id: "repository-next-to-agent", text: "Cursor Brings the Repository Into Its Workspace" },
    { id: "github-sync-strategy", text: "How Origin Syncs With GitHub" },
    { id: "human-agent-boundary", text: "Why Pull Requests Still Matter When AI Writes Code" },
    { id: "the-bigger-picture", text: "Why Cursor's Move Matters for Developer Tools" },
    { id: "faq", text: "Frequently Asked Questions" },
  ];

  const faqData = [
    {
      question: "What is Cursor Origin and when was it launched?",
      answer: "Cursor Origin was launched on August 17, 2026 as a code-hosting service built into Cursor. It provides repository hosting, code browsing, pull requests, connections to external testing and deployment services, and two-way GitHub sync.",
    },
    {
      question: "Is Cursor Origin trying to replace GitHub immediately?",
      answer: "No. Cursor Origin supports two-way GitHub sync, allowing developers to import existing GitHub repositories into Cursor while keeping GitHub as the main copy of the code. Pushes, commits, and pull-request comments sync between both platforms without requiring a forced migration.",
    },
    {
      question: "Why did Cursor build its own code hosting platform instead of relying on GitHub?",
      answer: "As AI tools move beyond autocomplete and start copying repositories, changing many files, running checks, and creating branches, keeping the repository close to the tool makes those tasks faster and easier to manage. It also gives people a clear place to review the work.",
    },
    {
      question: "How do pull requests work when AI changes code in Origin?",
      answer: "In Cursor Origin, AI tools can work through a coding task and open pull requests with test results and preview links. The developer then reviews the changes, leaves comments, and decides whether to merge them.",
    },
  ];

  const relatedEssays = [
    {
      title: "Chatbots Are Dying. Agents Are Taking Over.",
      accentWord: "Agents",
      excerpt: "AI is moving from conversational chat interfaces to tools that can complete multi-step tasks across software and business systems.",
      href: "/blog/chatbots-are-dying-agents-are-taking-over",
      date: "June 1, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/chatbots-are-dying-agents-are-taking-over.png",
    },
    {
      title: "Claude Opus 4.8: Anthropic's Most Advanced AI Model",
      accentWord: "Anthropic",
      excerpt: "Deep dive into Claude 4.8 benchmarks, including SWE-Bench Pro, Terminal-Bench 2.1, and how it handles longer coding tasks.",
      href: "/blog/claude-opus-4-8-anthropic-ai-model",
      date: "May 29, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/claude_blog_woodcut_1780853620986.png",
    },
    {
      title: "Why Anthropic Is Becoming a Serious Threat to OpenAI",
      accentWord: "Threat",
      excerpt: "Analyzing Anthropic's developer mindshare, Claude Code CLI, and the race to build the tools developers use to write software with AI.",
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
        "@id": `https://growxlabs.tech/blog/cursor-origin-github-ai-code-hosting/#article`,
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
          "name": "GrowxLabs",
          "url": "https://growxlabs.tech",
        },
        "publisher": {
          "@type": "Organization",
          "name": "GrowxLabs",
          "url": "https://growxlabs.tech",
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://growxlabs.tech/blog/cursor-origin-github-ai-code-hosting`,
        },
      },
    ],
  };

  return (
    <div className={`${styles.article} cursorOriginEditorial blog-article-page`}>
      <EditorialReadingProgress />

      <Script
        id="cursor-origin-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <header className={styles.masthead}>
          <span className={styles.eyebrow}>Developer Tools</span>

          <h1 className={styles.headline}>
            Cursor Launches Origin: Why Cursor Is Moving Into GitHub’s Territory
          </h1>

          <p className={styles.dek}>
            Cursor has spent the last few years changing how developers write code with AI. Now it wants to change where that software lives. On August 17, 2026, Cursor launched <strong>Origin</strong>, bringing code hosting, pull requests, GitHub sync, and AI tools into the same workspace.
          </p>

          <div className={styles.metaRow} aria-label="Article metadata">
            <span className={styles.metaItem}>August 17, 2026</span>
            <span className={styles.metaItem}>Updated August 21, 2026</span>
            <span className={styles.metaItem}>8 min read</span>
          </div>

          <div className={styles.byline}>
            <div className={styles.avatar} aria-hidden="true">GX</div>
            <div>
              <div className={styles.bylineName}>GrowxLabs</div>
              <div className={styles.bylineRole}>AI coding tools and software development</div>
            </div>
          </div>
        </header>

        <figure className={styles.hero}>
          <div className={`${styles.heroFrame} blog-editorial-image-frame`}>
            <Image
              src="/images/blog-cursor-origin.png"
                    alt="Cursor Origin bringing code hosting and AI coding tools into one workspace"
              fill
              priority
              className={styles.heroImage}
              sizes="(max-width: 640px) 100vw, (max-width: 1240px) 94vw, 1240px"
            />
          </div>
          <figcaption className={styles.caption}>
            <span>Cursor Origin brings code hosting and AI coding tools into one workspace.</span>
          </figcaption>
        </figure>

        <EditorialTableOfContents headings={headings} mobile />

        <div className={styles.editorialGrid}>
          <aside className={styles.tocRail}>
            <EditorialTableOfContents headings={headings} />
          </aside>

          <article className={styles.body}>
            <AIReadLinks title="Cursor Launches Origin: Why Cursor Is Moving Into GitHub’s Territory" />

            {/* Section 1 */}
            <section id="introduction" className={styles.section}>
              <span className={styles.sectionLabel}>01 // What Origin Adds</span>
              <h2 className={styles.sectionTitle}>What Cursor Is Adding With Origin</h2>

              <p>
                Cursor has spent the last few years changing how developers write software with AI. Now it wants to change where that software lives. On August 17, 2026, Cursor officially launched <strong>Origin</strong>, a code-hosting service built directly into Cursor.
              </p>

              <p>
                In its early beta, Origin is available across Cursor&apos;s paid tiers. It offers repository hosting, code browsing, code search, pull requests, automated checks, and two-way GitHub sync.
              </p>

              <blockquote className={styles.pullQuote}>
                &ldquo;Origin is designed so people and AI tools can work from the same repository.&rdquo;
              </blockquote>
            </section>

            {/* Section 2 */}
            <section id="traditional-boundary" className={styles.section}>
              <span className={styles.sectionLabel}>02 // Before Origin</span>
              <h2 className={styles.sectionTitle}>How Cursor and GitHub Worked Before Origin</h2>

              <p>
                Developers have traditionally split their work between two places:
              </p>

              <ul>
                <li><strong>The Editor:</strong> Where code is written, edited, and tested on a developer&apos;s machine.</li>
                <li><strong>The Code Host (GitHub / GitLab):</strong> Where code is stored, reviewed, checked, and merged.</li>
              </ul>

              <p>
                This separation worked when people wrote and reviewed nearly every line of code themselves. As AI tools began changing multiple files and running commands, moving between the editor and the code host started to slow the work down.
              </p>
            </section>

            {/* Section 3 */}
            <section id="repository-next-to-agent" className={styles.section}>
              <span className={styles.sectionLabel}>03 // Inside Cursor</span>
              <h2 className={styles.sectionTitle}>Cursor Brings the Repository Into Its Workspace</h2>

              <p>
                When an AI tool handles a substantial task—such as changing an authentication service or updating a database schema—it needs to understand the codebase, run tests, and create a feature branch.
              </p>

              <p>
                When the repository lives in another service, every task starts with copying the code, authenticating, and waiting for systems to exchange updates. Putting the repository inside Cursor&apos;s cloud environment lets the agent work with the code and branches directly.
              </p>

              <div className={styles.codeBlock} aria-label="Example workflow in Cursor Origin">
                <div className={styles.codeMuted}>Example workflow in Cursor Origin</div>
                    <div className={styles.codeAccent}>1. An AI tool receives a coding task</div>
                    <div>2. Origin creates a branch and runs checks</div>
                    <div>3. The tool changes the code and opens a pull request</div>
                <div>4. The developer reviews the changes and the preview</div>
              </div>

              <figure className={styles.architectureFigure}>
                <div className={styles.architectureFrame}>
                  <Image
                    src="/images/blog-cursor-origin-architecture.png"
                    alt="Diagram showing how a developer and an AI tool can work from the same repository"
                    fill
                    className={styles.architectureImage}
                    sizes="(max-width: 780px) 100vw, 780px"
                  />
                </div>
                <figcaption className={styles.caption}>
                  <span>How a developer and an AI tool can work from the same repository.</span>
                </figcaption>
              </figure>
            </section>

            {/* Section 4 */}
            <section id="github-sync-strategy" className={styles.section}>
              <span className={styles.sectionLabel}>04 // Working With GitHub</span>
              <h2 className={styles.sectionTitle}>How Origin Syncs With GitHub</h2>

              <p>
                Rather than forcing developers and companies into a risky, all-or-nothing migration, Cursor introduced <strong>two-way GitHub sync</strong>.
              </p>

              <p>
                Engineering teams can connect their GitHub accounts, choose specific repositories, and keep them synced with Origin. GitHub can remain the main copy of the code, while Cursor keeps its workspaces updated. Commits, branch pushes, and pull request reviews sync between both platforms.
              </p>

              <p>
                Developers can therefore try Origin without asking their security teams to move everything away from GitHub at once.
              </p>
            </section>

            {/* Section 5 */}
            <section id="human-agent-boundary" className={styles.section}>
              <span className={styles.sectionLabel}>05 // Reviewing Code Written by AI</span>
              <h2 className={styles.sectionTitle}>Why Pull Requests Still Matter When AI Writes Code</h2>

              <p>
                As AI coding tools improve, developers spend less time typing routine code and more time setting requirements, checking how the pieces fit together, and validating the result.
              </p>

              <p>
                In Cursor Origin, the pull request is where a developer reviews what an AI tool changed before it reaches the main codebase. The tool can attach test results and preview links through partners like Vercel and Depot. The developer reviews the changes, leaves comments, and approves the merge.
              </p>
            </section>

            {/* Section 6 */}
            <section id="the-bigger-picture" className={styles.section}>
              <span className={styles.sectionLabel}>06 // Why It Matters</span>
              <h2 className={styles.sectionTitle}>Why Cursor&apos;s Move Matters for Developer Tools</h2>

              <p>
                Cursor&apos;s expansion into code hosting is part of a broader shift: the editor, code repository, development environment, and AI tools are moving closer together.
              </p>

              <p>
                GitHub continues to add AI features to an established code-hosting platform. Cursor is starting with the editor and extending outward into repositories and collaboration. The important question is which product can make the path from a developer&apos;s idea to tested, reviewed, and deployed code easiest to manage.
              </p>
            </section>

            {/* Section 7: FAQ */}
            <section id="faq" className={styles.section}>
              <span className={styles.sectionLabel}>07 // Frequently Asked Questions</span>
              <h2 className={styles.sectionTitle}>Understanding Cursor Origin</h2>

              <div className={styles.faqList}>
                {faqData.map((item, idx) => (
                  <div key={idx} className={styles.faqItem}>
                    <h3 className={styles.faqQuestion}>{item.question}</h3>
                    <p className={styles.faqAnswer}>{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className={styles.endMatter}>
              <AgentCTA />
              <BlogShare
                title="Cursor Launches Origin: Why Cursor Is Moving Into GitHub’s Territory"
                url={`https://growxlabs.tech/blog/cursor-origin-github-ai-code-hosting`}
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
