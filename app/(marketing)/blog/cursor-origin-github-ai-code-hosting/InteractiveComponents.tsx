"use client";

import React, { useState } from "react";
import { Check, GitBranch, Play, ArrowRight, Activity, Terminal, CheckCircle2 } from "lucide-react";
import { Link } from "@/navigation";
import { cn } from "@/lib/utils";

export function AIReadLinks({ title }: { title: string }) {
  const articleUrl = "https://growxlabs.tech/blog/cursor-origin-github-ai-code-hosting";
  const prompt = `Read this GrowxLabs article titled "${title}": ${articleUrl}. Help me understand the article and answer my questions about it.`;

  return (
    <div data-editorial-legacy-ai="true" className="flex flex-wrap items-center justify-between gap-4 border-t border-b border-neutral-800/80 py-4 my-8 font-mono text-xs text-muted-foreground">
      <span className="text-[10px] tracking-[0.16em] uppercase text-neutral-400">Read with AI:</span>
      <div className="flex items-center gap-4">
        <a
          href={`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          ChatGPT ↗
        </a>
        <span className="text-neutral-700">·</span>
        <a
          href={`https://claude.ai/new?q=${encodeURIComponent(prompt)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          Claude ↗
        </a>
      </div>
    </div>
  );
}

export function BlogShare({ title, slug, url }: { title: string; slug?: string; url?: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (slug ? `https://growxlabs.tech/blog/${slug}` : "https://growxlabs.tech");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <div data-editorial-legacy-share="true" className="flex flex-wrap items-center justify-between gap-4 py-6 border-t border-b border-neutral-800/80 font-mono text-xs text-muted-foreground my-8">
      <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-400">Share this article</span>
      <div className="flex items-center gap-4">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          X / Twitter ↗
        </a>
        <span className="text-neutral-700">·</span>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          LinkedIn ↗
        </a>
        <span className="text-neutral-700">·</span>
        <button
          onClick={handleCopy}
          className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <span>Copy Link</span>
          )}
        </button>
      </div>
    </div>
  );
}

export function OriginMetricsGrid() {
  const metrics = [
    { label: "Launch Status", value: "Early Beta", detail: "Active on Pro & Business plans", change: "Code hosting inside Cursor" },
    { label: "Sync Engine", value: "Two-Way", detail: "Bidirectional GitHub synchronization", change: "GitHub remains upstream truth" },
    { label: "Agent Capability", value: "Cloud Git", detail: "Clone → Branch → Commit → PR", change: "Zero local machine lock-in" },
    { label: "CI & Deployments", value: "Instant", detail: "Vercel, Depot & Buildkite native", change: "PR preview URL on commit" },
  ];

  return (
    <div className="my-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <div key={i} className="p-5 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{m.label}</p>
          <p className="text-3xl font-bold font-mono tracking-tight text-foreground mt-2">{m.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{m.detail}</p>
          <div className="mt-3 pt-3 border-t border-border/40 text-[11px] font-mono text-primary flex items-center gap-1.5">
            <Activity className="w-3 h-3 shrink-0" />
            <span>{m.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AgentWorkflowSimulator() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const steps = [
    {
      title: "1. Human Defines Intent & Task",
      role: "Human Developer",
      desc: "Prompt: 'Refactor our authentication middleware to support JWT refresh rotation and add rate-limiting Redis checks.'",
      badge: "Intent Specification",
      action: "Start coding task",
    },
    {
      title: "2. Cloud Agent Clones & Analyzes Repo",
      role: "Cursor Cloud Agent",
      desc: "Agent inspects Origin remote repository, creates isolated branch `agent/jwt-rotation`, and builds semantic AST symbol graph.",
      badge: "Repository Context Ingestion",
      action: "Synthesize Multi-File Edits",
    },
    {
      title: "3. Multiple Files Changed and Checked",
      role: "AI Coding Agent",
      desc: "Agent modifies 4 files (`middleware.ts`, `auth.ts`, `rate-limit.ts`, `auth.test.ts`), runs local test suite and TypeScript validation.",
      badge: "Code Synthesis & Validation",
      action: "Commit & Push to Origin Remote",
    },
    {
      title: "4. Origin Opens Pull Request & Triggers CI",
      role: "Cursor Origin",
      desc: "Origin opens PR #142 with structured changelog, diff summary, and triggers Vercel Preview + Depot CI checks.",
      badge: "Automated PR Creation",
      action: "Send for human review",
    },
    {
      title: "5. Human Inspects Diff & Approves Merge",
      role: "Human Reviewer & Deployer",
      desc: "Developer inspects PR diff in Cursor, verifies Vercel live preview, and clicks 'Merge to Main'. Origin syncs upstream to GitHub.",
      badge: "Quality Gate & Production Merge",
      action: "Restart Simulation",
    },
  ];

  const handleNext = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleAutoPlay = () => {
    setIsRunning(true);
    let step = 0;
    setCurrentStep(0);
    const interval = setInterval(() => {
      step++;
      if (step < steps.length) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 2200);
  };

  const active = steps[currentStep];

  return (
    <div className="my-12 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-6 md:p-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-mono font-semibold uppercase tracking-wider mb-2">
            <GitBranch className="w-3.5 h-3.5" /> AI Coding Workflow
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            From a coding task to a reviewed pull request
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            See how a coding task moves from the editor to a reviewed pull request.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoPlay}
            disabled={isRunning}
            className="px-3.5 py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isRunning ? "Simulating..." : "Auto-Play Cycle"}</span>
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div className="grid grid-cols-5 gap-2 my-6">
        {steps.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentStep(idx)}
            className={cn(
              "p-2.5 rounded-lg border text-left transition-all",
              currentStep === idx
                ? "border-primary bg-primary/15 shadow-sm text-foreground"
                : idx < currentStep
                ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400"
                : "border-border/50 bg-muted/20 text-muted-foreground"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold">Step 0{idx + 1}</span>
              {idx < currentStep && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </div>
            <p className="text-[11px] font-semibold truncate mt-1">{s.title.split(". ")[1] || s.title}</p>
          </button>
        ))}
      </div>

      {/* Active Step Workspace Card */}
      <div className="rounded-xl border border-primary/30 bg-background/90 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-primary/10 text-primary font-bold">
            {active.badge}
          </span>
          <span className="text-xs font-mono text-muted-foreground">Actor: <strong className="text-foreground">{active.role}</strong></span>
        </div>

        <h4 className="text-lg font-bold text-foreground">{active.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{active.desc}</p>

        <div className="pt-4 border-t border-border/60 flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">
            Progress: {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 flex items-center gap-1.5 transition-all"
          >
            <span>{active.action}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function GitForgeEvolutionComparison() {
  const criteria = [
    {
      feature: "Primary Actor",
      traditional: "Human developer writing 95%+ of code manually",
      origin: "AI agents making changes across multiple files",
    },
    {
      feature: "Repository Role",
      traditional: "Passive remote file storage and commit archive",
      origin: "The repository is available where the AI is working",
    },
    {
      feature: "Pull Request Purpose",
      traditional: "Human-to-human peer code review",
      origin: "A review step between AI changes and production",
    },
    {
      feature: "Commit & Branch Volume",
      traditional: "Low frequency (3–8 commits per developer per day)",
      origin: "More branches and commits as agents work in parallel",
    },
    {
      feature: "CI/CD Integration",
      traditional: "Triggered asynchronously after manual push",
      origin: "Preview deployments during the coding task",
    },
    {
      feature: "GitHub Relationship",
      traditional: "Walled garden requiring full repository lock-in",
      origin: "Two-way GitHub sync without a forced migration",
    },
  ];

  return (
    <div className="my-12 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-6 md:p-8 shadow-xl overflow-hidden">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-mono font-semibold uppercase tracking-wider mb-2">
          <Terminal className="w-3.5 h-3.5" /> How the Workflow Changes
        </div>
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          GitHub and Cursor Origin: Two Ways to Host Code
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          How developer tools change when AI can write more of the code.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm font-sans border-collapse">
          <thead>
            <tr className="border-b border-border/70 text-[11px] font-mono text-muted-foreground uppercase">
              <th className="pb-3 pr-4">Dimension</th>
              <th className="pb-3 px-4 text-muted-foreground">Traditional Git (GitHub)</th>
              <th className="pb-3 pl-4 text-primary font-bold">Cursor Origin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {criteria.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/10 transition-colors">
                <td className="py-3.5 pr-4 font-mono text-xs font-bold text-foreground">
                  {item.feature}
                </td>
                <td className="py-3.5 px-4 text-xs text-muted-foreground">
                  {item.traditional}
                </td>
                <td className="py-3.5 pl-4 text-xs text-foreground font-medium bg-primary/[0.02]">
                  {item.origin}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
    }, 800);
  };

  return (
    <section data-editorial-legacy-newsletter="true" className="border-t border-neutral-800/80 pt-12 pb-6 space-y-6">
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-bold">
          More from GrowxLabs
        </span>
        <h3 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-foreground">
          Clear analysis of AI coding tools, developer workflows, and software delivery.
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Short updates on the tools and decisions shaping how software gets built.
        </p>
      </div>

      {status === "success" ? (
        <div className="p-3 text-emerald-400 font-mono text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Subscribed. You&apos;ll receive the next update.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter work email"
            className="flex-1 px-3.5 py-2.5 rounded-none border-b border-neutral-700 bg-transparent text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:border-white transition-all font-mono"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-5 py-2.5 bg-white text-black font-mono font-bold text-xs hover:bg-neutral-200 transition-all shrink-0 cursor-pointer"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      )}
    </section>
  );
}

export function AgentCTA() {
  return (
    <section className="border-t border-neutral-800/80 pt-12 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
      <div className="space-y-2 max-w-xl">
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary block">
          More articles
        </span>
        <h3 className="font-serif font-black text-2xl sm:text-3xl text-foreground tracking-tight">
          More from GrowxLabs on how software gets built
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Browse practical articles about AI coding tools, developer workflows, and software delivery.
        </p>
      </div>

      <div className="shrink-0">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-black font-bold text-xs sm:text-sm hover:bg-neutral-200 transition-all shadow-md group"
        >
          <span>Browse more articles</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
