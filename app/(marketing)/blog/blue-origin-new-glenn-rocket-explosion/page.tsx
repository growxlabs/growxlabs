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
  NewsletterForwardBanner, 
  RelatedEssaysList 
} from "@/components/marketing/BlogEditorial";
import { Reveal } from "@/components/marketing/Reveal";
import { ArrowRight, Calendar, Clock, User, ArrowUpRight, Rocket } from "lucide-react";
import { FlickerText } from "@/components/marketing/FlickerText";
import { BlogShare, NewsletterCTA } from "./InteractiveComponents";

// ═══════════════════════════════════════════════════
// METADATA GENERATOR (SEO & Social Previews)
// ═══════════════════════════════════════════════════
export async function generateMetadata() {
  const title = "Blue Origin’s New Glenn Rocket Explodes During Test: What Happened?";
  const description = "Blue Origin's New Glenn rocket exploded during a hot-fire test in Florida. Here's what happened, why it matters, and what it means for the future of space technology.";

  return {
    title: `${title} | GrowxLabs`,
    description,
    alternates: {
      canonical: "https://growxlabs.tech/blog/blue-origin-new-glenn-rocket-explosion"
    },
    openGraph: {
      title,
      description,
      url: "https://growxlabs.tech/blog/blue-origin-new-glenn-rocket-explosion",
      siteName: "GrowxLabs",
      type: "article",
      publishedTime: "2026-05-30T17:00:00.000Z",
      authors: ["GrowxLabs"],
      images: [
        {
          url: "https://growxlabs.tech/images/blue-origin-new-glenn-rocket-explosion.png",
          width: 1200,
          height: 630,
          alt: "Blue Origin's New Glenn Rocket Explodes During Test"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://growxlabs.tech/images/blue-origin-new-glenn-rocket-explosion.png"]
    },
    keywords: [
      "Blue Origin",
      "New Glenn",
      "Rocket Explosion",
      "Jeff Bezos",
      "Space technology",
      "NASA Artemis",
      "Project Kuiper",
      "SpaceX competitor",
      "Launch failure",
      "Cape Canaveral"
    ]
  };
}

export default async function NewGlennExplosionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const titleName = "NEW GLENN";

  // Headings for Table of Contents scrollspy
  const headings = [
    { id: "setback", text: "Blue Origin Faces Major Setback" },
    { id: "what-is-new-glenn", text: "What Is New Glenn?" },
    { id: "what-happened", text: "What Exactly Happened?" },
    { id: "why-it-matters", text: "Why This Matters" },
    { id: "bezos-responds", text: "Jeff Bezos Responds" },
    { id: "bigger-picture", text: "The Bigger Picture" },
    { id: "key-takeaways", text: "Key Takeaways" },
    { id: "final-thoughts", text: "Final Thoughts" }
  ];

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://growxlabs.tech/blog/blue-origin-new-glenn-rocket-explosion/#article`,
        "headline": "Blue Origin’s New Glenn Rocket Explodes During Test: What Happened?",
        "description": "Blue Origin's New Glenn rocket exploded during a hot-fire test in Florida. Here's what happened, why it matters, and what it means for the future of space technology.",
        "datePublished": "2026-05-30T17:00:00Z",
        "dateModified": "2026-05-30T17:00:00Z",
        "image": "https://growxlabs.tech/images/blue-origin-new-glenn-rocket-explosion.png",
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
          "@id": `https://growxlabs.tech/blog/blue-origin-new-glenn-rocket-explosion`
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
            "name": "New Glenn Explosion",
            "item": `https://growxlabs.tech/blog/blue-origin-new-glenn-rocket-explosion`
          }
        ]
      }
    ]
  };

  // Related essays
  const relatedEssays = [
    {
      title: "Claude Opus 4.8: Anthropic's Most Advanced AI Model — Benchmarks & Review",
      accentWord: "Benchmarks",
      excerpt: "Deep dive into Claude 4.8 benchmarks, including SWE-Bench Pro, Terminal-Bench 2.1, and the new Dynamic Workflows engine.",
      href: "/blog/claude-opus-4-8-anthropic-ai-model",
      date: "May 29, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/claude_blog_woodcut_1780853620986.png"
    },
    {
      title: "Why Anthropic Is Becoming a Serious Threat to OpenAI",
      accentWord: "Threat",
      excerpt: "Analyze Anthropic's accelerating developer mindshare and Claude Code's edge over ChatGPT and GPT-5.",
      href: "/blog/why-anthropic-is-becoming-a-serious-threat-to-openai",
      date: "May 27, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/anthropic_openai_woodcut_1780853674501.png"
    },
    {
      title: "Google I/O 2026: The Beginning of the AI-Native Internet",
      accentWord: "AI-Native",
      excerpt: "Google I/O details Google's quiet pivot from link curation index to an active, tool-using personal agent network.",
      href: "/blog/google-io-2026",
      date: "May 27, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/search_blog_woodcut_1780853646113.png"
    }
  ];

  return (
    <div className="blog-article-page w-full bg-background min-h-screen text-foreground selection:bg-primary/10 selection:text-primary pt-32 pb-24">
      {/* JSON-LD Structured Data */}
      <Script
        id="blue-origin-explosion-schema"
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
                Space
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                /
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                Technology
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                /
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                Innovation
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-black leading-[1.1] tracking-tighter text-foreground mb-8 max-w-4xl mx-auto font-serif">
              Blue Origin’s New Glenn Rocket <span className="italic font-serif font-normal">Explodes</span> During Test:
              {" "}
              <span className="text-primary font-sans font-black tracking-tighter block mt-2">What Happened?</span>
            </h2>

            {/* Meta Bar */}
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
                <span>May 30, 2026</span>
              </div>
            </div>
          </Reveal>

          {/* Hero Visual — Featured Image */}
          <Reveal y={30} delay={0.2}>
            <div className="blog-editorial-image-frame mt-14 w-full max-w-5xl mx-auto">
              <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-[#0F0F12]">
                <Image
                  src="/images/blog-blue-origin-landscape.png"
                  alt="Blue Origin New Glenn Rocket Explosion Test Anomaly"
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
              authorName="GrowXLabs Team"
              authorRole="Space Strategy Analyst"
              authorAvatar="/images/avatars/growxlabs.png"
              category="Space Tech"
              bio="Analyzing developments in commercial spaceflight, heavy launch systems, and satellite constellations."
            />
          </aside>

          {/* Article Content */}
          <article className="col-span-12 lg:col-span-9 max-w-[70ch] mx-auto lg:mx-0">
            <NewsletterForwardBanner />
            <BlogActionBar title="Blue Origin’s New Glenn Rocket Explodes During Test" slug="blue-origin-new-glenn-rocket-explosion" />

            {/* Mobile Author Sidebar */}
            <div className="lg:hidden mb-8">
              <AuthorProfileSidebar
                authorName="GrowXLabs Team"
                authorRole="Space Strategy Analyst"
                authorAvatar="/images/avatars/growxlabs.png"
                category="Space Tech"
                bio="Analyzing developments in commercial spaceflight, heavy launch systems, and satellite constellations."
              />
            </div>

            {/* ─────────────────────────────────────── */}
            {/* SECTION 01 — SETBACK                   */}
            {/* ─────────────────────────────────────── */}
            <section id="setback" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Blue Origin Faces Major Setback as New Glenn Rocket Explodes
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p className="first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                  Jeff Bezos&apos; space company, Blue Origin, suffered a significant setback after its New Glenn rocket exploded during a hot-fire test at Cape Canaveral, Florida.
                </p>
                <p>
                  The incident occurred while engineers were performing a routine ground test designed to verify the rocket&apos;s systems before an upcoming mission. During the test, an anomaly triggered a massive explosion, destroying the rocket and creating a huge fireball visible across Florida&apos;s Space Coast. Fortunately, no injuries were reported, and all personnel were safely accounted for.
                </p>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 02 — WHAT IS NEW GLENN?        */}
            {/* ─────────────────────────────────────── */}
            <section id="what-is-new-glenn" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                What Is New Glenn?
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  New Glenn is Blue Origin&apos;s flagship heavy-lift rocket and one of the company&apos;s most ambitious projects.
                </p>
                <p>
                  Named after astronaut John Glenn, the first American to orbit Earth, the rocket has been under development for more than a decade. It was designed to compete directly with SpaceX&apos;s Falcon Heavy and future Starship missions while supporting commercial satellite launches, government contracts, and NASA programs.
                </p>
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-primary" />
                    <span>The rocket plays a critical role in:</span>
                  </p>
                  <ul className="list-none space-y-2.5 pl-4 border-l-2 border-primary/30">
                    {[
                      "Commercial satellite launches",
                      "Amazon's Project Kuiper internet constellation",
                      "NASA lunar missions",
                      "National security launch contracts",
                      "Future deep-space missions"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-[16px] text-foreground/90">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 03 — WHAT HAPPENED             */}
            {/* ─────────────────────────────────────── */}
            <section id="what-happened" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                What Exactly Happened?
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  Blue Origin was conducting a hot-fire test, a procedure where rocket engines are ignited while the vehicle remains secured to the launch pad.
                </p>
                <p>
                  These tests are performed to verify engine performance, fuel systems, and launch readiness before an actual mission.
                </p>
                <p>
                  During the test, New Glenn experienced what the company described as an &ldquo;anomaly.&rdquo; Seconds later, the rocket exploded on the launch pad, producing a massive fireball and destroying the vehicle. Blue Origin immediately confirmed that no personnel were harmed and that an investigation was underway.
                </p>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 04 — WHY IT MATTERS            */}
            {/* ─────────────────────────────────────── */}
            <section id="why-it-matters" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Why This Matters
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  This is more than just a failed test.
                </p>
                <p>
                  The explosion impacts Blue Origin&apos;s efforts to close the gap with SpaceX, which currently dominates the commercial launch industry.
                </p>
                <p>
                  The destroyed New Glenn rocket was expected to support future satellite deployments, including missions related to Amazon&apos;s Project Kuiper broadband network, a direct competitor to SpaceX&apos;s Starlink service.
                </p>
                <p>
                  The incident may also affect timelines for future NASA-related programs that rely on Blue Origin&apos;s launch capabilities. NASA has already acknowledged the anomaly and stated it will support the investigation.
                </p>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 05 — BEZOS RESPONDS            */}
            {/* ─────────────────────────────────────── */}
            <section id="bezos-responds" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Jeff Bezos Responds
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  Following the explosion, Jeff Bezos described the event as a &ldquo;very rough day&rdquo; for the company.
                </p>
                <blockquote className="border-l-4 border-primary bg-[#C0F0FB]/[0.03] pl-6 pr-6 py-6 my-8 rounded-r-xl">
                  <p className="text-[17px] italic leading-relaxed text-foreground/90 font-medium">
                    &ldquo;...very rough day&rdquo;
                  </p>
                  <cite className="text-[13px] text-[#9CA3AF] font-mono mt-3 block not-italic">— Jeff Bezos</cite>
                </blockquote>
                <p>
                  Despite the setback, Blue Origin has made it clear that development will continue. The company plans to investigate the root cause of the anomaly, rebuild, and return New Glenn to flight operations as quickly as possible.
                </p>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 06 — THE BIGGER PICTURE        */}
            {/* ─────────────────────────────────────── */}
            <section id="bigger-picture" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                The Bigger Picture
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  Space exploration has always been filled with failures before success.
                </p>
                <p>
                  Many of today&apos;s most successful rockets, including those developed by SpaceX, experienced multiple explosions and failed tests during development.
                </p>
                <p>
                  While this explosion is a major setback, it is unlikely to end Blue Origin&apos;s ambitions. Instead, it highlights the complexity of building next-generation launch systems capable of carrying satellites, lunar payloads, and future human missions.
                </p>
                <p>
                  In the space industry, failures are often part of the path toward innovation.
                </p>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 07 — KEY TAKEAWAYS             */}
            {/* ─────────────────────────────────────── */}
            <section id="key-takeaways" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Key Takeaways
              </h2>
              <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-4">
                <ul className="list-none space-y-3">
                  {[
                    "Blue Origin's New Glenn rocket exploded during a hot-fire test in Florida.",
                    "No injuries were reported.",
                    "The rocket was being prepared for future missions, including Project Kuiper deployments.",
                    "NASA is supporting the investigation into the anomaly.",
                    "The incident represents a significant setback for Blue Origin's competition with SpaceX.",
                    "Jeff Bezos has confirmed the company will rebuild and continue development efforts."
                  ].map((takeaway, i) => (
                    <li key={i} className="flex items-start gap-3.5 text-[16px] text-foreground/90 leading-relaxed">
                      <span className="w-2 h-2 rounded-full bg-[#C0F0FB] mt-2.5 shrink-0" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <div className="w-full h-px bg-[#E5E2DC] my-14" />

            {/* ─────────────────────────────────────── */}
            {/* SECTION 08 — FINAL THOUGHTS            */}
            {/* ─────────────────────────────────────── */}
            <section id="final-thoughts" className="scroll-mt-32 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Final Thoughts
              </h2>
              <div className="text-[18px] md:text-[20px] leading-[1.7] text-foreground/90 font-normal space-y-6 font-lora">
                <p>
                  Blue Origin&apos;s New Glenn explosion is a reminder that space remains one of the most difficult engineering challenges on Earth.
                </p>
                <p>
                  While the failure may delay future missions, it also represents another chapter in the race to build the next generation of space transportation systems.
                </p>
                <p>
                  The question now is not whether Blue Origin will recover.
                </p>
                <p>
                  The question is how quickly they can learn from this failure and return to the launch pad.
                </p>
                <p className="pt-4 font-semibold text-[#1D1D21]">
                  Follow GrowxLabs for the latest updates in AI, space technology, startups, automation, and future innovation.
                </p>
              </div>
            </section>

            {/* Share and Social Panel */}
            <BlogShare title="Blue Origin’s New Glenn Rocket Explodes During Test" slug="blue-origin-new-glenn-rocket-explosion" />

            {/* Newsletter Subscription Block */}
            <NewsletterCTA />

            {/* Related Essays Section */}
            <div className="mt-16 pt-16 border-t border-[#E5E2DC]">
              <h3 className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase font-bold mb-8">Related Essays</h3>
              <RelatedEssaysList essays={relatedEssays} />
            </div>

          </article>
        </div>
      </main>
    </div>
  );
}
