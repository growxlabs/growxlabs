import { GeminiProvider } from "../models/gemini.provider";
import { OpenRouterProvider } from "../models/openrouter.provider";
import type { PlannerProvider } from "./planner.ts";

export class ModelPlannerProvider implements PlannerProvider {
  async generateJSON(prompt: string, signal: AbortSignal): Promise<unknown> {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    if (GeminiProvider.isConfigured()) {
      const result = await GeminiProvider.getModel().generateContent(prompt);
      return parseJSON(result.response.text());
    }
    if (OpenRouterProvider.isConfigured()) {
      const result = await OpenRouterProvider.getClient().chat.completions.create(
        {
          model: "anthropic/claude-3.5-sonnet",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        },
        { signal },
      );
      const content = result.choices[0]?.message.content;
      if (typeof content !== "string") {
        throw new Error("Planner provider returned no JSON content.");
      }
      return parseJSON(content);
    }
    throw new Error("No configured planner model provider is available.");
  }
}

function parseJSON(content: string): unknown {
  const trimmed = content.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(withoutFence) as unknown;
}
