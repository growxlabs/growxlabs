import { NextResponse } from "next/server";
import { documentService } from "@/lib/services/editor/document.service";
import { documentRepository } from "@/lib/repositories/editor/document.repository";

export async function GET(request: Request) {
  try {
    // Standard org ID fallback for development or session context
    const orgId = "00000000-0000-0000-0000-000000000001";
    const docs = await documentRepository.listByOrg(orgId);
    return NextResponse.json({ data: docs });
  } catch (error: any) {
    return NextResponse.json(
      { code: "EDITOR_DOCUMENTS_FETCH_FAILED", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const orgId = body.organisationId || "00000000-0000-0000-0000-000000000001";
    const userId = body.userId || "00000000-0000-0000-0000-000000000002";

    const doc = await documentService.createNewDocument(orgId, userId, body.name);
    return NextResponse.json({ data: doc }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { code: "EDITOR_DOCUMENT_CREATE_FAILED", message: error.message },
      { status: 500 }
    );
  }
}
