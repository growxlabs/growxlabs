import LegacyBlogCollection from "@/components/marketing/LegacyBlogCollection";
import { BlogArchiveView } from "@/components/marketing/BlogArchiveView";
import { JournalPostPreview } from "@/components/marketing/JournalPostPreview";
export const metadata = {
  title: "Blog — GrowxLabs",
  description: "Product news and releases from GrowxLabs.",
  alternates: { canonical: "https://growxlabs.tech/blog" },
};
export default function BlogPage() {
  return <BlogArchiveView archive={<LegacyBlogCollection />}>
    <section className="new-blog-grid" aria-label="Latest posts">
      <JournalPostPreview post={{href:"/blog/a-new-chapter",title:"Product news and releases on the GrowxLabs blog",date:"2026-10-22",dateLabel:"Oct 22, 2026",readTime:"1 min read"}} />
    </section>
  </BlogArchiveView>;
}
