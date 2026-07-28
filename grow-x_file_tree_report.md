# Grow-X Codebase: Comprehensive File Tree & Structure Report

This report provides an exhaustive, recursive mapping of all source files in the **grow-x** application, complete with file sizes, line counts, architectural categorization, and functional descriptions.

## 1. Codebase Summary Statistics

- **Total Source Files**: 848 (excluding node_modules, build caches, and test/scratch/git meta-directories)
- **Total Lines of Code**: 1092154 lines
- **Total Codebase Size**: 144771.24 KB

### File Distribution by Category

| Category | File Count |
| --- | --- |
| Root Configuration | 272 |
| App Router Pages/Layouts | 198 |
| API Routes | 150 |
| React Components | 117 |
| Library / Helpers | 54 |
| Database Schemas (SQL) | 17 |
| Business Services | 15 |
| Tests | 15 |
| Scripts | 4 |
| TypeScript Types | 4 |
| React Hooks | 2 |

---

## 2. Codebase Visual File Tree

Below is the complete tree layout of all files and folders currently in the project. (Excludes `.git`, `node_modules`, `.next`, `.vercel`, and `scratch` directories).

```text
grow-x/
├── .env.example
├── .env.local
├── .env.production
├── .gitignore
├── AGENTS.md
├── AI_Engineering_Course_Complete.txt
├── CLAUDE.md
├── DESIGN-notion.md
├── README.md
├── app/
│   ├── (hotel)/
│   │   ├── hotel/
│   │   │   ├── booking/
│   │   │   │   └── page.tsx
│   │   │   ├── confirmation/
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── room/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── rooms/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── (marketing)/
│   │   ├── agreements/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── best-website-for-small-business/
│   │   │   └── page.tsx
│   │   ├── blog/
│   │   │   ├── ai-coding-tools-are-reshaping-modern-software-engineering/
│   │   │   │   └── page.tsx
│   │   │   ├── applied-intuition-dana-physical-ai-platform/
│   │   │   │   ├── InteractiveComponents.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── blue-origin-new-glenn-rocket-explosion/
│   │   │   │   ├── InteractiveComponents.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── chatbots-are-dying-agents-are-taking-over/
│   │   │   │   ├── InteractiveComponents.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── chatgpt-gpt-5-6-preview-everything-you-need-to-know/
│   │   │   │   └── page.tsx
│   │   │   ├── claude-fable-5-mythos-5-anthropic-models/
│   │   │   │   └── page.tsx
│   │   │   ├── claude-fable-5-mythos-5-banned-us-government/
│   │   │   │   └── page.tsx
│   │   │   ├── claude-opus-4-8-anthropic-ai-model/
│   │   │   │   └── page.tsx
│   │   │   ├── elon-musks-path-to-becoming-the-worlds-first-trillionaire/
│   │   │   │   └── page.tsx
│   │   │   ├── ferraris-electric-future-why-the-luce-marks-a-historic-turning-point/
│   │   │   │   └── page.tsx
│   │   │   ├── google-io-2026/
│   │   │   │   └── page.tsx
│   │   │   ├── google-search-is-no-longer-just-search/
│   │   │   │   └── page.tsx
│   │   │   ├── indian-restaurant-website-usa/
│   │   │   │   └── page.tsx
│   │   │   ├── kimi-k3-open-frontier-intelligence-model/
│   │   │   │   ├── InteractiveComponents.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── n8n-automation-for-business/
│   │   │   │   └── page.tsx
│   │   │   ├── nvidia-vision-agentic-to-useful-ai/
│   │   │   │   ├── InteractiveComponents.tsx
│   │   │   │   ├── InteractiveNvidia.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── openai-huggingface-security-incident/
│   │   │   │   ├── InteractiveComponents.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── restaurant-customer-retention-automation/
│   │   │   │   └── page.tsx
│   │   │   ├── skyroot-aerospace-vikram-1-orbital-launch/
│   │   │   │   ├── InteractiveComponents.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── whatsapp-automation-for-lead-nurturing/
│   │   │   │   └── page.tsx
│   │   │   └── why-anthropic-is-becoming-a-serious-threat-to-openai/
│   │   │       └── page.tsx
│   │   ├── careers/
│   │   │   ├── CareersContent.tsx
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   ├── ContactContent.tsx
│   │   │   └── page.tsx
│   │   ├── courses/
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── demos/
│   │   │   ├── hotel/
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── real-estate/
│   │   │   │   └── page.tsx
│   │   │   └── restaurant/
│   │   │       └── page.tsx
│   │   ├── faq/
│   │   │   ├── FAQContent.tsx
│   │   │   └── page.tsx
│   │   ├── handover/
│   │   │   └── page.tsx
│   │   ├── how-to-get-clients-from-website/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── onboarding/
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── portfolio/
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── pricing/
│   │   │   ├── PricingTracker.tsx
│   │   │   └── page.tsx
│   │   ├── privacy/
│   │   │   ├── PrivacyContent.tsx
│   │   │   └── page.tsx
│   │   ├── refund-policy/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── sandbox/
│   │   │   └── page.tsx
│   │   ├── services/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── subscriptions/
│   │   │   └── page.tsx
│   │   ├── terms/
│   │   │   ├── TermsContent.tsx
│   │   │   └── page.tsx
│   │   ├── website-vs-growth-system/
│   │   │   └── page.tsx
│   │   └── wish-game/
│   │       ├── page.tsx
│   │       └── reel/
│   │           └── page.tsx
│   ├── (realestate)/
│   │   ├── layout.tsx
│   │   └── realestate/
│   │       ├── contact/
│   │       │   └── page.tsx
│   │       ├── page.tsx
│   │       ├── properties/
│   │       │   └── page.tsx
│   │       └── property/
│   │           └── [id]/
│   │               └── page.tsx
│   ├── (restaurant)/
│   │   ├── layout.tsx
│   │   └── restaurant/
│   │       ├── cart/
│   │       │   └── page.tsx
│   │       ├── checkout/
│   │       │   └── page.tsx
│   │       ├── menu/
│   │       │   └── page.tsx
│   │       ├── order-success/
│   │       │   └── page.tsx
│   │       ├── page.tsx
│   │       └── track-order/
│   │           └── page.tsx
│   ├── [locale]/
│   │   └── admin/
│   │       ├── ai-platform/
│   │       │   └── page.tsx
│   │       ├── marketing/
│   │       │   └── page.tsx
│   │       ├── settings/
│   │       │   └── page.tsx
│   │       └── support/
│   │           └── page.tsx
│   ├── admin/
│   │   ├── academy/
│   │   │   ├── assessments/
│   │   │   │   └── page.tsx
│   │   │   ├── certificates/
│   │   │   │   └── page.tsx
│   │   │   ├── courses/
│   │   │   │   └── page.tsx
│   │   │   ├── payments/
│   │   │   │   └── page.tsx
│   │   │   └── users/
│   │   │       └── page.tsx
│   │   ├── agreements/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   └── preview/
│   │   │       └── page.tsx
│   │   ├── ai-platform/
│   │   │   └── page.tsx
│   │   ├── apollo/
│   │   │   └── page.tsx
│   │   ├── career-portal/
│   │   │   ├── page.tsx
│   │   │   └── playbook/
│   │   │       └── page.tsx
│   │   ├── certificates/
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── clients/
│   │   │   └── page.tsx
│   │   ├── command-center/
│   │   │   ├── InteractiveWorkspace.tsx
│   │   │   └── page.tsx
│   │   ├── companies/
│   │   │   └── page.tsx
│   │   ├── contacts/
│   │   │   └── page.tsx
│   │   ├── crm/
│   │   │   ├── page.tsx
│   │   │   └── sources/
│   │   │       └── page.tsx
│   │   ├── deals/
│   │   │   └── page.tsx
│   │   ├── editorial-carousel/
│   │   │   └── page.tsx
│   │   ├── employee-onboarding/
│   │   │   └── page.tsx
│   │   ├── finance/
│   │   │   ├── accounts/
│   │   │   │   └── page.tsx
│   │   │   ├── ai-helper/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── expenses/
│   │   │   │   └── page.tsx
│   │   │   ├── invoices/
│   │   │   │   └── page.tsx
│   │   │   └── reports/
│   │   │       └── page.tsx
│   │   ├── growx-email/
│   │   │   └── page.tsx
│   │   ├── hrms/
│   │   │   ├── ai-recruiter/
│   │   │   │   └── page.tsx
│   │   │   ├── attendance/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── employees/
│   │   │   │   └── page.tsx
│   │   │   ├── leaves/
│   │   │   │   └── page.tsx
│   │   │   ├── payroll/
│   │   │   │   └── page.tsx
│   │   │   └── recruitment/
│   │   │       └── page.tsx
│   │   ├── instagram-carousel/
│   │   │   └── page.tsx
│   │   ├── invoices/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   └── preview/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   ├── leads/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   └── scrape/
│   │   │       └── page.tsx
│   │   ├── marketing/
│   │   │   └── page.tsx
│   │   ├── monetization/
│   │   │   ├── coupons/
│   │   │   │   └── page.tsx
│   │   │   └── orders/
│   │   │       └── page.tsx
│   │   ├── onboarding/
│   │   │   ├── page.tsx
│   │   │   └── preview/
│   │   │       └── page.tsx
│   │   ├── outreach/
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── pitch-deck/
│   │   │   └── page.tsx
│   │   ├── pm/
│   │   │   ├── ai-copilot/
│   │   │   │   └── page.tsx
│   │   │   ├── bugs/
│   │   │   │   └── page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── sprints/
│   │   │   │   └── page.tsx
│   │   │   ├── timesheets/
│   │   │   │   └── page.tsx
│   │   │   └── workload/
│   │   │       └── page.tsx
│   │   ├── products/
│   │   │   └── page.tsx
│   │   ├── proposals/
│   │   │   └── page.tsx
│   │   ├── quotations/
│   │   │   └── page.tsx
│   │   ├── reels-creator/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   ├── search/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   ├── page.tsx
│   │   │   └── terms/
│   │   │       └── page.tsx
│   │   ├── support/
│   │   │   └── page.tsx
│   │   ├── team/
│   │   │   └── page.tsx
│   │   ├── wish-game/
│   │   │   ├── WishAdminDashboardClient.tsx
│   │   │   └── page.tsx
│   │   └── workflows/
│   │       └── page.tsx
│   ├── api/
│   │   ├── admin/
│   │   │   ├── career-portal/
│   │   │   │   ├── list/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── schedule-interview/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── send-assessment/
│   │   │   │   │   └── route.ts
│   │   │   │   └── update/
│   │   │   │       └── route.ts
│   │   │   ├── change-password/
│   │   │   │   └── route.ts
│   │   │   ├── command-center/
│   │   │   │   └── route.ts
│   │   │   ├── coupons/
│   │   │   │   └── route.ts
│   │   │   ├── onboarding/
│   │   │   │   ├── detail/
│   │   │   │   │   └── route.ts
│   │   │   │   └── list/
│   │   │   │       └── route.ts
│   │   │   ├── settings/
│   │   │   │   └── terms/
│   │   │   │       └── route.ts
│   │   │   └── team/
│   │   │       └── route.ts
│   │   ├── admin-setup/
│   │   │   ├── ai/
│   │   │   │   └── route.ts
│   │   │   ├── dashboard/
│   │   │   │   └── route.ts
│   │   │   ├── integrations/
│   │   │   │   └── route.ts
│   │   │   ├── rbac/
│   │   │   │   └── route.ts
│   │   │   ├── security/
│   │   │   │   └── route.ts
│   │   │   └── users/
│   │   │       └── route.ts
│   │   ├── agreements/
│   │   │   ├── create/
│   │   │   │   └── route.ts
│   │   │   ├── detail/
│   │   │   │   └── route.ts
│   │   │   ├── list/
│   │   │   │   └── route.ts
│   │   │   ├── sign/
│   │   │   │   └── route.ts
│   │   │   └── update/
│   │   │       └── route.ts
│   │   ├── ai-platform/
│   │   │   ├── agents/
│   │   │   │   └── route.ts
│   │   │   ├── chat/
│   │   │   │   └── route.ts
│   │   │   ├── engine/
│   │   │   │   └── route.ts
│   │   │   ├── knowledge/
│   │   │   │   └── route.ts
│   │   │   ├── observability/
│   │   │   │   └── route.ts
│   │   │   └── workflows/
│   │   │       └── route.ts
│   │   ├── apollo/
│   │   │   └── enrich/
│   │   │       └── route.ts
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── bookings/
│   │   │   └── route.ts
│   │   ├── careers/
│   │   │   ├── jobs/
│   │   │   │   └── route.ts
│   │   │   ├── route.ts
│   │   │   └── upload/
│   │   │       └── route.ts
│   │   ├── certificates/
│   │   │   └── verify/
│   │   │       └── route.ts
│   │   ├── chat/
│   │   │   ├── history/
│   │   │   │   └── route.ts
│   │   │   ├── route.ts
│   │   │   ├── sales/
│   │   │   │   └── route.ts
│   │   │   └── save/
│   │   │       └── route.ts
│   │   ├── checkout/
│   │   │   ├── create-order/
│   │   │   │   └── route.ts
│   │   │   └── validate-coupon/
│   │   │       └── route.ts
│   │   ├── client/
│   │   │   ├── list/
│   │   │   │   └── route.ts
│   │   │   └── portal-data/
│   │   │       └── route.ts
│   │   ├── clients/
│   │   │   └── list/
│   │   │       └── route.ts
│   │   ├── companies/
│   │   │   └── route.ts
│   │   ├── contact/
│   │   │   ├── chat/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── contacts/
│   │   │   └── route.ts
│   │   ├── courses/
│   │   │   ├── [slug]/
│   │   │   │   ├── assessment/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── lessons/
│   │   │   │   │   └── [lessonSlug]/
│   │   │   │   │       └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── purchase/
│   │   │   │   └── route.ts
│   │   │   ├── route.ts
│   │   │   └── verify/
│   │   │       └── route.ts
│   │   ├── crm/
│   │   │   ├── activities/
│   │   │   │   └── route.ts
│   │   │   ├── export/
│   │   │   │   └── route.ts
│   │   │   └── leads/
│   │   │       └── route.ts
│   │   ├── cron/
│   │   │   ├── enrichment/
│   │   │   │   └── route.ts
│   │   │   └── followups/
│   │   │       └── route.ts
│   │   ├── deals/
│   │   │   └── route.ts
│   │   ├── debug/
│   │   │   └── send-welcome/
│   │   │       └── route.ts
│   │   ├── diag/
│   │   │   └── route.ts
│   │   ├── enrich-leads/
│   │   │   └── route.ts
│   │   ├── exam/
│   │   │   └── submit/
│   │   │       └── route.ts
│   │   ├── finance/
│   │   │   ├── accounts/
│   │   │   │   └── route.ts
│   │   │   ├── ai/
│   │   │   │   └── route.ts
│   │   │   ├── expenses/
│   │   │   │   └── route.ts
│   │   │   ├── invoices/
│   │   │   │   └── route.ts
│   │   │   └── payments/
│   │   │       └── route.ts
│   │   ├── generate-carousel/
│   │   │   └── route.ts
│   │   ├── generate-consequence/
│   │   │   └── route.ts
│   │   ├── generate-reel/
│   │   │   └── route.ts
│   │   ├── geo/
│   │   │   └── route.ts
│   │   ├── growx-email/
│   │   │   └── ai-improve/
│   │   │       └── route.ts
│   │   ├── health/
│   │   │   └── route.ts
│   │   ├── hrms/
│   │   │   ├── ai/
│   │   │   │   └── route.ts
│   │   │   ├── attendance/
│   │   │   │   └── route.ts
│   │   │   ├── employees/
│   │   │   │   └── route.ts
│   │   │   ├── leaves/
│   │   │   │   └── route.ts
│   │   │   ├── payroll/
│   │   │   │   └── route.ts
│   │   │   └── recruitment/
│   │   │       └── route.ts
│   │   ├── invoice/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   ├── create/
│   │   │   │   └── route.ts
│   │   │   ├── list/
│   │   │   │   └── route.ts
│   │   │   └── send/
│   │   │       └── route.ts
│   │   ├── invoices/
│   │   │   └── detail/
│   │   │       └── route.ts
│   │   ├── leads/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   ├── create/
│   │   │   │   └── route.ts
│   │   │   ├── delete-all/
│   │   │   │   └── route.ts
│   │   │   ├── enrich/
│   │   │   │   └── route.ts
│   │   │   ├── import/
│   │   │   │   └── route.ts
│   │   │   ├── inbound/
│   │   │   │   └── route.ts
│   │   │   ├── list/
│   │   │   │   └── route.ts
│   │   │   ├── outreach/
│   │   │   │   ├── generate/
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   └── scrape/
│   │   │       ├── instagram/
│   │   │       │   └── route.ts
│   │   │       └── route.ts
│   │   ├── login/
│   │   │   └── route.ts
│   │   ├── marketing/
│   │   │   ├── ads/
│   │   │   │   └── route.ts
│   │   │   ├── ai/
│   │   │   │   └── route.ts
│   │   │   ├── automation/
│   │   │   │   └── route.ts
│   │   │   ├── campaigns/
│   │   │   │   └── route.ts
│   │   │   ├── dashboard/
│   │   │   │   └── route.ts
│   │   │   ├── forms/
│   │   │   │   └── route.ts
│   │   │   ├── landing-pages/
│   │   │   │   └── route.ts
│   │   │   ├── leads/
│   │   │   │   └── route.ts
│   │   │   ├── seo/
│   │   │   │   └── route.ts
│   │   │   └── submissions/
│   │   │       └── route.ts
│   │   ├── meetings/
│   │   │   └── route.ts
│   │   ├── onboarding/
│   │   │   ├── list/
│   │   │   │   └── route.ts
│   │   │   ├── route.ts
│   │   │   └── submit/
│   │   │       └── route.ts
│   │   ├── payment/
│   │   │   └── webhook/
│   │   │       └── route.ts
│   │   ├── pitch-deck/
│   │   │   └── generate/
│   │   │       └── route.ts
│   │   ├── pm/
│   │   │   ├── ai/
│   │   │   │   └── route.ts
│   │   │   ├── bugs/
│   │   │   │   └── route.ts
│   │   │   ├── projects/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── sprints/
│   │   │   │   └── route.ts
│   │   │   ├── tasks/
│   │   │   │   └── route.ts
│   │   │   └── timesheets/
│   │   │       └── route.ts
│   │   ├── process-leads/
│   │   │   └── route.ts
│   │   ├── products/
│   │   │   └── route.ts
│   │   ├── proposals/
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts
│   │   │   │   └── view/
│   │   │   │       └── route.ts
│   │   │   ├── create/
│   │   │   │   └── route.ts
│   │   │   ├── list/
│   │   │   │   └── route.ts
│   │   │   └── send/
│   │   │       └── route.ts
│   │   ├── proxy-image/
│   │   │   └── route.ts
│   │   ├── quotations/
│   │   │   └── route.ts
│   │   ├── save-subscriber/
│   │   │   └── route.ts
│   │   ├── search-leads/
│   │   │   └── route.ts
│   │   ├── send-blog-email/
│   │   │   └── route.ts
│   │   ├── send-email/
│   │   │   ├── dynamic/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── signup/
│   │   │   └── route.ts
│   │   ├── support/
│   │   │   ├── ai/
│   │   │   │   └── route.ts
│   │   │   ├── customer-health/
│   │   │   │   └── route.ts
│   │   │   ├── dashboard/
│   │   │   │   └── route.ts
│   │   │   ├── knowledge-base/
│   │   │   │   └── route.ts
│   │   │   ├── live-chat/
│   │   │   │   └── route.ts
│   │   │   └── tickets/
│   │   │       └── route.ts
│   │   ├── tasks/
│   │   │   └── route.ts
│   │   ├── team/
│   │   │   ├── auth/
│   │   │   │   └── route.ts
│   │   │   ├── log-alert/
│   │   │   │   └── route.ts
│   │   │   └── terms/
│   │   │       └── route.ts
│   │   ├── track-wish/
│   │   │   └── route.ts
│   │   ├── unsubscribe/
│   │   │   └── route.ts
│   │   ├── upload/
│   │   │   └── route.ts
│   │   └── workflows/
│   │       └── route.ts
│   ├── architecture/
│   │   └── page.tsx
│   ├── auth/
│   │   ├── actions.ts
│   │   └── callback/
│   │       └── route.ts
│   ├── certificate/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── checkout/
│   │   └── page.tsx
│   ├── client/
│   │   ├── agreement/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── agreements/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── page.tsx
│   │   ├── invoices/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── client-agreement/
│   │   └── page.tsx
│   ├── courses/
│   │   └── [slug]/
│   │       ├── assessment/
│   │       │   └── page.tsx
│   │       ├── certificate/
│   │       │   └── page.tsx
│   │       └── result/
│   │           └── page.tsx
│   ├── dashboard/
│   │   ├── instagram-carousel/
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   └── reels-creator/
│   │       └── page.tsx
│   ├── error.tsx
│   ├── globals.css
│   ├── icon.svg
│   ├── layout.tsx
│   ├── learn/
│   │   └── [course]/
│   │       └── [module]/
│   │           └── [lesson]/
│   │               └── page.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── products/
│   │   └── page.tsx
│   ├── project/
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── proposal/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── result/
│   │   └── [course]/
│   │       └── page.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── team/
│   │   ├── crm/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── login/
│   │       └── page.tsx
│   ├── test/
│   │   └── [course]/
│   │       └── page.tsx
│   └── verify/
│       └── [id]/
│           └── page.tsx
├── architecture_report.md
├── components/
│   ├── admin/
│   │   ├── ActivityTimeline.tsx
│   │   ├── AdminNav.tsx
│   │   ├── AgreementContract.tsx
│   │   ├── AutomationBuilder.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── CouponManagementClient.tsx
│   │   ├── Customer360.tsx
│   │   ├── DataTable.tsx
│   │   ├── InvoiceTemplate.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── NotificationCenter.tsx
│   │   ├── OnboardingPreview.tsx
│   │   ├── PageHeader.tsx
│   │   ├── QuoteGenerator.tsx
│   │   ├── finance/
│   │   │   ├── FinanceDashboard.tsx
│   │   │   ├── GeneralLedger.tsx
│   │   │   └── InvoiceBuilder.tsx
│   │   ├── hrms/
│   │   │   ├── AttendanceTracker.tsx
│   │   │   ├── HrmsDashboard.tsx
│   │   │   ├── PayrollSlipBuilder.tsx
│   │   │   └── RecruitmentPipeline.tsx
│   │   └── pm/
│   │       ├── AgileKanban.tsx
│   │       ├── SprintManager.tsx
│   │       ├── TimeTracker.tsx
│   │       └── WorkloadBalancer.tsx
│   ├── certificate/
│   │   └── CertificateClient.tsx
│   ├── client/
│   │   └── ClientNav.tsx
│   ├── courses/
│   │   └── CheckoutModal.tsx
│   ├── demos/
│   │   └── SharedDemoUI.tsx
│   ├── earth/
│   │   ├── Atmosphere.tsx
│   │   ├── Clouds.tsx
│   │   ├── Earth.tsx
│   │   ├── NightLights.tsx
│   │   ├── OrbitRings.tsx
│   │   ├── Particles.tsx
│   │   ├── README.md
│   │   ├── Scene.tsx
│   │   ├── ShootingStars.tsx
│   │   └── Stars.tsx
│   ├── hotel/
│   │   ├── Footer.tsx
│   │   ├── LandingPage.tsx
│   │   └── Navbar.tsx
│   ├── layout/
│   │   ├── ConditionalLayout.tsx
│   │   ├── CookieConsent.tsx
│   │   ├── Footer.tsx
│   │   ├── GlobalBackground.tsx
│   │   ├── LocaleRedirect.tsx
│   │   └── Navbar.tsx
│   ├── marketing/
│   │   ├── AEOBlock.tsx
│   │   ├── AccordionFAQ.tsx
│   │   ├── AnimatedSection.tsx
│   │   ├── AstroChatCTA.tsx
│   │   ├── BlogEditorial.tsx
│   │   ├── BlogInteractive.tsx
│   │   ├── BlogInteractiveList.tsx
│   │   ├── BookingScheduler.tsx
│   │   ├── CertificatePreview.tsx
│   │   ├── DynamicSchema.tsx
│   │   ├── FlickerText.tsx
│   │   ├── GPT56MatrixBanner.tsx
│   │   ├── HeroSection.tsx
│   │   ├── HotlineConsole.tsx
│   │   ├── InteractiveAiCodingEngine.tsx
│   │   ├── InteractiveClaudeOpus.tsx
│   │   ├── InteractiveFerrariLuce.tsx
│   │   ├── InteractiveIOArchitecture.tsx
│   │   ├── InteractiveModelComparison.tsx
│   │   ├── InteractiveRestaurantRetention.tsx
│   │   ├── InteractiveRestaurantWebsite.tsx
│   │   ├── InteractiveSearchEvolution.tsx
│   │   ├── InteractiveWhatsappNurture.tsx
│   │   ├── InteractiveWorkflowEngine.tsx
│   │   ├── LeadEngineSection.tsx
│   │   ├── PageHero.tsx
│   │   ├── PipelineSection.tsx
│   │   ├── Reveal.tsx
│   │   ├── SectionG.tsx
│   │   ├── SectionO.tsx
│   │   ├── SectionR.tsx
│   │   ├── SectionW.tsx
│   │   ├── SectionX.tsx
│   │   ├── SubscriptionPlansSection.tsx
│   │   └── ValuePropositions.tsx
│   ├── onboarding/
│   │   └── OnboardingFlow.tsx
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   ├── LanguageProvider.tsx
│   │   ├── PostHogPageView.tsx
│   │   ├── PostHogProvider.tsx
│   │   └── ThemeProvider.tsx
│   ├── realestate/
│   │   ├── Footer.tsx
│   │   ├── LandingPage.tsx
│   │   └── Navbar.tsx
│   ├── restaurant/
│   │   ├── Footer.tsx
│   │   ├── LandingPage.tsx
│   │   └── Navbar.tsx
│   ├── shared/
│   │   ├── CarouselGeneratorClient.tsx
│   │   ├── EditorialCarouselClient.tsx
│   │   ├── ReelsGeneratorClient.tsx
│   │   ├── SignaturePad.tsx
│   │   └── WhatsAppWidget.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── ChatAssistant.tsx
│       ├── GrowXChatWidget.tsx
│       ├── Input.tsx
│       ├── LanguageSwitcher.tsx
│       ├── ProjectCard.tsx
│       ├── ServiceCard.tsx
│       ├── Textarea.tsx
│       ├── agent-plan.tsx
│       ├── animated-ai-chat.tsx
│       ├── chat-input.tsx
│       ├── demo.tsx
│       ├── dotted-surface.tsx
│       ├── feature-1.tsx
│       ├── particle-wave.tsx
│       └── tunnel-hero.tsx
├── eslint.config.mjs
├── hooks/
│   ├── use-textarea-resize.ts
│   └── useEarthRotation.ts
├── lib/
│   ├── actions/
│   │   ├── database.ts
│   │   └── enrollment.ts
│   ├── api/
│   │   ├── api-response.ts
│   │   └── rate-limiter.ts
│   ├── auth.ts
│   ├── cache/
│   │   └── cache-manager.ts
│   ├── config/
│   │   └── env.ts
│   ├── data/
│   │   ├── assessments/
│   │   │   ├── java.ts
│   │   │   ├── nextjs.ts
│   │   │   └── python.ts
│   │   ├── courses.ts
│   │   ├── projects.ts
│   │   └── tests.ts
│   ├── database.types.ts
│   ├── design-system.ts
│   ├── hotel-context.tsx
│   ├── hotel-data.ts
│   ├── i18n/
│   │   └── currencies.ts
│   ├── mail/
│   │   └── certificate-mailer.ts
│   ├── observability/
│   │   └── logger.ts
│   ├── property-data.ts
│   ├── queues/
│   │   └── queue-manager.ts
│   ├── region-config.ts
│   ├── reliability/
│   │   └── circuit-breaker.ts
│   ├── repositories/
│   │   └── base.repository.ts
│   ├── restaurant-context.tsx
│   ├── restaurant-data.ts
│   ├── services/
│   │   ├── certification.ts
│   │   ├── crm.service.ts
│   │   ├── finance.service.ts
│   │   ├── pdf.service.tsx
│   │   └── razorpay.service.ts
│   ├── subdomains.ts
│   ├── supabase/
│   │   ├── admin.ts
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   ├── migrations/
│   │   │   ├── add_more_fields_to_agreements.sql
│   │   │   ├── add_signatures_to_agreements.sql
│   │   │   ├── admin_system.sql
│   │   │   ├── create_admin_system.sql
│   │   │   ├── create_ai_platform_system.sql
│   │   │   ├── create_certificates_table.sql
│   │   │   ├── create_exam_system.sql
│   │   │   ├── create_marketing_system.sql
│   │   │   ├── create_onboarding_table.sql
│   │   │   ├── create_support_system.sql
│   │   │   ├── create_users_table.sql
│   │   │   ├── initial_lms.sql
│   │   │   └── monetization_system.sql
│   │   ├── optimizations.sql
│   │   └── server.ts
│   ├── templates/
│   │   └── PDFTemplates.tsx
│   ├── three.ts
│   └── utils.ts
├── middleware.ts
├── navigation-client.ts
├── navigation.ts
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── public/
│   ├── admin_sales_strategy.html
│   ├── courses/
│   │   ├── java.jpg
│   │   ├── nextjs.jpg
│   │   └── python.jpg
│   ├── favicon-logo.png
│   ├── file.svg
│   ├── globe.svg
│   ├── images/
│   │   ├── agents_blog_woodcut_1780853593579.png
│   │   ├── ai_agents_taking_over_1780320659846.png
│   │   ├── ai_native_ecosystem_1779889616149.png
│   │   ├── anthropic_openai_woodcut_1780853674501.png
│   │   ├── astronaut.jpg
│   │   ├── blog-applied-intuition-dana.jpg
│   │   ├── blog-claude-fable-5-mythos-5-banned.png
│   │   ├── blog-claude-fable-5-mythos-5.png
│   │   ├── blog-claude-opus-4-8.png
│   │   ├── blog-elon-trillionaire.png
│   │   ├── blog-ferrari-luce.png
│   │   ├── blog-google-io-2026.png
│   │   ├── blog-gpt56-preview.png
│   │   ├── blog-kimi-k3-woodcut.png
│   │   ├── blog-n8n-automation.png
│   │   ├── blog-openai-huggingface-incident.png
│   │   ├── blog-openai-huggingface-trajectories.png
│   │   ├── blog-restaurant-retention.png
│   │   ├── blog-restaurant-website.png
│   │   ├── blog-skyroot-vikram1.png
│   │   ├── blog-whatsapp-nurture.png
│   │   ├── blog_claude_opus_1780051718526.png
│   │   ├── blog_ferrari_luce_1780854014914.png
│   │   ├── blog_google_io_hero_1779870777687.png
│   │   ├── blog_n8n_automation_1779880623332.png
│   │   ├── blog_restaurant_retention_1779880666331.png
│   │   ├── blog_restaurant_website_1779880689115.png
│   │   ├── blog_restaurant_website_1780853943866.png
│   │   ├── blog_whatsapp_nurture_1779880645357.png
│   │   ├── blog_whatsapp_nurture_1780853967261.png
│   │   ├── blue-origin-new-glenn-rocket-explosion.png
│   │   ├── blue_origin_explosion_1780160986027.png
│   │   ├── blue_origin_explosion_1780853995249.png
│   │   ├── carousel_slide_01_cover_1780051100910.png
│   │   ├── carousel_slide_02_improvements_1780051128480.png
│   │   ├── carousel_slide_03_benchmarks_1780051143578.png
│   │   ├── carousel_slide_04_workflows_1780051174930.png
│   │   ├── chatbots-are-dying-agents-are-taking-over.png
│   │   ├── claude_blog_woodcut_1780853620986.png
│   │   ├── coding_blog_woodcut_1780853698423.png
│   │   ├── cta-phone.png
│   │   ├── dishes/
│   │   │   ├── arancini.png
│   │   │   ├── burger.png
│   │   │   └── hero.png
│   │   ├── download-1.jpeg
│   │   ├── download-2.jpeg
│   │   ├── download-3.jpeg
│   │   ├── download-4.gif
│   │   ├── download-5.jpeg
│   │   ├── google_io_crimson_1780853751363.png
│   │   ├── grain-texture.jpg
│   │   ├── handshake.jpg
│   │   ├── hero-ai-coding.png
│   │   ├── hero-anthropic-openai.png
│   │   ├── hero-google-search.png
│   │   ├── hero_ai_coding_1779888875980.png
│   │   ├── hero_ai_coding_1780854081406.png
│   │   ├── hero_anthropic_openai_1779888645846.png
│   │   ├── hero_anthropic_openai_1780854059065.png
│   │   ├── hero_google_search_1779888592231.png
│   │   ├── hero_google_search_1780854034543.png
│   │   ├── hotel/
│   │   │   ├── hero.png
│   │   │   ├── loft-skyline.png
│   │   │   ├── studio-modern.png
│   │   │   ├── suite-ocean.png
│   │   │   └── villa-garden.png
│   │   ├── java-mastery.png
│   │   ├── kimi-k3-agents-bench.png
│   │   ├── kimi-k3-coding-bench.png
│   │   ├── kimi-k3-knowledge-bench.png
│   │   ├── kimi-k3-logo.png
│   │   ├── kimi-k3-roofline.png
│   │   ├── landscape.jpg
│   │   ├── logo-actual.png
│   │   ├── logo-candidate2.png
│   │   ├── media__1779871299303.png
│   │   ├── media__1779871856315.png
│   │   ├── media__1779872103951.png
│   │   ├── media__1779872183331.png
│   │   ├── media__1779872485475.png
│   │   ├── media__1779872959265.png
│   │   ├── media__1779873270613.png
│   │   ├── media__1779873833882.png
│   │   ├── media__1779875219246.png
│   │   ├── media__1779875332445.png
│   │   ├── media__1779875692482.png
│   │   ├── media__1779875945956.png
│   │   ├── media__1779877209540.png
│   │   ├── media__1779879527678.png
│   │   ├── media__1779880494039.png
│   │   ├── media__1779880518213.png
│   │   ├── media__1779880553076.png
│   │   ├── media__1779889142820.png
│   │   ├── media__1779890498330.png
│   │   ├── media__1779894465024.png
│   │   ├── media__1779894784168.png
│   │   ├── media__1779895261046.png
│   │   ├── media__1779895646645.png
│   │   ├── media__1779895677294.jpg
│   │   ├── media__1779896149355.png
│   │   ├── media__1779896248857.png
│   │   ├── media__1779896967707.jpg
│   │   ├── media__1779897093973.png
│   │   ├── media__1779897564743.png
│   │   ├── media__1779902928678.png
│   │   ├── media__1779903048189.png
│   │   ├── media__1779903321617.png
│   │   ├── media__1779903576127.png
│   │   ├── media__1779903583569.png
│   │   ├── media__1779904034233.png
│   │   ├── media__1779904669335.png
│   │   ├── media__1779905379409.png
│   │   ├── media__1779905662316.png
│   │   ├── media__1779905991854.png
│   │   ├── media__1779906388371.png
│   │   ├── media__1779906717882.png
│   │   ├── media__1779906978260.png
│   │   ├── media__1779907006170.png
│   │   ├── media__1779907014248.png
│   │   ├── media__1779907791229.png
│   │   ├── media__1780039278594.png
│   │   ├── media__1780039676028.png
│   │   ├── media__1780039699257.png
│   │   ├── media__1780041027931.png
│   │   ├── media__1780043437901.png
│   │   ├── media__1780044860836.png
│   │   ├── media__1780045386241.png
│   │   ├── media__1780045414307.png
│   │   ├── media__1780045655387.png
│   │   ├── media__1780046359398.png
│   │   ├── media__1780046897817.png
│   │   ├── media__1780047197534.png
│   │   ├── media__1780047958587.png
│   │   ├── media__1780048511942.png
│   │   ├── media__1780048583966.png
│   │   ├── media__1780048609121.png
│   │   ├── media__1780048619531.png
│   │   ├── media__1780048642003.png
│   │   ├── media__1780049525097.png
│   │   ├── media__1780051875825.jpg
│   │   ├── media__1780051911566.jpg
│   │   ├── media__1780051919210.jpg
│   │   ├── media__1780052779837.png
│   │   ├── media__1780162395326.png
│   │   ├── media__1780162869350.png
│   │   ├── media__1780163280418.png
│   │   ├── media__1780321859829.png
│   │   ├── media__1780322150322.png
│   │   ├── media__1780322158912.png
│   │   ├── media__1780324173930.png
│   │   ├── media__1780550007306.png
│   │   ├── media__1780550229675.png
│   │   ├── media__1780551330274.png
│   │   ├── media__1780551441154.png
│   │   ├── media__1780595329785.png
│   │   ├── media__1780749046292.png
│   │   ├── media__1780853428680.jpg
│   │   ├── media__1780854365433.png
│   │   ├── media__1780854389527.png
│   │   ├── media__1780854618956.png
│   │   ├── media__1780854627647.jpg
│   │   ├── media__1780854636984.png
│   │   ├── media__1780854674258.png
│   │   ├── media__1780854684449.png
│   │   ├── n8n_blog_purple_1780853782502.png
│   │   ├── nextjs-fullstack.png
│   │   ├── nvidia-vision-agentic-to-useful-ai.png
│   │   ├── nvidia_blog_woodcut_1780853564383.png
│   │   ├── nvidia_gtc_vision_1780594810209.png
│   │   ├── obsession-scene-1.jpg
│   │   ├── obsession-scene-2.jpg
│   │   ├── obsession-scene-3.jpg
│   │   ├── obsession-scene-4.jpg
│   │   ├── python-mastery.png
│   │   ├── real-estate/
│   │   │   ├── commercial.png
│   │   │   ├── penthouse.png
│   │   │   ├── studio.png
│   │   │   └── villa.png
│   │   ├── restaurant_retention_orange_1780853808096.png
│   │   ├── search_blog_woodcut_1780853646113.png
│   │   ├── willow-poster-bg.png
│   │   ├── willow-snapped-table.jpg
│   │   ├── willow-snapping-action.png
│   │   └── willow-whole-table.jpg
│   ├── launchday.png
│   ├── llms.txt
│   ├── locales/
│   │   ├── eu/
│   │   │   ├── en.json
│   │   │   ├── es.json
│   │   │   └── fr.json
│   │   ├── in/
│   │   │   ├── en.json
│   │   │   ├── hi.json
│   │   │   └── te.json
│   │   └── us/
│   │       └── en.json
│   ├── logo-symbol.svg
│   ├── logo.png
│   ├── logo.svg
│   ├── next.svg
│   ├── portfolio/
│   │   ├── 3rdmind.png
│   │   ├── aureliacare.png
│   │   ├── aureliahotels.png
│   │   ├── aureviajewelry.png
│   │   ├── eduverseai.png
│   │   ├── pipper.png
│   │   ├── recruitai.png
│   │   ├── recruitai_analytics.png
│   │   ├── recruitai_automation.png
│   │   ├── recruitai_dashboard.png
│   │   ├── recruitai_pipeline.png
│   │   ├── resumeforgeai.png
│   │   ├── returnbox.png
│   │   ├── royalefeast.png
│   │   ├── sriblooms.png
│   │   ├── universalai.mp4
│   │   ├── universalai.png
│   │   ├── velorarestaurants.png
│   │   └── velour.png
│   ├── robots.txt
│   ├── spiderman/
│   ├── templates/
│   │   └── welcome_email.html
│   ├── textures/
│   │   ├── earth_clouds.jpg
│   │   ├── earth_clouds.png
│   │   ├── earth_clouds_8k.png
│   │   ├── earth_day_8k.jpg
│   │   ├── earth_daymap.jpg
│   │   ├── earth_night.jpg
│   │   ├── earth_night_8k.jpg
│   │   ├── earth_nightlights.jpg
│   │   ├── earth_normal.jpg
│   │   ├── earth_normal.png
│   │   ├── earth_normal_8k.jpg
│   │   ├── earth_specular.jpg
│   │   ├── earth_specular.png
│   │   └── earth_specular_8k.jpg
│   ├── vercel.svg
│   ├── videos/
│   │   ├── gxl-wish-game-22.mp4
│   │   └── obsession-video.mp4
│   └── window.svg
├── public - Shortcut.lnk
├── scratch_ddg_lite_profiles.html
├── scratch_ddg_lite_result.html
├── scratch_ddg_result.html
├── scratch_google_result.html
├── scratch_yahoo_result.html
├── scripts/
│   ├── count-courses.ts
│   ├── inspect_db.ts
│   ├── migration.sql
│   ├── seed-courses.ts
│   └── update-allowed-paths.ts
├── sentry.client.config.ts
├── sentry.edge.config.ts
├── sentry.server.config.ts
├── services/
│   ├── ai-crm.ts
│   ├── ai-finance.ts
│   ├── ai-hrms.ts
│   ├── ai-pm.ts
│   ├── enrichment.service.ts
│   ├── enterprise-crm.ts
│   ├── enterprise-finance.ts
│   ├── enterprise-hrms.ts
│   ├── enterprise-pm.ts
│   ├── followup.service.ts
│   ├── invoice.service.ts
│   ├── onboarding.service.ts
│   ├── outreach.service.ts
│   ├── scraping.service.ts
│   └── workflow-engine.ts
├── supabase_admin_schema.sql
├── supabase_ai_platform_schema.sql
├── supabase_bookings_patch.sql
├── supabase_careers_patch.sql
├── supabase_crm_patch.sql
├── supabase_crm_permissions_patch.sql
├── supabase_enterprise_crm_schema.sql
├── supabase_enterprise_finance_schema.sql
├── supabase_enterprise_hrms_schema.sql
├── supabase_enterprise_pm_schema.sql
├── supabase_marketing_schema.sql
├── supabase_outreach_patch.sql
├── supabase_schema.sql
├── supabase_support_schema.sql
├── supabase_tracking_patch.sql
├── supabase_wish_game_patch.sql
├── tests/
│   ├── crm/
│   │   ├── database-schema.test.ts
│   │   ├── quotations-invoice.test.ts
│   │   ├── run-tests.ts
│   │   └── workflow-automation.test.ts
│   ├── finance/
│   │   ├── double-entry.test.ts
│   │   ├── gst-taxes.test.ts
│   │   ├── profit-loss.test.ts
│   │   └── run-finance-tests.ts
│   ├── hrms/
│   │   ├── database-hrms.test.ts
│   │   ├── payroll-calc.test.ts
│   │   └── run-hrms-tests.ts
│   └── pm/
│       ├── agile-sprint.test.ts
│       ├── database-pm.test.ts
│       ├── run-pm-tests.ts
│       └── time-logs.test.ts
├── tsconfig.json
├── types/
│   ├── courses.ts
│   ├── index.ts
│   ├── lifecycle.ts
│   └── next-auth.d.ts
└── vercel.json
```

---

## 3. Directory Breakdown & File Index

### API Routes

| File Name | Path | Lines | Size (bytes) | Description / Header Preview |
| --- | --- | --- | --- | --- |
| `route.ts` | [`app/api/admin-setup/ai/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin-setup/ai/route.ts) | 98 | 4373 | import { NextResponse } from "next/server"; | import { GoogleGenerativeAI } from "@google/generative |
| `route.ts` | [`app/api/admin-setup/dashboard/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin-setup/dashboard/route.ts) | 54 | 2164 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/admin-setup/integrations/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin-setup/integrations/route.ts) | 87 | 4214 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/admin-setup/rbac/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin-setup/rbac/route.ts) | 64 | 2696 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/admin-setup/security/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin-setup/security/route.ts) | 81 | 3375 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/admin-setup/users/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin-setup/users/route.ts) | 128 | 3636 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/admin/career-portal/list/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin/career-portal/list/route.ts) | 35 | 996 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/admin/career-portal/schedule-interview/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin/career-portal/schedule-interview/route.ts) | 292 | 12418 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/admin/career-portal/send-assessment/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin/career-portal/send-assessment/route.ts) | 160 | 7723 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/admin/career-portal/update/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin/career-portal/update/route.ts) | 205 | 10151 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/admin/change-password/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin/change-password/route.ts) | 71 | 2023 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/admin/command-center/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin/command-center/route.ts) | 1301 | 46162 | import { NextResponse } from "next/server"; | import { GoogleGenerativeAI } from "@google/generative |
| `route.ts` | [`app/api/admin/coupons/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin/coupons/route.ts) | 97 | 3086 | import { supabaseAdmin } from "@/lib/supabase/admin"; | import { getToken } from "next-auth/jwt"; |
| `route.ts` | [`app/api/admin/onboarding/detail/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin/onboarding/detail/route.ts) | 22 | 585 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/admin/onboarding/list/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin/onboarding/list/route.ts) | 18 | 524 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/admin/settings/terms/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin/settings/terms/route.ts) | 27 | 886 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/admin/team/route.ts`](file:///c:/growxlabs/grow-x/app/api/admin/team/route.ts) | 105 | 3486 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/agreements/create/route.ts`](file:///c:/growxlabs/grow-x/app/api/agreements/create/route.ts) | 76 | 2896 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/agreements/detail/route.ts`](file:///c:/growxlabs/grow-x/app/api/agreements/detail/route.ts) | 23 | 631 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/agreements/list/route.ts`](file:///c:/growxlabs/grow-x/app/api/agreements/list/route.ts) | 16 | 503 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/agreements/sign/route.ts`](file:///c:/growxlabs/grow-x/app/api/agreements/sign/route.ts) | 52 | 1790 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/agreements/update/route.ts`](file:///c:/growxlabs/grow-x/app/api/agreements/update/route.ts) | 35 | 1086 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/ai-platform/agents/route.ts`](file:///c:/growxlabs/grow-x/app/api/ai-platform/agents/route.ts) | 53 | 3188 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/ai-platform/chat/route.ts`](file:///c:/growxlabs/grow-x/app/api/ai-platform/chat/route.ts) | 65 | 3594 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/ai-platform/engine/route.ts`](file:///c:/growxlabs/grow-x/app/api/ai-platform/engine/route.ts) | 87 | 3748 | import { NextResponse } from "next/server"; | import { GoogleGenerativeAI } from "@google/generative |
| `route.ts` | [`app/api/ai-platform/knowledge/route.ts`](file:///c:/growxlabs/grow-x/app/api/ai-platform/knowledge/route.ts) | 55 | 2203 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/ai-platform/observability/route.ts`](file:///c:/growxlabs/grow-x/app/api/ai-platform/observability/route.ts) | 30 | 1478 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/ai-platform/workflows/route.ts`](file:///c:/growxlabs/grow-x/app/api/ai-platform/workflows/route.ts) | 47 | 1988 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/apollo/enrich/route.ts`](file:///c:/growxlabs/grow-x/app/api/apollo/enrich/route.ts) | 124 | 4108 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/auth/[...nextauth]/route.ts`](file:///c:/growxlabs/grow-x/app/api/auth/[...nextauth]/route.ts) | 6 | 167 | import NextAuth from "next-auth"; | import { authOptions } from "@/lib/auth"; |
| `route.ts` | [`app/api/bookings/route.ts`](file:///c:/growxlabs/grow-x/app/api/bookings/route.ts) | 327 | 13114 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/careers/jobs/route.ts`](file:///c:/growxlabs/grow-x/app/api/careers/jobs/route.ts) | 31 | 1199 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/careers/route.ts`](file:///c:/growxlabs/grow-x/app/api/careers/route.ts) | 98 | 2545 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/careers/upload/route.ts`](file:///c:/growxlabs/grow-x/app/api/careers/upload/route.ts) | 47 | 1523 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/certificates/verify/route.ts`](file:///c:/growxlabs/grow-x/app/api/certificates/verify/route.ts) | 31 | 879 | import { createClient } from "@/lib/supabase/server"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/chat/history/route.ts`](file:///c:/growxlabs/grow-x/app/api/chat/history/route.ts) | 24 | 754 | import { createClient } from "@/lib/supabase/server"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/chat/route.ts`](file:///c:/growxlabs/grow-x/app/api/chat/route.ts) | 146 | 5862 | import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"; | impo |
| `route.ts` | [`app/api/chat/sales/route.ts`](file:///c:/growxlabs/grow-x/app/api/chat/sales/route.ts) | 135 | 4844 | import { OpenAI } from "openai"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/chat/save/route.ts`](file:///c:/growxlabs/grow-x/app/api/chat/save/route.ts) | 21 | 600 | import { createClient } from "@/lib/supabase/server"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/checkout/create-order/route.ts`](file:///c:/growxlabs/grow-x/app/api/checkout/create-order/route.ts) | 111 | 3476 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/checkout/validate-coupon/route.ts`](file:///c:/growxlabs/grow-x/app/api/checkout/validate-coupon/route.ts) | 49 | 1394 | import { NextResponse } from "next/server"; | import { createClient } from "@/lib/supabase/server"; |
| `route.ts` | [`app/api/client/list/route.ts`](file:///c:/growxlabs/grow-x/app/api/client/list/route.ts) | 31 | 971 | import { createClient } from "@/lib/supabase/server"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/client/portal-data/route.ts`](file:///c:/growxlabs/grow-x/app/api/client/portal-data/route.ts) | 41 | 1514 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/clients/list/route.ts`](file:///c:/growxlabs/grow-x/app/api/clients/list/route.ts) | 28 | 854 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/companies/route.ts`](file:///c:/growxlabs/grow-x/app/api/companies/route.ts) | 31 | 1228 | import { NextResponse } from "next/server"; | import { EnterpriseCrmService } from "@/services/enter |
| `route.ts` | [`app/api/contact/chat/route.ts`](file:///c:/growxlabs/grow-x/app/api/contact/chat/route.ts) | 229 | 9105 | import OpenAI from "openai"; | import { GoogleGenerativeAI } from "@google/generative-ai"; |
| `route.ts` | [`app/api/contact/route.ts`](file:///c:/growxlabs/grow-x/app/api/contact/route.ts) | 138 | 4454 | import { NextResponse } from "next/server"; | import { createClient } from "@/lib/supabase/server"; |
| `route.ts` | [`app/api/contacts/route.ts`](file:///c:/growxlabs/grow-x/app/api/contacts/route.ts) | 30 | 1137 | import { NextResponse } from "next/server"; | import { EnterpriseCrmService } from "@/services/enter |
| `route.ts` | [`app/api/courses/[slug]/assessment/route.ts`](file:///c:/growxlabs/grow-x/app/api/courses/[slug]/assessment/route.ts) | 86 | 2207 | import { NextResponse } from "next/server"; | import { getServerSession } from "next-auth"; |
| `route.ts` | [`app/api/courses/[slug]/lessons/[lessonSlug]/route.ts`](file:///c:/growxlabs/grow-x/app/api/courses/[slug]/lessons/[lessonSlug]/route.ts) | 158 | 4446 | import { NextResponse } from "next/server"; | import { getServerSession } from "next-auth"; |
| `route.ts` | [`app/api/courses/[slug]/route.ts`](file:///c:/growxlabs/grow-x/app/api/courses/[slug]/route.ts) | 105 | 2977 | import { NextResponse } from "next/server"; | import { getServerSession } from "next-auth"; |
| `route.ts` | [`app/api/courses/purchase/route.ts`](file:///c:/growxlabs/grow-x/app/api/courses/purchase/route.ts) | 48 | 1622 | import { NextResponse } from "next/server"; | import { getServerSession } from "next-auth/next"; |
| `route.ts` | [`app/api/courses/route.ts`](file:///c:/growxlabs/grow-x/app/api/courses/route.ts) | 63 | 1319 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/courses/verify/route.ts`](file:///c:/growxlabs/grow-x/app/api/courses/verify/route.ts) | 68 | 2236 | import { NextResponse } from "next/server"; | import { getServerSession } from "next-auth/next"; |
| `route.ts` | [`app/api/crm/activities/route.ts`](file:///c:/growxlabs/grow-x/app/api/crm/activities/route.ts) | 33 | 1146 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/crm/export/route.ts`](file:///c:/growxlabs/grow-x/app/api/crm/export/route.ts) | 53 | 1856 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/crm/leads/route.ts`](file:///c:/growxlabs/grow-x/app/api/crm/leads/route.ts) | 142 | 4859 | import { NextResponse } from "next/server"; | import { cookies } from "next/headers"; |
| `route.ts` | [`app/api/cron/enrichment/route.ts`](file:///c:/growxlabs/grow-x/app/api/cron/enrichment/route.ts) | 18 | 679 | import { NextResponse } from "next/server"; | import { EnrichmentService } from "@/services/enrichme |
| `route.ts` | [`app/api/cron/followups/route.ts`](file:///c:/growxlabs/grow-x/app/api/cron/followups/route.ts) | 16 | 597 | import { NextResponse } from "next/server"; | import { FollowUpService } from "@/services/followup.s |
| `route.ts` | [`app/api/deals/route.ts`](file:///c:/growxlabs/grow-x/app/api/deals/route.ts) | 51 | 1887 | import { NextResponse } from "next/server"; | import { EnterpriseCrmService } from "@/services/enter |
| `route.ts` | [`app/api/debug/send-welcome/route.ts`](file:///c:/growxlabs/grow-x/app/api/debug/send-welcome/route.ts) | 28 | 947 | import { NextResponse } from "next/server"; | import { Resend } from 'resend'; |
| `route.ts` | [`app/api/diag/route.ts`](file:///c:/growxlabs/grow-x/app/api/diag/route.ts) | 25 | 750 | import { createClient } from "@supabase/supabase-js"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/enrich-leads/route.ts`](file:///c:/growxlabs/grow-x/app/api/enrich-leads/route.ts) | 66 | 2123 | import { NextResponse } from "next/server"; | import { createClient } from "@/lib/supabase/server"; |
| `route.ts` | [`app/api/exam/submit/route.ts`](file:///c:/growxlabs/grow-x/app/api/exam/submit/route.ts) | 136 | 4472 | import { createClient } from "@/lib/supabase/server"; | import { supabaseAdmin } from "@/lib/supabas |
| `route.ts` | [`app/api/finance/accounts/route.ts`](file:///c:/growxlabs/grow-x/app/api/finance/accounts/route.ts) | 39 | 1488 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/finance/ai/route.ts`](file:///c:/growxlabs/grow-x/app/api/finance/ai/route.ts) | 20 | 802 | import { NextResponse } from "next/server"; | import { AiFinanceService } from "@/services/ai-financ |
| `route.ts` | [`app/api/finance/expenses/route.ts`](file:///c:/growxlabs/grow-x/app/api/finance/expenses/route.ts) | 49 | 1662 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/finance/invoices/route.ts`](file:///c:/growxlabs/grow-x/app/api/finance/invoices/route.ts) | 29 | 1098 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/finance/payments/route.ts`](file:///c:/growxlabs/grow-x/app/api/finance/payments/route.ts) | 35 | 1255 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/generate-carousel/route.ts`](file:///c:/growxlabs/grow-x/app/api/generate-carousel/route.ts) | 205 | 9317 | import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"; | import { NextResponse } fr |
| `route.ts` | [`app/api/generate-consequence/route.ts`](file:///c:/growxlabs/grow-x/app/api/generate-consequence/route.ts) | 63 | 2444 | import { supabaseAdmin } from "@/lib/supabase/admin"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/generate-reel/route.ts`](file:///c:/growxlabs/grow-x/app/api/generate-reel/route.ts) | 193 | 9025 | import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"; | import { NextResponse } fr |
| `route.ts` | [`app/api/geo/route.ts`](file:///c:/growxlabs/grow-x/app/api/geo/route.ts) | 19 | 624 | import { NextRequest, NextResponse } from "next/server"; | export async function GET(request: NextRe |
| `route.ts` | [`app/api/growx-email/ai-improve/route.ts`](file:///c:/growxlabs/grow-x/app/api/growx-email/ai-improve/route.ts) | 58 | 2239 | import { NextRequest, NextResponse } from "next/server"; | import { GoogleGenerativeAI } from "@goog |
| `route.ts` | [`app/api/health/route.ts`](file:///c:/growxlabs/grow-x/app/api/health/route.ts) | 37 | 1099 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/hrms/ai/route.ts`](file:///c:/growxlabs/grow-x/app/api/hrms/ai/route.ts) | 24 | 973 | import { NextResponse } from "next/server"; | import { AiHrmsService } from "@/services/ai-hrms"; |
| `route.ts` | [`app/api/hrms/attendance/route.ts`](file:///c:/growxlabs/grow-x/app/api/hrms/attendance/route.ts) | 38 | 1350 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/hrms/employees/route.ts`](file:///c:/growxlabs/grow-x/app/api/hrms/employees/route.ts) | 32 | 1004 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/hrms/leaves/route.ts`](file:///c:/growxlabs/grow-x/app/api/hrms/leaves/route.ts) | 69 | 2317 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/hrms/payroll/route.ts`](file:///c:/growxlabs/grow-x/app/api/hrms/payroll/route.ts) | 94 | 2911 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/hrms/recruitment/route.ts`](file:///c:/growxlabs/grow-x/app/api/hrms/recruitment/route.ts) | 32 | 1046 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/invoice/[id]/route.ts`](file:///c:/growxlabs/grow-x/app/api/invoice/[id]/route.ts) | 24 | 647 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/invoice/create/route.ts`](file:///c:/growxlabs/grow-x/app/api/invoice/create/route.ts) | 63 | 2117 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/invoice/list/route.ts`](file:///c:/growxlabs/grow-x/app/api/invoice/list/route.ts) | 16 | 497 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/invoice/send/route.ts`](file:///c:/growxlabs/grow-x/app/api/invoice/send/route.ts) | 50 | 2095 | import { NextResponse } from "next/server"; | import { Resend } from "resend"; |
| `route.ts` | [`app/api/invoices/detail/route.ts`](file:///c:/growxlabs/grow-x/app/api/invoices/detail/route.ts) | 23 | 629 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/leads/[id]/route.ts`](file:///c:/growxlabs/grow-x/app/api/leads/[id]/route.ts) | 191 | 5925 | import { supabaseAdmin } from "@/lib/supabase/admin"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/leads/create/route.ts`](file:///c:/growxlabs/grow-x/app/api/leads/create/route.ts) | 116 | 3680 | import { supabaseAdmin } from "@/lib/supabase/admin"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/leads/delete-all/route.ts`](file:///c:/growxlabs/grow-x/app/api/leads/delete-all/route.ts) | 23 | 874 | import { supabaseAdmin } from "@/lib/supabase/admin"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/leads/enrich/route.ts`](file:///c:/growxlabs/grow-x/app/api/leads/enrich/route.ts) | 17 | 463 | import { NextResponse } from "next/server"; | import { EnrichmentService } from "@/services/enrichme |
| `route.ts` | [`app/api/leads/import/route.ts`](file:///c:/growxlabs/grow-x/app/api/leads/import/route.ts) | 85 | 3022 | import { supabaseAdmin } from "@/lib/supabase/admin"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/leads/inbound/route.ts`](file:///c:/growxlabs/grow-x/app/api/leads/inbound/route.ts) | 76 | 2650 | import { NextResponse } from "next/server"; | import { createClient } from "@/lib/supabase/server"; |
| `route.ts` | [`app/api/leads/list/route.ts`](file:///c:/growxlabs/grow-x/app/api/leads/list/route.ts) | 40 | 1215 | import { supabaseAdmin } from "@/lib/supabase/admin"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/leads/outreach/generate/route.ts`](file:///c:/growxlabs/grow-x/app/api/leads/outreach/generate/route.ts) | 98 | 3007 | import { supabaseAdmin } from "@/lib/supabase/admin"; | import { NextRequest, NextResponse } from "n |
| `route.ts` | [`app/api/leads/outreach/route.ts`](file:///c:/growxlabs/grow-x/app/api/leads/outreach/route.ts) | 19 | 571 | import { NextResponse } from "next/server"; | import { OutreachService } from "@/services/outreach.s |
| `route.ts` | [`app/api/leads/scrape/instagram/route.ts`](file:///c:/growxlabs/grow-x/app/api/leads/scrape/instagram/route.ts) | 565 | 19519 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/leads/scrape/route.ts`](file:///c:/growxlabs/grow-x/app/api/leads/scrape/route.ts) | 41 | 1292 | import { NextResponse } from "next/server"; | import { ScrapingService } from "@/services/scraping.s |
| `route.ts` | [`app/api/login/route.ts`](file:///c:/growxlabs/grow-x/app/api/login/route.ts) | 38 | 961 | import { createClient } from "@/lib/supabase/server"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/marketing/ads/route.ts`](file:///c:/growxlabs/grow-x/app/api/marketing/ads/route.ts) | 51 | 1558 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/marketing/ai/route.ts`](file:///c:/growxlabs/grow-x/app/api/marketing/ai/route.ts) | 112 | 6221 | import { NextResponse } from "next/server"; | import { GoogleGenerativeAI } from "@google/generative |
| `route.ts` | [`app/api/marketing/automation/route.ts`](file:///c:/growxlabs/grow-x/app/api/marketing/automation/route.ts) | 96 | 3284 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/marketing/campaigns/route.ts`](file:///c:/growxlabs/grow-x/app/api/marketing/campaigns/route.ts) | 141 | 3925 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/marketing/dashboard/route.ts`](file:///c:/growxlabs/grow-x/app/api/marketing/dashboard/route.ts) | 79 | 2969 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/marketing/forms/route.ts`](file:///c:/growxlabs/grow-x/app/api/marketing/forms/route.ts) | 92 | 3272 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/marketing/landing-pages/route.ts`](file:///c:/growxlabs/grow-x/app/api/marketing/landing-pages/route.ts) | 94 | 3047 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/marketing/leads/route.ts`](file:///c:/growxlabs/grow-x/app/api/marketing/leads/route.ts) | 142 | 3964 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/marketing/seo/route.ts`](file:///c:/growxlabs/grow-x/app/api/marketing/seo/route.ts) | 48 | 1699 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/marketing/submissions/route.ts`](file:///c:/growxlabs/grow-x/app/api/marketing/submissions/route.ts) | 326 | 10832 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/meetings/route.ts`](file:///c:/growxlabs/grow-x/app/api/meetings/route.ts) | 46 | 1482 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/onboarding/list/route.ts`](file:///c:/growxlabs/grow-x/app/api/onboarding/list/route.ts) | 18 | 502 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/onboarding/route.ts`](file:///c:/growxlabs/grow-x/app/api/onboarding/route.ts) | 46 | 1404 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/onboarding/submit/route.ts`](file:///c:/growxlabs/grow-x/app/api/onboarding/submit/route.ts) | 43 | 1386 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/payment/webhook/route.ts`](file:///c:/growxlabs/grow-x/app/api/payment/webhook/route.ts) | 125 | 4361 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/pitch-deck/generate/route.ts`](file:///c:/growxlabs/grow-x/app/api/pitch-deck/generate/route.ts) | 131 | 5189 | import { NextRequest, NextResponse } from "next/server"; | import { GoogleGenerativeAI } from "@goog |
| `route.ts` | [`app/api/pm/ai/route.ts`](file:///c:/growxlabs/grow-x/app/api/pm/ai/route.ts) | 20 | 771 | import { NextResponse } from "next/server"; | import { AiPmService } from "@/services/ai-pm"; |
| `route.ts` | [`app/api/pm/bugs/route.ts`](file:///c:/growxlabs/grow-x/app/api/pm/bugs/route.ts) | 45 | 1404 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/pm/projects/[id]/route.ts`](file:///c:/growxlabs/grow-x/app/api/pm/projects/[id]/route.ts) | 15 | 508 | import { NextResponse } from "next/server"; | import { EnterprisePmService } from "@/services/enterp |
| `route.ts` | [`app/api/pm/projects/route.ts`](file:///c:/growxlabs/grow-x/app/api/pm/projects/route.ts) | 29 | 1087 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/pm/sprints/route.ts`](file:///c:/growxlabs/grow-x/app/api/pm/sprints/route.ts) | 35 | 1128 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/pm/tasks/route.ts`](file:///c:/growxlabs/grow-x/app/api/pm/tasks/route.ts) | 69 | 2132 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/pm/timesheets/route.ts`](file:///c:/growxlabs/grow-x/app/api/pm/timesheets/route.ts) | 31 | 1078 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/process-leads/route.ts`](file:///c:/growxlabs/grow-x/app/api/process-leads/route.ts) | 55 | 1824 | import { NextResponse } from "next/server"; | import { createClient } from "@/lib/supabase/server"; |
| `route.ts` | [`app/api/products/route.ts`](file:///c:/growxlabs/grow-x/app/api/products/route.ts) | 35 | 1124 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/proposals/[id]/route.ts`](file:///c:/growxlabs/grow-x/app/api/proposals/[id]/route.ts) | 28 | 795 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/proposals/[id]/view/route.ts`](file:///c:/growxlabs/grow-x/app/api/proposals/[id]/view/route.ts) | 33 | 893 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/proposals/create/route.ts`](file:///c:/growxlabs/grow-x/app/api/proposals/create/route.ts) | 33 | 1138 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/proposals/list/route.ts`](file:///c:/growxlabs/grow-x/app/api/proposals/list/route.ts) | 16 | 454 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/proposals/send/route.ts`](file:///c:/growxlabs/grow-x/app/api/proposals/send/route.ts) | 57 | 2211 | import { NextResponse } from "next/server"; | import { Resend } from "resend"; |
| `route.ts` | [`app/api/proxy-image/route.ts`](file:///c:/growxlabs/grow-x/app/api/proxy-image/route.ts) | 30 | 930 | import { NextResponse } from "next/server"; | export async function GET(req: Request) { |
| `route.ts` | [`app/api/quotations/route.ts`](file:///c:/growxlabs/grow-x/app/api/quotations/route.ts) | 73 | 2382 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/save-subscriber/route.ts`](file:///c:/growxlabs/grow-x/app/api/save-subscriber/route.ts) | 107 | 4370 | import { supabaseAdmin } from "@/lib/supabase/admin"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/search-leads/route.ts`](file:///c:/growxlabs/grow-x/app/api/search-leads/route.ts) | 56 | 2070 | import { NextResponse } from "next/server"; | export async function POST(req: Request) { |
| `route.ts` | [`app/api/send-blog-email/route.ts`](file:///c:/growxlabs/grow-x/app/api/send-blog-email/route.ts) | 150 | 6631 | import { Resend } from "resend"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/send-email/dynamic/route.ts`](file:///c:/growxlabs/grow-x/app/api/send-email/dynamic/route.ts) | 88 | 3298 | import { NextResponse } from "next/server"; | import { createClient } from "@/lib/supabase/server"; |
| `route.ts` | [`app/api/send-email/route.ts`](file:///c:/growxlabs/grow-x/app/api/send-email/route.ts) | 58 | 2544 | import { NextResponse } from "next/server"; | import { createClient } from "@/lib/supabase/server"; |
| `route.ts` | [`app/api/signup/route.ts`](file:///c:/growxlabs/grow-x/app/api/signup/route.ts) | 79 | 2659 | import { createClient } from "@supabase/supabase-js"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/support/ai/route.ts`](file:///c:/growxlabs/grow-x/app/api/support/ai/route.ts) | 92 | 4582 | import { NextResponse } from "next/server"; | import { GoogleGenerativeAI } from "@google/generative |
| `route.ts` | [`app/api/support/customer-health/route.ts`](file:///c:/growxlabs/grow-x/app/api/support/customer-health/route.ts) | 113 | 2988 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/support/dashboard/route.ts`](file:///c:/growxlabs/grow-x/app/api/support/dashboard/route.ts) | 56 | 2143 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/support/knowledge-base/route.ts`](file:///c:/growxlabs/grow-x/app/api/support/knowledge-base/route.ts) | 91 | 2579 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/support/live-chat/route.ts`](file:///c:/growxlabs/grow-x/app/api/support/live-chat/route.ts) | 82 | 2644 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/support/tickets/route.ts`](file:///c:/growxlabs/grow-x/app/api/support/tickets/route.ts) | 170 | 5616 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/tasks/route.ts`](file:///c:/growxlabs/grow-x/app/api/tasks/route.ts) | 56 | 2061 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/team/auth/route.ts`](file:///c:/growxlabs/grow-x/app/api/team/auth/route.ts) | 91 | 2665 | import { NextResponse } from "next/server"; | import { cookies } from "next/headers"; |
| `route.ts` | [`app/api/team/log-alert/route.ts`](file:///c:/growxlabs/grow-x/app/api/team/log-alert/route.ts) | 34 | 1126 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/team/terms/route.ts`](file:///c:/growxlabs/grow-x/app/api/team/terms/route.ts) | 63 | 1836 | import { NextResponse } from "next/server"; | import { cookies } from "next/headers"; |
| `route.ts` | [`app/api/track-wish/route.ts`](file:///c:/growxlabs/grow-x/app/api/track-wish/route.ts) | 67 | 2418 | import { supabaseAdmin } from "@/lib/supabase/admin"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/unsubscribe/route.ts`](file:///c:/growxlabs/grow-x/app/api/unsubscribe/route.ts) | 106 | 3476 | import { supabaseAdmin } from "@/lib/supabase/admin"; | import { NextResponse } from "next/server"; |
| `route.ts` | [`app/api/upload/route.ts`](file:///c:/growxlabs/grow-x/app/api/upload/route.ts) | 82 | 2866 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `route.ts` | [`app/api/workflows/route.ts`](file:///c:/growxlabs/grow-x/app/api/workflows/route.ts) | 38 | 1180 | import { NextResponse } from "next/server"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |

### App Router Pages/Layouts

| File Name | Path | Lines | Size (bytes) | Description / Header Preview |
| --- | --- | --- | --- | --- |
| `page.tsx` | [`app/(hotel)/hotel/booking/page.tsx`](file:///c:/growxlabs/grow-x/app/(hotel)/hotel/booking/page.tsx) | 18 | 1017 | "use client"; | import React from 'react'; |
| `page.tsx` | [`app/(hotel)/hotel/confirmation/page.tsx`](file:///c:/growxlabs/grow-x/app/(hotel)/hotel/confirmation/page.tsx) | 15 | 668 | "use client"; | import React from 'react'; |
| `page.tsx` | [`app/(hotel)/hotel/page.tsx`](file:///c:/growxlabs/grow-x/app/(hotel)/hotel/page.tsx) | 7 | 137 | "use client"; | import HotelLanding from "@/components/hotel/LandingPage"; |
| `page.tsx` | [`app/(hotel)/hotel/room/[id]/page.tsx`](file:///c:/growxlabs/grow-x/app/(hotel)/hotel/room/[id]/page.tsx) | 30 | 1473 | "use client"; | import React, { useState } from 'react'; |
| `page.tsx` | [`app/(hotel)/hotel/rooms/page.tsx`](file:///c:/growxlabs/grow-x/app/(hotel)/hotel/rooms/page.tsx) | 50 | 2366 | "use client"; | import React from 'react'; |
| `layout.tsx` | [`app/(hotel)/layout.tsx`](file:///c:/growxlabs/grow-x/app/(hotel)/layout.tsx) | 22 | 512 | import { HotelProvider } from "@/lib/hotel-context"; | import { HotelNavbar } from "@/components/hot |
| `page.tsx` | [`app/(marketing)/agreements/[id]/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/agreements/[id]/page.tsx) | 87 | 2535 | "use client"; | import { useEffect, useState } from "react"; |
| `page.tsx` | [`app/(marketing)/best-website-for-small-business/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/best-website-for-small-business/page.tsx) | 127 | 6703 | import React from "react"; | import { AEOBlock } from "@/components/marketing/AEOBlock"; |
| `page.tsx` | [`app/(marketing)/blog/ai-coding-tools-are-reshaping-modern-software-engineering/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/ai-coding-tools-are-reshaping-modern-software-engineering/page.tsx) | 507 | 27638 | import React from "react"; | import Image from "next/image"; |
| `InteractiveComponents.tsx` | [`app/(marketing)/blog/applied-intuition-dana-physical-ai-platform/InteractiveComponents.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/applied-intuition-dana-physical-ai-platform/InteractiveComponents.tsx) | 73 | 3353 | "use client"; | import React, { useState } from "react"; |
| `page.tsx` | [`app/(marketing)/blog/applied-intuition-dana-physical-ai-platform/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/applied-intuition-dana-physical-ai-platform/page.tsx) | 541 | 31049 | import React from "react"; | import Script from "next/script"; |
| `InteractiveComponents.tsx` | [`app/(marketing)/blog/blue-origin-new-glenn-rocket-explosion/InteractiveComponents.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/blue-origin-new-glenn-rocket-explosion/InteractiveComponents.tsx) | 159 | 7408 | "use client"; | import React, { useState } from "react"; |
| `page.tsx` | [`app/(marketing)/blog/blue-origin-new-glenn-rocket-explosion/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/blue-origin-new-glenn-rocket-explosion/page.tsx) | 531 | 28060 | import React from "react"; | import Script from "next/script"; |
| `InteractiveComponents.tsx` | [`app/(marketing)/blog/chatbots-are-dying-agents-are-taking-over/InteractiveComponents.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/chatbots-are-dying-agents-are-taking-over/InteractiveComponents.tsx) | 193 | 9282 | "use client"; | import React, { useState } from "react"; |
| `page.tsx` | [`app/(marketing)/blog/chatbots-are-dying-agents-are-taking-over/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/chatbots-are-dying-agents-are-taking-over/page.tsx) | 704 | 34120 | import React from "react"; | import Script from "next/script"; |
| `page.tsx` | [`app/(marketing)/blog/chatgpt-gpt-5-6-preview-everything-you-need-to-know/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/chatgpt-gpt-5-6-preview-everything-you-need-to-know/page.tsx) | 636 | 35758 | import React from "react"; | import Image from "next/image"; |
| `page.tsx` | [`app/(marketing)/blog/claude-fable-5-mythos-5-anthropic-models/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/claude-fable-5-mythos-5-anthropic-models/page.tsx) | 714 | 38886 | import React from "react"; | import Script from "next/script"; |
| `page.tsx` | [`app/(marketing)/blog/claude-fable-5-mythos-5-banned-us-government/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/claude-fable-5-mythos-5-banned-us-government/page.tsx) | 651 | 40214 | import React from "react"; | import Script from "next/script"; |
| `page.tsx` | [`app/(marketing)/blog/claude-opus-4-8-anthropic-ai-model/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/claude-opus-4-8-anthropic-ai-model/page.tsx) | 1226 | 69901 | import React from "react"; | import Script from "next/script"; |
| `page.tsx` | [`app/(marketing)/blog/elon-musks-path-to-becoming-the-worlds-first-trillionaire/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/elon-musks-path-to-becoming-the-worlds-first-trillionaire/page.tsx) | 554 | 34848 | import React from "react"; | import Image from "next/image"; |
| `page.tsx` | [`app/(marketing)/blog/ferraris-electric-future-why-the-luce-marks-a-historic-turning-point/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/ferraris-electric-future-why-the-luce-marks-a-historic-turning-point/page.tsx) | 716 | 42393 | import React from "react"; | import Script from "next/script"; |
| `page.tsx` | [`app/(marketing)/blog/google-io-2026/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/google-io-2026/page.tsx) | 685 | 37404 | import React from "react"; | import Image from "next/image"; |
| `page.tsx` | [`app/(marketing)/blog/google-search-is-no-longer-just-search/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/google-search-is-no-longer-just-search/page.tsx) | 504 | 27295 | import React from "react"; | import Image from "next/image"; |
| `page.tsx` | [`app/(marketing)/blog/indian-restaurant-website-usa/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/indian-restaurant-website-usa/page.tsx) | 478 | 25647 | import React from "react"; | import Image from "next/image"; |
| `InteractiveComponents.tsx` | [`app/(marketing)/blog/kimi-k3-open-frontier-intelligence-model/InteractiveComponents.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/kimi-k3-open-frontier-intelligence-model/InteractiveComponents.tsx) | 73 | 3343 | "use client"; | import React, { useState } from "react"; |
| `page.tsx` | [`app/(marketing)/blog/kimi-k3-open-frontier-intelligence-model/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/kimi-k3-open-frontier-intelligence-model/page.tsx) | 534 | 29276 | import React from "react"; | import Script from "next/script"; |
| `page.tsx` | [`app/(marketing)/blog/n8n-automation-for-business/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/n8n-automation-for-business/page.tsx) | 480 | 26238 | import React from "react"; | import Image from "next/image"; |
| `InteractiveComponents.tsx` | [`app/(marketing)/blog/nvidia-vision-agentic-to-useful-ai/InteractiveComponents.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/nvidia-vision-agentic-to-useful-ai/InteractiveComponents.tsx) | 193 | 9282 | "use client"; | import React, { useState } from "react"; |
| `InteractiveNvidia.tsx` | [`app/(marketing)/blog/nvidia-vision-agentic-to-useful-ai/InteractiveNvidia.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/nvidia-vision-agentic-to-useful-ai/InteractiveNvidia.tsx) | 1261 | 55201 | "use client"; | import React, { useState, useEffect, useRef } from "react"; |
| `page.tsx` | [`app/(marketing)/blog/nvidia-vision-agentic-to-useful-ai/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/nvidia-vision-agentic-to-useful-ai/page.tsx) | 635 | 42283 | import React from "react"; | import Script from "next/script"; |
| `InteractiveComponents.tsx` | [`app/(marketing)/blog/openai-huggingface-security-incident/InteractiveComponents.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/openai-huggingface-security-incident/InteractiveComponents.tsx) | 73 | 3353 | "use client"; | import React, { useState } from "react"; |
| `page.tsx` | [`app/(marketing)/blog/openai-huggingface-security-incident/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/openai-huggingface-security-incident/page.tsx) | 532 | 30752 | import React from "react"; | import Script from "next/script"; |
| `page.tsx` | [`app/(marketing)/blog/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/page.tsx) | 285 | 14849 | import React from "react"; | import Image from "next/image"; |
| `page.tsx` | [`app/(marketing)/blog/restaurant-customer-retention-automation/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/restaurant-customer-retention-automation/page.tsx) | 480 | 26088 | import React from "react"; | import Image from "next/image"; |
| `InteractiveComponents.tsx` | [`app/(marketing)/blog/skyroot-aerospace-vikram-1-orbital-launch/InteractiveComponents.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/skyroot-aerospace-vikram-1-orbital-launch/InteractiveComponents.tsx) | 73 | 3334 | "use client"; | import React, { useState } from "react"; |
| `page.tsx` | [`app/(marketing)/blog/skyroot-aerospace-vikram-1-orbital-launch/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/skyroot-aerospace-vikram-1-orbital-launch/page.tsx) | 436 | 22620 | import React from "react"; | import Script from "next/script"; |
| `page.tsx` | [`app/(marketing)/blog/whatsapp-automation-for-lead-nurturing/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/whatsapp-automation-for-lead-nurturing/page.tsx) | 479 | 25947 | import React from "react"; | import Image from "next/image"; |
| `page.tsx` | [`app/(marketing)/blog/why-anthropic-is-becoming-a-serious-threat-to-openai/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/blog/why-anthropic-is-becoming-a-serious-threat-to-openai/page.tsx) | 486 | 26478 | import React from "react"; | import Image from "next/image"; |
| `CareersContent.tsx` | [`app/(marketing)/careers/CareersContent.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/careers/CareersContent.tsx) | 1252 | 62492 | "use client"; | import { useState, useEffect, useRef } from "react"; |
| `page.tsx` | [`app/(marketing)/careers/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/careers/page.tsx) | 27 | 812 | import { locales } from "@/navigation"; | import { CareersContent } from "./CareersContent"; |
| `ContactContent.tsx` | [`app/(marketing)/contact/ContactContent.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/contact/ContactContent.tsx) | 104 | 5071 | "use client"; | import { Mail, MessageCircle, ArrowRight } from "lucide-react"; |
| `page.tsx` | [`app/(marketing)/contact/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/contact/page.tsx) | 43 | 1226 | import { locales } from "@/navigation"; | import { ContactContent } from "./ContactContent"; |
| `page.tsx` | [`app/(marketing)/courses/[slug]/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/courses/[slug]/page.tsx) | 305 | 14805 | "use client"; | import { useParams, notFound, useRouter } from "next/navigation"; |
| `page.tsx` | [`app/(marketing)/courses/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/courses/page.tsx) | 557 | 29622 | "use client"; | import { useState, useEffect } from "react"; |
| `page.tsx` | [`app/(marketing)/demos/hotel/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/demos/hotel/page.tsx) | 359 | 15503 | "use client"; | import { motion } from "framer-motion"; |
| `page.tsx` | [`app/(marketing)/demos/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/demos/page.tsx) | 98 | 5121 | "use client"; | import { motion } from "framer-motion"; |
| `page.tsx` | [`app/(marketing)/demos/real-estate/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/demos/real-estate/page.tsx) | 353 | 15589 | "use client"; | import { motion } from "framer-motion"; |
| `page.tsx` | [`app/(marketing)/demos/restaurant/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/demos/restaurant/page.tsx) | 341 | 15291 | "use client"; | import { motion } from "framer-motion"; |
| `FAQContent.tsx` | [`app/(marketing)/faq/FAQContent.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/faq/FAQContent.tsx) | 98 | 3676 | "use client"; | import { useState } from "react"; |
| `page.tsx` | [`app/(marketing)/faq/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/faq/page.tsx) | 295 | 21923 | import { locales } from "@/navigation"; | import { FAQContent } from "./FAQContent"; |
| `page.tsx` | [`app/(marketing)/handover/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/handover/page.tsx) | 74 | 3310 | "use client"; | import { motion } from "framer-motion"; |
| `page.tsx` | [`app/(marketing)/how-to-get-clients-from-website/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/how-to-get-clients-from-website/page.tsx) | 102 | 5346 | import React from "react"; | import { AEOBlock } from "@/components/marketing/AEOBlock"; |
| `layout.tsx` | [`app/(marketing)/layout.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/layout.tsx) | 9 | 149 | import React from "react"; | export default function MarketingLayout({ |
| `page.tsx` | [`app/(marketing)/login/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/login/page.tsx) | 160 | 6825 | "use client"; | import { useState } from "react"; |
| `page.tsx` | [`app/(marketing)/onboarding/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/onboarding/page.tsx) | 7 | 159 | "use client"; | import OnboardingFlow from "@/components/onboarding/OnboardingFlow"; |
| `page.tsx` | [`app/(marketing)/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/page.tsx) | 281 | 20725 | import { ServiceCard } from "@/components/ui/ServiceCard"; | import { Link } from "@/navigation"; |
| `page.tsx` | [`app/(marketing)/portfolio/[slug]/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/portfolio/[slug]/page.tsx) | 2509 | 162501 | import { notFound } from "next/navigation"; | import { projects } from "@/lib/data/projects"; |
| `page.tsx` | [`app/(marketing)/portfolio/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/portfolio/page.tsx) | 122 | 4405 | import { ProjectCard } from "@/components/ui/ProjectCard"; | import { projects } from "@/lib/data/pr |
| `PricingTracker.tsx` | [`app/(marketing)/pricing/PricingTracker.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/pricing/PricingTracker.tsx) | 13 | 298 | 'use client' | import { useEffect } from 'react' |
| `page.tsx` | [`app/(marketing)/pricing/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/pricing/page.tsx) | 16 | 449 | import { redirect } from "next/navigation"; | export async function generateMetadata() { |
| `PrivacyContent.tsx` | [`app/(marketing)/privacy/PrivacyContent.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/privacy/PrivacyContent.tsx) | 131 | 7455 | "use client"; | import React from "react"; |
| `page.tsx` | [`app/(marketing)/privacy/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/privacy/page.tsx) | 27 | 826 | import { locales } from "@/navigation"; | import { PrivacyContent } from "./PrivacyContent"; |
| `page.tsx` | [`app/(marketing)/refund-policy/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/refund-policy/page.tsx) | 69 | 3432 | "use client"; | import { AlertCircle, CheckCircle, Clock } from "lucide-react"; |
| `page.tsx` | [`app/(marketing)/register/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/register/page.tsx) | 206 | 9075 | "use client"; | import { useState } from "react"; |
| `page.tsx` | [`app/(marketing)/sandbox/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/sandbox/page.tsx) | 199 | 9033 | 'use client'; | import React from 'react'; |
| `page.tsx` | [`app/(marketing)/services/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/services/page.tsx) | 283 | 10550 | import { Reveal } from "@/components/marketing/Reveal"; | import { locales, Link } from "@/navigatio |
| `page.tsx` | [`app/(marketing)/signup/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/signup/page.tsx) | 266 | 13329 | "use client"; | import { useState, useEffect } from "react"; |
| `page.tsx` | [`app/(marketing)/subscriptions/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/subscriptions/page.tsx) | 21 | 646 | "use client"; | import { useEffect } from "react"; |
| `TermsContent.tsx` | [`app/(marketing)/terms/TermsContent.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/terms/TermsContent.tsx) | 114 | 6211 | "use client"; | import React from "react"; |
| `page.tsx` | [`app/(marketing)/terms/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/terms/page.tsx) | 27 | 847 | import { locales } from "@/navigation"; | import { TermsContent } from "./TermsContent"; |
| `page.tsx` | [`app/(marketing)/website-vs-growth-system/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/website-vs-growth-system/page.tsx) | 121 | 6151 | import React from "react"; | import { AEOBlock } from "@/components/marketing/AEOBlock"; |
| `page.tsx` | [`app/(marketing)/wish-game/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/wish-game/page.tsx) | 1624 | 49248 | "use client"; | import { FormEvent, useState, useEffect } from "react"; |
| `page.tsx` | [`app/(marketing)/wish-game/reel/page.tsx`](file:///c:/growxlabs/grow-x/app/(marketing)/wish-game/reel/page.tsx) | 696 | 19431 | "use client"; | import { useState, useEffect, useRef } from "react"; |
| `layout.tsx` | [`app/(realestate)/layout.tsx`](file:///c:/growxlabs/grow-x/app/(realestate)/layout.tsx) | 19 | 465 | import React from "react"; | import { RealEstateNavbar } from "@/components/realestate/Navbar"; |
| `page.tsx` | [`app/(realestate)/realestate/contact/page.tsx`](file:///c:/growxlabs/grow-x/app/(realestate)/realestate/contact/page.tsx) | 19 | 1120 | "use client"; | import React, { useState } from 'react'; |
| `page.tsx` | [`app/(realestate)/realestate/page.tsx`](file:///c:/growxlabs/grow-x/app/(realestate)/realestate/page.tsx) | 7 | 152 | "use client"; | import RealEstateLanding from "@/components/realestate/LandingPage"; |
| `page.tsx` | [`app/(realestate)/realestate/properties/page.tsx`](file:///c:/growxlabs/grow-x/app/(realestate)/realestate/properties/page.tsx) | 75 | 3558 | "use client"; | import React, { useState } from 'react'; |
| `page.tsx` | [`app/(realestate)/realestate/property/[id]/page.tsx`](file:///c:/growxlabs/grow-x/app/(realestate)/realestate/property/[id]/page.tsx) | 26 | 1266 | "use client"; | import React from 'react'; |
| `layout.tsx` | [`app/(restaurant)/layout.tsx`](file:///c:/growxlabs/grow-x/app/(restaurant)/layout.tsx) | 22 | 575 | import React from "react"; | import { CartProvider } from "@/lib/restaurant-context"; |
| `page.tsx` | [`app/(restaurant)/restaurant/cart/page.tsx`](file:///c:/growxlabs/grow-x/app/(restaurant)/restaurant/cart/page.tsx) | 60 | 2914 | "use client"; | import React from 'react'; |
| `page.tsx` | [`app/(restaurant)/restaurant/checkout/page.tsx`](file:///c:/growxlabs/grow-x/app/(restaurant)/restaurant/checkout/page.tsx) | 23 | 1148 | "use client"; | import React, { useState } from 'react'; |
| `page.tsx` | [`app/(restaurant)/restaurant/menu/page.tsx`](file:///c:/growxlabs/grow-x/app/(restaurant)/restaurant/menu/page.tsx) | 104 | 4897 | "use client"; | import React, { useState } from 'react'; |
| `page.tsx` | [`app/(restaurant)/restaurant/order-success/page.tsx`](file:///c:/growxlabs/grow-x/app/(restaurant)/restaurant/order-success/page.tsx) | 19 | 824 | "use client"; | import React from 'react'; |
| `page.tsx` | [`app/(restaurant)/restaurant/page.tsx`](file:///c:/growxlabs/grow-x/app/(restaurant)/restaurant/page.tsx) | 7 | 152 | "use client"; | import RestaurantLanding from "@/components/restaurant/LandingPage"; |
| `page.tsx` | [`app/(restaurant)/restaurant/track-order/page.tsx`](file:///c:/growxlabs/grow-x/app/(restaurant)/restaurant/track-order/page.tsx) | 26 | 1301 | "use client"; | import React, { useState, useEffect } from 'react'; |
| `page.tsx` | [`app/[locale]/admin/ai-platform/page.tsx`](file:///c:/growxlabs/grow-x/app/[locale]/admin/ai-platform/page.tsx) | 700 | 35208 | "use client"; | import { useState, useEffect } from "react"; |
| `page.tsx` | [`app/[locale]/admin/marketing/page.tsx`](file:///c:/growxlabs/grow-x/app/[locale]/admin/marketing/page.tsx) | 1384 | 79510 | "use client"; | import { useState, useEffect } from "react"; |
| `page.tsx` | [`app/[locale]/admin/settings/page.tsx`](file:///c:/growxlabs/grow-x/app/[locale]/admin/settings/page.tsx) | 1002 | 56007 | "use client"; | import { useState, useEffect } from "react"; |
| `page.tsx` | [`app/[locale]/admin/support/page.tsx`](file:///c:/growxlabs/grow-x/app/[locale]/admin/support/page.tsx) | 1092 | 60753 | "use client"; | import { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/academy/assessments/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/academy/assessments/page.tsx) | 135 | 6754 | import { createClient } from "@/lib/supabase/server"; | import { |
| `page.tsx` | [`app/admin/academy/certificates/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/academy/certificates/page.tsx) | 134 | 6633 | import { createClient } from "@/lib/supabase/server"; | import { |
| `page.tsx` | [`app/admin/academy/courses/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/academy/courses/page.tsx) | 130 | 6287 | import { createClient } from "@/lib/supabase/server"; | import { |
| `page.tsx` | [`app/admin/academy/payments/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/academy/payments/page.tsx) | 99 | 5200 | import { createClient } from "@/lib/supabase/server"; | import { |
| `page.tsx` | [`app/admin/academy/users/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/academy/users/page.tsx) | 134 | 6926 | import { createClient } from "@/lib/supabase/server"; | import { |
| `page.tsx` | [`app/admin/agreements/[id]/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/agreements/[id]/page.tsx) | 102 | 2677 | "use client"; | import { useEffect, useState } from "react"; |
| `page.tsx` | [`app/admin/agreements/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/agreements/page.tsx) | 258 | 13782 | "use client"; | import { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/agreements/preview/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/agreements/preview/page.tsx) | 78 | 2739 | "use client"; | import { useSearchParams } from "next/navigation"; |
| `page.tsx` | [`app/admin/ai-platform/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/ai-platform/page.tsx) | 553 | 28201 | "use client"; | import { useState, useEffect, useRef } from "react"; |
| `page.tsx` | [`app/admin/apollo/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/apollo/page.tsx) | 237 | 12367 | "use client"; | import { useEffect, useState } from "react"; |
| `page.tsx` | [`app/admin/career-portal/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/career-portal/page.tsx) | 952 | 54870 | "use client"; | import { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/career-portal/playbook/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/career-portal/playbook/page.tsx) | 323 | 18328 | "use client"; | import { useState } from "react"; |
| `page.tsx` | [`app/admin/certificates/new/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/certificates/new/page.tsx) | 119 | 4695 | "use client"; | import { useState } from "react"; |
| `page.tsx` | [`app/admin/clients/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/clients/page.tsx) | 100 | 4289 | "use client"; | import { useEffect, useState } from "react"; |
| `InteractiveWorkspace.tsx` | [`app/admin/command-center/InteractiveWorkspace.tsx`](file:///c:/growxlabs/grow-x/app/admin/command-center/InteractiveWorkspace.tsx) | 2303 | 105092 | "use client"; | import React, { useState, useRef, useEffect, useCallback } from "react"; |
| `page.tsx` | [`app/admin/command-center/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/command-center/page.tsx) | 18 | 595 | import React from "react"; | import InteractiveWorkspace from "./InteractiveWorkspace"; |
| `page.tsx` | [`app/admin/companies/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/companies/page.tsx) | 234 | 10980 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/contacts/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/contacts/page.tsx) | 220 | 10581 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/crm/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/crm/page.tsx) | 1353 | 69032 | "use client"; | import { useState, useEffect, useRef } from "react"; |
| `page.tsx` | [`app/admin/crm/sources/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/crm/sources/page.tsx) | 106 | 9160 | "use client"; | import { useState } from "react"; |
| `page.tsx` | [`app/admin/deals/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/deals/page.tsx) | 213 | 9348 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/editorial-carousel/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/editorial-carousel/page.tsx) | 13 | 471 | import React from "react"; | import { EditorialCarouselClient } from "@/components/shared/EditorialC |
| `page.tsx` | [`app/admin/employee-onboarding/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/employee-onboarding/page.tsx) | 1061 | 53133 | "use client"; | import React, { useState, useEffect, useRef } from "react"; |
| `page.tsx` | [`app/admin/finance/accounts/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/finance/accounts/page.tsx) | 69 | 1924 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/finance/ai-helper/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/finance/ai-helper/page.tsx) | 165 | 7732 | "use client"; | import React, { useState } from "react"; |
| `page.tsx` | [`app/admin/finance/dashboard/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/finance/dashboard/page.tsx) | 79 | 2568 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/finance/expenses/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/finance/expenses/page.tsx) | 170 | 7948 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/finance/invoices/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/finance/invoices/page.tsx) | 225 | 9613 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/finance/reports/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/finance/reports/page.tsx) | 243 | 12869 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/growx-email/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/growx-email/page.tsx) | 568 | 24432 | "use client"; | import { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/hrms/ai-recruiter/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/hrms/ai-recruiter/page.tsx) | 229 | 12313 | "use client"; | import React, { useState } from "react"; |
| `page.tsx` | [`app/admin/hrms/attendance/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/hrms/attendance/page.tsx) | 116 | 5566 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/hrms/dashboard/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/hrms/dashboard/page.tsx) | 84 | 2930 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/hrms/employees/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/hrms/employees/page.tsx) | 165 | 8388 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/hrms/leaves/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/hrms/leaves/page.tsx) | 198 | 11794 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/hrms/payroll/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/hrms/payroll/page.tsx) | 67 | 2394 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/hrms/recruitment/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/hrms/recruitment/page.tsx) | 117 | 5326 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/instagram-carousel/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/instagram-carousel/page.tsx) | 30 | 1193 | import React from "react"; | import { CarouselGeneratorClient } from "@/components/shared/CarouselGe |
| `page.tsx` | [`app/admin/invoices/[id]/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/invoices/[id]/page.tsx) | 57 | 1429 | "use client"; | import { useEffect, useState } from "react"; |
| `page.tsx` | [`app/admin/invoices/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/invoices/page.tsx) | 725 | 44287 | "use client"; | import { useEffect, useState, useMemo } from "react"; |
| `page.tsx` | [`app/admin/invoices/preview/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/invoices/preview/page.tsx) | 17 | 475 | "use client"; | import InvoiceTemplate from "@/components/admin/InvoiceTemplate"; |
| `layout.tsx` | [`app/admin/layout.tsx`](file:///c:/growxlabs/grow-x/app/admin/layout.tsx) | 285 | 17383 | "use client"; | import { useEffect, useState } from "react"; |
| `page.tsx` | [`app/admin/leads/[id]/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/leads/[id]/page.tsx) | 517 | 24393 | "use client"; | import { useEffect, useState } from "react"; |
| `page.tsx` | [`app/admin/leads/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/leads/page.tsx) | 1182 | 58190 | "use client"; | import { useState, useEffect, useCallback, useRef } from "react"; |
| `page.tsx` | [`app/admin/leads/scrape/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/leads/scrape/page.tsx) | 455 | 20096 | "use client"; | import { useState } from "react"; |
| `page.tsx` | [`app/admin/marketing/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/marketing/page.tsx) | 734 | 38724 | "use client"; | import { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/monetization/coupons/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/monetization/coupons/page.tsx) | 12 | 436 | import { supabaseAdmin } from "@/lib/supabase/admin"; | import { CouponManagementClient } from "@/co |
| `page.tsx` | [`app/admin/monetization/orders/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/monetization/orders/page.tsx) | 138 | 6881 | import { supabaseAdmin } from "@/lib/supabase/admin"; | import { |
| `page.tsx` | [`app/admin/onboarding/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/onboarding/page.tsx) | 267 | 13794 | "use client"; | import { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/onboarding/preview/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/onboarding/preview/page.tsx) | 22 | 766 | "use client"; | import OnboardingFlow from "@/components/onboarding/OnboardingFlow"; |
| `page.tsx` | [`app/admin/outreach/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/outreach/page.tsx) | 35 | 1524 | "use client"; | import { Card } from "@/components/ui/Card"; |
| `page.tsx` | [`app/admin/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/page.tsx) | 199 | 9364 | import { createClient } from "@/lib/supabase/server"; | import { |
| `page.tsx` | [`app/admin/pitch-deck/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/pitch-deck/page.tsx) | 1007 | 49129 | "use client"; | import { useState } from "react"; |
| `page.tsx` | [`app/admin/pm/ai-copilot/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/pm/ai-copilot/page.tsx) | 117 | 5522 | "use client"; | import React, { useState } from "react"; |
| `page.tsx` | [`app/admin/pm/bugs/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/pm/bugs/page.tsx) | 202 | 8793 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/pm/projects/[id]/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/pm/projects/[id]/page.tsx) | 226 | 10587 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/pm/projects/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/pm/projects/page.tsx) | 169 | 7736 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/pm/sprints/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/pm/sprints/page.tsx) | 60 | 1625 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/pm/timesheets/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/pm/timesheets/page.tsx) | 109 | 4135 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/pm/workload/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/pm/workload/page.tsx) | 55 | 1794 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/products/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/products/page.tsx) | 183 | 8775 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/proposals/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/proposals/page.tsx) | 847 | 53319 | "use client"; | import { useState, useMemo, useEffect } from "react"; |
| `page.tsx` | [`app/admin/quotations/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/quotations/page.tsx) | 167 | 6827 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/reels-creator/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/reels-creator/page.tsx) | 30 | 1180 | import React from "react"; | import { ReelsGeneratorClient } from "@/components/shared/ReelsGenerato |
| `page.tsx` | [`app/admin/reports/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/reports/page.tsx) | 158 | 7593 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/search/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/search/page.tsx) | 189 | 9538 | "use client"; | import { useState } from "react"; |
| `page.tsx` | [`app/admin/settings/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/settings/page.tsx) | 371 | 17876 | "use client"; | import { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/settings/terms/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/settings/terms/page.tsx) | 106 | 4918 | "use client"; | import { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/support/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/support/page.tsx) | 623 | 31942 | "use client"; | import { useState, useEffect } from "react"; |
| `page.tsx` | [`app/admin/team/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/team/page.tsx) | 740 | 40992 | "use client"; | import { useState, useEffect } from "react"; |
| `WishAdminDashboardClient.tsx` | [`app/admin/wish-game/WishAdminDashboardClient.tsx`](file:///c:/growxlabs/grow-x/app/admin/wish-game/WishAdminDashboardClient.tsx) | 782 | 35660 | "use client"; | import React, { useState } from "react"; |
| `page.tsx` | [`app/admin/wish-game/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/wish-game/page.tsx) | 194 | 7594 | ==================================================================== | WISH GAME ADMIN DASHBOARD - S |
| `page.tsx` | [`app/admin/workflows/page.tsx`](file:///c:/growxlabs/grow-x/app/admin/workflows/page.tsx) | 72 | 2015 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/architecture/page.tsx`](file:///c:/growxlabs/grow-x/app/architecture/page.tsx) | 1093 | 61815 | "use client"; | import React, { useState } from "react"; |
| `actions.ts` | [`app/auth/actions.ts`](file:///c:/growxlabs/grow-x/app/auth/actions.ts) | 50 | 1235 | "use server"; | import { createClient } from "@/lib/supabase/server"; |
| `route.ts` | [`app/auth/callback/route.ts`](file:///c:/growxlabs/grow-x/app/auth/callback/route.ts) | 20 | 719 | import { createClient } from "@/lib/supabase/server"; | import { NextResponse } from "next/server"; |
| `page.tsx` | [`app/certificate/[id]/page.tsx`](file:///c:/growxlabs/grow-x/app/certificate/[id]/page.tsx) | 41 | 1001 | import { createClient } from "@/lib/supabase/server"; | import { notFound } from "next/navigation"; |
| `page.tsx` | [`app/checkout/page.tsx`](file:///c:/growxlabs/grow-x/app/checkout/page.tsx) | 321 | 15171 | "use client"; | import React, { useState, useEffect } from "react"; |
| `page.tsx` | [`app/client-agreement/page.tsx`](file:///c:/growxlabs/grow-x/app/client-agreement/page.tsx) | 155 | 8686 | "use client"; | import { Button } from "@/components/ui/Button"; |
| `page.tsx` | [`app/client/agreement/page.tsx`](file:///c:/growxlabs/grow-x/app/client/agreement/page.tsx) | 91 | 2605 | "use client"; | import { useEffect, useState } from "react"; |
| `page.tsx` | [`app/client/dashboard/agreements/[id]/page.tsx`](file:///c:/growxlabs/grow-x/app/client/dashboard/agreements/[id]/page.tsx) | 88 | 2554 | "use client"; | import { useEffect, useState } from "react"; |
| `page.tsx` | [`app/client/dashboard/page.tsx`](file:///c:/growxlabs/grow-x/app/client/dashboard/page.tsx) | 229 | 10061 | "use client"; | import { useEffect, useState } from "react"; |
| `page.tsx` | [`app/client/invoices/page.tsx`](file:///c:/growxlabs/grow-x/app/client/invoices/page.tsx) | 116 | 4957 | "use client"; | import { useEffect, useState } from "react"; |
| `layout.tsx` | [`app/client/layout.tsx`](file:///c:/growxlabs/grow-x/app/client/layout.tsx) | 45 | 1648 | "use client"; | import { useSession } from "next-auth/react"; |
| `page.tsx` | [`app/client/page.tsx`](file:///c:/growxlabs/grow-x/app/client/page.tsx) | 13 | 332 | import { headers } from "next/headers"; | import { redirect } from "next/navigation"; |
| `page.tsx` | [`app/courses/[slug]/assessment/page.tsx`](file:///c:/growxlabs/grow-x/app/courses/[slug]/assessment/page.tsx) | 380 | 15869 | "use client"; | import { useParams, useRouter } from "next/navigation"; |
| `page.tsx` | [`app/courses/[slug]/certificate/page.tsx`](file:///c:/growxlabs/grow-x/app/courses/[slug]/certificate/page.tsx) | 212 | 9770 | "use client"; | import { useParams, useRouter } from "next/navigation"; |
| `page.tsx` | [`app/courses/[slug]/result/page.tsx`](file:///c:/growxlabs/grow-x/app/courses/[slug]/result/page.tsx) | 193 | 8547 | "use client"; | import { useParams, useRouter } from "next/navigation"; |
| `page.tsx` | [`app/dashboard/instagram-carousel/page.tsx`](file:///c:/growxlabs/grow-x/app/dashboard/instagram-carousel/page.tsx) | 36 | 1413 | import { createClient } from "@/lib/supabase/server"; | import { redirect } from "next/navigation"; |
| `page.tsx` | [`app/dashboard/page.tsx`](file:///c:/growxlabs/grow-x/app/dashboard/page.tsx) | 207 | 11074 | import { createClient } from "@/lib/supabase/server"; | import { headers } from "next/headers"; |
| `page.tsx` | [`app/dashboard/reels-creator/page.tsx`](file:///c:/growxlabs/grow-x/app/dashboard/reels-creator/page.tsx) | 36 | 1366 | import { createClient } from "@/lib/supabase/server"; | import { redirect } from "next/navigation"; |
| `error.tsx` | [`app/error.tsx`](file:///c:/growxlabs/grow-x/app/error.tsx) | 79 | 2801 | "use client"; | import React, { useEffect } from 'react'; |
| `globals.css` | [`app/globals.css`](file:///c:/growxlabs/grow-x/app/globals.css) | 1218 | 38285 | @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700;800&family=Inter:wg |
| `icon.svg` | [`app/icon.svg`](file:///c:/growxlabs/grow-x/app/icon.svg) | 468 | 235909 |  |
| `layout.tsx` | [`app/layout.tsx`](file:///c:/growxlabs/grow-x/app/layout.tsx) | 275 | 11354 | import React from "react"; | import { Plus_Jakarta_Sans, Playfair_Display, Lora, Outfit } from "next |
| `page.tsx` | [`app/learn/[course]/[module]/[lesson]/page.tsx`](file:///c:/growxlabs/grow-x/app/learn/[course]/[module]/[lesson]/page.tsx) | 275 | 12361 | "use client"; | import { useParams, notFound, useRouter } from "next/navigation"; |
| `loading.tsx` | [`app/loading.tsx`](file:///c:/growxlabs/grow-x/app/loading.tsx) | 30 | 915 | "use client"; | import React from 'react'; |
| `not-found.tsx` | [`app/not-found.tsx`](file:///c:/growxlabs/grow-x/app/not-found.tsx) | 55 | 2066 | "use client"; | import React from 'react'; |
| `page.tsx` | [`app/products/page.tsx`](file:///c:/growxlabs/grow-x/app/products/page.tsx) | 132 | 5813 | "use client"; | import { motion } from "framer-motion"; |
| `page.tsx` | [`app/project/[slug]/page.tsx`](file:///c:/growxlabs/grow-x/app/project/[slug]/page.tsx) | 242 | 10307 | "use client"; | import { useParams, notFound, useRouter } from "next/navigation"; |
| `page.tsx` | [`app/proposal/[id]/page.tsx`](file:///c:/growxlabs/grow-x/app/proposal/[id]/page.tsx) | 523 | 26674 | "use client"; | import { useEffect, useState } from "react"; |
| `page.tsx` | [`app/result/[course]/page.tsx`](file:///c:/growxlabs/grow-x/app/result/[course]/page.tsx) | 158 | 7520 | "use client"; | import { useParams, useSearchParams, useRouter } from "next/navigation"; |
| `robots.ts` | [`app/robots.ts`](file:///c:/growxlabs/grow-x/app/robots.ts) | 24 | 509 | import { MetadataRoute } from 'next'; | export default function robots(): MetadataRoute.Robots { |
| `sitemap.ts` | [`app/sitemap.ts`](file:///c:/growxlabs/grow-x/app/sitemap.ts) | 68 | 4230 | import { MetadataRoute } from 'next'; | import { projects } from '@/lib/data/projects'; |
| `page.tsx` | [`app/team/crm/page.tsx`](file:///c:/growxlabs/grow-x/app/team/crm/page.tsx) | 249 | 14230 | "use client"; | import { useState, useEffect } from "react"; |
| `layout.tsx` | [`app/team/layout.tsx`](file:///c:/growxlabs/grow-x/app/team/layout.tsx) | 17 | 482 | import { ReactNode } from "react"; | import { Inter } from "next/font/google"; |
| `page.tsx` | [`app/team/login/page.tsx`](file:///c:/growxlabs/grow-x/app/team/login/page.tsx) | 198 | 8113 | "use client"; | import { useState, useEffect } from "react"; |
| `page.tsx` | [`app/test/[course]/page.tsx`](file:///c:/growxlabs/grow-x/app/test/[course]/page.tsx) | 176 | 7640 | "use client"; | import { useParams, useRouter } from "next/navigation"; |
| `page.tsx` | [`app/verify/[id]/page.tsx`](file:///c:/growxlabs/grow-x/app/verify/[id]/page.tsx) | 118 | 5351 | import { createClient } from "@/lib/supabase/server"; | import { notFound } from "next/navigation"; |

### Business Services

| File Name | Path | Lines | Size (bytes) | Description / Header Preview |
| --- | --- | --- | --- | --- |
| `ai-crm.ts` | [`services/ai-crm.ts`](file:///c:/growxlabs/grow-x/services/ai-crm.ts) | 168 | 6296 | import { GoogleGenerativeAI } from "@google/generative-ai"; | import { supabaseAdmin } from "@/lib/s |
| `ai-finance.ts` | [`services/ai-finance.ts`](file:///c:/growxlabs/grow-x/services/ai-finance.ts) | 81 | 2586 | import { GoogleGenerativeAI } from "@google/generative-ai"; | const geminiApiKey = process.env.GEMIN |
| `ai-hrms.ts` | [`services/ai-hrms.ts`](file:///c:/growxlabs/grow-x/services/ai-hrms.ts) | 82 | 2683 | import { GoogleGenerativeAI } from "@google/generative-ai"; | const geminiApiKey = process.env.GEMIN |
| `ai-pm.ts` | [`services/ai-pm.ts`](file:///c:/growxlabs/grow-x/services/ai-pm.ts) | 86 | 3044 | import { GoogleGenerativeAI } from "@google/generative-ai"; | Load configuration |
| `enrichment.service.ts` | [`services/enrichment.service.ts`](file:///c:/growxlabs/grow-x/services/enrichment.service.ts) | 96 | 2881 | import { supabaseAdmin } from "@/lib/supabase/admin"; | import { Lead } from "@/types"; |
| `enterprise-crm.ts` | [`services/enterprise-crm.ts`](file:///c:/growxlabs/grow-x/services/enterprise-crm.ts) | 201 | 7197 | import { supabaseAdmin } from "@/lib/supabase/admin"; | export class EnterpriseCrmService { |
| `enterprise-finance.ts` | [`services/enterprise-finance.ts`](file:///c:/growxlabs/grow-x/services/enterprise-finance.ts) | 212 | 6774 | import { supabaseAdmin } from "@/lib/supabase/admin"; | interface JournalItemInput { |
| `enterprise-hrms.ts` | [`services/enterprise-hrms.ts`](file:///c:/growxlabs/grow-x/services/enterprise-hrms.ts) | 148 | 4630 | import { supabaseAdmin } from "@/lib/supabase/admin"; | export class EnterpriseHrmsService { |
| `enterprise-pm.ts` | [`services/enterprise-pm.ts`](file:///c:/growxlabs/grow-x/services/enterprise-pm.ts) | 169 | 6257 | import { supabaseAdmin } from "@/lib/supabase/admin"; | export class EnterprisePmService { |
| `followup.service.ts` | [`services/followup.service.ts`](file:///c:/growxlabs/grow-x/services/followup.service.ts) | 99 | 3081 | import { Resend } from "resend"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `invoice.service.ts` | [`services/invoice.service.ts`](file:///c:/growxlabs/grow-x/services/invoice.service.ts) | 33 | 871 | import { supabaseAdmin } from "@/lib/supabase/admin"; | export class InvoiceService { |
| `onboarding.service.ts` | [`services/onboarding.service.ts`](file:///c:/growxlabs/grow-x/services/onboarding.service.ts) | 26 | 678 | import { supabaseAdmin } from "@/lib/supabase/admin"; | export class OnboardingService { |
| `outreach.service.ts` | [`services/outreach.service.ts`](file:///c:/growxlabs/grow-x/services/outreach.service.ts) | 65 | 2302 | import { Resend } from "resend"; | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `scraping.service.ts` | [`services/scraping.service.ts`](file:///c:/growxlabs/grow-x/services/scraping.service.ts) | 253 | 10930 | import { supabaseAdmin } from "@/lib/supabase/admin"; | import { Lead } from "@/types"; |
| `workflow-engine.ts` | [`services/workflow-engine.ts`](file:///c:/growxlabs/grow-x/services/workflow-engine.ts) | 198 | 7323 | import { supabaseAdmin } from "@/lib/supabase/admin"; | import { Resend } from "resend"; |

### Database Schemas (SQL)

| File Name | Path | Lines | Size (bytes) | Description / Header Preview |
| --- | --- | --- | --- | --- |
| `migration.sql` | [`scripts/migration.sql`](file:///c:/growxlabs/grow-x/scripts/migration.sql) | 125 | 4107 | -- ============================================================ | -- GrowX Labs: Course Data Migrati |
| `supabase_admin_schema.sql` | [`supabase_admin_schema.sql`](file:///c:/growxlabs/grow-x/supabase_admin_schema.sql) | 415 | 14482 | -- ============================================================================ | -- GROWXLABS ENTER |
| `supabase_ai_platform_schema.sql` | [`supabase_ai_platform_schema.sql`](file:///c:/growxlabs/grow-x/supabase_ai_platform_schema.sql) | 297 | 10636 | -- ============================================================================ | -- GROWXLABS ENTER |
| `supabase_bookings_patch.sql` | [`supabase_bookings_patch.sql`](file:///c:/growxlabs/grow-x/supabase_bookings_patch.sql) | 85 | 3296 | -- ======================================================= | -- CUSTOM BOOKING SCHEDULER DATABASE SC |
| `supabase_careers_patch.sql` | [`supabase_careers_patch.sql`](file:///c:/growxlabs/grow-x/supabase_careers_patch.sql) | 42 | 1347 | -- Create career_applications table | CREATE TABLE IF NOT EXISTS career_applications ( |
| `supabase_crm_patch.sql` | [`supabase_crm_patch.sql`](file:///c:/growxlabs/grow-x/supabase_crm_patch.sql) | 92 | 2860 | -- TEAM MEMBERS | CREATE TABLE IF NOT EXISTS team_members ( |
| `supabase_crm_permissions_patch.sql` | [`supabase_crm_permissions_patch.sql`](file:///c:/growxlabs/grow-x/supabase_crm_permissions_patch.sql) | 2 | 162 | -- Add allowed_paths column to team_members to store custom path permissions | ALTER TABLE team_memb |
| `supabase_enterprise_crm_schema.sql` | [`supabase_enterprise_crm_schema.sql`](file:///c:/growxlabs/grow-x/supabase_enterprise_crm_schema.sql) | 433 | 14195 | -- ===================================================================== | -- ENTERPRISE CRM DATABAS |
| `supabase_enterprise_finance_schema.sql` | [`supabase_enterprise_finance_schema.sql`](file:///c:/growxlabs/grow-x/supabase_enterprise_finance_schema.sql) | 306 | 11344 | -- Supabase PostgreSQL Enterprise Finance & Accounting Schema (Phase 3) | -- ENUMS DEFINITIONS (Safe |
| `supabase_enterprise_hrms_schema.sql` | [`supabase_enterprise_hrms_schema.sql`](file:///c:/growxlabs/grow-x/supabase_enterprise_hrms_schema.sql) | 315 | 11659 | -- Supabase PostgreSQL Enterprise HRMS Schema (Phase 4) | -- ENUMS DEFINITIONS (Safe creation) |
| `supabase_enterprise_pm_schema.sql` | [`supabase_enterprise_pm_schema.sql`](file:///c:/growxlabs/grow-x/supabase_enterprise_pm_schema.sql) | 452 | 14721 | -- Supabase PostgreSQL Enterprise Project Management Schema (Phase 2) | -- ENUMS DEFINITIONS |
| `supabase_marketing_schema.sql` | [`supabase_marketing_schema.sql`](file:///c:/growxlabs/grow-x/supabase_marketing_schema.sql) | 420 | 14057 | -- ============================================================================ | -- GROWXLABS ENTER |
| `supabase_outreach_patch.sql` | [`supabase_outreach_patch.sql`](file:///c:/growxlabs/grow-x/supabase_outreach_patch.sql) | 13 | 542 | -- RUN THIS IN SUPABASE SQL EDITOR TO FIX OUTREACH FEATURES | -- This adds the missing columns requi |
| `supabase_schema.sql` | [`supabase_schema.sql`](file:///c:/growxlabs/grow-x/supabase_schema.sql) | 104 | 3738 | -- 0. LEADS TABLE (CRM) | CREATE TABLE IF NOT EXISTS leads ( |
| `supabase_support_schema.sql` | [`supabase_support_schema.sql`](file:///c:/growxlabs/grow-x/supabase_support_schema.sql) | 425 | 14630 | -- ============================================================================ | -- GROWXLABS ENTER |
| `supabase_tracking_patch.sql` | [`supabase_tracking_patch.sql`](file:///c:/growxlabs/grow-x/supabase_tracking_patch.sql) | 16 | 692 | -- RUN THIS IN SUPABASE SQL EDITOR TO ADD TRACKING COLUMNS TO LEADS TABLE | -- This adds the columns |
| `supabase_wish_game_patch.sql` | [`supabase_wish_game_patch.sql`](file:///c:/growxlabs/grow-x/supabase_wish_game_patch.sql) | 33 | 1401 | -- ======================================================= | -- ONE WISH WILLOW - COMPLETE DATABASE  |

### Library / Helpers

| File Name | Path | Lines | Size (bytes) | Description / Header Preview |
| --- | --- | --- | --- | --- |
| `database.ts` | [`lib/actions/database.ts`](file:///c:/growxlabs/grow-x/lib/actions/database.ts) | 67 | 2130 | "use server"; | import { createClient } from "@/lib/supabase/server"; |
| `enrollment.ts` | [`lib/actions/enrollment.ts`](file:///c:/growxlabs/grow-x/lib/actions/enrollment.ts) | 55 | 1797 | "use server"; | import { getServerSession } from "next-auth"; |
| `api-response.ts` | [`lib/api/api-response.ts`](file:///c:/growxlabs/grow-x/lib/api/api-response.ts) | 79 | 1788 | import { NextResponse } from "next/server"; | export interface ApiResponseEnvelope<T> { |
| `rate-limiter.ts` | [`lib/api/rate-limiter.ts`](file:///c:/growxlabs/grow-x/lib/api/rate-limiter.ts) | 34 | 1010 | Token Bucket Rate Limiter | interface TokenBucket { |
| `auth.ts` | [`lib/auth.ts`](file:///c:/growxlabs/grow-x/lib/auth.ts) | 146 | 4475 | import { AuthOptions } from "next-auth"; | import CredentialsProvider from "next-auth/providers/cred |
| `cache-manager.ts` | [`lib/cache/cache-manager.ts`](file:///c:/growxlabs/grow-x/lib/cache/cache-manager.ts) | 35 | 879 | Distributed Cache Manager with In-Memory LRU & Redis Fallback | interface CacheItem<T> { |
| `env.ts` | [`lib/config/env.ts`](file:///c:/growxlabs/grow-x/lib/config/env.ts) | 36 | 1227 | import { config } from "dotenv"; | config({ path: ".env.local" }); |
| `java.ts` | [`lib/data/assessments/java.ts`](file:///c:/growxlabs/grow-x/lib/data/assessments/java.ts) | 476 | 21305 | import { Question } from "@/types/courses"; | export const javaAssessment: Question[] = [ |
| `nextjs.ts` | [`lib/data/assessments/nextjs.ts`](file:///c:/growxlabs/grow-x/lib/data/assessments/nextjs.ts) | 460 | 21387 | import { Question } from "@/types/courses"; | export const nextjsAssessment: Question[] = [ |
| `python.ts` | [`lib/data/assessments/python.ts`](file:///c:/growxlabs/grow-x/lib/data/assessments/python.ts) | 465 | 18774 | import { Question } from "@/types/courses"; | export const pythonAssessment: Question[] = [ |
| `courses.ts` | [`lib/data/courses.ts`](file:///c:/growxlabs/grow-x/lib/data/courses.ts) | 733 | 44588 | import { Course } from "@/types/courses"; | import { javaAssessment } from "./assessments/java"; |
| `projects.ts` | [`lib/data/projects.ts`](file:///c:/growxlabs/grow-x/lib/data/projects.ts) | 343 | 16780 | export interface CaseStudy { | slug: string; |
| `tests.ts` | [`lib/data/tests.ts`](file:///c:/growxlabs/grow-x/lib/data/tests.ts) | 10 | 383 | import { Question } from "@/types/courses"; | import { javaAssessment } from "./assessments/java"; |
| `database.types.ts` | [`lib/database.types.ts`](file:///c:/growxlabs/grow-x/lib/database.types.ts) | 0 | 0 |  |
| `design-system.ts` | [`lib/design-system.ts`](file:///c:/growxlabs/grow-x/lib/design-system.ts) | 60 | 3094 | GrowXLabs Enterprise Design System Tokens & Utility Classes | export const DESIGN_TOKENS = { |
| `hotel-context.tsx` | [`lib/hotel-context.tsx`](file:///c:/growxlabs/grow-x/lib/hotel-context.tsx) | 72 | 1985 | "use client"; | import React, { createContext, useContext, useState } from 'react'; |
| `hotel-data.ts` | [`lib/hotel-data.ts`](file:///c:/growxlabs/grow-x/lib/hotel-data.ts) | 44 | 1575 | import { Room } from './hotel-context'; | export const rooms: Room[] = [ |
| `currencies.ts` | [`lib/i18n/currencies.ts`](file:///c:/growxlabs/grow-x/lib/i18n/currencies.ts) | 18 | 461 | import { REGION_CONFIG } from "@/lib/region-config"; | export function getCurrency(locale: string) { |
| `certificate-mailer.ts` | [`lib/mail/certificate-mailer.ts`](file:///c:/growxlabs/grow-x/lib/mail/certificate-mailer.ts) | 54 | 2109 | import { Resend } from "resend"; | function getResendClient() { |
| `logger.ts` | [`lib/observability/logger.ts`](file:///c:/growxlabs/grow-x/lib/observability/logger.ts) | 53 | 1252 | Structured JSON Logger with PII Masking | export interface LogMeta { |
| `property-data.ts` | [`lib/property-data.ts`](file:///c:/growxlabs/grow-x/lib/property-data.ts) | 68 | 2109 | export interface Property { | id: string; |
| `queue-manager.ts` | [`lib/queues/queue-manager.ts`](file:///c:/growxlabs/grow-x/lib/queues/queue-manager.ts) | 67 | 1596 | import { Logger } from "../observability/logger"; | export type QueueName = |
| `region-config.ts` | [`lib/region-config.ts`](file:///c:/growxlabs/grow-x/lib/region-config.ts) | 36 | 1563 | export const REGION_CONFIG = { | "en-IN": { country: "India", city: "Hyderabad", currency: "INR" }, |
| `circuit-breaker.ts` | [`lib/reliability/circuit-breaker.ts`](file:///c:/growxlabs/grow-x/lib/reliability/circuit-breaker.ts) | 62 | 1798 | import { Logger } from "../observability/logger"; | export type CircuitState = "CLOSED" | "OPEN" | " |
| `base.repository.ts` | [`lib/repositories/base.repository.ts`](file:///c:/growxlabs/grow-x/lib/repositories/base.repository.ts) | 131 | 3231 | import { supabaseAdmin } from "@/lib/supabase/admin"; | export interface PaginationOptions { |
| `restaurant-context.tsx` | [`lib/restaurant-context.tsx`](file:///c:/growxlabs/grow-x/lib/restaurant-context.tsx) | 73 | 2058 | "use client"; | import React, { createContext, useContext, useState, useEffect } from 'react'; |
| `restaurant-data.ts` | [`lib/restaurant-data.ts`](file:///c:/growxlabs/grow-x/lib/restaurant-data.ts) | 76 | 2316 | import { MenuItem } from './restaurant-context'; | export const menuItems: MenuItem[] = [ |
| `certification.ts` | [`lib/services/certification.ts`](file:///c:/growxlabs/grow-x/lib/services/certification.ts) | 53 | 1344 | import { Certificate } from "@/types/courses"; | Certification System for GrowX Labs |
| `crm.service.ts` | [`lib/services/crm.service.ts`](file:///c:/growxlabs/grow-x/lib/services/crm.service.ts) | 54 | 1391 | import { BaseRepository } from "../repositories/base.repository"; | import { CacheManager } from ".. |
| `finance.service.ts` | [`lib/services/finance.service.ts`](file:///c:/growxlabs/grow-x/lib/services/finance.service.ts) | 50 | 1354 | import { BaseRepository } from "../repositories/base.repository"; | import { Logger } from "../obser |
| `pdf.service.tsx` | [`lib/services/pdf.service.tsx`](file:///c:/growxlabs/grow-x/lib/services/pdf.service.tsx) | 57 | 1748 | import { pdf } from '@react-pdf/renderer'; | import React from 'react'; |
| `razorpay.service.ts` | [`lib/services/razorpay.service.ts`](file:///c:/growxlabs/grow-x/lib/services/razorpay.service.ts) | 50 | 1460 | const Razorpay = require('razorpay'); | import crypto from 'crypto'; |
| `subdomains.ts` | [`lib/subdomains.ts`](file:///c:/growxlabs/grow-x/lib/subdomains.ts) | 79 | 2557 | Utility to construct absolute URLs for navigating between the main domain and subdomains. | This ens |
| `admin.ts` | [`lib/supabase/admin.ts`](file:///c:/growxlabs/grow-x/lib/supabase/admin.ts) | 9 | 392 | import { createClient } from "@supabase/supabase-js"; | import { config } from "dotenv"; |
| `client.ts` | [`lib/supabase/client.ts`](file:///c:/growxlabs/grow-x/lib/supabase/client.ts) | 8 | 214 | import { createBrowserClient } from "@supabase/ssr"; | export function createClient() { |
| `middleware.ts` | [`lib/supabase/middleware.ts`](file:///c:/growxlabs/grow-x/lib/supabase/middleware.ts) | 60 | 1460 | import { createServerClient, type CookieOptions } from "@supabase/ssr"; | import { NextResponse, typ |
| `add_more_fields_to_agreements.sql` | [`lib/supabase/migrations/add_more_fields_to_agreements.sql`](file:///c:/growxlabs/grow-x/lib/supabase/migrations/add_more_fields_to_agreements.sql) | 6 | 532 | A L T E R   T A B L E   a g r e e m e n t s   A D D   C O L U M N   I F   N O T   E X I S T S   a d  |
| `add_signatures_to_agreements.sql` | [`lib/supabase/migrations/add_signatures_to_agreements.sql`](file:///c:/growxlabs/grow-x/lib/supabase/migrations/add_signatures_to_agreements.sql) | 4 | 322 | ALTER TABLE agreements ADD COLUMN IF NOT EXISTS client_signature TEXT; | ALTER TABLE agreements ADD  |
| `admin_system.sql` | [`lib/supabase/migrations/admin_system.sql`](file:///c:/growxlabs/grow-x/lib/supabase/migrations/admin_system.sql) | 64 | 2549 | -- Extension for GrowX Labs Full LMS Control | -- Corrected for 'clients' table structure and auth.j |
| `create_admin_system.sql` | [`lib/supabase/migrations/create_admin_system.sql`](file:///c:/growxlabs/grow-x/lib/supabase/migrations/create_admin_system.sql) | 415 | 14482 | -- ============================================================================ | -- GROWXLABS ENTER |
| `create_ai_platform_system.sql` | [`lib/supabase/migrations/create_ai_platform_system.sql`](file:///c:/growxlabs/grow-x/lib/supabase/migrations/create_ai_platform_system.sql) | 297 | 10636 | -- ============================================================================ | -- GROWXLABS ENTER |
| `create_certificates_table.sql` | [`lib/supabase/migrations/create_certificates_table.sql`](file:///c:/growxlabs/grow-x/lib/supabase/migrations/create_certificates_table.sql) | 32 | 1045 | -- Drop existing table to ensure clean state (if no production data exists) | DROP TABLE IF EXISTS c |
| `create_exam_system.sql` | [`lib/supabase/migrations/create_exam_system.sql`](file:///c:/growxlabs/grow-x/lib/supabase/migrations/create_exam_system.sql) | 25 | 893 | -- Exam Attempts Tracking | CREATE TABLE IF NOT EXISTS exam_attempts ( |
| `create_marketing_system.sql` | [`lib/supabase/migrations/create_marketing_system.sql`](file:///c:/growxlabs/grow-x/lib/supabase/migrations/create_marketing_system.sql) | 415 | 13741 | -- 1. LEAD SOURCES | CREATE TABLE IF NOT EXISTS lead_sources ( |
| `create_onboarding_table.sql` | [`lib/supabase/migrations/create_onboarding_table.sql`](file:///c:/growxlabs/grow-x/lib/supabase/migrations/create_onboarding_table.sql) | 26 | 755 | CREATE TABLE IF NOT EXISTS onboarding_submissions ( | id UUID DEFAULT gen_random_uuid() PRIMARY KEY, |
| `create_support_system.sql` | [`lib/supabase/migrations/create_support_system.sql`](file:///c:/growxlabs/grow-x/lib/supabase/migrations/create_support_system.sql) | 425 | 14630 | -- ============================================================================ | -- GROWXLABS ENTER |
| `create_users_table.sql` | [`lib/supabase/migrations/create_users_table.sql`](file:///c:/growxlabs/grow-x/lib/supabase/migrations/create_users_table.sql) | 49 | 1662 | -- Create users table for database-only authentication | CREATE TABLE IF NOT EXISTS users ( |
| `initial_lms.sql` | [`lib/supabase/migrations/initial_lms.sql`](file:///c:/growxlabs/grow-x/lib/supabase/migrations/initial_lms.sql) | 82 | 3267 | -- GrowX Labs LMS Database Schema | -- Courses Table (Metadata) |
| `monetization_system.sql` | [`lib/supabase/migrations/monetization_system.sql`](file:///c:/growxlabs/grow-x/lib/supabase/migrations/monetization_system.sql) | 66 | 2709 | -- GrowX Labs Monetization System | -- Unified Checkout for Courses and Subscriptions |
| `optimizations.sql` | [`lib/supabase/optimizations.sql`](file:///c:/growxlabs/grow-x/lib/supabase/optimizations.sql) | 55 | 2668 | -- ============================================================================ | -- GROWXLABS ENTER |
| `server.ts` | [`lib/supabase/server.ts`](file:///c:/growxlabs/grow-x/lib/supabase/server.ts) | 36 | 1156 | import { createServerClient, type CookieOptions } from "@supabase/ssr"; | import { cookies } from "n |
| `PDFTemplates.tsx` | [`lib/templates/PDFTemplates.tsx`](file:///c:/growxlabs/grow-x/lib/templates/PDFTemplates.tsx) | 219 | 10941 | import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'; | Register a cle |
| `three.ts` | [`lib/three.ts`](file:///c:/growxlabs/grow-x/lib/three.ts) | 61 | 1591 | import * as THREE from 'three'; | Official NASA Earth Palette Constants |
| `utils.ts` | [`lib/utils.ts`](file:///c:/growxlabs/grow-x/lib/utils.ts) | 14 | 574 | import { ClassValue, clsx } from 'clsx'; | import { twMerge } from 'tailwind-merge'; |

### React Components

| File Name | Path | Lines | Size (bytes) | Description / Header Preview |
| --- | --- | --- | --- | --- |
| `ActivityTimeline.tsx` | [`components/admin/ActivityTimeline.tsx`](file:///c:/growxlabs/grow-x/components/admin/ActivityTimeline.tsx) | 99 | 4150 | "use client"; | import React from "react"; |
| `AdminNav.tsx` | [`components/admin/AdminNav.tsx`](file:///c:/growxlabs/grow-x/components/admin/AdminNav.tsx) | 806 | 34347 | "use client"; | import { useState, useEffect, useRef } from "react"; |
| `AgreementContract.tsx` | [`components/admin/AgreementContract.tsx`](file:///c:/growxlabs/grow-x/components/admin/AgreementContract.tsx) | 375 | 22550 | "use client"; | import React, { useState } from 'react'; |
| `AutomationBuilder.tsx` | [`components/admin/AutomationBuilder.tsx`](file:///c:/growxlabs/grow-x/components/admin/AutomationBuilder.tsx) | 263 | 10453 | "use client"; | import React, { useState } from "react"; |
| `CommandPalette.tsx` | [`components/admin/CommandPalette.tsx`](file:///c:/growxlabs/grow-x/components/admin/CommandPalette.tsx) | 116 | 5260 | "use client"; | import { useState, useEffect } from "react"; |
| `CouponManagementClient.tsx` | [`components/admin/CouponManagementClient.tsx`](file:///c:/growxlabs/grow-x/components/admin/CouponManagementClient.tsx) | 311 | 14278 | "use client"; | import { useState } from "react"; |
| `Customer360.tsx` | [`components/admin/Customer360.tsx`](file:///c:/growxlabs/grow-x/components/admin/Customer360.tsx) | 286 | 14955 | "use client"; | import React, { useState } from "react"; |
| `DataTable.tsx` | [`components/admin/DataTable.tsx`](file:///c:/growxlabs/grow-x/components/admin/DataTable.tsx) | 158 | 5276 | "use client"; | import { useState } from "react"; |
| `InvoiceTemplate.tsx` | [`components/admin/InvoiceTemplate.tsx`](file:///c:/growxlabs/grow-x/components/admin/InvoiceTemplate.tsx) | 310 | 16864 | "use client"; | import React, { useState } from 'react'; |
| `KanbanBoard.tsx` | [`components/admin/KanbanBoard.tsx`](file:///c:/growxlabs/grow-x/components/admin/KanbanBoard.tsx) | 150 | 6208 | "use client"; | import React, { useState } from "react"; |
| `NotificationCenter.tsx` | [`components/admin/NotificationCenter.tsx`](file:///c:/growxlabs/grow-x/components/admin/NotificationCenter.tsx) | 84 | 3561 | "use client"; | import { useState } from "react"; |
| `OnboardingPreview.tsx` | [`components/admin/OnboardingPreview.tsx`](file:///c:/growxlabs/grow-x/components/admin/OnboardingPreview.tsx) | 340 | 17398 | "use client"; | import React, { useState } from 'react'; |
| `PageHeader.tsx` | [`components/admin/PageHeader.tsx`](file:///c:/growxlabs/grow-x/components/admin/PageHeader.tsx) | 75 | 2854 | "use client"; | import { ReactNode } from "react"; |
| `QuoteGenerator.tsx` | [`components/admin/QuoteGenerator.tsx`](file:///c:/growxlabs/grow-x/components/admin/QuoteGenerator.tsx) | 308 | 12558 | "use client"; | import React, { useState } from "react"; |
| `FinanceDashboard.tsx` | [`components/admin/finance/FinanceDashboard.tsx`](file:///c:/growxlabs/grow-x/components/admin/finance/FinanceDashboard.tsx) | 122 | 6822 | "use client"; | import React from "react"; |
| `GeneralLedger.tsx` | [`components/admin/finance/GeneralLedger.tsx`](file:///c:/growxlabs/grow-x/components/admin/finance/GeneralLedger.tsx) | 245 | 11782 | "use client"; | import React, { useState } from "react"; |
| `InvoiceBuilder.tsx` | [`components/admin/finance/InvoiceBuilder.tsx`](file:///c:/growxlabs/grow-x/components/admin/finance/InvoiceBuilder.tsx) | 283 | 11420 | "use client"; | import React, { useState } from "react"; |
| `AttendanceTracker.tsx` | [`components/admin/hrms/AttendanceTracker.tsx`](file:///c:/growxlabs/grow-x/components/admin/hrms/AttendanceTracker.tsx) | 130 | 6178 | "use client"; | import React, { useState, useEffect } from "react"; |
| `HrmsDashboard.tsx` | [`components/admin/hrms/HrmsDashboard.tsx`](file:///c:/growxlabs/grow-x/components/admin/hrms/HrmsDashboard.tsx) | 156 | 8917 | "use client"; | import React from "react"; |
| `PayrollSlipBuilder.tsx` | [`components/admin/hrms/PayrollSlipBuilder.tsx`](file:///c:/growxlabs/grow-x/components/admin/hrms/PayrollSlipBuilder.tsx) | 136 | 8572 | "use client"; | import React, { useState } from "react"; |
| `RecruitmentPipeline.tsx` | [`components/admin/hrms/RecruitmentPipeline.tsx`](file:///c:/growxlabs/grow-x/components/admin/hrms/RecruitmentPipeline.tsx) | 84 | 3872 | "use client"; | import React from "react"; |
| `AgileKanban.tsx` | [`components/admin/pm/AgileKanban.tsx`](file:///c:/growxlabs/grow-x/components/admin/pm/AgileKanban.tsx) | 143 | 6419 | "use client"; | import React, { useState } from "react"; |
| `SprintManager.tsx` | [`components/admin/pm/SprintManager.tsx`](file:///c:/growxlabs/grow-x/components/admin/pm/SprintManager.tsx) | 149 | 7188 | "use client"; | import React, { useState } from "react"; |
| `TimeTracker.tsx` | [`components/admin/pm/TimeTracker.tsx`](file:///c:/growxlabs/grow-x/components/admin/pm/TimeTracker.tsx) | 228 | 8462 | "use client"; | import React, { useState, useEffect } from "react"; |
| `WorkloadBalancer.tsx` | [`components/admin/pm/WorkloadBalancer.tsx`](file:///c:/growxlabs/grow-x/components/admin/pm/WorkloadBalancer.tsx) | 102 | 4755 | "use client"; | import React from "react"; |
| `CertificateClient.tsx` | [`components/certificate/CertificateClient.tsx`](file:///c:/growxlabs/grow-x/components/certificate/CertificateClient.tsx) | 239 | 11420 | "use client"; | import Image from "next/image"; |
| `ClientNav.tsx` | [`components/client/ClientNav.tsx`](file:///c:/growxlabs/grow-x/components/client/ClientNav.tsx) | 72 | 3002 | "use client"; | import { Link, usePathname } from "@/navigation-client"; |
| `CheckoutModal.tsx` | [`components/courses/CheckoutModal.tsx`](file:///c:/growxlabs/grow-x/components/courses/CheckoutModal.tsx) | 157 | 6247 | "use client"; | import { motion } from "framer-motion"; |
| `SharedDemoUI.tsx` | [`components/demos/SharedDemoUI.tsx`](file:///c:/growxlabs/grow-x/components/demos/SharedDemoUI.tsx) | 201 | 7448 | "use client"; | import { MessageCircle, Menu, X, Sparkles } from "lucide-react"; |
| `Atmosphere.tsx` | [`components/earth/Atmosphere.tsx`](file:///c:/growxlabs/grow-x/components/earth/Atmosphere.tsx) | 39 | 1097 | 'use client'; | import React, { useMemo } from 'react'; |
| `Clouds.tsx` | [`components/earth/Clouds.tsx`](file:///c:/growxlabs/grow-x/components/earth/Clouds.tsx) | 43 | 1066 | 'use client'; | import React, { useLayoutEffect } from 'react'; |
| `Earth.tsx` | [`components/earth/Earth.tsx`](file:///c:/growxlabs/grow-x/components/earth/Earth.tsx) | 63 | 1651 | 'use client'; | import React, { useState, useEffect } from 'react'; |
| `NightLights.tsx` | [`components/earth/NightLights.tsx`](file:///c:/growxlabs/grow-x/components/earth/NightLights.tsx) | 38 | 967 | 'use client'; | import React, { useLayoutEffect } from 'react'; |
| `OrbitRings.tsx` | [`components/earth/OrbitRings.tsx`](file:///c:/growxlabs/grow-x/components/earth/OrbitRings.tsx) | 37 | 1012 | 'use client'; | import React from 'react'; |
| `Particles.tsx` | [`components/earth/Particles.tsx`](file:///c:/growxlabs/grow-x/components/earth/Particles.tsx) | 74 | 1965 | 'use client'; | import React, { useMemo, useRef } from 'react'; |
| `README.md` | [`components/earth/README.md`](file:///c:/growxlabs/grow-x/components/earth/README.md) | 81 | 3523 | Production-Grade 3D Interactive Earth Hero Section | A GPU-accelerated, highly realistic interactive |
| `Scene.tsx` | [`components/earth/Scene.tsx`](file:///c:/growxlabs/grow-x/components/earth/Scene.tsx) | 52 | 1397 | 'use client'; | import React, { Suspense, useRef } from 'react'; |
| `ShootingStars.tsx` | [`components/earth/ShootingStars.tsx`](file:///c:/growxlabs/grow-x/components/earth/ShootingStars.tsx) | 82 | 2430 | 'use client'; | import React, { useRef, useState, useMemo } from 'react'; |
| `Stars.tsx` | [`components/earth/Stars.tsx`](file:///c:/growxlabs/grow-x/components/earth/Stars.tsx) | 222 | 6446 | 'use client'; | import React, { useRef, useMemo } from 'react'; |
| `Footer.tsx` | [`components/hotel/Footer.tsx`](file:///c:/growxlabs/grow-x/components/hotel/Footer.tsx) | 57 | 3313 | "use client"; | import { Link } from "@/navigation"; |
| `LandingPage.tsx` | [`components/hotel/LandingPage.tsx`](file:///c:/growxlabs/grow-x/components/hotel/LandingPage.tsx) | 183 | 9815 | "use client"; | import React from 'react'; |
| `Navbar.tsx` | [`components/hotel/Navbar.tsx`](file:///c:/growxlabs/grow-x/components/hotel/Navbar.tsx) | 106 | 4110 | "use client"; | import React, { useState, useEffect } from 'react'; |
| `ConditionalLayout.tsx` | [`components/layout/ConditionalLayout.tsx`](file:///c:/growxlabs/grow-x/components/layout/ConditionalLayout.tsx) | 76 | 2461 | "use client"; | import { usePathname } from "next/navigation"; |
| `CookieConsent.tsx` | [`components/layout/CookieConsent.tsx`](file:///c:/growxlabs/grow-x/components/layout/CookieConsent.tsx) | 230 | 10366 | "use client"; | import { useState, useEffect } from "react"; |
| `Footer.tsx` | [`components/layout/Footer.tsx`](file:///c:/growxlabs/grow-x/components/layout/Footer.tsx) | 159 | 7272 | "use client"; | import { Mail } from "lucide-react"; |
| `GlobalBackground.tsx` | [`components/layout/GlobalBackground.tsx`](file:///c:/growxlabs/grow-x/components/layout/GlobalBackground.tsx) | 50 | 1500 | "use client"; | import React from "react"; |
| `LocaleRedirect.tsx` | [`components/layout/LocaleRedirect.tsx`](file:///c:/growxlabs/grow-x/components/layout/LocaleRedirect.tsx) | 49 | 1735 | "use client"; | import { useEffect } from "react"; |
| `Navbar.tsx` | [`components/layout/Navbar.tsx`](file:///c:/growxlabs/grow-x/components/layout/Navbar.tsx) | 312 | 13119 | "use client"; | import { useState, useEffect } from "react"; |
| `AEOBlock.tsx` | [`components/marketing/AEOBlock.tsx`](file:///c:/growxlabs/grow-x/components/marketing/AEOBlock.tsx) | 85 | 3252 | import React from "react"; | import { Link } from "@/navigation"; |
| `AccordionFAQ.tsx` | [`components/marketing/AccordionFAQ.tsx`](file:///c:/growxlabs/grow-x/components/marketing/AccordionFAQ.tsx) | 96 | 3104 | "use client"; | import { useState } from "react"; |
| `AnimatedSection.tsx` | [`components/marketing/AnimatedSection.tsx`](file:///c:/growxlabs/grow-x/components/marketing/AnimatedSection.tsx) | 49 | 1009 | "use client"; | import { ReactNode } from "react"; |
| `AstroChatCTA.tsx` | [`components/marketing/AstroChatCTA.tsx`](file:///c:/growxlabs/grow-x/components/marketing/AstroChatCTA.tsx) | 67 | 3137 | "use client"; | import React, { useState } from "react"; |
| `BlogEditorial.tsx` | [`components/marketing/BlogEditorial.tsx`](file:///c:/growxlabs/grow-x/components/marketing/BlogEditorial.tsx) | 513 | 23072 | "use client"; | import React, { useState } from "react"; |
| `BlogInteractive.tsx` | [`components/marketing/BlogInteractive.tsx`](file:///c:/growxlabs/grow-x/components/marketing/BlogInteractive.tsx) | 176 | 5962 | "use client"; | import React, { useState, useEffect } from "react"; |
| `BlogInteractiveList.tsx` | [`components/marketing/BlogInteractiveList.tsx`](file:///c:/growxlabs/grow-x/components/marketing/BlogInteractiveList.tsx) | 453 | 22301 | "use client"; | import React, { useState } from "react"; |
| `BookingScheduler.tsx` | [`components/marketing/BookingScheduler.tsx`](file:///c:/growxlabs/grow-x/components/marketing/BookingScheduler.tsx) | 445 | 18772 | "use client"; | import React, { useState, useEffect } from "react"; |
| `CertificatePreview.tsx` | [`components/marketing/CertificatePreview.tsx`](file:///c:/growxlabs/grow-x/components/marketing/CertificatePreview.tsx) | 96 | 4763 | "use client"; | import { motion } from "framer-motion"; |
| `DynamicSchema.tsx` | [`components/marketing/DynamicSchema.tsx`](file:///c:/growxlabs/grow-x/components/marketing/DynamicSchema.tsx) | 23 | 475 | import React from "react"; | interface SchemaProps { |
| `FlickerText.tsx` | [`components/marketing/FlickerText.tsx`](file:///c:/growxlabs/grow-x/components/marketing/FlickerText.tsx) | 54 | 1285 | "use client"; | import React from "react"; |
| `GPT56MatrixBanner.tsx` | [`components/marketing/GPT56MatrixBanner.tsx`](file:///c:/growxlabs/grow-x/components/marketing/GPT56MatrixBanner.tsx) | 276 | 9158 | 'use client'; | import React, { useEffect, useRef } from 'react'; |
| `HeroSection.tsx` | [`components/marketing/HeroSection.tsx`](file:///c:/growxlabs/grow-x/components/marketing/HeroSection.tsx) | 148 | 5876 | "use client"; | import { FlickerText } from "@/components/marketing/FlickerText"; |
| `HotlineConsole.tsx` | [`components/marketing/HotlineConsole.tsx`](file:///c:/growxlabs/grow-x/components/marketing/HotlineConsole.tsx) | 429 | 18623 | "use client"; | import { useState, useEffect, useRef } from "react"; |
| `InteractiveAiCodingEngine.tsx` | [`components/marketing/InteractiveAiCodingEngine.tsx`](file:///c:/growxlabs/grow-x/components/marketing/InteractiveAiCodingEngine.tsx) | 431 | 21175 | "use client"; | import React, { useState, useEffect } from "react"; |
| `InteractiveClaudeOpus.tsx` | [`components/marketing/InteractiveClaudeOpus.tsx`](file:///c:/growxlabs/grow-x/components/marketing/InteractiveClaudeOpus.tsx) | 996 | 39960 | "use client"; | import React, { useState, useEffect, useRef, useCallback } from "react"; |
| `InteractiveFerrariLuce.tsx` | [`components/marketing/InteractiveFerrariLuce.tsx`](file:///c:/growxlabs/grow-x/components/marketing/InteractiveFerrariLuce.tsx) | 1141 | 54795 | "use client"; | import React, { useState } from "react"; |
| `InteractiveIOArchitecture.tsx` | [`components/marketing/InteractiveIOArchitecture.tsx`](file:///c:/growxlabs/grow-x/components/marketing/InteractiveIOArchitecture.tsx) | 794 | 37584 | "use client"; | import React, { useState, useEffect } from "react"; |
| `InteractiveModelComparison.tsx` | [`components/marketing/InteractiveModelComparison.tsx`](file:///c:/growxlabs/grow-x/components/marketing/InteractiveModelComparison.tsx) | 514 | 26468 | "use client"; | import React, { useState, useEffect } from "react"; |
| `InteractiveRestaurantRetention.tsx` | [`components/marketing/InteractiveRestaurantRetention.tsx`](file:///c:/growxlabs/grow-x/components/marketing/InteractiveRestaurantRetention.tsx) | 548 | 27855 | "use client"; | import React, { useState, useEffect } from "react"; |
| `InteractiveRestaurantWebsite.tsx` | [`components/marketing/InteractiveRestaurantWebsite.tsx`](file:///c:/growxlabs/grow-x/components/marketing/InteractiveRestaurantWebsite.tsx) | 529 | 26821 | "use client"; | import React, { useState, useEffect } from "react"; |
| `InteractiveSearchEvolution.tsx` | [`components/marketing/InteractiveSearchEvolution.tsx`](file:///c:/growxlabs/grow-x/components/marketing/InteractiveSearchEvolution.tsx) | 622 | 27081 | "use client"; | import React, { useState, useEffect } from "react"; |
| `InteractiveWhatsappNurture.tsx` | [`components/marketing/InteractiveWhatsappNurture.tsx`](file:///c:/growxlabs/grow-x/components/marketing/InteractiveWhatsappNurture.tsx) | 667 | 35504 | "use client"; | import React, { useState, useEffect } from "react"; |
| `InteractiveWorkflowEngine.tsx` | [`components/marketing/InteractiveWorkflowEngine.tsx`](file:///c:/growxlabs/grow-x/components/marketing/InteractiveWorkflowEngine.tsx) | 984 | 43165 | "use client"; | import React, { useState, useEffect } from "react"; |
| `LeadEngineSection.tsx` | [`components/marketing/LeadEngineSection.tsx`](file:///c:/growxlabs/grow-x/components/marketing/LeadEngineSection.tsx) | 421 | 16048 | "use client"; | import { Link } from "@/navigation"; |
| `PageHero.tsx` | [`components/marketing/PageHero.tsx`](file:///c:/growxlabs/grow-x/components/marketing/PageHero.tsx) | 151 | 6261 | "use client"; | import { motion } from "framer-motion"; |
| `PipelineSection.tsx` | [`components/marketing/PipelineSection.tsx`](file:///c:/growxlabs/grow-x/components/marketing/PipelineSection.tsx) | 188 | 7933 | "use client"; | import { motion } from "framer-motion"; |
| `Reveal.tsx` | [`components/marketing/Reveal.tsx`](file:///c:/growxlabs/grow-x/components/marketing/Reveal.tsx) | 19 | 354 | "use client"; | import React from "react"; |
| `SectionG.tsx` | [`components/marketing/SectionG.tsx`](file:///c:/growxlabs/grow-x/components/marketing/SectionG.tsx) | 36 | 1758 | "use client"; | import { AnimatedSection } from "@/components/marketing/AnimatedSection"; |
| `SectionO.tsx` | [`components/marketing/SectionO.tsx`](file:///c:/growxlabs/grow-x/components/marketing/SectionO.tsx) | 44 | 2080 | "use client"; | import { AnimatedSection } from "@/components/marketing/AnimatedSection"; |
| `SectionR.tsx` | [`components/marketing/SectionR.tsx`](file:///c:/growxlabs/grow-x/components/marketing/SectionR.tsx) | 44 | 2109 | "use client"; | import { AnimatedSection } from "@/components/marketing/AnimatedSection"; |
| `SectionW.tsx` | [`components/marketing/SectionW.tsx`](file:///c:/growxlabs/grow-x/components/marketing/SectionW.tsx) | 44 | 2093 | "use client"; | import { AnimatedSection } from "@/components/marketing/AnimatedSection"; |
| `SectionX.tsx` | [`components/marketing/SectionX.tsx`](file:///c:/growxlabs/grow-x/components/marketing/SectionX.tsx) | 45 | 2187 | "use client"; | import { AnimatedSection } from "@/components/marketing/AnimatedSection"; |
| `SubscriptionPlansSection.tsx` | [`components/marketing/SubscriptionPlansSection.tsx`](file:///c:/growxlabs/grow-x/components/marketing/SubscriptionPlansSection.tsx) | 175 | 7747 | import { Check } from "lucide-react"; | import { Link } from "@/navigation"; |
| `ValuePropositions.tsx` | [`components/marketing/ValuePropositions.tsx`](file:///c:/growxlabs/grow-x/components/marketing/ValuePropositions.tsx) | 46 | 1337 | "use client"; | const VALUES = [ |
| `OnboardingFlow.tsx` | [`components/onboarding/OnboardingFlow.tsx`](file:///c:/growxlabs/grow-x/components/onboarding/OnboardingFlow.tsx) | 408 | 19492 | "use client"; | import React, { useState, useRef } from 'react'; |
| `AuthProvider.tsx` | [`components/providers/AuthProvider.tsx`](file:///c:/growxlabs/grow-x/components/providers/AuthProvider.tsx) | 7 | 201 | "use client"; | import { SessionProvider } from "next-auth/react"; |
| `LanguageProvider.tsx` | [`components/providers/LanguageProvider.tsx`](file:///c:/growxlabs/grow-x/components/providers/LanguageProvider.tsx) | 115 | 3457 | "use client"; | import React, { createContext, useContext, useState, useEffect, ReactNode } from "re |
| `PostHogPageView.tsx` | [`components/providers/PostHogPageView.tsx`](file:///c:/growxlabs/grow-x/components/providers/PostHogPageView.tsx) | 28 | 698 | 'use client' | import { usePathname, useSearchParams } from "next/navigation" |
| `PostHogProvider.tsx` | [`components/providers/PostHogProvider.tsx`](file:///c:/growxlabs/grow-x/components/providers/PostHogProvider.tsx) | 30 | 791 | 'use client' | import posthog from 'posthog-js' |
| `ThemeProvider.tsx` | [`components/providers/ThemeProvider.tsx`](file:///c:/growxlabs/grow-x/components/providers/ThemeProvider.tsx) | 19 | 506 | 'use client'; | import * as React from 'react'; |
| `Footer.tsx` | [`components/realestate/Footer.tsx`](file:///c:/growxlabs/grow-x/components/realestate/Footer.tsx) | 57 | 3368 | "use client"; | import { Link } from "@/navigation"; |
| `LandingPage.tsx` | [`components/realestate/LandingPage.tsx`](file:///c:/growxlabs/grow-x/components/realestate/LandingPage.tsx) | 201 | 11691 | "use client"; | import React from 'react'; |
| `Navbar.tsx` | [`components/realestate/Navbar.tsx`](file:///c:/growxlabs/grow-x/components/realestate/Navbar.tsx) | 97 | 3396 | "use client"; | import React, { useState, useEffect } from 'react'; |
| `Footer.tsx` | [`components/restaurant/Footer.tsx`](file:///c:/growxlabs/grow-x/components/restaurant/Footer.tsx) | 58 | 3361 | "use client"; | import { Link } from "@/navigation"; |
| `LandingPage.tsx` | [`components/restaurant/LandingPage.tsx`](file:///c:/growxlabs/grow-x/components/restaurant/LandingPage.tsx) | 179 | 9700 | "use client"; | import React from 'react'; |
| `Navbar.tsx` | [`components/restaurant/Navbar.tsx`](file:///c:/growxlabs/grow-x/components/restaurant/Navbar.tsx) | 102 | 3693 | "use client"; | import React, { useState, useEffect } from 'react'; |
| `CarouselGeneratorClient.tsx` | [`components/shared/CarouselGeneratorClient.tsx`](file:///c:/growxlabs/grow-x/components/shared/CarouselGeneratorClient.tsx) | 3616 | 188549 | "use client"; | import React, { useState, useEffect, useRef } from "react"; |
| `EditorialCarouselClient.tsx` | [`components/shared/EditorialCarouselClient.tsx`](file:///c:/growxlabs/grow-x/components/shared/EditorialCarouselClient.tsx) | 3142 | 135282 | "use client"; | import React, { useState, useEffect, useRef } from "react"; |
| `ReelsGeneratorClient.tsx` | [`components/shared/ReelsGeneratorClient.tsx`](file:///c:/growxlabs/grow-x/components/shared/ReelsGeneratorClient.tsx) | 1531 | 61786 | "use client"; | import React, { useState, useEffect, useRef } from "react"; |
| `SignaturePad.tsx` | [`components/shared/SignaturePad.tsx`](file:///c:/growxlabs/grow-x/components/shared/SignaturePad.tsx) | 206 | 8389 | "use client"; | import React, { useRef, useState, useEffect } from 'react'; |
| `WhatsAppWidget.tsx` | [`components/shared/WhatsAppWidget.tsx`](file:///c:/growxlabs/grow-x/components/shared/WhatsAppWidget.tsx) | 107 | 4805 | 'use client'; | import React, { useState, useEffect } from 'react'; |
| `Button.tsx` | [`components/ui/Button.tsx`](file:///c:/growxlabs/grow-x/components/ui/Button.tsx) | 58 | 2227 | import * as React from "react"; | import { cva, type VariantProps } from "class-variance-authority"; |
| `Card.tsx` | [`components/ui/Card.tsx`](file:///c:/growxlabs/grow-x/components/ui/Card.tsx) | 75 | 2073 | import * as React from "react"; | import { cn } from "@/lib/utils"; |
| `ChatAssistant.tsx` | [`components/ui/ChatAssistant.tsx`](file:///c:/growxlabs/grow-x/components/ui/ChatAssistant.tsx) | 178 | 7670 | "use client"; | import { useState, useRef, useEffect } from "react"; |
| `GrowXChatWidget.tsx` | [`components/ui/GrowXChatWidget.tsx`](file:///c:/growxlabs/grow-x/components/ui/GrowXChatWidget.tsx) | 280 | 11092 | "use client"; | import { useState, useRef, useEffect } from "react"; |
| `Input.tsx` | [`components/ui/Input.tsx`](file:///c:/growxlabs/grow-x/components/ui/Input.tsx) | 24 | 838 | import * as React from "react"; | import { cn } from "@/lib/utils"; |
| `LanguageSwitcher.tsx` | [`components/ui/LanguageSwitcher.tsx`](file:///c:/growxlabs/grow-x/components/ui/LanguageSwitcher.tsx) | 110 | 4239 | "use client"; | import React, { useState } from "react"; |
| `ProjectCard.tsx` | [`components/ui/ProjectCard.tsx`](file:///c:/growxlabs/grow-x/components/ui/ProjectCard.tsx) | 86 | 3665 | import { ExternalLink } from "lucide-react"; | import { CaseStudy } from "@/lib/data/projects"; |
| `ServiceCard.tsx` | [`components/ui/ServiceCard.tsx`](file:///c:/growxlabs/grow-x/components/ui/ServiceCard.tsx) | 50 | 1559 | import { | Code, |
| `Textarea.tsx` | [`components/ui/Textarea.tsx`](file:///c:/growxlabs/grow-x/components/ui/Textarea.tsx) | 24 | 810 | "use client"; | import * as React from "react"; |
| `agent-plan.tsx` | [`components/ui/agent-plan.tsx`](file:///c:/growxlabs/grow-x/components/ui/agent-plan.tsx) | 718 | 27218 | "use client"; | import React, { useState } from "react"; |
| `animated-ai-chat.tsx` | [`components/ui/animated-ai-chat.tsx`](file:///c:/growxlabs/grow-x/components/ui/animated-ai-chat.tsx) | 667 | 28432 | "use client"; | import { useEffect, useRef, useCallback, useTransition } from "react"; |
| `chat-input.tsx` | [`components/ui/chat-input.tsx`](file:///c:/growxlabs/grow-x/components/ui/chat-input.tsx) | 200 | 4681 | "use client"; | import { Button } from "@/components/ui/Button"; |
| `demo.tsx` | [`components/ui/demo.tsx`](file:///c:/growxlabs/grow-x/components/ui/demo.tsx) | 22 | 679 | import { Feature1 } from "@/components/ui/feature-1"; | const DemoOne = () => { |
| `dotted-surface.tsx` | [`components/ui/dotted-surface.tsx`](file:///c:/growxlabs/grow-x/components/ui/dotted-surface.tsx) | 200 | 5196 | 'use client'; | import { cn } from '@/lib/utils'; |
| `feature-1.tsx` | [`components/ui/feature-1.tsx`](file:///c:/growxlabs/grow-x/components/ui/feature-1.tsx) | 168 | 6071 | "use client"; | import { useState } from "react"; |
| `particle-wave.tsx` | [`components/ui/particle-wave.tsx`](file:///c:/growxlabs/grow-x/components/ui/particle-wave.tsx) | 239 | 7346 | import React, { useRef, useEffect, useState } from 'react'; | import * as THREE from 'three'; |
| `tunnel-hero.tsx` | [`components/ui/tunnel-hero.tsx`](file:///c:/growxlabs/grow-x/components/ui/tunnel-hero.tsx) | 220 | 6873 | "use client"; | import * as THREE from "three"; |

### React Hooks

| File Name | Path | Lines | Size (bytes) | Description / Header Preview |
| --- | --- | --- | --- | --- |
| `use-textarea-resize.ts` | [`hooks/use-textarea-resize.ts`](file:///c:/growxlabs/grow-x/hooks/use-textarea-resize.ts) | 37 | 1154 | "use client"; | import { useLayoutEffect, useRef } from "react"; |
| `useEarthRotation.ts` | [`hooks/useEarthRotation.ts`](file:///c:/growxlabs/grow-x/hooks/useEarthRotation.ts) | 77 | 2327 | import { useRef, useState, useCallback } from 'react'; | import { useFrame } from '@react-three/fibe |

### Root Configuration

| File Name | Path | Lines | Size (bytes) | Description / Header Preview |
| --- | --- | --- | --- | --- |
| `.env.example` | [`.env.example`](file:///c:/growxlabs/grow-x/.env.example) | 40 | 1260 |  |
| `.env.local` | [`.env.local`](file:///c:/growxlabs/grow-x/.env.local) | 57 | 4168 |  |
| `.env.production` | [`.env.production`](file:///c:/growxlabs/grow-x/.env.production) | 22 | 1024 |  |
| `.gitignore` | [`.gitignore`](file:///c:/growxlabs/grow-x/.gitignore) | 51 | 620 |  |
| `AGENTS.md` | [`AGENTS.md`](file:///c:/growxlabs/grow-x/AGENTS.md) | 5 | 327 | <!-- BEGIN:nextjs-agent-rules --> | This is NOT the Next.js you know |
| `AI_Engineering_Course_Complete.txt` | [`AI_Engineering_Course_Complete.txt`](file:///c:/growxlabs/grow-x/AI_Engineering_Course_Complete.txt) | 2036 | 64061 |  |
| `CLAUDE.md` | [`CLAUDE.md`](file:///c:/growxlabs/grow-x/CLAUDE.md) | 1 | 11 | @AGENTS.md |
| `DESIGN-notion.md` | [`DESIGN-notion.md`](file:///c:/growxlabs/grow-x/DESIGN-notion.md) | 498 | 26889 | --- | version: alpha |
| `README.md` | [`README.md`](file:///c:/growxlabs/grow-x/README.md) | 39 | 1476 | This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs |
| `architecture_report.md` | [`architecture_report.md`](file:///c:/growxlabs/grow-x/architecture_report.md) | 151 | 8996 | Grow-X Core Codebase: Architecture & File Tree Report | This report provides a detailed breakdown of |
| `eslint.config.mjs` | [`eslint.config.mjs`](file:///c:/growxlabs/grow-x/eslint.config.mjs) | 18 | 465 |  |
| `middleware.ts` | [`middleware.ts`](file:///c:/growxlabs/grow-x/middleware.ts) | 67 | 3407 | import { NextResponse } from "next/server"; | import type { NextRequest } from "next/server"; |
| `navigation-client.ts` | [`navigation-client.ts`](file:///c:/growxlabs/grow-x/navigation-client.ts) | 27 | 900 | "use client"; | import { usePathname as useNextPathname, useRouter as useNextRouter } from "next/nav |
| `navigation.ts` | [`navigation.ts`](file:///c:/growxlabs/grow-x/navigation.ts) | 21 | 776 | import React from 'react'; | import NextLink, { LinkProps as NextLinkProps } from 'next/link'; |
| `next-env.d.ts` | [`next-env.d.ts`](file:///c:/growxlabs/grow-x/next-env.d.ts) | 6 | 247 | <reference types="next" /> | <reference types="next/image-types/global" /> |
| `next.config.ts` | [`next.config.ts`](file:///c:/growxlabs/grow-x/next.config.ts) | 98 | 2391 | import type { NextConfig } from "next"; | const nextConfig: NextConfig = { |
| `package.json` | [`package.json`](file:///c:/growxlabs/grow-x/package.json) | 63 | 1746 | { | "name": "grow-x", |
| `postcss.config.mjs` | [`postcss.config.mjs`](file:///c:/growxlabs/grow-x/postcss.config.mjs) | 7 | 94 |  |
| `public - Shortcut.lnk` | [`public - Shortcut.lnk`](file:///c:/growxlabs/grow-x/public - Shortcut.lnk) | 3 | 979 |  |
| `admin_sales_strategy.html` | [`public/admin_sales_strategy.html`](file:///c:/growxlabs/grow-x/public/admin_sales_strategy.html) | 199 | 7631 |  |
| `java.jpg` | [`public/courses/java.jpg`](file:///c:/growxlabs/grow-x/public/courses/java.jpg) | 3858 | 637540 |  |
| `nextjs.jpg` | [`public/courses/nextjs.jpg`](file:///c:/growxlabs/grow-x/public/courses/nextjs.jpg) | 5437 | 696444 |  |
| `python.jpg` | [`public/courses/python.jpg`](file:///c:/growxlabs/grow-x/public/courses/python.jpg) | 5579 | 883613 |  |
| `favicon-logo.png` | [`public/favicon-logo.png`](file:///c:/growxlabs/grow-x/public/favicon-logo.png) | 1839 | 456019 |  |
| `file.svg` | [`public/file.svg`](file:///c:/growxlabs/grow-x/public/file.svg) | 1 | 391 |  |
| `globe.svg` | [`public/globe.svg`](file:///c:/growxlabs/grow-x/public/globe.svg) | 1 | 1035 |  |
| `agents_blog_woodcut_1780853593579.png` | [`public/images/agents_blog_woodcut_1780853593579.png`](file:///c:/growxlabs/grow-x/public/images/agents_blog_woodcut_1780853593579.png) | 8974 | 1336632 |  |
| `ai_agents_taking_over_1780320659846.png` | [`public/images/ai_agents_taking_over_1780320659846.png`](file:///c:/growxlabs/grow-x/public/images/ai_agents_taking_over_1780320659846.png) | 6683 | 883630 |  |
| `ai_native_ecosystem_1779889616149.png` | [`public/images/ai_native_ecosystem_1779889616149.png`](file:///c:/growxlabs/grow-x/public/images/ai_native_ecosystem_1779889616149.png) | 4201 | 725661 |  |
| `anthropic_openai_woodcut_1780853674501.png` | [`public/images/anthropic_openai_woodcut_1780853674501.png`](file:///c:/growxlabs/grow-x/public/images/anthropic_openai_woodcut_1780853674501.png) | 8257 | 1330617 |  |
| `astronaut.jpg` | [`public/images/astronaut.jpg`](file:///c:/growxlabs/grow-x/public/images/astronaut.jpg) | 2787 | 410857 |  |
| `blog-applied-intuition-dana.jpg` | [`public/images/blog-applied-intuition-dana.jpg`](file:///c:/growxlabs/grow-x/public/images/blog-applied-intuition-dana.jpg) | 7573 | 1255616 |  |
| `blog-claude-fable-5-mythos-5-banned.png` | [`public/images/blog-claude-fable-5-mythos-5-banned.png`](file:///c:/growxlabs/grow-x/public/images/blog-claude-fable-5-mythos-5-banned.png) | 6348 | 893029 |  |
| `blog-claude-fable-5-mythos-5.png` | [`public/images/blog-claude-fable-5-mythos-5.png`](file:///c:/growxlabs/grow-x/public/images/blog-claude-fable-5-mythos-5.png) | 4442 | 623540 |  |
| `blog-claude-opus-4-8.png` | [`public/images/blog-claude-opus-4-8.png`](file:///c:/growxlabs/grow-x/public/images/blog-claude-opus-4-8.png) | 7506 | 1207233 |  |
| `blog-elon-trillionaire.png` | [`public/images/blog-elon-trillionaire.png`](file:///c:/growxlabs/grow-x/public/images/blog-elon-trillionaire.png) | 8928 | 1422821 |  |
| `blog-ferrari-luce.png` | [`public/images/blog-ferrari-luce.png`](file:///c:/growxlabs/grow-x/public/images/blog-ferrari-luce.png) | 8350 | 1313462 |  |
| `blog-google-io-2026.png` | [`public/images/blog-google-io-2026.png`](file:///c:/growxlabs/grow-x/public/images/blog-google-io-2026.png) | 8912 | 1380575 |  |
| `blog-gpt56-preview.png` | [`public/images/blog-gpt56-preview.png`](file:///c:/growxlabs/grow-x/public/images/blog-gpt56-preview.png) | 5918 | 946055 |  |
| `blog-kimi-k3-woodcut.png` | [`public/images/blog-kimi-k3-woodcut.png`](file:///c:/growxlabs/grow-x/public/images/blog-kimi-k3-woodcut.png) | 8061 | 1288161 |  |
| `blog-n8n-automation.png` | [`public/images/blog-n8n-automation.png`](file:///c:/growxlabs/grow-x/public/images/blog-n8n-automation.png) | 8507 | 1308394 |  |
| `blog-openai-huggingface-incident.png` | [`public/images/blog-openai-huggingface-incident.png`](file:///c:/growxlabs/grow-x/public/images/blog-openai-huggingface-incident.png) | 942 | 142036 |  |
| `blog-openai-huggingface-trajectories.png` | [`public/images/blog-openai-huggingface-trajectories.png`](file:///c:/growxlabs/grow-x/public/images/blog-openai-huggingface-trajectories.png) | 2786 | 405513 |  |
| `blog-restaurant-retention.png` | [`public/images/blog-restaurant-retention.png`](file:///c:/growxlabs/grow-x/public/images/blog-restaurant-retention.png) | 8285 | 1310530 |  |
| `blog-restaurant-website.png` | [`public/images/blog-restaurant-website.png`](file:///c:/growxlabs/grow-x/public/images/blog-restaurant-website.png) | 8706 | 1319641 |  |
| `blog-skyroot-vikram1.png` | [`public/images/blog-skyroot-vikram1.png`](file:///c:/growxlabs/grow-x/public/images/blog-skyroot-vikram1.png) | 8832 | 1347651 |  |
| `blog-whatsapp-nurture.png` | [`public/images/blog-whatsapp-nurture.png`](file:///c:/growxlabs/grow-x/public/images/blog-whatsapp-nurture.png) | 9758 | 1429527 |  |
| `blog_claude_opus_1780051718526.png` | [`public/images/blog_claude_opus_1780051718526.png`](file:///c:/growxlabs/grow-x/public/images/blog_claude_opus_1780051718526.png) | 3725 | 560965 |  |
| `blog_ferrari_luce_1780854014914.png` | [`public/images/blog_ferrari_luce_1780854014914.png`](file:///c:/growxlabs/grow-x/public/images/blog_ferrari_luce_1780854014914.png) | 8350 | 1313462 |  |
| `blog_google_io_hero_1779870777687.png` | [`public/images/blog_google_io_hero_1779870777687.png`](file:///c:/growxlabs/grow-x/public/images/blog_google_io_hero_1779870777687.png) | 6177 | 791097 |  |
| `blog_n8n_automation_1779880623332.png` | [`public/images/blog_n8n_automation_1779880623332.png`](file:///c:/growxlabs/grow-x/public/images/blog_n8n_automation_1779880623332.png) | 3223 | 620851 |  |
| `blog_restaurant_retention_1779880666331.png` | [`public/images/blog_restaurant_retention_1779880666331.png`](file:///c:/growxlabs/grow-x/public/images/blog_restaurant_retention_1779880666331.png) | 3200 | 637296 |  |
| `blog_restaurant_website_1779880689115.png` | [`public/images/blog_restaurant_website_1779880689115.png`](file:///c:/growxlabs/grow-x/public/images/blog_restaurant_website_1779880689115.png) | 3199 | 651143 |  |
| `blog_restaurant_website_1780853943866.png` | [`public/images/blog_restaurant_website_1780853943866.png`](file:///c:/growxlabs/grow-x/public/images/blog_restaurant_website_1780853943866.png) | 8706 | 1319641 |  |
| `blog_whatsapp_nurture_1779880645357.png` | [`public/images/blog_whatsapp_nurture_1779880645357.png`](file:///c:/growxlabs/grow-x/public/images/blog_whatsapp_nurture_1779880645357.png) | 2602 | 538737 |  |
| `blog_whatsapp_nurture_1780853967261.png` | [`public/images/blog_whatsapp_nurture_1780853967261.png`](file:///c:/growxlabs/grow-x/public/images/blog_whatsapp_nurture_1780853967261.png) | 9758 | 1429527 |  |
| `blue-origin-new-glenn-rocket-explosion.png` | [`public/images/blue-origin-new-glenn-rocket-explosion.png`](file:///c:/growxlabs/grow-x/public/images/blue-origin-new-glenn-rocket-explosion.png) | 9526 | 1453174 |  |
| `blue_origin_explosion_1780160986027.png` | [`public/images/blue_origin_explosion_1780160986027.png`](file:///c:/growxlabs/grow-x/public/images/blue_origin_explosion_1780160986027.png) | 5591 | 857739 |  |
| `blue_origin_explosion_1780853995249.png` | [`public/images/blue_origin_explosion_1780853995249.png`](file:///c:/growxlabs/grow-x/public/images/blue_origin_explosion_1780853995249.png) | 9526 | 1453174 |  |
| `carousel_slide_01_cover_1780051100910.png` | [`public/images/carousel_slide_01_cover_1780051100910.png`](file:///c:/growxlabs/grow-x/public/images/carousel_slide_01_cover_1780051100910.png) | 1181 | 212667 |  |
| `carousel_slide_02_improvements_1780051128480.png` | [`public/images/carousel_slide_02_improvements_1780051128480.png`](file:///c:/growxlabs/grow-x/public/images/carousel_slide_02_improvements_1780051128480.png) | 1817 | 264267 |  |
| `carousel_slide_03_benchmarks_1780051143578.png` | [`public/images/carousel_slide_03_benchmarks_1780051143578.png`](file:///c:/growxlabs/grow-x/public/images/carousel_slide_03_benchmarks_1780051143578.png) | 2387 | 501527 |  |
| `carousel_slide_04_workflows_1780051174930.png` | [`public/images/carousel_slide_04_workflows_1780051174930.png`](file:///c:/growxlabs/grow-x/public/images/carousel_slide_04_workflows_1780051174930.png) | 1447 | 375378 |  |
| `chatbots-are-dying-agents-are-taking-over.png` | [`public/images/chatbots-are-dying-agents-are-taking-over.png`](file:///c:/growxlabs/grow-x/public/images/chatbots-are-dying-agents-are-taking-over.png) | 8974 | 1336632 |  |
| `claude_blog_woodcut_1780853620986.png` | [`public/images/claude_blog_woodcut_1780853620986.png`](file:///c:/growxlabs/grow-x/public/images/claude_blog_woodcut_1780853620986.png) | 7506 | 1207233 |  |
| `coding_blog_woodcut_1780853698423.png` | [`public/images/coding_blog_woodcut_1780853698423.png`](file:///c:/growxlabs/grow-x/public/images/coding_blog_woodcut_1780853698423.png) | 8629 | 1354600 |  |
| `cta-phone.png` | [`public/images/cta-phone.png`](file:///c:/growxlabs/grow-x/public/images/cta-phone.png) | 2203 | 458750 |  |
| `arancini.png` | [`public/images/dishes/arancini.png`](file:///c:/growxlabs/grow-x/public/images/dishes/arancini.png) | 6035 | 996956 |  |
| `burger.png` | [`public/images/dishes/burger.png`](file:///c:/growxlabs/grow-x/public/images/dishes/burger.png) | 5875 | 853562 |  |
| `hero.png` | [`public/images/dishes/hero.png`](file:///c:/growxlabs/grow-x/public/images/dishes/hero.png) | 4930 | 752955 |  |
| `download-1.jpeg` | [`public/images/download-1.jpeg`](file:///c:/growxlabs/grow-x/public/images/download-1.jpeg) | 509 | 73656 |  |
| `download-2.jpeg` | [`public/images/download-2.jpeg`](file:///c:/growxlabs/grow-x/public/images/download-2.jpeg) | 292 | 35930 |  |
| `download-3.jpeg` | [`public/images/download-3.jpeg`](file:///c:/growxlabs/grow-x/public/images/download-3.jpeg) | 184 | 19520 |  |
| `download-4.gif` | [`public/images/download-4.gif`](file:///c:/growxlabs/grow-x/public/images/download-4.gif) | 15694 | 1367543 |  |
| `download-5.jpeg` | [`public/images/download-5.jpeg`](file:///c:/growxlabs/grow-x/public/images/download-5.jpeg) | 115 | 15223 |  |
| `google_io_crimson_1780853751363.png` | [`public/images/google_io_crimson_1780853751363.png`](file:///c:/growxlabs/grow-x/public/images/google_io_crimson_1780853751363.png) | 8912 | 1380575 |  |
| `grain-texture.jpg` | [`public/images/grain-texture.jpg`](file:///c:/growxlabs/grow-x/public/images/grain-texture.jpg) | 211 | 28262 |  |
| `handshake.jpg` | [`public/images/handshake.jpg`](file:///c:/growxlabs/grow-x/public/images/handshake.jpg) | 1642 | 213140 |  |
| `hero-ai-coding.png` | [`public/images/hero-ai-coding.png`](file:///c:/growxlabs/grow-x/public/images/hero-ai-coding.png) | 8371 | 1314034 |  |
| `hero-anthropic-openai.png` | [`public/images/hero-anthropic-openai.png`](file:///c:/growxlabs/grow-x/public/images/hero-anthropic-openai.png) | 8233 | 1337156 |  |
| `hero-google-search.png` | [`public/images/hero-google-search.png`](file:///c:/growxlabs/grow-x/public/images/hero-google-search.png) | 9825 | 1451241 |  |
| `hero_ai_coding_1779888875980.png` | [`public/images/hero_ai_coding_1779888875980.png`](file:///c:/growxlabs/grow-x/public/images/hero_ai_coding_1779888875980.png) | 2230 | 513019 |  |
| `hero_ai_coding_1780854081406.png` | [`public/images/hero_ai_coding_1780854081406.png`](file:///c:/growxlabs/grow-x/public/images/hero_ai_coding_1780854081406.png) | 8371 | 1314034 |  |
| `hero_anthropic_openai_1779888645846.png` | [`public/images/hero_anthropic_openai_1779888645846.png`](file:///c:/growxlabs/grow-x/public/images/hero_anthropic_openai_1779888645846.png) | 2296 | 504685 |  |
| `hero_anthropic_openai_1780854059065.png` | [`public/images/hero_anthropic_openai_1780854059065.png`](file:///c:/growxlabs/grow-x/public/images/hero_anthropic_openai_1780854059065.png) | 8233 | 1337156 |  |
| `hero_google_search_1779888592231.png` | [`public/images/hero_google_search_1779888592231.png`](file:///c:/growxlabs/grow-x/public/images/hero_google_search_1779888592231.png) | 2489 | 536638 |  |
| `hero_google_search_1780854034543.png` | [`public/images/hero_google_search_1780854034543.png`](file:///c:/growxlabs/grow-x/public/images/hero_google_search_1780854034543.png) | 9825 | 1451241 |  |
| `hero.png` | [`public/images/hotel/hero.png`](file:///c:/growxlabs/grow-x/public/images/hotel/hero.png) | 5455 | 856713 |  |
| `loft-skyline.png` | [`public/images/hotel/loft-skyline.png`](file:///c:/growxlabs/grow-x/public/images/hotel/loft-skyline.png) | 5631 | 830162 |  |
| `studio-modern.png` | [`public/images/hotel/studio-modern.png`](file:///c:/growxlabs/grow-x/public/images/hotel/studio-modern.png) | 5631 | 830162 |  |
| `suite-ocean.png` | [`public/images/hotel/suite-ocean.png`](file:///c:/growxlabs/grow-x/public/images/hotel/suite-ocean.png) | 5631 | 830162 |  |
| `villa-garden.png` | [`public/images/hotel/villa-garden.png`](file:///c:/growxlabs/grow-x/public/images/hotel/villa-garden.png) | 5631 | 830162 |  |
| `java-mastery.png` | [`public/images/java-mastery.png`](file:///c:/growxlabs/grow-x/public/images/java-mastery.png) | 4673 | 823320 |  |
| `kimi-k3-agents-bench.png` | [`public/images/kimi-k3-agents-bench.png`](file:///c:/growxlabs/grow-x/public/images/kimi-k3-agents-bench.png) | 1424 | 212036 |  |
| `kimi-k3-coding-bench.png` | [`public/images/kimi-k3-coding-bench.png`](file:///c:/growxlabs/grow-x/public/images/kimi-k3-coding-bench.png) | 1383 | 179829 |  |
| `kimi-k3-knowledge-bench.png` | [`public/images/kimi-k3-knowledge-bench.png`](file:///c:/growxlabs/grow-x/public/images/kimi-k3-knowledge-bench.png) | 1115 | 157048 |  |
| `kimi-k3-logo.png` | [`public/images/kimi-k3-logo.png`](file:///c:/growxlabs/grow-x/public/images/kimi-k3-logo.png) | 8061 | 1288161 |  |
| `kimi-k3-roofline.png` | [`public/images/kimi-k3-roofline.png`](file:///c:/growxlabs/grow-x/public/images/kimi-k3-roofline.png) | 938 | 136092 |  |
| `landscape.jpg` | [`public/images/landscape.jpg`](file:///c:/growxlabs/grow-x/public/images/landscape.jpg) | 3212 | 492392 |  |
| `logo-actual.png` | [`public/images/logo-actual.png`](file:///c:/growxlabs/grow-x/public/images/logo-actual.png) | 200 | 37559 |  |
| `logo-candidate2.png` | [`public/images/logo-candidate2.png`](file:///c:/growxlabs/grow-x/public/images/logo-candidate2.png) | 574 | 74686 |  |
| `media__1779871299303.png` | [`public/images/media__1779871299303.png`](file:///c:/growxlabs/grow-x/public/images/media__1779871299303.png) | 839 | 107279 |  |
| `media__1779871856315.png` | [`public/images/media__1779871856315.png`](file:///c:/growxlabs/grow-x/public/images/media__1779871856315.png) | 1346 | 192198 |  |
| `media__1779872103951.png` | [`public/images/media__1779872103951.png`](file:///c:/growxlabs/grow-x/public/images/media__1779872103951.png) | 1404 | 190124 |  |
| `media__1779872183331.png` | [`public/images/media__1779872183331.png`](file:///c:/growxlabs/grow-x/public/images/media__1779872183331.png) | 960 | 123164 |  |
| `media__1779872485475.png` | [`public/images/media__1779872485475.png`](file:///c:/growxlabs/grow-x/public/images/media__1779872485475.png) | 317 | 54568 |  |
| `media__1779872959265.png` | [`public/images/media__1779872959265.png`](file:///c:/growxlabs/grow-x/public/images/media__1779872959265.png) | 953 | 126718 |  |
| `media__1779873270613.png` | [`public/images/media__1779873270613.png`](file:///c:/growxlabs/grow-x/public/images/media__1779873270613.png) | 752 | 106939 |  |
| `media__1779873833882.png` | [`public/images/media__1779873833882.png`](file:///c:/growxlabs/grow-x/public/images/media__1779873833882.png) | 906 | 117502 |  |
| `media__1779875219246.png` | [`public/images/media__1779875219246.png`](file:///c:/growxlabs/grow-x/public/images/media__1779875219246.png) | 850 | 117315 |  |
| `media__1779875332445.png` | [`public/images/media__1779875332445.png`](file:///c:/growxlabs/grow-x/public/images/media__1779875332445.png) | 825 | 114397 |  |
| `media__1779875692482.png` | [`public/images/media__1779875692482.png`](file:///c:/growxlabs/grow-x/public/images/media__1779875692482.png) | 858 | 114329 |  |
| `media__1779875945956.png` | [`public/images/media__1779875945956.png`](file:///c:/growxlabs/grow-x/public/images/media__1779875945956.png) | 899 | 120217 |  |
| `media__1779877209540.png` | [`public/images/media__1779877209540.png`](file:///c:/growxlabs/grow-x/public/images/media__1779877209540.png) | 1047 | 140904 |  |
| `media__1779879527678.png` | [`public/images/media__1779879527678.png`](file:///c:/growxlabs/grow-x/public/images/media__1779879527678.png) | 994 | 139580 |  |
| `media__1779880494039.png` | [`public/images/media__1779880494039.png`](file:///c:/growxlabs/grow-x/public/images/media__1779880494039.png) | 2263 | 286083 |  |
| `media__1779880518213.png` | [`public/images/media__1779880518213.png`](file:///c:/growxlabs/grow-x/public/images/media__1779880518213.png) | 1456 | 189321 |  |
| `media__1779880553076.png` | [`public/images/media__1779880553076.png`](file:///c:/growxlabs/grow-x/public/images/media__1779880553076.png) | 1054 | 150761 |  |
| `media__1779889142820.png` | [`public/images/media__1779889142820.png`](file:///c:/growxlabs/grow-x/public/images/media__1779889142820.png) | 1037 | 136965 |  |
| `media__1779890498330.png` | [`public/images/media__1779890498330.png`](file:///c:/growxlabs/grow-x/public/images/media__1779890498330.png) | 830 | 125682 |  |
| `media__1779894465024.png` | [`public/images/media__1779894465024.png`](file:///c:/growxlabs/grow-x/public/images/media__1779894465024.png) | 1602 | 234865 |  |
| `media__1779894784168.png` | [`public/images/media__1779894784168.png`](file:///c:/growxlabs/grow-x/public/images/media__1779894784168.png) | 1163 | 151425 |  |
| `media__1779895261046.png` | [`public/images/media__1779895261046.png`](file:///c:/growxlabs/grow-x/public/images/media__1779895261046.png) | 1826 | 231182 |  |
| `media__1779895646645.png` | [`public/images/media__1779895646645.png`](file:///c:/growxlabs/grow-x/public/images/media__1779895646645.png) | 2491 | 292355 |  |
| `media__1779895677294.jpg` | [`public/images/media__1779895677294.jpg`](file:///c:/growxlabs/grow-x/public/images/media__1779895677294.jpg) | 735 | 108903 |  |
| `media__1779896149355.png` | [`public/images/media__1779896149355.png`](file:///c:/growxlabs/grow-x/public/images/media__1779896149355.png) | 1402 | 194079 |  |
| `media__1779896248857.png` | [`public/images/media__1779896248857.png`](file:///c:/growxlabs/grow-x/public/images/media__1779896248857.png) | 1404 | 192059 |  |
| `media__1779896967707.jpg` | [`public/images/media__1779896967707.jpg`](file:///c:/growxlabs/grow-x/public/images/media__1779896967707.jpg) | 839 | 123367 |  |
| `media__1779897093973.png` | [`public/images/media__1779897093973.png`](file:///c:/growxlabs/grow-x/public/images/media__1779897093973.png) | 1865 | 270057 |  |
| `media__1779897564743.png` | [`public/images/media__1779897564743.png`](file:///c:/growxlabs/grow-x/public/images/media__1779897564743.png) | 1563 | 210656 |  |
| `media__1779902928678.png` | [`public/images/media__1779902928678.png`](file:///c:/growxlabs/grow-x/public/images/media__1779902928678.png) | 1499 | 209738 |  |
| `media__1779903048189.png` | [`public/images/media__1779903048189.png`](file:///c:/growxlabs/grow-x/public/images/media__1779903048189.png) | 1818 | 237114 |  |
| `media__1779903321617.png` | [`public/images/media__1779903321617.png`](file:///c:/growxlabs/grow-x/public/images/media__1779903321617.png) | 2046 | 259058 |  |
| `media__1779903576127.png` | [`public/images/media__1779903576127.png`](file:///c:/growxlabs/grow-x/public/images/media__1779903576127.png) | 2162 | 262557 |  |
| `media__1779903583569.png` | [`public/images/media__1779903583569.png`](file:///c:/growxlabs/grow-x/public/images/media__1779903583569.png) | 4053 | 548588 |  |
| `media__1779904034233.png` | [`public/images/media__1779904034233.png`](file:///c:/growxlabs/grow-x/public/images/media__1779904034233.png) | 1617 | 213462 |  |
| `media__1779904669335.png` | [`public/images/media__1779904669335.png`](file:///c:/growxlabs/grow-x/public/images/media__1779904669335.png) | 1305 | 176484 |  |
| `media__1779905379409.png` | [`public/images/media__1779905379409.png`](file:///c:/growxlabs/grow-x/public/images/media__1779905379409.png) | 1472 | 198325 |  |
| `media__1779905662316.png` | [`public/images/media__1779905662316.png`](file:///c:/growxlabs/grow-x/public/images/media__1779905662316.png) | 763 | 107215 |  |
| `media__1779905991854.png` | [`public/images/media__1779905991854.png`](file:///c:/growxlabs/grow-x/public/images/media__1779905991854.png) | 1378 | 184014 |  |
| `media__1779906388371.png` | [`public/images/media__1779906388371.png`](file:///c:/growxlabs/grow-x/public/images/media__1779906388371.png) | 604 | 92562 |  |
| `media__1779906717882.png` | [`public/images/media__1779906717882.png`](file:///c:/growxlabs/grow-x/public/images/media__1779906717882.png) | 909 | 88444 |  |
| `media__1779906978260.png` | [`public/images/media__1779906978260.png`](file:///c:/growxlabs/grow-x/public/images/media__1779906978260.png) | 994 | 134725 |  |
| `media__1779907006170.png` | [`public/images/media__1779907006170.png`](file:///c:/growxlabs/grow-x/public/images/media__1779907006170.png) | 1468 | 204960 |  |
| `media__1779907014248.png` | [`public/images/media__1779907014248.png`](file:///c:/growxlabs/grow-x/public/images/media__1779907014248.png) | 1702 | 217220 |  |
| `media__1779907791229.png` | [`public/images/media__1779907791229.png`](file:///c:/growxlabs/grow-x/public/images/media__1779907791229.png) | 671 | 110827 |  |
| `media__1780039278594.png` | [`public/images/media__1780039278594.png`](file:///c:/growxlabs/grow-x/public/images/media__1780039278594.png) | 1365 | 181451 |  |
| `media__1780039676028.png` | [`public/images/media__1780039676028.png`](file:///c:/growxlabs/grow-x/public/images/media__1780039676028.png) | 959 | 136510 |  |
| `media__1780039699257.png` | [`public/images/media__1780039699257.png`](file:///c:/growxlabs/grow-x/public/images/media__1780039699257.png) | 961 | 136159 |  |
| `media__1780041027931.png` | [`public/images/media__1780041027931.png`](file:///c:/growxlabs/grow-x/public/images/media__1780041027931.png) | 1023 | 137196 |  |
| `media__1780043437901.png` | [`public/images/media__1780043437901.png`](file:///c:/growxlabs/grow-x/public/images/media__1780043437901.png) | 1092 | 138096 |  |
| `media__1780044860836.png` | [`public/images/media__1780044860836.png`](file:///c:/growxlabs/grow-x/public/images/media__1780044860836.png) | 797 | 121639 |  |
| `media__1780045386241.png` | [`public/images/media__1780045386241.png`](file:///c:/growxlabs/grow-x/public/images/media__1780045386241.png) | 737 | 98813 |  |
| `media__1780045414307.png` | [`public/images/media__1780045414307.png`](file:///c:/growxlabs/grow-x/public/images/media__1780045414307.png) | 1219 | 102186 |  |
| `media__1780045655387.png` | [`public/images/media__1780045655387.png`](file:///c:/growxlabs/grow-x/public/images/media__1780045655387.png) | 1038 | 129986 |  |
| `media__1780046359398.png` | [`public/images/media__1780046359398.png`](file:///c:/growxlabs/grow-x/public/images/media__1780046359398.png) | 1092 | 147088 |  |
| `media__1780046897817.png` | [`public/images/media__1780046897817.png`](file:///c:/growxlabs/grow-x/public/images/media__1780046897817.png) | 627 | 91961 |  |
| `media__1780047197534.png` | [`public/images/media__1780047197534.png`](file:///c:/growxlabs/grow-x/public/images/media__1780047197534.png) | 1033 | 158240 |  |
| `media__1780047958587.png` | [`public/images/media__1780047958587.png`](file:///c:/growxlabs/grow-x/public/images/media__1780047958587.png) | 1224 | 108857 |  |
| `media__1780048511942.png` | [`public/images/media__1780048511942.png`](file:///c:/growxlabs/grow-x/public/images/media__1780048511942.png) | 1002 | 147438 |  |
| `media__1780048583966.png` | [`public/images/media__1780048583966.png`](file:///c:/growxlabs/grow-x/public/images/media__1780048583966.png) | 673 | 101546 |  |
| `media__1780048609121.png` | [`public/images/media__1780048609121.png`](file:///c:/growxlabs/grow-x/public/images/media__1780048609121.png) | 645 | 99037 |  |
| `media__1780048619531.png` | [`public/images/media__1780048619531.png`](file:///c:/growxlabs/grow-x/public/images/media__1780048619531.png) | 671 | 108566 |  |
| `media__1780048642003.png` | [`public/images/media__1780048642003.png`](file:///c:/growxlabs/grow-x/public/images/media__1780048642003.png) | 893 | 119398 |  |
| `media__1780049525097.png` | [`public/images/media__1780049525097.png`](file:///c:/growxlabs/grow-x/public/images/media__1780049525097.png) | 1109 | 158237 |  |
| `media__1780051875825.jpg` | [`public/images/media__1780051875825.jpg`](file:///c:/growxlabs/grow-x/public/images/media__1780051875825.jpg) | 758 | 84061 |  |
| `media__1780051911566.jpg` | [`public/images/media__1780051911566.jpg`](file:///c:/growxlabs/grow-x/public/images/media__1780051911566.jpg) | 618 | 86182 |  |
| `media__1780051919210.jpg` | [`public/images/media__1780051919210.jpg`](file:///c:/growxlabs/grow-x/public/images/media__1780051919210.jpg) | 1045 | 120718 |  |
| `media__1780052779837.png` | [`public/images/media__1780052779837.png`](file:///c:/growxlabs/grow-x/public/images/media__1780052779837.png) | 1328 | 202634 |  |
| `media__1780162395326.png` | [`public/images/media__1780162395326.png`](file:///c:/growxlabs/grow-x/public/images/media__1780162395326.png) | 2062 | 278582 |  |
| `media__1780162869350.png` | [`public/images/media__1780162869350.png`](file:///c:/growxlabs/grow-x/public/images/media__1780162869350.png) | 2637 | 351168 |  |
| `media__1780163280418.png` | [`public/images/media__1780163280418.png`](file:///c:/growxlabs/grow-x/public/images/media__1780163280418.png) | 1164 | 173385 |  |
| `media__1780321859829.png` | [`public/images/media__1780321859829.png`](file:///c:/growxlabs/grow-x/public/images/media__1780321859829.png) | 668 | 99142 |  |
| `media__1780322150322.png` | [`public/images/media__1780322150322.png`](file:///c:/growxlabs/grow-x/public/images/media__1780322150322.png) | 1072 | 141189 |  |
| `media__1780322158912.png` | [`public/images/media__1780322158912.png`](file:///c:/growxlabs/grow-x/public/images/media__1780322158912.png) | 1400 | 201182 |  |
| `media__1780324173930.png` | [`public/images/media__1780324173930.png`](file:///c:/growxlabs/grow-x/public/images/media__1780324173930.png) | 1409 | 184770 |  |
| `media__1780550007306.png` | [`public/images/media__1780550007306.png`](file:///c:/growxlabs/grow-x/public/images/media__1780550007306.png) | 783 | 105482 |  |
| `media__1780550229675.png` | [`public/images/media__1780550229675.png`](file:///c:/growxlabs/grow-x/public/images/media__1780550229675.png) | 1292 | 116907 |  |
| `media__1780551330274.png` | [`public/images/media__1780551330274.png`](file:///c:/growxlabs/grow-x/public/images/media__1780551330274.png) | 1050 | 157476 |  |
| `media__1780551441154.png` | [`public/images/media__1780551441154.png`](file:///c:/growxlabs/grow-x/public/images/media__1780551441154.png) | 1280 | 161947 |  |
| `media__1780595329785.png` | [`public/images/media__1780595329785.png`](file:///c:/growxlabs/grow-x/public/images/media__1780595329785.png) | 1249 | 191166 |  |
| `media__1780749046292.png` | [`public/images/media__1780749046292.png`](file:///c:/growxlabs/grow-x/public/images/media__1780749046292.png) | 1173 | 154114 |  |
| `media__1780853428680.jpg` | [`public/images/media__1780853428680.jpg`](file:///c:/growxlabs/grow-x/public/images/media__1780853428680.jpg) | 3817 | 583151 |  |
| `media__1780854365433.png` | [`public/images/media__1780854365433.png`](file:///c:/growxlabs/grow-x/public/images/media__1780854365433.png) | 3826 | 534310 |  |
| `media__1780854389527.png` | [`public/images/media__1780854389527.png`](file:///c:/growxlabs/grow-x/public/images/media__1780854389527.png) | 6539 | 960919 |  |
| `media__1780854618956.png` | [`public/images/media__1780854618956.png`](file:///c:/growxlabs/grow-x/public/images/media__1780854618956.png) | 1222 | 172369 |  |
| `media__1780854627647.jpg` | [`public/images/media__1780854627647.jpg`](file:///c:/growxlabs/grow-x/public/images/media__1780854627647.jpg) | 2563 | 391973 |  |
| `media__1780854636984.png` | [`public/images/media__1780854636984.png`](file:///c:/growxlabs/grow-x/public/images/media__1780854636984.png) | 1607 | 231578 |  |
| `media__1780854674258.png` | [`public/images/media__1780854674258.png`](file:///c:/growxlabs/grow-x/public/images/media__1780854674258.png) | 1237 | 196143 |  |
| `media__1780854684449.png` | [`public/images/media__1780854684449.png`](file:///c:/growxlabs/grow-x/public/images/media__1780854684449.png) | 1948 | 275611 |  |
| `n8n_blog_purple_1780853782502.png` | [`public/images/n8n_blog_purple_1780853782502.png`](file:///c:/growxlabs/grow-x/public/images/n8n_blog_purple_1780853782502.png) | 8507 | 1308394 |  |
| `nextjs-fullstack.png` | [`public/images/nextjs-fullstack.png`](file:///c:/growxlabs/grow-x/public/images/nextjs-fullstack.png) | 5197 | 760143 |  |
| `nvidia-vision-agentic-to-useful-ai.png` | [`public/images/nvidia-vision-agentic-to-useful-ai.png`](file:///c:/growxlabs/grow-x/public/images/nvidia-vision-agentic-to-useful-ai.png) | 9327 | 1436333 |  |
| `nvidia_blog_woodcut_1780853564383.png` | [`public/images/nvidia_blog_woodcut_1780853564383.png`](file:///c:/growxlabs/grow-x/public/images/nvidia_blog_woodcut_1780853564383.png) | 9327 | 1436333 |  |
| `nvidia_gtc_vision_1780594810209.png` | [`public/images/nvidia_gtc_vision_1780594810209.png`](file:///c:/growxlabs/grow-x/public/images/nvidia_gtc_vision_1780594810209.png) | 6806 | 1087274 |  |
| `obsession-scene-1.jpg` | [`public/images/obsession-scene-1.jpg`](file:///c:/growxlabs/grow-x/public/images/obsession-scene-1.jpg) | 160 | 26108 |  |
| `obsession-scene-2.jpg` | [`public/images/obsession-scene-2.jpg`](file:///c:/growxlabs/grow-x/public/images/obsession-scene-2.jpg) | 44 | 5366 |  |
| `obsession-scene-3.jpg` | [`public/images/obsession-scene-3.jpg`](file:///c:/growxlabs/grow-x/public/images/obsession-scene-3.jpg) | 39 | 4538 |  |
| `obsession-scene-4.jpg` | [`public/images/obsession-scene-4.jpg`](file:///c:/growxlabs/grow-x/public/images/obsession-scene-4.jpg) | 336 | 45736 |  |
| `python-mastery.png` | [`public/images/python-mastery.png`](file:///c:/growxlabs/grow-x/public/images/python-mastery.png) | 5221 | 854662 |  |
| `commercial.png` | [`public/images/real-estate/commercial.png`](file:///c:/growxlabs/grow-x/public/images/real-estate/commercial.png) | 5342 | 808352 |  |
| `penthouse.png` | [`public/images/real-estate/penthouse.png`](file:///c:/growxlabs/grow-x/public/images/real-estate/penthouse.png) | 5342 | 808352 |  |
| `studio.png` | [`public/images/real-estate/studio.png`](file:///c:/growxlabs/grow-x/public/images/real-estate/studio.png) | 5759 | 884073 |  |
| `villa.png` | [`public/images/real-estate/villa.png`](file:///c:/growxlabs/grow-x/public/images/real-estate/villa.png) | 5759 | 884073 |  |
| `restaurant_retention_orange_1780853808096.png` | [`public/images/restaurant_retention_orange_1780853808096.png`](file:///c:/growxlabs/grow-x/public/images/restaurant_retention_orange_1780853808096.png) | 8285 | 1310530 |  |
| `search_blog_woodcut_1780853646113.png` | [`public/images/search_blog_woodcut_1780853646113.png`](file:///c:/growxlabs/grow-x/public/images/search_blog_woodcut_1780853646113.png) | 7581 | 1249464 |  |
| `willow-poster-bg.png` | [`public/images/willow-poster-bg.png`](file:///c:/growxlabs/grow-x/public/images/willow-poster-bg.png) | 7080 | 967118 |  |
| `willow-snapped-table.jpg` | [`public/images/willow-snapped-table.jpg`](file:///c:/growxlabs/grow-x/public/images/willow-snapped-table.jpg) | 2063 | 297396 |  |
| `willow-snapping-action.png` | [`public/images/willow-snapping-action.png`](file:///c:/growxlabs/grow-x/public/images/willow-snapping-action.png) | 7143 | 1028976 |  |
| `willow-whole-table.jpg` | [`public/images/willow-whole-table.jpg`](file:///c:/growxlabs/grow-x/public/images/willow-whole-table.jpg) | 1818 | 253501 |  |
| `launchday.png` | [`public/launchday.png`](file:///c:/growxlabs/grow-x/public/launchday.png) | 2427 | 524189 |  |
| `llms.txt` | [`public/llms.txt`](file:///c:/growxlabs/grow-x/public/llms.txt) | 38 | 1233 |  |
| `en.json` | [`public/locales/eu/en.json`](file:///c:/growxlabs/grow-x/public/locales/eu/en.json) | 44 | 1644 | { | "hero": { |
| `es.json` | [`public/locales/eu/es.json`](file:///c:/growxlabs/grow-x/public/locales/eu/es.json) | 44 | 1828 | { | "hero": { |
| `fr.json` | [`public/locales/eu/fr.json`](file:///c:/growxlabs/grow-x/public/locales/eu/fr.json) | 44 | 1892 | { | "hero": { |
| `en.json` | [`public/locales/in/en.json`](file:///c:/growxlabs/grow-x/public/locales/in/en.json) | 44 | 1644 | { | "hero": { |
| `hi.json` | [`public/locales/in/hi.json`](file:///c:/growxlabs/grow-x/public/locales/in/hi.json) | 44 | 3292 | { | "hero": { |
| `te.json` | [`public/locales/in/te.json`](file:///c:/growxlabs/grow-x/public/locales/in/te.json) | 44 | 3485 | { | "hero": { |
| `en.json` | [`public/locales/us/en.json`](file:///c:/growxlabs/grow-x/public/locales/us/en.json) | 44 | 1644 | { | "hero": { |
| `logo-symbol.svg` | [`public/logo-symbol.svg`](file:///c:/growxlabs/grow-x/public/logo-symbol.svg) | 6 | 392 |  |
| `logo.png` | [`public/logo.png`](file:///c:/growxlabs/grow-x/public/logo.png) | 1721 | 439736 |  |
| `logo.svg` | [`public/logo.svg`](file:///c:/growxlabs/grow-x/public/logo.svg) | 9 | 644 |  |
| `next.svg` | [`public/next.svg`](file:///c:/growxlabs/grow-x/public/next.svg) | 1 | 1375 |  |
| `3rdmind.png` | [`public/portfolio/3rdmind.png`](file:///c:/growxlabs/grow-x/public/portfolio/3rdmind.png) | 2472 | 545349 |  |
| `aureliacare.png` | [`public/portfolio/aureliacare.png`](file:///c:/growxlabs/grow-x/public/portfolio/aureliacare.png) | 4378 | 647381 |  |
| `aureliahotels.png` | [`public/portfolio/aureliahotels.png`](file:///c:/growxlabs/grow-x/public/portfolio/aureliahotels.png) | 5799 | 770088 |  |
| `aureviajewelry.png` | [`public/portfolio/aureviajewelry.png`](file:///c:/growxlabs/grow-x/public/portfolio/aureviajewelry.png) | 5839 | 861933 |  |
| `eduverseai.png` | [`public/portfolio/eduverseai.png`](file:///c:/growxlabs/grow-x/public/portfolio/eduverseai.png) | 6822 | 1059260 |  |
| `pipper.png` | [`public/portfolio/pipper.png`](file:///c:/growxlabs/grow-x/public/portfolio/pipper.png) | 747 | 193825 |  |
| `recruitai.png` | [`public/portfolio/recruitai.png`](file:///c:/growxlabs/grow-x/public/portfolio/recruitai.png) | 2692 | 577965 |  |
| `recruitai_analytics.png` | [`public/portfolio/recruitai_analytics.png`](file:///c:/growxlabs/grow-x/public/portfolio/recruitai_analytics.png) | 2254 | 497554 |  |
| `recruitai_automation.png` | [`public/portfolio/recruitai_automation.png`](file:///c:/growxlabs/grow-x/public/portfolio/recruitai_automation.png) | 2199 | 503251 |  |
| `recruitai_dashboard.png` | [`public/portfolio/recruitai_dashboard.png`](file:///c:/growxlabs/grow-x/public/portfolio/recruitai_dashboard.png) | 2062 | 488951 |  |
| `recruitai_pipeline.png` | [`public/portfolio/recruitai_pipeline.png`](file:///c:/growxlabs/grow-x/public/portfolio/recruitai_pipeline.png) | 2509 | 542661 |  |
| `resumeforgeai.png` | [`public/portfolio/resumeforgeai.png`](file:///c:/growxlabs/grow-x/public/portfolio/resumeforgeai.png) | 5086 | 798113 |  |
| `returnbox.png` | [`public/portfolio/returnbox.png`](file:///c:/growxlabs/grow-x/public/portfolio/returnbox.png) | 5010 | 728885 |  |
| `royalefeast.png` | [`public/portfolio/royalefeast.png`](file:///c:/growxlabs/grow-x/public/portfolio/royalefeast.png) | 5819 | 825224 |  |
| `sriblooms.png` | [`public/portfolio/sriblooms.png`](file:///c:/growxlabs/grow-x/public/portfolio/sriblooms.png) | 7072 | 1048894 |  |
| `universalai.mp4` | [`public/portfolio/universalai.mp4`](file:///c:/growxlabs/grow-x/public/portfolio/universalai.mp4) | 31564 | 4174573 |  |
| `universalai.png` | [`public/portfolio/universalai.png`](file:///c:/growxlabs/grow-x/public/portfolio/universalai.png) | 2750 | 582770 |  |
| `velorarestaurants.png` | [`public/portfolio/velorarestaurants.png`](file:///c:/growxlabs/grow-x/public/portfolio/velorarestaurants.png) | 5626 | 815533 |  |
| `velour.png` | [`public/portfolio/velour.png`](file:///c:/growxlabs/grow-x/public/portfolio/velour.png) | 4980 | 625775 |  |
| `robots.txt` | [`public/robots.txt`](file:///c:/growxlabs/grow-x/public/robots.txt) | 30 | 394 |  |
| `welcome_email.html` | [`public/templates/welcome_email.html`](file:///c:/growxlabs/grow-x/public/templates/welcome_email.html) | 265 | 9143 |  |
| `earth_clouds.jpg` | [`public/textures/earth_clouds.jpg`](file:///c:/growxlabs/grow-x/public/textures/earth_clouds.jpg) | 949 | 118296 |  |
| `earth_clouds.png` | [`public/textures/earth_clouds.png`](file:///c:/growxlabs/grow-x/public/textures/earth_clouds.png) | 1543 | 226113 |  |
| `earth_clouds_8k.png` | [`public/textures/earth_clouds_8k.png`](file:///c:/growxlabs/grow-x/public/textures/earth_clouds_8k.png) | 39236 | 5033486 |  |
| `earth_day_8k.jpg` | [`public/textures/earth_day_8k.jpg`](file:///c:/growxlabs/grow-x/public/textures/earth_day_8k.jpg) | 9663 | 1392914 |  |
| `earth_daymap.jpg` | [`public/textures/earth_daymap.jpg`](file:///c:/growxlabs/grow-x/public/textures/earth_daymap.jpg) | 3355 | 473093 |  |
| `earth_night.jpg` | [`public/textures/earth_night.jpg`](file:///c:/growxlabs/grow-x/public/textures/earth_night.jpg) | 3591 | 267061 |  |
| `earth_night_8k.jpg` | [`public/textures/earth_night_8k.jpg`](file:///c:/growxlabs/grow-x/public/textures/earth_night_8k.jpg) | 3229 | 410160 |  |
| `earth_nightlights.jpg` | [`public/textures/earth_nightlights.jpg`](file:///c:/growxlabs/grow-x/public/textures/earth_nightlights.jpg) | 2193 | 99021 |  |
| `earth_normal.jpg` | [`public/textures/earth_normal.jpg`](file:///c:/growxlabs/grow-x/public/textures/earth_normal.jpg) | 2462 | 336774 |  |
| `earth_normal.png` | [`public/textures/earth_normal.png`](file:///c:/growxlabs/grow-x/public/textures/earth_normal.png) | 4 | 8535 |  |
| `earth_normal_8k.jpg` | [`public/textures/earth_normal_8k.jpg`](file:///c:/growxlabs/grow-x/public/textures/earth_normal_8k.jpg) | 3283 | 413118 |  |
| `earth_specular.jpg` | [`public/textures/earth_specular.jpg`](file:///c:/growxlabs/grow-x/public/textures/earth_specular.jpg) | 1370 | 223421 |  |
| `earth_specular.png` | [`public/textures/earth_specular.png`](file:///c:/growxlabs/grow-x/public/textures/earth_specular.png) | 5 | 8536 |  |
| `earth_specular_8k.jpg` | [`public/textures/earth_specular_8k.jpg`](file:///c:/growxlabs/grow-x/public/textures/earth_specular_8k.jpg) | 7011 | 1186447 |  |
| `vercel.svg` | [`public/vercel.svg`](file:///c:/growxlabs/grow-x/public/vercel.svg) | 1 | 128 |  |
| `gxl-wish-game-22.mp4` | [`public/videos/gxl-wish-game-22.mp4`](file:///c:/growxlabs/grow-x/public/videos/gxl-wish-game-22.mp4) | 121237 | 15709737 |  |
| `obsession-video.mp4` | [`public/videos/obsession-video.mp4`](file:///c:/growxlabs/grow-x/public/videos/obsession-video.mp4) | 13046 | 1653514 |  |
| `window.svg` | [`public/window.svg`](file:///c:/growxlabs/grow-x/public/window.svg) | 1 | 385 |  |
| `scratch_ddg_lite_profiles.html` | [`scratch_ddg_lite_profiles.html`](file:///c:/growxlabs/grow-x/scratch_ddg_lite_profiles.html) | 176 | 14422 |  |
| `scratch_ddg_lite_result.html` | [`scratch_ddg_lite_result.html`](file:///c:/growxlabs/grow-x/scratch_ddg_lite_result.html) | 732 | 23649 |  |
| `scratch_ddg_result.html` | [`scratch_ddg_result.html`](file:///c:/growxlabs/grow-x/scratch_ddg_result.html) | 632 | 33458 |  |
| `scratch_google_result.html` | [`scratch_google_result.html`](file:///c:/growxlabs/grow-x/scratch_google_result.html) | 19 | 91823 |  |
| `scratch_yahoo_result.html` | [`scratch_yahoo_result.html`](file:///c:/growxlabs/grow-x/scratch_yahoo_result.html) | 136 | 133726 |  |
| `sentry.client.config.ts` | [`sentry.client.config.ts`](file:///c:/growxlabs/grow-x/sentry.client.config.ts) | 17 | 557 | import * as Sentry from "@sentry/nextjs"; | Sentry.init({ |
| `sentry.edge.config.ts` | [`sentry.edge.config.ts`](file:///c:/growxlabs/grow-x/sentry.edge.config.ts) | 11 | 345 | import * as Sentry from "@sentry/nextjs"; | Sentry.init({ |
| `sentry.server.config.ts` | [`sentry.server.config.ts`](file:///c:/growxlabs/grow-x/sentry.server.config.ts) | 11 | 345 | import * as Sentry from "@sentry/nextjs"; | Sentry.init({ |
| `tsconfig.json` | [`tsconfig.json`](file:///c:/growxlabs/grow-x/tsconfig.json) | 34 | 711 | { | "compilerOptions": { |
| `vercel.json` | [`vercel.json`](file:///c:/growxlabs/grow-x/vercel.json) | 36 | 726 | { | "cleanUrls": true, |

### Scripts

| File Name | Path | Lines | Size (bytes) | Description / Header Preview |
| --- | --- | --- | --- | --- |
| `count-courses.ts` | [`scripts/count-courses.ts`](file:///c:/growxlabs/grow-x/scripts/count-courses.ts) | 22 | 699 | import { createClient } from "@supabase/supabase-js"; | import "dotenv/config"; |
| `inspect_db.ts` | [`scripts/inspect_db.ts`](file:///c:/growxlabs/grow-x/scripts/inspect_db.ts) | 29 | 850 | import { config } from "dotenv"; | import { createClient } from "@supabase/supabase-js"; |
| `seed-courses.ts` | [`scripts/seed-courses.ts`](file:///c:/growxlabs/grow-x/scripts/seed-courses.ts) | 180 | 6261 | import "dotenv/config"; | import { config } from "dotenv"; |
| `update-allowed-paths.ts` | [`scripts/update-allowed-paths.ts`](file:///c:/growxlabs/grow-x/scripts/update-allowed-paths.ts) | 55 | 1542 | import { supabaseAdmin } from "../lib/supabase/admin"; | async function updateAllowedPaths() { |

### Tests

| File Name | Path | Lines | Size (bytes) | Description / Header Preview |
| --- | --- | --- | --- | --- |
| `database-schema.test.ts` | [`tests/crm/database-schema.test.ts`](file:///c:/growxlabs/grow-x/tests/crm/database-schema.test.ts) | 59 | 1447 | Database Schema Integrity Tests | import { supabaseAdmin } from "@/lib/supabase/admin"; |
| `quotations-invoice.test.ts` | [`tests/crm/quotations-invoice.test.ts`](file:///c:/growxlabs/grow-x/tests/crm/quotations-invoice.test.ts) | 48 | 1587 | Quotations Calculations Tests | export async function testQuotationsCalculations() { |
| `run-tests.ts` | [`tests/crm/run-tests.ts`](file:///c:/growxlabs/grow-x/tests/crm/run-tests.ts) | 32 | 1198 | Main CRM Test Suite Runner | import { testDatabaseSchema } from "./database-schema.test"; |
| `workflow-automation.test.ts` | [`tests/crm/workflow-automation.test.ts`](file:///c:/growxlabs/grow-x/tests/crm/workflow-automation.test.ts) | 56 | 1753 | Workflow Automation Engine Tests | import { WorkflowEngine } from "@/services/workflow-engine"; |
| `double-entry.test.ts` | [`tests/finance/double-entry.test.ts`](file:///c:/growxlabs/grow-x/tests/finance/double-entry.test.ts) | 26 | 959 | Trial double entry debit equal credit balance checks | import { EnterpriseFinanceService } from "@/s |
| `gst-taxes.test.ts` | [`tests/finance/gst-taxes.test.ts`](file:///c:/growxlabs/grow-x/tests/finance/gst-taxes.test.ts) | 29 | 978 | GST CGST/SGST/IGST tax rates calculations test | export async function testGstTaxSplits() { |
| `profit-loss.test.ts` | [`tests/finance/profit-loss.test.ts`](file:///c:/growxlabs/grow-x/tests/finance/profit-loss.test.ts) | 42 | 1450 | Profit & Loss calculations unit checks | export async function testProfitLossCalculation() { |
| `run-finance-tests.ts` | [`tests/finance/run-finance-tests.ts`](file:///c:/growxlabs/grow-x/tests/finance/run-finance-tests.ts) | 89 | 2974 | Enterprise Finance & Accounting Unit Test Suite Runner | import { testDoubleEntryLedger } from "./do |
| `database-hrms.test.ts` | [`tests/hrms/database-hrms.test.ts`](file:///c:/growxlabs/grow-x/tests/hrms/database-hrms.test.ts) | 49 | 1231 | import { supabaseAdmin } from "@/lib/supabase/admin"; | export async function testHrmsDatabaseSchema |
| `payroll-calc.test.ts` | [`tests/hrms/payroll-calc.test.ts`](file:///c:/growxlabs/grow-x/tests/hrms/payroll-calc.test.ts) | 63 | 1919 | import { EnterpriseHrmsService } from "@/services/enterprise-hrms"; | export async function testPayr |
| `run-hrms-tests.ts` | [`tests/hrms/run-hrms-tests.ts`](file:///c:/growxlabs/grow-x/tests/hrms/run-hrms-tests.ts) | 37 | 1550 | HRMS Unit Test Suite Runner | import { testHrmsDatabaseSchema } from "./database-hrms.test"; |
| `agile-sprint.test.ts` | [`tests/pm/agile-sprint.test.ts`](file:///c:/growxlabs/grow-x/tests/pm/agile-sprint.test.ts) | 31 | 1105 | Agile Sprint burndown trajectory unit calculations test | export async function testSprintBurndown() |
| `database-pm.test.ts` | [`tests/pm/database-pm.test.ts`](file:///c:/growxlabs/grow-x/tests/pm/database-pm.test.ts) | 70 | 1996 | import { supabaseAdmin } from "@/lib/supabase/admin"; | export async function testPmDatabaseSchema() |
| `run-pm-tests.ts` | [`tests/pm/run-pm-tests.ts`](file:///c:/growxlabs/grow-x/tests/pm/run-pm-tests.ts) | 30 | 1117 | Project Management Unit Test Suite Runner | import { testPmDatabaseSchema } from "./database-pm.test |
| `time-logs.test.ts` | [`tests/pm/time-logs.test.ts`](file:///c:/growxlabs/grow-x/tests/pm/time-logs.test.ts) | 29 | 1073 | Timesheet developer logging metrics updates test | export async function testTimesheetTracking() { |

### TypeScript Types

| File Name | Path | Lines | Size (bytes) | Description / Header Preview |
| --- | --- | --- | --- | --- |
| `courses.ts` | [`types/courses.ts`](file:///c:/growxlabs/grow-x/types/courses.ts) | 77 | 1582 | export type Grade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; | export interface Lesson { |
| `index.ts` | [`types/index.ts`](file:///c:/growxlabs/grow-x/types/index.ts) | 38 | 993 | export interface Lead { | id?: string; |
| `lifecycle.ts` | [`types/lifecycle.ts`](file:///c:/growxlabs/grow-x/types/lifecycle.ts) | 51 | 1051 | export type UserRole = 'CLIENT' | 'ADMIN' | 'CO_ADMIN'; | export interface Client { |
| `next-auth.d.ts` | [`types/next-auth.d.ts`](file:///c:/growxlabs/grow-x/types/next-auth.d.ts) | 23 | 381 | import NextAuth, { DefaultSession } from "next-auth"; | import { JWT } from "next-auth/jwt"; |

