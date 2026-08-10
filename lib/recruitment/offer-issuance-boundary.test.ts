import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const issueRoute = fs.readFileSync(
  "app/api/admin/recruitment/offers/[offerId]/route.ts",
  "utf8",
);
const provisioning = fs.readFileSync(
  "lib/employee-os/provisioning-service.ts",
  "utf8",
);

test("offer issuance owns the document by candidate application", () => {
  assert.match(issueRoute, /owner_entity_type:\s*"candidate_application"/);
  assert.match(issueRoute, /owner_entity_id:\s*current\.application_id/);
  assert.doesNotMatch(issueRoute, /existing employee link could not be recovered/i);
  assert.doesNotMatch(issueRoute, /from\("employee_conversions"\)/);
  assert.match(issueRoute, /from\("candidate_documents"\)/);
  assert.match(issueRoute, /Deferred shared document registration until conversion/);
  assert.doesNotMatch(
    issueRoute,
    /candidate document record could not be completed\. The offer was not issued/i,
  );
});

test("employee conversion transfers the accepted candidate document", () => {
  assert.match(
    provisioning,
    /\["offer", "candidate", "candidate_application"\]/,
  );
  assert.match(provisioning, /owner_entity_type:\s*"employee"/);
});
