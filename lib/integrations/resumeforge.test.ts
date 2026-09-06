import assert from "node:assert/strict";
import test from "node:test";
import { ResumeForgeClient } from "./resumeforge.ts";

test("ResumeForgeClient handles unconfigured environment gracefully", async () => {
  const origKey = process.env.RESUMEFORGE_COMPANY_KEY;
  delete process.env.RESUMEFORGE_COMPANY_KEY;

  const client = new ResumeForgeClient();
  assert.equal(client.isConfigured(), false);

  const invoices = await client.getInvoices();
  assert.equal(invoices.configured, false);
  assert.equal(invoices.success, false);
  assert.deepEqual(invoices.invoices, []);

  const payments = await client.getPayments();
  assert.equal(payments.configured, false);
  assert.equal(payments.success, false);
  assert.deepEqual(payments.payments, []);

  const users = await client.getUsers();
  assert.equal(users.configured, false);
  assert.equal(users.success, false);
  assert.deepEqual(users.users, []);

  const summary = await client.getSummary();
  assert.equal(summary.configured, false);
  assert.equal(summary.totalRevenueInr, 0);

  if (origKey) {
    process.env.RESUMEFORGE_COMPANY_KEY = origKey;
  }
});

test("ResumeForgeClient recognizes configured API key", () => {
  const origKey = process.env.RESUMEFORGE_COMPANY_KEY;
  process.env.RESUMEFORGE_COMPANY_KEY = "rf_comp_live_test_key_123456789";

  const client = new ResumeForgeClient();
  assert.equal(client.isConfigured(), true);

  if (origKey) {
    process.env.RESUMEFORGE_COMPANY_KEY = origKey;
  } else {
    delete process.env.RESUMEFORGE_COMPANY_KEY;
  }
});
