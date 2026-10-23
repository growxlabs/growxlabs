"use client";

import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function RefundPage() {
  return (
    <div className="pt-28 pb-24 px-6 md:px-10 xl:px-16 2xl:px-24 w-full bg-[#A2BECC] text-[#17252D]">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
        <div className="mb-16 text-center lg:text-left">
          <span className="text-[11px] sm:text-[12px] font-mono font-bold uppercase tracking-[0.2em] text-[#55788D] mb-4 block">
            // Financial Protocols
          </span>
          <h1 className="text-[clamp(40px,7vw,72px)] font-sans font-black text-[#17252D] tracking-tighter mb-8 leading-[1.1] uppercase">
            Refund Policy
          </h1>
          <p className="text-xl text-[#55788D] font-medium leading-relaxed max-w-2xl font-sans">
            Transparent financial protocols for cancellations and project terminations.
          </p>
        </div>

        <div className="space-y-6 mb-20 max-w-4xl mx-auto lg:mx-0">
          <PolicyCard 
            icon={<CheckCircle className="text-[#55788D]" />} 
            title="Full Refund" 
            text="100% refund of initial deposit if requested before project assessment or engineering cycles begin." 
          />
          <PolicyCard 
            icon={<AlertCircle className="text-[#55788D]" />} 
            title="Non-Refundable" 
            text="Once technical engineering or strategic logic design has commenced, the initial 50% deposit is non-refundable." 
          />
          <PolicyCard 
            icon={<Clock className="text-[#55788D]" />} 
            title="Failure to Deliver" 
            text="A full or partial refund will be provided if GrowxLabs fails to meet the agreed architectural deliverables within a reasonable grace period." 
          />
        </div>

        <section className="bg-[#F4F8FA] border border-[#D5E2E9] p-8 sm:p-12 rounded-2xl mb-20 max-w-4xl mx-auto lg:mx-0 shadow-sm">
          <h2 className="text-[clamp(28px,5vw,36px)] font-sans font-bold text-[#17252D] mb-8 tracking-tight uppercase">The Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[#17252D]/85 font-medium text-base sm:text-lg">
            <p>
              To initiate a refund, please email <span className="text-[#17252D] font-bold">svp@growxlabs.tech</span> with your project ID and reason for cancellation.
            </p>
            <p>
              Processing typically takes <span className="text-[#17252D] font-bold">7–10 business days</span> following formal approval of the refund request.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function PolicyCard({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) {
  return (
    <div 
      className="bg-[#F4F8FA] border border-[#D5E2E9] p-6 sm:p-8 rounded-2xl flex gap-6 sm:gap-8 items-start shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="h-12 w-12 rounded-xl bg-[#E5EFF4] border border-[#D5E2E9] flex items-center justify-center shrink-0 text-[#17252D]">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-sans font-bold text-[#17252D] mb-2 tracking-tight">{title}</h3>
        <p className="text-[#55788D] font-normal leading-relaxed text-sm md:text-base">{text}</p>
      </div>
    </div>
  );
}
