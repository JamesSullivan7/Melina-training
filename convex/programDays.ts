import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { FULL_PROGRAM } from "./programData";

export const getDay = query({
  args: { week: v.number(), dayOfWeek: v.number() },
  handler: async (ctx, { week, dayOfWeek }) => {
    return await ctx.db
      .query("programDays")
      .withIndex("by_week_day", (q) =>
        q.eq("week", week).eq("dayOfWeek", dayOfWeek),
      )
      .unique();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("programDays").collect();
  },
});

export const listWeek = query({
  args: { week: v.number() },
  handler: async (ctx, { week }) => {
    const all = await ctx.db.query("programDays").collect();
    return all
      .filter((d) => d.week === week)
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  },
});

/**
 * Idempotent seed — wipes programDays and reseeds from programData.ts.
 * Call with: npx convex run programDays:seed
 */
/**
 * Rename a workout. The new title is persisted on the programDays row
 * itself so it survives reloads, but is overwritten on next seed —
 * which is the right behavior, since the seed represents the source
 * program and renames are user customizations.
 */
export const updateTitle = mutation({
  args: {
    week: v.number(),
    dayOfWeek: v.number(),
    title: v.string(),
  },
  handler: async (ctx, { week, dayOfWeek, title }) => {
    const day = await ctx.db
      .query("programDays")
      .withIndex("by_week_day", (q) =>
        q.eq("week", week).eq("dayOfWeek", dayOfWeek),
      )
      .unique();
    if (!day) return;
    await ctx.db.patch(day._id, { title: title.trim() || day.title });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("programDays").collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }
    for (const day of FULL_PROGRAM) {
      await ctx.db.insert("programDays", day);
    }
    return { seeded: FULL_PROGRAM.length };
  },
});

/**
 * Internal version used during deploy if you want to wire it to a cron
 * or one-shot init. Same body, but not exposed to the client.
 */
export const seedInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("programDays").collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }
    for (const day of FULL_PROGRAM) {
      await ctx.db.insert("programDays", day);
    }
    return { seeded: FULL_PROGRAM.length };
  },
});
