import "server-only";

import { CommandCenterLogger } from "../logging/logger";
import { invokeBoundedScheduler } from "./scheduler-client";
import { invokeBoundedWorker } from "./worker-client";

export interface DispatchSummary {
  passes: number;
  totalProcessed: number;
  error?: string;
}

/**
 * Dispatches bounded execution passes for newly queued or recovered runs.
 * Execution is durable and runs with an independent timeout controller,
 * ensuring execution is never aborted if the browser client disconnects.
 */
export async function dispatchExecutionPass(params: {
  runId: string;
  requestId: string;
  maxPasses?: number;
  timeoutMs?: number;
}): Promise<DispatchSummary> {
  const started = Date.now();
  const maxPasses = Math.min(5, Math.max(1, params.maxPasses ?? 3));
  const timeoutMs = Math.min(50_000, Math.max(5_000, params.timeoutMs ?? 35_000));
  let totalProcessed = 0;
  let passes = 0;

  CommandCenterLogger.info("Execution dispatch started", {
    runId: params.runId,
    requestId: params.requestId,
    maxPasses,
    timeoutMs,
  });

  // Dedicated server-side AbortController independent of the browser connection
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    for (let i = 0; i < maxPasses; i++) {
      if (controller.signal.aborted) {
        break;
      }

      passes++;

      // 1. Advance scheduler: transition pending ready steps to queued
      await invokeBoundedScheduler(params.requestId, controller.signal);

      // 2. Advance worker: claim and execute queued steps (single-consumer via FOR UPDATE SKIP LOCKED)
      const workerResult = await invokeBoundedWorker(
        params.requestId,
        controller.signal,
        { limit: 5 },
      );

      totalProcessed += workerResult.processed;

      // If no steps were ready/processed in this pass, queue is empty or awaiting async resolution
      if (workerResult.processed === 0) {
        break;
      }
    }

    const durationMs = Date.now() - started;
    CommandCenterLogger.info("Execution dispatch completed", {
      runId: params.runId,
      requestId: params.requestId,
      passes,
      totalProcessed,
      durationMs,
    });

    return { passes, totalProcessed };
  } catch (error) {
    const durationMs = Date.now() - started;
    const errorMessage = error instanceof Error ? error.message : "dispatch failed";
    CommandCenterLogger.warn("Execution dispatch encountered error (job remains durable in database)", {
      runId: params.runId,
      requestId: params.requestId,
      passes,
      totalProcessed,
      durationMs,
      error: errorMessage,
    });

    return { passes, totalProcessed, error: errorMessage };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Schedules a decoupled execution pass that executes independently of the browser SSE stream.
 * Uses Next.js after() when available in request context, or a background promise.
 */
export function scheduleDecoupledDispatch(params: {
  runId: string;
  requestId: string;
  maxPasses?: number;
}): void {
  const runDispatch = async () => {
    try {
      await dispatchExecutionPass({
        runId: params.runId,
        requestId: params.requestId,
        maxPasses: params.maxPasses,
      });
    } catch (error) {
      CommandCenterLogger.error("Decoupled execution dispatch failed (recovery cron will process remaining steps)", {
        runId: params.runId,
        requestId: params.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  try {
    // Attempt to register with Next.js after() to keep serverless function alive post-stream
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nextServer = require("next/server");
    if (typeof nextServer.after === "function") {
      nextServer.after(runDispatch);
      return;
    }
  } catch {
    // next/server after is not available in non-Next.js or test runtime
  }

  // Fallback: decoupled Promise
  Promise.resolve().then(runDispatch);
}
