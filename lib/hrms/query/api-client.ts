export class HRMSApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "HRMSApiError";
  }
}

export async function hrmsApi<T>(
  path: string,
  init: RequestInit = {},
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`/api/v1/hrms/${path.replace(/^\/+/, "")}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    cache: "no-store",
    signal: signal ?? init.signal,
  });

  const payload = await response.json().catch(() => ({})) as {
    error?: string | { code?: string; message?: string; requestId?: string };
    message?: string;
  };
  if (!response.ok) {
    const structured = typeof payload.error === "object" ? payload.error : undefined;
    throw new HRMSApiError(
      structured?.message ?? payload.message ?? (typeof payload.error === "string" ? payload.error : "Request failed"),
      response.status,
      structured?.code,
      structured?.requestId ?? response.headers.get("x-request-id") ?? undefined,
    );
  }
  return payload as T;
}
