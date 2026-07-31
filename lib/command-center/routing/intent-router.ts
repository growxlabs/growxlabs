export type CommandIntent =
  | "greeting"
  | "courtesy"
  | "small_talk"
  | "product_help"
  | "knowledge"
  | "business_read"
  | "business_write"
  | "research"
  | "agent_workflow"
  | "ambiguous";

export interface IntentDecision {
  intent: CommandIntent;
  allowedTools: string[];
  requiresModel: boolean;
  requiresTools: boolean;
  reason: string;
}

function normalizeMessage(value: string): string {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function routeCommandIntent(input: {
  message: string;
  history?: Array<{ sender: string; text: string }>;
  attachments?: Array<{ name: string; type: string }>;
}): IntentDecision {
  const message = input.message || "";
  const normalized = normalizeMessage(message);

  // 1. GREETINGS (pure greetings)
  const greetingPatterns = [
    "hi", "hii", "hiii", "hiiii", "hello", "hey", "heyy", "yo", "sup",
    "good morning", "good afternoon", "good evening", "howdy", "hola",
    "hello bro", "hi there", "hii bro", "hey there", "yoo", "hlo", "hiii bro", "hey bro"
  ];
  if (greetingPatterns.includes(normalized)) {
    return {
      intent: "greeting",
      allowedTools: [],
      requiresModel: false,
      requiresTools: false,
      reason: "Matched pure greeting pattern."
    };
  }

  // 2. COURTESY / EXIT
  const courtesyPatterns = [
    "thanks", "thank you", "thank u", "ty", "thankyou",
    "bye", "goodbye", "byebye", "see you", "exit", "quit",
    "awesome", "cool", "perfect", "great", "nice", "ok", "okay", "got it"
  ];
  if (courtesyPatterns.includes(normalized)) {
    return {
      intent: "courtesy",
      allowedTools: [],
      requiresModel: false,
      requiresTools: false,
      reason: "Matched courtesy pattern."
    };
  }

  // 3. SMALL TALK
  const smallTalkRegex = /^(how\s+are\s+you|hows\s+it\s+going|what\s+is\s+up|whats\s+up|how\s+are\s+u|who\s+are\s+you|what\s+are\s+you|are\s+you\s+real|who\s+made\s+you|who\s+created\s+you|tell\s+me\s+about\s+yourself)$/i;
  if (smallTalkRegex.test(normalized)) {
    return {
      intent: "small_talk",
      allowedTools: [],
      requiresModel: false,
      requiresTools: false,
      reason: "Matched small talk query."
    };
  }

  // 4. PRODUCT HELP
  const productHelpRegex = /^(help|what\s+can\s+you\s+do|how\s+do\s+i|capabilities|commands|features|list\s+tools|show\s+tools|explain\s+command\s+center|how\s+to\s+use|use\s+agent|what\s+agent\s+do)$/i;
  const isHelpQuery = productHelpRegex.test(normalized) ||
    normalized.includes("how do i use") ||
    normalized.includes("what are your features") ||
    normalized.includes("what can you help");
  if (isHelpQuery) {
    return {
      intent: "product_help",
      allowedTools: [],
      requiresModel: false,
      requiresTools: false,
      reason: "Matched product capabilities help request."
    };
  }

  // 5. GENERAL KNOWLEDGE QUESTIONS (e.g. "what is OAuth", "explain JWT")
  // These should run the LLM models, but must not execute any operational database tools.
  const isKnowledgeQuery =
    (normalized.startsWith("what is") || normalized.startsWith("explain") || normalized.startsWith("how does")) &&
    !normalized.includes("lead") &&
    !normalized.includes("proposal") &&
    !normalized.includes("invoice") &&
    !normalized.includes("agreement") &&
    !normalized.includes("blog") &&
    !normalized.includes("subscriber") &&
    !normalized.includes("hiring") &&
    !normalized.includes("candidate");

  if (isKnowledgeQuery) {
    return {
      intent: "knowledge",
      allowedTools: [],
      requiresModel: true,
      requiresTools: false,
      reason: "General knowledge question. Model allowed but tools restricted."
    };
  }

  // 6. BUSINESS OPERATIONS READ (leads, stats, blog stats, invoices, agreements)
  const isRead = normalized.includes("show") || normalized.includes("get") || normalized.includes("list") || normalized.includes("find") || normalized.includes("search") || normalized.includes("query") || normalized.includes("view") || normalized.includes("read");
  const isLeads = normalized.includes("lead") || normalized.includes("pipeline") || normalized.includes("customer") || normalized.includes("crm");
  const isStats = normalized.includes("stats") || normalized.includes("statistic") || normalized.includes("telemetry") || normalized.includes("brief") || normalized.includes("report") || normalized.includes("overview") || normalized.includes("summary");
  const isBlogs = normalized.includes("blog") || normalized.includes("article") || normalized.includes("newsletter") || normalized.includes("content");
  const isInvoice = normalized.includes("invoice") || normalized.includes("billing") || normalized.includes("payment");
  const isAgreement = normalized.includes("agreement") || normalized.includes("contract") || normalized.includes("sow");

  if (isRead) {
    const tools: string[] = [];
    if (isLeads) tools.push("query_leads");
    if (isStats) tools.push("get_company_stats");
    if (isBlogs) tools.push("get_blog_posts_stats");
    if (isInvoice) tools.push("get_admin_invoices");
    if (isAgreement) tools.push("get_admin_agreements");

    if (tools.length > 0) {
      // Always allow get_company_stats alongside leads for summary lookups
      if (tools.includes("query_leads") && !tools.includes("get_company_stats")) {
        tools.push("get_company_stats");
      }
      return {
        intent: "business_read",
        allowedTools: tools,
        requiresModel: true,
        requiresTools: true,
        reason: `Business read operation. Allowed: ${tools.join(", ")}`
      };
    }
  }

  // 7. BUSINESS OPERATIONS WRITE (create lead, generate proposal, create invoice, send invoice)
  const isWrite = normalized.includes("add") || normalized.includes("create") || normalized.includes("insert") || normalized.includes("save") || normalized.includes("generate") || normalized.includes("new") || normalized.includes("send") || normalized.includes("dispatch");
  if (isWrite) {
    const tools: string[] = [];
    if (isLeads) {
      tools.push("create_lead");
      tools.push("create_leads_batch");
    }
    if (isAgreement || normalized.includes("proposal")) {
      tools.push("generate_proposal");
    }
    if (isInvoice) {
      tools.push("create_admin_invoice");
      tools.push("send_admin_invoice");
    }
    if (isBlogs) {
      tools.push("send_blog_to_subscribers");
      tools.push("get_blog_posts_stats"); // Often needed as dependency
    }

    if (tools.length > 0) {
      return {
        intent: "business_write",
        allowedTools: tools,
        requiresModel: true,
        requiresTools: true,
        reason: `Business write operation. Allowed: ${tools.join(", ")}`
      };
    }
  }

  // 8. RESEARCH (web search / crawler)
  const isResearch = normalized.includes("web") || normalized.includes("search") || normalized.includes("google") || normalized.includes("research") || normalized.includes("market") || normalized.includes("internet") || normalized.includes("online");
  if (isResearch) {
    return {
      intent: "research",
      allowedTools: ["search_web"],
      requiresModel: true,
      requiresTools: true,
      reason: "Market or web research query. Allowed: search_web"
    };
  }

  // 9. AGENT WORKFLOW (subagents creation)
  const isWorkflow = normalized.includes("agent") || normalized.includes("spawn") || normalized.includes("subagent");
  if (isWorkflow) {
    return {
      intent: "agent_workflow",
      allowedTools: ["spawn_subagent"],
      requiresModel: true,
      requiresTools: true,
      reason: "Agent spawning workflow. Allowed: spawn_subagent"
    };
  }

  // 10. AMBIGUOUS / FALLBACK ROUTING
  // Default to allowing essential safe tools so we don't break capability searches
  return {
    intent: "ambiguous",
    allowedTools: ["query_leads", "get_company_stats", "get_blog_posts_stats", "search_web"],
    requiresModel: true,
    requiresTools: true,
    reason: "Ambiguous query. Restricting to safe search and analytics lookup tools."
  };
}
