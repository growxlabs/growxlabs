import { NextResponse } from "next/server";
import { resolveCommandCenterContext } from "@/lib/command-center/context/command-center-context";
import { ArtifactService } from "@/lib/command-center/artifacts/artifact-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const context = await resolveCommandCenterContext({ req });
    const artifacts = ArtifactService.listArtifacts(context.organizationId, context.workspaceId);
    return NextResponse.json({ success: true, artifacts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const context = await resolveCommandCenterContext({ req });
    const body = await req.json();

    const record = await ArtifactService.generateArtifact({
      organisationId: context.organizationId,
      workspaceId: context.workspaceId,
      requestedByUserId: context.userId,
      artifactType: body.artifactType || "markdown",
      name: body.name || "generated_artifact",
      content: body.content || { title: body.name || "Artifact", rawMarkdown: body.markdownText },
      classification: body.classification || "internal"
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
