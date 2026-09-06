"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, FileText } from "lucide-react";
import { useRouter } from "@/navigation-client";
import { cn } from "@/lib/utils";
import { FlickerText } from "@/components/marketing/FlickerText";

// Roles matching 360labs reference screenshot exactly
const ROLES = [
  { title: "Content/Marketing", tag: "BRAND" },
  { title: "Growth/Business Development", tag: "GROWTH" },
  { title: "Forward Deployed Engineering/Technical Product Management", tag: "DEPLOY" },
  { title: "AI Engineering/Software Engineering", tag: "BUILD" },
  { title: "Hardware/Robotics Engineering", tag: "ROBOT" },
  { title: "Product Design/UI-UX Design", tag: "DESIGN" },
];

// Tech options
const TECH_OPTIONS = [
  "React / Next.js",
  "Node.js / TypeScript",
  "Python / FastAPI",
  "LangChain / LlamaIndex",
  "n8n / Workflows",
  "Supabase / PostgreSQL",
  "Figma / UI Design",
  "Docker / AWS",
  "Premiere Pro / DaVinci",
];

// Employment type options
const EMPLOYMENT_TYPES = [
  { label: "Full-Time (Remote)", tag: "FULL-TIME" },
  { label: "Part-Time (Remote)", tag: "PART-TIME" },
  { label: "Contract / Freelance", tag: "CONTRACT" },
];

// Notice period options
const NOTICE_PERIODS = [
  { label: "Immediate (Within 7 days)", tag: "IMMEDIATE" },
  { label: "15 Days", tag: "15 DAYS" },
  { label: "30 Days", tag: "30 DAYS" },
  { label: "60+ Days", tag: "60+ DAYS" },
];

export function CareersContent() {
  const router = useRouter();

  // 0 = Intro
  // 1 = Name, 2 = Email, 3 = Phone, 4 = Location, 5 = Role
  // 6 = Intermission (Links)
  // 7 = LinkedIn, 8 = GitHub, 9 = Portfolio
  // 10 = Experience, 11 = Primary Tech, 12 = Resume
  // 13 = Current Title, 14 = Company, 15 = Employment Type, 16 = Notice Period, 17 = Motivation
  // 18 = Success
  const [step, setStep] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [utcTime, setUtcTime] = useState("");
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Form Data State matching /api/careers payload contract
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    role: "",
    experience: "",
    techStack: "",
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

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Mouse move / interaction trigger to transition from cover wrapper to application form
  useEffect(() => {
    if (showForm) return;

    let isEnabled = false;
    let hasTriggered = false;

    const enableTimer = setTimeout(() => {
      isEnabled = true;
    }, 400);

    const triggerTransition = () => {
      if (!isEnabled || hasTriggered) return;
      hasTriggered = true;
      setShowForm(true);
    };

    const handleMouseMove = () => {
      triggerTransition();
    };

    const handleClick = () => {
      triggerTransition();
    };

    const handleTouchStart = () => {
      triggerTransition();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        triggerTransition();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(enableTimer);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showForm]);

  // Live UTC clock
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

  // Autofocus input
  useEffect(() => {
    if (showForm && inputRef.current) {
      inputRef.current.focus();
    }
    setError("");
  }, [step, showForm]);

  // Keyboard navigation & Number hotkeys
  useEffect(() => {
    if (!showForm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Step 0: Start on Enter
      if (step === 0 && e.key === "Enter") {
        e.preventDefault();
        setStep(1);
        return;
      }

      // Escape: Go back
      if (e.key === "Escape" && step > 0 && step < 18) {
        e.preventDefault();
        handleBack();
        return;
      }

      // Step 5: Role selection with 1-6 keys
      if (step === 5) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= ROLES.length) {
          e.preventDefault();
          selectRole(ROLES[num - 1].title);
          return;
        }
      }

      // Step 15: Employment preference with 1-3 keys
      if (step === 15) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= EMPLOYMENT_TYPES.length) {
          e.preventDefault();
          selectEmploymentType(EMPLOYMENT_TYPES[num - 1].label);
          return;
        }
      }

      // Step 16: Notice period with 1-4 keys
      if (step === 16) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= NOTICE_PERIODS.length) {
          e.preventDefault();
          selectNoticePeriod(NOTICE_PERIODS[num - 1].label);
          return;
        }
      }

      // Enter key on single-line inputs and intermission step
      if (e.key === "Enter" && step > 0 && step !== 17) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, formData]);

  // Section category for top bar
  const getTopSection = () => {
    if (step === 0) return "INTRO";
    if (step >= 1 && step <= 4) return "PERSONAL DETAILS";
    if (step === 5) return "TARGET ROLE";
    if (step >= 6 && step <= 9) return "PROFESSIONAL LINKS";
    if (step >= 10 && step <= 12) return "EXPERIENCE & SKILLS";
    if (step >= 13 && step <= 16) return "LOGISTICS & PREFERENCES";
    if (step === 17) return "MOTIVATION";
    return "COMPLETED";
  };

  // Step counter string e.g. 01 / 17
  const getStepCounter = () => {
    if (step === 0) return "01 / 17";
    if (step === 18) return "COMPLETED";
    return `${String(step).padStart(2, "0")} / 17`;
  };

  // Bottom question indicator e.g. ● Q.01
  const getBottomIndicator = () => {
    if (step === 0) return "● READY";
    if (step === 18) return "● COMPLETED";
    return `● Q.${String(step).padStart(2, "0")}`;
  };

  // Validation
  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) return "Full name is required.";
        break;
      case 2: {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) return "Email address is required.";
        if (!emailRegex.test(formData.email.trim())) return "Please enter a valid email address.";
        break;
      }
      case 3:
        if (!formData.phone.trim()) return "Phone number is required.";
        break;
      case 4:
        if (!formData.location.trim()) return "Location is required.";
        break;
      case 5:
        if (!formData.role) return "Please select a target role.";
        break;
      case 7:
        if (formData.linkedin.trim() && !formData.linkedin.toLowerCase().includes("linkedin.com")) {
          return "That doesn't look like a LinkedIn profile. Try https://linkedin.com/in/yourname";
        }
        break;
      case 10:
        if (!formData.experience.trim()) return "Years of experience is required.";
        break;
      case 11:
        if (!formData.techStack.trim()) return "Primary tech or tool is required.";
        break;
      case 12:
        if (!formData.resume.trim()) return "Please upload your resume or CV.";
        break;
      case 13:
        if (!formData.jobTitle.trim()) return "Current or last job title is required.";
        break;
      case 14:
        if (!formData.company.trim()) return "Current or last company/school is required.";
        break;
      case 15:
        if (!formData.employmentType) return "Please select an employment preference.";
        break;
      case 16:
        if (!formData.noticePeriod) return "Please select your notice period.";
        break;
      case 17:
        if (formData.motivation.trim().length < 10) return "Please share a brief note on what drives you (at least 10 characters).";
        break;
      default:
        break;
    }
    return "";
  };

  // Navigation handlers
  const handleNext = () => {
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }

    if (step === 17) {
      submitApplication();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  const selectRole = (roleTitle: string) => {
    setFormData(prev => ({ ...prev, role: roleTitle }));
    setTimeout(() => setStep(6), 150);
  };

  const selectEmploymentType = (type: string) => {
    setFormData(prev => ({ ...prev, employmentType: type }));
    setTimeout(() => setStep(16), 150);
  };

  const selectNoticePeriod = (period: string) => {
    setFormData(prev => ({ ...prev, noticePeriod: period }));
    setTimeout(() => setStep(17), 150);
  };

  // Resume Upload Handler
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

  // Submit Handler: Posts exact schema to /api/careers
  const submitApplication = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const submitData = { ...formData };
      const response = await fetch("/api/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Submission failed.");
      }

      setStep(18); // Completed
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
          key="intro-cover"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 w-full h-full bg-[#0a0a0c] text-white font-sans z-50 flex flex-col justify-between p-8 md:p-16 select-none overflow-hidden cursor-pointer"
          onClick={() => setShowForm(true)}
        >
          {/* Top Row */}
          <div className="flex justify-between items-center text-[10px] font-mono font-bold tracking-widest text-zinc-500">
            <div>[GrowXLabs]</div>
            <div>// INTRO</div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowForm(true);
                setStep(1);
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              START
            </button>
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
          key="application-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 w-full h-full bg-[#0a0a0c] text-white font-sans z-50 flex flex-col justify-between p-6 sm:p-12 md:p-16 select-none overflow-hidden"
        >
          {/* ═══ TOP 360LABS STATUS BAR ═══ */}
      <header className="flex justify-between items-center text-xs font-mono tracking-widest text-zinc-500 shrink-0">
        <div>
          <span className="text-white font-bold tracking-widest text-xs font-mono uppercase">[GrowXLabs]</span>
        </div>
        <div className="uppercase text-[11px] tracking-[0.25em] text-zinc-400 font-mono font-bold">
          {getTopSection()}
        </div>
        <div className="text-[11px] font-mono tracking-widest text-zinc-400 font-bold">
          {getStepCounter()}
        </div>
      </header>

      {/* ═══ MAIN STEP VIEWPORT ═══ */}
      <main className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full relative py-4">

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full flex flex-col items-start"
          >
            {/* ═══ SCREEN 0: INTRO (360Labs Image 1 As-Is) ═══ */}
            {step === 0 && (
              <div className="w-full space-y-6">
                <span className="font-mono text-xs text-zinc-500 tracking-widest uppercase">
                  // CAREERS · 2026
                </span>
                <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter text-white font-sans leading-none">
                  Apply to GrowX Labs.
                </h1>
                <p className="text-base sm:text-lg text-zinc-400 font-sans leading-relaxed">
                  Curious. Hard-working. Honest. About 10-15 minutes.
                </p>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold text-sm rounded-md transition-all active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>Start</span>
                  </button>
                  <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
                    PRESS ENTER
                  </span>
                </div>
              </div>
            )}

            {/* ═══ SCREEN 1: NAME (360Labs Image 2 As-Is) ═══ */}
            {step === 1 && (
              <div className="w-full space-y-5">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // NAME
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-sans">
                  What's your name?
                </h2>
                <div className="w-full border-b border-zinc-700/80 focus-within:border-white transition-colors pb-3 pt-6 flex items-center gap-3">
                  <span className="text-zinc-500 font-mono text-xl select-none">&gt;</span>
                  <input
                    ref={inputRef as any}
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full bg-transparent text-xl sm:text-2xl text-white outline-none font-sans placeholder-zinc-700 font-normal"
                  />
                </div>
                <ActionBar onNext={handleNext} onBack={handleBack} />
              </div>
            )}

            {/* ═══ SCREEN 2: EMAIL ═══ */}
            {step === 2 && (
              <div className="w-full space-y-5">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // EMAIL
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-sans">
                  What is your email address?
                </h2>
                <div className="w-full border-b border-zinc-700/80 focus-within:border-white transition-colors pb-3 pt-6 flex items-center gap-3">
                  <span className="text-zinc-500 font-mono text-xl select-none">&gt;</span>
                  <input
                    ref={inputRef as any}
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-transparent text-xl sm:text-2xl text-white outline-none font-sans placeholder-zinc-700 font-normal"
                  />
                </div>
                <ActionBar onNext={handleNext} onBack={handleBack} />
              </div>
            )}

            {/* ═══ SCREEN 3: PHONE ═══ */}
            {step === 3 && (
              <div className="w-full space-y-5">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // PHONE
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-sans">
                  What is your phone number?
                </h2>
                <div className="w-full border-b border-zinc-700/80 focus-within:border-white transition-colors pb-3 pt-6 flex items-center gap-3">
                  <span className="text-zinc-500 font-mono text-xl select-none">&gt;</span>
                  <input
                    ref={inputRef as any}
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-transparent text-xl sm:text-2xl text-white outline-none font-sans placeholder-zinc-700 font-normal"
                  />
                </div>
                <ActionBar onNext={handleNext} onBack={handleBack} />
              </div>
            )}

            {/* ═══ SCREEN 4: LOCATION ═══ */}
            {step === 4 && (
              <div className="w-full space-y-5">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // LOCATION
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-sans">
                  Where are you currently located?
                </h2>
                <div className="w-full border-b border-zinc-700/80 focus-within:border-white transition-colors pb-3 pt-6 flex items-center gap-3">
                  <span className="text-zinc-500 font-mono text-xl select-none">&gt;</span>
                  <input
                    ref={inputRef as any}
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Bengaluru, India or Remote"
                    className="w-full bg-transparent text-xl sm:text-2xl text-white outline-none font-sans placeholder-zinc-700 font-normal"
                  />
                </div>
                <ActionBar onNext={handleNext} onBack={handleBack} />
              </div>
            )}

            {/* ═══ SCREEN 5: ROLE SELECTION (360Labs Image 3 As-Is) ═══ */}
            {step === 5 && (
              <div className="w-full space-y-5">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // ROLE
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-sans">
                  What are you applying for?
                </h2>

                {/* 360labs Options List with horizontal divider borders */}
                <div className="w-full border-t border-b border-zinc-800 divide-y divide-zinc-800/80 my-2">
                  {ROLES.map((r, idx) => {
                    const isSelected = formData.role === r.title;
                    return (
                      <div
                        key={r.title}
                        onClick={() => selectRole(r.title)}
                        className={cn(
                          "w-full py-3.5 px-2 flex items-center justify-between cursor-pointer transition-colors group",
                          isSelected ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "w-6 h-6 rounded-full border text-[11px] font-mono flex items-center justify-center transition-colors",
                            isSelected
                              ? "border-white text-white font-bold bg-white/10"
                              : "border-zinc-700 text-zinc-500 group-hover:border-zinc-500 group-hover:text-zinc-300"
                          )}>
                            {idx + 1}
                          </span>
                          <span className={cn(
                            "text-sm sm:text-base font-medium font-sans transition-colors",
                            isSelected ? "text-white font-bold" : "text-zinc-300 group-hover:text-white"
                          )}>
                            {r.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                          {r.tag}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded text-xs transition-all shadow-sm cursor-pointer"
                    >
                      OK ↵
                    </button>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="px-1.5 py-0.5 border border-zinc-700 rounded bg-zinc-900 text-zinc-400">
                        1 - 6
                      </span>
                      <span>TO PICK</span>
                      <span className="mx-1">·</span>
                      <span className="px-1.5 py-0.5 border border-zinc-700 rounded bg-zinc-900 text-zinc-400">
                        ↵
                      </span>
                      <span>TO CONTINUE</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="hover:text-white transition-colors cursor-pointer text-[11px]"
                  >
                    ← BACK · ESC
                  </button>
                </div>
              </div>
            )}

            {/* ═══ SCREEN 6: SECTION 02 INTERMISSION (360Labs Image 4 As-Is) ═══ */}
            {step === 6 && (
              <div className="w-full space-y-6">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // PROFESSIONAL LINKS
                </span>
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white font-sans">
                  Professional Links
                </h2>
                <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-sans max-w-xl">
                  This section helps us understand your background, what you've worked on, and how you think. Share links that best represent your experience so we can review your work in context.
                </p>

                <div className="pt-6 flex items-center justify-between w-full">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-xs font-mono text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    ← BACK · ESC
                  </button>

                  <div className="flex items-center gap-4">
                    <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
                      PRESS ENTER
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(7)}
                      className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-md transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue →</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ SCREEN 7: LINKEDIN (360Labs Image 5 As-Is) ═══ */}
            {step === 7 && (
              <div className="w-full space-y-4">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // LINKEDIN
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-sans">
                  LinkedIn profile?
                </h2>
                <div className="w-full border-b border-zinc-700/80 focus-within:border-white transition-colors pb-3 pt-6 flex items-center gap-3">
                  <span className="text-zinc-500 font-mono text-xl select-none">&gt;</span>
                  <input
                    ref={inputRef as any}
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-transparent text-xl sm:text-2xl text-white outline-none font-sans placeholder-zinc-700 font-normal"
                  />
                </div>

                {/* 360labs inline validation note */}
                {formData.linkedin.trim() && !formData.linkedin.toLowerCase().includes("linkedin.com") && (
                  <p className="text-xs font-mono text-rose-400/90 pt-1">
                    ! That doesn't look like a LinkedIn profile. Try https://linkedin.com/in/yourname
                  </p>
                )}

                <ActionBar onNext={handleNext} onBack={handleBack} />
              </div>
            )}

            {/* ═══ SCREEN 8: GITHUB / PORTFOLIO ═══ */}
            {step === 8 && (
              <div className="w-full space-y-4">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // PORTFOLIO & CODE
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-sans">
                  GitHub, portfolio, or showreel link?
                </h2>
                <div className="w-full border-b border-zinc-700/80 focus-within:border-white transition-colors pb-3 pt-6 flex items-center gap-3">
                  <span className="text-zinc-500 font-mono text-xl select-none">&gt;</span>
                  <input
                    ref={inputRef as any}
                    type="url"
                    value={formData.github || formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value, portfolio: e.target.value })}
                    placeholder="https://github.com/... or https://yourportfolio.com"
                    className="w-full bg-transparent text-xl sm:text-2xl text-white outline-none font-sans placeholder-zinc-700 font-normal"
                  />
                </div>
                <ActionBar onNext={handleNext} onBack={handleBack} />
              </div>
            )}

            {/* ═══ SCREEN 9: PERSONAL SITE / OTHER WORK ═══ */}
            {step === 9 && (
              <div className="w-full space-y-4">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // OTHER WORK
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-sans">
                  Any other project or case study you'd like us to review?
                </h2>
                <div className="w-full border-b border-zinc-700/80 focus-within:border-white transition-colors pb-3 pt-6 flex items-center gap-3">
                  <span className="text-zinc-500 font-mono text-xl select-none">&gt;</span>
                  <input
                    ref={inputRef as any}
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-transparent text-xl sm:text-2xl text-white outline-none font-sans placeholder-zinc-700 font-normal"
                  />
                </div>
                <ActionBar onNext={handleNext} onBack={handleBack} />
              </div>
            )}

            {/* ═══ SCREEN 10: EXPERIENCE ═══ */}
            {step === 10 && (
              <div className="w-full space-y-4">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // EXPERIENCE
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-sans">
                  How many years of professional experience do you have?
                </h2>
                <div className="w-full border-b border-zinc-700/80 focus-within:border-white transition-colors pb-3 pt-6 flex items-center gap-3">
                  <span className="text-zinc-500 font-mono text-xl select-none">&gt;</span>
                  <input
                    ref={inputRef as any}
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="Years (e.g. 2)"
                    className="w-full bg-transparent text-xl sm:text-2xl text-white outline-none font-sans placeholder-zinc-700 font-normal"
                  />
                </div>
                <ActionBar onNext={handleNext} onBack={handleBack} />
              </div>
            )}

            {/* ═══ SCREEN 11: PRIMARY TOOL / LANGUAGE ═══ */}
            {step === 11 && (
              <div className="w-full space-y-4">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // PRIMARY STACK
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-sans">
                  What is your primary programming language or creative tool?
                </h2>
                <div className="w-full border-b border-zinc-700/80 focus-within:border-white transition-colors pb-3 pt-6 flex items-center gap-3">
                  <span className="text-zinc-500 font-mono text-xl select-none">&gt;</span>
                  <input
                    ref={inputRef as any}
                    type="text"
                    value={formData.techStack}
                    onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                    placeholder="e.g. TypeScript / Next.js or Premiere Pro / Figma"
                    className="w-full bg-transparent text-xl sm:text-2xl text-white outline-none font-sans placeholder-zinc-700 font-normal"
                  />
                </div>
                <ActionBar onNext={handleNext} onBack={handleBack} />
              </div>
            )}

            {/* ═══ SCREEN 12: RESUME CV UPLOAD ═══ */}
            {step === 12 && (
              <div className="w-full space-y-5">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // RESUME
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-sans">
                  Upload your resume or CV.
                </h2>

                {uploading ? (
                  <div className="p-8 border border-dashed border-zinc-800 rounded-xl bg-white/[0.01] flex flex-col items-center justify-center gap-2">
                    <Loader2 className="animate-spin text-white h-6 w-6" />
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                      Uploading to cloud...
                    </span>
                  </div>
                ) : formData.resume ? (
                  <div className="p-4 border border-zinc-800 bg-white/[0.02] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check size={14} />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-xs">{uploadedFileName || "resume.pdf"}</p>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Uploaded</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, resume: "" }));
                        setUploadedFileName("");
                      }}
                      className="text-xs font-mono text-zinc-500 hover:text-white px-2 py-1 rounded transition-colors cursor-pointer"
                    >
                      Change
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
                      document.getElementById("career-resume-file-input")?.click();
                    }}
                    className="p-8 border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] text-center cursor-pointer transition-all space-y-2"
                  >
                    <input
                      id="career-resume-file-input"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                    <div className="w-8 h-8 rounded-full bg-white/5 text-zinc-400 flex items-center justify-center mx-auto">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-white text-xs">
                        Drag and drop your resume here, or <span className="underline text-white">browse</span>
                      </p>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">
                        PDF or DOCX up to 10MB
                      </p>
                    </div>
                  </div>
                )}

                <ActionBar onNext={handleNext} onBack={handleBack} />
              </div>
            )}

            {/* ═══ SCREEN 13: CURRENT / LAST TITLE ═══ */}
            {step === 13 && (
              <div className="w-full space-y-4">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // TITLE
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-sans">
                  What is your current or last job title?
                </h2>
                <div className="w-full border-b border-zinc-700/80 focus-within:border-white transition-colors pb-3 pt-6 flex items-center gap-3">
                  <span className="text-zinc-500 font-mono text-xl select-none">&gt;</span>
                  <input
                    ref={inputRef as any}
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="Software Engineer, Product Designer, or Student"
                    className="w-full bg-transparent text-xl sm:text-2xl text-white outline-none font-sans placeholder-zinc-700 font-normal"
                  />
                </div>
                <ActionBar onNext={handleNext} onBack={handleBack} />
              </div>
            )}

            {/* ═══ SCREEN 14: CURRENT / LAST COMPANY ═══ */}
            {step === 14 && (
              <div className="w-full space-y-4">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // COMPANY
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-sans">
                  What is your current or last company or university?
                </h2>
                <div className="w-full border-b border-zinc-700/80 focus-within:border-white transition-colors pb-3 pt-6 flex items-center gap-3">
                  <span className="text-zinc-500 font-mono text-xl select-none">&gt;</span>
                  <input
                    ref={inputRef as any}
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Company or College name"
                    className="w-full bg-transparent text-xl sm:text-2xl text-white outline-none font-sans placeholder-zinc-700 font-normal"
                  />
                </div>
                <ActionBar onNext={handleNext} onBack={handleBack} />
              </div>
            )}

            {/* ═══ SCREEN 15: EMPLOYMENT PREFERENCE (360Labs Number Pick) ═══ */}
            {step === 15 && (
              <div className="w-full space-y-5">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // PREFERENCE
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-sans">
                  Select your employment preference:
                </h2>

                <div className="w-full border-t border-b border-zinc-800 divide-y divide-zinc-800/80 my-2">
                  {EMPLOYMENT_TYPES.map((t, idx) => {
                    const isSelected = formData.employmentType === t.label;
                    return (
                      <div
                        key={t.label}
                        onClick={() => selectEmploymentType(t.label)}
                        className={cn(
                          "w-full py-3.5 px-2 flex items-center justify-between cursor-pointer transition-colors group",
                          isSelected ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "w-6 h-6 rounded-full border text-[11px] font-mono flex items-center justify-center transition-colors",
                            isSelected
                              ? "border-white text-white font-bold bg-white/10"
                              : "border-zinc-700 text-zinc-500 group-hover:border-zinc-500 group-hover:text-zinc-300"
                          )}>
                            {idx + 1}
                          </span>
                          <span className={cn(
                            "text-sm sm:text-base font-medium font-sans transition-colors",
                            isSelected ? "text-white font-bold" : "text-zinc-300 group-hover:text-white"
                          )}>
                            {t.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                          {t.tag}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded text-xs transition-all shadow-sm cursor-pointer"
                    >
                      OK ↵
                    </button>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="px-1.5 py-0.5 border border-zinc-700 rounded bg-zinc-900 text-zinc-400">
                        1 - 3
                      </span>
                      <span>TO PICK</span>
                      <span className="mx-1">·</span>
                      <span className="px-1.5 py-0.5 border border-zinc-700 rounded bg-zinc-900 text-zinc-400">
                        ↵
                      </span>
                      <span>TO CONTINUE</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="hover:text-white transition-colors cursor-pointer text-[11px]"
                  >
                    ← BACK · ESC
                  </button>
                </div>
              </div>
            )}

            {/* ═══ SCREEN 16: NOTICE PERIOD (360Labs Number Pick) ═══ */}
            {step === 16 && (
              <div className="w-full space-y-5">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // NOTICE PERIOD
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-sans">
                  What is your availability to start?
                </h2>

                <div className="w-full border-t border-b border-zinc-800 divide-y divide-zinc-800/80 my-2">
                  {NOTICE_PERIODS.map((p, idx) => {
                    const isSelected = formData.noticePeriod === p.label;
                    return (
                      <div
                        key={p.label}
                        onClick={() => selectNoticePeriod(p.label)}
                        className={cn(
                          "w-full py-3.5 px-2 flex items-center justify-between cursor-pointer transition-colors group",
                          isSelected ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "w-6 h-6 rounded-full border text-[11px] font-mono flex items-center justify-center transition-colors",
                            isSelected
                              ? "border-white text-white font-bold bg-white/10"
                              : "border-zinc-700 text-zinc-500 group-hover:border-zinc-500 group-hover:text-zinc-300"
                          )}>
                            {idx + 1}
                          </span>
                          <span className={cn(
                            "text-sm sm:text-base font-medium font-sans transition-colors",
                            isSelected ? "text-white font-bold" : "text-zinc-300 group-hover:text-white"
                          )}>
                            {p.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                          {p.tag}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded text-xs transition-all shadow-sm cursor-pointer"
                    >
                      OK ↵
                    </button>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="px-1.5 py-0.5 border border-zinc-700 rounded bg-zinc-900 text-zinc-400">
                        1 - 4
                      </span>
                      <span>TO PICK</span>
                      <span className="mx-1">·</span>
                      <span className="px-1.5 py-0.5 border border-zinc-700 rounded bg-zinc-900 text-zinc-400">
                        ↵
                      </span>
                      <span>TO CONTINUE</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="hover:text-white transition-colors cursor-pointer text-[11px]"
                  >
                    ← BACK · ESC
                  </button>
                </div>
              </div>
            )}

            {/* ═══ SCREEN 17: MOTIVATION ═══ */}
            {step === 17 && (
              <div className="w-full space-y-4">
                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                  // MOTIVATION
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-sans">
                  Why do you want to join GrowX Labs?
                </h2>
                <div className="w-full border-b border-zinc-700/80 focus-within:border-white transition-colors pb-3 pt-4">
                  <textarea
                    ref={inputRef as any}
                    rows={4}
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    placeholder="Tell us what drives you, projects you're proud of, or why you want to build with us..."
                    className="w-full bg-transparent text-base sm:text-lg text-white outline-none font-sans placeholder-zinc-700 leading-relaxed resize-none font-normal"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={submitApplication}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-semibold text-xs rounded-md transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Application</span>
                      )}
                    </button>
                    <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                      PRESS ↵
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-xs font-mono text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    ← BACK · ESC
                  </button>
                </div>
              </div>
            )}

            {/* ═══ SCREEN 18: SUCCESS CONFIRMATION ═══ */}
            {step === 18 && (
              <div className="w-full space-y-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check size={24} />
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white font-sans">
                  Application Submitted.
                </h1>
                <p className="text-base sm:text-lg text-zinc-400 font-sans leading-relaxed max-w-lg">
                  Thank you for applying to GrowX Labs. Our founding team reviews every application directly. We will get back to you at <span className="text-white font-semibold">{formData.email}</span> within 48-72 hours.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="px-6 py-2.5 rounded-md border border-zinc-700 hover:border-zinc-500 text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Go Back Home
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && step !== 7 && (
              <p className="text-xs font-mono text-rose-400 pt-2 flex items-center gap-1.5">
                <span>! {error}</span>
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ═══ BOTTOM 360LABS STATUS BAR ═══ */}
      <footer className="flex justify-between items-center text-xs font-mono tracking-widest text-zinc-500 shrink-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-2 h-2 rounded-full",
            step === 18 ? "bg-emerald-400" : "bg-emerald-400 animate-pulse"
          )} />
          <span className="text-[11px] tracking-widest text-zinc-400 font-mono">
            {getBottomIndicator()}
          </span>
        </div>
        <div className="text-[11px] tracking-widest font-mono text-zinc-400">
          {utcTime}
        </div>
      </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══ REUSABLE 360LABS ACTION BAR (OK ↵ PRESS ↵ ← BACK · ESC) ═══
function ActionBar({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between text-xs pt-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onNext}
          className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <span>OK</span>
          <span className="text-[10px] font-mono">↵</span>
        </button>
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-1">
          <span>PRESS</span>
          <span className="px-1 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px]">↵</span>
        </span>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="text-[11px] font-mono text-zinc-500 hover:text-white transition-colors cursor-pointer"
      >
        ← BACK · ESC
      </button>
    </div>
  );
}
