import { z } from "zod";

export const NotificationTypeSchema = z.enum([
  "approval_required",
  "approval_resolved",
  "run_completed",
  "run_failed",
  "artifact_ready",
  "artifact_failed",
  "policy_changed",
  "security_warning",
  "memory_confirmation",
  "clarification_required"
]);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationSeveritySchema = z.enum(["info", "success", "warning", "critical"]);
export type NotificationSeverity = z.infer<typeof NotificationSeveritySchema>;

export const NotificationStatusSchema = z.enum(["unread", "read", "archived", "expired"]);
export type NotificationStatus = z.infer<typeof NotificationStatusSchema>;

export const NotificationRecordSchema = z.object({
  id: z.string(),
  version: z.string().default("1.0.0"),
  organisationId: z.string(),
  workspaceId: z.string(),
  recipientUserId: z.string(),
  notificationType: NotificationTypeSchema,
  title: z.string(),
  body: z.string(),
  severity: NotificationSeveritySchema.default("info"),
  source: z.object({
    type: z.enum(["approval", "run", "artifact", "policy", "security", "memory"]),
    id: z.string()
  }),
  actionUrl: z.string().optional(),
  status: NotificationStatusSchema.default("unread"),
  createdAt: z.string(),
  readAt: z.string().optional(),
  expiresAt: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});
export type NotificationRecord = z.infer<typeof NotificationRecordSchema>;
