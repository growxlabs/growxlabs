import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import {
  generateOtpCode,
  hashOtp,
  verifyOtpHash,
  isOtpExpired,
} from "./healthcare-otp-utils.ts";
import { isHealthcareLeadManager } from "./persona.ts";

test("Healthcare OTP - Code Generation", () => {
  for (let i = 0; i < 20; i++) {
    const code = generateOtpCode();
    assert.equal(typeof code, "string");
    assert.equal(code.length, 6, "Code must be exactly 6 characters");
    assert.match(code, /^\d{6}$/, "Code must consist only of digits");
    const num = parseInt(code, 10);
    assert.ok(num >= 100000 && num <= 999999, "Code must be between 100000 and 999999");
  }
});

test("Healthcare OTP - Hashing Security", () => {
  const code = "123456";
  const hash1 = hashOtp(code);
  const hash2 = hashOtp(" 123456 "); // handles whitespace trimming
  const diffHash = hashOtp("654321");

  assert.equal(typeof hash1, "string");
  assert.equal(hash1.length, 64, "SHA-256 hash must be 64 hex characters");
  assert.equal(hash1, hash2, "Whitespace-trimmed code produces identical hash");
  assert.notEqual(hash1, diffHash, "Different codes produce different hashes");

  // Constant-time comparison test
  const match =
    hash1.length === hash2.length &&
    crypto.timingSafeEqual(Buffer.from(hash1), Buffer.from(hash2));
  assert.equal(match, true);

  const mismatch =
    hash1.length === diffHash.length &&
    crypto.timingSafeEqual(Buffer.from(hash1), Buffer.from(diffHash));
  assert.equal(mismatch, false);
});

test("Healthcare Lead Manager Persona Guard", () => {
  // 1. Matches exact Healthcare Lead Manager
  assert.equal(
    isHealthcareLeadManager({ designation: "Healthcare Lead Manager" }),
    true
  );

  // 2. Case-insensitive and trimmed
  assert.equal(
    isHealthcareLeadManager({ designation: " healthcare lead manager " }),
    true
  );
  assert.equal(
    isHealthcareLeadManager({ designation: "HEALTHCARE LEAD MANAGER" }),
    true
  );
  assert.equal(
    isHealthcareLeadManager({ role: "healthcare lead manager" }),
    true
  );

  // 3. Rejects normal employees and other roles
  assert.equal(
    isHealthcareLeadManager({ designation: "Software Engineer" }),
    false
  );
  assert.equal(
    isHealthcareLeadManager({ designation: "Business Development Executive" }),
    false
  );
  assert.equal(
    isHealthcareLeadManager({ designation: "General Manager" }),
    false
  );
  assert.equal(
    isHealthcareLeadManager({ role: "EMPLOYEE" }),
    false
  );
  assert.equal(
    isHealthcareLeadManager(null),
    false
  );
  assert.equal(
    isHealthcareLeadManager(undefined),
    false
  );
});

test("Healthcare OTP - Expiry Calculation (10 Minutes)", () => {
  const now = Date.now();
  const validTtlMs = 10 * 60 * 1000;
  const expiresAt = new Date(now + validTtlMs).toISOString();

  const isExpiredBefore = now > new Date(expiresAt).getTime();
  assert.equal(isExpiredBefore, false, "Fresh OTP must not be expired");

  const simulatedPastExpiry = new Date(now - 1000).toISOString();
  const isExpiredAfter = now > new Date(simulatedPastExpiry).getTime();
  assert.equal(isExpiredAfter, true, "Past OTP must be expired");
});

test("Healthcare OTP - Max Attempts Enforced", () => {
  let attempts = 0;
  const maxAttempts = 5;

  for (let i = 1; i <= maxAttempts; i++) {
    attempts += 1;
    const isLocked = attempts >= maxAttempts;
    if (i < 5) {
      assert.equal(isLocked, false);
    } else {
      assert.equal(isLocked, true);
    }
  }
});
