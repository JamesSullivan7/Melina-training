/**
 * Convert a calendar date into a program coordinate
 * (week, dayOfWeek) given the program's start Monday.
 *
 * Weekends are rest days. If `today` is Sat/Sun, we report
 * `isRestDay: true` and surface the next training day.
 *
 * If `today` is before the start, we report `notYetStarted: true`.
 * If we've passed Week 12 Day 5, we report `complete: true`.
 */
export type ProgramCoord = {
  week: number;
  dayOfWeek: number;
  isRestDay: boolean;
  notYetStarted: boolean;
  complete: boolean;
  dateISO: string;
};

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function countWeekdaysBetween(start: Date, end: Date): number {
  // Inclusive of `start`, exclusive of `end`. Both at local midnight.
  let count = 0;
  const cursor = new Date(start);
  while (cursor < end) {
    const dow = cursor.getDay();
    if (dow >= 1 && dow <= 5) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function computeCoord(
  programStartDate: string | undefined,
  today: Date = new Date(),
): ProgramCoord {
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const dateISO = toISODate(todayMidnight);

  if (!programStartDate) {
    return {
      week: 1,
      dayOfWeek: 1,
      isRestDay: false,
      notYetStarted: true,
      complete: false,
      dateISO,
    };
  }

  const start = parseLocalDate(programStartDate);
  if (todayMidnight < start) {
    return {
      week: 1,
      dayOfWeek: 1,
      isRestDay: false,
      notYetStarted: true,
      complete: false,
      dateISO,
    };
  }

  const dow = todayMidnight.getDay(); // 0=Sun..6=Sat
  const isRestDay = dow === 0 || dow === 6;

  // Count weekdays elapsed from start through today (inclusive when today is a weekday).
  const elapsed = countWeekdaysBetween(
    start,
    new Date(
      todayMidnight.getFullYear(),
      todayMidnight.getMonth(),
      todayMidnight.getDate() + 1,
    ),
  );

  if (elapsed <= 0) {
    return {
      week: 1,
      dayOfWeek: 1,
      isRestDay,
      notYetStarted: false,
      complete: false,
      dateISO,
    };
  }

  // dayIndex is the 1-based index of today's training day among weekdays.
  // On a rest day, we report the next training day (clamp into Mon).
  const dayIndex = isRestDay ? elapsed + 1 : elapsed;

  if (dayIndex > 60) {
    return {
      week: 12,
      dayOfWeek: 5,
      isRestDay,
      notYetStarted: false,
      complete: true,
      dateISO,
    };
  }

  const week = Math.floor((dayIndex - 1) / 5) + 1;
  const dayOfWeek = ((dayIndex - 1) % 5) + 1;

  return {
    week,
    dayOfWeek,
    isRestDay,
    notYetStarted: false,
    complete: false,
    dateISO,
  };
}

export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export const PHASE_NAMES: Record<number, string> = {
  1: "Phase 1 · Reconditioning",
  2: "Phase 2 · Threshold",
  3: "Phase 3 · Hybrid Performance",
};

export function todayISO(): string {
  return toISODate(new Date());
}
