import "server-only";
import { z } from "zod";

const EmployeeOSProductionSchema=z.object({
  NEXTAUTH_SECRET:z.string().min(32),NEXTAUTH_URL:z.literal("https://growxlabs.tech"),
  NEXT_PUBLIC_SUPABASE_URL:z.string().url(),SUPABASE_SERVICE_ROLE_KEY:z.string().min(20),
  DEFAULT_ORGANISATION_ID:z.uuid(),HRMS_GATEWAY_URL:z.string().url(),HRMS_BFF_SHARED_SECRET:z.string().min(32),
  RESEND_API_KEY:z.string().min(8),RESEND_FROM_EMAIL:z.string().min(3).optional(),NEXT_PUBLIC_SENTRY_DSN:z.string().url().optional(),
});
export type EmployeeOSConfiguration={ready:boolean;missing:string[];invalid:string[];optionalMissing:string[]};
export function validateEmployeeOSProductionConfiguration(source:NodeJS.ProcessEnv=process.env):EmployeeOSConfiguration{
  if((source.APP_ENV||source.VERCEL_ENV||"development")==="development")return{ready:true,missing:[],invalid:[],optionalMissing:[]};
  const parsed=EmployeeOSProductionSchema.safeParse(source);if(parsed.success)return{ready:true,missing:[],invalid:[],optionalMissing:source.NEXT_PUBLIC_SENTRY_DSN?[]:["NEXT_PUBLIC_SENTRY_DSN"]};
  const missing=new Set<string>(),invalid=new Set<string>();for(const issue of parsed.error.issues){const key=String(issue.path[0]);if(!source[key])missing.add(key);else invalid.add(key)}return{ready:false,missing:[...missing].sort(),invalid:[...invalid].sort(),optionalMissing:source.NEXT_PUBLIC_SENTRY_DSN?[]:["NEXT_PUBLIC_SENTRY_DSN"]};
}
