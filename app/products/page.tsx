"use client";

import React from "react";
import { ProductCatalogTemplate, ProductItem } from "@/components/marketing/ProductCatalogTemplate";

// ══════════════════════════════════════════════════════════════════
// Products Catalog Definition
// Active: ResumeForgeAI™ & Pipper™
// Remaining products preserved as comments for future activation
// ══════════════════════════════════════════════════════════════════

const PRODUCTS: ProductItem[] = [
  {
    name: "ResumeForgeAI™",
    image: "/images/products/resumeforgeai.png",
    description:
      "An AI-native resume engineering platform designed for software engineers and technical leaders. It builds role-specific resumes with granular version branching, ATS semantic match benchmarking, and publication-ready typography. The system ensures every bullet point is grounded in verifiable impact metrics tailored to target job descriptions.",
    href: "https://resumeforgeai.in?utm_source=growxlabswebsite",
    isExternal: true,
  },
  {
    name: "Pipper™",
    image: "/images/products/pipper.png",
    description:
      "A desktop workspace for running and seeing autonomous coding agents work together. Pipper orchestrates parallel model execution, visualizes live file changes across branches, and runs deterministic AST compilations before merging into your codebase. Its companion dashboard gives full visibility over agent prompts, test coverage, and sandbox rollbacks.",
    href: "https://pipper.dev?utm_source=growxlabswebsite",
    isExternal: true,
  },
  /*
  {
    name: "RecruitAI™",
    image: "/images/products/recruitai.png",
    description:
      "An end-to-end recruitment intelligence platform that automates technical candidate screening, scorecard evaluation, and applicant communication. It matches applicant portfolios against customized engineering rubrics with verifiable proof of work, enabling hiring teams to identify top engineering talent in minutes.",
    href: "https://recruitaitech.in?utm_source=growxlabswebsite",
    isExternal: true,
  },
  {
    name: "UniversalAI™",
    image: "/images/products/universalai.png",
    description:
      "A unified AI gateway enabling seamless switching, side-by-side comparison, and automated intent routing across leading frontier models. UniversalAI allows you to choose the exact reasoning depth and latency profile needed for every conversation, drastically reducing API costs while guaranteeing high-precision outputs.",
    href: "/portfolio/universalai",
    isExternal: false,
  },
  {
    name: "GrowX Crawl™",
    image: "/portfolio/growx-crawl.png",
    description:
      "A local-first web research tool built inside GrowXLabs to discover companies, crawl websites, extract structured information, and keep verifiable source evidence behind every finding.",
    href: "/portfolio/growx-crawl",
    isExternal: false,
  },
  {
    name: "GrowX Deepfake™",
    image: "/images/products/deepfake.png",
    description:
      "Enterprise multimodal intelligence engine detecting AI deepfakes across live video calls, synthetic audio streams, and manipulated identity media with sub-50ms inference latency.",
    href: "/ailab/growx-deepfake-multimodal-intelligence",
    isExternal: false,
  },
  */
];

export default function ProductsPage() {
  return (
    <ProductCatalogTemplate
      title="Products"
      viewingText="PRODUCTS"
      exploreText="PLATFORMS"
      tagline="PROPRIETARY PRODUCTS"
      showToggle={false}
      items={PRODUCTS}
      ctaTitle={
        <>
          Interested<br />in our Products?
        </>
      }
      ctaDescription="Let's discuss how our proprietary AI systems can deploy inside your infrastructure."
      metaLeft="// END OF PRODUCTS"
      metaRight={`${PRODUCTS.length} PROPRIETARY PLATFORMS ACTIVE`}
    />
  );
}
