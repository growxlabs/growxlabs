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
      deck: "A look at how OpenAI’s latest model controls desktop applications and what that means for everyday software work.",
      cover_image: "/images/blog-gpt6-astra-openai-hero.png",
      excerpt: "We explain the model’s computer-use capabilities, the evidence behind its performance, and the practical limits teams should understand.",
      category: "Artificial intelligence",
      date: "September 4, 2026",
    },
    {
      slug: "claude-fable-5-mythos-5-anthropic-models",
      title: "Claude Fable 5 & Mythos 5: Anthropic’s Architecture Shift",
      deck: "How Anthropic’s latest models handle larger codebases and longer software tasks.",
      cover_image: "/images/blog-claude-fable-5-mythos-5.png",
      excerpt: "A practical overview of the reported changes, their likely impact on development teams, and the questions that remain open.",
      category: "Software development",
      date: "August 2026",
    },
    {
      slug: "nvidia-vision-agentic-to-useful-ai",
      title: "How Nvidia Is Expanding Beyond GPU Hardware",
      deck: "What Nvidia’s move beyond chips means for the tools and infrastructure used to build AI products.",
      cover_image: "/images/blog-ai-coding-landscape.png",
      excerpt: "We break down the company’s hardware, software, and product strategy in clear terms, with a focus on the practical consequences for builders.",
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
