import "server-only";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ConsultingHttpError } from "@/lib/consulting/workflow";

type JsonRecord = Record<string, any>;
const ADMIN_ROLES = ["ADMIN", "CO_ADMIN"];
export { supabaseAdmin };
const signedAgreement = (s: string) => ["signed", "active"].includes(s);
const approvedProposal = (s: string) => ["approved", "signed"].includes(s);
const approvedScope = (s: string) => ["approved", "signed", "ready_for_client", "client_acknowledged"].includes(s);

export async function requireFinanceAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new ConsultingHttpError(401, "Authentication required.");
  if (!ADMIN_ROLES.includes(session.user.role)) throw new ConsultingHttpError(403, "Finance permission is required.");
  return { userId: session.user.id };
}

export async function requireFinanceClient() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "CLIENT") throw new ConsultingHttpError(403, "A client account is required.");
  const { data, error } = await supabaseAdmin.from("client_profiles").select("id").eq("user_id", session.user.id).maybeSingle();
  if (error || !data) throw new ConsultingHttpError(403, "Client account is not linked.");
  return { userId: session.user.id, clientId: data.id };
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
  return Math.round(n * 100) / 100;
}

export async function createAdvanceInvoice(agreementId: string, userId: string) {
  const { data: agreement, error } = await supabaseAdmin.from("master_service_agreements").select("*").eq("id", agreementId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!agreement) throw new ConsultingHttpError(404, "Master Service Agreement not found.");
  if (!signedAgreement(agreement.status)) throw new ConsultingHttpError(409, "The agreement must be signed before invoicing.");
  const { data: proposal } = await supabaseAdmin.from("commercial_proposals").select("*").eq("id", agreement.proposal_id).maybeSingle();
  const { data: scope } = await supabaseAdmin.from("scopes_of_work").select("*").eq("id", proposal?.scope_of_work_id).maybeSingle();
  if (!proposal || !approvedProposal(proposal.status)) throw new ConsultingHttpError(409, "An approved proposal is required before invoicing.");
  if (!scope || !approvedScope(scope.status)) throw new ConsultingHttpError(409, "An approved Scope of Work is required before invoicing.");
  const pricing = Array.isArray(proposal.pricing) ? proposal.pricing : [];
  const schedule = Array.isArray(proposal.payment_schedule) ? proposal.payment_schedule : [];
  if (!pricing.length || !schedule.length) throw new ConsultingHttpError(409, "Complete proposal pricing and payment schedule before creating an invoice.");
  const { data: existing } = await supabaseAdmin.from("consulting_advance_invoices").select("id,invoice_number").eq("agreement_id", agreementId).not("status", "in", "(cancelled,void)").maybeSingle();
  if (existing) return existing;
  const subtotal = amount(pricing.reduce((sum: number, item: JsonRecord) => sum + Number(item.amount ?? item.total ?? item.rate ?? 0), 0));
  if (subtotal <= 0) throw new ConsultingHttpError(409, "Proposal pricing must contain a positive invoice amount.");
  const total = subtotal;
  const { data: invoice, error: insertError } = await supabaseAdmin.from("consulting_advance_invoices").insert({ agreement_id: agreement.id, proposal_id: proposal.id, scope_id: scope.id, client_id: agreement.client_id, company_id: agreement.company_id, deal_id: agreement.deal_id, currency: proposal.currency || "INR", subtotal, total, balance_due: total, line_items: pricing, payment_instructions: { schedule }, created_by: userId }).select("*").single();
  if (insertError) throw new Error(insertError.message);
  await log("invoice", invoice.id, userId, "invoice_created", { invoiceNumber: invoice.invoice_number });
  return invoice;
}

export async function submitPayment(invoiceId: string, clientId: string, input: JsonRecord) {
  const { data: invoice, error } = await supabaseAdmin.from("consulting_advance_invoices").select("*").eq("id", invoiceId).eq("client_id", clientId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!invoice) throw new ConsultingHttpError(404, "Invoice not found.");
  if (["cancelled", "void", "paid"].includes(invoice.status)) throw new ConsultingHttpError(409, "This invoice cannot accept another payment.");
  const paymentAmount = amount(input.amount);
  if (paymentAmount <= 0 || paymentAmount > Number(invoice.balance_due)) throw new ConsultingHttpError(400, "Payment amount must be greater than zero and no more than the balance due.");
  const { data: payment, error: insertError } = await supabaseAdmin.from("consulting_payments").insert({ invoice_id: invoice.id, client_id: clientId, company_id: invoice.company_id, amount: paymentAmount, currency: invoice.currency, method: input.method, transaction_reference: input.transactionReference || null, proof_path: input.proofPath || null, status: "verification_required" }).select("id,payment_number,amount,currency,status,submitted_at").single();
  if (insertError) throw new Error(insertError.message);
  await log("payment", payment.id, clientId, "payment_submitted", { invoiceNumber: invoice.invoice_number });
  return payment;
}

export async function verifyPayment(paymentId: string, userId: string, verified: boolean) {
  const { data: payment, error } = await supabaseAdmin.from("consulting_payments").select("*, consulting_advance_invoices(*)").eq("id", paymentId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!payment) throw new ConsultingHttpError(404, "Payment not found.");
  if (payment.status === "verified") return payment;
  const invoice = payment.consulting_advance_invoices;
  const nextStatus = verified ? "verified" : "failed";
  const { error: updateError } = await supabaseAdmin.from("consulting_payments").update({ status: nextStatus, verified_at: verified ? new Date().toISOString() : null, verified_by: verified ? userId : null }).eq("id", paymentId);
  if (updateError) throw new Error(updateError.message);
  if (!verified) { await log("payment", paymentId, userId, "payment_rejected"); return { ...payment, status: nextStatus }; }
  const newPaid = amount(Number(invoice.amount_paid) + Number(payment.amount));
  const balance = amount(Math.max(0, Number(invoice.total) - newPaid));
  const invoiceStatus = balance === 0 ? "paid" : "partially_paid";
  const { error: invoiceError } = await supabaseAdmin.from("consulting_advance_invoices").update({ amount_paid: newPaid, balance_due: balance, status: invoiceStatus, updated_at: new Date().toISOString() }).eq("id", invoice.id);
  if (invoiceError) throw new Error(invoiceError.message);
  if (balance === 0) {
    const { data: existingReceipt } = await supabaseAdmin.from("consulting_payment_receipts").select("id,receipt_number").eq("payment_id", paymentId).maybeSingle();
    if (!existingReceipt) await supabaseAdmin.from("consulting_payment_receipts").insert({ payment_id: paymentId, invoice_id: invoice.id, client_id: payment.client_id, amount: payment.amount, balance_after: balance, snapshot: { invoiceNumber: invoice.invoice_number, paymentNumber: payment.payment_number, verifiedAt: new Date().toISOString() } });
    await activateProject(invoice.agreement_id, userId);
  }
  await log("payment", paymentId, userId, "payment_verified", { invoiceNumber: invoice.invoice_number, balance });
  return { ...payment, status: nextStatus, invoiceStatus, balance };
}

export async function activateProject(agreementId: string, userId: string) {
  const { data: agreement } = await supabaseAdmin.from("master_service_agreements").select("*").eq("id", agreementId).maybeSingle();
  if (!agreement || !signedAgreement(agreement.status)) throw new ConsultingHttpError(409, "A signed agreement is required for activation.");
  const { data: proposal } = await supabaseAdmin.from("commercial_proposals").select("*").eq("id", agreement.proposal_id).maybeSingle();
  const { data: scope } = await supabaseAdmin.from("scopes_of_work").select("*").eq("id", proposal?.scope_of_work_id).maybeSingle();
  if (!proposal || !approvedProposal(proposal.status) || !scope || !approvedScope(scope.status)) throw new ConsultingHttpError(409, "Approved commercial documents are required for activation.");
  const { data: invoice } = await supabaseAdmin.from("consulting_advance_invoices").select("*").eq("agreement_id", agreementId).eq("status", "paid").maybeSingle();
  if (!invoice) throw new ConsultingHttpError(409, "Verified advance payment is required for activation.");
  const { data: existing } = await supabaseAdmin.from("consulting_projects").select("*, consulting_kickoffs(*)").eq("agreement_id", agreementId).maybeSingle();
  if (existing) return existing;
  const { data: project, error } = await supabaseAdmin.from("consulting_projects").insert({ agreement_id: agreement.id, proposal_id: proposal.id, scope_id: scope.id, invoice_id: invoice.id, client_id: agreement.client_id, company_id: agreement.company_id, deal_id: agreement.deal_id, status: "active", activated_at: new Date().toISOString(), created_by: userId }).select("*").single();
  if (error) throw new Error(error.message);
  const { data: kickoff, error: kickoffError } = await supabaseAdmin.from("consulting_kickoffs").insert({ project_id: project.id, client_id: project.client_id, status: "preparation", agenda: ["Confirm objectives", "Review scope and milestones", "Confirm stakeholders and access"], preparation: { sourceScope: scope.scope_number }, created_by: userId }).select("*").single();
  if (kickoffError) throw new Error(kickoffError.message);
  await log("project", project.id, userId, "project_activated", { projectNumber: project.project_number, kickoffNumber: kickoff.kickoff_number });
  return { ...project, kickoff };
}

export async function completeKickoff(kickoffId: string, userId: string, input: JsonRecord = {}) {
  const { data: kickoff, error } = await supabaseAdmin.from("consulting_kickoffs").select("*, consulting_projects(*)").eq("id", kickoffId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!kickoff) throw new ConsultingHttpError(404, "Kickoff workspace not found.");
  const { data, error: updateError } = await supabaseAdmin.from("consulting_kickoffs").update({ status: "completed", meeting_details: input.meetingDetails || kickoff.meeting_details, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", kickoffId).select("*").single();
  if (updateError) throw new Error(updateError.message);
  await supabaseAdmin.from("consulting_projects").update({ status: "active", updated_at: new Date().toISOString() }).eq("id", kickoff.project_id);
  await log("kickoff", kickoffId, userId, "kickoff_completed", {});
  return data;
}
