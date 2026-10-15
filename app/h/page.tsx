"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Loader2, ArrowRight, ShieldCheck, Mail, RefreshCw } from "lucide-react";
import { css } from "@/styled-system/css";

export default function HealthcareAccessPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // If already authenticated and session is active, route to /workspace/h
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      router.replace("/workspace/h");
    }
  }, [status, session, router]);

  // Handle countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus code input when transitioning to code step
  useEffect(() => {
    if (step === "code") {
      setTimeout(() => codeInputRef.current?.focus(), 50);
    }
  }, [step]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid work email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await fetch("/api/h/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.cooldownSeconds) {
          setCooldown(data.cooldownSeconds);
        }
        throw new Error(data.error || "Unable to send verification code. Please try again.");
      }

      setStep("code");
      setInfoMessage(`A 6-digit verification code has been sent to ${cleanEmail}.`);
      setCooldown(data.cooldownSeconds || 60);
    } catch (err: any) {
      setError(err?.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        code: cleanCode,
        type: "healthcare_otp",
        redirect: false,
        callbackUrl: "/workspace/h",
      });

      if (!res || res.error) {
        throw new Error(res?.error || "Invalid or expired verification code. Please try again.");
      }

      // Successful authentication -> navigate directly to Healthcare Workspace
      router.replace("/workspace/h");
    } catch (err: any) {
      setError(err?.message || "Verification failed. Please check your code and try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    await handleSendCode({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div
      className={css({
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bg: "#F8FAFC",
        px: "16px",
        py: "32px",
      })}
    >
      <div
        className={css({
          width: "100%",
          maxWidth: "420px",
          bg: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
        })}
      >
        {/* Brand Header */}
        <div
          className={css({
            p: { base: "24px 24px 16px", sm: "32px 32px 20px" },
            borderBottom: "1px solid #F1F5F9",
          })}
        >
          <div className={css({ display: "flex", alignItems: "center", gap: "8px", mb: "6px" })}>
            <span
              className={css({
                width: "8px",
                height: "8px",
                borderRadius: "9999px",
                bg: "#10B981",
              })}
            />
            <span
              className={css({
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#2563EB",
              })}
            >
              GrowxLabs Healthcare
            </span>
          </div>

          <h1
            className={css({
              fontSize: "22px",
              fontWeight: "700",
              letterSpacing: "-0.02em",
              color: "#0F172A",
            })}
          >
            Lead Manager Access
          </h1>
          <p className={css({ fontSize: "13px", color: "#64748B", mt: "4px" })}>
            {step === "email"
              ? "Enter your registered work email to receive a single-use login code."
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {/* Form Body */}
        <div className={css({ p: { base: "24px", sm: "32px" } })}>
          {error && (
            <div
              className={css({
                mb: "20px",
                p: "12px 14px",
                borderRadius: "8px",
                bg: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#991B1B",
                fontSize: "13px",
                lineHeight: "1.4",
              })}
            >
              {error}
            </div>
          )}

          {infoMessage && !error && (
            <div
              className={css({
                mb: "20px",
                p: "12px 14px",
                borderRadius: "8px",
                bg: "#EFF6FF",
                border: "1px solid #BFDBFE",
                color: "#1E40AF",
                fontSize: "13px",
                lineHeight: "1.4",
              })}
            >
              {infoMessage}
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendCode} className={css({ display: "flex", flexDirection: "column", gap: "20px" })}>
              <div>
                <label
                  htmlFor="work-email"
                  className={css({
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#334155",
                    mb: "6px",
                  })}
                >
                  Work email
                </label>
                <div className={css({ position: "relative" })}>
                  <input
                    id="work-email"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@growxlabs.tech"
                    disabled={loading}
                    className={css({
                      width: "100%",
                      height: "44px",
                      px: "14px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      bg: "#FFFFFF",
                      fontSize: "14px",
                      color: "#0F172A",
                      outline: "none",
                      transition: "border-color 0.15s ease",
                      _focus: { borderColor: "#2563EB", ring: "2px solid rgba(37, 99, 235, 0.2)" },
                      _disabled: { bg: "#F1F5F9", color: "#94A3B8" },
                    })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className={css({
                  height: "44px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  borderRadius: "8px",
                  bg: "#2563EB",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                  _hover: { bg: "#1D4ED8" },
                  _disabled: { bg: "#93C5FD", cursor: "not-allowed" },
                })}
              >
                {loading ? (
                  <>
                    <Loader2 className={css({ width: "16px", height: "16px", animation: "spin 1s linear infinite" })} />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <>
                    <span>Send code</span>
                    <ArrowRight className={css({ width: "16px", height: "16px" })} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className={css({ display: "flex", flexDirection: "column", gap: "20px" })}>
              <div>
                <div className={css({ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "6px" })}>
                  <label
                    htmlFor="otp-code"
                    className={css({
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#334155",
                    })}
                  >
                    6-digit verification code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setError(null);
                      setInfoMessage(null);
                    }}
                    className={css({
                      fontSize: "12px",
                      color: "#2563EB",
                      fontWeight: "500",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      _hover: { textDecoration: "underline" },
                    })}
                  >
                    Change email
                  </button>
                </div>

                <input
                  ref={codeInputRef}
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setCode(val);
                  }}
                  placeholder="······"
                  disabled={loading}
                  className={css({
                    width: "100%",
                    height: "48px",
                    px: "14px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    bg: "#FFFFFF",
                    fontSize: "24px",
                    fontFamily: "monospace",
                    letterSpacing: "0.35em",
                    textAlign: "center",
                    color: "#0F172A",
                    outline: "none",
                    transition: "border-color 0.15s ease",
                    _focus: { borderColor: "#2563EB", ring: "2px solid rgba(37, 99, 235, 0.2)" },
                    _disabled: { bg: "#F1F5F9", color: "#94A3B8" },
                  })}
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.trim().length !== 6}
                className={css({
                  height: "44px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  borderRadius: "8px",
                  bg: "#2563EB",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                  _hover: { bg: "#1D4ED8" },
                  _disabled: { bg: "#93C5FD", cursor: "not-allowed" },
                })}
              >
                {loading ? (
                  <>
                    <Loader2 className={css({ width: "16px", height: "16px", animation: "spin 1s linear infinite" })} />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className={css({ width: "16px", height: "16px" })} />
                  </>
                )}
              </button>

              <div className={css({ textAlign: "center", mt: "4px" })}>
                {cooldown > 0 ? (
                  <p className={css({ fontSize: "12px", color: "#64748B" })}>
                    Resend code in {cooldown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className={css({
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#2563EB",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      _hover: { textDecoration: "underline" },
                    })}
                  >
                    <RefreshCw className={css({ width: "12px", height: "12px" })} />
                    <span>Resend verification code</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div
          className={css({
            p: "14px 24px",
            bg: "#F8FAFC",
            borderTop: "1px solid #F1F5F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontSize: "11px",
            color: "#64748B",
          })}
        >
          <ShieldCheck className={css({ width: "14px", height: "14px", color: "#10B981" })} />
          <span>Encrypted single-use verification · GrowXLabs Employee OS</span>
        </div>
      </div>
    </div>
  );
}
