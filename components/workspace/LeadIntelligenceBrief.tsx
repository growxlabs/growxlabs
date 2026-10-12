"use client";

import { useState } from "react";
import {
  extractGrowxIntelligence,
  extractHealthcareFields,
} from "@/lib/leads/intelligence-types";
import {
  Globe,
  ExternalLink,
  Target,
  HelpCircle,
  ArrowRight,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { css, cx } from "@/styled-system/css";

type LanguageMode = "both" | "en" | "te";

interface LeadIntelligenceBriefProps {
  customFields: unknown;
  city?: string | null;
}

export function LeadIntelligenceBrief({ customFields, city }: LeadIntelligenceBriefProps) {
  const [lang, setLang] = useState<LanguageMode>("both");
  const intelligence = extractGrowxIntelligence(customFields);
  const healthcare = extractHealthcareFields(customFields);

  if (!intelligence && !healthcare) {
    return (
      <div
        className={css({
          borderRadius: "8px",
          border: "1px solid #E2E8F0",
          bg: "#FFFFFF",
          p: "20px",
          textAlign: "center",
          color: "#64748B",
          fontSize: "13px",
        })}
      >
        <p className={css({ fontWeight: "600", color: "#334155" })}>
          No intelligence brief on record
        </p>
        <p className={css({ fontSize: "12px", color: "#94A3B8", mt: "4px" })}>
          Account data and verified research have not been compiled for this clinic yet.
        </p>
      </div>
    );
  }

  const showEn = lang === "both" || lang === "en";
  const showTe = lang === "both" || lang === "te";

  // Form field renderer for bilingual intelligence
  const renderDossierField = (label: string, en?: string, te?: string) => {
    if (!en && !te) return null;
    return (
      <div className={css({ display: "flex", flexDirection: "column", gap: "4px" })}>
        <span
          className={css({
            fontSize: "11px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "#64748B",
          })}
        >
          {label}
        </span>
        <div
          className={css({
            borderRadius: "6px",
            border: "1px solid #E2E8F0",
            bg: "#FFFFFF",
            p: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          })}
        >
          {showEn && en && (
            <div className={css({ display: "flex", alignItems: "flex-start", gap: "8px" })}>
              {lang === "both" && (
                <span
                  className={css({
                    borderRadius: "3px",
                    bg: "#F1F5F9",
                    color: "#475569",
                    fontSize: "10px",
                    fontWeight: "700",
                    px: "5px",
                    py: "1px",
                    letterSpacing: "0.04em",
                    flexShrink: 0,
                    mt: "2px",
                  })}
                >
                  EN
                </span>
              )}
              <p
                className={css({
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "#0F172A",
                  flex: 1,
                })}
              >
                {en}
              </p>
            </div>
          )}

          {showTe && te && (
            <div
              className={css({
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                pt: showEn && en ? "6px" : "0",
                borderTop: showEn && en ? "1px solid #F1F5F9" : "none",
              })}
            >
              {lang === "both" && (
                <span
                  className={css({
                    borderRadius: "3px",
                    bg: "#EFF6FF",
                    color: "#1D4ED8",
                    fontSize: "10px",
                    fontWeight: "700",
                    px: "5px",
                    py: "1px",
                    letterSpacing: "0.04em",
                    flexShrink: 0,
                    mt: "2px",
                  })}
                >
                  TE
                </span>
              )}
              <p
                className={css({
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "#334155",
                  flex: 1,
                })}
              >
                {te}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={css({ display: "flex", flexDirection: "column", gap: "20px" })}>
      {/* 1. Header Toolbar & Language Segmented Switcher */}
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          borderBottom: "1px solid #E2E8F0",
          pb: "10px",
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
            Business Dossier
          </h2>
          <p className={css({ fontSize: "11px", color: "#64748B" })}>
            Verified operational profile &amp; outreach strategy
          </p>
        </div>

        {/* Compact Segmented Control */}
        <div
          role="group"
          aria-label="Language preference"
          className={css({
            display: "inline-flex",
            borderRadius: "6px",
            border: "1px solid #CBD5E1",
            bg: "#F8FAFC",
            p: "2px",
          })}
        >
          {(
            [
              { id: "both", label: "Both" },
              { id: "en", label: "English" },
              { id: "te", label: "తెలుగు" },
            ] as const
          ).map((item) => {
            const active = lang === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setLang(item.id)}
                className={css({
                  px: "10px",
                  py: "3px",
                  fontSize: "11px",
                  fontWeight: "600",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  border: "none",
                  bg: active ? "#020617" : "transparent",
                  color: active ? "#FFFFFF" : "#64748B",
                  _hover: { color: active ? "#FFFFFF" : "#0F172A" },
                })}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Structured Account Metadata Form Grid */}
      {(healthcare || city || intelligence?.decision_maker) && (
        <div className={css({ display: "flex", flexDirection: "column", gap: "6px" })}>
          <span
            className={css({
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#475569",
            })}
          >
            Account Metadata
          </span>
          <div
            className={css({
              display: "grid",
              gridTemplateColumns: { base: "1fr", sm: "repeat(2, 1fr)" },
              gap: "8px",
            })}
          >
            {/* Category / Specialty */}
            <div
              className={css({
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                bg: "#FFFFFF",
                p: "10px 12px",
              })}
            >
              <span className={css({ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", color: "#64748B" })}>
                Practice / Specialty
              </span>
              <p className={css({ fontSize: "13px", fontWeight: "600", color: "#0F172A", mt: "2px" })}>
                {healthcare?.specialty || healthcare?.type || "Healthcare / Clinic"}
              </p>
            </div>

            {/* Location */}
            <div
              className={css({
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                bg: "#FFFFFF",
                p: "10px 12px",
              })}
            >
              <span className={css({ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", color: "#64748B" })}>
                Location / City
              </span>
              <p className={css({ fontSize: "13px", fontWeight: "600", color: "#0F172A", mt: "2px" })}>
                {city || "Not recorded"}
              </p>
            </div>

            {/* Decision Maker */}
            <div
              className={css({
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                bg: "#FFFFFF",
                p: "10px 12px",
              })}
            >
              <span className={css({ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", color: "#64748B" })}>
                Decision Maker
              </span>
              <p className={css({ fontSize: "13px", fontWeight: "600", color: "#0F172A", mt: "2px" })}>
                {intelligence?.decision_maker?.name || healthcare?.doctor_name || "Doctor / Hospital Admin"}
                {intelligence?.decision_maker?.title && (
                  <span className={css({ fontSize: "11px", fontWeight: "400", color: "#64748B", ml: "6px" })}>
                    ({intelligence.decision_maker.title})
                  </span>
                )}
              </p>
            </div>

            {/* Consultation Hours */}
            <div
              className={css({
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                bg: "#FFFFFF",
                p: "10px 12px",
              })}
            >
              <span className={css({ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", color: "#64748B" })}>
                OPD / Consultation Hours
              </span>
              <p className={css({ fontSize: "13px", fontWeight: "600", color: "#0F172A", mt: "2px" })}>
                {healthcare?.consultation_hours || "Standard OPD"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. YOUR GOAL / మీ పని — STRONGEST ACTION FIELD */}
      {intelligence?.action_brief && (intelligence.action_brief.goal_en || intelligence.action_brief.goal_te) && (
        <div
          className={css({
            borderRadius: "8px",
            border: "1px solid #93C5FD",
            bg: "#EFF6FF",
            p: { base: "14px", sm: "16px" },
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          })}
        >
          <div className={css({ display: "flex", alignItems: "center", gap: "6px" })}>
            <Target className={css({ width: "15px", height: "15px", color: "#1D4ED8" })} />
            <span
              className={css({
                fontSize: "11px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#1E40AF",
              })}
            >
              YOUR GOAL / మీ పని
            </span>
          </div>

          <div className={css({ display: "flex", flexDirection: "column", gap: "6px" })}>
            {showEn && intelligence.action_brief.goal_en && (
              <div className={css({ display: "flex", alignItems: "flex-start", gap: "8px" })}>
                {lang === "both" && (
                  <span
                    className={css({
                      borderRadius: "3px",
                      bg: "#DBEAFE",
                      color: "#1E40AF",
                      fontSize: "10px",
                      fontWeight: "700",
                      px: "5px",
                      py: "1px",
                      letterSpacing: "0.04em",
                      flexShrink: 0,
                      mt: "2px",
                    })}
                  >
                    EN
                  </span>
                )}
                <p className={css({ fontSize: "14px", fontWeight: "700", color: "#0F172A", lineHeight: "1.5" })}>
                  {intelligence.action_brief.goal_en}
                </p>
              </div>
            )}

            {showTe && intelligence.action_brief.goal_te && (
              <div
                className={css({
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  pt: showEn && intelligence.action_brief.goal_en ? "6px" : "0",
                  borderTop: showEn && intelligence.action_brief.goal_en ? "1px solid #DBEAFE" : "none",
                })}
              >
                {lang === "both" && (
                  <span
                    className={css({
                      borderRadius: "3px",
                      bg: "#DBEAFE",
                      color: "#1E40AF",
                      fontSize: "10px",
                      fontWeight: "700",
                      px: "5px",
                      py: "1px",
                      letterSpacing: "0.04em",
                      flexShrink: 0,
                      mt: "2px",
                    })}
                  >
                    TE
                  </span>
                )}
                <p className={css({ fontSize: "13px", fontWeight: "600", color: "#1E3A8A", lineHeight: "1.5" })}>
                  {intelligence.action_brief.goal_te}
                </p>
              </div>
            )}
          </div>

          {/* Questions to Ask */}
          {((intelligence.action_brief.questions_en && intelligence.action_brief.questions_en.length > 0) ||
            (intelligence.action_brief.questions_te && intelligence.action_brief.questions_te.length > 0)) && (
            <div className={css({ pt: "8px", borderTop: "1px solid #BFDBFE", display: "flex", flexDirection: "column", gap: "6px" })}>
              <div className={css({ display: "flex", alignItems: "center", gap: "4px", color: "#1E40AF" })}>
                <HelpCircle className={css({ width: "13px", height: "13px" })} />
                <span className={css({ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em" })}>
                  Questions to Ask
                </span>
              </div>
              <ol className={css({ pl: "18px", listStyleType: "decimal", display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "#1E293B" })}>
                {(intelligence.action_brief.questions_en || []).map((qEn, i) => {
                  const qTe = intelligence.action_brief?.questions_te?.[i];
                  return (
                    <li key={i} className={css({ lineHeight: "1.5" })}>
                      {showEn && <span className={css({ fontWeight: "600" })}>{qEn}</span>}
                      {showTe && qTe && (
                        <p className={css({ fontSize: "12px", color: "#3B82F6", mt: "2px" })}>
                          {qTe}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* Recommended Next Action */}
          {(intelligence.action_brief.next_action_en || intelligence.action_brief.next_action_te) && (
            <div className={css({ pt: "6px", borderTop: "1px solid #BFDBFE", display: "flex", alignItems: "flex-start", gap: "6px" })}>
              <ArrowRight className={css({ width: "13px", height: "13px", color: "#1D4ED8", flexShrink: 0, mt: "2px" })} />
              <div className={css({ fontSize: "12px", color: "#1E40AF" })}>
                <span className={css({ fontWeight: "700" })}>Next Action: </span>
                <span>{intelligence.action_brief.next_action_en || intelligence.action_brief.next_action_te}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Business Profile Group */}
      <div className={css({ display: "flex", flexDirection: "column", gap: "10px" })}>
        <span
          className={css({
            fontSize: "11px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#475569",
          })}
        >
          Business Profile
        </span>
        <div className={css({ display: "flex", flexDirection: "column", gap: "8px" })}>
          {renderDossierField("Company Snapshot", intelligence?.company_snapshot?.en, intelligence?.company_snapshot?.te)}
          {renderDossierField("What They Do", intelligence?.what_they_do?.en, intelligence?.what_they_do?.te)}
          {renderDossierField("How Their Business Works", intelligence?.business_model?.en, intelligence?.business_model?.te)}
          {renderDossierField("How They Make Money", intelligence?.operations?.en, intelligence?.operations?.te)}
        </div>
      </div>

      {/* 5. Digital & Operations Group */}
      {intelligence?.digital_setup && (
        <div className={css({ display: "flex", flexDirection: "column", gap: "10px" })}>
          <span
            className={css({
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#475569",
            })}
          >
            Digital &amp; Operations
          </span>
          <div className={css({ display: "flex", flexDirection: "column", gap: "8px" })}>
            {renderDossierField("Current Digital Setup", intelligence.digital_setup.en, intelligence.digital_setup.te)}
          </div>
        </div>
      )}

      {/* 6. Findings (Clean structured rows) */}
      {intelligence?.findings && intelligence.findings.length > 0 && (
        <div className={css({ display: "flex", flexDirection: "column", gap: "8px" })}>
          <span
            className={css({
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#475569",
            })}
          >
            Verified Findings ({intelligence.findings.length})
          </span>
          <div className={css({ display: "flex", flexDirection: "column", gap: "6px" })}>
            {intelligence.findings.map((f, i) => (
              <div
                key={i}
                className={css({
                  borderRadius: "6px",
                  border: "1px solid #E2E8F0",
                  bg: "#FFFFFF",
                  p: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                })}
              >
                <div className={css({ display: "flex", alignItems: "center", gap: "6px" })}>
                  <FileCheck2 className={css({ width: "13px", height: "13px", color: "#2563EB", flexShrink: 0 })} />
                  <span className={css({ fontSize: "12px", fontWeight: "700", color: "#0F172A" })}>
                    {f.title || `Finding ${i + 1}`}
                  </span>
                </div>
                {showEn && f.en && <p className={css({ fontSize: "12px", color: "#334155", pl: "19px" })}>{f.en}</p>}
                {showTe && f.te && <p className={css({ fontSize: "12px", color: "#64748B", pl: "19px" })}>{f.te}</p>}
                {f.evidence && f.evidence.length > 0 && (
                  <div className={css({ pl: "19px", pt: "2px", display: "flex", flexWrap: "wrap", gap: "4px" })}>
                    {f.evidence.map((ev, ei) => (
                      <span
                        key={ei}
                        className={css({
                          borderRadius: "4px",
                          bg: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          px: "6px",
                          py: "2px",
                          fontSize: "10px",
                          color: "#475569",
                          fontFamily: "monospace",
                        })}
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Operational Gaps (Clean structured rows) */}
      {intelligence?.gaps && intelligence.gaps.length > 0 && (
        <div className={css({ display: "flex", flexDirection: "column", gap: "8px" })}>
          <span
            className={css({
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#475569",
            })}
          >
            Problems &amp; Gaps ({intelligence.gaps.length})
          </span>
          <div className={css({ display: "flex", flexDirection: "column", gap: "6px" })}>
            {intelligence.gaps.map((gap, i) => (
              <div
                key={i}
                className={css({
                  borderRadius: "6px",
                  border: "1px solid #E2E8F0",
                  bg: "#FFFFFF",
                  p: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                })}
              >
                <div className={css({ display: "flex", alignItems: "center", gap: "6px" })}>
                  <span
                    className={css({
                      borderRadius: "4px",
                      bg: "#FFFBEB",
                      color: "#92400E",
                      border: "1px solid #FDE68A",
                      px: "6px",
                      py: "1px",
                      fontSize: "10px",
                      fontWeight: "700",
                    })}
                  >
                    GAP {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={css({ fontSize: "12px", fontWeight: "700", color: "#0F172A" })}>
                    {gap.title}
                  </span>
                </div>
                {showEn && gap.en && <p className={css({ fontSize: "12px", color: "#334155", pl: "4px" })}>{gap.en}</p>}
                {showTe && gap.te && <p className={css({ fontSize: "12px", color: "#64748B", pl: "4px" })}>{gap.te}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Opportunity Summary */}
      {intelligence?.opportunity && (intelligence.opportunity.en || intelligence.opportunity.te) && (
        <div className={css({ display: "flex", flexDirection: "column", gap: "8px" })}>
          <span
            className={css({
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#475569",
            })}
          >
            GrowxLabs Opportunity Context
          </span>
          <div
            className={css({
              borderRadius: "6px",
              border: "1px solid #E2E8F0",
              bg: "#FFFFFF",
              p: "12px 14px",
            })}
          >
            {renderDossierField(
              "Opportunity Rationale",
              intelligence.opportunity.en,
              intelligence.opportunity.te
            )}
          </div>
        </div>
      )}

      {/* 9. Sources / References */}
      {intelligence?.sources && intelligence.sources.length > 0 && (
        <div className={css({ display: "flex", flexDirection: "column", gap: "6px", pt: "6px", borderTop: "1px solid #F1F5F9" })}>
          <span className={css({ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#94A3B8" })}>
            Sources &amp; References
          </span>
          <div className={css({ display: "flex", flexWrap: "wrap", gap: "6px" })}>
            {intelligence.sources.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noreferrer noopener"
                className={css({
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  borderRadius: "4px",
                  border: "1px solid #E2E8F0",
                  bg: "#F8FAFC",
                  px: "8px",
                  py: "3px",
                  fontSize: "11px",
                  color: "#475569",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                  _hover: { color: "#2563EB", borderColor: "#BFDBFE" },
                })}
              >
                <Globe className={css({ width: "11px", height: "11px" })} />
                <span>{s.label || s.url}</span>
                <ExternalLink className={css({ width: "9px", height: "9px", opacity: 0.6 })} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
