import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("settings").first();
  },
});

export const setStartDate = mutation({
  args: { programStartDate: v.string() },
  handler: async (ctx, { programStartDate }) => {
    const existing = await ctx.db.query("settings").first();
    if (existing) {
      await ctx.db.patch(existing._id, { programStartDate });
      return existing._id;
    }
    return await ctx.db.insert("settings", { programStartDate });
  },
});
