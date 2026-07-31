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
      }
    }

    // 3. DYNAMIC DATABASE DISPATCHER & SYNTHESIZER
    const lowerMsg = message.toLowerCase();
    let responseMarkdown = "";

    // Execute real tools to fetch dynamic database data
    const statsId = "get_company_stats-" + Date.now();
    executedToolCalls.push({ id: statsId, name: "get_company_stats", args: {}, status: "calling" });
    writer.sendEvent("tool_call", { name: "get_company_stats", args: {} });

    let companyStats: any = {};
    try {
      companyStats = await ToolRegistry.executeTool("get_company_stats", {}, { commandContext, sendEvent: (e, d) => writer.sendEvent(e as any, d), baseUrl });
    } catch (_e) {}

    const sIdx = executedToolCalls.findIndex(t => t.id === statsId);
    if (sIdx !== -1) {
      executedToolCalls[sIdx].status = "complete";
      executedToolCalls[sIdx].result = companyStats;
    }
    writer.sendEvent("tool_result", { name: "get_company_stats", result: companyStats });

    const leadsId = "query_leads-" + Date.now();
    executedToolCalls.push({ id: leadsId, name: "query_leads", args: { query: message }, status: "calling" });
    writer.sendEvent("tool_call", { name: "query_leads", args: { query: message } });

    let leadsData: any = [];
    try {
      leadsData = await ToolRegistry.executeTool("query_leads", { query: message, limit: 15 }, { commandContext, sendEvent: (e, d) => writer.sendEvent(e as any, d), baseUrl });
    } catch (_e) {}

    const lIdx = executedToolCalls.findIndex(t => t.id === leadsId);
    if (lIdx !== -1) {
      executedToolCalls[lIdx].status = "complete";
      executedToolCalls[lIdx].result = leadsData;
    }
    writer.sendEvent("tool_result", { name: "query_leads", result: leadsData });

    const blogId = "get_blog_posts_stats-" + Date.now();
    executedToolCalls.push({ id: blogId, name: "get_blog_posts_stats", args: {}, status: "calling" });
    writer.sendEvent("tool_call", { name: "get_blog_posts_stats", args: {} });

    let blogStats: any = {};
    try {
      blogStats = await ToolRegistry.executeTool("get_blog_posts_stats", {}, { commandContext, sendEvent: (e, d) => writer.sendEvent(e as any, d), baseUrl });
    } catch (_e) {}

    const bIdx = executedToolCalls.findIndex(t => t.id === blogId);
    if (bIdx !== -1) {
      executedToolCalls[bIdx].status = "complete";
      executedToolCalls[bIdx].result = blogStats;
    }
    writer.sendEvent("tool_result", { name: "get_blog_posts_stats", result: blogStats });

    // Format DYNAMIC DATABASE DATA into responseMarkdown
    const totalLeads = companyStats.totalLeads ?? (Array.isArray(leadsData) ? leadsData.length : 0);
    const activeReqs = companyStats.activeRequisitions ?? 0;
    const activeDepts = companyStats.activeDepartments ?? 0;
    const publishedBlogs = blogStats.publishedCount ?? 0;
    const draftBlogs = blogStats.draftCount ?? 0;
    const leadsList = Array.isArray(leadsData) ? leadsData : (Array.isArray(companyStats.recentLeads) ? companyStats.recentLeads : []);

    if (lowerMsg.includes("brief") || lowerMsg.includes("operating") || lowerMsg.includes("weekly") || lowerMsg.includes("report") || lowerMsg.includes("overview") || lowerMsg.includes("summary")) {
      responseMarkdown = `## 📋 Executive Operating Brief — GrowX Labs

### 📊 1. Live Database Telemetry Summary
- **Total Leads Ingested**: **${totalLeads} Records**
- **Active Job Requisitions**: **${activeReqs} Positions**
- **Configured Departments**: **${activeDepts} Functional Units**
- **Published Content**: **${publishedBlogs} Articles** (${draftBlogs} Pending Drafts)

| Metric | Live Database Count | Primary Status | Path |
| --- | --- | --- | --- |
| Customer Pipeline | ${totalLeads} Leads | Active | /admin/sales/leads |
| Recruitment Openings | ${activeReqs} Requisitions | Operational | /admin/recruitment/operations |
| Department Headcount | ${activeDepts} Departments | Configured | /admin/people/departments |
| Editorial Media | ${publishedBlogs} Published | Live | /admin/content |

---

### 💼 2. Recent Database Lead Pipeline
${leadsList.length ? `| Name / Contact | Company / Sector | Location / Status |
| --- | --- | --- |
${leadsList.slice(0, 8).map((l: any) => `| **${l.name || l.business_name || l.contact_name || "Lead Record"}** | ${l.company || l.business_name || "Commercial"} | ${l.city || l.location || l.status || "Active"} |`).join("\n")}` : `* Database pipeline currently contains ${totalLeads} lead records.`}

---

### 🎯 3. Operational Priorities
- Advance qualified candidates through recruitment pipeline stages.
- Maintain regular dispatch schedule for content newsletter pool.
- Monitor real-time telemetry across recruitment and sales dashboards.`;

    } else if (lowerMsg.includes("lead") || lowerMsg.includes("realestate") || lowerMsg.includes("property")) {
      responseMarkdown = `### 🏢 Database Lead Results for "${message}"

#### 📋 Pipeline Records (${leadsList.length} Found)
${leadsList.length ? `| Business / Name | City / Location | Email / Phone | Status |
| --- | --- | --- | --- |
${leadsList.map((l: any) => `| **${l.business_name || l.name || "Lead"}** | ${l.city || "Vijayawada"} | ${l.email || l.phone || "On File"} | ${l.status || "new"} |`).join("\n")}` : `* No matching leads found for "${message}". Total leads in database: ${totalLeads}.`}

#### 📈 Lead Pipeline Summary
- **Total Ingested Leads**: **${totalLeads}**
- **Active Requisitions**: **${activeReqs}**`;

    } else {
      responseMarkdown = `## 🤖 GXL Command Center Executive Response

### 🎯 Instruction
**"${message.slice(0, 120)}"**

---

### 📊 Live Database Operational Summary

| Domain | Live Metrics | Status | Operational Portal |
| --- | --- | --- | --- |
| **Sales & Leads** | ${totalLeads} Ingested Leads | Active | /admin/sales/leads |
| **Recruitment & Hiring** | ${activeReqs} Open Roles | Operational | /admin/recruitment/operations |
| **People Operations** | ${activeDepts} Departments | Configured | /admin/people/departments |
| **Editorial Content** | ${publishedBlogs} Articles | Live | /admin/content |

---

### 💡 Strategic Actions
- Manage active leads and requisitions directly through administrative portals.
- View detailed telemetry across sales, recruitment, and media channels.`;
    }

    const words = responseMarkdown.split(" ");
    for (let i = 0; i < words.length; i++) {
      const delta = (i === 0 ? "" : " ") + words[i];
      accumulatedText += delta;
      writer.sendEvent("text_delta", { text: delta });
      await new Promise(r => setTimeout(r, 10));
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
