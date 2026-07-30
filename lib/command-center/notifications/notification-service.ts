import { NotificationRecord } from "./notification.types";

export class NotificationService {
  private static store = new Map<string, NotificationRecord>();
  private static ALLOWED_ACTION_URL_PREFIXES = [
    "/admin/",
    "/dashboard",
    "/client/",
    "/people/"
  ];

  static validateActionUrl(url?: string): string | undefined {
    if (!url) return undefined;
    const isValid = this.ALLOWED_ACTION_URL_PREFIXES.some(prefix => url.startsWith(prefix));
    if (!isValid) {
      console.warn(`Rejected untrusted action URL: ${url}`);
      return undefined;
    }
    return url;
  }

  static async createNotification(
    input: Omit<NotificationRecord, "id" | "createdAt" | "status">
  ): Promise<NotificationRecord> {
    const id = "notif_" + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    const record: NotificationRecord = {
      ...input,
      id,
      actionUrl: this.validateActionUrl(input.actionUrl),
      status: "unread",
      createdAt: now
    };

    this.store.set(id, record);
    return record;
  }

  static listForUser(userId: string, organisationId: string): NotificationRecord[] {
    return Array.from(this.store.values()).filter(
      n => n.recipientUserId === userId && n.organisationId === organisationId
    );
  }

  static markRead(id: string, userId: string): boolean {
    const record = this.store.get(id);
    if (!record || record.recipientUserId !== userId) return false;
    record.status = "read";
    record.readAt = new Date().toISOString();
    return true;
  }
}
