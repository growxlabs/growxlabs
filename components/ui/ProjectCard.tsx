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
      <div className="h-full flex flex-col bg-[#F4F8FA] text-[#17252D] border border-[#D5E2E9] rounded-2xl shadow-[0_2px_8px_rgba(23,37,45,0.04)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_8px_24px_rgba(23,37,45,0.08)] will-change-transform overflow-hidden">
        
        {/* Clickable Image Preview */}
        <div className="p-4 sm:p-5">
          <Link
            href={`/portfolio/${slug}`}
            className="relative aspect-[16/10] w-full overflow-hidden block rounded-xl bg-[#FAFCFD] border border-[#D5E2E9] shadow-sm"
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
              <div className="w-full h-full bg-[#E5EFF4]" />
            )}
          </Link>
        </div>

        {/* Card Body */}
        <div className="px-6 pb-6 pt-1 md:px-8 md:pb-8 md:pt-1 flex flex-col flex-1 justify-between space-y-5">
          <div className="space-y-2">
            {displayCategory && (
              <span className="font-mono text-[11px] font-bold text-[#55788D] tracking-wider uppercase block">
                {displayCategory}
              </span>
            )}
            <Link href={`/portfolio/${slug}`} className="block">
              <h3 className="text-2xl md:text-[26px] font-black text-[#17252D] tracking-tight leading-tight">
                {title}
              </h3>
            </Link>
            {subtitle && (
              <p className="font-mono text-xs font-bold text-[#55788D]">
                {subtitle}
              </p>
            )}
            {client && (
              <p className="font-mono text-[11px] text-[#55788D]">
                {client}
              </p>
            )}
            
            {description ? (
              <p className="text-[#17252D]/85 text-sm md:text-[15px] leading-relaxed pt-1 font-medium font-sans">
                {description}
              </p>
            ) : null}
          </div>

          {/* Action Link: View Project → */}
          <div className="pt-4 border-t border-[#D5E2E9]">
            <Link
              href={`/portfolio/${slug}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#17252D] hover:text-[#55788D] transition-colors"
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
