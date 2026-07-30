import { runBoundedCron } from "@/lib/command-center/production/cron-runtime";
import { processEvents } from "@/lib/command-center/production/background-jobs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export function GET(req: Request) {
  return runBoundedCron(req, "process-events", processEvents);
}
