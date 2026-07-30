export interface CommandCenterLogMeta {
  requestId?: string;
  traceId?: string;
  environment?: string;
  service?: string;
  route?: string;
  userId?: string;
  organizationId?: string;
  workspaceId?: string;
  agentId?: string;
  toolName?: string;
  conversationId?: string;
  runId?: string;
  stepId?: string;
  approvalId?: string;
  artifactId?: string;
  eventId?: string;
  notificationId?: string;
  durationMs?: number;
  outcome?: string;
  errorCode?: string;
  [key: string]: unknown;
}

export class CommandCenterLogger {
  private static SENSITIVE_FIELD = /(password|passphrase|token|secret|cookie|authorization|api[-_]?key|credit[-_]?card|ssn|signed[-_]?url|prompt|reasoning|payload)/i;
  private static MIN_LEVEL: Record<string, number> = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40 };

  private static redact(data: Record<string, unknown>, depth = 0): Record<string, unknown> {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (this.SENSITIVE_FIELD.test(key)) {
        masked[key] = "[REDACTED]";
      } else if (depth >= 4) {
        masked[key] = "[TRUNCATED]";
      } else if (Array.isArray(value)) {
        masked[key] = value.slice(0, 25).map((item) =>
          typeof item === "object" && item !== null ? this.redact(item as Record<string, unknown>, depth + 1) : item,
        );
      } else if (typeof value === "object" && value !== null) {
        masked[key] = this.redact(value as Record<string, unknown>, depth + 1);
      } else if (typeof value === "string" && value.length > 2_000) {
        masked[key] = `${value.slice(0, 2_000)}[TRUNCATED]`;
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }

  private static write(level: "DEBUG" | "INFO" | "WARN" | "ERROR", message: string, meta: CommandCenterLogMeta): void {
    const configured = (process.env.COMMAND_CENTER_LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "INFO" : "DEBUG")).toUpperCase();
    if (this.MIN_LEVEL[level] < (this.MIN_LEVEL[configured] ?? this.MIN_LEVEL.INFO)) return;
    const logObj = {
      level,
      timestamp: new Date().toISOString(),
      environment: process.env.APP_ENV ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
      service: meta.service ?? "command-center-bff",
      message,
      ...this.redact(meta as Record<string, unknown>),
    };
    const line = JSON.stringify(logObj);
    if (level === "ERROR") console.error(line);
    else if (level === "WARN") console.warn(line);
    else console.log(line);
  }

  static debug(message: string, meta: CommandCenterLogMeta = {}) {
    this.write("DEBUG", message, meta);
  }

  static info(message: string, meta: CommandCenterLogMeta = {}) {
    this.write("INFO", message, meta);
  }

  static warn(message: string, meta: CommandCenterLogMeta = {}) {
    this.write("WARN", message, meta);
  }

  static error(message: string, meta: CommandCenterLogMeta = {}) {
    this.write("ERROR", message, meta);
  }
}
