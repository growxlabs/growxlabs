import { NextResponse } from "next/server";

import { GeminiProvider } from "@/lib/command-center/models/gemini.provider";
import { OpenRouterProvider } from "@/lib/command-center/models/openrouter.provider";
import { verifyServiceJWT } from "@/lib/command-center/execution/service-jwt";
import { WorkerExecutionRequestSchema } from "@/lib/command-center/execution/worker-request.schema";
import { authoriseWorkerRequest } from "@/lib/command-center/execution/authorise-worker-request";
import { resolveCommandCenterContext } from "@/lib/command-center/context/command-center-context";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  try {
    authenticate(request);
    const execution = WorkerExecutionRequestSchema.parse(await request.json());
    authoriseWorkerRequest(execution);
    const authoritativeContext = await resolveCommandCenterContext({
      req: request,
      customOrgId: execution.organisationId,
      customWorkspaceId: execution.workspaceId,
    });
    if (
      authoritativeContext.userId !== execution.userId ||
      execution.requiredPermissions.some(
        (permission) =>
          !authoritativeContext.permissions.includes(permission),
      )
    ) {
      throw new Error("Authoritative user scope or permissions do not match.");
    }
    const prompt = modelPrompt(execution.input);
    if (GeminiProvider.isConfigured()) {
      const response = await GeminiProvider.getModel().generateContent(prompt);
      return NextResponse.json({
        result: { text: response.response.text(), provider: "gemini" },
      });
    }
    if (OpenRouterProvider.isConfigured()) {
      const response = await OpenRouterProvider.getClient().chat.completions.create({
        model: "anthropic/claude-3.5-sonnet",
        messages: [{ role: "user", content: prompt }],
      });
      return NextResponse.json({
        result: {
          text: response.choices[0]?.message.content ?? "",
          provider: "openrouter",
        },
      });
    }
    return errorResponse(503, "MODEL_UNAVAILABLE", "No model provider is configured.");
  } catch (error) {
    return errorResponse(
      403,
      "EXECUTION_REJECTED",
      error instanceof Error ? error.message : "Execution was rejected.",
    );
  }
}

function modelPrompt(input: Record<string, unknown>): string {
  const prompt = input.prompt;
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 100_000) {
    throw new Error("A bounded model prompt is required.");
  }
  return prompt;
}

function authenticate(request: Request): void {
  const secret = process.env.EXECUTION_SERVICE_JWT_SECRET;
  const environment = process.env.APP_ENV;
  if (!secret || !environment) throw new Error("Execution authentication is not configured.");
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Service authentication is required.");
  verifyServiceJWT(token, {
    issuer: "execution-worker",
    audience: "gxl-web",
    environment,
    secret,
  });
}

function errorResponse(status: number, code: string, message: string): Response {
  return NextResponse.json({ error: { code, message } }, { status });
}
