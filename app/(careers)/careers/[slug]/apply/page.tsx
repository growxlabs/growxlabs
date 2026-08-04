import { notFound } from "next/navigation";
import { findJob, publicJob } from "@/lib/careers/jobs";
import ApplyForm from "../../../../jobs/[slug]/apply/ApplyForm";

export default async function CareersJobApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const job = await findJob((await params).slug);
  if (!job) notFound();
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white sm:px-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
          <a href={`/careers/${job.slug}`} className="font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-white">← Back to role</a>
          <span className="font-serif text-xl">GrowXLabs Careers</span>
        </header>
        <h1 className="mb-8 text-3xl font-semibold">Apply for {job.title}</h1>
        <ApplyForm job={publicJob(job)} />
      </div>
    </main>
  );
}
