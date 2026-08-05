import { notFound } from "next/navigation";
import { findJob, publicJob } from "@/lib/careers/jobs";
import ApplyForm from "../../../../jobs/[slug]/apply/ApplyForm";

export default async function CareersJobApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const job = await findJob((await params).slug);
  if (!job) notFound();
  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
          <a href={`/careers/${job.slug}`} className="font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-white">← Back to role</a>
          <span className="font-serif text-xl">GrowXLabs Careers</span>
        </header>
        <div className="mb-8 border-b border-white/10 pb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#c0f0fb]">Candidate application</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{job.title}</h1>
          <p className="mt-4 text-sm text-zinc-400">{job.department || "GrowXLabs Careers"} · {job.location || "India"} · {job.employment_type || "Full-time"}</p>
        </div>
        <ApplyForm job={publicJob(job)} />
      </div>
    </main>
  );
}
