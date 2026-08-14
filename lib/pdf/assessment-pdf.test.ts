import assert from "node:assert/strict";
import test from "node:test";
import { renderAssessmentDocumentHtml, generateAssessmentPdf } from "./assessment-pdf.ts";
import type { ClientAssessment } from "../../types/assessment.ts";

const mockAssessment: ClientAssessment = {
  id: "00000000-0000-0000-0000-000000000001",
  assessmentNumber: "GXL-ASM-2026-000001",
  templateId: "tpl-1",
  templateVersion: 1,
  clientId: "cli-1",
  companyId: "comp-1",
  leadId: "lead-1",
  dealId: "deal-1",
  status: "submitted",
  currentSection: 1,
  completedSections: ["sec-1"],
  completionPercentage: 100,
  template: {
    id: "tpl-1",
    name: "Business Discovery Assessment",
    slug: "business-discovery-consulting",
    description: "Initial discovery template",
    version: 1,
    status: "published",
    sections: [
      {
        id: "s1",
        key: "company_overview",
        title: "Company Overview & Core Business",
        description: "General details about company operations and objectives.",
        position: 1,
        required: true,
        config: {},
        questions: [
          {
            id: "q1",
            key: "business_name",
            label: "Legal Business Name",
            description: null,
            fieldType: "text",
            placeholder: null,
            helpText: null,
            position: 1,
            required: true,
            validation: {},
            visibilityRules: [],
            config: {},
            options: [],
          },
          {
            id: "q2",
            key: "primary_contact",
            label: "Primary Contact Name",
            description: null,
            fieldType: "text",
            placeholder: null,
            helpText: null,
            position: 2,
            required: true,
            validation: {},
            visibilityRules: [],
            config: {},
            options: [],
          },
          {
            id: "q3",
            key: "primary_challenges",
            label: "Key Operational Challenges",
            description: null,
            fieldType: "multi_select",
            placeholder: null,
            helpText: null,
            position: 3,
            required: true,
            validation: {},
            visibilityRules: [],
            config: {},
            options: [
              { id: "o1", label: "Manual Workflow Bottlenecks", value: "manual_bottlenecks", position: 1, metadata: {} },
              { id: "o2", label: "Legacy Software Modernization", value: "legacy_modernization", position: 2, metadata: {} },
            ],
          },
          {
            id: "q4",
            key: "authorized_signature",
            label: "Authorized Representative Signature",
            description: null,
            fieldType: "signature",
            placeholder: null,
            helpText: null,
            position: 4,
            required: true,
            validation: {},
            visibilityRules: [],
            config: {},
            options: [],
          },
        ],
      },
    ],
  },
  answers: {
    business_name: "Acme Global Innovations Ltd",
    primary_contact: "Jane Doe",
    primary_challenges: ["manual_bottlenecks", "legacy_modernization"],
    authorized_signature: "Jane Doe",
  },
  files: [],
  informationRequests: [],
  startedAt: "2026-08-01T10:00:00Z",
  submittedAt: "2026-08-02T14:30:00Z",
  updatedAt: "2026-08-02T14:30:00Z",
};

test("renderAssessmentDocumentHtml generates markup matching admin white document", () => {
  const html = renderAssessmentDocumentHtml(mockAssessment);

  // Verification of branding and structure
  assert.match(html, /GrowX<span class="text-\[#1d5f8d\]">Labs\.tech<\/span>/);
  assert.match(html, /Business Discovery &amp; Consulting Assessment/);
  assert.match(html, /GXL-ASM-2026-000001/);
  assert.match(html, /Acme Global Innovations Ltd/);
  assert.match(html, /Jane Doe/);
  assert.match(html, /Company Overview &amp; Core Business/);
  assert.match(html, /Manual Workflow Bottlenecks/);
  assert.match(html, /Legacy Software Modernization/);
  assert.match(html, /signature-block/);
  assert.match(html, /@page \{/);
  assert.match(html, /size: A4 portrait/);
});

test("generateAssessmentPdf generates valid A4 PDF binary for GXL-ASM-2026-000001", async () => {
  const pdfBuffer = await generateAssessmentPdf(mockAssessment);

  assert.ok(pdfBuffer instanceof Buffer);
  assert.ok(pdfBuffer.length > 5000, "PDF buffer should be substantial");

  // PDF binary magic header
  const header = pdfBuffer.subarray(0, 5).toString("utf-8");
  assert.equal(header, "%PDF-", "Generated buffer must have %PDF- header");
});
