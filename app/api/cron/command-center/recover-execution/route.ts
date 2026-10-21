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
    const totalProcessed = 1 + workerResult.processed;
    const hasError = Boolean(workerResult.error);

    return {
      processed: totalProcessed,
      succeeded: hasError ? 1 : totalProcessed,
      failed: hasError ? 1 : 0,
      checkpoint: null,
      workerStepsProcessed: workerResult.processed,
    };
  });
}

export function POST(request: Request): Promise<Response> {
  return GET(request);
}

