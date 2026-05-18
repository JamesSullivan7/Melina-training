import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const cardio = v.optional(
  v.union(
    v.literal("Poor"),
    v.literal("Okay"),
    v.literal("Good"),
    v.literal("Great"),
  ),
);

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_date", (q) => q.eq("date", date))
      .unique();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("dailyLogs").collect();
    return logs.sort((a, b) => (a.date < b.date ? 1 : -1));
  },
});

/**
 * Most recent dailyLog by date (used for readiness signal).
 */
export const getMostRecent = query({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("dailyLogs").collect();
    if (logs.length === 0) return null;
    return logs.reduce((a, b) => (a.date > b.date ? a : b));
  },
});

/**
 * Mark the workout completed for a given date without clobbering
 * subjective fields the user may have already filled in.
 */
export const markCompleted = mutation({
  args: {
    date: v.string(),
    week: v.number(),
    dayOfWeek: v.number(),
  },
  handler: async (ctx, { date, week, dayOfWeek }) => {
    const existing = await ctx.db
      .query("dailyLogs")
      .withIndex("by_date", (q) => q.eq("date", date))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { completed: true });
      return existing._id;
    }
    return await ctx.db.insert("dailyLogs", {
      date,
      week,
      dayOfWeek,
      completed: true,
    });
  },
});

export const upsert = mutation({
  args: {
    date: v.string(),
    week: v.number(),
    dayOfWeek: v.number(),
    completed: v.boolean(),
    rpe: v.optional(v.number()),
    energyBefore: v.optional(v.number()),
    energyAfter: v.optional(v.number()),
    sleepQuality: v.optional(v.number()),
    soreness: v.optional(v.number()),
    cardioPerformance: cardio,
    warmupCompleted: v.optional(v.boolean()),
    cooldownCompleted: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    waist: v.optional(v.number()),
    restingHR: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dailyLogs")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("dailyLogs", args);
  },
});
