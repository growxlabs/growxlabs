import { z } from "zod";

const privateUrl = z.string().url().refine((value) => !value.includes("NEXT_PUBLIC_"));

const CoreConfigSchema = z.object({
  APP_ENV: z.enum(["preview", "production"]),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
});

const CommandCenterConfigSchema = z.object({
  APP_ENV: z.enum(["preview", "production"]),
  DATABASE_URL: z.string().min(1),
  DEFAULT_ORGANISATION_ID: z.string().min(1),
  DEFAULT_WORKSPACE_ID: z.string().min(1),
  EXECUTION_SERVICE_JWT_SECRET: z.string().min(32),
  INTERNAL_API_GATEWAY_URL: privateUrl,
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1).optional(),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  SERPER_API_KEY: z.string().min(1),
}).superRefine((value, context) => {
  if (!value.GEMINI_API_KEY && !value.OPENROUTER_API_KEY) {
    context.addIssue({
      code: "custom",
      path: ["MODEL_PROVIDER_KEY"],
      message: "At least one model provider key is required.",
    });
  }
});

const StorageConfigSchema = z.object({
  APP_ENV: z.enum(["preview", "production"]),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
});

const CronConfigSchema = z.object({
  APP_ENV: z.enum(["preview", "production"]),
  CRON_SECRET: z.string().min(32),
});

export type ConfigurationCheck = {
  ready: boolean;
  environment: string;
  missing: string[];
  invalid: string[];
};

function environmentFor(source: NodeJS.ProcessEnv) {
  return source.APP_ENV ??
    (source.VERCEL_ENV === "production" ? "production" :
      source.VERCEL_ENV === "preview" ? "preview" : "development");
}

function validateSchema(schema: z.ZodType, source: NodeJS.ProcessEnv): ConfigurationCheck {
  const environment = environmentFor(source);
  if (environment === "development" || environment === "test") {
    return { ready: true, environment, missing: [], invalid: [] };
  }
  const parsed = schema.safeParse({ ...source, APP_ENV: environment });
  if (parsed.success) return { ready: true, environment, missing: [], invalid: [] };
  const missing = new Set<string>();
  const invalid = new Set<string>();
  for (const issue of parsed.error.issues) {
    const key = String(issue.path[0] ?? "configuration");
    if (source[key] == null || source[key] === "") missing.add(key);
    else invalid.add(key);
  }
  return { ready: false, environment, missing: [...missing].sort(), invalid: [...invalid].sort() };
}

export function validateCoreProductionConfiguration(source: NodeJS.ProcessEnv = process.env) {
  return validateSchema(CoreConfigSchema, source);
}

export function validateCommandCenterConfiguration(source: NodeJS.ProcessEnv = process.env) {
  return validateSchema(CommandCenterConfigSchema, source);
}

export function validateStorageConfiguration(source: NodeJS.ProcessEnv = process.env) {
  return validateSchema(StorageConfigSchema, source);
}

export function validateCronConfiguration(source: NodeJS.ProcessEnv = process.env) {
  return validateSchema(CronConfigSchema, source);
}

export function validateProductionConfiguration(source: NodeJS.ProcessEnv = process.env): ConfigurationCheck {
  const checks = [
    validateCoreProductionConfiguration(source),
    validateCommandCenterConfiguration(source),
    validateStorageConfiguration(source),
    validateCronConfiguration(source),
  ];
  return {
    ready: checks.every((check) => check.ready),
    environment: checks[0].environment,
    missing: [...new Set(checks.flatMap((check) => check.missing))].sort(),
    invalid: [...new Set(checks.flatMap((check) => check.invalid))].sort(),
  };
}

export function assertCoreProductionConfiguration(): void {
  const result = validateCoreProductionConfiguration();
  if (!result.ready) {
    throw new Error(`Core production configuration is invalid: ${[...result.missing, ...result.invalid].join(", ")}`);
  }
}

export function assertProductionConfiguration(): void {
  const result = validateProductionConfiguration();
  if (!result.ready) {
    throw new Error(`Production configuration is invalid: ${[...result.missing, ...result.invalid].join(", ")}`);
  }
}
