import { AgentRegistry } from "../agents/agent-registry";
import { SkillRegistry } from "../skills/skill-registry";
import type { WorkerExecutionRequest } from "./worker-request.schema";

export function authoriseWorkerRequest(request: WorkerExecutionRequest): void {
  const agent = AgentRegistry.get(request.agentId);
  if (!agent || agent.status !== "active") {
    throw new Error("Execution agent is unavailable.");
  }
  const skill = request.skillId
    ? SkillRegistry.get(request.skillId)
    : undefined;
  if (!agent.supportedCapabilities.includes(request.capabilityId)) {
    throw new Error("Execution capability or skill is not authorised.");
  }
  if (
    request.skillId &&
    (!skill ||
      skill.status !== "active" ||
      !skill.allowedAgentIds.includes(agent.id) ||
      !skill.capabilityIds.includes(request.capabilityId))
  ) {
    throw new Error("Execution capability or skill is not authorised.");
  }
  if (
    request.toolId &&
    (!agent.allowedTools.includes(request.toolId) ||
      (skill && !skill.allowedToolIds.includes(request.toolId)))
  ) {
    throw new Error("Execution tool is outside the selected agent and skill.");
  }
}
