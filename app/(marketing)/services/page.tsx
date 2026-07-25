
import { Reveal } from "@/components/marketing/Reveal";
import { locales, Link } from "@/navigation";
import { DynamicSchema } from "@/components/marketing/DynamicSchema";
import { PageHero } from "@/components/marketing/PageHero";
import { Button } from "@/components/ui/Button";

function PixelGrid({ type }: { type: string }) {
  // grids of 16 columns by 10 rows
  let cells: number[][] = [];
  
  if (type === "software") {
    cells = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0],
      [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0],
      [0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
      [0,1,0,0,0,1,1,0,1,1,0,0,0,0,1,0],
      [0,1,0,0,0,0,1,1,1,0,0,0,0,0,1,0],
      [0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0],
      [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0],
      [0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ];
  } else if (type === "ai") {
    cells = [
      [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
      [0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0],
      [0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0],
      [0,1,1,0,1,1,0,0,1,1,0,1,1,0,0,0],
      [0,1,1,0,1,1,0,0,1,1,0,1,1,0,0,0],
      [0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ];
  } else if (type === "cto") {
    cells = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0],
      [0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0],
      [0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ];
  } else {
    cells = [
      [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ];
  }

  return (
    <div className="flex justify-center my-4 h-32">
      <svg
        viewBox="0 0 160 100"
        className="h-full w-full max-w-[200px]"
        style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
        aria-hidden="true"
      >
        <style>{`
          @keyframes px-pulse {
            0%, 100% { fill: #C0F0FB; opacity: 0.95; }
            50% { fill: #355CFF; opacity: 0.3; }
          }
          .px-active {
            animation: px-pulse 3s infinite ease-in-out;
          }
        `}</style>
        {cells.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            if (cell === 0) return null;
            const delay = ((rIdx + cIdx) * 0.08).toFixed(2) + "s";
            return (
              <rect
                key={`${rIdx}-${cIdx}`}
                x={cIdx * 10}
                y={rIdx * 10}
                width={8}
                height={8}
                className="px-active"
                style={{ animationDelay: delay }}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}

const services = [
  {
    title: "Custom Software Builds",
    type: "software",
    mission: "Problem to prototype",
    useCases: "Custom apps, tools, automations",
    weight: "Medium build",
    dimensions: "24h prototype / scoped delivery",
    buttonText: "GET IN TOUCH",
    buttonHref: "https://wa.me/918790907144?text=Hi%2C%20I%27m%20interested%20in%20a%20Custom%20Software%20Build%20at%20GrowXLabs.",
  },
  {
    title: "Labs & Pre-built Tools",
    type: "ai",
    mission: "Deploy proven systems",
    useCases: "Healthcare, logistics, maps, ops",
    weight: "Fast launch",
    dimensions: "Configurable / live in 72h",
    buttonText: "EXPLORE LABS",
    buttonHref: "/products",
  },
  {
    title: "Fractional CTO",
    type: "cto",
    mission: "Own product and architecture",
    useCases: "Roadmaps, systems, hiring",
    weight: "Strategic",
    dimensions: "Base build + revenue share",
    buttonText: "GET IN TOUCH",
    buttonHref: "https://wa.me/918790907144?text=Hi%2C%20I%27m%20interested%20in%20Fractional%20CTO%20services%20at%20GrowXLabs.",
  },
  {
    title: "Technical Co-founders",
    type: "founder",
    mission: "Embed from day one",
    useCases: "MVPs, stack, delivery, scale",
    weight: "Deep partnership",
    dimensions: "Equity or revenue aligned",
    buttonText: "GET IN TOUCH",
    buttonHref: "https://wa.me/918790907144?text=Hi%2C%20I%27m%20interested%20in%20a%20Technical%20Co-founder%20partnership%20at%20GrowXLabs.",
  },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const languages: Record<string, string> = {
    "x-default": "https://growxlabs.tech/en-IN/services",
  };
  locales.forEach((l) => {
    languages[l] = `https://growxlabs.tech/${l}/services`;
  });

  return {
    title: "Global Web Development & Automation Services | GrowXLabsTech",
    description: "AI-powered websites, n8n automation workflows, WhatsApp integration, and AI chatbots for businesses globally. Trusted by restaurants, real estate companies, and growing businesses worldwide.",
    alternates: {
      canonical: `https://growxlabs.tech/${locale}/services`,
      languages
    }
  };
}

export default function ServicesPage() {
  return (
    <>
      <DynamicSchema
        graph={[
          {
            "@type": "Service",
            "@id": "https://growxlabs.tech/services/ai#service",
            "name": "AI Development",
            "provider": { "@id": "https://growxlabs.tech/#organization" },
            "areaServed": "Global",
            "description": "Custom AI systems, automation workflows, and intelligent applications."
          },
          {
            "@type": "Service",
            "@id": "https://growxlabs.tech/services/web#service",
            "name": "Web Platforms",
            "provider": { "@id": "https://growxlabs.tech/#organization" },
            "areaServed": "Global",
            "description": "High-performance websites with native AI integration."
          }
        ]}
      />

      <PageHero
        title="Services"
        viewingText="SERVICES"
        exploreText="WHAT WE DO"
        tagline="SYSTEMS & AUTOMATION"
      />

      <div className="pb-12 px-6 md:px-10 xl:px-16 2xl:px-24 w-full border-t border-border/20 pt-16">
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">

          {/* Services Cards Grid */}
          <Reveal y={40}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-0">
              {services.map((service, index) => (
                <div
                  key={service.title}
                  className="relative p-[1px] transition-all duration-300 hover:scale-[1.01] bg-border hover:bg-[#C0F0FB]/50"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 42px) 0, 100% 42px, 100% 100%, 0 100%)",
                  }}
                >
                  <div
                    className="bg-[#1A1A1A] py-6 px-7 sm:px-8 sm:py-9 flex flex-col h-full justify-between min-h-[500px]"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 41px) 0, 100% 41px, 100% 100%, 0 100%)",
                    }}
                  >
                    <div>
                      <h3 className="text-xl font-bold text-foreground leading-tight tracking-tight mt-4 min-h-[56px] flex items-center">
                        {service.title}
                      </h3>
                      
                      {/* Pixel Art Graphic */}
                      <PixelGrid type={service.type} />
                    </div>

                    <div>
                      {/* Metadata fields list */}
                      <div className="flex flex-col gap-4 mt-4 pt-6 border-t border-border/40">
                        {[
                          { k: "MISSIONS", v: service.mission },
                          { k: "USE CASES", v: service.useCases },
                          { k: "WEIGHT", v: service.weight },
                          { k: "DIMENSIONS", v: service.dimensions },
                        ].map((row) => (
                          <div key={row.k} className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                              {row.k}
                            </span>
                            <span className="text-sm font-semibold text-foreground leading-normal">
                              {row.v}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      {service.buttonHref.startsWith("http") ? (
                        <a 
                          href={service.buttonHref} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-full block mt-6"
                        >
                          <Button
                            variant="outline"
                            className="w-full uppercase font-bold text-[12px] tracking-wider py-5 border-border hover:border-[#C0F0FB]/40 hover:bg-[#C0F0FB] hover:text-black transition-all duration-300"
                          >
                            {service.buttonText}
                          </Button>
                        </a>
                      ) : (
                        <Link href={service.buttonHref} className="w-full block mt-6">
                          <Button
                            variant="outline"
                            className="w-full uppercase font-bold text-[12px] tracking-wider py-5 border-border hover:border-[#C0F0FB]/40 hover:bg-[#C0F0FB] hover:text-black transition-all duration-300"
                          >
                            {service.buttonText}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
