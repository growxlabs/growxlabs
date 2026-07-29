import { ModelRoutingDecision } from "./routing.types";
import { GeminiProvider } from "../models/gemini.provider";
import { OpenRouterProvider } from "../models/openrouter.provider";

export class ModelRouter {
  static routeModel(): ModelRoutingDecision {
    if (GeminiProvider.isConfigured()) {
      return {
        providerId: "gemini",
        modelName: "gemini-2.5-flash",
        maxAttempts: 3,
        reason: "Selected primary provider Gemini 2.5 Flash"
      };
    }

    if (OpenRouterProvider.isConfigured()) {
      return {
        providerId: "openrouter",
        modelName: "anthropic/claude-3.5-sonnet",
        maxAttempts: 3,
        reason: "Selected fallback provider OpenRouter Claude 3.5 Sonnet"
      };
    }

    throw new Error("No configured AI model provider available.");
  }
}
