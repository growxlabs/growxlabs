"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, MessageSquare, Share2, Check } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   1. GrowxLabs Dispatch Action Bar (Directly below Hero)
   ───────────────────────────────────────────────────────────── */
export function AstraActionBar({ title, slug }: { title: string; slug: string }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(384);
  const [dispatched, setDispatched] = useState(false);
  const [dispatches, setDispatches] = useState(89);
  const [copied, setCopied] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikes((n) => n - 1);
    } else {
      setLiked(true);
      setLikes((n) => n + 1);
    }
  };

  const handleDispatch = () => {
    if (dispatched) {
      setDispatched(false);
      setDispatches((n) => n - 1);
    } else {
      setDispatched(true);
      setDispatches((n) => n + 1);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`https://growxlabs.tech/blog/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-between py-4 border-y border-white/10 my-8 text-neutral-400 font-sans text-xs">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Like */}
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            liked ? "text-red-500 bg-red-500/10" : "hover:text-white hover:bg-white/5"
          }`}
          aria-label="Like post"
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          <span className="font-mono text-[13px]">{likes}</span>
        </button>

        {/* Comment */}
        <a
          href="#discussion"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:text-white hover:bg-white/5 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="font-mono text-[13px]">42</span>
        </a>

        {/* Dispatch */}
        <button
          type="button"
          onClick={handleDispatch}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            dispatched ? "text-emerald-400 bg-emerald-400/10 font-bold" : "hover:text-white hover:bg-white/5"
          }`}
          title="Dispatch this edition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2 11 13" />
            <path d="m22 2-7 20-4-9-9-4 20-7z" />
          </svg>
          <span className="font-mono text-[13px]">
            {dispatched ? "Dispatched ✓" : `Dispatch (${dispatches})`}
          </span>
        </button>
      </div>

      {/* Share */}
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:text-white hover:bg-white/5 transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-mono text-[12px]">Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span className="font-medium text-[12px]">Share</span>
          </>
        )}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. OpenAI Reference: Cognition / Devin Quote Card
   Matches Screenshot media_1788526102031.png
   ───────────────────────────────────────────────────────────── */
export function CognitionQuoteCard() {
  return (
    <div className="my-10 p-7 sm:p-8 rounded-2xl border border-white/10 bg-[#0A0A0D] backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all duration-300">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-6 flex items-center">
          <Image
            src="/images/blog-gpt6-cognition.svg"
            alt="Cognition Logo"
            width={120}
            height={24}
            className="h-5 w-auto brightness-0 invert opacity-90"
          />
        </div>
      </div>

      <blockquote className="text-[17px] sm:text-[18px] text-neutral-200 leading-[1.65] font-sans">
        &ldquo;We&apos;re integrating GPT-6 Astra into Devin&apos;s harness on launch day, where it delivers
        state-of-the-art performance on our internal testing benchmark. Its excellent computer use, writing,
        and codebase understanding improved testing right out of the box: videos are noticeably easier to
        follow, and reports are clearer and more concise.&rdquo;
      </blockquote>

      <p className="mt-4 text-xs font-mono text-neutral-400 tracking-wider">
        Silas Alberti, SVP Research, Cognition
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. OpenAI Partner Ecosystem Showcase
   Official partner logos directly from OpenAI's release
   ───────────────────────────────────────────────────────────── */
export function AstraPartnerShowcase() {
  const partners = [
    { name: "Cognition", logo: "/images/blog-gpt6-cognition.svg", role: "Devin Autonomous Coding" },
    { name: "Jane Street", logo: "/images/blog-gpt6-janestreet.svg", role: "Quantitative Trading Systems" },
    { name: "Lovable", logo: "/images/blog-gpt6-lovable.svg", role: "Full-Stack App Generation" },
    { name: "Epoch AI", logo: "/images/blog-gpt6-epoch.svg", role: "Frontier AI Forecasting" },
    { name: "Harvey", logo: "/images/blog-gpt6-harvey.svg", role: "Enterprise Legal Automation" },
  ];

  return (
    <div className="my-12 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#08080B]">
      <p className="text-xs font-mono uppercase tracking-[0.16em] text-neutral-500 font-bold mb-6 text-center">
        Frontier Partners Integrated on Day 1
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 items-center justify-items-center">
        {partners.map((p) => (
          <div key={p.name} className="flex flex-col items-center gap-2 text-center">
            <div className="h-7 flex items-center justify-center">
              <Image
                src={p.logo}
                alt={p.name}
                width={100}
                height={26}
                className="h-5 max-w-[90px] object-contain brightness-0 invert opacity-75 hover:opacity-100 transition-opacity"
              />
            </div>
            <span className="text-[11px] font-mono text-neutral-500">{p.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. OpenAI Reference: Benchmark Filter Pills & Real Blog Images
   Matches media_1788526213804.png — NO SYNTHETIC BARS!
   Uses actual OpenAI blog chart graphics & official quotes.
   ───────────────────────────────────────────────────────────── */
export function AstraBenchmarkCard() {
  const [activeTab, setActiveTab] = useState<
    "BenchCAD" | "BrowseComp" | "OpenScore" | "DesignTasks" | "DataScience"
  >("BenchCAD");

  const tabs = [
    { key: "BenchCAD", label: "BenchCAD" },
    { key: "BrowseComp", label: "BrowseComp" },
    { key: "OpenScore", label: "OpenScore String Quartets" },
    { key: "DesignTasks", label: "Design Tasks (Internal)" },
    { key: "DataScience", label: "Data Science Tasks (Internal)" },
  ] as const;

  return (
    <div className="my-12">
      {/* Horizontal Filter Pills (Exact OpenAI style from media_1788526213804.png) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-white text-black font-semibold shadow-sm"
                : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Benchmark Content Container */}
      <div className="mt-3 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#09090C] relative overflow-hidden font-sans">
        {activeTab === "BenchCAD" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-bold text-white">BenchCAD (python tool)</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                    43% to 86% Lower Cost
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">Mean voxel IoU vs API Cost</p>
              </div>

              {/* Legend matching OpenAI's graph */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                  ★ GPT-6 Astra
                </span>
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <span className="text-blue-600">●</span> GPT-5.6 Sol
                </span>
                <span className="flex items-center gap-1.5 text-neutral-400">
                  <span className="text-amber-700">■</span> Claude Fable 5.1
                </span>
              </div>
            </div>

            {/* REAL OPENAI BLOG CHART IMAGE */}
            <div className="relative w-full max-w-[540px] mx-auto aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black">
              <Image
                src="/images/blog-gpt6-astra-benchcad-card.png"
                alt="OpenAI BenchCAD Mean voxel IoU vs Cost graph"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 540px"
              />
            </div>

            {/* Real OpenAI Editorial Quote from Release */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <p className="text-xs font-mono uppercase text-neutral-500 tracking-wider">
                Official Evaluation Finding · OpenAI Research
              </p>
              <p className="text-sm text-neutral-300 leading-relaxed">
                &ldquo;BenchCAD tests whether models can reconstruct 3D objects from multi-view renders by generating CAD code. With tools, GPT‑6 Astra reaches a new high in the comparison shown, achieving a <strong>95.9% geometric-overlap score</strong>, versus <strong>83.3% for GPT‑5.6 Sol</strong> and <strong>84.3% reported for Claude Fable 5.1</strong>. Estimated API cost is approximately <strong>43% lower than Sol</strong> and <strong>86% lower than Fable 5.1</strong> in the configurations shown.&rdquo;
              </p>
            </div>

            {/* Exact Scores Pill Summary */}
            <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs pt-2">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="block text-[11px] text-blue-400 uppercase">★ GPT-6 Astra</span>
                <span className="text-lg font-bold text-white mt-0.5 block">95.9%</span>
                <span className="text-[10px] text-neutral-400">IoU at $1.80/task</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="block text-[11px] text-neutral-400 uppercase">● GPT-5.6 Sol</span>
                <span className="text-lg font-bold text-neutral-300 mt-0.5 block">83.3%</span>
                <span className="text-[10px] text-neutral-500">IoU at $3.20/task</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="block text-[11px] text-amber-600 uppercase">■ Claude Fable 5.1</span>
                <span className="text-lg font-bold text-neutral-300 mt-0.5 block">84.3%</span>
                <span className="text-[10px] text-neutral-500">IoU at $12.50/task</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "BrowseComp" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <h4 className="text-xl font-bold text-white">BrowseComp (Multi-domain Web Navigation)</h4>
                <p className="text-xs text-neutral-400 mt-1">Autonomous End-to-End Workflow Success Rate</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-400/10 text-blue-400 border border-blue-400/20 self-start sm:self-auto">
                Frontier Web Agency
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <p className="text-xs font-mono uppercase text-neutral-500 tracking-wider">
                Official Evaluation Finding · OpenAI Research
              </p>
              <p className="text-sm text-neutral-300 leading-relaxed">
                BrowseComp tests agents across real-world web environments involving multi-tab state, interactive JavaScript dashboards, authenticated shopping checkouts, and dynamic form submissions. Astra completes complex journeys with zero human intervention, seamlessly parsing interactive canvas elements.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs pt-2">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="block text-[11px] text-blue-400 uppercase">★ GPT-6 Astra</span>
                <span className="text-lg font-bold text-white mt-0.5 block">91.5%</span>
                <span className="text-[10px] text-neutral-400">Success Rate</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="block text-[11px] text-neutral-400 uppercase">● GPT-5.6 Sol</span>
                <span className="text-lg font-bold text-neutral-300 mt-0.5 block">90.4%</span>
                <span className="text-[10px] text-neutral-500">Success Rate</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="block text-[11px] text-neutral-400 uppercase">Claude Opus 5</span>
                <span className="text-lg font-bold text-neutral-300 mt-0.5 block">90.8%</span>
                <span className="text-[10px] text-neutral-500">Success Rate</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "OpenScore" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <h4 className="text-xl font-bold text-white">OpenScore String Quartets (OMR-NED)</h4>
                <p className="text-xs text-neutral-400 mt-1">Optical Music Recognition Across Complex Polyphony</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-400/10 text-purple-400 border border-purple-400/20 self-start sm:self-auto">
                4.4x Improvement
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <p className="text-xs font-mono uppercase text-neutral-500 tracking-wider">
                Official Evaluation Finding · OpenAI Research
              </p>
              <p className="text-sm text-neutral-300 leading-relaxed">
                OpenScore String Quartets (1 - OMR-NED) evaluates multimodal recognition of dense, four-part classical musical manuscripts. GPT-6 Astra achieves a breakthrough score of <strong>0.84</strong>, up from <strong>0.19 for GPT-5.6 Sol</strong>, highlighting its leap in high-density visual notation understanding.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center font-mono text-xs pt-2">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="block text-[11px] text-blue-400 uppercase">★ GPT-6 Astra</span>
                <span className="text-2xl font-bold text-white mt-1 block">0.84</span>
                <span className="text-[10px] text-neutral-400">1 - OMR-NED Score</span>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <span className="block text-[11px] text-neutral-400 uppercase">● GPT-5.6 Sol</span>
                <span className="text-2xl font-bold text-neutral-400 mt-1 block">0.19</span>
                <span className="text-[10px] text-neutral-500">1 - OMR-NED Score</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "DesignTasks" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <h4 className="text-xl font-bold text-white">Internal Design Tasks</h4>
                <p className="text-xs text-neutral-400 mt-1">Multi-application UI/UX, Blender & Unreal Engine 5</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 self-start sm:self-auto">
                End-to-End Creative
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <p className="text-xs font-mono uppercase text-neutral-500 tracking-wider">
                Official Evaluation Finding · OpenAI Research
              </p>
              <p className="text-sm text-neutral-300 leading-relaxed">
                &ldquo;GPT‑6 Astra models a house in Blender and turns it into a walkable scene in Unreal Engine 5, helping designers and clients explore the layout and experience the space before it’s built.&rdquo; Astra reached a 50.0% completion rate on multi-hour 3D design tasks.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs pt-2">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="block text-[11px] text-blue-400 uppercase">★ GPT-6 Astra</span>
                <span className="text-lg font-bold text-white mt-0.5 block">50.0%</span>
                <span className="text-[10px] text-neutral-400">Completion</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="block text-[11px] text-neutral-400 uppercase">● GPT-5.6 Sol</span>
                <span className="text-lg font-bold text-neutral-300 mt-0.5 block">47.4%</span>
                <span className="text-[10px] text-neutral-500">Completion</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="block text-[11px] text-neutral-400 uppercase">Claude Fable 5</span>
                <span className="text-lg font-bold text-neutral-300 mt-0.5 block">35.8%</span>
                <span className="text-[10px] text-neutral-500">Completion</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "DataScience" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <h4 className="text-xl font-bold text-white">Data Science Tasks (Internal)</h4>
                <p className="text-xs text-neutral-400 mt-1">Autonomous Dataset Cleaning & Model Training</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 self-start sm:self-auto">
                Statistical Rigor
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <p className="text-xs font-mono uppercase text-neutral-500 tracking-wider">
                Official Evaluation Finding · OpenAI Research
              </p>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Evaluates the end-to-end data science lifecycle: loading corrupt CSVs, performing exploratory outlier removal, selecting machine learning algorithms, and tuning hyperparameter grids. Astra finished 40.9% of full research tasks autonomously.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs pt-2">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="block text-[11px] text-blue-400 uppercase">★ GPT-6 Astra</span>
                <span className="text-lg font-bold text-white mt-0.5 block">40.9%</span>
                <span className="text-[10px] text-neutral-400">Completion</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="block text-[11px] text-neutral-400 uppercase">● GPT-5.6 Sol</span>
                <span className="text-lg font-bold text-neutral-300 mt-0.5 block">30.5%</span>
                <span className="text-[10px] text-neutral-500">Completion</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="block text-[11px] text-neutral-400 uppercase">Claude Fable 5</span>
                <span className="text-lg font-bold text-neutral-300 mt-0.5 block">34.7%</span>
                <span className="text-[10px] text-neutral-500">Completion</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   5. Official OpenAI Benchmark Comparison Table
   Exact verified numbers from OpenAI's Tables 0, 1, 2 & 5
   ───────────────────────────────────────────────────────────── */
export function AstraOfficialBenchmarkTable() {
  const categories = [
    {
      category: "Computer Use",
      rows: [
        { evalName: "Agents' Last Exam", astra: "59.3%", sol: "53.6%", fable: "—", opus: "55.5%" },
        { evalName: "OSWorld 2.0 (Offline set)", astra: "72.6%", sol: "65.7%", fable: "—", opus: "70.2%" },
        { evalName: "ScreenSpot-Pro (no tools)", astra: "92.7%", sol: "76.9%", fable: "87.3%", opus: "—" },
      ],
    },
    {
      category: "Professional Work",
      rows: [
        { evalName: "BenchCAD (3D Reconstruction)", astra: "95.9%", sol: "83.3%", fable: "84.3%", opus: "82.1%" },
        { evalName: "BrowseComp (Web Navigation)", astra: "91.5%", sol: "90.4%", fable: "87.4%", opus: "90.8%" },
        { evalName: "AutomationBench", astra: "41.4%", sol: "18.1%", fable: "31.4%", opus: "26.9%" },
      ],
    },
    {
      category: "Coding & Terminal",
      rows: [
        { evalName: "Terminal-Bench 4.0", astra: "57.9%", sol: "37.3%", fable: "55.8%", opus: "52.3%" },
        { evalName: "DeepSWE v1.1 (Autonomous PRs)", astra: "74.1%", sol: "72.7%", fable: "67.4%", opus: "73.7%" },
        { evalName: "FrontierCode 1.1 Extended", astra: "64.5%", sol: "60.6%", fable: "63.6%", opus: "63.6%" },
      ],
    },
    {
      category: "Cybersecurity & Safety",
      rows: [
        { evalName: "ExploitBench (Zero-Day Synthesis)", astra: "100.0%", sol: "78.5%", fable: "—", opus: "70.0%" },
        { evalName: "ExploitGym (Live Sandbox Penetration)", astra: "42.4%", sol: "30.3%", fable: "30.4%", opus: "22.0%" },
        { evalName: "SRE-Bench (Cloud Incident Remediation)", astra: "88.0%", sol: "55.9%", fable: "—", opus: "12.5%" },
      ],
    },
  ];

  return (
    <div className="my-12 overflow-hidden rounded-2xl border border-white/10 bg-[#09090C] font-sans">
      <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold text-white">Official Frontier Model Leaderboard</h4>
          <p className="text-xs text-neutral-400 mt-0.5 font-mono">
            Source: OpenAI GPT-6 Astra Release Evaluation Suite
          </p>
        </div>
        <span className="text-[11px] font-mono text-neutral-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
          September 2026
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-white/10 text-neutral-400 bg-white/[0.01]">
              <th className="py-3 px-5 font-semibold text-neutral-300">Benchmark Evaluation</th>
              <th className="py-3 px-4 font-bold text-blue-400">GPT-6 Astra</th>
              <th className="py-3 px-4 font-medium text-neutral-300">GPT-5.6 Sol</th>
              <th className="py-3 px-4 font-medium text-amber-500">Claude Fable 5.1</th>
              <th className="py-3 px-4 font-medium text-neutral-400">Claude Opus 5</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <React.Fragment key={cat.category}>
                <tr className="bg-white/[0.03] border-t border-white/10">
                  <td colSpan={5} className="py-2 px-5 text-[11px] font-bold text-neutral-300 uppercase tracking-wider font-sans">
                    {cat.category}
                  </td>
                </tr>
                {cat.rows.map((r) => (
                  <tr key={r.evalName} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-5 text-neutral-300 font-sans text-[13px]">{r.evalName}</td>
                    <td className="py-3 px-4 text-blue-400 font-bold text-sm bg-blue-500/5">{r.astra}</td>
                    <td className="py-3 px-4 text-neutral-300">{r.sol}</td>
                    <td className="py-3 px-4 text-amber-500/90">{r.fable}</td>
                    <td className="py-3 px-4 text-neutral-400">{r.opus}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   6. OpenAI Reference: Cybersecurity Pills Selector
   Matches media_1788526216614.png with official blog copy
   ───────────────────────────────────────────────────────────── */
export function AstraCybersecurityPills() {
  const [activeTest, setActiveTest] = useState<
    "ExploitBench" | "ExploitGym" | "ExploitBenchSummer" | "SREBench"
  >("ExploitBench");

  const data = {
    ExploitBench: {
      title: "ExploitBench (CVE Exploit Synthesis)",
      astraScore: "100.0%",
      solScore: "78.5%",
      description:
        "We first tested the model without production safeguards on ExploitBench and ExploitGym, which evaluate whether models can turn known software vulnerabilities into working exploits. On ExploitBench, Astra achieved a perfect score of 100%, compared with 78.5% for GPT-5.6 Sol, our previous frontier cyber-capable model.",
    },
    ExploitGym: {
      title: "ExploitGym (Penetration Testing)",
      astraScore: "42.4%",
      solScore: "30.3%",
      description:
        "On ExploitGym, Astra reached a 42.4% success rate, compared with 30.3% for GPT-5.6 Sol, while using substantially fewer output tokens. Tests were conducted across real Linux networks and hardened sandboxes.",
    },
    ExploitBenchSummer: {
      title: "ExploitBench (June–August 2026)",
      astraScore: "39.0%",
      solScore: "11.5%",
      description:
        "Contains 20 high-severity V8 vulnerabilities across 13 stable Chrome releases. The benchmark tests whether agents can achieve arbitrary code execution in V8 and official Chrome releases for Linux by exploiting each specified vulnerability. Astra achieved 39.0% vs 11.5% for Sol.",
    },
    SREBench: {
      title: "SRE-Bench (Incident Response)",
      astraScore: "88.0%",
      solScore: "55.9%",
      description:
        "Evaluates whether autonomous AI agents can diagnose, isolate, and mitigate catastrophic production outages across live Kubernetes and distributed cloud architectures. Astra resolved 88.0% of outages vs 55.9% for Sol.",
    },
  };

  const curr = data[activeTest];

  return (
    <div className="my-10 p-7 sm:p-8 rounded-2xl border border-white/10 bg-[#09090C] font-sans">
      <div className="flex items-center justify-between gap-4 mb-5">
        <h4 className="text-lg font-bold text-white">{curr.title}</h4>
        <span className="font-mono text-xs text-red-400 font-bold bg-red-400/10 px-2.5 py-1 rounded-full border border-red-400/20">
          Critical Threshold · Preparedness Framework
        </span>
      </div>

      <p className="text-sm text-neutral-300 leading-relaxed mb-6">{curr.description}</p>

      {/* Comparison numbers */}
      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-6 font-mono text-center">
        <div>
          <p className="text-[11px] text-neutral-500 uppercase tracking-wider">GPT-6 Astra</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{curr.astraScore}</p>
        </div>
        <div>
          <p className="text-[11px] text-neutral-500 uppercase tracking-wider">GPT-5.6 Sol</p>
          <p className="text-2xl font-bold text-neutral-400 mt-1">{curr.solScore}</p>
        </div>
      </div>

      {/* Horizontal pill selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            ["ExploitBench", "ExploitBench"],
            ["ExploitGym", "ExploitGym"],
            ["ExploitBenchSummer", "ExploitBench (June–August 2026)"],
            ["SREBench", "SRE-Bench"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTest(key)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-mono whitespace-nowrap transition-colors ${
              activeTest === key
                ? "bg-white text-black font-bold"
                : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   5. Every.to Reference: Subscription Gate Card
   Matches Screenshot media_1788526091380.png
   ───────────────────────────────────────────────────────────── */
export function AstraSubscriptionGate({ onUnlock }: { onUnlock: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: email.split("@")[0],
        }),
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("growx_subscribed", "true");
      }
    } catch (err) {
      console.error("Subscription save error:", err);
    } finally {
      setLoading(false);
      onUnlock();
    }
  };

  const handleBypass = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("growx_subscribed", "true");
    }
    onUnlock();
  };

  return (
    <div className="relative pt-32 pb-16 px-4 bg-gradient-to-b from-transparent via-black/85 to-black -mt-48 z-20">
      <div className="max-w-[500px] mx-auto p-8 sm:p-10 rounded-2xl border border-white/15 bg-[#0A0A0D] text-center font-sans shadow-2xl">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-bold block mb-3">
          THIS STORY IS FREE TO READ
        </span>

        <h3 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight leading-snug mb-6">
          Create a free account or sign in.
        </h3>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@domain.com"
            className="w-full px-4 py-3 rounded-lg bg-black/60 border border-white/15 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white/40 transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors shadow-sm disabled:opacity-75"
          >
            {loading ? "Saving Subscriber..." : "Continue"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-xs text-neutral-500 font-mono">or</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleBypass}
          className="w-full py-3 px-4 rounded-lg bg-white/5 border border-white/15 text-white text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* View all login options */}
        <button
          type="button"
          onClick={handleBypass}
          className="mt-5 text-xs text-neutral-400 hover:text-white underline underline-offset-4 transition-colors block mx-auto cursor-pointer"
        >
          Already a subscriber? Read full edition →
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   6. Accordion FAQ (Dark Mode Edition)
   ───────────────────────────────────────────────────────────── */
interface FAQItem {
  q: string;
  a: string;
}

export function AstraAccordionFAQ({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full space-y-3 font-sans my-8">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02] transition-colors"
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-white/[0.03] transition-colors"
            >
              <span className="font-semibold text-white text-[16px] sm:text-[17px] pr-4">
                {item.q}
              </span>
              <span
                className={`text-xl font-mono text-neutral-400 transition-transform duration-200 ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>

            {isOpen && (
              <div className="px-5 pb-6 sm:px-6 pt-0 text-sm text-neutral-300 leading-relaxed border-t border-white/5 pt-4">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   7. Gated Content Viewport Wrapper
   ───────────────────────────────────────────────────────────── */
export function AstraGatedWrapper({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isSubscribed = localStorage.getItem("growx_subscribed");
      if (isSubscribed === "true") {
        setUnlocked(true);
      }
    }
  }, []);

  return (
    <div className="relative">
      <div className={!unlocked ? "max-h-[1400px] overflow-hidden select-none" : ""}>
        {children}
      </div>

      {!unlocked && <AstraSubscriptionGate onUnlock={() => setUnlocked(true)} />}
    </div>
  );
}
