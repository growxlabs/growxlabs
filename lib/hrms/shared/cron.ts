import { HRMSError } from "./context";
export function requireCron(request:Request){
  const secret=process.env.CRON_SECRET;
  if(!secret)throw new HRMSError(503,"cron_not_configured","CRON_SECRET is not configured");
  if(request.headers.get("authorization")!==`Bearer ${secret}`)throw new HRMSError(401,"invalid_cron_token","Invalid cron authorization");
}
export function boundedLimit(request:Request){const raw=Number(new URL(request.url).searchParams.get("limit")||100);return Math.min(500,Math.max(1,Number.isFinite(raw)?Math.floor(raw):100))}
