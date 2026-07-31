"use client";

import { ArrowRight, BriefcaseBusiness, Building2, Clock3, MapPin } from "lucide-react";
import Link from "next/link";

export type CareerJob = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  departmentId: string;
  employmentType: string;
  location: string;
  isRemote: boolean;
  publishedAt: string;
};

export function JobCard({ job }: { job: CareerJob }) {
  return (
    <Link
      href={`/careers/${job.slug}`}
      prefetch
      className="group flex min-h-32 flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 outline-none transition hover:-translate-y-0.5 hover:border-[#0075de]/30 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:ring-offset-2 sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#0075de]">
          <Building2 aria-hidden="true" size={13} /> Open position
        </div>
        <h2 className="mt-2 text-xl font-black group-hover:text-[#0075de]">{job.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{job.summary}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <MapPin aria-hidden="true" size={13} />
            {job.location}{job.isRemote ? " · Remote" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <BriefcaseBusiness aria-hidden="true" size={13} />{job.employmentType}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock3 aria-hidden="true" size={13} />
            Posted {new Date(job.publishedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <ArrowRight aria-hidden="true" className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0075de]" />
    </Link>
  );
}
