import crypto from "crypto";
import { ArtifactRecord, ArtifactGenerationRequest } from "./artifact.types";
import { ArtifactSafetyValidator } from "./safety-validator";
import { R2StorageService } from "./r2-storage";
import { MarkdownGenerator } from "./generators/markdown.generator";
import { CsvGenerator } from "./generators/csv.generator";
import { PdfGenerator } from "./generators/pdf.generator";
import { DocxGenerator } from "./generators/docx.generator";
import { XlsxGenerator } from "./generators/xlsx.generator";
import { PptxGenerator } from "./generators/pptx.generator";

export class ArtifactService {
  private static store = new Map<string, ArtifactRecord>();

  static async generateArtifact(req: ArtifactGenerationRequest): Promise<ArtifactRecord> {
    const id = "art_" + Math.random().toString(36).substring(2, 9);
    const sanitizedName = ArtifactSafetyValidator.sanitizeFilename(req.name);
    const { mimeType, fileExtension } = ArtifactSafetyValidator.getMimeAndExtension(req.artifactType);

    let fileBuffer: Buffer;
    switch (req.artifactType) {
      case "csv":
        fileBuffer = Buffer.from(CsvGenerator.generate(req));
        break;
      case "markdown":
      case "text":
        fileBuffer = Buffer.from(MarkdownGenerator.generate(req));
        break;
      case "pdf":
        fileBuffer = PdfGenerator.generate(req);
        break;
      case "docx":
        fileBuffer = DocxGenerator.generate(req);
        break;
      case "xlsx":
        fileBuffer = XlsxGenerator.generate(req);
        break;
      case "pptx":
        fileBuffer = PptxGenerator.generate(req);
        break;
      default:
        fileBuffer = Buffer.from(JSON.stringify(req.content, null, 2));
    }

    const checksum = "sha256_" + crypto.createHash("sha256").update(fileBuffer).digest("hex");
    const objectKey = R2StorageService.buildObjectKey(
      req.organisationId,
      req.workspaceId,
      id,
      sanitizedName + fileExtension
    );
    const now = new Date().toISOString();

    const record: ArtifactRecord = {
      id,
      version: "1.0.0",
      organisationId: req.organisationId,
      workspaceId: req.workspaceId,
      createdByUserId: req.requestedByUserId,
      artifactType: req.artifactType,
      name: sanitizedName,
      safeDescription: req.content.title,
      mimeType,
      fileExtension,
      storageProvider: "cloudflare_r2",
      objectKey,
      sizeBytes: fileBuffer.length,
      checksum,
      classification: req.classification || "internal",
      status: "available",
      generatorId: "gen_" + req.artifactType,
      generatorVersion: "2.0.0",
      createdAt: now
    };

    this.store.set(id, record);
    return record;
  }

  static getArtifact(id: string): ArtifactRecord | undefined {
    return this.store.get(id);
  }

  static listArtifacts(organisationId: string, workspaceId: string): ArtifactRecord[] {
    return Array.from(this.store.values()).filter(
      a => a.organisationId === organisationId && a.workspaceId === workspaceId && a.status === "available"
    );
  }
}
