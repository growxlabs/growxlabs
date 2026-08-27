"use client";

import Image from "next/image";
import { Check, Copy, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import type { EditorialAccess, EditorialArticleData, EditorialRelatedPost } from "./editorialArticleData";
import { EditorialImageFrame } from "./EditorialImageFrame";

interface EditorialArticleRendererProps {
  article: EditorialArticleData;
  children: React.ReactNode;
}

function getArticleUrl(slug: string) {
  return `https://growxlabs.tech/blog/${slug}`;
}

function EditorialArticleUtilityBar({ article }: { article: EditorialArticleData }) {
  const [copied, setCopied] = useState(false);
  const url = getArticleUrl(article.slug);
  const prompt = `Read and discuss this GrowxLabs article: “${article.title}” ${url}`;
  const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="editorial-utility-bar" aria-label="Article utilities">
      <div className="editorial-utility-group">
        <span className="editorial-utility-label">Share</span>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="editorial-utility-link"
        >
          X <ArrowUpRight aria-hidden="true" />
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="editorial-utility-link"
        >
          LinkedIn <ArrowUpRight aria-hidden="true" />
        </a>
        <button type="button" onClick={copyLink} className="editorial-utility-link">
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <div className="editorial-utility-group editorial-ai-links">
        <span className="editorial-utility-label">Read with AI</span>
        <a href={chatGptUrl} target="_blank" rel="noopener noreferrer" className="editorial-utility-link">
          ChatGPT <ArrowUpRight aria-hidden="true" />
        </a>
        <a href={claudeUrl} target="_blank" rel="noopener noreferrer" className="editorial-utility-link">
          Claude <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

function EditorialSubscriptionGate({ position }: { position?: string }) {
  return (
    <section className="editorial-subscription-gate" aria-label="Subscriber article">
      <p className="editorial-kicker">Continue reading GrowxLabs Insights</p>
      <h2>Unlock the full analysis.</h2>
      <p>Subscribe for the remaining research, engineering perspective, and useful context.</p>
      {position && <span className="editorial-gate-position">Gate configured after: {position}</span>}
      <div className="editorial-gate-actions">
        <a href="/signup">Subscribe</a>
        <a href="/login">Sign in</a>
      </div>
    </section>
  );
}

function EditorialNewsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="editorial-newsletter" aria-label="GrowxLabs Insights newsletter">
      <div>
        <p className="editorial-kicker">GrowxLabs Insights</p>
        <h2>Research, engineering, and technology worth reading.</h2>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!email.trim()) return;
          setSubmitted(true);
        }}
        className="editorial-newsletter-form"
      >
        <label className="sr-only" htmlFor="editorial-newsletter-email">Email address</label>
        <input
          id="editorial-newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
        />
        <button type="submit">{submitted ? "Subscribed" : "Subscribe"}</button>
      </form>
    </section>
  );
}

function EditorialRelatedStories({ posts }: { posts: EditorialRelatedPost[] }) {
  return (
    <section className="editorial-related" aria-labelledby="editorial-related-title">
      <div className="editorial-section-heading">
        <p className="editorial-kicker">Continue reading</p>
        <h2 id="editorial-related-title">Related stories</h2>
      </div>
      <div className="editorial-related-grid">
        {posts.map((post) => (
          <a key={post.slug} href={`/blog/${post.slug}`} className="editorial-related-card">
            <EditorialImageFrame>
              <Image src={post.image} alt={post.alt} fill sizes="(max-width: 767px) 100vw, 33vw" className="editorial-hero-media" />
            </EditorialImageFrame>
            <div className="editorial-related-meta">
              <span>{post.category}</span>
              <time>{post.date}</time>
            </div>
            <h3>{post.title}</h3>
          </a>
        ))}
      </div>
    </section>
  );
}

export function EditorialArticleRenderer({ article, children }: EditorialArticleRendererProps) {
  const access: EditorialAccess = article.access;

  return (
    <div
      className="editorial-route-shell"
      data-theme={article.theme}
      data-access={access}
      data-subscription-gate-after={article.subscriptionGateAfter || undefined}
    >
      <div className="editorial-article-system">
        <figure className="editorial-hero-artwork">
          <EditorialImageFrame>
            <Image
              src={article.heroImage}
              alt={article.heroAlt}
              fill
              priority
              sizes="(max-width: 767px) 100vw, (max-width: 1320px) 94vw, 1320px"
              className="editorial-hero-media"
            />
          </EditorialImageFrame>
        </figure>

        <header className="editorial-article-header">
          <p className="editorial-category">{article.category}</p>
          <h1>{article.title}</h1>
          <p className="editorial-deck">{article.deck}</p>
          <div className="editorial-metadata" aria-label="Article metadata">
            <time>{article.publishedAt}</time>
            {article.updatedAt && <time>Updated {article.updatedAt}</time>}
            <span>{article.readTime}</span>
            <span>By {article.author}</span>
          </div>
        </header>

        <EditorialArticleUtilityBar article={article} />

        <div className="editorial-article-body">
          <div className="editorial-legacy-content">{children}</div>
          {access === "subscriber" && <EditorialSubscriptionGate position={article.subscriptionGateAfter} />}
        </div>

        <EditorialRelatedStories posts={article.relatedPosts} />
        <EditorialNewsletter />
      </div>
    </div>
  );
}

export { EditorialArticleUtilityBar, EditorialSubscriptionGate };
