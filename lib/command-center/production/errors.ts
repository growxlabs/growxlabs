export const ERROR_CODES = [
  "AUTHENTICATION_REQUIRED",
  "PERMISSION_DENIED",
  "TENANT_SCOPE_INVALID",
  "POLICY_DENIED",
  "APPROVAL_REQUIRED",
  "APPROVAL_EXPIRED",
  "VALIDATION_FAILED",
  "RATE_LIMITED",
  "CONFLICT",
  "IDEMPOTENCY_CONFLICT",
  "RESOURCE_NOT_FOUND",
  "RESOURCE_EXPIRED",
  "DEPENDENCY_UNAVAILABLE",
  "TIMEOUT",
  "STORAGE_FAILURE",
  "DATABASE_FAILURE",
  "MODEL_FAILURE",
  "TOOL_FAILURE",
  "INTERNAL_ERROR",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  AUTHENTICATION_REQUIRED: 401,
  PERMISSION_DENIED: 403,
  TENANT_SCOPE_INVALID: 403,
  POLICY_DENIED: 403,
  APPROVAL_REQUIRED: 409,
  APPROVAL_EXPIRED: 410,
  VALIDATION_FAILED: 400,
  RATE_LIMITED: 429,
  CONFLICT: 409,
  IDEMPOTENCY_CONFLICT: 409,
  RESOURCE_NOT_FOUND: 404,
  RESOURCE_EXPIRED: 410,
  DEPENDENCY_UNAVAILABLE: 503,
  TIMEOUT: 504,
  STORAGE_FAILURE: 503,
  DATABASE_FAILURE: 503,
  MODEL_FAILURE: 502,
  TOOL_FAILURE: 502,
  INTERNAL_ERROR: 500,
};

const SAFE_MESSAGES: Record<ErrorCode, string> = {
  AUTHENTICATION_REQUIRED: "Authentication is required.",
  PERMISSION_DENIED: "You do not have permission to perform this action.",
  TENANT_SCOPE_INVALID: "The requested resource is outside your authorised scope.",
  POLICY_DENIED: "This action is blocked by policy.",
  APPROVAL_REQUIRED: "This action requires approval.",
  APPROVAL_EXPIRED: "The approval request has expired.",
  VALIDATION_FAILED: "The request is invalid.",
  RATE_LIMITED: "Too many requests. Please retry later.",
  CONFLICT: "The request conflicts with the current resource state.",
  IDEMPOTENCY_CONFLICT: "This operation was already submitted with different input.",
  RESOURCE_NOT_FOUND: "The requested resource was not found.",
  RESOURCE_EXPIRED: "The requested resource has expired.",
  DEPENDENCY_UNAVAILABLE: "A required service is temporarily unavailable.",
  TIMEOUT: "The operation timed out.",
  STORAGE_FAILURE: "Artifact storage is temporarily unavailable.",
  DATABASE_FAILURE: "Data storage is temporarily unavailable.",
  MODEL_FAILURE: "The model provider could not complete the request.",
  TOOL_FAILURE: "The tool could not complete the request.",
  INTERNAL_ERROR: "The request could not be completed.",
};

export class CommandCenterError extends Error {
  constructor(
    readonly code: ErrorCode,
    options: {
      message?: string;
      status?: number;
      retryable?: boolean;
      cause?: unknown;
    } = {},
  ) {
    super(options.message ?? SAFE_MESSAGES[code], { cause: options.cause });
    this.name = "CommandCenterError";
    this.status = options.status ?? STATUS_BY_CODE[code];
    this.retryable = options.retryable ?? this.status >= 500;
  }

  readonly status: number;
  readonly retryable: boolean;
}

export function classifyError(error: unknown): CommandCenterError {
  if (error instanceof CommandCenterError) return error;
  if (error instanceof DOMException && error.name === "AbortError") {
    return new CommandCenterError("TIMEOUT", { retryable: true, cause: error });
  }
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("authentication")) return new CommandCenterError("AUTHENTICATION_REQUIRED", { cause: error });
  if (message.includes("permission")) return new CommandCenterError("PERMISSION_DENIED", { cause: error });
  if (message.includes("organisation") || message.includes("workspace") || message.includes("scope")) {
    return new CommandCenterError("TENANT_SCOPE_INVALID", { cause: error });
  }
  if (message.includes("cross-origin")) return new CommandCenterError("PERMISSION_DENIED", { cause: error });
  return new CommandCenterError("INTERNAL_ERROR", { cause: error });
}

export function errorResponse(
  error: unknown,
  requestId: string,
  headers: HeadersInit = {},
): Response {
  const safe = classifyError(error);
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Cache-Control", "no-store");
  responseHeaders.set("X-Request-ID", requestId);
  if (safe.code === "RATE_LIMITED") {
    responseHeaders.set("Retry-After", "60");
    responseHeaders.set("RateLimit-Remaining", "0");
  }
  return Response.json(
    {
      success: false,
      error: {
        code: safe.code,
        message: safe.message,
        retryable: safe.retryable,
        requestId,
      },
    },
    {
      status: safe.status,
      headers: responseHeaders,
    },
  );
}

export function requestIdFrom(request: Request): string {
  const supplied = request.headers.get("x-request-id");
  return supplied && /^[A-Za-z0-9._:-]{8,128}$/.test(supplied)
    ? supplied
    : crypto.randomUUID();
}
