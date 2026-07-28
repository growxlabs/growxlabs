import type { AttendanceEvent, AttendancePolicySnapshot, DailyAttendanceResult, ShiftSnapshot } from "./contracts";

const minute = 60_000;
const minutesBetween = (start: Date, end: Date) => Math.max(0, Math.floor((end.getTime() - start.getTime()) / minute));
const rounded = (value: number, interval: number) => Math.floor(value / Math.max(interval, 1)) * Math.max(interval, 1);

export function scheduledWindow(workDate: string, timezoneOffsetMinutes: number, shift: ShiftSnapshot) {
  if (!shift.expectedStart || !shift.expectedEnd) return null;
  const [startHour, startMinute] = shift.expectedStart.split(":").map(Number);
  const [endHour, endMinute] = shift.expectedEnd.split(":").map(Number);
  const base = Date.parse(`${workDate}T00:00:00.000Z`) + timezoneOffsetMinutes * minute;
  const start = new Date(base + (startHour * 60 + startMinute) * minute);
  let end = new Date(base + (endHour * 60 + endMinute) * minute);
  if (shift.crossesMidnight || end <= start) end = new Date(end.getTime() + 24 * 60 * minute);
  return { start, end };
}

export function calculateDailyAttendance(
  events: AttendanceEvent[],
  policy: AttendancePolicySnapshot,
  shift: ShiftSnapshot,
  workDate: string,
  timezoneOffsetMinutes = 0,
): DailyAttendanceResult {
  const ordered = [...events].sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));
  const checkIns = ordered.filter(event => event.eventType === "CHECK_IN" || event.eventType === "MANUAL_CHECK_IN");
  const checkOuts = ordered.filter(event => event.eventType === "CHECK_OUT" || event.eventType === "MANUAL_CHECK_OUT");
  const violations: string[] = [];
  if (!checkIns.length && !checkOuts.length) return { firstCheckIn:null,lastCheckOut:null,scheduledMinutes:shift.expectedMinutes,workedMinutes:0,breakMinutes:0,overtimeMinutes:0,lateMinutes:0,earlyDepartureMinutes:0,status:"ABSENT",violations };
  if (!checkIns.length || !checkOuts.length) violations.push("missing_punch");
  let worked = 0, breaks = 0;
  let activeStart: Date | null = null, breakStart: Date | null = null;
  for (const event of ordered) {
    const at = new Date(event.occurredAt);
    if (event.eventType === "CHECK_IN" || event.eventType === "MANUAL_CHECK_IN") activeStart = at;
    else if (event.eventType === "BREAK_START" && activeStart) { worked += minutesBetween(activeStart, at); activeStart = null; breakStart = at; }
    else if (event.eventType === "BREAK_END" && breakStart) { breaks += minutesBetween(breakStart, at); breakStart = null; activeStart = at; }
    else if ((event.eventType === "CHECK_OUT" || event.eventType === "MANUAL_CHECK_OUT") && activeStart) { worked += minutesBetween(activeStart, at); activeStart = null; }
  }
  worked = rounded(worked + Math.min(breaks, policy.paidBreakMinutes), policy.roundingMinutes);
  const first = checkIns[0] ? new Date(checkIns[0].occurredAt) : null;
  const last = checkOuts.at(-1) ? new Date(checkOuts.at(-1)!.occurredAt) : null;
  const window = scheduledWindow(workDate, timezoneOffsetMinutes, shift);
  const late = first && window ? Math.max(0, minutesBetween(window.start, first) - policy.graceMinutes) : 0;
  const early = last && window ? Math.max(0, minutesBetween(last, window.end)) : 0;
  if (late > 0) violations.push("late_arrival");
  if (early > 0) violations.push("early_departure");
  const overtime = Math.max(0, worked - Math.max(policy.overtimeAfterMinutes, shift.expectedMinutes));
  const status = violations.includes("missing_punch") ? "MISSING_PUNCH" : worked >= policy.fullDayMinutes ? "PRESENT" : worked >= policy.halfDayMinutes ? "HALF_DAY" : "PARTIAL";
  return { firstCheckIn:first?.toISOString()||null,lastCheckOut:last?.toISOString()||null,scheduledMinutes:shift.expectedMinutes,workedMinutes:worked,breakMinutes:breaks,overtimeMinutes:overtime,lateMinutes:late,earlyDepartureMinutes:early,status,violations };
}

export function isValidNextEvent(previous: AttendanceEvent["eventType"]|undefined, next: AttendanceEvent["eventType"]) {
  if (next === "CORRECTION" || next.startsWith("MANUAL_")) return true;
  if (!previous) return next === "CHECK_IN";
  if (previous === "CHECK_IN" || previous === "BREAK_END") return next === "BREAK_START" || next === "CHECK_OUT";
  if (previous === "BREAK_START") return next === "BREAK_END";
  return next === "CHECK_IN";
}
