"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { WorkoutView } from "@/components/WorkoutView";
import { TTMark } from "@/components/Logo";
import { todayISO } from "@/lib/programDate";

type Day = Doc<"programDays">;

export default function WorkoutPage({
  params,
}: {
  params: Promise<{ week: string; day: string }>;
}) {
  const { week: weekStr, day: dayStr } = use(params);
  const week = parseInt(weekStr, 10);
  const dayOfWeek = parseInt(dayStr, 10);

  const day = useQuery(api.programDays.getDay, { week, dayOfWeek }) as
    | Day
    | null
    | undefined;

  if (day === undefined) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <TTMark size={32} className="opacity-50" />
      </div>
    );
  }

  if (day === null) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2">
          Not found
        </div>
        <div className="display text-3xl font-bold mb-2">
          Week {week} · Day {dayOfWeek}
        </div>
        <p className="text-sm text-ink-muted max-w-xs">
          Run{" "}
          <code className="text-ink">npx convex run programDays:seed</code>{" "}
          to load the program.
        </p>
      </div>
    );
  }

  return <WorkoutView day={day} dateISO={todayISO()} showBack />;
}
