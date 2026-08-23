"use client";

import React, { useState } from "react";
import { Link } from "@/navigation";
import { Lightbulb, TrendingUp, AlertTriangle, Zap, ArrowRight, Play, Headphones, Link2, Share2, Heart, MessageSquare, ArrowUpRight, Check } from "lucide-react";

/* ═══════════════════════════════════════════════════
   INSIGHT CALLOUT
   A subtle highlighted block for key observations.
   Variants: insight | trend | warning | impact
   ═══════════════════════════════════════════════════ */
interface InsightCalloutProps {
  children: React.ReactNode;
  variant?: "insight" | "trend" | "warning" | "impact";
  label?: string;
}

const calloutConfig = {
  insight: { icon: Lightbulb, color: "#355CFF", bg: "rgba(53,92,255,0.04)", border: "rgba(53,92,255,0.18)", defaultLabel: "Key Insight" },
  trend: { icon: TrendingUp, color: "#059669", bg: "rgba(5,150,105,0.04)", border: "rgba(5,150,105,0.18)", defaultLabel: "Industry Trend" },
  warning: { icon: AlertTriangle, color: "#D97706", bg: "rgba(217,119,6,0.04)", border: "rgba(217,119,6,0.18)", defaultLabel: "Critical Note" },
  impact: { icon: Zap, color: "#7C3AED", bg: "rgba(124,58,237,0.04)", border: "rgba(124,58,237,0.18)", defaultLabel: "Business Impact" },
};

export function InsightCallout({ children, variant = "insight", label }: InsightCalloutProps) {
  const { icon: Icon, color, bg, border, defaultLabel } = calloutConfig[variant];
  return (
    <div
      className="my-10 rounded-lg p-6 md:p-8"
      style={{ backgroundColor: bg, borderLeft: `3px solid ${border}` }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <Icon className="w-4 h-4 shrink-0" style={{ color }} />
        <span
          className="text-[11px] font-mono font-bold tracking-[0.15em] uppercase"
          style={{ color }}
        >
          {label || defaultLabel}
        </span>
      </div>
      <div className="text-[15px] md:text-[16px] leading-[1.8] text-foreground/90 space-y-3">
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   WHY THIS MATTERS
   Dark strategic analysis block for editorial depth.
   ═══════════════════════════════════════════════════ */
export function WhyThisMatters({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-12 relative">
      <div className="bg-[#1A1A1A] text-white rounded-xl p-8 md:p-10">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#355CFF]" />
          <span className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-[#355CFF]">
            Why This Matters
          </span>
        </div>
        <div className="text-[16px] md:text-[17px] leading-[1.85] text-white/85 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   EDITORIAL DIVIDER
   Refined visual separator between editorial sections.
   ═══════════════════════════════════════════════════ */
export function EditorialDivider({ label }: { label?: string }) {
  if (label) {
    return (
      <div className="my-16 flex items-center gap-4">
        <div className="flex-1 h-px bg-[#E5E2DC]" />
        <span className="text-[10px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase shrink-0">
          {label}
        </span>
        <div className="flex-1 h-px bg-[#E5E2DC]" />
      </div>
    );
  }
  return (
    <div className="my-16 flex justify-center">
      <div className="flex gap-2 items-center">
        <div className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
        <div className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
        <div className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STAT BLOCK
   Minimal data visualization for key metrics.
   ═══════════════════════════════════════════════════ */
interface StatBlockProps {
  stats: { value: string; label: string; sublabel?: string }[];
}

export function StatBlock({ stats }: StatBlockProps) {
  return (
    <div className="my-10 grid grid-cols-2 md:grid-cols-3 gap-px bg-[#E5E2DC] rounded-lg overflow-hidden border border-border">
      {stats.map((stat, i) => (
        <div key={i} className="bg-background p-6 text-center">
          <div className="text-[28px] md:text-[32px] font-black tracking-tight text-foreground leading-none mb-2">
            {stat.value}
          </div>
          <div className="text-[12px] font-mono tracking-[0.1em] text-muted-foreground uppercase">
            {stat.label}
          </div>
          {stat.sublabel && (
            <div className="text-[11px] text-[#9CA3AF] mt-1">{stat.sublabel}</div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   QUOTE BLOCK
   Premium editorial pull-quote with attribution.
   ═══════════════════════════════════════════════════ */
export function QuoteBlock({ quote, attribution, role }: { quote: string; attribution?: string; role?: string }) {
  return (
    <figure className="my-12">
      <blockquote className="relative pl-6 md:pl-8">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#355CFF] rounded-full" />
        <p className="text-[20px] md:text-[22px] font-serif italic leading-[1.6] text-foreground tracking-[-0.01em]">
          &ldquo;{quote}&rdquo;
        </p>
      </blockquote>
      {attribution && (
        <figcaption className="mt-4 pl-6 md:pl-8">
          <span className="text-[13px] font-semibold text-foreground">{attribution}</span>
          {role && <span className="text-[12px] text-muted-foreground ml-1.5">— {role}</span>}
        </figcaption>
      )}
    </figure>
  );
}

/* ═══════════════════════════════════════════════════
   TIMELINE BLOCK
   Minimal editorial timeline for chronological data.
   ═══════════════════════════════════════════════════ */
interface TimelineEntry {
  date: string;
  title: string;
  description?: string;
}

export function TimelineBlock({ entries, label }: { entries: TimelineEntry[]; label?: string }) {
  return (
    <div className="my-12">
      {label && (
        <span className="text-[11px] font-mono font-bold tracking-[0.15em] text-[#355CFF] uppercase mb-6 block">
          {label}
        </span>
      )}
      <div className="relative pl-6 border-l-2 border-border space-y-8">
        {entries.map((entry, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-card border-2 border-[#355CFF]" />
            <span className="text-[11px] font-mono tracking-[0.1em] text-[#9CA3AF] uppercase block mb-1">
              {entry.date}
            </span>
            <h4 className="text-[16px] font-bold text-foreground leading-snug mb-1">
              {entry.title}
            </h4>
            {entry.description && (
              <p className="text-[14px] text-muted-foreground leading-relaxed">{entry.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   RELATED ARTICLES GRID
   Premium editorial article cards with category tags.
   ═══════════════════════════════════════════════════ */
interface RelatedArticle {
  title: string;
  href: string;
  date: string;
  readTime: string;
  category?: string;
}

export function RelatedArticlesGrid({ articles }: { articles: RelatedArticle[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {articles.map((article, index) => (
        <Link
          key={index}
          href={article.href}
          className="group flex flex-col justify-between p-6 bg-card border border-border rounded-xl hover:border-[#355CFF]/25 transition-all duration-300 min-h-[190px]"
        >
          <div className="space-y-3">
            {article.category && (
              <span className="inline-block text-[10px] font-mono font-bold tracking-[0.15em] text-[#355CFF] uppercase bg-[#355CFF]/5 px-2 py-0.5 rounded">
                {article.category}
              </span>
            )}
            <h5 className="font-bold text-foreground text-[15px] leading-snug group-hover:text-[#355CFF] transition-colors line-clamp-3">
              {article.title}
            </h5>
          </div>
          <div className="pt-5 flex items-center justify-between">
            <div className="flex gap-3 items-center font-mono text-[9px] tracking-wider text-[#9CA3AF] uppercase">
              <span>{article.date}</span>
              <span>·</span>
              <span>{article.readTime}</span>
            </div>
            <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center group-hover:bg-[#355CFF] group-hover:border-[#355CFF] group-hover:text-white transition-all duration-300 text-[#9CA3AF]">
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   [NEW] AUTHOR PROFILE SIDEBAR
   Renders the author profile inside the left column of the article.
   ═══════════════════════════════════════════════════ */
interface AuthorProfileSidebarProps {
  authorName: string;
  authorRole?: string;
  authorAvatar?: string;
  category: string;
  bio: string;
}

export function AuthorProfileSidebar({
  authorName,
  authorRole = "Contributor",
  authorAvatar = "/images/avatars/default.png",
  category,
  bio,
}: AuthorProfileSidebarProps) {
  // Use a fallback avatar image if needed, or inline SVG
  return (
    <div className="space-y-6 text-left text-foreground py-2 border-t border-border lg:border-t-0">
      <div className="flex lg:flex-col items-center lg:items-start gap-4">
        <div className="relative w-12 h-12 lg:w-16 lg:h-16 rounded-full overflow-hidden bg-[#EDEAE4] border border-border">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to stylized SVG avatar
              (e.target as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a0a0a0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;
            }}
          />
        </div>
        <div>
          <div className="text-[10px] font-mono tracking-[0.25em] text-[#9CA3AF] uppercase">
            BY {authorName.toUpperCase()}
          </div>
          <div className="text-[12px] text-muted-foreground mt-0.5">{authorRole}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-[10px] font-mono tracking-[0.25em] text-[#9CA3AF] uppercase mb-1">
            CATEGORY
          </div>
          <span className="text-[12px] font-semibold text-[#355CFF]">{category}</span>
        </div>

        <div>
          <div className="text-[10px] font-mono tracking-[0.25em] text-[#9CA3AF] uppercase mb-1.5">
            ABOUT
          </div>
          <p className="text-[13px] text-muted-foreground leading-[1.6] font-normal">
            {bio}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   [NEW] BLOG ACTION BAR
   Renders the thin horizontal lines and minimal social action row under the title.
   ═══════════════════════════════════════════════════ */
interface BlogActionBarProps {
  title: string;
  slug: string;
}

export function BlogActionBar({ title, slug }: BlogActionBarProps) {
  const [likes, setLikes] = useState(12);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://growxlabs.tech/blog/${slug}`;

  const aiPrompt = `Read this GrowxLabs article: ${shareUrl}. Help me understand the article and answer my questions about it.`;
  const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(aiPrompt)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(aiPrompt)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiAction = async (targetUrl: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(aiPrompt);
        setCopiedAi(true);
        setTimeout(() => setCopiedAi(false), 2500);
      } catch {}
    }
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikes(likes - 1);
      setHasLiked(false);
    } else {
      setLikes(likes + 1);
      setHasLiked(true);
    }
  };

  return (
    <div className="w-full border-t border-b border-neutral-800/80 py-3 my-6 flex items-center justify-between gap-4 text-xs">
      {/* Left: Read with AI */}
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary">
          Read with AI:
        </span>
        <button
          type="button"
          onClick={() => handleAiAction(chatGptUrl)}
          className="inline-flex items-center gap-1 text-neutral-400 hover:text-foreground font-mono text-xs transition-colors cursor-pointer"
          title="Read with ChatGPT"
        >
          <span>ChatGPT</span>
          <ArrowUpRight className="w-3 h-3 text-neutral-500" />
        </button>
        <span className="text-neutral-700">·</span>
        <button
          type="button"
          onClick={() => handleAiAction(claudeUrl)}
          className="inline-flex items-center gap-1 text-neutral-400 hover:text-foreground font-mono text-xs transition-colors cursor-pointer"
          title="Read with Claude"
        >
          <span>Claude</span>
          <ArrowUpRight className="w-3 h-3 text-neutral-500" />
        </button>
        {copiedAi && (
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 ml-1 animate-fade-in">
            <Check className="w-3 h-3" /> Copied
          </span>
        )}
      </div>

      {/* Right: Clean Social Share Icons */}
      <div className="flex items-center gap-3 text-neutral-400 shrink-0">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors p-1"
          title="Share on X"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>

        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors p-1"
          title="Share on LinkedIn"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
          </svg>
        </a>

        <button
          type="button"
          onClick={handleCopyLink}
          className="hover:text-foreground transition-colors p-1 cursor-pointer flex items-center gap-1"
          title="Copy Link"
        >
          {copied ? (
            <span className="text-[10px] font-mono text-emerald-400">Copied</span>
          ) : (
            <Link2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   [NEW] NEWSLETTER FORWARD BANNER
   Elegant italic text banner separated by a bottom border.
   ═══════════════════════════════════════════════════ */
export function NewsletterForwardBanner() {
  return (
    <div className="w-full border-b border-[#E5E2DC] pb-4 mb-6 text-center lg:text-left">
      <p className="text-[14px] text-muted-foreground italic leading-relaxed">
        Was this newsletter forwarded to you?{" "}
        <Link href="/register" className="text-[#355CFF] underline hover:text-[#355CFF]/90 font-medium">
          Sign up
        </Link>{" "}
        to get it in your inbox.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   [NEW] RELATED ESSAYS LIST
   Clean horizontal two-column layout for related posts.
   ═══════════════════════════════════════════════════ */
interface RelatedEssayItem {
  title: string;
  accentWord?: string; // Word to render in italics
  excerpt?: string;
  href: string;
  date: string;
  author: string;
  imageSrc: string;
}

interface RelatedEssaysListProps {
  essays: RelatedEssayItem[];
}

export function RelatedEssaysList({ essays }: RelatedEssaysListProps) {
  return (
    <div className="space-y-12">
      {essays.map((essay, index) => {
        // Find if accentWord exists in title and split it to render in italics
        let renderedTitle: React.ReactNode = essay.title;
        if (essay.accentWord && essay.title.includes(essay.accentWord)) {
          const parts = essay.title.split(essay.accentWord);
          renderedTitle = (
            <>
              {parts[0]}
              <span className="italic font-serif font-normal">{essay.accentWord}</span>
              {parts.slice(1).join(essay.accentWord)}
            </>
          );
        }

        return (
          <div key={index} className="flex flex-col sm:flex-row gap-6 items-start pb-8 border-b border-[#E5E2DC] last:border-0 last:pb-0">
            {/* Left aligned square image */}
            <div className="relative bg-[#EDEAE4] border border-border shrink-0 overflow-hidden rounded-md" style={{ width: "140px", height: "140px" }}>
              <img
                src={essay.imageSrc}
                alt={essay.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Use static fallback SVG image with woodcut stylization
                  (e.target as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23edeae4"><rect width="100" height="100"/><line x1="0" y1="0" x2="100" y2="100" stroke="%23d1d5db" stroke-width="2"/><line x1="100" y1="0" x2="0" y2="100" stroke="%23d1d5db" stroke-width="2"/></svg>`;
                }}
              />
            </div>

            {/* Right details */}
            <div className="flex-1 space-y-2.5 text-left">
              <Link href={essay.href} className="group block">
                <h4 className="text-[20px] md:text-[22px] font-black leading-snug text-foreground group-hover:text-[#355CFF] transition-colors font-serif tracking-tight">
                  {renderedTitle}
                </h4>
              </Link>
              {essay.excerpt && (
                <p className="text-[14px] text-muted-foreground leading-relaxed line-clamp-2">
                  {essay.excerpt}
                </p>
              )}
              <div className="flex items-center gap-3 font-mono text-[10px] tracking-wider text-[#9CA3AF] uppercase">
                <span>{essay.date}</span>
                <span>·</span>
                <span>BY {essay.author.toUpperCase()}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
