"use client";

import React, { useState } from "react";
import { Copy, Check, Send, Mail } from "lucide-react";
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
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: "hover:text-black hover:bg-black/[0.04]",
    },
    {
      name: "LinkedIn",
      icon: () => (
        <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
        </svg>
      ),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: "hover:text-[#0A66C2] hover:bg-[#0A66C2]/5",
    },
    {
      name: "Facebook",
      icon: () => (
        <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: "hover:text-[#1877F2] hover:bg-[#1877F2]/5",
    },
  ];

  return (
    <div data-editorial-legacy-share="true" className="flex flex-col gap-4 py-6 border-t border-b border-border my-10 animate-fade-in">
      <p className="font-mono text-[10px] tracking-[0.2em] text-[#9CA3AF] uppercase">Share this article</p>
      <div className="flex flex-wrap items-center gap-3">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-transparent text-white text-[13px] font-medium transition-all duration-300 hover:border-current active:scale-[0.98]",
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
            "flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[13px] font-medium transition-all duration-300 bg-transparent border border-white/10 active:scale-[0.98] mr-auto",
            copied
              ? "border-[#22C55E] text-[#22C55E] bg-[#22C55E]/5"
              : "border-border text-foreground/90 hover:border-primary hover:text-primary hover:bg-primary/5"
          )}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 shrink-0 text-[#22C55E]" />
              <span>Copied!</span>
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

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "subscribed">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("subscribed");
      setEmail("");
    }, 1500);
  };

  return (
    <div className="bg-[#0F0F12] text-white rounded-2xl p-8 md:p-10 relative overflow-hidden border border-white/5 shadow-2xl my-16">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#C0F0FB]/8 rounded-full blur-[100px] -mr-32 -mt-32" />
      <div className="relative z-10 space-y-6 max-w-2xl">
        <div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/10">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">Stay Ahead of the Curve</h3>
          <p className="text-[#A0A0A0] text-[15px] leading-relaxed">
            Get the latest breakthroughs in AI, space technology, automation, and tech strategy delivered directly to your inbox. No spam. Only engineering intelligence.
          </p>
        </div>

        {status === "subscribed" ? (
          <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] rounded-xl p-5 text-[15px] font-medium flex items-center gap-3 animate-fade-in">
            <Check className="w-5 h-5" />
            <span>Thank you for subscribing! Welcome to the GrowXLabsTech network.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your professional email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              required
              className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary focus:ring-1 focus:ring-[#C0F0FB]/20 rounded-xl px-5 py-4 text-[15px] placeholder-[#6B7280] text-white focus:outline-none transition-all duration-300 w-full disabled:opacity-55"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-[#C0F0FB] hover:bg-[#C0F0FB]/90 text-white font-bold text-[15px] px-8 py-4 rounded-xl transition-all duration-300 active:scale-[0.98] inline-flex items-center justify-center gap-2 shrink-0 disabled:opacity-55"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
        <p className="text-[11px] text-[#9CA3AF] font-mono tracking-wide">
          By subscribing, you agree to receive communications from GrowXLabsTech.
        </p>
      </div>
    </div>
  );
}
