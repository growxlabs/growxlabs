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
        <a
          href="https://growxlabs.tech"
          className="rounded-md font-serif text-xl font-semibold tracking-tight text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:ring-offset-2"
          aria-label="GrowXLabs home"
        >
          GrowXLabs
        </a>
      </div>
    </header>
  );
}
