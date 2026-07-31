import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { hrmsCachePolicy, hrmsQueryKeys } from "./keys.ts";

test("HRMS query-key roots are predictable and unique", () => {
  const roots = Object.values(hrmsQueryKeys).map((factory) => factory.all[0]);
  assert.equal(new Set(roots).size, roots.length);
  assert.deepEqual(roots, [
    "employees", "attendance", "leave", "recruitment", "onboarding",
    "payroll", "performance", "learning", "compensation", "workforce",
    "platform", "dashboard", "analytics", "notifications", "documents",
  ]);
});

test("cache policies increase from short-lived to static data", () => {
  assert.ok(hrmsCachePolicy.short < hrmsCachePolicy.medium);
  assert.ok(hrmsCachePolicy.medium < hrmsCachePolicy.long);
  assert.ok(hrmsCachePolicy.long < hrmsCachePolicy.static);
});

test("Releases 05-10 browser routes cannot bypass the HRMS gateway", () => {
  const root = process.cwd();
  for (const domain of ["learning", "payroll", "performance", "platform", "workforce"]) {
    assert.equal(
      fs.existsSync(path.join(root, "app", "api", "v1", "hrms", domain, "[...path]", "route.ts")),
      false,
      `${domain} must use the generic authenticated HRMS BFF`,
    );
  }
});
