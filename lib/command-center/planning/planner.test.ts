import assert from "node:assert/strict";
import test from "node:test";

import { Planner, type PlannerProvider } from "./planner.ts";
import { validatePlan } from "./plan-validator.ts";
import { PlanningError } from "./planning-errors.ts";
import type {
  ExecutionPlan,
  TrustedPlanningContext,
} from "./plan.types.ts";

const trusted: TrustedPlanningContext = {
  requestId: "request-1",
  conversationId: "4d6f6028-a325-4dba-a919-e36a75c508c4",
  organisationId: "43d7ba04-ae4d-4e8d-97c7-68378bc3e782",
  workspaceId: "57ab06bd-9807-4d53-b8c4-5f176869dfb0",
  userId: "358c7a90-62cc-43e3-8e5b-c69acda8010f",
  agentId: "agent_sales",
  capabilityId: "sales.leads",
  skillId: "skill_lead_qualification",
  permissions: ["leads:read"],
  allowedToolIds: ["query_leads"],
  allowedCapabilityIds: ["sales.leads"],
  allowedSkillIds: ["skill_lead_qualification"],
  approvedActionIds: [],
  explicitlyRequestedDestructive: false,
};

const validPlan: ExecutionPlan = {
  id: "88f9b204-1972-41cb-b143-8ae2c11d2509",
  version: "gxl.execution-plan.v1",
  requestId: trusted.requestId,
  conversationId: trusted.conversationId,
  organisationId: trusted.organisationId,
  workspaceId: trusted.workspaceId,
  userId: trusted.userId,
  agentId: trusted.agentId,
  capabilityId: trusted.capabilityId,
  skillId: trusted.skillId,
  title: "Query recent leads",
  objective: "Return a bounded list of recent leads.",
  status: "draft",
  createdAt: "2026-07-29T00:00:00.000Z",
  steps: [
    {
      id: "66b24c7a-e3c5-4689-ac10-b5da68a97906",
      index: 0,
      type: "tool",
      name: "Query leads",
      description: "Read the most recent lead records.",
      toolId: "query_leads",
      dependsOn: [],
      input: { limit: 10 },
      requiredPermissions: ["leads:read"],
      retryPolicy: {
        maxAttempts: 3,
        initialDelayMs: 100,
        maxDelayMs: 1_000,
        backoffMultiplier: 2,
        retryableCodes: ["TRANSIENT"],
      },
      timeoutMs: 5_000,
      continueOnFailure: false,
    },
  ],
};

class StaticProvider implements PlannerProvider {
  constructor(private readonly output: unknown) {}
  async generateJSON(): Promise<unknown> {
    return this.output;
  }
}

test("accepts a valid, scoped plan", async () => {
  const result = await new Planner(new StaticProvider(validPlan)).createPlan(
    "Query recent leads",
    trusted,
  );
  assert.equal(result.kind, "plan");
  if (result.kind === "plan") {
    assert.equal(result.plan.organisationId, trusted.organisationId);
  }
});

test("accepts a valid dependency plan", async () => {
  const dependencyId = validPlan.steps[0].id;
  const plan: ExecutionPlan = {
    ...validPlan,
    steps: [
      validPlan.steps[0],
      {
        ...validPlan.steps[0],
        id: "cd6ac21f-7221-4613-a548-36205345d11b",
        index: 1,
        name: "Select result",
        description: "Select bounded fields from the lead result.",
        type: "transform",
        toolId: undefined,
        dependsOn: [dependencyId],
        input: { operation: "pick", value: {}, keys: [] },
      },
    ],
  };
  const result = await new Planner(new StaticProvider(plan)).createPlan(
    "Query and select recent leads",
    trusted,
  );
  assert.equal(result.kind, "plan");
});

test("returns clarification for an empty request", async () => {
  const result = await new Planner(new StaticProvider(validPlan)).createPlan(
    " ",
    trusted,
  );
  assert.equal(result.kind, "clarification");
});

test("rejects tenant scope override", async () => {
  const candidate = {
    ...validPlan,
    organisationId: "1674a7f0-0c6a-44e9-843d-b8cc790b72de",
  };
  await assert.rejects(
    new Planner(new StaticProvider(candidate)).createPlan("query", trusted),
    (error: unknown) =>
      error instanceof PlanningError && error.code === "SCOPE_MISMATCH",
  );
});

test("rejects unknown tools and permission escalation", () => {
  assert.throws(
    () =>
      validatePlan(
        {
          ...validPlan,
          steps: [{ ...validPlan.steps[0], toolId: "delete_everything" }],
        },
        trusted,
      ),
    PlanningError,
  );
  assert.throws(
    () =>
      validatePlan(
        {
          ...validPlan,
          steps: [
            {
              ...validPlan.steps[0],
              requiredPermissions: ["admin:all"],
            },
          ],
        },
        trusted,
      ),
    PlanningError,
  );
});

test("rejects duplicate IDs and dependency cycles", () => {
  const second = {
    ...validPlan.steps[0],
    index: 1,
    dependsOn: [validPlan.steps[0].id],
  };
  assert.throws(
    () => validatePlan({ ...validPlan, steps: [validPlan.steps[0], second] }, trusted),
    PlanningError,
  );
  const secondId = "b5454778-1797-4f20-8471-c6843b20c2a9";
  assert.throws(
    () =>
      validatePlan(
        {
          ...validPlan,
          steps: [
            { ...validPlan.steps[0], dependsOn: [secondId] },
            { ...second, id: secondId },
          ],
        },
        trusted,
      ),
    PlanningError,
  );
});

test("requires explicit approved destructive actions", () => {
  assert.throws(
    () =>
      validatePlan(
        {
          ...validPlan,
          steps: [
            {
              ...validPlan.steps[0],
              name: "Delete leads",
              description: "Delete all matching leads.",
            },
          ],
        },
        trusted,
      ),
    PlanningError,
  );
});

test("rejects excessive steps, timeout, and retries", async () => {
  const excessiveSteps = Array.from({ length: 51 }, (_, index) => ({
    ...validPlan.steps[0],
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    index,
  }));
  await assert.rejects(
    new Planner(
      new StaticProvider({ ...validPlan, steps: excessiveSteps }),
    ).createPlan("query", trusted),
    PlanningError,
  );
  await assert.rejects(
    new Planner(
      new StaticProvider({
        ...validPlan,
        steps: [{ ...validPlan.steps[0], timeoutMs: 300_001 }],
      }),
    ).createPlan("query", trusted),
    PlanningError,
  );
  await assert.rejects(
    new Planner(
      new StaticProvider({
        ...validPlan,
        steps: [
          {
            ...validPlan.steps[0],
            retryPolicy: {
              ...validPlan.steps[0].retryPolicy,
              maxAttempts: 6,
            },
          },
        ],
      }),
    ).createPlan("query", trusted),
    PlanningError,
  );
});

test("returns typed errors for malformed output and provider failure", async () => {
  await assert.rejects(
    new Planner(new StaticProvider({ invalid: true })).createPlan(
      "query",
      trusted,
    ),
    (error: unknown) =>
      error instanceof PlanningError && error.code === "MALFORMED_PLAN",
  );
  const failingProvider: PlannerProvider = {
    async generateJSON(): Promise<unknown> {
      throw new Error("provider unavailable");
    },
  };
  await assert.rejects(
    new Planner(failingProvider).createPlan("query", trusted),
    (error: unknown) =>
      error instanceof PlanningError &&
      error.code === "PLANNER_PROVIDER_FAILED",
  );
});

test("times out a stalled provider", async () => {
  const stalledProvider: PlannerProvider = {
    async generateJSON(
      _prompt: string,
      signal: AbortSignal,
    ): Promise<unknown> {
      await new Promise<void>((_resolve, reject) => {
        signal.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true },
        );
      });
      return validPlan;
    },
  };
  await assert.rejects(
    new Planner(stalledProvider, 5).createPlan("query", trusted),
    (error: unknown) =>
      error instanceof PlanningError && error.code === "PLANNER_TIMEOUT",
  );
});
