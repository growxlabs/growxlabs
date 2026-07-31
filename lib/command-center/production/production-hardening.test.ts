import assert from "node:assert/strict";
import test from "node:test";

import { withConcurrencyLimit, resetConcurrencyForTests } from "./concurrency.ts";
import {
  validateCoreProductionConfiguration,
  validateProductionConfiguration,
} from "./config.ts";
import { CommandCenterError, errorResponse } from "./errors.ts";
import { CommandCenterLogger } from "../logging/logger.ts";

test("error envelopes expose safe metadata and request correlation only", async () => {
  const response = errorResponse(new Error("postgresql://secret@private-host/table stack trace"), "request-123");
  assert.equal(response.status, 500);
  const body = await response.json();
  assert.deepEqual(body, {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "The request could not be completed.",
      retryable: true,
      requestId: "request-123",
    },
  });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(JSON.stringify(body).includes("private-host"), false);
});

test("production configuration reports missing secret names without values", () => {
  const result = validateProductionConfiguration({
    APP_ENV: "production",
    NEXTAUTH_SECRET: "short",
  } as unknown as NodeJS.ProcessEnv);
  assert.equal(result.ready, false);
  assert.ok(result.missing.includes("DATABASE_URL"));
  assert.ok(result.invalid.includes("NEXTAUTH_SECRET"));
  assert.equal(JSON.stringify(result).includes("short"), false);
});

test("core startup validation does not require optional feature infrastructure", () => {
  const result = validateCoreProductionConfiguration({
    APP_ENV: "production",
    NEXTAUTH_SECRET: "a-secure-secret-that-is-at-least-32-characters",
    NEXTAUTH_URL: "https://growxlabs.tech",
  } as unknown as NodeJS.ProcessEnv);
  assert.equal(result.ready, true);
  assert.deepEqual(result.missing, []);
});

test("bounded concurrency rejects overflow and releases capacity", async () => {
  resetConcurrencyForTests();
  let release!: () => void;
  const pending = withConcurrencyLimit("test", 1, () => new Promise<void>((resolve) => {
    release = resolve;
  }));
  await assert.rejects(
    () => withConcurrencyLimit("test", 1, async () => undefined),
    (error: unknown) => error instanceof CommandCenterError && error.code === "RATE_LIMITED",
  );
  release();
  await pending;
  await withConcurrencyLimit("test", 1, async () => undefined);
});

test("structured logger recursively redacts secrets and raw prompts", () => {
  const original = console.log;
  let output = "";
  console.log = (value?: unknown) => { output = String(value); };
  try {
    CommandCenterLogger.info("redaction-test", {
      requestId: "request-123",
      nested: { authorization: "Bearer secret", prompt: "confidential prompt" },
    });
  } finally {
    console.log = original;
  }
  assert.match(output, /"requestId":"request-123"/);
  assert.equal(output.includes("Bearer secret"), false);
  assert.equal(output.includes("confidential prompt"), false);
  assert.match(output, /\[REDACTED\]/);
});
