import { notFound } from "next/navigation";
import { allProjectsArchive } from "@/lib/data/projects";
import { CaseStudyTemplate } from "@/components/marketing/CaseStudyTemplate";
import { DynamicSchema } from "@/components/marketing/DynamicSchema";

export async function generateStaticParams() {
  return allProjectsArchive.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = allProjectsArchive.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} — Built by GrowxLabs Product Studio`,
    description: project.description,
    alternates: {
      canonical: `https://growxlabs.tech/portfolio/${slug}`,
    },
    openGraph: {
      title: `${project.title} — GrowxLabs`,
      description: project.description,
      images: [{ url: project.image }],
    },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = allProjectsArchive.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const specifications = project.results && project.results.length > 0
    ? project.results.map((r) => ({ label: r.label, value: r.value }))
    : [
        { label: "Architecture", value: "Modern AI Platform" },
        { label: "Engineering", value: "GrowxLabs Product Studio" },
        { label: "Delivery", value: "Production Ready" },
      ];

  const features = project.features && project.features.length > 0
    ? project.features.map((f) => ({ title: f.title, description: f.desc }))
    : [project.solution];

  const metadataStrip = [
    { label: "PROJECT", value: project.title },
    { label: "CATEGORY", value: project.tag || "AI PLATFORM" },
    { label: "STATUS", value: project.status || "Production", isHighlight: true },
    { label: "METRIC", value: project.metric || "Verified" },
  ];

  return (
    <>
      <DynamicSchema
        graph={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "@id": `https://growxlabs.tech/portfolio/${slug}#product`,
            name: project.title,
            applicationCategory: "SoftwareApplication",
            operatingSystem: "All",
            description: project.description,
            offers: {
              "@type": "Offer",
              price: "0",
            },
          },
        ]}
      />
      <CaseStudyTemplate
        slug={project.slug}
        title={project.title}
        tagline={project.subtitle || project.tag?.toUpperCase() || "AI PLATFORM"}
        categoryTag={project.category || `// ${project.title.toUpperCase()}`}
        summary={project.description || `${project.title} is engineered and deployed by GrowxLabs.`}
        metadataStrip={metadataStrip}
        heroImage={{
          src: project.image,
          alt: `${project.title} Platform Case Study`,
          width: 1920,
          height: 1080,
          captionLeft: `${project.title.toUpperCase()} // SYSTEM PREVIEW`,
          captionRight: `${project.status?.toUpperCase() || "LIVE"} DEPLOYMENT`,
        }}
        overview={[
          project.problem,
          project.solution,
        ].filter(Boolean)}
        specificationsHeaderLabel="Metric / Attribute"
        specificationsHeaderValue="Verified Specification"
        specifications={specifications}
        features={features}
        architecture={
          project.tech && project.tech.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="px-4 py-2 bg-[#E5EFF4] border border-[#D5E2E9] rounded-xl text-xs font-mono font-bold text-[#17252D] uppercase tracking-wider"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : undefined
        }
        ctaTitle={`Interested in ${project.title}?`}
        ctaDescription="Let's discuss how this system or custom implementation can accelerate your product roadmap."
        ctaHref={project.link || "/contact"}
        ctaButtonText={project.link ? "Explore Platform" : "Get in Touch"}
      />
    </>
  );
}
