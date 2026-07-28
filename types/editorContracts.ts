// ============================================================================
// Grow-X Editorial Carousel Domain Interfaces & Contracts
// ============================================================================

export type DocumentStatus = "draft" | "published" | "archived";
export type LayerType = "category" | "headline" | "featuredImage" | "body" | "bullets" | "quote" | "cta" | "logo" | "divider" | "author" | "footer";
export type ExportType = "png" | "jpeg" | "svg" | "pdf" | "mp4";
export type ExportStatus = "queued" | "processing" | "completed" | "failed";

export interface EditorDocument {
  id: string;
  organisationId: string;
  workspaceId?: string;
  projectId?: string;
  name: string;
  description?: string;
  documentType: string;
  width: number;
  height: number;
  background: Record<string, any>;
  safeMargins: { top: number; right: number; bottom: number; left: number };
  status: DocumentStatus;
  createdBy: string;
  updatedBy: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface EditorSlide {
  id: string;
  documentId: string;
  name: string;
  position: number;
  width: number;
  height: number;
  background: Record<string, any>;
  thumbnailAssetId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EditorLayer {
  id: string;
  documentId: string;
  slideId: string;
  parentLayerId?: string;
  layerType: LayerType;
  name: string;
  position: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  properties: Record<string, any>;
  style: Record<string, any>;
  constraints: Record<string, any>;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface EditorAsset {
  id: string;
  organisationId: string;
  uploadedBy: string;
  assetType: string;
  fileName: string;
  mimeType: string;
  storageProvider: string;
  storageKey: string;
  width?: number;
  height?: number;
  durationMs?: number;
  fileSize: number;
  metadata: Record<string, any>;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
}

export interface EditorVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  createdBy: string;
  snapshot: Record<string, any>;
  reason?: string;
  createdAt: string;
}

export interface EditorOperationPayload {
  clientOperationId: string;
  type: string;
  entityType: "document" | "slide" | "layer";
  entityId?: string;
  changes: Record<string, any>;
  inverseChanges?: Record<string, any>;
}

export interface EditorExportJob {
  id: string;
  documentId: string;
  requestedBy: string;
  exportType: ExportType;
  status: ExportStatus;
  options: Record<string, any>;
  outputAssetId?: string;
  progress: number;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface EditorBootstrapResponse {
  document: EditorDocument;
  slides: EditorSlide[];
  layersBySlide: Record<string, EditorLayer[]>;
  assets: EditorAsset[];
  permissions: {
    canEdit: boolean;
    canExport: boolean;
    canShare: boolean;
    role: "owner" | "editor" | "commenter" | "viewer";
  };
  latestVersion: number;
}
