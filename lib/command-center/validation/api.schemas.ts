import { z } from "zod";

export const ProcessMessageBodySchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  conversationId: z.string().optional(),
  history: z.array(z.object({
    id: z.string().optional(),
    sender: z.enum(["user", "gxl"]),
    text: z.string(),
    timestamp: z.string().optional()
  })).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    type: z.string(),
    base64: z.string().optional(),
    url: z.string().optional()
  })).optional()
});

export type ProcessMessageBody = z.infer<typeof ProcessMessageBodySchema>;

export const GetConversationQuerySchema = z.object({
  conversationId: z.string().optional(),
  limit: z.coerce.number().optional().default(20)
});

export type GetConversationQuery = z.infer<typeof GetConversationQuerySchema>;
