import { PromptRegistry } from "./prompt-registry";
import { AgentDefinition } from "../agents/agent.types";

export class PromptBuilder {
  static sanitizeUntrustedInput(text: string): string {
    if (!text) return "";
    // Strip common prompt injection patterns
    return text
      .replace(/ignore\s+previous\s+instructions/gi, "[filtered instruction]")
      .replace(/override\s+system\s+prompt/gi, "[filtered instruction]")
      .replace(/bypass\s+permission/gi, "[filtered instruction]");
  }

  static buildSystemPrompt(selectedAgent?: AgentDefinition): string {
    const basePrompt = PromptRegistry.getActiveSystemPrompt().template;
    if (!selectedAgent) return basePrompt;

    const overlay = `\n\n### CURRENT ACTIVE AGENT OVERLAY:
You are operating with primary focus from the **${selectedAgent.name}** (${selectedAgent.department} Department).
Role Description: ${selectedAgent.description}`;

    return basePrompt + overlay;
  }
}
