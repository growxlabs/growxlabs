export class AttachmentContextValidator {
  private static ALLOWED_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "application/pdf",
    "text/plain"
  ];

  static sanitize(attachmentsInput: unknown[] = []): Array<{ name: string; type: string; base64?: string }> {
    if (!Array.isArray(attachmentsInput)) return [];

    return attachmentsInput
      .map((value) => value && typeof value === "object" ? value as Record<string, unknown> : null)
      .filter((att): att is Record<string, unknown> => Boolean(att && typeof att.name === "string" && (typeof att.base64 === "string" || typeof att.url === "string")))
      .filter(att => {
        const mime = typeof att.type === "string" ? att.type : "image/png";
        return this.ALLOWED_MIME_TYPES.includes(mime.toLowerCase());
      })
      .slice(0, 5) // Max 5 attachments
      .map(att => ({
        name: String(att.name).slice(0, 255),
        type: typeof att.type === "string" ? att.type : "image/png",
        base64: typeof att.base64 === "string" ? att.base64 : undefined,
      }));
  }
}
