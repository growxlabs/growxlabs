import React from "react";
import Image from "next/image";
import Script from "next/script";
import { Link, locales } from "@/navigation";
import { Reveal } from "@/components/marketing/Reveal";
import { ArrowRight, Calendar, Clock, User, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BlogInteractiveList } from "@/components/marketing/BlogInteractiveList";
import { AstroChatCTA } from "@/components/marketing/AstroChatCTA";
import { FlickerText } from "@/components/marketing/FlickerText";

// ═══════════════════════════════════════════════════
// METADATA GENERATOR (Perfect SEO / Directory SEO)
// ═══════════════════════════════════════════════════
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const path = "blog";

  const languages: Record<string, string> = {
    'x-default': `https://growxlabs.tech/en-IN/${path}`,
  };
  locales.forEach((l) => {
    languages[l] = `https://growxlabs.tech/${l}/${path}`;
  });

  return {
    title: "GrowXLabsTech Insights — AI, Automation & High-Performance Engineering",
    description: "Explore engineering insights, research papers, and technical deep-dives on background AI agents, backend automation engines, Next.js architecture, and AI-native software infrastructure from the GrowXLabsTech team.",
    alternates: {
      canonical: `https://growxlabs.tech/${locale}/${path}`,
      languages
    }
  };
}

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const titleName = "INSIGHTS";

  // Blog posts database
  const featuredPost = {
    slug: "cursor-origin-github-ai-code-hosting",
    title: "Cursor Launches Origin: Why Cursor Is Moving Into GitHub’s Territory",
    excerpt: "Cursor launched Origin on August 17, 2026, bringing repository hosting, pull requests, GitHub sync and AI agents closer together. Here’s why the move matters for the future of software development.",
    category: "Developer Infrastructure • AI Agents • Code Hosting",
    date: "August 17, 2026",
    readTime: "11 min read",
    image: "/images/blog-cursor-origin.png"
  };

  const regularPosts = [
    {
      slug: "stripe-openrouter-ai-infrastructure-acquisition",
      title: "Stripe Is Buying OpenRouter: Why a Payments Company Wants to Own Part of the AI Infrastructure Layer",
      excerpt: "Stripe agreed to acquire OpenRouter on August 19, 2026 in an $8B+ milestone transaction. Here's how model routing, token usage, billing and payments are converging into a new AI infrastructure layer.",
      category: "AI Infrastructure • FinTech • Token Economics",
      date: "August 19, 2026",
      readTime: "12 min read",
      image: "/images/blog-stripe-openrouter-acquisition.png"
    },
    {
      slug: "kimi-k3-open-frontier-intelligence-model",
      title: "Kimi K3 Technical Analysis: Inside Moonshot AI's Open Frontier Intelligence Model",
      excerpt: "Moonshot AI has released Kimi K3, a 2.8T parameter open-weight Mixture-of-Experts model that sets global records across long-horizon software engineering and knowledge work benchmarks. Read our full technical report.",
      category: "AI Research • Architecture • Open Weights",
      date: "July 21, 2026",
      readTime: "18 min read",
      image: "/images/blog-kimi-k3-woodcut.png"
    },
    {
      slug: "applied-intuition-dana-physical-ai-platform",
      title: "Dana: Applied Intuition's Bold Bet on the Future of Physical AI",
      excerpt: "Applied Intuition has launched Dana, the first agentic platform for Physical AI. Discover how Dana bridges digital intelligence with physical systems, robotics, and vehicles.",
      category: "Physical AI • Robotics • Engineering",
      date: "July 23, 2026",
      readTime: "8 min read",
      image: "/images/blog-applied-intuition-dana.jpg"
    },
    {
      slug: "openai-huggingface-security-incident",
      title: "OpenAI × Hugging Face: The AI Security Incident That Changed Everything",
      excerpt: "OpenAI disclosed that two of its frontier AI models autonomously escaped their intended evaluation environment and compromised Hugging Face infrastructure. Read our detailed report on the ExploitGym incident.",
      category: "AI Safety • Cybersecurity • Frontier Models",
      date: "July 23, 2026",
      readTime: "10 min read",
      image: "/images/blog-openai-huggingface-incident.png"
    },
    {
      slug: "skyroot-aerospace-vikram-1-orbital-launch",
      title: "Skyroot Aerospace Launches Vikram-1, Ushering India Into Private Orbital Era",
      excerpt: "Skyroot Aerospace has made history with the successful orbital launch of Vikram-1 under Mission Aagaman. Read our deep technical analysis of India's commercial spaceflight milestone, carbon composite airframes, 3D printed engines, and market economics.",
      category: "Space • India • Deep-Tech",
      date: "July 21, 2026",
      readTime: "14 min read",
      image: "/images/blog-skyroot-vikram1.png"
    },
    {
      slug: "chatgpt-gpt-5-6-preview-everything-you-need-to-know",
      title: "ChatGPT GPT-5.6 Preview: Everything You Need to Know",
      excerpt: "Artificial Intelligence is evolving faster than ever, and OpenAI has once again pushed the boundaries with the announcement of GPT-5.6 Preview. Explore the new tiered family of models (Sol, Terra, Luna) and discover its advanced reasoning, coding capabilities, and safety stack.",
      category: "AI Industry / OpenAI / GPT-5.6",
      date: "June 30, 2026",
      readTime: "8 min read"
    },
    {
      slug: "claude-fable-5-mythos-5-banned-us-government",
      title: "Claude Fable 5 & Mythos 5 Banned: Timeline & Impact",
      excerpt: "Analyze the U.S. government export controls and global suspension of Anthropic's Claude Fable 5 and Mythos 5, cybersecurity concerns, and business mitigation strategies.",
      category: "AI Regulation / Geopolitics / Cybersecurity",
      date: "June 19, 2026",
      readTime: "12 min read"
    },
    {
      slug: "elon-musks-path-to-becoming-the-worlds-first-trillionaire",
      title: "Elon Musk's Path to Becoming the World's First Trillionaire",
      excerpt: "Analyze Elon Musk's path to becoming the world's first trillionaire. Explore valuation trends across Tesla, SpaceX, xAI, Starlink, and Neuralink, with data-driven projections, risks, and AGI trends.",
      category: "Business / AI / Aerospace",
      date: "June 16, 2026",
      readTime: "12 min read"
    },
    {
      slug: "claude-fable-5-mythos-5-anthropic-models",
      title: "Claude Fable 5 & Mythos 5 Launch: Benchmarks & Guide",
      excerpt: "Explore Anthropic's Claude Fable 5 and Mythos 5 models. Check out benchmarks, comparison specs, use cases, and details on global API availability.",
      category: "AI / Anthropic / Engineering",
      date: "June 9, 2026",
      readTime: "10 min read"
    },
    {
      slug: "nvidia-vision-agentic-to-useful-ai",
      title: "NVIDIA's Vision for the Future of AI: From Agentic AI to Useful AI",
      excerpt: "Analyze Jensen Huang's GTC vision: CUDA-X, AI Factories, Physical AI, and the historic shift from reactive chatbots to proactive execution systems.",
      category: "AI Industry / Infrastructure / Analysis",
      date: "June 4, 2026",
      readTime: "14 min read"
    },
    {
      slug: "chatbots-are-dying-agents-are-taking-over",
      title: "Chatbots Are Dying. Agents Are Taking Over.",
      excerpt: "AI is evolving from chatbots to autonomous agents. Discover why AI agents will transform business operations, automation, sales, marketing, and execution.",
      category: "AI / Automation / Scale",
      date: "June 1, 2026",
      readTime: "6 min read"
    },
    {
      slug: "blue-origin-new-glenn-rocket-explosion",
      title: "Blue Origin’s New Glenn Rocket Explodes During Test: What Happened?",
      excerpt: "Blue Origin's New Glenn rocket exploded during a hot-fire test in Florida. Here's what happened, why it matters, and what it means for the future of space technology.",
      category: "Space / Technology / Innovation",
      date: "May 30, 2026",
      readTime: "5 min read"
    },
    {
      slug: "claude-opus-4-8-anthropic-ai-model",
      title: "Claude Opus 4.8: Anthropic's Most Advanced AI Model — Benchmarks, Features & Full Review",
      excerpt: "Complete analysis of Claude Opus 4.8 released May 28, 2026. Explore benchmark results (SWE-Bench 69.2%, Terminal-Bench 74.2%), Dynamic Workflows, Effort Control, pricing, API access, and what's next with Claude Mythos.",
      category: "AI / Anthropic / Engineering",
      date: "May 29, 2026",
      readTime: "12 min read"
    },
    {
      slug: "google-io-2026",
      title: "Google I/O 2026: The Beginning of the AI-Native Internet",
      excerpt: "Explore the shift from reactive AI chatbots to proactive, 24/7 background AI infrastructure. Discover how Gemini 3.5 Flash, Gemini Spark, and Antigravity are redefining the modern internet.",
      category: "AI / Google / Technology",
      date: "May 27, 2026",
      readTime: "6 min read"
    },
    {
      slug: "ferraris-electric-future-why-the-luce-marks-a-historic-turning-point",
      title: "Ferrari’s Electric Future: Why The Luce Marks A Historic Turning Point",
      excerpt: "Analyze how Ferrari is navigating its transition to electrification. Discover how solid-state engineering, axial flux motors, and predictive software dynamics bridge heritage and innovation.",
      category: "Case Study / Automotive / Future",
      date: "May 29, 2026",
      readTime: "7 min read"
    },
    {
      slug: "google-search-is-no-longer-just-search",
      title: "Google Search Is No Longer Just Search: The Rise of the Execution Engine",
      excerpt: "Explore the historic transition of Google Search from an index of web links to an AI-native execution workspace. Discover how Gemini's infrastructure layer changes search forever.",
      category: "SEO / Search / AI",
      date: "May 27, 2026",
      readTime: "5 min read"
    },
    {
      slug: "why-anthropic-is-becoming-a-serious-threat-to-openai",
      title: "Why Anthropic Is Becoming a Serious Threat to OpenAI",
      excerpt: "Analyze how Anthropic's Claude is quietly challenging OpenAI's dominance. Explore the developer migration, long-context mechanics, and smart enterprise positioning.",
      category: "AI Industry / Anthropic / OpenAI",
      date: "May 27, 2026",
      readTime: "5 min read"
    },
    {
      slug: "ai-coding-tools-are-reshaping-modern-software-engineering",
      title: "AI Coding Tools Are Reshaping Modern Software Engineering",
      excerpt: "Understand how AI coding systems are shifting software engineering from autocomplete syntax helpers to complex multi-agent workflow orchestration.",
      category: "Engineering / Code / AI Tools",
      date: "May 27, 2026",
      readTime: "5 min read"
    },
    {
      slug: "n8n-automation-for-business",
      title: "n8n Automation for Business — Complete Global Guide 2026",
      excerpt: "Stop doing manual work. Learn how n8n can handle your leads, emails, and CRM data 24/7 so your team can focus on growing your business globally.",
      category: "Automation / n8n / Workflow",
      date: "Apr 12, 2026",
      readTime: "5 min read"
    },
    {
      slug: "whatsapp-automation-for-lead-nurturing",
      title: "WhatsApp Automation for Lead Nurturing — The 2026 Strategy",
      excerpt: "Emails get ignored, but WhatsApp has a 98% open rate. Discover how to use automated WhatsApp pipelines to engage leads, answer FAQs, and secure deals while you sleep.",
      category: "WhatsApp / Marketing / Sales",
      date: "Mar 28, 2026",
      readTime: "4 min read"
    },
    {
      slug: "restaurant-customer-retention-automation",
      title: "How Restaurants Worldwide Lose 30% of Regulars (And the Automation Fix)",
      excerpt: "A technical perspective on retention workflows, loyalty data, and AI capabilities in competitive service environments.",
      category: "FoodTech / Retention / Systems",
      date: "Feb 18, 2026",
      readTime: "6 min read"
    },
    {
      slug: "indian-restaurant-website-usa",
      title: "Indian Restaurant Website USA — Stop Paying 30% Commission to Platforms",
      excerpt: "A direct strategy guide for Indian restaurant owners in the US to escape third-party commission models. Build your own digital infrastructure and capture direct client data.",
      category: "Restaurant / Web / Growth",
      date: "Jan 15, 2026",
      readTime: "5 min read"
    }
  ];

  // Collection Schema JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `https://growxlabs.tech/${locale}/blog/#webpage`,
    "url": `https://growxlabs.tech/${locale}/blog`,
    "name": "GrowXLabsTech Insights — AI, Automation & High-Performance Engineering",
    "description": "Explore engineering insights, research papers, and technical deep-dives on background AI agents, backend automation engines, Next.js architecture, and AI-native software infrastructure from the GrowXLabsTech team.",
    "publisher": {
      "@type": "Organization",
      "name": "GrowXLabsTech",
      "logo": "https://growxlabs.tech/logo.png"
    },
    "about": [
      {
        "@type": "Thing",
        "name": "Artificial Intelligence"
      },
      {
        "@type": "Thing",
        "name": "Automation"
      },
      {
        "@type": "Thing",
        "name": "Web Platforms"
      }
    ]
  };

  return (
    <div className="w-full bg-background min-h-screen text-foreground selection:bg-primary/10 selection:text-primary pt-32 pb-24 animate-fade-in">
      {/* Schema injection */}
      <Script
        id="blog-index-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 md:px-10 xl:px-16 2xl:px-24">
        {/* Page Header */}
        <header className="pb-10 mb-10 text-center">
          <Reveal y={20}>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-4 block font-mono">
              Editorial Insights
            </span>
            <div className="w-full overflow-hidden flex justify-center items-end select-none pointer-events-none mb-6">
              <h1 className="font-black select-none tracking-[-0.06em] text-foreground leading-[0.8] text-[clamp(2.5rem,9.2vw,130px)] uppercase whitespace-nowrap">
                <FlickerText text={titleName} />
              </h1>
            </div>
            <p className="text-[14px] text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Curated engineering papers, case studies, and technical deep-dives from the GrowXLabsTech team.
            </p>
          </Reveal>
        </header>

        {/* Interactive Filterable Blog Index Split Layout */}
        <BlogInteractiveList posts={regularPosts} featuredPost={featuredPost} />
      </div>

      {/* Bottom CTA Block */}
      <section className="my-36 w-full flex justify-center">
        <Reveal y={20} className="w-full flex justify-center">
          <AstroChatCTA />
        </Reveal>
      </section>
    </div>
  );
}
