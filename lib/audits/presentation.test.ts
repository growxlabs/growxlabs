import assert from "node:assert/strict";
import test from "node:test";
import {auditEntries,displayValue,formatAuditLabel,isEmptyAuditValue} from "./presentation.ts";
test("machine labels become consulting labels",()=>{assert.equal(formatAuditLabel("customer_support"),"Customer Support");assert.equal(formatAuditLabel("distributor_management"),"Distributor Management");assert.equal(formatAuditLabel("ai_process_maturity"),"AI Process Maturity");});
test("machine scalar values are readable",()=>{assert.equal(displayValue("manual_using_excel_and_whatsapp"),"Manual — Excel and WhatsApp");assert.equal(displayValue(["sales","customer_support"]),"Sales · Customer Support");});
test("technical empty values are detected and omitted",()=>{assert.equal(isEmptyAuditValue({}),true);assert.equal(isEmptyAuditValue([]),true);assert.deepEqual(auditEntries({empty:{},usable:"Recorded"}),[{key:"usable",label:"Usable",value:"Recorded"}]);});
