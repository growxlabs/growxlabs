import { PortfolioFilterGrid } from "@/components/marketing/PortfolioFilterGrid";
import { projects } from "@/lib/data/projects";
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
    <div className="flex flex-col bg-black text-foreground min-h-screen">
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

      <div className="w-full bg-black px-6 md:px-10 xl:px-16 2xl:px-24 pb-32 border-t border-white/10 pt-12">
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
          <PortfolioFilterGrid projects={projects} />
        </div>
      </div>
    </div>
  );
}
