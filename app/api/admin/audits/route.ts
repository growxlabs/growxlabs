import { z } from "zod";
import { createAudit,auditError,requireAuditAdmin } from "@/lib/audits/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
const schema=z.object({discoveryMeetingId:z.string().uuid()});
export async function GET(){try{await requireAuditAdmin();const {data,error}=await supabaseAdmin.from("business_technical_audits").select("id,audit_number,status,version,assessment_id,discovery_meeting_id,client_id,company_id,created_at,updated_at").order("updated_at",{ascending:false});if(error)throw new Error(error.message);return Response.json({audits:data||[]});}catch(error){return auditError(error);}}
export async function POST(request:Request){try{const admin=await requireAuditAdmin();const parsed=schema.safeParse(await request.json());if(!parsed.success)return Response.json({error:"Discovery meeting is required."},{status:400});return Response.json({audit:await createAudit(parsed.data,admin.userId)},{status:201});}catch(error){return auditError(error);}}
