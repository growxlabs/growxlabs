import test from "node:test";
import assert from "node:assert/strict";
import {
  inferDepartment,
  normalizeRoleToHrmsTitle,
  syncApplicationToHrms,
} from "./sync-hrms.ts";

test("inferDepartment maps technical roles to Engineering", () => {
  assert.equal(inferDepartment("AI Engineering/Software Engineering"), "Engineering");
  assert.equal(inferDepartment("Forward Deployed Engineering/Technical Product Management"), "Engineering");
  assert.equal(inferDepartment("Hardware/Robotics Engineering"), "Engineering");
  assert.equal(inferDepartment("Full-Stack Developer"), "Engineering");
});

test("inferDepartment maps design, marketing, and sales roles correctly", () => {
  assert.equal(inferDepartment("Product Design/UI-UX Design"), "Design");
  assert.equal(inferDepartment("Content/Marketing"), "Marketing");
  assert.equal(inferDepartment("Growth/Business Development"), "Sales & Growth");
  assert.equal(inferDepartment("Sales Development Representative (SDR)"), "Sales & Growth");
  assert.equal(inferDepartment("Operations Manager"), "General Operations");
});

test("normalizeRoleToHrmsTitle aliases legacy role titles", () => {
  assert.equal(
    normalizeRoleToHrmsTitle("Sales Development Representative (SDR)"),
    "Business Development Executive (BDE)"
  );
  assert.equal(
    normalizeRoleToHrmsTitle("AI / LLM Engineer"),
    "AI Engineering/Software Engineering"
  );
  assert.equal(
    normalizeRoleToHrmsTitle("Full-Stack Developer (Next.js/Node)"),
    "AI Engineering/Software Engineering"
  );
  assert.equal(
    normalizeRoleToHrmsTitle("Product Design/UI-UX Design"),
    "Product Design/UI-UX Design"
  );
  assert.equal(
    normalizeRoleToHrmsTitle(""),
    "General Application"
  );
});

test("syncApplicationToHrms rejects empty name or email gracefully without crashing", async () => {
  const result1 = await syncApplicationToHrms({
    name: "",
    email: "test@example.com",
  });
  assert.equal(result1.success, false);
  assert.match(result1.error || "", /Missing required/);

  const result2 = await syncApplicationToHrms({
    name: "Test User",
    email: "",
  });
  assert.equal(result2.success, false);
  assert.match(result2.error || "", /Missing required/);
});
