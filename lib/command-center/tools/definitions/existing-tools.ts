export const TOOLS_DEFINITIONS = [
  {
    name: "get_company_stats",
    description: "Retrieve general business statistics including total lead count, status breakdown, and recent leads.",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "query_leads",
    description: "Query the leads database with optional filters for status, city, or record limit.",
    parameters: {
      type: "object",
      properties: {
        status: { type: "string", description: "Filter leads by status (e.g. 'new', 'contacted', 'qualified', 'lost')" },
        city: { type: "string", description: "Filter leads by city name" },
        limit: { type: "number", description: "Maximum number of records to return (default 10, max 50)" }
      }
    }
  },
  {
    name: "create_lead",
    description: "Insert a new lead record into the database.",
    parameters: {
      type: "object",
      properties: {
        business_name: { type: "string", description: "Name of the business" },
        city: { type: "string", description: "City where business is located" },
        email: { type: "string", description: "Email address for contact" },
        phone: { type: "string", description: "Phone number for contact" },
        name: { type: "string", description: "Name of contact person" },
        website_url: { type: "string", description: "Website URL of the business" },
        notes: { type: "string", description: "Optional notes about the lead" }
      },
      required: ["business_name", "city", "email", "phone"]
    }
  },
  {
    name: "create_leads_batch",
    description: "Insert multiple new lead records into the database at once. Use this to batch-save collected leads.",
    parameters: {
      type: "object",
      properties: {
        leads: {
          type: "array",
          description: "List of leads to insert",
          items: {
            type: "object",
            properties: {
              business_name: { type: "string", description: "Name of the business (required)" },
              city: { type: "string", description: "City where business is located (required)" },
              email: { type: "string", description: "Email address for contact" },
              phone: { type: "string", description: "Phone number for contact" },
              name: { type: "string", description: "Name of contact person" },
              website_url: { type: "string", description: "Website URL of the business" },
              notes: { type: "string", description: "Optional notes about the lead" }
            },
            required: ["business_name", "city"]
          }
        }
      },
      required: ["leads"]
    }
  },
  {
    name: "generate_proposal",
    description: "Generate and persist a new Scope of Work (SOW) client proposal.",
    parameters: {
      type: "object",
      properties: {
        clientName: { type: "string", description: "Name of client contact person" },
        businessName: { type: "string", description: "Name of client business" },
        selectedPackage: { type: "string", description: "Selected package (e.g. 'Standard Tier', 'Growth Tier', 'Enterprise Suite')" },
        customPrice: { type: "string", description: "Optional custom pricing override as a string (e.g. '₹7,50,000')" },
        problem: { type: "string", description: "Brief description of the client's operational problem" },
        impact: { type: "string", description: "Estimated financial impact of the pain point" },
        validDays: { type: "number", description: "Number of days the proposal remains valid (default 7)" }
      },
      required: ["clientName", "businessName", "selectedPackage"]
    }
  },
  {
    name: "search_web",
    description: "Perform a live web search to retrieve real-time market data or search engine results.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query string" },
        num: { type: "number", description: "Maximum number of search results to return (default 10, max 80)" }
      },
      required: ["query"]
    }
  },
  {
    name: "spawn_subagent",
    description: "Spawn a specialized subagent to perform focused background research, data gathering, or analysis on a specific topic.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Descriptive name of the subagent, e.g. 'Real Estate Growth Agent'" },
        focus: { type: "string", description: "The specific topic or search query the subagent should research" },
        mission: { type: "string", description: "The specific mission or goal, e.g. 'Identify top real estate agencies in Miami'" }
      },
      required: ["name", "focus", "mission"]
    }
  },
  {
    name: "get_blog_posts_stats",
    description: "Retrieve all blog posts from the database including their title, slug, sent status, and published date.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Maximum number of records to return (default 20)" }
      },
      required: []
    }
  },
  {
    name: "query_wish_game_data",
    description: "Query the wish game subscribers and telemetry logs from the database.",
    parameters: {
      type: "object",
      properties: {
        searchQuery: { type: "string", description: "Search by name, email, or wish text" },
        limit: { type: "number", description: "Maximum number of records to return (default 20)" }
      },
      required: []
    }
  },
  {
    name: "send_blog_to_subscribers",
    description: "Send/dispatch a specific blog post to all active subscribers via email newsletter.",
    parameters: {
      type: "object",
      properties: {
        blogPostId: { type: "string", description: "The UUID of the blog post to dispatch to subscribers." }
      },
      required: ["blogPostId"]
    }
  },
  {
    name: "get_admin_users",
    description: "Retrieve list of registered client users in the system, optionally filtered by a name or email search query.",
    parameters: {
      type: "object",
      properties: {
        searchQuery: { type: "string", description: "Search query for name or email" },
        limit: { type: "number", description: "Maximum number of records to return (default 20)" }
      },
      required: []
    }
  },
  {
    name: "get_admin_agreements",
    description: "Retrieve a list of client agreements (contracts) with their values, dates, and statuses.",
    parameters: {
      type: "object",
      properties: {
        clientId: { type: "string", description: "Optional UUID of the client user to filter by" },
        limit: { type: "number", description: "Maximum number of records to return (default 20)" }
      },
      required: []
    }
  },
  {
    name: "get_admin_invoices",
    description: "Retrieve a list of billing invoices showing amounts, statuses, and due dates.",
    parameters: {
      type: "object",
      properties: {
        clientId: { type: "string", description: "Optional UUID of the client user to filter by" },
        status: { type: "string", description: "Optional status filter (e.g. 'pending', 'paid', 'failed')" },
        limit: { type: "number", description: "Maximum number of records to return (default 20)" }
      },
      required: []
    }
  },
  {
    name: "create_admin_invoice",
    description: "Create and persist a new billing invoice in the system for a specific client user.",
    parameters: {
      type: "object",
      properties: {
        clientId: { type: "string", description: "The UUID of the client user to invoice (required)" },
        agreementId: { type: "string", description: "Optional UUID of the agreement this invoice relates to" },
        amount: { type: "number", description: "Invoice amount in decimals (required)" },
        balanceDue: { type: "number", description: "Balance due amount in decimals (required)" },
        dueDate: { type: "string", description: "Due date in YYYY-MM-DD format (required)" },
        advancePaid: { type: "boolean", description: "True if advance has been paid" }
      },
      required: ["clientId", "amount", "balanceDue", "dueDate"]
    }
  },
  {
    name: "get_admin_projects",
    description: "Retrieve a list of client development projects and their current completion progress (0-100).",
    parameters: {
      type: "object",
      properties: {
        clientId: { type: "string", description: "Optional UUID of the client user to filter by" },
        limit: { type: "number", description: "Maximum number of records to return (default 20)" }
      },
      required: []
    }
  },
  {
    name: "create_admin_project",
    description: "Create and persist a new development project milestone for a specific client user.",
    parameters: {
      type: "object",
      properties: {
        clientId: { type: "string", description: "The UUID of the client user (required)" },
        title: { type: "string", description: "The descriptive title of the project (required)" },
        status: { type: "string", description: "Initial status of the project (default 'pending', e.g. 'pending', 'active', 'completed')" },
        progress: { type: "number", description: "Initial progress percentage from 0 to 100 (default 0)" }
      },
      required: ["clientId", "title"]
    }
  },
  {
    name: "send_admin_invoice",
    description: "Send a billing invoice PDF link to a client user via email using Resend.",
    parameters: {
      type: "object",
      properties: {
        invoiceId: { type: "string", description: "The UUID of the invoice to send (required)" },
        email: { type: "string", description: "Optional email address to override the invoice's default destination" }
      },
      required: ["invoiceId"]
    }
  }
];

export const OPENAI_TOOLS = TOOLS_DEFINITIONS.map(d => ({
  type: "function" as const,
  function: {
    name: d.name,
    description: d.description,
    parameters: d.parameters
  }
}));
