import { OpenAI } from "openai";
import { OPENAI_TOOLS } from "../tools/definitions/existing-tools";

const openrouterApiKey = process.env.OPENROUTER_API_KEY || "";
const openrouter = openrouterApiKey ? new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: openrouterApiKey,
}) : null;

export class OpenRouterProvider {
  static getClient(): OpenAI {
    if (!openrouter) throw new Error("OPENROUTER_API_KEY environment variable is not configured.");
    return openrouter;
  }

  static getTools(allowedTools?: string[]) {
    if (!allowedTools) return OPENAI_TOOLS;
    return OPENAI_TOOLS.filter(t => allowedTools.includes(t.function.name));
  }

  static isConfigured(): boolean {
    return Boolean(process.env.OPENROUTER_API_KEY);
  }
}
