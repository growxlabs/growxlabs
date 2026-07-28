import { NextResponse } from "next/server";
import { assetRepository } from "@/lib/repositories/editor/asset.repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, mimeType, fileSize } = body;

    if (!fileName || !mimeType) {
      return NextResponse.json(
        { code: "EDITOR_INVALID_ASSET_INTENT", message: "fileName and mimeType are required" },
        { status: 400 }
      );
    }

    const orgId = "00000000-0000-0000-0000-000000000001";
    const userId = "00000000-0000-0000-0000-000000000002";
    const storageKey = `editor/${orgId}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const asset = await assetRepository.create({
      organisationId: orgId,
      uploadedBy: userId,
      fileName,
      mimeType,
      fileSize: fileSize || 0,
      storageProvider: "cloudflare-r2",
      storageKey,
      processingStatus: "completed"
    });

    return NextResponse.json({
      data: {
        asset,
        uploadUrl: `/api/v1/editor/assets/upload-local?key=${encodeURIComponent(storageKey)}`,
        storageKey
      }
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { code: "EDITOR_ASSET_INTENT_FAILED", message: error.message },
      { status: 500 }
    );
  }
}
