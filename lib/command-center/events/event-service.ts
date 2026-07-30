import { PlatformEvent } from "./event.types";

export class EventService {
  private static events = new Map<string, PlatformEvent>();
  private static dedupKeys = new Set<string>();

  static async ingestEvent(eventInput: Omit<PlatformEvent, "id" | "ingestedAt">, dedupKey?: string): Promise<PlatformEvent> {
    if (dedupKey && this.dedupKeys.has(dedupKey)) {
      throw new Error(`Duplicate event rejected by dedupKey: ${dedupKey}`);
    }

    const id = "evt_" + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    const event: PlatformEvent = {
      ...eventInput,
      id,
      ingestedAt: now
    };

    this.events.set(id, event);
    if (dedupKey) this.dedupKeys.add(dedupKey);

    return event;
  }

  static listEvents(organisationId: string, workspaceId: string): PlatformEvent[] {
    return Array.from(this.events.values()).filter(
      e => e.organisationId === organisationId && e.workspaceId === workspaceId
    );
  }
}
