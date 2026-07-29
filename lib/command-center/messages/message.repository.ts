import { supabaseAdmin } from "@/lib/supabase/admin";
import { MessageContract } from "@/types/commandCenterContracts";

export class MessageRepository {
  static async listByConversationId(conversationId: string): Promise<MessageContract[]> {
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
    sender: "user" | "gxl";
    text: string;
    toolCalls?: any;
    proposal?: any;
    chart?: any;
  }): Promise<void> {
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

    if (error) {
      console.warn("Could not persist message in DB:", error.message);
    }
  }
}
