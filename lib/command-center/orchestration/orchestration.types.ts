import { CommandCenterContext } from "../context/command-center-context";
import { IntentClassification } from "../intent/intent.types";
import { CapabilityRoutingDecision, ModelRoutingDecision } from "../routing/routing.types";

export interface OrchestrationExecutionPayload {
  commandContext: CommandCenterContext;
  intent: IntentClassification;
  routing: CapabilityRoutingDecision;
  modelRouting: ModelRoutingDecision;
  conversationId: string;
}
