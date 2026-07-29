import { runGovernanceCron } from "@/lib/command-center/governance/cron";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export function GET(request: Request) {
  return runGovernanceCron(request, "/internal/v1/governance/cron/process-audit-outbox");
}
