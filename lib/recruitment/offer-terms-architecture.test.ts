import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const migration = fs.readFileSync("platform/hrms/migrations/0041_database_backed_offer_terms.sql", "utf8");
const offerApi = fs.readFileSync("app/api/admin/recruitment/offers/route.ts", "utf8");
const adminUi = fs.readFileSync("components/admin/onboarding/OfferWorkspace.tsx", "utf8");
const portalApi = fs.readFileSync("app/api/v1/candidate/portal/route.ts", "utf8");
const portalUi = fs.readFileSync("components/careers/OfferSection.tsx", "utf8");
const stageApi = fs.readFileSync("app/api/hrms/recruitment/route.ts", "utf8");

test("A and D: approved templates are scoped and versioned", () => {
  assert.match(migration, /offer_term_templates/);
  assert.match(migration, /offer_term_template_versions/);
  assert.match(migration, /engagement_type text NOT NULL/);
  assert.match(migration, /UNIQUE \(template_id, version\)/);
  assert.match(offerApi, /resolveApprovedOfferTerms/);
});

test("B and C: each offer version snapshots resolved terms and template identity", () => {
  assert.match(offerApi, /offerTermTemplate:/);
  assert.match(offerApi, /terms: resolvedTerms\.terms/);
  assert.match(offerApi, /from\("offer_versions"\)/);
});

test("E and F: PDF and candidate portal consume the immutable snapshot", () => {
  assert.match(portalApi, /from\("offer_versions"\)/);
  assert.match(portalApi, /snapshot: offerVersion\.data\?\.snapshot/);
  assert.match(portalUi, /offer\.snapshot\?\.terms/);
});

test("G and H: frontend and stage transition are not canonical term sources", () => {
  assert.doesNotMatch(adminUi, /Use only People-approved wording/);
  assert.doesNotMatch(adminUi, /value=\{\(form as any\)\[key\]\}/);
  assert.doesNotMatch(adminUi, /setForm\(\{ \.\.\.form, \[key\]:/);
  assert.doesNotMatch(stageApi, /Approved working terms will be confirmed before sending/);
  for (const forbidden of ["recovery record", "metadata", "database", "people-approved"]) {
    assert.ok(!portalUi.toLowerCase().includes(forbidden), forbidden);
  }
});
