export type AuditRecord=Record<string,any>;
const empty=(value:unknown)=>value==null||value===""||(Array.isArray(value)&&value.length===0)||(typeof value==="object"&&!Array.isArray(value)&&Object.keys(value as object).length===0);
const acronyms:Record<string,string>={ai:"AI",seo:"SEO",aeo:"AEO",geo:"GEO",crm:"CRM",erp:"ERP",api:"API",url:"URL",whatsapp:"WhatsApp"};
const knownValues:Record<string,string>={manual_using_excel_and_whatsapp:"Manual — Excel and WhatsApp",starting_seo:"Starting SEO"};
export function formatAuditLabel(value:string){return value.replace(/([a-z])([A-Z])/g,"$1 $2").replace(/[_-]+/g," ").trim().split(/\s+/).map(word=>acronyms[word.toLowerCase()]||word.charAt(0).toUpperCase()+word.slice(1).toLowerCase()).join(" ");}
export function formatAuditScalar(value:unknown):string{if(typeof value==="boolean")return value?"Yes":"No";if(typeof value==="number")return String(value);if(typeof value!=="string")return "";const clean=value.trim();if(!clean)return "";if(knownValues[clean])return knownValues[clean];if(clean.includes("_")&&!clean.includes(" "))return formatAuditLabel(clean);return clean.replace(/\s+,/g,",").replace(/,\s*/g,", ").trim();}
export function auditEntries(value:unknown){if(!value||typeof value!=="object"||Array.isArray(value))return[];return Object.entries(value as AuditRecord).filter(([,item])=>!empty(item)).map(([key,item])=>({key,label:formatAuditLabel(key),value:item}));}
export function auditItems(value:unknown):unknown[]{if(empty(value))return[];return Array.isArray(value)?value:[value];}
export function displayValue(value:unknown):string{if(Array.isArray(value))return value.map(item=>typeof item==="string"&&/^[a-z0-9_-]+$/.test(item)?formatAuditLabel(item):formatAuditScalar(item)).filter(Boolean).join(" · ");return formatAuditScalar(value);}
export function isEmptyAuditValue(value:unknown){return empty(value);}
export function companyName(audit:AuditRecord){const b=audit.business_overview||{};return formatAuditScalar(b.business_name||b.company_name||b.company||b.organisation_name)||"Client organisation";}
export const approvedAudit=(status:string)=>["approved_internal","Ready for Client","Shared","Client Reviewed","Closed"].includes(status);
