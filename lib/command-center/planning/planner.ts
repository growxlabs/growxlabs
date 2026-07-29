import {
  PlanningClarificationSchema,
} from "./plan.schemas.ts";
import { normalisePlan } from "./plan-normaliser.ts";
import { validatePlan } from "./plan-validator.ts";
import { PlanningError } from "./planning-errors.ts";
import { buildPlannerPrompt } from "./planner-prompt.ts";
import type { PlanningResult, TrustedPlanningContext } from "./plan.types.ts";
import { PLANNER_POLICY } from "./planner-policy.ts";

export interface PlannerProvider {
  generateJSON(prompt: string, signal: AbortSignal): Promise<unknown>;
}

export class Planner {
  constructor(
    private readonly provider: PlannerProvider,
    private readonly timeoutMs: number = PLANNER_POLICY.providerTimeoutMs,
  ) {}

  async createPlan(
    request: string,
    context: TrustedPlanningContext,
  ): Promise<PlanningResult> {
    if (!request.trim()) {
      return {
        kind: "clarification",
        clarification: {
          code: "PLANNING_CLARIFICATION_REQUIRED",
          questions: [
            {
              id: "request",
              question: "What should the command accomplish?",
              field: "request",
              required: true,
            },
          ],
        },
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      let output: unknown;
      try {
        output = await this.provider.generateJSON(
          buildPlannerPrompt(request, context),
          controller.signal,
        );
      } catch (error) {
        if (controller.signal.aborted) {
          throw new PlanningError(
            "PLANNER_TIMEOUT",
            "Planner provider timed out",
          );
        }
        throw new PlanningError(
          "PLANNER_PROVIDER_FAILED",
          error instanceof Error ? error.message : "Planner provider failed",
        );
      }

      const clarification = PlanningClarificationSchema.safeParse(output);
      if (clarification.success) {
        return { kind: "clarification", clarification: clarification.data };
      }

      const candidate = validatePlan(output, context);
      // Validate the model's candidate before applying trusted fields so an
      // attempted tenant/user/permission override is rejected, not hidden.
      const plan = normalisePlan(candidate, context);
      return { kind: "plan", plan: validatePlan(plan, context) };
    } finally {
      clearTimeout(timer);
    }
  }
}
