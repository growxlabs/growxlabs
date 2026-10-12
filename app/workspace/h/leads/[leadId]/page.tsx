import Link from "next/link";
import { notFound } from "next/navigation";
import { requireActiveEmployeeContext } from "@/lib/employee-os/context";
import { getAccessibleLead, SalesAccessError } from "@/lib/employee-os/sales-service";
import { LeadIntelligenceBrief } from "@/components/workspace/LeadIntelligenceBrief";
import { HealthcareLeadActionForm } from "@/components/workspace/HealthcareLeadActionForm";
import {
  extractGrowxIntelligence,
  extractHealthcareFields,
} from "@/lib/leads/intelligence-types";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  Clock,
  UserCheck,
} from "lucide-react";
import { css } from "@/styled-system/css";

export const dynamic = "force-dynamic";

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

export default async function HealthcareLeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const context = await requireActiveEmployeeContext();
  const { leadId } = await params;

  let lead: any;
  try {
    lead = await getAccessibleLead(context, leadId);
  } catch (err) {
    if (err instanceof SalesAccessError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const intel = extractGrowxIntelligence(lead.custom_fields);
  const hc = extractHealthcareFields(lead.custom_fields);

  const clinicCategory = hc?.specialty || hc?.type || "Healthcare / Clinic";
  const rawStrength = (intel?.opportunity?.strength || "medium").toLowerCase();
  const strengthLabel = `${rawStrength.toUpperCase()} OPPORTUNITY`;

  const strengthStyles = {
    high: { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
    medium: { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
    low: { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1" },
  }[rawStrength as "high" | "medium" | "low"] || { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" };

  const waPhone = normalizeWhatsAppPhone(lead.phone);
  const decisionMaker = intel?.decision_maker?.name || hc?.doctor_name || lead.name || "Clinic Decision Maker";

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        maxWidth: "68rem",
        mx: "auto",
        pb: "40px",
      })}
    >
      {/* 1. Back Navigation Link */}
      <div>
        <Link
          href="/workspace/h/leads"
          className={css({
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#64748B",
            textDecoration: "none",
            transition: "color 0.15s ease",
            _hover: { color: "#0F172A" },
          })}
        >
          <ArrowLeft className={css({ width: "13px", height: "13px" })} />
          <span>Assigned Leads</span>
        </Link>
      </div>

      {/* 2. Compact Account Header */}
      <header
        className={css({
          borderRadius: "8px",
          border: "1px solid #E2E8F0",
          bg: "#FFFFFF",
          p: { base: "16px", sm: "20px" },
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        })}
      >
        <div
          className={css({
            display: "flex",
            flexDirection: { base: "column", sm: "row" },
            alignItems: { sm: "flex-start" },
            justifyContent: "space-between",
            gap: "12px",
          })}
        >
          <div className={css({ display: "flex", flexDirection: "column", gap: "4px" })}>
            <div className={css({ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" })}>
              <h1
                className={css({
                  fontSize: { base: "20px", sm: "24px" },
                  fontWeight: "700",
                  letterSpacing: "-0.01em",
                  color: "#0F172A",
                  lineHeight: "1.3",
                })}
              >
                {lead.business_name || lead.name || "Clinic"}
              </h1>
            </div>

            {/* Sub-line: Category · Location · Decision Maker */}
            <div
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "#475569",
                flexWrap: "wrap",
              })}
            >
              <span className={css({ fontWeight: "600", color: "#0F172A" })}>
                {clinicCategory}
              </span>
              {lead.city && (
                <>
                  <span className={css({ color: "#CBD5E1" })}>·</span>
                  <span className={css({ display: "inline-flex", alignItems: "center", gap: "3px" })}>
                    <MapPin className={css({ width: "12px", height: "12px", color: "#94A3B8" })} />
                    {lead.city}
                  </span>
                </>
              )}
              {decisionMaker && (
                <>
                  <span className={css({ color: "#CBD5E1" })}>·</span>
                  <span className={css({ color: "#64748B" })}>
                    Decision maker: <strong className={css({ color: "#0F172A", fontWeight: "600" })}>{decisionMaker}</strong>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Opportunity Strength Badge */}
          <div className={css({ flexShrink: 0 })}>
            <span
              className={css({
                display: "inline-flex",
                alignItems: "center",
                px: "10px",
                py: "4px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                border: "1px solid",
              })}
              style={{
                backgroundColor: strengthStyles.bg,
                color: strengthStyles.text,
                borderColor: strengthStyles.border,
              }}
            >
              {strengthLabel}
            </span>
          </div>
        </div>

        {/* Compact Outreach Button Row */}
        <div
          className={css({
            pt: "8px",
            borderTop: "1px solid #F1F5F9",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          })}
        >
          {lead.phone ? (
            <a
              href={`tel:${lead.phone}`}
              className={css({
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "6px",
                border: "1px solid #0F172A",
                bg: "#0F172A",
                px: "12px",
                py: "6px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#FFFFFF",
                textDecoration: "none",
                transition: "all 0.15s ease",
                _hover: { bg: "#1E293B" },
              })}
            >
              <Phone className={css({ width: "12px", height: "12px", color: "#34D399" })} />
              <span>Call ({lead.phone})</span>
            </a>
          ) : null}

          {waPhone ? (
            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className={css({
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "6px",
                border: "1px solid #059669",
                bg: "#059669",
                px: "12px",
                py: "6px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#FFFFFF",
                textDecoration: "none",
                transition: "all 0.15s ease",
                _hover: { bg: "#047857" },
              })}
            >
              <MessageCircle className={css({ width: "12px", height: "12px" })} />
              <span>WhatsApp</span>
            </a>
          ) : null}

          {lead.email ? (
            <a
              href={`mailto:${lead.email}`}
              className={css({
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                bg: "#FFFFFF",
                px: "12px",
                py: "6px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#0F172A",
                textDecoration: "none",
                transition: "all 0.15s ease",
                _hover: { bg: "#F8FAFC" },
              })}
            >
              <Mail className={css({ width: "12px", height: "12px", color: "#64748B" })} />
              <span>Email</span>
            </a>
          ) : null}
        </div>
      </header>

      {/* 3. Main Desktop 2-Column Grid: Business Dossier | Execution Panel */}
      <div
        className={css({
          display: "grid",
          gridTemplateColumns: { base: "1fr", lg: "minmax(0, 1fr) 340px" },
          gap: "20px",
          alignItems: "start",
        })}
      >
        {/* Left: Business Intelligence Dossier */}
        <div
          className={css({
            borderRadius: "8px",
            border: "1px solid #E2E8F0",
            bg: "#FFFFFF",
            p: { base: "16px", sm: "20px" },
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          })}
        >
          <LeadIntelligenceBrief customFields={lead.custom_fields} city={lead.city} />
        </div>

        {/* Right: Sticky Execution Panel */}
        <div
          className={css({
            position: { lg: "sticky" },
            top: { lg: "24px" },
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          })}
        >
          <HealthcareLeadActionForm lead={lead} />
        </div>
      </div>

      {/* 4. Scheduled Follow-ups (Compact dossier table) */}
      <section
        className={css({
          borderRadius: "8px",
          border: "1px solid #E2E8F0",
          bg: "#FFFFFF",
          p: { base: "16px", sm: "18px" },
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        })}
      >
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #F1F5F9",
            pb: "8px",
          })}
        >
          <div className={css({ display: "flex", alignItems: "center", gap: "6px" })}>
            <Calendar className={css({ width: "14px", height: "14px", color: "#2563EB" })} />
            <h2 className={css({ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0F172A" })}>
              Scheduled Follow-ups
            </h2>
          </div>
          <span className={css({ fontSize: "11px", fontWeight: "600", color: "#64748B" })}>
            {lead.followups?.length || 0} scheduled
          </span>
        </div>

        {lead.followups && lead.followups.length > 0 ? (
          <div className={css({ display: "flex", flexDirection: "column", gap: "6px" })}>
            {lead.followups.map((fu: any) => {
              const fuBg =
                fu.status === "completed"
                  ? "#ECFDF5"
                  : fu.status === "cancelled"
                  ? "#F1F5F9"
                  : "#EFF6FF";
              const fuText =
                fu.status === "completed"
                  ? "#065F46"
                  : fu.status === "cancelled"
                  ? "#475569"
                  : "#1E40AF";
              const fuBorder =
                fu.status === "completed"
                  ? "#A7F3D0"
                  : fu.status === "cancelled"
                  ? "#E2E8F0"
                  : "#BFDBFE";

              return (
                <div
                  key={fu.id}
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    borderRadius: "6px",
                    border: "1px solid #E2E8F0",
                    bg: "#F8FAFC",
                    p: "10px 12px",
                    fontSize: "12px",
                  })}
                >
                  <div className={css({ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 })}>
                    <p className={css({ fontWeight: "600", color: "#0F172A", truncate: true })}>{fu.context}</p>
                    <div className={css({ display: "flex", alignItems: "center", gap: "6px", color: "#64748B", fontSize: "11px" })}>
                      <Clock className={css({ width: "11px", height: "11px", color: "#94A3B8" })} />
                      <span>{new Date(fu.due_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <span
                    className={css({
                      borderRadius: "4px",
                      px: "6px",
                      py: "2px",
                      fontSize: "10px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      border: "1px solid",
                      flexShrink: 0,
                    })}
                    style={{
                      backgroundColor: fuBg,
                      color: fuText,
                      borderColor: fuBorder,
                    }}
                  >
                    {fu.status}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className={css({ fontSize: "12px", color: "#94A3B8", fontStyle: "italic", py: "4px" })}>
            No follow-ups currently scheduled for this account.
          </p>
        )}
      </section>

      {/* 5. Activity Timeline (Compact table/rows) */}
      <section
        className={css({
          borderRadius: "8px",
          border: "1px solid #E2E8F0",
          bg: "#FFFFFF",
          p: { base: "16px", sm: "18px" },
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        })}
      >
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #F1F5F9",
            pb: "8px",
          })}
        >
          <div className={css({ display: "flex", alignItems: "center", gap: "6px" })}>
            <Clock className={css({ width: "14px", height: "14px", color: "#475569" })} />
            <h2 className={css({ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0F172A" })}>
              Activity Timeline
            </h2>
          </div>
          <span className={css({ fontSize: "11px", fontWeight: "600", color: "#64748B" })}>
            {lead.activities?.length || 0} entries
          </span>
        </div>

        {lead.activities && lead.activities.length > 0 ? (
          <div
            className={css({
              display: "flex",
              flexDirection: "column",
              "& > div + div": {
                borderTop: "1px solid #F1F5F9",
              },
            })}
          >
            {lead.activities.map((a: any) => (
              <div
                key={a.id}
                className={css({
                  py: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                  fontSize: "12px",
                })}
              >
                <div className={css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" })}>
                  <div className={css({ display: "flex", alignItems: "center", gap: "6px" })}>
                    <span className={css({ fontWeight: "700", textTransform: "capitalize", color: "#0F172A" })}>
                      {a.activity_type}
                    </span>
                    {a.outcome && (
                      <span
                        className={css({
                          borderRadius: "4px",
                          bg: "#F1F5F9",
                          px: "5px",
                          py: "1px",
                          fontSize: "10px",
                          fontWeight: "600",
                          color: "#334155",
                        })}
                      >
                        {a.outcome}
                      </span>
                    )}
                  </div>
                  <time className={css({ fontSize: "11px", color: "#94A3B8" })}>
                    {new Date(a.occurred_at).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
                {a.notes && (
                  <p className={css({ color: "#475569", lineHeight: "1.5" })}>
                    {a.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className={css({ fontSize: "12px", color: "#94A3B8", fontStyle: "italic", py: "4px" })}>
            No activity logged yet for this account.
          </p>
        )}
      </section>
    </div>
  );
}
