import { runBoundedCron } from "@/lib/command-center/production/cron-runtime";
import { cleanArtifacts } from "@/lib/command-center/production/background-jobs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export function GET(req: Request) {
  return runBoundedCron(req, "clean-artifacts", cleanArtifacts);
}
