import { ProjectCard } from "@/components/ui/ProjectCard";
import { projects } from "@/lib/data/projects";
import { Reveal } from "@/components/marketing/Reveal";
import { DynamicSchema } from "@/components/marketing/DynamicSchema";
import { PageHero } from "@/components/marketing/PageHero";

export async function generateMetadata() {
  return {
    title: "Portfolio | GrowxLabs",
    description: "Case studies of our successful AI-native digital systems, from full-stack platforms to complex automation workflows.",
    alternates: {
      canonical: "https://growxlabs.tech/portfolio",
    },
  };
}

export default function PortfolioPage() {
  return (
    <>
      <DynamicSchema
        graph={[
          {
            "@type": "ItemList",
            "@id": "https://growxlabs.tech/portfolio#list",
            itemListElement: projects.map((project, idx) => ({
              "@type": "SoftwareApplication",
              "@id": `https://growxlabs.tech/portfolio/${project.slug}#product`,
              name: project.title,
              position: idx + 1,
            })),
          },
        ]}
      />

      <PageHero
        title="Portfolio"
        viewingText="PORTFOLIO"
        exploreText="OUR WORK"
        tagline="REAL SYSTEMS"
      />

      <div className="w-full px-6 md:px-10 xl:px-16 2xl:px-24 pb-32 border-t border-border/20 pt-12">
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {projects.map((project, index) => (
              <Reveal key={project.title} delay={index * 0.08}>
                <ProjectCard {...project} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
