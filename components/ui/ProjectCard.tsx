import { GrowxArrowRight } from "@/components/icons";
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
    <div className="group h-full relative">
      <div className="h-full flex flex-col bg-[#0A0A0D] border border-neutral-800/80 overflow-hidden transition-all duration-300 ease-out hover:-translate-y-2 hover:border-[#C0F0FB]/30 hover:shadow-[0_0_40px_rgba(192,240,251,0.06)]">
        
        {/* Image Preview */}
        <Link
          href={`/portfolio/${slug}`}
          className="relative aspect-[16/10] w-full overflow-hidden block bg-[#060608] border-b border-neutral-800/60"
        >
          {image ? (
            <Image
              src={image}
              alt={`${title} preview`}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          ) : (
            <div className="w-full h-full bg-neutral-900" />
          )}
        </Link>

        {/* Card Body */}
        <div className="p-6 md:p-7 flex flex-col flex-1 justify-between space-y-4">
          <div className="space-y-3">
            {displayCategory && (
              <div className="pb-3 border-b border-neutral-800/80">
                <span className="font-mono text-[10px] font-bold text-[#C0F0FB] tracking-[0.2em] uppercase block">
                  {displayCategory}
                </span>
              </div>
            )}
            <Link href={`/portfolio/${slug}`} className="block">
              <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tight leading-tight">
                {title}
              </h3>
            </Link>
            {subtitle && (
              <p className="font-mono text-xs font-medium text-neutral-400">
                {subtitle}
              </p>
            )}
            {client && (
              <p className="font-mono text-[11px] text-neutral-500">
                {client}
              </p>
            )}
            
            <p className="text-neutral-400 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          {/* Action Link */}
          <div className="pt-4 border-t border-neutral-800/60">
            <Link
              href={`/portfolio/${slug}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#C0F0FB] hover:text-white transition-colors"
            >
              <span>View Project</span>
              <GrowxArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
