import React from "react";
import { GlobalBackground } from "@/components/layout/GlobalBackground";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { WhatsAppWidget } from "@/components/shared/WhatsAppWidget";
import { Toaster } from "sonner";
import Script from "next/script";
import { PHProvider } from "@/components/providers/PostHogProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://growxlabs.tech"),

  title: {
    default:
      "GrowxLabs — AI-Native Software Company | Product Studio | AI Engineering Lab",
    template: "%s | GrowxLabs",
  },

  description:
    "GrowxLabs is an AI-native software company, product studio, and AI Engineering Lab. We research, design, and engineer enterprise software, AI capabilities, digital platforms, intelligent workflows, and operational intelligence.",

  alternates: {
    canonical: "https://growxlabs.tech/",
  },

  openGraph: {
    url: "https://growxlabs.tech/",
    siteName: "GrowxLabs",
    type: "website",
    images: [
      {
        url: "https://growxlabs.tech/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },

  icons: {
    icon: "/logo-symbol.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",

              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://growxlabs.tech/#organization",

                  name: "GrowxLabs",

                  alternateName: [
                    "GrowxLabs Tech",
                    "GrowxLabs.tech",
                  ],

                  url: "https://growxlabs.tech",

                  logo: {
                    "@type": "ImageObject",
                    url: "https://growxlabs.tech/logo.png",
                  },

                  description:
                    "GrowxLabs is an AI-native software company, product studio, and AI Engineering Lab researching, designing, and engineering enterprise software, AI capabilities, digital platforms, intelligent workflows, and operational intelligence.",

                  founder: {
                    "@id": "https://growxlabs.tech/#varshith",
                  },

                  location: {
                    "@type": "Country",
                    name: "India",
                  },

                  contactPoint: {
                    "@type": "ContactPoint",
                    email: "sai@growxlabs.tech",
                    contactType: "general inquiries",
                    availableLanguage: ["English"],
                  },

                  areaServed: {
                    "@type": "Place",
                    name: "Worldwide",
                  },

                  knowsAbout: [
                    "Enterprise Software Engineering",
                    "Product Engineering",
                    "Web Platform Engineering",
                    "Enterprise Modernization",
                    "Software Architecture",
                    "Systems Integration",
                    "AI Engineering",
                    "Intelligent Workflows",
                    "Operational Intelligence",
                    "Agentic AI",
                    "Multi-Agent Systems",
                    "AI Developer Infrastructure",
                    "Generative AI",
                    "Retrieval-Augmented Generation",
                    "Cloud-Native Architecture",
                  ],

                  sameAs: [
                    "https://www.linkedin.com/company/growxlabs-tech/",
                    "https://instagram.com/growxlabs.tech",
                  ],
                },

                {
                  "@type": "Person",
                  "@id": "https://growxlabs.tech/#varshith",

                  name: "Sai Varshith Pujala",

                  jobTitle: "Founder & CEO",

                  url: "https://www.linkedin.com/in/sai-varshith-pujala/",

                  sameAs: [
                    "https://www.linkedin.com/in/sai-varshith-pujala/",
                  ],

                  worksFor: {
                    "@id": "https://growxlabs.tech/#organization",
                  },
                },

                {
                  "@type": "WebSite",
                  "@id": "https://growxlabs.tech/#website",

                  url: "https://growxlabs.tech",

                  name: "GrowxLabs",

                  alternateName: "GrowxLabs.tech",

                  publisher: {
                    "@id": "https://growxlabs.tech/#organization",
                  },

                  inLanguage: "en",
                },
              ],
            }),
          }}
        />

        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="lazyOnload"
            />

            <Script
              id="google-analytics"
              strategy="lazyOnload"
            >
              {`
                window.dataLayer = window.dataLayer || [];

                function gtag(){
                  dataLayer.push(arguments);
                }

                gtag('js', new Date());

                gtag(
                  'config',
                  '${process.env.NEXT_PUBLIC_GA_ID}'
                );
              `}
            </Script>
          </>
        )}
      </head>

      <body
        className="min-h-full flex flex-col bg-background text-foreground font-sans relative"
        suppressHydrationWarning
      >
        <PHProvider>
          <AuthProvider>
            <QueryProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem={true}
                disableTransitionOnChange
              >
                <GlobalBackground />

                <ConditionalLayout>
                  {children}
                </ConditionalLayout>

                <CookieConsent />

                <WhatsAppWidget />

                <Toaster
                  position="top-right"
                  expand={false}
                  richColors
                />
              </ThemeProvider>
            </QueryProvider>
          </AuthProvider>
        </PHProvider>
      </body>
    </html>
  );
}
