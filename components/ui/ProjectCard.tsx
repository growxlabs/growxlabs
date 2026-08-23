import { ArrowRight } from "lucide-react";
import { CaseStudy } from "@/lib/data/projects";
import Image from "next/image";
import { Link } from "@/navigation";

type ProjectCardProps = Pick<CaseStudy, "slug" | "title" | "description" | "image"> & {
  tag?: string;
  category?: string;
};

export function ProjectCard({ slug, title, description, image, tag, category }: ProjectCardProps) {
  const displayCategory = category?.startsWith("//") ? category : tag?.startsWith("//") ? tag : category ? `// ${category.toUpperCase()}` : tag ? `// ${tag.toUpperCase()}` : null;
  return (
    <div className="group h-full relative overflow-hidden">
      <div className="h-full flex flex-col bg-[#141414] border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:border-neutral-700 hover:-translate-y-1">
        
        {/* Clickable Image Preview */}
        <Link
          href={`/portfolio/${slug}`}
          className="relative aspect-[16/10] w-full overflow-hidden block bg-[#0a0a0a] border-b border-neutral-800/80 group-hover:opacity-95 transition-opacity"
        >
          {image ? (
            <Image
              src={image}
              alt={`${title} project preview`}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          ) : (
            <div className="w-full h-full bg-neutral-900" />
          )}
        </Link>

        {/* Card Body */}
        <div className="p-6 md:p-7 flex flex-col flex-1 justify-between space-y-5">
          <div className="space-y-2">
            {displayCategory && (
              <span className="font-mono text-[11px] font-bold text-primary tracking-wider uppercase block">
                {displayCategory}
              </span>
            )}
            <Link href={`/portfolio/${slug}`} className="block group-hover:text-white transition-colors">
              <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                {title}
              </h3>
            </Link>
            
            <p className="text-muted-foreground text-sm md:text-[15px] leading-relaxed pt-1">
              {description}
            </p>
          </div>

          {/* Action Link: View Project → */}
          <div className="pt-4 border-t border-neutral-800/80">
            <Link
              href={`/portfolio/${slug}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-white transition-colors group-hover:gap-2.5"
            >
              <span>View Project</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
