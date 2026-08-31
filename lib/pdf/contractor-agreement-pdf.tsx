import React from "react";
import { Document, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ContractorAgreementSnapshot, ContractorSection } from "@/lib/contractors/agreements";

const CONTRACTOR_ROLE = "Developer, GrowxLabs Delivery Team";

export type ContractorAgreementPdfAudience = "internal" | "executed";

const styles = StyleSheet.create({
  page: { paddingTop: 54, paddingBottom: 62, paddingHorizontal: 54, fontFamily: "Helvetica", fontSize: 9.5, color: "#172033" },
  header: { borderBottomWidth: 2, borderBottomColor: "#172033", paddingBottom: 17 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 19, fontWeight: 700 },
  brandBlue: { color: "#1d5f8d" },
  confidential: { fontSize: 7.5, color: "#991b1b", letterSpacing: 1.7 },
  eyebrow: { marginTop: 20, fontSize: 7.5, color: "#1d5f8d", letterSpacing: 1.3, textTransform: "uppercase" },
  title: { marginTop: 7, fontFamily: "Times-Roman", fontSize: 23, lineHeight: 1.16 },
  subtitle: { marginTop: 6, fontSize: 9, color: "#475569", lineHeight: 1.4 },
  metadata: { flexDirection: "row", flexWrap: "wrap", marginTop: 15, borderTopWidth: 0.8, borderTopColor: "#d7dee7", paddingTop: 10 },
  metadataItem: { width: "33.3333%", paddingRight: 9, marginBottom: 8 },
  metadataLabel: { fontSize: 6.8, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.7 },
  metadataValue: { marginTop: 3, fontSize: 8.5, lineHeight: 1.25 },
  banner: { marginTop: 15, padding: 10, borderWidth: 0.8, borderColor: "#f59e0b", backgroundColor: "#fffbeb" },
  bannerTitle: { fontSize: 8.5, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: 0.8 },
  bannerText: { marginTop: 4, fontSize: 8.2, lineHeight: 1.4, color: "#78350f" },
  section: { marginTop: 17 },
  heading: { flexDirection: "row", marginBottom: 8 },
  number: { width: 28, flexShrink: 0, fontFamily: "Times-Roman", fontSize: 14, color: "#1d4f7a" },
  sectionTitle: { flexGrow: 1, fontFamily: "Times-Roman", fontSize: 15, lineHeight: 1.2, color: "#172033" },
  paragraph: { marginBottom: 6, fontSize: 9.4, lineHeight: 1.5, color: "#334155" },
  bullet: { flexDirection: "row", marginBottom: 5, paddingLeft: 4 },
  bulletMark: { width: 13, color: "#1d5f8d", fontWeight: 700 },
  bulletText: { flexGrow: 1, fontSize: 9.2, lineHeight: 1.48, color: "#334155" },
  fields: { marginTop: 2, borderTopWidth: 0.7, borderTopColor: "#d7dee7" },
  field: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 0.7, borderBottomColor: "#edf0f4" },
  fieldLabel: { width: "35%", paddingRight: 8, fontSize: 7.7, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 },
  fieldValue: { width: "65%", fontSize: 9, lineHeight: 1.4, color: "#172033" },
  unresolved: { color: "#b45309", fontStyle: "italic" },
  signatureSection: { marginTop: 20 },
  signatureHeading: { fontFamily: "Times-Roman", fontSize: 15, marginBottom: 10 },
  signatureGrid: { flexDirection: "row", gap: 10 },
  signature: { width: "50%", padding: 10, borderWidth: 0.7, borderColor: "#d7dee7" },
  signatureLabel: { fontSize: 7.5, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.7 },
  signatureLine: { marginTop: 17, paddingTop: 6, borderTopWidth: 0.7, borderTopColor: "#9aa6b2", fontSize: 8.5 },
  footer: { position: "absolute", bottom: 23, left: 54, right: 54, paddingTop: 7, borderTopWidth: 0.8, borderTopColor: "#d7dee7", flexDirection: "row", justifyContent: "space-between", fontSize: 7.2, color: "#64748b" },
});

function shown(value: unknown): string {
  if (value === undefined || value === null || value === "") return "Not specified";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(shown).filter(Boolean).join("; ");
  return "Not specified";
}

function date(value: unknown): string {
  if (!value) return "Not specified";
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function Metadata({ label, value }: { label: string; value: unknown }) {
  return <View style={styles.metadataItem}><Text style={styles.metadataLabel}>{label}</Text><Text style={styles.metadataValue}>{shown(value)}</Text></View>;
}

function Section({ value }: { value: ContractorSection }) {
  return <View style={styles.section} minPresenceAhead={92}>
    <View style={styles.heading} minPresenceAhead={70} wrap={false}><Text style={styles.number}>{String(value.number).padStart(2, "0")}</Text><Text style={styles.sectionTitle}>{value.title}</Text></View>
    {value.body.map((paragraph, index) => <Text key={`body-${index}`} style={styles.paragraph} orphans={2} widows={2}>{paragraph}</Text>)}
    {value.items?.map((item, index) => <View key={`item-${index}`} style={styles.bullet} minPresenceAhead={28}><Text style={styles.bulletMark}>•</Text><Text style={styles.bulletText} orphans={2} widows={2}>{item}</Text></View>)}
    {value.fields?.length ? <View style={styles.fields} minPresenceAhead={34}>{value.fields.map((field, index) => <View key={`field-${index}`} style={styles.field} wrap={false}><Text style={styles.fieldLabel}>{field.label}</Text><Text style={field.value ? styles.fieldValue : [styles.fieldValue, styles.unresolved]}>{field.value || "To be completed"}</Text></View>)}</View> : null}
  </View>;
}

function SignatureBlock({ party, snapshot }: { party: "growxlabs" | "contractor"; snapshot: ContractorAgreementSnapshot }) {
  const signature = snapshot.signatures.find((item) => item.party === party);
  const contractor = snapshot.parties.contractor;
  return <View style={styles.signature}>
    <Text style={styles.signatureLabel}>{party === "growxlabs" ? "For GrowxLabs" : "For Contractor"}</Text>
    <Text style={styles.paragraph}>{signature?.fullLegalName || (party === "contractor" ? contractor.fullLegalName : null) || "Not signed"}</Text>
    <Text style={styles.paragraph}>{signature?.roleOrCapacity || (party === "contractor" ? CONTRACTOR_ROLE : "Authorised signatory")}</Text>
    <Text style={styles.paragraph}>{signature?.email || (party === "contractor" ? contractor.email : null) || "Not signed"}</Text>
    {signature?.signature ? <Text style={styles.paragraph}>Electronic signature: {signature.signature}</Text> : null}
    <Text style={styles.signatureLine}>Signed date: {signature ? date(signature.signedAt) : "Not signed"}</Text>
  </View>;
}

export async function renderContractorAgreementPdf(snapshot: ContractorAgreementSnapshot, audience: ContractorAgreementPdfAudience = "internal"): Promise<Buffer> {
  const unresolved = snapshot.legalFields.filter((field) => field.status === "unresolved");
  const executed = audience === "executed";
  const document = <Document title={`${snapshot.document.agreementNumber} Version ${snapshot.document.version}`} author="GrowxLabs" subject="Independent Contractor Agreement and IP Assignment">
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header} wrap={false}>
        <View style={styles.brandRow}><Text style={styles.brand}>GrowX<Text style={styles.brandBlue}>Labs.tech</Text></Text>{snapshot.document.confidential ? <Text style={styles.confidential}>CONFIDENTIAL</Text> : null}</View>
        <Text style={styles.eyebrow}>Contractor agreement</Text>
        <Text style={styles.title}>{snapshot.document.title}</Text>
        <Text style={styles.subtitle}>{executed ? "Canonical executed copy generated from the signed agreement snapshot." : "Internal draft for GrowxLabs completion and review. It is not ready to send while required fields remain incomplete."}</Text>
        <View style={styles.metadata}>
          <Metadata label="Agreement number" value={snapshot.document.agreementNumber} />
          <Metadata label="Version" value={`Version ${snapshot.document.version}`} />
          <Metadata label="Engaging party" value="GrowxLabs" />
          <Metadata label="Contractor" value={snapshot.parties.contractor.fullLegalName} />
          <Metadata label="Project role" value={snapshot.parties.contractor.role} />
          <Metadata label="Project" value={snapshot.project.projectName} />
          <Metadata label="Agreement date" value={date(snapshot.document.agreementDate)} />
          <Metadata label="Effective date" value={date(snapshot.document.effectiveDate)} />
          <Metadata label="Status" value={snapshot.document.status.replaceAll("_", " ")} />
        </View>
      </View>
      {!executed && unresolved.length ? <View style={styles.banner} minPresenceAhead={80}><Text style={styles.bannerTitle}>Internal fields unresolved</Text><Text style={styles.bannerText}>Complete the required contractor, scope, tax, liability, notice, and dispute fields in the Admin Workspace before approving this agreement for signing.</Text>{unresolved.map((field) => <Text key={field.key} style={styles.bannerText}>• {field.label}</Text>)}</View> : null}
      {snapshot.sections.map((value) => <Section key={value.key} value={value} />)}
      <View style={styles.signatureSection} minPresenceAhead={140}>
        <Text style={styles.signatureHeading}>Signatures</Text>
        <View style={styles.signatureGrid}><SignatureBlock party="growxlabs" snapshot={snapshot} /><SignatureBlock party="contractor" snapshot={snapshot} /></View>
        {snapshot.execution ? <Text style={[styles.paragraph, { marginTop: 10 }]}>Final execution timestamp: {date(snapshot.execution.executedAt)} · Document hash: {snapshot.execution.documentHash}</Text> : null}
      </View>
      <View fixed style={styles.footer}><Text>{snapshot.document.agreementNumber} · Version {snapshot.document.version} · Confidential</Text><Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} /></View>
    </Page>
  </Document>;
  return Buffer.from(await renderToBuffer(document));
}

export default renderContractorAgreementPdf;
