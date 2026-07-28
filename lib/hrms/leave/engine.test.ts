import assert from "node:assert/strict";
import test from "node:test";
import { accrualAmount, carryForward, ledgerBalance, resolveLeaveDays, totalLeaveQuantity } from "./engine.ts";
test("calculates full and half days",()=>{const days=resolveLeaveDays([{date:"2026-07-01",durationType:"full_day"},{date:"2026-07-02",durationType:"first_half"}],{weekendTreatment:"exclude",holidayTreatment:"exclude",sandwichEnabled:false,hourDayMinutes:480});assert.equal(totalLeaveQuantity(days),1.5)});
test("excludes holidays and weekends unless sandwich enabled",()=>{const input=[{date:"2026-07-05",durationType:"full_day" as const,isWeeklyOff:true}];assert.equal(totalLeaveQuantity(resolveLeaveDays(input,{weekendTreatment:"exclude",holidayTreatment:"exclude",sandwichEnabled:false,hourDayMinutes:480})),0);assert.equal(totalLeaveQuantity(resolveLeaveDays(input,{weekendTreatment:"exclude",holidayTreatment:"exclude",sandwichEnabled:true,hourDayMinutes:480})),1)});
test("derives balance from immutable ledger",()=>assert.equal(ledgerBalance([{quantity:12},{quantity:-2.5},{quantity:1}]),10.5));
test("calculates accrual and carry forward",()=>{assert.equal(accrualAmount(24,"monthly"),2);assert.equal(carryForward(9,5),5)});
