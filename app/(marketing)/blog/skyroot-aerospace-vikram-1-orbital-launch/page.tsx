import React from "react";
import Script from "next/script";
import Image from "next/image";
import { Link } from "@/navigation";
import { 
  ReadingProgressBar, 
  TableOfContents 
} from "@/components/marketing/BlogInteractive";
import { 
  AuthorProfileSidebar, 
  BlogActionBar, 
  NewsletterForwardBanner, 
  RelatedEssaysList 
} from "@/components/marketing/BlogEditorial";
import { Reveal } from "@/components/marketing/Reveal";
import { Calendar, Clock, User, ChevronDown, Rocket } from "lucide-react";
import { FlickerText } from "@/components/marketing/FlickerText";
import { BlogShare } from "./InteractiveComponents";

// ═══════════════════════════════════════════════════
// METADATA GENERATOR (SEO & Social Previews)
// ═══════════════════════════════════════════════════
export async function generateMetadata() {
  const title = "Skyroot Aerospace Launches Vikram-1, Ushering India Into Private Orbital Era";
  const description = "Skyroot Aerospace successfully launches Vikram-1, becoming India's first private company to achieve orbital insertion. Read our deep technical analysis of the mission.";

  return {
    title: `${title} | GrowxLabs`,
    description,
    alternates: {
      canonical: "https://growxlabs.tech/blog/skyroot-aerospace-vikram-1-orbital-launch"
    },
    openGraph: {
      title,
      description,
      url: "https://growxlabs.tech/blog/skyroot-aerospace-vikram-1-orbital-launch",
      siteName: "GrowxLabs",
      type: "article",
      publishedTime: "2026-07-21T00:00:00.000Z",
      authors: ["GrowxLabs"],
      images: [
        {
          url: "https://growxlabs.tech/images/blog-skyroot-vikram1.png",
          width: 1200,
          height: 630,
          alt: "Skyroot Aerospace Launches Vikram-1 Orbital Rocket"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://growxlabs.tech/images/blog-skyroot-vikram1.png"]
    },
    keywords: [
      "Skyroot Aerospace",
      "Vikram-1",
      "India private space",
      "Pawan Kumar Chandana",
      "Naga Bharath Daka",
      "Raman-1 engine",
      "Kalam-1200",
      "ISRO commercial launch",
      "Mission Aagaman",
      "3D printed rocket engine"
    ]
  };
}

export default async function SkyrootBlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const titleName = "VIKRAM-1";

  const headings = [
    { id: "introduction", text: "1. Introduction" },
    { id: "about-skyroot-aerospace", text: "2. About Skyroot Aerospace" },
    { id: "the-vikram-1-rocket", text: "3. The Vikram-1 Rocket: Engineering & Architecture" },
    { id: "mission-aagaman", text: "4. Mission Aagaman: Launch Execution" },
    { id: "key-technological-innovations", text: "5. Key Technological Innovations" },
    { id: "commercial-strategic-importance", text: "6. Commercial & Strategic Importance" },
    { id: "future-roadmap", text: "7. Future Roadmap: Vikram-2 & Beyond" },
    { id: "conclusion", text: "8. Conclusion: A New Chapter in Global Spaceflight" },
    { id: "key-takeaways", text: "Key Takeaways" },
    { id: "faq", text: "Frequently Asked Questions" }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://growxlabs.tech/blog/skyroot-aerospace-vikram-1-orbital-launch/#article`,
        "headline": "Skyroot Aerospace Launches Vikram-1, Ushering India Into Private Orbital Era",
        "description": "Skyroot Aerospace successfully launches Vikram-1, becoming India's first private company to achieve orbital insertion.",
        "datePublished": "2026-07-21T00:00:00.000Z",
        "dateModified": "2026-07-21T00:00:00.000Z",
        "image": "https://growxlabs.tech/images/blog-skyroot-vikram1.png",
        "author": {
          "@type": "Organization",
          "name": "GrowxLabs",
          "url": "https://growxlabs.tech",
          "logo": "https://growxlabs.tech/logo.png"
        },
        "publisher": {
          "@type": "Organization",
          "name": "GrowxLabs",
          "logo": {
            "@type": "ImageObject",
            "url": "https://growxlabs.tech/logo.png"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://growxlabs.tech/blog/skyroot-aerospace-vikram-1-orbital-launch`
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `https://growxlabs.tech/${locale}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": `https://growxlabs.tech/blog`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Skyroot Launch",
            "item": `https://growxlabs.tech/blog/skyroot-aerospace-vikram-1-orbital-launch`
          }
        ]
      }
    ]
  };

  const relatedEssays = [
    {
      title: "Kimi K3 Technical Analysis: Inside Moonshot AI's Open Frontier Model",
      accentWord: "Frontier",
      excerpt: "Deep technical report on Moonshot AI's 2.8T parameter open-weight Mixture-of-Experts architecture and benchmarks.",
      href: "/blog/kimi-k3-open-frontier-intelligence-model",
      date: "July 21, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/blog-kimi-k3-woodcut.png"
    },
    {
      title: "Blue Origin’s New Glenn Rocket Explodes During Test: What Happened?",
      accentWord: "Explodes",
      excerpt: "Blue Origin's New Glenn rocket exploded during a hot-fire test in Florida. Here's what happened and why it matters.",
      href: "/blog/blue-origin-new-glenn-rocket-explosion",
      date: "May 30, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/blue-origin-new-glenn-rocket-explosion.png"
    },
    {
      title: "ChatGPT GPT-5.6 Preview: Everything You Need to Know",
      accentWord: "Preview",
      excerpt: "Explore the new tiered family of models (Sol, Terra, Luna) and discover its advanced reasoning and coding capabilities.",
      href: "/blog/chatgpt-gpt-5-6-preview-everything-you-need-to-know",
      date: "June 30, 2026",
      author: "GrowXLabs Team",
      imageSrc: "/images/blog-gpt56-preview.png"
    }
  ];

  const faqItems = [
    { q: "What is Vikram-1?", a: "Vikram-1 is a multi-stage small-satellite launch vehicle developed by Skyroot Aerospace, capable of delivering up to 300 kg to Low Earth Orbit (LEO)." },
    { q: "What is Mission Aagaman?", a: "Mission Aagaman is the maiden orbital flight of Vikram-1, executed on July 18, 2026 from the Satish Dhawan Space Centre in Sriharikota." },
    { q: "Who founded Skyroot Aerospace?", a: "Skyroot Aerospace was founded in 2018 in Hyderabad by former ISRO scientists Pawan Kumar Chandana and Naga Bharath Daka." },
    { q: "What propulsion system powers Vikram-1?", a: "Vikram-1 utilizes high-durability solid-propellant stage motors (Kalam series) combined with a 3D-printed liquid upper stage engine (Raman-1) for precision orbital insertion." }
  ];

  return (
    <div className="blog-article-page w-full bg-background min-h-screen text-foreground selection:bg-primary/10 selection:text-primary pt-32 pb-24">
      {/* JSON-LD Structured Data */}
      <Script
        id="skyroot-launch-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sticky Reading Progress */}
      <ReadingProgressBar />

      {/* ═══════════════════════════════════════════════════ */}
      {/* HERO SECTION                                       */}
      {/* ═══════════════════════════════════════════════════ */}
      <header className="w-full border-b border-border pb-16 px-6 md:px-10 xl:px-16 2xl:px-24 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Swiss Title */}
          <div className="w-full overflow-hidden flex justify-center items-end select-none pointer-events-none mb-10">
            <h1 className="font-black select-none tracking-[-0.06em] text-foreground leading-[0.8] text-[clamp(2rem,9.2vw,130px)] uppercase whitespace-nowrap">
              <FlickerText text={titleName} />
            </h1>
          </div>

          <Reveal y={20}>
            {/* Category Tags */}
            <div className="flex gap-2 justify-center items-center mb-6">
              <span className="text-[11px] font-mono tracking-[0.2em] text-primary uppercase font-bold bg-primary/5 px-2.5 py-1 rounded">
                Space
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                /
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                India
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                /
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase">
                Technology
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-black leading-[1.1] tracking-tighter text-foreground mb-8 max-w-4xl mx-auto font-serif">
              Skyroot Aerospace Launches Vikram-1: <span className="italic font-serif font-normal">Private Orbital</span> Era
              {" "}
              <span className="text-primary font-sans font-black tracking-tighter block mt-2">India’s Historic Commercial Spaceflight Milestone</span>
            </h2>

            {/* Meta Bar */}
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-6 sm:gap-10 font-mono text-[11px] tracking-[0.1em] text-[#9CA3AF] uppercase border-t border-b border-border py-5">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>By GrowxLabs</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>14 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>July 21, 2026</span>
              </div>
            </div>
          </Reveal>

          {/* Hero Visual — Featured Image */}
          <Reveal y={30} delay={0.2}>
            <div className="blog-editorial-image-frame mt-14 w-full max-w-5xl mx-auto">
              <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-[#0F0F12] rounded-xl border border-white/10">
                <Image
                  src="/images/blog-skyroot-vikram1.png"
                  alt="Skyroot Aerospace Vikram-1 Rocket Woodcut Engraving"
                  fill
                  className="object-contain transition-transform duration-700"
                  priority
                />
              </div>
            </div>
          </Reveal>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════ */}
      {/* ARTICLE BODY                                       */}
      {/* ═══════════════════════════════════════════════════ */}
      <main className="w-full px-6 md:px-10 xl:px-16 2xl:px-24 py-16">
        <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16 relative">
          
          {/* Desktop Author Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-32 h-fit">
            <AuthorProfileSidebar
              authorName="Aerospace Group"
              authorRole="Space & Deep-Tech Analysis"
              authorAvatar="/images/avatars/growxlabs.png"
              category="Space • India"
              bio="Technical reporting on commercial launch vehicles, 3D printed liquid engines, and aerospace supply chain scaling."
            />
          </aside>

          {/* Main Content Article */}
          <article className="lg:col-span-9 space-y-12 text-foreground font-serif text-lg leading-relaxed">
            
            <NewsletterForwardBanner />
            <BlogActionBar title="Skyroot Aerospace Launches Vikram-1, Ushering India Into Private Orbital Era" slug="skyroot-aerospace-vikram-1-orbital-launch" />

            <TableOfContents headings={headings} />

            {/* SECTION 1 */}
            <section id="introduction" className="space-y-4 font-sans">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                1. Introduction
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                On <strong>18 July 2026</strong>, a 22-meter column of carbon fiber composite and solid propellant lifted off from the Satish Dhawan Space Centre in Sriharikota. Fifteen minutes later, telemetry confirmed what satellite operators had been waiting to see: <strong>Vikram-1 had achieved orbital insertion</strong>, deploying customer payloads into a 450-kilometer Low Earth Orbit.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                The mission, codenamed <em>Aagaman</em>—Sanskrit for "Arrival"—marked the first time a privately developed Indian rocket reached orbit, establishing India as a serious player in global small-satellite deployment.
              </p>
            </section>

            {/* SECTION 2 */}
            <section id="about-skyroot-aerospace" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                2. About Skyroot Aerospace
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Founded in <strong>2018</strong> by former ISRO engineers <strong>Pawan Kumar Chandana</strong> and <strong>Naga Bharath Daka</strong>, Hyderabad-based Skyroot Aerospace set out to build low-cost, rapidly deployable small-satellite launch vehicles. Following the successful test flight of Vikram-S in 2022, Vikram-1 represents the company's full-scale orbital vehicle.
              </p>
            </section>

            {/* SECTION 3 */}
            <section id="the-vikram-1-rocket" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                3. The Vikram-1 Rocket: Engineering & Architecture
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Vikram-1 is a 3-stage solid-propellant launcher paired with a 3D-printed liquid-propellant upper stage (Raman-1) for precision final insertion.
              </p>

              <div className="overflow-x-auto my-6 border border-border rounded-xl">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-muted uppercase text-foreground">
                    <tr>
                      <th className="p-3 border-b border-border">Parameter</th>
                      <th className="p-3 border-b border-border">Specification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-muted-foreground">
                    <tr><td className="p-3 font-bold text-foreground">Overall Height</td><td className="p-3">22 Meters</td></tr>
                    <tr><td className="p-3 font-bold text-foreground">Gross Lift-off Mass</td><td className="p-3">~48 Metric Tons</td></tr>
                    <tr><td className="p-3 font-bold text-foreground">Payload Capacity</td><td className="p-3">300 kg to 500 km LEO / 480 kg to 500 km SSO</td></tr>
                    <tr><td className="p-3 font-bold text-foreground">Body Construction</td><td className="p-3">All-Carbon Fiber Composite Airframe</td></tr>
                    <tr><td className="p-3 font-bold text-foreground">Upper Stage Engine</td><td className="p-3">Raman-1 (3D-Printed Hypergolic Liquid Engine)</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 4 */}
            <section id="mission-aagaman" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                4. Mission Aagaman: Launch Execution
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Liftoff occurred at 06:14 UTC. Stage 1 (Kalam-1200) fired for 108 seconds, generating over 1,200 kN of thrust. Stage 2 and Stage 3 performed flawlessly before the Raman-1 upper stage executed a closed-loop trim burn to circularize the orbit.
              </p>
            </section>

            {/* SECTION 5 */}
            <section id="key-technological-innovations" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                5. Key Technological Innovations
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Skyroot's Raman-1 engine is entirely 3D printed out of high-strength nickel alloy, reducing component count by 80% and manufacturing lead time from months to under 48 hours.
              </p>
            </section>

            {/* SECTION 6 & 7 */}
            <section id="commercial-strategic-importance" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                6. Commercial & Strategic Importance
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                With global demand for small-satellite constellation replenishment growing rapidly, Vikram-1 offers satellite operators rapid 24-hour turnaround integration at competitive pricing.
              </p>
            </section>

            <section id="future-roadmap" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                7. Future Roadmap: Vikram-2 & Beyond
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Skyroot is actively developing Vikram-2 (capable of delivering 500 kg to SSO) and liquid-cryogenic LNG/LOX engines for reusable launch vehicle stages.
              </p>
            </section>

            {/* KEY TAKEAWAYS */}
            <section id="key-takeaways" className="space-y-4 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                Key Takeaways
              </h3>
              <ul className="space-y-2 font-mono text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-primary font-bold">►</span> Vikram-1 achieved orbital insertion on July 18, 2026 under Mission Aagaman.</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">►</span> All-carbon composite structure with 3D printed Raman-1 liquid upper engine.</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">►</span> Unlocks commercial small-sat launch capacity for global customers out of Sriharikota.</li>
              </ul>
            </section>

            {/* SHARE & ACTION BAR */}
            <BlogShare title="Skyroot Aerospace Launches Vikram-1, Ushering India Into Private Orbital Era" slug="skyroot-aerospace-vikram-1-orbital-launch" />

            {/* FAQ ACCORDION */}
            <section id="faq" className="space-y-6 font-sans border-t border-border pt-8">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-serif">
                Frequently Asked Questions (FAQ)
              </h3>
              <div className="space-y-3">
                {faqItems.map((item, idx) => (
                  <details key={idx} className="group border border-border rounded-xl p-4 transition-all [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-foreground">
                      <span>{item.q}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground border-t border-border pt-3">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            {/* RELATED ESSAYS & NEWSLETTER */}
            <RelatedEssaysList essays={relatedEssays} />
            <NewsletterForwardBanner />

          </article>
        </div>
      </main>
    </div>
  );
}
