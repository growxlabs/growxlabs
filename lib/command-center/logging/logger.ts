export interface CommandCenterLogMeta {
  requestId?: string;
  userId?: string;
  organizationId?: string;
  toolName?: string;
  conversationId?: string;
  durationMs?: number;
  [key: string]: unknown;
}

export class CommandCenterLogger {
  private static PII_FIELDS = ["password", "token", "secret", "credit_card", "ssn", "api_key"];

  private static maskPII(data: Record<string, unknown>): Record<string, unknown> {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (this.PII_FIELDS.includes(key.toLowerCase())) {
        masked[key] = "******";
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        masked[key] = this.maskPII(value as Record<string, unknown>);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }

  static info(message: string, meta: CommandCenterLogMeta = {}) {
    const logObj = {
      level: "INFO",
      timestamp: new Date().toISOString(),
      service: "command-center",
      message,
      ...this.maskPII(meta as Record<string, unknown>)
    };
    console.log(JSON.stringify(logObj));
  }

  static warn(message: string, meta: CommandCenterLogMeta = {}) {
    const logObj = {
      level: "WARN",
      timestamp: new Date().toISOString(),
      service: "command-center",
      message,
      ...this.maskPII(meta as Record<string, unknown>)
    };
    console.warn(JSON.stringify(logObj));
  }

  static error(message: string, meta: CommandCenterLogMeta = {}) {
    const logObj = {
      level: "ERROR",
      timestamp: new Date().toISOString(),
      service: "command-center",
      message,
      ...this.maskPII(meta as Record<string, unknown>)
    };
    console.error(JSON.stringify(logObj));
  }
}
