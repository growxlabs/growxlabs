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
      const msg = err instanceof Error ? err.message : "Something went wrong. You can also reach out directly to sai@growxlabs.tech.";
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
      <div className="w-full max-w-3xl mx-auto py-16 px-6 border border-neutral-800 bg-[#0A0A0D] text-center rounded-none shadow-2xl transition-all">
        <div className="w-12 h-12 rounded-full border border-emerald-500/40 bg-emerald-950/30 flex items-center justify-center mx-auto mb-6 text-emerald-400">
          <GrowxCheck size={24} />
        </div>

        <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight font-sans leading-tight">
          Thanks, your call is booked.
        </h2>
        <p className="mt-4 text-xs sm:text-sm uppercase tracking-widest text-neutral-400 font-mono">
          We&apos;ll see you then
        </p>

        {/* Scheduled Brief Summary */}
        <div className="mt-10 p-6 border border-neutral-800/80 bg-neutral-900/40 text-left space-y-3 font-mono text-xs">
          <div className="flex justify-between border-b border-neutral-800/60 pb-2">
            <span className="text-neutral-500 uppercase tracking-wider">Client</span>
            <span className="text-white font-medium">{formData.name} ({formData.company})</span>
          </div>
          <div className="flex justify-between border-b border-neutral-800/60 pb-2">
            <span className="text-neutral-500 uppercase tracking-wider">Work Email</span>
            <span className="text-white font-medium">{formData.email}</span>
          </div>
          <div className="flex justify-between border-b border-neutral-800/60 pb-2">
            <span className="text-neutral-500 uppercase tracking-wider">Scheduled Date</span>
            <span className="text-white font-medium">{formData.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500 uppercase tracking-wider">Scheduled Time</span>
            <span className="text-emerald-400 font-semibold">{formData.time} (IST)</span>
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
            className="text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
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
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-neutral-400 select-none">
          <span>Book a discovery call</span>
          <span>
            {String(currentStep + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
          </span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-4 h-0.5 rounded-full bg-neutral-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question & Input Block */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2 className="text-3xl sm:text-5xl font-light text-white/90 leading-tight font-sans tracking-tight">
            {step.question}
            {step.optional && (
              <span className="text-neutral-500 text-lg sm:text-2xl align-middle font-light ml-2">
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
              className="w-full bg-transparent border-b border-neutral-700 pb-4 text-2xl sm:text-4xl font-light text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
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
              className="w-full bg-transparent border-b border-neutral-700 pb-4 text-2xl sm:text-4xl font-light text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
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
                className="w-full bg-transparent border-b border-neutral-700 pb-4 text-2xl sm:text-4xl font-light text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
              />
              <p className="mt-3 text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-mono">
                work email preferred
              </p>
              {emailWarning && (
                <p className="mt-2 text-xs font-mono text-amber-400/90 tracking-wide">
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
              className="w-full bg-transparent border-b border-neutral-700 pb-4 text-xl sm:text-3xl font-light text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors resize-none leading-relaxed"
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
                className="w-full bg-transparent border-b border-neutral-700 pb-4 text-xl sm:text-3xl font-light text-white focus:outline-none focus:border-white transition-colors [color-scheme:dark]"
              />
              <p className="mt-3 text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-mono">
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
                          "px-6 py-3 text-sm sm:text-base border transition-all cursor-pointer text-center font-mono",
                          isSelected
                            ? "border-white bg-white text-black font-semibold shadow-lg"
                            : "border-neutral-800 text-neutral-300 hover:border-neutral-500 bg-[#0C0C10]"
                        )}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-base text-neutral-400 font-mono">
                  Please pick a date first.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error message if API fails */}
        {errorMessage && (
          <p className="text-xs font-mono text-rose-400 bg-rose-950/30 p-3 border border-rose-800/40">
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
                className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white transition-colors cursor-pointer py-2 px-1"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
          </div>

          {/* Right: Enter hint & Action button */}
          <div className="flex items-center gap-5">
            <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-widest text-neutral-500">
              press Enter ↵
            </span>

            {isLastStep ? (
              <LiquidButton
                type="submit"
                onClick={() => handleSubmit()}
                variant="white"
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
                variant="white"
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
