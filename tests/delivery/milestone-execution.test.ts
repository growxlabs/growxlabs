import test from "node:test";
import assert from "node:assert/strict";
import {
  ALLOWED_MILESTONE_STATUSES,
  validateMilestoneDates,
  updateMilestone,
  getMilestoneDetails,
  createMilestone,
  getAvailableAssignees,
  requireDeliveryAdmin,
} from "../../lib/delivery/workflow.ts";
import { ConsultingHttpError } from "../../lib/consulting/workflow.ts";

test("1 & 2. Existing milestone validation and schema status checks", () => {
  assert.ok(ALLOWED_MILESTONE_STATUSES.includes("planned"));
  assert.ok(ALLOWED_MILESTONE_STATUSES.includes("in_progress"));
  assert.ok(ALLOWED_MILESTONE_STATUSES.includes("completed"));
  assert.ok(ALLOWED_MILESTONE_STATUSES.includes("blocked"));
  assert.equal(ALLOWED_MILESTONE_STATUSES.includes("invented_status" as any), false);
});

test("6, 7 & 8. Milestone date validation rejects invalid date ranges", () => {
  // Valid: due date after start date
  assert.doesNotThrow(() => {
    validateMilestoneDates("2026-10-05", "2026-10-15");
  });

  // Valid: due date equal to start date
  assert.doesNotThrow(() => {
    validateMilestoneDates("2026-10-05", "2026-10-05");
  });

  // Valid: only one date provided
  assert.doesNotThrow(() => {
    validateMilestoneDates("2026-10-05", null);
  });
  assert.doesNotThrow(() => {
    validateMilestoneDates(null, "2026-10-15");
  });

  // Invalid: due date is BEFORE start date
  assert.throws(
    () => {
      validateMilestoneDates("2026-10-15", "2026-10-05");
    },
    (err: any) => {
      return (
        err instanceof ConsultingHttpError &&
        err.status === 400 &&
        err.message.includes("Due date must be on or after start date")
      );
    }
  );

  // Invalid date format
  assert.throws(
    () => {
      validateMilestoneDates("not-a-date", "2026-10-05");
    },
    (err: any) => {
      return (
        err instanceof ConsultingHttpError &&
        err.status === 400 &&
        err.message.includes("Invalid date format")
      );
    }
  );
});

test("9. Unauthorized user rejection in delivery admin check", async () => {
  // Unauthenticated (null session) throws 401
  await assert.rejects(
    async () => {
      await requireDeliveryAdmin(null);
    },
    (err: any) => {
      return (
        err instanceof ConsultingHttpError &&
        err.status === 401 &&
        err.message === "Authentication required."
      );
    }
  );

  // Client user throws 403
  await assert.rejects(
    async () => {
      await requireDeliveryAdmin({ user: { id: "client-123", role: "CLIENT" } });
    },
    (err: any) => {
      return (
        err instanceof ConsultingHttpError &&
        err.status === 403 &&
        err.message === "Project delivery permission is required."
      );
    }
  );

  // Admin user succeeds
  const admin = await requireDeliveryAdmin({ user: { id: "admin-123", role: "ADMIN" } });
  assert.equal(admin.userId, "admin-123");

  // Co-Admin user succeeds
  const coAdmin = await requireDeliveryAdmin({ user: { id: "coadmin-123", role: "CO_ADMIN" } });
  assert.equal(coAdmin.userId, "coadmin-123");
});

test("5. Available assignees can be fetched from real users/team", async () => {
  const assignees = await getAvailableAssignees();
  assert.ok(Array.isArray(assignees));
  assert.ok(assignees.length > 0);
  const adminUser = assignees.find((a) => a.role === "ADMIN");
  assert.ok(adminUser, "At least one ADMIN assignee must be found");
  assert.equal(typeof adminUser.id, "string");
  assert.equal(typeof adminUser.name, "string");
});

test("1, 3, 4, 5, 6, 7: Milestone execution flow and persistence in database", async () => {
  const testMilestoneId = "d806a480-9d5a-4e4c-8de3-136dbca4c0b7"; // GXL-MLS-2026-000001
  const assignees = await getAvailableAssignees();
  const testOwner = assignees[0];

  // 1. Existing milestone opens
  const initial = await getMilestoneDetails(testMilestoneId);
  assert.ok(initial);
  assert.equal(initial.milestone_number, "GXL-MLS-2026-000001");
  assert.equal(initial.name, "Discovery & Project Initiation");

  // 3. Planned -> In Progress saves with Owner, Start Date, and Due Date
  const updated = await updateMilestone(testMilestoneId, testOwner.id, {
    status: "in_progress",
    ownerId: testOwner.id,
    plannedStart: "2026-10-05",
    plannedCompletion: "2026-10-18",
  });
  assert.equal(updated.status, "in_progress");
  assert.equal(updated.owner_id, testOwner.id);
  assert.equal(updated.planned_start, "2026-10-05");
  assert.equal(updated.planned_completion, "2026-10-18");

  // 4. Refresh / re-query preserves In Progress state
  const reloaded = await getMilestoneDetails(testMilestoneId);
  assert.equal(reloaded.status, "in_progress");
  assert.equal(reloaded.owner_id, testOwner.id);
  assert.equal(reloaded.planned_start, "2026-10-05");
  assert.equal(reloaded.planned_completion, "2026-10-18");
  assert.ok(reloaded.owner);
  assert.equal(reloaded.owner.id, testOwner.id);
});

test("8. Invalid date range in updateMilestone is rejected", async () => {
  const testMilestoneId = "d806a480-9d5a-4e4c-8de3-136dbca4c0b7";
  await assert.rejects(
    async () => {
      await updateMilestone(testMilestoneId, "test-user", {
        plannedStart: "2026-10-25",
        plannedCompletion: "2026-10-10",
      });
    },
    (err: any) => {
      return (
        err instanceof ConsultingHttpError &&
        err.status === 400 &&
        err.message.includes("Due date must be on or after start date")
      );
    }
  );
});

test("10. Existing milestone creation still works", async () => {
  const workspaceId = "ea6b07f5-0fcc-4d21-876f-57694bb1004e";
  const assignees = await getAvailableAssignees();
  const userId = assignees[0].id;

  const testName = `Automated Test Milestone ${Date.now()}`;
  const created = await createMilestone(workspaceId, userId, {
    name: testName,
    plannedStart: "2026-11-01",
    plannedCompletion: "2026-11-15",
  });

  assert.ok(created);
  assert.ok(created.id);
  assert.ok(created.milestone_number.startsWith("GXL-MLS-"));
  assert.equal(created.name, testName);
  assert.equal(created.status, "planned");
});
