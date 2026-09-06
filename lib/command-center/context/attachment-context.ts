export class AttachmentContextValidator {
  private static ALLOWED_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "application/pdf",
    "text/plain",
    "text/csv",
    "application/csv",
    "text/x-csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",
    "application/json"
  ];

  static sanitize(attachmentsInput: unknown[] = []): Array<{ name: string; type: string; base64?: string }> {
    if (!Array.isArray(attachmentsInput)) return [];

    return attachmentsInput
      .map((value) => value && typeof value === "object" ? value as Record<string, unknown> : null)
      .filter((att): att is Record<string, unknown> => Boolean(att && typeof att.name === "string" && (typeof att.base64 === "string" || typeof att.url === "string")))
      .filter(att => {
        const mime = typeof att.type === "string" ? att.type.toLowerCase() : "";
        const name = typeof att.name === "string" ? att.name.toLowerCase() : "";
        const isMimeAllowed = this.ALLOWED_MIME_TYPES.includes(mime);
        const isExtAllowed = /\.(csv|tsv|xlsx|xls|txt|json|pdf|png|jpe?g|webp|gif)$/i.test(name);
        return isMimeAllowed || isExtAllowed;
      })
      .slice(0, 10) // Max 10 attachments
      .map(att => ({
        name: String(att.name).slice(0, 255),
        type: typeof att.type === "string" ? att.type : "application/octet-stream",
        base64: typeof att.base64 === "string" ? att.base64 : undefined,
      }));
  }
}
