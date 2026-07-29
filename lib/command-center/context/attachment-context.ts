export class AttachmentContextValidator {
  private static ALLOWED_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "application/pdf",
    "text/plain"
  ];

  static sanitize(attachmentsInput: any[] = []): Array<{ name: string; type: string; base64?: string }> {
    if (!attachmentsInput || !Array.isArray(attachmentsInput)) return [];

    return attachmentsInput
      .filter(att => att && att.name && (att.base64 || att.url))
      .filter(att => {
        const mime = att.type || "image/png";
        return this.ALLOWED_MIME_TYPES.includes(mime.toLowerCase());
      })
      .slice(0, 5) // Max 5 attachments
      .map(att => ({
        name: att.name,
        type: att.type || "image/png",
        base64: att.base64
      }));
  }
}
