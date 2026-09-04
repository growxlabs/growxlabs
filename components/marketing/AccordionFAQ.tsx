"use client";

import { useState } from "react";
import { usePathname } from "@/navigation-client";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

export function AccordionFAQ({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const isBlog = pathname?.includes("/blog");

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Dynamic theme variables
  const hoverText = isBlog ? "group-hover:text-[#355CFF]" : "group-hover:text-white";
  const activeText = isBlog ? "text-[#355CFF]" : "text-white";

  // Build Google-verified FAQPage JSON-LD schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <div className="w-full">
      {/* Google & Perplexity Rich Search FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {items.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={cn(
              "border-b transition-all duration-300",
              isBlog ? "border-neutral-200" : "border-white/10"
            )}
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between py-5 sm:py-6 text-left group cursor-pointer"
            >
              <div className="flex gap-4 sm:gap-6 items-start pr-4">
                <span className={cn(
                  "font-mono text-xs sm:text-[13px] pt-1 shrink-0 w-8",
                  isBlog ? "text-neutral-400" : "text-white/40"
                )}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h4 className={cn(
                  "text-[17px] sm:text-[19px] font-sans font-medium tracking-tight leading-snug transition-colors",
                  isBlog
                    ? (isOpen ? "text-neutral-950 font-semibold" : "text-neutral-800 group-hover:text-black")
                    : (isOpen ? activeText : "text-white/90 group-hover:text-white")
                )}>
                  {faq.question}
                </h4>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  "w-5 h-5 shrink-0 transition-transform duration-300",
                  isBlog
                    ? (isOpen ? "rotate-45 text-black" : "text-neutral-400 group-hover:text-black")
                    : (isOpen ? "rotate-45 text-white" : "text-white/40 group-hover:text-white")
                )}
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isOpen ? "max-h-[500px] opacity-100 pb-6" : "max-h-0 opacity-0"
              )}
            >
              <div className="pl-12 sm:pl-14 pr-4">
                <p className={cn(
                  "font-sans text-[15px] sm:text-[16px] leading-relaxed max-w-3xl",
                  isBlog ? "text-neutral-700" : "text-white/70"
                )}>
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
