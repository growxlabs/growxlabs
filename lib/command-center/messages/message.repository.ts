import { supabaseAdmin } from "@/lib/supabase/admin";
import { MessageContract } from "@/types/commandCenterContracts";
import { ConversationRepository } from "../conversations/conversation.repository";

export class MessageRepository {
  static async listByConversationId(conversationId: string, organizationId: string, workspaceId: string): Promise<MessageContract[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("command_center_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error || !data) return [];

      return data.map(row => ({
        id: row.id || "msg_" + Math.random().toString(36).substring(2, 9),
        conversationId: row.conversation_id,
        sender: row.sender as "user" | "gxl",
        text: row.text || "",
        timestamp: row.created_at || new Date().toISOString(),
        toolCalls: row.tool_calls || undefined,
        proposal: row.proposal || undefined,
        chart: row.chart || undefined
      }));
    } catch (_err) {
      return [];
    }
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
    try {
      // Ensure parent conversation entry exists or create it safely
      let conversation = await ConversationRepository.findById(msg.conversationId, msg.organizationId, msg.workspaceId);
      if (!conversation) {
        await ConversationRepository.create(msg.conversationId, msg.text.slice(0, 40) || "New Conversation", msg.organizationId, msg.workspaceId);
      }

      await supabaseAdmin
        .from("command_center_messages")
        .insert({
          conversation_id: msg.conversationId,
          sender: msg.sender,
          text: msg.text,
          tool_calls: msg.toolCalls || null,
          proposal: msg.proposal || null,
          chart: msg.chart || null
        });
    } catch (_err) {
      // Safe non-blocking execution logging
    }
  }
}
