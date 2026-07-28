export type AttendanceEventType =
  | "CHECK_IN" | "CHECK_OUT" | "BREAK_START" | "BREAK_END"
  | "MANUAL_CHECK_IN" | "MANUAL_CHECK_OUT" | "CORRECTION";

export type AttendanceEvent = {
  id?: string;
  eventType: AttendanceEventType;
  occurredAt: string;
  metadata?: Record<string, unknown>;
};

export type AttendancePolicySnapshot = {
  id: string;
  standardMinutes: number;
  fullDayMinutes: number;
  halfDayMinutes: number;
  graceMinutes: number;
  overtimeAfterMinutes: number;
  paidBreakMinutes: number;
  roundingMinutes: number;
  gpsRequired?: boolean;
  geofenceRequired?: boolean;
};

export type ShiftSnapshot = {
  id?: string;
  expectedStart?: string;
  expectedEnd?: string;
  expectedMinutes: number;
  crossesMidnight: boolean;
};

export type DailyAttendanceResult = {
  firstCheckIn: string | null;
  lastCheckOut: string | null;
  scheduledMinutes: number;
  workedMinutes: number;
  breakMinutes: number;
  overtimeMinutes: number;
  lateMinutes: number;
  earlyDepartureMinutes: number;
  status: "PRESENT"|"ABSENT"|"PARTIAL"|"HALF_DAY"|"MISSING_PUNCH";
  violations: string[];
};
