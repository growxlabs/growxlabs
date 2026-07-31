import { z } from "zod";

import { CommandCenterError } from "../../production/errors";
import { fetchWithResilience } from "../../production/resilience";
import { SearchWebSchema, SpawnSubagentSchema } from "../../validation/tool.schemas";
import { ToolExecutor } from "../registry/tool-types";

type SearchResult = { title: string; snippet: string; url: string };
type SearchOutput = { query: string; results: SearchResult[] };

export const searchWebExecutor: ToolExecutor<z.infer<typeof SearchWebSchema>, SearchOutput> = {
  name: "search_web",
  description: "Perform a live web search to retrieve real-time market data.",
  inputSchema: SearchWebSchema,
  riskLevel: "low",
  requiredPermissions: [],
  async execute(input, context) {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      throw new CommandCenterError("TOOL_FAILURE", {
        message: "Live web search is not configured.",
        retryable: false,
      });
    }
    const count = Math.min(10, Math.max(1, input.num || 5));
    const response = await fetchWithResilience("https://google.serper.dev/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
      body: JSON.stringify({ q: input.query, num: count }),
      cache: "no-store",
    }, {
      operation: "tool:search-web",
      requestId: context.commandContext.requestId,
      timeoutMs: 10_000,
      totalDeadlineMs: 20_000,
      maxAttempts: 2,
    });
    if (!response.ok) {
      throw new CommandCenterError("TOOL_FAILURE", {
        retryable: response.status >= 500 || response.status === 429,
      });
    }
    const payload = await response.json() as {
      organic?: Array<{ title?: unknown; snippet?: unknown; link?: unknown }>;
    };
    const results = (payload.organic ?? []).slice(0, count).flatMap((item): SearchResult[] => {
      if (typeof item.title !== "string" || typeof item.link !== "string") return [];
      try {
        const url = new URL(item.link);
        if (!["http:", "https:"].includes(url.protocol)) return [];
        return [{
          title: item.title.slice(0, 300),
          snippet: typeof item.snippet === "string" ? item.snippet.slice(0, 1_000) : "",
          url: url.toString(),
        }];
      } catch {
        return [];
      }
    });
    return { query: input.query, results };
  },
};

export const spawnSubagentExecutor: ToolExecutor<z.infer<typeof SpawnSubagentSchema>, unknown> = {
  name: "spawn_subagent",
  description: "Run a bounded specialised research delegation within the current request.",
  inputSchema: SpawnSubagentSchema,
  riskLevel: "low",
  requiredPermissions: [],
  async execute(input, context) {
    const subagentId = `sub_${crypto.randomUUID()}`;
    const research = await searchWebExecutor.execute({
      query: `${input.focus}: ${input.mission}`,
      num: 5,
    }, context);
    const resultPayload = {
      subagentId,
      name: input.name,
      focus: input.focus,
      mission: input.mission,
      status: "complete",
      results: research.results,
      logs: ["Bounded research delegation completed in the current request."],
    };
    context.sendEvent?.("subagent_created", resultPayload);
    return resultPayload;
  },
};
