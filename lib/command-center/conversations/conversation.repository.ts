import { supabaseAdmin } from "@/lib/supabase/admin";
import { ConversationContract } from "@/types/commandCenterContracts";

export class ConversationRepository {
  static async listRecent(organizationId: string, workspaceId: string, limit = 20): Promise<ConversationContract[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("command_center_conversations")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) return [];
      return (data || []).map(row => ({
        id: row.id,
        organizationId: row.organization_id || organizationId,
        workspaceId: row.workspace_id || workspaceId,
        title: row.title || "New conversation",
        createdAt: row.created_at
      }));
    } catch (_err) {
      return [];
    }
  }

  static async findById(id: string, organizationId: string, workspaceId: string): Promise<ConversationContract | null> {
    try {
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
        organizationId: data.organization_id || organizationId,
        workspaceId: data.workspace_id || workspaceId,
        title: data.title || "New conversation",
        createdAt: data.created_at
      };
    } catch (_err) {
      return null;
    }
  }

  static async create(id: string, title: string, orgId: string, wsId: string): Promise<ConversationContract> {
    const fallbackContract: ConversationContract = {
      id,
      organizationId: orgId || "default",
      workspaceId: wsId || "default",
      title: title.slice(0, 200) || "New conversation",
      createdAt: new Date().toISOString()
    };

    try {
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
      }

      if (error || !data) return fallbackContract;

      return {
        id: data.id,
        organizationId: data.organization_id || orgId,
        workspaceId: data.workspace_id || wsId,
        title: data.title || title,
        createdAt: data.created_at
      };
    } catch (_err) {
      return fallbackContract;
    }
  }
}
