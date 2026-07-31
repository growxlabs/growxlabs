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
  confidence: number;
  requiresModel: boolean;
  requiresTools: boolean;
  allowedTools: string[];
  requiresApproval: boolean;
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
      confidence: 1.0,
      requiresModel: false,
      requiresTools: false,
      allowedTools: [],
      requiresApproval: false,
      reason: "Pure greeting matched deterministically."
    };
  }

  // 2. COURTESY (pure courtesy/acknowledgment)
  const courtesyPatterns = [
    "thanks", "thank you", "great", "okay", "ok", "got it", "bye", "see you",
    "thanks bro", "thank you so much", "perfect", "awesome", "bye bye"
  ];
  if (courtesyPatterns.includes(normalized)) {
    return {
      intent: "courtesy",
      confidence: 1.0,
      requiresModel: false,
      requiresTools: false,
      allowedTools: [],
      requiresApproval: false,
      reason: "Pure courtesy matched deterministically."
    };
  }

  // 3. SMALL TALK / PRODUCT HELP / CAPABILITIES
  const smallTalkPatterns = ["how are you", "who are you", "who developed you", "who made you"];
  if (smallTalkPatterns.includes(normalized)) {
    return {
      intent: "small_talk",
      confidence: 1.0,
      requiresModel: false,
      requiresTools: false,
      allowedTools: [],
      requiresApproval: false,
      reason: "Small talk matched deterministically."
    };
  }

  const capabilityQuestions = ["what can you do", "help", "what tools do you have", "what are your features"];
  if (capabilityQuestions.includes(normalized)) {
    return {
      intent: "product_help",
      confidence: 1.0,
      requiresModel: false,
      requiresTools: false,
      allowedTools: [],
      requiresApproval: false,
      reason: "Product capabilities query matched deterministically."
    };
  }

  if (normalized.startsWith("how do i") || normalized.startsWith("how to use") || normalized.includes("activity panel") || normalized.includes("attach file")) {
    return {
      intent: "product_help",
      confidence: 0.9,
      requiresModel: false,
      requiresTools: false,
      allowedTools: [],
      requiresApproval: false,
      reason: "Product help matched deterministically."
    };
  }

  // 4. GENERAL KNOWLEDGE QUESTIONS (e.g., explain OAuth, SSE, JWT, coding, etc.)
  const isGeneralKnowledge = (
    normalized.startsWith("what is ") || 
    normalized.startsWith("explain ") || 
    normalized.startsWith("how does ")
  ) && !(
    normalized.includes("lead") || 
    normalized.includes("invoice") || 
    normalized.includes("requisition") || 
    normalized.includes("department") || 
    normalized.includes("proposal") || 
    normalized.includes("sow") || 
    normalized.includes("agreement")
  );
  if (isGeneralKnowledge) {
    return {
      intent: "knowledge",
      confidence: 0.8,
      requiresModel: true,
      requiresTools: false,
      allowedTools: [],
      requiresApproval: false,
      reason: "General knowledge question without internal business keywords."
    };
  }

  // 5. AGENT WORKFLOWS (Multi-step operational actions)
  const isWorkflow = (
    (normalized.includes("and create") || normalized.includes("and then") || normalized.includes("then create")) ||
    (normalized.includes("analyse") && normalized.includes("report")) ||
    (normalized.includes("review") && normalized.includes("suggest"))
  );
  if (isWorkflow) {
    const allowed: string[] = [];
    if (normalized.includes("proposal") || normalized.includes("sow")) allowed.push("generate_proposal");
    if (normalized.includes("search") || normalized.includes("competitor") || normalized.includes("web")) allowed.push("search_web");
    if (normalized.includes("lead")) allowed.push("query_leads");
    if (normalized.includes("stats") || normalized.includes("metric")) allowed.push("get_company_stats");
    return {
      intent: "agent_workflow",
      confidence: 0.85,
      requiresModel: true,
      requiresTools: true,
      allowedTools: allowed.length ? allowed : ["get_company_stats", "query_leads", "search_web", "generate_proposal"],
      requiresApproval: normalized.includes("send") || normalized.includes("dispatch") || normalized.includes("create"),
      reason: "Detected multi-step operational agent workflow request."
    };
  }

  // 6. WEB RESEARCH
  const isResearch = normalized.includes("research") || normalized.includes("search the web") || normalized.includes("search google") || normalized.includes("online trends") || normalized.includes("web search");
  if (isResearch) {
    return {
      intent: "research",
      confidence: 0.9,
      requiresModel: true,
      requiresTools: true,
      allowedTools: ["search_web"],
      requiresApproval: false,
      reason: "Detected external web research / live search intent."
    };
  }

  // 7. BUSINESS WRITE ACTIONS
  const isWrite = normalized.startsWith("create") || normalized.startsWith("add") || normalized.startsWith("insert") || normalized.startsWith("send") || normalized.startsWith("dispatch") || normalized.startsWith("email") || normalized.startsWith("publish");
  if (isWrite) {
    const allowed: string[] = [];
    let approvalNeeded = false;

    if (normalized.includes("lead")) {
      allowed.push("create_lead", "batch_create_leads");
    }
    if (normalized.includes("proposal") || normalized.includes("sow")) {
      allowed.push("generate_proposal");
    }
    if (normalized.includes("invoice")) {
      allowed.push("create_admin_invoice", "send_admin_invoice");
      approvalNeeded = true;
    }
    if (normalized.includes("project")) {
      allowed.push("create_admin_project");
    }
    if (normalized.includes("blog") || normalized.includes("newsletter")) {
      allowed.push("send_blog_to_subscribers");
      approvalNeeded = true;
    }

    return {
      intent: "business_write",
      confidence: 0.85,
      requiresModel: true,
      requiresTools: true,
      allowedTools: allowed.length ? allowed : ["create_lead", "generate_proposal", "create_admin_invoice", "send_admin_invoice"],
      requiresApproval: approvalNeeded,
      reason: "Business write request matching specific mutation tools."
    };
  }

  // 8. BUSINESS READ ACTIONS
  const isRead = normalized.includes("show") || normalized.includes("list") || normalized.includes("how many") || normalized.includes("get") || normalized.includes("query") || normalized.includes("view") || normalized.includes("stats") || normalized.includes("telemetry") || normalized.includes("metrics") || normalized.includes("status") || normalized.includes("total");
  if (isRead) {
    const allowed: string[] = [];
    if (normalized.includes("lead")) {
      allowed.push("get_company_stats", "query_leads");
    }
    if (normalized.includes("invoice")) {
      allowed.push("get_admin_invoices");
    }
    if (normalized.includes("agreement") || normalized.includes("contract")) {
      allowed.push("get_admin_agreements");
    }
    if (normalized.includes("project")) {
      allowed.push("get_admin_projects");
    }
    if (normalized.includes("user") || normalized.includes("client")) {
      allowed.push("get_admin_users");
    }
    if (normalized.includes("blog") || normalized.includes("newsletter") || normalized.includes("content")) {
      allowed.push("get_blog_posts_stats");
    }
    if (normalized.includes("wish") || normalized.includes("game") || normalized.includes("telemetry")) {
      allowed.push("query_wish_game_data");
    }

    // Default stats if general summary is requested
    if (allowed.length === 0) {
      allowed.push("get_company_stats");
    }

    return {
      intent: "business_read",
      confidence: 0.9,
      requiresModel: true,
      requiresTools: true,
      allowedTools: allowed,
      requiresApproval: false,
      reason: "Business read request mapped to specific read telemetry/database tools."
    };
  }

  // 9. DEFAULT / AMBIGUOUS FALLBACK
  return {
    intent: "ambiguous",
    confidence: 0.5,
    requiresModel: true,
    requiresTools: true,
    allowedTools: ["get_company_stats", "query_leads"],
    requiresApproval: false,
    reason: "Intent is ambiguous; falling back to language model with basic read tools."
  };
}
