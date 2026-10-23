import { Link } from "@/navigation";
import Image from "next/image";

export interface JournalPost {
  href: string;
  title: string;
  date: string;
  dateLabel: string;
  readTime: string;
  image?: string;
}

export function JournalPostPreview({ post, heading = "h2" }: { post: JournalPost; heading?: "h2" | "h3" }) {
  const Heading = heading;
  return <article className="new-blog-entry">
    <Link href={post.href} className="new-blog-link">
      {post.image
        ? <div className="new-blog-cover"><Image src={post.image} alt="" fill sizes="(max-width: 600px) calc(100vw - 40px), 350px" /></div>
        : <div className="new-blog-cover new-blog-gradient" aria-hidden="true" />}
      <Heading className="new-blog-entry-title">{post.title}</Heading>
    </Link>
    <div className="new-blog-meta"><time dateTime={post.date}>{post.dateLabel}</time><span>{post.readTime}</span></div>
  </article>;
}
