import { CommandCenterError } from "./errors.ts";

const active = new Map<string, number>();

export async function withConcurrencyLimit<T>(
  operation: string,
  limit: number,
  task: () => Promise<T>,
): Promise<T> {
  const current = active.get(operation) ?? 0;
  if (current >= limit) {
    throw new CommandCenterError("RATE_LIMITED", {
      message: "This operation is at capacity. Please retry shortly.",
      retryable: true,
    });
  }
  active.set(operation, current + 1);
  try {
    return await task();
  } finally {
    const remaining = (active.get(operation) ?? 1) - 1;
    if (remaining <= 0) active.delete(operation);
    else active.set(operation, remaining);
  }
}

export function resetConcurrencyForTests(): void {
  active.clear();
}
