import { CaseStudyTemplate } from "@/components/marketing/CaseStudyTemplate";
import { GrowXCrawlArchitecture } from "@/components/marketing/GrowXCrawlArchitecture";

export const metadata = {
  title: "GrowX Crawl — Web Research & Discovery Platform | GrowXLabs",
  description:
    "Production-grade web crawling API for scraping pages, extracting structured data, crawling websites, processing URLs in batches, capturing screenshots, generating PDFs, and auditing SEO.",
};

const CRAWL_SPECIFICATIONS = [
  {
    label: "Capabilities",
    value: "7: scrape, extract, crawl, batch, screenshot, PDF, URL-based SEO audit",
  },
  {
    label: "Fetching",
    value: "3 modes: Fast HTTP, headless browser, stealth",
  },
  {
    label: "Crawl limit",
    value: "Up to 50 pages and five levels deep",
  },
  {
    label: "Batch limit",
    value: "Up to 100 URLs per job; configurable concurrency",
  },
  {
    label: "Job delivery",
    value: "Status polling and optional completion webhook",
  },
  {
    label: "Formats",
    value: "PNG/JPEG screenshots and A4, Letter, or Legal PDFs",
  },
];

const CRAWL_FEATURES = [
  "Fetches standard and JavaScript-heavy pages, switching methods when a page resists extraction",
  "Pulls the exact fields you need with CSS or XPath rules",
  "Follows links through a site, up to 50 pages and five levels",
  "Processes URL lists in batches of up to 100",
  "Creates page screenshots and PDFs, and checks a URL’s SEO",
  "Provides API key access, usage limits, job tracking, webhooks, and scrape caching",
];

export default function GrowXCrawlCaseStudy() {
  return (
    <CaseStudyTemplate
      slug="growx-crawl"
      title="GrowX Crawl"
      tagline="INTERNAL R&D"
      categoryTag="// INTERNAL R&D"
      summary="Production-grade web crawling API for scraping pages, extracting structured data, crawling websites, processing URLs in batches, capturing screenshots, generating PDFs, and auditing SEO."
      metadataStrip={[
        { label: "PROJECT", value: "Web Research" },
        { label: "BUILT BY", value: "GrowxLabs" },
        { label: "RUNTIME", value: "Local-first" },
      ]}
      heroImage={{
        src: "/portfolio/growx-crawl.png",
        alt: "GrowX Crawl Enterprise Web Intelligence & Research Platform",
        width: 1920,
        height: 1080,
      }}
      overview="One API, seven capabilities. GrowX Crawl scrapes individual pages using fast HTTP, a browser, or stealth fetching when needed, and extracts specific data with CSS or XPath selectors. It can crawl up to 50 pages across five levels or process batches of up to 100 URLs, with job tracking and webhooks for longer runs. It also captures screenshots, generates PDFs, and audits site SEO. Proxy support, robots.txt controls, and response caching are built in."
      specificationsHeaderLabel="Specification"
      specificationsHeaderValue="GrowX Crawl"
      specifications={CRAWL_SPECIFICATIONS}
      features={CRAWL_FEATURES}
      architecture={<GrowXCrawlArchitecture />}
    />
  );
}
