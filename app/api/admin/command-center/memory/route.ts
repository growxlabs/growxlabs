import { NextResponse } from "next/server";
import { resolveCommandCenterContext } from "@/lib/command-center/context/command-center-context";
import { MemoryService } from "@/lib/command-center/memory/memory-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const context = await resolveCommandCenterContext({ req });
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || undefined;

    const memories = await MemoryService.retrieveMemory({
      organisationId: context.organizationId,
      workspaceId: context.workspaceId,
      userId: context.userId,
      searchQuery,
      topK: 20
    });

    return NextResponse.json({ success: true, memories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const context = await resolveCommandCenterContext({ req });
    const body = await req.json();

    const record = await MemoryService.writeMemory({
      version: "1.0.0",
      organisationId: context.organizationId,
      workspaceId: context.workspaceId,
      ownerType: body.ownerType || "user",
      ownerId: context.userId,
      memoryType: body.memoryType || "user_preference",
      title: body.title,
      content: body.content,
      classification: body.classification || "internal",
      confidence: 1.0,
      status: "active",
      createdBy: { type: "user", id: context.userId },
      validFrom: new Date().toISOString()
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const context = await resolveCommandCenterContext({ req });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Memory ID required" }, { status: 400 });
    }

    const ok = await MemoryService.deleteMemory(id, context.organizationId, context.workspaceId);
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
