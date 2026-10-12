# Healthcare Lead Manager V1 — Implementation & Architecture Guide

## 1. Executive Summary & Architecture Lock

### 1.1 Overview
Healthcare Lead Manager V1 provides a secure, streamlined workspace for dedicated healthcare sales and lead qualification specialists at GrowXLabs. Rather than rebuilding or redesigning the CRM, this implementation leverages the existing **Employee OS Sales Workspace** (`/workspace/sales`) and the underlying PostgreSQL infrastructure while strictly isolating employees from legacy administrative surfaces.

### 1.2 Locked Architecture Principles
1. **Founder/Admin Experience**:
   - The Founder and Admins continue using the primary Admin CRM (`/admin/leads`, `/admin/crm`).
   - Admins can import healthcare leads with enriched business intelligence and assign them to active employees.
   - Admins retain visibility over all sales activities, follow-ups, and pipeline status.

2. **Healthcare Lead Manager Experience**:
   - Healthcare Lead Managers access the platform strictly via `/workspace/sales`.
   - Access is restricted exclusively to leads where `leads.assigned_employee_id == employee.id`.
   - Healthcare Lead Managers **never** receive access to `/admin` or the legacy `crm_agent` Admin CRM interface.

3. **Authentication Boundary**:
   - The existing login system and `/login` interface remain completely untouched.
   - Employees and administrators use their established email and password credentials.
   - Authentication is processed securely via the existing `CredentialsProvider` in `lib/auth.ts`, mapping active `identity.users` and `identity.employee_identities`.

---

## 2. Authentication & Authorization Flow

### 2.1 Preserved Credentials Authentication
- **Zero Modifications to Login Flow**: The production login page (`app/(marketing)/login/page.tsx`) and NextAuth configurations (`lib/auth.ts`) remain exactly as originally implemented.
- **Employee Resolution**:
  - `identity.users` verifies active status and compares password hash via `bcrypt.compare`.
  - When verified, `identity.employee_identities` associates the employee ID, organization ID, and sales capabilities (`sales.workspace`, `sales.lead.read_assigned`, etc.).
  - NextAuth sets the session role (`EMPLOYEE`) and populates the token with active workspace permissions.
- **Access Routing**:
  - Employee accessing `/workspace/sales` resolves active context via `resolveEmployeeContext`.
  - Attempts by employees to access `/admin` or unauthorized leads fail-safe with 403 or 404.

---

## 3. Data Contract: Healthcare & GrowXLabs Business Intelligence

### 3.1 Persistence Layer
All enriched business intelligence and healthcare-specific data are stored inside `leads.custom_fields` as a JSONB payload with two top-level namespaces:
```json
{
  "healthcare": { ... },
  "growx_intelligence": { ... }
}
```

### 3.2 TypeScript Contracts (`lib/leads/intelligence-types.ts`)
Defensive helper functions (`extractHealthcareFields` and `extractGrowxIntelligence`) parse raw JSON safely without throwing runtime errors:

```typescript
export interface HealthcareLeadFields {
  facility_type?: string;          // e.g. "Hospital", "Clinic", "Diagnostic Lab"
  specialties?: string[];          // e.g. ["Cardiology", "Orthopedics"]
  bed_capacity?: number;
  doctor_count?: number;
  accreditation?: string[];        // e.g. ["NABH", "NABL", "JCI"]
  emr_system?: string;             // e.g. "Practo", "Custom", "None"
  opd_daily_volume?: number;
  pharmacy_attached?: boolean;
  lab_attached?: boolean;
  target_decision_maker?: string;  // e.g. "Managing Director", "Medical Superintendent"
  notes?: string;
}

export interface BilingualText {
  en: string;
  te?: string;
}

export interface GrowxIntelligence {
  company_overview?: BilingualText;
  what_they_do?: BilingualText;
  business_model?: BilingualText;
  target_customers?: BilingualText;
  current_operations?: BilingualText;
  digital_presence?: {
    website_quality?: "none" | "poor" | "average" | "good" | "modern";
    booking_system?: boolean;
    whatsapp_integrated?: boolean;
    teleconsultation?: boolean;
    seo_score?: string;
    reviews_rating?: number;
    reviews_count?: number;
    notes?: BilingualText;
  };
  key_findings?: Array<{
    title: BilingualText;
    detail: BilingualText;
    type: "strength" | "gap" | "opportunity" | "risk";
    evidence?: string;
  }>;
  identified_gaps?: Array<{
    area: BilingualText;
    impact: BilingualText;
    recommendation: BilingualText;
  }>;
  opportunity_score?: {
    score: number;                 // 1-100
    level: "low" | "medium" | "high" | "critical";
    rationale: BilingualText;
  };
  decision_makers?: Array<{
    name: string;
    title: string;
    department?: string;
    linkedin_url?: string;
    phone?: string;
    email?: string;
    is_primary?: boolean;
  }>;
  action_plan?: {
    pitch_angle: BilingualText;
    questions_to_ask: BilingualText[];
    next_step_recommendation: BilingualText;
    your_goal?: BilingualText;     // PROMINENT "YOUR GOAL / మీ పని"
  };
  sources?: Array<{
    title: string;
    url: string;
    retrieved_at?: string;
  }>;
}
```

---

## 4. Lead Assignment Service & Bulk Import Extension

### 4.1 Reusable Lead Assignment Service (`lib/employee-os/lead-assignment-service.ts`)
- **Assignee Validation (`validateAssignableEmployee`)**:
  - Verifies employee exists and is `active`.
  - Checks role capabilities: ensures employee has `sales.workspace` capability or role in `[SALES_REP, SALES_LEAD, SALES_MANAGER, ACCOUNT_EXECUTIVE, BDR]`.
- **Assignment Logic (`assignLeadToEmployee`)**:
  - Closes any active assignment in `crm.lead_assignment_history` (`ended_at = now()`).
  - Sets `leads.assigned_employee_id = employeeId`.
  - Inserts new record into `crm.lead_assignment_history` with `assigned_by`, `assigned_at`, `reason`.
  - Dispatches an Employee OS in-app notification to the assignee (`type: "lead_assigned"`).

### 4.2 Lead Import API (`app/api/leads/import/route.ts`)
- Accepts `assigned_employee_id` in request body.
- Validates the employee once before bulk processing.
- For every inserted or updated lead, automatically executes `assignLeadToEmployee`.
- Response format:
  ```json
  {
    "created": 15,
    "updated": 2,
    "duplicates": 1,
    "assigned": 17,
    "failed_assignment": 0,
    "invalid": 0
  }
  ```

---

## 5. Security & Isolation Model

### 5.1 Route & Data Isolation
| User Role | Assigned Leads Route | Admin CRM Route | Data Visibility |
|---|---|---|---|
| **EMPLOYEE** | `/workspace/sales` | 403 Forbidden | Strictly where `assigned_employee_id == employee.id` |
| **ADMIN / CO_ADMIN** | `/admin/crm/leads` | Full Access | All leads across organization |

### 5.2 Server-Side Query Enforcement (`lib/employee-os/sales-service.ts`)
- All database queries for employee leads execute through `getAccessibleLead` and `listAssignedLeads`.
- Query filters explicitly include: `.eq("assigned_employee_id", context.employee.id)`.
- If an unassigned lead ID is requested by an employee, the service returns `404 Not Found` (never `403`), preventing ID enumeration.
- `custom_fields` is explicitly selected and returned in lead queries.

### 5.3 Legacy API Hardening (`app/api/leads/[id]/route.ts`)
- **PATCH / DELETE**: Hardened to permit only `ADMIN` and `CO_ADMIN`. Employees cannot modify lead master data via legacy endpoints.
- **GET**: If the caller has the legacy `crm_agent` role, verification ensures the lead's `assigned_to` matches the user's ID. Unauthorized access returns `404`.

---

## 6. Bilingual Business Intelligence UI (`LeadIntelligenceBrief.tsx`)

### 6.1 Layout & Hierarchy
Located at `app/workspace/sales/leads/[leadId]/page.tsx`, the Business Intelligence Brief sits at the top of the main reading column, preceding the generic overview.

1. **Language Control**:
   - Interactive toggle: `Both (రెండు)` | `English` | `తెలుగు (Telugu)`.
   - Telugu text is formatted with distinct visual styling (`bg-slate-50/80 rounded-md p-2 border-l-2 border-blue-500`) to aid quick scanning.
2. **Prominent "YOUR GOAL / మీ పని" Card**:
   - Emphasized high-contrast container with target badge.
   - Outlines the exact objective of the sales specialist for the current call.
3. **Healthcare Profile**:
   - Facility type, specialty tags, bed capacity, doctor count, EMR system, accreditations, OPD volume.
4. **Opportunity Strength & Pitch Angle**:
   - Visual badge (`critical`, `high`, `medium`, `low`) with rationale.
   - Tailored pitch angle and strategic questions to ask.
5. **Key Findings & Evidence**:
   - Grouped by strengths, gaps, and opportunities with source citations.
6. **Subtle Empty State**:
   - Gracefully displays a placeholder when intelligence data has not yet been processed for a lead.

### 6.2 Contact Actions & WhatsApp Integration
- Primary contact bar in `<aside>` includes **Call**, **Email**, and **WhatsApp**.
- **WhatsApp Phone Normalizer**:
  - Strips non-digit characters (`+`, `-`, spaces, brackets).
  - Normalizes 10-digit Indian numbers to international format (`91XXXXXXXXXX`).
  - Normalizes 11-digit numbers with leading 0 to `91XXXXXXXXXX`.
  - Opens `https://wa.me/${normalizedPhone}` in a new tab (`target="_blank" rel="noopener noreferrer"`).

---

## 7. Mobile Viewport Optimization

- Tested against standard viewport widths: **360px**, **390px**, and **430px**.
- **Action Tabs (`components/workspace/LeadActions.tsx`)**:
  - Horizontal smooth scrolling container (`overflow-x-auto pb-1.5 scrollbar-none`).
  - Buttons configured with `shrink-0 min-h-[38px] px-3.5 py-2` to prevent jagged wrapping on narrow displays and provide touch-compliant targets.
- **Grid Layout**:
  - Responsive single-column on mobile (`grid-cols-1`) expanding to dual-column on large screens (`lg:grid-cols-[1fr_320px]`).

---

## 8. Summary of Files Changed & Created

1. `lib/leads/intelligence-types.ts` (New)
2. `lib/employee-os/sales-service.ts` (Updated)
3. `lib/employee-os/lead-assignment-service.ts` (New)
4. `app/api/admin/crm/leads/[leadId]/assignment/route.ts` (Updated)
5. `app/api/leads/import/route.ts` (Updated)
6. `app/api/leads/[id]/route.ts` (Updated)
7. `app/api/leads/list/route.ts` (Updated)
8. `components/workspace/LeadIntelligenceBrief.tsx` (New)
9. `app/workspace/sales/leads/[leadId]/page.tsx` (Updated)
10. `components/workspace/LeadActions.tsx` (Updated)
11. `scripts/seed-healthcare-lead.ts` (New)
12. `docs/healthcare-lead-manager-v1.md` (New)

---

## 9. Final Simplification Pass: Dedicated `/workspace/h` Surface

### 9.1 Focused Route Architecture
The Healthcare Lead Manager experience is encapsulated within `/workspace/h` without creating separate database tables, duplicated auth engines, or secondary CRM instances:
- `/workspace/h`: High-signal homepage featuring execution counts (New, To Contact, Follow-up, Qualified), today's follow-up tasks, and quick-continue prospect cards.
- `/workspace/h/leads`: Mobile-first prospect cards with real-time text search (company/contact/phone) and status filter tabs (All, New, Contacted, Follow-up, Qualified).
- `/workspace/h/leads/[leadId]`: Strict 9-level hierarchical lead view:
  1. Business Name
  2. Location & Clinic Category / Specialty
  3. Opportunity Strength Badge
  4. Call (`tel:`) & WhatsApp (`wa.me/`) Action Bar
  5. Bilingual Business Intelligence Brief (English + Telugu)
  6. High-contrast **YOUR GOAL / మీ పని** Objective Card
  7. Simplified Action Form (Outcome pills, status, notes, next follow-up)
  8. Clinic Follow-up Schedule
  9. Activity Timeline
- `/workspace/h/follow-ups`: Task workspace with Complete, Reschedule, and Open Clinic actions across Today, Upcoming, Completed, and All filters.
- `/workspace/h/activity`: Read-only chronological feed of the employee's logged calls, WhatsApp messages, and notes grouped into Today, Yesterday, and Earlier.

### 9.2 Persona Detection & Routing Guardrails
- **Helper**: `isHealthcareLeadManager(context)` evaluates `designation === "Healthcare Lead Manager"`.
- **Automatic Persona Routing**:
  - Healthcare Lead Managers visiting `/workspace` or `/workspace/sales/*` are immediately redirected to `/workspace/h/*`.
  - Normal employees, developers, and standard sales representatives continue using their respective default Employee OS modules untouched.
  - Administrators and Founders retain exclusive access to `/admin` and the primary Admin CRM.

### 9.3 Simplified 4-Item Navigation Shell
- Navigation for Healthcare Lead Managers is strictly streamlined to 4 links: **Home**, **Leads**, **Follow-ups**, **Activity**.
- **Desktop**: Compact left sidebar displaying `GrowXLabs Healthcare`, the 4 primary links, employee name, designation, and Sign Out.
- **Mobile**: Top header displaying `GrowXLabs Healthcare` + Sign Out, paired with an ergonomically sized bottom tab bar for thumb-friendly one-handed operation.
- **Viewport Safe**: Layout containers include bottom padding (`pb-24`) ensuring the mobile bottom bar never obscures lead intelligence or action forms on 360px–430px viewports.

### 9.4 Invitation / Activation Access Model
- Public employee OTP and self-registration surfaces have been eliminated from public routes.
- Access is strictly governed through the internal HR / Admin invitation and private activation lifecycle:
  `Admin/HR Invite → Private Activation Token → Employee Identity Resolution → Active Workspace Provisioning`.
- Prevents public employee email discovery and protects organizational boundaries.

### 9.5 Final Verification Summary
- **TypeScript**: `npx tsc --noEmit` compiles cleanly with 0 type errors.
- **Unit & Integration Tests**: `npm test` executes 64 automated tests with 0 failures, including dedicated persona detection and WhatsApp normalizer suites.
- **Mobile Compliance**: Form controls, outcome pills, bilingual briefs, and action bars verified responsive without horizontal page overflow.

---

READY FOR HEALTHCARE HANDOVER
