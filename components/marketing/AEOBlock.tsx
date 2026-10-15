import React from "react";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/Button";
import { HelpCircle, ArrowRight, Lightbulb, PlayCircle } from "lucide-react";

interface AEOBlockProps {
  question: string;
  answer: string;
  explanation: string;
  example: string;
  ctaText: string;
  ctaHref: string;
}

export function AEOBlock({
  question,
  answer,
  explanation,
  example,
  ctaText,
  ctaHref,
}: AEOBlockProps) {
  return (
    <div className="w-full p-6 sm:p-8 md:p-10 rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-all group relative overflow-hidden mb-8 animate-fade-in-up">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#C0F0FB]/[0.02] blur-[80px] -z-10" />

      <div className="flex flex-col gap-8">
        {/* Question */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-md bg-[#C0F0FB]/10 flex items-center justify-center shrink-0 border border-[#C0F0FB]/20">
            <HelpCircle className="w-6 h-6 text-[#C0F0FB]" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight tracking-tight">
              {question}
            </h3>
          </div>
        </div>

        {/* Direct Answer */}
        <div className="sm:pl-14">
          <div className="relative">
            <p className="text-lg md:text-xl text-foreground font-bold leading-relaxed border-l-4 border-[#C0F0FB] pl-6 py-3 bg-muted rounded-r-lg tracking-tight">
              {answer}
            </p>
          </div>
        </div>

        {/* Explanation & Example */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:pl-14 pt-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#C0F0FB] font-bold text-[10px] uppercase tracking-[0.25em]">
              <Lightbulb className="w-4 h-4" /> Explanation
            </div>
            <p className="text-muted-foreground text-[15px] leading-relaxed font-medium">
              {explanation}
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#C0F0FB] font-bold text-[10px] uppercase tracking-[0.25em]">
              <PlayCircle className="w-4 h-4" /> Real-world Example
            </div>
            <p className="text-muted-foreground text-[15px] leading-relaxed font-medium">
              {example}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="sm:pl-14 pt-4">
          <Link href={ctaHref} className="block sm:inline-block">
            <Button
              variant="outline"
              className="w-full sm:w-auto rounded-md border-[#C0F0FB]/40 text-[#C0F0FB] hover:bg-[#C0F0FB] hover:text-black transition-all group/btn h-12 px-10 font-bold uppercase tracking-widest text-[11px]"
              trackEvent="cta_clicked"
              trackProperties={{ location: 'aeo_block', text: ctaText, question }}
            >
              {ctaText} <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
