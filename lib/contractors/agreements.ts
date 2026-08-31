import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { enqueueCommunication } from "@/lib/communications/service";
import { recordAuditEvent } from "@/lib/activity/events";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ConsultingHttpError } from "@/lib/consulting/workflow";
import { EmailAction, escapeGrowXLabsEmailHtml, GrowXLabsEmailLayout } from "@/lib/email/growxlabs-layout";
import { proposalContentHash } from "@/lib/commercial/proposal-domain";
import { renderContractorAgreementPdf } from "@/lib/pdf/contractor-agreement-pdf";

export const CONTRACTOR_AGREEMENT_NUMBER = "GXL-ICA-2026-000001";
export const CONTRACTOR_ROLE = "Developer, GrowxLabs Delivery Team";
export const CONTRACTOR_TOTAL_FEE = 30000;

export const CONTRACTOR_STATUSES = [
  "draft",
  "internal_review",
  "approved_for_signing",
  "sent_to_contractor",
  "viewed",
  "contractor_signed",
  "fully_executed",
  "completed",
  "terminated",
  "superseded",
  "cancelled",
] as const;

export type ContractorAgreementStatus = (typeof CONTRACTOR_STATUSES)[number];
export type ContractorParty = "growxlabs" | "contractor";

export type ContractorScope = {
  role: string;
  responsibilities: string[];
  assignedModules: string[];
  developmentAreas: string[];
  deliverables: string[];
  integrations: string[];
  documentationDuties: string[];
  testingDuties: string[];
  handoverDuties: string[];
  deliveryDates: string;
  technicalStandards: string;
  repositoryOrWorkspace: string;
  acceptanceCriteria: string;
  approvedClientProjectRequirements: string;
};

export type ContractorLegalField = {
  key: string;
  label: string;
  value: string | null;
  status: "unresolved" | "resolved";
};

export type ContractorSignature = {
  party: ContractorParty;
  fullLegalName: string;
  roleOrCapacity: string;
  email: string;
  phone: string | null;
  address: string | null;
  panOrTaxId: string | null;
  signature: string;
  consentToElectronicExecution: boolean;
  signedAt: string;
};

export type ContractorMilestone = {
  key: "milestone_1" | "milestone_2" | "milestone_3";
  name: string;
  amount: number;
  trigger: string;
};

export type ContractorAgreementSnapshot = {
  document: {
    title: string;
    agreementNumber: string;
    version: number;
    status: ContractorAgreementStatus;
    agreementDate: string | null;
    effectiveDate: string | null;
    confidential: boolean;
  };
  parties: {
    engagingParty: {
      name: "GrowxLabs";
      legalIdentity: string | null;
      noticeAddress: string | null;
    };
    contractor: {
      fullLegalName: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
      panOrTaxId: string | null;
      role: typeof CONTRACTOR_ROLE;
      contractualStatus: "Independent Contractor";
    };
  };
  project: {
    projectReference: string | null;
    clientProjectReference: string | null;
    projectName: string | null;
    context: string;
  };
  commercial: {
    totalFee: number;
    currency: "INR";
    paymentMethod: "UPI";
    milestones: ContractorMilestone[];
  };
  scope: ContractorScope;
  legalFields: ContractorLegalField[];
  sections: ContractorSection[];
  signatures: ContractorSignature[];
  execution?: {
    executedAt: string;
    documentHash: string;
    signatures: ContractorSignature[];
  };
};

export type ContractorSection = {
  number: number;
  key: string;
  title: string;
  body: string[];
  items?: string[];
  fields?: Array<{ label: string; value: string | null }>;
};

type JsonRecord = Record<string, unknown>;

const fail = (status: number, code: string, message: string): never => {
  throw new ConsultingHttpError(status, `${code}: ${message}`);
};

const asRecord = (value: unknown): JsonRecord =>
  value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};

const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

const clean = (value: unknown): string => typeof value === "string" ? value.trim() : value === null || value === undefined ? "" : String(value).trim();
const nullable = (value: unknown): string | null => clean(value) || null;
const list = (value: unknown): string[] => asArray(value).map(clean).filter(Boolean);

export const contractorMilestones = (): ContractorMilestone[] => [
  { key: "milestone_1", name: "Milestone 1", amount: 9000, trigger: "Agreement execution and commencement of the agreed project work." },
  { key: "milestone_2", name: "Milestone 2", amount: 12000, trigger: "Completion and GrowxLabs approval of the agreed major development milestone." },
  { key: "milestone_3", name: "Milestone 3", amount: 9000, trigger: "Final delivery, completion of agreed corrections, repository and source code handover, required documentation, project asset handover, access handover and completion of the applicable IP obligations." },
];

export const emptyContractorScope = (): ContractorScope => ({
  role: CONTRACTOR_ROLE,
  responsibilities: [],
  assignedModules: [],
  developmentAreas: [],
  deliverables: [],
  integrations: [],
  documentationDuties: [],
  testingDuties: [],
  handoverDuties: [],
  deliveryDates: "",
  technicalStandards: "",
  repositoryOrWorkspace: "",
  acceptanceCriteria: "",
  approvedClientProjectRequirements: "",
});

const legalFieldLabels: Record<string, string> = {
  growxlabsNoticeAddress: "GrowxLabs notice address",
  growxlabsAuthorisedSignatory: "GrowxLabs authorised signatory",
  contractorFullLegalName: "Contractor full legal name",
  contractorEmail: "Contractor email",
  contractorPhone: "Contractor phone",
  contractorAddress: "Contractor address",
  contractorPanOrTaxId: "Contractor PAN or tax identification where applicable",
  agreementDate: "Agreement date",
  effectiveDate: "Effective date",
  exactScope: "Exact Schedule A scope",
  deliveryDates: "Delivery dates",
  acceptanceCriteria: "Acceptance criteria",
  repositoryOrWorkspace: "Repository or workspace",
  backgroundIp: "Background IP disclosures",
  taxTreatment: "TDS or tax treatment",
  liabilityCap: "Liability cap",
  curePeriod: "Cure period",
  disputeForum: "Dispute forum and jurisdiction",
  arbitrationDetails: "Arbitration details, if selected",
};

export function defaultContractorLegalFields(): ContractorLegalField[] {
  return Object.entries(legalFieldLabels).map(([key, label]) => ({ key, label, value: null, status: "unresolved" }));
}

function scopeFrom(value: unknown): ContractorScope {
  const source = asRecord(value);
  const empty = emptyContractorScope();
  return {
    ...empty,
    role: CONTRACTOR_ROLE,
    responsibilities: list(source.responsibilities),
    assignedModules: list(source.assignedModules),
    developmentAreas: list(source.developmentAreas),
    deliverables: list(source.deliverables),
    integrations: list(source.integrations),
    documentationDuties: list(source.documentationDuties),
    testingDuties: list(source.testingDuties),
    handoverDuties: list(source.handoverDuties),
    deliveryDates: clean(source.deliveryDates),
    technicalStandards: clean(source.technicalStandards),
    repositoryOrWorkspace: clean(source.repositoryOrWorkspace),
    acceptanceCriteria: clean(source.acceptanceCriteria),
    approvedClientProjectRequirements: clean(source.approvedClientProjectRequirements),
  };
}

function scopeComplete(scope: ContractorScope): boolean {
  return Boolean(
    scope.responsibilities.length &&
    scope.assignedModules.length &&
    scope.developmentAreas.length &&
    scope.deliverables.length &&
    scope.documentationDuties.length &&
    scope.testingDuties.length &&
    scope.handoverDuties.length &&
    scope.deliveryDates &&
    scope.technicalStandards &&
    scope.repositoryOrWorkspace &&
    scope.acceptanceCriteria &&
    scope.approvedClientProjectRequirements,
  );
}

function manualLegalValues(value: unknown): Record<string, string> {
  const source = asRecord(value);
  return Object.fromEntries(Object.entries(source).map(([key, item]) => [key, clean(item)]));
}

function legalFieldsFor(row: JsonRecord, scope: ContractorScope): ContractorLegalField[] {
  const stored = new Map(asArray(row.legal_fields).map((item) => {
    const field = asRecord(item);
    return [clean(field.key), clean(field.value)] as const;
  }).filter(([key]) => Boolean(key)));
  const values: Record<string, string> = {
    growxlabsNoticeAddress: stored.get("growxlabsNoticeAddress") || "",
    growxlabsAuthorisedSignatory: stored.get("growxlabsAuthorisedSignatory") || "",
    contractorFullLegalName: clean(row.contractor_full_legal_name),
    contractorEmail: clean(row.contractor_email),
    contractorPhone: clean(row.contractor_phone),
    contractorAddress: clean(row.contractor_address),
    contractorPanOrTaxId: clean(row.contractor_pan_or_tax_id),
    agreementDate: clean(row.agreement_date),
    effectiveDate: clean(row.effective_date),
    exactScope: scopeComplete(scope) ? "Schedule A completed by GrowxLabs." : "",
    deliveryDates: scope.deliveryDates,
    acceptanceCriteria: scope.acceptanceCriteria,
    repositoryOrWorkspace: scope.repositoryOrWorkspace,
    backgroundIp: stored.get("backgroundIp") || "",
    taxTreatment: stored.get("taxTreatment") || "",
    liabilityCap: stored.get("liabilityCap") || "",
    curePeriod: stored.get("curePeriod") || "",
    disputeForum: stored.get("disputeForum") || "",
    arbitrationDetails: stored.get("arbitrationDetails") || "",
  };
  return Object.entries(legalFieldLabels).map(([key, label]) => ({ key, label, value: values[key] || null, status: values[key] ? "resolved" : "unresolved" }));
}

function storedLegalFields(values: Record<string, string>, existing: unknown): ContractorLegalField[] {
  const current = new Map(asArray(existing).map((item) => {
    const field = asRecord(item);
    return [clean(field.key), clean(field.value)] as const;
  }).filter(([key]) => Boolean(key)));
  for (const key of Object.keys(legalFieldLabels)) if (values[key] !== undefined) current.set(key, clean(values[key]));
  return Object.entries(legalFieldLabels).map(([key, label]) => ({ key, label, value: current.get(key) || null, status: current.get(key) ? "resolved" : "unresolved" }));
}

function legalFieldsComplete(snapshot: ContractorAgreementSnapshot): boolean {
  return snapshot.legalFields.every((field) => field.status === "resolved");
}

function section(number: number, key: string, title: string, body: string[] = [], items: string[] = [], fields: Array<{ label: string; value: string | null }> = []): ContractorSection {
  return { number, key, title, body: body.filter(Boolean), ...(items.length ? { items } : {}), ...(fields.length ? { fields } : {}) };
}

function scopeItems(scope: ContractorScope): string[] {
  return [
    ...scope.responsibilities.map((item) => `Responsibility: ${item}`),
    ...scope.assignedModules.map((item) => `Assigned module: ${item}`),
    ...scope.developmentAreas.map((item) => `Development area: ${item}`),
    ...scope.deliverables.map((item) => `Deliverable: ${item}`),
    ...scope.integrations.map((item) => `Integration: ${item}`),
    ...scope.documentationDuties.map((item) => `Documentation: ${item}`),
    ...scope.testingDuties.map((item) => `Testing: ${item}`),
    ...scope.handoverDuties.map((item) => `Handover: ${item}`),
  ];
}

function buildSections(scope: ContractorScope, legalFields: ContractorLegalField[], signatures: ContractorSignature[]): ContractorSection[] {
  const field = (key: string) => legalFields.find((item) => item.key === key)?.value || null;
  return [
    section(1, "parties", "Parties and engagement", ["This Agreement is between GrowxLabs and the individual contractor identified in the Agreement Information. The contractor is engaged as an independent contractor for defined project work. Nothing in this Agreement creates employment, partnership, agency, or a joint venture."], [], [{ label: "Engaging party", value: "GrowxLabs" }, { label: "Contractual status", value: "Independent Contractor" }, { label: "Project role", value: CONTRACTOR_ROLE }]),
    section(2, "project_context", "Project context", ["The contractor will perform assigned software development work as part of the GrowxLabs delivery team for the Trionyx India Private Limited project. The contractor is engaged by GrowxLabs and not directly by Trionyx."], ["The contractor must not independently negotiate commercial terms, accept payment, change scope, promise delivery dates, or create a separate commercial arrangement with Trionyx unless GrowxLabs expressly authorises it in writing."]),
    section(3, "scope", "Scope of work", ["The contractor shall perform only the work listed in Schedule A. No technical deliverable is invented or implied outside the completed Schedule A."], scopeItems(scope), [{ label: "Delivery dates", value: scope.deliveryDates || null }, { label: "Technical standards", value: scope.technicalStandards || null }, { label: "Repository or workspace", value: scope.repositoryOrWorkspace || null }, { label: "Acceptance criteria", value: scope.acceptanceCriteria || null }, { label: "Approved client requirements", value: scope.approvedClientProjectRequirements || null }]),
    section(4, "fee", "Professional fee and payment", ["The total professional fee is ₹30,000 (Indian Rupees Thirty Thousand Only). Payment is through UPI. Contractor payment is based on the contractor's own work completion and approval and is not dependent on Trionyx paying GrowxLabs."], contractorMilestones().map((milestone) => `${milestone.name}: ₹${milestone.amount.toLocaleString("en-IN")} — ${milestone.trigger}`), [{ label: "Total fee", value: "₹30,000" }, { label: "Payment method", value: "UPI" }, { label: "Tax treatment", value: field("taxTreatment") }]),
    section(5, "review_and_correction", "Review, acceptance, and correction", ["GrowxLabs may review submitted work before approving a milestone. Code submission alone does not automatically mean that a milestone is complete. Material defects or incomplete agreed work may be returned for reasonable correction without automatically becoming additional paid work. Additional features outside the approved scope require written change approval."]),
    section(6, "independent_contractor", "Independent contractor responsibilities", ["The contractor controls their working method subject to the project requirements and is responsible for applicable personal taxes. The contractor is not an employee, officer, or authorised agent of GrowxLabs and may not bind GrowxLabs contractually."]),
    section(7, "confidentiality", "Confidentiality", ["Confidential Information includes GrowxLabs and Trionyx information, source code, architecture, credentials, pricing, customer information, product information, private repositories, project plans, internal documentation, AI prompts and workflows, and other non-public project information."], ["Do not disclose or provide access to Confidential Information.", "Do not publish project screenshots, source code, architecture, client identity, project details, or portfolio content without written GrowxLabs approval.", "Do not upload confidential project information to unauthorised services.", "These obligations survive completion or termination."]),
    section(8, "client_confidentiality", "Client confidentiality and contact", ["Trionyx information received through GrowxLabs is confidential. The contractor must not independently contact Trionyx about commercial matters, solicit Trionyx for the same engagement, or create a competing arrangement for the assigned work without written GrowxLabs approval. This provision is limited to the active engagement and confidential information and is not a general non-compete restriction."]),
    section(9, "ip_assignment", "Project intellectual property", ["Project Work Product means original work created specifically under the approved contractor scope, including source code, custom modules, scripts, APIs, database structures, UI implementation, design files, documentation, technical specifications, configuration files, tests, deployment scripts, custom integrations, automation workflows, and project-specific technical materials.", "Subject to the applicable agreed payment condition and applicable law, the contractor assigns to GrowxLabs all transferable rights, title, and interest in the Project Work Product. GrowxLabs may use, modify, maintain, deploy, commercialise, sublicense where required for delivery, and provide the work to the client.", "Until the applicable assignment becomes effective, the contractor grants GrowxLabs a worldwide, royalty-free licence to review, test, maintain, secure, and hand over the submitted work. The contractor shall sign further documents reasonably required to confirm the assignment."]),
    section(10, "background_ip", "Contractor background IP", ["The contractor retains ownership of legitimate technology, tools, libraries, frameworks, and materials created independently before this engagement. Any Background IP incorporated into the project must be disclosed before use and the contractor must have the legal right to use it."], ["Approved Background IP must provide GrowxLabs sufficient rights to operate, maintain, modify, deploy, and deliver the project.", "Undisclosed proprietary contractor dependencies must not be inserted into the project."], [{ label: "Background IP disclosure", value: field("backgroundIp") }]),
    section(11, "growxlabs_background", "GrowxLabs background technology", ["The contractor receives no ownership interest in GrowxLabs technology merely by working on the project. GrowxLabs retains all rights in its existing and independently developed code, frameworks, libraries, templates, components, design systems, AI infrastructure, automation infrastructure, internal systems, development methods, reusable modules, business processes, and documentation."]),
    section(12, "third_party", "Third-party and open-source software", ["Normal open-source use is allowed when reviewed and documented. The contractor must disclose material dependencies, comply with licence terms, preserve required notices, and provide a dependency and licence list during handover."], ["Do not knowingly include pirated, improperly licensed, or unauthorised proprietary code.", "Do not include a dependency requiring disclosure of proprietary project source code unless GrowxLabs explicitly approves it."]),
    section(13, "ai_assisted_work", "AI-assisted development", ["Approved AI-assisted development tools may be used. The contractor remains responsible for reviewing generated work for security, functionality, accuracy, compatibility, licensing concerns, and confidential-information exposure. Confidential GrowxLabs or Trionyx information must not be submitted to unauthorised AI services."]),
    section(14, "security", "Security and credentials", ["The contractor shall use credentials only for authorised project work, never share credentials, never commit passwords, API keys, private keys, or secret tokens to source control, follow GrowxLabs access controls, report suspected exposure promptly, return or delete credentials when instructed, and not retain unauthorised copies of client secrets."]),
    section(15, "data", "Client and project data", ["Project and client data may only be used to perform the agreed work. The contractor must not sell it, reuse it for unrelated projects, train unrelated systems on it, copy it to unauthorised environments, or retain unnecessary copies. Data must be returned or securely deleted when requested, subject to lawful retention requirements."]),
    section(16, "repository", "Repository and source-code control", ["Project code must remain in GrowxLabs-authorised repositories or workspaces. GrowxLabs must retain administrative control over the final repository. The contractor must regularly commit and push agreed work. The only copy of the project must never remain exclusively on the contractor's personal machine."]),
    section(17, "handover", "Source-code and project handover", ["Final handover must include, where applicable, the latest source code, repository commits and branches, configuration files, database migrations, build instructions, API and technical documentation, testing information, known issues, dependency list, project assets, deployment information, required access transfer, and other assigned technical materials."]),
    section(18, "change_control", "Change control", ["A material increase in responsibilities must be documented in writing with the requested change, additional deliverables, additional fee if applicable, schedule impact, GrowxLabs approval, and contractor acceptance. Verbal discussions do not silently amend this Agreement."]),
    section(19, "no_client_commitments", "No direct client commercial commitments", ["The contractor must not independently quote fees to Trionyx, negotiate scope, promise delivery dates, change requirements, accept project payments, or create a separate commercial arrangement for the assigned work without written GrowxLabs authorisation."]),
    section(20, "subcontracting", "Subcontracting", ["The contractor must not subcontract or transfer responsibilities without prior written GrowxLabs approval. Any approved subcontractor must receive equivalent confidentiality, security, and IP obligations."]),
    section(21, "term_and_termination", "Term and termination", ["This Agreement begins on the Effective Date and continues until completion and acceptance of the scope or termination under this Agreement. Either party may terminate for a material breach that is not corrected within the approved cure period after written notice. GrowxLabs may terminate immediately for serious confidentiality breach, security misconduct, abandonment, fraud, intentional credential misuse, or serious project misconduct. The contractor may terminate for an uncured material breach by GrowxLabs."], [], [{ label: "Cure period", value: field("curePeriod") }]),
    section(22, "termination_payment", "Payment on termination", ["On termination, the contractor is entitled to payment for properly completed and accepted work up to the effective termination date. Uncompleted future milestones are not automatically payable. The contractor must return materials, surrender access, and continue complying with confidentiality and security obligations. Rights in paid or accepted Project Work Product remain effective according to the IP clause."]),
    section(23, "final_payment", "Final payment condition", ["The final ₹9,000 milestone becomes payable after final deliverables, corrections, current repository, source-code handover, documentation, assets, access, dependency information, GrowxLabs review, and applicable IP obligations are complete. GrowxLabs must not unreasonably withhold approval where the agreed work has been properly completed."]),
    section(24, "conflict", "Conflict of interest", ["The contractor may work for other organisations provided that doing so does not breach confidentiality, IP, security, client protections, or delivery commitments. Actual conflicts that may materially affect the project must be disclosed promptly."]),
    section(25, "publicity", "Publicity and portfolio use", ["Written GrowxLabs approval is required before using the Trionyx name, GrowxLabs confidential information, screenshots, source code, architecture, unreleased features, project results, or other project material in public marketing, social media, case studies, or portfolio content."]),
    section(26, "representations", "Representations", ["The contractor represents that they have authority to enter this Agreement, their original work will not knowingly infringe third-party rights, they will not knowingly provide stolen or unauthorised source code, they will disclose material third-party components, and they will follow agreed security requirements."]),
    section(27, "liability", "Liability", ["The parties must complete and approve the liability treatment before signing. No unlimited general liability is inserted by this draft. Separate treatment may be approved for fraud, intentional misconduct, serious credential misuse, confidentiality breach, or knowingly unauthorised IP infringement."], [], [{ label: "Approved liability cap", value: field("liabilityCap") }]),
    section(28, "law_and_disputes", "Governing law and disputes", ["This Agreement is governed by the laws of India. The dispute resolution method, jurisdiction, court or forum, and any arbitration seat or place must be completed and approved before signing."], [], [{ label: "Dispute forum and jurisdiction", value: field("disputeForum") }, { label: "Arbitration details", value: field("arbitrationDetails") }]),
    section(29, "notices", "Notices", ["Formal notices may be sent to the designated email addresses and physical addresses recorded below."], [], [{ label: "GrowxLabs notice address", value: field("growxlabsNoticeAddress") }, { label: "Contractor notice address", value: field("contractorAddress") }, { label: "Contractor notice email", value: field("contractorEmail") }]),
    section(30, "electronic_execution", "Entire agreement and electronic execution", ["This Agreement and its completed Schedule A represent the agreement for this contractor engagement. Changes must be documented in writing and accepted by both parties. Electronic execution records the agreement number, version, exact snapshot, document hash, signer identity, signature, consent, timestamp, and appropriate audit metadata. Typing a name into an editable document alone is not sufficient execution evidence."], [], [{ label: "Signatures recorded", value: signatures.length ? `${signatures.length} signature(s) recorded` : null }]),
  ];
}

function snapshotFromRow(row: JsonRecord, version: number, status: ContractorAgreementStatus, signatures: ContractorSignature[] = [], execution?: ContractorAgreementSnapshot["execution"]): ContractorAgreementSnapshot {
  const scope = scopeFrom(row.scope);
  const legalFields = legalFieldsFor(row, scope);
  const snapshot: ContractorAgreementSnapshot = {
    document: { title: "GrowxLabs Independent Contractor Agreement and IP Assignment", agreementNumber: clean(row.agreement_number), version, status, agreementDate: nullable(row.agreement_date), effectiveDate: nullable(row.effective_date), confidential: true },
    parties: { engagingParty: { name: "GrowxLabs", legalIdentity: legalFields.find((item) => item.key === "growxlabsLegalIdentity")?.value || null, noticeAddress: legalFields.find((item) => item.key === "growxlabsNoticeAddress")?.value || null }, contractor: { fullLegalName: nullable(row.contractor_full_legal_name), email: nullable(row.contractor_email), phone: nullable(row.contractor_phone), address: nullable(row.contractor_address), panOrTaxId: nullable(row.contractor_pan_or_tax_id), role: CONTRACTOR_ROLE, contractualStatus: "Independent Contractor" } },
    project: { projectReference: nullable(row.project_reference), clientProjectReference: nullable(row.client_project_reference), projectName: nullable(row.project_name), context: "GrowxLabs delivery work for the Trionyx India Private Limited project; the contractor is not directly engaged by Trionyx." },
    commercial: { totalFee: CONTRACTOR_TOTAL_FEE, currency: "INR", paymentMethod: "UPI", milestones: contractorMilestones() },
    scope,
    legalFields,
    sections: [],
    signatures,
    ...(execution ? { execution } : {}),
  };
  snapshot.sections = buildSections(scope, legalFields, signatures);
  return snapshot;
}

function signatureFromRow(row: JsonRecord): ContractorSignature {
  return { party: clean(row.party) as ContractorParty, fullLegalName: clean(row.full_legal_name), roleOrCapacity: clean(row.role_or_capacity), email: clean(row.email), phone: nullable(row.phone), address: nullable(row.address), panOrTaxId: nullable(row.pan_or_tax_id), signature: clean(row.signature), consentToElectronicExecution: Boolean(row.consent_to_electronic_execution), signedAt: clean(row.signed_at) };
}

async function getAgreement(id: string): Promise<JsonRecord> {
  const result = await supabaseAdmin.from("contractor_agreements").select("*").eq("id", id).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) return fail(404, "CONTRACTOR_AGREEMENT_NOT_FOUND", "Contractor agreement not found.");
  return result.data as JsonRecord;
}

async function currentVersion(agreement: JsonRecord): Promise<JsonRecord> {
  const result = agreement.current_version_id
    ? await supabaseAdmin.from("commercial_document_versions").select("*").eq("id", agreement.current_version_id).eq("document_type", "contractor_agreement").eq("document_id", agreement.id).maybeSingle()
    : await supabaseAdmin.from("commercial_document_versions").select("*").eq("document_type", "contractor_agreement").eq("document_id", agreement.id).order("version", { ascending: false }).limit(1).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) return fail(500, "CONTRACTOR_VERSION_MISSING", "Contractor agreement version is missing.");
  return result.data as JsonRecord;
}

async function activity(agreement: JsonRecord, actorId: string | null, actorType: string, eventType: string, metadata: JsonRecord = {}, versionId?: string) {
  const result = await supabaseAdmin.from("commercial_document_activity").insert({ document_type: "contractor_agreement", document_id: agreement.id, agreement_version_id: versionId || null, actor_id: actorId, actor_type: actorType, event_type: eventType, metadata }).select("id").single();
  if (result.error) throw new Error(result.error.message);
}

async function signaturesFor(agreementId: string, versionId: string): Promise<ContractorSignature[]> {
  const result = await supabaseAdmin.from("contractor_agreement_signatures").select("party,full_legal_name,role_or_capacity,email,phone,address,pan_or_tax_id,signature,consent_to_electronic_execution,signed_at").eq("agreement_id", agreementId).eq("agreement_version_id", versionId).order("signed_at", { ascending: true });
  if (result.error) throw new Error(result.error.message);
  return (result.data || []).map((row) => signatureFromRow(row as JsonRecord));
}

async function persistVersion(agreement: JsonRecord, version: number, status: ContractorAgreementStatus, actorId: string, signatures: ContractorSignature[] = [], execution?: ContractorAgreementSnapshot["execution"], rootPatch: JsonRecord = {}) {
  const snapshot = snapshotFromRow({ ...agreement, ...rootPatch }, version, status, signatures, execution);
  const hash = proposalContentHash(snapshot as unknown as Record<string, unknown>);
  const versionResult = await supabaseAdmin.from("commercial_document_versions").insert({ document_type: "contractor_agreement", document_id: agreement.id, version, snapshot, content_hash: hash, locked_at: new Date().toISOString(), client_visible: false, created_by: actorId }).select("id,version").single();
  if (versionResult.error) throw new Error(versionResult.error.message);
  const pdf = await renderContractorAgreementPdf(snapshot, "internal");
  const path = `agreements/independent-contractor/${snapshot.document.agreementNumber}-v${version}.pdf`;
  const upload = await supabaseAdmin.storage.from("documents").upload(path, pdf, { contentType: "application/pdf", upsert: true });
  if (upload.error) throw new Error(upload.error.message);
  const update = await supabaseAdmin.from("contractor_agreements").update({ ...rootPatch, status, version, current_version_id: versionResult.data.id, content_hash: hash, pdf_storage_path: path, pdf_status: "generated", pdf_generated_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", agreement.id).select("*").single();
  if (update.error) throw new Error(update.error.message);
  return { agreement: update.data as JsonRecord, version: versionResult.data as JsonRecord, snapshot, hash };
}

async function seedMilestones(agreementId: string, actorId: string) {
  const rows = contractorMilestones().map((milestone) => ({ agreement_id: agreementId, milestone_key: milestone.key, amount: milestone.amount, payment_method: "UPI", created_by: actorId }));
  const result = await supabaseAdmin.from("contractor_agreement_payments").upsert(rows, { onConflict: "agreement_id,milestone_key" });
  if (result.error) throw new Error(result.error.message);
}

export async function createContractorAgreement(actorId: string) {
  const existing = await supabaseAdmin.from("contractor_agreements").select("id").eq("agreement_number", CONTRACTOR_AGREEMENT_NUMBER).maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return getAdminContractorAgreement(String(existing.data.id));
  const inserted = await supabaseAdmin.from("contractor_agreements").insert({ agreement_number: CONTRACTOR_AGREEMENT_NUMBER, version: 1, status: "draft", project_role: CONTRACTOR_ROLE, total_fee: CONTRACTOR_TOTAL_FEE, currency: "INR", payment_method: "UPI", scope: emptyContractorScope(), legal_fields: defaultContractorLegalFields(), payment_milestones: contractorMilestones(), created_by: actorId }).select("*").single();
  if (inserted.error) throw new Error(inserted.error.message);
  await seedMilestones(String(inserted.data.id), actorId);
  const version = await persistVersion(inserted.data as JsonRecord, 1, "draft", actorId);
  await activity(version.agreement, actorId, "admin", "contractor_agreement_created", { agreementNumber: CONTRACTOR_AGREEMENT_NUMBER }, String(version.version.id));
  await recordAuditEvent({ actorId, action: "contractor_agreement.created", resourceType: "independent_contractor_agreement", resourceId: String(version.agreement.id), metadata: { agreementNumber: CONTRACTOR_AGREEMENT_NUMBER, version: 1 } });
  return getAdminContractorAgreement(String(version.agreement.id));
}

export async function listAdminContractorAgreements() {
  const result = await supabaseAdmin.from("contractor_agreements").select("id,agreement_number,status,version,contractor_full_legal_name,contractor_email,project_name,total_fee,payment_method,pdf_status,updated_at").order("updated_at", { ascending: false });
  if (result.error) throw new Error(result.error.message);
  return result.data || [];
}

export async function getAdminContractorAgreement(id: string) {
  const agreement = await getAgreement(id);
  const version = await currentVersion(agreement);
  const [payments, signatures, activityRows] = await Promise.all([
    supabaseAdmin.from("contractor_agreement_payments").select("id,milestone_key,amount,status,payment_method,payment_reference,approved_at,paid_at,notes,created_at,updated_at").eq("agreement_id", id).order("milestone_key", { ascending: true }),
    supabaseAdmin.from("contractor_agreement_signatures").select("id,party,full_legal_name,role_or_capacity,email,phone,address,pan_or_tax_id,signature,consent_to_electronic_execution,signed_at,audit_metadata,created_at").eq("agreement_id", id).order("signed_at", { ascending: true }),
    supabaseAdmin.from("commercial_document_activity").select("id,event_type,actor_type,metadata,created_at,agreement_version_id").eq("document_type", "contractor_agreement").eq("document_id", id).order("created_at", { ascending: false }),
  ]);
  for (const result of [payments, signatures, activityRows]) if (result.error) throw new Error(result.error.message);
  return { agreement: { id: agreement.id, agreementNumber: agreement.agreement_number, status: agreement.status, version: agreement.version, agreementDate: agreement.agreement_date, effectiveDate: agreement.effective_date, contractorName: agreement.contractor_full_legal_name, contractorEmail: agreement.contractor_email, projectName: agreement.project_name, projectRole: CONTRACTOR_ROLE, totalFee: CONTRACTOR_TOTAL_FEE, paymentMethod: "UPI", pdfStatus: agreement.pdf_status, pdfGeneratedAt: agreement.pdf_generated_at, sentAt: agreement.sent_at, viewedAt: agreement.viewed_at, contractorSignedAt: agreement.contractor_signed_at, countersignedAt: agreement.countersigned_at, handoverConfirmedAt: agreement.handover_confirmed_at, completedAt: agreement.completed_at, terminatedAt: agreement.terminated_at }, snapshot: version.snapshot as ContractorAgreementSnapshot, version: { id: version.id, version: version.version, contentHash: version.content_hash }, payments: payments.data || [], signatures: signatures.data || [], activity: activityRows.data || [] };
}

type DraftInput = {
  agreementDate?: unknown;
  effectiveDate?: unknown;
  projectReference?: unknown;
  clientProjectReference?: unknown;
  projectName?: unknown;
  contractorFullLegalName?: unknown;
  contractorEmail?: unknown;
  contractorPhone?: unknown;
  contractorAddress?: unknown;
  contractorPanOrTaxId?: unknown;
  scope?: unknown;
  legalFields?: unknown;
};

export async function updateContractorAgreementDraft(id: string, input: DraftInput, actorId: string) {
  const agreement = await getAgreement(id);
  if (!["draft", "internal_review"].includes(clean(agreement.status))) return fail(409, "AGREEMENT_LOCKED", "Only a draft or internal-review agreement can be edited.");
  const scope = scopeFrom(input.scope ?? agreement.scope);
  const manualValues = manualLegalValues(input.legalFields);
  const legalFields = storedLegalFields(manualValues, agreement.legal_fields);
  const patch: JsonRecord = { agreement_date: nullable(input.agreementDate ?? agreement.agreement_date), effective_date: nullable(input.effectiveDate ?? agreement.effective_date), project_reference: nullable(input.projectReference ?? agreement.project_reference), client_project_reference: nullable(input.clientProjectReference ?? agreement.client_project_reference), project_name: nullable(input.projectName ?? agreement.project_name), contractor_full_legal_name: nullable(input.contractorFullLegalName ?? agreement.contractor_full_legal_name), contractor_email: nullable(input.contractorEmail ?? agreement.contractor_email)?.toLowerCase() || null, contractor_phone: nullable(input.contractorPhone ?? agreement.contractor_phone), contractor_address: nullable(input.contractorAddress ?? agreement.contractor_address), contractor_pan_or_tax_id: nullable(input.contractorPanOrTaxId ?? agreement.contractor_pan_or_tax_id), scope, legal_fields: legalFields, payment_milestones: contractorMilestones(), total_fee: CONTRACTOR_TOTAL_FEE, currency: "INR", payment_method: "UPI" };
  const next = await persistVersion(agreement, Number(agreement.version || 1) + 1, "draft", actorId, [], undefined, patch);
  await activity(next.agreement, actorId, "admin", "contractor_agreement_version_created", { agreementNumber: agreement.agreement_number, version: next.version.version }, String(next.version.id));
  await recordAuditEvent({ actorId, action: "contractor_agreement.version_created", resourceType: "independent_contractor_agreement", resourceId: id, metadata: { agreementNumber: agreement.agreement_number, version: next.version.version } });
  return getAdminContractorAgreement(id);
}

function assertStatus(actual: unknown, expected: ContractorAgreementStatus, action: string) {
  if (actual !== expected) return fail(409, "INVALID_TRANSITION", `Action '${action}' is not allowed from status '${String(actual)}'.`);
}

async function assertReadyForSigning(agreement: JsonRecord) {
  const version = await currentVersion(agreement);
  const snapshot = version.snapshot as ContractorAgreementSnapshot;
  if (!legalFieldsComplete(snapshot)) return fail(409, "LEGAL_FIELDS_REQUIRED", "Complete all contractor, scope, tax, liability, notice, and dispute fields before approving this agreement for signing.");
  if (!clean(agreement.contractor_email)) return fail(409, "CONTRACTOR_EMAIL_REQUIRED", "A contractor email is required before signing.");
  return { version, snapshot };
}

export async function contractorAgreementAction(id: string, action: string, actorId: string, comment?: string) {
  const agreement = await getAgreement(id);
  const now = new Date().toISOString();
  if (action === "submit_review") {
    assertStatus(agreement.status, "draft", action);
    const update = await supabaseAdmin.from("contractor_agreements").update({ status: "internal_review", submitted_for_review_at: now, updated_at: now }).eq("id", id).eq("status", "draft").select("*").single();
    if (update.error) throw new Error(update.error.message);
    await activity(update.data as JsonRecord, actorId, "admin", "contractor_agreement_submitted_for_review", { comment: comment || null });
  } else if (action === "request_changes") {
    assertStatus(agreement.status, "internal_review", action);
    const update = await supabaseAdmin.from("contractor_agreements").update({ status: "draft", updated_at: now }).eq("id", id).eq("status", "internal_review").select("*").single();
    if (update.error) throw new Error(update.error.message);
    await activity(update.data as JsonRecord, actorId, "admin", "contractor_agreement_changes_requested", { comment: comment || null });
  } else if (action === "approve_for_signing") {
    assertStatus(agreement.status, "internal_review", action);
    await assertReadyForSigning(agreement);
    const update = await supabaseAdmin.from("contractor_agreements").update({ status: "approved_for_signing", approved_for_signing_at: now, updated_at: now }).eq("id", id).eq("status", "internal_review").select("*").single();
    if (update.error) throw new Error(update.error.message);
    await activity(update.data as JsonRecord, actorId, "admin", "contractor_agreement_approved_for_signing", {});
  } else if (action === "send") {
    return sendContractorAgreement(id, actorId);
  } else if (action === "confirm_handover") {
    assertStatus(agreement.status, "fully_executed", action);
    const update = await supabaseAdmin.from("contractor_agreements").update({ handover_confirmed_at: now, handover_confirmed_by: actorId, handover_notes: comment || null, updated_at: now }).eq("id", id).select("*").single();
    if (update.error) throw new Error(update.error.message);
    await activity(update.data as JsonRecord, actorId, "admin", "contractor_handover_confirmed", { notes: comment || null });
    await recordAuditEvent({ actorId, action: "contractor_agreement.handover_confirmed", resourceType: "independent_contractor_agreement", resourceId: id, metadata: { agreementNumber: agreement.agreement_number } });
  } else if (action === "complete") {
    assertStatus(agreement.status, "fully_executed", action);
    if (!agreement.handover_confirmed_at) return fail(409, "HANDOVER_REQUIRED", "Confirm final handover before completing the agreement.");
    const update = await supabaseAdmin.from("contractor_agreements").update({ status: "completed", completed_at: now, updated_at: now }).eq("id", id).eq("status", "fully_executed").select("*").single();
    if (update.error) throw new Error(update.error.message);
    await activity(update.data as JsonRecord, actorId, "admin", "contractor_agreement_completed", {});
    await recordAuditEvent({ actorId, action: "contractor_agreement.completed", resourceType: "independent_contractor_agreement", resourceId: id, metadata: { agreementNumber: agreement.agreement_number } });
  } else if (action === "terminate") {
    if (!["draft", "internal_review", "approved_for_signing", "sent_to_contractor", "viewed", "contractor_signed", "fully_executed", "completed"].includes(clean(agreement.status))) return fail(409, "INVALID_TRANSITION", "This agreement cannot be terminated from its current state.");
    const update = await supabaseAdmin.from("contractor_agreements").update({ status: "terminated", terminated_at: now, updated_at: now }).eq("id", id).select("*").single();
    if (update.error) throw new Error(update.error.message);
    await activity(update.data as JsonRecord, actorId, "admin", "contractor_agreement_terminated", { comment: comment || null });
    await recordAuditEvent({ actorId, action: "contractor_agreement.terminated", resourceType: "independent_contractor_agreement", resourceId: id, metadata: { agreementNumber: agreement.agreement_number } });
  } else {
    return fail(400, "UNKNOWN_ACTION", `Unknown contractor agreement action '${action}'.`);
  }
  return getAdminContractorAgreement(id);
}

async function sendContractorAgreement(id: string, actorId: string) {
  const agreement = await getAgreement(id);
  assertStatus(agreement.status, "approved_for_signing", "send");
  const { version } = await assertReadyForSigning(agreement);
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabaseAdmin.from("contractor_signing_invitations").update({ revoked_at: new Date().toISOString() }).eq("agreement_id", id).is("used_at", null).is("revoked_at", null);
  const invitation = await supabaseAdmin.from("contractor_signing_invitations").insert({ agreement_id: id, agreement_version_id: version.id, email: clean(agreement.contractor_email).toLowerCase(), token_hash: tokenHash, expires_at: expiresAt, sent_at: new Date().toISOString(), created_by: actorId }).select("id").single();
  if (invitation.error) throw new Error(invitation.error.message);
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://growxlabs.tech";
  const signingUrl = `${base}/contractor-agreements/sign/${encodeURIComponent(String(agreement.agreement_number))}?token=${encodeURIComponent(token)}`;
  const displayName = clean(agreement.contractor_full_legal_name) || "Contractor";
  const body = GrowXLabsEmailLayout({ context: "CONTRACTOR AGREEMENT", reference: String(agreement.agreement_number), content: `<p>Hello ${escapeGrowXLabsEmailHtml(displayName)},</p><p>Your GrowxLabs Independent Contractor Agreement and IP Assignment is ready for secure review and electronic signing.</p>${EmailAction("Review and sign agreement", signingUrl)}<p>This signing link expires on ${escapeGrowXLabsEmailHtml(new Date(expiresAt).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Kolkata" }))}.</p>` });
  const message = await enqueueCommunication({ channel: "email", messageType: "contractor_agreement_available", subject: `Contractor Agreement ${agreement.agreement_number} from GrowxLabs`, body, email: clean(agreement.contractor_email).toLowerCase(), displayName, relatedEntityType: "contractor_agreement", relatedEntityId: agreement.id, variables: { agreementNumber: agreement.agreement_number, agreementVersion: version.version } }, actorId);
  const now = new Date().toISOString();
  const update = await supabaseAdmin.from("contractor_agreements").update({ status: "sent_to_contractor", sent_at: now, updated_at: now }).eq("id", id).eq("status", "approved_for_signing").select("*").single();
  if (update.error) throw new Error(update.error.message);
  await activity(update.data as JsonRecord, actorId, "admin", "contractor_agreement_sent", { communicationMessageId: message.id, invitationId: invitation.data.id, expiresAt }, String(version.id));
  await recordAuditEvent({ actorId, action: "contractor_agreement.sent", resourceType: "independent_contractor_agreement", resourceId: id, metadata: { agreementNumber: agreement.agreement_number, version: version.version } });
  return { ...(await getAdminContractorAgreement(id)), signingUrl };
}

type SigningContext = { invitation: JsonRecord; agreement: JsonRecord; version: JsonRecord; snapshot: ContractorAgreementSnapshot };

async function signingContext(agreementNumber: string, token: string, track = true): Promise<SigningContext> {
  if (!token || token.length < 32 || token.length > 200) return fail(403, "SIGNING_LINK_INVALID", "This signing link is invalid.");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const invitationResult = await supabaseAdmin.from("contractor_signing_invitations").select("*").eq("token_hash", tokenHash);
  if (invitationResult.error) throw new Error(invitationResult.error.message);
  const invitation = (invitationResult.data || [])[0] as JsonRecord | undefined;
  if (!invitation || invitation.revoked_at || invitation.used_at || new Date(String(invitation.expires_at)).getTime() <= Date.now()) return fail(403, "SIGNING_LINK_EXPIRED", "This signing link is invalid, expired, revoked, or already used.");
  const agreement = await getAgreement(String(invitation.agreement_id));
  if (agreement.agreement_number !== agreementNumber) return fail(404, "CONTRACTOR_AGREEMENT_NOT_FOUND", "Contractor agreement not found.");
  if (!["sent_to_contractor", "viewed"].includes(clean(agreement.status))) return fail(409, "SIGNING_UNAVAILABLE", "This agreement is no longer available for contractor signing.");
  const version = await supabaseAdmin.from("commercial_document_versions").select("*").eq("id", invitation.agreement_version_id).eq("document_type", "contractor_agreement").eq("document_id", agreement.id).maybeSingle();
  if (version.error) throw new Error(version.error.message);
  if (!version.data) return fail(409, "SIGNING_VERSION_MISSING", "The signing version is unavailable.");
  if (track) {
    const now = new Date().toISOString();
    await supabaseAdmin.from("contractor_signing_invitations").update({ viewed_at: invitation.viewed_at || now }).eq("id", invitation.id);
    if (agreement.status === "sent_to_contractor") {
      const updated = await supabaseAdmin.from("contractor_agreements").update({ status: "viewed", viewed_at: now, updated_at: now }).eq("id", agreement.id).eq("status", "sent_to_contractor").select("*").single();
      if (updated.error) throw new Error(updated.error.message);
      await activity(updated.data as JsonRecord, null, "contractor", "contractor_agreement_viewed", { agreementNumber: agreement.agreement_number }, String(version.data.id));
      await recordAuditEvent({ actorId: null, action: "contractor_agreement.viewed", resourceType: "independent_contractor_agreement", resourceId: String(agreement.id), metadata: { agreementNumber: agreement.agreement_number } });
    }
  }
  const snapshot = version.data.snapshot as ContractorAgreementSnapshot;
  return { invitation, agreement, version: version.data as JsonRecord, snapshot };
}

export async function getContractorSigningAgreement(agreementNumber: string, token: string) {
  const context = await signingContext(agreementNumber, token, true);
  return { agreementNumber: context.agreement.agreement_number, version: context.version.version, status: context.agreement.status === "sent_to_contractor" ? "viewed" : context.agreement.status, snapshot: context.snapshot, expiresAt: context.invitation.expires_at };
}

export type ContractorSignatureInput = { fullLegalName: string; roleOrCapacity: string; email: string; phone?: string; address?: string; panOrTaxId?: string; signature: string; consentToElectronicExecution: boolean };

function validateSignature(input: ContractorSignatureInput, requireContact: boolean) {
  for (const key of ["fullLegalName", "roleOrCapacity", "email", "signature"] as const) if (!clean(input[key])) return fail(400, "SIGNATORY_REQUIRED", `${key} is required.`);
  if (requireContact && !clean(input.phone)) return fail(400, "SIGNATORY_REQUIRED", "phone is required.");
  if (requireContact && !clean(input.address)) return fail(400, "SIGNATORY_REQUIRED", "address is required.");
  if (!input.consentToElectronicExecution) return fail(400, "EXECUTION_CONSENT_REQUIRED", "Consent to electronic execution is required.");
  if (!/^\S+@\S+\.\S+$/.test(clean(input.email))) return fail(400, "SIGNATORY_EMAIL_INVALID", "A valid signer email is required.");
}

export async function recordContractorSignature(agreementNumber: string, token: string, input: ContractorSignatureInput, requestMetadata: JsonRecord = {}) {
  validateSignature(input, true);
  const context = await signingContext(agreementNumber, token, false);
  if (clean(input.email).toLowerCase() !== clean(context.invitation.email).toLowerCase()) return fail(403, "SIGNER_EMAIL_MISMATCH", "The signer email must match the secure invitation.");
  const insert = await supabaseAdmin.from("contractor_agreement_signatures").insert({ agreement_id: context.agreement.id, agreement_version_id: context.version.id, party: "contractor", full_legal_name: clean(input.fullLegalName), role_or_capacity: clean(input.roleOrCapacity), email: clean(input.email).toLowerCase(), phone: clean(input.phone), address: clean(input.address), pan_or_tax_id: nullable(input.panOrTaxId), signature: clean(input.signature), consent_to_electronic_execution: input.consentToElectronicExecution, actor_id: null, audit_metadata: requestMetadata }).select("id").single();
  if (insert.error?.code === "23505") return fail(409, "SIGNATURE_ALREADY_RECORDED", "A contractor signature is already recorded for this agreement version.");
  if (insert.error) throw new Error(insert.error.message);
  const now = new Date().toISOString();
  const update = await supabaseAdmin.from("contractor_agreements").update({ status: "contractor_signed", contractor_signed_at: now, updated_at: now }).eq("id", context.agreement.id).in("status", ["sent_to_contractor", "viewed"]).select("*").single();
  if (update.error) throw new Error(update.error.message);
  await supabaseAdmin.from("contractor_signing_invitations").update({ used_at: now }).eq("id", context.invitation.id);
  await activity(update.data as JsonRecord, null, "contractor", "contractor_agreement_signed", { agreementNumber, version: context.version.version }, String(context.version.id));
  await recordAuditEvent({ actorId: null, action: "contractor_agreement.contractor_signed", resourceType: "independent_contractor_agreement", resourceId: String(context.agreement.id), metadata: { agreementNumber, version: context.version.version, userAgent: requestMetadata.userAgent || null } });
  return { ok: true, status: "contractor_signed", message: "Your signed agreement has been submitted for GrowxLabs countersignature." };
}

export async function recordGrowxLabsCountersignature(id: string, input: ContractorSignatureInput, actorId: string, requestMetadata: JsonRecord = {}) {
  validateSignature(input, false);
  const agreement = await getAgreement(id);
  assertStatus(agreement.status, "contractor_signed", "countersign");
  const version = await currentVersion(agreement);
  const existing = await signaturesFor(id, String(version.id));
  if (!existing.some((signature) => signature.party === "contractor")) return fail(409, "CONTRACTOR_SIGNATURE_REQUIRED", "The contractor signature is required before countersigning.");
  const insert = await supabaseAdmin.from("contractor_agreement_signatures").insert({ agreement_id: id, agreement_version_id: version.id, party: "growxlabs", full_legal_name: clean(input.fullLegalName), role_or_capacity: clean(input.roleOrCapacity), email: clean(input.email).toLowerCase(), phone: clean(input.phone), address: clean(input.address), pan_or_tax_id: nullable(input.panOrTaxId), signature: clean(input.signature), consent_to_electronic_execution: input.consentToElectronicExecution, actor_id: actorId, audit_metadata: { ...requestMetadata, actorId } }).select("id").single();
  if (insert.error?.code === "23505") return fail(409, "SIGNATURE_ALREADY_RECORDED", "A GrowxLabs countersignature is already recorded for this agreement version.");
  if (insert.error) throw new Error(insert.error.message);
  const signatures = await signaturesFor(id, String(version.id));
  const executedAt = new Date().toISOString();
  const signedSnapshot = snapshotFromRow(agreement, Number(version.version) + 1, "fully_executed", signatures);
  const hashBasis: ContractorAgreementSnapshot = { ...signedSnapshot, execution: { executedAt, documentHash: "", signatures } };
  const finalHash = proposalContentHash(hashBasis as unknown as Record<string, unknown>);
  const finalSnapshot: ContractorAgreementSnapshot = { ...signedSnapshot, execution: { executedAt, documentHash: finalHash, signatures } };
  finalSnapshot.sections = buildSections(finalSnapshot.scope, finalSnapshot.legalFields, signatures);
  const versionResult = await supabaseAdmin.from("commercial_document_versions").insert({ document_type: "contractor_agreement", document_id: id, version: Number(version.version) + 1, snapshot: finalSnapshot, content_hash: finalHash, locked_at: executedAt, client_visible: false, created_by: actorId }).select("id,version").single();
  if (versionResult.error) throw new Error(versionResult.error.message);
  const pdf = await renderContractorAgreementPdf(finalSnapshot, "executed");
  const path = `agreements/independent-contractor/${agreement.agreement_number}-v${versionResult.data.version}.pdf`;
  const upload = await supabaseAdmin.storage.from("documents").upload(path, pdf, { contentType: "application/pdf", upsert: true });
  if (upload.error) throw new Error(upload.error.message);
  const update = await supabaseAdmin.from("contractor_agreements").update({ status: "fully_executed", version: versionResult.data.version, current_version_id: versionResult.data.id, executed_version_id: versionResult.data.id, content_hash: finalHash, pdf_storage_path: path, pdf_status: "generated", pdf_generated_at: executedAt, countersigned_at: executedAt, updated_at: executedAt }).eq("id", id).eq("status", "contractor_signed").select("*").single();
  if (update.error) throw new Error(update.error.message);
  await activity(update.data as JsonRecord, actorId, "admin", "contractor_agreement_countersigned", { agreementNumber: agreement.agreement_number, executed: true }, String(versionResult.data.id));
  await recordAuditEvent({ actorId, action: "contractor_agreement.fully_executed", resourceType: "independent_contractor_agreement", resourceId: id, metadata: { agreementNumber: agreement.agreement_number, version: versionResult.data.version, contentHash: finalHash } });
  return getAdminContractorAgreement(id);
}

export async function recordContractorPayment(id: string, milestoneKey: string, status: "approved" | "paid", paymentReference: string | undefined, notes: string | undefined, actorId: string) {
  if (!["milestone_1", "milestone_2", "milestone_3"].includes(milestoneKey)) return fail(400, "MILESTONE_INVALID", "Unknown contractor payment milestone.");
  if (status === "paid" && !clean(paymentReference)) return fail(400, "PAYMENT_REFERENCE_REQUIRED", "A UPI payment reference is required when recording a payment.");
  const agreement = await getAgreement(id);
  if (!["fully_executed", "completed"].includes(clean(agreement.status))) return fail(409, "PAYMENT_UNAVAILABLE", "Contractor payments can be recorded after the agreement is fully executed.");
  const now = new Date().toISOString();
  const patch: JsonRecord = { status, payment_reference: nullable(paymentReference), notes: nullable(notes), updated_by: actorId, updated_at: now, ...(status === "approved" || status === "paid" ? { approved_at: now } : {}), ...(status === "paid" ? { paid_at: now } : {}) };
  const update = await supabaseAdmin.from("contractor_agreement_payments").update(patch).eq("agreement_id", id).eq("milestone_key", milestoneKey).select("*").single();
  if (update.error) throw new Error(update.error.message);
  await activity(agreement, actorId, "admin", status === "paid" ? "contractor_payment_recorded" : "contractor_milestone_approved", { milestoneKey, amount: update.data.amount, paymentReference: paymentReference || null });
  await recordAuditEvent({ actorId, action: status === "paid" ? "contractor_agreement.payment_recorded" : "contractor_agreement.milestone_approved", resourceType: "independent_contractor_agreement", resourceId: id, metadata: { agreementNumber: agreement.agreement_number, milestoneKey, amount: update.data.amount, paymentReference: paymentReference || null } });
  return getAdminContractorAgreement(id);
}

export async function getContractorAgreementPdf(id: string) {
  const data = await getAdminContractorAgreement(id);
  return { ...data, pdf: await renderContractorAgreementPdf(data.snapshot, data.agreement.status === "fully_executed" || data.agreement.status === "completed" ? "executed" : "internal") };
}
