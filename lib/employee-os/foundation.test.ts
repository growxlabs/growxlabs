import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(new URL("../../platform/hrms/migrations/0030_employee_os_phase_1.sql", import.meta.url), "utf8");
const service = readFileSync(new URL("./provisioning-service.ts", import.meta.url), "utf8");

test("workspace lifecycle includes suspension independently from employment", () => {
  for (const status of ["pending", "provisioning", "active", "suspended", "failed"]) assert.match(migration, new RegExp(`\\b${status}\\b`));
});

test("candidate conversion and employee identity are idempotent per organisation", () => {
  assert.match(migration, /UNIQUE \(organisation_id, application_id\)/);
  assert.match(migration, /UNIQUE \(organisation_id, employee_id\)/);
  assert.match(service, /employee_conversions/);
  assert.match(service, /existing: true/);
});

test("conversion validates hiring state, email, structure, role and organisation", () => {
  for (const code of ["candidate_not_hired", "candidate_email_required", "employment_structure_required", "role_not_found", "manager_not_found"]) assert.match(service, new RegExp(code));
  assert.match(service, /eq\("organisation_id", input\.organisationId\)/);
});

test("BDE bundle excludes commercial, finance and administration capabilities", () => {
  const bundle = migration.match(/p\.key = ANY\(ARRAY\[(.*?)\]\)/s)?.[1] || "";
  for (const forbidden of ["proposal", "agreement", "contract", "quotation", "invoice", "pricing", "discount", "export", "apify", "recruitment", "organisation.manage"]) assert.doesNotMatch(bundle.toLowerCase(), new RegExp(forbidden));
});
