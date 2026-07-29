import { z } from "zod";

export const GetCompanyStatsSchema = z.object({});

export const QueryLeadsSchema = z.object({
  status: z.string().optional(),
  city: z.string().optional(),
  limit: z.number().optional().default(10)
});

export const CreateLeadSchema = z.object({
  business_name: z.string().min(1),
  city: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  name: z.string().optional(),
  website_url: z.string().optional(),
  notes: z.string().optional()
});

export const BatchCreateLeadsSchema = z.object({
  leads: z.array(z.object({
    business_name: z.string().min(1),
    city: z.string().min(1),
    email: z.string().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
    website_url: z.string().optional(),
    notes: z.string().optional()
  })).min(1)
});

export const GenerateProposalSchema = z.object({
  clientName: z.string().min(1),
  businessName: z.string().min(1),
  selectedPackage: z.string().min(1),
  customPrice: z.string().optional(),
  problem: z.string().optional(),
  impact: z.string().optional(),
  validDays: z.number().optional().default(7)
});

export const SearchWebSchema = z.object({
  query: z.string().min(1),
  num: z.number().optional().default(10)
});

export const SpawnSubagentSchema = z.object({
  name: z.string().min(1),
  focus: z.string().min(1),
  mission: z.string().min(1)
});

export const GetBlogPostsStatsSchema = z.object({
  limit: z.number().optional().default(20)
});

export const QueryWishGameDataSchema = z.object({
  searchQuery: z.string().optional(),
  limit: z.number().optional().default(20)
});

export const SendBlogToSubscribersSchema = z.object({
  blogPostId: z.string().min(1)
});

export const GetAdminUsersSchema = z.object({
  searchQuery: z.string().optional(),
  limit: z.number().optional().default(20)
});

export const GetAdminAgreementsSchema = z.object({
  clientId: z.string().optional(),
  limit: z.number().optional().default(20)
});

export const GetAdminInvoicesSchema = z.object({
  clientId: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().optional().default(20)
});

export const CreateAdminInvoiceSchema = z.object({
  clientId: z.string().min(1),
  agreementId: z.string().optional(),
  amount: z.number().positive(),
  balanceDue: z.number(),
  dueDate: z.string().min(1),
  advancePaid: z.boolean().optional().default(false)
});

export const GetAdminProjectsSchema = z.object({
  clientId: z.string().optional(),
  limit: z.number().optional().default(20)
});

export const CreateAdminProjectSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1),
  status: z.string().optional().default("pending"),
  progress: z.number().min(0).max(100).optional().default(0)
});

export const SendAdminInvoiceSchema = z.object({
  invoiceId: z.string().min(1),
  email: z.string().email().optional()
});
