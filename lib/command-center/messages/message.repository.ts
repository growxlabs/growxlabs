import { supabaseAdmin } from "@/lib/supabase/admin";
import { MessageContract } from "@/types/commandCenterContracts";
import { ConversationRepository } from "../conversations/conversation.repository";
import { CommandCenterError } from "../production/errors";

export class MessageRepository {
  static async listByConversationId(conversationId: string, organizationId: string, workspaceId: string): Promise<MessageContract[]> {
    const conversation = await ConversationRepository.findById(conversationId, organizationId, workspaceId);
    if (!conversation) return [];
    const { data, error } = await supabaseAdmin
      .from("command_center_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id || "msg_" + Math.random().toString(36).substring(2, 9),
      conversationId: row.conversation_id,
      sender: row.sender as "user" | "gxl",
      text: row.text || "",
      timestamp: row.created_at || new Date().toISOString(),
      toolCalls: row.tool_calls || undefined,
      proposal: row.proposal || undefined,
      chart: row.chart || undefined
    }));
  }

  static async createMessage(msg: {
    conversationId: string;
    organizationId: string;
    workspaceId: string;
    sender: "user" | "gxl";
    text: string;
    toolCalls?: unknown;
    proposal?: unknown;
    chart?: unknown;
  }): Promise<void> {
    const conversation = await ConversationRepository.findById(msg.conversationId, msg.organizationId, msg.workspaceId);
    if (!conversation) throw new CommandCenterError("TENANT_SCOPE_INVALID");
    const { error } = await supabaseAdmin
      .from("command_center_messages")
      .insert({
        conversation_id: msg.conversationId,
        sender: msg.sender,
        text: msg.text,
        tool_calls: msg.toolCalls || null,
        proposal: msg.proposal || null,
        chart: msg.chart || null
      });

    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
  }
}
