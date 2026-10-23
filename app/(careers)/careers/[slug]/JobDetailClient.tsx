"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft, BriefcaseBusiness, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

import { CandidateAuthModal } from "@/components/careers/CandidateAuthModal";
import type { CandidateIdentity } from "@/components/careers/CandidateAuthModal";
import { MultiStepApplicationForm } from "@/components/careers/MultiStepApplicationForm";

type Job = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string | Record<string, unknown>;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  employmentType: string;
  location: string;
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  benefits: string[];
};

export default function JobDetailClient({ job }: { job: Job | null }) {
  const { data: session } = useSession();
  const [candidate, setCandidate] = useState<CandidateIdentity | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [appModalOpen, setAppModalOpen] = useState(false);

  const activeCandidate = session?.user?.role === "CANDIDATE" ? {
    id: session.user.id,
    email: session.user.email,
    fullName: session.user.name || session.user.email,
  } : candidate;

  if (!job) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center px-6 bg-[#A2BECC]">
        <div className="text-center">
          <h1 className="text-3xl font-black text-[#17252D]">Role not found</h1>
          <Link
            href="/careers"
            className="mt-5 inline-block rounded-lg px-4 py-2 text-sm font-bold bg-[#A2BECC] text-[#17252D] hover:bg-[#17252D] hover:text-[#FAFCFD] transition-colors"
          >
            View open roles
          </Link>
        </div>
      </div>
    );
  }

  function handleApplyClick() {
    if (job) window.location.href = `/careers/${job.slug}/apply`;
  }

  const description = typeof job.description === "string" ? job.description : JSON.stringify(job.description);
  return (
    <div className="bg-[#A2BECC] py-12 text-[#17252D] sm:py-16 min-h-screen">
      <article className="mx-auto max-w-[1240px] px-6 md:px-8 lg:px-10">
        <Link
          href="/careers"
          className="inline-flex items-center gap-2 rounded text-xs font-bold font-mono tracking-wider uppercase text-[#55788D] hover:text-[#17252D] transition-colors"
        >
          <ArrowLeft aria-hidden="true" size={14} /> All open roles
        </Link>
        <header className="mt-8 rounded-2xl border border-[#D5E2E9] bg-[#F4F8FA] p-8 sm:p-12 shadow-sm">
          <div className="text-[10px] font-mono font-bold uppercase tracking-[.2em] text-[#55788D]">Open position</div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl text-[#17252D] font-sans">{job.title}</h1>
          <p className="mt-5 text-lg leading-8 text-[#17252D]/80 font-sans">{job.summary}</p>
          <div className="mt-6 flex flex-wrap gap-5 text-sm font-semibold text-[#55788D]">
            <span className="flex items-center gap-2">
              <MapPin aria-hidden="true" size={15} />
              {job.location}{job.isRemote ? " · Remote" : ""}
            </span>
            <span className="flex items-center gap-2">
              <BriefcaseBusiness aria-hidden="true" size={15} />{job.employmentType}
            </span>
          </div>
          <div className="mt-8">
            <button
              onClick={handleApplyClick}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#A2BECC] px-6 text-sm font-bold text-[#17252D] shadow-sm transition hover:bg-[#17252D] hover:text-[#FAFCFD] border border-[#55788D]/30 cursor-pointer"
            >
              Apply for this role <ArrowRight size={16} />
            </button>
          </div>
        </header>
        <div className="mt-6 grid gap-6">
          <Section title="About the role"><p>{description}</p></Section>
          <Section title="What you will do" items={job.responsibilities} />
          <Section title="What we are looking for" items={job.requirements} />
          {job.skills?.length > 0 ? (
            <Section title="Skills">
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-[#E5EFF4] border border-[#D5E2E9] px-3.5 py-1.5 text-xs font-bold text-[#17252D] font-mono">{skill}</span>
                ))}
              </div>
            </Section>
          ) : null}
          {job.benefits?.length > 0 ? <Section title="Benefits" items={job.benefits} /> : null}
        </div>
      </article>

      <CandidateAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(cand) => {
          setCandidate(cand);
          setAppModalOpen(true);
        }}
      />

      {appModalOpen && activeCandidate && (
        <MultiStepApplicationForm
          job={job}
          candidate={activeCandidate}
          onClose={() => setAppModalOpen(false)}
        />
      )}
    </div>
  );
}

function Section({ title, items, children }: { title: string; items?: string[]; children?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#D5E2E9] bg-[#F4F8FA] p-7 shadow-sm">
      <h2 className="text-xl font-bold text-[#17252D] font-sans">{title}</h2>
      <div className="mt-4 text-sm leading-7 text-[#17252D]/85 font-sans">
        {children}
        {items ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A2BECC]" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
