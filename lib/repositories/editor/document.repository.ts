import { supabaseAdmin } from "@/lib/supabase/admin";
import { EditorDocument } from "@/types/editorContracts";

export class DocumentRepository {
  private tableName = "editor_documents";

  async findById(id: string, orgId?: string): Promise<EditorDocument | null> {
    try {
      let query = supabaseAdmin
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .is("deleted_at", null);

      if (orgId) {
        query = query.eq("organisation_id", orgId);
      }

      const { data, error } = await query.single();
      if (error || !data) return null;
      return this.mapToDomain(data);
    } catch {
      return null;
    }
  }

  async listByOrg(orgId: string): Promise<EditorDocument[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select("*")
        .eq("organisation_id", orgId)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });

      if (error || !data) return [];
      return data.map((d) => this.mapToDomain(d));
    } catch {
      return [];
    }
  }

  async create(doc: Partial<EditorDocument>): Promise<EditorDocument> {
    const record = {
      organisation_id: doc.organisationId,
      workspace_id: doc.workspaceId || null,
      project_id: doc.projectId || null,
      name: doc.name || "Untitled Carousel",
      description: doc.description || null,
      document_type: doc.documentType || "editorial_carousel",
      width: doc.width || 1080,
      height: doc.height || 1350,
      background: doc.background || { type: "solid", color: "#ffffff" },
      safe_margins: doc.safeMargins || { top: 60, right: 72, bottom: 70, left: 72 },
      status: doc.status || "draft",
      created_by: doc.createdBy,
      updated_by: doc.updatedBy || doc.createdBy,
      version: 1
    };

    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .insert([record])
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create document: ${error?.message}`);
    }
    return this.mapToDomain(data);
  }

  async update(id: string, updates: Partial<EditorDocument>): Promise<EditorDocument> {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.background !== undefined) payload.background = updates.background;
    if (updates.safeMargins !== undefined) payload.safe_margins = updates.safeMargins;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.version !== undefined) payload.version = updates.version;

    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update document ${id}: ${error?.message}`);
    }
    return this.mapToDomain(data);
  }

  async incrementVersion(id: string, currentVersion: number): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .update({
        version: currentVersion + 1,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("version", currentVersion)
      .select("version")
      .single();

    if (error || !data) {
      throw new Error(`Version conflict error updating document ${id}`);
    }
    return data.version;
  }

  private mapToDomain(row: any): EditorDocument {
    return {
      id: row.id,
      organisationId: row.organisation_id,
      workspaceId: row.workspace_id,
      projectId: row.project_id,
      name: row.name,
      description: row.description,
      documentType: row.document_type,
      width: row.width,
      height: row.height,
      background: row.background || {},
      safeMargins: row.safe_margins || { top: 60, right: 72, bottom: 70, left: 72 },
      status: row.status,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export const documentRepository = new DocumentRepository();
