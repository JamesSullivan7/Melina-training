import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const trackingType = v.union(
  v.literal("check"),
  v.literal("weight_reps_rpe"),
  v.literal("bodyweight_reps"),
  v.literal("distance_meters"),
  v.literal("carry_distance"),
  v.literal("calories"),
  v.literal("timed_hold"),
  v.literal("duration"),
  v.literal("reps_rpe"),
);

const exercise = v.object({
  id: v.string(),
  name: v.string(),
  prescription: v.string(),
  trackingType,
  rpeTarget: v.optional(
    v.union(v.number(), v.array(v.number())),
  ),
  pairGroup: v.optional(v.string()),
  note: v.optional(v.string()),
});

const section = v.object({
  duration: v.optional(v.string()),
  rounds: v.optional(v.number()),
  restSeconds: v.optional(v.number()),
  note: v.optional(v.string()),
  exercises: v.array(exercise),
});

// TEMP: schemaValidation disabled so the new schema can deploy past
// stale rows from the previous (items-based) shape. Will be flipped
// back to true once we confirm the seed wiped everything cleanly.
export default defineSchema({
  /**
   * 12 weeks × 5 days = 60 rows. Anchor weeks (1, 5, 9) carry the
   * full structured workout. Other weeks reference an anchor and
   * apply an `adjustments` overlay.
   */
  programDays: defineTable({
    week: v.number(),
    dayOfWeek: v.number(),
    phase: v.number(),
    title: v.string(),
    focus: v.string(),
    intensity: v.string(),
    totalMinutes: v.optional(v.number()),

    isAnchor: v.boolean(),
    anchorWeek: v.optional(v.number()),
    adjustments: v.optional(v.array(v.string())),

    warmup: section,
    mainBlock: section,
    conditioningBlock: section,
    cooldown: section,

    coachingNotes: v.optional(v.array(v.string())),
  }).index("by_week_day", ["week", "dayOfWeek"]),

  /**
   * Per-exercise, per-session log with a per-set sets[] array.
   * One row per (date, exerciseId). Each set is independent —
   * the user adds, edits, completes, and removes sets.
   */
  exerciseLogs: defineTable({
    date: v.string(),
    exerciseId: v.string(),
    exerciseName: v.string(),
    week: v.number(),
    dayOfWeek: v.number(),
    sets: v.array(
      v.object({
        setNumber: v.number(),
        weight: v.optional(v.number()),
        reps: v.optional(v.number()),
        rpe: v.optional(v.number()),
        meters: v.optional(v.number()),
        calories: v.optional(v.number()),
        timeSeconds: v.optional(v.number()),
        completed: v.boolean(),
      }),
    ),
    notes: v.optional(v.string()),
  })
    .index("by_date_exercise", ["date", "exerciseId"])
    .index("by_exercise_date", ["exerciseId", "date"]),

  /**
   * Single-row settings. `programStartDate` should be a Monday.
   */
  settings: defineTable({
    programStartDate: v.optional(v.string()),
  }),

  /**
   * Day-level log: how the session felt. Independent from per-exercise data.
   */
  dailyLogs: defineTable({
    date: v.string(),
    week: v.number(),
    dayOfWeek: v.number(),

    completed: v.boolean(),
    rpe: v.optional(v.number()),
    energyBefore: v.optional(v.number()),
    energyAfter: v.optional(v.number()),
    sleepQuality: v.optional(v.number()),
    soreness: v.optional(v.number()),
    cardioPerformance: v.optional(
      v.union(
        v.literal("Poor"),
        v.literal("Okay"),
        v.literal("Good"),
        v.literal("Great"),
      ),
    ),
    warmupCompleted: v.optional(v.boolean()),
    cooldownCompleted: v.optional(v.boolean()),
    notes: v.optional(v.string()),

    waist: v.optional(v.number()),
    restingHR: v.optional(v.number()),
  })
    .index("by_date", ["date"])
    .index("by_week_day", ["week", "dayOfWeek"]),
}, {
  schemaValidation: false,
});
