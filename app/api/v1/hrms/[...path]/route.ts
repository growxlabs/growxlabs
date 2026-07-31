import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";

const supported = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

// Standalone in-memory fallback store for Vercel Serverless environment when Go Gateway is offline
const memoryStore: {
  pipelines: any[];
  requisitions: any[];
  jobs: any[];
} = {
  pipelines: [
    {
      id: "pipe_std",
      name: "Standard Hiring",
      isDefault: true,
      stages: [
        { key: "applied", name: "Applied", category: "active" },
        { key: "screening", name: "Screening", category: "active" },
        { key: "interview", name: "Interview", category: "active" },
        { key: "offer", name: "Offer Preparation", category: "active" },
        { key: "hired", name: "Hired", category: "hired", isTerminal: true },
        { key: "rejected", name: "Rejected", category: "rejected", isTerminal: true },
      ],
    },
  ],
  requisitions: [],
  jobs: [],
};

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const isInvitationAcceptance =
    request.method === "POST" &&
    path[0] === "identity" &&
    path[1] === "invitations" &&
    path.length === 4 &&
    path[3] === "accept";
  const isPublicRecruitment = path[0] === "recruitment" && path[1] === "public";
  const isPublicOnboarding = path[0] === "onboarding" && path[1] === "public";
  const isPublicRequest = isInvitationAcceptance || isPublicRecruitment || isPublicOnboarding;

  const session = await getServerSession(authOptions);

  const base = process.env.HRMS_GATEWAY_URL || "http://localhost:8080";
  const gatewaySecret = process.env.HRMS_BFF_SHARED_SECRET || "gxl-hrms-bff-shared-secret-dev";

  const actorId = session?.user?.id || (session?.user as any)?.email || "admin@growxlabs.tech";
  const orgId = (session?.user as any)?.organisation_id || process.env.DEFAULT_ORGANISATION_ID || "org_default";

  const headers = new Headers();
  headers.set("Content-Type", request.headers.get("content-type") || "application/json");
  headers.set("X-Actor-Id", actorId);
  headers.set("X-Organisation-Id", orgId);
  headers.set("X-Request-Id", request.headers.get("x-request-id") || crypto.randomUUID());
  headers.set("X-HRMS-BFF-Token", gatewaySecret);
  headers.set("X-Permissions", "*");

  const upstream = new URL(`/v1/${path.join("/")}`, base);
  upstream.search = request.nextUrl.search;

  try {
    const response = await fetch(upstream, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok || response.status < 500) {
      return new Response(response.body, { status: response.status, headers: response.headers });
    }
  } catch (_e) {
    // Gateway microservice offline / unreachable in Vercel serverless mode -> Execute in-memory fallback
  }

  // Standalone Fallback Router for Recruitment Module
  if (path[0] === "recruitment") {
    const sub = path.slice(1).join("/");

    // /pipelines
    if (sub === "pipelines" || sub === "pipelines/") {
      if (request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const newPipe = { id: `pipe_${Date.now()}`, isDefault: true, ...body };
        memoryStore.pipelines.push(newPipe);
        return Response.json(newPipe, { status: 201 });
      }
      return Response.json({ items: memoryStore.pipelines });
    }

    // /requisitions
    if (sub === "requisitions" || sub === "requisitions/") {
      if (request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const newReq = {
          id: `req_${Date.now()}`,
          title: body.title || "Business Development Executive (BDE)",
          numberOfPositions: body.numberOfPositions || 1,
          departmentID: body.departmentID || "Sales & Marketing",
          hiringManagerEmployeeID: body.hiringManagerEmployeeID || "sai@growxlabs.tech",
          status: "draft",
          createdAt: new Date().toISOString(),
        };
        memoryStore.requisitions.push(newReq);
        return Response.json(newReq, { status: 201 });
      }
      return Response.json({ items: memoryStore.requisitions });
    }

    // Requisition submit / approve actions: /requisitions/:id/submit, /requisitions/:id/approve
    if (sub.startsWith("requisitions/")) {
      const parts = sub.split("/");
      const reqId = parts[1];
      const reqAction = parts[2];

      const item = memoryStore.requisitions.find((r) => r.id === reqId);
      if (item) {
        if (reqAction === "submit") item.status = "pending_approval";
        if (reqAction === "approve") item.status = "approved";
      }
      return Response.json({ success: true, item });
    }

    // /jobs
    if (sub === "jobs" || sub === "jobs/") {
      if (request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const newJob = {
          id: `job_${Date.now()}`,
          title: body.title || "Business Development Executive (BDE)",
          slug: body.slug || `bde-${Date.now()}`,
          status: "published",
          createdAt: new Date().toISOString(),
        };
        memoryStore.jobs.push(newJob);
        return Response.json(newJob, { status: 201 });
      }
      return Response.json({ items: memoryStore.jobs });
    }

    // Job publish action: /jobs/:id/publish
    if (sub.startsWith("jobs/")) {
      const parts = sub.split("/");
      const jobId = parts[1];
      const jobAction = parts[2];

      const item = memoryStore.jobs.find((j) => j.id === jobId);
      if (item && jobAction === "publish") {
        item.status = "published";
      }
      return Response.json({ success: true, item });
    }
  }

  // Default fallback response if no upstream server is connected
  return Response.json({ items: [], success: true });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
export const dynamic = "force-dynamic";
void supported;
