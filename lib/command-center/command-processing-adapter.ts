import { CommandCenterContext } from "./context/command-center-context";
import { ToolRegistry } from "./tools/registry/tool-registry";
import { StreamWriter } from "./streaming/stream-writer";
import { GeminiProvider } from "./models/gemini.provider";
import { OpenRouterProvider } from "./models/openrouter.provider";
import { MessageRepository } from "./messages/message.repository";
import { ConversationRepository } from "./conversations/conversation.repository";
import { CommandCenterLogger } from "./logging/logger";
import { routeCommandIntent, IntentDecision } from "./routing/intent-router";
import { ToolActivity } from "../../components/admin/command-center/command-center.types";

const SYSTEM_PROMPT = `You are the GXL Command Center Central Orchestrator, an AI-native operational system for GrowX Labs.
You lead a team of digital agents (CEO, CFO, Sales, Marketing, Research, Content, SEO, CTO, and Engineering).
You have access to real tools to view/insert leads, query statistics, generate client proposals (SOW), and search the web.
Additionally, you have tools to query the blogs database and one wish willow game telemetry/subscriber data.

First respond according to the user's actual intent.

Greetings, courtesy, small talk, product-help questions and general knowledge questions do not require company tools.

Never use a tool merely because one is available.

Use the smallest set of tools necessary to answer the request.

Do not retrieve company statistics unless the user asks for company statistics or the data is strictly necessary.

Do not produce executive summaries, operational telemetry or strategic actions unless the user asks for them.

Do not repeat the user's instruction as a formal report heading.

Keep simple requests simple.

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

Match response depth to the request.
Simple input receives a simple response.
Operational requests receive structured operational responses.`;

async function streamAndPersistResponse(params: {
  text: string;
  conversationId: string;
  context: CommandCenterContext;
  writer: StreamWriter;
}): Promise<void> {
  const words = params.text.split(" ");
  for (let i = 0; i < words.length; i++) {
    const delta = (i === 0 ? "" : " ") + words[i];
    params.writer.sendEvent("text_delta", { text: delta });
    await new Promise(r => setTimeout(r, 10));
  }

  await MessageRepository.createMessage({
    conversationId: params.conversationId,
    organizationId: params.context.organizationId,
    workspaceId: params.context.workspaceId,
    sender: "gxl",
    text: params.text,
    toolCalls: []
  });

  params.writer.sendEvent("done", {});
  params.writer.close();
}

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

    // 1. INTENT ROUTING (Deterministic pre-router)
    const intentDecision = routeCommandIntent({
      message,
      history,
      attachments
    });

    if (intentDecision.intent === "greeting") {
      await streamAndPersistResponse({
        text: "Hi! What would you like GXL to help with today?",
        conversationId,
        context: commandContext,
        writer
      });
      return;
    }

    if (intentDecision.intent === "courtesy") {
      await streamAndPersistResponse({
        text: "You’re welcome.",
        conversationId,
        context: commandContext,
        writer
      });
      return;
    }

    if (intentDecision.intent === "small_talk") {
      await streamAndPersistResponse({
        text: "I am doing great! Ready to help you orchestrate GrowX Labs operations. What are we working on?",
        conversationId,
        context: commandContext,
        writer
      });
      return;
    }

    if (intentDecision.intent === "product_help") {
      await streamAndPersistResponse({
        text: "I can help with sales data, recruitment, research, proposals, content and operational reporting. Tell me what you’re working on.",
        conversationId,
        context: commandContext,
        writer
      });
      return;
    }

    const executedToolCalls: any[] = [];
    let accumulatedText = "";
    let proposalData: any = null;
    let chartData: any = null;

    // 2. TRY GEMINI WITH TOOL FILTERING
    if (GeminiProvider.isConfigured() && intentDecision.requiresModel) {
      try {
        const model = GeminiProvider.getModel(intentDecision.allowedTools);
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

          if (functionCalls && functionCalls.length > 0 && intentDecision.requiresTools) {
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

    // 3. TRY OPENROUTER WITH TOOL FILTERING
    if (OpenRouterProvider.isConfigured() && intentDecision.requiresModel) {
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
            tools: intentDecision.requiresTools ? OpenRouterProvider.getTools(intentDecision.allowedTools) as any : undefined,
            tool_choice: intentDecision.requiresTools && intentDecision.allowedTools.length > 0 ? "auto" : "none"
          });

          const choice = response.choices[0];
          const msg = choice.message;

          if (msg.tool_calls && msg.tool_calls.length > 0 && intentDecision.requiresTools) {
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
      }
    }

    // 4. DYNAMIC DATABASE DISPATCHER & SYNTHESIZER FALLBACK
    const lowerMsg = message.toLowerCase();
    const isWebSearch = lowerMsg.includes("web") || lowerMsg.includes("searc") || lowerMsg.includes("google") || lowerMsg.includes("online") || lowerMsg.includes("internet");

    // Extract search topic query from user prompt
    const cleanSearchTopic = message
      .replace(/i ask|using web searc tool|using web search tool|search leads|find|tool/gi, "")
      .trim() || message;

    // 1. Execute search_web if requested and allowed
    let searchWebResult: any = null;
    if (intentDecision.allowedTools.includes("search_web")) {
      const searchId = "search_web-" + Date.now();
      const searchArgs = { query: cleanSearchTopic, num: 5 };
      executedToolCalls.push({ id: searchId, name: "search_web", args: searchArgs, status: "calling" });
      writer.sendEvent("tool_call", { name: "search_web", args: searchArgs });

      try {
        searchWebResult = await ToolRegistry.executeTool("search_web", searchArgs, { commandContext, sendEvent: (e, d) => writer.sendEvent(e as any, d), baseUrl });
      } catch (e: any) {
        searchWebResult = { error: e.message };
      }

      const swIdx = executedToolCalls.findIndex(t => t.id === searchId);
      if (swIdx !== -1) {
        executedToolCalls[swIdx].status = "complete";
        executedToolCalls[swIdx].result = searchWebResult;
      }
      writer.sendEvent("tool_result", { name: "search_web", result: searchWebResult });
    }

    // 2. Execute get_company_stats if allowed
    let companyStats: any = {};
    if (intentDecision.allowedTools.includes("get_company_stats")) {
      const statsId = "get_company_stats-" + Date.now();
      executedToolCalls.push({ id: statsId, name: "get_company_stats", args: {}, status: "calling" });
      writer.sendEvent("tool_call", { name: "get_company_stats", args: {} });

      try {
        companyStats = await ToolRegistry.executeTool("get_company_stats", {}, { commandContext, sendEvent: (e, d) => writer.sendEvent(e as any, d), baseUrl });
      } catch (_e) {}

      const sIdx = executedToolCalls.findIndex(t => t.id === statsId);
      if (sIdx !== -1) {
        executedToolCalls[sIdx].status = "complete";
        executedToolCalls[sIdx].result = companyStats;
      }
      writer.sendEvent("tool_result", { name: "get_company_stats", result: companyStats });
    }

    // 3. Execute query_leads if allowed
    let leadsData: any = [];
    if (intentDecision.allowedTools.includes("query_leads")) {
      const leadsId = "query_leads-" + Date.now();
      const leadsArgs = { query: cleanSearchTopic, limit: 15 };
      executedToolCalls.push({ id: leadsId, name: "query_leads", args: leadsArgs, status: "calling" });
      writer.sendEvent("tool_call", { name: "query_leads", args: leadsArgs });

      try {
        leadsData = await ToolRegistry.executeTool("query_leads", leadsArgs, { commandContext, sendEvent: (e, d) => writer.sendEvent(e as any, d), baseUrl });
      } catch (_e) {}

      const lIdx = executedToolCalls.findIndex(t => t.id === leadsId);
      if (lIdx !== -1) {
        executedToolCalls[lIdx].status = "complete";
        executedToolCalls[lIdx].result = leadsData;
      }
      writer.sendEvent("tool_result", { name: "query_leads", result: leadsData });
    }

    // 4. Execute agreements if allowed
    if (intentDecision.allowedTools.includes("get_admin_agreements")) {
      const agrId = "get_admin_agreements-" + Date.now();
      executedToolCalls.push({ id: agrId, name: "get_admin_agreements", args: {}, status: "calling" });
      writer.sendEvent("tool_call", { name: "get_admin_agreements", args: {} });
      let agrResult: any = null;
      try {
        agrResult = await ToolRegistry.executeTool("get_admin_agreements", {}, { commandContext, sendEvent: (e, d) => writer.sendEvent(e as any, d), baseUrl });
      } catch (e: any) {
        agrResult = { error: e.message };
      }
      const aIdx = executedToolCalls.findIndex(t => t.id === agrId);
      if (aIdx !== -1) {
        executedToolCalls[aIdx].status = "complete";
        executedToolCalls[aIdx].result = agrResult;
      }
      writer.sendEvent("tool_result", { name: "get_admin_agreements", result: agrResult });
    }

    // 5. Execute invoices if allowed
    if (intentDecision.allowedTools.includes("get_admin_invoices")) {
      const invId = "get_admin_invoices-" + Date.now();
      executedToolCalls.push({ id: invId, name: "get_admin_invoices", args: {}, status: "calling" });
      writer.sendEvent("tool_call", { name: "get_admin_invoices", args: {} });
      let invResult: any = null;
      try {
        invResult = await ToolRegistry.executeTool("get_admin_invoices", {}, { commandContext, sendEvent: (e, d) => writer.sendEvent(e as any, d), baseUrl });
      } catch (e: any) {
        invResult = { error: e.message };
      }
      const iIdx = executedToolCalls.findIndex(t => t.id === invId);
      if (iIdx !== -1) {
        executedToolCalls[iIdx].status = "complete";
        executedToolCalls[iIdx].result = invResult;
      }
      writer.sendEvent("tool_result", { name: "get_admin_invoices", result: invResult });
    }

    // Synthesize response markdown
    const totalLeads = companyStats.totalLeads ?? (Array.isArray(leadsData) ? leadsData.length : 0);
    const activeReqs = companyStats.activeRequisitions ?? 0;
    const activeDepts = companyStats.activeDepartments ?? 0;
    const leadsList = Array.isArray(leadsData) ? leadsData : (Array.isArray(companyStats.recentLeads) ? companyStats.recentLeads : []);
    const webResultsList: Array<{ title: string; snippet: string; url: string }> = searchWebResult?.results || [];

    let responseMarkdown = "";
    if (isWebSearch && webResultsList.length > 0) {
      responseMarkdown = `### 🌐 Live Web Search Results for "${cleanSearchTopic}"

#### 🔍 Online Market & Web Findings (${webResultsList.length} Found)
${webResultsList.map((r, i) => `**${i + 1}. [${r.title}](${r.url})**\n${r.snippet}`).join("\n\n---\n\n")}

---

### 📊 Related Internal Telemetry Summary
- **Database Pipeline**: **${totalLeads} Total Ingested Leads**
- **Active Requisitions**: **${activeReqs} Open Job Openings**`;
    } else if (lowerMsg.includes("brief") || lowerMsg.includes("operating") || lowerMsg.includes("weekly") || lowerMsg.includes("report") || lowerMsg.includes("overview") || lowerMsg.includes("summary")) {
      responseMarkdown = `## 📋 Executive Operating Brief — GrowX Labs

### 📊 1. Live Database Telemetry Summary
- **Total Leads Ingested**: **${totalLeads} Records**
- **Active Job Requisitions**: **${activeReqs} Positions**
- **Configured Departments**: **${activeDepts} Functional Units**

| Metric | Live Database Count | Primary Status | Path |
| --- | --- | --- | --- |
| Customer Pipeline | ${totalLeads} Leads | Active | /admin/sales/leads |
| Recruitment Openings | ${activeReqs} Requisitions | Operational | /admin/recruitment/operations |
| Department Headcount | ${activeDepts} Departments | Configured | /admin/people/departments |

---

### 💼 2. Recent Database Lead Pipeline
${leadsList.length ? `| Name / Contact | Company / Sector | Location / Status |
| --- | --- | --- |
${leadsList.slice(0, 8).map((l: any) => `| **${l.name || l.business_name || l.contact_name || "Lead Record"}** | ${l.company || l.business_name || "Commercial"} | ${l.city || l.location || l.status || "Active"} |`).join("\n")}` : `* Database pipeline currently contains ${totalLeads} lead records.`}`;
    } else if (intentDecision.allowedTools.includes("query_leads")) {
      responseMarkdown = `### 🏢 Database Lead & Pipeline Results for "${cleanSearchTopic}"

#### 📋 Pipeline Records (${leadsList.length} Found)
${leadsList.length ? `| Business / Name | City / Location | Email / Phone | Status |
| --- | --- | --- | --- |
${leadsList.map((l: any) => `| **${l.business_name || l.name || "Lead"}** | ${l.city || "Vijayawada"} | ${l.email || l.phone || "On File"} | ${l.status || "new"} |`).join("\n")}` : `* No matching leads found for "${cleanSearchTopic}". Total leads in database: ${totalLeads}.`}

#### 📈 Lead Pipeline Summary
- **Total Ingested Leads**: **${totalLeads}**
- **Active Requisitions**: **${activeReqs}**`;
    } else {
      responseMarkdown = `I have completed the operations for your request: "${message.slice(0, 120)}".`;
    }

    const words = responseMarkdown.split(" ");
    for (let i = 0; i < words.length; i++) {
      const delta = (i === 0 ? "" : " ") + words[i];
      accumulatedText += delta;
      writer.sendEvent("text_delta", { text: delta });
    }

    await MessageRepository.createMessage({
      conversationId,
      organizationId: commandContext.organizationId,
      workspaceId: commandContext.workspaceId,
      sender: "gxl",
      text: accumulatedText,
      toolCalls: executedToolCalls,
    });

    writer.sendEvent("done", {});
    writer.close();
  }
}
