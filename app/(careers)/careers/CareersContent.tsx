"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, AlertCircle, Loader2, FileText } from "lucide-react";
import { useRouter } from "@/navigation-client";
import { cn } from "@/lib/utils";
import { FlickerText } from "@/components/marketing/FlickerText";

// Roles list
const ROLES = [
  "Sales Development Representative (SDR)",
  "AI / LLM Engineer",
  "Full-Stack Developer (Next.js/Node)",
  "UI / UX Designer",
  "Custom Automation Specialist",
];

// Tech stack options
const TECH_OPTIONS = [
  "React / Next.js",
  "Node.js / TypeScript",
  "Python / FastAPI",
  "LangChain / LlamaIndex",
  "n8n / Workflows",
  "Supabase / PostgreSQL",
  "Figma / UI Design",
  "Docker / AWS",
];

// Notice period options
const NOTICE_PERIODS = [
  "Immediate (Within 7 days)",
  "15 Days",
  "30 Days",
  "60+ Days",
];

// Employment type options
const EMPLOYMENT_TYPES = [
  "Full-Time (Remote)",
  "Part-Time (Remote)",
  "Contract / Freelance",
];

// Open job listings database
const JOB_POSTINGS = [
  {
    slug: "sdr-intern",
    title: "Sales Development Representative (SDR)",
    department: "Business Development",
    type: "Founding Internship",
    location: "Remote (India)",
    compensation: "Performance-Based Incentives (No fixed stipend)",
    shortDesc: "Drive outbound B2B sales by researching prospects, initiating conversations on LinkedIn/Email, qualifying leads, and scheduling discovery calls.",
    about: "GrowX Labs is an AI-native software company building intelligent products, automation solutions, and custom software for startups and businesses. As an early-stage company, we're building our founding team to shape the future of AI-powered software.",
    roleDesc: "We're looking for a Founding Sales Development Representative (SDR) to help us build our outbound sales engine from the ground up. You'll be responsible for identifying potential clients, initiating conversations, qualifying opportunities, and scheduling meetings with the founder. This is a high-impact role for someone who wants hands-on startup experience and enjoys speaking with founders, agencies, and business owners.",
    whatYoullDo: [
      "Identify and research prospective clients.",
      "Reach out through cold calls, email, LinkedIn, and WhatsApp.",
      "Qualify leads based on business requirements.",
      "Schedule discovery meetings with qualified prospects.",
      "Understand client challenges and identify opportunities.",
      "Maintain accurate CRM records and follow-up activities.",
      "Work directly with the founder to improve outreach strategies.",
      "Contribute to building GrowX Labs' sales process from day one."
    ],
    whoCanApply: [
      "Excellent communication and interpersonal skills.",
      "Confident speaking with business owners and decision-makers.",
      "Self-motivated, proactive, and eager to learn.",
      "Passionate about startups, technology, and AI.",
      "Basic understanding of B2B sales is a plus.",
      "Prior sales or outreach experience is preferred but not required."
    ],
    whatYoullGain: [
      "Work directly with the founder.",
      "Real-world experience in B2B sales and client acquisition.",
      "Ownership from day one in a fast-growing startup.",
      "Mentorship and exposure to AI products and software consulting.",
      "Opportunity to transition into a paid full-time role as GrowX Labs scales."
    ],
    hiringProcess: [
      "Application Review",
      "Introductory Call",
      "Sales Assessment / Mock Client Call",
      "Final Discussion",
      "Offer & Onboarding"
    ]
  }
];

export function CareersContent() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = Intro, 1-17 = Fields, 18 = Success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [utcTime, setUtcTime] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const [jobsList, setJobsList] = useState<any[]>(JOB_POSTINGS);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch("/api/careers/jobs");
        const data = await res.json();
        if (data.jobs && data.jobs.length > 0) {
          const formatted = data.jobs.map((job: any) => {
            const isVideo = job.title.toLowerCase().includes("video") || job.title.toLowerCase().includes("videographer") || job.title.toLowerCase().includes("content creator");
            return {
              slug: job.id || job.title.toLowerCase().replace(/\s+/g, "-"),
              title: job.title,
              department: isVideo ? "Creative & Content" : "Engineering & Design",
              type: "Founding Role",
              location: "Remote (India)",
              compensation: job.salary_range || "Market Standard",
              shortDesc: job.description || "",
              about: "GrowX Labs is an AI-native software company building intelligent products, automation solutions, and custom software for startups and businesses.",
              roleDesc: job.description || "",
              whatYoullDo: Array.isArray(job.requirements) ? job.requirements : (job.requirements || "").split(",").map((r: string) => r.trim()).filter(Boolean),
              whoCanApply: isVideo ? [
                "Proficiency in video editing software (Premiere Pro, DaVinci Resolve, CapCut)",
                "Experience shooting engaging video content for LinkedIn and YouTube",
                "Self-motivated, proactive, and creative"
              ] : [
                "Self-motivated and proactive",
                "Eager to learn and ship products quickly",
                "Strong execution capabilities"
              ],
              whatYoullGain: [
                "Work directly with the founding team",
                "Ownership from day one",
                "Mentorship and high growth opportunities"
              ],
              hiringProcess: ["Application Review", "Introductory Call", "Final Discussion"]
            };
          });
          setJobsList(formatted);
        }
      } catch (err) {
        console.error("Error loading careers jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    }
    loadJobs();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/careers/upload", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setFormData(prev => ({ ...prev, resume: result.url }));
      setUploadedFileName(file.name);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const startApplication = (roleName: string) => {
    setFormData(prev => ({ ...prev, role: roleName }));
    setStep(1); // Start at Step 1 (Name)
    setShowForm(true);
  };

  useEffect(() => {
    if (showForm) return;

    let isEnabled = false;
    const enableTimer = setTimeout(() => {
      isEnabled = true;
    }, 1200);

    let hasTriggered = false;
    const triggerTransition = () => {
      if (!isEnabled || hasTriggered) return;
      hasTriggered = true;
      setShowForm(true);
    };

    const handleMouseMove = () => {
      triggerTransition();
    };

    const handleTouchStart = () => {
      triggerTransition();
    };

    const handleClick = () => {
      triggerTransition();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("click", handleClick);

    return () => {
      clearTimeout(enableTimer);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("click", handleClick);
    };
  }, [showForm]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    role: "",
    experience: "",
    techStack: "", // will compile from array
    github: "",
    linkedin: "",
    portfolio: "",
    resume: "",
    jobTitle: "",
    company: "",
    expectedSalary: "",
    noticePeriod: "",
    employmentType: "",
    motivation: "",
  });

  const isVideoRole = (formData.role || "").toLowerCase().includes("video") || (formData.role || "").toLowerCase().includes("videographer") || (formData.role || "").toLowerCase().includes("content creator");

  // Selected tech stacks for Step 8
  const [selectedTech, setSelectedTech] = useState<string[]>([]);

  // Focus ref for inputs
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // UTC clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toISOString().split("T")[1].slice(0, 8) + "Z";
      setUtcTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Autofocus input on step change
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setError("");
  }, [step]);

  // Handle select inputs key triggers (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If intro step and press enter, start
      if (step === 0 && e.key === "Enter") {
        e.preventDefault();
        handleNext();
        return;
      }

      // Option selection via keyboard for specific steps
      if (step === 5) {
        // Role Selection
        const activeRoles = jobsList.length > 0 ? jobsList.map(j => j.title) : ROLES;
        const num = parseInt(e.key);
        if (num >= 1 && num <= activeRoles.length) {
          e.preventDefault();
          selectRole(activeRoles[num - 1]);
        }
      } else if (step === 16) {
        // Notice Period Selection
        const num = parseInt(e.key);
        if (num >= 1 && num <= NOTICE_PERIODS.length) {
          e.preventDefault();
          selectNoticePeriod(NOTICE_PERIODS[num - 1]);
        }
      } else if (step === 15) {
        // Employment Type Selection
        const num = parseInt(e.key);
        if (num >= 1 && num <= EMPLOYMENT_TYPES.length) {
          e.preventDefault();
          selectEmploymentType(EMPLOYMENT_TYPES[num - 1]);
        }
      }

      // Enter key for next on text inputs
      if (e.key === "Enter" && step > 0 && step !== 17 && step !== 8) {
        // Exclude step 17 (textarea) and step 8 (multi-select)
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, formData, selectedTech]);

  // Get current step category label
  const getStepCategory = () => {
    if (step === 0) return "INTRO";
    if (step >= 1 && step <= 4) return "PERSONAL DETAILS";
    if (step >= 5 && step <= 8) return "EXPERIENCE & SKILLS";
    if (step >= 9 && step <= 12) return "PROFESSIONAL LINKS";
    if (step >= 13 && step <= 16) return "LOGISTICS & PREFERENCES";
    if (step === 17) return "MOTIVATION";
    return "SUCCESS";
  };

  // Field validation
  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) return "Full name is required.";
        break;
      case 2:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) return "Email address is required.";
        if (!emailRegex.test(formData.email.trim())) return "Please enter a valid email address.";
        break;
      case 3:
        if (!formData.phone.trim()) return "Phone number is required.";
        break;
      case 4:
        if (!formData.location.trim()) return "Current location is required.";
        break;
      case 5:
        if (!formData.role) return "Please select a target role.";
        break;
      case 6:
        if (!formData.experience.trim()) return "Years of experience is required.";
        if (isNaN(Number(formData.experience))) return "Please enter a numerical value.";
        break;
      case 7:
        if (!formData.techStack.trim()) return "Please enter your primary tool or language.";
        break;
      case 8:
        if (selectedTech.length === 0) return "Select at least one skill option.";
        break;
      case 9:
        if (!isVideoRole && formData.github && !formData.github.startsWith("http")) return "Must be a valid URL starting with http:// or https://";
        break;
      case 10:
        if (formData.linkedin && !formData.linkedin.startsWith("http")) return "Must be a valid URL starting with http:// or https://";
        break;
      case 12:
        if (!formData.resume.trim()) return "Please upload your resume or CV.";
        break;
      case 13:
        if (!formData.jobTitle.trim()) return "Current/last job title is required.";
        break;
      case 14:
        if (!formData.company.trim()) return "Current/last employer is required.";
        break;
      case 15:
        if (!formData.employmentType) return "Please select employment preference.";
        break;
      case 16:
        if (!formData.noticePeriod) return "Please select notice period.";
        break;
      case 17:
        if (formData.motivation.trim().length < 15) return "Motivation statement must be at least 15 characters.";
        break;
      default:
        break;
    }
    return "";
  };

  // Navigations
  const handleNext = () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (step === 8) {
      // Compile tech selection into techStack info
      setFormData(prev => ({
        ...prev,
        techStack: `Primary: ${prev.techStack} | Skills: ${selectedTech.join(", ")}`
      }));
    }

    if (step === 4 && formData.role) {
      setStep(6);
    } else if (step === 17) {
      submitApplication();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step === 6 && formData.role) {
      setStep(4);
    } else if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  // Select handlers
  const selectRole = (role: string) => {
    setFormData(prev => ({ ...prev, role }));
    setTimeout(() => setStep(prev => prev + 1), 200);
  };

  const selectNoticePeriod = (noticePeriod: string) => {
    setFormData(prev => ({ ...prev, noticePeriod }));
    setTimeout(() => setStep(prev => prev + 1), 200);
  };

  const selectEmploymentType = (employmentType: string) => {
    setFormData(prev => ({ ...prev, employmentType }));
    setTimeout(() => setStep(prev => prev + 1), 200);
  };

  const toggleTechOption = (tech: string) => {
    setSelectedTech(prev => 
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  // Submit API Call
  const submitApplication = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const submitData = { ...formData };
      if (isVideoRole) {
        submitData.motivation = `[CAMERA & AUDIO GEAR]: ${formData.github || "None declared"}\n\n[MOTIVATION]: ${formData.motivation}`;
        submitData.github = ""; // Clear github URL so it passes backend DB schema URL check
      }

      const response = await fetch("/api/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Submission failed.");
      }

      setStep(18); // Success Step
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your inputs and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!showForm ? (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 w-full h-full bg-black text-white font-sans z-50 flex flex-col justify-between p-8 md:p-16 select-none overflow-hidden"
        >
          {/* Decorative Grid Mesh Background matching main site */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none -z-10" />

          {/* Top Row */}
          <div className="flex justify-between items-center text-[10px] font-mono font-bold tracking-widest text-zinc-500">
            <div>[GrowXLabs]</div>
            <div>// INTRO</div>
            <div>START</div>
          </div>

          {/* Middle Row with columns */}
          <div className="flex justify-end w-full mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 text-[9px] font-mono tracking-widest uppercase text-zinc-500 max-w-4xl w-full">
              <div>
                <p className="text-zinc-500 mb-1">We hire for</p>
                <p className="text-white font-bold">Curiosity, grit,<br />honesty</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-1">Status</p>
                <p className="text-white font-bold">1 open role<br />4 pipelined</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-1">Reply within</p>
                <p className="text-white font-bold">7 days,<br />always a human</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-1">© 2026</p>
                <p className="text-white font-bold">GrowX Labs<br />Pvt Ltd</p>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="w-full flex flex-col items-start">
            <h1 className="text-[12vw] font-bold tracking-tighter leading-none select-none text-white font-serif">
              <FlickerText text="Careers" />
            </h1>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 w-full h-full bg-black text-white font-sans z-40 flex flex-col justify-between pt-28 pb-8 px-8 md:pt-32 md:pb-12 md:px-12 xl:pt-36 xl:pb-16 xl:px-16 select-none overflow-hidden"
        >
          {/* Decorative Grid Mesh Background matching main site */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none -z-10" />

          {/* ═══ TOP HEADER BAR ═══ */}
          <header className="flex justify-between items-center text-xs font-mono font-bold tracking-widest text-zinc-500">
            <div>// CAREERS</div>
            <div className="text-zinc-400 transition-colors uppercase">{getStepCategory()}</div>
            <div>
              {step > 0 && step <= 17 ? (
                <span>{String(step).padStart(2, "0")} / 17</span>
              ) : step === 18 ? (
                <span>COMPLETED</span>
              ) : (
                <span>START</span>
              )}
            </div>
          </header>

          {/* ═══ MAIN STEP VIEWPORT ═══ */}
          <main className={cn(
            "flex-grow flex flex-col max-w-4xl mx-auto w-full relative",
            step === 0 ? "justify-start overflow-y-auto pt-6 pb-12 scrollbar-thin scrollbar-thumb-zinc-800 px-2" : "justify-center overflow-hidden"
          )}>
            
            {/* Back navigation indicator */}
            {step > 0 && step < 18 && (
              <button
                onClick={handleBack}
                className="absolute -left-12 lg:-left-20 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-full cursor-pointer transition-all active:scale-90 text-zinc-500 hover:text-white hidden md:block"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full flex flex-col items-start"
              >
                
                {/* Step label comment */}
                {step < 18 && (
                  <span className="font-mono text-xs text-zinc-500 tracking-wider mb-3">
                    // {step === 0 ? "CAREERS - 2026" : `QUESTION ${String(step).padStart(2, "0")}`}
                  </span>
                )}

                {/* ═══ STEP 0: JOB BOARD ═══ */}
                {step === 0 && (
                  <div className="w-full space-y-12">
                    {/* Header / Intro: Single-Column Corporate Layout */}
                    <div className="space-y-6 border-b border-white/10 pb-10">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold tracking-widest text-[#C0F0FB] uppercase">
                          GrowX Labs // Careers
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white leading-none font-sans">
                          Join the Lab.
                        </h1>
                      </div>
                      <div className="text-zinc-400 text-sm md:text-base leading-relaxed font-sans font-medium space-y-4 max-w-4xl">
                        <p>
                          GrowX Labs Tech is a growing AI-native software company and product studio based in India. We specialize in custom software development, AI agent engineering, intelligent automation solutions, and mobile and web application development.
                        </p>
                        <p>
                          We combine deep AI expertise with rapid product development to ship production-ready solutions in weeks, built to scale from day one. We don't build off-the-shelf systems. We build products.
                        </p>
                      </div>
                    </div>

                    {/* Open Job Listings Grid */}
                    <div className="space-y-6 w-full">
                      <div className="border-b border-white/10 pb-2 mb-4">
                        <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                          Active Listings ({jobsList.length})
                        </span>
                      </div>
                      
                      {jobsList.map((job) => {
                        const isExpanded = expandedJob === job.slug;
                        return (
                          <div key={job.slug} className="w-full border border-white/10 hover:border-white/20 bg-zinc-950/20 backdrop-blur-sm rounded-2xl p-6 md:p-8 transition-all space-y-6">
                            {/* Header section of job card */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                              <div>
                                <span className="text-[10px] font-mono font-bold tracking-widest text-[#C0F0FB] uppercase">
                                  {job.department} // {job.type.toUpperCase()}
                                </span>
                                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1 font-sans">
                                  {job.title}
                                </h2>
                                <div className="flex flex-wrap gap-2 mt-3 font-mono text-[9px] text-zinc-400 tracking-wider">
                                  <span className="border border-white/10 bg-white/5 px-2 py-0.5 rounded">
                                    {job.location.toUpperCase()}
                                  </span>
                                  <span className="border border-white/10 bg-white/5 px-2 py-0.5 rounded">
                                    INCENTIVE-BASED
                                  </span>
                                  <span className="border border-white/10 bg-white/5 px-2 py-0.5 rounded">
                                    FOUNDING INTERNSHIP
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 self-start md:self-center">
                                <button
                                  onClick={() => setExpandedJob(isExpanded ? null : job.slug)}
                                  className="px-3.5 py-1.5 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-all cursor-pointer"
                                >
                                  {isExpanded ? "Close Details" : "View Details"}
                                </button>
                                <button
                                  onClick={() => startApplication(job.title)}
                                  className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer font-bold"
                                >
                                  Apply Now
                                </button>
                              </div>
                            </div>

                            <p className="text-zinc-400 text-xs md:text-sm font-sans leading-relaxed">
                              {job.shortDesc}
                            </p>

                            {/* Expanded JD view */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.4, ease: "easeInOut" }}
                                  className="overflow-hidden border-t border-white/10 pt-6 space-y-8 text-xs md:text-sm w-full"
                                >
                                  <div className="space-y-3 mt-4">
                                    <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">// About the Role</h3>
                                    <p className="text-zinc-400 leading-relaxed font-sans">{job.roleDesc}</p>
                                  </div>

                                  <div className="space-y-3">
                                    <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">// What You'll Do</h3>
                                    <ul className="space-y-2 text-zinc-400 font-sans">
                                      {job.whatYoullDo.map((item: string, idx: number) => (
                                        <li key={idx} className="leading-relaxed flex items-start gap-2">
                                          <span className="text-[#C0F0FB] shrink-0 font-mono mt-0.5">→</span>
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="space-y-3">
                                    <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">// Who Can Apply</h3>
                                    <ul className="space-y-2 text-zinc-400 font-sans">
                                      {job.whoCanApply.map((item: string, idx: number) => (
                                        <li key={idx} className="leading-relaxed flex items-start gap-2">
                                          <span className="text-[#C0F0FB] shrink-0 font-mono mt-0.5">→</span>
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="space-y-3">
                                    <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">// What You'll Gain</h3>
                                    <ul className="space-y-2 text-zinc-400 font-sans">
                                      {job.whatYoullGain.map((item: string, idx: number) => (
                                        <li key={idx} className="leading-relaxed flex items-start gap-2">
                                          <span className="text-[#C0F0FB] shrink-0 font-mono mt-0.5">→</span>
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="space-y-3">
                                    <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">// Compensation</h3>
                                    <p className="text-zinc-400 leading-relaxed font-sans">
                                      This is a <strong>Founding Internship</strong>. There is <strong>no fixed stipend</strong> at this stage. Selected candidates will be eligible for <strong>performance-based incentives</strong> for successful client acquisitions. As GrowX Labs grows, high-performing interns will be considered for full-time paid opportunities.
                                    </p>
                                  </div>

                                  <div className="space-y-3">
                                    <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">// Hiring Process</h3>
                                    <div className="flex flex-wrap gap-2 items-center">
                                      {job.hiringProcess.map((step: string, idx: number) => (
                                        <span key={idx} className="flex items-center text-[9px] font-mono font-bold text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded">
                                          {idx + 1}. {step} {idx < job.hiringProcess.length - 1 && <span className="text-[#C0F0FB] ml-2 font-sans font-normal">➔</span>}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="pt-6 flex justify-end">
                                    <button
                                      onClick={() => startApplication(job.title)}
                                      className="px-6 py-2.5 bg-[#C0F0FB] hover:bg-[#a8e3f0] text-black font-mono font-bold text-[10px] uppercase tracking-wider rounded transition-all active:scale-95 cursor-pointer"
                                    >
                                      Apply for this role
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>

                    {/* General Application Card */}
                    <div className="border border-white/5 bg-zinc-950/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full font-sans">
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          General / Engineering Application
                        </h3>
                        <p className="text-zinc-500 text-xs font-sans max-w-md leading-relaxed">
                          Interested in building Next.js web applications, custom API pipelines, or AI integrations but don't see a specific fit? Apply generally.
                        </p>
                      </div>
                      <button
                        onClick={() => startApplication("")}
                        className="px-4 py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
                      >
                        Apply Generally
                      </button>
                    </div>
                  </div>
                )}

                {/* ═══ STEP 1: NAME ═══ */}
                {step === 1 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                      What is your full name?
                    </label>
                    <input
                      ref={inputRef as any}
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Type your answer here..."
                      className="border-b border-white/20 focus:border-white py-4 outline-none text-2xl md:text-3xl font-sans tracking-tight font-black bg-transparent w-full text-white transition-colors placeholder-zinc-700"
                    />
                  </div>
                )}

                {/* ═══ STEP 2: EMAIL ═══ */}
                {step === 2 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                      What is your email address?
                    </label>
                    <input
                      ref={inputRef as any}
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="border-b border-white/20 focus:border-white py-4 outline-none text-2xl md:text-3xl font-sans tracking-tight font-black bg-transparent w-full text-white transition-colors placeholder-zinc-700"
                    />
                  </div>
                )}

                {/* ═══ STEP 3: PHONE ═══ */}
                {step === 3 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                      What is your phone number?
                    </label>
                    <input
                      ref={inputRef as any}
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="border-b border-white/20 focus:border-white py-4 outline-none text-2xl md:text-3xl font-sans tracking-tight font-black bg-transparent w-full text-white transition-colors placeholder-zinc-700"
                    />
                  </div>
                )}

                {/* ═══ STEP 4: LOCATION ═══ */}
                {step === 4 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                      Where are you currently located?
                    </label>
                    <input
                      ref={inputRef as any}
                      type="text"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country"
                      className="border-b border-white/20 focus:border-white py-4 outline-none text-2xl md:text-3xl font-sans tracking-tight font-black bg-transparent w-full text-white transition-colors placeholder-zinc-700"
                    />
                  </div>
                )}

                {/* ═══ STEP 5: ROLE (Select) ═══ */}
                {step === 5 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight block mb-6">
                      What role are you applying for?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      {(jobsList.length > 0 ? jobsList.map(j => j.title) : ROLES).map((role, idx) => (
                        <button
                          key={role}
                          onClick={() => selectRole(role)}
                          className={cn(
                            "w-full p-5 text-left border rounded-xl flex justify-between items-center transition-all cursor-pointer group",
                            formData.role === role
                              ? "border-[#C0F0FB] bg-[#C0F0FB]/10 text-white"
                              : "border-white/10 bg-white/5 hover:border-[#C0F0FB]"
                          )}
                        >
                          <span className="font-sans font-semibold text-white">{role}</span>
                          <span className="font-mono text-[10px] bg-white/10 text-zinc-400 group-hover:bg-[#C0F0FB] group-hover:text-black px-2 py-1 rounded">
                            [{idx + 1}]
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ═══ STEP 6: EXP ═══ */}
                {step === 6 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                      How many years of professional experience do you have?
                    </label>
                    <input
                      ref={inputRef as any}
                      type="text"
                      value={formData.experience}
                      onChange={e => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="Years (e.g. 5)"
                      className="border-b border-white/20 focus:border-white py-4 outline-none text-2xl md:text-3xl font-sans tracking-tight font-black bg-transparent w-full text-white transition-colors placeholder-zinc-700"
                    />
                  </div>
                )}

                {/* ═══ STEP 7: TECH STACK (TEXT) ═══ */}
                {step === 7 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                      {isVideoRole ? "What is your primary video editing software?" : "What is your primary programming language or design tool?"}
                    </label>
                    <input
                      ref={inputRef as any}
                      type="text"
                      value={formData.techStack}
                      onChange={e => setFormData({ ...formData, techStack: e.target.value })}
                      placeholder={isVideoRole ? "Premiere Pro, DaVinci Resolve, CapCut, etc." : "TypeScript, Python, Figma, etc."}
                      className="border-b border-white/20 focus:border-white py-4 outline-none text-2xl md:text-3xl font-sans tracking-tight font-black bg-transparent w-full text-white transition-colors placeholder-zinc-700"
                    />
                  </div>
                )}

                {/* ═══ STEP 8: TECH STACK OPTIONS (Multi-select) ═══ */}
                {step === 8 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight block mb-6">
                      {isVideoRole ? "Select other creative and editing tools you are confident in:" : "Select other libraries and tools you are highly confident in:"}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full">
                      {(isVideoRole ? [
                        "Adobe Premiere Pro",
                        "DaVinci Resolve",
                        "Adobe After Effects",
                        "Final Cut Pro",
                        "CapCut",
                        "Photoshop / Canva",
                        "Sound Design / Mixing",
                        "Color Grading"
                      ] : TECH_OPTIONS).map((tech) => {
                        const isSelected = selectedTech.includes(tech);
                        return (
                          <button
                            key={tech}
                            onClick={() => toggleTechOption(tech)}
                            className={cn(
                              "p-3 text-center border rounded-lg transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer",
                              isSelected
                                ? "bg-white border-white text-black font-extrabold"
                                : "bg-white/5 border-white/10 text-zinc-300 hover:border-[#C0F0FB] hover:text-white"
                            )}
                          >
                            {tech}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                      <button
                        onClick={handleNext}
                        className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs uppercase tracking-wider rounded transition-all cursor-pointer"
                      >
                        Continue
                      </button>
                      <span className="font-mono text-[10px] text-zinc-500">click to continue</span>
                    </div>
                  </div>
                )}

                {/* ═══ STEP 9: GITHUB ═══ */}
                {step === 9 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                      {isVideoRole ? "What camera and audio equipment do you use? (Optional)" : "What is your GitHub profile URL? (Optional)"}
                    </label>
                    <input
                      ref={inputRef as any}
                      type={isVideoRole ? "text" : "url"}
                      value={formData.github}
                      onChange={e => setFormData({ ...formData, github: e.target.value })}
                      placeholder={isVideoRole ? "e.g. Sony A7III, iPhone 15 Pro, wireless microphone, lighting" : "https://github.com/yourusername"}
                      className="border-b border-white/20 focus:border-white py-4 outline-none text-2xl md:text-3xl font-sans tracking-tight font-black bg-transparent w-full text-white transition-colors placeholder-zinc-700"
                    />
                  </div>
                )}

                {/* ═══ STEP 10: LINKEDIN ═══ */}
                {step === 10 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                      What is your LinkedIn profile URL? (Optional)
                    </label>
                    <input
                      ref={inputRef as any}
                      type="url"
                      value={formData.linkedin}
                      onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/yourusername"
                      className="border-b border-white/20 focus:border-white py-4 outline-none text-2xl md:text-3xl font-sans tracking-tight font-black bg-transparent w-full text-white transition-colors placeholder-zinc-700"
                    />
                  </div>
                )}

                {/* ═══ STEP 11: PORTFOLIO ═══ */}
                {step === 11 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                      {isVideoRole ? "Link to your showreel or best video edit (YouTube, Google Drive, Loom)" : "What is your portfolio or website URL? (Optional)"}
                    </label>
                    <input
                      ref={inputRef as any}
                      type="url"
                      value={formData.portfolio}
                      onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                      placeholder={isVideoRole ? "e.g. https://youtube.com/watch?v=..." : "https://yourportfolio.com"}
                      className="border-b border-white/20 focus:border-white py-4 outline-none text-2xl md:text-3xl font-sans tracking-tight font-black bg-transparent w-full text-white transition-colors placeholder-zinc-700"
                    />
                  </div>
                )}

                {/* ═══ STEP 12: RESUME CV ═══ */}
                {step === 12 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight block">
                      Upload your resume or CV.
                    </label>
                    
                    {uploading ? (
                      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/20 rounded-xl bg-white/5 space-y-4">
                        <Loader2 className="animate-spin text-[#C0F0FB] h-8 w-8" />
                        <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">Uploading Document...</span>
                      </div>
                    ) : formData.resume ? (
                      <div className="flex items-center justify-between p-5 border border-emerald-500/20 bg-emerald-950/10 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-emerald-950/40 flex items-center justify-center text-emerald-400">
                            <Check size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{uploadedFileName || "resume.pdf"}</p>
                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Upload Complete</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setFormData(prev => ({ ...prev, resume: "" }));
                            setUploadedFileName("");
                          }}
                          className="px-3 py-1.5 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/5 rounded text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file) handleFileUpload(file);
                        }}
                        onClick={() => {
                          const fileInput = document.getElementById("resume-upload-input");
                          fileInput?.click();
                        }}
                        className="border border-dashed border-white/20 hover:border-[#C0F0FB]/40 bg-white/5 hover:bg-white/10 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-4 group"
                      >
                        <input
                          id="resume-upload-input"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                          }}
                        />
                        <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-[#C0F0FB]/10 text-zinc-400 group-hover:text-[#C0F0FB] flex items-center justify-center mx-auto transition-all">
                          <FileText size={24} />
                        </div>
                        <div>
                          <p className="font-sans font-bold text-white text-sm">
                            Drag and drop your file here, or <span className="text-[#C0F0FB] underline">browse</span>
                          </p>
                          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">
                            Supports PDF, DOC, DOCX up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ═══ STEP 13: LAST TITLE ═══ */}
                {step === 13 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                      What is your current or last job title?
                    </label>
                    <input
                      ref={inputRef as any}
                      type="text"
                      value={formData.jobTitle}
                      onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                      placeholder="e.g. Senior Software Engineer"
                      className="border-b border-white/20 focus:border-white py-4 outline-none text-2xl md:text-3xl font-sans tracking-tight font-black bg-transparent w-full text-white transition-colors placeholder-zinc-700"
                    />
                  </div>
                )}

                {/* ═══ STEP 14: LAST COMPANY ═══ */}
                {step === 14 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                      What is your current or last company / employer?
                    </label>
                    <input
                      ref={inputRef as any}
                      type="text"
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Company name..."
                      className="border-b border-white/20 focus:border-white py-4 outline-none text-2xl md:text-3xl font-sans tracking-tight font-black bg-transparent w-full text-white transition-colors placeholder-zinc-700"
                    />
                  </div>
                )}

                {/* ═══ STEP 15: EMPLOYMENT TYPE (Select) ═══ */}
                {step === 15 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight block mb-6">
                      Select your employment preference:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                      {EMPLOYMENT_TYPES.map((type, idx) => (
                        <button
                          key={type}
                          onClick={() => selectEmploymentType(type)}
                          className={cn(
                            "p-5 text-left border rounded-xl flex justify-between items-center transition-all cursor-pointer group",
                            formData.employmentType === type
                              ? "border-[#C0F0FB] bg-[#C0F0FB]/10 text-white"
                              : "border-white/10 bg-white/5 hover:border-[#C0F0FB]"
                          )}
                        >
                          <span className="font-sans font-semibold text-white text-sm">{type}</span>
                          <span className="font-mono text-[10px] bg-white/10 text-zinc-400 group-hover:bg-[#C0F0FB] group-hover:text-black px-2 py-1 rounded">
                            [{idx + 1}]
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ═══ STEP 16: NOTICE PERIOD (Select) ═══ */}
                {step === 16 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight block mb-6">
                      What is your notice period / availability to start?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      {NOTICE_PERIODS.map((period, idx) => (
                        <button
                          key={period}
                          onClick={() => selectNoticePeriod(period)}
                          className={cn(
                            "p-5 text-left border rounded-xl flex justify-between items-center transition-all cursor-pointer group",
                            formData.noticePeriod === period
                              ? "border-[#C0F0FB] bg-[#C0F0FB]/10 text-white"
                              : "border-white/10 bg-white/5 hover:border-[#C0F0FB]"
                          )}
                        >
                          <span className="font-sans font-semibold text-white">{period}</span>
                          <span className="font-mono text-[10px] bg-white/10 text-zinc-400 group-hover:bg-[#C0F0FB] group-hover:text-black px-2 py-1 rounded">
                            [{idx + 1}]
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ═══ STEP 17: MOTIVATION (Textarea) ═══ */}
                {step === 17 && (
                  <div className="w-full space-y-6">
                    <label className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                      Why do you want to join GrowX Labs Tech?
                    </label>
                    <textarea
                      ref={inputRef as any}
                      value={formData.motivation}
                      onChange={e => setFormData({ ...formData, motivation: e.target.value })}
                      placeholder="Tell us what drives you..."
                      rows={4}
                      className="border-b border-white/20 focus:border-white py-4 outline-none text-xl sm:text-2xl font-sans tracking-tight font-medium bg-transparent w-full text-white transition-colors resize-none placeholder-zinc-700"
                    />
                    <div className="flex items-center gap-4 pt-4">
                      <button
                        disabled={isSubmitting}
                        onClick={handleNext}
                        className="px-8 py-3.5 bg-white hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </button>
                      <span className="font-mono text-[10px] text-zinc-500">click to submit</span>
                    </div>
                  </div>
                )}

                {/* ═══ STEP 18: SUCCESS VIEW ═══ */}
                {step === 18 && (
                  <div className="space-y-8 max-w-xl">
                    <div className="w-16 h-16 rounded-full bg-emerald-950/30 text-emerald-400 flex items-center justify-center mb-6">
                      <Check className="w-8 h-8" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white leading-tight">
                      Application Submitted.
                    </h1>
                    <p className="text-lg text-zinc-400 font-sans tracking-tight leading-relaxed">
                      Thank you for applying. We will review your systems experience and get back to you at the email address provided within 48 hours.
                    </p>
                    <div className="pt-6">
                      <button
                        onClick={() => router.push("/")}
                        className="px-6 py-3 border border-zinc-750 hover:border-white text-white font-mono font-bold text-xs uppercase tracking-wider rounded transition-all cursor-pointer bg-transparent"
                      >
                        Go back Home
                      </button>
                    </div>
                  </div>
                )}

                {/* Validation/Error alerts */}
                {error && (
                  <div className="mt-6 flex items-center gap-2 text-xs font-mono font-bold text-red-400 bg-red-950/20 border border-red-950/30 px-4 py-3 rounded-md animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Hint for progress for text-steps (Next) */}
                {step > 0 && step <= 14 && step !== 5 && step !== 8 && (
                  <div className="mt-8 flex items-center gap-4 text-[10px] font-mono text-zinc-500">
                    <button
                      onClick={handleNext}
                      className="px-4 py-1.5 border border-white/10 hover:border-white rounded transition-all text-white hover:bg-white/5 font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Next
                    </button>
                    <span>or press Enter</span>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

          </main>

          {/* ═══ BOTTOM STATUS FOOTER BAR ═══ */}
          <footer className="flex justify-between items-center text-xs font-mono font-bold text-zinc-500">
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full",
                step === 18 ? "bg-emerald-500" : "bg-white animate-pulse"
              )} />
              <span>{step === 18 ? "COMPLETED" : "READY"}</span>
            </div>
            <div>{utcTime}</div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
