import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from("editor_documents")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { code: "DOCUMENT_NOT_FOUND", message: "Carousel document not found in database" },
        { status: 404 }
      );
    }

    const background = data.background || {};
    const responsePayload = {
      id: data.id,
      name: data.name,
      width: data.width,
      height: data.height,
      status: data.status,
      version: data.version,
      slides: background.slides || null,
      activeFormat: background.activeFormat || null,
      documentKind: background.documentKind || "daily-news",
      editorMode: background.editorMode || "fixed",
      background: background,
      safeMargins: data.safe_margins,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
    return NextResponse.json({
      ...responsePayload,
      data: responsePayload,
    });
  } catch (error: any) {
    return NextResponse.json(
      { code: "EDITOR_DOCUMENT_FETCH_FAILED", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 1. Fetch current document to preserve background metadata
    const { data: current, error: fetchErr } = await supabaseAdmin
      .from("editor_documents")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !current) {
      return NextResponse.json(
        { code: "DOCUMENT_NOT_FOUND", message: "Document not found for update" },
        { status: 404 }
      );
    }

    const currentBg = current.background || {};
    const updatedBg = {
      ...currentBg,
      slides: body.slides !== undefined ? body.slides : currentBg.slides,
      activeFormat: body.activeFormat !== undefined ? body.activeFormat : currentBg.activeFormat,
      documentKind: body.documentKind !== undefined ? body.documentKind : currentBg.documentKind,
      editorMode: body.editorMode !== undefined ? body.editorMode : currentBg.editorMode,
    };

    const updatePayload: Record<string, any> = {
      background: updatedBg,
      version: (current.version || 1) + 1,
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.width !== undefined) updatePayload.width = body.width;
    if (body.height !== undefined) updatePayload.height = body.height;
    if (body.status !== undefined) updatePayload.status = body.status;

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("editor_documents")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateErr || !updated) {
      return NextResponse.json(
        { code: "DOCUMENT_UPDATE_FAILED", message: updateErr?.message || "Failed to update" },
        { status: 500 }
      );
    }

    const updateResponse = {
      id: updated.id,
      name: updated.name,
      width: updated.width,
      height: updated.height,
      version: updated.version,
      slides: updatedBg.slides,
      activeFormat: updatedBg.activeFormat,
      documentKind: updatedBg.documentKind,
      editorMode: updatedBg.editorMode,
      updatedAt: updated.updated_at,
    };
    return NextResponse.json({
      ...updateResponse,
      data: updateResponse,
    });
  } catch (error: any) {
    return NextResponse.json(
      { code: "EDITOR_DOCUMENT_UPDATE_FAILED", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from("editor_documents")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { code: "DOCUMENT_DELETE_FAILED", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { code: "EDITOR_DOCUMENT_DELETE_FAILED", message: error.message },
      { status: 500 }
    );
  }
}
