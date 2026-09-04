"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Heart, MessageSquare, Share2 } from "@/components/icons";
import type { EditorialArticleData, EditorialRelatedPost } from "./editorialArticleData";

interface EditorialArticleRendererProps {
  article: EditorialArticleData;
  children: React.ReactNode;
}

function getArticleUrl(slug: string) {
  return `https://growxlabs.tech/blog/${slug}`;
}

/* ─────────────────────────────────────────────────────────────
   Substack-Style Interactive Action Bar (Like, Comment, Restack, Share)
   ───────────────────────────────────────────────────────────── */
function NewsletterActionBar({
  article,
  initialLikes = 142,
  commentCount = 28,
}: {
  article: EditorialArticleData;
  initialLikes?: number;
  commentCount?: number;
}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [copied, setCopied] = useState(false);
  const [restacked, setRestacked] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikes((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikes((prev) => prev + 1);
    }
  };

  const handleShare = async () => {
    const url = getArticleUrl(article.slug);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      setCopied(false);
    }
  };

  const handleRestack = () => {
    setRestacked((prev) => !prev);
  };

  const scrollToComments = () => {
    const el = document.getElementById("newsletter-comments-anchor");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="newsletter-action-bar" aria-label="Article actions">
      <div className="newsletter-action-group">
        <button
          type="button"
          onClick={handleLike}
          className={`newsletter-action-btn ${liked ? "is-liked" : ""}`}
          aria-label={liked ? "Unlike article" : "Like article"}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-neutral-600"}`}
          />
          <span className="newsletter-action-count">{likes}</span>
        </button>

        <button
          type="button"
          onClick={scrollToComments}
          className="newsletter-action-btn"
          aria-label="View comments"
        >
          <MessageSquare className="w-4 h-4 text-neutral-600" />
          <span className="newsletter-action-count">{commentCount}</span>
        </button>

        <button
          type="button"
          onClick={handleRestack}
          className={`newsletter-action-btn ${restacked ? "is-restacked text-emerald-700" : ""}`}
          aria-label="Restack article"
          title="Restack"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m17 2 4 4-4 4" />
            <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
            <path d="m7 22-4-4 4-4" />
            <path d="M21 13v1a4 4 0 0 1-4 4H3" />
          </svg>
          <span className="newsletter-action-count hidden sm:inline">Restack</span>
        </button>
      </div>

      <div className="newsletter-action-group">
        <button
          type="button"
          onClick={handleShare}
          className="newsletter-action-btn"
          aria-label="Share article"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-neutral-600" />}
          <span className="newsletter-action-count">{copied ? "Copied!" : "Share"}</span>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Substack Byline (Avatar, Author Name, Meta, [Subscribe] Pill)
   ───────────────────────────────────────────────────────────── */
function NewsletterByline({ article }: { article: EditorialArticleData }) {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="newsletter-byline">
      <div className="newsletter-byline-author">
        <div className="newsletter-byline-avatar">GX</div>
        <div className="newsletter-byline-details">
          <div className="newsletter-byline-name-row">
            <span className="newsletter-byline-name">Sai Varshith Pujala</span>
            <span className="newsletter-byline-handle">· GrowxLabs</span>
          </div>
          <div className="newsletter-byline-meta">
            <time dateTime={article.publishedAt}>{article.publishedAt}</time>
            <span className="newsletter-meta-dot">·</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setSubscribed((prev) => !prev)}
        className={`newsletter-subscribe-pill ${subscribed ? "is-subscribed" : ""}`}
      >
        {subscribed ? "Subscribed ✓" : "Subscribe"}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Mid-Article Newsletter Callout Box (Clean Substack Style)
   ───────────────────────────────────────────────────────────── */
function NewsletterMidrollBox() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="newsletter-midroll-card" aria-label="Subscribe to GrowxLabs Dispatch">
      <span className="newsletter-midroll-kicker">GROWX LABS DISPATCH</span>
      <h3>Enjoying this edition?</h3>
      <p>
        Get the next technical deep dive delivered directly to your inbox. No spam, just high-signal engineering.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!email.trim()) return;
          setSubmitted(true);
        }}
        className="newsletter-midroll-form"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email..."
          aria-label="Your email"
        />
        <button type="submit" disabled={submitted}>
          {submitted ? "Subscribed ✓" : "Subscribe"}
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Authentic Substack Author Card (Clean, Human, Zero Jargon)
   ───────────────────────────────────────────────────────────── */
function NewsletterAuthorBio() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="newsletter-author-bio" id="newsletter-comments-anchor">
      <div className="newsletter-author-bio-avatar">GX</div>
      <div className="newsletter-author-bio-text">
        <div className="newsletter-author-bio-title">
          <h4>Sai Varshith Pujala</h4>
          <span className="newsletter-author-bio-handle">@growxlabs</span>
        </div>
        <p className="newsletter-author-bio-desc">
          Building Growxlabs.tech. Writing about AI models, developer systems, and software engineering.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setSubscribed((prev) => !prev)}
        className={`newsletter-author-subscribe-btn ${subscribed ? "is-subscribed" : ""}`}
      >
        {subscribed ? "Subscribed ✓" : "Subscribe"}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Related Newsletter Stories (Clean Minimal Cards)
   ───────────────────────────────────────────────────────────── */
function NewsletterRelatedStories({ posts }: { posts?: EditorialRelatedPost[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="newsletter-related-section" aria-label="More from GrowxLabs">
      <div className="newsletter-related-heading">
        <span className="newsletter-masthead-tag">MORE EDITIONS</span>
        <h3>Read next in the Dispatch</h3>
      </div>
      <div className="newsletter-related-grid">
        {posts.slice(0, 3).map((post) => (
          <a key={post.slug} href={`/blog/${post.slug}`} className="newsletter-related-item">
            <div className="newsletter-related-image-wrap">
              <Image
                src={post.image}
                alt={post.alt || post.title}
                fill
                sizes="(max-width: 768px) 100vw, 240px"
                className="object-cover"
              />
            </div>
            <div className="newsletter-related-content">
              <span className="newsletter-related-category">{post.category}</span>
              <h4>{post.title}</h4>
              <time>{post.date}</time>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN EDITORIAL ARTICLE RENDERER (Applies to ALL 19 Blog Posts)
   ───────────────────────────────────────────────────────────── */
export function EditorialArticleRenderer({ article, children }: EditorialArticleRendererProps) {
  return (
    <div className="editorial-route-shell" data-theme="light">
      <article className="newsletter-article-container">
        {/* 1. Publication Masthead */}
        <header className="newsletter-masthead">
          <div className="newsletter-masthead-top">
            <span className="newsletter-masthead-tag">GROWX LABS NEWSLETTER</span>
            <span className="newsletter-masthead-issue">{article.category || "TECHNOLOGY"}</span>
          </div>

          <h1 className="newsletter-title">{article.title}</h1>

          {article.deck && (
            <p className="newsletter-deck">{article.deck}</p>
          )}

          {/* 2. Substack Byline with [Subscribe] pill */}
          <NewsletterByline article={article} />

          {/* 3. Top Substack Action Bar (Like, Comment, Restack, Share) */}
          <NewsletterActionBar article={article} />
        </header>

        {/* 4. Full-Width Featured Image */}
        {article.heroImage && (
          <figure className="newsletter-hero-figure">
            <div className="newsletter-hero-image-wrap">
              <Image
                src={article.heroImage}
                alt={article.heroAlt || article.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 740px"
                className="object-cover"
              />
            </div>
            {article.heroAlt && (
              <figcaption className="newsletter-hero-caption">
                {article.heroAlt}
              </figcaption>
            )}
          </figure>
        )}

        {/* 5. Pure Story Prose (Single-column, zero metric boxes) */}
        <div className="newsletter-story-body">
          <div className="editorial-legacy-content">{children}</div>

          {/* 6. Mid-Post Newsletter Callout */}
          <NewsletterMidrollBox />
        </div>

        {/* 7. Bottom Engagement Action Bar */}
        <div className="newsletter-footer">
          <NewsletterActionBar article={article} />
          <NewsletterAuthorBio />
          <NewsletterRelatedStories posts={article.relatedPosts} />
        </div>
      </article>
    </div>
  );
}

// Backwards compatibility exports
export function EditorialArticleUtilityBar() {
  return null;
}

export function EditorialSubscriptionGate() {
  return null;
}

