import { StreamWriter } from "../streaming/stream-writer";
import { CommandCenterContext } from "../context/command-center-context";

export interface ModelRequestOptions {
  message: string;
  history?: Array<{ role: string; text: string }>;
  attachments?: Array<{ name: string; type: string; base64?: string }>;
  allowedTools?: string[];
  systemPrompt?: string;
  baseUrl?: string;
}

export interface ModelResponsePayload {
  text: string;
  toolCalls?: Array<{ id: string; name: string; args: Record<string, any>; result?: any }>;
  proposalData?: any;
  chartData?: any;
  providerId: string;
  modelName: string;
  durationMs: number;
}

export interface ModelProvider {
  readonly id: string;
  readonly modelName: string;

  isConfigured(): boolean;

  stream(
    options: ModelRequestOptions,
    commandContext: CommandCenterContext,
    writer: StreamWriter
  ): Promise<ModelResponsePayload>;

  supportsTools(): boolean;
  supportsJSON(): boolean;
  supportsVision(): boolean;
  supportsStreaming(): boolean;
}
