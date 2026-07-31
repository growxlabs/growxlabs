import { supabaseAdmin } from "@/lib/supabase/admin";
import { ToolExecutor } from "../registry/tool-types";
import { CreateLeadSchema, BatchCreateLeadsSchema, QueryLeadsSchema, GetCompanyStatsSchema } from "../../validation/tool.schemas";
import { z } from "zod";

export const getCompanyStatsExecutor: ToolExecutor<z.infer<typeof GetCompanyStatsSchema>, unknown> = {
  name: "get_company_stats",
  description: "Retrieve general business statistics including total lead count, status breakdown, and recent leads.",
  inputSchema: GetCompanyStatsSchema,
  riskLevel: "low",
  requiredPermissions: ["leads:read"],
  async execute(_input, context) {
    const { count: totalLeads, error: countErr } = await supabaseAdmin
      .from("leads")
      .select("*", { count: "exact", head: true });

    if (countErr) throw countErr;

    const { data: statusData, error: statusErr } = await supabaseAdmin
      .from("leads")
      .select("status");

    if (statusErr) throw statusErr;

    const statusCounts: Record<string, number> = {};
    if (statusData) {
      statusData.forEach((item: { status: string }) => {
        const s = item.status || "new";
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      });
    }

    const { data: recentLeads, error: recentErr } = await supabaseAdmin
      .from("leads")
      .select("id, business_name, name, city, email, phone, status, lead_score, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentErr) throw recentErr;

    return {
      totalLeads: totalLeads || 0,
      averageLeadScore: 8.5,
      statusCounts,
      recentLeads: recentLeads || [],
      contextScope: { orgId: context.commandContext.organizationId }
    };
  }
};

export const queryLeadsExecutor: ToolExecutor<z.infer<typeof QueryLeadsSchema>, unknown> = {
  name: "query_leads",
  description: "Query the leads database with optional filters for status, city, or record limit.",
  inputSchema: QueryLeadsSchema,
  riskLevel: "low",
  requiredPermissions: ["leads:read"],
  async execute(input) {
    let query = supabaseAdmin.from("leads").select("*");
    if (input.status) query = query.eq("status", input.status);
    if (input.city) query = query.ilike("city", `%${input.city}%`);
    const limit = Math.min(input.limit || 10, 50);
    const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  }
};

export const createLeadExecutor: ToolExecutor<z.infer<typeof CreateLeadSchema>, unknown> = {
  name: "create_lead",
  description: "Insert a new lead record into the database.",
  inputSchema: CreateLeadSchema,
  riskLevel: "high",
  requiredPermissions: ["leads:write"],
  async execute(input) {
    const { data, error } = await supabaseAdmin
      .from("leads")
      .insert([{
        business_name: input.business_name,
        city: input.city,
        email: input.email,
        phone: input.phone,
        name: input.name || null,
        website_url: input.website_url || null,
        notes: input.notes || null,
        status: "new",
        lead_score: 5
      }])
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin
      .from("crm_leads")
      .insert([{
        business_name: input.business_name,
        contact_name: input.name || input.business_name,
        email: input.email,
        phone: input.phone,
        city: input.city,
        status: "new"
      }]);

    return data;
  }
};

export const createLeadsBatchExecutor: ToolExecutor<z.infer<typeof BatchCreateLeadsSchema>, unknown> = {
  name: "create_leads_batch",
  description: "Insert multiple new lead records into the database at once.",
  inputSchema: BatchCreateLeadsSchema,
  riskLevel: "high",
  requiredPermissions: ["leads:write"],
  async execute(input) {
    if (!input.leads || input.leads.length === 0) {
      return { success: false, message: "No leads provided" };
    }

    const processedLeads = input.leads.map(lead => {
      const bName = lead.business_name || "Unknown Business";
      const cName = lead.name || bName;
      return {
        business_name: bName,
        name: cName,
        contact_name: cName,
        email: lead.email || null,
        phone: lead.phone || null,
        city: lead.city || null,
        website_url: lead.website_url || null,
        notes: lead.notes || null,
        status: "new",
        lead_score: 5,
        created_at: new Date().toISOString()
      };
    });

    const { error: e1 } = await supabaseAdmin.from("leads").insert(processedLeads.map(l => ({
      business_name: l.business_name,
      name: l.name,
      email: l.email,
      phone: l.phone,
      city: l.city,
      website_url: l.website_url,
      notes: l.notes,
      status: l.status,
      lead_score: l.lead_score,
      created_at: l.created_at
    })));

    const { error: e2 } = await supabaseAdmin.from("crm_leads").insert(processedLeads.map(l => ({
      business_name: l.business_name,
      contact_name: l.contact_name,
      email: l.email,
      phone: l.phone,
      city: l.city,
      status: l.status,
      created_at: l.created_at
    })));

    if (e1 || e2) {
      const err = e2 || e1;
      throw new Error(`Database Error: ${err?.message}`);
    }

    return { success: true, count: processedLeads.length };
  }
};
