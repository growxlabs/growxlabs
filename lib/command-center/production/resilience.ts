import { CommandCenterLogger } from "../logging/logger";
import { CommandCenterError } from "./errors";

type CircuitState = { failures: number; openedAt: number | null };
const circuits = new Map<string, CircuitState>();

export type ResilienceOptions = {
  operation: string;
  requestId: string;
  timeoutMs: number;
  totalDeadlineMs?: number;
  maxAttempts?: number;
  retryableStatuses?: number[];
  circuitFailureThreshold?: number;
  circuitCooldownMs?: number;
};

export async function fetchWithResilience(
  input: string | URL,
  init: RequestInit,
  options: ResilienceOptions,
): Promise<Response> {
  const maxAttempts = Math.min(4, Math.max(1, options.maxAttempts ?? 3));
  const deadline = Date.now() + Math.max(options.timeoutMs, options.totalDeadlineMs ?? options.timeoutMs * maxAttempts);
  const circuit = circuits.get(options.operation) ?? { failures: 0, openedAt: null };
  const threshold = options.circuitFailureThreshold ?? 5;
  const cooldown = options.circuitCooldownMs ?? 30_000;
  if (circuit.openedAt && Date.now() - circuit.openedAt < cooldown) {
    throw new CommandCenterError("DEPENDENCY_UNAVAILABLE", {
      message: "The dependency circuit is temporarily open.",
      retryable: true,
    });
  }
  if (circuit.openedAt) {
    circuit.openedAt = null;
    circuit.failures = 0;
  }

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Math.min(options.timeoutMs, remaining));
    const abort = () => controller.abort();
    init.signal?.addEventListener("abort", abort, { once: true });
    const started = Date.now();
    try {
      const response = await fetch(input, { ...init, signal: controller.signal });
      const retryableStatuses = options.retryableStatuses ?? [408, 425, 429, 500, 502, 503, 504];
      if (!retryableStatuses.includes(response.status)) {
        circuit.failures = 0;
        circuits.set(options.operation, circuit);
        logSlowOperation(options, started, attempt, response.status);
        return response;
      }
      lastError = new CommandCenterError("DEPENDENCY_UNAVAILABLE", {
        message: "A dependency returned a retryable response.",
        retryable: true,
      });
      if (attempt === maxAttempts) {
        circuit.failures += 1;
        if (circuit.failures >= threshold) circuit.openedAt = Date.now();
        circuits.set(options.operation, circuit);
        return response;
      }
    } catch (error) {
      lastError = error;
      if (init.signal?.aborted) throw error;
    } finally {
      clearTimeout(timeout);
      init.signal?.removeEventListener("abort", abort);
    }
    await delayWithJitter(attempt, deadline, init.signal);
  }

  circuit.failures += 1;
  if (circuit.failures >= threshold) circuit.openedAt = Date.now();
  circuits.set(options.operation, circuit);
  if (lastError instanceof DOMException && lastError.name === "AbortError") {
    throw new CommandCenterError("TIMEOUT", { cause: lastError, retryable: true });
  }
  throw new CommandCenterError("DEPENDENCY_UNAVAILABLE", { cause: lastError, retryable: true });
}

function logSlowOperation(options: ResilienceOptions, started: number, attempt: number, status: number): void {
  const durationMs = Date.now() - started;
  if (durationMs < Math.min(1_000, options.timeoutMs / 2)) return;
  CommandCenterLogger.warn("Slow dependency operation", {
    requestId: options.requestId,
    operation: options.operation,
    durationMs,
    attempt,
    status,
    outcome: "slow",
  });
}

async function delayWithJitter(attempt: number, deadline: number, signal?: AbortSignal | null): Promise<void> {
  const base = Math.min(2_000, 100 * (2 ** (attempt - 1)));
  const wait = Math.min(deadline - Date.now(), base + Math.floor(Math.random() * base * 0.4));
  if (wait <= 0) return;
  await new Promise<void>((resolve, reject) => {
    const cleanup = () => signal?.removeEventListener("abort", abort);
    const timeout = setTimeout(() => {
      cleanup();
      resolve();
    }, wait);
    const abort = () => {
      clearTimeout(timeout);
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", abort, { once: true });
  });
}

export function resetCircuitsForTests(): void {
  circuits.clear();
}
