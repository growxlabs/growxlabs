import { AgentDefinition, AgentSelectionResult } from "./agent.types";
import { AgentRegistry } from "./agent-registry";
import { IntentClassification } from "../intent/intent.types";
import { CommandCenterContext } from "../context/command-center-context";

export class AgentSelectionEngine {
  static selectAgent(
    intent: IntentClassification,
    commandContext: CommandCenterContext
  ): AgentSelectionResult {
    const allAgents = AgentRegistry.listAll();
    const userPermissions = commandContext.permissions || [];

    // Filter agents matching the intent
    const candidateAgents = allAgents.filter(agent => {
      if (agent.status !== "active") return false;
      const intentMatches = agent.supportedIntents.includes(intent.type);
      if (!intentMatches) return false;

      // Check required permissions
      if (agent.requiredPermissions && agent.requiredPermissions.length > 0) {
        const hasPermission = agent.requiredPermissions.every(p => userPermissions.includes(p));
        if (!hasPermission) return false;
      }
      return true;
    });

    if (candidateAgents.length > 0) {
      return {
        selectedAgent: candidateAgents[0],
        reason: `Selected ${candidateAgents[0].name} based on intent ${intent.type} and verified permissions`,
        confidence: intent.confidence
      };
    }

    // Default fallback to CEO / General Agent
    const defaultAgent = AgentRegistry.get("agent_ceo") || allAgents[0];
    return {
      selectedAgent: defaultAgent,
      reason: `Defaulting to ${defaultAgent.name} for general orchestration`,
      confidence: 0.8
    };
  }
}
