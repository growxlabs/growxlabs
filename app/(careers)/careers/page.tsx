import type { Metadata } from "next";
import { CareersContent } from "./CareersContent";

export const metadata: Metadata = {
  title: "Careers | GrowXLabs — AI-Native Product Studio",
  description: "Join GrowXLabs, an AI-native product studio building intelligent software, agentic systems, automation platforms, and enterprise products for ambitious companies.",
  alternates: { canonical: "https://careers.growxlabs.tech" },
};

export default function CareersPage() {
  return <CareersContent />;
}
