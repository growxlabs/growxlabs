import type { Instrumentation } from "next";

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const [{ assertProductionConfiguration }, { CommandCenterLogger }] = await Promise.all([
    import("@/lib/command-center/production/config"),
    import("@/lib/command-center/logging/logger"),
  ]);
  assertProductionConfiguration();
  CommandCenterLogger.info("Application runtime initialised", {
    service: "nextjs-bff",
    outcome: "ready",
  });
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { CommandCenterLogger } = await import("@/lib/command-center/logging/logger");
  CommandCenterLogger.error("Unhandled server request error", {
    service: "nextjs-bff",
    route: context.routePath,
    method: request.method,
    digest: error && typeof error === "object" && "digest" in error ? String(error.digest) : undefined,
    errorCode: "INTERNAL_ERROR",
    outcome: "failure",
  });
};
