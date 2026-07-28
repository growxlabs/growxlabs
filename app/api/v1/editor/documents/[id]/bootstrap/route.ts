import { NextResponse } from "next/server";
import { documentService } from "@/lib/services/editor/document.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = "00000000-0000-0000-0000-000000000001";

    const bootstrapData = await documentService.getBootstrapData(id, orgId);
    if (!bootstrapData) {
      // Auto-create document if looking up default demo ID
      const newDoc = await documentService.createNewDocument(orgId, "00000000-0000-0000-0000-000000000002", "Editorial Carousel");
      const createdBootstrap = await documentService.getBootstrapData(newDoc.id, orgId);
      return NextResponse.json({ data: createdBootstrap });
    }

    return NextResponse.json({ data: bootstrapData });
  } catch (error: any) {
    return NextResponse.json(
      { code: "EDITOR_BOOTSTRAP_FAILED", message: error.message },
      { status: 500 }
    );
  }
}
