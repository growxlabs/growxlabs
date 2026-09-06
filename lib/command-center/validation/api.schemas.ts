import { z } from "zod";

export const ProcessMessageBodySchema = z.object({
  message: z.string().trim().max(50_000).default(""),
  conversationId: z.string().min(1).max(200).optional(),
  history: z.array(z.object({
    id: z.string().max(200).optional(),
    sender: z.enum(["user", "gxl"]),
    text: z.string().max(50_000),
    timestamp: z.string().max(100).optional()
  }).passthrough()).max(100).optional(),
  attachments: z.array(z.object({
    id: z.string().max(200).optional(),
    name: z.string().min(1).max(255),
    type: z.string().min(1).max(200),
    base64: z.string().max(25_000_000).optional(),
    url: z.string().url().max(2_000).optional(),
    size: z.number().optional()
  }).passthrough()).max(10).optional()
}).passthrough();

export type ProcessMessageBody = z.infer<typeof ProcessMessageBodySchema>;

export const GetConversationQuerySchema = z.object({
  conversationId: z.string().min(1).max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20)
}).strict();

export type GetConversationQuery = z.infer<typeof GetConversationQuerySchema>;
