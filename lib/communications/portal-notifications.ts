export type PortalNotification = {
  id: string;
  type: string;
  label: string;
  title: string;
  message: string;
  referenceCode: string | null;
  targetUrl: string | null;
  actionLabel: string | null;
  createdAt: string;
  validUntil: string | null;
  readAt: string | null;
  status: "read" | "unread";
};

type PortalNotificationInput = {
  id: string;
  messageType: string | null;
  variables: unknown;
  createdAt: string;
  validUntil?: string | null;
  readAt?: string | null;
};

type NotificationDefinition = {
  label: string;
  title: (referenceCode: string | null) => string;
  message: string;
  actionLabel: string;
};

const definitions: Record<string, NotificationDefinition> = {
  proposal_available: {
    label: "Proposal Available",
    title: (referenceCode) => referenceCode ? `Proposal ${referenceCode} is ready for review` : "Commercial proposal is ready for review",
    message: "Your GrowXLabs commercial proposal is available for review.",
    actionLabel: "Review Proposal",
  },
  agreement_available: {
    label: "Agreement Available",
    title: (referenceCode) => referenceCode ? `Agreement ${referenceCode} is ready for review` : "Your agreement is ready for review",
    message: "Your GrowXLabs agreement is available for review.",
    actionLabel: "Review Agreement",
  },
  invoice_available: {
    label: "Invoice Available",
    title: (referenceCode) => referenceCode ? `Invoice ${referenceCode} is ready to review` : "Your invoice is ready to review",
    message: "Your GrowXLabs invoice is available for review.",
    actionLabel: "View Invoice",
  },
  payment_submitted: {
    label: "Payment Submitted",
    title: (referenceCode) => referenceCode ? `Payment ${referenceCode} is awaiting verification` : "Payment is awaiting verification",
    message: "Your payment details were submitted and are awaiting GrowXLabs verification.",
    actionLabel: "View Payment",
  },
  payment_verified: {
    label: "Payment Verified",
    title: (referenceCode) => referenceCode ? `Payment ${referenceCode} has been verified` : "Your payment has been verified",
    message: "Your GrowXLabs payment has been verified.",
    actionLabel: "View Payment",
  },
  receipt_available: {
    label: "Receipt Available",
    title: (referenceCode) => referenceCode ? `Receipt ${referenceCode} is available` : "Your payment receipt is available",
    message: "Your GrowXLabs payment receipt is available.",
    actionLabel: "View Receipt",
  },
  payment_received: {
    label: "Payment Received",
    title: (referenceCode) => referenceCode ? `Payment ${referenceCode} has been received` : "Your payment has been received",
    message: "Your GrowXLabs payment has been recorded.",
    actionLabel: "View Payment",
  },
  onboarding_request: {
    label: "Onboarding Request",
    title: () => "Your onboarding request is ready",
    message: "Please review and complete your GrowXLabs onboarding request.",
    actionLabel: "Open Onboarding",
  },
  onboarding_available: {
    label: "Onboarding Available",
    title: () => "Your onboarding workspace is ready",
    message: "Please complete the GrowXLabs onboarding workspace.",
    actionLabel: "Open Onboarding",
  },
  onboarding_information_requested: {
    label: "Information Requested",
    title: () => "Additional onboarding information is required",
    message: "GrowXLabs requested specific additional onboarding information.",
    actionLabel: "Update Onboarding",
  },
  onboarding_approved: {
    label: "Onboarding Approved",
    title: () => "Your onboarding readiness was approved",
    message: "Your project workspace is now being prepared.",
    actionLabel: "View Project",
  },
  project_ready: {
    label: "Project Ready",
    title: (referenceCode) => referenceCode ? `Project ${referenceCode} is ready` : "Your project is ready",
    message: "Your GrowXLabs project workspace is ready.",
    actionLabel: "View Project",
  },
  kickoff_scheduled: {
    label: "Kickoff Scheduled",
    title: (referenceCode) => referenceCode ? `Kickoff ${referenceCode} is scheduled` : "Your project kickoff is scheduled",
    message: "Your GrowXLabs project kickoff has been scheduled.",
    actionLabel: "View Project",
  },
  project_update: {
    label: "Project Update",
    title: (referenceCode) => referenceCode ? `Project update for ${referenceCode}` : "Your project has an update",
    message: "There is a new update from your GrowXLabs project team.",
    actionLabel: "View Update",
  },
  approval_request: {
    label: "Approval Request",
    title: () => "Your approval is requested",
    message: "Please review the requested GrowXLabs approval.",
    actionLabel: "Review Request",
  },
  change_request: {
    label: "Change Request",
    title: (referenceCode) => referenceCode ? `Change request ${referenceCode} needs your review` : "A change request needs your review",
    message: "Please review the requested project change.",
    actionLabel: "Review Change",
  },
  support_update: {
    label: "Support Update",
    title: (referenceCode) => referenceCode ? `Support update ${referenceCode}` : "Your support request has an update",
    message: "There is a new update from your GrowXLabs support team.",
    actionLabel: "View Support Update",
  },
};

const genericDefinition: NotificationDefinition = {
  label: "GrowXLabs Update",
  title: () => "You have a new GrowXLabs update",
  message: "There is a new update available in your Client Suite.",
  actionLabel: "View Update",
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function plainText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text || null;
}

function safeReference(value: unknown): string | null {
  const reference = plainText(value);
  if (!reference || reference.length > 96 || /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(reference)) return null;
  return reference;
}

function safeTargetUrl(value: unknown): string | null {
  const targetUrl = plainText(value);
  if (!targetUrl || !targetUrl.startsWith("/client/") || targetUrl.startsWith("//") || targetUrl.includes("://")) return null;
  return targetUrl;
}

function getReferenceCode(portalData: Record<string, unknown>, variables: Record<string, unknown>, type: string): string | null {
  const candidates = [
    portalData.referenceCode,
    variables["proposalNumber"],
    variables["agreementNumber"],
    variables["invoiceNumber"],
    variables["paymentNumber"],
    variables["projectNumber"],
    variables["changeNumber"],
    variables["ticketNumber"],
    type === "proposal_available" ? variables["referenceCode"] : null,
  ];
  return candidates.map(safeReference).find(Boolean) || null;
}

export function buildPortalNotification(input: PortalNotificationInput): PortalNotification {
  const variables = asRecord(input.variables);
  const portalData = asRecord(variables.portalNotification);
  const type = plainText(portalData.type) || plainText(input.messageType) || "update";
  const definition = definitions[type] || genericDefinition;
  const referenceCode = getReferenceCode(portalData, variables, type);
  const targetUrl = safeTargetUrl(portalData.targetUrl) || (
    type === "proposal_available" && referenceCode
      ? `/client/proposals/${encodeURIComponent(referenceCode)}`
      : type === "invoice_available" && referenceCode
        ? `/client/invoices?invoiceNumber=${encodeURIComponent(referenceCode)}`
        : type === "onboarding_available" || type === "onboarding_information_requested"
          ? "/client/onboarding"
          : type === "project_ready" || type === "onboarding_approved" || type === "kickoff_scheduled"
            ? "/client/project"
            : null
  );
  const readAt = input.readAt || null;

  return {
    id: input.id,
    type,
    label: plainText(portalData.label) || definition.label,
    title: plainText(portalData.title) || definition.title(referenceCode),
    message: plainText(portalData.message) || definition.message,
    referenceCode,
    targetUrl,
    actionLabel: targetUrl ? (plainText(portalData.actionLabel) || definition.actionLabel) : null,
    createdAt: input.createdAt,
    validUntil: plainText(portalData.validUntil) || input.validUntil || null,
    readAt,
    status: readAt ? "read" : "unread",
  };
}
