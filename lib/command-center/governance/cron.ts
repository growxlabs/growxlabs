import "server-only";

import { GovernanceClient } from "./governance-client";
import { CommandCenterError } from "../production/errors";
import { runBoundedCron } from "../production/cron-runtime";

export async function runGovernanceCron(request: Request, path: string): Promise<Response> {
  const job = path.endsWith("expire-approvals") ? "expire-approvals" : "process-audit-outbox";
  return runBoundedCron(request, job, async () => {
    const requestId = request.headers.get("x-vercel-id") ?? crypto.randomUUID();
    const organisationId = process.env.DEFAULT_ORGANISATION_ID;
    const workspaceId = process.env.DEFAULT_WORKSPACE_ID;
    if (!organisationId || !workspaceId) {
      throw new CommandCenterError("TENANT_SCOPE_INVALID", {
        message: "The trusted Cron scope is unavailable.",
      });
    }
    const upstream = await new GovernanceClient().request(
      path,
      "POST",
      { organisationId, workspaceId, userId: "vercel-cron", requestId },
      undefined,
      new URLSearchParams({ limit: "100" }),
      true,
    );
    if (!upstream.ok) {
      throw new CommandCenterError("DEPENDENCY_UNAVAILABLE", {
        message: "Governance processing is temporarily unavailable.",
        retryable: upstream.status >= 500,
      });
    }
    const result = await upstream.json() as Record<string, unknown>;
    return {
      processed: typeof result.processed === "number" ? result.processed : 0,
      succeeded: typeof result.succeeded === "number" ? result.succeeded : 0,
      failed: typeof result.failed === "number" ? result.failed : 0,
      checkpoint: typeof result.checkpoint === "string" ? result.checkpoint : null,
    };
  });
}
