"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  CheckCircle2,
  CalendarDays,
  ExternalLink,
  Building2,
  AlertCircle,
  X,
  RotateCw,
} from "lucide-react";
import { css, cx } from "@/styled-system/css";

interface FollowUpItem {
  id: string;
  lead_id: string;
  context: string;
  due_at: string;
  priority?: string | null;
  status: string;
  leads?: {
    id: string;
    business_name?: string | null;
    name?: string | null;
  } | null;
}

const OUTCOMES = [
  "Connected",
  "No answer",
  "Interested",
  "Not interested",
  "Call back requested",
  "Meeting requested",
  "Other",
] as const;

export function HealthcareFollowUpsView({ items }: { items: FollowUpItem[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"today" | "upcoming" | "completed" | "all">("today");
  const [completingItem, setCompletingItem] = useState<FollowUpItem | null>(null);
  const [reschedulingItem, setReschedulingItem] = useState<FollowUpItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const now = new Date();
  const todayStr = now.toDateString();

  const filteredItems = items.filter((item) => {
    if (tab === "completed") return item.status === "completed";
    if (item.status !== "open") return false;

    const dueDate = new Date(item.due_at);
    if (tab === "today") {
      return dueDate.toDateString() === todayStr || dueDate.getTime() < now.getTime();
    }
    if (tab === "upcoming") {
      return dueDate.getTime() > now.getTime() && dueDate.toDateString() !== todayStr;
    }
    return true; // all open
  });

  const handleComplete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!completingItem) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const form = new FormData(e.currentTarget);
      const outcome = String(form.get("outcome") || "Connected");
      const notes = String(form.get("notes") || "");
      const nextFollowup = String(form.get("nextFollowupAt") || "");
      const nextContext = String(form.get("nextContext") || "");

      const res = await fetch(`/api/workspace/sales/follow-ups/${completingItem.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome,
          notes,
          nextFollowupAt: nextFollowup ? new Date(nextFollowup).toISOString() : undefined,
          nextContext: nextContext || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to complete follow-up");
      }

      setCompletingItem(null);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to complete follow-up");
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingItem || !rescheduleDate) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/workspace/sales/follow-ups/${reschedulingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dueAt: new Date(rescheduleDate).toISOString(),
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to reschedule follow-up");
      }

      setReschedulingItem(null);
      setRescheduleDate("");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reschedule follow-up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={css({ display: "flex", flexDirection: "column", gap: "16px" })}>
      {/* Tabs */}
      <div
        className={css({
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          pb: "4px",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        })}
      >
        {[
          { id: "today", label: "Today & Overdue" },
          { id: "upcoming", label: "Upcoming" },
          { id: "completed", label: "Completed" },
          { id: "all", label: "All Open" },
        ].map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={css({
                flexShrink: 0,
                borderRadius: "8px",
                px: "14px",
                py: "8px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                border: "1px solid",
                transition: "all 0.15s ease",
                bg: active ? "#020617" : "#FFFFFF",
                color: active ? "#FFFFFF" : "#475569",
                borderColor: active ? "#020617" : "#E2E8F0",
                boxShadow: active ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                _hover: { bg: active ? "#0F172A" : "#F8FAFC" },
              })}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Cards List */}
      <div className={css({ display: "flex", flexDirection: "column", gap: "12px" })}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const clinicName =
              item.leads?.business_name || item.leads?.name || "Clinic";
            const leadId = item.lead_id || item.leads?.id;
            const isOverdue =
              item.status === "open" && new Date(item.due_at).getTime() < now.getTime();

            const priorityBg =
              item.priority === "urgent"
                ? "#FFE4E6"
                : item.priority === "high"
                ? "#FFF1F2"
                : "#F8FAFC";
            const priorityText =
              item.priority === "urgent"
                ? "#9F1239"
                : item.priority === "high"
                ? "#BE123C"
                : "#475569";
            const priorityBorder =
              item.priority === "urgent"
                ? "#FDA4AF"
                : item.priority === "high"
                ? "#FECDD3"
                : "#E2E8F0";

            return (
              <div
                key={item.id}
                className={css({
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  bg: "#FFFFFF",
                  p: { base: "16px", sm: "20px" },
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  transition: "border-color 0.15s ease",
                  _hover: { borderColor: "#CBD5E1" },
                })}
              >
                {/* Header: Clinic & Priority */}
                <div
                  className={css({
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "12px",
                  })}
                >
                  <div className={css({ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 })}>
                    <h3
                      className={css({
                        fontSize: { base: "14px", sm: "16px" },
                        fontWeight: "700",
                        color: "#020617",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      })}
                    >
                      {clinicName}
                    </h3>
                    <p
                      className={css({
                        fontSize: "12px",
                        color: "#475569",
                        lineClamp: 2,
                      })}
                    >
                      {item.context}
                    </p>
                  </div>
                  <div className={css({ flexShrink: 0, display: "flex", alignItems: "center", gap: "6px" })}>
                    {item.priority && (
                      <span
                        className={css({
                          borderRadius: "6px",
                          px: "8px",
                          py: "2px",
                          fontSize: "10px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          border: "1px solid",
                        })}
                        style={{
                          backgroundColor: priorityBg,
                          color: priorityText,
                          borderColor: priorityBorder,
                        }}
                      >
                        {item.priority}
                      </span>
                    )}
                    {item.status === "completed" ? (
                      <span
                        className={css({
                          borderRadius: "6px",
                          bg: "#ECFDF5",
                          color: "#065F46",
                          border: "1px solid #A7F3D0",
                          px: "8px",
                          py: "2px",
                          fontSize: "10px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        })}
                      >
                        Done
                      </span>
                    ) : isOverdue ? (
                      <span
                        className={css({
                          borderRadius: "6px",
                          bg: "#FFFBEB",
                          color: "#92400E",
                          border: "1px solid #FDE68A",
                          px: "8px",
                          py: "2px",
                          fontSize: "10px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        })}
                      >
                        Overdue
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Due Time */}
                <div className={css({ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748B" })}>
                  <Clock className={css({ width: "14px", height: "14px", color: "#94A3B8" })} />
                  <span>
                    Due: <strong className={css({ color: "#334155" })}>{new Date(item.due_at).toLocaleString()}</strong>
                  </span>
                </div>

                {/* Actions: Complete, Reschedule, Open Lead */}
                <div
                  className={css({
                    pt: "8px",
                    borderTop: "1px solid #F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  })}
                >
                  {item.status === "open" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCompletingItem(item)}
                        className={css({
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          borderRadius: "12px",
                          bg: "#020617",
                          px: "14px",
                          py: "8px",
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#FFFFFF",
                          cursor: "pointer",
                          minHeight: "36px",
                          transition: "all 0.15s ease",
                          border: "none",
                          _hover: { bg: "#1E293B" },
                          _active: { transform: "scale(0.98)" },
                        })}
                      >
                        <CheckCircle2 className={css({ width: "14px", height: "14px" })} />
                        <span>Complete</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setReschedulingItem(item);
                          setRescheduleDate(item.due_at ? item.due_at.slice(0, 16) : "");
                        }}
                        className={css({
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          borderRadius: "12px",
                          border: "1px solid #E2E8F0",
                          bg: "#FFFFFF",
                          px: "14px",
                          py: "8px",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#334155",
                          cursor: "pointer",
                          minHeight: "36px",
                          transition: "all 0.15s ease",
                          _hover: { bg: "#F8FAFC" },
                          _active: { transform: "scale(0.98)" },
                        })}
                      >
                        <CalendarDays className={css({ width: "14px", height: "14px", color: "#94A3B8" })} />
                        <span>Reschedule</span>
                      </button>
                    </>
                  )}

                  {leadId && (
                    <Link
                      href={`/workspace/h/leads/${leadId}`}
                      className={css({
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        borderRadius: "12px",
                        border: "1px solid #BFDBFE",
                        bg: "rgba(239,246,255,0.7)",
                        px: "14px",
                        py: "8px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#1D4ED8",
                        textDecoration: "none",
                        marginLeft: "auto",
                        minHeight: "36px",
                        transition: "all 0.15s ease",
                        _hover: { bg: "rgba(219,234,254,0.7)" },
                        _active: { transform: "scale(0.98)" },
                      })}
                    >
                      <span>Open Clinic</span>
                      <ExternalLink className={css({ width: "14px", height: "14px" })} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div
            className={css({
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              bg: "#FFFFFF",
              p: "32px",
              textAlign: "center",
              color: "#64748B",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            })}
          >
            <Calendar
              className={css({
                width: "32px",
                height: "32px",
                color: "#CBD5E1",
                mx: "auto",
                mb: "8px",
              })}
            />
            <p className={css({ fontSize: "14px", fontWeight: "600", color: "#1E293B" })}>
              No follow-ups found
            </p>
            <p className={css({ fontSize: "12px", color: "#64748B", mt: "4px" })}>
              You&apos;re all caught up for this view.
            </p>
          </div>
        )}
      </div>

      {/* Complete Modal */}
      {completingItem && (
        <div
          className={css({
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bg: "rgba(2,6,23,0.5)",
            p: "16px",
            backdropFilter: "blur(2px)",
          })}
        >
          <div
            className={css({
              width: "100%",
              maxWidth: "28rem",
              borderRadius: "16px",
              bg: "#FFFFFF",
              p: "24px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            })}
          >
            <div
              className={css({
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #F1F5F9",
                pb: "12px",
              })}
            >
              <div>
                <h3 className={css({ fontWeight: "700", fontSize: "16px", color: "#020617" })}>
                  Complete Follow-up
                </h3>
                <p className={css({ fontSize: "12px", color: "#64748B" })}>
                  {completingItem.leads?.business_name || completingItem.leads?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCompletingItem(null)}
                className={css({ color: "#94A3B8", cursor: "pointer", p: "4px", _hover: { color: "#334155" } })}
              >
                <X className={css({ width: "20px", height: "20px" })} />
              </button>
            </div>

            {errorMsg && (
              <div
                className={css({
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  borderRadius: "12px",
                  bg: "#FFF1F2",
                  border: "1px solid #FECDD3",
                  p: "12px",
                  fontSize: "12px",
                  color: "#9F1239",
                })}
              >
                <AlertCircle className={css({ width: "16px", height: "16px", flexShrink: 0 })} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleComplete} className={css({ display: "flex", flexDirection: "column", gap: "14px" })}>
              <div className={css({ display: "flex", flexDirection: "column", gap: "4px" })}>
                <label className={css({ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#475569" })}>
                  Outcome
                </label>
                <select
                  name="outcome"
                  required
                  defaultValue="Connected"
                  className={css({
                    width: "100%",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    bg: "#F8FAFC",
                    px: "14px",
                    py: "10px",
                    fontSize: "14px",
                    color: "#0F172A",
                    _focus: { borderColor: "#3B82F6", bg: "#FFFFFF", outline: "none" },
                  })}
                >
                  {OUTCOMES.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div className={css({ display: "flex", flexDirection: "column", gap: "4px" })}>
                <label className={css({ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#475569" })}>
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Key discussion points or conclusion..."
                  className={css({
                    width: "100%",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    bg: "#F8FAFC",
                    p: "12px",
                    fontSize: "14px",
                    color: "#0F172A",
                    _focus: { borderColor: "#3B82F6", bg: "#FFFFFF", outline: "none" },
                  })}
                />
              </div>

              <div className={css({ display: "flex", flexDirection: "column", gap: "4px" })}>
                <label className={css({ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#475569" })}>
                  Next Follow-up (Optional)
                </label>
                <input
                  name="nextFollowupAt"
                  type="datetime-local"
                  className={css({
                    width: "100%",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    bg: "#F8FAFC",
                    px: "14px",
                    py: "8px",
                    fontSize: "14px",
                    color: "#0F172A",
                    _focus: { borderColor: "#3B82F6", bg: "#FFFFFF", outline: "none" },
                  })}
                />
              </div>

              <div className={css({ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", pt: "8px" })}>
                <button
                  type="button"
                  onClick={() => setCompletingItem(null)}
                  className={css({
                    borderRadius: "12px",
                    px: "16px",
                    py: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#475569",
                    cursor: "pointer",
                    border: "none",
                    bg: "transparent",
                    _hover: { bg: "#F1F5F9" },
                  })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={css({
                    borderRadius: "12px",
                    bg: "#020617",
                    px: "16px",
                    py: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#FFFFFF",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    border: "none",
                    _hover: { bg: "#1E293B" },
                    _disabled: { opacity: 0.5, cursor: "not-allowed" },
                  })}
                >
                  {loading ? "Saving..." : "Mark Completed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingItem && (
        <div
          className={css({
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bg: "rgba(2,6,23,0.5)",
            p: "16px",
            backdropFilter: "blur(2px)",
          })}
        >
          <div
            className={css({
              width: "100%",
              maxWidth: "28rem",
              borderRadius: "16px",
              bg: "#FFFFFF",
              p: "24px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            })}
          >
            <div
              className={css({
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #F1F5F9",
                pb: "12px",
              })}
            >
              <div>
                <h3 className={css({ fontWeight: "700", fontSize: "16px", color: "#020617" })}>
                  Reschedule Follow-up
                </h3>
                <p className={css({ fontSize: "12px", color: "#64748B" })}>
                  {reschedulingItem.leads?.business_name || reschedulingItem.leads?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReschedulingItem(null)}
                className={css({ color: "#94A3B8", cursor: "pointer", p: "4px", _hover: { color: "#334155" } })}
              >
                <X className={css({ width: "20px", height: "20px" })} />
              </button>
            </div>

            {errorMsg && (
              <div
                className={css({
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  borderRadius: "12px",
                  bg: "#FFF1F2",
                  border: "1px solid #FECDD3",
                  p: "12px",
                  fontSize: "12px",
                  color: "#9F1239",
                })}
              >
                <AlertCircle className={css({ width: "16px", height: "16px", flexShrink: 0 })} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleReschedule} className={css({ display: "flex", flexDirection: "column", gap: "14px" })}>
              <div className={css({ display: "flex", flexDirection: "column", gap: "4px" })}>
                <label className={css({ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#475569" })}>
                  New Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className={css({
                    width: "100%",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    bg: "#F8FAFC",
                    px: "14px",
                    py: "10px",
                    fontSize: "14px",
                    color: "#0F172A",
                    _focus: { borderColor: "#3B82F6", bg: "#FFFFFF", outline: "none" },
                  })}
                />
              </div>

              <div className={css({ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", pt: "8px" })}>
                <button
                  type="button"
                  onClick={() => setReschedulingItem(null)}
                  className={css({
                    borderRadius: "12px",
                    px: "16px",
                    py: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#475569",
                    cursor: "pointer",
                    border: "none",
                    bg: "transparent",
                    _hover: { bg: "#F1F5F9" },
                  })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !rescheduleDate}
                  className={css({
                    borderRadius: "12px",
                    bg: "#020617",
                    px: "16px",
                    py: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#FFFFFF",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    border: "none",
                    _hover: { bg: "#1E293B" },
                    _disabled: { opacity: 0.5, cursor: "not-allowed" },
                  })}
                >
                  {loading ? "Saving..." : "Update Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
