import { ZodType } from "zod";
import { CommandCenterContext } from "../../context/command-center-context";

export interface ToolExecutionContext {
  commandContext: CommandCenterContext;
  sendEvent?: (event: string, data: unknown) => void;
  baseUrl?: string;
}

export interface ToolExecutionResult<TOutput = unknown> {
  success: boolean;
  data?: TOutput;
  error?: string;
}

export interface ToolExecutor<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: ZodType<TInput>;
  outputSchema?: ZodType<TOutput>;
  riskLevel: "low" | "medium" | "high";
  requiredPermissions: string[];
  execute(
    input: TInput,
    context: ToolExecutionContext
  ): Promise<TOutput>;
}
