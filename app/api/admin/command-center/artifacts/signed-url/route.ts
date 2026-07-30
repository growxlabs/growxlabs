import { NextResponse } from "next/server";
import { resolveCommandCenterContext } from "@/lib/command-center/context/command-center-context";
import { ArtifactService } from "@/lib/command-center/artifacts/artifact-service";
import { R2StorageService } from "@/lib/command-center/artifacts/r2-storage";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const context = await resolveCommandCenterContext({ req });
    const { artifactId } = await req.json();

    if (!artifactId) {
      return NextResponse.json({ success: false, error: "artifactId required" }, { status: 400 });
    }

    const artifact = ArtifactService.getArtifact(artifactId);
    if (!artifact || artifact.organisationId !== context.organizationId || artifact.workspaceId !== context.workspaceId) {
      return NextResponse.json({ success: false, error: "Artifact not found or unauthorized" }, { status: 404 });
    }

    const signedUrl = R2StorageService.generateSignedDownloadUrl(artifact.objectKey, 900);
    return NextResponse.json({ success: true, signedUrl, expiresAt: new Date(Date.now() + 900000).toISOString() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
