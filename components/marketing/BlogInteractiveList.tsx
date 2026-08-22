"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { Link } from "@/navigation";

interface BlogPost { slug: string; title: string; excerpt: string; category: string; date: string; readTime: string; image?: string; }
interface BlogInteractiveListProps { posts: BlogPost[]; featuredPost: BlogPost; }

const images: Record<string, string> = {
  "nvidia-vision-agentic-to-useful-ai": "/images/nvidia-vision-agentic-to-useful-ai.png",
  "chatbots-are-dying-agents-are-taking-over": "/images/chatbots-are-dying-agents-are-taking-over.png",
  "blue-origin-new-glenn-rocket-explosion": "/images/blue-origin-new-glenn-rocket-explosion.png",
  "claude-opus-4-8-anthropic-ai-model": "/images/claude_blog_woodcut_1780853620986.png",
  "google-io-2026": "/images/blog-google-io-2026.png",
  "ferraris-electric-future-why-the-luce-marks-a-historic-turning-point": "/images/blog-ferrari-luce.png",
  "google-search-is-no-longer-just-search": "/images/search_blog_woodcut_1780853646113.png",
  "why-anthropic-is-becoming-a-serious-threat-to-openai": "/images/anthropic_openai_woodcut_1780853674501.png",
  "ai-coding-tools-are-reshaping-modern-software-engineering": "/images/coding_blog_woodcut_1780853698423.png",
  "n8n-automation-for-business": "/images/blog-n8n-automation.png",
  "whatsapp-automation-for-lead-nurturing": "/images/blog-whatsapp-nurture.png",
  "restaurant-customer-retention-automation": "/images/blog-restaurant-retention.png",
  "indian-restaurant-website-usa": "/images/blog-restaurant-website.png",
  "claude-fable-5-mythos-5-anthropic-models": "/images/blog-claude-fable-5-mythos-5.png",
  "claude-fable-5-mythos-5-banned-us-government": "/images/blog-claude-fable-5-mythos-5-banned.png",
  "elon-musks-path-to-becoming-the-worlds-first-trillionaire": "/images/blog-elon-trillionaire.png",
  "chatgpt-gpt-5-6-preview-everything-you-need-to-know": "/images/blog-gpt56-preview.png",
  "skyroot-aerospace-vikram-1-orbital-launch": "/images/blog-skyroot-vikram1.png",
  "kimi-k3-open-frontier-intelligence-model": "/images/blog-kimi-k3-woodcut.png",
};

const getImage = (post: BlogPost) => post.image || images[post.slug] || images["nvidia-vision-agentic-to-useful-ai"];
const group = (category: string) => {
  const value = category.toLowerCase();
  if (value.includes("automation") || value.includes("whatsapp") || value.includes("n8n")) return "Automation";
  if (value.includes("engineering") || value.includes("code") || value.includes("web")) return "Engineering";
  if (value.includes("space") || value.includes("automotive") || value.includes("future") || value.includes("science")) return "Tech & Science";
  return "AI & Agents";
};

function ArticleCard({ post, priority = false, index }: { post: BlogPost; priority?: boolean; index: number }) {
  return (
    <article className={`group flex min-w-0 flex-col border-b border-white/20 pb-10 md:border-b-0 ${index >= 2 ? "md:border-t md:border-dashed md:border-white/25 md:pt-12" : ""} ${index === 2 || index === 3 ? "lg:border-t-0 lg:pt-0" : ""} ${index >= 4 ? "lg:border-t lg:border-dashed lg:border-white/25 lg:pt-16" : ""} lg:border-r lg:pr-5 last:border-r-0`}>
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[1.04/1] overflow-hidden bg-[#151515] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bdefff]">
        <Image src={getImage(post)} alt={post.title} fill priority={priority} sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 25vw" className="object-cover transition duration-500 ease-out group-hover:scale-[1.025] group-hover:brightness-110" />
      </Link>
      <div className="flex flex-1 flex-col pt-6">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">{group(post.category)}</p>
        <Link href={`/blog/${post.slug}`} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#bdefff]">
          <h3 className="font-serif text-[clamp(2rem,2.55vw,2.75rem)] font-medium leading-[1.06] tracking-[-0.035em] text-[#f5f3ee] transition-colors group-hover:text-[#bdefff]">{post.title}</h3>
        </Link>
        <p className="mt-5 line-clamp-4 font-serif text-[18px] leading-[1.45] text-white/70">{post.excerpt}</p>
        <div className="mt-auto flex items-center gap-3 pt-7 text-[11px] font-semibold uppercase tracking-[0.04em] text-white/70">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#bdefff] text-[9px] font-black text-black">GX</span>
          <span>GrowXLabs Team</span><span className="text-white/30">·</span><span className="text-white/45">{post.readTime}</span>
        </div>
      </div>
    </article>
  );
}

function FeaturedEdition({ lead, sideStories, recentStories }: { lead: BlogPost; sideStories: BlogPost[]; recentStories: BlogPost[] }) {
  return (
    <section aria-labelledby="featured-edition" className="border-b border-white/20 py-8 md:py-10">
      <h2 id="featured-edition" className="sr-only">Featured edition</h2>
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-0">
        <div className="order-2 space-y-7 lg:order-1 lg:col-span-3 lg:border-r lg:border-dashed lg:border-white/25 lg:pr-5">
          {sideStories.map((post) => (
            <article key={post.slug} className="border-b border-dashed border-white/25 pb-7 last:border-b-0">
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="relative aspect-[1.72/1] overflow-hidden bg-[#151515]"><Image src={getImage(post)} alt={post.title} fill sizes="(max-width: 1023px) 100vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" /></div>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/60">{post.date} · {group(post.category)}</p>
                <h3 className="mt-3 font-serif text-[clamp(1.65rem,2vw,2.2rem)] leading-[1.08] tracking-[-0.025em] text-[#f5f3ee] transition-colors group-hover:text-[#bdefff]">{post.title}</h3>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.04em] text-white/70">GrowXLabs Team</p>
              </Link>
            </article>
          ))}
        </div>

        <article className="group order-1 lg:order-2 lg:col-span-6 lg:border-r lg:border-dashed lg:border-white/25 lg:px-5">
          <Link href={`/blog/${lead.slug}`} className="block">
            <div className="relative aspect-[1.3/1] overflow-hidden bg-[#151515]"><Image src={getImage(lead)} alt={lead.title} fill priority sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" /></div>
            <div className="pt-5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-white/65">{lead.date} · Featured analysis</p>
              <h3 className="mt-4 font-serif text-[clamp(2.7rem,3.5vw,4rem)] font-medium leading-[0.98] tracking-[-0.04em] text-[#f5f3ee] transition-colors group-hover:text-[#bdefff]">{lead.title}</h3>
              <p className="mx-auto mt-5 max-w-3xl line-clamp-2 font-serif text-xl leading-[1.4] text-white/70">{lead.excerpt}</p>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.05em] text-white/75">GrowXLabs Team · {lead.readTime}</p>
            </div>
          </Link>
        </article>

        <aside className="order-3 lg:col-span-3 lg:pl-5" aria-label="Recent essays">
          <div className="flex items-center justify-between border-b border-white/20 pb-4"><h3 className="blog-ui-heading text-[20px] font-bold uppercase tracking-[-0.03em]">Recent essays</h3><ArrowRight className="h-5 w-5" /></div>
          <div>
            {recentStories.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group grid grid-cols-[88px_1fr] gap-4 border-b border-dashed border-white/25 py-5">
                <div className="relative aspect-square overflow-hidden bg-[#151515]"><Image src={getImage(post)} alt="" fill sizes="88px" className="object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                <div className="min-w-0"><h4 className="font-serif text-[22px] leading-[1.08] tracking-[-0.02em] text-[#f5f3ee] transition-colors group-hover:text-[#bdefff]">{post.title}</h4><p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.05em] text-white/65">GrowXLabs Team</p></div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

const growxProducts = [
  { name: "ResumeForgeAI", description: "Create ATS-ready resumes, practice interviews and manage your career in one workspace.", image: "/portfolio/resumeforgeai-card.png", href: "https://resumeforgeai.in", tone: "bg-[#3b2719]", accent: "text-[#ffd7ac]" },
  { name: "Pipper", description: "Run Codex, Claude Code and OpenCode together in one local developer workspace.", image: "/portfolio/pipper.png", href: "https://pipper.dev", tone: "bg-[#173643]", accent: "text-[#bdefff]" },
  { name: "RecruitAI", description: "Screen applicants, run assessments and move qualified candidates through hiring faster.", image: "/portfolio/resumeforgeai.png", href: "https://recruitaitech.in", tone: "bg-[#313131]", accent: "text-[#e8e8e8]" },
  { name: "3rdMind", description: "Coordinate strategy and execution with a digital C-suite built for founders.", image: "/portfolio/3rdmind.png", href: "https://3rdmind.growxlabs.tech", tone: "bg-[#0a2825]", accent: "text-[#a9f5de]" },
];

function ProductStudio() {
  return (
    <section aria-labelledby="built-by-growxlabs" className="scroll-mt-28 pt-16 md:pt-20">
      <div className="flex items-end justify-between gap-6 border-y border-dashed border-white/25 py-8">
        <div><h2 id="built-by-growxlabs" className="blog-ui-heading scroll-mt-28 text-[26px] font-bold uppercase tracking-[-0.03em] text-white md:text-[30px]">Built by GrowXLabs</h2><p className="mt-1 text-lg text-white/75 md:text-[22px]">Explore our AI-native products.</p></div>
        <ArrowRight className="hidden h-7 w-7 shrink-0 text-white/80 sm:block" aria-hidden="true" />
      </div>
      <div className="grid gap-5 pt-8 md:grid-cols-2 lg:grid-cols-4">
        {growxProducts.map((product) => (
          <article key={product.name} className={`group flex flex-col overflow-hidden rounded-[14px] p-3 ${product.tone}`}>
            <a href={product.href} target="_blank" rel="noreferrer" className="relative block aspect-[1.34/1] overflow-hidden rounded-[8px] bg-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bdefff]">
              <Image src={product.image} alt={`${product.name} product interface`} fill sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 25vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.025]" />
            </a>
            <div className="flex min-h-[220px] flex-1 flex-col px-1 pb-2 pt-5 md:px-0 md:pb-1">
              <h3 className={`blog-ui-heading text-[30px] font-bold leading-none tracking-[-0.035em] ${product.accent}`}>{product.name}</h3>
              <p className="mt-3 text-[17px] leading-[1.35] text-white/80">{product.description}</p>
              <div className="mt-auto pt-6"><a href={product.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-[15px] font-bold text-black transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Try it <ArrowRight className="ml-2 h-4 w-4" /></a></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function GrowXLabsStudioBanner() {
  return (
    <section aria-labelledby="growxlabs-studio-banner" className="pt-16 md:pt-20">
      <a
        href="#built-by-growxlabs"
        className="group block overflow-hidden bg-[#bdefff] text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bdefff]"
      >
        <div className="px-6 pb-0 pt-12 text-center sm:px-10 md:pt-16 lg:px-16 lg:pt-20">
          <p className="blog-ui-heading text-[13px] font-bold uppercase tracking-[0.18em] text-black/55">GrowXLabs product studio</p>
          <h2 id="growxlabs-studio-banner" className="mx-auto mt-5 max-w-5xl font-serif text-[clamp(2.7rem,5.2vw,5.6rem)] font-medium leading-[0.98] tracking-[-0.045em]">
            One studio. Four AI-native products built for real work.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-[1.45] text-black/65 md:text-[21px]">
            Build your career, ship software, hire stronger teams and run your company with products made by GrowXLabs.
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-[1180px] items-end justify-center overflow-hidden px-4 sm:mt-14 sm:px-8 lg:mt-16">
          {growxProducts.map((product, index) => (
            <div
              key={product.name}
              className={`relative aspect-square w-[28%] max-w-[280px] shrink-0 overflow-hidden rounded-t-[28px] border-[5px] border-[#bdefff] bg-black shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition-transform duration-500 group-hover:-translate-y-2 sm:rounded-t-[38px] ${index > 0 ? "-ml-[5%]" : ""} ${index % 2 === 0 ? "translate-y-5" : ""}`}
              style={{ zIndex: index + 1 }}
            >
              <Image src={product.image} alt={`${product.name} interface`} fill sizes="(max-width: 767px) 28vw, 280px" className="object-cover object-top" />
              <div className="absolute inset-x-0 bottom-0 bg-black/85 px-2 py-3 text-center sm:px-4 sm:py-4">
                <span className="blog-ui-heading text-[10px] font-bold text-white sm:text-sm md:text-base">{product.name}</span>
              </div>
            </div>
          ))}
        </div>
      </a>
      <div className="flex items-center justify-between border-b border-dashed border-white/25 py-7">
        <div><h3 className="blog-ui-heading text-[22px] font-bold uppercase tracking-[-0.025em] text-white md:text-[27px]">Built to put AI to work</h3><p className="mt-1 text-base text-white/70 md:text-xl">Explore the products coming out of the GrowXLabs studio.</p></div>
        <ArrowRight className="hidden h-7 w-7 shrink-0 text-white/80 sm:block" aria-hidden="true" />
      </div>
    </section>
  );
}

export function BlogInteractiveList({ posts, featuredPost }: BlogInteractiveListProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const categories = ["All", "AI & Agents", "Automation", "Engineering", "Tech & Science"];
  const allPosts = useMemo(() => [featuredPost, ...posts], [featuredPost, posts]);
  const filtered = useMemo(() => allPosts.filter((post) => (activeCategory === "All" || group(post.category) === activeCategory) && (!query || `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(query.toLowerCase()))), [activeCategory, query, allPosts]);
  const isDefaultView = activeCategory === "All" && !query;
  const displayPosts = isDefaultView ? posts.slice(6) : filtered;
  const editorialRows = [
    { title: "Frontier Intelligence", subtitle: "Models, markets and the race to shape advanced AI.", posts: displayPosts.slice(0, 4) },
    { title: "Technology in Motion", subtitle: "Signals from agents, aerospace and the AI-native internet.", posts: displayPosts.slice(4, 8) },
    { title: "The Future of Engineering", subtitle: "How software, search and intelligent systems are being rebuilt.", posts: displayPosts.slice(8, 12) },
    { title: "Automation for Growth", subtitle: "Practical systems that turn attention into durable business value.", posts: displayPosts.slice(12, 16) },
  ];

  return (
    <div>
      <div className="sticky top-20 z-30 -mx-6 border-y border-white/15 bg-black/95 px-6 backdrop-blur-md md:-mx-10 md:px-10 xl:-mx-20 xl:px-20">
        <div className="mx-auto flex min-h-16 max-w-[1600px] items-center justify-between gap-5">
          <nav aria-label="Article topics" className="flex min-w-0 items-center gap-6 overflow-x-auto py-5 [scrollbar-width:none]">
            {categories.map((category) => <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`shrink-0 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors ${activeCategory === category ? "text-[#bdefff]" : "text-white/50 hover:text-white"}`}>{category}</button>)}
          </nav>
          <button type="button" onClick={() => setSearchOpen((value) => !value)} aria-label="Search articles" aria-expanded={searchOpen} className="shrink-0 p-2 text-white/75 hover:text-white">{searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}</button>
        </div>
        {searchOpen && <div className="mx-auto max-w-[1600px] border-t border-white/10 py-4"><label className="flex items-center gap-3"><Search className="h-4 w-4 text-white/40" /><span className="sr-only">Search insights</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search GrowXLabs insights…" className="w-full bg-transparent py-2 text-base text-white outline-none placeholder:text-white/35" /></label></div>}
      </div>

      {isDefaultView && <FeaturedEdition lead={featuredPost} sideStories={posts.slice(0, 2)} recentStories={posts.slice(2, 6)} />}

      {isDefaultView ? (
        <div aria-label="GrowXLabs editorial collections">
          {editorialRows.filter((row) => row.posts.length > 0).map((row, rowIndex) => (
            <div key={row.title}>
              <section aria-labelledby={`editorial-row-${rowIndex}`} className="pt-16 md:pt-20">
                <div className="flex items-end justify-between gap-6 border-b border-dashed border-white/25 pb-8">
                  <div><h2 id={`editorial-row-${rowIndex}`} className="blog-ui-heading text-[26px] font-bold uppercase tracking-[-0.03em] text-white md:text-[30px]">{row.title}</h2><p className="mt-1 text-lg text-white/75 md:text-[22px]">{row.subtitle}</p></div>
                  <ArrowRight className="hidden h-7 w-7 shrink-0 text-white/80 sm:block" aria-hidden="true" />
                </div>
                <div className="grid gap-x-5 gap-y-12 pt-8 md:grid-cols-2 lg:grid-cols-4">{row.posts.map((post, index) => <ArticleCard key={post.slug} post={post} priority={rowIndex === 0} index={index} />)}</div>
              </section>
              {rowIndex === 1 && <><GrowXLabsStudioBanner /><ProductStudio /></>}
            </div>
          ))}
        </div>
      ) : (
        <section aria-labelledby="filtered-insights" className="pt-14 md:pt-20">
          <div className="flex items-end justify-between gap-6 border-b border-dashed border-white/25 pb-8"><div><h2 id="filtered-insights" className="blog-ui-heading text-[26px] font-bold uppercase tracking-[-0.03em] text-white md:text-[30px]">Filtered Insights</h2><p className="mt-1 text-lg text-white/75 md:text-[22px]">Stories selected from the GrowXLabs archive.</p></div><ArrowRight className="hidden h-7 w-7 text-white/80 sm:block" /></div>
          {displayPosts.length > 0 ? <div className="grid gap-x-5 gap-y-12 pt-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-y-16">{displayPosts.map((post, index) => <ArticleCard key={post.slug} post={post} priority={index < 4} index={index} />)}</div> : <div className="border-b border-white/20 py-24 text-center"><p className="font-serif text-3xl text-white">No stories match that search.</p><button type="button" onClick={() => { setQuery(""); setActiveCategory("All"); }} className="mt-5 text-sm font-semibold text-[#bdefff] underline underline-offset-4">Show all stories</button></div>}
        </section>
      )}
    </div>
  );
}
