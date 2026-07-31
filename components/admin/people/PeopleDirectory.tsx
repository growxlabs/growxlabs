"use client";

import { useMemo, useState } from "react";
import {
  Building2, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, Filter,
  MapPin, Network, Plus, Search, ShieldCheck, SlidersHorizontal, Users, X,
} from "lucide-react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { peopleQueryKeys } from "@/lib/people/api";

type Employee = {
  id: string; employeeNumber: string; name: string; email: string; department: string;
  designation: string; manager: string; employmentType: string; status: string; workLocation: string;
};
type EmployeeDocument={id:string;name:string;contentType:string;sizeBytes:number;createdAt:string};
type EmployeeEvent={id:string;event_type?:string;action?:string;recorded_at?:string;occurred_at?:string;actor_user_id:string};
type DirectoryResponse={items:Employee[];page:number;pageSize:number;total:number};

function initials(name: string) { return name.split(" ").map((part) => part[0]).slice(0,2).join(""); }

export default function PeopleDirectory() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [page,setPage]=useState(1);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [profileTab,setProfileTab]=useState("Overview");
  const [documents,setDocuments]=useState<EmployeeDocument[]>([]);
  const [documentsLoading,setDocumentsLoading]=useState(false);
  const [events,setEvents]=useState<EmployeeEvent[]>([]);
  const [uploading,setUploading]=useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [form, setForm] = useState({employeeNumber:"",firstName:"",lastName:"",joiningDate:"",employmentType:"Full-time",workLocation:"",status:"active"});
  const employeeFilters = { query, department, page };
  const {data:directory,isLoading:loading,isError:serviceOffline,refetch:refetchEmployees}=useQuery<DirectoryResponse>({
    queryKey:peopleQueryKeys.employees(employeeFilters),
    queryFn:async()=>{const parameters=new URLSearchParams({page:String(page),pageSize:"20"});if(query)parameters.set("q",query);if(department!=="All departments")parameters.set("department",department);const response=await fetch(`/api/v1/hrms/people/employees?${parameters}`);const data=await response.json();if(!response.ok){const error=data?.error;throw new Error(typeof error==="object"?error.message:data.detail||error||"Employees could not be loaded.")}return data},
    staleTime:30_000,
    retry:2,
    refetchOnWindowFocus:false,
  });
  const createMutation=useMutation({
    mutationFn:async()=>{const response=await fetch("/api/v1/hrms/people/employees",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const data=await response.json();if(!response.ok){const error=data?.error;throw new Error(typeof error==="object"?error.message:data.detail||error||"Unable to create employee")}return data},
    onSuccess:async()=>{await queryClient.invalidateQueries({queryKey:["people","employees"]});setCreateOpen(false);setForm({employeeNumber:"",firstName:"",lastName:"",joiningDate:"",employmentType:"Full-time",workLocation:"",status:"active"});setCreateError("")},
    onError:(error)=>setCreateError(error instanceof Error?error.message:"Unable to create employee"),
  });
  const employees=directory?.items||[];

  const visible = employees;
  const departments = ["All departments", ...new Set(employees.map((item) => item.department))];
  const columns = useMemo<ColumnDef<Employee>[]>(()=>[
    {id:"employee",header:"Employee",cell:({row})=><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0075de]/10 text-[10px] font-extrabold text-[#0075de]">{initials(row.original.name)}</div><div><div className="font-bold">{row.original.name}</div><div className="text-[10px] text-[var(--text-muted)]">{row.original.employeeNumber} · {row.original.email}</div></div></div>},
    {accessorKey:"department",header:"Department"},
    {accessorKey:"designation",header:"Designation"},
    {accessorKey:"manager",header:"Manager",cell:({getValue})=><span className="text-[var(--text-secondary)]">{String(getValue())}</span>},
    {accessorKey:"employmentType",header:"Type"},
    {accessorKey:"workLocation",header:"Location"},
    {accessorKey:"status",header:"Status",cell:({getValue})=>{const status=String(getValue());return <span className={`rounded-full px-2 py-1 text-[9px] font-bold ${status==="Active"?"bg-emerald-500/10 text-emerald-600":"bg-amber-500/10 text-amber-600"}`}>{status}</span>}},
  ],[]);
  const table=useReactTable({data:visible,columns,getCoreRowModel:getCoreRowModel()});
  async function createEmployee(event: React.FormEvent) {
    event.preventDefault(); setCreateError(""); createMutation.mutate();
  }
  async function loadDocuments(employeeId:string){
    setDocumentsLoading(true);
    try{const response=await fetch(`/api/v1/hrms/people/documents?ownerEntityType=employee&ownerEntityId=${encodeURIComponent(employeeId)}`);const data=await response.json();if(!response.ok)throw new Error(data.detail||data.error);setDocuments(data.items||[])}finally{setDocumentsLoading(false)}
  }
  async function selectProfileTab(tab:string){setProfileTab(tab);if(tab==="Documents"&&selected)await loadDocuments(selected.id);if((tab==="History"||tab==="Audit")&&selected){setDocumentsLoading(true);try{const response=await fetch(`/api/v1/hrms/people/employees/${selected.id}/${tab.toLowerCase()}`);const data=await response.json();if(!response.ok)throw new Error(data.detail||data.error);setEvents(data.items||[])}finally{setDocumentsLoading(false)}}}
  async function uploadDocument(file:File){
    if(!selected)return;setUploading(true);
    try{
      const checksumBuffer=await crypto.subtle.digest("SHA-256",await file.arrayBuffer());const checksum=Array.from(new Uint8Array(checksumBuffer)).map(byte=>byte.toString(16).padStart(2,"0")).join("");
      const metadata=await fetch("/api/v1/hrms/people/documents/upload-url",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ownerEntityType:"employee",ownerEntityId:selected.id,name:file.name,contentType:file.type||"application/octet-stream",sizeBytes:file.size,checksumSHA256:checksum})});
      const signed=await metadata.json();if(!metadata.ok)throw new Error(signed.detail||signed.error);
      const uploaded=await fetch(signed.uploadUrl,{method:signed.method||"PUT",headers:signed.headers||{"Content-Type":file.type},body:file});if(!uploaded.ok)throw new Error("File upload failed");
      await loadDocuments(selected.id);
    }catch(error){setCreateError(error instanceof Error?error.message:"Document upload failed")}finally{setUploading(false)}
  }
  async function downloadDocument(document:EmployeeDocument){const response=await fetch(`/api/v1/hrms/people/documents/${document.id}/download-url`,{method:"POST"});const data=await response.json();if(!response.ok){setCreateError(data.detail||data.error);return}window.open(data.downloadUrl,"_blank","noopener,noreferrer")}

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      <header className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#0075de]">
            <ShieldCheck size={13}/> People Core · Release 01
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">People directory</h1>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">Search the employee system of record and explore your organisation.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] px-3 text-[11px] font-semibold"><Network size={14}/> Org chart</button>
          <button onClick={()=>setCreateOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#0075de] px-3 text-[11px] font-bold text-white shadow-sm"><Plus size={14}/> Add employee</button>
        </div>
      </header>

      {serviceOffline && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[11px] text-amber-700 dark:text-amber-300">
          <CircleAlert size={15}/><span className="flex-1"><b>Employees could not be loaded.</b> Check the service connection and try again.</span><button onClick={()=>refetchEmployees()} className="rounded-lg border border-amber-500/30 px-3 py-1.5 font-bold">Retry</button>
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [Users,"Total people",employees.length || "—","Active workforce"],
          [Building2,"Departments",new Set(employees.map(e=>e.department)).size || "—","Across the organisation"],
          [Network,"People managers",new Set(employees.map(e=>e.manager).filter(m=>m!=="—")).size || "—","Reporting lines"],
          [MapPin,"Work locations",new Set(employees.map(e=>e.workLocation)).size || "—","Office and remote"],
        ].map(([Icon,label,value,caption]) => {
          const I = Icon as typeof Users;
          return <div key={String(label)} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-sm">
            <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{String(label)}</span><I size={15} className="text-[#0075de]"/></div>
            <div className="mt-3 text-2xl font-extrabold">{String(value)}</div><div className="mt-1 text-[10px] text-[var(--text-muted)]">{String(caption)}</div>
          </div>;
        })}
      </section>

      <section className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] p-4 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
          <input value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder="Search by name, employee ID or email…" className="h-9 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] pl-9 pr-9 text-xs outline-none focus:border-[#0075de]"/>
            {query && <button onClick={()=>setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={13}/></button>}
          </div>
          <div className="relative">
            <Filter size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
            <select value={department} onChange={e=>{setDepartment(e.target.value);setPage(1)}} className="h-9 appearance-none rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] pl-8 pr-8 text-[11px] font-semibold">
              {departments.map(d=><option key={d}>{d}</option>)}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"/>
          </div>
          <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 text-[11px] font-semibold"><SlidersHorizontal size={13}/> More filters</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-[var(--surface-2)] text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
              {table.getHeaderGroups().map(group=><tr key={group.id}>{group.headers.map(header=><th key={header.id} className="px-4 py-3 font-bold">{header.isPlaceholder?null:flexRender(header.column.columnDef.header,header.getContext())}</th>)}</tr>)}
            </thead>
            <tbody>
              {loading ? Array.from({length:5}).map((_,i)=><tr key={i} className="border-t border-[var(--border-subtle)]"><td colSpan={7} className="px-4 py-3"><div className="h-9 animate-pulse rounded-md bg-[var(--surface-2)]"/></td></tr>) :
              table.getRowModel().rows.map(row=><tr key={row.id} onClick={()=>{setSelected(row.original);setProfileTab("Overview")}} className="cursor-pointer border-t border-[var(--border-subtle)] transition-colors hover:bg-[var(--surface-2)]">{row.getVisibleCells().map(cell=><td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell,cell.getContext())}</td>)}</tr>)}
              {!loading && visible.length===0 && <tr><td colSpan={7} className="py-16 text-center"><Users className="mx-auto mb-3 text-[var(--text-muted)]" size={28}/><b>No people found</b><p className="mt-1 text-[11px] text-[var(--text-muted)]">Try changing your search or filters.</p></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-4 py-3 text-[10px] text-[var(--text-muted)]">
          <span>Showing {visible.length} of {directory?.total||0} people</span><div className="flex items-center gap-1"><button aria-label="Previous page" disabled={page===1} onClick={()=>setPage(value=>Math.max(1,value-1))} className="rounded border border-[var(--border-subtle)] p-1.5 disabled:opacity-40"><ChevronLeft size={12}/></button><span className="px-2 font-bold text-[var(--text-primary)]">{page}</span><button aria-label="Next page" disabled={page*20>=(directory?.total||0)} onClick={()=>setPage(value=>value+1)} className="rounded border border-[var(--border-subtle)] p-1.5 disabled:opacity-40"><ChevronRight size={12}/></button></div>
        </div>
      </section>

      {selected && <div className="fixed inset-0 z-50 bg-black/25" onClick={()=>setSelected(null)}>
        <aside onClick={e=>e.stopPropagation()} className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-[var(--border-subtle)] bg-[var(--background)] p-6 shadow-2xl">
          <div className="flex justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-[#0075de]">Employee profile</span><button onClick={()=>setSelected(null)}><X size={18}/></button></div>
          <div className="mt-8 flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0075de]/10 text-lg font-extrabold text-[#0075de]">{initials(selected.name)}</div><div><h2 className="text-xl font-extrabold">{selected.name}</h2><p className="text-xs text-[var(--text-muted)]">{selected.designation}</p></div></div>
          <div className="mt-8 flex gap-1 overflow-x-auto border-b border-[var(--border-subtle)]">{["Overview","Employment","Documents","History","Audit"].map(t=><button onClick={()=>void selectProfileTab(t)} key={t} className={`px-3 pb-3 text-[10px] font-bold ${profileTab===t?"border-b-2 border-[#0075de] text-[#0075de]":"text-[var(--text-muted)]"}`}>{t}</button>)}</div>
          {(profileTab==="Overview"||profileTab==="Employment")&&<dl className="mt-6 grid grid-cols-2 gap-5">{[["Employee ID",selected.employeeNumber],["Email",selected.email],["Department",selected.department],["Manager",selected.manager],["Employment type",selected.employmentType],["Work location",selected.workLocation]].map(([k,v])=><div key={k}><dt className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{k}</dt><dd className="mt-1 text-xs font-semibold">{v}</dd></div>)}</dl>}
          {profileTab==="Documents"&&<div className="mt-6"><label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#0075de]/40 bg-[#0075de]/5 p-4 text-xs font-bold text-[#0075de]">{uploading?"Uploading…":"Upload private document"}<input type="file" className="hidden" disabled={uploading} onChange={e=>{const file=e.target.files?.[0];if(file)void uploadDocument(file)}}/></label><div className="mt-4 space-y-2">{documentsLoading?<div className="h-20 animate-pulse rounded-xl bg-[var(--surface-2)]"/>:documents.map(document=><button onClick={()=>void downloadDocument(document)} key={document.id} className="flex w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] p-3 text-left"><div><b className="text-xs">{document.name}</b><p className="mt-0.5 text-[9px] text-[var(--text-muted)]">{document.contentType} · {Math.ceil(document.sizeBytes/1024)} KB</p></div><span className="text-[9px] font-bold text-[#0075de]">Download</span></button>)}{!documentsLoading&&!documents.length&&<p className="py-8 text-center text-xs text-[var(--text-muted)]">No documents uploaded.</p>}</div></div>}
          {(profileTab==="History"||profileTab==="Audit")&&<div className="mt-6 space-y-2">{documentsLoading?<div className="h-28 animate-pulse rounded-xl bg-[var(--surface-2)]"/>:events.map(event=><div key={event.id} className="relative border-l-2 border-[#0075de]/20 py-2 pl-4"><span className="absolute -left-[5px] top-4 h-2 w-2 rounded-full bg-[#0075de]"/><b className="text-xs">{event.event_type||event.action}</b><p className="mt-1 text-[9px] text-[var(--text-muted)]">{new Date(event.recorded_at||event.occurred_at||"").toLocaleString()} · {event.actor_user_id}</p></div>)}{!documentsLoading&&!events.length&&<p className="py-8 text-center text-xs text-[var(--text-muted)]">No {profileTab.toLowerCase()} events.</p>}</div>}
        </aside>
      </div>}
      {createOpen&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={()=>setCreateOpen(false)}>
        <form onSubmit={createEmployee} onClick={e=>e.stopPropagation()} className="w-full max-w-xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-2xl">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-extrabold">Create employee</h2><p className="mt-1 text-[10px] text-[var(--text-muted)]">Creates the profile and initial employment record atomically.</p></div><button type="button" onClick={()=>setCreateOpen(false)}><X size={17}/></button></div>
          {createError&&<div className="mt-4 rounded-lg bg-red-500/10 p-3 text-xs text-red-600">{createError}</div>}
          <div className="mt-6 grid grid-cols-2 gap-4">
            {[["Employee number","employeeNumber","GX-042"],["First name","firstName","First name"],["Last name","lastName","Last name"],["Joining date","joiningDate",""]].map(([label,key,placeholder])=><label key={key} className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}<input required type={key==="joiningDate"?"date":"text"} placeholder={placeholder} value={form[key as keyof typeof form]} onChange={e=>setForm({...form,[key]:e.target.value})} className="mt-1.5 h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] px-3 text-xs font-medium normal-case tracking-normal text-[var(--text-primary)]"/></label>)}
            <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Employment type<select value={form.employmentType} onChange={e=>setForm({...form,employmentType:e.target.value})} className="mt-1.5 h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] px-3 text-xs normal-case tracking-normal"><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Intern</option></select></label>
            <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Work location<input value={form.workLocation} onChange={e=>setForm({...form,workLocation:e.target.value})} className="mt-1.5 h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] px-3 text-xs normal-case tracking-normal text-[var(--text-primary)]"/></label>
          </div>
          <button disabled={createMutation.isPending} className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0075de] text-xs font-bold text-white disabled:opacity-50">{createMutation.isPending&&<span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"/>}{createMutation.isPending?"Creating…":"Create employee"}</button>
        </form>
      </div>}
    </div>
  );
}
