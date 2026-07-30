import assert from "node:assert/strict";
import test from "node:test";

import { ArtifactSafetyValidator } from "./safety-validator.ts";
import { FormulaSanitizer } from "./formula-sanitizer.ts";

test("malicious filenames and traversal sequences are neutralised", () => {
  const safe = ArtifactSafetyValidator.sanitizeFilename("../../payroll\\secrets<script>.csv");
  assert.equal(safe.includes(".."), false);
  assert.equal(safe.includes("/"), false);
  assert.equal(safe.includes("\\"), false);
  assert.equal(safe.includes("<"), false);
});

test("spreadsheet formula injection is neutralised", () => {
  for (const value of ["=1+1", "+cmd|' /C calc'!A0", "-2+3", "@SUM(A1:A2)"]) {
    const safe = FormulaSanitizer.sanitizeCell(value);
    assert.equal(safe.startsWith("'"), true);
  }
  assert.equal(FormulaSanitizer.sanitizeCell("ordinary text"), "ordinary text");
});
