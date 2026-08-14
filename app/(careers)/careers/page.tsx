import type { Metadata } from "next";
import { CareersContent } from "./CareersContent";

export const metadata: Metadata = {
  title: "Careers | GrowxLabs — AI-Native Product Studio",
  description: "Join GrowxLabs, an AI-native product studio building intelligent software, agentic applications, automation platforms, and enterprise products for ambitious companies.",
  alternates: { canonical: "https://careers.growxlabs.tech" },
};

export default function CareersPage() {
  return <CareersContent />;
}
