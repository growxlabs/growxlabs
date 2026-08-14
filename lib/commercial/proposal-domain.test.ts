import assert from "node:assert/strict";
import test from "node:test";
import { calculateCommercials,isExpired,proposalContentHash,toClientProposalDto,transitionStatus,validatePaymentMilestones } from "./proposal-domain.ts";
test("commercial totals and taxes are calculated server-side",()=>{const result=calculateCommercials([{description:"Build",quantity:2,unit:"day",unitPrice:1000,discount:100}],{type:"GST",rate:18},"INR");assert.deepEqual(result.totals,{currency:"INR",subtotal:2000,discount:100,taxable_subtotal:1900,tax_type:"GST",tax_rate:18,tax_amount:342,grand_total:2242});});
test("payment milestones must total 100",()=>{assert.equal(validatePaymentMilestones([{name:"Advance",percentage:40,trigger:"Approval"},{name:"Final",percentage:60,trigger:"Handover"}]).length,2);assert.throws(()=>validatePaymentMilestones([{name:"Advance",percentage:40,trigger:"Approval"}]));});
test("state machine rejects arbitrary transitions",()=>{assert.equal(transitionStatus("draft","request_internal_review"),"internal_review");assert.throws(()=>transitionStatus("draft","send"));});
test("validity is determined by server time",()=>{assert.equal(isExpired("2026-08-01",new Date("2026-08-02T00:00:00Z")),true);});
test("content hashes are deterministic",()=>{assert.equal(proposalContentHash({b:2,a:1}),proposalContentHash({a:1,b:2}));});
test("client DTO explicitly excludes internal notes",()=>{const dto=toClientProposalDto({id:"p",proposal_number:"GXL-PRO-1",internal_notes:"secret",client_content:{terms:[]}});assert.equal("internalNotes" in dto,false);assert.equal("internal_notes" in dto,false);});
