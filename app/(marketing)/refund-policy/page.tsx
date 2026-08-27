"use client";

import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function RefundPage() {
  return (
    <div className="pt-32 pb-24 px-6 md:px-10 xl:px-16 2xl:px-24 w-full bg-muted">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
        <div className="mb-16 text-center lg:text-left">
          <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-[#355CFF] mb-4 block">
            Financial Protocols
          </span>
          <h1 className="text-[clamp(40px,7vw,72px)] font-black text-foreground tracking-tighter mb-8 leading-[1.1] uppercase">
            Refund <span className="text-gradient">Policy.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
            Transparent financial protocols for cancellations and project terminations.
          </p>
        </div>

        <div className="space-y-8 mb-20 max-w-4xl mx-auto lg:mx-0">
          <PolicyCard 
            icon={<CheckCircle className="text-[#355CFF]" />} 
            title="Full Refund" 
            text="100% refund of initial deposit if requested before project assessment or engineering cycles begin." 
          />
          <PolicyCard 
            icon={<AlertCircle className="text-[#355CFF]" />} 
            title="Non-Refundable" 
            text="Once technical engineering or strategic logic design has commenced, the initial 50% deposit is non-refundable." 
          />
          <PolicyCard 
            icon={<Clock className="text-[#355CFF]" />} 
            title="Failure to Deliver" 
            text="A full or partial refund will be provided if GrowxLabs fails to meet the agreed architectural deliverables within a reasonable grace period." 
          />
        </div>

        <section className="bg-card border border-border p-12 rounded-[24px] mb-20 max-w-4xl mx-auto lg:mx-0 shadow-sm">
          <h2 className="text-[clamp(28px,5vw,36px)] font-black text-foreground mb-8 tracking-tighter uppercase underline decoration-[#E5E2DC] underline-offset-8">The Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-muted-foreground font-medium text-lg">
            <p>
              To initiate a refund, please email <span className="text-foreground font-bold">sai@growxlabs.tech</span> with your project ID and reason for cancellation.
            </p>
            <p>
              Processing typically takes <span className="text-foreground font-bold">7–10 business days</span> following formal approval of the refund request.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function PolicyCard({ icon, title, text }: { icon: any, title: string, text: string }) {
  return (
    <div 
      className="bg-card border border-border p-8 rounded-[24px] flex gap-8 items-start shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="h-12 w-12 rounded-2xl bg-[#355CFF]/5 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-black text-foreground mb-2 tracking-tight uppercase">{title}</h3>
        <p className="text-muted-foreground font-medium leading-relaxed text-sm md:text-base">{text}</p>
      </div>
    </div>
  );
}
