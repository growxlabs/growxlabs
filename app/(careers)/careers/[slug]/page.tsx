import type { Metadata } from "next";
import { redirect } from "next/navigation";
import JobDetailClient from "./JobDetailClient";
import { requiredHrmsGatewayURL } from "@/lib/hrms/gateway";

const RESERVED_SLUGS = ["login", "auth", "admin", "dashboard", "api"];

async function getJob(slug: string) {
  if (RESERVED_SLUGS.includes(slug)) return null;
  let base = "";
  try {
    base = requiredHrmsGatewayURL();
  } catch {
    return null;
  }
  const organisationId = process.env.DEFAULT_ORGANISATION_ID;
  if (!base || !organisationId) return null;
  try {
    const response = await fetch(
      `${base.replace(/\/$/, "")}/v1/recruitment/public/jobs/${encodeURIComponent(slug)}?organisationId=${encodeURIComponent(organisationId)}`,
      { next: { revalidate: 60 } },
    );
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED_SLUGS.includes(slug)) return { title: "GrowX Labs Careers" };
  const job = await getJob(slug);
  return job
    ? {
        title: `${job.title} | Careers at GrowX Labs`,
        description: job.summary,
        alternates: { canonical: `/careers/${slug}` },
        openGraph: { title: job.title, description: job.summary, type: "website" },
      }
    : { title: "Role not found | GrowX Labs" };
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (RESERVED_SLUGS.includes(slug)) {
    redirect("/careers");
  }
  const job = await getJob(slug);
  return <JobDetailClient job={job} />;
}
