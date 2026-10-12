"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MapPin, ArrowRight, Building2 } from "lucide-react";
import { extractGrowxIntelligence, extractHealthcareFields } from "@/lib/leads/intelligence-types";
import { css, cx } from "@/styled-system/css";

function StethoscopeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: "14px", height: "14px" }}
    >
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  );
}

type LeadItem = {
  id: string;
  business_name?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  city?: string | null;
  priority?: string | null;
  custom_fields?: unknown;
};

interface HealthcareLeadsViewProps {
  initialLeads: LeadItem[];
  initialStatus?: string;
}

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "follow-up", label: "Follow-up" },
  { id: "qualified", label: "Qualified" },
] as const;

export function HealthcareLeadsView({
  initialLeads,
  initialStatus = "all",
}: HealthcareLeadsViewProps) {
  const [activeFilter, setActiveFilter] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = useMemo(() => {
    return initialLeads.filter((lead) => {
      // 1. Status Filter
      if (activeFilter === "new" && lead.status !== "new") return false;
      if (
        activeFilter === "contacted" &&
        !["contacted", "contacting", "engaged"].includes(lead.status || "")
      )
        return false;
      if (activeFilter === "follow-up" && lead.status !== "engaged" && lead.status !== "contacted")
        return false;
      if (activeFilter === "qualified" && lead.status !== "qualified") return false;

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const bName = (lead.business_name || "").toLowerCase();
        const cName = (lead.name || "").toLowerCase();
        const phone = (lead.phone || "").toLowerCase();
        const city = (lead.city || "").toLowerCase();
        const email = (lead.email || "").toLowerCase();

        return (
          bName.includes(q) ||
          cName.includes(q) ||
          phone.includes(q) ||
          city.includes(q) ||
          email.includes(q)
        );
      }

      return true;
    });
  }, [initialLeads, activeFilter, searchQuery]);

  return (
    <div className={css({ display: "flex", flexDirection: "column", gap: "16px" })}>
      {/* Search Input */}
      <div className={css({ position: "relative" })}>
        <Search
          className={css({
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "16px",
            height: "16px",
            color: "#94A3B8",
            pointerEvents: "none",
          })}
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clinic, contact, or phone..."
          className={css({
            width: "100%",
            height: "44px",
            pl: "40px",
            pr: "16px",
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            bg: "#FFFFFF",
            fontSize: "14px",
            color: "#0F172A",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            outline: "none",
            transition: "all 0.15s ease",
            _placeholder: { color: "#94A3B8" },
            _focus: { borderColor: "#3B82F6", boxShadow: "0 0 0 1px #3B82F6" },
          })}
        />
      </div>

      {/* Filter Tabs */}
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
        {FILTER_TABS.map((tab) => {
          const active = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
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
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "12px",
          color: "#64748B",
          px: "2px",
        })}
      >
        <span>
          Showing {filteredLeads.length} of {initialLeads.length} leads
        </span>
      </div>

      {/* Cards List */}
      <div className={css({ display: "flex", flexDirection: "column", gap: "10px" })}>
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead) => {
            const intel = extractGrowxIntelligence(lead.custom_fields);
            const hc = extractHealthcareFields(lead.custom_fields);
            const strength = intel?.opportunity?.strength || "medium";
            const clinicType = hc?.specialty || hc?.type || "Healthcare / Clinic";
            const nextAction =
              intel?.action_brief?.next_action_en || "Tap to review brief and reach out";

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
                : "#F8FAFC";
            const strengthColor =
              strength === "high"
                ? "#047857"
                : strength === "medium"
                ? "#B45309"
                : "#475569";
            const strengthBorder =
              strength === "high"
                ? "#A7F3D0"
                : strength === "medium"
                ? "#FDE68A"
                : "#E2E8F0";

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
                  transition: "all 0.15s ease",
                  textDecoration: "none",
                  _hover: {
                    borderColor: "#60A5FA",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  },
                  _active: { transform: "scale(0.99)" },
                })}
              >
                <div
                  className={css({
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "12px",
                  })}
                >
                  <div
                    className={css({
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      minWidth: 0,
                      flex: 1,
                    })}
                  >
                    {/* Top Row: Business Name & Status */}
                    <div
                      className={css({
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      })}
                    >
                      <h3
                        className={css({
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#020617",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        })}
                      >
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
                    </div>

                    {/* Middle Row: Specialty & Location */}
                    <div
                      className={css({
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        fontSize: "12px",
                        color: "#64748B",
                        flexWrap: "wrap",
                      })}
                    >
                      <span
                        className={css({
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontWeight: "500",
                          color: "#334155",
                        })}
                      >
                        <span className={css({ color: "#2563EB", display: "inline-flex" })}>
                          <StethoscopeIcon />
                        </span>
                        {clinicType}
                      </span>
                      {lead.city && (
                        <span
                          className={css({
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "#64748B",
                          })}
                        >
                          <MapPin className={css({ width: "12px", height: "12px", color: "#94A3B8" })} />
                          {lead.city}
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Opportunity & Next Action */}
                    <div
                      className={css({
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                        fontSize: "12px",
                        pt: "4px",
                      })}
                    >
                      <span
                        className={css({
                          borderRadius: "4px",
                          px: "6px",
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
                      <p
                        className={css({
                          color: "#475569",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                          minWidth: "140px",
                        })}
                      >
                        <span className={css({ fontWeight: "600", color: "#334155" })}>Next:</span> {nextAction}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={css({
                      width: "16px",
                      height: "16px",
                      color: "#94A3B8",
                      flexShrink: 0,
                      mt: "4px",
                    })}
                  />
                </div>
              </Link>
            );
          })
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
            <Building2
              className={css({
                width: "32px",
                height: "32px",
                color: "#CBD5E1",
                mx: "auto",
                mb: "8px",
              })}
            />
            <p className={css({ fontSize: "14px", fontWeight: "600", color: "#1E293B" })}>
              No leads found
            </p>
            <p className={css({ fontSize: "12px", color: "#64748B", mt: "4px" })}>
              Try adjusting your search terms or filter selection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
