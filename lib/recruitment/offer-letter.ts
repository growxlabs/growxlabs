import "server-only";
import crypto from "node:crypto";
import { jsPDF } from "jspdf";

export type OfferSnapshot = {
  candidateName: string; candidateAddress?: string | null; title: string;
  departmentName: string; reportingManager?: string | null; employmentType: string;
  workLocation: string; joiningDate: string; salaryAmount: number; salaryCurrency: string;
  probationDays: number; noticePeriodDays: number; expiresAt: string;
  terms: { workingTerms: string; confidentialityIp: string; termination: string; acceptanceInstructions: string };
};

export function missingOfferInputs(value: Partial<OfferSnapshot>) {
  const missing: string[] = [];
  const required: Array<[keyof OfferSnapshot, string]> = [
    ["candidateName", "Candidate name"], ["title", "Designation"],
    ["departmentName", "Department"], ["employmentType", "Employment type"],
    ["workLocation", "Work location"], ["joiningDate", "Joining date"],
    ["salaryAmount", "Compensation"], ["probationDays", "Probation"],
    ["noticePeriodDays", "Notice period"], ["expiresAt", "Offer validity"],
  ];
  for (const [key, label] of required) if (value[key] === undefined || value[key] === null || value[key] === "" || (key === "salaryAmount" && Number(value[key]) <= 0)) missing.push(label);
  const terms = value.terms || ({} as OfferSnapshot["terms"]);
  if (!terms.workingTerms?.trim()) missing.push("Approved working terms");
  if (!terms.confidentialityIp?.trim()) missing.push("Approved confidentiality / IP wording");
  if (!terms.termination?.trim()) missing.push("Approved notice / termination wording");
  if (!terms.acceptanceInstructions?.trim()) missing.push("Acceptance instructions");
  return missing;
}

export function generateOfferPdf(snapshot: OfferSnapshot, issuedAt: Date) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const left = 54; let y = 58;
  const line = (text: string, size = 10, bold = false, gap = 16) => {
    doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(size);
    const rows = doc.splitTextToSize(text, 487); doc.text(rows, left, y); y += rows.length * (size + 3) + gap;
    if (y > 760) { doc.addPage(); y = 58; }
  };
  doc.setTextColor(5, 35, 66); line("GrowXLabs", 18, true, 8);
  line(issuedAt.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }), 9, false, 18);
  line("PRIVATE & CONFIDENTIAL", 9, true, 20);
  line(snapshot.candidateName, 11, true, 4);
  if (snapshot.candidateAddress) line(snapshot.candidateAddress, 9, false, 14);
  line(`Subject: Offer of Employment - ${snapshot.title}`, 12, true, 18);
  line(`Dear ${snapshot.candidateName},`, 10, false, 10);
  line(`We are pleased to confirm an offer of employment with GrowXLabs for the position of ${snapshot.title}, subject only to the Admin-approved terms recorded below.`, 10, false, 16);
  line("ROLE DETAILS", 10, true, 7);
  line(`Designation: ${snapshot.title}\nDepartment: ${snapshot.departmentName}\nReporting manager: ${snapshot.reportingManager || "Not assigned"}\nEmployment type: ${snapshot.employmentType}\nWork location: ${snapshot.workLocation}\nJoining date: ${new Date(snapshot.joiningDate).toLocaleDateString("en-IN")}`, 9, false, 14);
  line("COMPENSATION", 10, true, 7);
  line(`${snapshot.salaryCurrency} ${snapshot.salaryAmount.toLocaleString("en-IN")} (as confirmed by GrowXLabs People).`, 9, false, 14);
  line("PROBATION", 10, true, 7); line(`${snapshot.probationDays} days.`, 9, false, 14);
  line("WORKING TERMS", 10, true, 7); line(snapshot.terms.workingTerms, 9, false, 14);
  line("CONFIDENTIALITY / IP", 10, true, 7); line(snapshot.terms.confidentialityIp, 9, false, 14);
  line("NOTICE / TERMINATION", 10, true, 7); line(snapshot.terms.termination, 9, false, 14);
  line("ACCEPTANCE", 10, true, 7); line(snapshot.terms.acceptanceInstructions, 9, false, 18);
  line("For GrowXLabs\nAuthorized Signatory", 10, true, 6);
  const bytes = Buffer.from(doc.output("arraybuffer"));
  return { bytes, checksum: crypto.createHash("sha256").update(bytes).digest("hex") };
}
