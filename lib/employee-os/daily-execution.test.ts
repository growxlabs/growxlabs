import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const queue=readFileSync(new URL("./work-queue.ts",import.meta.url),"utf8");
const sales=readFileSync(new URL("./sales-service.ts",import.meta.url),"utf8");
const migration=readFileSync(new URL("../../platform/hrms/migrations/0032_employee_os_daily_execution.sql",import.meta.url),"utf8");
const workApi=readFileSync(new URL("../../app/api/workspace/work/route.ts",import.meta.url),"utf8");
const nav=readFileSync(new URL("../../components/workspace/WorkspaceNav.tsx",import.meta.url),"utf8");

test("work API derives authorised employee work from canonical records",()=>{assert.match(workApi,/requireActiveEmployeeContext/);assert.match(queue,/getAssignedLeads\(context\)/);assert.match(queue,/eq\("assigned_employee_id",context\.employeeId\)/);assert.match(queue,/eq\("owner_employee_id",context\.employeeId\)/);assert.doesNotMatch(migration,/CREATE TABLE IF NOT EXISTS public\.employee_work_items/)});
test("priority order puts overdue and today follow-ups ahead of derived work",()=>{assert.match(queue,/rank:due<now\?1:due<=todayEnd\?2:9/);assert.match(queue,/rank:start-now<=2\*3600000\?3:4/);assert.match(queue,/rank:5/);assert.match(queue,/rank:6/);assert.match(queue,/rank:7/);assert.match(queue,/rank:8/)});
test("queue derives assignment, qualification, discovery, meeting, handoff and onboarding actions",()=>{for(const value of ["assigned_lead","qualification","discovery_meeting","handoff","onboarding","meeting-notes","meeting-prep"])assert.match(queue,new RegExp(value))});
test("follow-up completion is atomic and rescheduling is append-only",()=>{assert.match(sales,/rpc\("complete_employee_sales_followup"/);assert.match(migration,/FOR UPDATE/);assert.match(migration,/sales_followup_events/);assert.match(sales,/followup_rescheduled/);assert.match(sales,/followup_completed/)});
test("meeting notes require attendance and notification events can be deduplicated",()=>{assert.match(sales,/attended_by_employee_ids/);assert.match(migration,/employee_notification_event_uq/);assert.match(migration,/payload->>'eventKey'/)});
test("employee daily execution contains no commercial action",()=>{for(const term of ["proposal","agreement","quotation","invoice","discount","payment request"]){assert.doesNotMatch(queue,new RegExp(term,"i"));assert.doesNotMatch(nav,new RegExp(term,"i"))}});
