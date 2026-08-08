import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const context = readFileSync(new URL("./context.ts", import.meta.url), "utf8");
const notificationRoute = readFileSync(new URL("../../app/api/workspace/notifications/[notificationId]/read/route.ts", import.meta.url), "utf8");
const attendance = readFileSync(new URL("../hrms/attendance/service.ts", import.meta.url), "utf8");
const leave = readFileSync(new URL("../hrms/leave/service.ts", import.meta.url), "utf8");
const nav = readFileSync(new URL("../../components/workspace/WorkspaceNav.tsx", import.meta.url), "utf8");
const workspaceState = readFileSync(new URL("../../components/workspace/WorkspaceState.tsx", import.meta.url), "utf8");

test("workspace identity is resolved from the session and never from route parameters", () => {
  assert.match(context, /getServerSession\(authOptions\)/);
  assert.match(context, /eq\("auth_user_id", session\.user\.id\)/);
  assert.match(context, /eq\("organisation_id", organisationId\)/);
  assert.doesNotMatch(context, /searchParams|employeeId.*params/);
});
test("workspace guard distinguishes employee lifecycle states", () => {
  for (const state of ["unavailable", "invalid", "pending", "provisioning", "suspended", "failed"]) assert.match(workspaceState, new RegExp(state));
  assert.match(context, /workspace_status === "active"/);
});
test("self-service APIs scope attendance, leave, and notifications to the current employee", () => {
  assert.match(attendance, /selfEmployee\(context\)/);
  assert.match(leave, /leaveEmployee\(context\)/);
  assert.match(notificationRoute, /eq\("recipient_user_id",employee\.authUserId\)/);
  assert.match(notificationRoute, /eq\("organisation_id",employee\.organisationId\)/);
});
test("Employee OS navigation contains no Admin OS or commercial administration routes", () => {
  assert.doesNotMatch(nav, /\/admin|proposal|agreement|quotation|invoice|pricing|payment/i);
  assert.doesNotMatch(nav, /AdminNav/);
});
