import Link from "next/link";
import { requireActiveEmployeeContext } from "@/lib/employee-os/context";
import { getAssignedLeads, getFollowUps } from "@/lib/employee-os/sales-service";
import {
  Building2,
  CalendarCheck,
  Clock,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { extractGrowxIntelligence } from "@/lib/leads/intelligence-types";
import { css, cx } from "@/styled-system/css";

export const dynamic = "force-dynamic";

export default async function HealthcareHomePage() {
  const context = await requireActiveEmployeeContext();
  const [leads, followups] = await Promise.all([
    getAssignedLeads(context),
    getFollowUps(context),
  ]);

  const newCount = leads.filter((l) => l.status === "new").length;
  const toContactCount = leads.filter((l) =>
    ["contacted", "contacting", "engaged"].includes(l.status || "")
  ).length;
  const openFollowups = followups.filter((f) => f.status === "open");
  const qualifiedCount = leads.filter((l) => l.status === "qualified").length;

  const now = Date.now();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todaysFollowups = openFollowups.filter(
    (f) => Date.parse(f.due_at) <= endOfToday.getTime()
  );

  const recentLeads = leads.slice(0, 5);

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        maxWidth: "56rem",
        mx: "auto",
      })}
    >
      {/* Header */}
      <header className={css({ display: "flex", flexDirection: "column", gap: "4px" })}>
        <div className={css({ display: "flex", alignItems: "center", gap: "8px" })}>
          <span
            className={css({
              width: "8px",
              height: "8px",
              borderRadius: "9999px",
              bg: "#10B981",
            })}
          />
          <p
            className={css({
              fontSize: "12px",
              fontWeight: "600",
              color: "#2563EB",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            })}
          >
            Healthcare
          </p>
        </div>
        <h1
          className={css({
            fontSize: { base: "24px", sm: "30px" },
            fontWeight: "700",
            letterSpacing: "-0.02em",
            color: "#020617",
          })}
        >
          Assigned lead workspace
        </h1>
        <p className={css({ fontSize: "14px", color: "#64748B" })}>
          Welcome back, {context.name.split(" ")[0]}. Here is your current pipeline.
        </p>
      </header>

      {/* Useful Execution Counts */}
      <section aria-label="Execution metrics">
        <div
          className={css({
            display: "grid",
            gridTemplateColumns: { base: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
            gap: "12px",
          })}
        >
          <Link
            href="/workspace/h/leads?status=new"
            className={css({
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              bg: "#FFFFFF",
              p: "16px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              textDecoration: "none",
              transition: "all 0.15s ease",
              _hover: { borderColor: "#60A5FA", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
            })}
          >
            <p className={css({ fontSize: "12px", fontWeight: "500", color: "#64748B" })}>New</p>
            <p className={css({ mt: "4px", fontSize: "24px", fontWeight: "700", color: "#020617" })}>
              {newCount}
            </p>
            <span
              className={css({
                mt: "8px",
                display: "inline-block",
                fontSize: "11px",
                fontWeight: "500",
                color: "#2563EB",
              })}
            >
              Needs review &rarr;
            </span>
          </Link>

          <Link
            href="/workspace/h/leads?status=contacted"
            className={css({
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              bg: "#FFFFFF",
              p: "16px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              textDecoration: "none",
              transition: "all 0.15s ease",
              _hover: { borderColor: "#60A5FA", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
            })}
          >
            <p className={css({ fontSize: "12px", fontWeight: "500", color: "#64748B" })}>To Contact</p>
            <p className={css({ mt: "4px", fontSize: "24px", fontWeight: "700", color: "#020617" })}>
              {toContactCount}
            </p>
            <span
              className={css({
                mt: "8px",
                display: "inline-block",
                fontSize: "11px",
                fontWeight: "500",
                color: "#2563EB",
              })}
            >
              In progress &rarr;
            </span>
          </Link>

          <Link
            href="/workspace/h/follow-ups"
            className={css({
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              bg: "#FFFFFF",
              p: "16px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              textDecoration: "none",
              transition: "all 0.15s ease",
              _hover: { borderColor: "#60A5FA", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
            })}
          >
            <p className={css({ fontSize: "12px", fontWeight: "500", color: "#64748B" })}>Follow-up</p>
            <p className={css({ mt: "4px", fontSize: "24px", fontWeight: "700", color: "#020617" })}>
              {openFollowups.length}
            </p>
            <span
              className={css({
                mt: "8px",
                display: "inline-block",
                fontSize: "11px",
                fontWeight: "500",
                color: "#D97706",
              })}
            >
              {todaysFollowups.length} due today &rarr;
            </span>
          </Link>

          <Link
            href="/workspace/h/leads?status=qualified"
            className={css({
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              bg: "#FFFFFF",
              p: "16px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              textDecoration: "none",
              transition: "all 0.15s ease",
              _hover: { borderColor: "#60A5FA", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
            })}
          >
            <p className={css({ fontSize: "12px", fontWeight: "500", color: "#64748B" })}>Qualified</p>
            <p className={css({ mt: "4px", fontSize: "24px", fontWeight: "700", color: "#059669" })}>
              {qualifiedCount}
            </p>
            <span
              className={css({
                mt: "8px",
                display: "inline-block",
                fontSize: "11px",
                fontWeight: "500",
                color: "#059669",
              })}
            >
              High intent &rarr;
            </span>
          </Link>
        </div>
      </section>

      {/* Today's Follow-ups */}
      <section className={css({ display: "flex", flexDirection: "column", gap: "12px" })}>
        <div className={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
          <div className={css({ display: "flex", alignItems: "center", gap: "8px" })}>
            <CalendarCheck className={css({ width: "16px", height: "16px", color: "#2563EB" })} />
            <h2 className={css({ fontSize: "16px", fontWeight: "600", color: "#020617" })}>
              Today&apos;s follow-ups
            </h2>
          </div>
          <Link
            href="/workspace/h/follow-ups"
            className={css({ fontSize: "12px", fontWeight: "500", color: "#2563EB", textDecoration: "none", _hover: { textDecoration: "underline" } })}
          >
            View all ({openFollowups.length})
          </Link>
        </div>

        {todaysFollowups.length > 0 ? (
          <div
            className={css({
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              bg: "#FFFFFF",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              overflow: "hidden",
              "& > div + div": {
                borderTop: "1px solid #E2E8F0",
              },
            })}
          >
            {todaysFollowups.map((f) => {
              const isOverdue = Date.parse(f.due_at) < now;
              const clinicName = (f.leads as any)?.business_name || (f.leads as any)?.name || "Clinic";
              return (
                <div
                  key={f.id}
                  className={css({
                    p: "16px",
                    display: "flex",
                    flexDirection: { base: "column", sm: "row" },
                    alignItems: { sm: "center" },
                    justifyContent: "space-between",
                    gap: "12px",
                    transition: "background-color 0.15s ease",
                    _hover: { bg: "rgba(248,250,252,0.6)" },
                  })}
                >
                  <div className={css({ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 })}>
                    <div className={css({ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" })}>
                      <span className={css({ fontWeight: "600", fontSize: "14px", color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>
                        {clinicName}
                      </span>
                      {isOverdue ? (
                        <span
                          className={css({
                            borderRadius: "6px",
                            bg: "#FEF2F2",
                            border: "1px solid #FECACA",
                            px: "8px",
                            py: "2px",
                            fontSize: "10px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "#B91C1C",
                          })}
                        >
                          Overdue
                        </span>
                      ) : (
                        <span
                          className={css({
                            borderRadius: "6px",
                            bg: "#EFF6FF",
                            border: "1px solid #BFDBFE",
                            px: "8px",
                            py: "2px",
                            fontSize: "10px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "#1D4ED8",
                          })}
                        >
                          Due Today
                        </span>
                      )}
                    </div>
                    <p className={css({ fontSize: "12px", color: "#475569", fontWeight: "500" })}>{f.context}</p>
                    <p className={css({ fontSize: "11px", color: "#94A3B8", display: "flex", alignItems: "center", gap: "4px" })}>
                      <Clock className={css({ width: "12px", height: "12px" })} />
                      {new Date(f.due_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <Link
                    href={`/workspace/h/leads/${f.lead_id}`}
                    className={css({
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      borderRadius: "8px",
                      bg: "#2563EB",
                      px: "14px",
                      py: "8px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#FFFFFF",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      textDecoration: "none",
                      flexShrink: 0,
                      transition: "background-color 0.15s ease",
                      _hover: { bg: "#1D4ED8" },
                    })}
                  >
                    Open Lead
                    <ArrowRight className={css({ width: "14px", height: "14px" })} />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={css({
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              bg: "#FFFFFF",
              p: "24px",
              textAlign: "center",
              color: "#64748B",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            })}
          >
            <CheckCircle2 className={css({ width: "24px", height: "24px", color: "#10B981", mx: "auto", mb: "8px" })} />
            <p className={css({ fontSize: "14px", fontWeight: "500", color: "#1E293B" })}>No follow-ups due today</p>
            <p className={css({ fontSize: "12px", color: "#64748B", mt: "4px" })}>
              You are all caught up on scheduled follow-ups for today.
            </p>
          </div>
        )}
      </section>

      {/* Continue Working */}
      <section className={css({ display: "flex", flexDirection: "column", gap: "12px" })}>
        <div className={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
          <div className={css({ display: "flex", alignItems: "center", gap: "8px" })}>
            <Building2 className={css({ width: "16px", height: "16px", color: "#2563EB" })} />
            <h2 className={css({ fontSize: "16px", fontWeight: "600", color: "#020617" })}>Continue working</h2>
          </div>
          <Link
            href="/workspace/h/leads"
            className={css({ fontSize: "12px", fontWeight: "500", color: "#2563EB", textDecoration: "none", _hover: { textDecoration: "underline" } })}
          >
            All leads ({leads.length})
          </Link>
        </div>

        {recentLeads.length > 0 ? (
          <div className={css({ display: "flex", flexDirection: "column", gap: "10px" })}>
            {recentLeads.map((lead) => {
              const intel = extractGrowxIntelligence(lead.custom_fields);
              const strength = intel?.opportunity?.strength || "medium";
              const nextAction =
                intel?.action_brief?.next_action_en || "Tap to review account details & call";

              const statusBg =
                lead.status === "qualified"
                  ? "#ECFDF5"
                  : lead.status === "new"
                  ? "#EFF6FF"
                  : "#F1F5F9";
              const statusColor =
                lead.status === "qualified"
                  ? "#065F46"
                  : lead.status === "new"
                  ? "#1E40AF"
                  : "#334155";
              const statusBorder =
                lead.status === "qualified"
                  ? "#A7F3D0"
                  : lead.status === "new"
                  ? "#BFDBFE"
                  : "#E2E8F0";

              const strengthBg =
                strength === "high"
                  ? "#ECFDF5"
                  : strength === "medium"
                  ? "#FFFBEB"
                  : "#F1F5F9";
              const strengthColor =
                strength === "high"
                  ? "#065F46"
                  : strength === "medium"
                  ? "#92400E"
                  : "#334155";
              const strengthBorder =
                strength === "high"
                  ? "#A7F3D0"
                  : strength === "medium"
                  ? "#FDE68A"
                  : "#CBD5E1";

              return (
                <Link
                  key={lead.id}
                  href={`/workspace/h/leads/${lead.id}`}
                  className={css({
                    display: "block",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    bg: "#FFFFFF",
                    p: "16px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                    _hover: { borderColor: "#60A5FA", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
                  })}
                >
                  <div className={css({ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" })}>
                    <div className={css({ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 })}>
                      <div className={css({ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" })}>
                        <h3 className={css({ fontWeight: "600", fontSize: "14px", color: "#020617", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>
                          {lead.business_name || lead.name || "Clinic"}
                        </h3>
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
                            backgroundColor: statusBg,
                            color: statusColor,
                            borderColor: statusBorder,
                          }}
                        >
                          {lead.status}
                        </span>
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
                            backgroundColor: strengthBg,
                            color: strengthColor,
                            borderColor: strengthBorder,
                          }}
                        >
                          {strength} intent
                        </span>
                      </div>

                      {lead.city && (
                        <p className={css({ fontSize: "12px", color: "#64748B", display: "flex", alignItems: "center", gap: "4px" })}>
                          <MapPin className={css({ width: "12px", height: "12px", color: "#94A3B8" })} />
                          {lead.city}
                        </p>
                      )}

                      <p
                        className={css({
                          fontSize: "12px",
                          color: "#475569",
                          mt: "4px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        })}
                      >
                        <span className={css({ fontWeight: "500", color: "#334155" })}>Next:</span> {nextAction}
                      </p>
                    </div>

                    <ArrowRight className={css({ width: "16px", height: "16px", color: "#94A3B8", flexShrink: 0, mt: "4px" })} />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div
            className={css({
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              bg: "#FFFFFF",
              p: "32px",
              textAlign: "center",
              color: "#64748B",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            })}
          >
            <p className={css({ fontSize: "14px", fontWeight: "500", color: "#334155" })}>No assigned leads yet</p>
            <p className={css({ fontSize: "12px", color: "#94A3B8", mt: "4px" })}>
              New healthcare leads assigned to you by your admin will appear here immediately.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
