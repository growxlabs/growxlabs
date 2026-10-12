"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  Mail,
  ChevronDown,
} from "lucide-react";
import { css } from "@/styled-system/css";

interface Lead {
  id: string;
  status?: string | null;
  priority?: string | null;
  phone?: string | null;
  email?: string | null;
  name?: string | null;
  business_name?: string | null;
}

const OUTCOMES = [
  "No answer",
  "Receptionist answered",
  "Doctor unavailable",
  "Call back requested",
  "WhatsApp sent",
  "Interested",
  "Demo requested",
  "Not interested",
] as const;

const STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "engaged", label: "Engaged / In Talks" },
  { value: "qualified", label: "Qualified" },
  { value: "disqualified", label: "Disqualified" },
] as const;

function normalizeWhatsAppPhone(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length >= 10) return digits;
  return null;
}

export function HealthcareLeadActionForm({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(lead.status || "new");
  const [outcome, setOutcome] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [nextFollowUp, setNextFollowUp] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const waPhone = normalizeWhatsAppPhone(lead.phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const base = `/api/workspace/sales/leads/${lead.id}`;
      const promises: Promise<any>[] = [];

      if (status !== lead.status) {
        promises.push(
          fetch(base, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }).then(async (res) => {
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || "Failed to update status");
            }
          })
        );
      }

      if (outcome || notes.trim()) {
        const activityType = outcome === "WhatsApp sent" ? "whatsapp" : "call";
        const activityNotes = notes.trim() || outcome || "Contact updated";
        promises.push(
          fetch(`${base}/activities`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              activityType,
              outcome: outcome || undefined,
              notes: activityNotes,
              nextAction: nextFollowUp ? `Follow up on ${nextFollowUp}` : undefined,
            }),
          }).then(async (res) => {
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || "Failed to log activity");
            }
          })
        );
      }

      if (nextFollowUp) {
        const dueAtIso = new Date(nextFollowUp).toISOString();
        promises.push(
          fetch(`${base}/follow-ups`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              context: notes.trim() || outcome || "Scheduled healthcare follow-up",
              dueAt: dueAtIso,
              priority: outcome === "Interested" || outcome === "Demo requested" ? "high" : "medium",
            }),
          }).then(async (res) => {
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || "Failed to schedule follow-up");
            }
          })
        );
      }

      if (promises.length === 0) {
        setFeedback({ type: "error", text: "Select an outcome, enter notes, or update status." });
        setLoading(false);
        return;
      }

      await Promise.all(promises);

      setFeedback({ type: "success", text: "Lead update saved." });
      setOutcome("");
      setNotes("");
      setNextFollowUp("");
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to save update." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={css({
        borderRadius: "8px",
        border: "1px solid #E2E8F0",
        bg: "#FFFFFF",
        p: { base: "16px", sm: "18px" },
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      })}
    >
      {/* Header */}
      <div
        className={css({
          borderBottom: "1px solid #F1F5F9",
          pb: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        })}
      >
        <div>
          <h2
            className={css({
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#0F172A",
            })}
          >
            Lead Execution
          </h2>
          <p className={css({ fontSize: "11px", color: "#64748B", mt: "2px" })}>
            Log outreach and pipeline progress
          </p>
        </div>
        <span
          className={css({
            borderRadius: "4px",
            bg: "#F1F5F9",
            px: "6px",
            py: "2px",
            fontSize: "10px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#475569",
          })}
        >
          Active
        </span>
      </div>

      <form onSubmit={handleSubmit} className={css({ display: "flex", flexDirection: "column", gap: "12px" })}>
        {/* Status Dropdown */}
        <div>
          <label
            className={css({
              display: "block",
              fontSize: "11px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#64748B",
              mb: "4px",
            })}
          >
            Pipeline Status
          </label>
          <div className={css({ position: "relative" })}>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={css({
                width: "100%",
                appearance: "none",
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                bg: "#F8FAFC",
                px: "10px",
                py: "8px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#0F172A",
                cursor: "pointer",
                _focus: { borderColor: "#2563EB", bg: "#FFFFFF", outline: "none" },
              })}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className={css({
                pointerEvents: "none",
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "14px",
                height: "14px",
                color: "#94A3B8",
              })}
            />
          </div>
        </div>

        {/* Outcome Selector */}
        <div>
          <label
            className={css({
              display: "block",
              fontSize: "11px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#64748B",
              mb: "4px",
            })}
          >
            Outcome
          </label>
          <div className={css({ position: "relative" })}>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className={css({
                width: "100%",
                appearance: "none",
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                bg: "#F8FAFC",
                px: "10px",
                py: "8px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#0F172A",
                cursor: "pointer",
                _focus: { borderColor: "#2563EB", bg: "#FFFFFF", outline: "none" },
              })}
            >
              <option value="">Select call / contact outcome...</option>
              {OUTCOMES.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <ChevronDown
              className={css({
                pointerEvents: "none",
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "14px",
                height: "14px",
                color: "#94A3B8",
              })}
            />
          </div>
        </div>

        {/* Notes Textarea */}
        <div>
          <label
            className={css({
              display: "block",
              fontSize: "11px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#64748B",
              mb: "4px",
            })}
          >
            Discussion Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Key discussion points, doctor's response, or next step..."
            className={css({
              width: "100%",
              borderRadius: "6px",
              border: "1px solid #E2E8F0",
              bg: "#F8FAFC",
              p: "10px",
              fontSize: "13px",
              color: "#0F172A",
              lineHeight: "1.5",
              resize: "vertical",
              _placeholder: { color: "#94A3B8" },
              _focus: { borderColor: "#2563EB", bg: "#FFFFFF", outline: "none" },
            })}
          />
        </div>

        {/* Next Follow-up Picker */}
        <div>
          <label
            className={css({
              display: "block",
              fontSize: "11px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#64748B",
              mb: "4px",
            })}
          >
            Schedule Follow-up (Optional)
          </label>
          <input
            type="datetime-local"
            value={nextFollowUp}
            onChange={(e) => setNextFollowUp(e.target.value)}
            className={css({
              width: "100%",
              borderRadius: "6px",
              border: "1px solid #E2E8F0",
              bg: "#F8FAFC",
              px: "10px",
              py: "8px",
              fontSize: "13px",
              color: "#0F172A",
              cursor: "pointer",
              _focus: { borderColor: "#2563EB", bg: "#FFFFFF", outline: "none" },
            })}
          />
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "6px",
              p: "10px",
              fontSize: "12px",
              fontWeight: "500",
              border: "1px solid",
              bg: feedback.type === "success" ? "#ECFDF5" : "#FFF1F2",
              color: feedback.type === "success" ? "#065F46" : "#9F1239",
              borderColor: feedback.type === "success" ? "#A7F3D0" : "#FECDD3",
            })}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className={css({ width: "14px", height: "14px", flexShrink: 0, color: "#059669" })} />
            ) : (
              <AlertCircle className={css({ width: "14px", height: "14px", flexShrink: 0, color: "#E11D48" })} />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className={css({
            width: "100%",
            borderRadius: "6px",
            bg: "#020617",
            px: "14px",
            py: "10px",
            fontSize: "13px",
            fontWeight: "600",
            color: "#FFFFFF",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            cursor: "pointer",
            minHeight: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.15s ease",
            border: "none",
            _hover: { bg: "#1E293B" },
            _active: { transform: "scale(0.99)" },
            _disabled: { opacity: 0.5, cursor: "not-allowed" },
          })}
        >
          {loading ? (
            <div
              className={css({
                width: "14px",
                height: "14px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#FFFFFF",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              })}
            />
          ) : (
            <>
              <CheckCircle2 className={css({ width: "14px", height: "14px" })} />
              <span>Save Update</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Contact Actions Bar */}
      <div className={css({ borderTop: "1px solid #F1F5F9", pt: "12px", display: "flex", flexDirection: "column", gap: "8px" })}>
        <span
          className={css({
            fontSize: "11px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "#64748B",
          })}
        >
          Direct Outreach
        </span>
        <div className={css({ display: "flex", flexDirection: "column", gap: "6px" })}>
          {lead.phone ? (
            <a
              href={`tel:${lead.phone}`}
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                bg: "#F8FAFC",
                px: "10px",
                py: "8px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#0F172A",
                textDecoration: "none",
                transition: "all 0.15s ease",
                _hover: { bg: "#EFF6FF", borderColor: "#BFDBFE", color: "#1D4ED8" },
              })}
            >
              <Phone className={css({ width: "13px", height: "13px", color: "#2563EB" })} />
              <span className={css({ truncate: true })}>Call: {lead.phone}</span>
            </a>
          ) : (
            <div
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "6px",
                border: "1px solid #F1F5F9",
                bg: "#F8FAFC",
                px: "10px",
                py: "8px",
                fontSize: "12px",
                color: "#94A3B8",
              })}
            >
              <Phone className={css({ width: "13px", height: "13px" })} />
              <span>No phone number</span>
            </div>
          )}

          {waPhone && (
            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                bg: "#F8FAFC",
                px: "10px",
                py: "8px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#0F172A",
                textDecoration: "none",
                transition: "all 0.15s ease",
                _hover: { bg: "#ECFDF5", borderColor: "#A7F3D0", color: "#065F46" },
              })}
            >
              <MessageCircle className={css({ width: "13px", height: "13px", color: "#059669" })} />
              <span>Open WhatsApp</span>
            </a>
          )}

          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                bg: "#F8FAFC",
                px: "10px",
                py: "8px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#0F172A",
                textDecoration: "none",
                transition: "all 0.15s ease",
                _hover: { bg: "#F8FAFC", borderColor: "#CBD5E1" },
              })}
            >
              <Mail className={css({ width: "13px", height: "13px", color: "#64748B" })} />
              <span className={css({ truncate: true })}>{lead.email}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
