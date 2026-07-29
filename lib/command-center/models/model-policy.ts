export interface ModelPolicy {
  primaryProvider: "gemini" | "openrouter";
  fallbackProvider: "openrouter";
  maxAttempts: number;
  timeoutMs: number;
}

export const DEFAULT_MODEL_POLICY: ModelPolicy = {
  primaryProvider: "gemini",
  fallbackProvider: "openrouter",
  maxAttempts: 3,
  timeoutMs: 30000
};
