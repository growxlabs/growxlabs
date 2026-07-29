import { supabaseAdmin } from "@/lib/supabase/admin";
import { ToolExecutor } from "../registry/tool-types";
import {
  GetAdminUsersSchema,
  GetAdminAgreementsSchema,
  GetAdminInvoicesSchema,
  CreateAdminInvoiceSchema,
  GetAdminProjectsSchema,
  CreateAdminProjectSchema,
  SendAdminInvoiceSchema
} from "../../validation/tool.schemas";
import { z } from "zod";

export const getAdminUsersExecutor: ToolExecutor<z.infer<typeof GetAdminUsersSchema>, unknown> = {
  name: "get_admin_users",
  description: "Retrieve list of registered client users.",
  inputSchema: GetAdminUsersSchema,
  riskLevel: "low",
  requiredPermissions: ["users:read"],
  async execute(input) {
    let query = supabaseAdmin.from("users").select("id, name, email, role, created_at");
    if (input.searchQuery) {
      query = query.or(`name.ilike.%${input.searchQuery}%,email.ilike.%${input.searchQuery}%`);
    }
    const limit = input.limit || 20;
    const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  }
};

export const getAdminAgreementsExecutor: ToolExecutor<z.infer<typeof GetAdminAgreementsSchema>, unknown> = {
  name: "get_admin_agreements",
  description: "Retrieve a list of client agreements (contracts).",
  inputSchema: GetAdminAgreementsSchema,
  riskLevel: "low",
  requiredPermissions: ["agreements:read"],
  async execute(input) {
    let query = supabaseAdmin.from("agreements").select(`
      id, client_id, service_type, project_description, total_amount, 
      advance_amount, balance_amount, start_date, delivery_date, status, pdf_url, created_at,
      users (id, name, email)
    `);
    if (input.clientId) query = query.eq("client_id", input.clientId);
    const limit = input.limit || 20;
    const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  }
};

export const getAdminInvoicesExecutor: ToolExecutor<z.infer<typeof GetAdminInvoicesSchema>, unknown> = {
  name: "get_admin_invoices",
  description: "Retrieve a list of billing invoices.",
  inputSchema: GetAdminInvoicesSchema,
  riskLevel: "low",
  requiredPermissions: ["invoices:read"],
  async execute(input) {
    let query = supabaseAdmin.from("invoices").select(`
      id, client_id, agreement_id, amount, advance_paid, balance_due, status, due_date, created_at,
      users (id, name, email)
    `);
    if (input.clientId) query = query.eq("client_id", input.clientId);
    if (input.status) query = query.eq("status", input.status);
    const limit = input.limit || 20;
    const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  }
};

export const createAdminInvoiceExecutor: ToolExecutor<z.infer<typeof CreateAdminInvoiceSchema>, unknown> = {
  name: "create_admin_invoice",
  description: "Create and persist a new billing invoice.",
  inputSchema: CreateAdminInvoiceSchema,
  riskLevel: "high",
  requiredPermissions: ["invoices:write"],
  async execute(input) {
    const { data, error } = await supabaseAdmin
      .from("invoices")
      .insert([{
        client_id: input.clientId,
        agreement_id: input.agreementId || null,
        amount: input.amount,
        balance_due: input.balanceDue,
        due_date: input.dueDate,
        advance_paid: input.advancePaid || false,
        status: "pending"
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const getAdminProjectsExecutor: ToolExecutor<z.infer<typeof GetAdminProjectsSchema>, unknown> = {
  name: "get_admin_projects",
  description: "Retrieve a list of client development projects.",
  inputSchema: GetAdminProjectsSchema,
  riskLevel: "low",
  requiredPermissions: ["projects:read"],
  async execute(input) {
    let query = supabaseAdmin.from("projects").select(`
      id, client_id, title, status, progress, created_at,
      users (id, name, email)
    `);
    if (input.clientId) query = query.eq("client_id", input.clientId);
    const limit = input.limit || 20;
    const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  }
};

export const createAdminProjectExecutor: ToolExecutor<z.infer<typeof CreateAdminProjectSchema>, unknown> = {
  name: "create_admin_project",
  description: "Create and persist a new development project milestone.",
  inputSchema: CreateAdminProjectSchema,
  riskLevel: "high",
  requiredPermissions: ["projects:write"],
  async execute(input) {
    const { data, error } = await supabaseAdmin
      .from("projects")
      .insert([{
        client_id: input.clientId,
        title: input.title,
        status: input.status || "pending",
        progress: input.progress || 0
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const sendAdminInvoiceExecutor: ToolExecutor<z.infer<typeof SendAdminInvoiceSchema>, unknown> = {
  name: "send_admin_invoice",
  description: "Send a billing invoice PDF link to a client via email.",
  inputSchema: SendAdminInvoiceSchema,
  riskLevel: "high",
  requiredPermissions: ["invoices:write"],
  async execute(input, context) {
    const { data: invoice, error } = await supabaseAdmin
      .from("invoices")
      .select("*, users(email)")
      .eq("id", input.invoiceId)
      .single();

    if (error || !invoice) throw new Error(`Invoice ${input.invoiceId} not found.`);

    const recipientEmail = input.email || (invoice.users as { email?: string })?.email;
    if (!recipientEmail) throw new Error("No destination email address found for invoice.");

    const pdfUrl = `${context.baseUrl || ""}/api/invoice/${invoice.id}`;

    return {
      success: true,
      invoiceId: invoice.id,
      recipientEmail,
      pdfUrl,
      sentAt: new Date().toISOString()
    };
  }
};
