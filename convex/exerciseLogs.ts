import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const setValidator = v.object({
  setNumber: v.number(),
  weight: v.optional(v.number()),
  reps: v.optional(v.number()),
  rpe: v.optional(v.number()),
  meters: v.optional(v.number()),
  calories: v.optional(v.number()),
  timeSeconds: v.optional(v.number()),
  completed: v.boolean(),
});

export const getForDate = query({
  args: { date: v.string(), exerciseId: v.string() },
  handler: async (ctx, { date, exerciseId }) => {
    return await ctx.db
      .query("exerciseLogs")
      .withIndex("by_date_exercise", (q) =>
        q.eq("date", date).eq("exerciseId", exerciseId),
      )
      .unique();
  },
});

export const listForDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const all = await ctx.db.query("exerciseLogs").collect();
    return all.filter((l) => l.date === date);
  },
});

export const historyForExercise = query({
  args: { exerciseId: v.string() },
  handler: async (ctx, { exerciseId }) => {
    const logs = await ctx.db
      .query("exerciseLogs")
      .withIndex("by_exercise_date", (q) => q.eq("exerciseId", exerciseId))
      .collect();
    return logs.sort((a, b) => (a.date < b.date ? 1 : -1));
  },
});

/**
 * Latest log for each exercise. Used by Progress / dashboard.
 */
export const lastByExercise = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("exerciseLogs").collect();
    const byEx = new Map<string, (typeof all)[number]>();
    for (const log of all) {
      const cur = byEx.get(log.exerciseId);
      if (!cur || log.date > cur.date) byEx.set(log.exerciseId, log);
    }
    return [...byEx.values()];
  },
});

/**
 * Upsert the whole sets array at once. Client-side merges set
 * edits into the array and posts it.
 */
export const upsert = mutation({
  args: {
    date: v.string(),
    exerciseId: v.string(),
    exerciseName: v.string(),
    week: v.number(),
    dayOfWeek: v.number(),
    sets: v.array(setValidator),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("exerciseLogs")
      .withIndex("by_date_exercise", (q) =>
        q.eq("date", args.date).eq("exerciseId", args.exerciseId),
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("exerciseLogs", args);
  },
});

export const remove = mutation({
  args: { date: v.string(), exerciseId: v.string() },
  handler: async (ctx, { date, exerciseId }) => {
    const existing = await ctx.db
      .query("exerciseLogs")
      .withIndex("by_date_exercise", (q) =>
        q.eq("date", date).eq("exerciseId", exerciseId),
      )
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});
