export type PeopleEntity = "departments" | "designations";
export type PeopleStatus = "active" | "inactive" | "archived";

export type PeopleReference = {
  id: string;
  name: string;
  code: string;
  status: PeopleStatus;
  version: number;
  description?: string | null;
  parent_id?: string | null;
  level?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type PeopleListFilters = {
  search?: string;
  status?: PeopleStatus | "all";
  page?: number;
  pageSize?: number;
};

export class PeopleApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "PeopleApiError";
  }
}

export const peopleQueryKeys = {
  all: ["people"] as const,
  references: (entity: PeopleEntity) => ["people", entity] as const,
  referenceList: (entity: PeopleEntity, filters: PeopleListFilters) =>
    ["people", entity, filters] as const,
  employees: (filters: Record<string, unknown>) => ["people", "employees", filters] as const,
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1/hrms/people${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new PeopleApiError("The People service could not be reached.", 503, "PEOPLE_SERVICE_UNAVAILABLE");
  }

  const requestId = response.headers.get("x-request-id") || undefined;
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = body?.error;
    const code = typeof error === "object" ? error.code : error || "PEOPLE_REQUEST_FAILED";
    const message = typeof error === "object"
      ? error.message
      : body?.detail || body?.message || "The People request could not be completed.";
    throw new PeopleApiError(message, response.status, code, requestId);
  }
  return body as T;
}

export function listPeopleReferences(entity: PeopleEntity, filters: PeopleListFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  params.set("page", String(filters.page || 1));
  params.set("pageSize", String(filters.pageSize || 50));
  return request<{ items: PeopleReference[]; total?: number }>(`/${entity}?${params}`);
}

export function createPeopleReference(
  entity: PeopleEntity,
  input: { name: string; code: string; description?: string; level?: number },
) {
  return request<PeopleReference>(`/${entity}`, {
    method: "POST",
    body: JSON.stringify({ ...input, code: input.code.trim().toUpperCase(), status: "active" }),
  });
}

export function updatePeopleReferenceStatus(entity: PeopleEntity, item: PeopleReference, status: PeopleStatus) {
  return request<PeopleReference>(`/${entity}/${encodeURIComponent(item.id)}/status`, {
    method: "PATCH",
    headers: { "If-Match": `"${item.version}"` },
    body: JSON.stringify({ status }),
  });
}
