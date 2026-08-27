"use client";

import React, { useState, useEffect } from "react";
import { Check, Copy, List } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════
// 1. STICKY READING PROGRESS BAR
// ═══════════════════════════════════════════════════
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setProgress((window.scrollY / scrollHeight) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run initially
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] bg-transparent z-[100] pointer-events-none">
      <div
        className="h-full transition-all duration-100 ease-out"
        style={{ 
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #355CFF 0%, #5B7FFF 100%)'
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 2. SCROLLSPY TABLE OF CONTENTS (TOC)
// ═══════════════════════════════════════════════════
interface HeadingItem {
  id: string;
  text: string;
}

interface TableOfContentsProps {
  headings: HeadingItem[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observers = new Map<string, IntersectionObserver>();
    
    // Using IntersectionObserver to detect which section is current
    const callback = (entries: IntersectionObserverEntry[]) => {
      // Find the entry that is currently intersecting
      const visibleEntry = entries.find((entry) => entry.isIntersecting);
      if (visibleEntry) {
        setActiveId(visibleEntry.target.id);
      }
    };

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // Trigger when heading is in the upper middle area
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(callback, observerOptions);

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100; // Account for sticky navbar height
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      
      // Update hash in URL quietly
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <nav className="blog-table-of-contents space-y-5" aria-label="On this page">
      <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase pb-3 border-b border-border">
        <List className="w-3.5 h-3.5" />
        <span>On this page</span>
      </div>
      <ul className="space-y-2.5">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleScrollTo(e, heading.id)}
                className={cn(
                  "block text-[13px] leading-relaxed transition-all duration-200 relative pl-4 border-l-2 py-1 rounded-r-sm",
                  isActive
                    ? "text-[#355CFF] font-semibold border-[#355CFF] bg-[#355CFF]/[0.04]"
                    : "text-muted-foreground hover:text-foreground border-transparent hover:border-[#D1D5DB]"
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ═══════════════════════════════════════════════════
// 3. COPY CODE TO CLIPBOARD BUTTON
// ═══════════════════════════════════════════════════
interface CopyCodeButtonProps {
  code: string;
}

export function CopyCodeButton({ code }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code to clipboard", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-mono border transition-all duration-300",
        copied
          ? "bg-green-500/10 text-green-400 border-green-500/20"
          : "bg-white/5 text-[#A0A0A0] border-white/10 hover:bg-white/10 hover:text-white"
      )}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-green-400" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
