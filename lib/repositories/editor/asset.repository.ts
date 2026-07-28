import { supabaseAdmin } from "@/lib/supabase/admin";
import { EditorAsset, EditorVersion, EditorExportJob } from "@/types/editorContracts";

export class AssetRepository {
  private tableName = "editor_assets";

  async findById(id: string): Promise<EditorAsset | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

      if (error || !data) return null;
      return this.mapToDomain(data);
    } catch {
      return null;
    }
  }

  async create(asset: Partial<EditorAsset>): Promise<EditorAsset> {
    const record = {
      organisation_id: asset.organisationId,
      uploaded_by: asset.uploadedBy,
      asset_type: asset.assetType || "image",
      file_name: asset.fileName,
      mime_type: asset.mimeType,
      storage_provider: asset.storageProvider || "cloudflare-r2",
      storage_key: asset.storageKey,
      width: asset.width || null,
      height: asset.height || null,
      file_size: asset.fileSize || 0,
      metadata: asset.metadata || {},
      processing_status: asset.processingStatus || "completed"
    };

    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .insert([record])
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create asset record: ${error?.message}`);
    }
    return this.mapToDomain(data);
  }

  private mapToDomain(row: any): EditorAsset {
    return {
      id: row.id,
      organisationId: row.organisation_id,
      uploadedBy: row.uploaded_by,
      assetType: row.asset_type,
      fileName: row.file_name,
      mimeType: row.mime_type,
      storageProvider: row.storage_provider,
      storageKey: row.storage_key,
      width: row.width,
      height: row.height,
      durationMs: row.duration_ms,
      fileSize: Number(row.file_size),
      metadata: row.metadata || {},
      processingStatus: row.processing_status,
      createdAt: row.created_at
    };
  }
}

export class VersionRepository {
  private tableName = "editor_versions";

  async create(docId: string, versionNum: number, createdBy: string, snapshot: any, reason?: string): Promise<EditorVersion> {
    const record = {
      document_id: docId,
      version_number: versionNum,
      created_by: createdBy,
      snapshot,
      reason: reason || null
    };

    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .insert([record])
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create version checkpoint: ${error?.message}`);
    }
    return {
      id: data.id,
      documentId: data.document_id,
      versionNumber: data.version_number,
      createdBy: data.created_by,
      snapshot: data.snapshot,
      reason: data.reason,
      createdAt: data.created_at
    };
  }

  async listByDocumentId(docId: string): Promise<EditorVersion[]> {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .select("*")
      .eq("document_id", docId)
      .order("version_number", { ascending: false });

    if (error || !data) return [];
    return data.map((v) => ({
      id: v.id,
      documentId: v.document_id,
      versionNumber: v.version_number,
      createdBy: v.created_by,
      snapshot: v.snapshot,
      reason: v.reason,
      createdAt: v.created_at
    }));
  }
}

export class ExportRepository {
  private tableName = "editor_exports";

  async create(job: Partial<EditorExportJob>): Promise<EditorExportJob> {
    const record = {
      document_id: job.documentId,
      requested_by: job.requestedBy,
      export_type: job.exportType,
      status: "queued",
      options: job.options || {},
      progress: 0
    };

    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .insert([record])
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to queue export job: ${error?.message}`);
    }
    return this.mapToDomain(data);
  }

  async updateProgress(id: string, progress: number, status: string = "processing", outputAssetId?: string, errorMsg?: string): Promise<EditorExportJob> {
    const payload: Record<string, any> = {
      progress,
      status
    };
    if (outputAssetId) payload.output_asset_id = outputAssetId;
    if (errorMsg) payload.error_message = errorMsg;
    if (status === "processing" && progress === 0) payload.started_at = new Date().toISOString();
    if (status === "completed" || status === "failed") payload.completed_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update export job: ${error?.message}`);
    }
    return this.mapToDomain(data);
  }

  async findById(id: string): Promise<EditorExportJob | null> {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapToDomain(data);
  }

  private mapToDomain(row: any): EditorExportJob {
    return {
      id: row.id,
      documentId: row.document_id,
      requestedBy: row.requested_by,
      exportType: row.export_type,
      status: row.status,
      options: row.options || {},
      outputAssetId: row.output_asset_id,
      progress: row.progress,
      errorCode: row.error_code,
      errorMessage: row.error_message,
      createdAt: row.created_at,
      completedAt: row.completed_at
    };
  }
}

export const assetRepository = new AssetRepository();
export const versionRepository = new VersionRepository();
export const exportRepository = new ExportRepository();
