/**
 * 12-week Tulsa Training program — source of truth.
 *
 * Modeled after JamesSullivan7/Hybrid-Athlete-app's data structure:
 * every exercise is a structured object with a stable `id` and a
 * `trackingType` (weight_reps_rpe, distance_meters, etc.).
 *
 * Weeks 1, 5, 9 are ANCHOR weeks (full content).
 * Weeks 2-4, 6-8, 10-12 reference their anchor + textual adjustments.
 */

import type { Exercise, ProgramDay, Section, TrackingType } from "./types";

export type { Exercise, ProgramDay, Section, TrackingType };
export { DAY_NAMES, PHASE_NAMES } from "./types";

// ────────────────────────────────────────────────────────────────
// Builders — keep day definitions concise and readable.
// ────────────────────────────────────────────────────────────────

/** Warm-up or cooldown item: just a checkbox. */
function wu(name: string, prescription: string, note?: string): Exercise {
  return {
    id: slug(name),
    name,
    prescription,
    trackingType: "check",
    note,
  };
}

/** Strength: log weight + reps + RPE. */
function ms(
  id: string,
  name: string,
  prescription: string,
  rpeTarget?: number | [number, number],
  pairGroup?: string,
): Exercise {
  return {
    id,
    name,
    prescription,
    trackingType: "weight_reps_rpe",
    rpeTarget,
    pairGroup,
  };
}

/** Bodyweight reps (push-ups, dips). */
function bw(
  id: string,
  name: string,
  prescription: string,
  pairGroup?: string,
): Exercise {
  return { id, name, prescription, trackingType: "bodyweight_reps", pairGroup };
}

/** Carry (farmer, offset, walking). */
function carry(
  id: string,
  name: string,
  prescription: string,
  pairGroup?: string,
): Exercise {
  return { id, name, prescription, trackingType: "carry_distance", pairGroup };
}

/** Distance-based conditioning (rower meters, run meters, sled meters). */
function dist(
  id: string,
  name: string,
  prescription: string,
  pairGroup?: string,
): Exercise {
  return { id, name, prescription, trackingType: "distance_meters", pairGroup };
}

/** Calories-based conditioning (assault bike cal). */
function cal(
  id: string,
  name: string,
  prescription: string,
  pairGroup?: string,
): Exercise {
  return { id, name, prescription, trackingType: "calories", pairGroup };
}

/** Duration-based interval or timed effort. */
function dur(
  id: string,
  name: string,
  prescription: string,
  pairGroup?: string,
): Exercise {
  return { id, name, prescription, trackingType: "duration", pairGroup };
}

/** Static or breathing hold. */
function hold(name: string, prescription: string): Exercise {
  return {
    id: slug(name),
    name,
    prescription,
    trackingType: "timed_hold",
  };
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ────────────────────────────────────────────────────────────────
// PHASE 1 — WEEK 1 (ANCHOR)
// ────────────────────────────────────────────────────────────────

const WEEK_1: ProgramDay[] = [
  {
    week: 1, dayOfWeek: 1, phase: 1,
    title: "Aerobic Reintegration",
    focus: "Aerobic Strength Integration",
    intensity: "70–80%",
    totalMinutes: 60,
    isAnchor: true,
    warmup: {
      duration: "10 min",
      exercises: [
        wu("Incline Walk", "3.0 mph · 6% · 4 min"),
        wu("World's Greatest Stretch", "5/side"),
        wu("Deep Squat Pry", "30 sec"),
        wu("Cat-Cow", "10 reps"),
        wu("Walking Hamstring Sweeps", "10/side"),
        wu("Band Shoulder Openers", "15 reps"),
        wu("Glute Bridge", "12 reps"),
        wu("Dead Bug", "10/side"),
        wu("Scap Push-Up", "10 reps"),
      ],
    },
    mainBlock: {
      duration: "22 min",
      restSeconds: 60,
      note: "Rebuild foundational patterns. Trunk stability. Confidence under load.",
      exercises: [
        ms("goblet-squat", "Goblet Squat", "3 × 10", 6, "A"),
        ms("chest-supported-db-row", "Chest-Supported DB Row", "3 × 12", undefined, "A"),
        ms("db-romanian-deadlift", "DB Romanian Deadlift", "3 × 10", undefined, "B"),
        bw("incline-push-up", "Incline Push-Up", "3 × 10–12", "B"),
        carry("farmer-carry", "Farmer Carry", "3 × 40m", "B"),
      ],
    },
    conditioningBlock: {
      duration: "20 min",
      note: "Zone 2 aerobic rebuilding. Conversational pace. HR ~120–140.",
      exercises: [
        dur(
          "running-intervals",
          "Running Intervals",
          "13 rounds · 60 sec moderate / 30 sec easy",
        ),
      ],
    },
    cooldown: {
      duration: "8 min",
      note: "Downregulate CNS. Improve recovery quality.",
      exercises: [
        wu("Walking Cooldown", "2 min"),
        hold("Hip Flexor Stretch", "45 sec/side"),
        hold("Lat Stretch", "45 sec"),
        hold("Breathing Reset", "4 sec in / 6 sec out · 2 min"),
      ],
    },
  },
  {
    week: 1, dayOfWeek: 2, phase: 1,
    title: "Threshold Introduction",
    focus: "Threshold Conditioning",
    intensity: "90–95%",
    totalMinutes: 60,
    isAnchor: true,
    warmup: {
      duration: "10 min",
      exercises: [
        wu("Rower Easy", "4 min"),
        wu("Thoracic Rotations", "10 reps"),
        wu("Reverse Lunge Reach", "8/side"),
        wu("Ankle Rocks", "15 reps"),
        wu("Band Pull-Aparts", "20 reps"),
        wu("Bird Dog", "10/side"),
        wu("Mini-Band Lateral Walks", "12 reps"),
      ],
    },
    mainBlock: {
      duration: "18 min",
      rounds: 4,
      restSeconds: 75,
      note: "Muscular endurance. Sustainable output. Movement integration.",
      exercises: [
        ms("kb-deadlift", "KB Deadlift", "12 reps"),
        ms("landmine-press", "Landmine Press", "10/side"),
        ms("trx-row", "TRX Row", "12 reps"),
        dist("sled-push", "Sled Push", "25m"),
      ],
    },
    conditioningBlock: {
      duration: "24 min",
      note: "Threshold development. Sustainable discomfort, NOT sprinting.",
      exercises: [
        dur(
          "rower-threshold",
          "Rower Threshold Intervals",
          "6 rounds · 2 min hard / 2 min easy",
        ),
      ],
    },
    cooldown: {
      duration: "8 min",
      exercises: [
        wu("Walking", "2 min"),
        hold("Couch Stretch", "1 min/side"),
        hold("Child's Pose Breathing", "2 min"),
      ],
    },
  },
  {
    week: 1, dayOfWeek: 3, phase: 1,
    title: "Restoration & Recovery",
    focus: "Recovery Restoration",
    intensity: "60–70%",
    totalMinutes: 60,
    isAnchor: true,
    warmup: {
      duration: "20 min",
      note: "Recovery conditioning. Blood flow. Aerobic restoration.",
      exercises: [
        wu("Incline Walk", "3.0–3.3 mph · 8–10% · 20 min · conversational"),
      ],
    },
    mainBlock: {
      duration: "25 min",
      note: "Restore movement competency under control.",
      exercises: [
        wu("Deep Squat Holds", "controlled tempo"),
        wu("Hip Airplanes", "8/side"),
        wu("Thoracic Open Books", "10/side"),
        wu("Cossack Squat Progression", "8/side"),
        wu("Banded Shoulder Mobility", "15 reps"),
        wu("Loaded Ankle Mobility", "10/side"),
        wu("Crawling Patterns", "30 sec"),
      ],
    },
    conditioningBlock: {
      duration: "10 min",
      rounds: 3,
      note: "Tissue recovery. Circulation. LOW intensity.",
      exercises: [
        dist("sled-drag", "Sled Drag", "20m"),
        carry("farmer-carry", "Farmer Carry", "30m"),
        dur("battle-ropes", "Battle Rope Waves", "20 sec"),
      ],
    },
    cooldown: {
      duration: "5 min",
      exercises: [hold("Breathwork & Downregulation", "5 min")],
    },
  },
  {
    week: 1, dayOfWeek: 4, phase: 1,
    title: "Hybrid Athletic Conditioning",
    focus: "Hybrid Athletic Conditioning",
    intensity: "80–90%",
    totalMinutes: 60,
    isAnchor: true,
    warmup: {
      duration: "10 min",
      exercises: [
        wu("Bike Easy", "4 min"),
        wu("Lateral Lunges", "8/side"),
        wu("Inchworms", "8 reps"),
        wu("Thoracic Rotations", "10/side"),
        wu("Band Work", "20 reps"),
      ],
    },
    mainBlock: {
      duration: "20 min",
      rounds: 4,
      restSeconds: 75,
      note: "Unilateral control. Trunk integration. Shoulder-safe pressing.",
      exercises: [
        ms("front-foot-elevated-split-squat", "Front-Foot Elevated Split Squat", "8/side"),
        ms("half-kneeling-landmine-press", "Half-Kneeling Landmine Press", "10/side"),
        ms("single-arm-cable-row", "Single-Arm Cable Row", "12/side"),
      ],
    },
    conditioningBlock: {
      duration: "22 min",
      rounds: 4,
      note: "Mixed-modal conditioning. Sustainable output.",
      exercises: [
        dist("run", "Run", "400m"),
        carry("farmer-carry", "Farmer Carry", "40m"),
        cal("assault-bike", "Assault Bike", "12 cal"),
        dur("recovery-walk", "Walking Recovery", "60 sec"),
      ],
    },
    cooldown: {
      duration: "8 min",
      exercises: [hold("Hip Mobility + Breathing", "8 min")],
    },
  },
  {
    week: 1, dayOfWeek: 5, phase: 1,
    title: "High Output Day",
    focus: "Peak Output Hybrid Session",
    intensity: "95–100%",
    totalMinutes: 60,
    isAnchor: true,
    warmup: {
      duration: "10 min",
      exercises: [
        wu("Rower Easy", "4 min"),
        wu("Mobility + Activation Flow", "6 min"),
      ],
    },
    mainBlock: {
      duration: "18 min",
      rounds: 5,
      restSeconds: 75,
      note: "High sustainable power output. Total-body integration.",
      exercises: [
        ms("trap-bar-deadlift", "Trap Bar Deadlift", "6 reps"),
        bw("push-up", "Push-Up", "12 reps"),
        carry("walking-carry", "Walking Carry", "50m"),
        dist("sled-push", "Sled Push", "20m"),
      ],
    },
    conditioningBlock: {
      duration: "24 min",
      rounds: 5,
      note: "Threshold development. Cardiovascular expansion. Mental resilience.",
      exercises: [
        cal("assault-bike", "Assault Bike", "15 cal"),
        dist("rower", "Row", "250m"),
        dur("battle-ropes", "Battle Ropes", "30 sec"),
        dur("recovery-walk", "Recovery Walk", "60 sec"),
      ],
    },
    cooldown: {
      duration: "8 min",
      exercises: [hold("Full Recovery Flow", "8 min")],
    },
    coachingNotes: [
      "The goal is NOT exhaustion. It is pacing discipline + consistency.",
      "Finish Week 1 challenged + optimistic, NOT crippled or defeated.",
    ],
  },
];

// ────────────────────────────────────────────────────────────────
// PHASE 2 — WEEK 5 (ANCHOR)
// ────────────────────────────────────────────────────────────────

const WEEK_5: ProgramDay[] = [
  {
    week: 5, dayOfWeek: 1, phase: 2,
    title: "Integrated Aerobic Strength",
    focus: "Aerobic Strength Integration",
    intensity: "70–80%",
    totalMinutes: 60,
    isAnchor: true,
    warmup: {
      duration: "10 min",
      exercises: [
        wu("Bike or Row Easy", "4 min"),
        wu("Full Mobility Flow", "thoracic, hips, ankles"),
        wu("Activation", "bird dog · glute bridge · band pull-aparts"),
      ],
    },
    mainBlock: {
      duration: "22 min",
      rounds: 4,
      note: "More integrated movement. Longer work periods. Reduced passive rest.",
      exercises: [
        ms("front-squat", "Front Squat (Goblet)", "10 reps"),
        ms("chest-supported-db-row", "Chest-Supported Row", "12 reps"),
        carry("walking-carry", "Walking Carry", "60m"),
        ms("landmine-press", "Landmine Press", "10/side"),
      ],
    },
    conditioningBlock: {
      duration: "20 min",
      note: "Steady sustainable aerobic output.",
      exercises: [
        dur("running-tempo", "Running Tempo", "5 min moderate / 1 min easy × 4 rounds"),
      ],
    },
    cooldown: {
      duration: "8 min",
      exercises: [hold("Hip Flexor + Lat Stretch + Breathing", "8 min")],
    },
  },
  {
    week: 5, dayOfWeek: 2, phase: 2,
    title: "Threshold Circuit + Intervals",
    focus: "Threshold Conditioning",
    intensity: "90–95%",
    totalMinutes: 60,
    isAnchor: true,
    warmup: {
      duration: "10 min",
      exercises: [
        wu("Rower Easy", "4 min"),
        wu("Thoracic Rotations + Ankle Rocks + Band Work", "6 min"),
        wu("Bird Dog + Mini-Band Walks", "1 round"),
      ],
    },
    mainBlock: {
      duration: "20 min",
      rounds: 5,
      exercises: [
        dist("run", "Run", "300m"),
        dist("sled-push", "Sled Push", "25m"),
        ms("trx-row", "TRX Row", "15 reps"),
        ms("kb-deadlift", "KB Deadlift", "15 reps"),
      ],
    },
    conditioningBlock: {
      duration: "22 min",
      note: "Density tolerance. Repeat-effort capacity.",
      exercises: [
        dur("rower-threshold", "Row Threshold Intervals", "5 rounds · 3 min hard / 90 sec easy"),
      ],
    },
    cooldown: {
      duration: "8 min",
      exercises: [hold("Walking + Couch Stretch + Breathing", "8 min")],
    },
  },
  {
    week: 5, dayOfWeek: 3, phase: 2,
    title: "Recovery Day",
    focus: "Recovery Restoration",
    intensity: "60–70%",
    totalMinutes: 60,
    isAnchor: true,
    warmup: {
      duration: "25 min",
      exercises: [wu("Incline Walk", "25 min · conversational pace")],
    },
    mainBlock: {
      duration: "25 min",
      exercises: [
        wu("Full Mobility Progression", "10 min"),
        wu("Crawling Flow", "5 min"),
        wu("Loaded Ankle Mobility", "5 min"),
        wu("Hip Airplanes + Cossack Progression", "5 min"),
      ],
    },
    conditioningBlock: {
      duration: "10 min",
      exercises: [
        dist("sled-drag", "Sled Drag", "Recovery work · LOW intensity"),
        carry("walking-carry", "Light Carry", "30m"),
      ],
    },
    cooldown: {
      duration: "5 min",
      exercises: [hold("Breathwork", "5 min")],
    },
  },
  {
    week: 5, dayOfWeek: 4, phase: 2,
    title: "Athletic Integration",
    focus: "Hybrid Athletic Conditioning",
    intensity: "80–90%",
    totalMinutes: 60,
    isAnchor: true,
    warmup: {
      duration: "10 min",
      exercises: [
        wu("Bike Easy", "4 min"),
        wu("Dynamic Flow + Activation", "6 min"),
      ],
    },
    mainBlock: {
      duration: "22 min",
      rounds: 5,
      note: "Contralateral loading. Athletic sequencing.",
      exercises: [
        ms("split-squat", "Split Squat", "10 reps"),
        ms("landmine-rotational-press", "Landmine Rotational Press", "8/side"),
        carry("offset-carry", "Offset Carry", "40m"),
        ms("cable-row", "Cable Row", "12 reps"),
      ],
    },
    conditioningBlock: {
      duration: "18 min",
      note: "Sustainable movement flow, not all-out.",
      exercises: [
        dur("continuous-rotation", "Continuous Rotation", "Bike · Carry · Run · Walking recovery"),
      ],
    },
    cooldown: {
      duration: "8 min",
      exercises: [hold("Mobility + Breathing", "8 min")],
    },
  },
  {
    week: 5, dayOfWeek: 5, phase: 2,
    title: "High Output Hybrid",
    focus: "Peak Output Hybrid Session",
    intensity: "95–100%",
    totalMinutes: 60,
    isAnchor: true,
    warmup: {
      duration: "10 min",
      exercises: [
        wu("Rower Easy", "4 min"),
        wu("Mobility + Activation", "6 min"),
      ],
    },
    mainBlock: {
      duration: "22 min",
      rounds: 5,
      exercises: [
        ms("trap-bar-deadlift", "Trap Bar Deadlift", "6 reps"),
        bw("push-up", "Push-Up", "15 reps"),
        dist("sled-push", "Sled Push", "30m"),
        dist("rower", "Row", "300m"),
      ],
    },
    conditioningBlock: {
      duration: "10 min",
      note: "Finisher — 10 minutes mixed modal.",
      exercises: [
        dur("battle-ropes", "Battle Ropes", "30 sec/round"),
        carry("walking-carry", "Walking Carry", "30m/round"),
        cal("assault-bike", "Assault Bike Sprint", "10 cal/round"),
        dur("recovery-walk", "Recovery Walk", "60 sec/round"),
      ],
    },
    cooldown: {
      duration: "8 min",
      exercises: [hold("Full Recovery Flow", "8 min")],
    },
  },
];

// ────────────────────────────────────────────────────────────────
// PHASE 3 — WEEK 9 (ANCHOR)
// ────────────────────────────────────────────────────────────────

const WEEK_9: ProgramDay[] = [
  {
    week: 9, dayOfWeek: 1, phase: 3,
    title: "Athletic Movement Chains",
    focus: "Aerobic Strength Integration",
    intensity: "70–80%",
    totalMinutes: 60,
    isAnchor: true,
    warmup: {
      duration: "10 min",
      exercises: [
        wu("Bike Easy", "4 min"),
        wu("Full Mobility Flow + Activation", "6 min"),
      ],
    },
    mainBlock: {
      duration: "25 min",
      rounds: 5,
      note: "Athletic movement patterns. Integrated carries.",
      exercises: [
        ms("front-squat", "Front Squat", "8 reps"),
        ms("landmine-press", "Landmine Press", "10 reps"),
        ms("single-arm-row", "Single-Arm Row", "12 reps"),
        carry("offset-carry", "Offset Carry", "50m"),
      ],
    },
    conditioningBlock: {
      duration: "24 min",
      exercises: [
        dur("running-intervals", "Running Intervals", "10 rounds · 90 sec hard / 45 sec easy"),
      ],
    },
    cooldown: {
      duration: "8 min",
      exercises: [hold("Mobility + Breathing", "8 min")],
    },
  },
  {
    week: 9, dayOfWeek: 2, phase: 3,
    title: "Threshold Session",
    focus: "Threshold Conditioning",
    intensity: "90–95%",
    totalMinutes: 60,
    isAnchor: true,
    warmup: {
      duration: "10 min",
      exercises: [
        wu("Rower Easy", "4 min"),
        wu("Mobility + Activation", "6 min"),
      ],
    },
    mainBlock: {
      duration: "10 min",
      exercises: [wu("Movement Prep + Light Primer Set", "10 min")],
    },
    conditioningBlock: {
      duration: "30 min",
      rounds: 6,
      note: "High-output threshold resilience.",
      exercises: [
        dist("rower", "Row", "400m"),
        dist("sled-push", "Sled Push", "30m"),
        dur("battle-ropes", "Battle Ropes", "30 sec"),
        dur("recovery-walk", "Recovery Walk", "60 sec"),
      ],
    },
    cooldown: {
      duration: "8 min",
      exercises: [hold("Walking + Couch Stretch + Breathing", "8 min")],
    },
  },
  {
    week: 9, dayOfWeek: 3, phase: 3,
    title: "Restoration Day",
    focus: "Recovery Restoration",
    intensity: "60–70%",
    totalMinutes: 60,
    isAnchor: true,
    warmup: {
      duration: "25 min",
      exercises: [wu("Zone 2 Incline Walk", "25 min")],
    },
    mainBlock: {
      duration: "25 min",
      exercises: [
        wu("Loaded Mobility", "10 min"),
        wu("Crawling Progression", "8 min"),
        wu("Integrated Movement Sequencing", "7 min"),
      ],
    },
    conditioningBlock: {
      duration: "5 min",
      exercises: [hold("Breathing Reset", "5 min")],
    },
    cooldown: {
      duration: "5 min",
      exercises: [hold("Downregulation", "5 min")],
    },
  },
  {
    week: 9, dayOfWeek: 4, phase: 3,
    title: "Athletic Hybrid Session",
    focus: "Hybrid Athletic Conditioning",
    intensity: "80–90%",
    totalMinutes: 60,
    isAnchor: true,
    warmup: {
      duration: "10 min",
      exercises: [
        wu("Bike Easy", "4 min"),
        wu("Dynamic Flow + Activation", "6 min"),
      ],
    },
    mainBlock: {
      duration: "25 min",
      rounds: 5,
      note: "Rotational sequencing. Dynamic carries.",
      exercises: [
        ms("rotational-landmine-clean", "Rotational Landmine Clean", "6/side"),
        ms("split-squat", "Split Squat", "10 reps"),
        carry("farmer-carry", "Farmer Carry", "60m"),
        dist("run", "Run", "300m"),
      ],
    },
    conditioningBlock: {
      duration: "15 min",
      exercises: [
        dur("integrated-flow", "Integrated Flow", "Sustainable pacing shifts · 15 min"),
      ],
    },
    cooldown: {
      duration: "8 min",
      exercises: [hold("Mobility + Breathing", "8 min")],
    },
  },
  {
    week: 9, dayOfWeek: 5, phase: 3,
    title: "Peak Output Hybrid",
    focus: "Peak Output Hybrid Session",
    intensity: "95–100%",
    totalMinutes: 60,
    isAnchor: true,
    warmup: {
      duration: "10 min",
      exercises: [
        wu("Rower Easy", "4 min"),
        wu("Movement Prep", "6 min"),
      ],
    },
    mainBlock: {
      duration: "12 min",
      exercises: [wu("Movement Primer + Activation", "12 min")],
    },
    conditioningBlock: {
      duration: "25 min",
      note: "Sustained high-output conditioning. NOT self-destruction.",
      exercises: [
        cal("assault-bike", "Assault Bike", "rotating"),
        dist("run", "Run", "rotating"),
        dist("rower", "Row", "rotating"),
        carry("walking-carry", "Walking Carry", "rotating"),
        dist("sled-push", "Sled Push", "rotating"),
        dur("recovery-pacing", "Recovery Pacing", "built-in"),
      ],
    },
    cooldown: {
      duration: "8 min",
      exercises: [hold("Full Recovery Flow", "8 min")],
    },
  },
];

// ────────────────────────────────────────────────────────────────
// PROGRESSION OVERLAYS — non-anchor weeks
// ────────────────────────────────────────────────────────────────

/**
 * Per-week conditioning overrides for non-anchor weeks. Distributes
 * cardio across the 12-week program: 50% running, 25% biking, 25% rowing.
 * When a week+day has an entry here, it replaces the anchor's
 * conditioningBlock for that day. Days without entries inherit the anchor.
 */
const CARDIO_BY_WEEK: Record<number, Record<number, Section>> = {
  2: {
    1: {
      duration: "20 min",
      note: "Tempo running — sustained moderate effort.",
      exercises: [
        dur("running-tempo", "Running Tempo", "4 rounds · 4 min moderate / 1 min easy"),
      ],
    },
    2: {
      duration: "24 min",
      note: "Bike threshold — sustainable discomfort, NOT sprinting.",
      exercises: [
        dur("bike-threshold", "Assault Bike Threshold", "6 rounds · 90 sec hard / 60 sec easy"),
      ],
    },
  },
  3: {
    1: {
      duration: "20 min",
      note: "Hill repeats — power and lactate tolerance.",
      exercises: [
        dur("running-hill-repeats", "Hill Repeats", "10 rounds · 45 sec hard uphill / walk back recovery"),
      ],
    },
  },
  4: {
    1: {
      duration: "25 min",
      note: "Zone 2 aerobic — conversational pace. HR 130–145.",
      exercises: [
        dur("running-zone-2", "Zone 2 Run", "25 min steady · conversational"),
      ],
    },
    2: {
      duration: "20 min",
      note: "Bike intervals — short bursts.",
      exercises: [
        dur("bike-intervals", "Assault Bike Intervals", "8 rounds · 60 sec hard / 30 sec easy"),
      ],
    },
  },
  6: {
    1: {
      duration: "20 min",
      note: "Short interval pacing — repeatable output.",
      exercises: [
        dur("running-intervals", "Running Intervals", "12 rounds · 75 sec moderate / 30 sec easy"),
      ],
    },
    2: {
      duration: "20 min",
      note: "Bike tempo — sustained moderate effort.",
      exercises: [
        dur("bike-tempo", "Assault Bike Tempo", "4 rounds · 4 min moderate / 1 min easy"),
      ],
    },
  },
  7: {
    1: {
      duration: "20 min",
      note: "Fartlek — varied pacing surges.",
      exercises: [
        dur("running-fartlek", "Running Fartlek", "20 min · alternate 1 min surge / 2 min easy"),
      ],
    },
  },
  8: {
    1: {
      duration: "30 min",
      note: "Zone 2 aerobic — long steady run. HR 130–145.",
      exercises: [
        dur("running-zone-2", "Zone 2 Run", "30 min steady · conversational"),
      ],
    },
    2: {
      duration: "22 min",
      note: "Bike threshold — sustained hard effort.",
      exercises: [
        dur("bike-threshold", "Assault Bike Threshold", "5 rounds · 3 min hard / 1 min easy"),
      ],
    },
  },
  10: {
    1: {
      duration: "22 min",
      note: "Pyramid intervals — build then descend.",
      exercises: [
        dur("running-pyramid", "Running Pyramid Intervals", "1 / 2 / 3 / 2 / 1 min hard · 1 min easy between"),
      ],
    },
    2: {
      duration: "22 min",
      note: "Bike intervals — repeat-effort capacity under fatigue.",
      exercises: [
        dur("bike-intervals", "Assault Bike Intervals", "10 rounds · 60 sec hard / 30 sec easy"),
      ],
    },
  },
  11: {
    1: {
      duration: "22 min",
      note: "Hill repeats — late-cycle power.",
      exercises: [
        dur("running-hill-repeats", "Hill Repeats", "12 rounds · 60 sec hard uphill / walk back recovery"),
      ],
    },
  },
  12: {
    1: {
      duration: "22 min",
      note: "Tempo running — race-pace consolidation.",
      exercises: [
        dur("running-tempo", "Running Tempo", "4 rounds · 5 min moderate / 1 min easy"),
      ],
    },
    2: {
      duration: "22 min",
      note: "Bike threshold — final phase capacity.",
      exercises: [
        dur("bike-threshold", "Assault Bike Threshold", "6 rounds · 90 sec hard / 30 sec easy"),
      ],
    },
  },
};

const ADJUSTMENTS: Record<number, string[]> = {
  2: [
    "Add 1 set to all carries",
    "Slightly longer sled pushes",
  ],
  3: [
    "Add landmine rotations to main block",
    "Add offset carries (contralateral loading)",
  ],
  4: [
    "Phase bridge week — prep for Phase 2 density",
    "Add crawling intervals",
    "Dynamic carries",
    "Friday: 20-min mixed modal — Run 400m · Carry 50m · Bike 15 cal · Sled 25m · 60 sec walk",
  ],
  6: [
    "Increased interval density",
    "Longer carries",
    "More threshold exposure",
  ],
  7: [
    "Contralateral loading throughout",
    "Crawling transitions between rounds",
    "Dynamic movement sequencing",
    "Optional mini-deload: reduce conditioning volume 20%, hold movement quality",
  ],
  8: [
    "Phase bridge week — prep for Phase 3",
    "Friday challenge: 5 rounds — Run 500m · Carry 60m · Bike 20 cal · Sled 30m · 45 sec walk",
    "High sustainable output, not all-out",
  ],
  10: [
    "Faster transitions between modalities",
    "Longer intervals",
    "More athletic sequencing",
  ],
  11: [
    "Advanced hybrid development",
    "Focus: repeat-effort tolerance + threshold resilience + pacing under fatigue",
    "Friday: 30-min hybrid rotation — Row · Run · Bike · Carry · Sled · Crawling transitions",
  ],
  12: [
    "Performance consolidation week",
    "Final Friday — HYBRID PERFORMANCE TEST: 5 rounds — Run 600m · Carry 80m · Bike 20 cal · Sled 40m · Row 300m · 60 sec walk",
    "Demonstrate: conditioning · movement quality · pacing · work capacity · resilience",
    "Goal: sustainable performance, NOT self-destruction",
  ],
};

function anchorFor(week: number): number {
  if (week <= 4) return 1;
  if (week <= 8) return 5;
  return 9;
}

function phaseFor(week: number): number {
  if (week <= 4) return 1;
  if (week <= 8) return 2;
  return 3;
}

function progressionDays(week: number): ProgramDay[] {
  const anchorWeek = anchorFor(week);
  const anchor =
    anchorWeek === 1 ? WEEK_1 : anchorWeek === 5 ? WEEK_5 : WEEK_9;
  return anchor.map((day) => {
    const cardio = CARDIO_BY_WEEK[week]?.[day.dayOfWeek];
    return {
      ...day,
      week,
      phase: phaseFor(week),
      isAnchor: false,
      anchorWeek,
      adjustments: ADJUSTMENTS[week],
      conditioningBlock: cardio ?? day.conditioningBlock,
    };
  });
}

export const FULL_PROGRAM: ProgramDay[] = [
  ...WEEK_1,
  ...progressionDays(2),
  ...progressionDays(3),
  ...progressionDays(4),
  ...WEEK_5,
  ...progressionDays(6),
  ...progressionDays(7),
  ...progressionDays(8),
  ...WEEK_9,
  ...progressionDays(10),
  ...progressionDays(11),
  ...progressionDays(12),
];

/**
 * The canonical list of strength lifts that get e1RM tracking on
 * the /lifts page. Derived from any exercise in the program with
 * trackingType === "weight_reps_rpe".
 */
export function trackedLifts(): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const day of FULL_PROGRAM) {
    for (const section of [day.warmup, day.mainBlock, day.conditioningBlock, day.cooldown]) {
      for (const ex of section.exercises) {
        if (ex.trackingType === "weight_reps_rpe" && !seen.has(ex.id)) {
          seen.set(ex.id, ex.name);
        }
      }
    }
  }
  return [...seen.entries()].map(([id, name]) => ({ id, name }));
}
