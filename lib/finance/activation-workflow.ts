/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createOnboarding, mapOnboarding, recordOnboardingActivity } from "@/lib/onboarding/server";
import { enqueueCommunication } from "@/lib/communications/service";
import { recordAuditEvent } from "@/lib/activity/events";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ConsultingHttpError } from "@/lib/consulting/workflow";

type JsonRecord = Record<string, any>;
const ADMIN_ROLES = ["ADMIN", "CO_ADMIN"];
export { supabaseAdmin };

const signedAgreement = (status: string) => ["signed", "active"].includes(status);
const approvedProposal = (status: string) => ["approved", "signed", "accepted"].includes(status);
const approvedScope = (status: string) => ["approved", "signed", "ready_for_client", "client_acknowledged", "approved_internal"].includes(status);
const asRecord = (value: unknown): JsonRecord => value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const text = (value: unknown) => value === undefined || value === null ? "" : String(value).trim();
const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export async function requireFinanceAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new ConsultingHttpError(401, "Authentication required.");
  if (!ADMIN_ROLES.includes(session.user.role)) throw new ConsultingHttpError(403, "Finance permission is required.");
  return { userId: session.user.id };
}

export async function requireFinanceClient() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "CLIENT") throw new ConsultingHttpError(403, "A client account is required.");
  const { data, error } = await supabaseAdmin.from("client_profiles").select("id,user_id,company_id").eq("user_id", session.user.id).maybeSingle();
  if (error || !data) throw new ConsultingHttpError(403, "Client account is not linked.");
  return { userId: session.user.id, clientId: data.id, companyId: data.company_id as string | null };
}

export function financeError(error: unknown) {
  return Response.json({ error: error instanceof Error ? error.message : "Finance workflow request failed." }, { status: error instanceof ConsultingHttpError ? error.status : 500 });
}

async function log(entityType: string, entityId: string, actorId: string | null, eventType: string, metadata: JsonRecord = {}) {
  const { error } = await supabaseAdmin.from("finance_activation_activity").insert({ entity_type: entityType, entity_id: entityId, actor_id: actorId, event_type: eventType, metadata });
  if (error) throw new Error(error.message);
}

function amount(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new ConsultingHttpError(400, "Financial amounts must be valid non-negative numbers.");
  return roundMoney(n);
}

function acceptedVersionId(agreement: JsonRecord, proposal: JsonRecord) {
  return text(agreement.proposal_version_id) || text(proposal.accepted_version_id) || text(proposal.current_version_id);
}

function normalizeMilestones(value: unknown) {
  const milestones = asArray(value).map((entry, index) => {
    const item = asRecord(entry);
    const percentage = Number(item.percentage ?? item.percent ?? item.percentage_of_total);
    if (!text(item.name) || !Number.isFinite(percentage) || percentage <= 0) return null;
    return { name: text(item.name) || `Milestone ${index + 1}`, percentage, trigger: text(item.trigger) || "As agreed in the accepted proposal", description: text(item.description) };
  }).filter(Boolean) as Array<{ name: string; percentage: number; trigger: string; description: string }>;
  const total = roundMoney(milestones.reduce((sum, item) => sum + item.percentage, 0));
  if (!milestones.length || total !== 100) throw new ConsultingHttpError(409, "The accepted proposal payment schedule is missing or does not total 100%.");
  return milestones;
}

function totalFromSnapshot(snapshot: JsonRecord, pricing: JsonRecord[]) {
  const totals = asRecord(snapshot.commercialTotals);
  const total = Number(totals.grand_total ?? totals.grandTotal ?? totals.total);
  if (Number.isFinite(total) && total > 0) return amount(total);
  return amount(pricing.reduce((sum, item) => sum + Number(item.subtotal ?? item.amount ?? item.total ?? 0), 0));
}

function taxBreakdown(snapshot: JsonRecord, totals: JsonRecord, milestonePercentage: number) {
  const configured = asArray(snapshot.taxBreakdown).length ? asArray(snapshot.taxBreakdown) : asArray(totals.tax_breakdown ?? totals.taxBreakdown);
  return configured.map((entry): JsonRecord | null => {
    const item = asRecord(entry);
    const rawAmount = Number(item.amount ?? 0);
    if (!Number.isFinite(rawAmount) || rawAmount <= 0) return null;
    const rawTaxableValue = item.taxableValue === undefined ? undefined : Number(item.taxableValue);
    return { ...item, amount: amount(rawAmount * milestonePercentage / 100), taxableValue: rawTaxableValue === undefined || !Number.isFinite(rawTaxableValue) ? undefined : amount(rawTaxableValue * milestonePercentage / 100) };
  }).filter((item): item is JsonRecord => item !== null && Number(item.amount) > 0);
}

async function acceptedCommercialSource(agreement: JsonRecord, proposal: JsonRecord) {
  const versionId = acceptedVersionId(agreement, proposal);
  if (!versionId) throw new ConsultingHttpError(409, "The accepted proposal snapshot is unavailable.");
  const result = await supabaseAdmin.from("commercial_document_versions").select("id,version,snapshot,content_hash").eq("id", versionId).eq("document_type", "proposal").eq("document_id", proposal.id).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) throw new ConsultingHttpError(409, "The accepted proposal snapshot is unavailable.");
  const snapshot = asRecord(result.data.snapshot);
  if (text(asRecord(snapshot.proposal).id) && text(asRecord(snapshot.proposal).id) !== text(proposal.id)) throw new ConsultingHttpError(409, "The accepted proposal snapshot does not match the proposal.");
  const pricing = asArray(snapshot.pricing).map(asRecord);
  const totals = asRecord(snapshot.commercialTotals);
  const schedule = normalizeMilestones(snapshot.paymentSchedule);
  const totalEngagementValue = totalFromSnapshot(snapshot, pricing);
  const taxableValue = amount(Number(totals.taxable_subtotal ?? totals.taxableSubtotal ?? totals.subtotal ?? totalEngagementValue));
  const discount = amount(Number(totals.discount ?? totals.discount_total ?? 0));
  const subtotal = amount(Number(totals.subtotal ?? taxableValue + discount));
  const taxTotal = amount(Number(totals.tax_amount ?? totals.tax_total ?? Math.max(0, totalEngagementValue - taxableValue)));
  return { version: result.data, snapshot, pricing, totals, schedule, totalEngagementValue, taxableValue, discount, subtotal, taxTotal };
}

function invoiceMilestone(invoice: JsonRecord) {
  const instructions = asRecord(invoice.payment_instructions);
  const index = Number(instructions.milestoneIndex ?? instructions.milestone_index);
  return Number.isInteger(index) && index >= 0 ? index : null;
}

function scheduleAmounts(total: number, schedule: Array<{ percentage: number }>) {
  return schedule.map((milestone, index) => index === schedule.length - 1
    ? roundMoney(total - schedule.slice(0, index).reduce((sum, item) => sum + roundMoney(total * item.percentage / 100), 0))
    : roundMoney(total * milestone.percentage / 100));
}

async function clientIdentity(clientId: string) {
  const profileResult = await supabaseAdmin.from("client_profiles").select("id,user_id,company_id").eq("id", clientId).maybeSingle();
  if (profileResult.error) throw new Error(profileResult.error.message);
  if (!profileResult.data) throw new ConsultingHttpError(409, "Client profile is missing.");
  const userResult = await supabaseAdmin.from("users").select("id,name,email").eq("id", profileResult.data.user_id).maybeSingle();
  if (userResult.error) throw new Error(userResult.error.message);
  const companyResult = profileResult.data.company_id ? await supabaseAdmin.from("companies").select("*").eq("id", profileResult.data.company_id).maybeSingle() : { data: null, error: null };
  if (companyResult.error) throw new Error(companyResult.error.message);
  return { profile: profileResult.data, user: userResult.data, company: companyResult.data };
}

export async function notifyClient(input: { clientId: string; senderId: string; messageType: string; subject: string; body: string; referenceCode?: string | null; targetUrl: string; actionLabel: string; relatedEntityType: string; relatedEntityId: string; companyId?: string | null; projectId?: string | null; variables?: JsonRecord }) {
  const identity = await clientIdentity(input.clientId);
  if (!identity.user?.email) return null;
  const portalNotification = { type: input.messageType, title: input.subject, message: input.body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(), referenceCode: input.referenceCode || null, targetUrl: input.targetUrl, actionLabel: input.actionLabel };
  return enqueueCommunication({ channel: "email", messageType: input.messageType, subject: input.subject, body: input.body, email: identity.user.email, displayName: identity.user.name, relatedEntityType: input.relatedEntityType, relatedEntityId: input.relatedEntityId, clientId: input.clientId, companyId: input.companyId ?? identity.profile.company_id, projectId: input.projectId, variables: { ...input.variables, portalNotification } }, input.senderId);
}

export async function createAdvanceInvoice(agreementId: string, userId: string, milestoneIndex = 0, triggerConfirmed = false) {
  const agreementResult = await supabaseAdmin.from("master_service_agreements").select("*").eq("id", agreementId).maybeSingle();
  if (agreementResult.error) throw new Error(agreementResult.error.message);
  const agreement = agreementResult.data as JsonRecord | null;
  if (!agreement) throw new ConsultingHttpError(404, "Master Service Agreement not found.");
  if (!signedAgreement(agreement.status)) throw new ConsultingHttpError(409, "The agreement must be signed before invoicing.");
  const proposalResult = await supabaseAdmin.from("commercial_proposals").select("*").eq("id", agreement.proposal_id).maybeSingle();
  if (proposalResult.error) throw new Error(proposalResult.error.message);
  const proposal = proposalResult.data as JsonRecord | null;
  if (!proposal || !approvedProposal(proposal.status)) throw new ConsultingHttpError(409, "An approved proposal is required before invoicing.");
  const scopeResult = await supabaseAdmin.from("scopes_of_work").select("*").eq("id", agreement.scope_of_work_id || proposal.scope_of_work_id).maybeSingle();
  if (scopeResult.error) throw new Error(scopeResult.error.message);
  const scope = scopeResult.data as JsonRecord | null;
  if (!scope || !approvedScope(scope.status)) throw new ConsultingHttpError(409, "An approved Scope of Work is required before invoicing.");
  const source = await acceptedCommercialSource(agreement, proposal);
  if (!Number.isInteger(milestoneIndex) || milestoneIndex < 0 || milestoneIndex >= source.schedule.length) throw new ConsultingHttpError(400, "The requested payment milestone is not present in the accepted proposal.");
  if (milestoneIndex > 0 && !triggerConfirmed) throw new ConsultingHttpError(409, "Confirm that the accepted commercial trigger for this milestone has been reached before issuing its invoice.");
  const existingResult = await supabaseAdmin.from("consulting_advance_invoices").select("*").eq("agreement_id", agreementId).not("status", "in", "(cancelled,void)").order("created_at", { ascending: true });
  if (existingResult.error) throw new Error(existingResult.error.message);
  const existing = (existingResult.data || []) as JsonRecord[];
  const current = existing.find((invoice) => invoiceMilestone(invoice) === milestoneIndex);
  if (current) return current;
  const legacyFirst = milestoneIndex === 0 && existing.find((invoice) => invoiceMilestone(invoice) === null);
  if (legacyFirst && Number(legacyFirst.amount_paid || 0) === 0 && legacyFirst.status === "draft") {
    const milestone = source.schedule[0];
    const milestoneAmount = scheduleAmounts(source.totalEngagementValue, source.schedule)[0];
    const ratio = milestone.percentage / 100;
    const update = { subtotal: amount(source.subtotal * ratio), discount_total: amount(source.discount * ratio), tax_total: amount(source.taxTotal * ratio), total: milestoneAmount, balance_due: milestoneAmount, line_items: [{ ...source.pricing[0], description: milestone.description || milestone.name, quantity: 1, unit: "milestone", unit_price: amount(source.subtotal * ratio), subtotal: amount(source.taxableValue * ratio), milestone_index: 0, milestone_percentage: milestone.percentage }], tax_breakdown: taxBreakdown(source.snapshot, source.totals, milestone.percentage), payment_instructions: { schedule: source.schedule, totalEngagementValue: source.totalEngagementValue, milestoneIndex: 0, milestonePercentage: milestone.percentage, milestoneAmount, remainingEngagementBalance: amount(source.totalEngagementValue - milestoneAmount), trigger: milestone.trigger, milestoneDescription: milestone.description || milestone.name, paymentConfiguration: asRecord(source.snapshot.paymentInstructions) } };
    const repaired = await supabaseAdmin.from("consulting_advance_invoices").update({ ...update, updated_at: new Date().toISOString() }).eq("id", legacyFirst.id).select("*").single();
    if (repaired.error) throw new Error(repaired.error.message);
    await log("invoice", legacyFirst.id, userId, "invoice_milestone_repaired", { invoiceNumber: legacyFirst.invoice_number, milestoneIndex: 0, milestoneAmount });
    return repaired.data;
  }
  if (legacyFirst) throw new ConsultingHttpError(409, "A legacy invoice already exists for this agreement and cannot be replaced safely after payment or issue. Resolve that invoice before creating the corrected milestone invoice.");
  const milestone = source.schedule[milestoneIndex];
  const milestoneAmounts = scheduleAmounts(source.totalEngagementValue, source.schedule);
  const milestoneAmount = milestoneAmounts[milestoneIndex];
  const ratio = milestone.percentage / 100;
  const issuedAt = new Date().toISOString();
  const lineItem = { description: milestone.description || milestone.name, quantity: 1, unit: "milestone", unit_price: amount(source.subtotal * ratio), discount: amount(source.discount * ratio), subtotal: amount(source.taxableValue * ratio), milestone_index: milestoneIndex, milestone_percentage: milestone.percentage };
  const paymentInstructions = { schedule: source.schedule, totalEngagementValue: source.totalEngagementValue, milestoneIndex, milestonePercentage: milestone.percentage, milestoneAmount, remainingEngagementBalance: amount(source.totalEngagementValue - existing.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0) - milestoneAmount), trigger: milestone.trigger, milestoneDescription: milestone.description || milestone.name, paymentConfiguration: asRecord(source.snapshot.paymentInstructions) };
  const { data: invoice, error: insertError } = await supabaseAdmin.from("consulting_advance_invoices").insert({ agreement_id: agreement.id, proposal_id: proposal.id, scope_id: scope.id, client_id: agreement.client_id, company_id: agreement.company_id, deal_id: agreement.deal_id, status: "approved", currency: proposal.currency || asRecord(source.totals).currency || "INR", subtotal: amount(source.subtotal * ratio), discount_total: amount(source.discount * ratio), tax_total: amount(source.taxTotal * ratio), total: milestoneAmount, balance_due: milestoneAmount, line_items: [lineItem], tax_breakdown: taxBreakdown(source.snapshot, source.totals, milestone.percentage), payment_instructions: paymentInstructions, due_date: text(source.snapshot.dueDate) || null, issued_at: issuedAt, created_by: userId }).select("*").single();
  if (insertError) throw new Error(insertError.message);
  await log("invoice", invoice.id, userId, "invoice_created", { invoiceNumber: invoice.invoice_number, milestoneIndex, milestonePercentage: milestone.percentage, milestoneAmount, totalEngagementValue: source.totalEngagementValue, remainingEngagementBalance: paymentInstructions.remainingEngagementBalance, trigger: milestone.trigger, proposalNumber: proposal.proposal_number, agreementNumber: agreement.agreement_number, scopeNumber: scope.scope_number });
  await recordAuditEvent({ actorId: userId, action: "consulting_invoice.created", resourceType: "consulting_advance_invoice", resourceId: invoice.id, clientId: invoice.client_id, companyId: invoice.company_id, metadata: { invoiceNumber: invoice.invoice_number, milestoneIndex, milestoneAmount } });
  return invoice;
}

export async function issueConsultingInvoice(invoiceId: string, userId: string) {
  const result = await supabaseAdmin.from("consulting_advance_invoices").select("*").eq("id", invoiceId).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) throw new ConsultingHttpError(404, "Invoice not found.");
  if (["cancelled", "void", "paid"].includes(result.data.status)) throw new ConsultingHttpError(409, "This invoice cannot be issued in its current state.");
  const now = new Date().toISOString();
  const updated = await supabaseAdmin.from("consulting_advance_invoices").update({ status: "sent", issued_at: result.data.issued_at || now, sent_at: now, updated_at: now }).eq("id", invoiceId).select("*").single();
  if (updated.error) throw new Error(updated.error.message);
  const communication = await notifyClient({ clientId: result.data.client_id, senderId: userId, messageType: "invoice_available", subject: `Invoice ${result.data.invoice_number} is ready`, body: `<p>Your GrowXLabs consulting invoice <strong>${result.data.invoice_number}</strong> is ready in the Client Suite.</p><p>Amount due: <strong>${result.data.currency} ${Number(result.data.balance_due).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>.</p>`, referenceCode: result.data.invoice_number, targetUrl: `/client/invoices?invoiceNumber=${encodeURIComponent(result.data.invoice_number)}`, actionLabel: "View Invoice", relatedEntityType: "consulting_advance_invoice", relatedEntityId: result.data.id, companyId: result.data.company_id, variables: { invoiceNumber: result.data.invoice_number } });
  await log("invoice", invoiceId, userId, "invoice_issued", { invoiceNumber: result.data.invoice_number, communicationMessageId: communication?.id || null });
  return updated.data;
}

async function resolveInvoice(invoiceReference: string, clientId: string) {
  const query = invoiceReference.startsWith("GXL-")
    ? supabaseAdmin.from("consulting_advance_invoices").select("*").eq("invoice_number", invoiceReference).eq("client_id", clientId).maybeSingle()
    : supabaseAdmin.from("consulting_advance_invoices").select("*").eq("id", invoiceReference).eq("client_id", clientId).maybeSingle();
  const result = await query;
  if (result.error) throw new Error(result.error.message);
  if (!result.data) throw new ConsultingHttpError(404, "Invoice not found.");
  return result.data;
}

export async function submitPayment(invoiceReference: string, clientId: string, input: JsonRecord) {
  const invoice = await resolveInvoice(invoiceReference, clientId);
  if (["cancelled", "void", "paid"].includes(invoice.status)) throw new ConsultingHttpError(409, "This invoice cannot accept another payment.");
  const paymentAmount = amount(input.amount);
  if (paymentAmount <= 0 || paymentAmount > Number(invoice.balance_due)) throw new ConsultingHttpError(400, "Payment amount must be greater than zero and no more than the balance due.");
  const { data: payment, error: insertError } = await supabaseAdmin.from("consulting_payments").insert({ invoice_id: invoice.id, client_id: clientId, company_id: invoice.company_id, amount: paymentAmount, currency: invoice.currency, method: input.method, transaction_reference: text(input.transactionReference) || null, proof_path: text(input.proofPath) || null, status: "verification_required" }).select("id,payment_number,invoice_id,amount,currency,method,transaction_reference,status,submitted_at").single();
  if (insertError) throw new Error(insertError.message);
  const identity = await clientIdentity(clientId);
  await log("payment", payment.id, identity.user?.id || clientId, "payment_submitted", { invoiceNumber: invoice.invoice_number, paymentNumber: payment.payment_number, amount: paymentAmount });
  await notifyClient({ clientId, senderId: identity.user?.id || clientId, messageType: "payment_submitted", subject: `Payment ${payment.payment_number} submitted`, body: `<p>Your payment details for invoice <strong>${invoice.invoice_number}</strong> were submitted and are awaiting GrowXLabs verification.</p>`, referenceCode: payment.payment_number, targetUrl: `/client/invoices?invoiceNumber=${encodeURIComponent(invoice.invoice_number)}`, actionLabel: "View Payment", relatedEntityType: "consulting_payment", relatedEntityId: payment.id, companyId: invoice.company_id, variables: { invoiceNumber: invoice.invoice_number, paymentNumber: payment.payment_number } });
  return payment;
}

async function unlockOnboarding(invoice: JsonRecord, userId: string) {
  const existingResult = await supabaseAdmin.from("client_onboardings").select("*").eq("client_id", invoice.client_id).neq("status", "completed").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (existingResult.error) throw new Error(existingResult.error.message);
  let onboarding = existingResult.data ? mapOnboarding(existingResult.data) : null;
  if (!onboarding) {
    onboarding = await createOnboarding({ clientId: invoice.client_id, proposalId: invoice.proposal_id, agreementId: invoice.agreement_id, scopeId: invoice.scope_id, invoiceId: invoice.id, ownerId: userId }, userId);
  } else {
    const now = new Date().toISOString();
    const update: JsonRecord = { agreement_id: onboarding.agreementId || invoice.agreement_id, proposal_id: onboarding.proposalId || invoice.proposal_id, scope_id: (onboarding as JsonRecord).scopeId || invoice.scope_id, invoice_id: (onboarding as JsonRecord).invoiceId || invoice.id, company_id: onboarding.companyId || invoice.company_id, deal_id: onboarding.dealId || invoice.deal_id, updated_at: now };
    if (["not_started"].includes(onboarding.status)) { update.status = "invited"; update.invited_at = now; }
    const updated = await supabaseAdmin.from("client_onboardings").update(update).eq("id", onboarding.id).select("*").single();
    if (updated.error) throw new Error(updated.error.message);
    onboarding = mapOnboarding(updated.data);
  }
  if (onboarding.status === "not_started") {
    const now = new Date().toISOString();
    const invited = await supabaseAdmin.from("client_onboardings").update({ status: "invited", invited_at: now, updated_at: now }).eq("id", onboarding.id).select("*").single();
    if (invited.error) throw new Error(invited.error.message);
    onboarding = mapOnboarding(invited.data);
  }
  await recordOnboardingActivity(onboarding, userId, "onboarding_unlocked", "client", { invoiceNumber: invoice.invoice_number, agreementNumber: invoice.agreement_number || null, scopeNumber: invoice.scope_number || null });
  await log("onboarding", onboarding.id, userId, "onboarding_unlocked", { onboardingNumber: onboarding.onboardingNumber, invoiceNumber: invoice.invoice_number });
  const communication = await notifyClient({ clientId: invoice.client_id, senderId: userId, messageType: "onboarding_available", subject: "Your GrowXLabs onboarding is ready", body: `<p>Your initial payment has been verified. Please complete the GrowXLabs onboarding workspace for this engagement.</p>`, referenceCode: onboarding.onboardingNumber, targetUrl: "/client/onboarding", actionLabel: "Open Onboarding", relatedEntityType: "client_onboarding", relatedEntityId: onboarding.id, companyId: invoice.company_id, variables: { invoiceNumber: invoice.invoice_number, onboardingNumber: onboarding.onboardingNumber } });
  return { onboarding, communication };
}

async function createReceipt(payment: JsonRecord, invoice: JsonRecord, balance: number, verifiedAt: string, userId: string) {
  const existing = await supabaseAdmin.from("consulting_payment_receipts").select("*").eq("payment_id", payment.id).maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return existing.data;
  const receipt = await supabaseAdmin.from("consulting_payment_receipts").insert({ payment_id: payment.id, invoice_id: invoice.id, client_id: payment.client_id, amount: payment.amount, balance_after: balance, snapshot: { receiptNumber: "assigned by database", paymentNumber: payment.payment_number, invoiceNumber: invoice.invoice_number, client: invoice.client_name || null, company: invoice.company_name || null, paymentDate: payment.verified_at || verifiedAt, verifiedAmount: payment.amount, paymentMethod: payment.method, transactionReference: payment.transaction_reference || null, currency: invoice.currency, agreementNumber: invoice.agreement_number || null, milestone: asRecord(invoice.payment_instructions).milestoneDescription || null, verifiedAt, verifiedBy: userId } }).select("*").single();
  if (receipt.error) throw new Error(receipt.error.message);
  await log("receipt", receipt.data.id, userId, "receipt_generated", { receiptNumber: receipt.data.receipt_number, paymentNumber: payment.payment_number, invoiceNumber: invoice.invoice_number });
  return receipt.data;
}

export async function verifyPayment(paymentId: string, userId: string, verified: boolean) {
  const result = await supabaseAdmin.from("consulting_payments").select("*, consulting_advance_invoices(*)").eq("id", paymentId).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) throw new ConsultingHttpError(404, "Payment not found.");
  if (result.data.status === "verified") return result.data;
  const payment = result.data as JsonRecord;
  const invoice = asRecord(payment.consulting_advance_invoices);
  if (!invoice.id) throw new ConsultingHttpError(409, "The payment invoice could not be loaded.");
  const verifiedAt = new Date().toISOString();
  const nextStatus = verified ? "verified" : "failed";
  const update = await supabaseAdmin.from("consulting_payments").update({ status: nextStatus, verified_at: verified ? verifiedAt : null, verified_by: verified ? userId : null, updated_at: verifiedAt }).eq("id", paymentId).eq("status", "verification_required").select("*").maybeSingle();
  if (update.error) throw new Error(update.error.message);
  if (!update.data) throw new ConsultingHttpError(409, "This payment has already been processed.");
  if (!verified) { await log("payment", paymentId, userId, "payment_rejected", { paymentNumber: payment.payment_number, invoiceNumber: invoice.invoice_number }); return { ...payment, status: nextStatus }; }
  const newPaid = amount(Number(invoice.amount_paid) + Number(payment.amount));
  const balance = amount(Math.max(0, Number(invoice.total) - newPaid));
  const invoiceStatus = balance === 0 ? "paid" : "partially_paid";
  const invoiceUpdate = await supabaseAdmin.from("consulting_advance_invoices").update({ amount_paid: newPaid, balance_due: balance, status: invoiceStatus, updated_at: verifiedAt }).eq("id", invoice.id).select("*").single();
  if (invoiceUpdate.error) throw new Error(invoiceUpdate.error.message);
  const updatedInvoice = { ...invoice, ...invoiceUpdate.data };
  const paymentCommunication = await notifyClient({ clientId: payment.client_id, senderId: userId, messageType: "payment_verified", subject: `Payment ${payment.payment_number} verified`, body: `<p>GrowXLabs verified payment <strong>${payment.payment_number}</strong> for invoice <strong>${invoice.invoice_number}</strong>.</p><p>Verified amount: <strong>${invoice.currency} ${Number(payment.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>.</p>`, referenceCode: payment.payment_number, targetUrl: `/client/invoices?invoiceNumber=${encodeURIComponent(invoice.invoice_number)}`, actionLabel: "View Invoice", relatedEntityType: "consulting_payment", relatedEntityId: payment.id, companyId: invoice.company_id });
  const identity = await clientIdentity(payment.client_id);
  const [agreementReference, scopeReference] = await Promise.all([supabaseAdmin.from("master_service_agreements").select("agreement_number").eq("id", invoice.agreement_id).maybeSingle(), supabaseAdmin.from("scopes_of_work").select("scope_number").eq("id", invoice.scope_id).maybeSingle()]);
  if (agreementReference.error) throw new Error(agreementReference.error.message);
  if (scopeReference.error) throw new Error(scopeReference.error.message);
  const receiptInvoice = { ...updatedInvoice, agreement_number: agreementReference.data?.agreement_number || null, scope_number: scopeReference.data?.scope_number || null, client_name: identity.user?.name || null, company_name: identity.company?.name || identity.company?.company_name || null };
  const receipt = await createReceipt({ ...payment, ...update.data }, receiptInvoice, balance, verifiedAt, userId);
  const receiptCommunication = await notifyClient({ clientId: payment.client_id, senderId: userId, messageType: "receipt_available", subject: `Receipt ${receipt.receipt_number} is available`, body: `<p>Your payment receipt <strong>${receipt.receipt_number}</strong> is available for invoice <strong>${invoice.invoice_number}</strong>.</p>`, referenceCode: receipt.receipt_number, targetUrl: `/client/invoices?invoiceNumber=${encodeURIComponent(invoice.invoice_number)}`, actionLabel: "View Receipt", relatedEntityType: "consulting_payment_receipt", relatedEntityId: receipt.id, companyId: invoice.company_id, variables: { paymentNumber: payment.payment_number, receiptNumber: receipt.receipt_number } });
  let onboarding: JsonRecord | null = null;
  if (balance === 0 && invoiceMilestone(invoice) === 0) onboarding = (await unlockOnboarding({ ...updatedInvoice, agreement_number: invoice.agreement_number, scope_number: invoice.scope_number }, userId)).onboarding as unknown as JsonRecord;
  await log("payment", paymentId, userId, "payment_verified", { invoiceNumber: invoice.invoice_number, paymentNumber: payment.payment_number, balance, receiptNumber: receipt.receipt_number, onboardingNumber: onboarding?.onboardingNumber || null });
  await recordAuditEvent({ actorId: userId, action: "consulting_payment.verified", resourceType: "consulting_payment", resourceId: paymentId, clientId: payment.client_id, companyId: invoice.company_id, metadata: { invoiceNumber: invoice.invoice_number, paymentNumber: payment.payment_number, receiptNumber: receipt.receipt_number, balance } });
  return { ...payment, ...update.data, invoiceStatus, balance, receipt: { receiptNumber: receipt.receipt_number }, onboarding: onboarding ? { onboardingNumber: onboarding.onboardingNumber, status: onboarding.status } : null, communicationMessageIds: [paymentCommunication?.id, receiptCommunication?.id].filter(Boolean) };
}

export async function notifyOnboardingApproved(onboarding: JsonRecord, userId: string) {
  if (!onboarding.clientId) return null;
  return notifyClient({ clientId: onboarding.clientId, senderId: userId, messageType: "onboarding_approved", subject: "Onboarding readiness approved", body: "<p>GrowXLabs approved your onboarding readiness. Your project workspace is now being prepared.</p>", referenceCode: onboarding.onboardingNumber, targetUrl: "/client/project", actionLabel: "View Project", relatedEntityType: "client_onboarding", relatedEntityId: onboarding.id, companyId: onboarding.companyId, variables: { onboardingNumber: onboarding.onboardingNumber } });
}

export async function activateProject(agreementId: string, userId: string) {
  const agreementResult = await supabaseAdmin.from("master_service_agreements").select("*").eq("id", agreementId).maybeSingle();
  if (agreementResult.error) throw new Error(agreementResult.error.message);
  const agreement = agreementResult.data as JsonRecord | null;
  if (!agreement || !signedAgreement(agreement.status)) throw new ConsultingHttpError(409, "A signed agreement is required for activation.");
  const proposalResult = await supabaseAdmin.from("commercial_proposals").select("*").eq("id", agreement.proposal_id).maybeSingle();
  if (proposalResult.error) throw new Error(proposalResult.error.message);
  const proposal = proposalResult.data as JsonRecord | null;
  if (!proposal || !approvedProposal(proposal.status)) throw new ConsultingHttpError(409, "Approved commercial documents are required for activation.");
  const scopeResult = await supabaseAdmin.from("scopes_of_work").select("*").eq("id", agreement.scope_of_work_id || proposal.scope_of_work_id).maybeSingle();
  if (scopeResult.error) throw new Error(scopeResult.error.message);
  const scope = scopeResult.data as JsonRecord | null;
  if (!scope || !approvedScope(scope.status)) throw new ConsultingHttpError(409, "Approved commercial documents are required for activation.");
  const invoiceResult = await supabaseAdmin.from("consulting_advance_invoices").select("*").eq("agreement_id", agreementId).eq("status", "paid").order("created_at", { ascending: true });
  if (invoiceResult.error) throw new Error(invoiceResult.error.message);
  const initialInvoice = (invoiceResult.data || []).find((invoice: JsonRecord) => invoiceMilestone(invoice) === 0);
  if (!initialInvoice) throw new ConsultingHttpError(409, "Verified initial milestone payment is required for activation.");
  const onboardingResult = await supabaseAdmin.from("client_onboardings").select("*,onboarding_readiness_checks(*)").eq("agreement_id", agreementId).neq("status", "completed").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (onboardingResult.error) throw new Error(onboardingResult.error.message);
  const onboarding = onboardingResult.data as JsonRecord | null;
  if (!onboarding || !["ready_for_kickoff", "completed"].includes(text(onboarding.status))) throw new ConsultingHttpError(409, "Client onboarding must be submitted and explicitly approved before activation.");
  const checks = asArray(onboarding.onboarding_readiness_checks);
  if (checks.length !== 9 || !checks.every((check) => asRecord(check).complete === true)) throw new ConsultingHttpError(409, "All nine onboarding readiness checks must be complete before activation.");
  const existing = await supabaseAdmin.from("consulting_projects").select("*, consulting_kickoffs(*)").eq("agreement_id", agreementId).maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return existing.data;
  const { data: project, error } = await supabaseAdmin.from("consulting_projects").insert({ agreement_id: agreement.id, proposal_id: proposal.id, scope_id: scope.id, invoice_id: initialInvoice.id, client_id: agreement.client_id, company_id: agreement.company_id, deal_id: agreement.deal_id, status: "active", activated_at: new Date().toISOString(), created_by: userId }).select("*").single();
  if (error) throw new Error(error.message);
  const kickoffResult = await supabaseAdmin.from("consulting_kickoffs").insert({ project_id: project.id, client_id: project.client_id, status: "preparation", agenda: ["Confirm objectives", "Review scope and milestones", "Confirm stakeholders and access"], preparation: { sourceScope: scope.scope_number }, created_by: userId }).select("*").single();
  if (kickoffResult.error) throw new Error(kickoffResult.error.message);
  await supabaseAdmin.from("client_onboardings").update({ project_id: project.id, updated_at: new Date().toISOString() }).eq("id", onboarding.id);
  await log("project", project.id, userId, "project_activated", { projectNumber: project.project_number, kickoffNumber: kickoffResult.data.kickoff_number, onboardingNumber: onboarding.onboarding_number });
  await recordAuditEvent({ actorId: userId, action: "consulting_project.activated", resourceType: "consulting_project", resourceId: project.id, clientId: project.client_id, companyId: project.company_id, metadata: { projectNumber: project.project_number, agreementNumber: agreement.agreement_number, onboardingNumber: onboarding.onboarding_number } });
  await notifyClient({ clientId: project.client_id, senderId: userId, messageType: "project_ready", subject: `Project ${project.project_number} is ready`, body: `<p>Your GrowXLabs project workspace <strong>${project.project_number}</strong> is ready. Kickoff preparation is now available.</p>`, referenceCode: project.project_number, targetUrl: "/client/project", actionLabel: "View Project", relatedEntityType: "consulting_project", relatedEntityId: project.id, companyId: project.company_id, projectId: project.id, variables: { projectNumber: project.project_number, kickoffNumber: kickoffResult.data.kickoff_number } });
  return { ...project, kickoff: kickoffResult.data };
}

export async function scheduleKickoff(kickoffId: string, userId: string, scheduledFor: string) {
  if (!scheduledFor || Number.isNaN(new Date(scheduledFor).getTime())) throw new ConsultingHttpError(400, "A valid kickoff date and time are required.");
  const result = await supabaseAdmin.from("consulting_kickoffs").select("*, consulting_projects(*)").eq("id", kickoffId).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) throw new ConsultingHttpError(404, "Kickoff workspace not found.");
  const project = asRecord(result.data.consulting_projects);
  const updated = await supabaseAdmin.from("consulting_kickoffs").update({ status: "scheduled", scheduled_for: new Date(scheduledFor).toISOString(), updated_at: new Date().toISOString() }).eq("id", kickoffId).select("*").single();
  if (updated.error) throw new Error(updated.error.message);
  await log("kickoff", kickoffId, userId, "kickoff_scheduled", { kickoffNumber: result.data.kickoff_number, scheduledFor: updated.data.scheduled_for });
  await notifyClient({ clientId: result.data.client_id, senderId: userId, messageType: "kickoff_scheduled", subject: `Kickoff ${result.data.kickoff_number} is scheduled`, body: `<p>Your GrowXLabs kickoff <strong>${result.data.kickoff_number}</strong> is scheduled for ${new Date(scheduledFor).toLocaleString("en-IN")}.</p>`, referenceCode: result.data.kickoff_number, targetUrl: "/client/project", actionLabel: "View Project", relatedEntityType: "consulting_kickoff", relatedEntityId: kickoffId, companyId: project.company_id, projectId: project.id, variables: { kickoffNumber: result.data.kickoff_number, scheduledFor: updated.data.scheduled_for } });
  return updated.data;
}

export async function completeKickoff(kickoffId: string, userId: string, input: JsonRecord = {}) {
  const { data: kickoff, error } = await supabaseAdmin.from("consulting_kickoffs").select("*, consulting_projects(*)").eq("id", kickoffId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!kickoff) throw new ConsultingHttpError(404, "Kickoff workspace not found.");
  const { data, error: updateError } = await supabaseAdmin.from("consulting_kickoffs").update({ status: "completed", meeting_details: input.meetingDetails || kickoff.meeting_details, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", kickoffId).select("*").single();
  if (updateError) throw new Error(updateError.message);
  await supabaseAdmin.from("consulting_projects").update({ status: "active", updated_at: new Date().toISOString() }).eq("id", kickoff.project_id);
  await log("kickoff", kickoffId, userId, "kickoff_completed", { kickoffNumber: kickoff.kickoff_number });
  return data;
}

export async function getConsultingInvoiceDocument(reference: string, clientId?: string) {
  let query = supabaseAdmin.from("consulting_advance_invoices").select("*");
  query = reference.startsWith("GXL-") ? query.eq("invoice_number", reference) : query.eq("id", reference);
  if (clientId) query = query.eq("client_id", clientId);
  const invoiceResult = await query.maybeSingle();
  if (invoiceResult.error) throw new Error(invoiceResult.error.message);
  if (!invoiceResult.data) throw new ConsultingHttpError(404, "Invoice not found.");
  const invoice = invoiceResult.data as JsonRecord;
  const [agreementResult, proposalResult, scopeResult, profileResult, paymentsResult, receiptsResult] = await Promise.all([
    supabaseAdmin.from("master_service_agreements").select("id,agreement_number,content,effective_at").eq("id", invoice.agreement_id).maybeSingle(),
    supabaseAdmin.from("commercial_proposals").select("id,proposal_number,currency").eq("id", invoice.proposal_id).maybeSingle(),
    supabaseAdmin.from("scopes_of_work").select("id,scope_number,content").eq("id", invoice.scope_id).maybeSingle(),
    supabaseAdmin.from("client_profiles").select("id,user_id,company_id").eq("id", invoice.client_id).maybeSingle(),
    supabaseAdmin.from("consulting_payments").select("id,payment_number,amount,currency,method,transaction_reference,status,submitted_at,verified_at").eq("invoice_id", invoice.id).order("submitted_at", { ascending: false }),
    supabaseAdmin.from("consulting_payment_receipts").select("id,receipt_number,payment_id,amount,balance_after,snapshot,created_at").eq("invoice_id", invoice.id).order("created_at", { ascending: false }),
  ]);
  for (const result of [agreementResult, proposalResult, scopeResult, profileResult, paymentsResult, receiptsResult]) if (result.error) throw new Error(result.error.message);
  const profile = profileResult.data as JsonRecord | null;
  const userResult = profile?.user_id ? await supabaseAdmin.from("users").select("id,name,email").eq("id", profile.user_id).maybeSingle() : { data: null, error: null };
  const companyResult = invoice.company_id ? await supabaseAdmin.from("companies").select("*").eq("id", invoice.company_id).maybeSingle() : { data: null, error: null };
  if (userResult.error) throw new Error(userResult.error.message);
  if (companyResult.error) throw new Error(companyResult.error.message);
  return { invoice, agreement: agreementResult.data, proposal: proposalResult.data, scope: scopeResult.data, client: userResult.data, company: companyResult.data, payments: paymentsResult.data || [], receipts: receiptsResult.data || [] };
}
