import { GoogleGenerativeAI } from "@google/generative-ai";
import { TOOLS_DEFINITIONS } from "../tools/definitions/existing-tools";

const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

export class GeminiProvider {
  static getModel() {
    if (!genAI) throw new Error("GEMINI_API_KEY environment variable is not configured.");
    return genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ functionDeclarations: TOOLS_DEFINITIONS }] as any
    });
  }

  static isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }
}
