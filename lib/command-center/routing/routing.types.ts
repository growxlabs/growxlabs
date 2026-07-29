import { IntentClassification } from "../intent/intent.types";
import { AgentDefinition } from "../agents/agent.types";
import { SkillDefinition } from "../skills/skill.types";

export interface CapabilityRoutingDecision {
  intent: IntentClassification;
  capabilityId: string;
  skill?: SkillDefinition;
  agent: AgentDefinition;
  requiredPermissions: string[];
  allowedToolIds: string[];
  confidence: number;
  reason: string;
}

export interface ModelRoutingDecision {
  providerId: "gemini" | "openrouter";
  modelName: string;
  maxAttempts: number;
  reason: string;
}
