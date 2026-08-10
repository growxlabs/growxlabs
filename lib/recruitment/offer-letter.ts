import "server-only";
import crypto from "node:crypto";
import { jsPDF } from "jspdf";

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
  probationDays: number;
  noticePeriodDays: number;
  expiresAt: string;
  offerReference?: string;
  applicationReference?: string;
  version?: number;
  compensationModel?: string;
  incentiveStructure?: string;
  paymentTerms?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  acceptedAt?: string | null;
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
    ["salaryAmount", "Compensation"],
    ["probationDays", "Probation"],
    ["noticePeriodDays", "Notice period"],
    ["expiresAt", "Offer validity"],
  ];
  for (const [key, label] of required)
    if (
      value[key] === undefined ||
      value[key] === null ||
      value[key] === "" ||
      (key === "salaryAmount" && Number(value[key]) <= 0)
    )
      missing.push(label);
  const terms = value.terms || ({} as OfferSnapshot["terms"]);
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
  const left = 58,
    right = 537,
    bottom = 748;
  let y = 58;
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
  const rule = (gap = 16) => {
    ensure(gap + 1);
    doc.setDrawColor(210, 216, 224);
    doc.setLineWidth(0.6);
    doc.line(left, y, right, y);
    y += gap;
  };
  const section = (heading: string) => {
    ensure(32);
    y += 12;
    doc.setFillColor(243, 246, 249);
    doc.rect(left, y - 15, right - left, 22, "F");
    text(heading, 10.5, true, [8, 55, 92]);
    y += 6;
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
      doc.setFontSize(9.5);
      doc.setTextColor(90, 101, 115);
      doc.text(label, left, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(31, 41, 55);
      doc.text(wrapped, left + labelWidth, y);
      y += Math.max(22, wrapped.length * 13);
      doc.setDrawColor(225, 229, 234);
      doc.line(left, y - 8, right, y - 8);
    });
  };
  doc.setFillColor(8, 55, 92);
  doc.rect(0, 0, 595, 7, "F");
  text("GrowXLabs", 21, true, [8, 55, 92]);
  text("OFFER OF EMPLOYMENT", 17, true, [31, 41, 55]);
  text(
    `${date(issuedAt)}   ·   PRIVATE & CONFIDENTIAL`,
    8.5,
    true,
    [90, 101, 115],
  );
  y += 7;
  rows([
    ["Offer reference", snapshot.offerReference || "GrowXLabs offer"],
    ["Application", snapshot.applicationReference || "—"],
    ["Version", snapshot.version ? `v${snapshot.version}` : "Current"],
    ["Issued date", date(issuedAt)],
  ]);
  y += 12;
  rule(10);
  text(snapshot.candidateName, 12, true, [31, 41, 55]);
  if (snapshot.candidateAddress) {
    y += 3;
    text(snapshot.candidateAddress, 9, false, [90, 101, 115]);
  }
  y += 5;
  text(
    `Subject: Offer of Employment — ${snapshot.title}`,
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
  section("ROLE & ENGAGEMENT");
  rows([
    ["Designation", snapshot.title],
    ["Department", snapshot.departmentName],
    ["Engagement type", snapshot.employmentType],
    ["Reporting manager", snapshot.reportingManager || "Not assigned"],
    ["Work location", snapshot.workLocation],
    ["Joining date", date(snapshot.joiningDate)],
  ]);
  section("COMPENSATION & INCENTIVES");
  const compensation =
    snapshot.compensationModel ||
    (snapshot.salaryAmount > 0
      ? "Fixed compensation"
      : "Incentive-based engagement");
  rows([
    ["Compensation model", compensation],
    ...(snapshot.salaryAmount > 0
      ? [
          [
            "Fixed amount",
            `${snapshot.salaryCurrency} ${snapshot.salaryAmount.toLocaleString("en-IN")}`,
          ] as [string, string],
        ]
      : []),
    ...(snapshot.incentiveStructure
      ? [
          ["Incentive structure", snapshot.incentiveStructure] as [
            string,
            string,
          ],
        ]
      : []),
    ...(snapshot.paymentTerms
      ? [["Payment terms", snapshot.paymentTerms] as [string, string]]
      : []),
  ]);
  section("WORKING ARRANGEMENT");
  rows([
    ["Probation", `${snapshot.probationDays} days`],
    ["Offer valid until", date(snapshot.expiresAt)],
  ]);
  section("CONFIDENTIALITY & INTELLECTUAL PROPERTY");
  text(snapshot.terms.confidentialityIp, 10.5);
  y += 5;
  section("NOTICE / DISCONTINUATION");
  text(snapshot.terms.termination, 10.5);
  y += 5;
  section("WORKING TERMS");
  text(snapshot.terms.workingTerms, 10.5);
  y += 5;
  section("ACCEPTANCE");
  text(snapshot.terms.acceptanceInstructions, 10.5);
  y += 10;
  ensure(125);
  text("For GrowXLabs", 10.5, true, [31, 41, 55]);
  y += 28;
  doc.setDrawColor(70, 80, 90);
  doc.line(left, y, left + 170, y);
  y += 17;
  text(snapshot.signatoryName || "Authorized Signatory", 10, true);
  text(
    snapshot.signatoryTitle || "Authorized Signatory",
    9,
    false,
    [90, 101, 115],
  );
  text("GrowXLabs", 9, false, [90, 101, 115]);
  text(`Date: ${date(issuedAt)}`, 9, false, [90, 101, 115]);
  section("ACCEPTANCE OF OFFER");
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
      `GrowXLabs  ·  growxlabs.tech  ·  ${snapshot.offerReference || "Offer"}  ·  Private & Confidential`,
      left,
      798,
    );
    doc.text(`Page ${page} of ${total}`, right, 798, { align: "right" });
  }
  const bytes = Buffer.from(doc.output("arraybuffer"));
  return {
    bytes,
    checksum: crypto.createHash("sha256").update(bytes).digest("hex"),
  };
}
