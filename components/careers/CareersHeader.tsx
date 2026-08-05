import { ArrowLeft } from "lucide-react";

export function CareersHeader() {
  return (
    <header className="h-16 shrink-0 border-b border-slate-200 bg-white text-slate-950">
      <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between px-6 md:px-8 lg:px-10">
        <a
          href="https://growxlabs.tech"
          className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-600 outline-none transition-colors hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:ring-offset-2"
          aria-label="Back to GrowXLabs home"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Back to Home
        </a>
        <div className="flex items-center gap-4">
          <a
            href="/careers/login"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
          >
            Candidate Portal
          </a>
          <a
            href="https://growxlabs.tech"
            className="rounded-md font-serif text-xl font-semibold tracking-tight text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:ring-offset-2"
            aria-label="GrowXLabs home"
          >
            GrowXLabs
          </a>
        </div>
      </div>
    </header>
  );
}
