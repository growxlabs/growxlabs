import type { MentionOption } from "./command-center.types.ts";

export const MENTION_OPTIONS: MentionOption[] = [
  { id: "agent-sales", label: "Sales Agent", description: "Leads, enrichment, and pipeline", token: "@agent:sales", kind: "agent" },
  { id: "agent-cfo", label: "CFO Agent", description: "Invoices, revenue, and financial analysis", token: "@agent:cfo", kind: "agent" },
  { id: "agent-research", label: "Research Agent", description: "Market and web research", token: "@agent:research", kind: "agent" },
  { id: "project-current", label: "Current workspace", description: "Use the workspace-aware default project", token: "@project:current", kind: "project" },
  { id: "model-auto", label: "Automatic model", description: "Use policy-based model routing", token: "@model:auto", kind: "model" },
  { id: "command-new", label: "New conversation", description: "Start a clean thread", token: "/new", kind: "command" },
];

export function mentionTrigger(value: string): string {
  return value.match(/(?:^|\s)([@/][^\s]*)$/)?.[1] ?? "";
}

export function mentionOptions(value: string): MentionOption[] {
  const trigger = mentionTrigger(value).toLowerCase();
  if (!trigger) return [];
  return MENTION_OPTIONS.filter((option) =>
    option.token.toLowerCase().startsWith(trigger) ||
    option.label.toLowerCase().includes(trigger.slice(1)),
  ).slice(0, 6);
}

export function replaceMention(value: string, option: MentionOption): string {
  return value.replace(/(?:^|\s)([@/][^\s]*)$/, (matched) =>
    `${matched.startsWith(" ") ? " " : ""}${option.token} `,
  );
}

export class SubmissionGate {
  private active = false;
  enter(): boolean {
    if (this.active) return false;
    this.active = true;
    return true;
  }
  leave(): void {
    this.active = false;
  }
}
