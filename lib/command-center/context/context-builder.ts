import { CommandCenterContext } from "./command-center-context";
import { AIContextPayload } from "./context.types";
import { AuthorisedContextFilter } from "./authorised-context-filter";
import { ConversationContextFormatter } from "./conversation-context";
import { AttachmentContextValidator } from "./attachment-context";
import { ToolRegistry } from "../tools/registry/tool-registry";

export class ContextBuilder {
  static buildContext(
    commandContext: CommandCenterContext,
    historyInput: unknown[] = [],
    attachmentsInput: unknown[] = []
  ): AIContextPayload {
    const candidateTools = ToolRegistry.listNames();
    const allowedToolNames = AuthorisedContextFilter.filterAllowedTools(commandContext, candidateTools);
    const allowedPersonaIds = AuthorisedContextFilter.filterAllowedPersonas(commandContext);
    const formattedHistory = ConversationContextFormatter.formatHistory(historyInput);
    const sanitizedAttachments = AttachmentContextValidator.sanitize(attachmentsInput);

    return {
      commandContext,
      allowedPersonaIds,
      allowedToolNames,
      allowedCapabilityIds: ["sales:leads", "sales:proposal", "finance:invoices", "content:blogs", "research:web"],
      formattedHistory,
      sanitizedAttachments,
      tokenBudget: {
        maxMessageCount: 20,
        maxEstimatedTokens: 8000,
        maxAttachmentCount: 5
      }
    };
  }
}
