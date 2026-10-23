import { ArticleLink, JournalArticle } from "@/components/marketing/JournalArticle";
import type { JournalPost } from "@/components/marketing/JournalPostPreview";

export const metadata = {
  title: "Product news and releases — GrowxLabs",
  description: "Product changes, release details, and development updates from GrowxLabs.",
  alternates: { canonical: "https://growxlabs.tech/blog/a-new-chapter" },
};
const relatedPosts: JournalPost[] = [
  { href: "/blog/cursor-origin-github-ai-code-hosting", title: "Cursor launches Origin", image: "/images/blog-cursor-origin-landscape.png", date: "2026-08-17", dateLabel: "Aug 17, 2026", readTime: "11 min read" },
  { href: "/blog/ai-coding-tools-are-reshaping-modern-software-engineering", title: "How AI coding tools are changing software development", image: "/images/blog-ai-coding-landscape-v2.png", date: "2026-05-27", dateLabel: "May 27, 2026", readTime: "5 min read" },
];
export default function ArticlePage() {
  return <JournalArticle title="Product news and releases on the GrowxLabs blog" author="Sai Varshith Pujala" date="2026-10-22" dateLabel="October 22, 2026" readTime="1 min read" relatedPosts={relatedPosts}>
    <p>The GrowxLabs blog will focus on our products: what has changed, how to use new features, and when releases are available.</p>
    <h2>Product updates</h2>
    <p>Each update will explain the change and who it helps. Where a feature needs setup, the post will include the steps to get started and any limits to be aware of.</p>
    <h2>Release details</h2>
    <p>Release posts will include the release date, the main changes, and a link to the product. If an update replaces an existing feature, we will explain what users need to do.</p>
    <ArticleLink href="/blog/ai-coding-tools-are-reshaping-modern-software-engineering">How AI coding tools are changing software development</ArticleLink>
    <h2>Development updates</h2>
    <p>We will also explain selected design and engineering decisions: the problem, the options we considered, and the result. Posts about unfinished work will state what is still being tested.</p>
  </JournalArticle>;
}
