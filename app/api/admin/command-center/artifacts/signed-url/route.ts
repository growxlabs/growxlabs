import { NextResponse } from "next/server";
import { resolveCommandCenterContext } from "@/lib/command-center/context/command-center-context";
import { ArtifactService } from "@/lib/command-center/artifacts/artifact-service";
import { R2StorageService } from "@/lib/command-center/artifacts/r2-storage";
import { requireSameOrigin } from "@/lib/command-center/security/browser-request";
import { CommandCenterError, errorResponse, requestIdFrom } from "@/lib/command-center/production/errors";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/command-center/production/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = requestIdFrom(req);
  try {
    requireSameOrigin(req);
    const context = await resolveCommandCenterContext({ req });
    const limit = await enforceRateLimit("artifact.signed-url", req, context);
    const body = await req.json() as unknown;
    const artifactId = body && typeof body === "object" && typeof (body as Record<string, unknown>).artifactId === "string"
      ? (body as Record<string, string>).artifactId
      : "";

    if (!artifactId) {
      throw new CommandCenterError("VALIDATION_FAILED");
    }

    const artifact = await ArtifactService.getArtifact(artifactId, context.organizationId, context.workspaceId);
    if (!artifact) {
      await ArtifactService.auditAccess(artifactId, context.userId, "access_denied").catch(() => undefined);
      throw new CommandCenterError("RESOURCE_NOT_FOUND");
    }

    const signedUrl = R2StorageService.generateSignedDownloadUrl(artifact.objectKey, 900);
    await ArtifactService.auditAccess(artifact.id, context.userId, "signed_url_issued");
    return NextResponse.json(
      { success: true, signedUrl, expiresAt: new Date(Date.now() + 900000).toISOString() },
      { headers: { ...rateLimitHeaders(limit), "Cache-Control": "private, no-store", "X-Request-ID": requestId } },
    );
  } catch (error: unknown) {
    return errorResponse(error, requestId);
  }
}
