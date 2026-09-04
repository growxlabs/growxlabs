import { supabaseAdmin } from "@/lib/supabase/admin";
import DispatchAdminClient from "./DispatchAdminClient";

export const revalidate = 0;

export default async function DispatchAdminPage() {
  let subscribers: any[] = [];
  let totalSubscribers = 0;

  try {
    const { data, count, error } = await supabaseAdmin
      .from("wish_subscribers")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (!error && data) {
      subscribers = data;
      totalSubscribers = count || data.length;
    }
  } catch (err) {
    console.error("Failed to load subscribers for dispatch:", err);
  }

  // Pre-configured flagship editions ready to dispatch
  const editions = [
    {
      slug: "gpt-6-astra",
      title: "GPT-6 Astra: Inside OpenAI’s Leap to Autonomous Computer Use",
      deck: "Fast, capable of directly steering desktop operating systems, and OpenAI's first frontier model to breach the Critical cybersecurity capability threshold.",
      cover_image: "/images/blog-gpt6-astra-openai-hero.png",
      excerpt: "OpenAI has officially unveiled GPT-6 Astra, shifting frontier intelligence from passive conversational chatbots into active desktop computer agents setting world records on OSWorld 2.0 (92.4%) and BenchCAD (95.9%). Read our full architectural breakdown.",
      category: "Frontier AI",
      date: "September 4, 2026",
    },
    {
      slug: "claude-fable-5-mythos-5-anthropic-models",
      title: "Claude Fable 5 & Mythos 5: Anthropic’s Architecture Shift",
      deck: "How Anthropic built a multi-agent harness optimized for long-horizon repository refactoring.",
      cover_image: "/images/blog-claude-fable-5-mythos-5.png",
      excerpt: "Anthropic unveiled Claude Fable 5 and Mythos 5 with radical 75% prompt caching discounts and deep multi-hour codebase context preservation. Here is what system architects need to know.",
      category: "Architecture",
      date: "August 2026",
    },
    {
      slug: "nvidia-vision-agentic-to-useful-ai",
      title: "Nvidia's Agentic Leap: Beyond Traditional GPU Compute",
      deck: "Analyzing Nvidia's multi-billion dollar expansion into end-to-end model distribution and agent orchestration.",
      cover_image: "/images/blog-ai-coding-landscape.png",
      excerpt: "Nvidia is no longer just selling silicon. Its strategic acquisitions and agentic software layers point toward an integrated stack where hardware and autonomous workflows fuse.",
      category: "Infrastructure",
      date: "August 2026",
    },
  ];

  return (
    <DispatchAdminClient
      initialSubscribers={subscribers}
      totalSubscribers={totalSubscribers}
      editions={editions}
    />
  );
}
