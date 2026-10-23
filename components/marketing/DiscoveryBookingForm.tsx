"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { GrowxArrowRight, GrowxCheck } from "@/components/icons";
import { ArrowLeft } from "lucide-react";

interface StepConfig {
  key: "name" | "company" | "email" | "message" | "date" | "time";
  question: string;
  optional?: boolean;
}

const STEPS: StepConfig[] = [
  { key: "name", question: "What's your name?" },
  { key: "company", question: "What's your company called?" },
  { key: "email", question: "What's your email?" },
  { key: "message", question: "Anything you'd like to add?", optional: true },
  { key: "date", question: "What day works for you?" },
  { key: "time", question: "Pick a time" },
];

const TIME_SLOTS = [
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
];

const PERSONAL_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
]);

export function DiscoveryBookingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    message: "",
    date: "",
    time: "",
  });
  const [emailWarning, setEmailWarning] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus current input on step change without jumping page
  useEffect(() => {
    if (!isBooked && currentStep > 0) {
      if (STEPS[currentStep].key === "message") {
        textareaRef.current?.focus({ preventScroll: true });
      } else {
        inputRef.current?.focus({ preventScroll: true });
      }
    }
  }, [currentStep, isBooked]);

  // Compute minimum date (tomorrow)
  const tomorrowString = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  // Email validation and work-email hint
  const handleEmailChange = (val: string) => {
    setFormData((prev) => ({ ...prev, email: val }));
    const trimmed = val.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      setEmailWarning("");
      return;
    }
    const domain = trimmed.split("@")[1];
    if (domain && PERSONAL_EMAIL_DOMAINS.has(domain)) {
      setEmailWarning("Work email preferred, but personal email is accepted.");
    } else {
      setEmailWarning("");
    }
  };

  // Step validation
  const isCurrentStepValid = (): boolean => {
    const stepKey = STEPS[currentStep].key;
    switch (stepKey) {
      case "name":
        return formData.name.trim().length >= 2;
      case "company":
        return formData.company.trim().length >= 2;
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
      case "message":
        return true; // optional
      case "date":
        return /^\d{4}-\d{2}-\d{2}$/.test(formData.date);
      case "time":
        return formData.time.trim().length > 0;
      default:
        return false;
    }
  };

  const isFormFullyValid =
    formData.name.trim().length >= 2 &&
    formData.company.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) &&
    /^\d{4}-\d{2}-\d{2}$/.test(formData.date) &&
    formData.time.trim().length > 0;

  const handleNext = () => {
    if (!isCurrentStepValid()) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, allowShiftEnter = false) => {
    if (e.key === "Enter") {
      if (allowShiftEnter && e.shiftKey) return;
      e.preventDefault();
      if (currentStep < STEPS.length - 1) {
        handleNext();
      } else if (isFormFullyValid) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormFullyValid || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Unable to complete booking. Please try again.");
      }

      setIsBooked(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. You can also reach out directly to svp@growxlabs.tech.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  // ══════════════════════════════════════════════════════════════════
  // Success Confirmation Screen
  // ══════════════════════════════════════════════════════════════════
  if (isBooked) {
    return (
      <div className="w-full max-w-3xl mx-auto py-16 px-6 sm:px-10 border border-[#D5E2E9] bg-[#F4F8FA] text-center rounded-2xl shadow-lg transition-all">
        <div className="w-12 h-12 rounded-full border border-emerald-500/40 bg-emerald-100 flex items-center justify-center mx-auto mb-6 text-emerald-700">
          <GrowxCheck size={24} />
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold text-[#17252D] tracking-tight font-sans leading-tight">
          Thanks, your call is booked.
        </h2>
        <p className="mt-4 text-xs sm:text-sm uppercase tracking-widest text-[#55788D] font-mono font-bold">
          We&apos;ll see you then
        </p>

        {/* Scheduled Brief Summary */}
        <div className="mt-10 p-6 border border-[#D5E2E9] bg-[#E5EFF4] text-left space-y-3 font-mono text-xs rounded-xl">
          <div className="flex justify-between border-b border-[#D5E2E9] pb-2">
            <span className="text-[#55788D] uppercase tracking-wider font-semibold">Client</span>
            <span className="text-[#17252D] font-bold">{formData.name} ({formData.company})</span>
          </div>
          <div className="flex justify-between border-b border-[#D5E2E9] pb-2">
            <span className="text-[#55788D] uppercase tracking-wider font-semibold">Work Email</span>
            <span className="text-[#17252D] font-bold">{formData.email}</span>
          </div>
          <div className="flex justify-between border-b border-[#D5E2E9] pb-2">
            <span className="text-[#55788D] uppercase tracking-wider font-semibold">Scheduled Date</span>
            <span className="text-[#17252D] font-bold">{formData.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#55788D] uppercase tracking-wider font-semibold">Scheduled Time</span>
            <span className="text-emerald-700 font-bold">{formData.time} (IST)</span>
          </div>
        </div>

        <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              setIsBooked(false);
              setCurrentStep(0);
              setFormData({ name: "", company: "", email: "", message: "", date: "", time: "" });
            }}
            className="text-xs font-mono uppercase tracking-widest text-[#55788D] hover:text-[#17252D] transition-colors cursor-pointer font-bold"
          >
            ← Book another session
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // 6-Step Interactive Form
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Top Header: Step Counter & Progress Bar */}
      <div className="mb-12 sm:mb-16">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#55788D] select-none font-bold">
          <span>Book a discovery call</span>
          <span>
            {String(currentStep + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
          </span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-4 h-1 rounded-full bg-[#E5EFF4] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#17252D] transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question & Input Block */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2 className="text-3xl sm:text-5xl font-bold text-[#17252D] leading-tight font-sans tracking-tight">
            {step.question}
            {step.optional && (
              <span className="text-[#55788D] text-lg sm:text-2xl align-middle font-normal ml-2">
                (optional)
              </span>
            )}
          </h2>
        </div>

        {/* Step Inputs */}
        <div className="pt-2">
          {step.key === "name" && (
            <input
              ref={inputRef}
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e)}
              placeholder="Your full name"
              className="w-full bg-transparent border-b border-[#D5E2E9] pb-4 text-2xl sm:text-4xl font-normal text-[#17252D] placeholder-[#55788D]/40 focus:outline-none focus:border-[#17252D] transition-colors"
            />
          )}

          {step.key === "company" && (
            <input
              ref={inputRef}
              id="company"
              name="company"
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e)}
              placeholder="Your company"
              className="w-full bg-transparent border-b border-[#D5E2E9] pb-4 text-2xl sm:text-4xl font-normal text-[#17252D] placeholder-[#55788D]/40 focus:outline-none focus:border-[#17252D] transition-colors"
            />
          )}

          {step.key === "email" && (
            <div>
              <input
                ref={inputRef}
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e)}
                placeholder="you@company.com"
                className="w-full bg-transparent border-b border-[#D5E2E9] pb-4 text-2xl sm:text-4xl font-normal text-[#17252D] placeholder-[#55788D]/40 focus:outline-none focus:border-[#17252D] transition-colors"
              />
              <p className="mt-3 text-[10px] sm:text-xs uppercase tracking-widest text-[#55788D] font-mono font-bold">
                work email preferred
              </p>
              {emailWarning && (
                <p className="mt-2 text-xs font-mono text-amber-700 tracking-wide font-medium">
                  {emailWarning}
                </p>
              )}
            </div>
          )}

          {step.key === "message" && (
            <textarea
              ref={textareaRef}
              id="message"
              name="message"
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, true)}
              placeholder="Tell us what you're building or how we can help"
              className="w-full bg-transparent border-b border-[#D5E2E9] pb-4 text-xl sm:text-3xl font-normal text-[#17252D] placeholder-[#55788D]/40 focus:outline-none focus:border-[#17252D] transition-colors resize-none leading-relaxed"
            />
          )}

          {step.key === "date" && (
            <div>
              <input
                ref={inputRef}
                id="date"
                name="date"
                type="date"
                required
                min={tomorrowString}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e)}
                className="w-full bg-transparent border-b border-[#D5E2E9] pb-4 text-xl sm:text-3xl font-normal text-[#17252D] focus:outline-none focus:border-[#17252D] transition-colors [color-scheme:light]"
              />
              <p className="mt-3 text-[10px] sm:text-xs uppercase tracking-widest text-[#55788D] font-mono font-bold">
                Select an upcoming business day
              </p>
            </div>
          )}

          {step.key === "time" && (
            <div>
              {formData.date ? (
                <div className="flex flex-wrap gap-3 pt-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = formData.time === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData({ ...formData, time: slot })}
                        className={cn(
                          "px-6 py-3 text-sm sm:text-base border rounded-xl transition-all cursor-pointer text-center font-mono",
                          isSelected
                            ? "border-[#17252D] bg-[#17252D] text-[#FAFCFD] font-bold shadow-md"
                            : "border-[#D5E2E9] text-[#17252D] hover:border-[#17252D] bg-[#E5EFF4] font-medium"
                        )}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-base text-[#55788D] font-mono">
                  Please pick a date first.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error message if API fails */}
        {errorMessage && (
          <p className="text-xs font-mono text-rose-700 bg-rose-50 p-4 border border-rose-200 rounded-xl">
            {errorMessage}
          </p>
        )}

        {/* Bottom Navigation Controls */}
        <div className="pt-8 flex items-center justify-between gap-4 select-none">
          {/* Back button */}
          <div>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                aria-label="Previous step"
                className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#55788D] hover:text-[#17252D] transition-colors cursor-pointer py-2 px-1 font-bold"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
          </div>

          {/* Right: Enter hint & Action button */}
          <div className="flex items-center gap-5">
            <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-widest text-[#55788D]">
              press Enter ↵
            </span>

            {isLastStep ? (
              <LiquidButton
                type="submit"
                onClick={() => handleSubmit()}
                variant="airforce"
                size="default"
                disabled={!isFormFullyValid || isSubmitting}
                icon={<GrowxArrowRight size={14} className="transition-transform group-hover:translate-x-1" />}
                iconPosition="right"
              >
                {isSubmitting ? "Booking..." : "Book a Call"}
              </LiquidButton>
            ) : (
              <LiquidButton
                type="button"
                onClick={handleNext}
                variant="airforce"
                size="default"
                disabled={!isCurrentStepValid()}
                icon={<GrowxArrowRight size={14} className="transition-transform group-hover:translate-x-1" />}
                iconPosition="right"
              >
                Continue
              </LiquidButton>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
