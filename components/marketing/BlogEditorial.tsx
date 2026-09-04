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
  // Suppressed for clean Substack newsletter reading flow
  return null;
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
  // Suppressed for clean Substack newsletter reading flow
  return null;
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
  // Suppressed for clean Substack newsletter reading flow
  return null;
}

/* ═══════════════════════════════════════════════════
   [NEW] NEWSLETTER FORWARD BANNER
   Elegant italic text banner separated by a bottom border.
   ═══════════════════════════════════════════════════ */
export function NewsletterForwardBanner() {
  // Suppressed for clean Substack newsletter reading flow
  return null;
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
  // Suppressed for clean Substack newsletter reading flow
  return null;
}
