import { invokeBoundedScheduler } from "@/lib/command-center/execution/scheduler-client";
import { invokeBoundedWorker } from "@/lib/command-center/execution/worker-client";
import { runBoundedCron } from "@/lib/command-center/production/cron-runtime";
import { requestIdFrom } from "@/lib/command-center/production/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export function GET(request: Request): Promise<Response> {
  const requestId = requestIdFrom(request);
  return runBoundedCron(request, "recover-execution", async (signal) => {
    await invokeBoundedScheduler(requestId, signal);
    const workerResult = await invokeBoundedWorker(requestId, signal, { limit: 10 });
    const hasError = Boolean(workerResult.error);
    const stepsProcessed = workerResult.processed;
    const stepsSucceeded = hasError ? Math.max(0, stepsProcessed - 1) : stepsProcessed;
    const stepsFailed = hasError ? 1 : 0;

    return {
      schedulerInvoked: true,
      schedulerSucceeded: true,
      processed: stepsProcessed,
      succeeded: stepsSucceeded,
      failed: stepsFailed,
      checkpoint: null,
      workerStepsProcessed: stepsProcessed,
      workerStepsSucceeded: stepsSucceeded,
      workerStepsFailed: stepsFailed,
    };
  });
}

export function POST(request: Request): Promise<Response> {
  return GET(request);
}

