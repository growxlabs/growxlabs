export type HRMSListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  filters?: Record<string, unknown>;
  sorting?: Array<{ id: string; desc: boolean }>;
  viewId?: string;
};

function domainKeys(domain: string) {
  return {
    all: [domain] as const,
    lists: () => [domain, "list"] as const,
    list: (query: HRMSListQuery) => [domain, "list", query] as const,
    details: () => [domain, "detail"] as const,
    detail: (id: string) => [domain, "detail", id] as const,
    analytics: (query: Record<string, unknown> = {}) => [domain, "analytics", query] as const,
  };
}

export const hrmsQueryKeys = {
  employees: domainKeys("employees"),
  attendance: domainKeys("attendance"),
  leave: domainKeys("leave"),
  recruitment: domainKeys("recruitment"),
  onboarding: domainKeys("onboarding"),
  payroll: domainKeys("payroll"),
  performance: domainKeys("performance"),
  learning: domainKeys("learning"),
  compensation: domainKeys("compensation"),
  workforce: domainKeys("workforce"),
  platform: domainKeys("platform"),
  dashboard: domainKeys("dashboard"),
  analytics: domainKeys("analytics"),
  notifications: domainKeys("notifications"),
  documents: domainKeys("documents"),
} as const;

export const hrmsCachePolicy = {
  short: 15_000,
  medium: 60_000,
  long: 10 * 60_000,
  static: 60 * 60_000,
} as const;
