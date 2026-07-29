export type CommandIntentType =
  | "CREATE_LEAD"
  | "QUERY_LEADS"
  | "GENERATE_PROPOSAL"
  | "CREATE_INVOICE"
  | "QUERY_FINANCE"
  | "QUERY_PROJECTS"
  | "CONTENT_DISPATCH"
  | "GENERAL_CHAT"
  | "INFORMATION_LOOKUP"
  | "CLARIFICATION_REQUIRED";

export type IntentClassificationSource = "rule" | "model" | "fallback";

export interface IntentClassification {
  type: CommandIntentType;
  confidence: number;
  source: IntentClassificationSource;
  department?: string;
  action?: string;
  resource?: string;
  entities: Record<string, unknown>;
  requiresClarification: boolean;
  explanation?: string;
  classifierVersion: string;
}

export interface IntentRuleDefinition {
  intentType: CommandIntentType;
  patterns: RegExp[];
  department?: string;
  action?: string;
  resource?: string;
  minConfidence: number;
}
