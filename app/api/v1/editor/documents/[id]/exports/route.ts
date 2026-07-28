import { NextResponse } from "next/server";
import { exportRepository } from "@/lib/repositories/editor/asset.repository";
import { ExportRequestSchema } from "@/lib/editor/schemas/editorSchemas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const parseResult = ExportRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { code: "EDITOR_INVALID_EXPORT_REQUEST", message: "Invalid export payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const userId = "00000000-0000-0000-0000-000000000002";
    const job = await exportRepository.create({
      documentId: id,
      requestedBy: userId,
      exportType: parseResult.data.exportType,
      options: parseResult.data.options || {}
    });

    // Background job progress simulation
    setTimeout(async () => {
      try {
        await exportRepository.updateProgress(job.id, 40, "processing");
        setTimeout(async () => {
          await exportRepository.updateProgress(job.id, 100, "completed");
        }, 1500);
      } catch (err) {
        console.error("Export job execution error:", err);
      }
    }, 1000);

    return NextResponse.json({ data: job }, { status: 202 });
  } catch (error: any) {
    return NextResponse.json(
      { code: "EDITOR_EXPORT_QUEUE_FAILED", message: error.message },
      { status: 500 }
    );
  }
}
