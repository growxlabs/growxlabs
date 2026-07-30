export class ArtifactSafetyValidator {
  private static ALLOWED_TYPES: Record<string, { mime: string; ext: string }> = {
    pdf: { mime: "application/pdf", ext: ".pdf" },
    docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ext: ".docx" },
    xlsx: { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ext: ".xlsx" },
    csv: { mime: "text/csv", ext: ".csv" },
    pptx: { mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", ext: ".pptx" },
    markdown: { mime: "text/markdown", ext: ".md" },
    text: { mime: "text/plain", ext: ".txt" },
    json: { mime: "application/json", ext: ".json" }
  };

  static sanitizeFilename(name: string): string {
    return name
      .replace(/[\/\\]/g, "_")
      .replace(/\.\./g, "_")
      .replace(/[^a-zA-Z0-9_\-\.]/g, "_");
  }

  static getMimeAndExtension(artifactType: string): { mimeType: string; fileExtension: string } {
    const config = this.ALLOWED_TYPES[artifactType.toLowerCase()];
    if (!config) {
      throw new Error(`Unsupported artifact type: ${artifactType}`);
    }
    return { mimeType: config.mime, fileExtension: config.ext };
  }
}
