import { FormattedMessageHistory, TokenBudgetConfig } from "./context.types";

export class ConversationContextFormatter {
  private static DEFAULT_BUDGET: TokenBudgetConfig = {
    maxMessageCount: 20,
    maxEstimatedTokens: 8000,
    maxAttachmentCount: 5
  };

  static formatHistory(
    historyInput: any[] = [],
    budget: TokenBudgetConfig = this.DEFAULT_BUDGET
  ): FormattedMessageHistory {
    if (!historyInput || historyInput.length === 0) {
      return { messages: [], totalEstimatedTokens: 0, isTruncated: false };
    }

    // Limit to latest N messages
    const recent = historyInput.slice(-budget.maxMessageCount);
    let totalTokens = 0;
    const formatted: Array<{ role: "user" | "model" | "assistant"; text: string }> = [];
    let isTruncated = historyInput.length > budget.maxMessageCount;

    for (const msg of recent) {
      const text = msg.text || "";
      const estimatedTokens = Math.ceil(text.length / 4);

      if (totalTokens + estimatedTokens > budget.maxEstimatedTokens) {
        isTruncated = true;
        break;
      }

      totalTokens += estimatedTokens;
      formatted.push({
        role: msg.sender === "user" ? "user" : "model",
        text
      });
    }

    return {
      messages: formatted,
      totalEstimatedTokens: totalTokens,
      isTruncated
    };
  }
}
