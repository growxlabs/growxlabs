import "server-only";

import { z } from "zod";

import { signServiceJWT } from "../execution/service-jwt";

const CapabilityDefinitionSchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  domain: z.string().min(1),
  requiredPermissions: z.array(z.string()),
  allowedAgentIds: z.array(z.string()),
  allowedSkillIds: z.array(z.string()),
  allowedToolIds: z.array(z.string()),
  organisationScope: z.array(z.string()).optional(),
  workspaceScope: z.array(z.string()).optional(),
  status: z.enum(["active", "disabled", "deprecated"]),
});

const SkillDefinitionSchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  domain: z.string().min(1),
  capabilityIds: z.array(z.string()),
  allowedAgentIds: z.array(z.string()),
  allowedToolIds: z.array(z.string()),
  requiredPermissions: z.array(z.string()),
  inputSchema: z.record(z.string(), z.unknown()),
  outputSchema: z.record(z.string(), z.unknown()),
  executionPolicy: z.object({
    maxSteps: z.number().int().positive().max(50),
    parallelismAllowed: z.boolean(),
    requiresApproval: z.boolean(),
    allowedStepTypes: z.array(
      z.enum(["model", "tool", "transform", "decision", "wait"]),
    ),
  }),
  status: z.enum(["active", "disabled", "deprecated"]),
});

const CapabilityResolutionSchema = z.object({
  allowed: z.literal(true),
  definition: CapabilityDefinitionSchema,
  reason: z.string().min(1),
});

const SkillResolutionSchema = z.object({
  allowed: z.literal(true),
  definition: SkillDefinitionSchema,
  reason: z.string().min(1),
});

export interface RegistryResolutionScope {
  organisationId: string;
  workspaceId: string;
  userId: string;
  permissions: string[];
}

export class Phase4RegistryClient {
  private readonly gatewayURL: string;
  private readonly secret: string;
  private readonly environment: string;

  constructor() {
    this.gatewayURL = requiredURL("INTERNAL_API_GATEWAY_URL");
    this.secret = required("EXECUTION_SERVICE_JWT_SECRET");
    this.environment = required("APP_ENV");
  }

  async resolveCapability(input: {
    requestId: string;
    capabilityId: string;
    agentId: string;
    skillId?: string;
    toolId?: string;
    scope: RegistryResolutionScope;
    signal?: AbortSignal;
  }): Promise<z.infer<typeof CapabilityResolutionSchema>> {
    const response = await this.post(
      "/internal/v1/capabilities/resolve",
      input.requestId,
      {
        capabilityId: input.capabilityId,
        version: "1.0.0",
        agentId: input.agentId,
        skillId: input.skillId,
        toolId: input.toolId,
        scope: input.scope,
      },
      input.signal,
    );
    return CapabilityResolutionSchema.parse(response);
  }

  async resolveSkill(input: {
    requestId: string;
    skillId: string;
    agentId: string;
    capabilityId: string;
    toolIds: string[];
    stepTypes: Array<"model" | "tool" | "transform" | "decision" | "wait">;
    stepCount: number;
    scope: RegistryResolutionScope;
    signal?: AbortSignal;
  }): Promise<z.infer<typeof SkillResolutionSchema>> {
    const response = await this.post(
      "/internal/v1/skills/resolve",
      input.requestId,
      {
        skillId: input.skillId,
        version: "1.0.0",
        agentId: input.agentId,
        capabilityId: input.capabilityId,
        toolIds: input.toolIds,
        stepTypes: input.stepTypes,
        stepCount: input.stepCount,
        scope: input.scope,
      },
      input.signal,
    );
    return SkillResolutionSchema.parse(response);
  }

  private async post(
    path: string,
    requestId: string,
    body: object,
    signal?: AbortSignal,
  ): Promise<unknown> {
    const now = Math.floor(Date.now() / 1_000);
    const token = signServiceJWT(
      {
        iss: "gxl-web",
        aud: "internal-api-gateway",
        service: "gxl-web",
        env: this.environment,
        requestId,
        iat: now,
        exp: now + 120,
      },
      this.secret,
    );
    const response = await fetch(this.gatewayURL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Request-ID": requestId,
        "X-Service-Name": "gxl-web",
        "X-GXL-Internal-Path": path,
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal,
    });
    if (!response.ok) {
      throw new Error(`Phase 4 registry returned HTTP ${response.status}.`);
    }
    return (await response.json()) as unknown;
  }
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function requiredURL(name: string): string {
  const value = required(name);
  const parsed = new URL(value);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`${name} must use HTTP or HTTPS.`);
  }
  return parsed.toString();
}
