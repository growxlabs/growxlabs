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
    default: "GrowxLabs — AI-Native Software Company | Product Studio | AI Engineering Lab",
    template: "%s | GrowxLabs",
  },
  description:
    "GrowxLabs is an AI-native software company, product studio, and engineering lab. We research, design, and deploy enterprise software, AI capabilities, and production-grade digital platforms.",
  alternates: {
    canonical: "https://growxlabs.tech/",
  },
  openGraph: {
    url: "https://growxlabs.tech/",
    siteName: "GrowxLabs",
    type: "website",
    images: [{ url: "https://growxlabs.tech/og-image.png", width: 1200, height: 630 }],
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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* 🧠 MASTER AEO KNOWLEDGE GRAPH (Verified Architecture) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://growxlabs.tech/#organization",
                  "name": "GrowxLabs",
                  "alternateName": ["GrowxLabs Tech", "GrowxLabs.tech"],
                  "url": "https://growxlabs.tech",
                  "logo": "https://growxlabs.tech/logo.png",
                  "description":
                    "GrowxLabs is an AI-native software company, product studio, and AI engineering lab researching, designing, and engineering enterprise software, AI capabilities, digital platforms, intelligent workflows, and operational intelligence.",
                  "founder": [
                    { "@id": "https://growxlabs.tech/#varshith" },
                    { "@id": "https://growxlabs.tech/#akhilesh" },
                  ],
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Guntur",
                    "addressRegion": "Andhra Pradesh",
                    "addressCountry": "IN",
                  },
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "email": "sai@growxlabs.tech",
                    "contactType": "general inquiries",
                    "availableLanguage": ["English"],
                  },
                  "areaServed": "Worldwide",
                  "serviceArea": {
                    "@type": "GeoShape",
                    "description": "Worldwide — serving clients across all countries",
                  },
                  "knowsAbout": [
                    "AI Engineering",
                    "Enterprise Software Engineering",
                    "Product Engineering",
                    "Web Platform Engineering",
                    "Intelligent Workflow Automation",
                    "Modernization and Integrations",
                    "Operational Intelligence",
                    "Agentic AI",
                    "Multi-Agent Orchestration",
                    "AI Developer Infrastructure",
                    "Generative AI",
                    "Retrieval-Augmented Generation",
                  ],
                  "sameAs": [
                    "https://www.linkedin.com/company/growxlabs-tech/",
                    "https://instagram.com/growxlabs.tech",
                  ],
                },
                {
                  "@type": "Person",
                  "@id": "https://growxlabs.tech/#varshith",
                  "name": "Varshith Pujala",
                  "jobTitle": "Co Founder",
                  "worksFor": { "@id": "https://growxlabs.tech/#organization" },
                },
                {
                  "@type": "Person",
                  "@id": "https://growxlabs.tech/#akhilesh",
                  "name": "Akhilesh",
                  "jobTitle": "Co Founder",
                  "worksFor": { "@id": "https://growxlabs.tech/#organization" },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://growxlabs.tech/#website",
                  "url": "https://growxlabs.tech",
                  "name": "GrowxLabs",
                  "publisher": { "@id": "https://growxlabs.tech/#organization" },
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://growxlabs.tech/products/resumeforgeai#product",
                  "name": "ResumeForgeAI",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Web",
                  "creator": { "@id": "https://growxlabs.tech/#organization" },
                  "description": "AI powered resume builder with intelligent optimization.",
                  "url": "https://growxlabs.tech/products/resumeforgeai",
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://growxlabs.tech/products/universalai#product",
                  "name": "UniversalAI",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Web",
                  "creator": { "@id": "https://growxlabs.tech/#organization" },
                  "description": "Cross-platform AI intelligence for enterprise automation.",
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://growxlabs.tech/products/recruitai#product",
                  "name": "RecruitAI",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Web",
                  "creator": { "@id": "https://growxlabs.tech/#organization" },
                  "description": "AI driven recruitment and talent acquisition platform.",
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://growxlabs.tech/products/pipper#product",
                  "name": "Pipper",
                  "applicationCategory": "DeveloperApplication",
                  "operatingSystem": "All",
                  "creator": { "@id": "https://growxlabs.tech/#organization" },
                  "description":
                    "Unified agent developer harness and desktop runtime for Codex, Claude-Code, and OpenCode orchestration.",
                  "url": "https://growxlabs.tech/products/pipper",
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
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
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

                <ConditionalLayout>{children}</ConditionalLayout>

                <CookieConsent />
                <WhatsAppWidget />
                <Toaster position="top-right" expand={false} richColors />
              </ThemeProvider>
            </QueryProvider>
          </AuthProvider>
        </PHProvider>
      </body>
    </html>
  );
}
