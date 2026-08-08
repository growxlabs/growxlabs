"use client";
import Link from "next/link";
import { useState } from "react";

export function NotificationList({initial}:{initial:any[]}) {
  const [items,setItems]=useState(initial),[message,setMessage]=useState("");
  async function markRead(id:string){const previous=items;setItems(current=>current.map(item=>item.id===id?{...item,read_at:new Date().toISOString()}:item));const response=await fetch(`/api/workspace/notifications/${id}/read`,{method:"POST"});if(!response.ok){setItems(previous);setMessage("We couldn't mark that notification as read.")}}
  async function markAll(){const previous=items;setItems(current=>current.map(item=>({...item,read_at:item.read_at||new Date().toISOString()})));const response=await fetch("/api/workspace/notifications/read-all",{method:"POST"});if(!response.ok){setItems(previous);setMessage("We couldn't mark all notifications as read.")}}
  if(!items.length)return <p className="text-sm text-slate-500">You have no notifications.</p>;
  const unread=items.filter(item=>!item.read_at).length;
  return <><div className="mb-3 flex min-h-8 items-center justify-between"><p className="text-xs text-slate-500">{unread} unread</p>{unread>0&&<button onClick={()=>void markAll()} className="text-xs font-medium text-blue-700 hover:underline">Mark all read</button>}</div>{message&&<p role="alert" className="mb-3 text-sm text-red-700">{message}</p>}<ul className="divide-y divide-slate-200 border-y border-slate-200">{items.map(item=>{const content=<><p className={`text-sm ${item.read_at?"text-slate-600":"font-medium text-slate-950"}`}>{String(item.payload?.title||item.template_key).replaceAll("_"," ")}</p>{item.payload?.message&&<p className="mt-1 text-sm text-slate-500">{String(item.payload.message)}</p>}<time className="mt-2 block text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</time></>;return <li key={item.id} className="flex items-start justify-between gap-5 py-5"><div>{item.payload?.href?<Link href={String(item.payload.href)} onClick={()=>!item.read_at&&void markRead(item.id)} className="block hover:underline">{content}</Link>:content}</div>{!item.read_at&&<button onClick={()=>void markRead(item.id)} className="shrink-0 text-xs font-medium text-blue-700 hover:underline">Mark read</button>}</li>})}</ul></>;
}
