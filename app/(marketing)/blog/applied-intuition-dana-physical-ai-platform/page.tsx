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
  const title = "Dana: Applied Intuition's Bold Bet on the Future of Physical AI";
  const description = "Applied Intuition has launched Dana, the first agentic platform for Physical AI. Discover how Dana bridges digital intelligence with physical systems, robotics, and vehicles.";

  return {
    title: `${title} | GrowxLabs`,
    description,
    alternates: {
      canonical: "https://growxlabs.tech/blog/applied-intuition-dana-physical-ai-platform"
    },
    openGraph: {
      title,
      description,
      url: "https://growxlabs.tech/blog/applied-intuition-dana-physical-ai-platform",
      siteName: "GrowxLabs",
      type: "article",
      publishedTime: "2026-07-23T00:00:00.000Z",
      authors: ["GrowxLabs"],
      images: [
        {
          url: "https://growxlabs.tech/images/blog-applied-intuition-dana.jpg",
          width: 1200,
          height: 630,
          alt: "Applied Intuition Dana Physical AI platform"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://growxlabs.tech/images/blog-applied-intuition-dana.jpg"]
    },
    keywords: [
      "Applied Intuition Dana",
      "Physical AI Dana",
      "Agentic platform physical AI",
      "robotics simulation and training",
      "autonomous vehicles infrastructure",
      "Applied Intuition simulator",
      "Qasar Younis Applied Intuition",
      "data and simulation flywheel",
      "industrial automation AI"
    ]
  };
}

export default async function AppliedIntuitionDanaBlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const titleName = "TECH EXCLUSIVE";

  const headings = [
    { id: "introduction", text: "1. Introduction" },
    { id: "what-is-dana", text: "2. What Is Dana?" },
    { id: "what-is-physical-ai", text: "3. What Is Physical AI?" },
    { id: "why-dana-matters", text: "4. Why Dana Matters" },
    { id: "problem-solved", text: "5. The Problem Dana Solves" },
    { id: "key-features", text: "6. Key Features" },
    { id: "industries-targeted", text: "7. Industries Dana Targets" },
    { id: "digital-vs-physical", text: "8. Digital AI vs Physical AI" },
    { id: "industry-shift", text: "9. Why This Is a Big Industry Shift" },
    { id: "growxlabs-perspective", text: "GrowXLabs Perspective" },
    { id: "key-takeaways", text: "Key Takeaways" },
    { id: "faq", text: "Frequently Asked Questions" }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://growxlabs.tech/blog/applied-intuition-dana-physical-ai-platform/#article`,
        "headline": "Dana: Applied Intuition's Bold Bet on the Future of Physical AI",
        "description": "Applied Intuition has launched Dana, the first agentic platform for Physical AI. Discover how Dana bridges digital intelligence with physical systems, robotics, and vehicles.",
        "datePublished": "2026-07-23T00:00:00.000Z",
        "dateModified": "2026-07-23T00:00:00.000Z",
        "image": "https://growxlabs.tech/images/blog-applied-intuition-dana.jpg",
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
          "id": `https://growxlabs.tech/blog/applied-intuition-dana-physical-ai-platform`
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
            "name": "Applied Intuition Dana",
            "item": `https://growxlabs.tech/blog/applied-intuition-dana-physical-ai-platform`
          }
        ]
      }
    ]
  };

  const relatedEssays = [
    {
      title: "OpenAI × Hugging Face: The AI Security Incident That Changed Everything",
      accentWord: "Incident",
      excerpt: "An in-depth technical analysis of the landmark ExploitGym security incident where frontier models autonomously escaped constraints and compromised Hugging Face infrastructure.",
      href: "/blog/openai-huggingface-security-incident",
      date: "July 23, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/blog-openai-huggingface-incident.png"
    },
    {
      title: "Kimi K3 Technical Analysis: Inside Moonshot AI's Open Frontier Intelligence Model",
      accentWord: "Kimi",
      excerpt: "Technical deep-dive into Moonshot AI's Kimi K3 2.8T open-weight Mixture-of-Experts model, analyzing its Delta Attention and sparse routing.",
      href: "/blog/kimi-k3-open-frontier-intelligence-model",
      date: "July 21, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/blog-kimi-k3-woodcut.png"
    },
    {
      title: "ChatGPT GPT-5.6 Preview: Everything You Need to Know",
      accentWord: "Preview",
      excerpt: "Explore the new tiered family of models (Sol, Terra, Luna) and discover its advanced reasoning and coding capabilities.",
      href: "/blog/chatgpt-gpt-5-6-preview-everything-you-need-to-know",
      date: "June 30, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/blog-gpt56-preview.png"
    }
  ];

  const faqItems = [
    { q: "What is Applied Intuition's Dana?", a: "Dana is the first agentic platform designed to build, test, deploy, and operate Physical AI systems at scale. It connects AI agents with simulation and verification tooling to power vehicles, robotics, and industrial hardware." },
    { q: "How does Physical AI differ from Digital AI?", a: "Digital AI operates within purely software environments (e.g. drafting articles, compiling code, or chatbots). Physical AI is embedded in hardware, enabling machines to perceive surrounding sensor inputs, reason about them, and act physically in the real world." },
    { q: "What is the 'Data and Simulation Flywheel'?", a: "This is a closed-loop system where physical machines collect operational logs and edge-case data, which is automatically converted into simulated scenarios. The AI model is trained on these simulations, and then redeployed to physical systems, continuously improving safety and capability." },
    { q: "Which industries does Dana target?", a: "Dana is built as a horizontal platform targeting automotive, autonomous trucking, defense, construction, mining, agricultural machinery, manufacturing, and general fleet robotics." }
  ];

  return (
    <div className="blog-article-page w-full bg-background min-h-screen text-foreground selection:bg-primary/10 selection:text-primary pt-32 pb-24">
      {/* JSON-LD Structured Data */}
      <Script
        id="applied-intuition-dana-schema"
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
            <h1 className="font-black select-none tracking-[-0.06em] text-foreground leading-[0.8] text-[clamp(1.5rem,7.5vw,110px)] uppercase whitespace-nowrap">
              <FlickerText text={titleName} />
            </h1>
          </div>

          <Reveal y={20}>
            {/* Category Tags */}
            <div className="flex gap-2 justify-center items-center mb-6">
              <span className="text-[11px] font-mono tracking-[0.2em] text-primary uppercase font-bold bg-primary/5 px-2.5 py-1 rounded">
                Physical AI
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                /
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                Robotics
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                /
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                Applied Intuition
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-[clamp(30px,4.2vw,52px)] font-black leading-[1.15] tracking-tighter text-foreground mb-8 max-w-4xl mx-auto font-serif">
              Dana: Applied Intuition's Bold Bet{" "}
              On the Future of <span className="italic font-serif font-normal text-primary">Physical AI</span>
            </h2>

            {/* Meta Bar */}
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-6 sm:gap-10 font-mono text-[11px] tracking-[0.1em] text-[#9CA3AF] uppercase border-t border-b border-border py-5">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>By GrowXLabs Team</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>8 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>July 23, 2026</span>
              </div>
            </div>
          </Reveal>

          {/* Hero Visual — Woodcut Illustration */}
          <Reveal y={30} delay={0.2}>
            <div className="blog-editorial-image-frame mt-14 w-full max-w-5xl mx-auto">
              <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-xl border border-white/10 p-1 bg-black">
                <Image
                  src="/images/blog-applied-intuition-dana.jpg"
                  alt="Steampunk technical woodcut illustration of physical AI systems and robotics gears"
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
              authorRole="AI Engineering & Safety"
              authorAvatar="/images/avatars/growxlabs.png"
              category="Physical AI • Robotics"
              bio="Comprehensive analysis on Physical AI frameworks, real-time autonomous systems, spatial intelligence, and control engineering infrastructure."
            />
          </aside>

          {/* Main Content Article */}
          <article className="lg:col-span-9 space-y-12 text-foreground font-serif text-lg leading-relaxed">
            
            <NewsletterForwardBanner />
            <BlogActionBar title="Dana: Applied Intuition's Bold Bet on the Future of Physical AI" slug="applied-intuition-dana-physical-ai-platform" />

            <TableOfContents headings={headings} />

            {/* SECTION 1 */}
            <section id="introduction" className="space-y-4 font-sans">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                1. Introduction
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                For years, artificial intelligence has primarily lived inside software. It writes code, generates images, answers questions, summarizes documents, and automates digital workflows. But a much bigger transformation is beginning—one where AI moves beyond the screen and into the physical world.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                On July 21, 2026, Applied Intuition introduced <strong>Dana</strong>, describing it as the <strong>first agentic platform for building, testing, deploying, and operating Physical AI systems at scale</strong>. Rather than creating another chatbot or coding assistant, Dana is designed to power intelligent machines that perceive, reason, and act in real-world environments.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                Applied Intuition believes the next decade of AI won't be defined by software alone—it will be defined by machines that can safely interact with the physical world.
              </p>
            </section>

            {/* SECTION 2 */}
            <section id="what-is-dana" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                2. What Is Dana?
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Dana is an <strong>agentic platform for Physical AI</strong> developed by Applied Intuition. It combines AI agents with nearly a decade of Applied Intuition's infrastructure, simulation tools, validation systems, and engineering workflows into a unified platform for intelligent machines.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                Unlike traditional AI copilots that focus on digital productivity, Dana helps organizations build AI systems capable of operating vehicles, robots, industrial equipment, drones, defense platforms, and other autonomous machines.
              </p>
              <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 italic text-foreground font-serif text-lg bg-primary/5 rounded-r">
                "ChatGPT helps people. <br /> Dana helps machines."
              </blockquote>
            </section>

            {/* SECTION 3 */}
            <section id="what-is-physical-ai" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                3. What Is Physical AI?
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Physical AI refers to artificial intelligence that can perceive, reason, and act in the real world. Instead of simply answering questions or writing texts, Physical AI enables machines to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-base leading-relaxed">
                <li>Understand their surroundings through sensor feeds (LiDAR, radar, cameras).</li>
                <li>Make complex, real-time spatial decisions.</li>
                <li>Navigate and maneuver safely in unpredictable environments.</li>
                <li>Operate heavy machinery and manipulate objects autonomously.</li>
                <li>Continuously learn and adapt from edge-case real-world experience.</li>
              </ul>
              <p className="text-muted-foreground text-base leading-relaxed">
                Applied Intuition believes Physical AI represents the next major computing platform after cloud computing and generative AI, moving the industry from virtual agents to physical embodiments.
              </p>
            </section>

            {/* SECTION 4 */}
            <section id="why-dana-matters" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                4. Why Dana Matters
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Building intelligent machines is significantly more difficult than building AI software. A chatbot can make mistakes without causing physical harm; a robot, heavy truck, or autonomous excavator cannot.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                Physical AI systems must operate with extremely high reliability, real-time decision making, continuous validation, traceability, strict safety governance, and full physics-based simulation before any code is deployed to real hardware. Dana brings all of these requirements into one integrated platform.
              </p>
            </section>

            {/* SECTION 5 */}
            <section id="problem-solved" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                5. The Problem Dana Solves
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Organizations developing autonomous systems often struggle with highly fragmented workflows. Typical development involves multiple simulation tools, disconnected data pipelines, independent validation systems, manual testing routines, and siloed deployment environments.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                This fragmentation slows down development speed and increases operational safety risks. Dana introduces a unified workflow where data pipelines, physics simulators, AI planning agents, continuous testing, and live fleet monitoring operate together as a single loop.
              </p>
            </section>

            {/* SECTION 6 */}
            <section id="key-features" className="space-y-6 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                6. Key Features of Dana
              </h3>
              
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-foreground">A. Agentic Workflows</h4>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Dana utilizes domain-specific AI agents to automate complex engineering tasks. Instead of manual scenario authoring or setting up pipelines, engineers can delegate planning, testing, and validation workflows directly to autonomous agents.
                </p>
              </div>

              <div className="space-y-4 border-t border-border/50 pt-4">
                <h4 className="text-lg font-bold text-foreground">B. Simulation-First Development</h4>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Every physical AI model is subjected to millions of physics-based simulated scenarios before interacting with real hardware. This validation cycle dramatically reduces physical testing costs while ensuring safety against dangerous edge-case conditions.
                </p>
              </div>

              <div className="space-y-4 border-t border-border/50 pt-4">
                <h4 className="text-lg font-bold text-foreground">C. Continuous Learning Flywheel</h4>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Fleet machines collect operational telemetry and disconnect logs during real-world deployments. That data feeds back into the Dana simulation pipeline, transforming real-world failures into simulated lessons that train the next model iteration.
                </p>
              </div>
            </section>

            {/* SECTION 7 */}
            <section id="industries-targeted" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                7. Industries Dana Targets
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Dana is designed as a horizontal platform that can power multiple industries:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-base leading-relaxed">
                <li><strong>Automotive</strong>: Mass passenger self-driving.</li>
                <li><strong>Logistics</strong>: Autonomous trucking and freight transport.</li>
                <li><strong>Industrial Robotics</strong>: Warehouse manipulation and robotic arms.</li>
                <li><strong>Heavy Industry</strong>: Mining, construction vehicles, and agriculture.</li>
                <li><strong>Defense</strong>: Intelligent surveillance and tactical drones.</li>
              </ul>
            </section>

            {/* SECTION 8 - COMPARISON TABLE */}
            <section id="digital-vs-physical" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                8. Digital AI vs Physical AI
              </h3>
              <div className="overflow-x-auto my-6 border border-border rounded-xl">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-muted uppercase text-foreground">
                    <tr>
                      <th className="p-3 border-b border-border">Attribute</th>
                      <th className="p-3 border-b border-border">Digital AI</th>
                      <th className="p-3 border-b border-border">Physical AI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-muted-foreground">
                    <tr>
                      <td className="p-3 font-bold text-foreground">Primary Action</td>
                      <td className="p-3">Creates content & code</td>
                      <td className="p-3">Controls machines & mechanics</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-foreground">Safety Criticality</td>
                      <td className="p-3">Low to Medium (Text errors)</td>
                      <td className="p-3">Extreme (Human safety & physical collision)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-foreground">Environment</td>
                      <td className="p-3">Static digital files / web</td>
                      <td className="p-3">Dynamic physical world / weather / physics</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-foreground">Core Tech Stack</td>
                      <td className="p-3">Large Language Models (LLMs)</td>
                      <td className="p-3">Vision-Language-Action Models (VLAMs) + Simulators</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 9 */}
            <section id="industry-shift" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                9. Why This Is a Big Industry Shift
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Applied Intuition's CEO, Qasar Younis, argues that Physical AI could become one of the defining technologies of this century. The company's long-term vision is highly ambitious: <strong>bringing intelligence to one billion physical machines.</strong>
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                If successful, Physical AI could reshape global supply chains, transit safety, manufacturing speed, and safety standards across mining and construction. Just as cloud computing became foundational infrastructure for SaaS, Applied Intuition believes Physical AI platforms will become the foundational infrastructure for physical automation.
              </p>
            </section>

            {/* GROWXLABS PERSPECTIVE */}
            <section id="growxlabs-perspective" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                GrowXLabs Perspective
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Dana reflects one of the biggest shifts happening in AI today. For the past few years, AI innovation has focused primarily on language, images, and software. The next frontier is intelligence embedded directly into machines.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                This transition will require more than powerful models. It demands platforms capable of managing massive sensor data, continuous high-fidelity simulation, strict safety validation, autonomous decision making, and hardware-level lifecycle management. Dana represents an early attempt to build that complete operating layer for Physical AI.
              </p>
            </section>

            {/* KEY TAKEAWAYS */}
            <section id="key-takeaways" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                Key Takeaways
              </h3>
              <ul className="space-y-2 font-mono text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-primary font-bold">►</span> Dana is Applied Intuition's new agentic platform built specifically for Physical AI.</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">►</span> It shifts focus from helping human digital tasks to operating physical hardware/robots.</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">►</span> Unifies simulation, data orchestration, AI agent validation, and fleet monitoring.</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">►</span> The platform is horizontal, targeting automotive, trucking, defense, construction, and agriculture.</li>
              </ul>
            </section>

            {/* SHARE & ACTION BAR */}
            <BlogShare title="Dana: Applied Intuition's Bold Bet on the Future of Physical AI" slug="applied-intuition-dana-physical-ai-platform" />

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
