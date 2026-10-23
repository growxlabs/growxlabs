"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

export function AccordionFAQ({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
            className="border-b border-[#D5E2E9] transition-all duration-300"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between py-5 sm:py-6 text-left group cursor-pointer"
            >
              <div className="flex gap-4 sm:gap-6 items-start pr-4">
                <span className="font-mono text-xs sm:text-[13px] pt-1 shrink-0 w-8 text-[#55788D] font-bold">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h4 className={cn(
                  "text-[17px] sm:text-[19px] font-sans font-medium tracking-tight leading-snug transition-colors",
                  isOpen ? "text-[#17252D] font-bold" : "text-[#17252D] group-hover:text-[#55788D]"
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
                  isOpen ? "rotate-45 text-[#17252D]" : "text-[#55788D] group-hover:text-[#17252D]"
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
                <p className="font-sans text-[15px] sm:text-[16px] leading-relaxed max-w-3xl text-[#17252D]/85">
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
