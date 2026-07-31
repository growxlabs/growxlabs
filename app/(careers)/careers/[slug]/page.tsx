import type { Metadata } from "next";
import JobDetailClient from "./JobDetailClient";

async function getJob(slug:string){const base=process.env.HRMS_GATEWAY_URL,organisationId=process.env.DEFAULT_ORGANISATION_ID;if(!base||!organisationId)return null;const response=await fetch(`${base.replace(/\/$/,"")}/v1/recruitment/public/jobs/${encodeURIComponent(slug)}?organisationId=${encodeURIComponent(organisationId)}`,{next:{revalidate:60}});if(!response.ok)return null;return response.json()}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params,job=await getJob(slug);return job?{title:`${job.title} | Careers at GrowX Labs`,description:job.summary,alternates:{canonical:`/careers/${slug}`},openGraph:{title:job.title,description:job.summary,type:"website"}}:{title:"Role not found | GrowX Labs"}}
export default async function JobDetailPage({params}:{params:Promise<{slug:string}>}){const{slug}=await params,job=await getJob(slug);return <JobDetailClient job={job}/>}
