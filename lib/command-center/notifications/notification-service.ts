import "server-only";

import crypto from "crypto";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { NotificationRecord } from "./notification.types";
import { CommandCenterError } from "../production/errors";

type Preferences = { info: boolean; success: boolean; warning: boolean; critical: true };
const DEFAULT_PREFERENCES: Preferences = { info: true, success: true, warning: true, critical: true };

export class NotificationService {
  private static ALLOWED_ACTION_URL_PREFIXES = ["/admin/", "/dashboard", "/client/", "/people/"];

  static validateActionUrl(url?: string): string | undefined {
    if (!url || url.length > 512 || url.includes("\\") || url.includes("//")) return undefined;
    return this.ALLOWED_ACTION_URL_PREFIXES.some((prefix) => url.startsWith(prefix)) ? url : undefined;
  }

  static async createNotification(input: Omit<NotificationRecord, "id" | "createdAt" | "status">): Promise<NotificationRecord> {
    const record: NotificationRecord = {
      ...input,
      id: `notif_${crypto.randomUUID()}`,
      actionUrl: this.validateActionUrl(input.actionUrl),
      status: "unread",
      createdAt: new Date().toISOString(),
    };
    const { error } = await supabaseAdmin.from("notification_records").insert(toRow(record));
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    return record;
  }

  static async listForUser(userId: string, organisationId: string, workspaceId: string): Promise<NotificationRecord[]> {
    const { data, error } = await supabaseAdmin
      .from("notification_records")
      .select("*")
      .eq("recipient_user_id", userId)
      .eq("organisation_id", organisationId)
      .eq("workspace_id", workspaceId)
      .neq("status", "expired")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    return (data ?? []).map((row) => fromRow(row as Record<string, unknown>));
  }

  static async markRead(id: string, userId: string, organisationId: string, workspaceId: string): Promise<boolean> {
    return this.updateStatus(id, userId, organisationId, workspaceId, "read");
  }

  static async markAllRead(userId: string, organisationId: string, workspaceId: string): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from("notification_records")
      .update({ status: "read", read_at: new Date().toISOString() })
      .eq("recipient_user_id", userId)
      .eq("organisation_id", organisationId)
      .eq("workspace_id", workspaceId)
      .eq("status", "unread")
      .select("id");
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    return data?.length ?? 0;
  }

  static async archive(id: string, userId: string, organisationId: string, workspaceId: string): Promise<boolean> {
    return this.updateStatus(id, userId, organisationId, workspaceId, "archived");
  }

  static async getPreferences(userId: string, organisationId: string, workspaceId: string): Promise<Preferences> {
    const { data, error } = await supabaseAdmin
      .from("notification_preferences")
      .select("preferences_json")
      .eq("user_id", userId)
      .eq("organisation_id", organisationId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    const value = data?.preferences_json;
    if (!value || typeof value !== "object") return DEFAULT_PREFERENCES;
    const preferences = value as Record<string, unknown>;
    return {
      info: preferences.info !== false,
      success: preferences.success !== false,
      warning: preferences.warning !== false,
      critical: true,
    };
  }

  static async updatePreferences(
    userId: string,
    organisationId: string,
    workspaceId: string,
    input: { info: boolean; success: boolean; warning: boolean },
  ): Promise<Preferences> {
    const value: Preferences = { ...input, critical: true };
    const { error } = await supabaseAdmin.from("notification_preferences").upsert({
      user_id: userId,
      organisation_id: organisationId,
      workspace_id: workspaceId,
      preferences_json: value,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    return value;
  }

  private static async updateStatus(
    id: string,
    userId: string,
    organisationId: string,
    workspaceId: string,
    status: "read" | "archived",
  ): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from("notification_records")
      .update({ status, read_at: status === "read" ? new Date().toISOString() : undefined })
      .eq("id", id)
      .eq("recipient_user_id", userId)
      .eq("organisation_id", organisationId)
      .eq("workspace_id", workspaceId)
      .select("id")
      .maybeSingle();
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    return Boolean(data);
  }
}

function toRow(record: NotificationRecord): Record<string, unknown> {
  return {
    id: record.id,
    version: record.version,
    organisation_id: record.organisationId,
    workspace_id: record.workspaceId,
    recipient_user_id: record.recipientUserId,
    notification_type: record.notificationType,
    title: record.title,
    body: record.body,
    severity: record.severity,
    source_type: record.source.type,
    source_id: record.source.id,
    action_url: record.actionUrl ?? null,
    status: record.status,
    created_at: record.createdAt,
    read_at: record.readAt ?? null,
    expires_at: record.expiresAt ?? null,
    metadata: record.metadata ?? {},
  };
}

function fromRow(row: Record<string, unknown>): NotificationRecord {
  return {
    id: String(row.id),
    version: String(row.version),
    organisationId: String(row.organisation_id),
    workspaceId: String(row.workspace_id),
    recipientUserId: String(row.recipient_user_id),
    notificationType: String(row.notification_type) as NotificationRecord["notificationType"],
    title: String(row.title),
    body: String(row.body),
    severity: String(row.severity) as NotificationRecord["severity"],
    source: { type: String(row.source_type) as NotificationRecord["source"]["type"], id: String(row.source_id) },
    actionUrl: row.action_url ? String(row.action_url) : undefined,
    status: String(row.status) as NotificationRecord["status"],
    createdAt: String(row.created_at),
    readAt: row.read_at ? String(row.read_at) : undefined,
    expiresAt: row.expires_at ? String(row.expires_at) : undefined,
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata as Record<string, unknown> : {},
  };
}
