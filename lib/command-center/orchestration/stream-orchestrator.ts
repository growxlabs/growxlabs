import { StreamWriter } from "../streaming/stream-writer";
import { LegacyCommandProcessor } from "../command-processing-adapter";
import { CommandCenterContext } from "../context/command-center-context";

export class StreamOrchestrator {
  static async orchestrateStream(
    message: string,
    history: any[] | undefined,
    attachments: any[] | undefined,
    conversationId: string | undefined,
    commandContext: CommandCenterContext,
    baseUrl: string,
    writer: StreamWriter
  ): Promise<void> {
    // Delegates stream coordination using Phase 1 StreamWriter and tool execution registry
    await LegacyCommandProcessor.processStream(
      message,
      history,
      attachments,
      conversationId,
      commandContext,
      baseUrl,
      writer
    );
  }
}
