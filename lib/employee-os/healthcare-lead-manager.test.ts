import { test } from "node:test";
import assert from "node:assert/strict";
import { isHealthcareLeadManager } from "./persona.ts";

test("Healthcare Lead Manager Persona Detection", () => {
  // 1. Matches exact Healthcare Lead Manager designation
  assert.equal(
    isHealthcareLeadManager({
      designation: "Healthcare Lead Manager",
      role: "EMPLOYEE",
      permissions: ["sales.workspace", "sales.lead.read_assigned"],
    }),
    true
  );

  // 2. Case-insensitive and trimmed match
  assert.equal(
    isHealthcareLeadManager({
      designation: " healthcare lead manager ",
      role: "EMPLOYEE",
      permissions: ["sales.workspace"],
    }),
    true
  );

  // 3. Normal Sales person does NOT match
  assert.equal(
    isHealthcareLeadManager({
      designation: "Sales Executive",
      role: "EMPLOYEE",
      permissions: ["sales.workspace", "sales.lead.read_assigned"],
    }),
    false
  );

  // 4. Founder / Admin does NOT match
  assert.equal(
    isHealthcareLeadManager({
      designation: "Founder",
      role: "ADMIN",
      permissions: ["*"],
    }),
    false
  );

  // 5. Normal engineer does NOT match
  assert.equal(
    isHealthcareLeadManager({
      designation: "Software Engineer",
      role: "EMPLOYEE",
      permissions: ["workspace.home"],
    }),
    false
  );

  // 6. Null or undefined designation does not match
  assert.equal(
    isHealthcareLeadManager({
      designation: null,
      role: "EMPLOYEE",
      permissions: [],
    }),
    false
  );
});

test("WhatsApp Phone Normalization Logic", () => {
  function normalizeWhatsAppPhone(phone?: string | null): string | null {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, "");
    if (!digits) return null;
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
    if (digits.length === 12 && digits.startsWith("91")) return digits;
    if (digits.length >= 10) return digits;
    return null;
  }

  assert.equal(normalizeWhatsAppPhone("9876543210"), "919876543210");
  assert.equal(normalizeWhatsAppPhone("+91 98765 43210"), "919876543210");
  assert.equal(normalizeWhatsAppPhone("09876543210"), "919876543210");
  assert.equal(normalizeWhatsAppPhone(null), null);
  assert.equal(normalizeWhatsAppPhone(""), null);
});
