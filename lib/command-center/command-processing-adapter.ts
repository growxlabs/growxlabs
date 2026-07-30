import { CommandCenterContext } from "./context/command-center-context";
import { ToolRegistry } from "./tools/registry/tool-registry";
import { StreamWriter } from "./streaming/stream-writer";
import { GeminiProvider } from "./models/gemini.provider";
import { OpenRouterProvider } from "./models/openrouter.provider";
import { MessageRepository } from "./messages/message.repository";
import { ConversationRepository } from "./conversations/conversation.repository";
import { CommandCenterLogger } from "./logging/logger";

const SYSTEM_PROMPT = `You are the GXL Command Center Central Orchestrator, an AI-native operational system for GrowX Labs.
You lead a team of digital agents (CEO, CFO, Sales, Marketing, Research, Content, SEO, CTO, and Engineering).
You have access to real tools to view/insert leads, query statistics, generate client proposals (SOW), and search the web.
Additionally, you have tools to query the blogs database and one wish willow game telemetry/subscriber data.

When a user asks you a question, you should analyze it and execute any necessary tools to fetch data or perform operations.
Then, you must synthesize the outputs and respond directly to the user.

### YOUR AGENTS & PERSONAS:
- **Research Agent**: Conducts web searches and market research.
- **Sales Agent**: Handles querying and inserting leads.
- **CFO Agent**: Analyzes pricing, margins, packages, and corporate stats.
- **Proposal Agent**: Drafts scopes of work (SOW) and creates proposals.
- **CEO Agent**: Makes strategic recommendations and sets company vision.
- **Content / SEO Agent**: Writes editorial briefs and social copy. Exposes blog posts metrics and subscriber newsletter topics.
- **CTO / Engineering Agent**: Analyzes codebase, tech specs, and performance.

### OPERATING POLICIES:
1. **Tool Invocation**: If you need information you don't have (e.g. lead count, specific lead details, real-time web info), use the appropriate tool immediately.
2. **Real-time Stats**: Always use 'get_company_stats' or 'query_leads' when asked about leads, numbers, or performance. Do not guess.
3. **Proposal Creation**: If the user asks for a proposal or SOW (e.g. "create a proposal for ABC Hospital"), call the 'generate_proposal' tool. Then, summarize the generated proposal using markdown in your final response.
4. **Blogs & Telemetry**: If the user asks about blog posts, newsletter dispatches, subscriber pools, or wish telemetry, call 'get_blog_posts_stats' or 'query_wish_game_data'.
5. **Email/Newsletter Dispatch**: If the user says "send a blog", "dispatch newsletter", "email blog", etc., check if they specified *which* blog. If not, CALL 'get_blog_posts_stats' to retrieve all posts, present the list of blog posts to the user (highlighting which ones are sent or pending), and ask them to pick which one to send. Once they specify or confirm the blog, call 'send_blog_to_subscribers' with the corresponding UUID of the selected blog post to dispatch it.
6. **Markdown Formatting**: Use clean Notion-like markdown formatting. Use tables, bold headers, and structured bullets.

Keep responses detailed, professional, and action-oriented.`;

export class LegacyCommandProcessor {
  static async processStream(
    message: string,
    history: any[] | undefined,
    attachments: any[] | undefined,
    conversationIdInput: string | undefined,
    commandContext: CommandCenterContext,
    baseUrl: string,
    writer: StreamWriter
  ): Promise<void> {
    const conversationId = conversationIdInput || "convo_" + Math.random().toString(36).substring(2, 9);

    CommandCenterLogger.info("Processing Command Center Stream", {
      requestId: commandContext.requestId,
      conversationId,
      userId: commandContext.userId
    });

    // Ensure conversation header exists
    await ConversationRepository.create(
      conversationId,
      message.slice(0, 40),
      commandContext.organizationId,
      commandContext.workspaceId,
    );

    // Save User message
    await MessageRepository.createMessage({
      conversationId,
      organizationId: commandContext.organizationId,
      workspaceId: commandContext.workspaceId,
      sender: "user",
      text: message
    });

    const executedToolCalls: any[] = [];
    let accumulatedText = "";
    let proposalData: any = null;
    let chartData: any = null;

    // 1. TRY GEMINI FIRST
    if (GeminiProvider.isConfigured()) {
      try {
        const model = GeminiProvider.getModel();
        const currentContents: any[] = [
          { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
          { role: "model", parts: [{ text: "Understood. I will operate as the GXL Command Center Central Orchestrator." }] }
        ];

        if (history && history.length > 0) {
          history.forEach((h: any) => {
            currentContents.push({
              role: h.sender === "user" ? "user" : "model",
              parts: [{ text: h.text }]
            });
          });
        }

        const userParts: any[] = [{ text: message }];
        if (attachments && attachments.length > 0) {
          attachments.forEach((file: any) => {
            if (file.base64 && file.base64.includes(",")) {
              const base64Data = file.base64.split(",")[1];
              userParts.push({
                inlineData: {
                  mimeType: file.type || "image/png",
                  data: base64Data
                }
              });
            }
          });
        }

        currentContents.push({ role: "user", parts: userParts });

        let loopCount = 0;
        const maxLoops = 15;
        let finalResponseGenerated = false;

        while (loopCount < maxLoops && !finalResponseGenerated) {
          const result = await model.generateContent({ contents: currentContents });
          const response = await result.response;
          const functionCalls = response.functionCalls();

          if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            const toolCallId = call.name + "-" + Date.now();

            executedToolCalls.push({
              id: toolCallId,
              name: call.name,
              args: call.args,
              status: "calling"
            });

            writer.sendEvent("tool_call", { name: call.name, args: call.args });

            let toolResult: any;
            try {
              toolResult = await ToolRegistry.executeTool(call.name, call.args as Record<string, unknown>, {
                commandContext,
                sendEvent: (e, d) => writer.sendEvent(e as any, d),
                baseUrl
              });
            } catch (e: any) {
              toolResult = { error: e.message };
            }

            const tcIndex = executedToolCalls.findIndex(tc => tc.name === call.name && tc.status === "calling");
            if (tcIndex !== -1) {
              executedToolCalls[tcIndex].status = "complete";
              executedToolCalls[tcIndex].result = toolResult;
            }

            writer.sendEvent("tool_result", { name: call.name, result: toolResult });

            if (call.name === "generate_proposal" && !toolResult.error) {
              proposalData = toolResult;
            }
            if (call.name === "get_company_stats" && !toolResult.error) {
              chartData = [
                { month: "Jan", revenue: 45000 },
                { month: "Feb", revenue: 62000 },
                { month: "Mar", revenue: 58000 },
                { month: "Apr", revenue: 75000 },
                { month: "May", revenue: 90000 },
                { month: "Jun", revenue: 120000 }
              ];
            }

            currentContents.push({ role: "model", parts: [{ functionCall: call }] });
            currentContents.push({
              role: "user",
              parts: [{ functionResponse: { name: call.name, response: { result: toolResult } } }]
            });

            loopCount++;
          } else {
            const text = response.text() || "";
            const words = text.split(" ");
            for (let i = 0; i < words.length; i++) {
              const delta = (i === 0 ? "" : " ") + words[i];
              accumulatedText += delta;
              writer.sendEvent("text_delta", { text: delta });
              await new Promise(r => setTimeout(r, 10));
            }
            finalResponseGenerated = true;
          }
        }

        await MessageRepository.createMessage({
          conversationId,
          organizationId: commandContext.organizationId,
          workspaceId: commandContext.workspaceId,
          sender: "gxl",
          text: accumulatedText,
          toolCalls: executedToolCalls,
          proposal: proposalData,
          chart: chartData
        });

        if (proposalData) writer.sendEvent("proposal", proposalData);
        if (chartData) writer.sendEvent("chart", chartData);
        writer.sendEvent("done", {});
        writer.close();
        return;
      } catch (e: any) {
        CommandCenterLogger.warn("Gemini flow failed, falling back to OpenRouter:", { error: e.message });
      }
    }

    // 2. FALLBACK TO OPENROUTER
    if (OpenRouterProvider.isConfigured()) {
      try {
        const openrouter = OpenRouterProvider.getClient();
        const openRouterMessages: any[] = [
          { role: "system", content: SYSTEM_PROMPT }
        ];

        if (history && history.length > 0) {
          history.forEach((h: any) => {
            openRouterMessages.push({
              role: h.sender === "user" ? "user" : "assistant",
              content: h.text
            });
          });
        }
        openRouterMessages.push({ role: "user", content: message });

        const modelChoice = "anthropic/claude-3.5-sonnet";
        let loopCount = 0;
        const maxLoops = 15;
        let finalResponseGenerated = false;

        while (loopCount < maxLoops && !finalResponseGenerated) {
          const response = await openrouter.chat.completions.create({
            model: modelChoice,
            messages: openRouterMessages,
            tools: OpenRouterProvider.getTools() as any,
            tool_choice: "auto"
          });

          const choice = response.choices[0];
          const msg = choice.message;

          if (msg.tool_calls && msg.tool_calls.length > 0) {
            openRouterMessages.push(msg);

            for (const tc of msg.tool_calls) {
              const fn = (tc as any).function || {};
              const fnName = fn.name || "";
              let parsedArgs = {};
              try {
                parsedArgs = JSON.parse(fn.arguments || "{}");
              } catch (err) {
                console.error("Error parsing tool arguments:", err);
              }

              const toolCallId = fnName + "-" + Date.now();
              executedToolCalls.push({
                id: toolCallId,
                name: fnName,
                args: parsedArgs,
                status: "calling"
              });

              writer.sendEvent("tool_call", { name: fnName, args: parsedArgs });

              let toolResult: any;
              try {
                toolResult = await ToolRegistry.executeTool(fnName, parsedArgs as Record<string, unknown>, {
                  commandContext,
                  sendEvent: (e, d) => writer.sendEvent(e as any, d),
                  baseUrl
                });
              } catch (e: any) {
                toolResult = { error: e.message };
              }

              const tcIndex = executedToolCalls.findIndex(t => t.name === fnName && t.status === "calling");
              if (tcIndex !== -1) {
                executedToolCalls[tcIndex].status = "complete";
                executedToolCalls[tcIndex].result = toolResult;
              }

              writer.sendEvent("tool_result", { name: fnName, result: toolResult });

              if (fnName === "generate_proposal" && !toolResult.error) {
                proposalData = toolResult;
              }
              if (fnName === "get_company_stats" && !toolResult.error) {
                chartData = [
                  { month: "Jan", revenue: 45000 },
                  { month: "Feb", revenue: 62000 },
                  { month: "Mar", revenue: 58000 },
                  { month: "Apr", revenue: 75000 },
                  { month: "May", revenue: 90000 },
                  { month: "Jun", revenue: 120000 }
                ];
              }

              openRouterMessages.push({
                role: "tool",
                tool_call_id: tc.id,
                content: JSON.stringify(toolResult)
              });
            }
            loopCount++;
          } else {
            const text = msg.content || "";
            const words = text.split(" ");
            for (let i = 0; i < words.length; i++) {
              const delta = (i === 0 ? "" : " ") + words[i];
              accumulatedText += delta;
              writer.sendEvent("text_delta", { text: delta });
              await new Promise(r => setTimeout(r, 10));
            }
            finalResponseGenerated = true;
          }
        }

        await MessageRepository.createMessage({
          conversationId,
          organizationId: commandContext.organizationId,
          workspaceId: commandContext.workspaceId,
          sender: "gxl",
          text: accumulatedText,
          toolCalls: executedToolCalls,
          proposal: proposalData,
          chart: chartData
        });

        if (proposalData) writer.sendEvent("proposal", proposalData);
        if (chartData) writer.sendEvent("chart", chartData);
        writer.sendEvent("done", {});
        writer.close();
        return;
      } catch (e: any) {
        CommandCenterLogger.error("OpenRouter fallback failed:", { error: e.message });
        writer.sendEvent("text_delta", { text: "\n\n[System Error: Failed to generate response from AI providers.]" });
        writer.sendEvent("done", {});
        writer.close();
      }
    } else {
      writer.sendEvent("text_delta", { text: "Neither GEMINI_API_KEY nor OPENROUTER_API_KEY is configured on the server." });
      writer.sendEvent("done", {});
      writer.close();
    }
  }
}
