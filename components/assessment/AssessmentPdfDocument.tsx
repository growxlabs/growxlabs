import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { AssessmentAnswerValue, AssessmentFile, AssessmentQuestion, ClientAssessment } from "@/types/assessment";

const styles = StyleSheet.create({
  page: { paddingTop: 46, paddingBottom: 48, paddingHorizontal: 40, fontFamily: "Helvetica", color: "#152033", fontSize: 10, lineHeight: 1.45 },
  header: { borderBottomWidth: 1.5, borderBottomColor: "#152033", paddingBottom: 18, marginBottom: 18 },
  brand: { fontSize: 17, fontFamily: "Helvetica-Bold", color: "#1d5f8d" },
  brandDark: { color: "#152033" },
  confidential: { position: "absolute", right: 0, top: 0, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#8b1e2d", letterSpacing: 1.2 },
  title: { marginTop: 22, fontSize: 24, fontFamily: "Times-Bold", lineHeight: 1.1 },
  metadata: { marginTop: 16, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: "#d1d5db", flexDirection: "row", flexWrap: "wrap", gap: 10 },
  meta: { width: "31%", marginBottom: 4 },
  metaLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#64748b", textTransform: "uppercase" },
  metaValue: { marginTop: 2, fontSize: 9, overflow: "hidden" },
  section: { borderBottomWidth: 0.6, borderBottomColor: "#cbd5e1", paddingBottom: 17, marginBottom: 17 },
  sectionHeading: { flexDirection: "row", gap: 10, marginBottom: 11 },
  position: { width: 22, fontFamily: "Times-Bold", fontSize: 14, color: "#1d4f7a" },
  sectionTitle: { flex: 1, fontFamily: "Times-Bold", fontSize: 16 },
  description: { marginTop: 4, color: "#64748b", fontSize: 9 },
  answer: { flexDirection: "row", gap: 12, marginBottom: 9 },
  label: { width: "31%", fontFamily: "Helvetica-Bold", color: "#475569", fontSize: 9 },
  value: { flex: 1, fontSize: 10, overflow: "hidden" },
  footer: { position: "absolute", left: 40, right: 40, bottom: 22, borderTopWidth: 1, borderTopColor: "#152033", paddingTop: 7, flexDirection: "row", justifyContent: "space-between", color: "#64748b", fontSize: 8 },
});

export function AssessmentPdfDocument({ assessment }: { assessment: ClientAssessment }) {
  const clientName = answerText(assessment.answers.primary_contact);
  const companyName = answerText(assessment.answers.business_name);
  return <Document title="Business Discovery & Consulting Assessment" author="GrowXLabs.tech">
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header}>
        <Text style={styles.brand}><Text style={styles.brandDark}>GrowX</Text>Labs.tech</Text>
        <Text style={styles.confidential}>CONFIDENTIAL</Text>
        <Text style={styles.title}>Business Discovery &amp; Consulting Assessment</Text>
        <View style={styles.metadata}>
          <Meta label="Assessment Number" value={assessment.assessmentNumber || "Not assigned"} />
          <Meta label="Client" value={clientName} />
          <Meta label="Company" value={companyName} />
          <Meta label="Submitted On" value={assessment.submittedAt ? new Date(assessment.submittedAt).toLocaleString() : "Not submitted"} />
          <Meta label="Assessment Status" value={statusLabel(assessment.status)} />
          <Meta label="Confidentiality" value="Confidential" />
        </View>
      </View>
      {assessment.template.sections.map(section => <View key={section.id} style={styles.section} wrap>
        <View style={styles.sectionHeading} wrap={false}><Text style={styles.position}>{String(section.position).padStart(2, "0")}</Text><View style={{ flex: 1 }}><Text style={styles.sectionTitle}>{section.title}</Text>{section.description && <Text style={styles.description}>{section.description}</Text>}</View></View>
        {section.questions.filter(q => q.fieldType !== "summary").map(question => <PdfAnswer key={question.id} question={question} value={assessment.answers[question.key]} files={assessment.files.filter(f => f.questionKey === question.key)} />)}
      </View>)}
      <View style={styles.footer} fixed><Text>GrowXLabs.tech · Confidential · {assessment.assessmentNumber || "Not assigned"}</Text><Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} /></View>
    </Page>
  </Document>;
}

function Meta({ label, value }: { label: string; value: string }) { return <View style={styles.meta}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value || "Not provided"}</Text></View>; }
function PdfAnswer({ question, value, files }: { question: AssessmentQuestion; value: AssessmentAnswerValue | undefined; files: AssessmentFile[] }) { return <View style={styles.answer} wrap={false}><Text style={styles.label}>{question.label}</Text><Text style={styles.value}>{question.fieldType === "file_upload" ? (files.length ? files.map(file => file.fileName).join(", ") : "Not provided") : renderValue(question, value)}</Text></View>; }
function renderValue(question: AssessmentQuestion, value: AssessmentAnswerValue | undefined): string { if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)) return "Not provided"; if (Array.isArray(value)) return value.map(item => question.options.find(o => o.value === item)?.label || humanize(item)).join(", "); if (typeof value === "boolean") return value ? "Yes" : "No"; if (typeof value === "string") return question.options.find(o => o.value === value)?.label || value; return String(value); }
function humanize(value: string) { return value.replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
function answerText(value: AssessmentAnswerValue | undefined) { return typeof value === "string" && value.trim() ? value : "Not provided"; }
function statusLabel(status: string) { const labels: Record<string, string> = { not_started: "Not Started", draft: "In Progress", submitted: "Submitted", under_review: "Consulting Review in Progress", more_information_required: "Additional Information Required", review_complete: "Review Complete", archived: "Archived" }; return labels[status] || "In Progress"; }
