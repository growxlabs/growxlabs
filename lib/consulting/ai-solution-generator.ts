import "server-only";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ConsultingHttpError } from "@/lib/consulting/workflow";

const arrayFields=["business_outcomes","opportunity_map","opportunities","automation_opportunities","software_opportunities","solution_options","human_in_loop","data_requirements","integration_requirements","roadmap","risks","recommendations"] as const;
const section=(properties:Record<string,unknown>)=>({type:"object",additionalProperties:false,properties,required:Object.keys(properties)});
const items=(properties:Record<string,unknown>)=>({type:"array",items:section(properties)});
const str={type:"string"};
const schema={type:"object",additionalProperties:false,properties:{
 executive_summary:section({content:str,currentState:str,transformationRationale:str}),
 business_outcomes:items({title:str,description:str,successMeasure:str}),
 opportunity_map:items({area:str,observedCondition:str,improvementPotential:str,evidence:str}),
 opportunities:items({title:str,problem:str,proposedApproach:str,expectedImpact:str,priority:str,evidence:str}),
 automation_opportunities:items({title:str,currentProcess:str,automationPotential:str,humanControl:str,expectedImpact:str}),
 software_opportunities:items({title:str,businessNeed:str,solutionConcept:str,users:str,expectedImpact:str}),
 solution_options:items({title:str,description:str,benefits:str,tradeoffs:str}),
 human_in_loop:items({workflow:str,aiRole:str,humanRole:str,control:str}),
 data_requirements:items({requirement:str,purpose:str,currentAvailability:str,validationNeeded:str}),
 integration_requirements:items({system:str,requirement:str,notes:str}),
 roadmap:items({phase:str,objective:str,deliverables:str,dependencies:str}),
 risks:items({risk:str,impact:str,mitigation:str}),
 recommendations:items({title:str,rationale:str,nextStep:str})
},required:["executive_summary",...arrayFields]};

export async function generateAiSolutionContent(reportId:string,actorId:string){
 if(!process.env.OPENROUTER_API_KEY)throw new ConsultingHttpError(503,"AI generation is not configured. Please contact the system administrator.");
 const {data:report,error}=await supabaseAdmin.from("ai_solution_reports").select("*").eq("id",reportId).maybeSingle();
 if(error)throw new Error(error.message);if(!report)throw new ConsultingHttpError(404,"AI Solution Report not found.");
 if(["approved_internal","ready_for_client","shared","client_reviewed","client_acknowledged","closed","archived"].includes(report.status))throw new ConsultingHttpError(409,"Approved or client-visible reports cannot be regenerated.");
 const {data:audit,error:auditError}=await supabaseAdmin.from("business_technical_audits").select("*").eq("id",report.audit_id).maybeSingle();
 if(auditError)throw new Error(auditError.message);if(!audit)throw new ConsultingHttpError(404,"The source audit could not be found.");
 const client=new OpenAI({baseURL:"https://openrouter.ai/api/v1",apiKey:process.env.OPENROUTER_API_KEY});
 const preferredModel=process.env.OPENROUTER_MODEL||"openai/gpt-4o-mini";
 let raw:string|undefined,model=preferredModel,usedFallback=false;
 try{raw=await requestReport(client,preferredModel,audit,true)}
 catch(error){
   if(!isCreditError(error))throw friendlyProviderError(error);
   model="openrouter/free";usedFallback=true;
   try{raw=await requestReport(client,model,audit,false,true)}catch{raw=undefined}
 }
 let parsed=parseReport(raw);
 if(!parsed){parsed=evidenceDraft(audit);model="evidence-based-fallback";usedFallback=true}
 const content=normalize(parsed);
 const saved=await supabaseAdmin.from("ai_solution_reports").update({...content,status:"internal_review",updated_at:new Date().toISOString()}).eq("id",reportId).select("*").single();
 if(saved.error)throw new Error(saved.error.message);
 await Promise.all([
  supabaseAdmin.from("consulting_document_activity").insert({document_type:"ai_solution_report",document_id:reportId,actor_id:actorId,actor_type:"admin",event_type:"ai_report_generated",metadata:{model,provider:model==="evidence-based-fallback"?"local":"openrouter",creditFallback:usedFallback}}),
  supabaseAdmin.from("consulting_document_versions").upsert({document_type:"ai_solution_report",document_id:reportId,version:report.version,snapshot:saved.data,created_by:actorId},{onConflict:"document_type,document_id,version"})
 ]);
 return saved.data;
}

async function requestReport(client:OpenAI,model:string,audit:Record<string,unknown>,strict:boolean,compact=false){
 const response=await client.chat.completions.create({
  model,temperature:0.2,max_tokens:strict?3500:2500,
  response_format:strict?{type:"json_schema",json_schema:{name:"growxlabs_ai_solution_report",strict:true,schema}}:{type:"json_object"},
  messages:[
   {role:"system",content:`You are a senior GrowXLabs business and AI transformation consultant. Return one valid JSON object only, without markdown fences or commentary. Produce a concise professional report using only source-audit facts. Do not invent metrics, systems, budgets, integrations, or findings. Use empty arrays when evidence is insufficient. Required top-level keys: executive_summary, business_outcomes, opportunity_map, opportunities, automation_opportunities, software_opportunities, solution_options, human_in_loop, data_requirements, integration_requirements, roadmap, risks, recommendations.${compact?" Limit every array to at most two concise items and keep the entire response under 2500 tokens.":""}`},
   {role:"user",content:`Create the structured AI Opportunity & Solution Report from this audit: ${JSON.stringify(prune(audit))}`}
  ]
 },{signal:AbortSignal.timeout(strict?10000:35000)});
 return response.choices[0]?.message?.content||undefined;
}
function normalize(value:Record<string,unknown>){const summary=value.executive_summary;const result:Record<string,unknown>={executive_summary:typeof summary==="object"&&summary!==null?summary:{content:String(summary||"Consultant review required."),currentState:"Validation required.",transformationRationale:"Validation required."}};for(const key of arrayFields)result[key]=Array.isArray(value[key])?value[key]:[];return result}
function parseReport(raw:string|undefined){
 if(!raw)return null;
 const cleaned=raw.trim().replace(/^\`\`\`(?:json)?\s*/i,"").replace(/\s*\`\`\`$/,"");
 const start=cleaned.indexOf("{"),end=cleaned.lastIndexOf("}");
 if(start<0||end<=start)return null;
 const candidate=cleaned.slice(start,end+1).replace(/,\s*([}\]])/g,"$1");
 try{const value=JSON.parse(candidate);return value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:null}catch{return null}
}
function evidenceDraft(audit:Record<string,unknown>):Record<string,unknown>{
 const executive=readable(audit.executive_summary)||readable(audit.organisation_business_context)||"The source audit has been reviewed and requires consultant validation before client release.";
 const current=readable(audit.current_operating_model)||readable(audit.technology_landscape)||"Current-state details are recorded in the source Business & Technical Audit.";
 const findings=list(audit.confirmed_business_findings);
 const opportunities=list(audit.ai_automation_opportunities);
 return {
  executive_summary:{content:executive,currentState:current,transformationRationale:"The source audit indicates opportunities for structured process, data, automation, and software improvement. Recommendations require consultant validation."},
  business_outcomes:findings.map((item,index)=>({title:`Validated business outcome ${index+1}`,description:item,successMeasure:"Define a measurable baseline and target during consultant review."})),
  opportunity_map:opportunities.map((item,index)=>({area:`Opportunity area ${index+1}`,observedCondition:item,improvementPotential:"Validate the improvement opportunity with business stakeholders.",evidence:"Source Business & Technical Audit."})),
  opportunities:opportunities.map((item,index)=>({title:`AI opportunity ${index+1}`,problem:item,proposedApproach:"Assess an AI-assisted workflow with explicit human review.",expectedImpact:"To be validated during solution design.",priority:"Consultant review required.",evidence:"Source Business & Technical Audit."})),
  automation_opportunities:[],software_opportunities:[],solution_options:[],human_in_loop:[],data_requirements:[],integration_requirements:[],roadmap:[],
  risks:[{risk:"Insufficient validated implementation detail",impact:"Premature solution decisions may not match operational requirements.",mitigation:"Complete consultant review and stakeholder validation before approval."}],
  recommendations:[{title:"Complete consultant validation",rationale:"This draft was assembled from source-audit evidence because the external AI provider was unavailable or returned an incomplete response.",nextStep:"Review each section, confirm priorities, and regenerate when AI capacity is available if deeper recommendations are required."}]
 };
}
function list(value:unknown){if(Array.isArray(value))return value.map(readable).filter(Boolean).slice(0,5);const text=readable(value);return text?[text]:[]}
function readable(value:unknown):string{if(value==null)return "";if(typeof value==="string")return value;if(Array.isArray(value))return value.map(readable).filter(Boolean).join("; ");if(typeof value==="object")return Object.values(value as Record<string,unknown>).map(readable).filter(Boolean).join(" ");return String(value)}
function prune(value:unknown):unknown{if(Array.isArray(value))return value.map(prune);if(!value||typeof value!=="object")return value;return Object.fromEntries(Object.entries(value as Record<string,unknown>).filter(([key])=>!["id","created_at","updated_at","created_by","approved_by"].includes(key)).map(([key,item])=>[key,prune(item)]))}
function isCreditError(error:unknown){return error instanceof OpenAI.APIError&&(error.status===402||/credit|max_tokens|afford/i.test(error.message))}
function friendlyProviderError(error:unknown){if(error instanceof OpenAI.APIError){if(error.status===401)return new ConsultingHttpError(503,"AI authentication failed. Please contact the system administrator.");if(error.status===429)return new ConsultingHttpError(503,"The AI service is temporarily busy. Please try again shortly.");return new ConsultingHttpError(502,"The AI report could not be generated right now. Please try again.");}return error}
