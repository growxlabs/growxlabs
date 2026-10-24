import { LiquidButton } from "@/components/ui/LiquidButton";
import { CaseStudy } from "@/lib/data/projects";
import Image from "next/image";
import { Link } from "@/navigation";

type ProjectCardProps = Pick<CaseStudy, "slug" | "title" | "description" | "image"> & {
  tag?: string;
  category?: string;
  subtitle?: string;
  client?: string;
};

export function ProjectCard({ slug, title, description, image, tag, category, subtitle, client }: ProjectCardProps) {
  const displayCategory = category?.startsWith("//")
    ? category
    : tag?.startsWith("//")
    ? tag
    : category
    ? `// ${category.toUpperCase()}`
    : tag
    ? `// ${tag.toUpperCase()}`
    : null;

  return (
    <article className="h-full min-w-0 flex flex-col rounded-[6px] border border-[#17252D]/10 bg-[#B5CBD6] p-4 sm:p-5 text-[#17252D]">
      <Link href={`/portfolio/${slug}`} className="block rounded-[4px] bg-[#8EAAB9] p-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#17252D]">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[3px] bg-[#0B1013]">
          {image && <Image src={image} alt={`${title} project preview`} fill className="object-cover object-top" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />}
        </div>
      </Link>
      <div className="mt-6">
        {displayCategory && <p className="mb-2 font-mono text-[10px] tracking-wider uppercase text-[#3E5B6B]">{displayCategory}</p>}
        <Link href={`/portfolio/${slug}`} className="block">
          <h3 className="font-sans text-[18px] sm:text-[20px] font-medium leading-7 tracking-[-0.015em]">{title}</h3>
        </Link>
        {subtitle && <p className="mt-1 text-sm font-sans text-[#3E5B6B]">{subtitle}</p>}
        {client && <p className="mt-1 text-xs font-sans text-[#3E5B6B]">{client}</p>}
        {description && <p className="mt-3 text-[15px] sm:text-[16px] leading-6 font-sans text-[#3E5B6B]">{description}</p>}
      </div>
      <div className="mt-auto pt-10 sm:pt-12">
        <LiquidButton href={`/portfolio/${slug}`} variant="primary" size="default">View Project</LiquidButton>
      </div>
    </article>
  );
}
