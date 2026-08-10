import crypto from "node:crypto";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { generateOfferPdf, missingOfferInputs, type OfferSnapshot } from "@/lib/recruitment/offer-letter";
import { sendRecruitmentEmail } from "@/lib/recruitment/email-service";

const input=z.discriminatedUnion("action",[
  z.object({action:z.literal("approve")}),
  z.object({action:z.literal("issue")}),
  z.object({action:z.literal("record_offline_acceptance"),acceptedAt:z.iso.datetime(),evidenceReference:z.string().trim().min(3),note:z.string().trim().min(3)})
]);
async function actor(request:Request){const token=await getToken({req:request as any,secret:process.env.NEXTAUTH_SECRET});if(!token?.sub||!['ADMIN','HR','RECRUITER'].includes(String(token.role).toUpperCase()))return null;return {id:token.sub,role:String(token.role).toUpperCase()}}
const safe=(value:string)=>value.replace(/[^a-zA-Z0-9._-]+/g,"-").slice(0,100);
const offerBucket="hrms-documents";
async function ensureOfferBucket(){const existing=await supabaseAdmin.storage.getBucket(offerBucket);if(!existing.error)return;const created=await supabaseAdmin.storage.createBucket(offerBucket,{public:false,allowedMimeTypes:["application/pdf"],fileSizeLimit:10*1024*1024});if(created.error&&!/already exists|duplicate/i.test(created.error.message))throw new Error(created.error.message)}

export async function GET(request:Request,{params}:{params:Promise<{offerId:string}>}){const user=await actor(request);if(!user)return Response.json({error:'Access denied'},{status:403});const {offerId}=await params;const offer=await supabaseAdmin.schema('recruitment').from('offers').select('document_id,title').eq('id',offerId).eq('organisation_id',CAREERS_ORGANISATION).maybeSingle();if(!offer.data?.document_id)return Response.json({error:'Offer document is unavailable'},{status:404});const version=await supabaseAdmin.schema('documents').from('versions').select('storage_object_key').eq('document_id',offer.data.document_id).order('version',{ascending:false}).limit(1).maybeSingle();if(!version.data)return Response.json({error:'Offer document is unavailable'},{status:404});const signed=await supabaseAdmin.storage.from('hrms-documents').createSignedUrl(version.data.storage_object_key,300,{download:`${safe(offer.data.title||'GrowXLabs-Offer')}.pdf`});if(signed.error)return Response.json({error:'Download could not be prepared'},{status:500});return Response.redirect(signed.data.signedUrl,302)}

export async function PATCH(request:Request,{params}:{params:Promise<{offerId:string}>}){
  const user=await actor(request);if(!user)return Response.json({error:"Access denied"},{status:403});
  const parsed=input.safeParse(await request.json());if(!parsed.success)return Response.json({error:"Invalid offer action",details:parsed.error.flatten()},{status:400});
  const {offerId}=await params;
  const offer=await supabaseAdmin.schema("recruitment").from("offers").select("id,application_id,candidate_id,employee_id,job_id,status,current_version,expires_at").eq("id",offerId).eq("organisation_id",CAREERS_ORGANISATION).maybeSingle();
  if(offer.error||!offer.data)return Response.json({error:"Offer not found"},{status:404});
  if(parsed.data.action==='approve'){
    if(offer.data.status!=='draft')return Response.json({error:"Only a draft can be approved"},{status:409});
    const updated=await supabaseAdmin.schema("recruitment").from("offers").update({status:'approved',updated_at:new Date().toISOString()}).eq("id",offerId).eq("status",'draft');
    if(updated.error)return Response.json({error:"Offer approval failed"},{status:500});return Response.json({status:'approved'});
  }
  if(parsed.data.action==='record_offline_acceptance'){
    if(user.role!=='ADMIN')return Response.json({error:"Only an Admin can record offline acceptance"},{status:403});
    if(!['issued','sent'].includes(offer.data.status))return Response.json({error:"Issue the formal offer before recording acceptance"},{status:409});
    const accepted=new Date(parsed.data.acceptedAt);if(accepted.getTime()>Date.now())return Response.json({error:"Acceptance date cannot be in the future"},{status:400});
    await supabaseAdmin.schema("recruitment").from("candidate_offer_responses").insert({organisation_id:CAREERS_ORGANISATION,offer_id:offerId,application_id:offer.data.application_id,candidate_email:offer.data.candidate_id,decision:'accepted',notes:`Offline evidence: ${parsed.data.evidenceReference}. ${parsed.data.note}`,responded_at:parsed.data.acceptedAt});
    await supabaseAdmin.schema("recruitment").from("offers").update({status:'accepted',accepted_at:parsed.data.acceptedAt,updated_at:new Date().toISOString()}).eq("id",offerId);
    await supabaseAdmin.schema("recruitment").from("offer_audit").insert({organisation_id:CAREERS_ORGANISATION,offer_id:offerId,action:'offline_acceptance_recorded',actor_user_id:user.id,reason:parsed.data.note,evidence_reference:parsed.data.evidenceReference,metadata:{acceptedAt:parsed.data.acceptedAt}});
    return Response.json({status:'accepted'});
  }
  if(offer.data.status!=='approved')return Response.json({error:"Offer must be reviewed and approved before issue"},{status:409});
  if(offer.data.expires_at&&new Date(offer.data.expires_at)<=new Date())return Response.json({error:"Offer validity has expired. Create a new version."},{status:409});
  const version=await supabaseAdmin.schema("recruitment").from("offer_versions").select("id,snapshot").eq("offer_id",offerId).eq("version",offer.data.current_version).maybeSingle();
  if(version.error||!version.data)return Response.json({error:"Immutable offer version is missing"},{status:409});
  const snapshot=version.data.snapshot as OfferSnapshot;const missing=missingOfferInputs(snapshot);if(missing.length)return Response.json({error:"Required Admin inputs or approved template wording are missing",missingAdminInputs:missing},{status:409});
  const issuedAt=new Date();const pdf=generateOfferPdf(snapshot,issuedAt);const objectKey=`offers/${CAREERS_ORGANISATION}/${offerId}/v${offer.data.current_version}-${safe(snapshot.candidateName)}.pdf`;
  try{await ensureOfferBucket()}catch(error){return Response.json({error:"Offer PDF storage is unavailable",detail:error instanceof Error?error.message:"Storage bucket could not be prepared"},{status:500})}
  const stored=await supabaseAdmin.storage.from(offerBucket).upload(objectKey,pdf.bytes,{contentType:'application/pdf',upsert:false});if(stored.error)return Response.json({error:"Offer PDF could not be stored",detail:stored.error.message},{status:500});
  let documentId:string|null=null;
  const category=await supabaseAdmin.schema("documents").from("categories").upsert({organisation_id:CAREERS_ORGANISATION,name:'Employment documents'},{onConflict:'organisation_id,name'}).select('id').single();
  const document=await supabaseAdmin.schema("documents").from("documents").insert({organisation_id:CAREERS_ORGANISATION,category_id:category.data?.id||null,owner_entity_type:offer.data.employee_id?'employee':'offer',owner_entity_id:offer.data.employee_id||offerId,name:`Offer of Employment - ${snapshot.title}.pdf`}).select('id').single();
  if(document.data){documentId=document.data.id;await supabaseAdmin.schema("documents").from("versions").insert({organisation_id:CAREERS_ORGANISATION,document_id:documentId,version:1,storage_object_key:objectKey,content_type:'application/pdf',size_bytes:pdf.bytes.length,checksum_sha256:pdf.checksum,uploaded_by:user.id});}
  if(!documentId)return Response.json({error:'Offer document metadata could not be recorded'},{status:500});
  const documentPath=`/api/v1/candidate/offers/${offerId}/document`;
  await supabaseAdmin.schema("recruitment").from("offers").update({status:'sent',issued_at:issuedAt.toISOString(),document_id:documentId,offer_letter_document_id:documentId,offer_letter_url:documentPath,updated_at:issuedAt.toISOString()}).eq("id",offerId);
  await supabaseAdmin.schema("recruitment").from("offer_audit").insert({organisation_id:CAREERS_ORGANISATION,offer_id:offerId,action:'offer_issued',actor_user_id:user.id,metadata:{version:offer.data.current_version,checksum:pdf.checksum}});
  const application=await supabaseAdmin.schema("recruitment").from("careers_applications").select("profile,application_reference").eq("id",offer.data.application_id).single();const email=String(application.data?.profile?.email||offer.data.candidate_id);
  const emailResult=await sendRecruitmentEmail({to:email,subject:`Offer of Employment — ${snapshot.title} | GrowXLabs`,templateKey:'offer_extended',applicationId:offer.data.application_id,candidateId:offer.data.candidate_id,jobId:offer.data.job_id,html:`<p>Dear ${snapshot.candidateName},</p><p>GrowXLabs is pleased to share your formal offer for <strong>${snapshot.title}</strong>.</p><p>Proposed joining date: <strong>${new Date(snapshot.joiningDate).toLocaleDateString('en-IN')}</strong></p><p><a href="https://growxlabs.tech/careers/portal" style="display:inline-block;padding:12px 20px;background:#087be6;color:#fff;text-decoration:none;border-radius:6px">View Offer</a></p><p>Please sign in with the same email address to review and respond.</p>`});
  return Response.json({status:'sent',documentId,emailSent:emailResult.success,emailError:emailResult.error||null});
}
