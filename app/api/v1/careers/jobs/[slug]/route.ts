import { NextResponse } from "next/server";
import { findJob, publicJob } from "@/lib/careers/jobs";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try { const job = await findJob((await params).slug); return job ? NextResponse.json({ job: publicJob(job) }) : NextResponse.json({ error: "Role not found" }, { status: 404 }); }
  catch { return NextResponse.json({ error: "Unable to load role" }, { status: 500 }); }
}
