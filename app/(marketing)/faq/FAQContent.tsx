"use client";

import { useState } from "react";
import { PageHero } from "@/components/marketing/PageHero";
import { Plus } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  items: FAQItem[];
}

interface FAQContentProps {
  categories: FAQCategory[];
}

export function FAQContent({ categories }: FAQContentProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="flex flex-col bg-[#F5F4F0] min-h-screen">
      <PageHero
        title="FAQ'S"
        viewingText="FAQ'S"
        exploreText="HELP & ANSWERS"
        tagline="QUESTIONS"
      />

      <div className="w-full bg-[#F5F4F0] px-3 sm:px-4 md:px-6 pb-8">
        <div className="w-full bg-[#A2BECC] rounded-[16px] px-6 md:px-10 xl:px-16 2xl:px-24 py-16">
          <div className="max-w-[1400px] mx-auto">
            {categories.map((category, idx) => (
              <section key={category.id} className="mb-24 last:mb-32">
              {/* Category header */}
              <div className="border-b border-[#D5E2E9] pb-6 mb-12">
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#55788D] uppercase block mb-2">
                  // CATEGORY {String(idx + 1).padStart(2, '0')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#17252D] tracking-tight font-sans">
                  {category.title}
                </h2>
              </div>

              {/* Accordion list */}
              <div className="w-full">
                {category.items.map((faq, itemIdx) => {
                  const itemId = `${category.id}-${itemIdx}`;
                  const isOpen = activeId === itemId;
                  return (
                    <div
                      key={itemIdx}
                      className="border-t border-[#D5E2E9] last:border-b transition-all duration-300"
                    >
                      <button
                        onClick={() => toggle(itemId)}
                        className="w-full flex items-center justify-between py-8 text-left group cursor-pointer"
                      >
                        <div className="flex gap-8 items-start pr-4">
                          <span className="font-mono text-xs text-[#55788D] pt-1.5 shrink-0 font-bold">
                            {String(itemIdx + 1).padStart(2, '0')}
                          </span>
                          <h3 className="text-[#17252D] text-[16px] sm:text-[18px] font-sans font-bold tracking-tight leading-snug group-hover:text-[#55788D] transition-colors">
                            {faq.question}
                          </h3>
                        </div>
                        <Plus 
                          className={`w-5 h-5 text-[#55788D] group-hover:text-[#17252D] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45 text-[#17252D]" : ""}`} 
                        />
                      </button>

                      <div 
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-[500px] opacity-100 pb-8" : "max-h-0 opacity-0"}`}
                      >
                        <div className="pl-12 pr-4 sm:pl-14">
                          <p className="text-[#17252D]/85 font-sans text-[15px] sm:text-[16px] leading-relaxed max-w-4xl font-normal">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  </div>
);
}
