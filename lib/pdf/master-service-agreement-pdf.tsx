import React from "react";
import { Document, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { MsaSection, MsaSnapshot } from "@/lib/commercial/msa";

const styles = StyleSheet.create({
  page: { paddingTop: 58, paddingBottom: 62, paddingHorizontal: 54, fontFamily: "Helvetica", fontSize: 9.5, color: "#172033" },
  header: { borderBottomWidth: 2, borderBottomColor: "#172033", paddingBottom: 18 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 19, fontWeight: 700, letterSpacing: 0.2 },
  brandBlue: { color: "#1d5f8d" },
  confidential: { fontSize: 7.5, color: "#991b1b", letterSpacing: 1.8 },
  eyebrow: { marginTop: 22, fontSize: 7.5, color: "#1d5f8d", letterSpacing: 1.4, textTransform: "uppercase" },
  title: { marginTop: 7, fontFamily: "Times-Roman", fontSize: 25, lineHeight: 1.15 },
  subtitle: { marginTop: 6, fontSize: 9, color: "#475569", lineHeight: 1.4 },
  metadata: { flexDirection: "row", flexWrap: "wrap", marginTop: 16, borderTopWidth: 0.8, borderTopColor: "#d7dee7", paddingTop: 11 },
  metadataItem: { width: "33.3333%", paddingRight: 9, marginBottom: 8 },
  metadataLabel: { fontSize: 6.8, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.7 },
  metadataValue: { marginTop: 3, fontSize: 8.6, lineHeight: 1.25 },
  reviewBanner: { marginTop: 16, padding: 10, borderWidth: 0.8, borderColor: "#f59e0b", backgroundColor: "#fffbeb" },
  reviewTitle: { fontSize: 8.5, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: 0.8 },
  reviewText: { marginTop: 4, fontSize: 8.2, lineHeight: 1.4, color: "#78350f" },
  section: { marginTop: 17 },
  sectionHeading: { flexDirection: "row", marginBottom: 8 },
  sectionNumber: { width: 28, flexShrink: 0, fontFamily: "Times-Roman", fontSize: 14, color: "#1d4f7a" },
  sectionTitle: { flexGrow: 1, fontFamily: "Times-Roman", fontSize: 15, lineHeight: 1.2, color: "#172033" },
  paragraph: { marginBottom: 6, fontSize: 9.5, lineHeight: 1.5, color: "#334155" },
  bullet: { flexDirection: "row", marginBottom: 5, paddingLeft: 4 },
  bulletMark: { width: 13, color: "#1d5f8d", fontWeight: 700 },
  bulletText: { flexGrow: 1, fontSize: 9.3, lineHeight: 1.48, color: "#334155" },
  fieldList: { marginTop: 2, borderTopWidth: 0.7, borderTopColor: "#d7dee7" },
  field: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 0.7, borderBottomColor: "#edf0f4" },
  fieldLabel: { width: "34%", paddingRight: 8, fontSize: 7.8, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 },
  fieldValue: { width: "66%", fontSize: 9, lineHeight: 1.4, color: "#172033" },
  unresolved: { color: "#b45309", fontStyle: "italic" },
  signature: { marginTop: 7, padding: 9, borderWidth: 0.7, borderColor: "#d7dee7" },
  signatureLabel: { fontSize: 7.5, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.7 },
  signatureName: { marginTop: 7, fontSize: 9.2, fontWeight: 700 },
  signatureImage: { marginTop: 6, width: 120, height: 38, objectFit: "contain" },
  footer: { position: "absolute", bottom: 23, left: 54, right: 54, paddingTop: 7, borderTopWidth: 0.8, borderTopColor: "#d7dee7", flexDirection: "row", justifyContent: "space-between", fontSize: 7.2, color: "#64748b" },
});

function display(value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(display).filter(Boolean).join("; ");
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["content", "description", "text", "value", "title", "name", "label"]) if (record[key] !== undefined) return display(record[key]);
  }
  return "";
}

function date(value: unknown): string {
  if (!value) return "Not specified";
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function Metadata({ label, value }: { label: string; value: unknown }) {
  return <View style={styles.metadataItem}><Text style={styles.metadataLabel}>{label}</Text><Text style={styles.metadataValue}>{display(value) || "Not specified"}</Text></View>;
}

function Section({ value }: { value: MsaSection }) {
  return <View style={styles.section} minPresenceAhead={92}>
    <View style={styles.sectionHeading} minPresenceAhead={70} wrap={false}><Text style={styles.sectionNumber}>{String(value.number).padStart(2, "0")}</Text><Text style={styles.sectionTitle}>{value.title}</Text></View>
    {value.body.map((paragraph, index) => <Text key={`body-${index}`} style={styles.paragraph} orphans={2} widows={2}>{paragraph}</Text>)}
    {value.items?.map((item, index) => <View key={`item-${index}`} style={styles.bullet} minPresenceAhead={28}><Text style={styles.bulletMark}>•</Text><Text style={styles.bulletText} orphans={2} widows={2}>{item}</Text></View>)}
    {value.fields?.length ? <View style={styles.fieldList} minPresenceAhead={34}>{value.fields.map((field, index) => <View key={`field-${index}`} style={styles.field} wrap={false}><Text style={styles.fieldLabel}>{field.label}</Text><Text style={field.value ? styles.fieldValue : [styles.fieldValue, styles.unresolved]}>{field.value || "Internal review required"}</Text></View>)}</View> : null}
    {value.key === "signatories" ? <View style={styles.signature}><Text style={styles.signatureLabel}>Execution record</Text><Text style={styles.paragraph}>Signatures, consent, timestamps, and audit metadata are captured separately by the application.</Text></View> : null}
  </View>;
}

function ReviewFields({ fields }: { fields: MsaSnapshot["legalReviewFields"] }) {
  const unresolved = fields.filter((field) => field.status === "unresolved");
  if (!unresolved.length) return null;
  return <View style={styles.reviewBanner} minPresenceAhead={80}>
    <Text style={styles.reviewTitle}>Internal review fields unresolved</Text>
    <Text style={styles.reviewText}>This draft is not ready to send. Resolve the following legal or commercial decisions in the Admin Suite before client review.</Text>
    {unresolved.map((field) => <Text key={field.key} style={styles.reviewText}>• {field.label}: {field.reason}</Text>)}
  </View>;
}

export async function renderMasterServiceAgreementPdf(snapshot: MsaSnapshot): Promise<Buffer> {
  const document = <Document title={`${snapshot.document.agreementNumber} Version ${snapshot.document.version}`} author="GrowxLabs" subject="Master Service Agreement">
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header} wrap={false}>
        <View style={styles.brandRow}><Text style={styles.brand}>GrowX<Text style={styles.brandBlue}>Labs.tech</Text></Text>{snapshot.document.confidential ? <Text style={styles.confidential}>CONFIDENTIAL</Text> : null}</View>
        <Text style={styles.eyebrow}>Commercial and Legal Document</Text>
        <Text style={styles.title}>{snapshot.document.title}</Text>
        <Text style={styles.subtitle}>Prepared for internal review from an accepted commercial proposal and approved Scope of Work.</Text>
        <View style={styles.metadata}>
          <Metadata label="Agreement number" value={snapshot.document.agreementNumber} />
          <Metadata label="Version" value={`Version ${snapshot.document.version}`} />
          <Metadata label="Client" value={(snapshot.parties.client as Record<string, unknown>).legalName} />
          <Metadata label="Proposal" value={`${snapshot.sourceReferences.proposalNumber} · Version ${snapshot.sourceReferences.proposalVersion}`} />
          <Metadata label="Scope" value={snapshot.sourceReferences.scopeNumber} />
          <Metadata label="Issue date" value={date(snapshot.document.issuedAt)} />
          <Metadata label="Effective date" value={date(snapshot.document.effectiveAt)} />
          <Metadata label="Status" value={snapshot.document.status.replaceAll("_", " ")} />
        </View>
      </View>
      <ReviewFields fields={snapshot.legalReviewFields} />
      {snapshot.sections.map((value) => <Section key={value.key} value={value} />)}
      <View fixed style={styles.footer}><Text>{snapshot.document.agreementNumber} · Version {snapshot.document.version} · Confidential</Text><Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} /></View>
    </Page>
  </Document>;
  return Buffer.from(await renderToBuffer(document));
}

export default renderMasterServiceAgreementPdf;
