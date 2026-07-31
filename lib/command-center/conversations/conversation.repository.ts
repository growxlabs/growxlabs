import { supabaseAdmin } from "@/lib/supabase/admin";
import { ConversationContract } from "@/types/commandCenterContracts";
import { CommandCenterError } from "../production/errors";

export class ConversationRepository {
  static async listRecent(organizationId: string, workspaceId: string, limit = 20): Promise<ConversationContract[]> {
    const { data, error } = await supabaseAdmin
      .from("command_center_conversations")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(row => ({
      id: row.id,
      organizationId: row.organization_id || "default",
      workspaceId: row.workspace_id || "default",
      title: row.title || "New conversation",
      createdAt: row.created_at
    }));
  }

  static async findById(id: string, organizationId: string, workspaceId: string): Promise<ConversationContract | null> {
    const { data, error } = await supabaseAdmin
      .from("command_center_conversations")
      .select("*")
      .eq("id", id)
      .eq("organization_id", organizationId)
      .eq("workspace_id", workspaceId)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      organizationId: data.organization_id || "default",
      workspaceId: data.workspace_id || "default",
      title: data.title || "New conversation",
      createdAt: data.created_at
    };
  }

  static async create(id: string, title: string, orgId: string, wsId: string): Promise<ConversationContract> {
    if (!orgId || !wsId) throw new CommandCenterError("TENANT_SCOPE_INVALID");
    const { data, error } = await supabaseAdmin
      .from("command_center_conversations")
      .insert({
        id,
        title: title.slice(0, 200),
        organization_id: orgId,
        workspace_id: wsId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error?.code === "23505") {
      const existing = await this.findById(id, orgId, wsId);
      if (existing) return existing;
      throw new CommandCenterError("TENANT_SCOPE_INVALID");
    }
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    if (data.organization_id !== orgId || data.workspace_id !== wsId) throw new CommandCenterError("TENANT_SCOPE_INVALID");

    return {
      id: data.id,
      organizationId: data.organization_id || orgId,
      workspaceId: data.workspace_id || wsId,
      title: data.title,
      createdAt: data.created_at
    };
  }
}
