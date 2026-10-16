import { CaseStudyTemplate } from "@/components/marketing/CaseStudyTemplate";
import { TrionyxArchitecture } from "@/components/marketing/TrionyxArchitecture";

export const metadata = {
  title: "Trionyx — Digital Platform Case Study | GrowXLabs",
  description: "A digital platform built around Trionyx's products, customer experience and day-to-day operations.",
  alternates: {
    canonical: "https://growxlabs.tech/portfolio/trionyx",
  },
};

const TRIONYX_SPECIFICATIONS = [
  {
    label: "Product catalogue",
    value: "Browse automotive protection products and specifications.",
  },
  {
    label: "Dealer management",
    value: "Manage dealers, distributors and product requests.",
  },
  {
    label: "Inventory tracking",
    value: "Track stock levels, serial numbers and stock movements.",
  },
  {
    label: "Warranty management",
    value: "Register warranties and let customers verify coverage online.",
  },
];

const TRIONYX_FEATURES = [
  {
    title: "Product catalogue:",
    description: "Browse automotive protection products by category and view specifications.",
  },
  {
    title: "Dealer portal:",
    description: "Give dealers access to products, availability and requests.",
  },
  {
    title: "Stock tracking:",
    description: "View stock availability across locations.",
  },
  {
    title: "Warranty verification:",
    description: "Check warranty status using a product's serial number.",
  },
  {
    title: "Enquiry tracking:",
    description: "Review incoming enquiries and manage follow-ups.",
  },
];

export default function TrionyxCaseStudyPage() {
  return (
    <CaseStudyTemplate
      slug="trionyx"
      title="Trionyx"
      tagline="CLIENT PLATFORM"
      categoryTag="// CASE STUDY"
      summary="A digital platform built around Trionyx's products, customer experience and day-to-day operations."
      metadataStrip={[
        { label: "Project", value: "Web Platform" },
        { label: "Status", value: "Live", isHighlight: true },
        { label: "Client", value: "Trionyx" },
      ]}
      heroImage={{
        src: "/portfolio/trionyx-operations.png",
        alt: "Trionyx Central Operations & Inventory Telemetry Platform",
        width: 1920,
        height: 1080,
        captionLeft: "OPERATIONS SUMMARY · LIVE TELEMETRY",
        captionRight: "DOMAIN BALANCES & INVENTORY CONTROL",
      }}
      overview={[
        "Trionyx brings product discovery, dealer operations and after-sales support into one platform for an automotive protection brand. Customers can browse products and verify warranties, while dealers and distributors manage stock, product requests and warranty registrations.",
        "GrowXLabs engineered a dedicated digital platform centered around their physical catalog. The system combines clear product categorization, technical specifications, direct inquiry pipelines, and an internal administrative surface to keep catalog data and inquiries synchronized.",
      ]}
      specificationsHeaderLabel="Module"
      specificationsHeaderValue="Trionyx Platform"
      specifications={TRIONYX_SPECIFICATIONS}
      features={TRIONYX_FEATURES}
      architecture={<TrionyxArchitecture />}
    />
  );
}
