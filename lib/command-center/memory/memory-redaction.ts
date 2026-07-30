export class MemoryRedactor {
  private static SECRET_PATTERNS = [
    /bearer\s+[a-zA-Z0-9_\-\.]{20,}/gi,
    /sk-[a-zA-Z0-9]{20,}/gi,
    /key-[a-zA-Z0-9]{20,}/gi,
    /password\s*=\s*['"][^'"]+['"]/gi,
    /api_key\s*=\s*['"][^'"]+['"]/gi,
    /secret\s*=\s*['"][^'"]+['"]/gi
  ];

  static redact(content: string): { sanitizedContent: string; containsSecrets: boolean } {
    let sanitized = content;
    let foundSecret = false;

    for (const pattern of this.SECRET_PATTERNS) {
      if (pattern.test(sanitized)) {
        foundSecret = true;
        sanitized = sanitized.replace(pattern, "[REDACTED_SECRET]");
      }
    }

    return {
      sanitizedContent: sanitized,
      containsSecrets: foundSecret
    };
  }
}
