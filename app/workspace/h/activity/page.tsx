import Link from "next/link";
import { requireActiveEmployeeContext } from "@/lib/employee-os/context";
import { getEmployeeSalesActivities } from "@/lib/employee-os/sales-service";
import {
  Clock,
  ExternalLink,
  Phone,
  MessageCircle,
  FileText,
  Activity,
  Building2,
} from "lucide-react";
import { css, cx } from "@/styled-system/css";

export const dynamic = "force-dynamic";

function getActivityIcon(type: string) {
  switch (type.toLowerCase()) {
    case "call":
      return <Phone className={css({ width: "14px", height: "14px", color: "#2563EB" })} />;
    case "whatsapp":
      return <MessageCircle className={css({ width: "14px", height: "14px", color: "#059669" })} />;
    case "note":
      return <FileText className={css({ width: "14px", height: "14px", color: "#D97706" })} />;
    default:
      return <Activity className={css({ width: "14px", height: "14px", color: "#475569" })} />;
  }
}

export default async function HealthcareActivityPage() {
  const context = await requireActiveEmployeeContext();
  const activities = await getEmployeeSalesActivities(context);

  const now = new Date();
  const todayStr = now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const todayActivities: any[] = [];
  const yesterdayActivities: any[] = [];
  const earlierActivities: any[] = [];

  for (const act of activities) {
    const actDate = new Date(act.occurred_at).toDateString();
    if (actDate === todayStr) {
      todayActivities.push(act);
    } else if (actDate === yesterdayStr) {
      yesterdayActivities.push(act);
    } else {
      earlierActivities.push(act);
    }
  }

  const sections = [
    { title: "Today", items: todayActivities },
    { title: "Yesterday", items: yesterdayActivities },
    { title: "Earlier", items: earlierActivities },
  ].filter((s) => s.items.length > 0);

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        maxWidth: "56rem",
        mx: "auto",
        pb: "32px",
      })}
    >
      <header className={css({ display: "flex", flexDirection: "column", gap: "4px" })}>
        <p
          className={css({
            fontSize: "12px",
            fontWeight: "600",
            color: "#2563EB",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          })}
        >
          Log
        </p>
        <h1
          className={css({
            fontSize: { base: "24px", sm: "30px" },
            fontWeight: "700",
            letterSpacing: "-0.02em",
            color: "#020617",
          })}
        >
          Activity history
        </h1>
        <p className={css({ fontSize: "14px", color: "#64748B" })}>
          Log of your calls, outreach, and logged notes with assigned clinics.
        </p>
      </header>

      {sections.length > 0 ? (
        <div className={css({ display: "flex", flexDirection: "column", gap: "32px" })}>
          {sections.map((sec) => (
            <div key={sec.title} className={css({ display: "flex", flexDirection: "column", gap: "12px" })}>
              <h2
                className={css({
                  fontSize: "12px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#64748B",
                  px: "4px",
                })}
              >
                {sec.title} ({sec.items.length})
              </h2>

              <div
                className={css({
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  bg: "#FFFFFF",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  overflow: "hidden",
                  "& > div + div": {
                    borderTop: "1px solid #F1F5F9",
                  },
                })}
              >
                {sec.items.map((act) => {
                  const companyName =
                    act.leads?.business_name || act.leads?.name || "Clinic";
                  const leadId = act.lead_id || act.leads?.id;
                  const timeFormatted = new Date(act.occurred_at).toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit" }
                  );

                  return (
                    <div
                      key={act.id}
                      className={css({
                        p: { base: "16px", sm: "20px" },
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "12px",
                        transition: "background-color 0.15s ease",
                        _hover: { bg: "rgba(248,250,252,0.6)" },
                      })}
                    >
                      <div className={css({ display: "flex", alignItems: "flex-start", gap: "12px", minWidth: 0 })}>
                        <div
                          className={css({
                            borderRadius: "12px",
                            border: "1px solid #E2E8F0",
                            bg: "#F8FAFC",
                            p: "10px",
                            flexShrink: 0,
                            mt: "2px",
                          })}
                        >
                          {getActivityIcon(act.activity_type)}
                        </div>

                        <div className={css({ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 })}>
                          {/* Company Name */}
                          <div className={css({ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" })}>
                            <span
                              className={css({
                                fontWeight: "700",
                                fontSize: "14px",
                                color: "#020617",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              })}
                            >
                              {companyName}
                            </span>
                          </div>

                          {/* Action · Outcome */}
                          <div
                            className={css({
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "12px",
                              color: "#475569",
                              flexWrap: "wrap",
                            })}
                          >
                            <span className={css({ fontWeight: "600", textTransform: "capitalize", color: "#1E293B" })}>
                              {act.activity_type}
                            </span>
                            {act.outcome && (
                              <>
                                <span className={css({ color: "#CBD5E1" })}>·</span>
                                <span
                                  className={css({
                                    borderRadius: "4px",
                                    bg: "#F1F5F9",
                                    px: "6px",
                                    py: "2px",
                                    fontSize: "11px",
                                    fontWeight: "500",
                                    color: "#334155",
                                  })}
                                >
                                  {act.outcome}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Notes snippet if present */}
                          {act.notes && (
                            <p
                              className={css({
                                fontSize: "12px",
                                color: "#64748B",
                                pt: "2px",
                                lineClamp: 2,
                              })}
                            >
                              {act.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right side: Time & Link */}
                      <div className={css({ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" })}>
                        <time className={css({ fontSize: "11px", fontWeight: "500", color: "#94A3B8" })}>
                          {timeFormatted}
                        </time>
                        {leadId && (
                          <Link
                            href={`/workspace/h/leads/${leadId}`}
                            className={css({
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "11px",
                              fontWeight: "700",
                              color: "#2563EB",
                              textDecoration: "none",
                              _hover: { color: "#1D4ED8" },
                            })}
                          >
                            <span>Open</span>
                            <ExternalLink className={css({ width: "12px", height: "12px" })} />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
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
          <Clock className={css({ width: "32px", height: "32px", color: "#CBD5E1", mx: "auto", mb: "8px" })} />
          <p className={css({ fontSize: "14px", fontWeight: "600", color: "#1E293B" })}>No activities recorded yet</p>
          <p className={css({ fontSize: "12px", color: "#64748B", mt: "4px" })}>
            When you call or log notes on your assigned leads, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
