import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 64,
    paddingBottom: 76,
    paddingHorizontal: 57,
    fontFamily: "Helvetica",
    fontSize: 9.8,
    color: "#172033",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#172033",
    paddingBottom: 23,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  brand: {
    fontSize: 20,
    fontWeight: 700,
  },
  brandBlue: {
    color: "#1d5f8d",
  },
  confidential: {
    fontSize: 8,
    color: "#991b1b",
    letterSpacing: 2,
  },
  documentTitle: {
    fontFamily: "Times-Roman",
    fontSize: 28,
    lineHeight: 1.1,
    marginTop: 28,
  },
  metadata: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#d7dee7",
    paddingTop: 14,
  },
  metadataItem: {
    width: "33.3333%",
    paddingRight: 10,
    marginBottom: 11,
  },
  metadataLabel: {
    fontSize: 7,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  metadataValue: {
    fontSize: 9,
    marginTop: 3,
    lineHeight: 1.25,
  },
  sectionHeading: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 11,
  },
  sectionNumber: {
    width: 31,
    flexShrink: 0,
    fontFamily: "Times-Roman",
    fontSize: 16,
    lineHeight: 1.2,
    color: "#1d4f7a",
  },
  sectionTitle: {
    flexGrow: 1,
    fontFamily: "Times-Roman",
    fontSize: 16.5,
    lineHeight: 1.2,
    color: "#172033",
  },
  sectionRule: {
    height: 1,
    marginTop: 6,
    borderBottomWidth: 0.8,
    borderBottomColor: "#d7dee7",
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.55,
    color: "#334155",
  },
  itemBlock: {
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 10.5,
    lineHeight: 1.35,
    fontWeight: 700,
    color: "#1d4f7a",
  },
  body: {
    fontSize: 9.8,
    lineHeight: 1.55,
    color: "#334155",
  },
  itemBody: {
    marginTop: 4,
  },
  marker: {
    color: "#1d5f8d",
    fontWeight: 700,
  },
  empty: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: "#64748b",
    fontStyle: "italic",
  },
  subheading: {
    marginBottom: 7,
    fontSize: 10,
    fontWeight: 700,
    color: "#1d4f7a",
  },
  pricingLine: {
    flexDirection: "row",
    marginBottom: 12,
    paddingBottom: 11,
    borderBottomWidth: 0.7,
    borderBottomColor: "#edf0f4",
  },
  pricingCopy: {
    width: "67%",
    paddingRight: 12,
  },
  pricingDescription: {
    fontSize: 10,
    lineHeight: 1.4,
    fontWeight: 700,
    color: "#172033",
  },
  pricingMeta: {
    marginTop: 5,
    fontSize: 8.6,
    lineHeight: 1.45,
    color: "#64748b",
  },
  pricingAmount: {
    width: "33%",
    paddingLeft: 10,
    borderLeftWidth: 0.8,
    borderLeftColor: "#d7dee7",
  },
  amountLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#64748b",
  },
  amount: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 1.35,
    fontWeight: 700,
    color: "#172033",
  },
  totals: {
    width: "58%",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    fontSize: 9.3,
    lineHeight: 1.35,
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: "#172033",
    paddingTop: 7,
    marginTop: 2,
    fontSize: 10.5,
    fontWeight: 700,
  },
  paymentItem: {
    marginBottom: 11,
    padding: 10,
    borderWidth: 0.8,
    borderColor: "#d7dee7",
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentName: {
    width: "60%",
    paddingRight: 8,
    fontSize: 10,
    lineHeight: 1.4,
    fontWeight: 700,
    color: "#172033",
  },
  paymentAmount: {
    width: "40%",
    textAlign: "right",
    fontSize: 9.2,
    lineHeight: 1.4,
    fontWeight: 700,
    color: "#1d4f7a",
  },
  paymentTrigger: {
    marginTop: 5,
    fontSize: 9.3,
    lineHeight: 1.5,
    color: "#334155",
  },
  acceptance: {
    marginTop: 20,
    padding: 12,
    borderWidth: 0.8,
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4",
  },
  acceptanceTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#166534",
  },
  acceptanceBody: {
    marginTop: 5,
    fontSize: 9.3,
    lineHeight: 1.5,
    color: "#14532d",
  },
  footer: {
    position: "absolute",
    bottom: 26,
    left: 57,
    right: 57,
    paddingTop: 8,
    borderTopWidth: 0.8,
    borderTopColor: "#d7dee7",
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    lineHeight: 1.2,
    color: "#64748b",
  },
});

type Dictionary = Record<string, unknown>;

type ProposalSnapshot = {
  proposal?: Dictionary;
  preparedFor?: Dictionary;
  clientContent?: Dictionary;
  pricing?: unknown;
  commercialTotals?: Dictionary;
  paymentSchedule?: unknown;
  validUntil?: unknown;
};

const isDictionary = (value: unknown): value is Dictionary =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const asArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
};

function stringify(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(stringify).filter(Boolean).join("\n");
  if (isDictionary(value)) {
    for (const key of ["content", "description", "text", "value", "title", "name", "label"]) {
      if (value[key] !== undefined && value[key] !== null && value[key] !== "") {
        return stringify(value[key]);
      }
    }
    return JSON.stringify(value);
  }
  return String(value);
}

function itemTitle(value: unknown): string {
  if (!isDictionary(value)) return "";
  for (const key of ["title", "name", "label"]) {
    const candidate = stringify(value[key]);
    if (candidate) return candidate;
  }
  return "";
}

function itemBody(value: unknown): string {
  if (!isDictionary(value)) return stringify(value);
  const title = itemTitle(value);
  for (const key of ["description", "content", "text", "details", "value"]) {
    const candidate = stringify(value[key]);
    if (candidate && candidate !== title) return candidate;
  }
  if (title) return "";
  return stringify(value);
}

function numberValue(value: unknown, fallback = 0): number {
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
}

function displayDate(value: unknown): string {
  if (!value) return "-";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-IN");
}

function displayMoney(value: unknown, currency: string): string {
  const amount = numberValue(value);
  return `${currency} ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Metadata({ label, value }: { label: string; value: unknown }) {
  return (
    <View style={styles.metadataItem}>
      <Text style={styles.metadataLabel}>{label}</Text>
      <Text style={styles.metadataValue}>{stringify(value) || "-"}</Text>
    </View>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <View style={styles.sectionHeading} minPresenceAhead={82}>
        {number ? <Text style={styles.sectionNumber}>{number}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View>{children}</View>
      <View style={styles.sectionRule} />
    </View>
  );
}

function EmptyContent() {
  return <Text style={styles.empty}>Not specified</Text>;
}

function SummaryContent({ value }: { value: unknown }) {
  const entries = asArray(value);
  if (!entries.length) return <EmptyContent />;
  return entries.map((entry, index) => (
    <Text key={index} style={index > 0 ? [styles.summary, { marginTop: 8 }] : styles.summary} orphans={2} widows={2}>
      {itemBody(entry) || stringify(entry)}
    </Text>
  ));
}

function isLikelyTitle(value: string): boolean {
  const text = value.trim();
  return text.length > 0 && text.length <= 80 && !/[.!?:;]$/.test(text) && !/^[•*-]/.test(text);
}

function isLikelyBody(value: string): boolean {
  const text = value.trim();
  return text.length >= 45 || /[,]/.test(text);
}

function normalizeContentItems(value: unknown, pairStringItems: boolean): unknown[] {
  const entries = asArray(value);
  if (!pairStringItems) return entries;

  const normalized: unknown[] = [];
  for (let index = 0; index < entries.length; index += 1) {
    const current = entries[index];
    const next = entries[index + 1];
    if (typeof current === "string" && typeof next === "string" && isLikelyTitle(current) && isLikelyBody(next)) {
      normalized.push({ title: current.trim(), description: next.trim() });
      index += 1;
    } else {
      normalized.push(current);
    }
  }
  return normalized;
}

function ContentItems({
  value,
  numbered = false,
  pairStringItems = false,
}: {
  value: unknown;
  numbered?: boolean;
  pairStringItems?: boolean;
}) {
  const entries = normalizeContentItems(value, pairStringItems);
  if (!entries.length) return <EmptyContent />;

  return entries.map((entry, index) => {
    const title = itemTitle(entry);
    const body = itemBody(entry);
    const marker = `${numbered ? `${index + 1}.` : "-"} `;

    return (
      <View style={styles.itemBlock} key={index} minPresenceAhead={52}>
        {title ? (
          <Text style={styles.itemTitle} orphans={2} widows={2}>
            {numbered ? `${index + 1}. ` : ""}
            {title}
          </Text>
        ) : null}
        {body ? (
          <Text style={title ? [styles.body, styles.itemBody] : styles.body} orphans={2} widows={2}>
            {!title ? <Text style={styles.marker}>{marker}</Text> : null}
            {body}
          </Text>
        ) : null}
      </View>
    );
  });
}

function PricingContent({
  pricing,
  totals,
  currency,
}: {
  pricing: unknown;
  totals: Dictionary;
  currency: string;
}) {
  const entries = asArray(pricing);
  const grandTotal = numberValue(totals.grand_total);

  const lines = entries.map((entry, index) => {
    const line = isDictionary(entry) ? entry : {};
    const quantity = numberValue(line.quantity, 0);
    const unitPrice = line.unit_price ?? line.unitPrice;
    const discount = numberValue(line.discount, 0);
    const subtotal = line.subtotal ?? quantity * numberValue(unitPrice) - discount;
    const description = stringify(line.description) || `Engagement line ${index + 1}`;

    return (
      <View style={styles.pricingLine} key={index} minPresenceAhead={52}>
        <View style={styles.pricingCopy}>
          <Text style={styles.pricingDescription} minPresenceAhead={38} orphans={2} widows={2}>
            {description}
          </Text>
          <Text style={styles.pricingMeta}>
            Qty: {stringify(line.quantity) || "-"} - Unit: {stringify(line.unit) || "-"}
            {"\n"}
            Unit price: {displayMoney(unitPrice, currency)} - Discount: {displayMoney(discount, currency)}
          </Text>
        </View>
        <View style={styles.pricingAmount}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>{displayMoney(subtotal, currency)}</Text>
        </View>
      </View>
    );
  });

  const totalsView = (
    <View style={styles.totals} key="totals">
      <View style={styles.totalRow}>
        <Text>Subtotal</Text>
        <Text>{displayMoney(totals.subtotal, currency)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text>Discount</Text>
        <Text>{displayMoney(totals.discount, currency)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text>Taxable Amount</Text>
        <Text>{displayMoney(totals.taxable_subtotal, currency)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text>
          {stringify(totals.tax_type) || "Tax"} ({stringify(totals.tax_rate) || "0"}%)
        </Text>
        <Text>{displayMoney(totals.tax_amount, currency)}</Text>
      </View>
      <View style={[styles.totalRow, styles.grandTotal]}>
        <Text>Grand Total</Text>
        <Text>{displayMoney(grandTotal, currency)}</Text>
      </View>
    </View>
  );

  return entries.length ? [...lines, totalsView] : [<EmptyContent key="empty" />, totalsView];
}

function PaymentContent({
  schedule,
  total,
  currency,
}: {
  schedule: unknown;
  total: number;
  currency: string;
}) {
  const entries = asArray(schedule);
  if (!entries.length) return <EmptyContent />;

  return entries.map((entry, index) => {
    const milestone = isDictionary(entry) ? entry : {};
    const percentage = numberValue(milestone.percentage);
    const amount = total * percentage / 100;
    const name = stringify(milestone.name) || `Milestone ${index + 1}`;
    const trigger = stringify(milestone.trigger);
    const description = stringify(milestone.description);

    return (
      <View style={styles.paymentItem} key={index} minPresenceAhead={58}>
        <View style={styles.paymentHeader} minPresenceAhead={42}>
          <Text style={styles.paymentName}>{name}</Text>
          <Text style={styles.paymentAmount}>
            {percentage}% - {displayMoney(amount, currency)}
          </Text>
        </View>
        {trigger ? <Text style={styles.paymentTrigger}>Payment trigger: {trigger}</Text> : null}
        {description ? <Text style={styles.paymentTrigger}>{description}</Text> : null}
      </View>
    );
  });
}

export async function generateProposalPdf(
  snapshot: ProposalSnapshot,
  status?: string,
  acceptedBy?: string | null,
  acceptedAt?: string | null,
) {
  const proposal = snapshot?.proposal || {};
  const content = snapshot?.clientContent || {};
  const totals: Dictionary = snapshot?.commercialTotals || {};
  const currency = stringify(totals.currency) || "INR";
  const notes = content.clientNotes ?? content.notes;

  const document = (
    <Document
      title={`${stringify(proposal.number) || "Commercial Proposal"} Version ${stringify(proposal.version) || "1"}`}
      author="GrowXLabs"
      subject="Commercial Proposal"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} wrap={false}>
          <View style={styles.brandRow}>
            <Text style={styles.brand}>
              GrowX<Text style={styles.brandBlue}>Labs.tech</Text>
            </Text>
            <Text style={styles.confidential}>CONFIDENTIAL</Text>
          </View>
          <Text style={styles.documentTitle}>Commercial Proposal</Text>
          <View style={styles.metadata}>
            <Metadata label="Proposal Number" value={proposal.number} />
            <Metadata label="Version" value={`Version ${stringify(proposal.version) || "1"}`} />
            <Metadata label="Prepared For" value={snapshot?.preparedFor?.name} />
            <Metadata label="Company" value={snapshot?.preparedFor?.company} />
            <Metadata label="Issued Date" value={displayDate(proposal.issuedAt)} />
            <Metadata label="Valid Until" value={snapshot?.validUntil} />
          </View>
        </View>

        <Section number="01" title="Executive Summary">
          <SummaryContent value={content.executiveSummary} />
        </Section>
        <Section number="02" title="Scope of Work">
          <ContentItems value={content.scope} pairStringItems />
        </Section>
        <Section number="03" title="Deliverables">
          <ContentItems value={content.deliverables} numbered />
        </Section>
        <Section number="04" title="Timeline & Milestones">
          <ContentItems value={content.timeline ?? content.milestones} />
        </Section>
        <Section number="05" title="Assumptions">
          <ContentItems value={content.assumptions} />
        </Section>
        <Section number="06" title="Dependencies">
          <ContentItems value={content.dependencies} />
        </Section>
        <Section number="07" title="Exclusions">
          <ContentItems value={content.exclusions} />
        </Section>
        <Section number="08" title="Acceptance Criteria">
          <ContentItems value={content.acceptanceCriteria} />
        </Section>

        <Section title="Commercials & Pricing">
          <PricingContent pricing={snapshot?.pricing} totals={totals} currency={currency} />
        </Section>
        <Section title="Payment Schedule">
          <PaymentContent
            schedule={snapshot?.paymentSchedule}
            total={numberValue(totals.grand_total)}
            currency={currency}
          />
        </Section>
        <Section title="Terms & Conditions">
          <ContentItems value={content.terms} numbered />
        </Section>
        <Section title="Client Notes & Next Steps">
          {asArray(notes).length ? (
            <>
              <Text style={styles.subheading} minPresenceAhead={30}>
                Client Notes
              </Text>
              <ContentItems value={notes} />
            </>
          ) : null}
          {asArray(content.nextSteps).length ? (
            <>
              {asArray(notes).length ? (
                <Text style={[styles.subheading, { marginTop: 5 }]} minPresenceAhead={30}>
                  Next Steps
                </Text>
              ) : null}
              <ContentItems value={content.nextSteps} numbered />
            </>
          ) : !asArray(notes).length ? (
            <EmptyContent />
          ) : null}
        </Section>

        {status === "accepted" ? (
          <View style={styles.acceptance}>
            <Text style={styles.acceptanceTitle}>Accepted</Text>
            <Text style={styles.acceptanceBody} orphans={2} widows={2}>
              Accepted by {acceptedBy || "client"} on {acceptedAt ? displayDate(acceptedAt) : "recorded date"}. Accepted version {stringify(proposal.version) || "1"}.
            </Text>
          </View>
        ) : null}

        <View fixed style={styles.footer}>
          <Text>
            {stringify(proposal.number) || "Commercial Proposal"} - Version {stringify(proposal.version) || "1"} - Confidential
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );

  return Buffer.from(await renderToBuffer(document));
}
