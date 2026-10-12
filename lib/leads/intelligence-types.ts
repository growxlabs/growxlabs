export interface HealthcareLeadFields {
  type?: string;
  specialty?: string;
  doctor_name?: string;
  consultation_hours?: string;
}

export interface GrowxIntelligenceFinding {
  title?: string;
  en?: string;
  te?: string;
  evidence?: string[];
}

export interface GrowxIntelligenceGap {
  title?: string;
  en?: string;
  te?: string;
}

export interface GrowxIntelligenceOpportunity {
  strength?: "high" | "medium" | "low";
  en?: string;
  te?: string;
}

export interface GrowxIntelligenceDecisionMaker {
  name?: string;
  title?: string;
  confidence?: string;
}

export interface GrowxIntelligenceActionBrief {
  goal_en?: string;
  goal_te?: string;
  questions_en?: string[];
  questions_te?: string[];
  next_action_en?: string;
  next_action_te?: string;
}

export interface GrowxIntelligenceSource {
  label?: string;
  url?: string;
}

export interface GrowxIntelligence {
  version: 1;
  generated_at?: string;

  company_snapshot?: {
    en?: string;
    te?: string;
  };

  what_they_do?: {
    en?: string;
    te?: string;
  };

  business_model?: {
    en?: string;
    te?: string;
  };

  operations?: {
    en?: string;
    te?: string;
  };

  digital_setup?: {
    en?: string;
    te?: string;
  };

  findings?: GrowxIntelligenceFinding[];
  gaps?: GrowxIntelligenceGap[];
  opportunity?: GrowxIntelligenceOpportunity;
  decision_maker?: GrowxIntelligenceDecisionMaker;
  action_brief?: GrowxIntelligenceActionBrief;
  sources?: GrowxIntelligenceSource[];
}

export interface LeadCustomFields {
  healthcare?: HealthcareLeadFields;
  growx_intelligence?: GrowxIntelligence;
  [key: string]: unknown;
}

/**
 * Defensively extracts healthcare custom fields from any raw custom_fields JSON payload.
 */
export function extractHealthcareFields(customFields: unknown): HealthcareLeadFields | null {
  if (!customFields || typeof customFields !== "object") return null;
  const cf = customFields as Record<string, unknown>;
  const hc = cf.healthcare;
  if (!hc || typeof hc !== "object") return null;
  const h = hc as Record<string, unknown>;

  const extracted: HealthcareLeadFields = {};
  if (typeof h.type === "string" && h.type.trim()) extracted.type = h.type.trim();
  if (typeof h.specialty === "string" && h.specialty.trim()) extracted.specialty = h.specialty.trim();
  if (typeof h.doctor_name === "string" && h.doctor_name.trim()) extracted.doctor_name = h.doctor_name.trim();
  if (typeof h.consultation_hours === "string" && h.consultation_hours.trim()) extracted.consultation_hours = h.consultation_hours.trim();

  return Object.keys(extracted).length > 0 ? extracted : null;
}

/**
 * Defensively extracts GrowXLabs lead intelligence from custom_fields.
 * Returns null if missing, empty, or unparseable. Never throws on malformed JSON.
 */
export function extractGrowxIntelligence(customFields: unknown): GrowxIntelligence | null {
  if (!customFields || typeof customFields !== "object") return null;
  const cf = customFields as Record<string, unknown>;
  const raw = cf.growx_intelligence;
  if (!raw || typeof raw !== "object") return null;
  const g = raw as Record<string, unknown>;

  const cleanBilingual = (val: unknown): { en?: string; te?: string } | undefined => {
    if (!val || typeof val !== "object") return undefined;
    const obj = val as Record<string, unknown>;
    const res: { en?: string; te?: string } = {};
    if (typeof obj.en === "string" && obj.en.trim()) res.en = obj.en.trim();
    if (typeof obj.te === "string" && obj.te.trim()) res.te = obj.te.trim();
    return Object.keys(res).length > 0 ? res : undefined;
  };

  const company_snapshot = cleanBilingual(g.company_snapshot);
  const what_they_do = cleanBilingual(g.what_they_do);
  const business_model = cleanBilingual(g.business_model);
  const operations = cleanBilingual(g.operations);
  const digital_setup = cleanBilingual(g.digital_setup);

  let findings: GrowxIntelligenceFinding[] | undefined;
  if (Array.isArray(g.findings)) {
    const list = g.findings
      .filter((f) => f && typeof f === "object")
      .map((f: any) => ({
        title: typeof f.title === "string" ? f.title.trim() : undefined,
        en: typeof f.en === "string" ? f.en.trim() : undefined,
        te: typeof f.te === "string" ? f.te.trim() : undefined,
        evidence: Array.isArray(f.evidence) ? f.evidence.filter((e: any) => typeof e === "string") : undefined,
      }))
      .filter((f) => f.title || f.en || f.te);
    if (list.length > 0) findings = list;
  }

  let gaps: GrowxIntelligenceGap[] | undefined;
  if (Array.isArray(g.gaps)) {
    const list = g.gaps
      .filter((gap) => gap && typeof gap === "object")
      .map((gap: any) => ({
        title: typeof gap.title === "string" ? gap.title.trim() : undefined,
        en: typeof gap.en === "string" ? gap.en.trim() : undefined,
        te: typeof gap.te === "string" ? gap.te.trim() : undefined,
      }))
      .filter((gap) => gap.title || gap.en || gap.te);
    if (list.length > 0) gaps = list;
  }

  let opportunity: GrowxIntelligenceOpportunity | undefined;
  if (g.opportunity && typeof g.opportunity === "object") {
    const opp = g.opportunity as any;
    const strength = ["high", "medium", "low"].includes(String(opp.strength).toLowerCase())
      ? (String(opp.strength).toLowerCase() as "high" | "medium" | "low")
      : undefined;
    const en = typeof opp.en === "string" ? opp.en.trim() : undefined;
    const te = typeof opp.te === "string" ? opp.te.trim() : undefined;
    if (strength || en || te) {
      opportunity = { strength, en, te };
    }
  }

  let decision_maker: GrowxIntelligenceDecisionMaker | undefined;
  if (g.decision_maker && typeof g.decision_maker === "object") {
    const dm = g.decision_maker as any;
    const name = typeof dm.name === "string" ? dm.name.trim() : undefined;
    const title = typeof dm.title === "string" ? dm.title.trim() : undefined;
    const confidence = typeof dm.confidence === "string" ? dm.confidence.trim() : undefined;
    if (name || title || confidence) {
      decision_maker = { name, title, confidence };
    }
  }

  let action_brief: GrowxIntelligenceActionBrief | undefined;
  if (g.action_brief && typeof g.action_brief === "object") {
    const ab = g.action_brief as any;
    action_brief = {
      goal_en: typeof ab.goal_en === "string" ? ab.goal_en.trim() : undefined,
      goal_te: typeof ab.goal_te === "string" ? ab.goal_te.trim() : undefined,
      questions_en: Array.isArray(ab.questions_en) ? ab.questions_en.filter((q: any) => typeof q === "string") : undefined,
      questions_te: Array.isArray(ab.questions_te) ? ab.questions_te.filter((q: any) => typeof q === "string") : undefined,
      next_action_en: typeof ab.next_action_en === "string" ? ab.next_action_en.trim() : undefined,
      next_action_te: typeof ab.next_action_te === "string" ? ab.next_action_te.trim() : undefined,
    };
  }

  let sources: GrowxIntelligenceSource[] | undefined;
  if (Array.isArray(g.sources)) {
    const list = g.sources
      .filter((s) => s && typeof s === "object")
      .map((s: any) => ({
        label: typeof s.label === "string" ? s.label.trim() : undefined,
        url: typeof s.url === "string" ? s.url.trim() : undefined,
      }))
      .filter((s) => s.label || s.url);
    if (list.length > 0) sources = list;
  }

  const hasAnySection = Boolean(
    company_snapshot ||
      what_they_do ||
      business_model ||
      operations ||
      digital_setup ||
      findings ||
      gaps ||
      opportunity ||
      decision_maker ||
      action_brief ||
      sources
  );

  if (!hasAnySection) return null;

  return {
    version: 1,
    generated_at: typeof g.generated_at === "string" ? g.generated_at : undefined,
    company_snapshot,
    what_they_do,
    business_model,
    operations,
    digital_setup,
    findings,
    gaps,
    opportunity,
    decision_maker,
    action_brief,
    sources,
  };
}
