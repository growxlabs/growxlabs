/**
 * ResumeForge AI Company Data API Client
 * Enterprise integration for ingesting Invoices, Payments, and Users from ResumeForge AI.
 * Securely uses RESUMEFORGE_COMPANY_KEY (server-side only).
 */

export interface ResumeForgeCustomer {
  email: string;
  name: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface ResumeForgeInvoice {
  id: string;
  invoice_number: string;
  plan_purchased: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | string;
  payment_method?: string;
  transaction_id?: string;
  order_id?: string;
  customer: ResumeForgeCustomer;
  coupon_applied?: string;
  receipt_url?: string;
  created_at: string;
}

export interface ResumeForgePayment {
  payment_id: string;
  order_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: "captured" | "failed" | "refunded" | string;
  payment_gateway: string;
  plan: string;
  customer_email: string;
  customer_name: string;
  paid_at: string;
}

export interface ResumeForgeUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  subscription_plan: "free" | "monthly" | "PRO" | string;
  plan_expiry?: string;
  is_student: boolean;
  credits_used_today: number;
  registered_at: string;
}

export interface PaginatedInvoicesResponse {
  success: boolean;
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  invoices: ResumeForgeInvoice[];
  error?: string;
  configured: boolean;
}

export interface PaginatedPaymentsResponse {
  success: boolean;
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  payments: ResumeForgePayment[];
  error?: string;
  configured: boolean;
}

export interface PaginatedUsersResponse {
  success: boolean;
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  users: ResumeForgeUser[];
  error?: string;
  configured: boolean;
}

export interface ResumeForgeSummaryMetrics {
  totalRevenueInr: number;
  totalPaidInvoices: number;
  totalTransactions: number;
  totalUsers: number;
  proUsersCount: number;
  lastSyncedAt: string;
  configured: boolean;
}

const DEFAULT_BASE_URL = "https://resumeforgeai.in";

export class ResumeForgeClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = (process.env.RESUMEFORGE_API_BASE || DEFAULT_BASE_URL).replace(/\/$/, "");
    this.apiKey = process.env.RESUMEFORGE_COMPANY_KEY || "";
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private getHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "x-api-key": this.apiKey,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  /**
   * Generic request handler with timeout and error mapping
   */
  private async request<T>(endpoint: string, searchParams: Record<string, string | number | undefined> = {}): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error("RESUMEFORGE_COMPANY_KEY is not configured in server environment.");
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        url.searchParams.append(key, String(val));
      }
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getHeaders(),
        signal: controller.signal,
        cache: "no-store",
      });

      if (response.status === 401) {
        throw new Error("Invalid ResumeForge API key provided (HTTP 401).");
      }
      if (response.status === 403) {
        throw new Error("ResumeForge API key has been revoked or deactivated (HTTP 403).");
      }
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`ResumeForge API error (${response.status}): ${text || response.statusText}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Fetch paginated invoices
   */
  public async getInvoices(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<PaginatedInvoicesResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        total_count: 0,
        page: params.page || 1,
        limit: params.limit || 50,
        total_pages: 0,
        invoices: [],
        configured: false,
        error: "RESUMEFORGE_COMPANY_KEY not set",
      };
    }

    const res = await this.request<any>("/api/v1/company/invoices", {
      page: params.page || 1,
      limit: params.limit || 50,
      status: params.status,
    });

    return {
      success: res.success ?? true,
      total_count: res.total_count ?? (res.invoices?.length || 0),
      page: res.page ?? (params.page || 1),
      limit: res.limit ?? (params.limit || 50),
      total_pages: res.total_pages ?? 1,
      invoices: res.invoices || [],
      configured: true,
    };
  }

  /**
   * Fetch paginated payments
   */
  public async getPayments(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedPaymentsResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        total_count: 0,
        page: params.page || 1,
        limit: params.limit || 50,
        total_pages: 0,
        payments: [],
        configured: false,
        error: "RESUMEFORGE_COMPANY_KEY not set",
      };
    }

    const res = await this.request<any>("/api/v1/company/payments", {
      page: params.page || 1,
      limit: params.limit || 50,
    });

    return {
      success: res.success ?? true,
      total_count: res.total_count ?? (res.payments?.length || 0),
      page: res.page ?? (params.page || 1),
      limit: res.limit ?? (params.limit || 50),
      total_pages: res.total_pages ?? 1,
      payments: res.payments || [],
      configured: true,
    };
  }

  /**
   * Fetch paginated users
   */
  public async getUsers(params: {
    page?: number;
    limit?: number;
    plan?: string;
  } = {}): Promise<PaginatedUsersResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        total_count: 0,
        page: params.page || 1,
        limit: params.limit || 50,
        total_pages: 0,
        users: [],
        configured: false,
        error: "RESUMEFORGE_COMPANY_KEY not set",
      };
    }

    const res = await this.request<any>("/api/v1/company/users", {
      page: params.page || 1,
      limit: params.limit || 50,
      plan: params.plan,
    });

    return {
      success: res.success ?? true,
      total_count: res.total_count ?? (res.users?.length || 0),
      page: res.page ?? (params.page || 1),
      limit: res.limit ?? (params.limit || 50),
      total_pages: res.total_pages ?? 1,
      users: res.users || [],
      configured: true,
    };
  }

  /**
   * Aggregates key business summary metrics
   */
  public async getSummary(): Promise<ResumeForgeSummaryMetrics> {
    if (!this.isConfigured()) {
      return {
        totalRevenueInr: 0,
        totalPaidInvoices: 0,
        totalTransactions: 0,
        totalUsers: 0,
        proUsersCount: 0,
        lastSyncedAt: new Date().toISOString(),
        configured: false,
      };
    }

    try {
      const [invoicesData, paymentsData, usersData] = await Promise.all([
        this.getInvoices({ limit: 100, status: "paid" }),
        this.getPayments({ limit: 100 }),
        this.getUsers({ limit: 100 }),
      ]);

      const totalRevenueInr = (invoicesData.invoices || []).reduce(
        (sum, inv) => sum + (inv.amount || 0),
        0
      );

      const proUsersCount = (usersData.users || []).filter(
        (u) => u.subscription_plan?.toLowerCase() === "pro"
      ).length;

      return {
        totalRevenueInr,
        totalPaidInvoices: invoicesData.total_count,
        totalTransactions: paymentsData.total_count,
        totalUsers: usersData.total_count,
        proUsersCount,
        lastSyncedAt: new Date().toISOString(),
        configured: true,
      };
    } catch (e) {
      return {
        totalRevenueInr: 0,
        totalPaidInvoices: 0,
        totalTransactions: 0,
        totalUsers: 0,
        proUsersCount: 0,
        lastSyncedAt: new Date().toISOString(),
        configured: true,
      };
    }
  }
}

export const resumeForgeClient = new ResumeForgeClient();
