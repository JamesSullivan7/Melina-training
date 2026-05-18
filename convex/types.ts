/**
 * Shared types for the program data model.
 * Modeled after JamesSullivan7/Hybrid-Athlete-app's tracking types.
 */

export type TrackingType =
  | "check"             // simple completion checkbox (warmup, cooldown items)
  | "weight_reps_rpe"   // strength: log weight (lb) + reps + RPE
  | "bodyweight_reps"   // bodyweight movement: log reps + RPE
  | "distance_meters"   // rower, ski erg, sled distance
  | "carry_distance"    // farmer carry, walking carry
  | "calories"          // assault bike calories
  | "timed_hold"        // planks, squat holds, breathing
  | "duration"          // ropes, intervals (just track duration done)
  | "reps_rpe";         // explosive/loaded movement without external weight

export type Exercise = {
  /**
   * Stable identifier across the program. Same exercise on different
   * days uses the same id, so we can chart progression across weeks.
   * Lowercase kebab. e.g. "goblet-squat", "trap-bar-deadlift".
   */
  id: string;
  name: string;
  /** Human-readable prescription, e.g. "3 × 10", "60 sec hard / 30 sec easy". */
  prescription: string;
  trackingType: TrackingType;
  /** Optional RPE target (single number or range). */
  rpeTarget?: number | [number, number];
  /** Pair group like "A", "B" — items in the same group are supersets. */
  pairGroup?: string;
  /** Optional coaching note shown under the exercise. */
  note?: string;
};

export type Section = {
  duration?: string;
  rounds?: number;
  restSeconds?: number;
  note?: string;
  exercises: Exercise[];
};

export type ProgramDay = {
  week: number;
  dayOfWeek: number;
  phase: number;
  title: string;
  focus: string;
  intensity: string;
  totalMinutes?: number;
  isAnchor: boolean;
  anchorWeek?: number;
  adjustments?: string[];
  warmup: Section;
  mainBlock: Section;
  conditioningBlock: Section;
  cooldown: Section;
  coachingNotes?: string[];
};

export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export const PHASE_NAMES: Record<number, string> = {
  1: "Phase 1 · Reconditioning & Aerobic Rebuilding",
  2: "Phase 2 · Threshold & Work Capacity",
  3: "Phase 3 · Hybrid Performance Integration",
};
