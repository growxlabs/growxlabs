"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CircleAlert, ClipboardCheck, Clock3, UploadCloud } from "lucide-react";

type Task={id:string;title:string;description?:string;taskType:string;status:string;required:boolean;dueAt?:string};
type Instance={id:string;status:string;targetStartDate:string;tasks:Task[]};
async function api(path:string,init?:RequestInit){const response=await fetch(`/api/v1/hrms/onboarding${path}`,init);const body=response.status===204?null:await response.json();if(!response.ok)throw new Error(body?.detail||body?.error||"Request failed");return body}

export default function EmployeeOnboarding(){
  const client=useQueryClient();
  const query=useQuery<Instance>({queryKey:["my-onboarding"],queryFn:()=>api("/instances/me")});
  async function submit(task:Task){
    let data:Record<string,unknown>={};
    if(task.taskType==="information"){
      const value=window.prompt(`Enter ${task.title.toLowerCase()}`);
      if(value===null)return;
      data={value};
      const title=task.title.toLowerCase();
      const kind=title.includes("bank")?"banking":title.includes("emergency")?"emergency_contact":title.includes("address")?"address":title.includes("tax")?"tax":"personal";
      await api(`/instances/${query.data!.id}/sensitive-information`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind,payload:data})});
    }
    await api(`/tasks/${task.id}/submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data})});
    await api(`/tasks/${task.id}/complete`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({decision:"completed"})});
    await client.invalidateQueries({queryKey:["my-onboarding"]});
  }
  async function upload(task:Task,file:File){
    const digest=await crypto.subtle.digest("SHA-256",await file.arrayBuffer());
    const checksum=Array.from(new Uint8Array(digest)).map(value=>value.toString(16).padStart(2,"0")).join("");
    const signed=await api(`/tasks/${task.id}/document-upload-url`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:file.name,contentType:file.type||"application/octet-stream",sizeBytes:file.size,checksumSHA256:checksum})});
    const response=await fetch(signed.uploadUrl,{method:signed.method||"PUT",headers:signed.headers||{"Content-Type":file.type},body:file});
    if(!response.ok)throw new Error("Document upload failed");
    if(task.title.toLowerCase().includes("identity"))await api(`/instances/${query.data!.id}/identity-verifications`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({documentType:"pan",documentID:signed.documentId,identifierCiphertext:"collected-via-secure-document"})});
    await submit(task);
  }
  if(query.isLoading)return <div className="mx-auto mt-24 h-96 max-w-4xl animate-pulse rounded-2xl bg-[var(--surface-2)]"/>;
  if(query.isError||!query.data)return <div className="mx-auto mt-24 max-w-xl py-20 text-center"><ClipboardCheck className="mx-auto"/><h1 className="mt-4 text-2xl font-black">No onboarding checklist yet</h1></div>;
  const tasks=query.data.tasks.filter(task=>task.status!=="waived"),completed=tasks.filter(task=>task.status==="completed").length,progress=tasks.length?Math.round(completed/tasks.length*100):100;
  return <main className="mx-auto max-w-5xl space-y-7 px-5 py-12"><header><div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#0075de]">My onboarding</div><h1 className="mt-2 text-3xl font-black">Welcome to the team</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">Complete required steps before your start date on {new Date(query.data.targetStartDate).toLocaleDateString()}.</p><div className="mt-6 h-3 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full bg-[#0075de]" style={{width:`${progress}%`}}/></div><p className="mt-2 text-xs font-bold">{progress}% complete</p></header><div className="grid gap-3 md:grid-cols-2">{tasks.map(task=><article key={task.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-5"><div className="flex items-start gap-3">{task.status==="completed"?<CheckCircle2 className="text-emerald-600"/>:task.status==="blocked"?<CircleAlert className="text-amber-500"/>:<Clock3 className="text-[#0075de]"/>}<div className="flex-1"><h2 className="text-sm font-black">{task.title}</h2><p className="mt-1 text-[10px] text-[var(--text-muted)]">{task.description||task.taskType}</p>{task.dueAt&&<p className="mt-3 text-[9px] font-bold">Due {new Date(task.dueAt).toLocaleDateString()}</p>}</div></div>{!["completed","blocked"].includes(task.status)&&task.taskType==="document_upload"?<label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0075de] py-2 text-[10px] font-bold text-white"><UploadCloud size={12}/>Upload document<input type="file" className="hidden" onChange={event=>{const file=event.target.files?.[0];if(file)void upload(task,file)}}/></label>:!["completed","blocked"].includes(task.status)&&<button onClick={()=>void submit(task)} className="mt-4 w-full rounded-lg bg-[#0075de] py-2 text-[10px] font-bold text-white">Complete task</button>}</article>)}</div></main>
}
