import { NextResponse } from "next/server";
import { resolveCommandCenterContext } from "@/lib/command-center/context/command-center-context";
import { ArtifactService } from "@/lib/command-center/artifacts/artifact-service";
import { ArtifactTypeSchema } from "@/lib/command-center/artifacts/artifact.types";
import { requireSameOrigin } from "@/lib/command-center/security/browser-request";
import { CommandCenterError, errorResponse, requestIdFrom } from "@/lib/command-center/production/errors";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/command-center/production/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = requestIdFrom(req);
  try {
    const context = await resolveCommandCenterContext({ req });
    const limit = await enforceRateLimit("governance.read", req, context);
    const artifacts = (await ArtifactService.listArtifacts(context.organizationId, context.workspaceId)).map((artifact) => ({
      id: artifact.id, version: artifact.version, conversationId: artifact.conversationId,
      runId: artifact.runId, createdByUserId: artifact.createdByUserId,
      createdByAgentId: artifact.createdByAgentId, artifactType: artifact.artifactType,
      name: artifact.name, safeDescription: artifact.safeDescription, mimeType: artifact.mimeType,
      fileExtension: artifact.fileExtension, sizeBytes: artifact.sizeBytes,
      classification: artifact.classification, status: artifact.status,
      createdAt: artifact.createdAt, expiresAt: artifact.expiresAt,
    }));
    return NextResponse.json({ success: true, artifacts }, { headers: { ...rateLimitHeaders(limit), "Cache-Control": "private, no-store", "X-Request-ID": requestId } });
  } catch (error: unknown) {
    return errorResponse(error, requestId);
  }
}

export async function DELETE(req: Request) {
  const requestId = requestIdFrom(req);
  try {
    requireSameOrigin(req);
    const context = await resolveCommandCenterContext({ req });
    const limit = await enforceRateLimit("artifact.generate", req, context);
    const id = new URL(req.url).searchParams.get("id") ?? "";
    if (!id) throw new CommandCenterError("VALIDATION_FAILED");
    const deleted = await ArtifactService.deleteArtifact(id, context.organizationId, context.workspaceId, context.userId);
    if (!deleted) throw new CommandCenterError("PERMISSION_DENIED");
    return NextResponse.json({ success: true }, { headers: { ...rateLimitHeaders(limit), "X-Request-ID": requestId } });
  } catch (error: unknown) {
    return errorResponse(error, requestId);
  }
}

export async function POST(req: Request) {
  const requestId = requestIdFrom(req);
  try {
    requireSameOrigin(req);
    const context = await resolveCommandCenterContext({ req });
    const limit = await enforceRateLimit("artifact.generate", req, context);
    const raw = await req.json() as unknown;
    if (!raw || typeof raw !== "object") throw new CommandCenterError("VALIDATION_FAILED");
    const body = raw as Record<string, unknown>;
    const artifactType = ArtifactTypeSchema.safeParse(body.artifactType ?? "markdown");
    const name = typeof body.name === "string" ? body.name : "generated_artifact";
    if (!artifactType.success || !name.trim() || name.length > 200) throw new CommandCenterError("VALIDATION_FAILED");
    const suppliedContent = body.content && typeof body.content === "object" ? body.content as Record<string, unknown> : null;
    const content = suppliedContent ? {
      title: typeof suppliedContent.title === "string" ? suppliedContent.title : name,
      rawMarkdown: typeof suppliedContent.rawMarkdown === "string" ? suppliedContent.rawMarkdown : undefined,
    } : { title: name, rawMarkdown: typeof body.markdownText === "string" ? body.markdownText : undefined };

    const record = await ArtifactService.generateArtifact({
      organisationId: context.organizationId,
      workspaceId: context.workspaceId,
      requestedByUserId: context.userId,
      artifactType: artifactType.data,
      name,
      content,
      classification: body.classification === "public" || body.classification === "confidential" || body.classification === "restricted" ? body.classification : "internal",
      idempotencyKey: req.headers.get("idempotency-key") ?? undefined,
    });

    return NextResponse.json({ success: true, record: {
      id: record.id, artifactType: record.artifactType, name: record.name,
      safeDescription: record.safeDescription, mimeType: record.mimeType,
      fileExtension: record.fileExtension, sizeBytes: record.sizeBytes,
      classification: record.classification, status: record.status, createdAt: record.createdAt,
    } }, { headers: { ...rateLimitHeaders(limit), "Cache-Control": "private, no-store", "X-Request-ID": requestId } });
  } catch (error: unknown) {
    return errorResponse(error, requestId);
  }
}
