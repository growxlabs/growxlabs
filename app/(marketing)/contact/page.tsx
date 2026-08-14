import { locales } from "@/navigation";
import { ContactContent } from "./ContactContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const path = "contact";
  
  const languages: Record<string, string> = {
    'x-default': `https://growxlabs.tech/en-IN/${path}`,
  };
  locales.forEach((l) => {
    languages[l] = `https://growxlabs.tech/${l}/${path}`;
  });

  return {
    title: "Work With GrowXLabsTech | Book a Free Global Call",
    description: "Schedule a technical discovery conversation with GrowXLabsTech. We work with organizations globally. sai@growxlabs.tech",
    alternates: {
      canonical: `https://growxlabs.tech/${locale}/${path}`,
      languages
    }
  };
}

import { DynamicSchema } from "@/components/marketing/DynamicSchema";

export default function ContactPage() {
  return (
    <>
      <DynamicSchema 
        graph={[
          {
            "@type": "ContactPage",
            "@id": "https://growxlabs.tech/contact#page",
            "about": { "@id": "https://growxlabs.tech/#organization" }
          }
        ]} 
      />
      <ContactContent />
    </>
  );
}

