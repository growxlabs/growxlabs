import { AgentPersonaId } from "@/types/commandCenterTypes";

export interface AgentDefinition {
  id: string;
  version: string;
  name: string;
  description: string;
  department: string;
  persona: AgentPersonaId;
  status: "active" | "disabled" | "deprecated";
  supportedIntents: string[];
  supportedCapabilities: string[];
  supportedSkills: string[];
  allowedTools: string[];
  requiredPermissions: string[];
  supportedProviders: string[];
  defaultProviderPolicy: string;
  metadata?: Record<string, unknown>;
}

export interface AgentSelectionResult {
  selectedAgent: AgentDefinition;
  reason: string;
  confidence: number;
}
