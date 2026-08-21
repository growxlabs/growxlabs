"use client";

import React, { useState } from "react";
import { Copy, Check, Send, Mail, GitBranch, GitPullRequest, GitCommit, Play, ArrowRight, Activity, Terminal, ShieldAlert, Cpu, Sparkles, CheckCircle2, RefreshCw } from "lucide-react";
import { Link } from "@/navigation";
import { cn } from "@/lib/utils";

export function BlogShare({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://growxlabs.tech/blog/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const shareLinks = [
    {
      name: "X / Twitter",
      icon: () => (
        <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: "hover:text-white hover:bg-white/[0.06]",
    },
    {
      name: "LinkedIn",
      icon: () => (
        <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
        </svg>
      ),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: "hover:text-[#0A66C2] hover:bg-[#0A66C2]/10",
    },
  ];

  return (
    <div className="flex flex-col gap-4 py-6 border-t border-b border-border/60 my-10 animate-fade-in">
      <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Share this briefing</p>
      <div className="flex flex-wrap items-center gap-3">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border/60 bg-muted/20 text-foreground text-[13px] font-medium transition-all duration-300 active:scale-[0.98]",
              link.color
            )}
          >
            <link.icon />
            <span>{link.name}</span>
          </a>
        ))}
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[13px] font-medium transition-all duration-300 active:scale-[0.98] mr-auto",
            copied
              ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
              : "border-border/60 text-foreground bg-muted/20 hover:border-primary hover:text-primary"
          )}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 shrink-0" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function OriginMetricsGrid() {
  const metrics = [
    { label: "Launch Status", value: "Early Beta", detail: "Active on Pro & Business plans", change: "Full Git Forge inside IDE" },
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
      action: "Initiate Autonomous Task",
    },
    {
      title: "2. Cloud Agent Clones & Analyzes Repo",
      role: "Cursor Cloud Agent",
      desc: "Agent inspects Origin remote repository, creates isolated branch `agent/jwt-rotation`, and builds semantic AST symbol graph.",
      badge: "Repository Context Ingestion",
      action: "Synthesize Multi-File Edits",
    },
    {
      title: "3. Multi-File Refactor & Check Execution",
      role: "Autonomous Agent Execution",
      desc: "Agent modifies 4 files (`middleware.ts`, `auth.ts`, `rate-limit.ts`, `auth.test.ts`), runs local test suite and TypeScript validation.",
      badge: "Code Synthesis & Validation",
      action: "Commit & Push to Origin Remote",
    },
    {
      title: "4. Origin Opens Pull Request & Triggers CI",
      role: "Cursor Origin Git Forge",
      desc: "Origin opens PR #142 with structured changelog, diff summary, and triggers Vercel Preview + Depot CI checks.",
      badge: "Automated PR Creation",
      action: "Pass to Human Review Boundary",
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
            <GitBranch className="w-3.5 h-3.5" /> Agent-Scale Development Loop
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            From Intent to Merged PR: The Origin Execution Cycle
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            See how the boundary between editor, coding agent, repository forge, and deployment collapses.
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
      agentic: "Autonomous AI agents executing multi-file implementation tasks",
    },
    {
      feature: "Repository Role",
      traditional: "Passive remote file storage and commit archive",
      agentic: "Active execution environment next to the AI reasoning engine",
    },
    {
      feature: "Pull Request Purpose",
      traditional: "Human-to-human peer code review",
      agentic: "Safety & verification boundary between AI output and production",
    },
    {
      feature: "Commit & Branch Volume",
      traditional: "Low frequency (3–8 commits per developer per day)",
      agentic: "High frequency (hundreds of parallel agent iterations)",
    },
    {
      feature: "CI/CD Integration",
      traditional: "Triggered asynchronously after manual push",
      agentic: "Streaming instant preview deployments (Vercel/Depot) during agent execution",
    },
    {
      feature: "Ecosystem Strategy",
      traditional: "Walled garden requiring full repository lock-in",
      agentic: "Seamless two-way GitHub sync with non-disruptive onboarding",
    },
  ];

  return (
    <div className="my-12 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-6 md:p-8 shadow-xl overflow-hidden">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-mono font-semibold uppercase tracking-wider mb-2">
          <Terminal className="w-3.5 h-3.5" /> Architectural Paradigm Shift
        </div>
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          Traditional Git Forge (GitHub) vs. Agent-Scale Forge (Cursor Origin)
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          How developer infrastructure transforms when coding agents become primary software authors.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm font-sans border-collapse">
          <thead>
            <tr className="border-b border-border/70 text-[11px] font-mono text-muted-foreground uppercase">
              <th className="pb-3 pr-4">Dimension</th>
              <th className="pb-3 px-4 text-muted-foreground">Traditional Git (GitHub)</th>
              <th className="pb-3 pl-4 text-primary font-bold">Agent-Scale Git (Cursor Origin)</th>
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
                  {item.agentic}
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
    <div className="my-14 rounded-2xl border border-border/80 bg-gradient-to-b from-card to-background p-8 md:p-10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-2xl relative z-10">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary font-bold">
          GrowXLabs Developer Infrastructure Briefing
        </span>
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-2">
          Stay ahead of agentic software development and modern Git infrastructure.
        </h3>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          Join 25,000+ engineers, software architects, and engineering leaders receiving our weekly deep dives on AI coding agents, Next.js architecture, and developer productivity systems.
        </p>

        {status === "success" ? (
          <div className="mt-6 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-sm font-medium flex items-center gap-2">
            <Check className="w-5 h-5 shrink-0" />
            <span>Thank you for subscribing! You are now on our priority dispatch list.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email (e.g. alex@company.com)"
              className="flex-1 px-4 py-3 rounded-xl border border-border/80 bg-background text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-all"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{status === "loading" ? "Subscribing..." : "Subscribe Free"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function AgentCTA() {
  return (
    <div className="my-16 rounded-2xl border border-primary/40 bg-primary/[0.04] p-8 md:p-10 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
            Engineering Consultation
          </span>
          <h3 className="text-2xl font-bold text-foreground">
            Integrate Agentic AI Workflows into Your Engineering Team
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            GrowXLabs helps high-growth companies architect autonomous coding agent pipelines, review automation, and modern CI/CD systems that 10x development velocity safely.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-all shrink-0"
        >
          <span>Schedule Engineering Review</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
