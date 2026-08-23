"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Terminal, Network, FileText, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";

// ══════════════════════════════════════════════════════════════════
// Minimal Integrated Product Visual Motifs (Clean black/translucent line art)
// ══════════════════════════════════════════════════════════════════

/** 3RDMIND: Abstract connected leadership nodes */
function MindNodesVisual() {
  return (
    <div className="w-full h-16 rounded-xl bg-black/[0.04] border border-black/10 flex items-center justify-center p-2">
      <svg viewBox="0 0 160 50" className="w-full h-full text-black/80" fill="none" stroke="currentColor">
        {/* Connecting Lines */}
        <line x1="80" y1="12" x2="35" y2="38" strokeWidth="1.2" strokeDasharray="3 2" className="text-black/40" />
        <line x1="80" y1="12" x2="80" y2="38" strokeWidth="1.2" className="text-black/50" />
        <line x1="80" y1="12" x2="125" y2="38" strokeWidth="1.2" strokeDasharray="3 2" className="text-black/40" />
        
        {/* Top Central Leader Node */}
        <circle cx="80" cy="12" r="6" fill="#000000" />
        <circle cx="80" cy="12" r="2.5" fill="#bdefff" />

        {/* Subordinate Agent Nodes */}
        <circle cx="35" cy="38" r="5" fill="#000000" />
        <circle cx="80" cy="38" r="5" fill="#000000" />
        <circle cx="125" cy="38" r="5" fill="#000000" />
      </svg>
    </div>
  );
}

/** Pipper: Minimal terminal / workspace motif */
function PipperWorkspaceVisual() {
  return (
    <div className="w-full h-16 rounded-xl bg-black/[0.04] border border-black/10 flex flex-col justify-center px-3 py-2 space-y-1.5 font-mono text-[9px]">
      <div className="flex items-center justify-between bg-black/10 rounded px-2 py-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-black/70" />
          <span className="text-black/80 font-bold">agent://codex-main</span>
        </div>
        <span className="w-8 h-1 bg-black/30 rounded" />
      </div>
      <div className="flex items-center justify-between bg-black/5 rounded px-2 py-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-black/40" />
          <span className="text-black/60">agent://claude-code</span>
        </div>
        <span className="w-5 h-1 bg-black/20 rounded" />
      </div>
    </div>
  );
}

/** ResumeForgeAI: Subtle document / resume version composition */
function ResumeDocumentVisual() {
  return (
    <div className="w-full h-16 rounded-xl bg-black/[0.04] border border-black/10 flex items-center justify-center px-4 py-2">
      <div className="w-28 h-12 bg-white/60 border border-black/15 rounded-md p-1.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <div className="w-5 h-2 bg-black/80 rounded-[2px]" />
          <span className="text-[7px] font-mono font-bold text-black/60 bg-black/10 px-1 rounded">v2.4</span>
        </div>
        <div className="space-y-1">
          <div className="w-full h-1 bg-black/30 rounded-full" />
          <div className="w-3/4 h-1 bg-black/20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** UniversalAI: 3 conversational model blocks converging into one response */
function UniversalChatVisual() {
  return (
    <div className="w-full h-16 rounded-xl bg-black/[0.04] border border-black/10 flex items-center justify-between px-3 py-2">
      {/* 3 Model Inputs */}
      <div className="flex flex-col gap-1">
        <span className="text-[7.5px] font-mono font-bold bg-black/10 text-black px-1.5 py-0.5 rounded">GPT-5</span>
        <span className="text-[7.5px] font-mono font-bold bg-black/10 text-black px-1.5 py-0.5 rounded">Claude 3.5</span>
        <span className="text-[7.5px] font-mono font-bold bg-black/10 text-black px-1.5 py-0.5 rounded">Gemini</span>
      </div>
      
      {/* Arrow Divider */}
      <span className="text-black/40 text-xs font-mono">→</span>

      {/* Unified Response Bubble */}
      <div className="bg-black text-[#bdefff] text-[8px] font-mono font-bold px-2.5 py-2 rounded-lg flex items-center gap-1 shadow-xs">
        <span>Combined Output</span>
      </div>
    </div>
  );
}

/** RecruitAI: 3 profile comparison rows with one selected */
function RecruitCandidateVisual() {
  return (
    <div className="w-full h-16 rounded-xl bg-black/[0.04] border border-black/10 flex flex-col justify-center px-3 py-1.5 space-y-1">
      <div className="flex items-center justify-between px-1.5 py-0.5 opacity-40">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-black/60" />
          <div className="w-14 h-1 bg-black/50 rounded" />
        </div>
        <span className="text-[7px] font-mono text-black/60">82%</span>
      </div>
      <div className="flex items-center justify-between bg-black text-white px-2 py-1 rounded-md shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#bdefff]" />
          <div className="w-16 h-1 bg-white/90 rounded" />
        </div>
        <span className="text-[7.5px] font-mono font-bold text-[#bdefff]">96% Match</span>
      </div>
      <div className="flex items-center justify-between px-1.5 py-0.5 opacity-40">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-black/60" />
          <div className="w-12 h-1 bg-black/50 rounded" />
        </div>
        <span className="text-[7px] font-mono text-black/60">78%</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Product Family Configuration
// ══════════════════════════════════════════════════════════════════

const products = [
  {
    title: "3RDMIND",
    category: "// STARTUP SIMULATION",
    description: "AI leaders take different roles, work together, make decisions and see how the startup responds.",
    icon: Network,
    visual: MindNodesVisual,
    href: "/contact",
  },
  {
    title: "Pipper",
    category: "// HARNESS",
    description: "A desktop workspace for running coding agents and seeing their work together in one place.",
    icon: Terminal,
    visual: PipperWorkspaceVisual,
    href: "https://pipper.dev?utm_source=growxlabswebsite",
  },
  {
    title: "ResumeForgeAI",
    category: "// DEVELOPERS",
    description: "Build and improve role-specific resumes with clear control over every version.",
    icon: FileText,
    visual: ResumeDocumentVisual,
    href: "https://resumeforgeai.in?utm_source=growxlabswebsite",
  },
  {
    title: "UniversalAI",
    category: "// MULTI-MODEL CHAT",
    description: "Chat with different AI models from one place and choose the model you want for each conversation.",
    icon: MessageSquare,
    visual: UniversalChatVisual,
    href: "/contact",
  },
  {
    title: "RecruitAI",
    category: "// RECRUITERS",
    description: "Review candidates, compare applications and manage communication throughout hiring.",
    icon: Users,
    visual: RecruitCandidateVisual,
    href: "https://recruitaitech.in?utm_source=growxlabswebsite",
  },
];

export default function AiLabPage() {
  return (
    <>
      <PageHero
        title="AI Lab"
        viewingText="AI LAB"
        exploreText="RESEARCH"
        tagline="OWN LAB SYSTEMS"
      />

      <div className="w-full bg-background px-4 sm:px-6 md:px-8 xl:px-12 pb-24 border-t border-border/20 pt-16">
        <div className="max-w-[1780px] mx-auto">
          {/* Header Block */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mb-14 md:mb-16 text-center pt-8 md:pt-10"
          >
            <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-primary mb-3 block font-mono">
              AI LAB
            </span>
            <h2 className="text-[clamp(1.65rem,4vw,2.75rem)] font-black text-foreground tracking-tight mb-4 leading-[1.12] max-w-4xl mx-auto">
              Labs that prove our engineering speed.
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Explore proprietary AI platforms, developer harnesses, and autonomous agent systems engineered by GrowXLabs.
            </p>
          </motion.div>

          {/* 5-Column Grid with Target Dimensions: ~290-310px width, ~410-430px height */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch justify-center max-w-[1600px] mx-auto">
            {products.map((product, index) => {
              const isExternal = product.href.startsWith("http");
              const VisualComponent = product.visual;

              const CardContent = (
                <div className="bg-[#bdefff] text-black rounded-[28px] p-7 md:p-8 flex flex-col justify-between h-[420px] w-full max-w-[310px] mx-auto shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(189,239,255,0.3)] group cursor-pointer">
                  
                  {/* Top Section */}
                  <div className="space-y-4">
                    {/* Category Label + Top Right Icon */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-black/60 uppercase">
                        {product.category}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-black text-[#bdefff] flex items-center justify-center shadow-xs">
                        <product.icon size={16} aria-hidden="true" />
                      </div>
                    </div>

                    {/* Product Name (Large Serif) */}
                    <div>
                      <h3 className="font-serif font-black text-2xl md:text-[26px] text-black tracking-tight leading-tight">
                        {product.title}
                      </h3>
                      {/* Short Human Description */}
                      <p className="text-black/80 text-[13.5px] leading-relaxed mt-2 font-sans">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Lower-Middle Area: Subtle Product Visual Element */}
                  <div className="my-auto py-2">
                    <VisualComponent />
                  </div>

                  {/* Bottom Action Row */}
                  <div className="pt-4 border-t border-black/15 flex items-center justify-between">
                    <span className="text-sm font-bold text-black tracking-wide">
                      Explore
                    </span>
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>

                </div>
              );

              return (
                <motion.div
                  key={product.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.08 }}
                  className="h-full flex justify-center"
                >
                  {isExternal ? (
                    <a
                      href={product.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full h-full"
                    >
                      {CardContent}
                    </a>
                  ) : (
                    <Link href={product.href} className="block w-full h-full">
                      {CardContent}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
