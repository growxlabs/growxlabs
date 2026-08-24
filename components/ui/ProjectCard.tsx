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
      <div className="h-full flex flex-col bg-[#C0F0FB] text-black border border-black/15 shadow-[0_2px_4px_rgba(0,0,0,0.4),0_10px_20px_rgba(0,0,0,0.5),0_28px_56px_rgba(0,0,0,0.75),0_48px_96px_rgba(0,0,0,0.85)] transition-all duration-300 ease-out hover:-translate-y-3 hover:shadow-[0_12px_24px_rgba(0,0,0,0.5),0_24px_48px_rgba(0,0,0,0.65),0_48px_96px_rgba(0,0,0,0.85),0_72px_130px_rgba(0,0,0,0.95)] will-change-transform">
        
        {/* Clickable Image Preview (Sharp border & clean background) */}
        <Link
          href={`/portfolio/${slug}`}
          className="relative aspect-[16/10] w-full overflow-hidden block bg-black border-b border-black/15"
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
        <div className="p-6 md:p-8 flex flex-col flex-1 justify-between space-y-5">
          <div className="space-y-2">
            {displayCategory && (
              <span className="font-mono text-[11px] font-bold text-black/60 tracking-wider uppercase block">
                {displayCategory}
              </span>
            )}
            <Link href={`/portfolio/${slug}`} className="block">
              <h3 className="text-2xl md:text-[26px] font-black text-black tracking-tight leading-tight">
                {title}
              </h3>
            </Link>
            {subtitle && (
              <p className="font-mono text-xs font-bold text-black/75">
                {subtitle}
              </p>
            )}
            {client && (
              <p className="font-mono text-[11px] text-black/60">
                {client}
              </p>
            )}
            
            <p className="text-black/80 text-sm md:text-[15px] leading-relaxed pt-1 font-medium font-sans">
              {description}
            </p>
          </div>

          {/* Action Link: View Project → */}
          <div className="pt-4 border-t border-black/15">
            <Link
              href={`/portfolio/${slug}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-black hover:opacity-75 transition-opacity"
            >
              <span>View Project</span>
              <GrowxArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
