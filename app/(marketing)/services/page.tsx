import { Reveal } from "@/components/marketing/Reveal";
import { locales, Link } from "@/navigation";
import { DynamicSchema } from "@/components/marketing/DynamicSchema";
import { PageHero } from "@/components/marketing/PageHero";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function PixelGrid({ 
  type, 
  fill = "#4A4330", 
  pulseFill = "#6E6246" 
}: { 
  type: string; 
  fill?: string; 
  pulseFill?: string; 
}) {
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

  const animName = `px-pulse-${type}`;

  return (
    <div className="flex justify-center my-2 h-32">
      <svg
        viewBox="0 0 160 100"
        className="h-full w-full max-w-[200px]"
        style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
        aria-hidden="true"
      >
        <style>{`
          @keyframes ${animName} {
            0%, 100% { fill: ${fill}; opacity: 0.95; }
            50% { fill: ${pulseFill}; opacity: 0.72; }
          }
          .${animName}-active {
            animation: ${animName} 3s infinite ease-in-out;
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
                className={`${animName}-active`}
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
    useCases: "Custom enterprise apps, platforms, integrations",
    weight: "Scoped build",
    dimensions: "Architecture to production delivery",
    buttonText: "GET IN TOUCH",
    buttonHref: "https://wa.me/918790907144?text=Hi%2C%20I%27m%20interested%20in%20a%20Custom%20Software%20Build%20at%20GrowxLabs.",
    // Earth #E9E7E1 + Midnight #22282C palette
    cardBg: "bg-[#E9E7E1]",
    borderBg: "bg-[#C2BFB7] hover:bg-[#93979B] focus-within:bg-[#93979B]",
    titleColor: "text-[#22282C]",
    labelColor: "text-[#4D5860]",
    bodyColor: "text-[#22282C]",
    dividerColor: "border-[#D0CDC5]",
    buttonClass: "bg-[#22282C] text-[#FFFFFF] hover:bg-[#343D43] border border-[#22282C]",
    pixelFill: "#455057",
    pixelPulse: "#687680",
  },
  {
    title: "Labs & Platforms",
    type: "ai",
    mission: "Deploy proven architectures",
    useCases: "Scraping, developer harnesses, talent systems",
    weight: "Fast deployment",
    dimensions: "Configurable / production-ready",
    buttonText: "EXPLORE LABS",
    buttonHref: "/products",
    // Earth #E9E7E1 + Midnight #22282C palette
    cardBg: "bg-[#E9E7E1]",
    borderBg: "bg-[#C2BFB7] hover:bg-[#93979B] focus-within:bg-[#93979B]",
    titleColor: "text-[#22282C]",
    labelColor: "text-[#4D5860]",
    bodyColor: "text-[#22282C]",
    dividerColor: "border-[#D0CDC5]",
    buttonClass: "bg-[#22282C] text-[#FFFFFF] hover:bg-[#343D43] border border-[#22282C]",
    pixelFill: "#455057",
    pixelPulse: "#687680",
  },
  {
    title: "Fractional CTO",
    type: "cto",
    mission: "Own product and architecture",
    useCases: "Roadmaps, system design, technical strategy",
    weight: "Strategic",
    dimensions: "Architecture & technical leadership",
    buttonText: "GET IN TOUCH",
    buttonHref: "https://wa.me/918790907144?text=Hi%2C%20I%27m%20interested%20in%20Fractional%20CTO%20services%20at%20GrowxLabs.",
    // Earth #E9E7E1 + Midnight #22282C palette
    cardBg: "bg-[#E9E7E1]",
    borderBg: "bg-[#C2BFB7] hover:bg-[#93979B] focus-within:bg-[#93979B]",
    titleColor: "text-[#22282C]",
    labelColor: "text-[#4D5860]",
    bodyColor: "text-[#22282C]",
    dividerColor: "border-[#D0CDC5]",
    buttonClass: "bg-[#22282C] text-[#FFFFFF] hover:bg-[#343D43] border border-[#22282C]",
    pixelFill: "#455057",
    pixelPulse: "#687680",
  },
  {
    title: "Technical Co-founders",
    type: "founder",
    mission: "Embed from day one",
    useCases: "MVPs, technology stack, delivery, scaling",
    weight: "Deep partnership",
    dimensions: "Long-term aligned engineering",
    buttonText: "GET IN TOUCH",
    buttonHref: "https://wa.me/918790907144?text=Hi%2C%20I%27m%20interested%20in%20a%20Technical%20Co-founder%20partnership%20at%20GrowxLabs.",
    // Earth #E9E7E1 + Midnight #22282C palette
    cardBg: "bg-[#E9E7E1]",
    borderBg: "bg-[#C2BFB7] hover:bg-[#93979B] focus-within:bg-[#93979B]",
    titleColor: "text-[#22282C]",
    labelColor: "text-[#4D5860]",
    bodyColor: "text-[#22282C]",
    dividerColor: "border-[#D0CDC5]",
    buttonClass: "bg-[#22282C] text-[#FFFFFF] hover:bg-[#343D43] border border-[#22282C]",
    pixelFill: "#455057",
    pixelPulse: "#687680",
  },
];

export async function generateMetadata() {
  return {
    title: "Software Engineering, Web Platforms & Enterprise AI Services | GrowxLabs",
    description: "GrowxLabs provides custom enterprise software development, product engineering, web platform engineering, modernization, and intelligent workflow integrations.",
    alternates: {
      canonical: "https://growxlabs.tech/services"
    }
  };
}

export default function ServicesPage() {
  return (
    <div className="flex flex-col bg-[#A2BECC] text-[#22282C] min-h-screen">
      <DynamicSchema
        graph={[
          {
            "@type": "Service",
            "@id": "https://growxlabs.tech/services/software#service",
            "name": "Enterprise Software Engineering",
            "provider": { "@id": "https://growxlabs.tech/#organization" },
            "areaServed": "Global",
            "description": "Custom enterprise software development, modern web platform engineering, and scalable digital architectures."
          },
          {
            "@type": "Service",
            "@id": "https://growxlabs.tech/services/ai#service",
            "name": "AI & Intelligent Workflows",
            "provider": { "@id": "https://growxlabs.tech/#organization" },
            "areaServed": "Global",
            "description": "Multi-agent systems, document intelligence pipelines, and secure enterprise AI integrations."
          }
        ]}
      />

      <PageHero
        title="Services"
        viewingText="SERVICES"
        exploreText="WHAT WE DO"
        tagline="SOFTWARE & PRODUCT ENGINEERING"
      />

      <div className="pb-16 px-6 md:px-10 xl:px-16 2xl:px-24 w-full border-t border-[#9DB7C4] pt-20 sm:pt-24 bg-[#A2BECC]">
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">

          {/* Services Cards Grid */}
          <Reveal y={40}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-0">
              {services.map((service) => (
                <div
                  key={service.title}
                  className={cn(
                    "relative p-[1px] transition-all duration-300 hover:scale-[1.01] shadow-[0_2px_8px_rgba(23,37,45,0.04)] hover:shadow-[0_8px_24px_rgba(23,37,45,0.08)]",
                    service.borderBg
                  )}
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 42px) 0, 100% 42px, 100% 100%, 0 100%)",
                  }}
                >
                  <div
                    className={cn(
                      "py-6 px-7 sm:px-8 sm:py-9 flex flex-col h-full justify-between min-h-[500px]",
                      service.cardBg
                    )}
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 41px) 0, 100% 41px, 100% 100%, 0 100%)",
                    }}
                  >
                    {/* Top Region: Title + Graphic + Divider */}
                    <div>
                      <div className="h-[58px] flex items-center mt-3">
                        <h3 className={cn("text-[22px] font-semibold leading-[1.25] tracking-tight font-sans", service.titleColor)}>
                          {service.title}
                        </h3>
                      </div>
                      
                      {/* Pixel Art Graphic */}
                      <PixelGrid 
                        type={service.type} 
                        fill={service.pixelFill} 
                        pulseFill={service.pixelPulse} 
                      />

                      {/* Horizontally Aligned Divider */}
                      <div className={cn("w-full border-t mt-2 mb-6", service.dividerColor)} />
                    </div>

                    {/* Bottom Region: Metadata + CTA Button */}
                    <div className="flex flex-col flex-1 justify-between">
                      {/* Metadata fields list */}
                      <div className="flex flex-col gap-4">
                        {[
                          { k: "MISSIONS", v: service.mission },
                          { k: "USE CASES", v: service.useCases },
                          { k: "WEIGHT", v: service.weight },
                          { k: "DIMENSIONS", v: service.dimensions },
                        ].map((row) => (
                          <div key={row.k} className="flex flex-col gap-1">
                            <span className={cn("text-[11px] font-medium uppercase tracking-[0.16em] font-mono select-none", service.labelColor)}>
                              {row.k}
                            </span>
                            <span className={cn("text-[15px] font-medium leading-relaxed font-sans", service.bodyColor)}>
                              {row.v}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <div className="pt-6 mt-auto">
                        {service.buttonHref.startsWith("http") ? (
                          <a 
                            href={service.buttonHref} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-full block"
                          >
                            <Button
                              className={cn(
                                "w-full uppercase font-semibold text-[12px] tracking-[0.04em] py-3.5 sm:py-4 transition-all duration-200 shadow-sm !rounded-none rounded-none cursor-pointer border border-[#22282C] bg-[#22282C] text-[#FFFFFF] hover:bg-[#343D43] active:scale-[0.99]"
                              )}
                            >
                              {service.buttonText}
                            </Button>
                          </a>
                        ) : (
                          <Link href={service.buttonHref} className="w-full block">
                            <Button
                              className={cn(
                                "w-full uppercase font-semibold text-[12px] tracking-[0.04em] py-3.5 sm:py-4 transition-all duration-200 shadow-sm !rounded-none rounded-none cursor-pointer border border-[#22282C] bg-[#22282C] text-[#FFFFFF] hover:bg-[#343D43] active:scale-[0.99]"
                              )}
                            >
                              {service.buttonText}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
