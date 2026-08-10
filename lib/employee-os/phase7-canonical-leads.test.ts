import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(path:string)=>fs.readFileSync(path,"utf8");
const migration=read("platform/hrms/migrations/0038_canonical_sales_leads.sql");
const canonical=read("lib/leads/canonical.ts");
const crmApi=read("app/api/crm/leads/route.ts");
const employeeApi=read("app/api/workspace/sales/leads/route.ts");
const sales=read("lib/employee-os/sales-service.ts");
const importApi=read("app/api/leads/import/route.ts");

test("public.leads is canonical and legacy CRM is migration-only",()=>{assert.match(migration,/migrate_crm_leads_to_canonical/);assert.match(migration,/crm_lead_migration_map/);assert.doesNotMatch(crmApi,/from\(["']crm_leads["']\)/);assert.match(crmApi,/from\(["']leads["']\)/)});
test("canonical leads are tenant scoped and deterministically normalized",()=>{for(const value of ["organisation_id","normalized_email","normalized_phone","normalized_domain","dedupe_review_required"])assert.match(migration,new RegExp(value));assert.match(canonical,/eq\("organisation_id",organisationId\)/);assert.match(canonical,/options\.updateExisting===false/)});
test("one active assignment and employee identity bridge are enforced",()=>{assert.match(migration,/team_members ADD COLUMN IF NOT EXISTS employee_id/);assert.match(migration,/lead_assignment_one_active_uq/);assert.match(migration,/WHERE ended_at IS NULL/)});
test("employee lead creation self assigns without cross-tenant input",()=>{assert.match(employeeApi,/createEmployeeLead/);assert.match(sales,/source:"employee_created"/);assert.match(sales,/assigned_employee_id:context\.employeeId/);assert.doesNotMatch(employeeApi,/organisationId:body/)});
test("CSV import reports canonical outcomes",()=>{for(const value of ["created","updated","duplicates","invalid"])assert.match(importApi,new RegExp(value));assert.doesNotMatch(importApi,/crm_leads/)});
test("commercial boundary stays outside Employee Sales APIs",()=>{const routes=fs.readdirSync("app/api/workspace/sales",{recursive:true}).join("\n");for(const forbidden of ["proposal","quotation","agreement","invoice","pricing"])assert.doesNotMatch(routes,new RegExp(forbidden,"i"))});
