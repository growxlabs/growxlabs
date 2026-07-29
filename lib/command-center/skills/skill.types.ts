import { CommandIntentType } from "../intent/intent.types";

export interface SkillDefinition {
  id: string;
  version: string;
  name: string;
  description: string;
  department: string;
  capabilityIds: string[];
  supportedIntentTypes: CommandIntentType[];
  allowedAgentIds: string[];
  requiredPermissions: string[];
  allowedToolIds: string[];
  status: "active" | "disabled" | "deprecated";
  metadata?: Record<string, unknown>;
}

export interface SkillRoutingResult {
  selectedSkill?: SkillDefinition;
  reason: string;
}
