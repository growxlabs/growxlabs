import type { ReactNode } from "react";
import { Link } from "@/navigation";
import { JournalPostPreview, type JournalPost } from "./JournalPostPreview";

export function ArticleLink({ href, children }: { href: string; children: ReactNode }) {
  return <aside className="article-inline-link"><span>Read also</span><Link href={href}>{children}<span aria-hidden="true"> ↗</span></Link></aside>;
}

/** Shared layout for new posts. Existing articles use their original renderer. */
export function JournalArticle({ title, author, date, dateLabel, readTime, relatedPosts = [], children }: {
  author: string;
  title: string; date: string; dateLabel: string; readTime: string;
  relatedPosts?: JournalPost[]; children: ReactNode;
}) {
  return <div className="new-blog"><main className="new-blog-container new-blog-reading">
    <nav aria-label="Blog navigation"><Link href="/blog">← Back to blog</Link><Link href="/blog#all-blogs">Browse articles ↗</Link></nav>
    <article>
      <header className="new-blog-article-heading">
        <h1>{title}</h1>
        <div className="article-byline">
          <p className="article-author"><span>By</span> {author}</p>
          <div className="new-blog-meta"><time dateTime={date}>{dateLabel}</time><span className="article-meta-separator" aria-hidden="true">·</span><span>{readTime}</span></div>
        </div>
      </header>
      <div className="new-blog-prose">{children}</div>
    </article>
    {relatedPosts.length > 0 && <section className="article-related" aria-labelledby="related-posts-heading">
      <h2 id="related-posts-heading">Related articles</h2>
      <div className="article-related-grid">{relatedPosts.map(post => <JournalPostPreview key={post.href} post={post} heading="h3" />)}</div>
    </section>}
  </main></div>;
}
