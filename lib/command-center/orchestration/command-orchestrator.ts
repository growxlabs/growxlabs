import { CommandCenterContext } from "../context/command-center-context";
import { ContextBuilder } from "../context/context-builder";
import { IntentService } from "../intent/intent.service";
import { CapabilityRouter } from "../routing/capability-router";
import { ModelRouter } from "../routing/model-router";
import { PromptBuilder } from "../prompts/prompt-builder";
import { StreamOrchestrator } from "./stream-orchestrator";
import { StreamWriter } from "../streaming/stream-writer";
import { CommandCenterLogger } from "../logging/logger";
import { Planner } from "../planning/planner.ts";
import { ModelPlannerProvider } from "../planning/model-planner-provider.ts";
import {
  ExecutionClient,
  ExecutionServiceError,
} from "../execution/execution-client";
import { Phase4RegistryClient } from "../services/phase4-registry-client";

export class CommandOrchestrator {
  static async handleRequest(
    message: string,
    history:
      | Array<{
          id?: string;
          sender: "user" | "gxl";
          text: string;
          timestamp?: string;
        }>
      | undefined,
    attachments:
      | Array<{
          name: string;
          type: string;
          base64?: string;
          url?: string;
        }>
      | undefined,
    conversationId: string | undefined,
    commandContext: CommandCenterContext,
    baseUrl: string,
    writer: StreamWriter
  ): Promise<void> {
    const sanitizedMessage = PromptBuilder.sanitizeUntrustedInput(message);

    // 1. Build Authorized Context
    const aiContext = ContextBuilder.buildContext(commandContext, history, attachments);

    // 2. Intent Analysis
    const intent = IntentService.resolveIntent(sanitizedMessage, commandContext);

    // 3. Capability & Skill Routing
    const capabilityDecision = CapabilityRouter.routeCapability(intent, commandContext);

    // 4. Model Routing
    const modelDecision = ModelRouter.routeModel();

    CommandCenterLogger.info("CommandOrchestrator Phase 2 Pipeline Executed", {
      requestId: commandContext.requestId,
      intent: intent.type,
      agent: capabilityDecision.agent.name,
      skill: capabilityDecision.skill?.id,
      modelProvider: modelDecision.providerId
    });

    if (process.env.COMMAND_CENTER_PHASE3_EXECUTION_ENABLED === "true") {
      const selectedSkill = capabilityDecision.skill;
      const phase4Scope = {
        organisationId: commandContext.organizationId,
        workspaceId: commandContext.workspaceId,
        userId: commandContext.userId,
        permissions: commandContext.permissions,
      };
      let phase4Registry: Phase4RegistryClient | undefined;
      if (process.env.COMMAND_CENTER_PHASE4_SERVICES_ENABLED === "true") {
        try {
          phase4Registry = new Phase4RegistryClient();
          await phase4Registry.resolveCapability({
            requestId: commandContext.requestId,
            capabilityId: capabilityDecision.capabilityId,
            agentId: capabilityDecision.agent.id,
            skillId: selectedSkill?.id,
            scope: phase4Scope,
          });
        } catch (error) {
          CommandCenterLogger.warn(
            "Phase 4 capability service unavailable; preserving Phase 2 routing",
            {
              requestId: commandContext.requestId,
              error:
                error instanceof Error
                  ? error.message
                  : "capability resolution failed",
            },
          );
          phase4Registry = undefined;
        }
      }
      const planner = new Planner(new ModelPlannerProvider());
      const planningResult = await planner.createPlan(sanitizedMessage, {
        requestId: commandContext.requestId,
        conversationId:
          conversationId ?? crypto.randomUUID(),
        organisationId: commandContext.organizationId,
        workspaceId: commandContext.workspaceId,
        userId: commandContext.userId,
        agentId: capabilityDecision.agent.id,
        capabilityId: capabilityDecision.capabilityId,
        skillId: selectedSkill?.id,
        permissions: commandContext.permissions,
        allowedToolIds: capabilityDecision.allowedToolIds,
        allowedCapabilityIds:
          capabilityDecision.agent.supportedCapabilities,
        allowedSkillIds: capabilityDecision.agent.supportedSkills,
        approvedActionIds: [],
        explicitlyRequestedDestructive:
          /\b(delete|destroy|purge|wipe|truncate)\b/i.test(sanitizedMessage),
      });
      if (planningResult.kind === "clarification") {
        writer.sendEvent("text_delta", {
          text: planningResult.clarification.questions
            .map((question) => question.question)
            .join("\n"),
        });
        writer.sendEvent("done", {});
        writer.close();
        return;
      }
      if (phase4Registry && selectedSkill) {
        await phase4Registry.resolveSkill({
          requestId: commandContext.requestId,
          skillId: selectedSkill.id,
          agentId: capabilityDecision.agent.id,
          capabilityId: capabilityDecision.capabilityId,
          toolIds: planningResult.plan.steps.flatMap((step) =>
            step.toolId ? [step.toolId] : [],
          ),
          stepTypes: planningResult.plan.steps.map((step) => step.type),
          stepCount: planningResult.plan.steps.length,
          scope: phase4Scope,
        });
      }
      writer.sendEvent("plan_created", {
        planId: planningResult.plan.id,
        title: planningResult.plan.title,
        steps: planningResult.plan.steps.map((step) => ({
          id: step.id,
          name: step.name,
          type: step.type,
        })),
      });
      try {
        const run = await new ExecutionClient().createRun(
          planningResult.plan,
          `${commandContext.requestId}:${planningResult.plan.id}`,
        );
        writer.sendEvent("run_created", {
          runId: run.id,
          status: run.status,
        });
        writer.sendEvent("text_delta", {
          text: `Execution queued. Run ID: ${run.id}`,
        });
        writer.sendEvent("done", {});
        writer.close();
        return;
      } catch (error) {
        if (!(error instanceof ExecutionServiceError)) throw error;
        CommandCenterLogger.warn(
          "Phase 3 execution unavailable; using the existing synchronous path",
          {
            requestId: commandContext.requestId,
            code: error.code,
            status: error.status,
          },
        );
        writer.sendEvent("error", {
          code: error.code,
          recoverable: true,
          message:
            "Durable execution is temporarily unavailable. Continuing with the existing command path.",
        });
      }
    }

    // 5. Stream Orchestration & Model Execution
    await StreamOrchestrator.orchestrateStream(
      sanitizedMessage,
      aiContext.formattedHistory.messages,
      aiContext.sanitizedAttachments,
      conversationId,
      commandContext,
      baseUrl,
      writer
    );
  }
}
