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
      <div className="flex min-h-[60dvh] items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-black">Role not found</h1>
          <Link
            href="/careers"
            className="mt-5 inline-block rounded text-sm font-bold text-[#0075de] outline-none focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:ring-offset-2"
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
    <div className="bg-slate-50 py-12 text-slate-950 sm:py-16">
      <article className="mx-auto max-w-[1240px] px-6 md:px-8 lg:px-10">
        <Link
          href="/careers"
          className="inline-flex items-center gap-2 rounded text-xs font-bold text-slate-500 outline-none hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:ring-offset-2"
        >
          <ArrowLeft aria-hidden="true" size={14} /> All open roles
        </Link>
        <header className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 sm:p-12">
          <div className="text-[10px] font-bold uppercase tracking-[.2em] text-[#0075de]">Open position</div>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{job.title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">{job.summary}</p>
          <div className="mt-6 flex flex-wrap gap-5 text-sm font-semibold text-slate-500">
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
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#0075de] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#0062bd] outline-none focus-visible:ring-2 focus-visible:ring-[#0075de]"
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
                  <span key={skill} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#0075de]">{skill}</span>
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
    <section className="rounded-2xl border border-slate-200 bg-white p-7">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4 text-sm leading-7 text-slate-600">
        {children}
        {items ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0075de]" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
