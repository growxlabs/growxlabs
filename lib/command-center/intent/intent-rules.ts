import { IntentRuleDefinition } from "./intent.types";

export const INTENT_RULES: IntentRuleDefinition[] = [
  {
    intentType: "CREATE_LEAD",
    patterns: [
      /create\s+(a\s+)?lead/i,
      /add\s+(a\s+)?lead/i,
      /insert\s+(a\s+)?lead/i,
      /save\s+(a\s+)?lead/i,
      /batch\s+create\s+leads/i
    ],
    department: "Sales",
    action: "create",
    resource: "lead",
    minConfidence: 0.95
  },
  {
    intentType: "QUERY_LEADS",
    patterns: [
      /get\s+lead/i,
      /query\s+lead/i,
      /list\s+lead/i,
      /show\s+lead/i,
      /lead\s+stat/i,
      /company\s+stat/i
    ],
    department: "Sales",
    action: "query",
    resource: "lead",
    minConfidence: 0.90
  },
  {
    intentType: "GENERATE_PROPOSAL",
    patterns: [
      /generate\s+(a\s+)?proposal/i,
      /create\s+(a\s+)?proposal/i,
      /draft\s+(a\s+)?proposal/i,
      /create\s+(a\s+)?sow/i,
      /sow\s+proposal/i
    ],
    department: "Sales",
    action: "generate",
    resource: "proposal",
    minConfidence: 0.95
  },
  {
    intentType: "CREATE_INVOICE",
    patterns: [
      /create\s+(an\s+)?invoice/i,
      /generate\s+(an\s+)?invoice/i,
      /issue\s+(an\s+)?invoice/i,
      /send\s+(an\s+)?invoice/i
    ],
    department: "Finance",
    action: "create",
    resource: "invoice",
    minConfidence: 0.95
  },
  {
    intentType: "QUERY_FINANCE",
    patterns: [
      /get\s+invoice/i,
      /list\s+invoice/i,
      /get\s+agreement/i,
      /list\s+agreement/i,
      /show\s+agreement/i,
      /financial\s+stat/i
    ],
    department: "Finance",
    action: "query",
    resource: "finance",
    minConfidence: 0.90
  },
  {
    intentType: "QUERY_PROJECTS",
    patterns: [
      /get\s+project/i,
      /list\s+project/i,
      /create\s+project/i,
      /project\s+progress/i,
      /project\s+milestone/i
    ],
    department: "Engineering",
    action: "query",
    resource: "project",
    minConfidence: 0.90
  },
  {
    intentType: "CONTENT_DISPATCH",
    patterns: [
      /send\s+(a\s+)?blog/i,
      /dispatch\s+newsletter/i,
      /email\s+blog/i,
      /send\s+newsletter/i,
      /get\s+blog\s+stat/i
    ],
    department: "Content",
    action: "dispatch",
    resource: "blog",
    minConfidence: 0.90
  },
  {
    intentType: "INFORMATION_LOOKUP",
    patterns: [
      /search\s+web/i,
      /lookup\s+web/i,
      /search\s+online/i,
      /google\s+search/i
    ],
    department: "Research",
    action: "search",
    resource: "web",
    minConfidence: 0.85
  }
];
