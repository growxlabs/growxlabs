import "server-only";

import crypto from "node:crypto";
import { jsPDF } from "jspdf";

export const GROWXLABS_OFFER_SIGNATORY = {
  name: "Pujala Sai Varshith",
  title: "Authorized Signatory",
  company: "GrowXLabs",
} as const;

export type OfferSnapshot = {
  candidateName: string;
  candidateAddress?: string | null;
  title: string;
  departmentName: string;
  reportingManager?: string | null;
  employmentType: string;
  workLocation: string;
  joiningDate: string;
  salaryAmount: number;
  salaryCurrency: string;
  fixedAmount?: number | null;
  fixedFrequency?: string | null;
  probationDays: number;
  noticePeriodDays: number;
  expiresAt: string;
  offerReference?: string;
  applicationReference?: string;
  version?: number;
  compensationModel?: string;
  stipendPeriod?: string | null;
  incentiveType?: string | null;
  incentiveValue?: number | null;
  incentiveValueType?: "percentage" | "fixed_amount" | null;
  incentiveStructure?: string | null;
  paymentTerms?: string | null;
  compensationNotes?: string | null;
  reviewPeriodDays?: number | null;
  postReviewCompensationType?: string | null;
  postReviewFixedAmount?: number | null;
  postReviewFixedFrequency?: string | null;
  signatoryName?: string;
  signatoryTitle?: string;
  acceptedAt?: string | null;
  offerTermTemplate?: {
    id: string;
    versionId: string;
    name: string;
    version: number;
    engagementType: string;
  };
  terms: {
    workingTerms: string;
    confidentialityIp: string;
    termination: string;
    acceptanceInstructions: string;
  };
};

export function missingOfferInputs(value: Partial<OfferSnapshot>) {
  const missing: string[] = [];
  const required: Array<[keyof OfferSnapshot, string]> = [
    ["candidateName", "Candidate name"],
    ["title", "Designation"],
    ["departmentName", "Department"],
    ["employmentType", "Employment type"],
    ["workLocation", "Work location"],
    ["joiningDate", "Joining date"],
    ["probationDays", "Probation"],
    ["noticePeriodDays", "Notice period"],
    ["expiresAt", "Offer validity"],
  ];
  for (const [key, label] of required)
    if (
      value[key] === undefined ||
      value[key] === null ||
      value[key] === "" ||
      (key === "salaryAmount" && Number(value[key]) < 0)
    )
      missing.push(label);
  const terms = value.terms || ({} as OfferSnapshot["terms"]);
  if (!value.offerTermTemplate?.versionId)
    missing.push("Approved offer terms template");
  if (!value.compensationModel?.trim()) missing.push("Compensation type");
  if (/fixed/i.test(value.compensationModel || "") && !(value.fixedAmount ?? value.salaryAmount) && value.fixedAmount !== 0) missing.push("Fixed compensation amount");
  if (/incentive/i.test(value.compensationModel || "")) {
    if (!value.incentiveStructure?.trim()) missing.push("Incentive basis");
    if (!value.incentiveValueType) missing.push("Incentive value type");
    if (value.incentiveValue == null) missing.push("Incentive value");
  }
  if (!terms.workingTerms?.trim()) missing.push("Approved working terms");
  if (!terms.confidentialityIp?.trim())
    missing.push("Approved confidentiality / IP wording");
  if (!terms.termination?.trim())
    missing.push("Approved notice / termination wording");
  if (!terms.acceptanceInstructions?.trim())
    missing.push("Acceptance instructions");
  return missing;
}

export function generateOfferPdf(snapshot: OfferSnapshot, issuedAt: Date) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const left = 64,
    right = 531,
    bottom = 748;
  let y = 54;
  const date = (value: string | Date) =>
    new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  const ensure = (height: number) => {
    if (y + height > bottom) {
      doc.addPage();
      y = 58;
    }
  };
  const text = (
    value: string,
    size = 10,
    bold = false,
    color = [31, 41, 55],
  ) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const rows = doc.splitTextToSize(value, right - left);
    ensure(rows.length * (size + 4) + 8);
    doc.text(rows, left, y);
    y += rows.length * (size + 4);
  };
  const metadata = (value: string) => {
    doc.setFont("courier", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(90, 101, 115);
    const wrapped = doc.splitTextToSize(value, right - left);
    ensure(wrapped.length * 12 + 8);
    doc.text(wrapped, left, y);
    y += wrapped.length * 12;
  };
  const rule = (gap = 16) => {
    ensure(gap + 1);
    doc.setDrawColor(210, 216, 224);
    doc.setLineWidth(0.6);
    doc.line(left, y, right, y);
    y += gap;
  };
  const section = (heading: string) => {
    ensure(38);
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(8, 55, 92);
    doc.text(heading.toUpperCase(), left, y);
    y += 8;
    doc.setDrawColor(8, 55, 92);
    doc.setLineWidth(1);
    doc.line(left, y, right, y);
    y += 17;
  };
  const rows = (items: Array<[string, string]>) => {
    const labelWidth = 150;
    items.forEach(([label, value]) => {
      const wrapped = doc.splitTextToSize(
        value || "Not specified",
        right - left - labelWidth - 10,
      );
      ensure(Math.max(22, wrapped.length * 13) + 5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(90, 101, 115);
      doc.text(label.toUpperCase(), left, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      doc.text(wrapped, left + labelWidth, y);
      y += Math.max(22, wrapped.length * 13);
      doc.setDrawColor(225, 229, 234);
      doc.line(left, y - 8, right, y - 8);
    });
  };
  doc.setFillColor(8, 55, 92);
  doc.rect(0, 0, 595, 9, "F");
  text("GROWXLABS", 20, true, [8, 55, 92]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(90, 101, 115);
  doc.text("People & Culture  |  growxlabs.tech", right, 58, { align: "right" });
  y += 8;
  rule(26);
  text("OFFER OF ENGAGEMENT", 17, true, [31, 41, 55]);
  y += 3;
  metadata(`PRIVATE & CONFIDENTIAL  |  ${date(issuedAt).toUpperCase()}`);
  y += 10;
  rows([
    ["Offer reference", snapshot.offerReference || "GrowXLabs offer"],
    ["Application reference", snapshot.applicationReference || "—"],
  ]);
  y += 8;
  rule(22);
  text(snapshot.candidateName, 12, true, [31, 41, 55]);
  if (snapshot.candidateAddress) {
    y += 3;
    text(snapshot.candidateAddress, 9, false, [90, 101, 115]);
  }
  y += 5;
  text(
    `Subject: Offer of Engagement — ${snapshot.title}`,
    12,
    true,
    [8, 55, 92],
  );
  y += 10;
  text(`Dear ${snapshot.candidateName},`, 10.5);
  y += 7;
  const engagement = /intern/i.test(snapshot.employmentType)
    ? "internship engagement"
    : "employment";
  text(
    `We are pleased to confirm this GrowXLabs ${engagement} offer for the position of ${snapshot.title}, subject to the approved terms set out in this letter.`,
    10.5,
  );
  y += 8;
  section("Position and engagement details");
  rows([
    ["Position", snapshot.title],
    ["Department", snapshot.departmentName],
    ["Engagement", snapshot.employmentType],
    ["Reporting manager", snapshot.reportingManager || "To be assigned"],
    ["Work location", snapshot.workLocation],
    ["Joining date", date(snapshot.joiningDate)],
  ]);
  section("Compensation and incentives");
  const compensation =
    snapshot.compensationModel ||
    (snapshot.salaryAmount > 0
      ? "Fixed compensation"
      : "Incentive-based engagement");
  rows([
    ["Compensation model", compensation],
    ...(snapshot.fixedAmount != null && snapshot.fixedAmount > 0
      ? [
          [
            "Fixed amount",
            `${snapshot.salaryCurrency} ${snapshot.fixedAmount.toLocaleString("en-IN")}${snapshot.fixedFrequency ? ` per ${snapshot.fixedFrequency}` : ""}`,
          ] as [string, string],
        ]
      : []),
    ...(snapshot.stipendPeriod
      ? [["Stipend period", snapshot.stipendPeriod] as [string, string]]
      : []),
    ...(snapshot.incentiveType
      ? [["Incentive type", snapshot.incentiveType] as [string, string]]
      : []),
    ...(snapshot.incentiveValue != null
      ? [["Incentive value", snapshot.incentiveValueType === "percentage" ? `${snapshot.incentiveValue}%` : `${snapshot.salaryCurrency} ${snapshot.incentiveValue.toLocaleString("en-IN")}`] as [string, string]]
      : []),
    ...(snapshot.incentiveStructure
      ? [
          ["Incentive structure", snapshot.incentiveStructure] as [
            string,
            string,
          ],
        ]
      : []),
    ...(snapshot.salaryAmount === 0 && !snapshot.incentiveStructure
      ? [["Incentive structure", "See the approved Working Terms section"] as [string, string]]
      : []),
    ...(snapshot.paymentTerms
      ? [["Payment terms", snapshot.paymentTerms] as [string, string]]
      : []),
    ...(snapshot.compensationNotes
      ? [["Notes", snapshot.compensationNotes] as [string, string]]
      : []),
    ...(snapshot.salaryAmount === 0 && !snapshot.paymentTerms
      ? [["Fixed stipend", "Not applicable"] as [string, string]]
      : []),
    ...(snapshot.reviewPeriodDays != null ? [["First-month review", `${snapshot.reviewPeriodDays} days`] as [string, string]] : []),
    ...(snapshot.postReviewFixedAmount != null ? [["From second month", `${snapshot.salaryCurrency} ${snapshot.postReviewFixedAmount.toLocaleString("en-IN")} per ${snapshot.postReviewFixedFrequency || "month"} + applicable performance incentives`] as [string, string]] : []),
  ]);
  section("Employment terms");
  rows([
    ["Probation", `${snapshot.probationDays} days`],
    ["Notice period", `${snapshot.noticePeriodDays} days`],
    ["Offer valid until", date(snapshot.expiresAt)],
  ]);
  section("Confidentiality and intellectual property");
  text(snapshot.terms.confidentialityIp, 10.5);
  y += 5;
  section("Notice and discontinuation");
  text(snapshot.terms.termination, 10.5);
  y += 5;
  section("Working terms");
  text(snapshot.terms.workingTerms, 10.5);
  y += 5;
  section("Acceptance of offer");
  text(snapshot.terms.acceptanceInstructions, 10.5);
  y += 10;
  ensure(125);
  section("For GrowXLabs");
  y += 28;
  doc.setDrawColor(70, 80, 90);
  doc.line(left, y, left + 170, y);
  y += 17;
  text(snapshot.signatoryName || GROWXLABS_OFFER_SIGNATORY.name, 10, true);
  text(
    snapshot.signatoryTitle || GROWXLABS_OFFER_SIGNATORY.title,
    9,
    false,
    [90, 101, 115],
  );
  text(GROWXLABS_OFFER_SIGNATORY.company, 9, false, [90, 101, 115]);
  text(`Date: ${date(issuedAt)}`, 9, false, [90, 101, 115]);
  section("Candidate acceptance");
  text(
    snapshot.acceptedAt
      ? `Accepted digitally by ${snapshot.candidateName} on ${date(snapshot.acceptedAt)}. This acceptance is recorded against the immutable offer version shown above.`
      : "I confirm that I have reviewed and accept the terms of this offer.",
    10.5,
  );
  y += 18;
  rows([
    ["Candidate", snapshot.candidateName],
    [
      "Signature",
      snapshot.acceptedAt
        ? "Digital acceptance recorded"
        : "____________________________",
    ],
    [
      "Date",
      snapshot.acceptedAt
        ? date(snapshot.acceptedAt)
        : "____________________________",
    ],
  ]);
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page++) {
    doc.setPage(page);
    doc.setDrawColor(210, 216, 224);
    doc.line(left, 782, right, 782);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 120, 130);
    doc.text(
      `GrowXLabs  |  growxlabs.tech  |  ${snapshot.offerReference || "Offer"}  |  Private & Confidential`,
      left,
      798,
    );
    doc.text(`PAGE ${page} / ${total}`, right, 798, { align: "right" });
  }
  const bytes = Buffer.from(doc.output("arraybuffer"));
  return {
    bytes,
    checksum: crypto.createHash("sha256").update(bytes).digest("hex"),
  };
}
