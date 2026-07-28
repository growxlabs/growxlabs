import { supabaseAdmin } from "@/lib/supabase/admin";
import { EditorSlide } from "@/types/editorContracts";

export class SlideRepository {
  private tableName = "editor_slides";

  async findByDocumentId(documentId: string): Promise<EditorSlide[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select("*")
        .eq("document_id", documentId)
        .order("position", { ascending: true });

      if (error || !data) return [];
      return data.map((s) => this.mapToDomain(s));
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<EditorSlide | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) return null;
      return this.mapToDomain(data);
    } catch {
      return null;
    }
  }

  async create(slide: Partial<EditorSlide>): Promise<EditorSlide> {
    const record = {
      document_id: slide.documentId,
      name: slide.name || "Slide",
      position: slide.position ?? 0,
      width: slide.width || 1080,
      height: slide.height || 1350,
      background: slide.background || { type: "solid", color: "#ffffff" },
      thumbnail_asset_id: slide.thumbnailAssetId || null
    };

    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .insert([record])
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create slide: ${error?.message}`);
    }
    return this.mapToDomain(data);
  }

  async update(id: string, updates: Partial<EditorSlide>): Promise<EditorSlide> {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.position !== undefined) payload.position = updates.position;
    if (updates.background !== undefined) payload.background = updates.background;
    if (updates.thumbnailAssetId !== undefined) payload.thumbnail_asset_id = updates.thumbnailAssetId;

    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update slide ${id}: ${error?.message}`);
    }
    return this.mapToDomain(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from(this.tableName)
      .delete()
      .eq("id", id);

    return !error;
  }

  async reorder(documentId: string, positions: { id: string; position: number }[]): Promise<void> {
    // Transactional reorder via RPC or batch update
    for (const item of positions) {
      await supabaseAdmin
        .from(this.tableName)
        .update({ position: item.position, updated_at: new Date().toISOString() })
        .eq("id", item.id)
        .eq("document_id", documentId);
    }
  }

  private mapToDomain(row: any): EditorSlide {
    return {
      id: row.id,
      documentId: row.document_id,
      name: row.name,
      position: row.position,
      width: row.width,
      height: row.height,
      background: row.background || {},
      thumbnailAssetId: row.thumbnail_asset_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export const slideRepository = new SlideRepository();
