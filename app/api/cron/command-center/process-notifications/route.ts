import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "UNAUTHORIZED_CRON" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    job: "process-notifications",
    processedCount: 0,
    timestamp: new Date().toISOString()
  });
}
