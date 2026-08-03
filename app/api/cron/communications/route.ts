import { processCommunicationQueue } from "@/lib/communications/worker";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: Request) { const secret = process.env.CRON_SECRET; if (!secret) return Response.json({ error: "CRON_SECRET is not configured." }, { status: 503 }); if (request.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "Unauthorized." }, { status: 401 }); try { return Response.json(await processCommunicationQueue(20)); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Communication worker failed." }, { status: 500 }); } }
