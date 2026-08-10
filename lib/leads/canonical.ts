import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type CanonicalLeadInput={businessName:string;contactName?:string;contactTitle?:string;email?:string;phone?:string;websiteUrl?:string;linkedinUrl?:string;instagramUrl?:string;city?:string;state?:string;country?:string;source:string;sourceTool?:string;sourceUrl?:string;priority?:string;status?:string;notes?:string;customFields?:Record<string,unknown>;createdBy?:string;createdByEmployeeId?:string};
const clean=(value:unknown,max=500)=>typeof value==="string"?value.trim().slice(0,max):"";
export const normalizeEmail=(value:unknown)=>clean(value,320).toLowerCase()||null;
export const normalizePhone=(value:unknown)=>{const digits=clean(value,50).replace(/\D/g,"");return digits||null};
export const normalizeDomain=(value:unknown)=>{const raw=clean(value,500);if(!raw)return null;try{return new URL(/^https?:\/\//i.test(raw)?raw:`https://${raw}`).hostname.replace(/^www\./,"").toLowerCase()}catch{return null}};
const statuses=new Set(["new","contacted","engaged","qualified","disqualified"]);
const priorities=new Set(["low","medium","high","urgent"]);
const sources=new Set(["apify","instagram","import","manual_admin","employee_created","referral","website","linkedin","other"]);

export async function upsertCanonicalLead(organisationId:string,input:CanonicalLeadInput,options:{updateExisting?:boolean}={}){
  if(!organisationId)throw new Error("Organisation scope is required");
  const businessName=clean(input.businessName,240);if(!businessName)throw new Error("Company name is required");
  const email=normalizeEmail(input.email),phone=normalizePhone(input.phone),domain=normalizeDomain(input.websiteUrl);
  let candidates:any[]=[];
  if(email){const result=await supabaseAdmin.from("leads").select("*").eq("organisation_id",organisationId).eq("normalized_email",email).is("deleted_at",null).limit(2);if(result.error)throw result.error;candidates=result.data||[]}
  if(!candidates.length&&phone){const result=await supabaseAdmin.from("leads").select("*").eq("organisation_id",organisationId).eq("normalized_phone",phone).is("deleted_at",null).limit(2);if(result.error)throw result.error;candidates=result.data||[]}
  if(!candidates.length&&domain){const result=await supabaseAdmin.from("leads").select("*").eq("organisation_id",organisationId).eq("normalized_domain",domain).is("deleted_at",null).limit(2);if(result.error)throw result.error;candidates=result.data||[]}
  const row={organisation_id:organisationId,business_name:businessName,name:clean(input.contactName,240)||businessName,contact_name:clean(input.contactName,240)||null,contact_title:clean(input.contactTitle,160)||null,email,phone:clean(input.phone,50)||null,website_url:clean(input.websiteUrl)||null,linkedin_url:clean(input.linkedinUrl)||null,instagram_url:clean(input.instagramUrl)||null,city:clean(input.city,160)||null,state:clean(input.state,160)||null,country:clean(input.country,160)||null,source:sources.has(input.source)?input.source:"other",source_label:input.source,source_tool:clean(input.sourceTool,160)||null,source_url:clean(input.sourceUrl)||null,priority:priorities.has(input.priority||"")?input.priority:"medium",status:statuses.has(input.status||"")?input.status:"new",notes:clean(input.notes,5000)||null,custom_fields:input.customFields||{},created_by:input.createdBy||null,created_by_employee_id:input.createdByEmployeeId||null,normalized_email:email,normalized_phone:phone,normalized_domain:domain,updated_at:new Date().toISOString()};
  if(candidates.length===1){if(options.updateExisting===false)return{lead:candidates[0],outcome:"updated" as const};const result=await supabaseAdmin.from("leads").update(row).eq("id",candidates[0].id).eq("organisation_id",organisationId).select("*").single();if(result.error)throw result.error;return{lead:result.data,outcome:"updated" as const}}
  if(candidates.length>1){const result=await supabaseAdmin.from("leads").insert({...row,dedupe_review_required:true}).select("*").single();if(result.error)throw result.error;return{lead:result.data,outcome:"ambiguous" as const}}
  const result=await supabaseAdmin.from("leads").insert({...row,created_at:new Date().toISOString()}).select("*").single();if(result.error)throw result.error;return{lead:result.data,outcome:"created" as const}
}
