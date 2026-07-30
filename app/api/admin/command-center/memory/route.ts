import { NextResponse } from "next/server";
import { resolveCommandCenterContext } from "@/lib/command-center/context/command-center-context";
import { MemoryService } from "@/lib/command-center/memory/memory-service";
import { requireSameOrigin } from "@/lib/command-center/security/browser-request";
import { CommandCenterError, errorResponse, requestIdFrom } from "@/lib/command-center/production/errors";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/command-center/production/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = requestIdFrom(req);
  try {
    const context = await resolveCommandCenterContext({ req });
    const limit = await enforceRateLimit("governance.read", req, context);
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || undefined;

    const memories = await MemoryService.retrieveMemory({
      organisationId: context.organizationId,
      workspaceId: context.workspaceId,
      userId: context.userId,
      searchQuery,
      topK: 20
    });

    return NextResponse.json({ success: true, memories }, { headers: { ...rateLimitHeaders(limit), "Cache-Control": "private, no-store", "X-Request-ID": requestId } });
  } catch (error: unknown) {
    return errorResponse(error, requestId);
  }
}

export async function POST(req: Request) {
  const requestId = requestIdFrom(req);
  try {
    requireSameOrigin(req);
    const context = await resolveCommandCenterContext({ req });
    const limit = await enforceRateLimit("memory.mutate", req, context);
    const body = await req.json() as Record<string, unknown>;
    if (typeof body.content !== "string" || !body.content.trim() || body.content.length > 4_000) {
      throw new CommandCenterError("VALIDATION_FAILED");
    }

    const record = await MemoryService.writeMemory({
      version: "1.0.0",
      organisationId: context.organizationId,
      workspaceId: context.workspaceId,
      ownerType: body.ownerType === "user" ? "user" : "user",
      ownerId: context.userId,
      memoryType: "user_preference",
      title: typeof body.title === "string" ? body.title.slice(0, 200) : undefined,
      content: body.content,
      classification: body.classification === "confidential" ? "confidential" : "internal",
      confidence: 1.0,
      status: "active",
      createdBy: { type: "user", id: context.userId },
      validFrom: new Date().toISOString()
    });

    return NextResponse.json({ success: true, record }, { headers: { ...rateLimitHeaders(limit), "Cache-Control": "private, no-store", "X-Request-ID": requestId } });
  } catch (error: unknown) {
    return errorResponse(error, requestId);
  }
}

export async function DELETE(req: Request) {
  const requestId = requestIdFrom(req);
  try {
    requireSameOrigin(req);
    const context = await resolveCommandCenterContext({ req });
    const limit = await enforceRateLimit("memory.mutate", req, context);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      throw new CommandCenterError("VALIDATION_FAILED");
    }

    const ok = await MemoryService.deleteMemory(id, context.organizationId, context.workspaceId, context.userId);
    if (!ok) throw new CommandCenterError("PERMISSION_DENIED");
    return NextResponse.json({ success: true }, { headers: { ...rateLimitHeaders(limit), "X-Request-ID": requestId } });
  } catch (error: unknown) {
    return errorResponse(error, requestId);
  }
}

export async function PATCH(req: Request) {
  const requestId = requestIdFrom(req);
  try {
    requireSameOrigin(req);
    const context = await resolveCommandCenterContext({ req });
    const limit = await enforceRateLimit("memory.mutate", req, context);
    const body = await req.json() as unknown;
    if (!body || typeof body !== "object") throw new CommandCenterError("VALIDATION_FAILED");
    const value = body as Record<string, unknown>;
    const id = typeof value.id === "string" ? value.id : "";
    const content = typeof value.content === "string" ? value.content : "";
    const disabled = value.disabled === true;
    if (!id || (!disabled && (!content.trim() || content.length > 4_000))) throw new CommandCenterError("VALIDATION_FAILED");
    const record = await MemoryService.updatePreference(id, context.organizationId, context.workspaceId, context.userId, content, disabled);
    if (!record) throw new CommandCenterError("PERMISSION_DENIED");
    return NextResponse.json({ success: true, record }, { headers: { ...rateLimitHeaders(limit), "Cache-Control": "private, no-store", "X-Request-ID": requestId } });
  } catch (error: unknown) {
    return errorResponse(error, requestId);
  }
}
