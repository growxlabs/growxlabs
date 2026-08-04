import Link from "next/link";
import { notFound } from "next/navigation";
import { findJob, publicJob } from "@/lib/careers/jobs";
import ApplyForm from "./ApplyForm";

export default async function JobApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const job = await findJob((await params).slug);
  if (!job) notFound();
  const role = publicJob(job);
  return <main className="min-h-screen bg-[#080a0b] text-white [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:24px_24px]">
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <header className="flex items-center justify-between border-b border-white/10 pb-6"><Link href={`/careers/${role.slug}`} className="font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-white">← Back to role</Link><span className="font-serif text-xl">GrowXLabs Careers</span></header>
      <div className="grid gap-10 py-10 lg:grid-cols-[.34fr_1fr]">
        <aside className="lg:sticky lg:top-8 lg:self-start"><p className="font-mono text-[10px] uppercase tracking-[.25em] text-[#c0f0fb]">{role.job_reference}</p><h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{role.title}</h1><p className="mt-4 text-sm leading-7 text-zinc-400">{role.summary || role.description}</p><dl className="mt-8 space-y-4 border-t border-white/10 pt-6 text-sm"><div><dt className="text-zinc-500">Location</dt><dd className="mt-1">{role.location}</dd></div><div><dt className="text-zinc-500">Employment</dt><dd className="mt-1">{role.employment_type} · {role.workplace_type}</dd></div><div><dt className="text-zinc-500">Availability</dt><dd className="mt-1 text-[#c0f0fb]">{role.availability.open ? "Applications open" : role.availability.code === "APPLICATIONS_NOT_OPEN" ? "Applications open soon" : "Applications closed"}</dd></div></dl></aside>
        <ApplyForm job={role} />
      </div>
    </div>
  </main>;
}
