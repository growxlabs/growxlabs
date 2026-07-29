import { CapabilityRoutingDecision } from "./routing.types";
import { IntentClassification } from "../intent/intent.types";
import { AgentSelectionEngine } from "../agents/agent-selection";
import { SkillRegistry } from "../skills/skill-registry";
import { CommandCenterContext } from "../context/command-center-context";

export class CapabilityRouter {
  static routeCapability(
    intent: IntentClassification,
    commandContext: CommandCenterContext
  ): CapabilityRoutingDecision {
    const selection = AgentSelectionEngine.selectAgent(intent, commandContext);
    const skill = SkillRegistry.findByIntent(intent.type);

    const capabilityId = skill?.capabilityIds[0] || selection.selectedAgent.supportedCapabilities[0] || "general.chat";

    return {
      intent,
      capabilityId,
      skill,
      agent: selection.selectedAgent,
      requiredPermissions: selection.selectedAgent.requiredPermissions,
      allowedToolIds: selection.selectedAgent.allowedTools,
      confidence: selection.confidence,
      reason: selection.reason
    };
  }
}
