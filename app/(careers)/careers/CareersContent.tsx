"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CircleAlert,
  Search,
  UploadCloud,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { CareerJob } from "@/components/careers/JobCard";
import { CandidateAuthModal } from "@/components/careers/CandidateAuthModal";
import type { CandidateIdentity } from "@/components/careers/CandidateAuthModal";
import { MultiStepApplicationForm } from "@/components/careers/MultiStepApplicationForm";
import { TalentNetworkModal } from "@/components/careers/TalentNetworkModal";
import { CandidateDashboard } from "@/components/careers/CandidateDashboard";

type JobsResponse = { items: CareerJob[] };
type JobFilters = {
  query: string;
  location: string;
  employmentType: string;
  organisationId: string;
};

const JobCard = dynamic(
  () => import("@/components/careers/JobCard").then((module) => module.JobCard),
  { loading: () => <JobCardSkeleton /> },
);

async function getJobs(filters: JobFilters, signal?: AbortSignal): Promise<JobsResponse> {
  const params = new URLSearchParams({ organisationId: filters.organisationId });
  if (filters.query) params.set("q", filters.query);
  if (filters.location) params.set("location", filters.location);
  if (filters.employmentType) params.set("employmentType", filters.employmentType);
  const response = await fetch(`/api/v1/hrms/recruitment/public/jobs?${params}`, {
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error("careers_jobs_unavailable");
  return response.json() as Promise<JobsResponse>;
}

export function CareersContent() {
  const { data: session } = useSession();
  const organisationId = process.env.NEXT_PUBLIC_DEFAULT_ORGANISATION_ID ?? "";
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const queryClient = useQueryClient();

  // Candidate Auth & Modal States
  const [candidate, setCandidate] = useState<CandidateIdentity | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [talentModalOpen, setTalentModalOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [applyingJob, setApplyingJob] = useState<CareerJob | null>(null);

  const activeCandidate = session?.user?.role === "CANDIDATE" ? {
    id: session.user.id,
    googleId: session.user.id,
    email: session.user.email,
    fullName: session.user.name || session.user.email,
    profilePictureUrl: session.user.image,
  } : candidate;

  const filters = useMemo<JobFilters>(
    () => ({ query, location, employmentType, organisationId }),
    [employmentType, location, organisationId, query],
  );

  const jobsQuery = useQuery({
    queryKey: ["careers", "jobs", filters],
    queryFn: ({ signal }) => getJobs(filters, signal),
    enabled: Boolean(organisationId),
    retry: 2,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const jobs = useMemo(() => jobsQuery.data?.items ?? [], [jobsQuery.data?.items]);
  const locations = useMemo(
    () => [...new Set(jobs.map((job) => job.location).filter(Boolean))].sort(),
    [jobs],
  );
  const hasError = !organisationId || jobsQuery.isError;

  function retry() {
    void queryClient.invalidateQueries({ queryKey: ["careers", "jobs"] });
  }

  function handleStartApplication(job: CareerJob) {
    if (!activeCandidate) {
      setApplyingJob(job);
      setAuthModalOpen(true);
    } else {
      setApplyingJob(job);
    }
  }

  function handleJoinTalentNetwork() {
    if (!activeCandidate) {
      setTalentModalOpen(true);
      setAuthModalOpen(true);
    } else {
      setTalentModalOpen(true);
    }
  }

  function handleAuthSuccess(authCandidate: CandidateIdentity) {
    setCandidate(authCandidate);
    setAuthModalOpen(false);
  }

  return (
    <div className="bg-[#f8fafc] text-slate-950">
      {/* Hero Section with AI-Native Product Studio Positioning */}
      <section className="border-b border-slate-200 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-[1240px] px-6 md:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="text-[11px] font-bold uppercase tracking-[.2em] text-[#0075de]">
              Careers at GrowX Labs
            </div>
            {activeCandidate ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDashboardOpen(!dashboardOpen)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2 text-xs font-bold text-[#0075de] hover:bg-blue-100"
                >
                  <User size={14} /> Candidate Portal ({activeCandidate.fullName ? activeCandidate.fullName.split(" ")[0] : "Active"})
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Candidate Sign In
              </button>
            )}
          </div>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
            Build AI-native products that transform how businesses work.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Join GrowXLabs, an AI-native product studio building intelligent software, agentic systems, automation platforms, and enterprise products for ambitious companies.
          </p>

          {/* Prominent Talent Network CTA Banner */}
          <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0075de] text-white">
              <UploadCloud size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900">Upload your resume and join our talent network</h3>
              <p className="text-xs text-slate-600">
                Proactive hiring: Let our engineering recruiters discover your profile for upcoming roles.
              </p>
            </div>
            <button
              onClick={handleJoinTalentNetwork}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0075de] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#0062bd] shadow-sm"
            >
              Join Talent Network <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Candidate Dashboard View */}
      {dashboardOpen && activeCandidate ? (
        <section className="mx-auto max-w-[1240px] px-6 py-10 md:px-8 lg:px-10">
          <CandidateDashboard candidate={activeCandidate} onClose={() => setDashboardOpen(false)} />
        </section>
      ) : null}

      {/* Jobs Search & Listings Section */}
      <section aria-labelledby="open-positions-title" className="mx-auto max-w-[1240px] px-6 py-10 md:px-8 lg:px-10">
        <h2 id="open-positions-title" className="sr-only">Open positions</h2>
        {jobsQuery.isPending && organisationId ? (
          <FiltersSkeleton />
        ) : (
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-[minmax(320px,1fr)_220px_220px]">
            <label className="relative md:col-span-2 lg:col-span-1">
              <span className="sr-only">Search open positions</span>
              <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search roles, skills or teams"
                className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
              />
            </label>
            <label>
              <span className="sr-only">Filter by location</span>
              <select
                aria-label="Filter by location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
              >
                <option value="">All locations</option>
                {location && !locations.includes(location) ? <option value={location}>{location}</option> : null}
                {locations.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Filter by employment type</span>
              <select
                aria-label="Filter by employment type"
                value={employmentType}
                onChange={(event) => setEmploymentType(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
              >
                <option value="">All employment types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </label>
          </div>
        )}

        {hasError ? (
          <ErrorState onRetry={retry} />
        ) : (
          <div className="mt-8 space-y-3" aria-live="polite">
            {jobsQuery.isPending
              ? Array.from({ length: 4 }, (_, index) => <JobCardSkeleton key={index} />)
              : jobs.map((job) => (
                  <div key={job.id} onClick={() => handleStartApplication(job)}>
                    <JobCard job={job} />
                  </div>
                ))}
            {!jobsQuery.isPending && jobs.length === 0 ? <EmptyState /> : null}
          </div>
        )}
      </section>

      {/* Candidate Google Authentication Modal */}
      <CandidateAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* 7-Step Job Application Modal */}
      {applyingJob && activeCandidate && (
        <MultiStepApplicationForm
          job={applyingJob}
          candidate={activeCandidate}
          onClose={() => setApplyingJob(null)}
        />
      )}

      {/* Talent Network Modal */}
      <TalentNetworkModal
        isOpen={talentModalOpen}
        candidate={activeCandidate}
        onClose={() => setTalentModalOpen(false)}
      />
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div aria-label="Loading job filters" className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-[minmax(320px,1fr)_220px_220px]">
      <div className="h-11 animate-pulse rounded-xl bg-slate-200 md:col-span-2 lg:col-span-1" />
      <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
      <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
    </div>
  );
}

function JobCardSkeleton() {
  return <div aria-hidden="true" className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white" />;
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
      <CircleAlert aria-hidden="true" size={20} />
      <h2 className="mt-3 text-lg font-black">We couldn&apos;t load open positions.</h2>
      <p className="mt-1 text-sm text-red-700">Please try again in a moment.</p>
      <button
        onClick={onRetry}
        className="mt-5 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white outline-none hover:bg-red-800 focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
      >
        Retry
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <BriefcaseBusiness aria-hidden="true" className="mx-auto text-slate-300" size={34} />
      <h2 className="mt-4 font-black">No open positions available.</h2>
      <p className="mt-1 text-sm text-slate-500">We&apos;re always looking for exceptional people. Check back soon.</p>
      <a
        href="https://growxlabs.tech"
        className="mt-6 inline-flex items-center gap-2 rounded-lg text-sm font-bold text-[#0075de] outline-none focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:ring-offset-2"
      >
        Back to Home <ArrowRight aria-hidden="true" size={15} />
      </a>
    </div>
  );
}
