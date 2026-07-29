import { CommandCenterContext } from "./command-center-context";

export interface TokenBudgetConfig {
  maxMessageCount: number;
  maxEstimatedTokens: number;
  maxAttachmentCount: number;
}

export interface FormattedMessageHistory {
  messages: Array<{ role: "user" | "model" | "assistant"; text: string }>;
  totalEstimatedTokens: number;
  isTruncated: boolean;
}

export interface AIContextPayload {
  commandContext: CommandCenterContext;
  allowedPersonaIds: string[];
  allowedToolNames: string[];
  allowedCapabilityIds: string[];
  formattedHistory: FormattedMessageHistory;
  sanitizedAttachments: Array<{ name: string; type: string; base64?: string }>;
  tokenBudget: TokenBudgetConfig;
}
