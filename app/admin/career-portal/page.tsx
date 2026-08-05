"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Filter, Mail, Phone, MapPin, Briefcase, Calendar, Link2, FileText, CheckCircle, XCircle, AlertCircle, Clock, Save, ExternalLink } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Status helpers
const STATUSES = [
  { value: "all", label: "All Statuses", color: "bg-neutral-500/10 text-neutral-400 border-neutral-850" },
  { value: "new", label: "New", color: "bg-blue-500/10 text-blue-400 border-blue-900/30" },
  { value: "reviewed", label: "Reviewed", color: "bg-zinc-500/10 text-zinc-400 border-zinc-900/30" },
  { value: "shortlisted", label: "Shortlisted", color: "bg-purple-500/10 text-purple-400 border-purple-900/30" },
  { value: "contacted", label: "Contacted", color: "bg-amber-500/10 text-amber-400 border-amber-900/30" },
  { value: "hired", label: "Hired", color: "bg-emerald-500/10 text-emerald-400 border-emerald-900/30" },
  { value: "rejected", label: "Rejected", color: "bg-rose-500/10 text-rose-400 border-rose-900/30" }
];

const PLAYBOOK = {
  screening: {
    title: "01 // Screening Call",
    description: "15-minute introductory Zoom/Google Meet to assess voice energy, articulation, and background fit.",
    opening: `Hi [Candidate Name], thanks for jumping on. The goal of this call is simple: I want to hear a bit about your background, understand what drives you, and share what we are building at GrowX Labs. If it sounds like a fit, we’ll move to a quick sales assessment. Let’s start with you—walk me through your story.`,
    questions: [
      {
        q: "What specifically drew you to outbound B2B sales instead of other business or marketing roles?",
        listen: "Confidence, fluency, clarity of speech. Outbound SDRs cannot be hesitant to speak on calls."
      },
      {
        q: "If you had to pitch GrowX Labs Tech to a legacy business owner in a traditional industry like manufacturing, how would you explain what we do in 30 seconds?",
        listen: "Checks if they researched growxlabs.tech. Look for focus on problem-solving (saving time, reducing errors) rather than generic AI slop."
      },
      {
        q: "This is a founding role with performance incentives rather than a fixed salary. Traditional B2B sales cycles take time and require persistent follow-ups. Why does this commission-based model excite you, and how do you handle rejection?",
        listen: "Filters for self-motivated hunger, resilience, and alignment with the startup model."
      }
    ]
  },
  assessment: {
    title: "02 // Sales Task",
    description: "Copy-paste email to send candidates who pass the introductory screening call.",
    emailSubject: "Next Steps: Sales Assessment Task | GrowX Labs Careers",
    emailBody: `Hi [Candidate Name],

Great speaking with you today. As discussed, the next step in our process is a brief sales assessment task. This helps us evaluate your copywriting, research skills, and overall sales logic.

Please complete the following task within 48 hours:

1. Identify 2 traditional, non-tech companies in India or globally (e.g., manufacturing plants, logistics firms, packaging suppliers, warehousing, or chemical distribution).
2. For each company, find a key decision-maker on LinkedIn (e.g., VP of Operations, Founder, Managing Director, or Supply Chain Head).
3. Write a personalized 3-sentence outreach message (LinkedIn InMail style) pitching GrowX Labs' automation services to them. 

Avoid generic pitches. Focus on a specific business problem (e.g., automated invoice processing, inventory tracking, or CRM syncing) and make a clear call-to-action to book a brief discovery call.

Reply directly to this email with your choices and scripts.

Best regards,
GrowX Labs HR`
  },
  roleplay: {
    title: "03 // Live Roleplay",
    description: "15-minute mock outreach call. You play a busy traditional business owner (e.g., Mr. Sharma, MD of Sharma Packaging); candidate plays GrowX Labs SDR calling you to book a slot.",
    objections: [
      {
        obj: "I am busy right now, send me an email.",
        ans: "I completely understand you're busy, Mr. Sharma. I can certainly send an email, but it's usually easier to determine if this is even relevant in a quick 2-minute chat. Do you have 2 minutes now, or should we schedule a time tomorrow morning?"
      },
      {
        obj: "We don't need AI or custom systems. Our Excel spreadsheets work fine.",
        ans: "Excel is great, and many of our clients start there. The reason they switch is because manual entry costs their team 10 hours a week and leads to inventory errors. If we could automate that entry and save your team 40 hours a month, would it be worth a 10-minute look?"
      },
      {
        obj: "How much does this cost?",
        ans: "Because we build custom systems tailored to your exact operations, there is no flat fee. However, our typical solution yields a return on investment within the first 60 days. Our founder can walk you through exact pricing once we understand your bottlenecks. Are you open to a 10-minute chat with him this Thursday?"
      }
    ]
  },
  scorecard: {
    title: "04 // Scorecard",
    description: "Copy-paste this template directly into the 'Internal Hiring Notes' box in the candidate detail drawer above.",
    template: `// Candidate Evaluation
- Written Communication (Assessment Task): /5
- Verbal Clarity & Energy (Screening Call): /5
- Objection Handling (Mock Call): /5
- Research & Preparation: /5
- Incentives & Grit Alignment: /5

Hiring Decision: [Shortlist / Reject]
Next Action: [Send Stage 2 Task / Send Rejection]`
  }
};

export default function AdminCareersPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  
  // Selected candidate detail panel state
  const [activeCandidate, setActiveCandidate] = useState<any | null>(null);
  const [candidateNotes, setCandidateNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<"candidates" | "playbook">("candidates");
  const [playbookSubTab, setPlaybookSubTab] = useState<"screening" | "assessment" | "roleplay" | "scorecard">("screening");
  const [sendingAssessment, setSendingAssessment] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [interviewDateTime, setInterviewDateTime] = useState("");
  const [customMeetLink, setCustomMeetLink] = useState("");
  const [schedulingInterview, setSchedulingInterview] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (activeCandidate) {
      setCandidateNotes(activeCandidate.notes || "");
    }
  }, [activeCandidate]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/career-portal/list?t=${Date.now()}`);
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch applications:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch("/api/admin/career-portal/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (res.ok) {
        setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
        setActiveCandidate((prev: any) => prev && prev.id === id ? { ...prev, status } : prev);
      } else {
        alert(data.error || "Update failed");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!activeCandidate) return;
    try {
      setSavingNotes(true);
      const res = await fetch("/api/admin/career-portal/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeCandidate.id, notes: candidateNotes })
      });
      const data = await res.json();
      if (res.ok) {
        setApplications(prev => prev.map(app => app.id === activeCandidate.id ? { ...app, notes: candidateNotes } : app));
        setActiveCandidate((prev: any) => prev ? { ...prev, notes: candidateNotes } : null);
        alert("Internal notes saved successfully");
      } else {
        alert(data.error || "Failed to save notes");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSendAssessment = async (id: string) => {
    try {
      setSendingAssessment(true);
      const res = await fetch("/api/admin/career-portal/send-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (res.ok) {
        setApplications(prev => prev.map(app => app.id === id ? { ...app, status: "contacted" } : app));
        setActiveCandidate((prev: any) => prev && prev.id === id ? { ...prev, status: "contacted" } : prev);
        alert("Stage 2 assessment email successfully sent to candidate, and status updated to Contacted!");
      } else {
        alert(data.error || "Failed to send assessment");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while sending assessment email");
    } finally {
      setSendingAssessment(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleScheduleInterview = async () => {
    if (!activeCandidate || !interviewDateTime) return;
    try {
      setSchedulingInterview(true);
      const res = await fetch("/api/admin/career-portal/schedule-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeCandidate.id,
          dateTime: interviewDateTime,
          customMeetLink: customMeetLink || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setApplications(prev => prev.map(app => app.id === activeCandidate.id ? { ...app, status: "contacted" } : app));
        setActiveCandidate((prev: any) => prev && prev.id === activeCandidate.id ? { ...prev, status: "contacted" } : prev);
        alert("Interview successfully scheduled and emailed to candidate!");
        setShowScheduleForm(false);
        setInterviewDateTime("");
        setCustomMeetLink("");
      } else {
        alert(data.error || "Failed to schedule interview");
      }
    } catch (e) {
      console.error(e);
      alert("Error scheduling interview");
    } finally {
      setSchedulingInterview(false);
    }
  };

  // Filter candidates with strict null guards
  const filteredApplications = (Array.isArray(applications) ? applications : []).filter(app => {
    if (!app || typeof app !== "object") return false;
    const searchLower = String(searchTerm || "").toLowerCase();
    const matchesSearch = 
      String(app.name || "").toLowerCase().includes(searchLower) ||
      String(app.email || "").toLowerCase().includes(searchLower) ||
      String(app.role || "").toLowerCase().includes(searchLower);
    
    const matchesStatus = selectedStatus === "all" || app.status === selectedStatus;
    const matchesRole = selectedRole === "all" || app.role === selectedRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Extract unique roles from submissions safely
  const uniqueRoles = Array.from(new Set((Array.isArray(applications) ? applications : []).map(app => app?.role).filter(Boolean)));

  const getStatusBadge = (statusValue: string) => {
    const status = STATUSES.find(s => s.value === statusValue) || STATUSES[1];
    return (
      <span className={cn("px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider", status.color)}>
        {status.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary h-8 w-8" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Loading Candidates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 relative">
      <Reveal y={-20}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Careers Portal</h1>
            <p className="text-[var(--text-secondary)] text-sm">Review candidate applications and systems expertise.</p>
          </div>
        </div>
      </Reveal>

      {/* ═══ TABS ═══ */}
      <Reveal y={-10}>
        <div className="flex border-b border-[var(--border-subtle)] gap-6">
          <button
            onClick={() => setActiveTab("candidates")}
            className={cn(
              "pb-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-350 cursor-pointer",
              activeTab === "candidates"
                ? "border-white text-white"
                : "border-transparent text-[var(--text-muted)] hover:text-white"
            )}
          >
            Candidates ({filteredApplications.length})
          </button>
          <button
            onClick={() => setActiveTab("playbook")}
            className={cn(
              "pb-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-350 cursor-pointer",
              activeTab === "playbook"
                ? "border-white text-white"
                : "border-transparent text-[var(--text-muted)] hover:text-white"
            )}
          >
            Interviewer Playbook
          </button>
        </div>
      </Reveal>

      {activeTab === "candidates" ? (
        <>

      {/* ═══ FILTER BAR ═══ */}
      <Reveal y={10}>
        <div className="p-5 border border-[var(--border-subtle)] bg-[var(--surface-1)] rounded-2xl flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search candidate name, email, or role..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] focus:border-white focus:outline-none pl-12 pr-4 py-3 rounded-xl text-sm transition-all placeholder-[var(--text-muted)] text-white"
            />
          </div>

          {/* Status filter */}
          <div className="w-full md:w-52 relative">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] focus:border-white focus:outline-none px-4 py-3 rounded-xl text-sm transition-all text-[var(--text-secondary)] appearance-none cursor-pointer"
            >
              {STATUSES.map(status => (
                <option key={status.value} value={status.value} className="bg-[var(--surface-1)]">
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Role filter */}
          <div className="w-full md:w-56 relative">
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border-subtle)] focus:border-white focus:outline-none px-4 py-3 rounded-xl text-sm transition-all text-[var(--text-secondary)] appearance-none cursor-pointer"
            >
              <option value="all" className="bg-[var(--surface-1)]">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role as string} value={role as string} className="bg-[var(--surface-1)]">
                  {role as string}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Reveal>

      {/* ═══ APPLICATIONS LIST ═══ */}
      <div className="grid gap-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((app, i) => (
            <Reveal key={app.id} delay={i * 0.02}>
              <div 
                onClick={() => setActiveCandidate(app)}
                className="p-6 border border-[var(--border-subtle)] bg-[var(--surface-1)] hover:border-[var(--border-hover)] hover:shadow-sm cursor-pointer transition-all rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col md:flex-row md:items-center gap-6 flex-grow">
                  <div className="space-y-1 md:w-56">
                    <p className="font-bold text-white tracking-tight text-base group-hover:text-primary transition-colors">{app.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] font-medium truncate max-w-xs">{app.email}</p>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">{app.phone || "No Phone"}</p>
                  </div>
                  
                  <div className="space-y-1 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">{app.role || "Not specified"}</p>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">Exp: {app.experience || "0"} Years | {app.location || "Unknown"}</p>
                    <p className="text-xs text-[var(--text-secondary)] font-medium line-clamp-1 italic max-w-lg">"{app.motivation || "No statement"}"</p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-4 shrink-0">
                  <div className="text-left md:text-right">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Submitted On</p>
                    <p className="text-xs text-[var(--text-secondary)] font-semibold">
                      {app.created_at ? new Date(app.created_at).toLocaleDateString() : "Recent"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.resume_url && (
                      <a
                        href={app.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono font-bold tracking-wider text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all"
                      >
                        <FileText size={10} className="text-emerald-400" /> RESUME
                      </a>
                    )}
                    {getStatusBadge(app.status)}
                  </div>
                </div>
              </div>
            </Reveal>
          ))
        ) : (
          <Reveal>
            <div className="h-64 flex flex-col items-center justify-center border border-[var(--border-subtle)] border-dashed rounded-xl bg-[var(--surface-1)]">
              <AlertCircle className="text-[var(--text-muted)] mb-4" size={48} />
              <p className="text-[var(--text-secondary)] text-sm font-medium">No career applications found.</p>
            </div>
          </Reveal>
        )}
      </div>
      </>
      ) : (
        <Reveal y={10}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Playbook Sidebar Nav */}
            <div className="lg:col-span-1 space-y-2">
              {[
                { key: "screening", label: "01 // Intro Screen", icon: Phone },
                { key: "assessment", label: "02 // Sales Task", icon: Mail },
                { key: "roleplay", label: "03 // Live Roleplay", icon: Briefcase },
                { key: "scorecard", label: "04 // Scorecard", icon: FileText }
              ].map(sub => {
                const Icon = sub.icon;
                return (
                  <button
                    key={sub.key}
                    onClick={() => setPlaybookSubTab(sub.key as any)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 cursor-pointer",
                      playbookSubTab === sub.key
                        ? "bg-white border-white text-black font-bold"
                        : "bg-[var(--surface-1)] border-[var(--border-subtle)] hover:border-[var(--border-hover)] text-[var(--text-secondary)]"
                    )}
                  >
                    <Icon size={14} className={playbookSubTab === sub.key ? "text-black" : "text-[var(--text-muted)]"} />
                    <span className="text-xs uppercase tracking-wider font-mono">{sub.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Playbook Content Area */}
            <div className="lg:col-span-3 p-8 border border-[var(--border-subtle)] bg-[var(--surface-1)] rounded-2xl min-h-[500px] flex flex-col justify-between">
              <div>
                {/* Screening Call Tab */}
                {playbookSubTab === "screening" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">// 01 // Introduction Screening Call</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">{PLAYBOOK.screening.description}</p>
                    </div>

                    <div className="p-5 border border-dashed border-[var(--border-subtle)] bg-[var(--surface-2)] rounded-xl relative group">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">// Call Opening Hook</span>
                        <button
                          onClick={() => handleCopy(PLAYBOOK.screening.opening, "screening_opening")}
                          className="px-2.5 py-1 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono font-bold tracking-wider text-zinc-300 hover:text-white transition-all cursor-pointer"
                        >
                          {copiedKey === "screening_opening" ? "COPIED!" : "COPY SCRIPT"}
                        </button>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">"{PLAYBOOK.screening.opening}"</p>
                    </div>

                    <div className="space-y-4">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">// Core Qualifying Questions</span>
                      {PLAYBOOK.screening.questions.map((item, idx) => (
                        <div key={idx} className="p-5 border border-[var(--border-subtle)] bg-[var(--surface-2)] rounded-xl space-y-3">
                          <p className="text-xs font-bold text-white leading-relaxed"><span className="text-primary font-mono mr-2">Q{idx+1}.</span> {item.q}</p>
                          <div className="pt-2 border-t border-[var(--border-subtle)]/50">
                            <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">What to listen for:</span>
                            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed font-medium">{item.listen}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sales Task Tab */}
                {playbookSubTab === "assessment" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">// 02 // Out-of-Office Sales Assessment</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">{PLAYBOOK.assessment.description}</p>
                    </div>

                    <div className="border border-[var(--border-subtle)] bg-[var(--surface-2)] rounded-xl overflow-hidden">
                      <div className="bg-[var(--surface-3)] px-5 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">Email Template</span>
                        <button
                          onClick={() => handleCopy(`Subject: ${PLAYBOOK.assessment.emailSubject}\n\n${PLAYBOOK.assessment.emailBody}`, "assessment_email")}
                          className="px-2.5 py-1 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono font-bold tracking-wider text-zinc-300 hover:text-white transition-all cursor-pointer"
                        >
                          {copiedKey === "assessment_email" ? "COPIED!" : "COPY EMAIL"}
                        </button>
                      </div>
                      <div className="p-6 space-y-4 font-sans text-xs text-[var(--text-secondary)] select-text leading-relaxed">
                        <p><strong className="text-white">Subject:</strong> {PLAYBOOK.assessment.emailSubject}</p>
                        <hr className="border-[var(--border-subtle)]" />
                        <pre className="whitespace-pre-wrap font-sans leading-relaxed text-[var(--text-secondary)]">{PLAYBOOK.assessment.emailBody}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Roleplay Tab */}
                {playbookSubTab === "roleplay" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">// 03 // Live Mock Call Objection Handling</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">{PLAYBOOK.roleplay.description}</p>
                    </div>

                    <div className="space-y-4">
                      {PLAYBOOK.roleplay.objections.map((item, idx) => (
                        <div key={idx} className="p-5 border border-[var(--border-subtle)] bg-[var(--surface-2)] rounded-xl space-y-3">
                          <p className="text-xs font-bold text-rose-400 leading-relaxed"><span className="font-mono mr-2">OBJECTION:</span> "{item.obj}"</p>
                          <div className="pt-3 border-t border-[var(--border-subtle)]/50 relative group">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[9px] font-mono text-emerald-450 uppercase tracking-wider block">Recommended Objection Handler</span>
                              <button
                                onClick={() => handleCopy(item.ans, `objection_${idx}`)}
                                className="px-2 py-0.5 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded text-[8px] font-mono font-bold tracking-wider text-zinc-300 hover:text-white transition-all cursor-pointer"
                              >
                                {copiedKey === `objection_${idx}` ? "COPIED" : "COPY SCRIPT"}
                              </button>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">"{item.ans}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scorecard Tab */}
                {playbookSubTab === "scorecard" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">// 04 // Candidate Review Scorecard</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">{PLAYBOOK.scorecard.description}</p>
                    </div>

                    <div className="border border-[var(--border-subtle)] bg-[var(--surface-2)] rounded-xl overflow-hidden">
                      <div className="bg-[var(--surface-3)] px-5 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">Scorecard Template</span>
                        <button
                          onClick={() => handleCopy(PLAYBOOK.scorecard.template, "scorecard_template")}
                          className="px-2.5 py-1 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono font-bold tracking-wider text-zinc-300 hover:text-white transition-all cursor-pointer"
                        >
                          {copiedKey === "scorecard_template" ? "COPIED!" : "COPY SCORECARD"}
                        </button>
                      </div>
                      <div className="p-6 font-mono text-xs text-[var(--text-secondary)] select-text leading-relaxed">
                        <pre className="whitespace-pre-wrap leading-relaxed">{PLAYBOOK.scorecard.template}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">GrowX Labs HR Playbook v1.0.0</span>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* ═══ CANDIDATE DETAILS SIDE DRAWER ═══ */}
      <AnimatePresence>
        {activeCandidate && (
          <div className="fixed inset-0 z-[250] flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCandidate(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white border-l border-neutral-200 shadow-2xl flex flex-col h-full z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 tracking-tight leading-none">{activeCandidate.name}</h2>
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-1.5">// Candidate Dossier</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveCandidate(null)} 
                  className="p-2 hover:bg-neutral-200 rounded-md transition-colors text-neutral-500 hover:text-neutral-950"
                >
                  <XCircle size={20} />
                </button>
              </div>

              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white">
                
                {/* 1. Header Info section with a neat structured profile header */}
                <div className="border-b border-neutral-200 pb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">// Application Dossier</p>
                      <h3 className="text-2xl font-bold text-neutral-900 tracking-tight mt-1">{activeCandidate.name}</h3>
                      <p className="text-xs text-primary font-bold mt-1 tracking-wider uppercase">{activeCandidate.role || "Not specified"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Current Status</p>
                      <div className="mt-1">{getStatusBadge(activeCandidate.status)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-100 text-xs font-mono">
                    <div>
                      <span className="block text-[9px] text-neutral-550 uppercase">Location</span>
                      <span className="font-bold text-neutral-900 mt-1 block">{activeCandidate.location || "Unknown"}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-neutral-550 uppercase">Experience</span>
                      <span className="font-bold text-neutral-900 mt-1 block">{activeCandidate.experience || "0"} Years</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-neutral-550 uppercase">Employment</span>
                      <span className="font-bold text-neutral-900 mt-1 block">{activeCandidate.employment_type || "Unknown"}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-neutral-550 uppercase">Applied Date</span>
                      <span className="font-bold text-neutral-900 mt-1 block">
                        {activeCandidate.created_at ? new Date(activeCandidate.created_at).toLocaleDateString() : "Recent"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Structured Dossier Form Layout */}
                <div className="space-y-6">
                  <div className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50/50">
                    <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-wider">01. Contact Credentials</span>
                    </div>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-sans">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-neutral-450 uppercase tracking-wider block">Primary Email</span>
                        <a href={`mailto:${activeCandidate.email}`} className="text-neutral-900 hover:text-primary transition-colors font-bold block truncate">{activeCandidate.email}</a>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-neutral-455 uppercase tracking-wider block">Phone Number</span>
                        <a href={`tel:${activeCandidate.phone}`} className="text-neutral-900 hover:text-primary transition-colors font-bold block">{activeCandidate.phone || "Not provided"}</a>
                      </div>
                    </div>
                  </div>

                  <div className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50/50">
                    <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-wider">02. Career & Compensation Settings</span>
                    </div>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-sans">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-neutral-455 uppercase tracking-wider block">Expected Compensation</span>
                        <span className="text-neutral-900 font-bold block">{activeCandidate.expected_salary || "Not specified"}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-neutral-455 uppercase tracking-wider block">Notice Period / Availability</span>
                        <span className="text-neutral-900 font-bold block">{activeCandidate.notice_period || "Not specified"}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-neutral-455 uppercase tracking-wider block">Last/Current Job Title</span>
                        <span className="text-neutral-900 font-bold block">{activeCandidate.job_title || "Not specified"}</span>
                      </div>
                    </div>
                    <div className="p-5 border-t border-neutral-200 text-sm font-sans">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-neutral-455 uppercase tracking-wider block">Last/Current Employer</span>
                        <span className="text-neutral-900 font-bold block">{activeCandidate.company || "Not specified"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50/50">
                    <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-wider">03. Systems Expertise & Stack</span>
                    </div>
                    <div className="p-5 text-sm font-sans space-y-2">
                      <span className="text-[10px] font-mono text-neutral-455 uppercase tracking-wider block">Primary Languages & Technologies</span>
                      <p className="text-neutral-800 leading-relaxed font-bold">{activeCandidate.tech_stack || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50/50">
                    <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-wider">04. Candidate Motivation</span>
                    </div>
                    <div className="p-5 text-sm font-sans space-y-2">
                      <span className="text-[10px] font-mono text-neutral-455 uppercase tracking-wider block">Why join the team?</span>
                      <p className="text-neutral-800 leading-relaxed italic whitespace-pre-line font-bold bg-neutral-100/50 p-4 rounded-lg border border-neutral-200">
                        "{activeCandidate.motivation || "No motivation statement provided."}"
                      </p>
                    </div>
                  </div>

                  <div className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50/50">
                    <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-wider">05. Professional Footprints & Links</span>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeCandidate.resume_url && (
                        <a 
                          href={activeCandidate.resume_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-3.5 rounded-lg border border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50 flex items-center justify-between text-xs font-bold text-neutral-800 transition-all duration-300"
                        >
                          <span className="flex items-center gap-2.5 text-neutral-750"><FileText className="h-4 w-4 text-emerald-600" /> Resume / CV Document</span>
                          <ExternalLink size={12} className="text-neutral-450" />
                        </a>
                      )}
                      {activeCandidate.github_url && (
                        <a 
                          href={activeCandidate.github_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-3.5 rounded-lg border border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50 flex items-center justify-between text-xs font-bold text-neutral-800 transition-all duration-300"
                        >
                          <span className="flex items-center gap-2.5 text-neutral-750"><Link2 className="h-4 w-4 text-neutral-500" /> GitHub Repository</span>
                          <ExternalLink size={12} className="text-neutral-450" />
                        </a>
                      )}
                      {activeCandidate.linkedin_url && (
                        <a 
                          href={activeCandidate.linkedin_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-3.5 rounded-lg border border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50 flex items-center justify-between text-xs font-bold text-neutral-800 transition-all duration-300"
                        >
                          <span className="flex items-center gap-2.5 text-neutral-750"><Link2 className="h-4 w-4 text-blue-600" /> LinkedIn Profile</span>
                          <ExternalLink size={12} className="text-neutral-450" />
                        </a>
                      )}
                      {activeCandidate.portfolio_url && (
                        <a 
                          href={activeCandidate.portfolio_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-3.5 rounded-lg border border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50 flex items-center justify-between text-xs font-bold text-neutral-800 transition-all duration-300"
                        >
                          <span className="flex items-center gap-2.5 text-neutral-750"><Link2 className="h-4 w-4 text-purple-600" /> Portfolio Website</span>
                          <ExternalLink size={12} className="text-neutral-450" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Notes and internal review */}
                <div className="space-y-3 pt-4 border-t border-neutral-200">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2"><Save size={12} /> Internal Hiring Notes</p>
                  <div className="space-y-2">
                    <textarea
                      value={candidateNotes}
                      onChange={e => setCandidateNotes(e.target.value)}
                      placeholder="Write internal notes about candidate interview, technical assessment results, or communications..."
                      rows={3}
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-[#C0F0FB] focus:outline-none p-4 rounded-xl text-xs text-neutral-800 leading-relaxed resize-none transition-all duration-300"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 cursor-pointer"
                      >
                        {savingNotes ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                        Save Notes
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions (Status Updates) */}
              <div className="p-6 border-t border-neutral-200 bg-neutral-50 flex flex-col gap-4">
                <div className="border-b border-neutral-250 pb-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold text-neutral-550 uppercase tracking-widest">// Operations & Actions</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSendAssessment(activeCandidate.id)}
                        disabled={sendingAssessment}
                        className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-[9px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all duration-300 cursor-pointer"
                      >
                        {sendingAssessment ? (
                          <Loader2 className="animate-spin h-3 w-3" />
                        ) : (
                          <Mail size={10} className="text-primary" />
                        )}
                        Send Task
                      </button>
                      <button
                        onClick={() => setShowScheduleForm(prev => !prev)}
                        className={cn(
                          "px-2.5 py-1.5 disabled:opacity-50 text-[9px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all duration-300 cursor-pointer",
                          showScheduleForm 
                            ? "bg-primary text-black font-bold"
                            : "bg-neutral-900 hover:bg-neutral-800 text-white"
                        )}
                      >
                        <Calendar size={10} className={showScheduleForm ? "text-black" : "text-primary"} />
                        Schedule
                      </button>
                    </div>
                  </div>

                  {/* Inline Schedule Form */}
                  {showScheduleForm && (
                    <div className="mt-4 p-4 border border-neutral-200 bg-white rounded-lg space-y-3 font-sans">
                      <p className="text-[9.5px] font-bold text-neutral-600 uppercase tracking-wider">// Schedule Interview Details</p>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-neutral-550 uppercase tracking-wider block">Interview Date & Time</label>
                        <input
                          type="datetime-local"
                          value={interviewDateTime}
                          onChange={e => setInterviewDateTime(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-neutral-400 p-2 rounded text-xs text-neutral-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-neutral-550 uppercase tracking-wider block">Custom Meet Link (Optional)</label>
                        <input
                          type="url"
                          placeholder="Leave empty for default meet URL"
                          value={customMeetLink}
                          onChange={e => setCustomMeetLink(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-neutral-400 p-2 rounded text-xs text-neutral-800"
                        />
                      </div>

                      <button
                        onClick={handleScheduleInterview}
                        disabled={schedulingInterview || !interviewDateTime}
                        className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white disabled:opacity-50 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        {schedulingInterview ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <CheckCircle size={12} />}
                        Send Interview Invite
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">// Update Candidate Stage</p>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleUpdateStatus(activeCandidate.id, "reviewed")}
                    disabled={updatingStatus || activeCandidate.status === "reviewed"}
                    className={cn(
                      "px-3 py-2 text-[9px] font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 cursor-pointer",
                      activeCandidate.status === "reviewed"
                        ? "bg-neutral-200 border-neutral-300 text-neutral-850"
                        : "bg-transparent border-neutral-300 hover:border-neutral-500 text-neutral-700"
                    )}
                  >
                    Reviewed
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeCandidate.id, "shortlisted")}
                    disabled={updatingStatus || activeCandidate.status === "shortlisted"}
                    className={cn(
                      "px-3 py-2 text-[9px] font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 cursor-pointer",
                      activeCandidate.status === "shortlisted"
                        ? "bg-purple-100 border-purple-200 text-purple-800"
                        : "bg-transparent border-neutral-300 hover:border-purple-500 hover:text-purple-705 text-neutral-700"
                    )}
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeCandidate.id, "contacted")}
                    disabled={updatingStatus || activeCandidate.status === "contacted"}
                    className={cn(
                      "px-3 py-2 text-[9px] font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 cursor-pointer",
                      activeCandidate.status === "contacted"
                        ? "bg-amber-100 border-amber-200 text-amber-800"
                        : "bg-transparent border-neutral-300 hover:border-amber-500 hover:text-amber-705 text-neutral-700"
                    )}
                  >
                    Contacted
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeCandidate.id, "hired")}
                    disabled={updatingStatus || activeCandidate.status === "hired"}
                    className={cn(
                      "px-3 py-2 text-[9px] font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 cursor-pointer",
                      activeCandidate.status === "hired"
                        ? "bg-emerald-100 border-emerald-200 text-emerald-800"
                        : "bg-transparent border-neutral-300 hover:border-emerald-500 hover:text-emerald-705 text-neutral-700"
                    )}
                  >
                    Hire
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeCandidate.id, "rejected")}
                    disabled={updatingStatus || activeCandidate.status === "rejected"}
                    className={cn(
                      "px-3 py-2 text-[9px] font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 cursor-pointer ml-auto",
                      activeCandidate.status === "rejected"
                        ? "bg-rose-100 border-rose-200 text-rose-800"
                        : "bg-transparent border-neutral-300 hover:border-rose-500 hover:text-rose-705 text-neutral-700 hover:bg-rose-50/50"
                    )}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
