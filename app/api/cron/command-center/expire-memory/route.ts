import { runBoundedCron } from "@/lib/command-center/production/cron-runtime";
import { expireMemory } from "@/lib/command-center/production/background-jobs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export function GET(req: Request) {
  return runBoundedCron(req, "expire-memory", expireMemory);
}
