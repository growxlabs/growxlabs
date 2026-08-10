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
    let totalLeads = 0;
    let statusCounts: Record<string, number> = {};
    let recentLeads: any[] = [];
    let reqCount = 0;
    let deptCount = 0;

    try {
      const res = await supabaseAdmin.from("leads").select("*", { count: "exact", head: true });
      totalLeads = res.count || 0;
    } catch (_e) {}

    try {
      const res = await supabaseAdmin.from("leads").select("status");
      if (res.data) {
        res.data.forEach((item: { status: string }) => {
          const s = item.status || "new";
          statusCounts[s] = (statusCounts[s] || 0) + 1;
        });
      }
    } catch (_e) {}

    try {
      const res = await supabaseAdmin.from("leads").select("id, business_name, name, city, email, phone, status, lead_score, created_at").order("created_at", { ascending: false }).limit(10);
      recentLeads = res.data || [];
    } catch (_e) {}

    try {
      const res = await supabaseAdmin.from("recruitment_requisitions").select("*", { count: "exact", head: true });
      reqCount = res.count || 0;
    } catch (_e) {}

    try {
      const res = await supabaseAdmin.from("departments").select("*", { count: "exact", head: true });
      deptCount = res.count || 0;
    } catch (_e) {}

    return {
      totalLeads,
      activeRequisitions: reqCount,
      activeDepartments: deptCount,
      statusCounts,
      recentLeads,
      contextScope: { orgId: context.commandContext.organizationId }
    };
  }
};

export const queryLeadsExecutor: ToolExecutor<z.infer<typeof QueryLeadsSchema>, unknown> = {
  name: "query_leads",
  description: "Query the leads database with optional filters for status, city, or search terms.",
  inputSchema: QueryLeadsSchema,
  riskLevel: "low",
  requiredPermissions: ["leads:read"],
  async execute(input) {
    let query = supabaseAdmin.from("leads").select("*");
    
    if (input.status) query = query.eq("status", input.status);
    if (input.city) query = query.ilike("city", `%${input.city}%`);
    
    const searchTerm = ((input as any).query || "").trim();
    if (searchTerm) {
      const cleanTerm = searchTerm.replace(/[^a-zA-Z0-9\s]/g, "");
      const words = cleanTerm.split(/\s+/).filter((w: string) => w.length > 2);
      if (words.length > 0) {
        const orConditions = words.map((w: string) => `business_name.ilike.%${w}%,city.ilike.%${w}%,notes.ilike.%${w}%,name.ilike.%${w}%`).join(",");
        query = query.or(orConditions);
      }
    }

    const limit = Math.min(input.limit || 15, 50);
    try {
      const { data } = await query.order("created_at", { ascending: false }).limit(limit);
      if (data && data.length > 0) return data;
    } catch (_e) {}

    return [];
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
        lead_score: 5,
        organisation_id: process.env.DEFAULT_ORGANISATION_ID,
        source: "manual_admin"
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  }
};

export const createLeadsBatchExecutor: ToolExecutor<z.infer<typeof BatchCreateLeadsSchema>, unknown> = {
  name: "batch_create_leads",
  description: "Insert multiple lead records into the database in bulk.",
  inputSchema: BatchCreateLeadsSchema,
  riskLevel: "high",
  requiredPermissions: ["leads:write"],
  async execute(input) {
    const rows = input.leads.map(l => ({
      business_name: l.business_name,
      city: l.city,
      email: l.email,
      phone: l.phone,
      name: l.name || null,
      website_url: l.website_url || null,
      notes: l.notes || null,
      status: "new",
      lead_score: 5
    }));

    const { data, error } = await supabaseAdmin
      .from("leads")
      .insert(rows)
      .select();

    if (error) throw error;
    return { createdCount: data?.length || 0, leads: data || [] };
  }
};
