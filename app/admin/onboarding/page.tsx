"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { 
  Loader2, FileText, User, Briefcase, Calendar, Mail, XCircle, 
  Phone, Globe, CreditCard, Search, Filter, MessageSquare, 
  ExternalLink, Sparkles, Eye, CheckCircle2, ShieldCheck, Tag, MapPin, SlidersHorizontal
} from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

export default function AdminOnboardingPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [selectedSubForDetail, setSelectedSubForDetail] = useState<any | null>(null);

  // Dynamic Email Outreach States
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [senderName, setSenderName] = useState("GrowX Labs");
  const [senderEmail, setSenderEmail] = useState("hello@growxlabs.tech");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/onboarding/list");
      const data = await res.json();
      setSubmissions(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendDynamicEmail = async () => {
    if (!selectedSub?.email) return;
    setEmailSending(true);
    try {
      const res = await fetch("/api/send-email/dynamic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: selectedSub.email,
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
      alert("Email sent successfully!");
      setShowEmailModal(false);
    } catch (e: any) {
      console.error(e);
      alert(e.message);
    } finally {
      setEmailSending(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = 
      (sub.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.business_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.city || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlan = 
      filterPlan === "all" || 
      (sub.plan || "").toLowerCase().includes(filterPlan.toLowerCase());

    return matchesSearch && matchesPlan;
  });

  const plansList = Array.from(new Set(submissions.map(s => s.plan).filter(Boolean)));

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#355CFF]" size={40} />
        <p className="text-zinc-500 text-xs font-mono tracking-widest uppercase">Loading Submissions Pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <Reveal y={-20}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-[#355CFF] to-[#7B61FF] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#355CFF]/20">
                <Briefcase size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Onboarding Pipeline</h1>
                <p className="text-zinc-400 text-xs font-medium">Full client requirements & technical submission repository.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => window.open('/onboarding', '_blank')}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 text-[11px] font-semibold h-10 px-4 rounded-xl flex items-center gap-2"
            >
              <ExternalLink size={14} /> View Live Form
            </Button>
          </div>
        </div>
      </Reveal>

      {/* Pipeline Analytics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 via-zinc-900/40 to-zinc-900/20 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Submissions</span>
            <FileText size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{submissions.length}</p>
          <span className="text-[10px] text-blue-400 font-mono mt-1 block">100% Captured</span>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 via-zinc-900/40 to-zinc-900/20 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">High-Ticket Requests</span>
            <Sparkles size={16} className="text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {submissions.filter(s => (s.plan || "").toLowerCase().includes("enterprise") || (s.plan || "").toLowerCase().includes("growth")).length}
          </p>
          <span className="text-[10px] text-purple-400 font-mono mt-1 block">Enterprise & Growth</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 via-zinc-900/40 to-zinc-900/20 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">With Domain & Specs</span>
            <Globe size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {submissions.filter(s => s.domain || s.payment_gateway).length}
          </p>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Ready for SOW</span>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 via-zinc-900/40 to-zinc-900/20 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Action Pending</span>
            <User size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {submissions.length}
          </p>
          <span className="text-[10px] text-amber-400 font-mono mt-1 block">Agreements & Outreach</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/50 border border-zinc-800/80 p-3 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by client, business, email, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#355CFF] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter size={14} className="text-zinc-500 shrink-0 ml-1" />
          <button
            onClick={() => setFilterPlan("all")}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-all ${
              filterPlan === "all" ? "bg-white text-black font-semibold" : "bg-zinc-950 text-zinc-400 hover:text-white"
            }`}
          >
            All Plans
          </button>
          {plansList.map(plan => (
            <button
              key={plan}
              onClick={() => setFilterPlan(plan)}
              className={`h-8 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filterPlan === plan ? "bg-white text-black font-semibold" : "bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
            >
              {plan}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length > 0 ? (
          filteredSubmissions.map((sub, i) => {
            const rawPhone = (sub.phone || "").replace(/[^0-9]/g, "");
            const whatsappUrl = rawPhone ? `https://wa.me/${rawPhone}` : null;

            return (
              <Reveal key={sub.id || i} delay={i * 0.04}>
                <div className="p-6 border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700/60 transition-all rounded-2xl group relative overflow-hidden shadow-lg space-y-6">
                  {/* Subtle Background Accent */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#355CFF]/5 rounded-bl-full pointer-events-none group-hover:bg-[#355CFF]/10 transition-colors" />

                  {/* Header Row */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/50 pb-5 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center text-white shrink-0 shadow-md">
                        <User size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-bold text-white tracking-tight">{sub.full_name}</h3>
                          {sub.plan && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#355CFF]/15 border border-[#355CFF]/30 text-[#6B8AFF] text-[10px] font-bold uppercase tracking-wider">
                              {sub.plan}
                            </span>
                          )}
                          {sub.city && (
                            <span className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded-md border border-zinc-700/40">
                              <MapPin size={10} className="text-zinc-500" /> {sub.city}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium mt-1 flex-wrap">
                          <span className="flex items-center gap-1.5"><Mail size={12} className="text-zinc-500" /> {sub.email}</span>
                          <span className="flex items-center gap-1.5"><Phone size={12} className="text-zinc-500" /> {sub.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <button
                        onClick={() => setSelectedSubForDetail(sub)}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium rounded-xl border border-zinc-700/50 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye size={13} /> Full Details
                      </button>

                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/30 transition-all flex items-center gap-1.5"
                        >
                          <MessageSquare size={13} /> WhatsApp
                        </a>
                      )}

                      <button
                        onClick={() => {
                          setSelectedSub(sub);
                          setSenderName("GrowX Labs");
                          setSenderEmail("hello@growxlabs.tech");
                          setEmailSubject(`Update regarding your GrowX Labs ${sub.plan || 'Growth'} Project Request`);
                          setEmailBody(`Hi ${sub.full_name},\n\nWe received your details regarding the ${sub.plan} project for ${sub.business_name || 'your business'}.\n\nOur team is currently preparing your project proposal and agreement. We will send it over shortly!\n\nBest regards,\nGrowX Labs Team`);
                          setShowEmailModal(true);
                        }}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl border border-zinc-700/60 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Mail size={13} /> Email Client
                      </button>

                      <button
                        onClick={() => window.location.href = `/admin/agreements/preview?from_onboarding=${sub.id}`}
                        className="px-4 py-2 bg-gradient-to-r from-[#355CFF] to-[#7B61FF] hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-lg shadow-[#355CFF]/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText size={13} /> Create Agreement
                      </button>
                    </div>
                  </div>

                  {/* Primary Fields Grid */}
                  <div className="grid md:grid-cols-4 gap-6 text-left relative z-10">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <Briefcase size={12} className="text-blue-400" /> Business Profile
                      </p>
                      <p className="font-bold text-white text-base tracking-tight">{sub.business_name || "N/A"}</p>
                      <p className="text-xs text-zinc-400 font-medium">Type: {sub.business_type || "Standard"}</p>
                      {sub.target_audience && (
                        <p className="text-xs text-zinc-400 font-medium">Audience: {sub.target_audience}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <Calendar size={12} className="text-purple-400" /> Project Scope
                      </p>
                      <p className="font-bold text-white text-base tracking-tight">{sub.plan || "Custom"}</p>
                      <p className="text-xs text-zinc-400 font-medium">Budget: <span className="text-emerald-400 font-semibold">{sub.budget || "N/A"}</span></p>
                      <p className="text-xs text-zinc-400 font-medium">Timeline: {sub.timeline || "Flexible"}</p>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <Globe size={12} className="text-emerald-400" /> Tech & Domain
                      </p>
                      <p className="text-xs text-zinc-300 font-medium">
                        Domain: {sub.domain || (sub.has_domain ? "Has existing domain" : "Needs domain purchase")}
                      </p>
                      <p className="text-xs text-zinc-400 font-medium">Gateway: {sub.payment_gateway || "Standard/Razorpay"}</p>
                      {sub.website_url && (
                        <a href={sub.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                          Existing Site <ExternalLink size={10} />
                        </a>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <ShieldCheck size={12} className="text-amber-400" /> Submission Status
                      </p>
                      <p className="text-xs text-zinc-300 font-medium">
                        Submitted: {new Date(sub.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      {sub.signature && (
                        <p className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 size={12} /> Signed: <span className="font-serif italic font-bold">{sub.signature}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description & Features Row */}
                  <div className="pt-4 border-t border-zinc-800/50 grid md:grid-cols-2 gap-6 relative z-10">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Project Description</p>
                      <p className="text-xs text-zinc-300 leading-relaxed italic bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
                        "{sub.description || "No description provided."}"
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Requested Features & Stack</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(sub.features) && sub.features.length > 0 ? (
                          sub.features.map((f: string) => (
                            <span key={f} className="text-[10px] font-semibold bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-lg text-zinc-300">
                              {f}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-500">Standard Package Features</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })
        ) : (
          <Reveal>
            <div className="h-72 flex flex-col items-center justify-center border border-zinc-800/60 border-dashed rounded-3xl bg-zinc-900/20 space-y-3">
              <FileText className="text-zinc-600 mb-2" size={40} />
              <p className="text-white text-base font-bold">No onboarding submissions found</p>
              <p className="text-zinc-500 text-xs">Submissions from clients on /onboarding will appear here instantly.</p>
            </div>
          </Reveal>
        )}
      </div>

      {/* FULL DETAILS MODAL */}
      <AnimatePresence>
        {selectedSubForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Briefcase className="text-blue-400" size={20} />
                    {selectedSubForDetail.business_name || "Client Submission Detail"}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Submitted by {selectedSubForDetail.full_name} on {new Date(selectedSubForDetail.created_at).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => setSelectedSubForDetail(null)}
                  className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-900 transition-colors"
                >
                  <XCircle size={22} />
                </button>
              </div>

              {/* Grid of All Form Fields */}
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Client Details</p>
                  <p className="text-white font-semibold">Name: <span className="font-normal text-zinc-300">{selectedSubForDetail.full_name}</span></p>
                  <p className="text-white font-semibold">Email: <span className="font-normal text-zinc-300">{selectedSubForDetail.email}</span></p>
                  <p className="text-white font-semibold">Phone: <span className="font-normal text-zinc-300">{selectedSubForDetail.phone}</span></p>
                  <p className="text-white font-semibold">City: <span className="font-normal text-zinc-300">{selectedSubForDetail.city || "Not specified"}</span></p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Business & Audience</p>
                  <p className="text-white font-semibold">Business Name: <span className="font-normal text-zinc-300">{selectedSubForDetail.business_name}</span></p>
                  <p className="text-white font-semibold">Business Type: <span className="font-normal text-zinc-300">{selectedSubForDetail.business_type || "N/A"}</span></p>
                  <p className="text-white font-semibold">Target Audience: <span className="font-normal text-zinc-300">{selectedSubForDetail.target_audience || "N/A"}</span></p>
                  <p className="text-white font-semibold">Existing Website: <span className="font-normal text-zinc-300">{selectedSubForDetail.website_url || (selectedSubForDetail.has_website ? "Yes" : "No")}</span></p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Plan & Budget</p>
                  <p className="text-white font-semibold">Selected Plan: <span className="font-normal text-zinc-300">{selectedSubForDetail.plan}</span></p>
                  <p className="text-white font-semibold">Budget: <span className="font-normal text-emerald-400 font-bold">{selectedSubForDetail.budget}</span></p>
                  <p className="text-white font-semibold">Timeline: <span className="font-normal text-zinc-300">{selectedSubForDetail.timeline}</span></p>
                  <p className="text-white font-semibold">Payment Gateway: <span className="font-normal text-zinc-300">{selectedSubForDetail.payment_gateway || "Default"}</span></p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Technical & Verification</p>
                  <p className="text-white font-semibold">Domain: <span className="font-normal text-zinc-300">{selectedSubForDetail.domain || "N/A"}</span></p>
                  <p className="text-white font-semibold">Contact Preference: <span className="font-normal text-zinc-300">{selectedSubForDetail.contact_method || "WhatsApp / Email"}</span></p>
                  <p className="text-white font-semibold">Digital Signature: <span className="font-serif italic font-bold text-emerald-400">{selectedSubForDetail.signature || "Checked"}</span></p>
                </div>
              </div>

              {/* Description & Features */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Detailed Description</p>
                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{selectedSubForDetail.description || "None provided."}</p>
                </div>

                {selectedSubForDetail.notes && (
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Additional Notes</p>
                    <p className="text-xs text-zinc-300 leading-relaxed">{selectedSubForDetail.notes}</p>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Requested Features</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Array.isArray(selectedSubForDetail.features) && selectedSubForDetail.features.length > 0 ? (
                      selectedSubForDetail.features.map((f: string) => (
                        <span key={f} className="text-xs font-semibold bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-xl text-zinc-200">
                          {f}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-500">Standard features</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                <Button 
                  onClick={() => setSelectedSubForDetail(null)}
                  variant="outline"
                  className="border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    const id = selectedSubForDetail.id;
                    setSelectedSubForDetail(null);
                    window.location.href = `/admin/agreements/preview?from_onboarding=${id}`;
                  }}
                  className="bg-[#355CFF] hover:bg-blue-600 text-white font-bold px-6"
                >
                  Proceed to Agreement
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Mail className="text-blue-500" size={18} /> Send Outreach to Client
                </h3>
                <button 
                  onClick={() => setShowEmailModal(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Sender Name</label>
                    <input 
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white text-xs focus:outline-none focus:border-[#355CFF] transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Sender Email</label>
                    <input 
                      type="text"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white text-xs focus:outline-none focus:border-[#355CFF] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Recipient Email</label>
                  <input 
                    type="text"
                    value={selectedSub?.email || ""}
                    disabled
                    className="w-full h-11 bg-zinc-900/50 border border-zinc-800/80 rounded-xl px-4 text-zinc-400 text-xs focus:outline-none cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Subject</label>
                  <input 
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white text-xs focus:outline-none focus:border-[#355CFF] transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email Body (Plain Text or HTML)</label>
                  <textarea 
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={7}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white text-xs font-medium focus:outline-none focus:border-[#355CFF] transition-colors resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                <Button 
                  onClick={() => setShowEmailModal(false)}
                  variant="outline"
                  className="border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendDynamicEmail}
                  disabled={emailSending}
                  className="bg-[#355CFF] hover:bg-blue-600 text-white font-bold px-6"
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

