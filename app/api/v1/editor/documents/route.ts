import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const orgId = "00000000-0000-0000-0000-000000000001";
    const { data, error } = await supabaseAdmin
      .from("editor_documents")
      .select("*")
      .eq("organisation_id", orgId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    const docs = (data || []).map((row) => {
      const bg = row.background || {};
      const slidesArray = Array.isArray(bg.slides) ? bg.slides : [];
      return {
        id: row.id,
        name: row.name || "Untitled Carousel",
        documentType: row.document_type || "editorial_carousel",
        width: row.width || 1080,
        height: row.height || 1350,
        slidesCount: slidesArray.length,
        slide_count: slidesArray.length,
        version: row.version || 1,
        status: row.status || "draft",
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

    return NextResponse.json({ documents: docs, data: docs });
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
    const name = body.name || "Untitled Carousel";
    const width = body.width || 1080;
    const height = body.height || 1350;

    const background = {
      type: "solid",
      color: "#ffffff",
      slides: body.slides || null,
      activeFormat: body.activeFormat || null,
      documentKind: body.documentKind || "daily-news",
      editorMode: body.editorMode || "fixed",
    };

    const { data, error } = await supabaseAdmin
      .from("editor_documents")
      .insert([
        {
          organisation_id: orgId,
          name,
          document_type: "editorial_carousel",
          width,
          height,
          background,
          safe_margins: { top: 60, right: 72, bottom: 70, left: 72 },
          status: "draft",
          created_by: userId,
          updated_by: userId,
          version: 1,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create document: ${error?.message}`);
    }

    return NextResponse.json({ ...data, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { code: "EDITOR_DOCUMENT_CREATE_FAILED", message: error.message },
      { status: 500 }
    );
  }
}
