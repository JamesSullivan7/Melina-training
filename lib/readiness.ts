/**
 * Readiness traffic light.
 *
 * Reads the most recent daily log and produces a green/yellow/red
 * signal plus a coaching line. Inputs scored independently and averaged:
 *
 *   sleep quality   2 = ≥7        1 = 5–6   0 = ≤4
 *   soreness        2 = ≤3        1 = 4–6   0 = ≥7
 *   yesterday RPE   2 = ≤7        1 = 8     0 = ≥9
 *   energy before   2 = ≥7        1 = 5–6   0 = ≤4
 *
 * Ratio ≥ 0.75 → green (ready)
 * Ratio ≥ 0.4  → yellow (manage intensity)
 * Otherwise    → red (reduce intensity / recover)
 *
 * Returns green by default when there's nothing to score — better to
 * let the athlete train than scare them off with no data.
 */

export type Readiness = "green" | "yellow" | "red" | "unknown";

export type ReadinessSignal = {
  level: Readiness;
  label: string;
  message: string;
  flags: string[];
};

type LogInput = {
  sleepQuality?: number;
  soreness?: number;
  rpe?: number;
  energyBefore?: number;
} | null
  | undefined;

export function computeReadiness(log: LogInput): ReadinessSignal {
  if (!log) {
    return {
      level: "unknown",
      label: "No data",
      message: "Log a Recovery entry to see today's readiness.",
      flags: [],
    };
  }

  let score = 0;
  let total = 0;
  const flags: string[] = [];

  if (log.sleepQuality !== undefined) {
    total += 2;
    if (log.sleepQuality >= 7) score += 2;
    else if (log.sleepQuality >= 5) {
      score += 1;
      flags.push("sleep");
    } else flags.push("sleep");
  }

  if (log.soreness !== undefined) {
    total += 2;
    if (log.soreness <= 3) score += 2;
    else if (log.soreness <= 6) {
      score += 1;
      flags.push("soreness");
    } else flags.push("soreness");
  }

  if (log.rpe !== undefined) {
    total += 2;
    if (log.rpe <= 7) score += 2;
    else if (log.rpe <= 8) {
      score += 1;
      flags.push("prior RPE");
    } else flags.push("prior RPE");
  }

  if (log.energyBefore !== undefined) {
    total += 2;
    if (log.energyBefore >= 7) score += 2;
    else if (log.energyBefore >= 5) {
      score += 1;
      flags.push("energy");
    } else flags.push("energy");
  }

  if (total === 0) {
    return {
      level: "unknown",
      label: "No data",
      message: "Log a Recovery entry to see today's readiness.",
      flags: [],
    };
  }

  const ratio = score / total;

  if (ratio >= 0.75) {
    return {
      level: "green",
      label: "Ready",
      message: "Recovery looks solid — train as planned.",
      flags,
    };
  }
  if (ratio >= 0.4) {
    return {
      level: "yellow",
      label: "Manage",
      message:
        flags.length > 0
          ? `Watch your ${flags.slice(0, 2).join(" + ")}. Keep RPE under 8.`
          : "Hold RPE under 8 — quality over output.",
      flags,
    };
  }
  return {
    level: "red",
    label: "Recover",
    message: "High strain markers. Walk, mobility, sleep — no intensity today.",
    flags,
  };
}
