import { invokeBoundedScheduler } from "@/lib/command-center/execution/scheduler-client";
import { runBoundedCron } from "@/lib/command-center/production/cron-runtime";
import { requestIdFrom } from "@/lib/command-center/production/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export function GET(request: Request): Promise<Response> {
  const requestId = requestIdFrom(request);
  return runBoundedCron(request, "recover-execution", async (signal) => {
    await invokeBoundedScheduler(requestId, signal);
    return { processed: 1, succeeded: 1, failed: 0, checkpoint: null };
  });
}
