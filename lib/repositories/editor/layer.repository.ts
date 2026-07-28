import { supabaseAdmin } from "@/lib/supabase/admin";
import { EditorLayer } from "@/types/editorContracts";

export class LayerRepository {
  private tableName = "editor_layers";

  async findByDocumentId(documentId: string): Promise<EditorLayer[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select("*")
        .eq("document_id", documentId)
        .order("position", { ascending: true });

      if (error || !data) return [];
      return data.map((l) => this.mapToDomain(l));
    } catch {
      return [];
    }
  }

  async findBySlideId(slideId: string): Promise<EditorLayer[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select("*")
        .eq("slide_id", slideId)
        .order("position", { ascending: true });

      if (error || !data) return [];
      return data.map((l) => this.mapToDomain(l));
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<EditorLayer | null> {
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

  async create(layer: Partial<EditorLayer>): Promise<EditorLayer> {
    const record = {
      document_id: layer.documentId,
      slide_id: layer.slideId,
      parent_layer_id: layer.parentLayerId || null,
      layer_type: layer.layerType,
      name: layer.name || "Layer",
      position: layer.position ?? 0,
      x: layer.x ?? 0,
      y: layer.y ?? 0,
      width: layer.width ?? 100,
      height: layer.height ?? 100,
      rotation: layer.rotation ?? 0,
      opacity: layer.opacity ?? 1,
      visible: layer.visible ?? true,
      locked: layer.locked ?? false,
      properties: layer.properties || {},
      style: layer.style || {},
      constraints: layer.constraints || {},
      version: 1
    };

    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .insert([record])
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create layer: ${error?.message}`);
    }
    return this.mapToDomain(data);
  }

  async update(id: string, updates: Partial<EditorLayer>): Promise<EditorLayer> {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.x !== undefined) payload.x = updates.x;
    if (updates.y !== undefined) payload.y = updates.y;
    if (updates.width !== undefined) payload.width = updates.width;
    if (updates.height !== undefined) payload.height = updates.height;
    if (updates.rotation !== undefined) payload.rotation = updates.rotation;
    if (updates.opacity !== undefined) payload.opacity = updates.opacity;
    if (updates.visible !== undefined) payload.visible = updates.visible;
    if (updates.locked !== undefined) payload.locked = updates.locked;
    if (updates.position !== undefined) payload.position = updates.position;
    if (updates.properties !== undefined) payload.properties = updates.properties;
    if (updates.style !== undefined) payload.style = updates.style;
    if (updates.constraints !== undefined) payload.constraints = updates.constraints;

    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update layer ${id}: ${error?.message}`);
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

  async createBatch(layers: Partial<EditorLayer>[]): Promise<EditorLayer[]> {
    const records = layers.map((layer) => ({
      document_id: layer.documentId,
      slide_id: layer.slideId,
      parent_layer_id: layer.parentLayerId || null,
      layer_type: layer.layerType,
      name: layer.name || "Layer",
      position: layer.position ?? 0,
      x: layer.x ?? 0,
      y: layer.y ?? 0,
      width: layer.width ?? 100,
      height: layer.height ?? 100,
      rotation: layer.rotation ?? 0,
      opacity: layer.opacity ?? 1,
      visible: layer.visible ?? true,
      locked: layer.locked ?? false,
      properties: layer.properties || {},
      style: layer.style || {},
      constraints: layer.constraints || {},
      version: 1
    }));

    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .insert(records)
      .select();

    if (error || !data) {
      throw new Error(`Failed to batch create layers: ${error?.message}`);
    }
    return data.map((l) => this.mapToDomain(l));
  }

  private mapToDomain(row: any): EditorLayer {
    return {
      id: row.id,
      documentId: row.document_id,
      slideId: row.slide_id,
      parentLayerId: row.parent_layer_id,
      layerType: row.layer_type,
      name: row.name,
      position: row.position,
      x: Number(row.x),
      y: Number(row.y),
      width: Number(row.width),
      height: Number(row.height),
      rotation: Number(row.rotation),
      opacity: Number(row.opacity),
      visible: row.visible,
      locked: row.locked,
      properties: row.properties || {},
      style: row.style || {},
      constraints: row.constraints || {},
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export const layerRepository = new LayerRepository();
