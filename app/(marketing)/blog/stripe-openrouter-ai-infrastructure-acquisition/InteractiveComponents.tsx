"use client";

import React, { useState } from "react";
import { Copy, Check, Send, Mail, Cpu, Layers, DollarSign, Zap, Shield, ArrowRight, Activity, Database, RefreshCw, BarChart3 } from "lucide-react";
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
    <div data-editorial-legacy-share="true" className="flex flex-col gap-4 py-6 border-t border-b border-border/60 my-10 animate-fade-in">
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

export function DealMetricsGrid() {
  const metrics = [
    { label: "Reported Deal Value", value: "$8B+", detail: "Reuters confirmed sources", change: "+515% vs May '26 round" },
    { label: "Daily Token Volume", value: "10T+", detail: "Tokens routed per 24 hours", change: "10M+ developers & companies" },
    { label: "Model Catalog", value: "400+", detail: "Frontier & open weights", change: "80+ independent providers" },
    { label: "Time to Acquisition", value: "3 Years", detail: "Founded in 2023", change: "Co-founded by Alex Atallah" },
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

export function TokenRoutingSimulator() {
  const [selectedTask, setSelectedTask] = useState<"reasoning" | "coding" | "classification" | "chat" | "vision">("reasoning");
  const [priority, setPriority] = useState<"balanced" | "cost" | "speed" | "accuracy">("balanced");

  const tasks = {
    reasoning: {
      name: "Complex Mathematical & Multi-Step Reasoning",
      tokens: "8,500 tokens",
      routes: {
        accuracy: { model: "Anthropic Claude 3.5 Sonnet", provider: "Anthropic direct", cost: "$0.0255", latency: "1,240ms", marginSavings: "Baseline High-Precision" },
        cost: { model: "DeepSeek R1 / V3 (via Together AI)", provider: "Together AI", cost: "$0.0042", latency: "1,650ms", marginSavings: "83% Cost Reduction" },
        speed: { model: "Google Gemini 1.5 Flash (2.0 Experimental)", provider: "Google Vertex", cost: "$0.00085", latency: "380ms", marginSavings: "96% Cost Reduction" },
        balanced: { model: "OpenAI GPT-4o mini + DeepSeek Fallback", provider: "OpenRouter Dynamic", cost: "$0.0028", latency: "620ms", marginSavings: "89% Cost Reduction" },
      },
    },
    coding: {
      name: "Full Repository AST Refactor & Code Generation",
      tokens: "24,000 tokens",
      routes: {
        accuracy: { model: "Anthropic Claude 3.5 Sonnet", provider: "Anthropic", cost: "$0.0720", latency: "2,100ms", marginSavings: "Industry Standard Coding" },
        cost: { model: "Qwen 2.5 Coder 32B Instruct", provider: "DeepInfra", cost: "$0.0048", latency: "1,450ms", marginSavings: "93% Cost Reduction" },
        speed: { model: "Cerebras Llama 3.3 70B", provider: "Cerebras Fast Inference", cost: "$0.0144", latency: "280ms (1,800 tok/s)", marginSavings: "80% Cost / 7x Speed" },
        balanced: { model: "Claude 3.5 Haiku + Qwen Fallback", provider: "OpenRouter Smart Routing", cost: "$0.0180", latency: "680ms", marginSavings: "75% Cost Reduction" },
      },
    },
    classification: {
      name: "High-Volume Intent & JSON Tag Extraction",
      tokens: "650 tokens",
      routes: {
        accuracy: { model: "OpenAI GPT-4o", provider: "OpenAI", cost: "$0.0016", latency: "520ms", marginSavings: "Over-Provisioned Standard" },
        cost: { model: "Meta Llama 3.1 8B Instruct", provider: "Groq / Hyperbolic", cost: "$0.00003", latency: "110ms", marginSavings: "98% Margin Expansion" },
        speed: { model: "Groq Llama 3.1 8B (800 tok/s)", provider: "Groq LPU", cost: "$0.00004", latency: "65ms", marginSavings: "97% Margin Expansion" },
        balanced: { model: "Google Gemini 1.5 Flash", provider: "Google AI Studio", cost: "$0.00005", latency: "140ms", marginSavings: "97% Margin Expansion" },
      },
    },
    chat: {
      name: "End-User Interactive Support Agent",
      tokens: "1,800 tokens",
      routes: {
        accuracy: { model: "OpenAI GPT-4o", provider: "OpenAI Direct", cost: "$0.0054", latency: "740ms", marginSavings: "Standard Premium Tier" },
        cost: { model: "Mistral Nemo 12B", provider: "Mistral AI", cost: "$0.00036", latency: "380ms", marginSavings: "93% Cost Savings" },
        speed: { model: "Cerebras Llama 3.1 8B", provider: "Cerebras", cost: "$0.00054", latency: "90ms", marginSavings: "90% Cost / Instant UX" },
        balanced: { model: "Claude 3.5 Haiku (Primary) → GPT-4o mini (Fallback)", provider: "OpenRouter Failover Group", cost: "$0.0014", latency: "260ms", marginSavings: "74% Margin Improvement" },
      },
    },
    vision: {
      name: "Multimodal Receipt & Financial Invoice Audit",
      tokens: "4,200 tokens + Image",
      routes: {
        accuracy: { model: "GPT-4o Vision", provider: "OpenAI", cost: "$0.0189", latency: "1,400ms", marginSavings: "High Quality Extraction" },
        cost: { model: "Qwen 2 VL 72B", provider: "Together AI", cost: "$0.0031", latency: "1,820ms", marginSavings: "83% Cost Reduction" },
        speed: { model: "Gemini 1.5 Flash Vision", provider: "Google Vertex", cost: "$0.00095", latency: "410ms", marginSavings: "95% Cost Reduction" },
        balanced: { model: "Gemini 1.5 Pro (Primary) → Claude 3.5 Sonnet (Edge cases)", provider: "OpenRouter Condition Matrix", cost: "$0.0042", latency: "780ms", marginSavings: "78% Cost Reduction" },
      },
    },
  };

  const currentTask = tasks[selectedTask];
  const activeRoute = currentTask.routes[priority];

  return (
    <div className="my-12 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-6 md:p-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-mono font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" /> Interactive AI Routing Engine
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            Dynamic Model Selection & Token Margin Simulator
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Simulate how OpenRouter routes token requests based on workload complexity and pricing targets.
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-muted/40 border border-border/50">
          {(["balanced", "cost", "speed", "accuracy"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-mono capitalize transition-all",
                priority === p
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Task Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-6">
        {(Object.keys(tasks) as Array<keyof typeof tasks>).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedTask(key)}
            className={cn(
              "p-3 rounded-xl border text-left transition-all",
              selectedTask === key
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40"
            )}
          >
            <p className="text-[11px] font-mono uppercase text-muted-foreground">Task Type</p>
            <p className="text-xs font-bold text-foreground capitalize mt-1 truncate">{key}</p>
          </button>
        ))}
      </div>

      {/* Active Routing Result */}
      <div className="rounded-xl border border-primary/30 bg-primary/[0.03] p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-primary">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" style={{ animationDuration: "8s" }} />
            <span>Optimal Route Computed by OpenRouter</span>
          </div>
          <h4 className="text-lg font-bold text-foreground">{currentTask.name}</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg border border-border/60 bg-background/60">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Target Model</span>
              <p className="text-sm font-semibold text-foreground mt-0.5">{activeRoute.model}</p>
            </div>
            <div className="p-3 rounded-lg border border-border/60 bg-background/60">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Routing Gateway</span>
              <p className="text-sm font-semibold text-foreground mt-0.5">{activeRoute.provider}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between p-4 rounded-xl border border-border/60 bg-background/80">
          <div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Cost per Request ({currentTask.tokens})</span>
            <p className="text-2xl font-mono font-bold text-foreground mt-1">{activeRoute.cost}</p>
          </div>
          
          <div className="space-y-1.5 pt-3 border-t border-border/50 text-xs font-mono">
            <div className="flex justify-between text-muted-foreground">
              <span>Latency:</span>
              <span className="text-foreground font-semibold">{activeRoute.latency}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Gross Margin Impact:</span>
              <span className="font-semibold">{activeRoute.marginSavings}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AIEconomicStackViewer() {
  const [activeLayer, setActiveLayer] = useState<number>(3);

  const layers = [
    {
      level: "Layer 7",
      name: "Observability & Margin Intelligence",
      company: "Stripe + OpenRouter Analytics",
      description: "Real-time visibility into per-customer token cost, model performance SLAs, error rate fallbacks, and unit economics.",
      metric: "Gross Margin Tracking",
      icon: BarChart3,
    },
    {
      level: "Layer 6",
      name: "Global Payments & Capital Rails",
      company: "Stripe Core Engine",
      description: "Accepting multi-currency payments, handling card authorizations, tax compliance across 135+ currencies, and fraud prevention.",
      metric: "Money In",
      icon: DollarSign,
    },
    {
      level: "Layer 5",
      name: "Token Metering & Dynamic Billing",
      company: "Stripe Token Billing + Invoicing",
      description: "Converting millions of consumed model tokens into automated invoices, subscription overages, and prepaid wallet balances.",
      metric: "Usage Monetization",
      icon: Layers,
    },
    {
      level: "Layer 4",
      name: "Intelligent Model Routing & Failover",
      company: "OpenRouter Gateway",
      description: "Evaluating prompt complexity, context size, and provider availability to route requests dynamically across 400+ LLMs.",
      metric: "Token Flow Direction",
      icon: Zap,
    },
    {
      level: "Layer 3",
      name: "Multi-Model Intelligence Layer",
      company: "OpenAI, Anthropic, Google, Meta, Mistral, DeepSeek",
      description: "The cognitive capabilities, reasoning, code synthesis, and multimodal understanding generated by foundation models.",
      metric: "Raw Intelligence Output",
      icon: Cpu,
    },
    {
      level: "Layer 2",
      name: "Compute & Fast Inference Accelerators",
      company: "NVIDIA H100/Blackwell, Groq LPUs, Cerebras CS-3",
      description: "The underlying silicon hardware executing floating-point tensor math at thousands of tokens per second.",
      metric: "Compute Operations",
      icon: Database,
    },
    {
      level: "Layer 1",
      name: "Datacenter Energy & Infrastructure",
      company: "Cloud Hyperscalers & Clean Power Grids",
      description: "Megawatts of electrical power, liquid cooling systems, and physical datacenter real estate.",
      metric: "Physical Power",
      icon: Shield,
    },
  ];

  const current = layers[activeLayer];

  return (
    <div className="my-12 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-6 md:p-8 shadow-xl">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-mono font-semibold uppercase tracking-wider mb-2">
          <Layers className="w-3.5 h-3.5" /> Macro Architectural Analysis
        </div>
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          The 7-Layer AI Economic & Infrastructure Stack
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          How money and tokens interact from physical energy up to autonomous software revenue.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Layer Selector */}
        <div className="lg:col-span-5 space-y-2">
          {layers.map((l, idx) => {
            const Icon = l.icon;
            const isStripeOpenRouter = idx === 1 || idx === 2 || idx === 3 || idx === 0;
            return (
              <button
                key={idx}
                onClick={() => setActiveLayer(idx)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                  activeLayer === idx
                    ? "border-primary bg-primary/15 shadow-sm text-foreground font-semibold"
                    : "border-border/50 bg-muted/15 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={cn("w-4 h-4 shrink-0", activeLayer === idx ? "text-primary" : "text-muted-foreground")} />
                  <div className="truncate">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground mr-2">{l.level}</span>
                    <span className="text-xs truncate">{l.name}</span>
                  </div>
                </div>
                {isStripeOpenRouter && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase shrink-0">
                    Stripe Era
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Layer Details Card */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-xl border border-border/80 bg-background/80">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <span className="text-xs font-mono font-bold text-primary uppercase">{current.level}</span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-muted text-muted-foreground">{current.metric}</span>
            </div>
            <h4 className="text-xl font-bold text-foreground mt-4">{current.name}</h4>
            <p className="text-xs font-mono text-primary/90 mt-1">Key Ecosystem Players: {current.company}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-4">{current.description}</p>
          </div>

          <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>Economic Role:</span>
            <span className="text-foreground font-semibold">{current.company.includes("Stripe") ? "Monetization & Flow Control" : "Compute / Model Supply"}</span>
          </div>
        </div>
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
    <div data-editorial-legacy-newsletter="true" className="my-14 rounded-2xl border border-border/80 bg-gradient-to-b from-card to-background p-8 md:p-10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-2xl relative z-10">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary font-bold">
          GrowXLabs AI Infrastructure Briefing
        </span>
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-2">
          Master the economics of tokens, model routing, and agent architecture.
        </h3>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          Join 25,000+ engineering leaders, founders, and architects receiving our weekly technical deep dives on AI infrastructure, unit economics, and backend orchestration.
        </p>

        {status === "success" ? (
          <div className="mt-6 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-sm font-medium flex items-center gap-2">
            <Check className="w-5 h-5 shrink-0" />
            <span>Thank you for subscribing! You are now on the priority dispatch list.</span>
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
  return null;
}
