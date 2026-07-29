export const PLANNER_POLICY = Object.freeze({
  maxSteps: 50,
  maxTimeoutMs: 300_000,
  maxRetryAttempts: 5,
  maxSerializedInputBytes: 64_000,
  maxSerializedOutputSchemaBytes: 32_000,
  providerTimeoutMs: 30_000,
  maxWaitMs: 60_000,
});
