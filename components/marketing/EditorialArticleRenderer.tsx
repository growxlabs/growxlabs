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
   GrowxLabs Dispatch Interactive Action Bar (Like, Comment, Dispatch, Share)
   ───────────────────────────────────────────────────────────── */
function NewsletterActionBar({
  article,
  initialLikes = 142,
  initialDispatches = 39,
  commentCount = 18,
}: {
  article: EditorialArticleData;
  initialLikes?: number;
  initialDispatches?: number;
  commentCount?: number;
}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [copied, setCopied] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [dispatches, setDispatches] = useState(initialDispatches);

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

  const handleDispatch = () => {
    if (dispatched) {
      setDispatched(false);
      setDispatches((prev) => prev - 1);
    } else {
      setDispatched(true);
      setDispatches((prev) => prev + 1);
    }
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
          className={`newsletter-action-btn ${liked ? "is-liked text-red-600" : ""}`}
          aria-label={liked ? "Unlike edition" : "Like edition"}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${liked ? "fill-red-600 text-red-600" : "text-neutral-600"}`}
          />
          <span className="newsletter-action-count">{likes}</span>
        </button>

        <button
          type="button"
          onClick={scrollToComments}
          className="newsletter-action-btn"
          aria-label="View discussion"
        >
          <MessageSquare className="w-4 h-4 text-neutral-600" />
          <span className="newsletter-action-count">{commentCount}</span>
        </button>

        <button
          type="button"
          onClick={handleDispatch}
          className={`newsletter-action-btn ${dispatched ? "is-dispatched text-emerald-800 font-bold" : ""}`}
          aria-label="Dispatch edition"
          title="Dispatch"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2 11 13" />
            <path d="m22 2-7 20-4-9-9-4 20-7z" />
          </svg>
          <span className="newsletter-action-count">
            {dispatched ? "Dispatched ✓" : `Dispatch (${dispatches})`}
          </span>
        </button>
      </div>

      <div className="newsletter-action-group">
        <button
          type="button"
          onClick={handleShare}
          className="newsletter-action-btn"
          aria-label="Share edition"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-neutral-600" />}
          <span className="newsletter-action-count">{copied ? "Copied!" : "Share"}</span>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   GrowxLabs Newsletter Byline (Avatar, Author Name, Meta, [Subscribe] Pill)
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
   GrowxLabs Dispatch Subscription Gate ("Read Full Story")
   ───────────────────────────────────────────────────────────── */
function NewsletterSubscriptionGate({
  onUnlock,
}: {
  onUnlock: () => void;
}) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onUnlock();
  };

  return (
    <div className="newsletter-gate-backdrop">
      <div className="newsletter-gate-card">
        <span className="newsletter-gate-kicker">GROWXLABS DISPATCH</span>
        <h3 className="newsletter-gate-title">Read the full edition</h3>
        <p className="newsletter-gate-desc">
          Subscribe for free to unlock the complete technical analysis, code architecture, and engineering takeaways.
        </p>

        <form onSubmit={handleSubmit} className="newsletter-gate-form">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your work email..."
            className="newsletter-gate-input"
            aria-label="Email address"
          />
          <button type="submit" className="newsletter-gate-submit-btn">
            Subscribe to Continue
          </button>
        </form>

        <button
          type="button"
          onClick={onUnlock}
          className="newsletter-gate-unlock-link"
        >
          Already a subscriber? Read full edition →
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN EDITORIAL ARTICLE RENDERER (Applies to ALL 19 Blog Posts)
   ───────────────────────────────────────────────────────────── */
export function EditorialArticleRenderer({ article, children }: EditorialArticleRendererProps) {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div className="editorial-route-shell" data-theme="light">
      <article className="newsletter-article-container">
        {/* 1. Publication Masthead */}
        <header className="newsletter-masthead">
          <div className="newsletter-masthead-top">
            <span className="newsletter-masthead-tag">GROWX LABS DISPATCH</span>
            <span className="newsletter-masthead-issue">{article.category || "TECHNOLOGY"}</span>
          </div>

          <h1 className="newsletter-title">{article.title}</h1>

          {article.deck && (
            <p className="newsletter-deck">{article.deck}</p>
          )}

          {/* 2. Byline with [Subscribe] pill */}
          <NewsletterByline article={article} />
        </header>

        {/* 3. Featured Image (First image-related section) */}
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

        {/* 4. Top Action Bar: Directly below the hero image */}
        <div className="newsletter-hero-action-bar">
          <NewsletterActionBar article={article} />
        </div>

        {/* 5. Pure Story Prose with Subscription Gate */}
        <div className="newsletter-story-body">
          <div className={`newsletter-content-viewport ${!unlocked ? "is-gated" : "is-unlocked"}`}>
            <div className="editorial-legacy-content">{children}</div>

            {!unlocked && (
              <NewsletterSubscriptionGate onUnlock={() => setUnlocked(true)} />
            )}
          </div>
        </div>

        {/* 6. Bottom Action Bar */}
        <div className="newsletter-bottom-bar" id="newsletter-comments-anchor">
          <NewsletterActionBar article={article} />
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

