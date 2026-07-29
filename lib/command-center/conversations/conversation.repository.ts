import { supabaseAdmin } from "@/lib/supabase/admin";
import { ConversationContract } from "@/types/commandCenterContracts";

export class ConversationRepository {
  static async listRecent(limit = 20): Promise<ConversationContract[]> {
    const { data, error } = await supabaseAdmin
      .from("command_center_conversations")
      .select("*")
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

  static async findById(id: string): Promise<ConversationContract | null> {
    const { data, error } = await supabaseAdmin
      .from("command_center_conversations")
      .select("*")
      .eq("id", id)
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

  static async create(id: string, title: string, orgId = "default", wsId = "default"): Promise<ConversationContract> {
    const { data, error } = await supabaseAdmin
      .from("command_center_conversations")
      .insert({
        id,
        title,
        organization_id: orgId,
        workspace_id: wsId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.warn("Could not persist conversation header:", error.message);
      return { id, title, organizationId: orgId, workspaceId: wsId, createdAt: new Date().toISOString() };
    }

    return {
      id: data.id,
      organizationId: data.organization_id || orgId,
      workspaceId: data.workspace_id || wsId,
      title: data.title,
      createdAt: data.created_at
    };
  }
}
