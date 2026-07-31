import { GoogleGenerativeAI } from "@google/generative-ai";
import { TOOLS_DEFINITIONS } from "../tools/definitions/existing-tools";

const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

export class GeminiProvider {
  static getModel(allowedTools?: string[]) {
    if (!genAI) throw new Error("GEMINI_API_KEY environment variable is not configured.");
    const filtered = allowedTools 
      ? TOOLS_DEFINITIONS.filter(t => allowedTools.includes(t.name))
      : TOOLS_DEFINITIONS;
    return genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: filtered.length > 0 ? [{ functionDeclarations: filtered }] as any : undefined
    });
  }

  static isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }
}
