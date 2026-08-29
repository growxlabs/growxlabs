import "server-only";

import { renderMasterServiceAgreementPdf } from "@/lib/pdf/master-service-agreement-pdf";
import { enqueueCommunication } from "@/lib/communications/service";
import { recordAuditEvent } from "@/lib/activity/events";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ConsultingHttpError } from "@/lib/consulting/workflow";
import { escapeGrowXLabsEmailHtml, EmailAction, GrowXLabsEmailLayout } from "@/lib/email/growxlabs-layout";
import { proposalContentHash } from "./proposal-domain";

export const MSA_STATUSES = [
  "draft",
  "internal_review",
  "changes_required",
  "approved_internal",
  "ready_for_client",
  "sent",
  "viewed",
  "negotiation",
  "client_changes_requested",
  "signing",
  "signed",
  "superseded",
  "expired",
  "terminated",
  "cancelled",
  "archived",
] as const;

export type MsaStatus = (typeof MSA_STATUSES)[number];
export type MsaParty = "growxlabs" | "client";

export type MsaSection = {
  number: number;
  key: string;
  title: string;
  body: string[];
  items?: string[];
  fields?: Array<{ label: string; value: string | null; reviewKey?: string }>;
};

export type MsaSnapshot = {
  document: {
    title: string;
    agreementNumber: string;
    version: number;
    status: string;
    issuedAt: string;
    effectiveAt: string | null;
    confidential: boolean;
  };
  sourceReferences: {
    proposalNumber: string;
    proposalVersion: number;
    scopeNumber: string;
    proposalApprovalNumber: string;
  };
  parties: {
    client: Record<string, unknown>;
    growxlabs: Record<string, unknown>;
  };
  commercial: {
    pricing: unknown[];
    totals: Record<string, unknown>;
    paymentSchedule: unknown[];
  };
  sections: MsaSection[];
  legalReviewFields: Array<{
    key: string;
    label: string;
    reason: string;
    value: string | null;
    status: "unresolved" | "resolved";
  }>;
  signatories: Array<{
    party: MsaParty;
    fullLegalName: string | null;
    designation: string | null;
    company: string | null;
    email: string | null;
    signature: string | null;
    consentToElectronicExecution: boolean;
    signedAt: string | null;
  }>;
  execution?: {
    executedAt: string;
    signatories: MsaSnapshot["signatories"];
  };
};

// Supabase JSON columns are intentionally kept permissive here; individual values are normalized by asRecord/text before use.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>;

const fail = (status: number, code: string, message: string): never => {
  throw new ConsultingHttpError(status, `${code}: ${message}`);
};

const asRecord = (value: unknown): JsonRecord =>
  value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};

const asArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
};

const text = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const record = asRecord(value);
  for (const key of ["content", "description", "text", "value", "title", "name", "label"]) {
    if (record[key] !== undefined && record[key] !== null && record[key] !== "") return text(record[key]);
  }
  return Array.isArray(value) ? value.map(text).filter(Boolean).join("; ") : "";
};

const items = (value: unknown): string[] => asArray(value).map(text).filter(Boolean);

const money = (value: unknown, currency = "INR"): string => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return `${currency} 0.00`;
  return `${currency} ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function section(number: number, key: string, title: string, body: string[] = [], sectionItems: string[] = [], fields: MsaSection["fields"] = []): MsaSection {
  return { number, key, title, body: body.filter(Boolean), ...(sectionItems.length ? { items: sectionItems } : {}), ...(fields.length ? { fields } : {}) };
}

function legalReviewFields(): MsaSnapshot["legalReviewFields"] {
  return [
    { key: "growxlabsLegalEntity", label: "GrowxLabs legal entity name and registration details", reason: "The approved source documents identify the GrowxLabs brand but do not supply the contracting legal entity or registration number.", value: null, status: "unresolved" },
    { key: "growxlabsRegisteredAddress", label: "GrowxLabs registered office and notices address", reason: "No approved registered office or formal notices address is available in the commercial source.", value: null, status: "unresolved" },
    { key: "growxlabsSignatory", label: "GrowxLabs authorised signatory", reason: "The authorised GrowxLabs signatory name, designation, email, and authority have not been approved for this agreement.", value: null, status: "unresolved" },
    { key: "clientSignatoryAuthority", label: "Trionyx signatory authority confirmation", reason: "A Trionyx contact is available, but authority to execute the agreement must be confirmed before signing.", value: null, status: "unresolved" },
    { key: "effectiveDate", label: "Agreement effective date", reason: "The accepted sources do not specify an effective date.", value: null, status: "unresolved" },
    { key: "customDeliverablesIpTreatment", label: "Ownership or licence treatment for custom deliverables", reason: "The accepted proposal defers ownership and usage rights to the definitive agreement; no assignment or licence decision is approved.", value: null, status: "unresolved" },
    { key: "supportAndMaintenance", label: "Support and maintenance commitment", reason: "The accepted Scope of Work excludes ongoing maintenance and does not define a post-launch support commitment.", value: null, status: "unresolved" },
    { key: "terminationNotice", label: "Termination notice period", reason: "No termination notice duration is approved in the source documents.", value: null, status: "unresolved" },
    { key: "liabilityCap", label: "Limitation of liability cap", reason: "No liability cap or agreed carve-outs are approved in the source documents.", value: null, status: "unresolved" },
    { key: "governingLawAndVenue", label: "Governing law and dispute forum", reason: "No governing law, courts, arbitration, or dispute venue is approved in the source documents.", value: null, status: "unresolved" },
    { key: "noticeMechanism", label: "Formal notice mechanism", reason: "The source documents do not specify formal notice addresses or delivery methods.", value: null, status: "unresolved" },
  ];
}

function clientParty(company: JsonRecord, user: JsonRecord, contact: JsonRecord | null) {
  const legalName = text(company.name) || text(user.name) || "Trionyx India Private Limited";
  return {
    legalName,
    tradingName: text(company.name) || null,
    registeredAddress: text(company.address) || null,
    city: text(company.city) || null,
    state: text(company.state) || null,
    country: text(company.country) || null,
    gst: text(company.gst) || null,
    pan: text(company.pan) || null,
    contactName: text(contact ? `${text(contact.first_name)} ${text(contact.last_name)}` : user.name) || null,
    contactDesignation: text(contact?.job_title) || null,
    contactEmail: text(contact?.email) || text(user.email) || null,
    contactPhone: text(contact?.phone) || null,
  };
}

function growxParty() {
  return {
    legalName: process.env.GROWXLABS_LEGAL_NAME || null,
    tradingName: "GrowxLabs",
    registeredAddress: process.env.GROWXLABS_REGISTERED_ADDRESS || null,
    website: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://growxlabs.tech",
    noticeEmail: process.env.GROWXLABS_LEGAL_EMAIL || null,
  };
}

function buildSections(input: { accepted: JsonRecord; sow: JsonRecord; client: JsonRecord; growx: JsonRecord; proposalNumber: string; proposalVersion: number; scopeNumber: string; approvalNumber: string; agreementNumber: string; version: number; issuedAt: string; effectiveAt: string | null; paymentSchedule: unknown[]; pricing: unknown[]; totals: JsonRecord; signatories: MsaSnapshot["signatories"] }): MsaSection[] {
  const acceptedContent = asRecord(input.accepted.clientContent);
  const sowContent = asRecord(input.sow.content);
  const currency = text(input.totals.currency) || "INR";
  const total = Number(input.totals.grand_total) || 0;
  const paymentItems = asArray(input.paymentSchedule).map((entry, index) => {
    const record = asRecord(entry);
    const percentage = Number(record.percentage) || 0;
    const amount = Math.round(total * percentage) / 100;
    return `${text(record.name) && !/^₹?\s*[\d,]+(?:\.\d+)?$/.test(text(record.name)) ? text(record.name) : `Payment milestone ${index + 1}`} — ${percentage}% (${money(amount, currency)}). ${text(record.trigger)}`.trim();
  });
  const clientName = text(input.client.legalName) || "Trionyx India Private Limited";

  return [
    section(1, "parties", "Parties and Agreement Information", [
      `This Master Service Agreement is between ${text(input.growx.legalName) || "GrowxLabs (legal entity to be confirmed)"} ("GrowxLabs") and ${clientName} ("Client").`,
      "The agreement is prepared for internal review and is subject to completion of the unresolved legal fields identified below.",
    ], [], [
      { label: "Agreement number", value: input.agreementNumber },
      { label: "Agreement version", value: `Version ${input.version}` },
      { label: "Issue date", value: input.issuedAt },
      { label: "Effective date", value: input.effectiveAt, reviewKey: "effectiveDate" },
      { label: "Accepted proposal", value: `${input.proposalNumber} · Version ${input.proposalVersion}` },
      { label: "Approved Scope of Work", value: input.scopeNumber },
      { label: "Proposal approval record", value: input.approvalNumber },
    ]),
    section(2, "engagement", "Engagement and Purpose", [text(acceptedContent.executiveSummary) || "The engagement purpose is defined by the accepted commercial proposal and approved Scope of Work incorporated by reference." ]),
    section(3, "scope", "Scope of Services", [
      `Services are limited to the approved Scope of Work ${input.scopeNumber} and the accepted Commercial Proposal ${input.proposalNumber}, Version ${input.proposalVersion}.`,
      "The approved Scope of Work is the engagement boundary. A requirement outside that approved scope is not included unless adopted through an approved Change Request.",
    ], [...items(sowContent.included), ...items(acceptedContent.scope)]),
    section(4, "deliverables", "Deliverables", ["The deliverables below are inherited from the approved Scope of Work and accepted proposal snapshot. They are not expanded by this agreement."], items(sowContent.deliverables).length ? items(sowContent.deliverables) : items(acceptedContent.deliverables)),
    section(5, "timeline", "Project Timeline and Milestones", ["Milestone sequencing is inherited from the approved Scope of Work. Final calendar dates remain subject to required inputs, approvals, access, and third-party dependencies."], items(sowContent.milestones).length ? items(sowContent.milestones) : items(acceptedContent.milestones || acceptedContent.timeline)),
    section(6, "commercial", "Commercial Terms", ["The commercial terms below are copied from the accepted proposal snapshot and are not recalculated from mutable proposal data."], asArray(input.pricing).map((entry, index) => { const line = asRecord(entry); return `${text(line.description) || `Engagement line ${index + 1}`} — quantity ${text(line.quantity) || "-"}, unit ${text(line.unit) || "-"}, unit price ${money(line.unit_price ?? line.unitPrice, currency)}, discount ${money(line.discount, currency)}, line amount ${money(line.subtotal, currency)}.`; }), [
      { label: "Currency", value: currency },
      { label: "Engagement value", value: money(input.totals.grand_total, currency) },
      { label: "Taxable amount", value: money(input.totals.taxable_subtotal, currency) },
      { label: "Tax amount in accepted snapshot", value: money(input.totals.tax_amount, currency) },
    ]),
    section(7, "payment", "Payment Terms", ["Payment milestones and triggers are inherited from the accepted proposal snapshot. Each amount below is derived dynamically from the accepted engagement value and percentage."], paymentItems),
    section(8, "taxes", "Taxes", [
      `The accepted proposal snapshot identifies ${text(input.totals.tax_type) || "the applicable tax treatment"} at ${text(input.totals.tax_rate) || "0"}%. Applicable taxes will be handled as required by law and the accepted commercial terms; no additional tax treatment is invented in this draft.`,
    ]),
    section(9, "clientResponsibilities", "Client Responsibilities", ["Client will provide the information, content, assets, approvals, credentials, access, and authorised points of contact reasonably required for the approved scope."], items(sowContent.assumptions).concat(items(sowContent.dependencies))),
    section(10, "growxlabsResponsibilities", "GrowxLabs Responsibilities", ["GrowxLabs will perform the approved services with reasonable care, coordinate the agreed milestones, communicate material dependencies, and deliver the approved deliverables for review."], items(sowContent.deliverables)),
    section(11, "approvalsDelays", "Approvals and Client Delays", ["Work that depends on Client information, approvals, credentials, access, or third-party availability may be affected when those inputs are delayed or unavailable. The parties will record material schedule or scope effects through the Change Request process where applicable."], items(sowContent.assumptions).filter((value) => /approval|delay|access|credential|feedback|input/i.test(value))),
    section(12, "changeRequests", "Change Requests and Additional Work", ["Only an approved Change Request becomes part of the engagement. A Change Request must record each of the following before work begins on the requested change."], ["Requested change", "Reason", "Scope impact", "Timeline impact", "Commercial impact", "GrowxLabs approval", "Client approval"]),
    section(13, "thirdParty", "Third Party Services and Integrations", ["Approved integrations may depend on Google services, Meta services, WhatsApp services, analytics services, hosting, domains, Tally, external APIs, cloud infrastructure, AI services, and other approved integrations. GrowxLabs is responsible for its agreed implementation work, not for third-party outages, pricing changes, access restrictions, policy changes, service discontinuation, or performance outside GrowxLabs' control."], items(sowContent.dependencies).filter((value) => /third.party|domain|hosting|google|meta|whatsapp|api|tally|analytic|cloud|AI/i.test(value))),
    section(14, "aiAutomation", "AI and Automation", ["AI-assisted functionality and automation services may depend on third-party AI infrastructure and external services. Outputs may be probabilistic and require human verification where appropriate. Availability, usage limits, pricing, policies, and capabilities may change. This agreement does not require use of any named AI provider." ]),
    section(15, "intellectualProperty", "Intellectual Property", ["The parties must complete the custom-deliverables treatment before this agreement is sent or signed."], ["Client Materials — Client retains ownership of its existing brand assets, product information, content, trademarks, data, and other materials supplied to GrowxLabs.", "GrowxLabs Background Technology — GrowxLabs retains ownership of pre-existing technology, reusable software, internal tools, frameworks, components, libraries, development utilities, automation infrastructure, AI infrastructure, methods, and general technical know-how.", "Third Party Components — Third-party and open-source components remain subject to their respective licences and terms.", "Custom Deliverables — Ownership or licensing treatment for custom deliverables created specifically for Trionyx is an unresolved internal legal and commercial decision."]),
    section(16, "clientMaterials", "Client Materials and Data", ["Client is responsible for the accuracy, lawfulness, permissions, and appropriate access rights for Client Materials and data supplied to GrowxLabs. GrowxLabs will use them for the approved engagement and will follow the agreed handling instructions available at the time of delivery."]),
    section(17, "confidentiality", "Confidentiality", ["Each party will protect non-public business, technical, commercial, and other confidential information received from the other party and use it only for the approved engagement, subject to applicable law and agreed disclosures. The parties must complete any additional confidentiality treatment required for this engagement during legal review."]),
    section(18, "acceptance", "Testing and Acceptance", ["Testing and acceptance will use the acceptance criteria inherited from the approved Scope of Work. New functionality or material modification requested during review that is outside the approved scope follows the Change Request process."], items(sowContent.acceptanceCriteria).length ? items(sowContent.acceptanceCriteria) : items(acceptedContent.terms).filter((value) => /accept|test|review|defect/i.test(value))),
    section(19, "deployment", "Production Deployment and Handover", ["Production deployment, agreed configuration, testing, administrator access, documentation, and handover are limited to the approved deliverables and available third-party access. Any additional deployment or operational requirement is subject to scope review."]),
    section(20, "support", "Support and Maintenance", ["Ongoing support and maintenance are not defined in the accepted Scope of Work. Any post-launch support, maintenance, service levels, response times, or fees require a separate approved commercial and legal decision." ]),
    section(21, "warranties", "Warranties and Disclaimers", ["GrowxLabs will perform the approved services with reasonable care. Except for commitments expressly approved in the final executed agreement, no additional warranty, performance guarantee, availability commitment, or outcome guarantee is created by this draft. Third-party services remain subject to their own terms and availability."]),
    section(22, "liability", "Limitation of Liability", ["Any monetary cap, exclusions, carve-outs, and treatment of indirect or consequential loss are unresolved and must be approved during legal review. This draft does not invent a liability amount."]),
    section(23, "termination", "Termination", ["Termination rights, notice periods, cure mechanics, and termination for convenience or cause are unresolved and must be approved during legal review. No termination duration is silently inserted."]),
    section(24, "terminationConsequences", "Consequences of Termination", ["On termination, the parties will need to confirm treatment of completed work, unpaid approved fees, Client Materials, access, confidential information, and any third-party commitments in the final agreement. The approved commercial source remains the basis for amounts due for work actually performed, subject to final legal review."]),
    section(25, "forceMajeure", "Force Majeure", ["A force majeure treatment may address events beyond a party's reasonable control, including infrastructure or service interruptions. The final definition, notice duties, mitigation, and consequences require legal approval."]),
    section(26, "governingLaw", "Governing Law and Dispute Resolution", ["Governing law, courts, arbitration, venue, escalation, and dispute-resolution procedure are unresolved. The final agreement must state the approved treatment explicitly."]),
    section(27, "notices", "Notices", ["Formal notices must use the approved legal names, addresses, email addresses, and delivery method. These notice details are unresolved in this draft."]),
    section(28, "entireAgreement", "Entire Agreement and Amendments", [`The executed agreement, the accepted Commercial Proposal ${input.proposalNumber} Version ${input.proposalVersion}, and the approved Scope of Work ${input.scopeNumber} are intended to describe the approved engagement. Any amendment or scope expansion must be recorded in writing and approved by both parties through the applicable process.`]),
    section(29, "electronicExecution", "Electronic Execution", ["The parties may execute electronically when the authorised signatories, signatures, consent to electronic execution, timestamps, and audit metadata are captured in the application. No statutory-compliance claim is made beyond the recorded execution evidence." ]),
    section(30, "signatories", "Authorised Signatories", ["Each signatory record must include full legal name, designation, company, email, signature, consent to electronic execution, timestamp, and relevant audit metadata. A raw canvas signature without the related record is not a complete execution record."], [], input.signatories.map((signatory) => ({
      label: signatory.party === "client" ? "For Trionyx India Private Limited" : "For GrowxLabs",
      value: signatory.fullLegalName ? `${signatory.fullLegalName}${signatory.designation ? ` · ${signatory.designation}` : ""}${signatory.email ? ` · ${signatory.email}` : ""}` : null,
      reviewKey: signatory.party === "client" ? "clientSignatoryAuthority" : "growxlabsSignatory",
    }))),
  ];
}

async function getProposalSource(proposalId: string) {
  const result = await supabaseAdmin.from("commercial_proposals").select("*").eq("id", proposalId).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) return fail(404, "PROPOSAL_NOT_FOUND", "Commercial proposal not found.");
  const proposal = result.data as JsonRecord;
  if (proposal.status !== "accepted") return fail(409, "PROPOSAL_NOT_ACCEPTED", "The proposal must be client-accepted before compiling an agreement.");
  if (!proposal.accepted_version_id) return fail(409, "ACCEPTED_VERSION_MISSING", "The accepted proposal has no immutable accepted version.");
  const versionResult = await supabaseAdmin.from("commercial_document_versions").select("*").eq("id", proposal.accepted_version_id).eq("document_type", "proposal").eq("document_id", proposal.id).maybeSingle();
  if (versionResult.error) throw new Error(versionResult.error.message);
  if (!versionResult.data) return fail(409, "ACCEPTED_VERSION_MISSING", "The accepted proposal snapshot is unavailable.");
  const snapshot = asRecord(versionResult.data.snapshot);
  const engagement = asRecord(snapshot.engagement);
  if (text(snapshot.proposal?.number) !== text(proposal.proposal_number) || Number(snapshot.proposal?.version) !== Number(proposal.version)) return fail(409, "ACCEPTED_VERSION_MISMATCH", "The accepted proposal snapshot does not match the accepted proposal record.");
  if (text(engagement.scopeOfWorkId) !== text(proposal.scope_of_work_id) || text(engagement.clientId) !== text(proposal.client_id)) return fail(409, "SOURCE_RELATIONSHIP_MISMATCH", "The accepted proposal snapshot is not linked to the current Scope of Work and client.");
  return { proposal, version: versionResult.data, snapshot };
}

async function getIdentity(proposal: JsonRecord) {
  const profileResult = await supabaseAdmin.from("client_profiles").select("id,user_id,company_id").eq("id", proposal.client_id).maybeSingle();
  if (profileResult.error) throw new Error(profileResult.error.message);
  if (!profileResult.data) return fail(409, "CLIENT_PROFILE_MISSING", "The linked client profile is missing.");
  const [userResult, companyResult, contactResult] = await Promise.all([
    supabaseAdmin.from("users").select("id,name,email").eq("id", profileResult.data.user_id).maybeSingle(),
    proposal.company_id ? supabaseAdmin.from("companies").select("*").eq("id", proposal.company_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    proposal.company_id ? supabaseAdmin.from("contacts").select("*").eq("company_id", proposal.company_id).eq("is_decision_maker", true).order("created_at", { ascending: true }).limit(1).maybeSingle() : Promise.resolve({ data: null, error: null }),
  ]);
  if (userResult.error) throw new Error(userResult.error.message);
  if (!userResult.data) return fail(409, "CLIENT_USER_MISSING", "The linked client user is missing.");
  if (companyResult.error) throw new Error(companyResult.error.message);
  if (contactResult.error) throw new Error(contactResult.error.message);
  return { profile: profileResult.data, user: userResult.data as JsonRecord, company: (companyResult.data || {}) as JsonRecord, contact: (contactResult.data || null) as JsonRecord | null };
}

async function getScope(proposal: JsonRecord) {
  const result = await supabaseAdmin.from("scopes_of_work").select("*").eq("id", proposal.scope_of_work_id).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) return fail(409, "SOW_MISSING", "The associated Scope of Work is missing.");
  if (!["approved_internal", "ready_for_client", "sent", "viewed", "negotiation", "client_changes_requested", "approved", "signed"].includes(result.data.status)) return fail(409, "SOW_NOT_APPROVED", "The associated Scope of Work is not approved for agreement compilation.");
  return result.data as JsonRecord;
}

function buildSnapshot(input: { agreementNumber: string; version: number; accepted: JsonRecord; proposal: JsonRecord; sow: JsonRecord; client: JsonRecord; growx: JsonRecord; proposalVersion: number; scopeNumber: string; approvalNumber: string; issuedAt: string; effectiveAt: string | null; signatories: MsaSnapshot["signatories"] }): MsaSnapshot {
  const totals = asRecord(input.accepted.commercialTotals);
  const pricing = asArray(input.accepted.pricing);
  const paymentSchedule = asArray(input.accepted.paymentSchedule);
  const snapshot: MsaSnapshot = {
    document: { title: "Master Service Agreement", agreementNumber: input.agreementNumber, version: input.version, status: "draft", issuedAt: input.issuedAt, effectiveAt: input.effectiveAt, confidential: true },
    sourceReferences: { proposalNumber: text(input.proposal.proposal_number), proposalVersion: input.proposalVersion, scopeNumber: input.scopeNumber, proposalApprovalNumber: input.approvalNumber },
    parties: { client: input.client, growxlabs: input.growx },
    commercial: { pricing, totals, paymentSchedule },
    sections: [],
    legalReviewFields: legalReviewFields(),
    signatories: input.signatories,
  };
  snapshot.sections = buildSections({ accepted: input.accepted, sow: input.sow, client: input.client, growx: input.growx, proposalNumber: text(input.proposal.proposal_number), proposalVersion: input.proposalVersion, scopeNumber: input.scopeNumber, approvalNumber: input.approvalNumber, agreementNumber: input.agreementNumber, version: input.version, issuedAt: input.issuedAt, effectiveAt: input.effectiveAt, paymentSchedule, pricing, totals, signatories: input.signatories });
  return snapshot;
}

async function recordActivity(agreementId: string, actorId: string | null, eventType: string, metadata: JsonRecord = {}, agreementVersionId: string | null = null) {
  const { error } = await supabaseAdmin.from("commercial_document_activity").insert({ document_type: "agreement", document_id: agreementId, agreement_version_id: agreementVersionId, actor_id: actorId, actor_type: actorId ? "admin" : "system", event_type: eventType, metadata });
  if (error) throw new Error(error.message);
}

async function uploadPdf(agreementNumber: string, version: number, buffer: Buffer): Promise<string | null> {
  const path = `agreements/master-service-agreements/${agreementNumber}-v${version}.pdf`;
  const result = await supabaseAdmin.storage.from("documents").upload(path, buffer, { contentType: "application/pdf", upsert: true });
  return result.error ? null : path;
}

export async function compileMasterServiceAgreement(proposalId: string, actorId: string) {
  const source = await getProposalSource(proposalId);
  const existing = await supabaseAdmin.from("master_service_agreements").select("id,agreement_number,status,version").eq("proposal_id", proposalId).not("status", "eq", "archived").maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return existing.data;
  const sow = await getScope(source.proposal);
  const identity = await getIdentity(source.proposal);
  const approvalResult = await supabaseAdmin.from("proposal_approval_records").insert({ proposal_id: source.proposal.id, client_id: source.proposal.client_id, company_id: source.proposal.company_id, deal_id: source.proposal.deal_id, status: "approved", created_by: actorId, approval_data: { sourceProposal: source.proposal.proposal_number, acceptedProposalVersionId: source.version.id, acceptedAt: source.proposal.accepted_at } }).select("id,approval_number").single();
  if (approvalResult.error) throw new Error(approvalResult.error.message);
  const inserted = await supabaseAdmin.from("master_service_agreements").insert({ proposal_approval_id: approvalResult.data.id, proposal_id: source.proposal.id, scope_of_work_id: sow.id, proposal_version_id: source.version.id, client_id: source.proposal.client_id, company_id: source.proposal.company_id, deal_id: source.proposal.deal_id, created_by: actorId, issued_at: new Date().toISOString(), content: {} }).select("*").single();
  if (inserted.error) throw new Error(inserted.error.message);
  const client = clientParty(identity.company, identity.user, identity.contact);
  const signatories: MsaSnapshot["signatories"] = [
    { party: "growxlabs", fullLegalName: null, designation: null, company: "GrowxLabs", email: null, signature: null, consentToElectronicExecution: false, signedAt: null },
    { party: "client", fullLegalName: text(client.contactName) || null, designation: text(client.contactDesignation) || null, company: text(client.legalName) || null, email: text(client.contactEmail) || null, signature: null, consentToElectronicExecution: false, signedAt: null },
  ];
  const issuedAt = text(inserted.data.issued_at) || new Date().toISOString();
  const snapshot = buildSnapshot({ agreementNumber: inserted.data.agreement_number, version: 1, accepted: source.version.snapshot, proposal: source.proposal, sow, client, growx: growxParty(), proposalVersion: Number(source.version.version), scopeNumber: sow.scope_number, approvalNumber: approvalResult.data.approval_number, issuedAt, effectiveAt: null, signatories });
  const hash = proposalContentHash(snapshot as unknown as Record<string, unknown>);
  const versionResult = await supabaseAdmin.from("commercial_document_versions").insert({ document_type: "agreement", document_id: inserted.data.id, version: 1, snapshot, content_hash: hash, locked_at: new Date().toISOString(), client_visible: true, created_by: actorId }).select("id,version").single();
  if (versionResult.error) throw new Error(versionResult.error.message);
  const pdf = await renderMasterServiceAgreementPdf(snapshot);
  const pdfPath = await uploadPdf(inserted.data.agreement_number, 1, pdf);
  const updated = await supabaseAdmin.from("master_service_agreements").update({ content: snapshot, current_version_id: versionResult.data.id, content_hash: hash, pdf_status: "generated", pdf_storage_path: pdfPath, pdf_generated_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", inserted.data.id).select("*").single();
  if (updated.error) throw new Error(updated.error.message);
  await recordActivity(inserted.data.id, actorId, "agreement_compiled", { proposalNumber: source.proposal.proposal_number, proposalVersion: source.version.version, scopeNumber: sow.scope_number, approvalNumber: approvalResult.data.approval_number, contentHash: hash, pdfStored: Boolean(pdfPath) }, versionResult.data.id);
  await recordAuditEvent({ actorId, action: "agreement.compiled", resourceType: "master_service_agreement", resourceId: inserted.data.id, clientId: inserted.data.client_id, companyId: inserted.data.company_id, metadata: { agreementNumber: inserted.data.agreement_number, proposalNumber: source.proposal.proposal_number, proposalVersion: source.version.version, scopeNumber: sow.scope_number, version: 1 } });
  return updated.data;
}

async function getAgreement(id: string) {
  const result = await supabaseAdmin.from("master_service_agreements").select("*").eq("id", id).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) return fail(404, "AGREEMENT_NOT_FOUND", "Master Service Agreement not found.");
  return result.data as JsonRecord;
}

async function currentVersion(agreement: JsonRecord) {
  if (!agreement.current_version_id) return fail(409, "VERSION_MISSING", "The agreement has no immutable current version.");
  const result = await supabaseAdmin.from("commercial_document_versions").select("*").eq("id", agreement.current_version_id).eq("document_type", "agreement").eq("document_id", agreement.id).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) return fail(409, "VERSION_MISSING", "The immutable agreement version is unavailable.");
  return result.data as JsonRecord;
}

function applyLegalReviewValues(base: MsaSnapshot, values: JsonRecord, version: number): MsaSnapshot {
  const snapshot = JSON.parse(JSON.stringify(base)) as MsaSnapshot;
  const valueFor = (key: string) => {
    const submitted = Object.prototype.hasOwnProperty.call(values, key) ? text(values[key]) : "";
    return submitted || snapshot.legalReviewFields.find((field) => field.key === key)?.value || "";
  };
  snapshot.legalReviewFields = snapshot.legalReviewFields.map((field) => {
    const nextValue = valueFor(field.key);
    return { ...field, value: nextValue || null, status: nextValue ? "resolved" : "unresolved" };
  });
  snapshot.document = { ...snapshot.document, version, status: "draft", effectiveAt: valueFor("effectiveDate") || null };
  const growx = { ...snapshot.parties.growxlabs };
  const growxLegalEntity = valueFor("growxlabsLegalEntity");
  const growxAddress = valueFor("growxlabsRegisteredAddress");
  if (growxLegalEntity) growx.legalName = growxLegalEntity;
  if (growxAddress) growx.registeredAddress = growxAddress;
  snapshot.parties = { ...snapshot.parties, growxlabs: growx };
  const signatoryValue = (key: string) => valueFor(key);
  snapshot.signatories = snapshot.signatories.map((signatory) => {
    const raw = signatoryValue(signatory.party === "client" ? "clientSignatoryAuthority" : "growxlabsSignatory");
    if (!raw) return signatory;
    const parts = raw.split("|").map((part) => part.trim()).filter(Boolean);
    return { ...signatory, fullLegalName: parts[0] || raw, designation: parts[1] || signatory.designation, email: parts[2] || signatory.email };
  });
  const customIp = valueFor("customDeliverablesIpTreatment");
  const support = valueFor("supportAndMaintenance");
  const liability = valueFor("liabilityCap");
  const termination = valueFor("terminationNotice");
  const governing = valueFor("governingLawAndVenue");
  const notices = valueFor("noticeMechanism");
  snapshot.sections = snapshot.sections.map((item) => {
    if (item.key === "parties") {
      const body = [...item.body];
      body[0] = `This Master Service Agreement is between ${text(growx.legalName) || "GrowxLabs"} ("GrowxLabs") and ${text(snapshot.parties.client.legalName) || "the Client"} ("Client").`;
      body[1] = unresolved(snapshot).length ? "The agreement remains subject to completion of the unresolved legal fields identified below." : "The legal and commercial details required for this version have been completed for internal approval.";
      return { ...item, body, fields: item.fields?.map((field) => field.reviewKey === "effectiveDate" ? { ...field, value: snapshot.document.effectiveAt } : field) };
    }
    if (item.key === "intellectualProperty" && customIp) return { ...item, body: [`Custom deliverables ownership or licensing treatment: ${customIp}.`] };
    if (item.key === "support" && support) return { ...item, body: [`Support and maintenance commitment: ${support}.`] };
    if (item.key === "liability" && liability) return { ...item, body: [`Limitation of liability: ${liability}.`] };
    if (item.key === "termination" && termination) return { ...item, body: [`Termination notice and related mechanics: ${termination}.`] };
    if (item.key === "governingLaw" && governing) return { ...item, body: [`Governing law and dispute resolution: ${governing}.`] };
    if (item.key === "notices" && notices) return { ...item, body: [`Formal notices: ${notices}.`] };
    if (item.key === "signatories") return { ...item, fields: snapshot.signatories.map((signatory) => ({ label: signatory.party === "client" ? "For Trionyx India Private Limited" : "For GrowxLabs", value: signatory.fullLegalName ? `${signatory.fullLegalName}${signatory.designation ? ` · ${signatory.designation}` : ""}${signatory.email ? ` · ${signatory.email}` : ""}` : null, reviewKey: signatory.party === "client" ? "clientSignatoryAuthority" : "growxlabsSignatory" })) };
    return item;
  });
  return snapshot;
}

export async function updateAgreementLegalReview(id: string, values: JsonRecord, actorId: string) {
  const agreement = await getAgreement(id);
  if (!["draft", "changes_required", "approved_internal"].includes(agreement.status)) return fail(409, "LEGAL_REVIEW_LOCKED", "Legal review fields can only be updated before the agreement is sent to the client.");
  const current = await currentVersion(agreement);
  const nextVersion = Number(agreement.version || current.version || 0) + 1;
  const snapshot = applyLegalReviewValues(current.snapshot as MsaSnapshot, values, nextVersion);
  const hash = proposalContentHash(snapshot as unknown as Record<string, unknown>);
  const versionResult = await supabaseAdmin.from("commercial_document_versions").insert({ document_type: "agreement", document_id: agreement.id, version: nextVersion, snapshot, content_hash: hash, locked_at: new Date().toISOString(), client_visible: true, created_by: actorId }).select("id,version").single();
  if (versionResult.error) throw new Error(versionResult.error.message);
  const pdf = await renderMasterServiceAgreementPdf(snapshot);
  const pdfPath = await uploadPdf(agreement.agreement_number, nextVersion, pdf);
  const now = new Date().toISOString();
  const updated = await supabaseAdmin.from("master_service_agreements").update({ status: "draft", version: nextVersion, content: snapshot, current_version_id: versionResult.data.id, content_hash: hash, pdf_status: "generated", pdf_storage_path: pdfPath, pdf_generated_at: now, approved_internally_at: null, ready_for_client_at: null, sent_at: null, updated_at: now }).eq("id", agreement.id).eq("version", agreement.version).select("*").single();
  if (updated.error) throw new Error(updated.error.message);
  const changedFields = snapshot.legalReviewFields.filter((field) => field.status === "resolved").map((field) => field.key);
  await recordActivity(agreement.id, actorId, "agreement_legal_review_updated", { fromStatus: agreement.status, toStatus: "draft", version: nextVersion, changedFields, contentHash: hash, pdfStored: Boolean(pdfPath) }, versionResult.data.id);
  await recordAuditEvent({ actorId, action: "agreement.legal_review_updated", resourceType: "master_service_agreement", resourceId: agreement.id, clientId: agreement.client_id, companyId: agreement.company_id, metadata: { agreementNumber: agreement.agreement_number, version: nextVersion, changedFields } });
  return getAdminAgreement(agreement.id);
}

async function relatedReferences(agreement: JsonRecord) {
  const [proposal, scope, company, user] = await Promise.all([
    supabaseAdmin.from("commercial_proposals").select("proposal_number,version,status,accepted_version_id").eq("id", agreement.proposal_id).maybeSingle(),
    agreement.scope_of_work_id ? supabaseAdmin.from("scopes_of_work").select("scope_number,status").eq("id", agreement.scope_of_work_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    agreement.company_id ? supabaseAdmin.from("companies").select("name").eq("id", agreement.company_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    supabaseAdmin.from("client_profiles").select("user_id").eq("id", agreement.client_id).maybeSingle(),
  ]);
  if (proposal.error || scope.error || company.error || user.error) throw new Error("Unable to load agreement references.");
  let clientName = null;
  if (user.data?.user_id) {
    const clientUser = await supabaseAdmin.from("users").select("name,email").eq("id", user.data.user_id).maybeSingle();
    clientName = clientUser.data?.name || clientUser.data?.email || null;
  }
  return { proposal: proposal.data, scope: scope.data, company: company.data, clientName };
}

export async function getAdminAgreement(id: string) {
  const agreement = await getAgreement(id);
  const version = await currentVersion(agreement);
  const [refs, activity, reviews, changes, signatures] = await Promise.all([
    relatedReferences(agreement),
    supabaseAdmin.from("commercial_document_activity").select("id,event_type,actor_type,metadata,created_at,agreement_version_id").eq("document_type", "agreement").eq("document_id", agreement.id).order("created_at", { ascending: false }),
    supabaseAdmin.from("agreement_internal_reviews").select("id,decision,comment,unresolved_fields,decided_at,created_at").eq("agreement_id", agreement.id).order("created_at", { ascending: false }),
    supabaseAdmin.from("agreement_change_requests").select("id,requested_by_name,requested_change,reason,scope_impact,timeline_impact,commercial_impact,growxlabs_approval,client_approval,status,requested_at,resolved_at").eq("agreement_id", agreement.id).order("requested_at", { ascending: false }),
    supabaseAdmin.from("agreement_signatory_events").select("id,party,full_legal_name,designation,company,email,signature,consent_to_electronic_execution,signed_at,audit_metadata,created_at").eq("agreement_id", agreement.id).order("signed_at", { ascending: true }),
  ]);
  for (const result of [activity, reviews, changes, signatures]) if (result.error) throw new Error(result.error.message);
  return { agreement: { id: agreement.id, agreementNumber: agreement.agreement_number, status: agreement.status, version: agreement.version, issuedAt: agreement.issued_at, effectiveAt: agreement.effective_at, pdfStatus: agreement.pdf_status, pdfGeneratedAt: agreement.pdf_generated_at, proposalNumber: refs.proposal?.proposal_number || version.snapshot?.sourceReferences?.proposalNumber || null, scopeNumber: refs.scope?.scope_number || version.snapshot?.sourceReferences?.scopeNumber || null, clientName: refs.clientName || version.snapshot?.parties?.client?.contactName || null, companyName: refs.company?.name || version.snapshot?.parties?.client?.legalName || null }, snapshot: version.snapshot as MsaSnapshot, version: { id: version.id, version: version.version, contentHash: version.content_hash }, activity: activity.data || [], reviews: reviews.data || [], changeRequests: changes.data || [], signatures: signatures.data || [] };
}

export async function listAdminAgreements() {
  const result = await supabaseAdmin.from("master_service_agreements").select("id,agreement_number,status,version,client_id,proposal_id,scope_of_work_id,issued_at,updated_at,pdf_status").not("status", "eq", "archived").order("updated_at", { ascending: false });
  if (result.error) throw new Error(result.error.message);
  const rows = result.data || [];
  return Promise.all(rows.map(async (row) => { const refs = await relatedReferences(row); return { id: row.id, agreementNumber: row.agreement_number, status: row.status, version: row.version, clientName: refs.clientName, companyName: refs.company?.name || null, proposalNumber: refs.proposal?.proposal_number || null, scopeNumber: refs.scope?.scope_number || null, issuedAt: row.issued_at, updatedAt: row.updated_at, pdfStatus: row.pdf_status }; }));
}

export async function listEligibleProposals() {
  const result = await supabaseAdmin.from("commercial_proposals").select("id,proposal_number,version,client_id,company_id,accepted_version_id,status").eq("status", "accepted").not("accepted_version_id", "is", null).order("accepted_at", { ascending: false });
  if (result.error) throw new Error(result.error.message);
  return Promise.all((result.data || []).map(async (proposal) => { const refs = await relatedReferences({ proposal_id: proposal.id, client_id: proposal.client_id, company_id: proposal.company_id }); return { proposalNumber: proposal.proposal_number, version: proposal.version, clientName: refs.clientName, companyName: refs.company?.name || null }; }));
}

const unresolved = (snapshot: MsaSnapshot) => snapshot.legalReviewFields.filter((field) => field.status === "unresolved");

export async function agreementAction(id: string, action: string, actorId: string, comment?: string) {
  const agreement = await getAgreement(id);
  const version = await currentVersion(agreement);
  const snapshot = version.snapshot as MsaSnapshot;
  const now = new Date().toISOString();
  let next: MsaStatus | null = null;
  if (action === "submit_review" && agreement.status === "draft") next = "internal_review";
  else if (action === "request_changes" && agreement.status === "internal_review") next = "changes_required";
  else if (action === "resolve_changes" && agreement.status === "changes_required") next = "draft";
  else if (action === "approve" && agreement.status === "internal_review") next = "approved_internal";
  else if (action === "mark_ready" && agreement.status === "approved_internal") {
    if (unresolved(snapshot).length) return fail(409, "LEGAL_REVIEW_REQUIRED", "Resolve all internal legal-review fields before marking the agreement ready for the client.");
    next = "ready_for_client";
  } else if (action === "send" && agreement.status === "ready_for_client") {
    if (unresolved(snapshot).length) return fail(409, "LEGAL_REVIEW_REQUIRED", "Resolve all internal legal-review fields before sending the agreement.");
    next = "sent";
  } else if (action === "expire" && ["sent", "viewed", "negotiation"].includes(agreement.status)) next = "expired";
  else return fail(409, "INVALID_TRANSITION", `Agreement action '${action}' is not allowed from status '${agreement.status}'.`);
  const update: JsonRecord = { status: next, updated_at: now };
  if (next === "approved_internal") update.approved_internally_at = now;
  if (next === "ready_for_client") update.ready_for_client_at = now;
  if (next === "sent") update.sent_at = now;
  if (next === "expired") update.expired_at = now;
  const updated = await supabaseAdmin.from("master_service_agreements").update(update).eq("id", id).eq("status", agreement.status).select("*").single();
  if (updated.error) throw new Error(updated.error.message);
  const reviewDecision = action === "submit_review" ? "submitted" : action === "approve" ? "approved" : action === "request_changes" ? "changes_required" : null;
  if (reviewDecision) {
    const review = await supabaseAdmin.from("agreement_internal_reviews").insert({ agreement_id: id, agreement_version_id: version.id, reviewer_id: actorId, decision: reviewDecision, comment: comment || null, unresolved_fields: unresolved(snapshot).map((field) => field.key) });
    if (review.error) throw new Error(review.error.message);
  }
  if (action === "resolve_changes") {
    const resolvedRequests = await supabaseAdmin.from("agreement_change_requests").update({ status: "resolved", resolved_at: now }).eq("agreement_id", id).eq("status", "open");
    if (resolvedRequests.error) throw new Error(resolvedRequests.error.message);
  }
  await recordActivity(id, actorId, `agreement_${action}`, { from: agreement.status, to: next, comment: comment || null, unresolvedFields: unresolved(snapshot).map((field) => field.key) }, version.id);
  await recordAuditEvent({ actorId, action: `agreement.${action}`, resourceType: "master_service_agreement", resourceId: id, clientId: agreement.client_id, companyId: agreement.company_id, metadata: { agreementNumber: agreement.agreement_number, from: agreement.status, to: next, version: version.version } });
  if (next === "sent") return sendAgreement(updated.data, version, actorId);
  return getAdminAgreement(id);
}

async function sendAgreement(agreement: JsonRecord, version: JsonRecord, actorId: string) {
  const identity = await getIdentity({ client_id: agreement.client_id, company_id: agreement.company_id });
  const client = clientParty(identity.company, identity.user, identity.contact);
  const reviewUrl = `/client/agreement/${encodeURIComponent(agreement.agreement_number)}`;
  const email = text(identity.user.email);
  const displayName = text(client.contactName) || text(identity.user.name) || "Client";
  const body = GrowXLabsEmailLayout({ context: "SERVICE AGREEMENT", reference: agreement.agreement_number, content: `<p>Hello ${escapeGrowXLabsEmailHtml(displayName)},</p><p>Your GrowxLabs Service Agreement <strong>${escapeGrowXLabsEmailHtml(agreement.agreement_number)}</strong> is ready for review in Client Suite.</p>${EmailAction("Review Agreement", `${process.env.NEXT_PUBLIC_APP_URL || "https://growxlabs.tech"}${reviewUrl}`)}<p>Please review the agreement and use the signing action in Client Suite when you are ready.</p>` });
  const message = await enqueueCommunication({ channel: "email", messageType: "agreement_available", subject: `Service Agreement ${agreement.agreement_number} from GrowxLabs`, body, email, displayName, relatedEntityType: "master_service_agreement", relatedEntityId: agreement.id, clientId: agreement.client_id, companyId: agreement.company_id, variables: { agreementNumber: agreement.agreement_number, agreementVersion: version.version, portalNotification: { type: "agreement_available", label: "Agreement Ready", title: `Service Agreement ${agreement.agreement_number} is ready for review`, message: "Your GrowxLabs Service Agreement for the approved engagement is available for review.", referenceCode: agreement.agreement_number, targetUrl: reviewUrl, actionLabel: "Review Agreement" } } }, actorId);
  const { error: notificationError } = await supabaseAdmin.from("notification_events").insert({ event_key: "agreement_ready", payload: { agreementNumber: agreement.agreement_number, version: version.version, clientId: agreement.client_id, targetUrl: reviewUrl } });
  if (notificationError) throw new Error(notificationError.message);
  await recordActivity(agreement.id, actorId, "agreement_sent", { communicationMessageId: message.id, agreementNumber: agreement.agreement_number }, version.id);
  return getAdminAgreement(agreement.id);
}

export async function listClientAgreements(clientId: string) {
  const result = await supabaseAdmin.from("master_service_agreements").select("agreement_number,status,version,issued_at,updated_at,proposal_id,scope_of_work_id").eq("client_id", clientId).in("status", ["sent", "viewed", "negotiation", "client_changes_requested", "signing", "signed", "expired", "terminated"]).order("updated_at", { ascending: false });
  if (result.error) throw new Error(result.error.message);
  return Promise.all((result.data || []).map(async (row) => {
    const [proposal, scope] = await Promise.all([
      supabaseAdmin.from("commercial_proposals").select("proposal_number").eq("id", row.proposal_id).maybeSingle(),
      supabaseAdmin.from("scopes_of_work").select("scope_number").eq("id", row.scope_of_work_id).maybeSingle(),
    ]);
    if (proposal.error || scope.error) throw new Error("Unable to load contract references.");
    return { agreementNumber: row.agreement_number, status: row.status, version: row.version, issuedAt: row.issued_at, updatedAt: row.updated_at, relatedProposal: proposal.data?.proposal_number || null, scopeReference: scope.data?.scope_number || null };
  }));
}

export async function getClientAgreement(reference: string, clientId: string, userId: string, track = true) {
  const result = await supabaseAdmin.from("master_service_agreements").select("*").eq("agreement_number", reference).eq("client_id", clientId).in("status", ["sent", "viewed", "negotiation", "client_changes_requested", "signing", "signed", "expired", "terminated"]).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) return fail(404, "AGREEMENT_NOT_FOUND", "Agreement not found.");
  const version = await currentVersion(result.data);
  if (!version.client_visible) return fail(409, "VERSION_NOT_CLIENT_VISIBLE", "This agreement version is not available in Client Suite.");
  let status = result.data.status;
  if (track && status === "sent") {
    const now = new Date().toISOString();
    const update = await supabaseAdmin.from("master_service_agreements").update({ status: "viewed", viewed_at: now, updated_at: now }).eq("id", result.data.id).eq("status", "sent");
    if (update.error) throw new Error(update.error.message);
    await recordActivity(result.data.id, userId, "agreement_viewed", { agreementNumber: result.data.agreement_number }, version.id);
    status = "viewed";
  }
  const snapshot = version.snapshot as MsaSnapshot;
  return { agreementNumber: result.data.agreement_number, version: version.version, status, issuedAt: result.data.issued_at, effectiveAt: result.data.effective_at, proposalReference: snapshot.sourceReferences.proposalNumber, scopeReference: snapshot.sourceReferences.scopeNumber, snapshot, contentHash: version.content_hash };
}

export type SignatureInput = { fullLegalName: string; designation: string; company: string; email: string; signature: string; consentToElectronicExecution: boolean; auditMetadata?: JsonRecord };

function validateSignature(input: SignatureInput) {
  const requiredKeys: Array<keyof SignatureInput> = ["fullLegalName", "designation", "company", "email", "signature"];
  for (const key of requiredKeys) if (!text(input[key])) return fail(400, "SIGNATORY_REQUIRED", `${key} is required.`);
  if (!input.consentToElectronicExecution) return fail(400, "EXECUTION_CONSENT_REQUIRED", "Consent to electronic execution is required.");
}

async function executedVersion(agreement: JsonRecord, current: JsonRecord, actorId: string) {
  const events = await supabaseAdmin.from("agreement_signatory_events").select("party,full_legal_name,designation,company,email,signature,consent_to_electronic_execution,signed_at").eq("agreement_id", agreement.id).eq("agreement_version_id", current.id).order("signed_at", { ascending: true });
  if (events.error) throw new Error(events.error.message);
  const signed = events.data || [];
  if (!signed.some((event) => event.party === "client") || !signed.some((event) => event.party === "growxlabs")) return fail(409, "BOTH_SIGNATURES_REQUIRED", "Both GrowxLabs and client signing events are required before execution.");
  const base = current.snapshot as MsaSnapshot;
  const executionSignatories = signed.map((event) => ({ party: event.party as MsaParty, fullLegalName: event.full_legal_name, designation: event.designation, company: event.company, email: event.email, signature: event.signature, consentToElectronicExecution: event.consent_to_electronic_execution, signedAt: event.signed_at }));
  const snapshot: MsaSnapshot = { ...base, document: { ...base.document, version: Number(current.version) + 1, status: "signed" }, signatories: executionSignatories, execution: { executedAt: new Date().toISOString(), signatories: executionSignatories } };
  const hash = proposalContentHash(snapshot as unknown as Record<string, unknown>);
  const versionResult = await supabaseAdmin.from("commercial_document_versions").insert({ document_type: "agreement", document_id: agreement.id, version: Number(current.version) + 1, snapshot, content_hash: hash, locked_at: new Date().toISOString(), client_visible: true, created_by: actorId }).select("id,version").single();
  if (versionResult.error) throw new Error(versionResult.error.message);
  return { version: versionResult.data, hash, snapshot };
}

export async function recordAgreementSignature(id: string, party: MsaParty, input: SignatureInput, actorId: string, requestMetadata: JsonRecord = {}) {
  validateSignature(input);
  const agreement = await getAgreement(id);
  if (!["sent", "viewed", "signing"].includes(agreement.status)) return fail(409, "INVALID_TRANSITION", "Signing is not available in the current agreement state.");
  const current = await currentVersion(agreement);
  const insert = await supabaseAdmin.from("agreement_signatory_events").insert({ agreement_id: agreement.id, agreement_version_id: current.id, party, full_legal_name: input.fullLegalName.trim(), designation: input.designation.trim(), company: input.company.trim(), email: input.email.trim(), signature: input.signature, consent_to_electronic_execution: input.consentToElectronicExecution, actor_id: actorId, audit_metadata: { ...input.auditMetadata, ...requestMetadata } }).select("id").single();
  if (insert.error?.code === "23505") return fail(409, "SIGNATURE_ALREADY_RECORDED", `A ${party} signature is already recorded for this agreement version.`);
  if (insert.error) throw new Error(insert.error.message);
  const hasClient = party === "client" || Boolean((await supabaseAdmin.from("agreement_signatory_events").select("id").eq("agreement_id", agreement.id).eq("agreement_version_id", current.id).eq("party", "client").maybeSingle()).data);
  const hasGrowx = party === "growxlabs" || Boolean((await supabaseAdmin.from("agreement_signatory_events").select("id").eq("agreement_id", agreement.id).eq("agreement_version_id", current.id).eq("party", "growxlabs").maybeSingle()).data);
  let update: JsonRecord = { status: hasClient && hasGrowx ? "signed" : "signing", updated_at: new Date().toISOString() };
  let finalVersion: JsonRecord | null = null;
  if (hasClient && hasGrowx) {
    const executed = await executedVersion(agreement, current, actorId);
    finalVersion = executed.version;
    update = { ...update, version: executed.version.version, current_version_id: executed.version.id, executed_version_id: executed.version.id, content: executed.snapshot, content_hash: executed.hash, signed_at: new Date().toISOString(), client_signed_at: party === "client" ? new Date().toISOString() : agreement.client_signed_at };
  } else if (party === "client") update.client_signed_at = new Date().toISOString();
  const updated = await supabaseAdmin.from("master_service_agreements").update(update).eq("id", agreement.id).eq("status", agreement.status).select("id,status,agreement_number,version").single();
  if (updated.error) throw new Error(updated.error.message);
  await recordActivity(agreement.id, actorId, `agreement_${party}_signed`, { agreementNumber: agreement.agreement_number, executed: Boolean(finalVersion) }, finalVersion?.id || current.id);
  await recordAuditEvent({ actorId, action: `agreement.${party}_signed`, resourceType: "master_service_agreement", resourceId: agreement.id, clientId: agreement.client_id, companyId: agreement.company_id, metadata: { agreementNumber: agreement.agreement_number, version: finalVersion?.version || current.version, executed: Boolean(finalVersion) } });
  return getAdminAgreement(agreement.id);
}

export async function getAgreementPdfForAdmin(id: string) {
  const data = await getAdminAgreement(id);
  return { ...data, pdf: await renderMasterServiceAgreementPdf(data.snapshot) };
}

export async function getAgreementPdfForClient(reference: string, clientId: string, userId: string) {
  const data = await getClientAgreement(reference, clientId, userId, false);
  return { ...data, pdf: await renderMasterServiceAgreementPdf(data.snapshot) };
}
