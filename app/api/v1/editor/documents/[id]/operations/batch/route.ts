import { NextResponse } from "next/server";
import { layerService } from "@/lib/services/editor/layer.service";
import { BatchOperationsSchema } from "@/lib/editor/schemas/editorSchemas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parseResult = BatchOperationsSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { code: "EDITOR_INVALID_OPERATIONS", message: "Invalid operations format", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { baseVersion, operations } = parseResult.data;

    const result = await layerService.processBatchOperations(
      id,
      baseVersion,
      operations as any
    );

    return NextResponse.json({
      data: {
        newVersion: result.newVersion,
        updatedLayers: result.updatedLayers,
        acceptedCount: operations.length
      }
    });
  } catch (error: any) {
    if (error.message?.includes("EDITOR_VERSION_CONFLICT")) {
      return NextResponse.json(
        { code: "EDITOR_VERSION_CONFLICT", message: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { code: "EDITOR_BATCH_OPERATIONS_FAILED", message: error.message },
      { status: 500 }
    );
  }
}
