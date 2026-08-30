/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Document, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";

type Data = Record<string, any>;

export type ConsultingInvoiceDocumentData = {
  invoice: Data;
  agreement: Data | null;
  proposal: Data | null;
  scope: Data | null;
  client: Data | null;
  company: Data | null;
  payments: Data[];
  receipts: Data[];
};

const styles = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 62, paddingHorizontal: 48, fontFamily: "Helvetica", fontSize: 9, color: "#172033" },
  header: { borderBottomWidth: 2, borderBottomColor: "#172033", paddingBottom: 16 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 20, fontWeight: 700 },
  brandBlue: { color: "#1d5f8d" },
  invoiceLabel: { fontSize: 8, color: "#1d5f8d", letterSpacing: 1.5, textTransform: "uppercase" },
  title: { marginTop: 5, fontFamily: "Times-Roman", fontSize: 27 },
  subtitle: { marginTop: 5, color: "#64748b", fontSize: 9, lineHeight: 1.4 },
  metadata: { flexDirection: "row", flexWrap: "wrap", marginTop: 15, borderTopWidth: 0.8, borderTopColor: "#d7dee7", paddingTop: 10 },
  metadataItem: { width: "25%", paddingRight: 8, marginBottom: 9 },
  metadataLabel: { fontSize: 6.5, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.6 },
  metadataValue: { marginTop: 3, fontSize: 8.2, lineHeight: 1.25 },
  parties: { flexDirection: "row", gap: 18, marginTop: 18 },
  party: { flexGrow: 1, width: "50%", padding: 11, borderWidth: 0.8, borderColor: "#d7dee7", backgroundColor: "#f8fafc" },
  partyLabel: { fontSize: 6.8, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.7 },
  partyName: { marginTop: 6, fontSize: 10, fontWeight: 700 },
  partyText: { marginTop: 3, fontSize: 8.2, lineHeight: 1.35, color: "#475569" },
  section: { marginTop: 18 },
  sectionTitle: { marginBottom: 8, fontFamily: "Times-Roman", fontSize: 15, color: "#172033" },
  milestone: { padding: 11, borderWidth: 0.8, borderColor: "#9ac3df", backgroundColor: "#eff8ff" },
  milestoneRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  milestoneName: { fontSize: 10, fontWeight: 700, color: "#164d75" },
  milestoneAmount: { fontSize: 11, fontWeight: 700, color: "#164d75" },
  small: { marginTop: 4, fontSize: 8.2, lineHeight: 1.4, color: "#475569" },
  table: { borderTopWidth: 0.8, borderTopColor: "#172033" },
  tableRow: { flexDirection: "row", paddingVertical: 7, borderBottomWidth: 0.6, borderBottomColor: "#e2e8f0" },
  tableHeader: { backgroundColor: "#f1f5f9", fontWeight: 700, color: "#475569", textTransform: "uppercase", fontSize: 7 },
  description: { flexGrow: 1, paddingRight: 8 },
  quantity: { width: 48, textAlign: "right", paddingRight: 8 },
  rate: { width: 84, textAlign: "right", paddingRight: 8 },
  lineTotal: { width: 92, textAlign: "right" },
  totals: { marginTop: 10, alignSelf: "flex-end", width: "48%", minWidth: 230 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottomWidth: 0.6, borderBottomColor: "#e2e8f0" },
  totalLabel: { color: "#64748b" },
  totalValue: { textAlign: "right" },
  grandTotal: { marginTop: 4, paddingTop: 8, borderTopWidth: 1.2, borderTopColor: "#172033", fontWeight: 700, fontSize: 11 },
  infoBox: { padding: 11, borderWidth: 0.8, borderColor: "#d7dee7", backgroundColor: "#fff" },
  infoLabel: { marginTop: 7, fontSize: 7, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.6 },
  infoValue: { marginTop: 3, fontSize: 8.7, lineHeight: 1.45 },
  footer: { position: "absolute", bottom: 23, left: 48, right: 48, paddingTop: 7, borderTopWidth: 0.8, borderTopColor: "#d7dee7", flexDirection: "row", justifyContent: "space-between", fontSize: 7.2, color: "#64748b" },
});

const record = (value: unknown): Data => value && typeof value === "object" && !Array.isArray(value) ? value as Data : {};
const display = (value: unknown) => value === undefined || value === null || value === "" ? "" : typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : textValue(value);
function textValue(value: unknown): string { if (Array.isArray(value)) return value.map(textValue).filter(Boolean).join(", "); const item = record(value); for (const key of ["name", "legalName", "legal_name", "address", "registeredAddress", "registered_address", "text", "content", "value"]) if (item[key] !== undefined) return display(item[key]); return ""; }
const date = (value: unknown) => { if (!value) return "Not specified"; const parsed = new Date(String(value)); return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); };
const money = (value: unknown, currency = "INR") => { const number = Number(value || 0); const formatted = Number.isFinite(number) ? number.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"; return currency === "INR" ? `₹${formatted}` : `${currency} ${formatted}`; };
const clean = (value: unknown) => display(value).replace(/[<>]/g, "").trim();

function Meta({ label, value }: { label: string; value: unknown }) { return <View style={styles.metadataItem}><Text style={styles.metadataLabel}>{label}</Text><Text style={styles.metadataValue}>{clean(value) || "Not specified"}</Text></View>; }
function Party({ label, name, address, taxId }: { label: string; name: string; address: string; taxId: string }) { return <View style={styles.party}><Text style={styles.partyLabel}>{label}</Text><Text style={styles.partyName}>{name || "Not specified"}</Text>{address ? <Text style={styles.partyText}>{address}</Text> : null}{taxId ? <Text style={styles.partyText}>{taxId}</Text> : null}</View>; }

export async function renderConsultingInvoicePdf(data: ConsultingInvoiceDocumentData): Promise<Buffer> {
  const invoice = record(data.invoice);
  const agreement = record(data.agreement);
  const agreementSnapshot = record(agreement.content);
  const growx = record(agreementSnapshot.parties).growxlabs ? record(record(agreementSnapshot.parties).growxlabs) : {};
  const clientParty = record(record(agreementSnapshot.parties).client);
  const company = record(data.company);
  const client = record(data.client);
  const instructions = record(invoice.payment_instructions);
  const paymentConfig = record(instructions.paymentConfiguration || instructions.payment_configuration);
  const line = record(Array.isArray(invoice.line_items) ? invoice.line_items[0] : null);
  const milestoneName = clean(instructions.milestoneDescription || line.description || `Milestone ${Number(instructions.milestoneIndex || 0) + 1}`);
  const milestonePercentage = instructions.milestonePercentage || line.milestone_percentage;
  const billingAddress = clean(company.billing_address || company.registered_address || clientParty.billingAddress || clientParty.address || clientParty.registeredAddress);
  const clientName = clean(company.legal_name || company.name || company.company_name || clientParty.legalName || client.name);
  const growxName = clean(process.env.GROWXLABS_LEGAL_ENTITY_NAME || growx.legalName || growx.legal_name || "GrowxLabs");
  const growxAddress = clean(process.env.GROWXLABS_BILLING_ADDRESS || growx.registeredAddress || growx.address);
  const growxGstin = clean(process.env.GROWXLABS_GSTIN || growx.gstin || growx.gstinNumber);
  const growxPan = clean(process.env.GROWXLABS_PAN || growx.pan || growx.panNumber);
  const clientGstin = clean(company.gstin || company.gstin_number || clientParty.gstin);
  const taxRows = (Array.isArray(invoice.tax_breakdown) ? invoice.tax_breakdown : []).map(record).filter((row) => Number(row.amount || 0) > 0);
  const documents = [
    { label: "Invoice number", value: invoice.invoice_number }, { label: "Status", value: String(invoice.status || "").replaceAll("_", " ") }, { label: "Issue date", value: date(invoice.issued_at || invoice.created_at) }, { label: "Due date", value: date(invoice.due_date) },
    { label: "Agreement", value: agreement.agreement_number }, { label: "Proposal", value: data.proposal?.proposal_number }, { label: "Scope of Work", value: data.scope?.scope_number }, { label: "Currency", value: invoice.currency || "INR" },
  ];
  return Buffer.from(await renderToBuffer(<Document title={String(invoice.invoice_number || "Consulting Invoice")} author="GrowxLabs" subject="Canonical Consulting Invoice"><Page size="A4" style={styles.page} wrap><View style={styles.header} wrap={false}><View style={styles.brandRow}><Text style={styles.brand}>GrowX<Text style={styles.brandBlue}>Labs.tech</Text></Text><Text style={styles.invoiceLabel}>Consulting invoice</Text></View><Text style={styles.title}>Invoice</Text><Text style={styles.subtitle}>Canonical billing document for the accepted consulting engagement and current payment milestone.</Text><View style={styles.metadata}>{documents.map((item) => <Meta key={item.label} label={item.label} value={item.value} />)}</View></View><View style={styles.parties} wrap={false}><Party label="From" name={growxName} address={growxAddress} taxId={[growxGstin && `GSTIN: ${growxGstin}`, growxPan && `PAN: ${growxPan}`].filter(Boolean).join(" · ")} /><Party label="Bill to" name={clientName} address={billingAddress} taxId={clientGstin ? `GSTIN: ${clientGstin}` : ""} /></View><View style={styles.section} minPresenceAhead={75}><Text style={styles.sectionTitle}>Current milestone</Text><View style={styles.milestone}><View style={styles.milestoneRow}><Text style={styles.milestoneName}>{milestoneName}{milestonePercentage ? ` · ${milestonePercentage}%` : ""}</Text><Text style={styles.milestoneAmount}>{money(instructions.milestoneAmount || invoice.total, invoice.currency)}</Text></View><Text style={styles.small}>{clean(instructions.trigger) || "Payment trigger is recorded in the accepted commercial schedule."}</Text><Text style={styles.small}>Total engagement value: {money(instructions.totalEngagementValue, invoice.currency)} · Remaining after this milestone: {money(instructions.remainingEngagementBalance, invoice.currency)}</Text></View></View><View style={styles.section} minPresenceAhead={110}><Text style={styles.sectionTitle}>Engagement charges</Text><View style={styles.table}><View style={[styles.tableRow, styles.tableHeader]} wrap={false}><Text style={styles.description}>Description</Text><Text style={styles.quantity}>Qty</Text><Text style={styles.rate}>Rate</Text><Text style={styles.lineTotal}>Amount</Text></View><View style={styles.tableRow} wrap={false}><Text style={styles.description}>{clean(line.description) || milestoneName}</Text><Text style={styles.quantity}>{clean(line.quantity) || "1"}</Text><Text style={styles.rate}>{money(line.unit_price || invoice.subtotal, invoice.currency)}</Text><Text style={styles.lineTotal}>{money(invoice.subtotal, invoice.currency)}</Text></View></View><View style={styles.totals}><View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalValue}>{money(invoice.subtotal, invoice.currency)}</Text></View>{Number(invoice.discount_total || 0) > 0 ? <View style={styles.totalRow}><Text style={styles.totalLabel}>Discount / concession</Text><Text style={styles.totalValue}>-{money(invoice.discount_total, invoice.currency)}</Text></View> : null}<View style={styles.totalRow}><Text style={styles.totalLabel}>Taxable value</Text><Text style={styles.totalValue}>{money(Number(invoice.subtotal || 0) - Number(invoice.discount_total || 0), invoice.currency)}</Text></View>{taxRows.map((row, index) => <View style={styles.totalRow} key={`tax-${index}`}><Text style={styles.totalLabel}>{clean(row.label || row.name || row.type || "Tax")}{row.rate ? ` (${row.rate}%)` : ""}</Text><Text style={styles.totalValue}>{money(row.amount, invoice.currency)}</Text></View>)}{!taxRows.length && Number(invoice.tax_total || 0) > 0 ? <View style={styles.totalRow}><Text style={styles.totalLabel}>Tax</Text><Text style={styles.totalValue}>{money(invoice.tax_total, invoice.currency)}</Text></View> : null}<View style={[styles.totalRow, styles.grandTotal]}><Text>Total invoice value</Text><Text style={styles.totalValue}>{money(invoice.total, invoice.currency)}</Text></View><View style={styles.totalRow}><Text style={styles.totalLabel}>Amount paid</Text><Text style={styles.totalValue}>{money(invoice.amount_paid, invoice.currency)}</Text></View><View style={styles.totalRow}><Text style={{ fontWeight: 700 }}>Amount due</Text><Text style={[styles.totalValue, { fontWeight: 700 }]}>{money(invoice.balance_due, invoice.currency)}</Text></View></View></View><View style={styles.section} minPresenceAhead={90}><Text style={styles.sectionTitle}>Payment instructions</Text><View style={styles.infoBox}>{clean(paymentConfig.bankName || paymentConfig.bank_name) ? <><Text style={styles.infoLabel}>Bank transfer</Text><Text style={styles.infoValue}>{clean(paymentConfig.bankName || paymentConfig.bank_name)}{paymentConfig.accountName || paymentConfig.account_name ? ` · ${clean(paymentConfig.accountName || paymentConfig.account_name)}` : ""}{paymentConfig.accountNumber || paymentConfig.account_number ? ` · Account ${clean(paymentConfig.accountNumber || paymentConfig.account_number)}` : ""}{paymentConfig.ifsc ? ` · IFSC ${clean(paymentConfig.ifsc)}` : ""}</Text></> : null}{clean(paymentConfig.upiId || paymentConfig.upi_id) ? <><Text style={styles.infoLabel}>UPI</Text><Text style={styles.infoValue}>{clean(paymentConfig.upiId || paymentConfig.upi_id)}</Text></> : null}{clean(paymentConfig.notes || instructions.notes) ? <><Text style={styles.infoLabel}>Terms and notes</Text><Text style={styles.infoValue}>{clean(paymentConfig.notes || instructions.notes)}</Text></> : null}{!clean(paymentConfig.bankName || paymentConfig.bank_name) && !clean(paymentConfig.upiId || paymentConfig.upi_id) && !clean(paymentConfig.notes || instructions.notes) ? <Text style={styles.infoValue}>Payment details will be provided by GrowXLabs through the Client Suite. No external payment gateway instruction is embedded in this invoice.</Text> : null}</View></View><View fixed style={styles.footer}><Text>{clean(invoice.invoice_number)} · GrowxLabs · Confidential</Text><Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} /></View></Page></Document>));
}

export default renderConsultingInvoicePdf;
