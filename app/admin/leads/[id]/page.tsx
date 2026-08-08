"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { 
  ArrowLeft, Mail, Phone, Globe, MapPin, 
  Target, ShieldCheck, Zap, Camera, 
  User, Star, MessageSquare, Save,
  CheckCircle2, XCircle, Clock, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Lead } from "@/types";
import { AdminLeadAssignment } from "@/components/admin/crm/AdminLeadAssignment";
import { AdminLeadSalesContext } from "@/components/admin/crm/AdminLeadSalesContext";

export default function LeadDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editValues, setEditValues] = useState<Partial<Lead>>({});
  const [error, setError] = useState<string | null>(null);

  // Dynamic Email Outreach States
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [senderName, setSenderName] = useState("GrowX Labs");
  const [senderEmail, setSenderEmail] = useState("hello@growxlabs.tech");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    if (id) fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/leads/${id}`);
      const data = await res.json();
      
      console.log("FETCHED LEAD DATA:", data);

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to fetch lead details");
      }
      
      setLead(data);
      setNotes(data.notes || "");
      setEditValues({ business_name: data.business_name || "", name: data.name || "", email: data.email || "", phone: data.phone || "", website_url: data.website_url || "", city: data.city || "", status: data.status, lead_score: data.lead_score || 0 });
    } catch (e: any) {
      console.error("FETCH ERROR:", e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async (updates: Partial<Lead>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const updated = await res.json();
      if (!res.ok || updated.error) throw new Error(updated.error || "Unable to update lead.");
      setLead(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update lead.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendDynamicEmail = async () => {
    if (!lead?.email) return;
    setEmailSending(true);
    try {
      const res = await fetch("/api/send-email/dynamic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          toEmail: lead.email,
          fromName: senderName,
          fromEmail: senderEmail,
          subject: emailSubject,
          body: emailBody
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to send email");
      }
      alert("Outreach email dispatched successfully!");
      setShowEmailModal(false);
      await fetchLead(); // Refresh the lead details and timeline
    } catch (e: any) {
      console.error(e);
      alert(e.message);
    } finally {
      setEmailSending(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
       <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
    </div>
  );

  if (error) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
       <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center max-w-md">
          <XCircle className="text-red-500 h-10 w-10 mx-auto mb-4" />
          <h2 className="text-white font-bold text-lg">Failed to load lead</h2>
          <p className="text-white/40 text-sm mt-2">{error}</p>
          <Button onClick={fetchLead} variant="outline" className="mt-6 border-white/10 hover:bg-white/5">
             Try Again
          </Button>
       </div>
    </div>
  );

  if (!lead) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
       <Target className="text-white/10 h-16 w-16" />
       <div className="space-y-1">
         <h2 className="text-white font-bold text-xl">Lead not found</h2>
         <p className="text-white/20 text-sm">The ID provided does not match any existing record.</p>
       </div>
       <Button onClick={() => router.push('/admin/leads')} className="bg-white text-black">
          Back to Pipeline
       </Button>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="border-white/5 hover:bg-white/5 text-white/60"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Leads
        </Button>
        <div className="flex gap-3">
           <Button onClick={() => setEditOpen((open) => !open)} className="bg-[#0075de] text-white hover:bg-[#005bab]"><Save size={16} className="mr-2" /> {editOpen ? "Close Editor" : "Edit Lead"}</Button>
           <Button 
            onClick={() => updateLead({ status: "contacted" })}
            disabled={saving || lead.status === "contacted"}
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white"
           >
             <MessageSquare size={16} className="mr-2 text-white/40" /> Mark Contacted
           </Button>
           <Button 
            onClick={() => updateLead({ status: "closed" })}
            disabled={saving || lead.status === "closed"}
            className="bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-500"
           >
             <CheckCircle2 size={16} className="mr-2" /> Mark Closed
           </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {editOpen && <Card className="border-blue-200 bg-blue-50 p-6 rounded-2xl space-y-5"><div className="flex items-start justify-between"><div><h2 className="text-lg font-bold text-slate-900">Edit Lead Details</h2><p className="mt-1 text-sm text-slate-600">Update the CRM record and save changes to PostgreSQL.</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">Editing</span></div><div className="grid gap-4 md:grid-cols-2">{([['business_name','Business / Company Name'],['name','Contact Person'],['email','Email'],['phone','Phone'],['website_url','Website'],['city','City']] as const).map(([key,label])=><label key={key} className="grid gap-1.5 text-xs font-semibold text-slate-700">{label}<input value={String(editValues[key] || '')} onChange={(event)=>setEditValues((current)=>({...current,[key]:event.target.value}))} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-500" /></label>)}<label className="grid gap-1.5 text-xs font-semibold text-slate-700">Status<select value={String(editValues.status || 'new')} onChange={(event)=>setEditValues((current)=>({...current,status:event.target.value as Lead['status']}))} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900"><option value="new">New</option><option value="qualified">Qualified</option><option value="contacted">Contacted</option><option value="following_up">Following Up</option><option value="warm">Warm</option><option value="cold">Cold</option><option value="closed">Closed</option></select></label><label className="grid gap-1.5 text-xs font-semibold text-slate-700">Lead Score<input type="number" min="0" max="10" step="0.1" value={Number(editValues.lead_score || 0)} onChange={(event)=>setEditValues((current)=>({...current,lead_score:Number(event.target.value)}))} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900" /></label></div><div className="flex justify-end gap-3"><Button variant="outline" onClick={()=>setEditOpen(false)} className="border-slate-300 bg-white text-slate-700">Cancel</Button><Button disabled={saving} onClick={async()=>{await updateLead(editValues);setEditOpen(false);}} className="bg-[#0075de] text-white">{saving?'Saving…':'Save Lead Details'}</Button></div></Card>}
          <Card className="p-8 border-white/5 bg-white/[0.02] rounded-2xl">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="h-20 w-20 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 border border-white/5 shrink-0">
                <Target size={40} />
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight">{lead.business_name || lead.name}</h1>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      lead.status === "new" ? "text-yellow-500 border-yellow-500/20 bg-yellow-500/5" : "text-green-500 border-green-500/20 bg-green-500/5"
                    )}>
                      {lead.status}
                    </span>
                    <span className="text-white/20 text-xs font-medium flex items-center gap-1">
                      <MapPin size={12} /> {lead.city || "Unknown City"}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-8">
                   <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Phone</p>
                      <p className="text-sm font-medium text-white flex items-center gap-2">
                         <Phone size={14} className="text-white/20" /> {lead.phone || "No phone provided"}
                      </p>
                   </div>
                   <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Email</p>
                      <p className="text-sm font-medium text-white flex items-center gap-2">
                         <Mail size={14} className="text-white/20" /> {lead.email || "No email available"}
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border-white/5 bg-white/[0.02] rounded-2xl space-y-6">
               <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <ShieldCheck size={16} className="text-white/40" /> Digital Status
               </h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <span className="text-xs text-white/40 font-medium flex items-center gap-2">
                       <Globe size={14} /> Website
                    </span>
                    <span className={cn("text-xs font-bold", lead.has_website ? "text-green-500" : "text-red-500")}>
                       {lead.has_website ? "LIVE" : "MISSING"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5 opacity-50">
                    <span className="text-xs text-white/40 font-medium flex items-center gap-2">
                       <Camera size={14} /> Instagram followers
                    </span>
                    <span className="text-xs font-bold text-white">
                       {lead.instagram_followers || 0}
                    </span>
                  </div>
               </div>
            </Card>

            <Card className="p-6 border-white/5 bg-white/[0.02] rounded-2xl space-y-6">
               <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <Zap size={16} className="text-white/40" /> Performance Metrics
               </h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                    <p className="text-[10px] font-bold text-white/20 uppercase mb-1">Google Rating</p>
                    <div className="flex items-center justify-center gap-1 text-white text-lg font-bold">
                       <Star size={16} className="fill-yellow-500 text-yellow-500" /> {lead.google_rating || 0}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                    <p className="text-[10px] font-bold text-white/20 uppercase mb-1">Reviews</p>
                    <p className="text-white text-lg font-bold">{lead.reviews_count || 0}</p>
                  </div>
               </div>
            </Card>
          </div>

          <Card className="p-8 border-white/5 bg-white/[0.02] rounded-2xl space-y-6">
             <div className="flex items-center justify-between">
               <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <MessageSquare size={16} className="text-white/40" /> Internal Notes
               </h3>
               <Button 
                onClick={() => updateLead({ notes })}
                disabled={saving || notes === lead.notes}
                className="h-8 bg-white hover:bg-white/90 text-black px-4 text-xs font-bold"
               >
                 <Save size={12} className="mr-2" /> Save Notes
               </Button>
             </div>
             <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record outreach attempts, client requirements, or specific pain points..."
              className="w-full h-40 bg-white/[0.03] border border-white/5 rounded-xl p-4 text-sm font-medium text-white/60 focus:outline-none focus:border-white/10 transition-colors"
             />
          </Card>

          {/* AI Outreach Section */}
          <Card className="p-8 border-blue-500/10 bg-blue-500/[0.02] rounded-2xl space-y-6 border border-dashed">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-blue-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Outreach Strategy</h3>
              </div>
              {lead.outreach_generated && (
                <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">
                  Content Ready
                </span>
              )}
            </div>

            {!lead.outreach_generated ? (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center space-y-4">
                <p className="text-white/40 text-sm">No outreach strategy has been generated for this lead yet.</p>
                <Button 
                  onClick={async () => {
                    setSaving(true);
                    try {
                      const res = await fetch("/api/leads/outreach/generate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ leadId: lead.id })
                      });
                      const data = await res.json();
                      if (data.error) throw new Error(data.error);
                      await fetchLead(); // Refresh data
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  <RefreshCw size={14} className={cn("mr-2", saving && "animate-spin")} /> Generate Strategy
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">WhatsApp Draft</p>
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-xs text-white/60 leading-relaxed italic">
                      {lead.outreach_content?.whatsapp}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Email Strategy</p>
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-xs text-white/60 leading-relaxed italic">
                      {lead.outreach_content?.email}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  {lead.phone && (
                    <Button 
                      onClick={() => window.open(`https://wa.me/${lead.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(lead.outreach_content?.whatsapp || "")}`, '_blank')}
                      className="bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white border border-green-500/20 text-xs font-bold"
                    >
                      Deploy WhatsApp
                    </Button>
                  )}
                  {lead.email && (
                    <>
                      <Button 
                        onClick={() => window.open(`mailto:${lead.email}?subject=Partnership Strategy for ${lead.business_name || lead.name}&body=${encodeURIComponent(lead.outreach_content?.email || "")}`)}
                        variant="outline"
                        className="border-white/10 hover:bg-white/5 text-white/60 text-xs font-bold"
                      >
                        Send Email draft (Local)
                      </Button>
                      <Button 
                        onClick={() => {
                          setSenderName("GrowX Labs");
                          setSenderEmail("hello@growxlabs.tech");
                          setEmailSubject(`Partnership Strategy for ${lead.business_name || lead.name}`);
                          setEmailBody(lead.outreach_content?.email || "");
                          setShowEmailModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                      >
                        <Mail size={12} className="mr-2" /> Send via GrowX Server
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           <AdminLeadAssignment leadId={id} />
           <AdminLeadSalesContext leadId={id} />
           <Card className="p-8 border-white/5 bg-white/[0.05] rounded-2xl border-l-4 border-white/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Target size={80} />
              </div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Opportunity Score</p>
              <h2 className="text-7xl font-black text-white tracking-tighter mb-2">{lead.lead_score}</h2>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-6">
                 <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(lead.lead_score || 0) * 10}%` }}
                  className="h-full bg-white" 
                 />
              </div>
              <p className="text-xs text-white/40 font-medium mt-4">This business has a {(lead.lead_score || 0) * 10}% conversion potential based on gaps in their digital presence.</p>
           </Card>

           <Card className="p-8 border-white/5 bg-white/[0.02] rounded-2xl space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Timeline</h3>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                       <ShieldCheck size={14} className="text-white/40" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-white">Lead Ingested</p>
                       <p className="text-[10px] text-white/20 font-medium">Scraped from Google Maps • {new Date(lead.created_at!).toLocaleDateString()}</p>
                    </div>
                 </div>
                 {lead.status !== 'new' && (
                    <div className="flex gap-4">
                       <div className="h-8 w-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={14} className="text-green-500" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-white">Status Updated</p>
                          <p className="text-[10px] text-white/20 font-medium">Marked as {lead.status}</p>
                       </div>
                    </div>
                 )}
              </div>
           </Card>
         </div>
      </div>

      {/* Dynamic Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Mail className="text-blue-500" size={18} /> Send Outreach via GrowX Server
                </h3>
                <button 
                  onClick={() => setShowEmailModal(false)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Sender Name</label>
                    <input 
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full h-11 bg-white/[0.03] border border-white/5 rounded-lg px-4 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Sender Email</label>
                    <input 
                      type="text"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full h-11 bg-white/[0.03] border border-white/5 rounded-lg px-4 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Recipient Email</label>
                  <input 
                    type="text"
                    value={lead?.email || ""}
                    disabled
                    className="w-full h-11 bg-white/[0.01] border border-white/5 rounded-lg px-4 text-white/40 text-sm focus:outline-none cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Subject</label>
                  <input 
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full h-11 bg-white/[0.03] border border-white/5 rounded-lg px-4 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Email Body (HTML / Plain Text)</label>
                  <textarea 
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={8}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-4 text-white text-sm font-medium focus:outline-none focus:border-white/20 transition-colors resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                <Button 
                  onClick={() => setShowEmailModal(false)}
                  variant="outline"
                  className="border-white/10 text-white/60 hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendDynamicEmail}
                  disabled={emailSending}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6"
                >
                  {emailSending ? "Sending..." : "Send Email"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
