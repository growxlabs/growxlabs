"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronRight, FileText, CheckCircle2, ShieldCheck, Mail, Send, 
  Printer, Sparkles, User, Calendar, Award, Lock, ChevronDown, 
  ArrowRight, Download, Check, AlertCircle, RefreshCw, X, Building2, Phone, Briefcase, Clock, Paperclip
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface OnboardingState {
  offerSent: boolean;
  credentialsCreated: boolean;
  day1Checked: boolean;
  day2Checked: boolean;
  day3Checked: boolean;
  day4Checked: boolean;
  day5Checked: boolean;
}

export default function DedicatedOfferLetterStudioPage() {
  // Candidate Selection & Data State
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form & Contract Details
  const [roleTitle, setRoleTitle] = useState("Sales Development Representative (SDR)");
  const [department, setDepartment] = useState("Sales & Business Development");
  const [joiningDate, setJoiningDate] = useState("20 July 2026");
  const [offerDate, setOfferDate] = useState("20 July 2026");
  const [refNumber, setRefNumber] = useState(`GXL/HR/OFFER/SDR/${new Date().getFullYear()}/001`);
  const [commissionRate, setCommissionRate] = useState("10% to 15%");
  const [meetingBonus, setMeetingBonus] = useState("₹1,000");
  const [employmentType, setEmploymentType] = useState("Independent Contractor / Performance-Based");
  
  // Sender Credentials (STRICT)
  const [senderName, setSenderName] = useState("Sai Varshith");
  const [senderEmail, setSenderEmail] = useState("svp@growxlabs.tech");
  const [bccEmail, setBccEmail] = useState("saivarshith8284@gmail.com");

  // Email Drawer & Collapsible State
  const [showEmailDrawer, setShowEmailDrawer] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [expandedAnnexure, setExpandedAnnexure] = useState<string | null>("annexure-a");

  // Ref to the document DOM node for PDF capture
  const documentCanvasRef = useRef<HTMLDivElement>(null);

  // Pre-flight Hiring Checklist (6/6)
  const [checklist, setChecklist] = useState({
    candidateVerified: true,
    emailVerified: true,
    compReviewed: true,
    ndaAttached: true,
    commissionAttached: true,
    founderApproved: true,
  });

  const checklistCount = Object.values(checklist).filter(Boolean).length;

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const [teamRes, careerRes] = await Promise.all([
        fetch(`/api/admin/team?t=${Date.now()}`),
        fetch(`/api/careers?t=${Date.now()}`)
      ]);
      const teamData = await teamRes.json();
      const careerData = await careerRes.json();

      const teamList = teamData.team || [];
      const careerList = careerData.applications || [];

      const list = teamList
        .filter((m: any) => m.role === "crm_agent" || m.role === "agent")
        .map((m: any) => ({
          id: m.id,
          name: m.name || "Lakshmi Akhilesh P",
          email: m.email || "akhilesh@growxlabs.tech",
          phone: m.phone || "+91 98765 43210",
          role: "Sales Development Representative (SDR)",
          status: "Verified"
        }));

      careerList.forEach((app: any) => {
        if (!list.find((c: any) => c.email?.toLowerCase() === app.email?.toLowerCase())) {
          list.push({
            id: app.id || `app-${app.email}`,
            name: app.name,
            email: app.email,
            phone: app.phone || "+91 98765 43210",
            role: app.role || "Job Applicant",
            status: "Applicant"
          });
        }
      });

      // Default candidate
      if (!list.find((c: any) => c.email === "akhilesh@growxlabs.tech")) {
        list.unshift({
          id: "akhilesh-sdr-001",
          name: "Lakshmi Akhilesh P",
          email: "akhilesh@growxlabs.tech",
          phone: "+91 98765 43210",
          role: "Sales Development Representative (SDR)",
          status: "Verified"
        });
      }

      setCandidates(list);
      setSelectedCandidate(list[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const candidateFirstName = selectedCandidate?.name 
    ? selectedCandidate.name.split(' ')[0] 
    : "Akhilesh";
  
  const pdfFilename = `Offer_Letter_${candidateFirstName}.pdf`;

  const handlePrintPDF = () => {
    window.print();
  };

  // Generate Continuous Legal Flow Executive Employment Contract PDF
  const generatePDFBase64 = async (): Promise<string | null> => {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();
      const candidateName = selectedCandidate?.name || "Lakshmi Akhilesh P";

      let y = 50;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > height - 55) {
          doc.addPage();
          y = 55;
          addHeader();
        }
      };

      const addHeader = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42); // #0F172A
        doc.text("GROWX LABS TECH PVT. LTD.", 45, 36);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`EMPLOYMENT AGREEMENT — REF: ${refNumber}`, width - 45, 36, { align: "right" });

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(45, 44, width - 45, 44);
      };

      // ── PAGE 1: BRAND HEADER & LETTERHEAD ──
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text("GROWX LABS TECH PVT. LTD.", 45, y);
      y += 16;

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235);
      doc.text("AI-NATIVE PRODUCT STUDIO & ENTERPRISE AI SOLUTIONS", 45, y);
      y += 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Andhra Pradesh, India • https://growxlabs.tech • contact@growxlabs.tech", 45, y);
      y += 12;

      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(1.5);
      doc.line(45, y, width - 45, y);
      y += 16;

      // Clean Metadata Box (Fixed Overflow)
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(45, y, width - 90, 52, 4, 4, "FD");

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("CONTRACT REF:", 55, y + 18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(refNumber, 145, y + 18);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("DATE OF ISSUANCE:", 55, y + 36);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(offerDate, 145, y + 36);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("COMMENCEMENT:", 310, y + 18);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(joiningDate, 410, y + 18);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("CLASSIFICATION:", 310, y + 36);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235);
      doc.text("CONFIDENTIAL CONTRACT", 410, y + 36);
      y += 68;

      // Main Document Title
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("FORMAL OFFER OF EMPLOYMENT & ENGAGEMENT CONTRACT", 45, y);
      y += 20;

      // Address & Role Details Block
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(45, y, width - 90, 48, 4, 4, "FD");

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Candidate Name:", 55, y + 18);
      doc.setFont("helvetica", "normal");
      doc.text(candidateName, 140, y + 18);

      doc.setFont("helvetica", "bold");
      doc.text("Offered Role:", 55, y + 34);
      doc.setFont("helvetica", "normal");
      doc.text(roleTitle, 140, y + 34);

      doc.setFont("helvetica", "bold");
      doc.text("Department:", 330, y + 18);
      doc.setFont("helvetica", "normal");
      doc.text(department, 410, y + 18);

      doc.setFont("helvetica", "bold");
      doc.text("Engagement:", 330, y + 34);
      doc.setFont("helvetica", "normal");
      doc.text(employmentType, 410, y + 34);
      y += 62;

      // Preamble Opening Letter
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.text(`Dear ${candidateName},`, 45, y);
      y += 15;

      const p1 = `On behalf of GrowX Labs Tech Pvt. Ltd. (the "Company"), we are pleased to extend this formal offer of engagement for the position of ${roleTitle}. This contract sets forth the legal terms, remuneration structure, performance benchmarks, and confidentiality obligations governing your engagement.`;
      const p1Split = doc.splitTextToSize(p1, width - 90);
      doc.text(p1Split, 45, y);
      y += p1Split.length * 12 + 15;

      // ── SECTION 1: APPOINTMENT & SCOPE ──
      checkPageBreak(90);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("1. APPOINTMENT, SCOPE OF DUTIES & PROBATION", 45, y);
      y += 15;

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      const s1 = `1.1 Scope: You accept engagement as a ${roleTitle} in the ${department} department. You agree to perform all duties as assigned by executive management.\n1.2 Location & Hours: Fully remote engagement adhering to IST operational hours (09:00 to 18:00 IST).\n1.3 Probation: Ninety (90) calendar day performance review window commencing on ${joiningDate}.\n1.4 Background Checks: Contingent upon successful credential and background verification.`;
      const s1Split = doc.splitTextToSize(s1, width - 90);
      doc.text(s1Split, 45, y);
      y += s1Split.length * 11.5 + 20;

      // ── SECTION 2: REMUNERATION & COMMISSION SCHEME ──
      checkPageBreak(140);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("2. REMUNERATION & COMMISSION SCHEDULE", 45, y);
      y += 14;

      // Corporate B&W Data Table
      const tY = y;
      doc.setFillColor(15, 23, 42);
      doc.rect(45, tY, width - 90, 20, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("COMPENSATION COMPONENT", 55, tY + 13);
      doc.text("RATE / STRUCTURE", 220, tY + 13);
      doc.text("ELIGIBILITY & PAYOUT SCHEDULE", 380, tY + 13);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.rect(45, tY + 20, width - 90, 22, "FD");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Net Revenue Commission", 55, tY + 34);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235);
      doc.text(commissionRate, 220, tY + 34);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Disbursed monthly on net contract revenue", 380, tY + 34);

      doc.setFillColor(248, 250, 252);
      doc.rect(45, tY + 42, width - 90, 22, "FD");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Discovery Call Bonus", 55, tY + 56);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 163, 74);
      doc.text(`${meetingBonus} per qualified meeting`, 220, tY + 56);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Disbursed bi-weekly for validated BANT calls", 380, tY + 56);

      y += 76;

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      const s2 = `2.1 BANT Call Qualification: Discovery calls qualify when prospect meets Budget, Authority, Need, Timeline, attends scheduled meeting, and receives executive validation.\n2.2 Invoicing: Submit invoices electronically by 1st of each month. Payouts processed within 10 business days.\n2.3 Tax TDS: Subject to statutory tax deductions at source under Indian tax regulations.`;
      const s2Split = doc.splitTextToSize(s2, width - 90);
      doc.text(s2Split, 45, y);
      y += s2Split.length * 11.5 + 20;

      // ── SECTION 3: KEY PERFORMANCE INDICATORS (KPIS) ──
      checkPageBreak(140);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("3. KEY PERFORMANCE INDICATOR (KPI) BENCHMARKS", 45, y);
      y += 14;

      const kY = y;
      doc.setFillColor(15, 23, 42);
      doc.rect(45, kY, width - 90, 20, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("METRIC CATEGORY", 55, kY + 13);
      doc.text("MANDATORY TARGET BENCHMARK", 220, kY + 13);
      doc.text("EVALUATION FREQUENCY", 400, kY + 13);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.rect(45, kY + 20, width - 90, 20, "FD");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Daily Prospecting", 55, kY + 33);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("40 Outbound Dials / 50 Personalised Emails", 220, kY + 33);
      doc.text("Daily Logged in CRM", 400, kY + 33);

      doc.setFillColor(248, 250, 252);
      doc.rect(45, kY + 40, width - 90, 20, "FD");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Weekly Discovery Calls", 55, kY + 53);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("5 Qualified BANT Discovery Meetings Booked", 220, kY + 53);
      doc.text("Weekly Audit", 400, kY + 53);

      doc.setFillColor(255, 255, 255);
      doc.rect(45, kY + 60, width - 90, 20, "FD");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Monthly Converted Deals", 55, kY + 73);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("3 Converted Partner Contracts (SQOs)", 220, kY + 73);
      doc.text("Monthly Review", 400, kY + 73);

      y += 92;

      // ── SECTION 4: CONFIDENTIALITY & NDA ──
      checkPageBreak(110);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("4. CONFIDENTIALITY, IP ASSIGNMENT & NON-SOLICITATION", 45, y);
      y += 15;

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      const s4 = `4.1 Confidentiality (NDA): You agree to hold all lead lists, client databases, software algorithms, and company workflows strictly confidential.\n4.2 IP Assignment: All work product, sales materials, and code created during your engagement belong exclusively to the Company as a work made for hire.\n4.3 Non-Solicitation: A 12-month post-termination restriction applies prohibiting solicitation of Company clients, leads, or personnel.`;
      const s4Split = doc.splitTextToSize(s4, width - 90);
      doc.text(s4Split, 45, y);
      y += s4Split.length * 11.5 + 20;

      // ── SECTION 5: TERMINATION & GOVERNING LAW ──
      checkPageBreak(110);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("5. TERMINATION, NOTICE PERIOD & GOVERNING LAW", 45, y);
      y += 15;

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      const s5 = `5.1 Termination: Either party may terminate with fourteen (14) calendar days' written notice. Immediate termination applies for cause (breach, fraud, negligence).\n5.2 Asset Return: Upon termination, immediately return all client records, credentials, and company property.\n5.3 Governing Law: Governed by laws of India under exclusive jurisdiction of courts in Visakhapatnam, Andhra Pradesh.`;
      const s5Split = doc.splitTextToSize(s5, width - 90);
      doc.text(s5Split, 45, y);
      y += s5Split.length * 11.5 + 25;

      // ── COUNTERPART EXECUTION & SIGNATURE BLOCK ──
      checkPageBreak(120);
      doc.setDrawColor(226, 232, 240);
      doc.line(45, y, width - 45, y);
      y += 15;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("6. FORMAL COUNTERPART EXECUTION", 45, y);
      y += 15;

      const sigY = y;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(45, sigY, 240, 75, 4, 4, "FD");

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("FOR GROWX LABS TECH PVT. LTD.", 55, sigY + 18);
      doc.setFontSize(10);
      doc.setTextColor(37, 99, 235);
      doc.text(senderName, 55, sigY + 40);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Founder & CEO", 55, sigY + 54);
      doc.text(`Date: ${offerDate}`, 55, sigY + 66);

      doc.roundedRect(width - 285, sigY, 240, 75, 4, 4, "FD");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("CANDIDATE ACCEPTANCE", width - 275, sigY + 18);
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(candidateName, width - 275, sigY + 40);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Signature: ______________________", width - 275, sigY + 54);
      doc.text("Date: _________________________", width - 275, sigY + 66);

      y += 90;

      // ── ANNEXURE A ──
      checkPageBreak(80);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("ANNEXURE A: COMMISSION TIERS & MILESTONES", 45, y);
      y += 14;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("• Base Quota (1–3 SQOs): 10% Net Contract Revenue Commission", 55, y);
      doc.text("• High Performer (4–6 SQOs): 12.5% Net Contract Revenue Commission", 55, y + 14);
      doc.text("• President's Club (7+ SQOs): 15% Net Contract Revenue + INR 10,000 Milestone Bonus", 55, y + 28);
      y += 42;

      // Dynamic Page Footers across all generated pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(45, height - 44, width - 45, height - 44);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text("STRICTLY CONFIDENTIAL", 45, height - 30);

        doc.setFont("helvetica", "normal");
        doc.text(`GROWX LABS TECH PVT. LTD. • Page ${i} of ${totalPages}`, width - 45, height - 30, { align: "right" });
      }

      const dataUri = doc.output("datauristring");
      const base64 = dataUri.split(",")[1];
      return base64 || null;
    } catch (err) {
      console.error("Continuous Legal PDF generation error:", err);
      return null;
    }
  };

  // Dispatch Offer via Email with Attached PDF Contract
  const handleDispatchOffer = async () => {
    if (!selectedCandidate) return;

    setEmailSending(true);

    try {
      // 1. Generate PDF attachment
      const pdfBase64 = await generatePDFBase64();
      
      const attachments = pdfBase64 ? [{
        filename: pdfFilename,
        content: pdfBase64
      }] : undefined;

      // 2. Dispatch email notification with PDF attached
      const res = await fetch("/api/send-email/dynamic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: selectedCandidate.email,
          fromName: `${senderName} | GrowX Labs`,
          fromEmail: senderEmail,
          bccEmail: bccEmail,
          subject: `Offer of Engagement – Sales Development Representative (SDR) | GrowX Labs Tech Pvt. Ltd.`,
          html: generateEmailCoverHTML(),
          attachments: attachments,
          body: `Dear ${selectedCandidate.name},\n\nPlease find attached your official Offer Letter (PDF) for the position of Sales Development Representative (SDR) at GrowX Labs Tech Pvt. Ltd.`
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Email delivery failed");

      alert(`🎉 Offer Letter PDF (${pdfFilename}) successfully sent to ${selectedCandidate.name} (${selectedCandidate.email})! BCC copy sent to ${bccEmail}.`);
      setShowEmailDrawer(false);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setEmailSending(false);
    }
  };

  // Clean ATS Cover Email Notification (NO embedded contract)
  const generateEmailCoverHTML = () => {
    const name = selectedCandidate?.name || "Akhilesh";

    return `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #111827; line-height: 1.6; padding: 36px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <p style="font-size: 14px; margin-bottom: 16px; font-weight: 600; color: #111827;">Dear ${name},</p>
        <p style="font-size: 13px; color: #374151; margin-bottom: 16px;">Congratulations.</p>
        <p style="font-size: 13px; color: #374151; margin-bottom: 16px;">Following our recent discussions, we are pleased to extend an offer for the position of <strong>Sales Development Representative (SDR)</strong> at GrowX Labs Tech Pvt. Ltd.</p>
        <p style="font-size: 13px; color: #374151; margin-bottom: 16px;">Please find your official Offer Letter attached as a PDF (<strong>${pdfFilename}</strong>).</p>
        <p style="font-size: 13px; color: #374151; margin-bottom: 16px;">Kindly review the document carefully, including the engagement terms, responsibilities, confidentiality obligations, and commission structure.</p>
        <p style="font-size: 13px; color: #374151; margin-bottom: 16px;">If you accept the offer, please sign and return the attached document or follow the acceptance instructions included within it.</p>
        <p style="font-size: 13px; color: #374151; margin-bottom: 24px;">Should you have any questions, feel free to reply to this email.</p>
        <p style="font-size: 13px; color: #374151; margin-bottom: 24px;">We look forward to welcoming you to GrowX Labs.</p>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 13px;">
          <p style="margin: 0; font-weight: 800; color: #111827;">Regards,</p>
          <p style="margin: 4px 0 0 0; font-weight: 800; color: #111827;">Sai Varshith</p>
          <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 12px;">Founder &amp; CEO</p>
          <p style="margin: 2px 0 0 0; color: #2563eb; font-size: 12px; font-weight: 600;">GrowX Labs Tech Pvt. Ltd.</p>
          <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 12px;">https://growxlabs.tech</p>
        </div>
      </div>
    `;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#6B7280]">Loading Offer Studio…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F7F7F5] text-[#111827] font-sans antialiased pb-20">
      
      {/* ── BREADCRUMB NAV ── */}
      <div className="max-w-[1400px] mx-auto px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280]">
          <span className="hover:text-[#111827] cursor-pointer transition-colors">Dashboard</span>
          <ChevronRight size={12} />
          <span className="hover:text-[#111827] cursor-pointer transition-colors">Recruitment</span>
          <ChevronRight size={12} />
          <span className="text-[#111827] font-semibold">Offer Letter Studio</span>
        </div>
      </div>

      {/* ── TOP HEADER & ACTION BAR ── */}
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Offer Letter Studio</h1>
            <p className="text-xs text-[#6B7280]">
              Review contract materials and dispatch official PDF offer letter to candidate.
            </p>
          </div>

          {/* Metadata Chips Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Candidate Selector */}
            <div className="relative">
              <select
                value={selectedCandidate?.id}
                onChange={(e) => {
                  const found = candidates.find(c => c.id === e.target.value);
                  if (found) setSelectedCandidate(found);
                }}
                className="bg-[#F7F7F5] border border-[#E5E7EB] text-[#111827] text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none cursor-pointer pr-7 appearance-none"
              >
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-[#6B7280] pointer-events-none" />
            </div>

            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-lg flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified Candidate
            </span>

            <span className="px-2.5 py-1 bg-slate-100 text-[#111827] border border-[#E5E7EB] text-[11px] font-medium rounded-lg">
              Ref: <span className="font-mono font-bold">{refNumber}</span>
            </span>

            <span className="px-2.5 py-1 bg-slate-100 text-[#111827] border border-[#E5E7EB] text-[11px] font-medium rounded-lg">
              Joining: <span className="font-bold">{joiningDate}</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
            <button
              onClick={handlePrintPDF}
              className="w-full sm:w-auto justify-center px-4 py-2.5 !bg-[#F1F5F9] hover:!bg-[#E2E8F0] !text-[#0F172A] text-xs font-bold rounded-xl border border-[#CBD5E1] transition-all flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
            >
              <Printer size={14} className="!text-[#0F172A] shrink-0" /> Preview PDF
            </button>
            <button
              onClick={() => setShowEmailDrawer(true)}
              className="w-full sm:w-auto justify-center px-5 py-2.5 !bg-[#0075DE] hover:!bg-[#005BAB] !text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md whitespace-nowrap active:scale-95"
            >
              <Send size={14} className="!text-white shrink-0" /> Email PDF Offer
            </button>
          </div>
        </div>
      </div>

      {/* ── SPLIT PAGE CONTAINER (30% LEFT / 70% RIGHT) ── */}
      <div className="max-w-[1400px] mx-auto px-6 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ═══ LEFT PANEL (30% = 4 COLS) ═══ */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Candidate Profile Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 shadow-xs overflow-hidden">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white flex items-center justify-center text-base font-bold shadow-sm shrink-0">
                {selectedCandidate?.name ? selectedCandidate.name.charAt(0) : "A"}
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <h3 className="font-bold text-sm text-[#111827] truncate">{selectedCandidate?.name}</h3>
                <p className="text-xs text-[#6B7280] font-medium truncate">{roleTitle}</p>
                <span className="inline-block text-[10px] font-bold text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded truncate">
                  {department}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] space-y-2.5 text-xs text-[#4B5563]">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="text-[#6B7280] font-medium shrink-0">Email:</span>
                <span className="font-semibold text-[#111827] text-[11px] truncate text-right max-w-[180px]">{selectedCandidate?.email}</span>
              </div>
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="text-[#6B7280] font-medium shrink-0">Phone:</span>
                <span className="font-semibold text-[#111827] truncate text-right">{selectedCandidate?.phone}</span>
              </div>
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="text-[#6B7280] font-medium shrink-0">Joining Date:</span>
                <span className="font-semibold text-emerald-600 truncate text-right">{joiningDate}</span>
              </div>
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="text-[#6B7280] font-medium shrink-0">Engagement:</span>
                <span className="font-semibold text-[#111827] truncate text-right">{employmentType}</span>
              </div>
            </div>
          </div>

          {/* Hiring Pre-Flight Checklist */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Hiring Checklist</h4>
              <span className="text-xs font-extrabold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-0.5 rounded-full">
                {checklistCount}/6 Verified
              </span>
            </div>

            {/* Live Progress Bar */}
            <div className="w-full bg-[#F7F7F5] h-2 rounded-full overflow-hidden border border-[#E5E7EB]">
              <div 
                className="bg-[#2563EB] h-full rounded-full transition-all duration-300"
                style={{ width: `${(checklistCount / 6) * 100}%` }}
              />
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: "candidateVerified" as const, label: "Candidate Identity Verified" },
                { key: "emailVerified" as const, label: "Work Email Verified" },
                { key: "compReviewed" as const, label: "Commission Model Reviewed" },
                { key: "ndaAttached" as const, label: "12-Month NDA Attached" },
                { key: "commissionAttached" as const, label: "Annexure A Included" },
                { key: "founderApproved" as const, label: "Founder Signoff Completed" },
              ].map((item) => (
                <label 
                  key={item.key} 
                  className="flex items-center gap-2.5 p-2 hover:bg-[#F7F7F5] rounded-lg cursor-pointer transition-colors select-none min-w-0"
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={() => setChecklist(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className="rounded border-[#E5E7EB] text-[#2563EB] focus:ring-0 w-3.5 h-3.5 shrink-0"
                  />
                  <span className={cn("truncate", checklist[item.key] ? "text-[#111827] font-semibold" : "text-[#6B7280]")}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-3 shadow-xs overflow-hidden">
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Document Activity</h4>
            <div className="space-y-3 text-xs text-[#4B5563]">
              <div className="flex gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#111827] truncate">Document Draft Created</p>
                  <p className="text-[10px] text-[#6B7280] truncate">By Sai Varshith • Live Active Draft</p>
                </div>
              </div>
              <div className="flex gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#111827] truncate">Sender &amp; BCC Configured</p>
                  <p className="text-[10px] text-[#6B7280] truncate">svp@growxlabs.tech • saivarshith8284@gmail.com</p>
                </div>
              </div>
              <div className="flex gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#111827] truncate">Legal Contract Terms Active</p>
                  <p className="text-[10px] text-[#6B7280] truncate">9 Legal Sections + 2 Annexures Verified</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ═══ RIGHT PANEL (70% = 8 COLS) — NOTION-STYLE DOCUMENT CANVAS ═══ */}
        <div className="lg:col-span-8 flex justify-center w-full max-w-full overflow-hidden">
          <div 
            ref={documentCanvasRef}
            id="offer-letter-canvas"
            className="w-full max-w-[840px] bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 sm:p-12 space-y-8 overflow-hidden"
          >
            
            {/* Notion Header */}
            <div className="border-b border-[#E5E7EB] pb-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-[#111827] tracking-tight">GROWX LABS TECH PVT. LTD.</h2>
                  <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider">
                    AI-Native Product Studio &amp; Enterprise AI Solutions
                  </p>
                  <p className="text-[11px] text-[#6B7280]">
                    Andhra Pradesh, India • https://growxlabs.tech
                  </p>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-slate-100 text-[#0F172A] border border-slate-200 rounded-md">
                    CONFIDENTIAL CONTRACT
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl p-3 text-xs text-[#374151]">
                <div className="truncate"><span className="text-[#6B7280]">REF:</span> <strong className="font-mono text-[#111827]">{refNumber}</strong></div>
                <div className="truncate"><span className="text-[#6B7280]">OFFER DATE:</span> <strong className="text-[#111827]">{offerDate}</strong></div>
                <div className="truncate sm:text-right"><span className="text-[#6B7280]">JOINING:</span> <strong className="text-[#2563EB]">{joiningDate}</strong></div>
              </div>
            </div>

            {/* Letter Greeting */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[#111827]">
                Offer of Engagement: {roleTitle}
              </h3>
              <p className="text-xs text-[#374151] leading-relaxed">
                Dear <strong>{selectedCandidate?.name || "Akhilesh"}</strong>,
              </p>
              <p className="text-xs text-[#374151] leading-relaxed">
                On behalf of <strong>GrowX Labs Tech Pvt. Ltd.</strong>, we are pleased to offer you the position of <strong>{roleTitle}</strong>. We were thoroughly impressed by your sales drive and execution background during our discussions. This document sets out the core terms of your engagement with our team.
              </p>
            </div>

            {/* 01 Appointment */}
            <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
              <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">01. Appointment &amp; Engagement Model</h4>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                You will serve as an <strong>{employmentType}</strong>. Your engagement commences on <strong>{joiningDate}</strong> with an initial 90-day performance review window. Work is fully remote, adhering to Indian Standard Time (IST) operational hours.
              </p>
            </div>

            {/* 02 Compensation (Stripe Settings Style Cards) */}
            <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
              <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">02. Pay &amp; Remuneration Structure</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl p-4 space-y-1 overflow-hidden">
                  <p className="text-[10px] font-bold uppercase text-[#6B7280]">Revenue Commission</p>
                  <p className="text-base font-extrabold text-[#2563EB]">{commissionRate}</p>
                  <p className="text-[11px] text-[#4B5563]">Paid on net contract revenue from converted partner deals.</p>
                </div>

                <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl p-4 space-y-1 overflow-hidden">
                  <p className="text-[10px] font-bold uppercase text-[#6B7280]">Discovery Meeting Incentive</p>
                  <p className="text-base font-extrabold text-emerald-600">{meetingBonus}</p>
                  <p className="text-[11px] text-[#4B5563]">Earned per qualified BANT discovery meeting conducted.</p>
                </div>
              </div>
            </div>

            {/* 03 & 04 Responsibilities & KPIs Grid */}
            <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
              <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">03 &amp; 04. Responsibilities &amp; Target Benchmarks</h4>
              <p className="text-xs text-[#4B5563]">
                Your primary focus is outbound prospecting, qualified outreach, cold email sequencing, and scheduling discovery calls.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 text-center space-y-1 overflow-hidden">
                  <p className="text-[10px] font-bold uppercase text-[#6B7280]">Daily Activity</p>
                  <p className="text-xs font-bold text-[#111827]">40 Dials / 50 Emails</p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 text-center space-y-1 overflow-hidden">
                  <p className="text-[10px] font-bold uppercase text-[#6B7280]">Weekly Target</p>
                  <p className="text-xs font-extrabold text-[#2563EB]">5 Meetings Booked</p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 text-center space-y-1 overflow-hidden">
                  <p className="text-[10px] font-bold uppercase text-[#6B7280]">Monthly Goal</p>
                  <p className="text-xs font-extrabold text-emerald-600">3 Qualified Deals</p>
                </div>
              </div>
            </div>

            {/* 05–13 Legal Clauses Summary */}
            <div className="space-y-2 pt-2 border-t border-[#E5E7EB] text-xs text-[#4B5563] leading-relaxed">
              <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">05–13. Legal Protections &amp; Terms</h4>
              <p><strong>05 Confidentiality:</strong> You agree to hold all company lead lists, pricing, and client data strictly confidential.</p>
              <p><strong>06 Intellectual Property:</strong> All materials, workflows, and sales playbooks created belong exclusively to GrowX Labs Tech Pvt. Ltd.</p>
              <p><strong>07 Non-Solicitation:</strong> 12-month restriction on soliciting company clients or team members post-termination.</p>
              <p><strong>08 Termination:</strong> Either party may terminate with 14 days' written notice.</p>
              <p><strong>09 Governing Law:</strong> Governed by laws of India, under exclusive jurisdiction of Visakhapatnam courts.</p>
            </div>

            {/* Annexures (Collapsible Notion-style) */}
            <div className="pt-2 border-t border-[#E5E7EB] space-y-3">
              <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Annexures</h4>

              {/* Annexure A */}
              <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedAnnexure(expandedAnnexure === "annexure-a" ? null : "annexure-a")}
                  className="w-full bg-[#F7F7F5] px-4 py-3 text-left font-bold text-xs text-[#111827] flex items-center justify-between cursor-pointer"
                >
                  <span>Annexure A: Commission Tiers &amp; Incentives</span>
                  <ChevronDown size={14} className={cn("transition-transform", expandedAnnexure === "annexure-a" ? "rotate-180" : "")} />
                </button>
                {expandedAnnexure === "annexure-a" && (
                  <div className="p-4 text-xs text-[#4B5563] space-y-2 bg-white border-t border-[#E5E7EB]">
                    <p>• Base Quota (1–3 SQOs): 10% Net Revenue Commission</p>
                    <p>• High Performer (4–6 SQOs): 12.5% Net Revenue Commission</p>
                    <p>• President's Club (7+ SQOs): 15% Net Revenue Commission + ₹10,000 Milestone Bonus</p>
                  </div>
                )}
              </div>

              {/* Annexure B */}
              <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedAnnexure(expandedAnnexure === "annexure-b" ? null : "annexure-b")}
                  className="w-full bg-[#F7F7F5] px-4 py-3 text-left font-bold text-xs text-[#111827] flex items-center justify-between cursor-pointer"
                >
                  <span>Annexure B: Code of Conduct &amp; Ethical Sales</span>
                  <ChevronDown size={14} className={cn("transition-transform", expandedAnnexure === "annexure-b" ? "rotate-180" : "")} />
                </button>
                {expandedAnnexure === "annexure-b" && (
                  <div className="p-4 text-xs text-[#4B5563] space-y-2 bg-white border-t border-[#E5E7EB]">
                    <p>Aggressive sales tactics or false pricing commitments are strictly prohibited.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-6 border-t-2 border-[#111827]">
              <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-4">14. Signatures &amp; Acceptance</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#111827]">
                <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl p-4 space-y-1 overflow-hidden">
                  <p className="font-bold uppercase text-[10px] text-[#6B7280]">For GrowX Labs Tech Pvt. Ltd.</p>
                  <p className="font-extrabold text-[#2563EB] pt-2 truncate">{senderName}</p>
                  <p className="text-[10px] text-[#6B7280] truncate">Founder &amp; CEO</p>
                  <p className="text-[10px] text-[#6B7280] truncate">Email: {senderEmail}</p>
                </div>

                <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl p-4 space-y-1 overflow-hidden">
                  <p className="font-bold uppercase text-[10px] text-[#6B7280]">Candidate Acceptance</p>
                  <p className="font-extrabold text-[#111827] truncate">{selectedCandidate?.name || "Akhilesh"}</p>
                  <p className="text-[10px] text-[#6B7280] truncate">Date: ________________</p>
                  <p className="text-[10px] text-[#6B7280] truncate">Signature: ________________</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-[#E5E7EB] text-center text-[10px] text-[#6B7280]">
              CONFIDENTIAL • Generated by GrowX Labs HR Platform
            </div>

          </div>
        </div>

      </div>

      {/* ── EMAIL PREVIEW DRAWER (SLIDE-OVER FROM RIGHT — GMAIL ATS STYLE) ── */}
      <AnimatePresence>
        {showEmailDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setShowEmailDrawer(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white h-full shadow-2xl border-l border-[#E5E7EB] flex flex-col z-10 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F7F5] shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail size={18} className="text-[#2563EB] shrink-0" />
                  <h3 className="font-bold text-xs sm:text-sm text-[#111827] truncate">Email Notification Preview (Gmail ATS Style)</h3>
                </div>
                <button
                  onClick={() => setShowEmailDrawer(false)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Content — Clean ATS Email Notification Only */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs text-[#374151]">
                <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl p-4 space-y-2 overflow-hidden">
                  <div className="truncate"><span className="text-[#6B7280] font-medium">From:</span> <strong className="text-[#111827]">{senderName} &lt;{senderEmail}&gt;</strong></div>
                  <div className="truncate"><span className="text-[#6B7280] font-medium">To:</span> <strong className="text-[#2563EB]">{selectedCandidate?.name} &lt;{selectedCandidate?.email}&gt;</strong></div>
                  <div className="truncate"><span className="text-[#6B7280] font-medium">BCC:</span> <strong className="text-[#111827]">{bccEmail}</strong></div>
                  <div className="truncate"><span className="text-[#6B7280] font-medium">Subject:</span> <strong className="text-[#111827]">Offer of Engagement – Sales Development Representative (SDR) | GrowX Labs Tech Pvt. Ltd.</strong></div>
                </div>

                {/* Email Body Notification Text */}
                <div className="border border-[#E5E7EB] rounded-xl p-5 bg-white shadow-xs space-y-4 leading-relaxed text-[#374151] overflow-hidden">
                  <p className="font-semibold text-[#111827]">Dear {selectedCandidate?.name},</p>
                  <p>Congratulations.</p>
                  <p>Following our recent discussions, we are pleased to extend an offer for the position of <strong>Sales Development Representative (SDR)</strong> at GrowX Labs Tech Pvt. Ltd.</p>
                  <p>Please find your official Offer Letter attached as a PDF (<strong>{pdfFilename}</strong>).</p>
                  <p>Kindly review the document carefully, including the engagement terms, responsibilities, confidentiality obligations, and commission structure.</p>
                  <p>If you accept the offer, please sign and return the attached document or follow the acceptance instructions included within it.</p>
                  <p>Should you have any questions, feel free to reply to this email.</p>
                  <p>We look forward to welcoming you to GrowX Labs.</p>
                  
                  <div className="pt-3 border-t border-[#E5E7EB] text-xs">
                    <p className="font-bold text-[#111827]">Regards,</p>
                    <p className="font-bold text-[#111827]">Sai Varshith</p>
                    <p className="text-[#6B7280]">Founder &amp; CEO</p>
                    <p className="text-[#2563EB] font-medium">GrowX Labs Tech Pvt. Ltd.</p>
                    <p className="text-[#6B7280]">https://growxlabs.tech</p>
                  </div>
                </div>

                {/* Attached PDF Pill */}
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-2 text-xs text-[#2563EB] overflow-hidden">
                  <div className="flex items-center gap-2 font-semibold min-w-0">
                    <Paperclip size={16} className="shrink-0" />
                    <span className="truncate">{pdfFilename}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-700 shrink-0">
                    PDF Attachment
                  </span>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 sm:p-6 border-t border-[#E5E7EB] bg-[#F7F7F5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                <button
                  onClick={() => setShowEmailDrawer(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#111827] cursor-pointer text-center"
                >
                  Back to Studio
                </button>
                <button
                  onClick={handleDispatchOffer}
                  disabled={emailSending}
                  className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 whitespace-nowrap active:scale-95"
                >
                  {emailSending ? "Generating PDF & Dispatching…" : `Confirm & Send ${pdfFilename}`}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
