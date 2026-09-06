"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Mail, Send, Sparkles, User, FileText, CheckCircle2, 
  AlertCircle, RefreshCw, Search, X, Loader2, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/marketing/Reveal";

interface RecipientOption {
  id: string;
  name: string;
  email: string;
  type: "lead" | "onboarding";
  details: string;
}

export default function GrowXEmailPage() {
  // Input fields
  const [senderName, setSenderName] = useState("Sai Varshith | GrowX Labs");
  const [senderEmail, setSenderEmail] = useState("sai@growxlabs.tech");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // AI Assistant states
  const [roughPrompt, setRoughPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  
  // App state
  const [leads, setLeads] = useState<any[]>([]);
  const [onboardings, setOnboardings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // Sent log (in-session persistence)
  const [sentLog, setSentLog] = useState<any[]>([]);

  // Fetch recipients list on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [leadsRes, onboardingRes] = await Promise.all([
          fetch("/api/leads/list?t=" + Date.now()),
          fetch("/api/admin/onboarding/list?t=" + Date.now())
        ]);
        
        const leadsData = await leadsRes.json();
        const onboardingData = await onboardingRes.json();
        
        setLeads(leadsData || []);
        setOnboardings(onboardingData || []);
      } catch (e) {
        console.error("Failed to load potential recipients:", e);
      }
    }
    loadData();
  }, []);

  // Filter recipient options based on search query
  const recipientOptions: RecipientOption[] = [];
  
  if (searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase();
    
    // Add matching leads
    leads.forEach(l => {
      if (l.email && (l.business_name?.toLowerCase().includes(q) || l.name?.toLowerCase().includes(q) || l.email.toLowerCase().includes(q))) {
        recipientOptions.push({
          id: l.id,
          name: l.business_name || l.name,
          email: l.email,
          type: "lead",
          details: `CRM Lead • ${l.city || "Unknown City"}`
        });
      }
    });
    
    // Add matching onboarding submissions
    onboardings.forEach(o => {
      if (o.email && (o.full_name?.toLowerCase().includes(q) || o.business_name?.toLowerCase().includes(q) || o.email.toLowerCase().includes(q))) {
        recipientOptions.push({
          id: o.id,
          name: o.full_name,
          email: o.email,
          type: "onboarding",
          details: `Onboarding Client • Plan: ${o.plan || "Custom"}`
        });
      }
    });
  }

  // Template handling presets
  const templates: Record<string, { subject: string; body: string }> = {
    blank: {
      subject: "",
      body: ""
    },
    outreach: {
      subject: "Accelerating [Name]'s Digital Strategy",
      body: `Hi [Name] Team,

We've been analyzing high-performance digital systems in your industry and identified several high-impact growth opportunities for [Name].

Our engineering team specializes in custom platforms and automation that help businesses scale and grow faster. 

Are you available for a brief 5-minute strategy call this week to discuss how we can help you grow?

Best regards,
GrowX Labs Team`
    },
    agreement: {
      subject: "Your GrowX Labs Project Agreement is Ready!",
      body: `Hi [Name],

Great news! The custom service agreement and project timeline for your upcoming project with GrowX Labs has been generated.

You can view, review, and sign the document directly inside your client portal.

Let us know if you have any questions or would like to hop on a quick call to review the details together!

Best regards,
GrowX Labs Team`
    },
    followup: {
      subject: "Following up: Digital growth strategy for [Name]",
      body: `Hi [Name],

I wanted to quickly follow up on my previous email. I know you're busy running your business, but I wanted to see if you had a few minutes this week for a brief introductory call.

We specialize in helping businesses in your niche optimize their digital presence to capture more high-value customers automatically.

Looking forward to hearing from you.

Best regards,
GrowX Labs Team`
    }
  };

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const tmpl = templates[templateKey];
    
    const resolvedName = recipientName || "[Name]";
    const newSubject = tmpl.subject.replace(/\[Name\]/g, resolvedName);
    const newBody = tmpl.body.replace(/\[Name\]/g, resolvedName);
    
    setSubject(newSubject);
    setBody(newBody);
  };

  const selectRecipient = (opt: RecipientOption) => {
    setRecipientEmail(opt.email);
    setRecipientName(opt.name);
    setSearchQuery("");
    setShowDropdown(false);
    
    // Auto-update placeholders in template if selected
    if (selectedTemplate !== "blank") {
      const tmpl = templates[selectedTemplate];
      setSubject(tmpl.subject.replace(/\[Name\]/g, opt.name));
      setBody(tmpl.body.replace(/\[Name\]/g, opt.name));
    }
  };

  const clearRecipient = () => {
    setRecipientEmail("");
    setRecipientName("");
    if (selectedTemplate !== "blank") {
      setSubject(templates[selectedTemplate].subject);
      setBody(templates[selectedTemplate].body);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !senderName || !senderEmail || !subject || !body) {
      showToast("Please fill in all fields before sending", "error");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/send-email/dynamic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: recipientEmail,
          fromName: senderName,
          fromEmail: senderEmail,
          subject,
          body
        })
      });
      
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to send email");
      }
      
      showToast("Email dispatched successfully! ✨", "success");
      
      // Log it
      setSentLog(prev => [
        {
          timestamp: new Date().toLocaleTimeString(),
          to: recipientEmail,
          name: recipientName || "Direct Contact",
          subject,
          status: "delivered"
        },
        ...prev
      ]);
      
      // Clear inputs
      setRecipientEmail("");
      setRecipientName("");
      setSubject("");
      setBody("");
      setSelectedTemplate("blank");
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "An error occurred while sending.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAiImprove = async () => {
    if (!roughPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/growx-email/ai-improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roughDraft: roughPrompt,
          recipientName: recipientName,
          businessName: recipientName, // match recipient name
          senderName: senderName
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate outreach");
      }
      
      setSubject(data.subject || "");
      setBody(data.body || "");
      showToast("Email polished in Corporate style! ✨", "success");
      setRoughPrompt(""); // Clear helper input
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "AI improvement failed.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-10 pb-20">
      <Reveal y={-20}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <Mail className="text-primary" /> GrowX Email Dispatcher
            </h1>
            <p className="text-white/40 font-medium">Send custom, dynamic outreach emails securely across our Resend system.</p>
          </div>
        </div>
      </Reveal>

      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 border ${
            toast.type === "success" 
              ? "bg-green-500/10 border-green-500/20 text-green-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 border-white/5 bg-white/[0.02] rounded-2xl">
            <form onSubmit={handleSendEmail} className="space-y-6">
              
              {/* Sender Details */}
              <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-white/5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sender Name</label>
                  <input 
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                    className="w-full h-11 bg-white/[0.03] border border-white/5 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sender Email (Resend Authorized)</label>
                  <select 
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full h-11 bg-neutral-900 border border-white/5 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                  >
                    <option value="sai@growxlabs.tech">sai@growxlabs.tech (Founder)</option>
                    <option value="hello@growxlabs.tech">hello@growxlabs.tech</option>
                    <option value="contact@growxlabs.tech">contact@growxlabs.tech</option>
                    <option value="outreach@growxlabs.tech">outreach@growxlabs.tech</option>
                  </select>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="space-y-6">
                <div className="relative space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Search CRM Leads or Onboarding Clients</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-white/20" size={16} />
                    <input 
                      type="text"
                      placeholder="Type business name, email, or client name to search..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="w-full h-11 bg-white/[0.03] border border-white/5 rounded-xl pl-11 pr-4 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                  
                  {/* Autocomplete Dropdown */}
                  <AnimatePresence>
                    {showDropdown && recipientOptions.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute z-30 left-0 right-0 max-h-60 overflow-y-auto bg-neutral-950 border border-white/10 rounded-xl mt-1 shadow-2xl custom-scrollbar"
                      >
                        {recipientOptions.map((opt) => (
                          <div
                            key={`${opt.type}-${opt.id}`}
                            onClick={() => selectRecipient(opt)}
                            className="p-3.5 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-none flex justify-between items-center text-left"
                          >
                            <div>
                              <p className="text-sm font-bold text-white">{opt.name}</p>
                              <p className="text-xs text-white/45">{opt.email}</p>
                            </div>
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded border border-white/5 bg-white/5 text-white/60">
                              {opt.details}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Selected Recipient Alert / Direct Input */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 grid md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Recipient Name</p>
                    <input 
                      type="text"
                      placeholder="e.g. Samatha Studio"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full h-10 bg-white/[0.03] border border-white/5 rounded-lg px-3 text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Recipient Email</p>
                    <div className="flex gap-2">
                      <input 
                        type="email"
                        placeholder="recipient@domain.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        required
                        className="w-full h-10 bg-white/[0.03] border border-white/5 rounded-lg px-3 text-white text-xs focus:outline-none"
                      />
                      {(recipientEmail || recipientName) && (
                        <button 
                          type="button" 
                          onClick={clearRecipient}
                          className="px-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Preset Dropdown */}
              <div className="space-y-2 pt-4">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={12} className="text-yellow-500" /> Apply Email Template Preset
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { key: "blank", label: "Blank Custom" },
                    { key: "outreach", label: "Cold Pitch" },
                    { key: "agreement", label: "Agreement Ready" },
                    { key: "followup", label: "Follow-Up Pitch" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => handleTemplateChange(t.key)}
                      className={`h-10 text-xs font-bold rounded-lg border transition-all ${
                        selectedTemplate === t.key 
                          ? "bg-blue-600 border-blue-500 text-white" 
                          : "bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/[0.05]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Composition Box */}
              <div className="p-5 bg-blue-600/[0.02] border border-blue-500/10 rounded-xl space-y-3 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={12} className="text-yellow-500 animate-pulse" /> AI Assistant (Gemini Corporate Polish)
                  </label>
                  {aiLoading && <span className="text-[10px] font-medium text-blue-400 animate-pulse flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Rewriting draft...</span>}
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  <textarea 
                    value={roughPrompt}
                    onChange={(e) => setRoughPrompt(e.target.value)}
                    placeholder="Write a rough outline, bullet points, or instructions here (e.g. 'checked their website, we can build custom CRM and WhatsApp automations, offer 20% discount on setup fee')"
                    rows={2}
                    className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/20 transition-all resize-none leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={handleAiImprove}
                    disabled={aiLoading || !roughPrompt.trim()}
                    className="h-auto md:w-36 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/35 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 p-3 transition-colors shrink-0"
                  >
                    {aiLoading ? (
                      <Loader2 className="animate-spin h-3.5 w-3.5" />
                    ) : (
                      <>✨ Magic Write</>
                    )}
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2 pt-4">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Email Subject</label>
                <input 
                  type="text"
                  placeholder="Subject Line"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full h-11 bg-white/[0.03] border border-white/5 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              {/* Body Content */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Email Content Body</label>
                <textarea 
                  rows={10}
                  placeholder="Compose your email pitch or update here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-4 text-white text-sm font-medium focus:outline-none focus:border-white/20 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Submit Dispatch */}
              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-white text-black hover:bg-neutral-100 font-bold px-8 py-3 h-12 shadow-2xl"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Dispatching...</>
                  ) : (
                    <><Send className="mr-2" size={16} /> Send Email Outreach</>
                  )}
                </Button>
              </div>

            </form>
          </Card>
        </div>

        {/* Sentinel Sidebar logs */}
        <div className="space-y-8">
          <Card className="p-6 border-white/5 bg-white/[0.02] rounded-2xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Outbox Activity Logs</h3>
              <p className="text-xs text-white/30">Session activity log of sent emails.</p>
            </div>
            
            <div className="space-y-4">
              {sentLog.length > 0 ? (
                sentLog.map((log, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-green-400 uppercase bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 tracking-wider">
                        {log.status}
                      </span>
                      <span className="text-[10px] text-white/20 font-medium">{log.timestamp}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{log.name}</p>
                      <p className="text-[10px] text-white/40">{log.to}</p>
                    </div>
                    <p className="text-[10px] text-white/50 border-t border-white/5 pt-1.5 italic truncate">{log.subject}</p>
                  </div>
                ))
              ) : (
                <div className="h-48 border border-white/5 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-6 space-y-2 opacity-50">
                  <Mail className="text-white/10" size={28} />
                  <p className="text-xs text-white/40 font-medium">No emails sent in this session yet.</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 border-white/5 bg-white/[0.02] rounded-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.02]">
              <Sparkles size={80} />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Email Integration Info</h3>
            <p className="text-xs text-white/40 leading-relaxed">
              This dashboard interfaces directly with the GrowX Labs Resend account. Ensure you use an authorized sender domain email (e.g. ending with <code className="text-blue-400">@growxlabs.tech</code>) to avoid delivery blocks.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
